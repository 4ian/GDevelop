if [ -f "../../Binaries/Output/libGD.js/Release/libGD.js" ]; then
  cp ../../Binaries/Output/libGD.js/Release/libGD.js ../app/public
else
  echo "Unable to find libGD.js, make sure that libGD.js is compiled in Binaries/Output/libGD.js/Release"
fi
