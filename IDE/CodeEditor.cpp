/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#include "CodeEditor.h"

//(*InternalHeaders(CodeEditor)
#include <wx/bitmap.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include <wx/mimetype.h>
#include <wx/config.h>
#include "GDL/Scene.h"
#include "GDL/Game.h"
#include "GDL/MainEditorCommand.h"
#include <wx/fontdlg.h>

//(*IdInit(CodeEditor)
const long CodeEditor::ID_CUSTOM1 = wxNewId();
const long CodeEditor::ID_MENUITEM1 = wxNewId();
const long CodeEditor::ID_MENUITEM2 = wxNewId();
const long CodeEditor::ID_MENUITEM3 = wxNewId();
const long CodeEditor::ID_MENUITEM4 = wxNewId();
const long CodeEditor::ID_MENUITEM5 = wxNewId();
//*)
const long CodeEditor::idRibbonSave = wxNewId();
const long CodeEditor::idRibbonCopy = wxNewId();
const long CodeEditor::idRibbonCut = wxNewId();
const long CodeEditor::idRibbonPaste = wxNewId();
const long CodeEditor::idRibbonUndo = wxNewId();
const long CodeEditor::idRibbonRedo = wxNewId();
const long CodeEditor::idRibbonOptions = wxNewId();
const long CodeEditor::idRibbonFindReplace = wxNewId();
const long CodeEditor::idRibbonGotoLine = wxNewId();
const long CodeEditor::idRibbonDocGDL = wxNewId();
const long CodeEditor::idRibbonDocSFML = wxNewId();
const long CodeEditor::idRibbonDocWxWidgets = wxNewId();
const long CodeEditor::idRibbonDocBoost = wxNewId();

BEGIN_EVENT_TABLE(CodeEditor,wxPanel)
	//(*EventTable(CodeEditor)
	//*)
END_EVENT_TABLE()

