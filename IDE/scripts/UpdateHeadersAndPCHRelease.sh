#!/bin/sh

echo 
echo Tool for updating include directory for Release target.
echo 

echo -Copying files...
# rm ../bin/release/include/*.* -r

# Game Develop C++ Implementation headers
rsync -r -u --include=*.h --include=*/ --exclude=* ../../GDL/  ../bin/release/include/GDL/

# Boost (shared_ptr and dependencies) headers
rsync -r -u --include=*.h --include=*.hpp --include=*.inc --include=*/ --exclude=* ../../ExtLibs/boost/boost/  ../bin/release/include/boost/boost/

# SFML headers
rsync -r -u --include=*.h --include=*.hpp --include=*.inc --include=*/ --exclude=* ../../ExtLibs/SFML/include/  ../bin/release/include/SFML/include/

# wxWidgets headers
rsync -r -u --include=*.h --include=*.hpp --include=*.inc --include=*/ --exclude=* ../../ExtLibs/wxwidgets/include/  ../bin/release/include/wxwidgets/include/

# wxWidgets headers
rsync -r -u --include=*.h --include=*.hpp --include=*.inc --include=*/ --exclude=* ../../ExtLibs/wxwidgets/lib/  ../bin/release/include/wxwidgets/lib/

# Extensions headers
rsync -r -u --include=*.h --include=*.hpp --include=*.inc --include=*/ --exclude=* ../../Extensions/  ../bin/release/Extensions/include/

# Extensions libs
rsync -r -u --include=*.a --include=*/ --exclude=* ../../Extensions/  ../bin/release/Extensions/include/

echo 
echo -End of copy
echo 
echo -Done
