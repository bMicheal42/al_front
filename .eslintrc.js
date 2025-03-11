module.exports = {
  root: true,
  env: {
    node: true,
    browser: true
  },
  extends: [
    "plugin:vue/recommended",
    "@vue/typescript"
  ],
  rules: {
    semi: ["error", "never"],
    "no-console": "warn",
    "no-debugger": "error",
    quotes: ["error", "single"],
    "vue/name-property-casing": ["error", "PascalCase"],
    "vue/component-name-in-template-casing": ["error", "kebab-case"],
    "vue/html-indent": ["error", 2],
    "vue/script-indent": ["error", 2, { baseIndent: 0, ignores: ['ClassDeclaration'] }],
    "vue/no-v-html": "off",
  },
  parserOptions: {
    parser: "typescript-eslint-parser"
  }
}
