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

    def _process_gemini(self, prompt):
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
