#ifndef VERSION_H
#define VERSION_H

namespace AutoVersion{
	
	//Date Version Types
	static const char DATE[] = "12";
	static const char MONTH[] = "03";
	static const char YEAR[] = "2010";
	static const double UBUNTU_VERSION_STYLE = 10.03;
	
	//Software Status
	static const char STATUS[] = "Release";
	static const char STATUS_SHORT[] = "r";
	
	//Standard Version Type
	static const long MAJOR = 1;
	static const long MINOR = 3;
	static const long BUILD = 8865;
	static const long REVISION = 44635;
	
	//Miscellaneous Version Types
	static const long BUILDS_COUNT = 19032;
	#define RC_FILEVERSION 1,3,8865,44635
	#define RC_FILEVERSION_STRING "1, 3, 8865, 44635\0"
	static const char FULLVERSION_STRING[] = "1.3.8865.44635";
	
	//These values are to keep track of your versioning state, don't modify them.
	static const long BUILD_HISTORY = 0;
	

}
#endif //VERSION_H
