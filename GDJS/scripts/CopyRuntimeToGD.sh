#!/bin/bash
#Get the destination, or copy by default to release directory
DESTINATION=../../Binaries/Output/Release_Linux/JsPlatform/Runtime/
if [ "$(uname)" == "Darwin" ]; then
	DESTINATION=../../Binaries/Output/Release_Darwin/JsPlatform/Runtime/
fi
if [ ! $# -eq 0 ]; then
	DESTINATION=$1
fi

#Copy all js files
echo "ℹ️ Copying GDJS and extensions runtime files (*.js) to '$DESTINATION'..."

mkdir -p "$DESTINATION"
cp -R ../Runtime/* "$DESTINATION"
rsync -r -u --include=*.js --include=*/ --exclude=* ../../Extensions/  "$DESTINATION"/Extensions/

echo "✅ Copied GDJS and extensions runtime files (*.js) to '$DESTINATION'."
