#ifndef VERSION_H
#define VERSION_H

namespace AutoVersion{
	
	//Date Version Types
	static const char DATE[] = "31";
	static const char MONTH[] = "03";
	static const char YEAR[] = "2013";
	static const char UBUNTU_VERSION_STYLE[] = "13.03";
	
	//Software Status
	static const char STATUS[] = "Release";
	static const char STATUS_SHORT[] = "r";
	
	//Standard Version Type
	static const long MAJOR = 2;
	static const long MINOR = 2;
	static const long BUILD = 11143;
	static const long REVISION = 56216;
	
	//Miscellaneous Version Types
	static const long BUILDS_COUNT = 22024;
	#define RC_FILEVERSION 2,2,11143,56216
	#define RC_FILEVERSION_STRING "2, 2, 11143, 56216\0"
	static const char FULLVERSION_STRING[] = "2.2.11143.56216";
	
	//These values are to keep track of your versioning state, don't modify them.
	static const long BUILD_HISTORY = 0;
	

}
#endif //VERSION_H
