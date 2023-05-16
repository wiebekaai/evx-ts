import typescript from "@rollup/plugin-typescript";
import pkg from "./package.json" assert { type: "json" };
import { defineConfig } from "rollup";
import babel, { getBabelOutputPlugin } from "@rollup/plugin-babel";

const targets = "defaults and supports es6-module";

export default defineConfig([
  {
    input: "src/main.ts",
    output: {
      name: "evx-ts",
      file: pkg.browser,
      format: "esm",
    },
    plugins: [
      getBabelOutputPlugin({
        presets: [
          [
            "@babel/preset-env",
            {
              modules: "umd",
              targets,
            },
          ],
        ],
      }),
      typescript(),
    ],
  },
  {
    input: "src/main.ts",
    plugins: [
      getBabelOutputPlugin({
        presets: [["@babel/preset-env", { targets }]],
      }),
      typescript(),
    ],
    output: [
      { file: pkg.main, format: "cjs" },
      { file: pkg.module, format: "es" },
    ],
  },
]);
