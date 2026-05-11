const { execSync } = require("child_process");
const path = require("path");

console.log("[v0] Setting up Prisma client...");

try {
  console.log("[v0] Running prisma generate...");
  execSync("npx prisma generate", {
    cwd: path.resolve(__dirname, ".."),
    stdio: "inherit",
  });
  console.log("[v0] Prisma client generated successfully");
} catch (error) {
  console.error("[v0] Failed to generate Prisma client:", error.message);
  process.exit(1);
}
