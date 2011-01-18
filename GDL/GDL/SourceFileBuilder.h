/**
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_DYNAMIC_EXTENSIONS)
#if defined(GD_IDE_ONLY)

#ifndef SOURCEFILEBUILDER_H
#define SOURCEFILEBUILDER_H

#include "GDL/CompilerToolchainPathManager.h"
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

        /**
         * Return a vector of string containing errors messages.
         */
        std::vector<std::string > GetErrors() const { return errors; };

    private:

        bool BuildSourceFile(std::string filename);
        bool LinkSourceFiles(std::vector<std::string> files);

        Game & game;

        std::string wxwidgetsLibs;
        std::string wxwidgetsDefines;
        std::string sfmlLibs;
        std::string sfmlDefines;
        std::string boostDefines;
        std::string gdlLibs;
        std::string gdlDefines;
        std::string osLibs;
        std::string osDefines;

        std::vector<std::string > errors;

        CompilerToolchainPathManager pathManager;
};

#endif // SOURCEFILEBUILDER_H

#endif
#endif
