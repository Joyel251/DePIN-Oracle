# Code Index

This repository includes a generated code index at `code_index.json` that maps key source files to their top-level exports, types, short descriptions and a small snippet. The index is intended to help search, quick navigation and building simple tooling.

How to use

- Open `code_index.json` to inspect the mapping.
- Programmatic example (Node.js):

```js
const index = require('./code_index.json');
console.log(Object.keys(index));
// Find files exporting `analyzeHeliumHotspot`
for (const [path, meta] of Object.entries(index)) {
  if (meta.exports && meta.exports.includes('analyzeHeliumHotspot')) {
    console.log('Found in', path);
  }
}
```

Notes

- The index contains a best-effort extraction of top-level exports and types plus a tiny snippet for context. It does not replace full code parsing or language-server features.
- If you add/remove files, regenerate this index by running the same process or ask me to re-run it.

If you'd like, I can:

- Expand the index to include function signatures, JSDoc comments, or import graphs.
- Generate an interactive search page inside the app.
