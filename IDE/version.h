#ifndef VERSION_H
#define VERSION_H

namespace AutoVersion{
	
	//Date Version Types
	static const char DATE[] = "26";
	static const char MONTH[] = "10";
	static const char YEAR[] = "2011";
	static const char UBUNTU_VERSION_STYLE[] = "11.10";
	
	//Software Status
	static const char STATUS[] = "Release";
	static const char STATUS_SHORT[] = "r";
	
	//Standard Version Type
	static const long MAJOR = 1;
	static const long MINOR = 4;
	static const long BUILD = 12150;
	static const long REVISION = 61126;
	
	//Miscellaneous Version Types
	static const long BUILDS_COUNT = 31716;
	#define RC_FILEVERSION 1,4,12150,61126
	#define RC_FILEVERSION_STRING "1, 4, 12150, 61126\0"
	static const char FULLVERSION_STRING[] = "1.4.12150.61126";
	
	//These values are to keep track of your versioning state, don't modify them.
	static const long BUILD_HISTORY = 0;
	

}
#endif //VERSION_H
