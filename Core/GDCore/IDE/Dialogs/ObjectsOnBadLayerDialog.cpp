/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include "ObjectsOnBadLayerDialog.h"

//(*InternalHeaders(ObjectsOnBadLayerDialog)
#include <wx/artprov.h>
#include <wx/bitmap.h>
#include "GDCore/Tools/Localization.h"
#include <wx/image.h>
#include <wx/string.h>
//*)
#include "GDCore/String.h"
#include <vector>
#include "GDCore/CommonTools.h"

namespace gd
{

//(*IdInit(ObjectsOnBadLayerDialog)
const long ObjectsOnBadLayerDialog::ID_STATICBITMAP1 = wxNewId();
const long ObjectsOnBadLayerDialog::ID_STATICTEXT1 = wxNewId();
const long ObjectsOnBadLayerDialog::ID_PANEL1 = wxNewId();
const long ObjectsOnBadLayerDialog::ID_STATICLINE1 = wxNewId();
const long ObjectsOnBadLayerDialog::ID_BUTTON1 = wxNewId();
const long ObjectsOnBadLayerDialog::ID_BUTTON2 = wxNewId();
const long ObjectsOnBadLayerDialog::ID_STATICTEXT2 = wxNewId();
const long ObjectsOnBadLayerDialog::ID_CHOICE1 = wxNewId();
const long ObjectsOnBadLayerDialog::ID_BUTTON3 = wxNewId();
//*)

BEGIN_EVENT_TABLE(ObjectsOnBadLayerDialog,wxDialog)
	//(*EventTable(ObjectsOnBadLayerDialog)
	//*)
END_EVENT_TABLE()

ObjectsOnBadLayerDialog::ObjectsOnBadLayerDialog(wxWindow* parent, const std::vector < gd::String > & availableLayers)
{
	//(*Initialize(ObjectsOnBadLayerDialog)
	wxFlexGridSizer* FlexGridSizer4;
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer2;
	wxFlexGridSizer* FlexGridSizer1;

	Create(parent, wxID_ANY, _("Objects on the layer to delete"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	Panel1 = new wxPanel(this, ID_PANEL1, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL1"));
	Panel1->SetBackgroundColour(wxColour(255,255,255));
	FlexGridSizer2 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer2->AddGrowableCol(0);
	FlexGridSizer4 = new wxFlexGridSizer(0, 3, 0, 0);
	StaticBitmap1 = new wxStaticBitmap(Panel1, ID_STATICBITMAP1, wxArtProvider::GetBitmap(wxART_MAKE_ART_ID_FROM_STR(_T("wxART_QUESTION")),wxART_MAKE_CLIENT_ID_FROM_STR(wxString(_T("wxART_MESSAGE_BOX")))), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICBITMAP1"));
	FlexGridSizer4->Add(StaticBitmap1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText1 = new wxStaticText(Panel1, ID_STATICTEXT1, _("What to make of objects on the layer to delete \?"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	FlexGridSizer4->Add(StaticText1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer2->Add(FlexGridSizer4, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	Panel1->SetSizer(FlexGridSizer2);
	FlexGridSizer2->Fit(Panel1);
	FlexGridSizer2->SetSizeHints(Panel1);
	FlexGridSizer1->Add(Panel1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticLine1 = new wxStaticLine(this, ID_STATICLINE1, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
	FlexGridSizer1->Add(StaticLine1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer3 = new wxFlexGridSizer(0, 5, 0, 0);
	Button1 = new wxButton(this, ID_BUTTON1, _("Delete them"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer3->Add(Button1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	Button2 = new wxButton(this, ID_BUTTON2, _("Move them"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
	FlexGridSizer3->Add(Button2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText2 = new wxStaticText(this, ID_STATICTEXT2, _("on the layer :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
	FlexGridSizer3->Add(StaticText2, 0, wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	Choice1 = new wxChoice(this, ID_CHOICE1, wxPoint(13,16), wxSize(93,21), 0, 0, 0, wxDefaultValidator, _T("ID_CHOICE1"));
	FlexGridSizer3->Add(Choice1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	Button3 = new wxButton(this, ID_BUTTON3, _("Cancel"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON3"));
	FlexGridSizer3->Add(Button3, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer3, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ObjectsOnBadLayerDialog::OnDelClick);
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ObjectsOnBadLayerDialog::OnMoveClick);
	Connect(ID_BUTTON3,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ObjectsOnBadLayerDialog::OnCancelClick);
	//*)

	for (std::size_t i =0;i<availableLayers.size();++i)
	{
	    gd::String name = availableLayers[i];
	    if ( name == "" ) name = _("Base layer");
		Choice1->Insert(name, 0);
	}
	Choice1->SetSelection(0);
}

ObjectsOnBadLayerDialog::~ObjectsOnBadLayerDialog()
{
	//(*Destroy(ObjectsOnBadLayerDialog)
	//*)
}


void ObjectsOnBadLayerDialog::OnDelClick(wxCommandEvent& event)
{
    EndModal(1);
}

void ObjectsOnBadLayerDialog::OnMoveClick(wxCommandEvent& event)
{
    if ( Choice1->GetStringSelection() != "" )
    {
        moveOnLayerNamed = Choice1->GetStringSelection();
        if ( moveOnLayerNamed == _("Base layer") )  moveOnLayerNamed = "";
        EndModal(2);
    }
}

void ObjectsOnBadLayerDialog::OnCancelClick(wxCommandEvent& event)
{
    EndModal(0);
}


}
#endif
