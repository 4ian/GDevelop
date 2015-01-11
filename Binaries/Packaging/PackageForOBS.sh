#!/bin/bash

echo "This script will add the files needed by OBS in :\n'$PWD/opensuse-build-service/final'"
echo "Before that, enter those information:"

#Auto-detect last GDevelop version and current branch
(git tag -l *.*.* --sort -v:refname) > versions
read autoversion < versions
(git rev-parse --abbrev-ref HEAD) > branch
read autobranch < branch

printf " GDevelop version ([ENTER] to use auto-detected [$autoversion]): "
read GD_VERSION
printf "$GD_VERSION"
if [ "$GD_VERSION" == "" ]; then
	GD_VERSION="$autoversion"
fi

printf " Package revision (number): "
read PACKAGE_REV

printf " Git branch to use ([ENTER] to use current [$autobranch]): "
read BRANCH
if [ "$BRANCH" == "" ]; then
	BRANCH="$autobranch"
fi

DATE=$(LC_ALL=C date +'%a, %d %b %Y %T %z')
GD_BASE_DIR=$(pwd)/../../
CUR_DIR=$(pwd)

echo "Started the OBS packaging process, using latest '$BRANCH' git tree"

#Remove old folders
printf " Preparing folders... "
if [ -d "opensuse-build-service/gdevelop" ]; then
	rm -rf opensuse-build-service/gdevelop
fi
if [ -d "opensuse-build-service/final" ]; then
	rm -rf opensuse-build-service/final
fi
mkdir -p opensuse-build-service/gdevelop
mkdir -p opensuse-build-service/final
echo "[OK]"

#Create the tar.gz containing the source
printf " Getting the sources... "
cd $GD_BASE_DIR
git archive --format tar.gz --output $CUR_DIR/opensuse-build-service/gdevelop/gdevelop_$GD_VERSION.orig.tar.gz --prefix=gdevelop-$GD_VERSION/ $BRANCH
cd $CUR_DIR/opensuse-build-service/gdevelop
tar zxf gdevelop_$GD_VERSION.orig.tar.gz
echo "[OK]"

#We need to include ExtLibs/SFML.7z and ExtLibs/boost.7z because buildbot do not have access to internet
printf " Copying SFML and Boost archives... "
cp $GD_BASE_DIR/ExtLibs/boost.7z gdevelop-$GD_VERSION/ExtLibs/
cp $GD_BASE_DIR/ExtLibs/SFML.7z gdevelop-$GD_VERSION/ExtLibs/
echo "[OK]"

#Recreate the tar.gz with the added sources
printf " Creating the source archive... "
rm gdevelop_$GD_VERSION.orig.tar.gz
tar -zcf ../final/gdevelop_$GD_VERSION.orig.tar.gz gdevelop-$GD_VERSION/
echo "[OK]"

#Process SPEC and PKGBUILD files
cd ..
m4 -DMACRO_GD_VERSION=$GD_VERSION -DMACRO_PACKAGE_REV=$PACKAGE_REV gdevelop.spec >> final/gdevelop.spec
m4 -DMACRO_GD_VERSION=$GD_VERSION -DMACRO_PACKAGE_REV=$PACKAGE_REV PKGBUILD >> final/PKGBUILD
cp gdevelop-rpmlintrc final
cp PKGBUILD.install final

echo "Packaging process finished."
