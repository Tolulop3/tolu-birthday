import { list, put, del } from "@vercel/blob";
import { createHash } from "node:crypto";

const GIFTS = new Set(["bracelet", "tropiques", "trio", "ninja", "plaud", "suvie"]);
const PREFIX = "claims/";
const hash = (t) => createHash("sha256").update(t).digest("hex");

async function current() {
  const { blobs } = await list({ prefix: PREFIX, limit: 100 });
  const claims = {};
  for (const b of blobs) {
    const name = b.pathname.slice(PREFIX.length).replace(/\.json$/, "");
    const [gift, owner] = name.split(".");
    if (GIFTS.has(gift) && owner) claims[gift] = { owner, url: b.url };
  }
  return claims;
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  try {
    if (req.method === "GET") {
      const c = await current();
      const out = {};
      for (const [g, v] of Object.entries(c)) out[g] = v.owner;
      return res.status(200).json({ claims: out });
    }
    if (req.method === "POST") {
      const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
      const { gift, token, action } = body;
      if (!GIFTS.has(gift) || typeof token !== "string" || token.length < 20 || token.length > 200)
        return res.status(400).json({ error: "bad_request" });
      const owner = hash(token);
      const c = await current();
      if (action === "claim") {
        if (c[gift]) return res.status(c[gift].owner === owner ? 200 : 409).json({ ok: c[gift].owner === owner });
        await put(`${PREFIX}${gift}.${owner}.json`, JSON.stringify({ at: new Date().toISOString() }), {
          access: "public", addRandomSuffix: false, allowOverwrite: true, contentType: "application/json",
        });
        return res.status(200).json({ ok: true });
      }
      if (action === "unclaim") {
        if (!c[gift]) return res.status(200).json({ ok: true });
        if (c[gift].owner !== owner) return res.status(403).json({ error: "not_yours" });
        await del(c[gift].url);
        return res.status(200).json({ ok: true });
      }
      return res.status(400).json({ error: "bad_action" });
    }
    res.setHeader("Allow", "GET, POST");
    return res.status(405).end();
  } catch (e) {
    return res.status(500).json({ error: "server_error" });
  }
}
