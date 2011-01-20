
#if !defined(GD_NO_DYNAMIC_EXTENSIONS)
#if defined(GD_IDE_ONLY)

#ifndef COMPILERTOOLCHAINPATHMANAGER_H
#define COMPILERTOOLCHAINPATHMANAGER_H


class GD_API CompilerToolchainPathManager
{
    public:

        CompilerToolchainPathManager();
        virtual ~CompilerToolchainPathManager();

        std::string gccCompilerExecutablePath;
        std::string wxwidgetsIncludeDir;
        std::string wxwidgetsIncludeDir2;
        std::string wxwidgetsLibDir;
        std::string wxwidgetsLibDir2;
        std::string sfmlIncludeDir;
        std::string sfmlLibDir;
        std::string boostIncludeDir;
        std::string gdlIncludeDir;
        std::string gdlLibDir;
};

#endif // COMPILERTOOLCHAINPATHMANAGER_H

#endif
#endif
