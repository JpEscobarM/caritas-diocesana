import { createReadStream } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, "dist");
const apiPrefix = "/api";
const port = Number(process.env.PORT ?? 4173);

const hopByHopHeaders = new Set([
  "connection",
  "content-length",
  "host",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

const responseHeadersToSkip = new Set([
  "connection",
  "content-encoding",
  "content-length",
  "host",
  "keep-alive",
  "server",
  "transfer-encoding",
  "via",
  "x-powered-by",
  "x-railway-edge",
  "x-railway-request-id",
  "x-request-id",
]);

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".csv": "text/csv; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

await loadLocalEnv();

const apiTarget = (process.env.API_URL ?? "")
  .trim()
  .replace(/\/+$/, "");

const server = createServer((request, response) => {
  void handleRequest(request, response);
});

server.listen(port, () => {
  console.log(`Frontend server running at http://localhost:${port}`);
});

async function handleRequest(request, response) {
  const requestUrl = new URL(request.url ?? "/", getRequestOrigin(request));

  if (
    requestUrl.pathname === apiPrefix ||
    requestUrl.pathname.startsWith(`${apiPrefix}/`)
  ) {
    await proxyApiRequest(request, response, requestUrl);
    return;
  }

  await serveStaticAsset(response, requestUrl.pathname);
}

async function proxyApiRequest(request, response, requestUrl) {
  if (!apiTarget) {
    sendJson(response, 500, {
      message: "Configure API_URL para ativar o proxy da API.",
    });
    return;
  }

  try {
    const upstreamUrl = buildUpstreamUrl(requestUrl);
    const upstreamResponse = await fetch(upstreamUrl, {
      body: await getRequestBody(request),
      headers: getProxyHeaders(request),
      method: request.method,
      redirect: "manual",
    });

    response.statusCode = upstreamResponse.status;

    upstreamResponse.headers.forEach((value, header) => {
      if (!responseHeadersToSkip.has(header.toLowerCase())) {
        response.setHeader(header, value);
      }
    });

    if (request.method === "HEAD") {
      response.end();
      return;
    }

    const body = Buffer.from(await upstreamResponse.arrayBuffer());
    response.setHeader("content-length", body.length);
    response.end(body);
  } catch (error) {
    console.error("Erro ao encaminhar requisicao para a API:", error);
    sendJson(response, 502, {
      message: "Nao foi possivel encaminhar a requisicao para a API.",
    });
  }
}

function buildUpstreamUrl(requestUrl) {
  const upstreamUrl = new URL(apiTarget);
  const basePath = upstreamUrl.pathname.replace(/\/+$/, "");
  const apiPath = requestUrl.pathname.replace(/^\/api/, "") || "/";

  upstreamUrl.pathname = `${basePath}${apiPath}`;
  upstreamUrl.search = requestUrl.search;

  return upstreamUrl;
}

function getProxyHeaders(request) {
  const headers = new Headers();

  for (const [header, value] of Object.entries(request.headers)) {
    if (!value || hopByHopHeaders.has(header.toLowerCase())) {
      continue;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => headers.append(header, item));
    } else {
      headers.set(header, value);
    }
  }

  headers.set("x-forwarded-host", request.headers.host ?? "");
  headers.set("x-forwarded-proto", "http");

  return headers;
}

async function getRequestBody(request) {
  if (request.method === "GET" || request.method === "HEAD") {
    return undefined;
  }

  const chunks = [];

  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return Buffer.concat(chunks);
}

async function serveStaticAsset(response, pathname) {
  const requestedFile = resolveDistFile(pathname);

  if (!requestedFile) {
    sendJson(response, 403, { message: "Caminho nao permitido." });
    return;
  }

  const fileToServe = await findStaticFile(requestedFile, pathname);

  if (!fileToServe) {
    sendJson(response, 404, { message: "Arquivo nao encontrado." });
    return;
  }

  response.statusCode = 200;
  response.setHeader(
    "content-type",
    contentTypes[path.extname(fileToServe)] ?? "application/octet-stream",
  );

  createReadStream(fileToServe).pipe(response);
}

async function findStaticFile(requestedFile, pathname) {
  try {
    const fileStat = await stat(requestedFile);

    if (fileStat.isFile()) {
      return requestedFile;
    }
  } catch {
    if (path.extname(pathname)) {
      return null;
    }
  }

  const indexFile = path.join(distDir, "index.html");

  try {
    await stat(indexFile);
    return indexFile;
  } catch {
    return null;
  }
}

function resolveDistFile(pathname) {
  let decodedPathname;

  try {
    decodedPathname = decodeURIComponent(pathname);
  } catch {
    return null;
  }

  const resolvedPath = path.resolve(
    distDir,
    `.${decodedPathname === "/" ? "/index.html" : decodedPathname}`,
  );

  if (resolvedPath === distDir || resolvedPath.startsWith(`${distDir}${path.sep}`)) {
    return resolvedPath;
  }

  return null;
}

function sendJson(response, statusCode, payload) {
  const body = JSON.stringify(payload);

  response.writeHead(statusCode, {
    "content-length": Buffer.byteLength(body),
    "content-type": "application/json; charset=utf-8",
  });
  response.end(body);
}

function getRequestOrigin(request) {
  return `http://${request.headers.host ?? `localhost:${port}`}`;
}

async function loadLocalEnv() {
  try {
    const envFile = await readFile(path.join(__dirname, ".env"), "utf8");

    for (const line of envFile.split(/\r?\n/)) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);

      if (!match) {
        continue;
      }

      const [, key, rawValue = ""] = match;

      if (process.env[key] !== undefined) {
        continue;
      }

      process.env[key] = rawValue.trim().replace(/^(['"])(.*)\1$/, "$2");
    }
  } catch {
    // Ambientes de producao geralmente fornecem variaveis sem arquivo .env.
  }
}
