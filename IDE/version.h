#ifndef VERSION_H
#define VERSION_H

namespace AutoVersion{
	
	//Date Version Types
	static const char DATE[] = "04";
	static const char MONTH[] = "10";
	static const char YEAR[] = "2011";
	static const char UBUNTU_VERSION_STYLE[] = "11.10";
	
	//Software Status
	static const char STATUS[] = "Release";
	static const char STATUS_SHORT[] = "r";
	
	//Standard Version Type
	static const long MAJOR = 1;
	static const long MINOR = 4;
	static const long BUILD = 12134;
	static const long REVISION = 61047;
	
	//Miscellaneous Version Types
	static const long BUILDS_COUNT = 31486;
	#define RC_FILEVERSION 1,4,12134,61047
	#define RC_FILEVERSION_STRING "1, 4, 12134, 61047\0"
	static const char FULLVERSION_STRING[] = "1.4.12134.61047";
	
	//These values are to keep track of your versioning state, don't modify them.
	static const long BUILD_HISTORY = 0;
	

}
#endif //VERSION_H
