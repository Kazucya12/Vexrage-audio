// Proxy Vercel ke Roblox Open Cloud (hanya endpoint Assets). API key dikirim dari browser lewat header, tidak disimpan.
module.exports = async (req, res) => {
  if (req.query.ping) return res.status(204).end();
  const path = String(req.query.path || '');
  if (!/^\/assets\/v1\/(assets|operations\/[\w-]+)$/.test(path)) return res.status(400).json({ message: 'Path tidak diizinkan' });
  try {
    let body;
    if (req.method !== 'GET') {
      const chunks = [];
      for await (const c of req) chunks.push(c);
      body = Buffer.concat(chunks);
    }
    const r = await fetch('https://apis.roblox.com' + path, {
      method: req.method,
      headers: { 'x-api-key': req.headers['x-api-key'] || '', ...(req.headers['content-type'] && { 'content-type': req.headers['content-type'] }) },
      body
    });
    res.status(r.status).setHeader('content-type', 'application/json').send(await r.text());
  } catch (e) {
    res.status(502).json({ message: 'Proxy gagal menghubungi Roblox' });
  }
};
module.exports.config = { api: { bodyParser: false } };
