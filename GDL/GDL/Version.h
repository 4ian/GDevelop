#ifndef VERSION_H
#define VERSION_H

namespace AutoVersion{
	
	//Date Version Types
	static const char DATE[] = "17";
	static const char MONTH[] = "03";
	static const char YEAR[] = "2012";
	static const char UBUNTU_VERSION_STYLE[] = "12.03";
	
	//Software Status
	static const char STATUS[] = "Release";
	static const char STATUS_SHORT[] = "r";
	
	//Standard Version Type
	static const long MAJOR = 2;
	static const long MINOR = 1;
	static const long BUILD = 10724;
	static const long REVISION = 54064;
	
	//Miscellaneous Version Types
	static const long BUILDS_COUNT = 21342;
	#define RC_FILEVERSION 2,1,10724,54064
	#define RC_FILEVERSION_STRING "2, 1, 10724, 54064\0"
	static const char FULLVERSION_STRING[] = "2.1.10724.54064";
	
	//These values are to keep track of your versioning state, don't modify them.
	static const long BUILD_HISTORY = 0;
	

}
#endif //VERSION_H
