#!/bin/bash
# Script to download AI models for local inference in GDevelop

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "GDevelop Local AI Models Downloader"
echo "===================================="
echo ""

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is required but not found."
    exit 1
fi

# Check if pip is available
if ! command -v pip3 &> /dev/null && ! command -v pip &> /dev/null; then
    echo "Error: pip is required but not found."
    exit 1
fi

# Install huggingface_hub if not present
echo "Checking dependencies..."
if ! python3 -c "import huggingface_hub" 2>/dev/null; then
    echo "Installing huggingface_hub..."
    pip3 install huggingface_hub --quiet || pip install huggingface_hub --quiet
fi

echo "Dependencies ready."
echo ""

# Run the Python download script
python3 "${SCRIPT_DIR}/download_models.py" "$@"
