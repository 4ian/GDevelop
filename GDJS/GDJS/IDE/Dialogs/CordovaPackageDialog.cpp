/*
 * GDevelop JS Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include "CordovaPackageDialog.h"
#include "GDCore/Tools/Localization.h"

CordovaPackageDialog::CordovaPackageDialog(wxWindow* parent, wxString packageLocation)
    : BaseCordovaPackageDialog(parent)
{
	ID_HYPERLINKCTRL117->SetURL(_("http://wiki.compilgames.net/doku.php/en/game_develop/tutorials/howtouseintelxdk"));
	packageLocationEdit->SetValue(packageLocation);
}

CordovaPackageDialog::~CordovaPackageDialog()
{
}

void CordovaPackageDialog::OnCloseClicked(wxCommandEvent& event)
{
	EndModal(0);
}
#endif