import path from "node:path";
import { fileURLToPath } from "node:url";

export function isMain(importMetaUrl: string) {
  return path.resolve(fileURLToPath(importMetaUrl)) === path.resolve(process.argv[1] ?? "");
}
