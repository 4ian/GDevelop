#ifndef IDE_REBRANDER_H
#define IDE_REBRANDER_H
#include "GDCore/IDE/wxTools/RebrandingHelper.h"
namespace gd { class String; }
namespace gd { class SerializerElement; }
class MainFrame;
class wxString;

/**
 * \brief Provide tool functions to easily rebrand wxWidgets dialogs
 * (basically: replace a word by another, destroy/remove controls).
 *
 * \ingroup IDE
 */
class Rebrander
{
public:
    Rebrander() : hasBranding(false) {};
    ~Rebrander() {};

    bool LoadRebrandingConfigFromFile(const gd::String & filename);
    void LoadRebrandingConfig(const gd::SerializerElement & config);
    void ApplyBranding(MainFrame * mainEditor);
    wxString ApplyBranding(wxString str, wxString scope);

    bool HasBranding() { return hasBranding; };

private:
    gd::RebrandingHelper brander;
    bool hasBranding;
};

#endif // IDE_REBRANDER_H
