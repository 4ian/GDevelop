#! /bin/sh

#Copie des headers
sudo mkdir -p /usr/share/Game\ Develop/Extensions/include/AdvancedXML
sudo cp /home/victor/Dev/GDLSDK/Extensions/Advanced-XML/src/*.h /usr/share/Game\ Develop/Extensions/include/AdvancedXML
sudo chmod -R a=rwx /usr/share/Game\ Develop/Extensions/include/AdvancedXML

#Copie des binaires
sudo cp /home/victor/Dev/GDLSDK/IDE/bin/release/Extensions/AdvancedXML.xgdle /usr/share/Game\ Develop/Extensions
sudo cp /home/victor/Dev/GDLSDK/Runtime/bin/release/AdvancedXML.xgdl /usr/share/Game\ Develop/Extensions
sudo chmod a=rwx /usr/share/Game\ Develop/Extensions/AdvancedXML.xgdle
sudo chmod a=rwx /usr/share/Game\ Develop/Extensions/AdvancedXML.xgdl

#Copie des ressources
sudo mkdir -p /usr/share/Game\ Develop/res/AdvancedXML
sudo cp /home/victor/Dev/GDLSDK/Extensions/Advanced-XML/res/*.* /usr/share/Game\ Develop/res/AdvancedXML
sudo chmod -R a=rwx /usr/share/Game\ Develop/res/AdvancedXML
