# hand-pose-octo-invention
An experimental approach to drive me, myself and the teachable machine completely crazy 

## ollama_poetry

### Pre-condition
llama installed on local machine
npm install node-fetch

Workflow
### 1. Terminalfenster A – Modell starten
ollama run mistral

### 2. Terminalfenster B – Antwort holen
cd path/to/ollama_poetry
node index.js (If neded pull model before with ollama pull llama3)

### 3. Terminalfenster C – Webserver starten
cd path/to/ollama_poetry
http-server

### 4. Browser → http://localhost:8080 öffnen
opene localhost in browser and the magic should beginn