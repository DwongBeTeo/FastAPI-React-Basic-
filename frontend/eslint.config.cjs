const js = require("@eslint/js");
const react = require("eslint-plugin-react");
const reactHooks = require("eslint-plugin-react-hooks");
const globals = require("globals");

// eslint.config.cjs
module.exports = [
  {
    // Bỏ qua các thư mục không cần quét
    ignores: ["dist/**", "node_modules/**", "webpack.config.js", "postcss.config.js"],
  },

  js.configs.recommended,

  {
    files: ["src/**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      
      // === CÁC LUẬT ĐÃ ĐƯỢC NỚI LỎNG ===
      "react/react-in-jsx-scope": "off", // Bỏ qua lỗi thiếu import React ở bản React mới
      "react/prop-types": "off",         // Không bắt buộc khai báo kiểu dữ liệu cho props
      "no-unused-vars": "warn",          // Khai báo biến không dùng: Chỉ cảnh báo vàng, không báo lỗi đỏ
      "no-undef": "warn",                // Biến chưa định nghĩa: Cảnh báo vàng
      "react-hooks/exhaustive-deps": "warn" // Cảnh báo thiếu dependencies trong useEffect
    },
  },
];