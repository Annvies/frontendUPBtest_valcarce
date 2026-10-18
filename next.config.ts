import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Export estático para Firebase Hosting (genera la carpeta `out/`)
  output: "export",
  turbopack: {
    root: process.cwd(),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
