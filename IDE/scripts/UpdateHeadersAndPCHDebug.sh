#!/bin/sh

echo 
echo Tool for updating include directory for debug target.
echo 

echo -Copying files...
# rm ../bin/debug/CppPlatform/include/*.* -r

# Game Develop C++ Implementation headers
rsync -r -u --include=*.h --include=*/ --exclude=* ../../GDL/  ../bin/debug/CppPlatform/include/GDL/

# Game Develop Core headers
rsync -r -u --include=*.h --include=*/ --exclude=* ../../Core/  ../bin/debug/CppPlatform/include/Core/

# Boost (shared_ptr and dependencies) headers
rsync -r -u --include=*.h --include=*.hpp --include=*.inc --include=*.inl --include=*/ --exclude=* ../../ExtLibs/boost/boost/  ../bin/debug/CppPlatform/include/boost/boost/

# SFML headers
rsync -r -u --include=*.h --include=*.hpp --include=*.inc --include=*.inl --include=*/ --exclude=* ../../ExtLibs/SFML/include/  ../bin/debug/CppPlatform/include/SFML/include/

# Extensions headers
rsync -r -u --include=*.h --include=*.hpp --include=*.inc --include=*.inl --include=*/ --exclude=* ../../Extensions/  ../bin/debug/CppPlatform/Extensions/include/

echo 
echo -End of copy
echo 
echo -Done
