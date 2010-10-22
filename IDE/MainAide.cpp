#ifndef RELEASE
#define _MEMORY_TRACKER
#include "debugMem.h" //suivi mémoire
#endif

#include "MemTrace.h"
extern MemTrace MemTracer;

#include "Game_Develop_EditorMain.h"
#include <wx/string.h>
#include <wx/mimetype.h> // mimetype support
#include "GDL/HelpFileAccess.h"
#include "Credits.h"
#include "MAJ.h"

////////////////////////////////////////////////////////////
/// Afficher l'aide
////////////////////////////////////////////////////////////
void Game_Develop_EditorFrame::OnMenuAideSelected( wxCommandEvent& event )
{
    HelpFileAccess * helpFileAccess = HelpFileAccess::getInstance();
    helpFileAccess->DisplayContents();
}

////////////////////////////////////////////////////////////
/// A propos
////////////////////////////////////////////////////////////
void Game_Develop_EditorFrame::OnAbout( wxCommandEvent& event )
{
    Credits Dialog( this );
    Dialog.ShowModal();
}

////////////////////////////////////////////////////////////
/// Accéder au forum
////////////////////////////////////////////////////////////
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

////////////////////////////////////////////////////////////
/// Accéder au site web
////////////////////////////////////////////////////////////
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

////////////////////////////////////////////////////////////
/// Mise à jour
////////////////////////////////////////////////////////////
void Game_Develop_EditorFrame::OnMenuItem36Selected(wxCommandEvent& event)
{
    MAJ dialog(this);
    dialog.ShowModal();
}

////////////////////////////////////////////////////////////
/// Tutoriel
////////////////////////////////////////////////////////////
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

////////////////////////////////////////////////////////////
///Wiki
////////////////////////////////////////////////////////////
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
