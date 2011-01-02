#ifndef VERSION_H
#define VERSION_H

namespace AutoVersion{
	
	//Date Version Types
	static const char DATE[] = "01";
	static const char MONTH[] = "01";
	static const char YEAR[] = "2011";
	static const char UBUNTU_VERSION_STYLE[] = "11.01";
	
	//Software Status
	static const char STATUS[] = "Release";
	static const char STATUS_SHORT[] = "r";
	
	//Standard Version Type
	static const long MAJOR = 1;
	static const long MINOR = 5;
	static const long BUILD = 10028;
	static const long REVISION = 50581;
	
	//Miscellaneous Version Types
	static const long BUILDS_COUNT = 20529;
	#define RC_FILEVERSION 1,5,10028,50581
	#define RC_FILEVERSION_STRING "1, 5, 10028, 50581\0"
	static const char FULLVERSION_STRING[] = "1.5.10028.50581";
	
	//These values are to keep track of your versioning state, don't modify them.
	static const long BUILD_HISTORY = 0;
	

}
#endif //VERSION_H