CodeEditor::CodeEditor(wxWindow* parent, std::string filename_, Game * game_, const MainEditorCommand & mainEditorCommand_) :
filename(filename_),
game(game_),
mainEditorCommand(mainEditorCommand_)
{
	//(*Initialize(CodeEditor)
	wxFlexGridSizer* FlexGridSizer1;

	Create(parent, wxID_ANY, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 3, 0, 0);
	textEditor = new wxSTEditor(this,ID_CUSTOM1,wxDefaultPosition,wxDefaultSize,0,_T("ID_CUSTOM1"));
	FlexGridSizer1->Add(textEditor, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	MenuItem1 = new wxMenuItem((&contextMenu), ID_MENUITEM1, _("Copier"), wxEmptyString, wxITEM_NORMAL);
	MenuItem1->SetBitmap(wxBitmap(wxImage(_T("res/copyicon.png"))));
	contextMenu.Append(MenuItem1);
	MenuItem2 = new wxMenuItem((&contextMenu), ID_MENUITEM2, _("Couper"), wxEmptyString, wxITEM_NORMAL);
	MenuItem2->SetBitmap(wxBitmap(wxImage(_T("res/cuticon.png"))));
	contextMenu.Append(MenuItem2);
	MenuItem3 = new wxMenuItem((&contextMenu), ID_MENUITEM3, _("Coller"), wxEmptyString, wxITEM_NORMAL);
	MenuItem3->SetBitmap(wxBitmap(wxImage(_T("res/pasteicon.png"))));
	contextMenu.Append(MenuItem3);
	contextMenu.AppendSeparator();
	MenuItem4 = new wxMenuItem((&contextMenu), ID_MENUITEM4, _("Annuler"), wxEmptyString, wxITEM_NORMAL);
	MenuItem4->SetBitmap(wxBitmap(wxImage(_T("res/undo.png"))));
	contextMenu.Append(MenuItem4);
	MenuItem5 = new wxMenuItem((&contextMenu), ID_MENUITEM5, _("Refaire"), wxEmptyString, wxITEM_NORMAL);
	MenuItem5->SetBitmap(wxBitmap(wxImage(_T("res/redo.png"))));
	contextMenu.Append(MenuItem5);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	textEditor->Connect(wxEVT_RIGHT_UP,(wxObjectEventFunction)&CodeEditor::OntextEditorRightUp,0,this);
	Connect(ID_MENUITEM1,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&CodeEditor::OnMenuCopySelected);
	Connect(ID_MENUITEM2,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&CodeEditor::OnMenuCutSelected);
	Connect(ID_MENUITEM3,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&CodeEditor::OnMenuPasteSelected);
	Connect(ID_MENUITEM4,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&CodeEditor::OnMenuUndoSelected);
	Connect(ID_MENUITEM5,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&CodeEditor::OnMenuRedoSelected);
	Connect(wxEVT_SIZE,(wxObjectEventFunction)&CodeEditor::OnResize);
	//*)
	Connect(ID_CUSTOM1, wxEVT_STC_UPDATEUI, (wxObjectEventFunction)&CodeEditor::UpdateTextCtrl);
	Connect(ID_CUSTOM1, wxEVT_STC_CHARADDED, (wxObjectEventFunction)&CodeEditor::OnCharAdded);

    textEditor->SetLanguage(STE_LANG_CPP);
	textEditor->LoadFile(filename);

    wxSTEditorOptions steOptions(STE_DEFAULT_OPTIONS);
    steOptions.LoadConfig(*wxConfigBase::Get());
    textEditor->CreateOptions(steOptions);
}

CodeEditor::~CodeEditor()
{
	//(*Destroy(CodeEditor)
	//*)
}

bool CodeEditor::QueryClose()
{
    return ( textEditor->QuerySaveIfModified(true) != wxCANCEL );
}

/**
 * Static method for creating ribbon for events editors.
 */
void CodeEditor::CreateRibbonPage(wxRibbonPage * page)
{
    bool hideLabels = false;
    wxConfigBase::Get()->Read( _T( "/Skin/HideLabels" ), &hideLabels, false );

    {
        wxRibbonPanel *ribbonPanel = new wxRibbonPanel(page, wxID_ANY, _("Fichier"), wxBitmap("res/saveicon24.png", wxBITMAP_TYPE_ANY), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        wxRibbonButtonBar *ribbonBar = new wxRibbonButtonBar(ribbonPanel, wxID_ANY);
        ribbonBar->AddButton(idRibbonSave, !hideLabels ? _("Enregistrer") : "", wxBitmap("res/saveicon24.png", wxBITMAP_TYPE_ANY));
    }
    {
        wxRibbonPanel *ribbonPanel = new wxRibbonPanel(page, wxID_ANY, _("Presse papiers"), wxBitmap("res/copy24.png", wxBITMAP_TYPE_ANY), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        wxRibbonButtonBar *ribbonBar = new wxRibbonButtonBar(ribbonPanel, wxID_ANY);
        ribbonBar->AddButton(idRibbonCopy, !hideLabels ? _("Copier") : "", wxBitmap("res/copy24.png", wxBITMAP_TYPE_ANY));
        ribbonBar->AddButton(idRibbonCut, !hideLabels ? _("Couper") : "", wxBitmap("res/cut24.png", wxBITMAP_TYPE_ANY));
        ribbonBar->AddButton(idRibbonPaste, !hideLabels ? _("Coller") : "", wxBitmap("res/paste24.png", wxBITMAP_TYPE_ANY));
    }
    {
        wxRibbonPanel *ribbonPanel = new wxRibbonPanel(page, wxID_ANY, _("Annulation"), wxBitmap("res/undo24.png", wxBITMAP_TYPE_ANY), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        wxRibbonButtonBar *ribbonBar = new wxRibbonButtonBar(ribbonPanel, wxID_ANY);
        ribbonBar->AddButton(idRibbonUndo, !hideLabels ? _("Annuler") : "", wxBitmap("res/undo24.png", wxBITMAP_TYPE_ANY));
        ribbonBar->AddButton(idRibbonRedo, !hideLabels ? _("Refaire") : "", wxBitmap("res/redo24.png", wxBITMAP_TYPE_ANY));
    }
    {
        wxRibbonPanel *ribbonPanel = new wxRibbonPanel(page, wxID_ANY, _("Outils"), wxBitmap("res/tools24.png", wxBITMAP_TYPE_ANY), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        wxRibbonButtonBar *ribbonBar = new wxRibbonButtonBar(ribbonPanel, wxID_ANY);
        ribbonBar->AddButton(idRibbonFindReplace, !hideLabels ? _("Chercher / Remplacer") : "", wxBitmap("res/search24.png", wxBITMAP_TYPE_ANY));
        ribbonBar->AddButton(idRibbonGotoLine, !hideLabels ? _("Aller à...") : "", wxBitmap("res/gotoline24.png", wxBITMAP_TYPE_ANY));
    }
    {
        wxRibbonPanel *ribbonPanel = new wxRibbonPanel(page, wxID_ANY, _("Options"), wxBitmap("res/pref24.png", wxBITMAP_TYPE_ANY), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        wxRibbonButtonBar *ribbonBar = new wxRibbonButtonBar(ribbonPanel, wxID_ANY);
        ribbonBar->AddButton(idRibbonOptions, !hideLabels ? _("Options") : "", wxBitmap("res/pref24.png", wxBITMAP_TYPE_ANY));
    }
    {
        wxRibbonPanel *ribbonPanel = new wxRibbonPanel(page, wxID_ANY, _("Aide"), wxBitmap("res/helpicon24.png", wxBITMAP_TYPE_ANY), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        wxRibbonButtonBar *ribbonBar = new wxRibbonButtonBar(ribbonPanel, wxID_ANY);
        ribbonBar->AddButton(idRibbonDocGDL, !hideLabels ? _("Doc. GDL") : "", wxBitmap("res/helpicon24.png", wxBITMAP_TYPE_ANY));
        ribbonBar->AddButton(idRibbonDocSFML, !hideLabels ? _("Doc. SFML") : "", wxBitmap("res/helpicon24.png", wxBITMAP_TYPE_ANY));
        ribbonBar->AddButton(idRibbonDocWxWidgets, !hideLabels ? _("Doc. wxWidgets") : "", wxBitmap("res/helpicon24.png", wxBITMAP_TYPE_ANY));
        ribbonBar->AddButton(idRibbonDocBoost, !hideLabels ? _("Doc. Boost") : "", wxBitmap("res/helpicon24.png", wxBITMAP_TYPE_ANY));
    }
}

void CodeEditor::ConnectEvents()
{
    mainEditorCommand.GetMainEditor()->Connect(idRibbonSave, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&CodeEditor::OnSaveSelected, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonCopy, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&CodeEditor::OnMenuCopySelected, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonCut, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&CodeEditor::OnMenuCutSelected, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonPaste, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&CodeEditor::OnMenuPasteSelected, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonUndo, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&CodeEditor::OnMenuUndoSelected, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonRedo, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&CodeEditor::OnMenuRedoSelected, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonDocGDL, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&CodeEditor::OnDocGDLSelected, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonDocSFML, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&CodeEditor::OnDocSFMLSelected, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonDocWxWidgets, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&CodeEditor::OnDocWxWidgetsSelected, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonDocBoost, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&CodeEditor::OnDocBoostSelected, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonOptions, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&CodeEditor::OnOptionsSelected, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonFindReplace, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&CodeEditor::OnFindReplaceSelected, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonGotoLine, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&CodeEditor::OnGotoLineSelected, NULL, this);
}

void CodeEditor::SelectLine(size_t line)
{
    textEditor->GotoLine(line-1);
}

/**
 * Auto indent
 */
void CodeEditor::OnCharAdded (wxStyledTextEvent &event)
{
}

/**
 * Syntax highlighting
 */
void CodeEditor::UpdateTextCtrl(wxStyledTextEvent& event)
{
    char currentChar = textEditor->GetCharAt(textEditor->GetCurrentPos());
    if ( currentChar != '(' && currentChar != ')')
    {
        textEditor->BraceHighlight(wxSTC_INVALID_POSITION, wxSTC_INVALID_POSITION);
        return;
    }

    int otherBrace = textEditor->BraceMatch(textEditor->GetCurrentPos());

    if ( otherBrace != wxSTC_INVALID_POSITION)
        textEditor->BraceHighlight(textEditor->GetCurrentPos(), otherBrace);
    else
        textEditor->BraceBadLight(textEditor->GetCurrentPos());
}

void CodeEditor::OntextEditorRightUp(wxMouseEvent& event)
{
    PopupMenu(&contextMenu);
}

void CodeEditor::OnMenuCopySelected(wxCommandEvent& event)
{
    textEditor->Copy();
}

void CodeEditor::OnMenuCutSelected(wxCommandEvent& event)
{
    textEditor->Cut();
}

void CodeEditor::OnMenuPasteSelected(wxCommandEvent& event)
{
    textEditor->Paste();
}

void CodeEditor::OnFindReplaceSelected(wxRibbonButtonBarEvent& evt)
{
    textEditor->ShowFindReplaceDialog(true);
}

void CodeEditor::OnGotoLineSelected(wxRibbonButtonBarEvent& evt)
{
    textEditor->ShowGotoLineDialog();
}

void CodeEditor::OnOptionsSelected(wxRibbonButtonBarEvent& evt)
{
    wxSTEditorPrefPageData editorData(textEditor->GetEditorPrefs(),
                                      textEditor->GetEditorStyles(),
                                      textEditor->GetEditorLangs(),
                                      textEditor->GetLanguageId(),
                                      textEditor);

    wxSTEditorPrefDialog prefDialog(editorData, this, wxID_ANY, _("Editor Preferences"),
                                    wxDEFAULT_DIALOG_STYLE|wxRESIZE_BORDER);

    prefDialog.ShowModal();

    textEditor->GetOptions().SaveConfig(*wxConfigBase::Get());
}

/**
 * Save file
 */
void CodeEditor::OnSaveSelected(wxRibbonButtonBarEvent& evt)
{
    textEditor->SaveFile(false, filename);
}

void CodeEditor::OnResize(wxSizeEvent& event)
{
    textEditor->SetSize(event.GetSize());
}

void CodeEditor::ForceRefreshRibbonAndConnect()
{
    mainEditorCommand.GetRibbon()->SetActivePage(7);
    ConnectEvents();
}

void CodeEditor::OnMenuUndoSelected(wxCommandEvent& event)
{
    textEditor->Undo();
}

void CodeEditor::OnMenuRedoSelected(wxCommandEvent& event)
{
    textEditor->Redo();
}

void CodeEditor::OpenLink(wxString link)
{
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

void CodeEditor::OnDocGDLSelected(wxRibbonButtonBarEvent &event)
{
	wxString gdlBaseDir;
    wxConfigBase::Get()->Read("gdlBaseDir", &gdlBaseDir);

    OpenLink(gdlBaseDir+"/help.chm");
}

void CodeEditor::OnDocSFMLSelected(wxRibbonButtonBarEvent &event)
{
    OpenLink("http://www.sfml-dev.org/documentation/2.0/");
}

void CodeEditor::OnDocWxWidgetsSelected(wxRibbonButtonBarEvent &event)
{
    OpenLink("http://docs.wxwidgets.org/2.9.1/");
}

void CodeEditor::OnDocBoostSelected(wxRibbonButtonBarEvent &event)
{
    OpenLink("http://www.boost.org/doc/libs/1_43_0/");
}
