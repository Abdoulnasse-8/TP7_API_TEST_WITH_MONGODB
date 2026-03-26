const fs = require("fs");
const path = require("path");

function getBooksJsonPath() {
  return path.join(__dirname, "..", "..", "books.json");
}

function parseBooksPayload(raw) {
  const trimmed = raw.trim();
  if (!trimmed) return [];

  // Deux formats possibles :
  // 1) NDJSON (un objet JSON par ligne) : { ... }\n{ ... }
  // 2) JSON array : [ { ... }, { ... } ]
  if (trimmed.startsWith("[")) {
    const parsed = JSON.parse(trimmed);
    return Array.isArray(parsed) ? parsed : [];
  }

  // NDJSON
  return trimmed
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function loadBooksFromFile() {
  const filePath = getBooksJsonPath();
  const raw = fs.readFileSync(filePath, "utf8");
  return parseBooksPayload(raw);
}

module.exports = { loadBooksFromFile };

