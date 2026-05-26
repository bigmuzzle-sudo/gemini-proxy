export default async function handler(req, res) {
  try {
    const baseUrl = "https://generativelanguage.googleapis.com";

    const url = new URL(req.url, "http://localhost");
    const targetUrl = baseUrl + url.pathname.replace("/api/proxy", "") + url.search;

    const headers = new Headers(req.headers);
    headers.delete("host");

    const options = {
      method: req.method,
      headers,
    };

    if (req.method !== "GET" && req.method !== "HEAD") {
      options.body = req;
    }

    const response = await fetch(targetUrl, options);

    res.status(response.status);

    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "*");

    const buffer = Buffer.from(await response.arrayBuffer());
    res.send(buffer);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
