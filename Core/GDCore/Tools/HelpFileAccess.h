/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#ifndef HELPFILEACCESS_H
#define HELPFILEACCESS_H
#include "GDCore/Tools/Locale/LocaleManager.h"
#include "GDCore/CommonTools.h"
#include <wx/string.h>

namespace gd
{

/**
 * \brief Tool base class, meant to be used only by the IDE, to provide help.
 *
 * IDEs must create a child of this class and declares it to gd::HelpFileAccess thanks to gd::HelpFileAccess::SetHelpProvider.
 *
 * \ingroup Tools
 */
class GD_CORE_API HelpProvider
{
public:
    HelpProvider() {};
    virtual ~HelpProvider() {};

    virtual void OpenURL(wxString url) =0;
};

/**
 * \brief Tool class to provide a link between the platforms implementations
 * and the IDE, which is responsible for displaying the help.
 *
 * Usage example:
 * \code
 * gd::HelpFileAccess::Get()->OpenURL(_("www.mywebsite.com/wiki/help_about_my_topic");
 * \endcode
 *
 * \ingroup Tools
 */
class GD_CORE_API HelpFileAccess
{
public:

    /**
     * \brief Initialize the help controller with the specified help provider.
     *
     * This method is usually called by the IDE itself.
     * \warning The caller is responsible of \a newHelpProvider and must deleted it if needed ( when application is closed notably or if a new help provider is set )
     * \see gd::HelpProvider
     */
    inline void SetHelpProvider(HelpProvider * newHelpProvider)
    {
        helpProvider = newHelpProvider;
    }

    /**
     * Ask the IDE to display the specified URL as help.
     */
    inline void OpenURL(wxString url) GD_DEPRECATED
    {
        helpProvider->OpenURL(url);
    }

    /**
     * Ask the IDE to display the specified page as help.
     * This assumes that the page is hosted on the GDevelop's wiki : http://wiki.compilgames.net/doku.php/language/the_page_name
     * The "language" from the URL is deduced from the user language. For the languages that are not available on the wiki,
     * the user is redirected to the english page.
     *
     * \param page the address to the page relative to the wiki (http://wiki.compilgames.net/doku.php/language/)
     */
    inline void OpenPage(wxString page)
    {
        helpProvider->OpenURL(GetHelpURL(page));
    }

    static HelpFileAccess *Get()
    {
        if (NULL == _singleton)
            _singleton =  new HelpFileAccess;

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
    HelpFileAccess() : helpProvider(NULL) {};
    virtual ~HelpFileAccess() {  };

    wxString GetHelpURL(wxString page) const;

    static HelpFileAccess *_singleton;
    HelpProvider * helpProvider;
};

}
#endif // HELPFILEACCESS_H
#endif
