# How to Setup Ollama Locally for TechPulse

## 1. Install Ollama
Download and install Ollama from the official website:
- **Windows**: [Download Ollama for Windows](https://ollama.com/download/windows)
- **Mac/Linux**: [Download from ollama.com](https://ollama.com/download)

## 2. Pull the Model
Open your terminal (Command Prompt or PowerShell) and run:
for Llama 3 (Better logic, heavier):
```powershell
ollama pull llama3
```
OR for Mistral (Faster, lighter):
```powershell
ollama pull mistral
```

## 3. Run the Model Server
Ollama automatically starts a server on `http://localhost:11434`.
To ensure it's running, you can typoe:
```powershell
ollama serve
```
(If it says "address already in use", that's good! It means it's already running in the background).

## 4. Verify Backend Config
Ensure your `backend/app/services/ai.py` uses the model you pulled.
If you pulled `llama3`, the code is already set to use `"model": "llama3"`.
If you pulled `mistral`, you might need to edit `ai.py` to change `"llama3"` to `"mistral"`.

## 5. Run Ingestion
Once Ollama is running, just execute the normal ingestion command:
```powershell
python backend/run_ingestion.py
```
