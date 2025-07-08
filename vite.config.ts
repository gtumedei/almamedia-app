import tailwind from "@tailwindcss/vite"
import { defineConfig } from "vite"
import solid from "vite-plugin-solid"
import path from "path"

export default defineConfig({
  plugins: [solid(), tailwind()],
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
        worker: path.resolve(__dirname, "src/worker.ts"),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          // Worker chunk goes in the main dist folder with no hash in its name
          if (chunkInfo.name == "worker") return "[name].js"
          // Other chunks are treated normally
          return "assets/[name]-[hash].js"
        },
      },
    },
  },
})
