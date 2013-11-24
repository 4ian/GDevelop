/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef CHECKMAJ_H
#define CHECKMAJ_H
#include <string>

/**
 * \brief Class to check and retrieve information
 * about Game Develop updates
 */
class CheckMAJ
{
public:

    /**
     * \brief Default constructor
     */
    CheckMAJ() : newVersionAvailable(false), newMajor(0), newMinor(0), newBuild(0), newRevision(0) {};
    virtual ~CheckMAJ() {};

    /**
     * Download the information from the official website.
     * \param excludeFromStatistics If set to true, the request asks the website not to take into account the request into statistics.
     */
    void DownloadInformation(bool excludeFromStatistics = false);

    bool newVersionAvailable;

    int newMajor;
    int newMinor;
    int newBuild;
    int newRevision;
    std::string info;
    std::string link;

private:
};

#endif // CHECKMAJ_H

