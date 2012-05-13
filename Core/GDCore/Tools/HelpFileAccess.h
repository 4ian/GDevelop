/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef HELPFILEACCESS_H
#define HELPFILEACCESS_H
#include <string>
#include <wx/help.h>
#include <wx/fs_zip.h>

/**
 * \brief Tool class allowing to easily open help file.
 *
 * Usage example:
 * \code
 * HelpFileAccess::GetInstance()->DisplaySection(52);
 * \endcode
 *
 * \ingroup Tools
 */
class GD_CORE_API HelpFileAccess
{
public:

    /**
     * Initialize the help controller with the specified file.
     * This method is usually called by the IDE itself.
     */
    inline void InitWithHelpFile(const std::string & file)
    {
        helpController = new wxHelpController;
        helpController->Initialize(file);
    }

    /**
     * Open a specific section of the help file
     */
    inline void DisplaySection(int nb)
    {
        helpController->DisplaySection(nb);
    }

    /**
     * Open the help file displaying its contents.
     */
    inline void DisplayContents()
    {
        helpController->DisplayContents();
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
    HelpFileAccess() : helpController(NULL) {};
    virtual ~HelpFileAccess() { if (helpController) delete helpController; };

    static HelpFileAccess *_singleton;
    wxHelpController * helpController;
};

#endif // HELPFILEACCESS_H
