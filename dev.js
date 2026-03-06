#!/usr/bin/env node

/**
 * Script para iniciar ambos servidores (backend + frontend)
 * Uso: node dev.js (Windows PowerShell compatible)
 */

const { spawn } = require("child_process");
const path = require("path");

const commands = [
  {
    name: "Backend",
    cwd: path.join(__dirname, "backend"),
    command: process.platform === "win32" ? "npm.cmd" : "npm",
    args: ["run", "dev"],
    color: "\x1b[94m", // Blue
  },
  {
    name: "Frontend",
    cwd: path.join(__dirname, "frontend"),
    command: process.platform === "win32" ? "npm.cmd" : "npm",
    args: ["run", "dev"],
    color: "\x1b[92m", // Green
  },
];

console.log("\n🎮 Iniciando StarLight Cards (Development)\n");
console.log("Backend:  http://localhost:8080");
console.log("Frontend: http://localhost:5173\n");

commands.forEach(({ name, cwd, command, args, color }) => {
  const process = spawn(command, args, {
    cwd,
    stdio: "inherit",
    shell: true,
  });

  process.on("error", (err) => {
    console.error(`${color}ERROR [${name}]:`, err);
  });
});

console.log("\n⏹️  Presiona Ctrl+C para detener ambos servidores\n");

process.on("SIGINT", () => {
  console.log("\n\n👋 Deteniendo servidores...");
  process.exit(0);
});
