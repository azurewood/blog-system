#!/bin/bash

# Loop through all .md files in the current directory
for file in *.md; do
    # Check if files exist to avoid errors in empty folders
    [ -e "$file" ] || continue
    
    # Extract filename without extension
    filename="${file%.*}"
    
    echo "Processing $file..."
    
    # Run the pandoc command
    pandoc --pdf-engine=xelatex "$file" -o "${filename}.pdf"
done

echo "✅ Conversion complete!"

