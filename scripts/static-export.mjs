import { mkdir, rename, rm } from "node:fs/promises";
import { execSync } from "node:child_process";
import path from "node:path";

const root = process.cwd();
const apiSrc = path.join(root, "src", "app", "api");
const stashRoot = path.join(root, ".stash");
const apiStash = path.join(stashRoot, "api");
const basePath = process.env.NEXT_BASE_PATH || "";

let moved = false;
try {
  // Route handlers can't be statically exported — park the API for the export build.
  await mkdir(stashRoot, { recursive: true });
  await rename(apiSrc, apiStash);
  moved = true;

  execSync("npx next build", {
    stdio: "inherit",
    env: {
      ...process.env,
      NEXT_BASE_PATH: basePath,
      NEXT_PUBLIC_BASE_PATH: basePath,
      NEXT_PUBLIC_STATIC: "1",
      NEXT_STATIC_EXPORT: "1",
    },
  });
  console.log(`static export ready in ./out${basePath}`);
} finally {
  if (moved) {
    await rename(apiStash, apiSrc);
    await rm(stashRoot, { recursive: true, force: true });
  }
}
