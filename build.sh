#!/usr/bin/env bash

GCE_IMAGE_OUTPUT_DIR="$(nix build '.#gce' --system "x86_64-linux" --no-link --print-out-paths)"

# list all files in the output directory
OUTPUT_FILES="$(find "$GCE_IMAGE_OUTPUT_DIR" -type f)"

# Assert that there is only one file in the output directory
if [ "$(echo "$OUTPUT_FILES" | wc -l)" -ne 1 ]; then
  echo "Expected only one file in the output directory, but found:"
  echo "$OUTPUT_FILES"
  exit 1
fi

mkdir -p images
OUTPUT_FILES="$(echo "$OUTPUT_FILES" | tr -d '[:space:]')"
cp "$OUTPUT_FILES" images/gce.tar.gz
