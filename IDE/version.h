#ifndef VERSION_H
#define VERSION_H

namespace AutoVersion{
	
	//Date Version Types
	static const char DATE[] = "17";
	static const char MONTH[] = "08";
	static const char YEAR[] = "2011";
	static const char UBUNTU_VERSION_STYLE[] = "11.08";
	
	//Software Status
	static const char STATUS[] = "Release";
	static const char STATUS_SHORT[] = "r";
	
	//Standard Version Type
	static const long MAJOR = 1;
	static const long MINOR = 4;
	static const long BUILD = 11951;
	static const long REVISION = 60150;
	
	//Miscellaneous Version Types
	static const long BUILDS_COUNT = 30691;
	#define RC_FILEVERSION 1,4,11951,60150
	#define RC_FILEVERSION_STRING "1, 4, 11951, 60150\0"
	static const char FULLVERSION_STRING[] = "1.4.11951.60150";
	
	//These values are to keep track of your versioning state, don't modify them.
	static const long BUILD_HISTORY = 0;
	

}
#endif //VERSION_H
