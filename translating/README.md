# Translating

## How to Contribute Translations

- Edit the relevant `.po` file and create a PR to submit changes.
- If adding a new language use `kiwimenu.pot` file as a template and save it to `po/xx.po` and then create a PR.
 

## Translation Status

| Language | Code | Status | Completion |
|----------|------|--------|------------|
| German | de | 🟢 Complete | 92/93 (98.9%) |
| Spanish | es | 🟢 Complete | 92/93 (98.9%) |
| Estonian | et | 🟢 Complete | 92/93 (98.9%) |
| Persian | fa | 🟢 Complete | 92/93 (98.9%) |
| Finnish | fi | 🟢 Complete | 92/93 (98.9%) |
| French | fr | 🟢 Complete | 92/93 (98.9%) |
| Hungarian | hu | 🟢 Complete | 93/93 (100%) |
| Italian | it | 🟢 Complete | 92/93 (98.9%) |
| Korean | ko | 🟢 Complete | 92/93 (98.9%) |
| Lithuanian | lt | 🟢 Complete | 92/93 (98.9%) |
| Latvian | lv | 🟢 Complete | 92/93 (98.9%) |
| Norwegian | nb | 🟢 Complete | 92/93 (98.9%) |
| Dutch | nl | 🟢 Complete | 92/93 (98.9%) |
| Polish | pl | 🟢 Complete | 92/93 (98.9%) |
| Portuguese | pt | 🟢 Complete | 92/93 (98.9%) |
| Swedish | sv | 🟢 Complete | 92/93 (98.9%) |
| Chinese (Simplified) | zh-CN | 🟢 Complete | 93/93 (100%) |
| Turkish | tr | 🟢 Complete | 92/93 (98.9%) |
| Ukrainian | uk | 🟢 Complete | 93/93 (100%) |

*Note: The 1 untranslated message in some languages is "Serial number", which the extension no longer uses.*

## Note

> Some translations are machine-generated and may contain mistakes. Native speakers are welcome to review and improve them!


## Compiling translations for testing

The helper script compiles translations and produces a `locale/` folder for local testing.

Run the script to update `locale/`:

```bash
./compile-translations.sh
```

## Further Reading

- [GJS translations guide](https://gjs.guide/extensions/development/translations.html)


