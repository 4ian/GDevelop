set IMAGEMAGICKMOGRIFY="C:\Program Files\ImageMagick-6.9.0-Q16\mogrify.exe"
set CURDIR=%CD%

cd ..\..\Binaries\Output\Release_Windows\

for /R %%U in (*.png) do %IMAGEMAGICKMOGRIFY% -strip -depth 24 "%%U"

chdir /d %CURDIR%