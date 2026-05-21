import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const viteBin = path.join(rootDir, "node_modules", "vite", "bin", "vite.js");
const backend = spawn(process.execPath, [path.join(rootDir, "server", "index.mjs")], {
  stdio: "inherit",
  env: {
    ...process.env,
    PORT: process.env.PORT ?? "8787",
  },
});
const frontend = spawn(process.execPath, [viteBin], {
  stdio: "inherit",
  env: {
    ...process.env,
  },
});

const shutdown = () => {
  backend.kill();
  frontend.kill();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

backend.on("exit", (code) => {
  if (code && code !== 0) {
    frontend.kill();
    process.exit(code);
  }
});

frontend.on("exit", (code) => {
  if (code && code !== 0) {
    backend.kill();
    process.exit(code);
  }
});