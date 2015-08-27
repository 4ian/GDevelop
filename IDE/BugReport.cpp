/*
 * GDevelop IDE
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU General Public License version 3.
 */

#include "BugReport.h"

//(*InternalHeaders(BugReport)
#include <wx/artprov.h>
#include <wx/bitmap.h>
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
#include <SFML/Network.hpp>
#include <wx/uri.h>
#include "GDCore/Tools/Log.h"
#include "GDCore/Tools/Localization.h"

using namespace std;

//(*IdInit(BugReport)
const long BugReport::ID_STATICBITMAP3 = wxNewId();
const long BugReport::ID_STATICTEXT2 = wxNewId();
const long BugReport::ID_STATICBITMAP4 = wxNewId();
const long BugReport::ID_STATICTEXT8 = wxNewId();
const long BugReport::ID_HYPERLINKCTRL1 = wxNewId();
const long BugReport::ID_BUTTON4 = wxNewId();
const long BugReport::ID_PANEL2 = wxNewId();
const long BugReport::ID_STATICTEXT3 = wxNewId();
const long BugReport::ID_TEXTCTRL1 = wxNewId();
const long BugReport::ID_STATICTEXT1 = wxNewId();
const long BugReport::ID_TEXTCTRL3 = wxNewId();
const long BugReport::ID_STATICTEXT6 = wxNewId();
const long BugReport::ID_BUTTON1 = wxNewId();
const long BugReport::ID_BUTTON5 = wxNewId();
const long BugReport::ID_PANEL3 = wxNewId();
const long BugReport::ID_STATICTEXT7 = wxNewId();
const long BugReport::ID_TEXTCTRL2 = wxNewId();
const long BugReport::ID_STATICTEXT4 = wxNewId();
const long BugReport::ID_BUTTON3 = wxNewId();
const long BugReport::ID_BUTTON2 = wxNewId();
const long BugReport::ID_PANEL4 = wxNewId();
const long BugReport::ID_NOTEBOOK1 = wxNewId();
//*)

BEGIN_EVENT_TABLE( BugReport, wxDialog )
    //(*EventTable(BugReport)
    //*)
END_EVENT_TABLE()

