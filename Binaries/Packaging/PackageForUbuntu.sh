#!/bin/sh

echo 'Started the packaging process, using binaries in Binaries/Output/R'
# Copy files from Release
sudo cp ../Output/Release/* -R debian-package/opt/game-develop

# Make some tasks to ensure that the package is correct.
sudo chmod 0755 -R debian-package/opt/game-develop/*
sudo chown -R root:root debian-package
cd debian-package
sudo rm debian
sudo ln -s DEBIAN/ debian
sudo dh_fixperms
cd ..
if [ ! -d ../Releases ]; then
  mkdir ../Releases
fi;

#Build it.
dpkg -b debian-package ../Releases/game-develop_3.x.xx_amd64.deb
