```js
export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const baseUrl = "https://generativelanguage.googleapis.com";

    // Убираем /api/proxy из URL
    let cleanPath = req.url.replace(/^\/api\/proxy/, "");

    if (!cleanPath.startsWith("/")) {
      cleanPath = "/" + cleanPath;
    }

    const targetUrl = `${baseUrl}${cleanPath}`;

    // Копируем headers
    const headers = {};

    for (const [key, value] of Object.entries(req.headers)) {
      if (key.toLowerCase() !== "host") {
        headers[key] = value;
      }
    }

    // Читаем body
    let body = null;

    if (req.method !== "GET" && req.method !== "HEAD") {
      const chunks = [];

      for await (const chunk of req) {
        chunks.push(chunk);
      }

      body = Buffer.concat(chunks);
    }

    // Запрос к Gemini API
    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body
    });

    // Ответ клиенту
    res.status(response.status);

    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    const data = Buffer.from(await response.arrayBuffer());

    res.send(data);

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
}
```
