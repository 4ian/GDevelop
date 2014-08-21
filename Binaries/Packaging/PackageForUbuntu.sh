#!/bin/sh

echo 'Started the packaging process, using binaries in Binaries/Output/Release_Linux'
# Copy files from Release
sudo mkdir -p debian-package/opt/game-develop
sudo cp ../Output/Release_Linux/* -R debian-package/opt/game-develop

# Make some tasks to ensure that the package is correct.
sudo chmod 0755 -R debian-package/opt/game-develop/*
sudo chown -R root:root debian-package
sudo chmod +x debian-package/usr/bin/game-develop
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

echo 'Done. Package should be at Binaries/Releases/game-develop_3.x.xx_amd64.deb'
