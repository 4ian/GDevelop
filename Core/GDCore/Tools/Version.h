#ifndef GDCORE_VERSION_H
#define GDCORE_VERSION_H

namespace AutoVersion{

	//Date Version Types
	static const char GDCore_DATE[] = "01";
	static const char GDCore_MONTH[] = "08";
	static const char GDCore_YEAR[] = "2016";

	//Software Status
	static const char GDCore_STATUS[] = "Release";
	static const char GDCore_STATUS_SHORT[] = "r";

	//Standard Version Type
	static const long GDCore_MAJOR = 4;
	static const long GDCore_MINOR = 0;
	static const long GDCore_BUILD = 92;
	static const long GDCore_REVISION = 1;

	//Miscellaneous Version Types
	#define GDCore_RC_FILEVERSION 4,0,92,1
	#define GDCore_RC_FILEVERSION_STRING "4, 0, 92, 1\0"
	static const char GDCore_FULLVERSION_STRING[] = "4.0.92.1";
}
#endif //GDCORE_VERSION_H
