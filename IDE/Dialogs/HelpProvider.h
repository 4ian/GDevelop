/*
 * GDevelop IDE
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU General Public License version 3.
 */
#ifndef HELPPROVIDER_H
#define HELPPROVIDER_H
#include "GDCore/Tools/HelpFileAccess.h"

/**
 * @brief Simple help provider that simply open the default browser
 * pointing to the specified URL.
 */
class HelpProvider : public gd::HelpProvider
{
public:
    /**
     * Open a specific section of the help file
     */
    void OpenURL(wxString url)
    {
        OpenLink(url);
    }

    static HelpProvider *Get()
    {
        if (NULL == _singleton)
            _singleton =  new HelpProvider;

        return _singleton;
    }

    static void DestroySingleton ()
    {
        if (NULL != _singleton)
        {
            delete _singleton;
            _singleton = NULL;
        }
    }

private:
    void OpenLink(wxString link);

    HelpProvider() {};
    virtual ~HelpProvider() { };

    static HelpProvider * _singleton;
};

#endif
