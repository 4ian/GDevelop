#ifndef VERSION_H
#define VERSION_H

namespace AutoVersion{
	
	//Date Version Types
	static const char DATE[] = "14";
	static const char MONTH[] = "04";
	static const char YEAR[] = "2013";
	static const char UBUNTU_VERSION_STYLE[] = "13.04";
	
	//Software Status
	static const char STATUS[] = "Beta";
	static const char STATUS_SHORT[] = "b";
	
	//Standard Version Type
	static const long MAJOR = 3;
	static const long MINOR = 0;
	static const long BUILD = 11297;
	static const long REVISION = 57008;
	
	//Miscellaneous Version Types
	static const long BUILDS_COUNT = 22204;
	#define RC_FILEVERSION 3,0,11297,57008
	#define RC_FILEVERSION_STRING "3, 0, 11297, 57008\0"
	static const char FULLVERSION_STRING[] = "3.0.11297.57008";
	
	//These values are to keep track of your versioning state, don't modify them.
	static const long BUILD_HISTORY = 0;
	

}
#endif //VERSION_H
