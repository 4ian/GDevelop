#Execute this file to launch GDevelop
#If you can not launch GD, make sure that this file
#as well as 'GDIDE' have the right to be executed
#(Right click on file > Properties)

export LD_LIBRARY_PATH=.:$LD_LIBRARY_PATH
if [ -z ${1+x} ]; then
	./GDIDE
else
	./GDIDE $1
fi

if [ "$?" = "127" ]; then
	mkdir -p ~/.GDevelop
	./GDIDE 1> ~/.GDevelop/errorMsgWhileLoadingGD.txt 2> ~/.GDevelop/errorMsgWhileLoadingGD.txt
	
	errorMsg=$(cat < ~/.GDevelop/errorMsgWhileLoadingGD.txt)

	echo "$errorMsg" | grep "loading shared"
	if [ "$?" == "0" ]; then
		zenity --error --text="Unable to launch GDevelop! Here is the error message:\n\n <b>$errorMsg</b>\n\nMay be a <b>package is not installed</b>.\nCheck if you can find the package in the Software Center.";
	else
		zenity --error --text="Unable to launch GDevelop, a unknown error happened! Here is the full error message:\n\n <b>$errorMsg</b>\n\n.";
	fi;
fi;

