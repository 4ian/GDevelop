#Get the source directory, or copy from a default directory
SOURCE=../../Binaries/Output/
if [ ! $# -eq 0 ]; then
	SOURCE=$1
fi

rsync -r -u --include=*.png --include=*/ --exclude=* "$SOURCE"/Release_Windows/CppPlatform/ ../app/public/CppPlatform/
rsync -r -u --include=*.png --include=*/ --exclude=* "$SOURCE"/Release_Windows/JsPlatform/ ../app/public/JsPlatform/
rsync -r -u --include=*.png --include=*/ --exclude=* "$SOURCE"/Release_Windows/res/ ../app/public/res/
