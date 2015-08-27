#!/bin/sh
#Execute this script to update the translations (.mo files)
#using the .po files that you downloaded.
if type msgcat 2>/dev/null; then
    MSGCAT=msgcat
    MSGFMT=msgfmt
else
	MSGCAT=$(find /usr -name "msgcat" -print -quit 2>/dev/null)
	MSGFMT=$(find /usr -name "msgfmt" -print -quit 2>/dev/null)
fi

if type $MSGCAT 2>/dev/null; then
	for D in `find . -type d`
	do
	    if [ $D != "./en_GB" -a $D != "." ]; then
			$MSGCAT $D/GD.po | $MSGFMT -o $D/GD.mo -
			$MSGCAT $D/wxstd.po | $MSGFMT -o $D/wxstd.mo -
		fi
	done
else
	echo "Unable to find msgcat/msgfmt on your system."
fi
