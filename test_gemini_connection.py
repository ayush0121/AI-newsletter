import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path="backend/.env")
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("❌ Critical: GEMINI_API_KEY is broken/missing.")
    exit(1)

genai.configure(api_key=api_key)

print("Testing 'gemini-pro'...")
try:
    model = genai.GenerativeModel('gemini-pro')
    response = model.generate_content("Hello")
    if response and response.text:
        print(f"✅ SUCCESS: 'gemini-pro' is working!")
    else:
        print("❌ 'gemini-pro' returned empty response.")
except Exception as e:
    print(f"❌ 'gemini-pro' Failed: {e}")
    print("\nAttempting to list available models:")
    try:
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(f"- {m.name}")
    except:
        pass
