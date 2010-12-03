#ifndef VERSION_H
#define VERSION_H

namespace AutoVersion{
	
	//Date Version Types
	static const char DATE[] = "03";
	static const char MONTH[] = "12";
	static const char YEAR[] = "2010";
	static const char UBUNTU_VERSION_STYLE[] = "10.12";
	
	//Software Status
	static const char STATUS[] = "Release";
	static const char STATUS_SHORT[] = "r";
	
	//Standard Version Type
	static const long MAJOR = 1;
	static const long MINOR = 5;
	static const long BUILD = 9979;
	static const long REVISION = 50340;
	
	//Miscellaneous Version Types
	static const long BUILDS_COUNT = 20470;
	#define RC_FILEVERSION 1,5,9979,50340
	#define RC_FILEVERSION_STRING "1, 5, 9979, 50340\0"
	static const char FULLVERSION_STRING[] = "1.5.9979.50340";
	
	//These values are to keep track of your versioning state, don't modify them.
	static const long BUILD_HISTORY = 0;
	

}
#endif //VERSION_H
