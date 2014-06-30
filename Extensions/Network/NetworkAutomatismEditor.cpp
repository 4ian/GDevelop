/**

Game Develop - Network Extension
Copyright (c) 2010-2014 Florian Rival (Florian.Rival@gmail.com)

This software is provided 'as-is', without any express or implied
warranty. In no event will the authors be held liable for any damages
arising from the use of this software.

Permission is granted to anyone to use this software for any purpose,
including commercial applications, and to alter it and redistribute it
freely, subject to the following restrictions:

    1. The origin of this software must not be misrepresented; you must not
    claim that you wrote the original software. If you use this software
    in a product, an acknowledgment in the product documentation would be
    appreciated but is not required.

    2. Altered source versions must be plainly marked as such, and must not be
    misrepresented as being the original software.

    3. This notice may not be removed or altered from any source
    distribution.

*/

#if defined(GD_IDE_ONLY)
#include "NetworkAutomatismEditor.h"

//(*InternalHeaders(NetworkAutomatismEditor)
#include <wx/intl.h>
#include <wx/string.h>
//*)
#include "GDCpp/Project.h"
#include "NetworkAutomatism.h"
#include "GDCore/IDE/Dialogs/MainFrameWrapper.h"
#include "GDCpp/CommonTools.h"
#include "GDCpp/Scene.h"

//(*IdInit(NetworkAutomatismEditor)
const long NetworkAutomatismEditor::ID_RADIOBOX1 = wxNewId();
const long NetworkAutomatismEditor::ID_STATICTEXT1 = wxNewId();
const long NetworkAutomatismEditor::ID_CHECKBOX1 = wxNewId();
const long NetworkAutomatismEditor::ID_CHECKBOX2 = wxNewId();
const long NetworkAutomatismEditor::ID_CHECKBOX3 = wxNewId();
const long NetworkAutomatismEditor::ID_CHECKBOX4 = wxNewId();
const long NetworkAutomatismEditor::ID_CHECKBOX5 = wxNewId();
const long NetworkAutomatismEditor::ID_TEXTCTRL1 = wxNewId();
const long NetworkAutomatismEditor::ID_STATICTEXT2 = wxNewId();
const long NetworkAutomatismEditor::ID_STATICTEXT3 = wxNewId();
const long NetworkAutomatismEditor::ID_BUTTON1 = wxNewId();
const long NetworkAutomatismEditor::ID_BUTTON2 = wxNewId();
//*)

BEGIN_EVENT_TABLE(NetworkAutomatismEditor,wxDialog)
	//(*EventTable(NetworkAutomatismEditor)
	//*)
END_EVENT_TABLE()

