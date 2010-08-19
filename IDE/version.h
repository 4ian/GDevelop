#ifndef VERSION_H
#define VERSION_H

namespace AutoVersion{
	
	//Date Version Types
	static const char DATE[] = "18";
	static const char MONTH[] = "08";
	static const char YEAR[] = "2010";
	static const char UBUNTU_VERSION_STYLE[] = "10.08";
	
	//Software Status
	static const char STATUS[] = "Release";
	static const char STATUS_SHORT[] = "r";
	
	//Standard Version Type
	static const long MAJOR = 1;
	static const long MINOR = 4;
	static const long BUILD = 9920;
	static const long REVISION = 49975;
	
	//Miscellaneous Version Types
	static const long BUILDS_COUNT = 22709;
	#define RC_FILEVERSION 1,4,9920,49975
	#define RC_FILEVERSION_STRING "1, 4, 9920, 49975\0"
	static const char FULLVERSION_STRING[] = "1.4.9920.49975";
	
	//These values are to keep track of your versioning state, don't modify them.
	static const long BUILD_HISTORY = 0;
	

}
#endif //VERSION_H
