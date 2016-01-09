#include "ReminderDialog.h"

//(*InternalHeaders(ReminderDialog)
#include <wx/bitmap.h>
#include <wx/font.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include <wx/mimetype.h>
#include <stdlib.h>
#include <stdio.h>
#include <time.h>
#include <wx/config.h>
#include <wx/uri.h>
#include <SFML/Network.hpp>
#include "GDCore/CommonTools.h"
#include "GDCore/Tools/Log.h"
#include "GDCore/Tools/Localization.h"

//(*IdInit(ReminderDialog)
const long ReminderDialog::ID_STATICTEXT1 = wxNewId();
const long ReminderDialog::ID_STATICTEXT4 = wxNewId();
const long ReminderDialog::ID_TEXTCTRL1 = wxNewId();
const long ReminderDialog::ID_STATICTEXT5 = wxNewId();
const long ReminderDialog::ID_TEXTCTRL2 = wxNewId();
const long ReminderDialog::ID_BUTTON3 = wxNewId();
const long ReminderDialog::ID_STATICLINE1 = wxNewId();
const long ReminderDialog::ID_STATICBITMAP1 = wxNewId();
const long ReminderDialog::ID_STATICTEXT3 = wxNewId();
const long ReminderDialog::ID_HYPERLINKCTRL2 = wxNewId();
const long ReminderDialog::ID_BUTTON1 = wxNewId();
const long ReminderDialog::ID_BUTTON2 = wxNewId();
//*)

BEGIN_EVENT_TABLE(ReminderDialog,wxDialog)
	//(*EventTable(ReminderDialog)
	//*)
END_EVENT_TABLE()

