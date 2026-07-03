import type { NextConfig } from "next";

import { CSP_HEADER, SECURITY_HEADERS } from "./src/lib/security/headers";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  headers: async () => [
    {
      source: "/:path*",
      headers: [...SECURITY_HEADERS, CSP_HEADER],
    },
  ],
};

export default nextConfig;
