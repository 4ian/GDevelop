#!/bin/sh
#Simply copy the entire GDevelop release directory into the bundle...
rm -rf GDevelop.app 2>&1 >/dev/null
cp -r macos-bundle-skeleton GDevelop.app
cp -r ../Output/Release_Darwin/ GDevelop.app/Contents/Resources/
cp -rf ../../ExtLibs/SFML/extlibs/libs-osx/Frameworks GDevelop.app/Contents/

type dylibbundler >/dev/null 2>&1 || { echo >&2 "Can't find dylibbundler, required to change libraries install names. Aborting..."; exit 1; }

#...and modify the internal paths to wxWidgets libraries:
#they are hardcoded in the executable (to /usr/local/lib or wherever they
#are installed).
#We use dylibbundler, that call install_name_tool to update the path to
#the external libs we depend one (i.e: wxWidgets). It also copy these
#libs into the 'libs' folder.
cd GDevelop.app/Contents/Resources/
echo . | dylibbundler -x GDIDE -b -cd -od -of -p '@executable_path/' > /dev/null
mv libs/* .
rm -rf libs

#Do the same for GDCore and GDCpp.
#We don't need -b flag anymore as all external libs have already being copied.
echo . | dylibbundler -x libGDCpp.dylib -cd -od -of -p '@executable_path/' > /dev/null
echo . | dylibbundler -x libGDCore.dylib -cd -od -of -p '@executable_path/' > /dev/null

#Do the same for GDJS
cat <<EOF | dylibbundler -x JsPlatform/libGDJS.dylib -cd -od -of -p '@executable_path/' > /dev/null
JsPlatform
.
quit
EOF

#Do the same for all extensions
for file in `ls CppPlatform/Extensions/*.xgde`
do
	echo "Updating libraries for $file..."
	cat <<EOF | dylibbundler -x $file -cd -od -of -p '@executable_path/' > /dev/null
JsPlatform
CppPlatform/Extensions/
.
JsPlatform
CppPlatform/Extensions/
.
quit
EOF
done
