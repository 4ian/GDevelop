cd ..
echo
echo "Tool for copying release runtime files to editor"
echo

echo
echo -Deleting all release runtime files.
rm Binaries/Output/Release_Linux/CppPlatform/Extensions/Runtime/*.xgdl -r
rm Binaries/Output/Release_Linux/CppPlatform/Runtime/*
rm Binaries/Output/Release_Linux/Examples/*.gdg.autosave

echo -Copying files from Runtime/bin/release
cp Runtime/bin/release/*.xgdl Binaries/Output/Release_Linux/CppPlatform/Extensions/Runtime
cp Runtime/bin/release/*.a Binaries/Output/Release_Linux/CppPlatform/Extensions/Runtime
cp Runtime/bin/release/libGDCpp.so Binaries/Output/Release_Linux/CppPlatform/Runtime
cp Runtime/bin/release/ExeLinux Binaries/Output/Release_Linux/CppPlatform/Runtime
cp Runtime/bin/release/PlayLinux Binaries/Output/Release_Linux/CppPlatform/Runtime
echo
echo -End of copy