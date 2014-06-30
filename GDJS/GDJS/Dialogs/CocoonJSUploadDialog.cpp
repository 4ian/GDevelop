/*
 * Game Develop JS Platform
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
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