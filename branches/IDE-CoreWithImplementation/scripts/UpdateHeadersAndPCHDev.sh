#!/bin/sh

echo 
echo Tool for updating include directory for Release target.
echo 

echo -Copying files...
# rm ../bin/dev/CppPlatform/include/*.* -r

# Game Develop C++ Implementation headers
rsync -r -u --include=*.h --include=*/ --exclude=* ../../GDL/  ../bin/dev/CppPlatform/include/GDL/

# Boost (shared_ptr and dependencies) headers
rsync -r -u --include=*.h --include=*.hpp --include=*.inc --include=*.inl --include=*/ --exclude=* ../../ExtLibs/boost/boost/  ../bin/dev/CppPlatform/include/boost/boost/

# SFML headers
rsync -r -u --include=*.h --include=*.hpp --include=*.inc --include=*.inl --include=*/ --exclude=* ../../ExtLibs/SFML/include/  ../bin/dev/CppPlatform/include/SFML/include/

# Extensions headers
rsync -r -u --include=*.h --include=*.hpp --include=*.inc --include=*.inl --include=*/ --exclude=* ../../Extensions/  ../bin/dev/CppPlatform/Extensions/include/

echo 
echo -End of copy
echo 
echo -Done
