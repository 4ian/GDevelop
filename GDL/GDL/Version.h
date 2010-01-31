#ifndef VERSION_H
#define VERSION_H

namespace AutoVersion{
	
	//Date Version Types
	static const char DATE[] = "31";
	static const char MONTH[] = "01";
	static const char YEAR[] = "2010";
	static const double UBUNTU_VERSION_STYLE = 10.01;
	
	//Software Status
	static const char STATUS[] = "Release";
	static const char STATUS_SHORT[] = "r";
	
	//Standard Version Type
	static const long MAJOR = 1;
	static const long MINOR = 2;
	static const long BUILD = 8661;
	static const long REVISION = 43626;
	
	//Miscellaneous Version Types
	static const long BUILDS_COUNT = 18759;
	#define RC_FILEVERSION 1,2,8661,43626
	#define RC_FILEVERSION_STRING "1, 2, 8661, 43626\0"
	static const char FULLVERSION_STRING[] = "1.2.8661.43626";
	
	//These values are to keep track of your versioning state, don't modify them.
	static const long BUILD_HISTORY = 0;
	

}
#endif //VERSION_H
