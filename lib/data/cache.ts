import fs from "node:fs/promises";
import path from "node:path";

export function cacheDir() {
  return path.resolve(process.env.DATA_CACHE_DIR || "./data/cache");
}

export async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

export async function readJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8")) as T;
  } catch {
    return null;
  }
}

export async function writeJsonFile(filePath: string, data: unknown) {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, JSON.stringify(redactSecrets(data), null, 2));
}

function redactSecrets(data: unknown): unknown {
  const secrets = [process.env.BEA_API_KEY, process.env.BLS_API_KEY].filter(Boolean) as string[];
  if (!secrets.length) return data;
  if (typeof data === "string") {
    return secrets.reduce((text, secret) => text.split(secret).join("[redacted]"), data);
  }
  if (Array.isArray(data)) return data.map((item) => redactSecrets(item));
  if (data && typeof data === "object") {
    return Object.fromEntries(Object.entries(data).map(([key, value]) => [key, redactSecrets(value)]));
  }
  return data;
}

export async function cachedFetchJson<T>(url: string, cacheName: string, init?: RequestInit): Promise<{ data: T | null; status: "connected" | "cached" | "fallback"; note: string }> {
  const file = path.join(cacheDir(), cacheName);
  try {
    const response = await fetch(url, init);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = (await response.json()) as T;
    await writeJsonFile(file, data);
    return { data, status: "connected", note: "Fetched upstream source and updated local cache." };
  } catch (error) {
    const cached = await readJsonFile<T>(file);
    if (cached) return { data: cached, status: "cached", note: `Using cached ${cacheName}` };
    return { data: null, status: "fallback", note: error instanceof Error ? error.message : "Fetch failed" };
  }
}
