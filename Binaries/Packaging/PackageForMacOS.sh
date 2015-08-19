#!/bin/sh
#Simply copy the entire GDevelop release directory into the bundle...
rm -rf GDevelop.app 2>&1 >/dev/null
cp -r macos-bundle-skeleton GDevelop.app
cp -r ../Output/Release_Darwin/ GDevelop.app/Contents/Resources/
cp -R ../../ExtLibs/SFML/extlibs/libs-osx/Frameworks GDevelop.app/Contents/
mv GDevelop.app/Contents/Resources/GDIDE_launcher GDevelop.app/Contents/MacOS/GDIDE_launcher

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


###Code signing and pkg building
#See http://kuvacode.com/blog/building-for-the-mac-app-store for more information
cd ../../..

#TODO:
rm -rf GDevelop.app/Contents/Resources/CppPlatform/Extensions/include/CommonDialogs/dlib-18.16/
rm -rf GDevelop.app/Contents/Resources/CppPlatform/Extensions/include/PhysicsBehavior/Box2D/Contributions
rm -rf GDevelop.app/Contents/Resources/CppPlatform/Extensions/Runtime/.xgd
rm -rf GDevelop.app/Contents/Resources/JsPlatform/Runtime/Extensions/CommonDialogs/dlib-18.16/
rm -rf GDevelop.app/Contents/Resources/JsPlatform/Runtime/Extensions/PhysicsBehavior/Box2D/Contributions
rm GDevelop.app/Contents/Resources/7zS.sfx

#Now sign the package:
function sign {
    codesign -f -v --deep -s "3rd Party Mac Developer Application: Florian Rival" $1 --entitlements GDevelop.entitlements
}

for file in `ls GDevelop.app/Contents/Resources/*.dylib`
do
	sign $file
done

for file in `ls GDevelop.app/Contents/Resources/CppPlatform/Extensions/*.{xgde,dylib}`
do
	sign $file
done

for file in `ls GDevelop.app/Contents/Resources/CppPlatform/Extensions/Runtime/*.xgd`
do
	sign $file
done

sign "GDevelop.app/Contents/Resources/CppPlatform/Runtime/ExeLinux"
sign "GDevelop.app/Contents/Resources/CppPlatform/Runtime/libGDCpp.dylib"

sign "GDevelop.app/Contents/Resources/JsPlatform/libGDJS.dylib"

sign "GDevelop.app/Contents/Resources/GDIDE"
sign "GDevelop.app/Contents/MacOS/GDIDE_launcher"
sign "GDevelop.app/Contents/Frameworks/sndfile.framework"
sign "GDevelop.app/Contents/Frameworks/freetype.framework"
sign "GDevelop.app"

#And create the pkg:
productbuild --component "GDevelop.app" /Applications --sign "3rd Party Mac Developer Installer: Florian Rival" --product "GDevelop.app/Contents/Info.plist" GDevelop.pkg
