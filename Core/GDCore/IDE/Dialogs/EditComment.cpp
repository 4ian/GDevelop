#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include "EditComment.h"

//(*InternalHeaders(EditComment)
#include <wx/bitmap.h>
#include "GDCore/Tools/Localization.h"
#include <wx/image.h>
#include <wx/string.h>
//*)
#include <wx/colordlg.h>
#include "GDCore/IDE/wxTools/SkinHelper.h"
#include "GDCore/Events/Event.h"
#include "GDCore/Tools/HelpFileAccess.h"

namespace gd
{

//(*IdInit(EditComment)
const long EditComment::ID_TEXTCTRL1 = wxNewId();
const long EditComment::ID_TEXTCTRL2 = wxNewId();
const long EditComment::ID_CHECKBOX1 = wxNewId();
const long EditComment::ID_BUTTON1 = wxNewId();
const long EditComment::ID_BUTTON5 = wxNewId();
const long EditComment::ID_STATICLINE1 = wxNewId();
const long EditComment::ID_STATICBITMAP2 = wxNewId();
const long EditComment::ID_HYPERLINKCTRL1 = wxNewId();
const long EditComment::ID_BUTTON2 = wxNewId();
const long EditComment::ID_BUTTON3 = wxNewId();
//*)

BEGIN_EVENT_TABLE(EditComment,wxDialog)
	//(*EventTable(EditComment)
	//*)
END_EVENT_TABLE()

EditComment::EditComment(wxWindow* parent, CommentEvent & event_) :
commentEvent(event_)
{
	//(*Initialize(EditComment)
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer5;
	wxFlexGridSizer* FlexGridSizer2;
	wxBoxSizer* BoxSizer1;
	wxFlexGridSizer* FlexGridSizer1;

	Create(parent, wxID_ANY, _("Edit the comment"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE|wxRESIZE_BORDER|wxMINIMIZE_BOX, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(0);
	BoxSizer1 = new wxBoxSizer(wxHORIZONTAL);
	Com1Edit = new wxTextCtrl(this, ID_TEXTCTRL1, wxEmptyString, wxDefaultPosition, wxSize(332,173), wxTE_MULTILINE, wxDefaultValidator, _T("ID_TEXTCTRL1"));
	BoxSizer1->Add(Com1Edit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	Com2Edit = new wxTextCtrl(this, ID_TEXTCTRL2, wxEmptyString, wxDefaultPosition, wxSize(180,120), wxTE_MULTILINE, wxDefaultValidator, _T("ID_TEXTCTRL2"));
	BoxSizer1->Add(Com2Edit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer1->Add(BoxSizer1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer5 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer5->AddGrowableCol(0);
	CheckBox1 = new wxCheckBox(this, ID_CHECKBOX1, _("Use two columns"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX1"));
	CheckBox1->SetValue(false);
	FlexGridSizer5->Add(CheckBox1, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	ColorBt = new wxButton(this, ID_BUTTON1, _("Background color"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer5->Add(ColorBt, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	txtColorBt = new wxButton(this, ID_BUTTON5, _("Text color"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON5"));
	FlexGridSizer5->Add(txtColorBt, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer5, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticLine1 = new wxStaticLine(this, ID_STATICLINE1, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
	FlexGridSizer1->Add(StaticLine1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer2 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer2->AddGrowableCol(0);
	FlexGridSizer3 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer3->AddGrowableRow(0);
	StaticBitmap1 = new wxStaticBitmap(this, ID_STATICBITMAP2, gd::SkinHelper::GetIcon("help", 16), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP2"));
	FlexGridSizer3->Add(StaticBitmap1, 1, wxTOP|wxBOTTOM|wxLEFT|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	HyperlinkCtrl1 = new wxHyperlinkCtrl(this, ID_HYPERLINKCTRL1, _("Help"), wxEmptyString, wxDefaultPosition, wxDefaultSize, wxHL_CONTEXTMENU|wxHL_ALIGN_CENTRE|wxNO_BORDER, _T("ID_HYPERLINKCTRL1"));
	HyperlinkCtrl1->SetToolTip(_("Display help about this window"));
	FlexGridSizer3->Add(HyperlinkCtrl1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer2->Add(FlexGridSizer3, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 0);
	OkBt = new wxButton(this, ID_BUTTON2, _("Ok"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
	FlexGridSizer2->Add(OkBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	AnnulerBt = new wxButton(this, ID_BUTTON3, _("Cancel"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON3"));
	FlexGridSizer2->Add(AnnulerBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);
	Center();

	Connect(ID_CHECKBOX1,wxEVT_COMMAND_CHECKBOX_CLICKED,(wxObjectEventFunction)&EditComment::OnCheckBox1Click);
	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditComment::OnColorBtClick);
	Connect(ID_BUTTON5,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditComment::OntxtColorBtClick);
	Connect(ID_HYPERLINKCTRL1,wxEVT_COMMAND_HYPERLINK,(wxObjectEventFunction)&EditComment::OnAideBtClick);
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditComment::OnOkBtClick);
	Connect(ID_BUTTON3,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditComment::OnAnnulerBtClick);
	//*)

	Com1Edit->ChangeValue( commentEvent.com1 );
	Com2Edit->ChangeValue( commentEvent.com2 );
	Com2Edit->Show( !commentEvent.com2.empty() );
	CheckBox1->SetValue( !commentEvent.com2.empty() );

	ColorBt->SetBackgroundColour(wxColour(commentEvent.r, commentEvent.v, commentEvent.b ));
	txtColorBt->SetBackgroundColour(wxColour(commentEvent.textR, commentEvent.textG, commentEvent.textB ));
	txtColorBt->SetForegroundColour(wxColour(255-commentEvent.textR, 255-commentEvent.textG, 255-commentEvent.textB ));
}

EditComment::~EditComment()
{
	//(*Destroy(EditComment)
	//*)
}


void EditComment::OnColorBtClick(wxCommandEvent& event)
{
    wxColourData cData;
    cData.SetColour(ColorBt->GetBackgroundColour());
    wxColourDialog dialog(this, &cData);
    if (dialog.ShowModal() == wxID_OK)
    {
        cData = dialog.GetColourData();
        ColorBt->SetBackgroundColour(cData.GetColour());
        ColorBt->Refresh();
    }

}

void EditComment::OnOkBtClick(wxCommandEvent& event)
{
    commentEvent.com1 = Com1Edit->GetValue();
    commentEvent.com2 = Com2Edit->GetValue();

    commentEvent.r = ColorBt->GetBackgroundColour().Red();
    commentEvent.v = ColorBt->GetBackgroundColour().Green();
    commentEvent.b = ColorBt->GetBackgroundColour().Blue();

    commentEvent.textR = txtColorBt->GetBackgroundColour().Red();
    commentEvent.textG = txtColorBt->GetBackgroundColour().Green();
    commentEvent.textB = txtColorBt->GetBackgroundColour().Blue();

    EndModal(1);
}

void EditComment::OnAnnulerBtClick(wxCommandEvent& event)
{
    EndModal(0);
}

void EditComment::OnAideBtClick(wxCommandEvent& event)
{
    gd::HelpFileAccess::Get()->OpenPage("game_develop/documentation/manual/comment_events");
}
void EditComment::OntxtColorBtClick(wxCommandEvent& event)
{
    wxColourData cData;
    cData.SetColour(txtColorBt->GetBackgroundColour());
    wxColourDialog Dialog(this, &cData);
    if ( Dialog.ShowModal() == wxID_OK)
    {
        cData = Dialog.GetColourData();
        txtColorBt->SetBackgroundColour(cData.GetColour());
        txtColorBt->SetForegroundColour(wxColour(255-txtColorBt->GetBackgroundColour().Red(), 255-txtColorBt->GetBackgroundColour().Green(), 255-txtColorBt->GetBackgroundColour().Blue() ));
        txtColorBt->Refresh();
    }
}

void EditComment::OnCheckBox1Click(wxCommandEvent& event)
{
    Com2Edit->Show(CheckBox1->GetValue());
    Layout();
}

}
#endif
