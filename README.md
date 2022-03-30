# Utility to extend languages in VS Code

Currently, it is not possible to build a new language as an extension of an existing one, the `language-configuration.json` file must be self-contained. This can lead to tedious maintenance as changes to the base language have to be forwarded manually. This package aims at helping language developers.

Assume you wand to derive a new language configuration from `A-language-configuration.json`, you just need to define a file let us say `B.extension.language-configuration.json` containing

```json
{
    "extends": "path/to/A-language-configuration.json",
    "overrides": {
        "comments": {
            "blockComment": [
                "<!--",
                "-->"
            ]
        },
        "surroundingPairs": [
            ["{", "}"],
            ["[", "]"],
            ["(", ")"],
            ["\"", "\""],
            ["'", "'"],
            ["$", "$"],
            ["`", "`"],
            ["_", "_"],
            ["*", "*"]
        ],
    },
    "folding": {
        "offSide": true,
        "markers": {
            "start": "^\\s*<!--\\s*#?region\\b.*-->",
            "end": "^\\s*<!--\\s*#?endregion\\b.*-->"
        }
    }
}
```

- `extends` means that language `B` is based on the language configuration of language `A`. `path/to/A-language-configuration.json` can either be a relative local path to `A-language-configuration.json` or an url.
- The `overrides` section allows to replace some settings of `A-language-configuration.json` by their new values in `B`.
- Everything outside the `overrides` section is added to the `B` configuration. If the key already exists in `A-language-configuration.json`, it must be an array and in this case their contents are concatenated.

To obtain the self-contained language configuration file for `B`, `B.language-configuration.json`, use

```js
const vel = require('vscode-extend-language')

vel.expandConfigurationFile('./B.extension.language-configuration.json', './B.language-configuration.json')
```
