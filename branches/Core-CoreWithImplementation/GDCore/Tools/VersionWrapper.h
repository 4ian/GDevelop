/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef GDCORE_VERSIONWRAPPER_H
#define GDCORE_VERSIONWRAPPER_H
#include <string>

namespace gd
{

/**
 * \brief Used to get information about Game Develop Core version.
 *
 * \ingroup Tools
 */
class GD_CORE_API VersionWrapper
{
public:

    /**
     * Get Game Develop Core Major version number
     */
    static int Major();

    /**
     * Get Game Develop Core Minor version number
     */
    static int Minor();

    /**
     * Get Game Develop Core Build version number
     */
    static int Build();

    /**
     * Get Game Develop Core Revision version number
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

}

#endif // GDCORE_VERSIONWRAPPER_H

