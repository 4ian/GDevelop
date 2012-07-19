#ifndef VERSION_H
#define VERSION_H

namespace AutoVersion{
	
	//Date Version Types
	static const char DATE[] = "19";
	static const char MONTH[] = "07";
	static const char YEAR[] = "2012";
	static const char UBUNTU_VERSION_STYLE[] = "12.07";
	
	//Software Status
	static const char STATUS[] = "Release";
	static const char STATUS_SHORT[] = "r";
	
	//Standard Version Type
	static const long MAJOR = 2;
	static const long MINOR = 1;
	static const long BUILD = 10902;
	static const long REVISION = 54948;
	
	//Miscellaneous Version Types
	static const long BUILDS_COUNT = 21654;
	#define RC_FILEVERSION 2,1,10902,54948
	#define RC_FILEVERSION_STRING "2, 1, 10902, 54948\0"
	static const char FULLVERSION_STRING[] = "2.1.10902.54948";
	
	//These values are to keep track of your versioning state, don't modify them.
	static const long BUILD_HISTORY = 0;
	

}
#endif //VERSION_H
