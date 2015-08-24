/*
 * GDevelop JS Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#ifndef CORDOVAPACKAGEDIALOG_H
#define CORDOVAPACKAGEDIALOG_H
#include "GDJSDialogs.h"

class CordovaPackageDialog : public BaseCordovaPackageDialog
{
public:
    CordovaPackageDialog(wxWindow* parent, wxString packageLocation);
    virtual ~CordovaPackageDialog();
protected:
    virtual void OnCloseClicked(wxCommandEvent& event);
};
#endif // CORDOVAPACKAGEDIALOG_H
#endif