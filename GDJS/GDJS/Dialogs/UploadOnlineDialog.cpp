/*
 * Game Develop JS Platform
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include "UploadOnlineDialog.h"
#include <wx/msgdlg.h>

UploadOnlineDialog::UploadOnlineDialog(wxWindow* parent, wxString gameName, wxString packageLocation)
    : BaseUploadOnlineDialog(parent)
{
	if ( gameName != _("Project") )
		webView->LoadURL(_T("http://www.gamedevshare.com/send.php?n=")+gameName);

	packageLocationEdit->SetValue(packageLocation);
}

UploadOnlineDialog::~UploadOnlineDialog()
{
}

void UploadOnlineDialog::OnCloseBtClicked(wxCommandEvent& event)
{
	wxString msg = wxString::Format(
		_("It seems that the upload is not finished:\nYou have to fill the required fields and choose the file to upload (It is called \"%s\" and available in folder \"%s\").\n\nAre you sure you want to close this window?"),
			"packaged_project.zip",
			packageLocationEdit->GetValue());

	if ( webView->GetCurrentURL().Contains("send.php") ) {
		if (wxMessageBox(msg, _("The game was not uploaded! :O"), wxYES_NO|wxICON_QUESTION|wxYES_DEFAULT ) == wxNO)
            return;
	}

	EndModal(1);
}
#endif