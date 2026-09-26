#!/bin/bash
# Script to extract, update, and compile translation files for Force Quit Shortcut

set -e # Exit immediately if a command exits with a non-zero status

DOMAIN="force-quit-shortcut"
PO_DIR="po"
LOCALE_DIR="locale"

echo "1. Scanning code and updating .pot template..."
# xgettext searches for the _() function in the specified files
xgettext --from-code=UTF-8 --language=JavaScript --keyword=_ \
         --output=$PO_DIR/$DOMAIN.pot \
         extension.js prefs.js app/*.js 2>/dev/null || true

echo -e "\n2. Merging new strings with existing .po files..."
# Loop through all existing .po files in the po/ directory
for po_file in "$PO_DIR"/*.po; do
    # Skip if no .po files exist (prevents literal '*.po' from being evaluated)
    if [ ! -f "$po_file" ]; then
        echo "No .po files found to update."
        break
    fi
    
    # Extract language code from filename (e.g., 'uk' from 'po/uk.po')
    lang=$(basename "$po_file" .po)
    
    echo -n "Updating [$lang] translations... "
    # msgmerge safely adds new strings to the .po file without deleting existing translations
    msgmerge --update --quiet "$po_file" "$PO_DIR/$DOMAIN.pot"
    echo "Done!"
done

echo -e "\n3. Compiling .po files to .mo binaries..."
for po_file in "$PO_DIR"/*.po; do
    if [ ! -f "$po_file" ]; then
        break
    fi
    
    lang=$(basename "$po_file" .po)
    output_dir="$LOCALE_DIR/$lang/LC_MESSAGES"
    output_file="$output_dir/$DOMAIN.mo"
    
    echo -n "Compiling [$lang] to $output_file... "
    
    # Create the locale directory structure if it doesn't exist
    mkdir -p "$output_dir"
    
    # Compile the file
    msgfmt "$po_file" -o "$output_file"
    echo "Done!"
done

echo -e "\nSuccess! All translations are updated and compiled."
