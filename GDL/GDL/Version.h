#ifndef VERSION_H
#define VERSION_H

namespace AutoVersion{
	
	//Date Version Types
	static const char DATE[] = "07";
	static const char MONTH[] = "07";
	static const char YEAR[] = "2011";
	static const char UBUNTU_VERSION_STYLE[] = "11.07";
	
	//Software Status
	static const char STATUS[] = "Release";
	static const char STATUS_SHORT[] = "r";
	
	//Standard Version Type
	static const long MAJOR = 2;
	static const long MINOR = 0;
	static const long BUILD = 10352;
	static const long REVISION = 52215;
	
	//Miscellaneous Version Types
	static const long BUILDS_COUNT = 20906;
	#define RC_FILEVERSION 2,0,10352,52215
	#define RC_FILEVERSION_STRING "2, 0, 10352, 52215\0"
	static const char FULLVERSION_STRING[] = "2.0.10352.52215";
	
	//These values are to keep track of your versioning state, don't modify them.
	static const long BUILD_HISTORY = 0;
	

}
#endif //VERSION_H
