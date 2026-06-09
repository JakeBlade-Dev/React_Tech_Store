const fs = require('fs');

const path = "C:\\Users\\Jona\\.gemini\\antigravity-ide\\brain\\e3102744-e33c-4c5e-a392-0dbcdd59641a\\.system_generated\\logs\\transcript.jsonl";
const data = fs.readFileSync(path, 'utf8');

const lines = data.split('\n');
for (const line of lines) {
  if (!line.trim()) continue;
  const obj = JSON.parse(line);
  if (obj.type === 'USER_INPUT') {
    fs.writeFileSync('full_message.txt', obj.content);
    console.log('Saved to full_message.txt');
    break;
  }
}
