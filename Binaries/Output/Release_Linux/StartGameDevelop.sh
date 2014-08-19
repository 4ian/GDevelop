#Execute this file to launch Game Develop
#If you can not launch GD, make sure that this file
#as well as 'GDIDE' have the right to be executed
#(Right click on file > Properties)

export LD_LIBRARY_PATH=.:$LD_LIBRARY_PATH
./GDIDE
if [ "$?" = "127" ]; then
	./GDIDE 1> ~/.Game\ Develop/errorMsgWhileLoadingGD.txt ~/.Game\ Develop/2> errorMsgWhileLoadingGD.txt
	errorMsg=$(cat < ~/.Game\ Develop/errorMsgWhileLoadingGD.txt)

	echo "$errorMsg" | grep "loading shared"
	if [ "$?" == "0" ]; then
		zenity --error --text="Unable to launch Game Develop! Here is the error message:\n\n <b>$errorMsg</b>\n\nMay be a <b>package is not installed</b>.\nCheck if you can find the package in the Software Center.";
	else
		zenity --error --text="Unable to launch Game Develop, a unknown error happened! Here is the full error message:\n\n <b>$errorMsg</b>\n\n.";
	fi;
fi;

