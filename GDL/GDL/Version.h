#ifndef VERSION_H
#define VERSION_H

namespace AutoVersion{
	
	//Date Version Types
	static const char DATE[] = "30";
	static const char MONTH[] = "04";
	static const char YEAR[] = "2011";
	static const char UBUNTU_VERSION_STYLE[] = "11.04";
	
	//Software Status
	static const char STATUS[] = "Release";
	static const char STATUS_SHORT[] = "r";
	
	//Standard Version Type
	static const long MAJOR = 1;
	static const long MINOR = 5;
	static const long BUILD = 10151;
	static const long REVISION = 51202;
	
	//Miscellaneous Version Types
	static const long BUILDS_COUNT = 20681;
	#define RC_FILEVERSION 1,5,10151,51202
	#define RC_FILEVERSION_STRING "1, 5, 10151, 51202\0"
	static const char FULLVERSION_STRING[] = "1.5.10151.51202";
	
	//These values are to keep track of your versioning state, don't modify them.
	static const long BUILD_HISTORY = 0;
	

}
#endif //VERSION_H
