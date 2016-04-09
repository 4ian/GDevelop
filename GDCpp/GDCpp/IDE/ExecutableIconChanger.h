
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)

#ifndef EXECUTABLEICONCHANGER_H
#define EXECUTABLEICONCHANGER_H

#include <string>
#include "GDCpp/Runtime/String.h"

#if defined(WINDOWS)
struct ICONHEADER;
struct ICONIMAGE;
struct GRPICONHEADER;
#endif


class GD_API ExecutableIconChanger
{
    public:
        static bool ChangeWindowsExecutableIcon(gd::String exeFile, gd::String iconFile);

    private:
        #if defined(WINDOWS)
        static bool LoadIcon(gd::String iconFile, ICONHEADER*& pHeader, ICONIMAGE**& pIcons, GRPICONHEADER*& pGrpHeader);
        #endif
};

#endif // EXECUTABLEICONCHANGER_H
#endif
