/**
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_DYNAMIC_EXTENSIONS)
#if defined(GD_IDE_ONLY)

#ifndef SOURCEFILEBUILDER_H
#define SOURCEFILEBUILDER_H

class Game;

/**
 * Manage build of sources file of a project.
 */
class GD_API SourceFileBuilder
{
    public:
        SourceFileBuilder(Game & game_);
        virtual ~SourceFileBuilder() {};

        /**
         * Build game external sources files.
         * \return true if build was successful
         */
        bool BuildSourceFiles();

    private:

        bool BuildSourceFile(std::string filename, std::string & compilerOutput);
        bool LinkSourceFiles(std::vector<std::string> files, std::string & compilerOutput);

        Game & game;

        static std::string gccCompilerExecutablePath;
        static std::string wxwidgetsIncludeDir;
        static std::string wxwidgetsIncludeDir2;
        static std::string wxwidgetsLibDir;
        static std::string wxwidgetsLibDir2;
        static std::string wxwidgetsLibs;
        static std::string wxwidgetsDefines;
        static std::string sfmlIncludeDir;
        static std::string sfmlLibDir;
        static std::string sfmlLibs;
        static std::string sfmlDefines;
        static std::string boostIncludeDir;
        static std::string boostDefines;
        static std::string gdlIncludeDir;
        static std::string gdlLibDir;
        static std::string gdlLibs;
        static std::string gdlDefines;
        static std::string osLibs;
        static std::string osDefines;
};

#endif // SOURCEFILEBUILDER_H

#endif
#endif
