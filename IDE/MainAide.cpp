/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#include "Game_Develop_EditorMain.h"
#include <wx/string.h>
#include <wx/mimetype.h> // mimetype support
#include "GDCore/Tools/HelpFileAccess.h"
#include "Credits.h"
#include "MAJ.h"

/**
 * Display help
 */
void Game_Develop_EditorFrame::OnMenuAideSelected( wxCommandEvent& event )
{
    if ( GDpriv::LocaleManager::GetInstance()->locale->GetLanguage() == wxLANGUAGE_FRENCH )
        gd::HelpFileAccess::GetInstance()->DisplayContents();
    else
        gd::HelpFileAccess::GetInstance()->OpenURL(_("http://www.wiki.compilgames.net/doku.php/en/game_develop/documentation"));
}

/**
 * Display about dialogs
 */
void Game_Develop_EditorFrame::OnAbout( wxCommandEvent& event )
{
    Credits Dialog( this );
    Dialog.ShowModal();
}

/**
 * Access forum
 */
void Game_Develop_EditorFrame::OnMenuForumSelected(wxCommandEvent& event)
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
void Game_Develop_EditorFrame::OnMenuSiteSelected(wxCommandEvent& event)
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
void Game_Develop_EditorFrame::OnMenuItem36Selected(wxCommandEvent& event)
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
void Game_Develop_EditorFrame::OnMenuTutoSelected(wxCommandEvent& event)
{
    wxString link = wxGetCwd() + "/Tutorial/"+_("Tutoriel.pdf");

    wxFileType *filetype = wxTheMimeTypesManager->GetFileTypeFromMimeType ("application/pdf");
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
void Game_Develop_EditorFrame::OnMenuWikiSelected(wxCommandEvent& event)
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
