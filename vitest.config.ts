import { cloudflareTest } from "@cloudflare/vitest-pool-workers";

export default {
  plugins: [
    cloudflareTest({
      // Loads your main worker so bindings/agents exist in the test isolate.
      // Use the bundled worker output so TC39 decorators are already transformed.
      main: "./dist/my_agent/index.js",
      wrangler: { configPath: "./wrangler.jsonc" },
      remoteBindings: false
    })
  ]
};
