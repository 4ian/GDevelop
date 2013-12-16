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
#include "GDCore/CommonTools.h"

//(*IdInit(ReminderDialog)
const long ReminderDialog::ID_STATICTEXT1 = wxNewId();
const long ReminderDialog::ID_STATICBITMAP1 = wxNewId();
const long ReminderDialog::ID_STATICTEXT2 = wxNewId();
const long ReminderDialog::ID_HYPERLINKCTRL1 = wxNewId();
const long ReminderDialog::ID_BUTTON1 = wxNewId();
const long ReminderDialog::ID_BUTTON2 = wxNewId();
//*)

BEGIN_EVENT_TABLE(ReminderDialog,wxDialog)
	//(*EventTable(ReminderDialog)
	//*)
END_EVENT_TABLE()

ReminderDialog::ReminderDialog(wxWindow* parent,wxWindowID id,const wxPoint& pos,const wxSize& size)
{
	//(*Initialize(ReminderDialog)
	wxFlexGridSizer* FlexGridSizer4;
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer2;
	wxFlexGridSizer* FlexGridSizer1;

	Create(parent, wxID_ANY, _("Support Game Develop"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer1->AddGrowableRow(1);
	StaticText1 = new wxStaticText(this, ID_STATICTEXT1, _("Thank you for using Game Develop!"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	wxFont StaticText1Font(13,wxDEFAULT,wxFONTSTYLE_NORMAL,wxNORMAL,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	StaticText1->SetFont(StaticText1Font);
	FlexGridSizer1->Add(StaticText1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer4 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer4->AddGrowableRow(0);
	imageBmp = new wxStaticBitmap(this, ID_STATICBITMAP1, wxBitmap(wxImage(_T("res/reminder-1.png"))), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP1"));
	imageBmp->SetToolTip(_("This image is chosen at random each time the window is shown!"));
	FlexGridSizer4->Add(imageBmp, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer3 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer3->AddGrowableRow(2);
	StaticText2 = new wxStaticText(this, ID_STATICTEXT2, _("Game Develop is a \"Pay what you want\" software:\nYou can use it freely, but its development costs a\nlot of time, as well as money.\n\nIf Game Develop proves to be useful to you, you\ncan support its author by paying anything you want:"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
	FlexGridSizer3->Add(StaticText2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	HyperlinkCtrl1 = new wxHyperlinkCtrl(this, ID_HYPERLINKCTRL1, _("Donate"), _("http://www.compilgames.net/donate.php"), wxDefaultPosition, wxDefaultSize, wxHL_CONTEXTMENU|wxHL_ALIGN_CENTRE|wxNO_BORDER, _T("ID_HYPERLINKCTRL1"));
	FlexGridSizer3->Add(HyperlinkCtrl1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer3->Add(20,26,1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer2 = new wxFlexGridSizer(0, 3, 0, 0);
	neverBt = new wxButton(this, ID_BUTTON1, _("Never show again ;)"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer2->Add(neverBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	laterBt = new wxButton(this, ID_BUTTON2, _("No thanks, maybe later! :)"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
	laterBt->SetToolTip(_("This window will be shown when you\'ll be launching GD for the third time in a row"));
	FlexGridSizer2->Add(laterBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer3->Add(FlexGridSizer2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer4->Add(FlexGridSizer3, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer1->Add(FlexGridSizer4, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);
	Center();

	Connect(ID_HYPERLINKCTRL1,wxEVT_COMMAND_HYPERLINK,(wxObjectEventFunction)&ReminderDialog::OnHyperlinkCtrl1Click);
	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ReminderDialog::OnneverBtClick);
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ReminderDialog::OnlaterBtClick);
	Connect(wxID_ANY,wxEVT_CLOSE_WINDOW,(wxObjectEventFunction)&ReminderDialog::OnClose);
	//*)
	wxIcon frameIcon;
	frameIcon.CopyFromBitmap(wxBitmap(wxImage(_T("res/hearticon.png"))));
	SetIcon(frameIcon);

    srand(static_cast<unsigned int>(time(NULL)));
    imageId = gd::ToString(rand()%3 + 1);
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

    link += "?utm_source=GD&utm_medium=ReminderDialog&utm_campaign=paywhatyouwant";
    link += "&utm_content="+imageId;

    OpenLink(link);
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
