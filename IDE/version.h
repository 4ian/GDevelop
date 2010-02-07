#ifndef VERSION_H
#define VERSION_H

namespace AutoVersion{
	
	//Date Version Types
	static const char DATE[] = "07";
	static const char MONTH[] = "02";
	static const char YEAR[] = "2010";
	static const double UBUNTU_VERSION_STYLE = 10.02;
	
	//Software Status
	static const char STATUS[] = "Release";
	static const char STATUS_SHORT[] = "r";
	
	//Standard Version Type
	static const long MAJOR = 1;
	static const long MINOR = 2;
	static const long BUILD = 8779;
	static const long REVISION = 44229;
	
	//Miscellaneous Version Types
	static const long BUILDS_COUNT = 19324;
	#define RC_FILEVERSION 1,2,8779,44229
	#define RC_FILEVERSION_STRING "1, 2, 8779, 44229\0"
	static const char FULLVERSION_STRING[] = "1.2.8779.44229";
	
	//These values are to keep track of your versioning state, don't modify them.
	static const long BUILD_HISTORY = 0;
	

}
#endif //VERSION_H
