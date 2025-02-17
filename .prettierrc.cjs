// .prettierrc.mjs
/** @type {import("prettier").Config} */
module.exports = {
  singleAttributePerLine: true,
  singleQuote: true,
  semi: false,
  plugins: ["prettier-plugin-astro", "prettier-plugin-tailwindcss"],
  overrides: [
    {
      files: "*.astro",
      options: {
        parser: "astro",
      },
    },
  ],
};
