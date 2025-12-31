import json
import logging
import time
import google.generativeai as genai
from app.core.config import settings

logger = logging.getLogger(__name__)

# Configure Gemini
if settings.GEMINI_API_KEY:
    try:
        genai.configure(api_key=settings.GEMINI_API_KEY)
    except:
        pass

class AIService:
    def __init__(self):
        self.provider = settings.AI_PROVIDER.lower()
        # self.gemini_model initialized lazily/dynamically now
        
        # Initialize OpenAI if selected
        self.openai_client = None
        if self.provider == "openai" and settings.OPENAI_API_KEY:
            try:
                from openai import OpenAI
                self.openai_client = OpenAI(api_key=settings.OPENAI_API_KEY)
            except ImportError:
                logger.error("OpenAI library not installed. Run `pip install openai`.")

    def process_article(self, title: str, content: str) -> dict:
        prompt = f"""
        You are a tech news editor. Analyze the following article title and content/abstract.
        
        Title: {title}
        Content: {content[:3000]} (truncated)
        
        Task:
        1. Summarize the key points in under 100 words.
        2. Provide a "Why this matters" insight (1-2 sentences explaining the impact).
        3. Categorize strictly into ONE of: ['AI', 'Computer Science', 'Software Engineering', 'Research'].
        4. Rate 'viability_score' (0-100) based on relevance to a general software developer/researcher.
        
        Output strictly valid JSON with keys: "summary", "category", "viability_score".
        IMPORTANT: In the "summary" field, combine the summary and the "Why this matters" insight. 
        Format it as: "[Summary text...]\n\n**Why this matters:** [Insight text...]"
        Do not include markdown blocks in the outer JSON.
        """

        try:
            if self.provider == "gemini":
                return self._process_gemini(prompt)
            elif self.provider == "openai":
                return self._process_openai(prompt)
            elif self.provider == "simple":
                return self._process_simple(title, content)
            else:
                # Default to Gemini if unknown or formerly 'ollama'
                return self._process_gemini(prompt)
        except Exception as e:
            logger.error(f"AI processing failed ({self.provider}): {e}")
            return self._mock_response(f"Error ({self.provider})")
    def extract_quote(self, text: str) -> dict | None:
        """
        Extracts a key quote and speaker from text.
        Returns None if no clear quote/speaker found.
        """
        prompt = f"""
        Analyze the following text (news article or transcript) and extract a single, impactful quote from a prominent tech figure.
        
        Text:
        {text[:4000]}
        
        Task:
        1. Identify if there is a direct quote from a named person (e.g., CEO, Researcher, Industry Leader).
        2. If YES, extract the ONE most interesting/insightful sentence they said.
        3. Identify their Name and Role.
        4. If NO quote is found, or it's just general reporting, return NULL.
        
        Output valid JSON:
        {{
            "found": true,
            "text": "The quote text here...",
            "author": "Name Lastname",
            "role": "CEO, Company"
        }}
        OR
        {{ "found": false }}
        """
        
        try:
            # Reusing gemini generic processor for simplicity
            response_json = self._process_gemini_generic(prompt)
            if response_json and response_json.get("found"):
                return response_json
            return None
        except Exception:
            return None

            return self._mock_response(f"Error ({self.provider})")

    def _process_gemini_generic(self, prompt: str) -> dict:
        """Helper to call Gemini and parse JSON safely"""
        # Fallback list of models to try
        models_to_try = [
            'gemini-2.0-flash',        # Confirmed
            'gemini-flash-latest',     # Fallback
            'gemini-pro-latest',       # Fallback Pro
        ]

        last_error = None
        for model_name in models_to_try:
            try:
                model = genai.GenerativeModel(model_name)
                # Simple retry logic for 429
                for attempt in range(2):
                    try:
                        response = model.generate_content(prompt)
                        return self._parse_json(response.text)
                    except Exception as e:
                        if "429" in str(e):
                            time.sleep(2)
                            continue
                        raise e
            except Exception as e:
                last_error = e
                continue
        logger.error(f"Gemini Generic failed: {last_error}")
        return {}

    def generate_poll(self, context_text: str) -> dict:
        prompt = f"""
        Based on the following news headlines/summaries from today:
        {context_text[:2000]}
        
        Generate a single interesting, controversial, or thought-provoking "Daily Poll" question for a tech newsletter audience (Engineers, AI Researchers).
        
        Task:
        1. Create a question that sparks debate or curiosity.
        2. Provide 3-4 distinct options.
        3. Do not include mock votes, just the option text and an ID.
        
        Output valid JSON format:
        {{
            "question": "Can AI code better than humans?",
            "options": [
                {{"id": "opt1", "text": "Yes, already happening", "votes": 0}},
                {{"id": "opt2", "text": "Not yet, but soon", "votes": 0}},
                {{"id": "opt3", "text": "No, human creativity is unique", "votes": 0}}
            ]
        }}
        """
        
        try:
            if self.provider == "gemini":
                # Reuse gemini helper but parse differently as needed or just use process_gemini logic
                # For simplicity, calling _process_gemini directly since it returns parsed JSON
                # Check _process_gemini implementation, it calls _parse_json which fills defaults. 
                # We need a cleaner raw JSON parser for this specific schema.
                return self._process_gemini_generic(prompt)
            else:
                 # Fallback for simplicity
                 return self._mock_poll()
        except Exception as e:
            logger.error(f"Poll generation failed: {e}")
            return self._mock_poll()

    def _mock_poll(self):
        return {
            "question": "What is the biggest trend in tech today?",
            "options": [
                {"id": "opt1", "text": "Generative AI", "votes": 0},
                {"id": "opt2", "text": "Quantum Computing", "votes": 0},
                {"id": "opt3", "text": "Web3 & Crypto", "votes": 0}
            ]
        }
        if not settings.GEMINI_API_KEY:
            return self._mock_response("Gemini Key Missing")
        
        # Fallback list of models to try
        models_to_try = [
            'gemini-2.0-flash',        # Confirmed
            'gemini-flash-latest',     # Fallback
            'gemini-pro-latest',       # Fallback Pro
        ]

        last_error = None
        for model_name in models_to_try:
            try:
                model = genai.GenerativeModel(model_name)
                # Simple retry logic for 429 (Rate Limit)
                for attempt in range(3):
                    try:
                        response = model.generate_content(prompt)
                        return self._parse_json(response.text)
                    except Exception as e:
                        if "429" in str(e):
                            wait_time = 30 * (attempt + 1)
                            logger.warning(f"Rate limit hit for {model_name}. Waiting {wait_time}s... (Attempt {attempt+1}/3)")
                            time.sleep(wait_time) 
                            if attempt == 2: # Last attempt
                                raise e
                            continue
                        else:
                            raise e 
            except Exception as e:
                logger.warning(f"Gemini model {model_name} failed: {e}")
                last_error = e
                continue
        
        logger.error(f"All Gemini models failed. Last error: {last_error}")
        return self._mock_response(f"All Gemini Models Failed: {last_error}")

    def _process_openai(self, prompt):
        if not self.openai_client:
            return self._mock_response("OpenAI Client Not Initialized")
            
        response = self.openai_client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            response_format={"type": "json_object"}
        )
        return self._parse_json(response.choices[0].message.content)

    def _parse_json(self, text_output):
        text = text_output.strip()
        if text.startswith("```json"):
            text = text.replace("```json", "").replace("```", "")
        elif text.startswith("```"):
            text = text.replace("```", "")
            
        result = json.loads(text)
        
        # Defaults
        if "summary" not in result: result["summary"] = "No summary."
        if "category" not in result: result["category"] = "Research"
        if "viability_score" not in result: result["viability_score"] = 50
        return result

    def _mock_response(self, reason):
        return {
            "summary": f"AI Processing Skipped: {reason}",
            "category": "Research",
            "viability_score": 0
        }

    def _process_simple(self, title: str, content: str) -> dict:
        """
        Fallback "dumb" AI that uses keywords and truncation.
        Zero cost, instant speed.
        """
        text = (title + " " + content).lower()
        
        # 1. Simple Categorization
        category = "Research" # Default
        if any(w in text for w in ["ai", "llm", "gpt", "model", "transformer", "neural", "robot"]):
            category = "AI"
        elif any(w in text for w in ["software", "code", "dev", "api", "framework", "react", "python"]):
            category = "Software Engineering"
        elif any(w in text for w in ["computer", "algorithm", "system", "database", "network"]):
            category = "Computer Science"
            
        # 2. Simple Summarization (First 2 sentences or 200 chars)
        summary_text = content[:200].replace("\n", " ") + "..."
        why_matters = "Relevant for tech industry trends."
        
        return {
            "summary": f"{summary_text}\n\n**Why this matters:** {why_matters}",
            "category": category,
            "viability_score": 80 # Optimistic default
        }


ai_service = AIService()
