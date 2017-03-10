GD_ROOT_DIR=../..
GD_BINARIES_OUTPUT_DIR=$GD_ROOT_DIR/Binaries/Output

cd ../electron-app
if ! [ -f "node_modules/.bin/build" ]; then
  echo "Please run npm install in electron-app folder"
  exit
fi

npm run build:app

rm -rf app/www
mkdir -p app/www
cp -r ../app/build/* app/www


node_modules/.bin/build --mac
mkdir -p $GD_BINARIES_OUTPUT_DIR/Release_Darwin/newIDE
cp -r "./dist/mac/GDevelop IDE.app" $GD_BINARIES_OUTPUT_DIR/Release_Darwin/newIDE

node_modules/.bin/build --win --ia32
mkdir -p $GD_BINARIES_OUTPUT_DIR/Release_Windows/newIDE
cp -r ./dist/win-ia32-unpacked/* $GD_BINARIES_OUTPUT_DIR/Release_Windows/newIDE

node_modules/.bin/build --linux tar.gz
mkdir -p $GD_BINARIES_OUTPUT_DIR/Release_Linux/newIDE
cp -r ./dist/linux/* $GD_BINARIES_OUTPUT_DIR/Release_Linux/newIDE
