const fs = require('fs');
let code = fs.readFileSync('src/store.ts', 'utf-8');
code = code.replace("currentView: 'storyboard'", "currentView: 'book'");
fs.writeFileSync('src/store.ts', code);
