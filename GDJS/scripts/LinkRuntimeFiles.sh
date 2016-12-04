# Make links to the GDJS runtime files and extensions in the specified directory.
# Useful for working on the game engine:
# - First export your game/preview in a directory
# - Then launch ./LinkRuntimeFiles /path/to/the/export/dir
# - You can then modify the game engine files and test your changes directly in the game

if [ $# -eq 0 ]; then
	echo "You must specify the directory where the symbolic links should be created"
  exit
fi

DESTINATION=$1
RUNTIME_SOURCE=$(pwd)/../Runtime

#Instead of removing directories, keep a backup of them in case
rm_destination_with_BACKUP() {
  if [ -d $DESTINATION/$1 ]; then
    if [ ! -d $DESTINATION/BACKUP-$1 ]; then
      mv -f $DESTINATION/$1 $DESTINATION/BACKUP-$1
    fi
    rm -rf $DESTINATION/$1
  fi
}

#Remove all sub-directories that are going to be replaced by links
for D in `find $RUNTIME_SOURCE -type d -depth 1`
do
  if [ $D != $RUNTIME_SOURCE ]; then
    NAME=`basename $D`
    rm_destination_with_BACKUP $NAME
  fi
done
rm_destination_with_BACKUP "Extensions"

#Link all runtime files and directories
ln -s -f -F $RUNTIME_SOURCE/* $DESTINATION

#Link Extensions directory
ln -s -f -F $(pwd)/../../Extensions $DESTINATION
