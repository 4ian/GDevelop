#ifndef VERSION_H
#define VERSION_H

namespace AutoVersion{
	
	//Date Version Types
	static const char DATE[] = "19";
	static const char MONTH[] = "03";
	static const char YEAR[] = "2011";
	static const char UBUNTU_VERSION_STYLE[] = "11.03";
	
	//Software Status
	static const char STATUS[] = "Release";
	static const char STATUS_SHORT[] = "r";
	
	//Standard Version Type
	static const long MAJOR = 1;
	static const long MINOR = 5;
	static const long BUILD = 10139;
	static const long REVISION = 51138;
	
	//Miscellaneous Version Types
	static const long BUILDS_COUNT = 20669;
	#define RC_FILEVERSION 1,5,10139,51138
	#define RC_FILEVERSION_STRING "1, 5, 10139, 51138\0"
	static const char FULLVERSION_STRING[] = "1.5.10139.51138";
	
	//These values are to keep track of your versioning state, don't modify them.
	static const long BUILD_HISTORY = 0;
	

}
#endif //VERSION_H
