#ifndef VERSION_H
#define VERSION_H

namespace AutoVersion{
	
	//Date Version Types
	static const char DATE[] = "24";
	static const char MONTH[] = "01";
	static const char YEAR[] = "2010";
	static const double UBUNTU_VERSION_STYLE = 10.01;
	
	//Software Status
	static const char STATUS[] = "Alpha";
	static const char STATUS_SHORT[] = "a";
	
	//Standard Version Type
	static const long MAJOR = 1;
	static const long MINOR = 0;
	static const long BUILD = 35;
	static const long REVISION = 184;
	
	//Miscellaneous Version Types
	static const long BUILDS_COUNT = 216;
	#define RC_FILEVERSION 1,0,35,184
	#define RC_FILEVERSION_STRING "1, 0, 35, 184\0"
	static const char FULLVERSION_STRING[] = "1.0.35.184";
	
	//These values are to keep track of your versioning state, don't modify them.
	static const long BUILD_HISTORY = 0;
	

}
#endif //VERSION_H
