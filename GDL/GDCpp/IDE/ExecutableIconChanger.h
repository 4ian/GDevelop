#if defined(GD_IDE_ONLY)

#ifndef EXECUTABLEICONCHANGER_H
#define EXECUTABLEICONCHANGER_H

#include <string>
#if defined(WINDOWS)
struct ICONHEADER;
struct ICONIMAGE;
struct GRPICONHEADER;
#endif


class GD_API ExecutableIconChanger
{
    public:
        static bool ChangeWindowsExecutableIcon(std::string exeFile, std::string iconFile);

    private:
        #if defined(WINDOWS)
        static bool LoadIcon(std::string iconFile, ICONHEADER*& pHeader, ICONIMAGE**& pIcons, GRPICONHEADER*& pGrpHeader);
        #endif
};

#endif // EXECUTABLEICONCHANGER_H
#endif

