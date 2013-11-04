#ifndef VERSION_H
#define VERSION_H

namespace AutoVersion{
	
	//Date Version Types
	static const char GDCore_DATE[] = "4";
	static const char GDCore_MONTH[] = "11";
	static const char GDCore_YEAR[] = "2013";
	
	//Software Status
	static const char GDCore_STATUS[] = "Release";
	static const char GDCore_STATUS_SHORT[] = "r";
	
	//Standard Version Type
	static const long GDCore_MAJOR = 3;
	static const long GDCore_MINOR = 2;
	static const long GDCore_BUILD = 65;
	static const long GDCore_REVISION = 0;
	
	//Miscellaneous Version Types
	#define GDCore_RC_FILEVERSION 3,2,65,0
	#define GDCore_RC_FILEVERSION_STRING "3, 2, 65, 0\0"
	static const char GDCore_FULLVERSION_STRING[] = "3.2.65.0";
	
	//These values are to keep track of your versioning state, don't modify them.
	static const long GDCore_BUILD_HISTORY = 0;
	

}
#endif //VERSION_H
