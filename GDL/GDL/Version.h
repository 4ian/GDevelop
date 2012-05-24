#ifndef VERSION_H
#define VERSION_H

namespace AutoVersion{
	
	//Date Version Types
	static const char DATE[] = "23";
	static const char MONTH[] = "05";
	static const char YEAR[] = "2012";
	static const char UBUNTU_VERSION_STYLE[] = "12.05";
	
	//Software Status
	static const char STATUS[] = "Release";
	static const char STATUS_SHORT[] = "r";
	
	//Standard Version Type
	static const long MAJOR = 2;
	static const long MINOR = 1;
	static const long BUILD = 10861;
	static const long REVISION = 54756;
	
	//Miscellaneous Version Types
	static const long BUILDS_COUNT = 21600;
	#define RC_FILEVERSION 2,1,10861,54756
	#define RC_FILEVERSION_STRING "2, 1, 10861, 54756\0"
	static const char FULLVERSION_STRING[] = "2.1.10861.54756";
	
	//These values are to keep track of your versioning state, don't modify them.
	static const long BUILD_HISTORY = 0;
	

}
#endif //VERSION_H
