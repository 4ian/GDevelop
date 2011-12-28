#if defined(GD_IDE_ONLY)

#ifndef HELPFILEACCESS_H
#define HELPFILEACCESS_H
#include <string>
#include <wx/help.h>
#include <wx/fs_zip.h>

/**
 * \brief Singleton class to access to help file
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
#endif
