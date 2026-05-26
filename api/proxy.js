export default async function handler(req, res) {
try {
const targetUrl =
'https://generativelanguage.googleapis.com' +
req.url.replace('/api/proxy', '');

```
const headers = { ...req.headers };

delete headers.host;
delete headers['content-length'];

const response = await fetch(targetUrl, {
  method: req.method,
  headers,
  body:
    req.method !== 'GET' && req.method !== 'HEAD'
      ? req
      : undefined,
  duplex: 'half',
});

res.status(response.status);

response.headers.forEach((value, key) => {
  res.setHeader(key, value);
});

res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', '*');
res.setHeader('Access-Control-Allow-Headers', '*');

const buffer = Buffer.from(await response.arrayBuffer());

res.send(buffer);
```

} catch (err) {
res.status(500).json({
error: err.message,
});
}
}
