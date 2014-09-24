/** \file
 *  GDevelop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef GDCORE_VERSIONWRAPPER_H
#define GDCORE_VERSIONWRAPPER_H
#include <string>

namespace gd
{

/**
 * \brief Used to get information about GDevelop Core version.
 *
 * \ingroup Tools
 */
class GD_CORE_API VersionWrapper
{
public:

    /**
     * Get GDevelop Core Major version number
     */
    static int Major();

    /**
     * Get GDevelop Core Minor version number
     */
    static int Minor();

    /**
     * Get GDevelop Core Build version number
     */
    static int Build();

    /**
     * Get GDevelop Core Revision version number
     */
    static int Revision();

    /**
     * Get a full string containing version.
     */
    static std::string FullString();

    /**
     * Get GDCore status ( Alpha/Beta/Release Candidate/Release )
     */
    static std::string Status();

    /**
     * Return true if GDCpp is compiled with edittime support.
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

