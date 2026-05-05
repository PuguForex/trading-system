#!/bin/bash
# context-dump.sh
# Dumps full project context to context.txt for AI session loading.
# context.txt is NOT committed — it is in .gitignore

OUTPUT="context.txt"
DIVIDER="================================================================================"

# Clear/create output file
> "$OUTPUT"

# --- HEADER ---
echo "$DIVIDER" >> "$OUTPUT"
echo "PROJECT CONTEXT DUMP" >> "$OUTPUT"
echo "Generated: $(date)" >> "$OUTPUT"
echo "Directory: $(pwd)" >> "$OUTPUT"
echo "$DIVIDER" >> "$OUTPUT"
echo "" >> "$OUTPUT"

# --- FILE TREE ---
echo "FILE TREE" >> "$OUTPUT"
echo "$DIVIDER" >> "$OUTPUT"
find . \
  -not -path '*/node_modules/*' \
  -not -path '*/.git/*' \
  -not -path '*/dist/*' \
  -not -path '*/.husky/_*' \
  -not -name "*.svg" \
  -type f | sort >> "$OUTPUT"
echo "" >> "$OUTPUT"

# --- FILE CONTENTS ---
find . \
  -not -path '*/node_modules/*' \
  -not -path '*/.git/*' \
  -not -path '*/dist/*' \
  -not -path '*/.husky/_*' \
  -not -name "package-lock.json" \
  -not -name "context.txt" \
  -not -name "*.svg" \
  -type f | sort | while read f; do
    echo "$DIVIDER" >> "$OUTPUT"
    echo "FILE: $f" >> "$OUTPUT"
    echo "$DIVIDER" >> "$OUTPUT"
    cat "$f" >> "$OUTPUT"
    echo "" >> "$OUTPUT"
    echo "" >> "$OUTPUT"
done

echo "context.txt generated — $(wc -l < "$OUTPUT") lines"