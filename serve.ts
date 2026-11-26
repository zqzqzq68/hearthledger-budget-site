// HearthLedger local server for testing only.
// One job: serve app/ over plain HTTP so the site can be opened and
// screenshotted in a desktop browser. Not part of the entry's hand-in.

import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { join, resolve, extname } from "node:path";

const appDir = resolve(process.argv[2] || "app");
const port = Number(process.argv[3] || 8080);

const types: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

const server = createServer((req, res) => {
  const path = req.url === "/" ? "/index.html" : (req.url || "/index.html").split("?")[0];
  const file = join(appDir, path);
  if (!existsSync(file) || !file.startsWith(appDir)) {
    res.writeHead(404, { "content-type": "text/plain" });
    res.end("Not found");
    return;
  }
  res.writeHead(200, { "content-type": types[extname(file)] || "application/octet-stream" });
  res.end(readFileSync(file));
});

server.listen(port, "127.0.0.1", () => {
  console.log(`HearthLedger test server: http://127.0.0.1:${port}/`);
});
