#!/bin/sh
#This script copy all (versioned) files from Release_Windows into Release_Linux.

cd ../Binaries/Output/Release_Windows
git archive --format tar.gz --output ../allRuntimeFiles.tar master
cd ..
tar -xzf allRuntimeFiles.tar -C Release_Linux
rm allRuntimeFiles.tar
cd ../../scripts/