#!/bin/sh

GD_VERSION=3.6.76
GD_VERSION_WITH_REV="$GD_VERSION"
BRANCH=wx-std-support
DATE=$(LC_ALL=C date +'%a, %d %b %Y %T %z')
GD_BASE_DIR=$(pwd)/../../
CUR_DIR=$(pwd)

echo "Started the OBS packaging process, using latest '$BRANCH' git tree"

if [ -d "opensuse-build-service/gdevelop" ]; then
	rm -rf opensuse-build-service/gdevelop
fi
mkdir -p opensuse-build-service/gdevelop

#Create the tar.gz containing the source
cd $GD_BASE_DIR
git archive --format tar.gz --output $CUR_DIR/opensuse-build-service/gdevelop/gdevelop_$GD_VERSION_WITH_REV.orig.tar.gz --prefix=gdevelop-$GD_VERSION_WITH_REV/ $BRANCH
cd $CUR_DIR/opensuse-build-service/gdevelop
tar zxvf gdevelop_$GD_VERSION_WITH_REV.orig.tar.gz

#We need to include ExtLibs/SFML.7z and ExtLibs/boost.7z because buildbot do not have access to internet
cp $GD_BASE_DIR/ExtLibs/boost.7z gdevelop-$GD_VERSION_WITH_REV/ExtLibs/
cp $GD_BASE_DIR/ExtLibs/SFML.7z gdevelop-$GD_VERSION_WITH_REV/ExtLibs/

#Copy everything from Release_Windows into Release_Linux (and remove Release_Windows content)
cp -R gdevelop-$GD_VERSION_WITH_REV/Binaries/Output/Release_Windows/* gdevelop-$GD_VERSION_WITH_REV/Binaries/Output/Release_Linux/
rm -R gdevelop-$GD_VERSION_WITH_REV/Binaries/Output/Release_Windows/*

#Recreate the tar.gz with the added sources
rm gdevelop_$GD_VERSION_WITH_REV.orig.tar.gz
tar -zcvf ../gdevelop_$GD_VERSION_WITH_REV.orig.tar.gz gdevelop-$GD_VERSION_WITH_REV
rm -rf opensuse-build-service/gdevelop
