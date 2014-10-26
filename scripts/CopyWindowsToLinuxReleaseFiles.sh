#!/bin/sh
#This script copy all (versioned) files from Release_Windows into Release_Linux.

#Get the destination, or copy by default to Release_Linux directory
DESTINATION=Release_Linux
if [ ! $# -eq 0 ]; then
	DESTINATION=$1
fi

echo "Copying versioned files from Release_Windows to '$DESTINATION'..."

cd ../Binaries/Output/Release_Windows
git archive --format tar.gz --output ../allRuntimeFiles.tar master
cd ..
tar -xzf allRuntimeFiles.tar -C "$DESTINATION"
rm allRuntimeFiles.tar
cd ../../scripts/

echo "Done."
