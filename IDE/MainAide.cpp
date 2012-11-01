/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
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
    if ( gd::LocaleManager::GetInstance()->locale->GetLanguage() == wxLANGUAGE_FRENCH )
        gd::HelpFileAccess::GetInstance()->DisplayContents();
    else
        gd::HelpFileAccess::GetInstance()->OpenURL(_("http://www.wiki.compilgames.net/doku.php/en/game_develop/documentation"));
}

/**
 * Display about dialogs
 */
void MainFrame::OnAbout( wxCommandEvent& event )
{
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
    MAJ dialog(this);
    if ( dialog.ShowModal() == 2)
    {
        Destroy();
        wxExit();
    }
}

/**
 * Display tutorial
 */
void MainFrame::OnMenuTutoSelected(wxCommandEvent& event)
{
    wxString link = _("http://wiki.compilgames.net/doku.php/en/game_develop/tutorials");
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
 * Access wiki
 */
void MainFrame::OnMenuWikiSelected(wxCommandEvent& event)
{
    wxString link = "http://www.wiki.compilgames.net";

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

