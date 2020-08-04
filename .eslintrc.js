module.exports = {
    parser: '@typescript-eslint/parser',  // Specifies the ESLint parser
    extends: [
        'plugin:@typescript-eslint/recommended',  // Uses the recommended rules from the @typescript-eslint/eslint-plugin
    ],
    parserOptions: {
        ecmaVersion: 6,
        sourceType: 'module',  // Allows for the use of imports
    },
    rules: {
        // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
        // e.g. "@typescript-eslint/explicit-function-return-type": "off",
        'eol-last': 1,
        'max-statements-per-line': 1,
        'no-multiple-empty-lines': [
            'error', {
                'maxBOF': 0,
                'maxEOF': 1,
                'max': 99
            }
        ]
    },
};