export default [
    {
        "parser": "@typescript-eslint/parser",
        "plugins": ["@typescript-eslint"],
        rules: {
            semi: "error",
            "prefer-const": "error",
            "@typescript-eslint/explicit-function-return-type": ["error"]
        }
    }
];