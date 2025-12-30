import google.generativeai as genai
import os
import sys

# Add backend to path to get config
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.core.config import settings

def list_models():
    print(f"Using API Key: {settings.GEMINI_API_KEY[:5]}...{settings.GEMINI_API_KEY[-5:]}")
    genai.configure(api_key=settings.GEMINI_API_KEY)
    
    print("\n--- Listing Available Models ---")
    try:
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(m.name)
    except Exception as e:
        print(f"Error listing models: {e}")

if __name__ == "__main__":
    list_models()
