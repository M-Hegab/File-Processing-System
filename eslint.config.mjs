import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import json from "@eslint/json";

export default [
  {
    ignores: ["dist/**", "node_modules/**", "**/package-lock.json"],
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    ...js.configs.recommended,
  },
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "commonjs",
    },
  },
  {
    files: ["**/*.json"],
    ignores: ["**/package-lock.json", "tsconfig.json"],
    plugins: {
      json,
    },
    language: "json/json",
    rules: {
      "json/no-duplicate-keys": "error",
      "json/no-empty-keys": "error",
      "json/no-unnormalized-keys": "error",
      "json/no-unsafe-values": "error",
    },
  },
  {
    files: ["src/server.ts"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  {
    files: ["tsconfig.json"],
    plugins: {
      json,
    },
    language: "json/jsonc",
    languageOptions: {
      allowTrailingCommas: true,
    },
    rules: {
      "json/no-duplicate-keys": "error",
      "json/no-empty-keys": "error",
      "json/no-unnormalized-keys": "error",
      "json/no-unsafe-values": "error",
    },
  },
];
