#!/bin/sh

echo 
echo Tool for updating include directory for Release target.
echo 

echo -Copying files...
# rm ../bin/release/CppPlatform/include/*.* -r

# Game Develop C++ Implementation headers
rsync -r -u --include=*.h --include=*/ --exclude=* ../../GDL/  ../bin/release/CppPlatform/include/GDL/

# Game Develop Core headers
rsync -r -u --include=*.h --include=*/ --exclude=* ../../Core/  ../bin/release/CppPlatform/include/Core/

# Boost (shared_ptr and dependencies) headers
rsync -r -u --include=*.h --include=*.hpp --include=*.inc --include=*.inl --include=*/ --exclude=* ../../ExtLibs/boost/boost/  ../bin/release/CppPlatform/include/boost/boost/

# SFML headers
rsync -r -u --include=*.h --include=*.hpp --include=*.inc --include=*.inl --include=*/ --exclude=* ../../ExtLibs/SFML/include/  ../bin/release/CppPlatform/include/SFML/include/

# Extensions headers
rsync -r -u --include=*.h --include=*.hpp --include=*.inc --include=*.inl --include=*/ --exclude=* ../../Extensions/  ../bin/release/CppPlatform/Extensions/include/

echo 
echo -End of copy
echo 
echo -Done
