# Translating

## How to Contribute Translations

- For a new language, use the `po/force-quit-shortcut.pot` file as a template. Save it as `po/YOUR_LANG_CODE.po` (e.g., `po/lv.po`), translate the strings, and then create a PR.
- Edit the relevant `.po` file in the `po/` directory and create a Pull Request (PR) to submit your changes.

## Updating and Compiling Translations for Testing

We use an all-in-one helper script to manage translations. Whenever you change the source code or translate a `.po` file, run this script. It automatically performs three tasks:

1. **Extracts** new strings from the JavaScript code and updates the `force-quit-shortcut.pot` template.
2. **Merges** any new strings into all existing `.po` files safely.
3. **Compiles** the `.po` files into `.mo` binaries and organizes them into the `locale/` folder for local extension testing.

To run the script:

```bash
./update-translations.sh
```
## Test locally

To see the translations in action, copy the updated extension files to your local GNOME Shell extensions directory:
```bash
cp -r * ~/.local/share/gnome-shell/extensions/force-quit-shortcut@dymkom/
```
(Note: You will need to restart your GNOME session for the new translations to be loaded).

## Further Reading

- [GJS translations guide](https://gjs.guide/extensions/development/translations.html)

