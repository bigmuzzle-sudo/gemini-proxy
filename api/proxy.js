export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");

  // OPTIONS
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    // Gemini API
    const baseUrl = "https://generativelanguage.googleapis.com";

    // Удаляем префикс /api/proxy
    let cleanPath = req.url.replace(/^\/api\/proxy/, "");

    if (!cleanPath.startsWith("/")) {
      cleanPath = "/" + cleanPath;
    }

    // Финальный URL
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

    // Запрос к Gemini
    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body
    });

    // Статус ответа
    res.status(response.status);

    // Исключаем проблемные headers
    const excludedHeaders = [
      "content-encoding",
      "transfer-encoding",
      "content-length",
      "connection"
    ];

    response.headers.forEach((value, key) => {
      if (!excludedHeaders.includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });

    // Ответ клиенту
    const data = Buffer.from(await response.arrayBuffer());

    res.send(data);

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message
    });
  }
}
