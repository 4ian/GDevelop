#ifndef GDCORE_VERSION_H
#define GDCORE_VERSION_H

namespace AutoVersion{
	
	//Date Version Types
	static const char GDCore_DATE[] = "23";
	static const char GDCore_MONTH[] = "04";
	static const char GDCore_YEAR[] = "2013";
	static const char GDCore_UBUNTU_VERSION_STYLE[] = "13.04";
	
	//Software Status
	static const char GDCore_STATUS[] = "Beta";
	static const char GDCore_STATUS_SHORT[] = "b";
	
	//Standard Version Type
	static const long GDCore_MAJOR = 3;
	static const long GDCore_MINOR = 0;
	static const long GDCore_BUILD = 11297;
	static const long GDCore_REVISION = 57008;
	
	//Miscellaneous Version Types
	static const long GDCore_BUILDS_COUNT = 22266;
	#define GDCore_RC_FILEVERSION 3,0,11297,57008
	#define GDCore_RC_FILEVERSION_STRING "3, 0, 11297, 57008\0"
	static const char GDCore_FULLVERSION_STRING[] = "3.0.11297.57008";
	
	//These values are to keep track of your versioning state, don't modify them.
	static const long GDCore_BUILD_HISTORY = 0;
	

}
#endif //GDCORE_VERSION_H
