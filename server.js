// UIID Passkey-as-a-Service demo server (no external dependencies, Node 20+)
const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// ---- Hardcoded test credentials (regenerate after testing!) ----
const CLIENT_ID = "";
const CLIENT_SECRET = "";
// Base URL of the UIID API (override with env var UIID_BASE_URL)
const UIID_BASE_URL = (process.env.UIID_BASE_URL || "https://uiid.linkspreed.com").replace(/\/$/, "");
const PORT = process.env.PORT || 3000;

const PROVIDER = `${UIID_BASE_URL}/api/v1/passkey-provider`;

// Stable external user id derived from the username
function externalUserId(username) {
  return "usr_" + crypto.createHash("sha256").update(username).digest("hex").slice(0, 16);
}

async function callUiid(endpoint, payload) {
  const url = `${PROVIDER}${endpoint}`;
  console.log(`-> POST ${url}`);
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }
  console.log(`<- ${res.status}`, JSON.stringify(data).slice(0, 500));
  return { status: res.status, data };
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => { try { resolve(body ? JSON.parse(body) : {}); } catch (e) { reject(e); } });
    req.on("error", reject);
  });
}

function sendJson(res, status, obj) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(obj));
}

const routes = {
  "/api/register/begin": (b) => callUiid("/register/begin", {
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    external_user_id: externalUserId(b.username),
    external_user_name: b.username,
  }),
  "/api/register/finish": (b) => callUiid("/register/finish", {
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    session_id: b.session_id,
    external_user_id: externalUserId(b.username),
    external_user_name: b.username,
    credential: b.credential,
  }),
  "/api/login/begin": (b) => callUiid("/authenticate/begin", {
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    external_user_id: externalUserId(b.username),
  }),
  "/api/login/finish": (b) => callUiid("/authenticate/finish", {
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    session_id: b.session_id,
    external_user_id: externalUserId(b.username),
    credential: b.credential,
  }),
};

http.createServer(async (req, res) => {
  try {
    if (req.method === "POST" && routes[req.url]) {
      const body = await readBody(req);
      if (!body.username) return sendJson(res, 400, { error: "username missing" });
      const { status, data } = await routes[req.url](body);
      return sendJson(res, status, data);
    }
    if (req.method === "GET" && (req.url === "/" || req.url === "/index.html")) {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      return res.end(fs.readFileSync(path.join(__dirname, "public", "index.html")));
    }
    sendJson(res, 404, { error: "not found" });
  } catch (err) {
    console.error(err);
    sendJson(res, 500, { error: String(err.message || err), cause: String(err.cause || "") });
  }
}).listen(PORT, () => {
  console.log(`Demo running on http://localhost:${PORT}`);
  console.log(`UIID API: ${UIID_BASE_URL}`);
});
