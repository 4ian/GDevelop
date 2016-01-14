/*
 * GDevelop JS Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include "CocoonJSUploadDialog.h"

CocoonJSUploadDialog::CocoonJSUploadDialog(wxWindow* parent, wxString packageLocation)
    : BaseCocoonJSUploadDialog(parent)
{
	packageLocationEdit->SetValue(packageLocation);
}

CocoonJSUploadDialog::~CocoonJSUploadDialog()
{
}

void CocoonJSUploadDialog::OnCloseBtClicked(wxCommandEvent& event)
{
	EndModal(1);
}
#endif
