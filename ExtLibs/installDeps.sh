#Experimental script to download dependencies, build and install them
#Only tested on Ubuntu

#Dependencies packages
sudo apt-get install libgtk-3-dev libwebkitgtk-3.0-dev cmake p7zip-full libopenal-dev libjpeg-dev libglew-dev libudev-dev libxrandr-dev libsndfile1-dev libglu1-mesa-dev libfreetype6-dev

#wxWidgets
wget https://sourceforge.net/projects/wxwindows/files/3.0.2/wxWidgets-3.0.2.tar.bz2 -O wxWidgets.tar.bz2
tar jxf wxWidgets.tar.bz2

cd wxWidgets-3.0.2
./configure
make
sudo make install
