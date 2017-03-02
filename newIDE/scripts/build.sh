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
node_modules/.bin/build --win --ia32
node_modules/.bin/build --linux tar.gz