NetworkAutomatismEditor::NetworkAutomatismEditor(wxWindow* parent, gd::Project & game_, gd::Layout * scene_, NetworkAutomatism & automatism_ ) :
automatism(automatism_),
game(game_),
scene(scene_)
{
	//(*Initialize(NetworkAutomatismEditor)
	wxStaticBoxSizer* StaticBoxSizer2;
	wxFlexGridSizer* FlexGridSizer4;
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer5;
	wxFlexGridSizer* FlexGridSizer2;
	wxFlexGridSizer* FlexGridSizer7;
	wxFlexGridSizer* FlexGridSizer8;
	wxFlexGridSizer* FlexGridSizer6;
	wxStaticBoxSizer* StaticBoxSizer1;
	wxFlexGridSizer* FlexGridSizer1;

	Create(parent, wxID_ANY, _("Edit the automatism"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer4 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer3 = new wxFlexGridSizer(0, 1, 0, 0);
	wxString __wxRadioBoxChoices_1[2] =
	{
		_("Send datas"),
		_("Receive data")
	};
	initialBehaviourList = new wxRadioBox(this, ID_RADIOBOX1, _("Initial behaviour"), wxDefaultPosition, wxDefaultSize, 2, __wxRadioBoxChoices_1, 1, 0, wxDefaultValidator, _T("ID_RADIOBOX1"));
	FlexGridSizer3->Add(initialBehaviourList, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText1 = new wxStaticText(this, ID_STATICTEXT1, _("Depending on whether the game is \"hosting\" or joining, you wish change this behaviour\nof the automatism. You can use actions in the sub category \"Network > Automatism Automatic Network Updater\""), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	FlexGridSizer3->Add(StaticText1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer4->Add(FlexGridSizer3, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer5 = new wxFlexGridSizer(0, 2, 0, 0);
	FlexGridSizer5->AddGrowableCol(1);
	StaticBoxSizer1 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Sent / Received data"));
	FlexGridSizer6 = new wxFlexGridSizer(0, 2, 0, 0);
	xPosCheck = new wxCheckBox(this, ID_CHECKBOX1, _("X position"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX1"));
	xPosCheck->SetValue(true);
	FlexGridSizer6->Add(xPosCheck, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	yPosCheck = new wxCheckBox(this, ID_CHECKBOX2, _("Y position"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX2"));
	yPosCheck->SetValue(true);
	FlexGridSizer6->Add(yPosCheck, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	angleCheck = new wxCheckBox(this, ID_CHECKBOX3, _("Angle"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX3"));
	angleCheck->SetValue(true);
	FlexGridSizer6->Add(angleCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	widthCheck = new wxCheckBox(this, ID_CHECKBOX4, _("Width"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX4"));
	widthCheck->SetValue(false);
	FlexGridSizer6->Add(widthCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	heightCheck = new wxCheckBox(this, ID_CHECKBOX5, _("Height"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX5"));
	heightCheck->SetValue(false);
	FlexGridSizer6->Add(heightCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer1->Add(FlexGridSizer6, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer5->Add(StaticBoxSizer1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer2 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Data format"));
	FlexGridSizer7 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer7->AddGrowableCol(0);
	FlexGridSizer8 = new wxFlexGridSizer(0, 2, 0, 0);
	FlexGridSizer8->AddGrowableCol(0);
	dataPrefixEdit = new wxTextCtrl(this, ID_TEXTCTRL1, wxEmptyString, wxDefaultPosition, wxDefaultSize, wxTE_RIGHT, wxDefaultValidator, _T("ID_TEXTCTRL1"));
	FlexGridSizer8->Add(dataPrefixEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText2 = new wxStaticText(this, ID_STATICTEXT2, _("X/Data"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
	FlexGridSizer8->Add(StaticText2, 1, wxTOP|wxBOTTOM|wxRIGHT|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer7->Add(FlexGridSizer8, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticText3 = new wxStaticText(this, ID_STATICTEXT3, _("X represent identifier number and Data the data title."), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT3"));
	FlexGridSizer7->Add(StaticText3, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer2->Add(FlexGridSizer7, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer5->Add(StaticBoxSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer4->Add(FlexGridSizer5, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer1->Add(FlexGridSizer4, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer2 = new wxFlexGridSizer(0, 3, 0, 0);
	okBt = new wxButton(this, ID_BUTTON1, _("Ok"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer2->Add(okBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	cancelBt = new wxButton(this, ID_BUTTON2, _("Cancel"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
	FlexGridSizer2->Add(cancelBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&NetworkAutomatismEditor::OnokBtClick);
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&NetworkAutomatismEditor::OncancelBtClick);
	//*)

    initialBehaviourList->SetSelection(automatism.sending ? 0 : 1);
    xPosCheck->SetValue(automatism.xPosition);
    yPosCheck->SetValue(automatism.yPosition);
    angleCheck->SetValue(automatism.angle);
    widthCheck->SetValue(automatism.width);
    heightCheck->SetValue(automatism.height);

    dataPrefixEdit->SetValue(automatism.dataPrefix);
}

NetworkAutomatismEditor::~NetworkAutomatismEditor()
{
	//(*Destroy(NetworkAutomatismEditor)
	//*)
}


void NetworkAutomatismEditor::OncancelBtClick(wxCommandEvent& event)
{
    EndModal(0);
}

void NetworkAutomatismEditor::OnokBtClick(wxCommandEvent& event)
{
    automatism.sending = (initialBehaviourList->GetSelection() == 0);
    automatism.xPosition = xPosCheck->GetValue();
    automatism.yPosition = yPosCheck->GetValue();
    automatism.angle = angleCheck->GetValue();
    automatism.width = widthCheck->GetValue();
    automatism.height = heightCheck->GetValue();

    automatism.dataPrefix = ToString(dataPrefixEdit->GetValue());

    EndModal(1);
}

#endif

