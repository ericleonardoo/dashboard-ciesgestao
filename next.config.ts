import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "firebase-admin",
    "google-auth-library",
    "jwks-rsa",
    "jose",
    "gaxios",
    "gcp-metadata",
    "gtoken",
  ],
};

export default nextConfig;
