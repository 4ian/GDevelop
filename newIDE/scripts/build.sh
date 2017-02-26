cd ..
npm run build:app

cd electron-app
rm -rf app/www
mkdir -p app/www
cp -r ../app/build/* app/www

node_modules/.bin/build --mac
node_modules/.bin/build --win --ia32
node_modules/.bin/build --linux tar.gz
