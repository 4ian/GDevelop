#!/bin/sh

echo 
echo Tool for updating include directory for Dev target.
echo 

echo -Copying files...
# rm ../../Binaries/Output/RelWithDebInfo/CppPlatform/include/*.* -r

# Game Develop C++ Implementation headers
rsync -r -u --include=*.h --include=*/ --exclude=* ../../GDCpp/  ../../Binaries/Output/RelWithDebInfo/CppPlatform/include/GDCpp/

# Boost (shared_ptr and dependencies) headers
rsync -r -u --include=*.h --include=*.hpp --include=*.inc --include=*.inl --include=*/ --exclude=* ../../ExtLibs/boost/boost/  ../../Binaries/Output/RelWithDebInfo/CppPlatform/include/boost/boost/

# SFML headers
rsync -r -u --include=*.h --include=*.hpp --include=*.inc --include=*.inl --include=*/ --exclude=* ../../ExtLibs/SFML/include/  ../../Binaries/Output/RelWithDebInfo/CppPlatform/include/SFML/include/

# Extensions headers
rsync -r -u --include=*.h --include=*.hpp --include=*.inc --include=*.inl --include=*/ --exclude=* ../../Extensions/  ../../Binaries/Output/RelWithDebInfo/CppPlatform/Extensions/include/

echo 
echo -End of copy
echo 
echo -Done
