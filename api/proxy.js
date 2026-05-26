export default async function handler(req, res) {
  try {
    const url = new URL(req.url, "https://generativelanguage.googleapis.com");

    const target = "https://generativelanguage.googleapis.com" + url.pathname.replace("/api/proxy", "") + url.search;

    const headers = new Headers(req.headers);
    headers.delete("host");

    const options = {
      method: req.method,
      headers,
    };

    if (req.method !== "GET" && req.method !== "HEAD") {
      options.body = req;
    }

    const response = await fetch(target, options);

    res.status(response.status);

    response.headers.forEach((v, k) => {
      res.setHeader(k, v);
    });

    res.setHeader("Access-Control-Allow-Origin", "*");

    const data = Buffer.from(await response.arrayBuffer());
    res.send(data);

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
