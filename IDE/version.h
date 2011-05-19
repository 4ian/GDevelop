#ifndef VERSION_H
#define VERSION_H

namespace AutoVersion{
	
	//Date Version Types
	static const char DATE[] = "19";
	static const char MONTH[] = "05";
	static const char YEAR[] = "2011";
	static const char UBUNTU_VERSION_STYLE[] = "11.05";
	
	//Software Status
	static const char STATUS[] = "Release";
	static const char STATUS_SHORT[] = "r";
	
	//Standard Version Type
	static const long MAJOR = 1;
	static const long MINOR = 4;
	static const long BUILD = 11295;
	static const long REVISION = 56846;
	
	//Miscellaneous Version Types
	static const long BUILDS_COUNT = 27159;
	#define RC_FILEVERSION 1,4,11295,56846
	#define RC_FILEVERSION_STRING "1, 4, 11295, 56846\0"
	static const char FULLVERSION_STRING[] = "1.4.11295.56846";
	
	//These values are to keep track of your versioning state, don't modify them.
	static const long BUILD_HISTORY = 0;
	

}
#endif //VERSION_H
