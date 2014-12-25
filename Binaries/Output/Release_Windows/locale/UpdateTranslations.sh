#!/bin/sh
#Execute this script to update the translations (.mo files)
#using the .po files that you downloaded.
for D in `find . -type d`
do
    if [ $D != "./en_GB" -a $D != "." ]; then
		msgcat $D/GD.po | msgfmt -o $D/GD.mo -
	fi
done
