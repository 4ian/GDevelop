#ifndef VERSION_H
#define VERSION_H

namespace AutoVersion{
	
	//Date Version Types
	static const char DATE[] = "13";
	static const char MONTH[] = "06";
	static const char YEAR[] = "2010";
	static const char UBUNTU_VERSION_STYLE[] = "10.06";
	
	//Software Status
	static const char STATUS[] = "Alpha";
	static const char STATUS_SHORT[] = "a";
	
	//Standard Version Type
	static const long MAJOR = 1;
	static const long MINOR = 0;
	static const long BUILD = 144;
	static const long REVISION = 735;
	
	//Miscellaneous Version Types
	static const long BUILDS_COUNT = 647;
	#define RC_FILEVERSION 1,0,144,735
	#define RC_FILEVERSION_STRING "1, 0, 144, 735\0"
	static const char FULLVERSION_STRING[] = "1.0.144.735";
	
	//These values are to keep track of your versioning state, don't modify them.
	static const long BUILD_HISTORY = 0;
	

}
#endif //VERSION_H
