#!/bin/sh

GPG_PUBLIC_KEY=0xA8025399
GD_VERSION=3.6.76
GD_VERSION_WITH_REV="$GD_VERSION"010
BRANCH=master
DATE=$(LC_ALL=C date +'%a, %d %b %Y %T %z')
GD_BASE_DIR=$(pwd)/../../
CUR_DIR=$(pwd)

echo "Started the debian source packaging process, using latest '$BRANCH' git tree"

#Create the changelog file
echo "gdevelop ($GD_VERSION_WITH_REV-1) trusty; urgency=low" > debian-source-package/extra-files/debian/changelog
echo "" >> debian-source-package/extra-files/debian/changelog
echo "  * Released $GD_VERSION" >> debian-source-package/extra-files/debian/changelog
echo "" >> debian-source-package/extra-files/debian/changelog
echo " -- Florian <Florian.Rival@gmail.com>  $DATE" >> debian-source-package/extra-files/debian/changelog

if [ -d "debian-source-package/gdevelop" ]; then
	rm -rf debian-source-package/gdevelop
fi
mkdir -p debian-source-package/gdevelop

#Create the tar.gz containing the source
cd $GD_BASE_DIR
git archive --format tar.gz --output $CUR_DIR/debian-source-package/gdevelop/gdevelop_$GD_VERSION_WITH_REV.orig.tar.gz --prefix=gdevelop-$GD_VERSION_WITH_REV/ $BRANCH
cd $CUR_DIR/debian-source-package/gdevelop
tar zxvf gdevelop_$GD_VERSION_WITH_REV.orig.tar.gz

#We need to include ExtLibs/SFML.7z and ExtLibs/boost.7z because buildbot do not have access to internet
cp $GD_BASE_DIR/ExtLibs/boost.7z gdevelop-$GD_VERSION_WITH_REV/ExtLibs/
cp $GD_BASE_DIR/ExtLibs/SFML.7z gdevelop-$GD_VERSION_WITH_REV/ExtLibs/

#Recreate the tar.gz with the added sources
rm gdevelop_$GD_VERSION_WITH_REV.orig.tar.gz
tar -zcvf gdevelop_$GD_VERSION_WITH_REV.orig.tar.gz gdevelop-$GD_VERSION_WITH_REV

#Add the debian folder
cp -r $CUR_DIR/debian-source-package/extra-files/debian gdevelop-$GD_VERSION_WITH_REV/

#Launch debuild
cd gdevelop-$GD_VERSION_WITH_REV/
debuild -S -sa -k$GPG_PUBLIC_KEY
cd ..

#Send ppa
dput ppa:florian-rival/gdevelop gdevelop_$GD_VERSION_WITH_REV-1_source.changes
