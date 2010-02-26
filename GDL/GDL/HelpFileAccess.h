#if defined(GDE)

#ifndef HELPFILEACCESS_H
#define HELPFILEACCESS_H
#include <string>
#include <wx/help.h>
#include <wx/fs_zip.h>

/**
 * Singleton class for access to help file
 */
class GD_API HelpFileAccess
{
public:

    inline void InitWithHelpFile(std::string file)
    {
        helpController = new wxHelpController;
        helpController->Initialize(file);
    }

    inline void DisplaySection(int nb)
    {
        helpController->DisplaySection(nb);
    }

    inline void DisplayContents()
    {
        helpController->DisplayContents();
    }

    static HelpFileAccess *getInstance()
    {
        if (NULL == _singleton)
            _singleton =  new HelpFileAccess;

        return _singleton;
    }

    static void kill ()
    {
        if (NULL != _singleton)
        {
            delete _singleton;
            _singleton = NULL;
        }
    }

protected:
private:
    HelpFileAccess() : helpController(NULL) {};
    virtual ~HelpFileAccess() { if (helpController) delete helpController; };

    static HelpFileAccess *_singleton;
    wxHelpController * helpController;
};

#endif // HELPFILEACCESS_H
#endif
