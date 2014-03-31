cd ..
echo
echo "Tool for copying release runtime files to editor"
echo

echo
echo -Deleting all release runtime files.
rm Binaries/Output/Release/CppPlatform/Extensions/Runtime/*.xgdl -r
rm Binaries/Output/Release/CppPlatform/Runtime/*
rm Binaries/Output/Release/Examples/*.gdg.autosave

echo -Copying files from Runtime/bin/release
cp Runtime/bin/release/*.xgdl Binaries/Output/Release/CppPlatform/Extensions/Runtime
cp Runtime/bin/release/*.a Binaries/Output/Release/CppPlatform/Extensions/Runtime
cp Runtime/bin/release/libGDCpp.so Binaries/Output/Release/CppPlatform/Runtime
cp Runtime/bin/release/ExeLinux Binaries/Output/Release/CppPlatform/Runtime
cp Runtime/bin/release/PlayLinux Binaries/Output/Release/CppPlatform/Runtime
echo
echo -End of copy