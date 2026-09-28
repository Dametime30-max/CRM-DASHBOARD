import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // better-sqlite3 is a native module; keep it out of the server bundle.
  serverExternalPackages: ["better-sqlite3"],
  // No telemetry-style headers; this is an internal tool.
  poweredByHeader: false,
};

export default nextConfig;
