/*
 * GDevelop IDE
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU General Public License version 3.
 */

#include <wx/app.h> //This include must be placed first
#include "MainFrame.h"
#include <wx/string.h>
#include <wx/mimetype.h> // mimetype support
#include "GDCore/Tools/HelpFileAccess.h"
#include "Credits.h"
#include "MAJ.h"

/**
 * Display help
 */
void MainFrame::OnMenuAideSelected( wxCommandEvent& event )
{
    gd::HelpFileAccess::Get()->OpenPage("gdevelop/documentation");
}

/**
 * Display tutorial
 */
void MainFrame::OnMenuTutoSelected(wxCommandEvent& event)
{
    gd::HelpFileAccess::Get()->OpenPage("gdevelop/tutorials/beginnertutorial");
}

/**
 * Display about dialogs
 */
void MainFrame::OnAbout( wxCommandEvent& event )
{
    //Check if the about box was overriden.
    if (onAboutCb && onAboutCb()) return;

    Credits Dialog( this );
    Dialog.ShowModal();
}

/**
 * Access forum
 */
void MainFrame::OnMenuForumSelected(wxCommandEvent& event)
{
    wxString link = "http://www.forum.compilgames.net";

    wxString mimetype = wxEmptyString;
    if (link.StartsWith (_T("http://"))) {
        mimetype = _T("text/html");
    }else if (link.StartsWith (_T("ftp://"))) {
        mimetype = _T("text/html");
    }else if (link.StartsWith (_T("mailto:"))) {
        mimetype = _T("message/rfc822");
    }else{
        return;
    }
    wxFileType *filetype = wxTheMimeTypesManager->GetFileTypeFromMimeType (mimetype);
    if (filetype) {
        wxString cmd;
        if (filetype->GetOpenCommand (&cmd, wxFileType::MessageParameters (link))) {
            cmd.Replace(_T("file://"), wxEmptyString);
            ::wxExecute(cmd);
        }
        delete filetype;
    }

}

/**
 * Access official web site
 */
void MainFrame::OnMenuSiteSelected(wxCommandEvent& event)
{
    wxString link = "http://www.compilgames.net";

    wxString mimetype = wxEmptyString;
    if (link.StartsWith (_T("http://"))) {
        mimetype = _T("text/html");
    }else if (link.StartsWith (_T("ftp://"))) {
        mimetype = _T("text/html");
    }else if (link.StartsWith (_T("mailto:"))) {
        mimetype = _T("message/rfc822");
    }else{
        return;
    }
    wxFileType *filetype = wxTheMimeTypesManager->GetFileTypeFromMimeType (mimetype);
    if (filetype) {
        wxString cmd;
        if (filetype->GetOpenCommand (&cmd, wxFileType::MessageParameters (link))) {
            cmd.Replace(_T("file://"), wxEmptyString);
            ::wxExecute(cmd);
        }
        delete filetype;
    }
}

/**
 * Open update dialog
 */
void MainFrame::OnMenuItem36Selected(wxCommandEvent& event)
{
    #ifndef GD_NO_UPDATE_CHECKER
    MAJ dialog(this);
    if ( dialog.ShowModal() == 2)
    {
        Destroy();
        wxExit();
    }
    #endif
}
