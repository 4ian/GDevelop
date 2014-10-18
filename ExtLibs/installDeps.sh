#Experimental script to download dependencies, build and install them
#Only test on Ubuntu

#CMake
sudo apt-get install cmake

#7zip
sudo apt-get install p7zip-full

#SFML
sudo apt-get install libopenal-dev
sudo apt-get install libjpeg-dev
sudo apt-get install libglew-dev
sudo apt-get install libudev-dev
sudo apt-get install libxrandr-dev
sudo apt-get install libsndfile1-dev
sudo apt-get install libglu1-mesa-dev
sudo apt-get install libfreetype6-dev

wget http://www.compilgames.net/code/GameDevelopSDK/SFML.7z
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
wget http://www.compilgames.net/code/GameDevelopSDK/boost_1_55_0.7z
7za x boost_1_55_0.7z
mv boost_1_55_0 boost

#wxWidgets
sudo apt-get install libgtk-3-dev
sudo apt-get install libwebkitgtk-3.0-dev

wget https://sourceforge.net/projects/wxwindows/files/3.0.1/wxWidgets-3.0.1.tar.bz2
tar jxf wxWidgets-3.0.1.tar.bz2

cd wxWidgets-3.0.1
./configure --enable-ribbon --enable-webview
make
sudo make install
