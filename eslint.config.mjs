import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import tseslint from "typescript-eslint";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  
  // Custom rules to address your specific issues
  {
    rules: {
      // Make unused variables a warning and allow underscore-prefixed unused vars
      "@typescript-eslint/no-unused-vars": [
        "warn", 
        { 
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_"
        }
      ],
      
      // Soften the 'any' type restriction
      "@typescript-eslint/no-explicit-any": "warn",
      
      // Make missing dependencies a warning
      "react-hooks/exhaustive-deps": "warn",
    }
  },
  
  // Ignore specific files or patterns if needed
  {
    ignores: [
      ".next/",
      "node_modules/",
      "public/",
    ]
  }
];

export default eslintConfig;