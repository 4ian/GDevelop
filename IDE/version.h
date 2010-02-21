#ifndef VERSION_H
#define VERSION_H

namespace AutoVersion{
	
	//Date Version Types
	static const char DATE[] = "20";
	static const char MONTH[] = "02";
	static const char YEAR[] = "2010";
	static const double UBUNTU_VERSION_STYLE = 10.02;
	
	//Software Status
	static const char STATUS[] = "Release";
	static const char STATUS_SHORT[] = "r";
	
	//Standard Version Type
	static const long MAJOR = 1;
	static const long MINOR = 2;
	static const long BUILD = 8980;
	static const long REVISION = 45218;
	
	//Miscellaneous Version Types
	static const long BUILDS_COUNT = 19778;
	#define RC_FILEVERSION 1,2,8980,45218
	#define RC_FILEVERSION_STRING "1, 2, 8980, 45218\0"
	static const char FULLVERSION_STRING[] = "1.2.8980.45218";
	
	//These values are to keep track of your versioning state, don't modify them.
	static const long BUILD_HISTORY = 0;
	

}
#endif //VERSION_H
