#!/bin/sh
#This script copy all (versioned) files from Release_Windows into Release_Linux.
#This is for GDevelop 4 only.

#Get the destination, or copy by default to Release_Linux directory
DESTINATION=Release_Linux
if [ ! $# -eq 0 ]; then
	DESTINATION=$1
fi

echo "Copying versioned files from Release_Windows to '$DESTINATION'..."

cd ../Binaries/Output/Release_Windows
git archive --format tar.gz --output ../allRuntimeFiles.tar HEAD
if [ $? -eq 0 ]; then
	cd ..
	tar -xzf allRuntimeFiles.tar -C "$DESTINATION"
	rm allRuntimeFiles.tar
else
	echo "Can't use git to copy versioned file, fallback to copy the entire Release_Windows to '$DESTINATION'..."
	cd ..
	cp -a Release_Windows/. $DESTINATION/
fi
cd ../../scripts/

echo "Done."
