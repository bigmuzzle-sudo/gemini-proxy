export default async function handler(req, res) {
  // Настройка CORS-заголовков для Chatbox
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    const baseUrl = "https://googleapis.com";
    
    // Формируем чистый путь до Google API, убирая префиксы прокси, если они есть
    let cleanPath = req.url.replace(/^\/api\/proxy/, "");
    if (!cleanPath.startsWith("/")) {
      cleanPath = "/" + cleanPath;
    }

    const targetUrl = `${baseUrl}${cleanPath}`;

    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (key.toLowerCase() !== "host") {
        headers.append(key, value);
      }
    }

    const options = {
      method: req.method,
      headers: headers
    };

    if (req.method !== "GET" && req.method !== "HEAD") {
      // Передаем тело запроса (включая файлы и текст)
      const buffers = [];
      for await (const chunk of req) {
        buffers.push(chunk);
      }
    }

    const response = await fetch(targetUrl, options);
    
    res.status(response.status);
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    const responseBuffer = Buffer.from(await response.arrayBuffer());
    res.send(responseBuffer);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
