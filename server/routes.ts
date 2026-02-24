import type { Express } from "express";
import { createServer, type Server } from "http";
import http from "http";
import { spawn, type ChildProcess } from "child_process";

let pythonProcess: ChildProcess | null = null;

function waitForHealthCheck(maxRetries = 30, intervalMs = 500): Promise<void> {
  return new Promise((resolve, reject) => {
    let attempts = 0;

    const check = () => {
      attempts++;
      const req = http.get("http://127.0.0.1:8000/api/health", (res) => {
        if (res.statusCode === 200) {
          console.log("[python] Backend is ready (health check passed)");
          resolve();
        } else if (attempts < maxRetries) {
          setTimeout(check, intervalMs);
        } else {
          reject(new Error("Python backend health check failed after max retries"));
        }
      });

      req.on("error", () => {
        if (attempts < maxRetries) {
          setTimeout(check, intervalMs);
        } else {
          reject(new Error("Python backend not reachable after max retries"));
        }
      });

      req.end();
    };

    setTimeout(check, 1000);
  });
}

function startPythonBackend(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (pythonProcess) {
      resolve();
      return;
    }

    console.log("[python] Starting FastAPI backend on port 8000...");

    pythonProcess = spawn("python", [
      "-m", "uvicorn", "server_py.main:app",
      "--host", "127.0.0.1",
      "--port", "8000",
      "--log-level", "info",
    ], {
      cwd: process.cwd(),
      stdio: ["pipe", "pipe", "pipe"],
    });

    pythonProcess.stdout?.on("data", (data: Buffer) => {
      const msg = data.toString().trim();
      if (msg) console.log(`[python] ${msg}`);
    });

    pythonProcess.stderr?.on("data", (data: Buffer) => {
      const msg = data.toString().trim();
      if (msg) console.log(`[python] ${msg}`);
    });

    pythonProcess.on("error", (err) => {
      console.error("[python] Failed to start:", err);
      pythonProcess = null;
      reject(err);
    });

    pythonProcess.on("exit", (code) => {
      console.log(`[python] Process exited with code ${code}`);
      pythonProcess = null;
    });

    waitForHealthCheck()
      .then(resolve)
      .catch(reject);
  });
}

function proxyToFastAPI(req: any, res: any) {
  const options = {
    hostname: "127.0.0.1",
    port: 8000,
    path: req.originalUrl,
    method: req.method,
    headers: {
      ...req.headers,
      host: "127.0.0.1:8000",
    },
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on("error", (err) => {
    console.error("[proxy] Error forwarding to Python backend:", err.message);
    if (!res.headersSent) {
      res.status(502).json({ message: "Python backend unavailable" });
    }
  });

  if (req.rawBody) {
    proxyReq.write(req.rawBody);
  } else if (req.body) {
    proxyReq.write(JSON.stringify(req.body));
  }

  proxyReq.end();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await startPythonBackend();

  app.post("/api/recommend-route", (req, res) => {
    proxyToFastAPI(req, res);
  });

  app.get("/api/mandis", (req, res) => {
    proxyToFastAPI(req, res);
  });

  return httpServer;
}
