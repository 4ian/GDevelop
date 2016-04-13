#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)

#ifndef ANDROIDEXPORTDIALOG_H
#define ANDROIDEXPORTDIALOG_H
#include "GDCppDialogs.h"

class AndroidExportDialog : public AndroidExportDialogBase
{
public:
    AndroidExportDialog(wxWindow* parent);
    virtual ~AndroidExportDialog();

    wxString GetExportPath() const;

protected:
    virtual void OnBrowseButtonClicked(wxCommandEvent& event);
    virtual void OnHelpButtonClicked(wxHyperlinkEvent& event);
};
#endif // ANDROIDEXPORTDIALOG_H

#endif
