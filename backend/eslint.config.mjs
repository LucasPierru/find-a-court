import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ["dist/**"],
  },
  {
    rules: {
      // Express only recognizes error-handling middleware by its 4-argument
      // arity, so a leading/trailing unused param (e.g. `_next`) sometimes
      // can't be dropped - underscore-prefixed names mark that intentionally.
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
);
