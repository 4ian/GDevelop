/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#include "BugReport.h"

//(*InternalHeaders(BugReport)
#include <wx/artprov.h>
#include <wx/bitmap.h>
#include <wx/settings.h>
#include <wx/font.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include <wx/textfile.h>
#include "GDCore/CommonTools.h"
#include "GDCore/Tools/VersionWrapper.h"
#include <string>
#include <vector>
#include <iostream>
#include <wx/wfstream.h>
#include <wx/txtstrm.h>

using namespace std;

//(*IdInit(BugReport)
const long BugReport::ID_STATICBITMAP1 = wxNewId();
const long BugReport::ID_STATICTEXT1 = wxNewId();
const long BugReport::ID_PANEL1 = wxNewId();
const long BugReport::ID_STATICLINE1 = wxNewId();
const long BugReport::ID_STATICBITMAP3 = wxNewId();
const long BugReport::ID_STATICTEXT2 = wxNewId();
const long BugReport::ID_STATICBITMAP4 = wxNewId();
const long BugReport::ID_STATICTEXT8 = wxNewId();
const long BugReport::ID_HYPERLINKCTRL1 = wxNewId();
const long BugReport::ID_BUTTON4 = wxNewId();
const long BugReport::ID_PANEL2 = wxNewId();
const long BugReport::ID_STATICTEXT3 = wxNewId();
const long BugReport::ID_TEXTCTRL1 = wxNewId();
const long BugReport::ID_STATICTEXT6 = wxNewId();
const long BugReport::ID_BUTTON1 = wxNewId();
const long BugReport::ID_BUTTON5 = wxNewId();
const long BugReport::ID_PANEL3 = wxNewId();
const long BugReport::ID_STATICTEXT7 = wxNewId();
const long BugReport::ID_STATICBITMAP5 = wxNewId();
const long BugReport::ID_STATICTEXT4 = wxNewId();
const long BugReport::ID_STATICBITMAP2 = wxNewId();
const long BugReport::ID_STATICTEXT5 = wxNewId();
const long BugReport::ID_BUTTON2 = wxNewId();
const long BugReport::ID_BUTTON3 = wxNewId();
const long BugReport::ID_PANEL4 = wxNewId();
const long BugReport::ID_NOTEBOOK1 = wxNewId();
//*)

BEGIN_EVENT_TABLE( BugReport, wxDialog )
    //(*EventTable(BugReport)
    //*)
END_EVENT_TABLE()

