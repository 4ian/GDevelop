/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */
#ifndef HELPFILEACCESS_H
#define HELPFILEACCESS_H
#include "GDCore/Tools/Locale/LocaleManager.h"
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
 * gd::HelpFileAccess::GetInstance()->DisplayURL(_("www.mywebsite.com/wiki/help_about_my_topic");
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
    inline void OpenURL(wxString url)
    {
        helpProvider->OpenURL(url);
    }

    static HelpFileAccess *GetInstance()
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

    static HelpFileAccess *_singleton;
    HelpProvider * helpProvider;
};

}
#endif // HELPFILEACCESS_H