ReminderDialog::ReminderDialog(wxWindow* parent,wxWindowID id,const wxPoint& pos,const wxSize& size) :
	feedbackWritten(false)
{
	//(*Initialize(ReminderDialog)
	wxFlexGridSizer* FlexGridSizer4;
	wxFlexGridSizer* FlexGridSizer5;
	wxFlexGridSizer* FlexGridSizer2;
	wxFlexGridSizer* FlexGridSizer7;
	wxFlexGridSizer* FlexGridSizer8;
	wxFlexGridSizer* FlexGridSizer6;
	wxFlexGridSizer* FlexGridSizer1;

	Create(parent, wxID_ANY, _("Support GDevelop"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer1->AddGrowableRow(2);
	StaticText1 = new wxStaticText(this, ID_STATICTEXT1, _("Thank you for using GDevelop!"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	wxFont StaticText1Font(13,wxFONTFAMILY_DEFAULT,wxFONTSTYLE_NORMAL,wxFONTWEIGHT_NORMAL,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	StaticText1->SetFont(StaticText1Font);
	FlexGridSizer1->Add(StaticText1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer7 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer7->AddGrowableCol(0);
	StaticText4 = new wxStaticText(this, ID_STATICTEXT4, _("We\'d love to get your feedback about GDevelop! You can write us something\nabout the software:"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT4"));
	FlexGridSizer7->Add(StaticText4, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	feedbackEdit = new wxTextCtrl(this, ID_TEXTCTRL1, _("Write a short sentence about GD!"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL1"));
	FlexGridSizer7->Add(feedbackEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer8 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer8->AddGrowableCol(1);
	StaticText5 = new wxStaticText(this, ID_STATICTEXT5, _("Your mail address:"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT5"));
	FlexGridSizer8->Add(StaticText5, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	mailEdit = new wxTextCtrl(this, ID_TEXTCTRL2, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL2"));
	mailEdit->SetToolTip(_("No worries, it won\'t be shared with any 3rd parties! It\'s just useful for us if we want to discuss with you :D"));
	FlexGridSizer8->Add(mailEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	sendBt = new wxButton(this, ID_BUTTON3, _("Send!"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON3"));
	FlexGridSizer8->Add(sendBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer7->Add(FlexGridSizer8, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticLine1 = new wxStaticLine(this, ID_STATICLINE1, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
	FlexGridSizer7->Add(StaticLine1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer7, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer4 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer4->AddGrowableRow(0);
	imageBmp = new wxStaticBitmap(this, ID_STATICBITMAP1, wxBitmap(wxImage(_T("res/reminder-1.png"))), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP1"));
	imageBmp->SetToolTip(_("This image is chosen at random each time the window is shown!"));
	FlexGridSizer4->Add(imageBmp, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer5 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer5->AddGrowableCol(0);
	FlexGridSizer5->AddGrowableRow(0);
	FlexGridSizer6 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer6->AddGrowableRow(2);
	StaticText3 = new wxStaticText(this, ID_STATICTEXT3, _("GDevelop is an open source software:\nYou can use it freely, but its development costs a\nlot of time, as well as money.\n\nIf GDevelop proves to be useful to you, you\ncan support its authors by donating or contributing\nto the project:"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT3"));
	FlexGridSizer6->Add(StaticText3, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	HyperlinkCtrl2 = new wxHyperlinkCtrl(this, ID_HYPERLINKCTRL2, _("Donate or contribute to GDevelop"), wxEmptyString, wxDefaultPosition, wxDefaultSize, wxHL_CONTEXTMENU|wxHL_ALIGN_CENTRE|wxNO_BORDER, _T("ID_HYPERLINKCTRL2"));
	FlexGridSizer6->Add(HyperlinkCtrl2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer6->Add(-1,-1,1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer5->Add(FlexGridSizer6, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer2 = new wxFlexGridSizer(0, 3, 0, 0);
	neverBt = new wxButton(this, ID_BUTTON1, _("Never show again ;)"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer2->Add(neverBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	laterBt = new wxButton(this, ID_BUTTON2, _("No thanks, maybe later! :)"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
	laterBt->SetToolTip(_("This window will be shown when you\'ll be launching GD for the third time in a row"));
	FlexGridSizer2->Add(laterBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer5->Add(FlexGridSizer2, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer4->Add(FlexGridSizer5, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer1->Add(FlexGridSizer4, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);
	Center();

	Connect(ID_TEXTCTRL1,wxEVT_COMMAND_TEXT_UPDATED,(wxObjectEventFunction)&ReminderDialog::OnfeedbackEditText);
	Connect(ID_BUTTON3,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ReminderDialog::OnsendBtClick);
	Connect(ID_HYPERLINKCTRL2,wxEVT_COMMAND_HYPERLINK,(wxObjectEventFunction)&ReminderDialog::OnHyperlinkCtrl1Click);
	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ReminderDialog::OnneverBtClick);
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ReminderDialog::OnlaterBtClick);
	Connect(wxID_ANY,wxEVT_CLOSE_WINDOW,(wxObjectEventFunction)&ReminderDialog::OnClose);
	//*)
	wxIcon frameIcon;
	frameIcon.CopyFromBitmap(wxBitmap(wxImage(_T("res/hearticon.png"))));
	SetIcon(frameIcon);

    srand(static_cast<unsigned int>(time(NULL)));
    imageId = gd::String::From(rand()%3 + 1);
    imageBmp->SetBitmap(wxBitmap(wxImage("res/reminder-"+imageId+".png")));
}

ReminderDialog::~ReminderDialog()
{
	//(*Destroy(ReminderDialog)
	//*)
}
void ReminderDialog::OpenLink(wxString link)
{
    wxString mimetype = wxEmptyString;
    if (link.StartsWith (_T("http://"))) {
        mimetype = _T("text/html");
    }else if (link.StartsWith (_T("https://"))) {
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

void ReminderDialog::OnHyperlinkCtrl1Click(wxCommandEvent& event)
{
    wxString link = _("http://www.compilgames.net/donate.php");
    if ( !link.StartsWith("http://www.compilgames.net/") ) link = "http://www.compilgames.net/donate.php";

    link += "?utm_source=GD&utm_medium=ReminderDialog&utm_campaign=donateorcontribute";
    link += "&utm_content="+imageId;

    OpenLink(link);
    wxConfigBase::Get()->Write("Startup/Reminder", -1);
    EndModal(0);
}

void ReminderDialog::OnneverBtClick(wxCommandEvent& event)
{
    wxConfigBase::Get()->Write("Startup/Reminder", -1);
    EndModal(0);
}
void ReminderDialog::OnlaterBtClick(wxCommandEvent& event)
{
    wxConfigBase::Get()->Write("Startup/Reminder", 3);
    EndModal(0);
}

void ReminderDialog::OnClose(wxCloseEvent& event)
{
    wxConfigBase::Get()->Write("Startup/Reminder", 3);
    EndModal(0);
}

void ReminderDialog::OnsendBtClick(wxCommandEvent& event)
{
	if (feedbackEdit->GetValue().empty() || !feedbackWritten ) {
		gd::LogMessage(_("You didn't entered any feedback! :O"));
		return;
	}
    wxString report;
    report += "User mail: "+mailEdit->GetValue()+"\n";
    report += "Feedback: "+feedbackEdit->GetValue()+"\n";
    report.Replace("&", "%26");

    wxString encodedReportURI = wxURI("www.compilgames.net/feedback/send.php?msg="+report).BuildURI();
    wxURI requestURI(encodedReportURI);
    std::cout << "Sending feedback with these data:" << requestURI.GetQuery() << std::endl;

    // Create request
    sf::Http Http;
    Http.setHost("http://www.compilgames.net");
    sf::Http::Request request;
    request.setMethod(sf::Http::Request::Post);
    request.setField("Content-Type", "application/x-www-form-urlencoded");
    request.setUri("/feedback/send.php");
    request.setBody(gd::String(requestURI.GetQuery()).ToSfString());

    // Send the request
    sf::Http::Response response = Http.sendRequest(request, sf::seconds(5));

    if (response.getStatus() != sf::Http::Response::Ok)
        std::cout << "Unable to connect to the server for sending the feedback!" << std::endl;
    else {
        gd::LogMessage(_("Thanks for your feedback!"));
        sendBt->Disable();
    }
}
void ReminderDialog::OnfeedbackEditText(wxCommandEvent& event)
{
	feedbackWritten = true;
}
