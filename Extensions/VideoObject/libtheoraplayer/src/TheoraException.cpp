#include "TheoraException.h"
#include "TheoraUtil.h"
#include "TheoraVideoManager.h"
#include <stdio.h>

_TheoraGenericException::_TheoraGenericException(const std::string& errorText,std::string type,std::string file,int line)
{
    mErrText = errorText;
	int src=file.find("src");
	if (src >= 0) file=file.substr(src+4,1000);
	mLineNumber=line;
	mFile=file;
}


std::string _TheoraGenericException::repr()
{
	std::string text=getType();
	if (text != "") text+=": ";

	if (mFile != "") text+="["+mFile+":"+str(mLineNumber)+"] - ";

	return text + getErrorText();
}

void _TheoraGenericException::writeOutput()
{
	th_writelog("----------------\nException Error!\n\n"+repr()+"\n----------------");
}

