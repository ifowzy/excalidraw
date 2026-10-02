import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import svgrPlugin from "vite-plugin-svgr";
import { ViteEjsPlugin } from "vite-plugin-ejs";
import { VitePWA } from "vite-plugin-pwa";
import checker from "vite-plugin-checker";
import { createHtmlPlugin } from "vite-plugin-html";
import Sitemap from "vite-plugin-sitemap";

const woff2BrowserPlugin = () => ({
  name: "woff2-browser-plugin",
});

const virtualPwaPlugin = () => {
  const virtualModuleId = "virtual:pwa-register";
  const resolvedVirtualModuleId = "\0" + virtualModuleId;
  return {
    name: "virtual-pwa-register",
    resolveId(id: string) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },
    load(id: string) {
      if (id === resolvedVirtualModuleId) {
        return "export const registerSW = (options) => {};";
      }
    },
  };
};

export default defineConfig(({ mode }) => {
  // To load .env variables
  const envVars = loadEnv(mode, `../`);
  // https://vitejs.dev/config/
  return {
    root: __dirname,
    server: {
      port: 3000,
      host: "0.0.0.0",
      open: false,
    },
    // We need to specify the envDir since now there are no
    //more located in parallel with the vite.config.ts file but in parent dir
    envDir: "../",
    resolve: {
      alias: [
        {
          find: /^@excalidraw\/common$/,
          replacement: path.resolve(
            __dirname,
            "../packages/common/src/index.ts",
          ),
        },
        {
          find: /^@excalidraw\/common\/(.*?)/,
          replacement: path.resolve(__dirname, "../packages/common/src/$1"),
        },
        {
          find: /^@excalidraw\/element$/,
          replacement: path.resolve(
            __dirname,
            "../packages/element/src/index.ts",
          ),
        },
        {
          find: /^@excalidraw\/element\/(.*?)/,
          replacement: path.resolve(__dirname, "../packages/element/src/$1"),
        },
        {
          find: /^@excalidraw\/excalidraw$/,
          replacement: path.resolve(
            __dirname,
            "../packages/excalidraw/index.tsx",
          ),
        },
        {
          find: /^@excalidraw\/excalidraw\/(.*?)/,
          replacement: path.resolve(__dirname, "../packages/excalidraw/$1"),
        },
        {
          find: /^@excalidraw\/math$/,
          replacement: path.resolve(__dirname, "../packages/math/src/index.ts"),
        },
        {
          find: /^@excalidraw\/math\/(.*?)/,
          replacement: path.resolve(__dirname, "../packages/math/src/$1"),
        },
        {
          find: /^@excalidraw\/utils$/,
          replacement: path.resolve(
            __dirname,
            "../packages/utils/src/index.ts",
          ),
        },
        {
          find: /^@excalidraw\/utils\/(.*?)/,
          replacement: path.resolve(__dirname, "../packages/utils/src/$1"),
        },
        {
          find: /^@excalidraw\/fractional-indexing$/,
          replacement: path.resolve(
            __dirname,
            "../packages/fractional-indexing/src/index.ts",
          ),
        },
        {
          find: /^@excalidraw\/laser-pointer$/,
          replacement: path.resolve(
            __dirname,
            "../packages/laser-pointer/src/index.ts",
          ),
        },
      ],
    },
    build: {
      outDir: path.resolve(__dirname, "../dist"),
      emptyOutDir: true,
      rollupOptions: {
        output: {
          assetFileNames(chunkInfo) {
            if (chunkInfo?.name?.endsWith(".woff2")) {
              const family = chunkInfo.name.split("-")[0];
              return `fonts/${family}/[name][extname]`;
            }

            return "assets/[name]-[hash][extname]";
          },
          manualChunks(id) {
            if (
              id.includes("packages/excalidraw/locales") &&
              id.match(/en.json|percentages.json/) === null
            ) {
              const index = id.indexOf("locales/");
              return `locales/${id.substring(index + 8)}`;
            }

            if (id.includes("@excalidraw/mermaid-to-excalidraw")) {
              return "mermaid-to-excalidraw";
            }

            if (id.includes("@codemirror/") || id.includes("@lezer/")) {
              return "codemirror.chunk";
            }
          },
        },
      },
      sourcemap: false,
      assetsInlineLimit: 0,
    },
    plugins: [
      woff2BrowserPlugin(),
      virtualPwaPlugin(),
      react(),
      checker({
        typescript: false,
        eslint: undefined,
      }),
      svgrPlugin(),
      ViteEjsPlugin(),
      createHtmlPlugin({
        minify: true,
      }),
    ],
  };
});

