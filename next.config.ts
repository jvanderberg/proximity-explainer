import type { NextConfig } from "next";

// BASE_PATH is set by the Pages workflow when deploying under a subpath
// (jvanderberg.github.io/proximity-explainer). Unset for local dev and for a
// custom-domain deployment.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: process.env.BASE_PATH ?? "",
};

export default nextConfig;
