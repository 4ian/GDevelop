#ifndef VERSION_H
#define VERSION_H

namespace AutoVersion{
	
	//Date Version Types
	static const char DATE[] = "12";
	static const char MONTH[] = "05";
	static const char YEAR[] = "2013";
	static const char UBUNTU_VERSION_STYLE[] = "13.05";
	
	//Software Status
	static const char STATUS[] = "Alpha";
	static const char STATUS_SHORT[] = "a";
	
	//Standard Version Type
	static const long MAJOR = 1;
	static const long MINOR = 0;
	static const long BUILD = 129;
	static const long REVISION = 643;
	
	//Miscellaneous Version Types
	static const long BUILDS_COUNT = 268;
	#define RC_FILEVERSION 1,0,129,643
	#define RC_FILEVERSION_STRING "1, 0, 129, 643\0"
	static const char FULLVERSION_STRING[] = "1.0.129.643";
	
	//These values are to keep track of your versioning state, don't modify them.
	static const long BUILD_HISTORY = 0;
	

}
#endif //VERSION_H