BugReport::BugReport( wxWindow* parent )
{
    //(*Initialize(BugReport)
    wxStaticBoxSizer* StaticBoxSizer2;
    wxFlexGridSizer* FlexGridSizer4;
    wxStaticBoxSizer* StaticBoxSizer4;
    wxFlexGridSizer* FlexGridSizer10;
    wxFlexGridSizer* FlexGridSizer3;
    wxFlexGridSizer* FlexGridSizer5;
    wxFlexGridSizer* FlexGridSizer9;
    wxFlexGridSizer* FlexGridSizer2;
    wxFlexGridSizer* FlexGridSizer7;
    wxStaticBoxSizer* StaticBoxSizer3;
    wxFlexGridSizer* FlexGridSizer8;
    wxFlexGridSizer* FlexGridSizer13;
    wxFlexGridSizer* FlexGridSizer12;
    wxFlexGridSizer* FlexGridSizer6;
    wxStaticBoxSizer* StaticBoxSizer1;
    wxFlexGridSizer* FlexGridSizer1;
    wxFlexGridSizer* FlexGridSizer11;

    Create(parent, wxID_ANY, _("Bug's report"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE, _T("wxID_ANY"));
    FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
    Panel1 = new wxPanel(this, ID_PANEL1, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL1"));
    Panel1->SetBackgroundColour(wxSystemSettings::GetColour(wxSYS_COLOUR_WINDOW));
    FlexGridSizer2 = new wxFlexGridSizer(0, 3, 0, 0);
    StaticBitmap1 = new wxStaticBitmap(Panel1, ID_STATICBITMAP1, wxBitmap(wxImage(_T("res/bigbug.png"))), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP1"));
    FlexGridSizer2->Add(StaticBitmap1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticText1 = new wxStaticText(Panel1, ID_STATICTEXT1, _("An error seems to have occured during\nlast session."), wxDefaultPosition, wxDefaultSize, wxALIGN_CENTRE, _T("ID_STATICTEXT1"));
    wxFont StaticText1Font(11,wxDEFAULT,wxFONTSTYLE_NORMAL,wxBOLD,false,wxEmptyString,wxFONTENCODING_DEFAULT);
    StaticText1->SetFont(StaticText1Font);
    FlexGridSizer2->Add(StaticText1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    Panel1->SetSizer(FlexGridSizer2);
    FlexGridSizer2->Fit(Panel1);
    FlexGridSizer2->SetSizeHints(Panel1);
    FlexGridSizer1->Add(Panel1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    StaticLine1 = new wxStaticLine(this, ID_STATICLINE1, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
    FlexGridSizer1->Add(StaticLine1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    Notebook1 = new wxNotebook(this, ID_NOTEBOOK1, wxDefaultPosition, wxDefaultSize, 0, _T("ID_NOTEBOOK1"));
    Panel2 = new wxPanel(Notebook1, ID_PANEL2, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL2"));
    FlexGridSizer3 = new wxFlexGridSizer(0, 1, 0, 0);
    FlexGridSizer3->AddGrowableCol(0);
    FlexGridSizer3->AddGrowableRow(0);
    StaticBoxSizer1 = new wxStaticBoxSizer(wxHORIZONTAL, Panel2, _("Oops..."));
    FlexGridSizer9 = new wxFlexGridSizer(0, 3, 0, 0);
    StaticBitmap3 = new wxStaticBitmap(Panel2, ID_STATICBITMAP3, wxArtProvider::GetBitmap(wxART_MAKE_ART_ID_FROM_STR(_T("wxART_INFORMATION")),wxART_OTHER), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP3"));
    FlexGridSizer9->Add(StaticBitmap3, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticText2 = new wxStaticText(Panel2, ID_STATICTEXT2, _("It seems that Game Develop has closed abruptly after an\nerror. If this proves to be right, we apologize for the inconvenience\nincurred. This is not your fault, Game Develop should not \nabruptly quit whatever the user make.You can help us correct the problem\nby filling the error report."), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
    FlexGridSizer9->Add(StaticText2, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
    StaticBoxSizer1->Add(FlexGridSizer9, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer3->Add(StaticBoxSizer1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticBoxSizer2 = new wxStaticBoxSizer(wxHORIZONTAL, Panel2, _("Known bugs for this version of Game Develop"));
    FlexGridSizer11 = new wxFlexGridSizer(0, 3, 0, 0);
    FlexGridSizer11->AddGrowableCol(1);
    FlexGridSizer11->AddGrowableRow(0);
    StaticBitmap4 = new wxStaticBitmap(Panel2, ID_STATICBITMAP4, wxBitmap(wxImage(_T("res/internet32.png"))), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP4"));
    FlexGridSizer11->Add(StaticBitmap4, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer12 = new wxFlexGridSizer(0, 1, 0, 0);
    StaticText8 = new wxStaticText(Panel2, ID_STATICTEXT8, _("You can visit a page on our website which can\ncontain known bugs for this version of Game Develop:"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT8"));
    FlexGridSizer12->Add(StaticText8, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
    bugListBt = new wxHyperlinkCtrl(Panel2, ID_HYPERLINKCTRL1, _("View the known bugs for this version"), wxEmptyString, wxDefaultPosition, wxDefaultSize, wxHL_CONTEXTMENU|wxHL_ALIGN_CENTRE|wxNO_BORDER, _T("ID_HYPERLINKCTRL1"));
    FlexGridSizer12->Add(bugListBt, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer11->Add(FlexGridSizer12, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    StaticBoxSizer2->Add(FlexGridSizer11, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer3->Add(StaticBoxSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    Button1 = new wxButton(Panel2, ID_BUTTON4, _("Next"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON4"));
    FlexGridSizer3->Add(Button1, 1, wxALL|wxALIGN_RIGHT|wxALIGN_BOTTOM, 5);
    Panel2->SetSizer(FlexGridSizer3);
    FlexGridSizer3->Fit(Panel2);
    FlexGridSizer3->SetSizeHints(Panel2);
    Panel3 = new wxPanel(Notebook1, ID_PANEL3, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL3"));
    FlexGridSizer4 = new wxFlexGridSizer(0, 1, 0, 0);
    FlexGridSizer4->AddGrowableCol(0);
    FlexGridSizer4->AddGrowableRow(3);
    StaticText3 = new wxStaticText(Panel3, ID_STATICTEXT3, _("To help us solve the problem, try to describe the error\nas precisely as you can. Indicate if possible:\n-How error has happened (Click on a button ...)\n-In which part of program (Scene editor, Choosing actions ...)"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT3"));
    FlexGridSizer4->Add(StaticText3, 1, wxALL|wxEXPAND|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
    UserReportEdit = new wxTextCtrl(Panel3, ID_TEXTCTRL1, wxEmptyString, wxDefaultPosition, wxSize(408,71), wxTE_MULTILINE, wxDefaultValidator, _T("ID_TEXTCTRL1"));
    FlexGridSizer4->Add(UserReportEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer7 = new wxFlexGridSizer(0, 3, 0, 0);
    FlexGridSizer7->AddGrowableCol(1);
    FlexGridSizer7->AddGrowableRow(0);
    StaticText6 = new wxStaticText(Panel3, ID_STATICTEXT6, _("Once you complete the error report\nclick on \"Create Report \". Send\nthen the file to our e-mail adress.\n\nThank you!"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT6"));
    FlexGridSizer7->Add(StaticText6, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    CreateRapportBt = new wxButton(Panel3, ID_BUTTON1, _("Create the error report"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
    FlexGridSizer7->Add(CreateRapportBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer4->Add(FlexGridSizer7, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    Button2 = new wxButton(Panel3, ID_BUTTON5, _("Next"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON5"));
    FlexGridSizer4->Add(Button2, 1, wxALL|wxALIGN_RIGHT|wxALIGN_BOTTOM, 5);
    Panel3->SetSizer(FlexGridSizer4);
    FlexGridSizer4->Fit(Panel3);
    FlexGridSizer4->SetSizeHints(Panel3);
    Panel4 = new wxPanel(Notebook1, ID_PANEL4, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL4"));
    FlexGridSizer5 = new wxFlexGridSizer(0, 1, 0, 0);
    FlexGridSizer5->AddGrowableCol(0);
    FlexGridSizer5->AddGrowableRow(1);
    FlexGridSizer10 = new wxFlexGridSizer(0, 3, 0, 0);
    FlexGridSizer10->AddGrowableCol(0);
    FlexGridSizer10->AddGrowableRow(0);
    StaticText7 = new wxStaticText(Panel4, ID_STATICTEXT7, _("Games which were edited can have been saved, under the name of gameDumpX.gdg ( where X is a number ).\n\nGame Develop can reopen these games."), wxDefaultPosition, wxSize(424,68), 0, _T("ID_STATICTEXT7"));
    FlexGridSizer10->Add(StaticText7, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer5->Add(FlexGridSizer10, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    StaticBoxSizer4 = new wxStaticBoxSizer(wxHORIZONTAL, Panel4, _("Automatic saves"));
    FlexGridSizer13 = new wxFlexGridSizer(0, 3, 0, 0);
    StaticBitmap5 = new wxStaticBitmap(Panel4, ID_STATICBITMAP5, wxArtProvider::GetBitmap(wxART_MAKE_ART_ID_FROM_STR(_T("wxART_INFORMATION")),wxART_OTHER), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP5"));
    FlexGridSizer13->Add(StaticBitmap5, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticText4 = new wxStaticText(Panel4, ID_STATICTEXT4, _("If your game could not be saved before the crash or is corrupted\nyou can try to open an auto-save made by Game Develop. If this\noption is activated, autosave are made inside the game folder."), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT4"));
    FlexGridSizer13->Add(StaticText4, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
    StaticBoxSizer4->Add(FlexGridSizer13, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer5->Add(StaticBoxSizer4, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticBoxSizer3 = new wxStaticBoxSizer(wxHORIZONTAL, Panel4, _("Attention!"));
    FlexGridSizer6 = new wxFlexGridSizer(0, 3, 0, 0);
    FlexGridSizer6->AddGrowableCol(1);
    FlexGridSizer6->AddGrowableRow(0);
    StaticBitmap2 = new wxStaticBitmap(Panel4, ID_STATICBITMAP2, wxArtProvider::GetBitmap(wxART_MAKE_ART_ID_FROM_STR(_T("wxART_WARNING")),wxART_OTHER), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP2"));
    FlexGridSizer6->Add(StaticBitmap2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticText5 = new wxStaticText(Panel4, ID_STATICTEXT5, _("If you open the games that could be saved before the crash\nmake sure that the games are complete and not corrupted before\nsaving them on the original files."), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT5"));
    wxFont StaticText5Font(wxDEFAULT,wxDEFAULT,wxFONTSTYLE_NORMAL,wxBOLD,false,wxEmptyString,wxFONTENCODING_DEFAULT);
    StaticText5->SetFont(StaticText5Font);
    FlexGridSizer6->Add(StaticText5, 1, wxALL|wxEXPAND|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
    StaticBoxSizer3->Add(FlexGridSizer6, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer5->Add(StaticBoxSizer3, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer8 = new wxFlexGridSizer(0, 3, 0, 0);
    CloseBt = new wxButton(Panel4, ID_BUTTON2, _("Close and open the game(s)"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
    FlexGridSizer8->Add(CloseBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    CloseNoOpenBt = new wxButton(Panel4, ID_BUTTON3, _("Close but don't open the game(s)"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON3"));
    FlexGridSizer8->Add(CloseNoOpenBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer5->Add(FlexGridSizer8, 1, wxALL|wxALIGN_RIGHT|wxALIGN_BOTTOM, 0);
    Panel4->SetSizer(FlexGridSizer5);
    FlexGridSizer5->Fit(Panel4);
    FlexGridSizer5->SetSizeHints(Panel4);
    Notebook1->AddPage(Panel2, _("Explaination"), false);
    Notebook1->AddPage(Panel3, _("Error's report"), false);
    Notebook1->AddPage(Panel4, _("Your game"), false);
    FlexGridSizer1->Add(Notebook1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    SetSizer(FlexGridSizer1);
    FlexGridSizer1->Fit(this);
    FlexGridSizer1->SetSizeHints(this);
    Center();

    Connect(ID_BUTTON4,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&BugReport::OnButton1Click);
    Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&BugReport::OnCreateRapportBtClick);
    Connect(ID_BUTTON5,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&BugReport::OnButton2Click);
    Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&BugReport::OnCloseBtClick);
    Connect(ID_BUTTON3,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&BugReport::OnCloseNoOpenBtClick);
    //*)

    bugListBt->SetURL(_("http://www.wiki.compilgames.net/doku.php/en/game_develop/knownbugs/gd")+gd::ToString(GDLVersionWrapper::Major())+gd::ToString(GDLVersionWrapper::Minor())+gd::ToString(GDLVersionWrapper::Build()));
}

BugReport::~BugReport()
{
    //(*Destroy(BugReport)
    //*)
}


void BugReport::OnCreateRapportBtClick( wxCommandEvent& event )
{
    //On recherche le rapport d'erreur de Game Develop
    string rapport;
    if ( wxFileExists( "errordata.txt" ) )
    {
        wxFileInputStream input( "errordata.txt" );
        if ( input.Ok() )
        {
            wxTextInputStream text( input );
            while ( !input.Eof() )
            {
                rapport += text.ReadLine()+"\n";
            }
        }
    }
    if ( rapport == "" )
        rapport = "Pas de rapport d'erreur de Game Develop";

    wxTextFile ReportFile( "report.txt" );
    ReportFile.AddLine( "Game Develop - Rapport de bug" );
    ReportFile.AddLine( "Merci d'envoyer ce fichier à CompilGames@gmail.com" );
    ReportFile.AddLine( "Please, send this file to CompilGames@gmail.com" );
    ReportFile.AddLine( "" );

    ReportFile.AddLine( "Données de Game Develop  :" );
    ReportFile.AddLine( "--------------------------" );
    wxString version = GDLVersionWrapper::FullString();
    ReportFile.AddLine( "Version " + version );
    ReportFile.AddLine( "Système d'exploitation : " + wxGetOsDescription() );
    ReportFile.AddLine( "" );
    ReportFile.AddLine( "" );

    ReportFile.AddLine( "Rapport de Game Develop  :" );
    ReportFile.AddLine( "--------------------------" );
    ReportFile.AddLine( rapport );
    ReportFile.AddLine( "" );
    ReportFile.AddLine( "" );

    ReportFile.AddLine( "Rapport de l'utilisateur :\n" );
    ReportFile.AddLine( "--------------------------\n" );
    ReportFile.AddLine( UserReportEdit->GetValue() );
    ReportFile.AddLine( "" );
    ReportFile.AddLine( "" );

    ReportFile.Write();
    ReportFile.Close();

    wxExecute("notepad.exe "+wxGetCwd()+"/report.txt");
}

void BugReport::OnCloseNoOpenBtClick(wxCommandEvent& event)
{
    EndModal(0);
}

void BugReport::OnCloseBtClick(wxCommandEvent& event)
{
    EndModal(1);
}

void BugReport::OnButton1Click(wxCommandEvent& event)
{
    Notebook1->SetSelection(1);
}

void BugReport::OnButton2Click(wxCommandEvent& event)
{
    Notebook1->SetSelection(2);
}

