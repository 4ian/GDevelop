#ifndef VERSION_H
#define VERSION_H

namespace AutoVersion{
	
	//Date Version Types
	static const char DATE[] = "16";
	static const char MONTH[] = "08";
	static const char YEAR[] = "2011";
	static const char UBUNTU_VERSION_STYLE[] = "11.08";
	
	//Software Status
	static const char STATUS[] = "Beta";
	static const char STATUS_SHORT[] = "b";
	
	//Standard Version Type
	static const long MAJOR = 2;
	static const long MINOR = 0;
	static const long BUILD = 10489;
	static const long REVISION = 52908;
	
	//Miscellaneous Version Types
	static const long BUILDS_COUNT = 21078;
	#define RC_FILEVERSION 2,0,10489,52908
	#define RC_FILEVERSION_STRING "2, 0, 10489, 52908\0"
	static const char FULLVERSION_STRING[] = "2.0.10489.52908";
	
	//These values are to keep track of your versioning state, don't modify them.
	static const long BUILD_HISTORY = 0;
	

}
#endif //VERSION_H