BugReport::BugReport( wxWindow* parent, const std::vector<gd::String> & openedFiles_ ) :
    openedFiles(openedFiles_)
{
    //(*Initialize(BugReport)
    wxStaticBoxSizer* StaticBoxSizer2;
    wxFlexGridSizer* FlexGridSizer4;
    wxFlexGridSizer* FlexGridSizer10;
    wxFlexGridSizer* FlexGridSizer3;
    wxFlexGridSizer* FlexGridSizer5;
    wxFlexGridSizer* FlexGridSizer9;
    wxFlexGridSizer* FlexGridSizer2;
    wxFlexGridSizer* FlexGridSizer7;
    wxFlexGridSizer* FlexGridSizer8;
    wxFlexGridSizer* FlexGridSizer12;
    wxFlexGridSizer* FlexGridSizer1;
    wxFlexGridSizer* FlexGridSizer11;

    Create(parent, wxID_ANY, _("Something bad happened!"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE, _T("wxID_ANY"));
    FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
    FlexGridSizer1->AddGrowableCol(0);
    FlexGridSizer1->AddGrowableRow(0);
    Notebook1 = new wxNotebook(this, ID_NOTEBOOK1, wxDefaultPosition, wxDefaultSize, 0, _T("ID_NOTEBOOK1"));
    Panel2 = new wxPanel(Notebook1, ID_PANEL2, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL2"));
    FlexGridSizer3 = new wxFlexGridSizer(0, 1, 0, 0);
    FlexGridSizer3->AddGrowableCol(0);
    FlexGridSizer3->AddGrowableRow(0);
    FlexGridSizer9 = new wxFlexGridSizer(0, 3, 0, 0);
    StaticBitmap3 = new wxStaticBitmap(Panel2, ID_STATICBITMAP3, wxArtProvider::GetBitmap(wxART_MAKE_ART_ID_FROM_STR(_T("wxART_INFORMATION")),wxART_OTHER), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP3"));
    FlexGridSizer9->Add(StaticBitmap3, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticText2 = new wxStaticText(Panel2, ID_STATICTEXT2, _("It seems that GDevelop has closed abruptly after an\nerror. GDevelop should never freeze or crash whatever \nthe user make. You can help us correct the problem by filling\nthe error report."), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
    FlexGridSizer9->Add(StaticText2, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer3->Add(FlexGridSizer9, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticBoxSizer2 = new wxStaticBoxSizer(wxHORIZONTAL, Panel2, _("Known bugs for this version of GDevelop"));
    FlexGridSizer11 = new wxFlexGridSizer(0, 3, 0, 0);
    FlexGridSizer11->AddGrowableCol(1);
    FlexGridSizer11->AddGrowableRow(0);
    StaticBitmap4 = new wxStaticBitmap(Panel2, ID_STATICBITMAP4, wxBitmap(wxImage(_T("res/internet32.png"))), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP4"));
    FlexGridSizer11->Add(StaticBitmap4, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer12 = new wxFlexGridSizer(0, 1, 0, 0);
    StaticText8 = new wxStaticText(Panel2, ID_STATICTEXT8, _("You can visit a page on our website which can\ncontain known bugs for this version of GDevelop:"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT8"));
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
    StaticText3 = new wxStaticText(Panel3, ID_STATICTEXT3, _("To help us solve the problem, try to describe the error as precisely as\nyou can. Indicate if possible:\n-How did the error happened (Click on a button ...)\n-In which part of program (Scene editor, events editor...)"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT3"));
    FlexGridSizer4->Add(StaticText3, 1, wxALL|wxEXPAND|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
    UserReportEdit = new wxTextCtrl(Panel3, ID_TEXTCTRL1, wxEmptyString, wxDefaultPosition, wxSize(408,100), wxTE_AUTO_SCROLL|wxTE_MULTILINE, wxDefaultValidator, _T("ID_TEXTCTRL1"));
    FlexGridSizer4->Add(UserReportEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer2 = new wxFlexGridSizer(0, 1, 0, 0);
    StaticText1 = new wxStaticText(Panel3, ID_STATICTEXT1, _("You can enter your email: (optional, so as to contact you if we need more information)"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
    FlexGridSizer2->Add(StaticText1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    mailEdit = new wxTextCtrl(Panel3, ID_TEXTCTRL3, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL3"));
    FlexGridSizer2->Add(mailEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer4->Add(FlexGridSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer7 = new wxFlexGridSizer(0, 3, 0, 0);
    FlexGridSizer7->AddGrowableCol(1);
    FlexGridSizer7->AddGrowableRow(0);
    StaticText6 = new wxStaticText(Panel3, ID_STATICTEXT6, _("When you\'ve described the error, click on the button\nto automatically send the report.\n\nThanks!"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT6"));
    FlexGridSizer7->Add(StaticText6, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    CreateRapportBt = new wxButton(Panel3, ID_BUTTON1, _("Send my report!"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
    FlexGridSizer7->Add(CreateRapportBt, 1, wxALL|wxALIGN_TOP|wxALIGN_CENTER_HORIZONTAL, 5);
    FlexGridSizer4->Add(FlexGridSizer7, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    Button2 = new wxButton(Panel3, ID_BUTTON5, _("Next"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON5"));
    FlexGridSizer4->Add(Button2, 1, wxALL|wxALIGN_RIGHT|wxALIGN_BOTTOM, 5);
    Panel3->SetSizer(FlexGridSizer4);
    FlexGridSizer4->Fit(Panel3);
    FlexGridSizer4->SetSizeHints(Panel3);
    Panel4 = new wxPanel(Notebook1, ID_PANEL4, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL4"));
    FlexGridSizer5 = new wxFlexGridSizer(0, 1, 0, 0);
    FlexGridSizer5->AddGrowableCol(0);
    FlexGridSizer5->AddGrowableRow(0);
    FlexGridSizer10 = new wxFlexGridSizer(0, 1, 0, 0);
    FlexGridSizer10->AddGrowableCol(0);
    FlexGridSizer10->AddGrowableRow(1);
    StaticText7 = new wxStaticText(Panel4, ID_STATICTEXT7, _("Here is a list of the projects opened during the last session:"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT7"));
    FlexGridSizer10->Add(StaticText7, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    openedFilesEdit = new wxTextCtrl(Panel4, ID_TEXTCTRL2, wxEmptyString, wxDefaultPosition, wxDefaultSize, wxTE_AUTO_SCROLL|wxTE_MULTILINE|wxTE_READONLY, wxDefaultValidator, _T("ID_TEXTCTRL2"));
    FlexGridSizer10->Add(openedFilesEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer5->Add(FlexGridSizer10, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    StaticText4 = new wxStaticText(Panel4, ID_STATICTEXT4, _("GDevelop may have made automatic backups of these projects. When you\'ll\nclose this window, the backups will be opened. If these backup are not corrupted,\nyou can save them over the original project files."), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT4"));
    FlexGridSizer5->Add(StaticText4, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer8 = new wxFlexGridSizer(0, 3, 0, 0);
    CloseNoOpenBt = new wxButton(Panel4, ID_BUTTON3, _("Close but don\'t open the autosave(s)"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON3"));
    FlexGridSizer8->Add(CloseNoOpenBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    CloseBt = new wxButton(Panel4, ID_BUTTON2, _("Close"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
    FlexGridSizer8->Add(CloseBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer5->Add(FlexGridSizer8, 1, wxALL|wxALIGN_RIGHT|wxALIGN_BOTTOM, 0);
    Panel4->SetSizer(FlexGridSizer5);
    FlexGridSizer5->Fit(Panel4);
    FlexGridSizer5->SetSizeHints(Panel4);
    Notebook1->AddPage(Panel2, _("Oops..."), false);
    Notebook1->AddPage(Panel3, _("Report the error"), false);
    Notebook1->AddPage(Panel4, _("Load autosaves"), false);
    FlexGridSizer1->Add(Notebook1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    SetSizer(FlexGridSizer1);
    FlexGridSizer1->Fit(this);
    FlexGridSizer1->SetSizeHints(this);
    Center();

    Connect(ID_BUTTON4,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&BugReport::OnButton1Click);
    Connect(ID_TEXTCTRL1,wxEVT_COMMAND_TEXT_UPDATED,(wxObjectEventFunction)&BugReport::OnUserReportEditText);
    Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&BugReport::OnCreateRapportBtClick);
    Connect(ID_BUTTON5,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&BugReport::OnButton2Click);
    Connect(ID_BUTTON3,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&BugReport::OnCloseNoOpenBtClick);
    Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&BugReport::OnCloseBtClick);
    //*)

    for (std::size_t i = 0; i < openedFiles.size(); ++i)
    {
        gd::String file = openedFiles[i];
        if (!wxFileExists(file+".autosave"))
            file += _(" (Autosave not found!)");
        openedFilesEdit->AppendText(file+"\n");
    }
    if (openedFiles.empty()) {
        Notebook1->RemovePage(2);
        Button2->SetLabel(_("Close"));
    }

    CreateRapportBt->Disable();
    bugListBt->SetURL(_("http://www.wiki.compilgames.net/doku.php/en/game_develop/knownbugs/gd")+gd::String::From(gd::VersionWrapper::Major())+gd::String::From(gd::VersionWrapper::Minor())+gd::String::From(gd::VersionWrapper::Build()));
}

BugReport::~BugReport()
{
    //(*Destroy(BugReport)
    //*)
}


void BugReport::OnCreateRapportBtClick( wxCommandEvent& event )
{
    if (UserReportEdit->GetValue().Trim().IsEmpty() || UserReportEdit->GetValue().length() < 7)
        return;

    //On recherche le rapport d'erreur de GDevelop
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
        rapport = "No GDevelop error report";

    wxString report;
    report += "GD Error report:\n\n";
    report += "V: " + gd::VersionWrapper::FullString()+"\n";
    report += "OS: " + wxGetOsDescription()+"\n";
    report += "Trace:\n";
    report += rapport;
    report += "(End)\n";
    report += "User desc.:\n";
    report += UserReportEdit->GetValue();
    report += "(End)\n";
    report += "User mail: "+mailEdit->GetValue()+"\n";
    report.Replace("&", "%26");

    wxString encodedReportURI = wxURI("www.compilgames.net/bugs/report.php?report="+report).BuildURI();
    wxURI requestURI(encodedReportURI);
    std::cout << "Sending report with these data:" << requestURI.GetQuery() << std::endl;

    // Create request
    sf::Http Http;
    Http.setHost("http://www.compilgames.net");
    sf::Http::Request request;
    request.setMethod(sf::Http::Request::Post);
    request.setField("Content-Type", "application/x-www-form-urlencoded");
    request.setUri("/bugs/report.php");
    request.setBody(gd::String(requestURI.GetQuery()).ToSfString());

    // Send the request
    sf::Http::Response response = Http.sendRequest(request, sf::seconds(5));

    if (response.getStatus() != sf::Http::Response::Ok)
        std::cout << "Unable to connect to the server for sending the report!" << std::endl;
    else {
        gd::LogMessage(_("Thanks for reporting the error!"));
        CreateRapportBt->Disable();
    }
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
    if (openedFiles.empty())
        EndModal(0);
    else
        Notebook1->SetSelection(2);
}


void BugReport::OnUserReportEditText(wxCommandEvent& event)
{
    CreateRapportBt->Enable();
}
