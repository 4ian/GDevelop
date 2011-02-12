/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#if !defined(GD_NO_DYNAMIC_EXTENSIONS)
#if defined(GD_IDE_ONLY)

#ifndef COMPILERTOOLCHAINPATHMANAGER_H
#define COMPILERTOOLCHAINPATHMANAGER_H

/**
 * Give access to compilers tools and libraries paths.
 */
class GD_API CompilerToolchainPathManager
{
    public:

        /**
         * Constructor automatically initialize paths with paths stored with wxConfig.
         */
        CompilerToolchainPathManager();
        virtual ~CompilerToolchainPathManager();

        /**
         * Return false is a path seems to be incorrect.
         * \param More information is inserted in this string
         */
        bool AllPathsAreValid(std::string & report) const;

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
