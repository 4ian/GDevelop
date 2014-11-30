#Experimental script to download dependencies, build and install them
#Only test on Ubuntu

#Dependencies packages
sudo apt-get install libgtk-3-dev libwebkitgtk-3.0-dev cmake p7zip-full libopenal-dev libjpeg-dev libglew-dev libudev-dev libxrandr-dev libsndfile1-dev libglu1-mesa-dev libfreetype6-dev

#SFML
wget http://www.compilgames.net/code/GameDevelopSDK/SFML.7z -O SFML.7z
7za x SFML.7z

cd SFML
mkdir build-linux
cd build-linux
cmake ..
make
cd ..
cd ..

mkdir ../Binaries/Output/Release_Linux
cp SFML/build-linux/lib/libsfml-audio.so.2.1 SFML/build-linux/lib/libsfml-network.so.2.1 SFML/build-linux/lib/libsfml-graphics.so.2.1 SFML/build-linux/lib/libsfml-window.so.2.1 SFML/build-linux/lib/libsfml-system.so.2.1 ../Binaries/Output/Release_Linux/
mv ../Binaries/Output/Release_Linux/libsfml-audio.so.2.1 ../Binaries/Output/Release_Linux/libsfml-audio.so.2
mv ../Binaries/Output/Release_Linux/libsfml-network.so.2.1 ../Binaries/Output/Release_Linux/libsfml-network.so.2
mv ../Binaries/Output/Release_Linux/libsfml-graphics.so.2.1 ../Binaries/Output/Release_Linux/libsfml-graphics.so.2
mv ../Binaries/Output/Release_Linux/libsfml-window.so.2.1 ../Binaries/Output/Release_Linux/libsfml-window.so.2
mv ../Binaries/Output/Release_Linux/libsfml-system.so.2.1 ../Binaries/Output/Release_Linux/libsfml-system.so.2

#Boost
wget http://www.compilgames.net/code/GameDevelopSDK/boost_1_55_0.7z -O boost.7z
7za x boost.7z
mv boost_1_55_0 boost

#wxWidgets
wget https://sourceforge.net/projects/wxwindows/files/3.0.2/wxWidgets-3.0.2.tar.bz2 -O wxWidgets.tar.bz2
tar jxf wxWidgets.tar.bz2

cd wxWidgets-3.0.2
./configure --enable-ribbon --enable-webview
make
sudo make install
