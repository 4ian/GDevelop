#!/bin/sh

echo 
echo Tool for updating include directory for debug target.
echo 

echo -Copying files...
# rm ../bin/debug/include/*.* -r

# Game Develop C++ Implementation headers
rsync -r -u --include=*.h --include=*/ --exclude=* ../../GDL/  ../bin/debug/include/GDL/

# Boost (shared_ptr and dependencies) headers
rsync -r -u --include=*.h --include=*.hpp --include=*.inc --include=*/ --exclude=* ../../ExtLibs/boost/boost/  ../bin/debug/include/boost/boost/

# SFML headers
rsync -r -u --include=*.h --include=*.hpp --include=*.inc --include=*/ --exclude=* ../../ExtLibs/SFML/include/  ../bin/debug/include/SFML/include/

# wxWidgets headers
rsync -r -u --include=*.h --include=*.hpp --include=*.inc --include=*/ --exclude=* ../../ExtLibs/wxwidgets/include/  ../bin/debug/include/wxwidgets/include/

# wxWidgets headers
rsync -r -u --include=*.h --include=*.hpp --include=*.inc --include=*/ --exclude=* ../../ExtLibs/wxwidgets/lib/  ../bin/debug/include/wxwidgets/lib/

# Extensions headers
rsync -r -u --include=*.h --include=*.hpp --include=*.inc --include=*/ --exclude=* ../../Extensions/  ../bin/debug/Extensions/include/

# Extensions libs
rsync -r -u --include=*.a --include=*/ --exclude=* ../../Extensions/  ../bin/debug/Extensions/include/

echo 
echo -End of copy
echo 
echo -Done
