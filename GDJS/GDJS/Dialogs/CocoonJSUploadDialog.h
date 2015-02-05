/*
 * GDevelop JS Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#ifndef COCOONJSUPLOADDIALOG_H
#define COCOONJSUPLOADDIALOG_H
#include "GDJSDialogs.h"

/**
 * \brief Dialog used to explain how to use CocoonJS.
 */
class CocoonJSUploadDialog : public BaseCocoonJSUploadDialog
{
public:
    CocoonJSUploadDialog(wxWindow* parent, wxString packageLocation);
    virtual ~CocoonJSUploadDialog();
protected:
    virtual void OnCloseBtClicked(wxCommandEvent& event);
};
#endif // COCOONJSUPLOADDIALOG_H
#endif
