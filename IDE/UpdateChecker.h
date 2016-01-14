/*
 * GDevelop IDE
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU General Public License version 3.
 */

#ifndef UPDATECHECKER_H
#define UPDATECHECKER_H
#include <string>
#include "GDCore/String.h"

/**
 * \brief Class to download and retrieve information
 * about GDevelop updates
 */
class UpdateChecker
{
public:

    static UpdateChecker *Get();
    static void DestroySingleton();

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
    gd::String info;
    gd::String link;

    gd::String news;
    gd::String newsLinkLabel1;
    gd::String newsLinkLabel2;
    gd::String newsLink1;
    gd::String newsLink2;

private:
    /**
     * \brief Default constructor
     */
    UpdateChecker() : newVersionAvailable(false), newMajor(0), newMinor(0), newBuild(0), newRevision(0) {};
    virtual ~UpdateChecker() {};

    static UpdateChecker *_singleton;
};

#endif // UPDATECHECKER_H
