// index.js
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const fs = require('fs');


async function getWordsFromOllama(prompt = "Why AI?") {
  const res = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama3', // oder 'mistral'
      prompt,
      stream: false
    })
  });

  const json = await res.json();
  if (json.response) {
    const words = json.response.split(/\s+/); // teilt in Wörter auf
    fs.writeFileSync('words.json', JSON.stringify(words, null, 2));
    console.log("Wörter gespeichert:", words);
  } else {
    console.error("❌ Fehler:", json.error || json);
  }
}

getWordsFromOllama();
