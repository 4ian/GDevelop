#ifndef VERSION_H
#define VERSION_H

namespace AutoVersion{
	
	//Date Version Types
	static const char DATE[] = "17";
	static const char MONTH[] = "09";
	static const char YEAR[] = "2011";
	static const char UBUNTU_VERSION_STYLE[] = "11.09";
	
	//Software Status
	static const char STATUS[] = "Release";
	static const char STATUS_SHORT[] = "r";
	
	//Standard Version Type
	static const long MAJOR = 2;
	static const long MINOR = 0;
	static const long BUILD = 10505;
	static const long REVISION = 52991;
	
	//Miscellaneous Version Types
	static const long BUILDS_COUNT = 21093;
	#define RC_FILEVERSION 2,0,10505,52991
	#define RC_FILEVERSION_STRING "2, 0, 10505, 52991\0"
	static const char FULLVERSION_STRING[] = "2.0.10505.52991";
	
	//These values are to keep track of your versioning state, don't modify them.
	static const long BUILD_HISTORY = 0;
	

}
#endif //VERSION_H
