const fs = require('fs');
let code = fs.readFileSync('src/lib/export.ts', 'utf-8');
code = code.replace(
  "alert(`Export failed: ${error instanceof Error ? error.message : String(error)}`);",
  `
    let msg = String(error);
    if (error && typeof error === 'object' && error.target) {
      if (error.target.tagName) {
        msg = "Element failed to load: " + error.target.tagName;
        if (error.target.src) msg += " src=" + error.target.src;
        if (error.target.href) msg += " href=" + error.target.href;
      }
    }
    alert(\`Export failed: \${error instanceof Error ? error.message : msg}\`);
  `
);
fs.writeFileSync('src/lib/export.ts', code);
