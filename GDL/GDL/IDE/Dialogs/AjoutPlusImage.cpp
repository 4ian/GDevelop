/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)
#include "GDL/AjoutPlusImage.h"

//(*InternalHeaders(AjoutPlusImage)
#include <wx/bitmap.h>
#include <wx/settings.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)

//(*IdInit(AjoutPlusImage)
const long AjoutPlusImage::ID_STATICBITMAP3 = wxNewId();
const long AjoutPlusImage::ID_STATICTEXT1 = wxNewId();
const long AjoutPlusImage::ID_PANEL1 = wxNewId();
const long AjoutPlusImage::ID_STATICLINE1 = wxNewId();
const long AjoutPlusImage::ID_TEXTCTRL1 = wxNewId();
const long AjoutPlusImage::ID_BUTTON1 = wxNewId();
const long AjoutPlusImage::ID_BUTTON2 = wxNewId();
//*)

BEGIN_EVENT_TABLE(AjoutPlusImage,wxDialog)
	//(*EventTable(AjoutPlusImage)
	//*)
END_EVENT_TABLE()

AjoutPlusImage::AjoutPlusImage(wxWindow* parent)
{
	//(*Initialize(AjoutPlusImage)
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer2;
	wxFlexGridSizer* FlexGridSizer6;
	wxFlexGridSizer* FlexGridSizer1;
	wxFlexGridSizer* FlexGridSizer17;

	Create(parent, wxID_ANY, _("Ajouter plusieurs images"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer17 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer17->AddGrowableCol(0);
	Panel1 = new wxPanel(this, ID_PANEL1, wxDefaultPosition, wxSize(420,54), wxTAB_TRAVERSAL, _T("ID_PANEL1"));
	Panel1->SetBackgroundColour(wxSystemSettings::GetColour(wxSYS_COLOUR_WINDOW));
	FlexGridSizer6 = new wxFlexGridSizer(0, 3, 0, 0);
	StaticBitmap3 = new wxStaticBitmap(Panel1, ID_STATICBITMAP3, wxBitmap(wxImage(_T("res/addmore64.png"))), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICBITMAP3"));
	FlexGridSizer6->Add(StaticBitmap3, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	StaticText1 = new wxStaticText(Panel1, ID_STATICTEXT1, _("Ecrivez les noms des images à ajouter.\nMettez un nom d\'image par ligne."), wxDefaultPosition, wxDefaultSize, wxALIGN_CENTRE, _T("ID_STATICTEXT1"));
	FlexGridSizer6->Add(StaticText1, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	Panel1->SetSizer(FlexGridSizer6);
	FlexGridSizer6->SetSizeHints(Panel1);
	FlexGridSizer17->Add(Panel1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticLine1 = new wxStaticLine(this, ID_STATICLINE1, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
	FlexGridSizer17->Add(StaticLine1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer1->Add(FlexGridSizer17, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer2 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer2->AddGrowableCol(0);
	FlexGridSizer2->AddGrowableRow(0);
	ImagesEdit = new wxTextCtrl(this, ID_TEXTCTRL1, wxEmptyString, wxDefaultPosition, wxSize(260,136), wxTE_MULTILINE|wxTE_DONTWRAP, wxDefaultValidator, _T("ID_TEXTCTRL1"));
	FlexGridSizer2->Add(ImagesEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer3 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer3->AddGrowableCol(0);
	AddImageBt = new wxButton(this, ID_BUTTON1, _("Ajouter"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer3->Add(AddImageBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	AnnulerBt = new wxButton(this, ID_BUTTON2, _("Annuler"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
	FlexGridSizer3->Add(AnnulerBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer3, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);
	Center();

	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&AjoutPlusImage::OnAddImageBtClick);
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&AjoutPlusImage::OnAnnulerBtClick);
	//*)
}

AjoutPlusImage::~AjoutPlusImage()
{
	//(*Destroy(AjoutPlusImage)
	//*)
}


void AjoutPlusImage::OnAnnulerBtClick(wxCommandEvent& event)
{
    EndModal(0);
}


void AjoutPlusImage::OnAddImageBtClick(wxCommandEvent& event)
{
    ImagesToAdd.clear();

    //On recompose en rajoutant des ; entre chaque image
    for (int i = 0;i < ImagesEdit->GetNumberOfLines() ;i++ )
    {
        ImagesToAdd.push_back(string(ImagesEdit->GetLineText(i).mb_str()));
    }

    EndModal(1);
}
#endif
