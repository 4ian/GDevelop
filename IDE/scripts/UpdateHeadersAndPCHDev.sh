#!/bin/sh

echo 
echo Tool for updating include directory for Release target.
echo 

echo -Copying files...
# rm ../bin/dev/include/*.* -r

# Game Develop C++ Implementation headers
rsync -r -u --include=*.h --include=*/ --exclude=* ../../GDL/  ../bin/dev/include/GDL/

# Boost (shared_ptr and dependencies) headers
rsync -r -u --include=*.h --include=*.hpp --include=*.inc --include=*.inl --include=*/ --exclude=* ../../ExtLibs/boost/boost/  ../bin/dev/include/boost/boost/

# SFML headers
rsync -r -u --include=*.h --include=*.hpp --include=*.inc --include=*.inl --include=*/ --exclude=* ../../ExtLibs/SFML/include/  ../bin/dev/include/SFML/include/

# Extensions headers
rsync -r -u --include=*.h --include=*.hpp --include=*.inc --include=*.inl --include=*/ --exclude=* ../../Extensions/  ../bin/dev/Extensions/include/

# Extensions libs
rsync -r -u --include=*.a --include=*/ --exclude=* ../../Extensions/  ../bin/dev/Extensions/include/

echo 
echo -End of copy
echo 
echo -Done
