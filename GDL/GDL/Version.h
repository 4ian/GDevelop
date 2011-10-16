#ifndef VERSION_H
#define VERSION_H

namespace AutoVersion{
	
	//Date Version Types
	static const char DATE[] = "09";
	static const char MONTH[] = "10";
	static const char YEAR[] = "2011";
	static const char UBUNTU_VERSION_STYLE[] = "11.10";
	
	//Software Status
	static const char STATUS[] = "Release";
	static const char STATUS_SHORT[] = "r";
	
	//Standard Version Type
	static const long MAJOR = 2;
	static const long MINOR = 0;
	static const long BUILD = 10535;
	static const long REVISION = 53148;
	
	//Miscellaneous Version Types
	static const long BUILDS_COUNT = 21121;
	#define RC_FILEVERSION 2,0,10535,53148
	#define RC_FILEVERSION_STRING "2, 0, 10535, 53148\0"
	static const char FULLVERSION_STRING[] = "2.0.10535.53148";
	
	//These values are to keep track of your versioning state, don't modify them.
	static const long BUILD_HISTORY = 0;
	

}
#endif //VERSION_H
