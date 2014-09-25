/*
 * GDevelop JS Platform
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#ifndef INTELXDKPACKAGEDIALOG_H
#define INTELXDKPACKAGEDIALOG_H
#include "GDJSDialogs.h"

class IntelXDKPackageDialog : public BaseIntelXDKPackageDialog
{
public:
    IntelXDKPackageDialog(wxWindow* parent, wxString packageLocation);
    virtual ~IntelXDKPackageDialog();
protected:
    virtual void OnCloseClicked(wxCommandEvent& event);
};
#endif // INTELXDKPACKAGEDIALOG_H
#endif
