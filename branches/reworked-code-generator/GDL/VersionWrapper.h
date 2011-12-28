/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef VERSIONWRAPPER_H
#define VERSIONWRAPPER_H
#include <string>

/**
 * \brief Used to get information about Game Develop Library version.
 */
class GD_API GDLVersionWrapper
{
    public:

        /**
         * Get Game Develop library Major version number
         */
        static int Major();

        /**
         * Get Game Develop library Minor version number
         */
        static int Minor();

        /**
         * Get Game Develop library Build version number
         */
        static int Build();

        /**
         * Get Game Develop library Revision version number
         */
        static int Revision();

        /**
         * Get a full string containing version.
         */
        static std::string FullString();

        /**
         * Get GDL status ( Alpha/Beta/Release Candidate/Release )
         */
        static std::string Status();

        /**
         * Return true if GDL is compiled with edittime support.
         */
        static bool CompiledForEdittime();

        /**
         * Get Year of the release
         */
        static std::string Year();

        /**
         * Get Month of the release
         */
        static std::string Month();

        /**
         * Get Day of the release
         */
        static std::string Date();
};

#endif // VERSIONWRAPPER_H
