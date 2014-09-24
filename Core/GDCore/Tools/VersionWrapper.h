/** \file
 *  GDevelop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
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
     * \brief Get GDevelop Core Major version number
     */
    static int Major();

    /**
     * \brief Get GDevelop Core Minor version number
     */
    static int Minor();

    /**
     * \brief Get GDevelop Core Build version number
     */
    static int Build();

    /**
     * \brief Get GDevelop Core Revision version number
     */
    static int Revision();

    /**
     * \brief Get a full string containing version.
     */
    static std::string FullString();

    /**
     * \brief Get GDCore status ( Alpha/Beta/Release Candidate/Release )
     */
    static std::string Status();

    /**
     * \brief Return true if GDCpp is compiled with edittime support.
     */
    static bool CompiledForEdittime();

    /**
     * \brief Get Year of the release
     */
    static std::string Year();

    /**
     * \brief Get Month of the release
     */
    static std::string Month();

    /**
     * \brief Get Day of the release
     */
    static std::string Date();

    /**
     * \brief Return true if the first version is older
     * than the second version.
     */
    static bool IsOlder(int major, int minor, int build, int revision,
        int major2, int minor2, int build2, int revision2);

    /**
     * \brief Return true if the first version is older or equal
     * to the second version.
     */
    static bool IsOlderOrEqual(int major, int minor, int build, int revision,
        int major2, int minor2, int build2, int revision2);
};

}

#endif // GDCORE_VERSIONWRAPPER_H

