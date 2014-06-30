/**

Game Develop - Text Object Extension
Copyright (c) 2008-2014 Florian Rival (Florian.Rival@gmail.com)

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

#include "TextObjectEditor.h"

//(*InternalHeaders(TextObjectEditor)
#include <wx/font.h>
#include <wx/intl.h>
#include <wx/string.h>
//*)
#include <wx/colordlg.h>
#include <wx/filename.h>
#include <wx/filedlg.h>

#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/IDE/Dialogs/MainFrameWrapper.h"
#include "GDCore/CommonTools.h"
#include "TextObject.h"

//(*IdInit(TextObjectEditor)
const long TextObjectEditor::ID_TEXTCTRL1 = wxNewId();
const long TextObjectEditor::ID_STATICTEXT3 = wxNewId();
const long TextObjectEditor::ID_TOGGLEBUTTON1 = wxNewId();
const long TextObjectEditor::ID_TOGGLEBUTTON2 = wxNewId();
const long TextObjectEditor::ID_TOGGLEBUTTON3 = wxNewId();
const long TextObjectEditor::ID_STATICTEXT1 = wxNewId();
const long TextObjectEditor::ID_BUTTON3 = wxNewId();
const long TextObjectEditor::ID_STATICTEXT2 = wxNewId();
const long TextObjectEditor::ID_TEXTCTRL2 = wxNewId();
const long TextObjectEditor::ID_BUTTON4 = wxNewId();
const long TextObjectEditor::ID_STATICTEXT4 = wxNewId();
const long TextObjectEditor::ID_SPINCTRL1 = wxNewId();
const long TextObjectEditor::ID_CHECKBOX1 = wxNewId();
const long TextObjectEditor::ID_STATICLINE1 = wxNewId();
const long TextObjectEditor::ID_BUTTON1 = wxNewId();
//*)

BEGIN_EVENT_TABLE(TextObjectEditor,wxDialog)
	//(*EventTable(TextObjectEditor)
	//*)
END_EVENT_TABLE()

TextObjectEditor::TextObjectEditor( wxWindow* parent, gd::Project & game_, TextObject & object_, gd::MainFrameWrapper & mainFrameWrapper_) :
game(game_),
object(object_),
mainFrameWrapper(mainFrameWrapper_)
{
	//(*Initialize(TextObjectEditor)
	wxStaticBoxSizer* StaticBoxSizer2;
	wxFlexGridSizer* FlexGridSizer4;
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer5;
	wxFlexGridSizer* FlexGridSizer2;
	wxGridSizer* GridSizer1;
	wxStaticBoxSizer* StaticBoxSizer1;
	wxFlexGridSizer* FlexGridSizer1;

	Create(parent, wxID_ANY, _("Edit the Text object"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE|wxRESIZE_BORDER|wxMAXIMIZE_BOX, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(0);
	StaticBoxSizer1 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Text"));
	textEdit = new wxTextCtrl(this, ID_TEXTCTRL1, wxEmptyString, wxDefaultPosition, wxSize(332,142), wxTE_MULTILINE, wxDefaultValidator, _T("ID_TEXTCTRL1"));
	StaticBoxSizer1->Add(textEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(StaticBoxSizer1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer2 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Others properties"));
	FlexGridSizer3 = new wxFlexGridSizer(0, 2, 0, 0);
	FlexGridSizer3->AddGrowableCol(1);
	StaticText3 = new wxStaticText(this, ID_STATICTEXT3, _("Style:"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT3"));
	FlexGridSizer3->Add(StaticText3, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	GridSizer1 = new wxGridSizer(1, 3, 0, 0);
	boldToggleButton = new wxToggleButton(this, ID_TOGGLEBUTTON1, _("Bold"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TOGGLEBUTTON1"));
	wxFont boldToggleButtonFont(wxDEFAULT,wxDEFAULT,wxFONTSTYLE_NORMAL,wxBOLD,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	boldToggleButton->SetFont(boldToggleButtonFont);
	GridSizer1->Add(boldToggleButton, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	italicToggleButton = new wxToggleButton(this, ID_TOGGLEBUTTON2, _("Italic"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TOGGLEBUTTON2"));
	wxFont italicToggleButtonFont(wxDEFAULT,wxDEFAULT,wxFONTSTYLE_ITALIC,wxNORMAL,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	italicToggleButton->SetFont(italicToggleButtonFont);
	GridSizer1->Add(italicToggleButton, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	underlineToggleButton = new wxToggleButton(this, ID_TOGGLEBUTTON3, _("Underlined"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TOGGLEBUTTON3"));
	wxFont underlineToggleButtonFont(wxDEFAULT,wxDEFAULT,wxFONTSTYLE_NORMAL,wxNORMAL,true,wxEmptyString,wxFONTENCODING_DEFAULT);
	underlineToggleButton->SetFont(underlineToggleButtonFont);
	GridSizer1->Add(underlineToggleButton, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer3->Add(GridSizer1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticText1 = new wxStaticText(this, ID_STATICTEXT1, _("Color :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	FlexGridSizer3->Add(StaticText1, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	colorBt = new wxButton(this, ID_BUTTON3, _("Choose the color"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON3"));
	FlexGridSizer3->Add(colorBt, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText2 = new wxStaticText(this, ID_STATICTEXT2, _("Font :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
	FlexGridSizer3->Add(StaticText2, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer4 = new wxFlexGridSizer(0, 2, 0, 0);
	FlexGridSizer4->AddGrowableCol(0);
	fontEdit = new wxTextCtrl(this, ID_TEXTCTRL2, wxEmptyString, wxDefaultPosition, wxSize(75,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL2"));
	FlexGridSizer4->Add(fontEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	fontBt = new wxButton(this, ID_BUTTON4, _("Choose the font"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON4"));
	FlexGridSizer4->Add(fontBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer3->Add(FlexGridSizer4, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticText4 = new wxStaticText(this, ID_STATICTEXT4, _("Size :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT4"));
	FlexGridSizer3->Add(StaticText4, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer5 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer5->AddGrowableCol(0);
	sizeEdit = new wxSpinCtrl(this, ID_SPINCTRL1, _T("0"), wxDefaultPosition, wxDefaultSize, 0, 0, 1000, 0, _T("ID_SPINCTRL1"));
	sizeEdit->SetValue(_T("0"));
	FlexGridSizer5->Add(sizeEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer3->Add(FlexGridSizer5, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer3->Add(5,5,1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	smoothCheck = new wxCheckBox(this, ID_CHECKBOX1, _("Smooth the text"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX1"));
	smoothCheck->SetValue(true);
	FlexGridSizer3->Add(smoothCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer2->Add(FlexGridSizer3, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer1->Add(StaticBoxSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticLine1 = new wxStaticLine(this, ID_STATICLINE1, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
	FlexGridSizer1->Add(StaticLine1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer2 = new wxFlexGridSizer(0, 3, 0, 0);
	okBt = new wxButton(this, ID_BUTTON1, _("Ok"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer2->Add(okBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer2, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	Connect(ID_BUTTON3,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&TextObjectEditor::OncolorBtClick);
	Connect(ID_BUTTON4,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&TextObjectEditor::OnfontBtClick);
	Connect(ID_SPINCTRL1,wxEVT_COMMAND_SPINCTRL_UPDATED,(wxObjectEventFunction)&TextObjectEditor::OnSizeEditChange);
	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&TextObjectEditor::OnokBtClick);
	//*)

	textEdit->ChangeValue(object.GetString());
	fontEdit->ChangeValue(object.GetFontFilename());
	sizeEdit->SetValue(object.GetCharacterSize());
	colorBt->SetBackgroundColour(wxColour(object.GetColorR(), object.GetColorG(), object.GetColorB()));
	smoothCheck->SetValue(object.IsSmoothed());

	boldToggleButton->SetValue(object.IsBold());
	italicToggleButton->SetValue(object.IsItalic());
	underlineToggleButton->SetValue(object.IsUnderlined());
}

TextObjectEditor::~TextObjectEditor()
{
	//(*Destroy(TextObjectEditor)
	//*)
}

void TextObjectEditor::AdaptFontColor(wxButton *button)
{
    wxColor color = button->GetBackgroundColour();

    if(color.Red() < 140 && color.Green() < 140 && color.Blue() < 140)
        button->SetForegroundColour(wxColour(255, 255, 255));
    else
        button->SetForegroundColour(wxColour(0, 0, 0));
}


void TextObjectEditor::OnokBtClick(wxCommandEvent& event)
{
    object.SetString(gd::ToString(textEdit->GetValue()));
    object.SetCharacterSize(sizeEdit->GetValue());
    object.SetSmooth(smoothCheck->GetValue());
    object.SetColor(static_cast<int>(colorBt->GetBackgroundColour().Red()),
                    static_cast<int>(colorBt->GetBackgroundColour().Green()),
                    static_cast<int>(colorBt->GetBackgroundColour().Blue()));

    object.SetBold(boldToggleButton->GetValue());
    object.SetItalic(italicToggleButton->GetValue());
    object.SetUnderlined(underlineToggleButton->GetValue());
    object.SetFontFilename(std::string(fontEdit->GetValue().mb_str()));

    EndModal(1);
}

void TextObjectEditor::OncolorBtClick(wxCommandEvent& event)
{
    wxColour color = wxGetColourFromUser(this, colorBt->GetBackgroundColour());
    if ( color.IsOk() )
        colorBt->SetBackgroundColour(color);

    AdaptFontColor(colorBt);

    return;
}

void TextObjectEditor::OnfontBtClick(wxCommandEvent& event)
{
    wxString gameDirectory = wxFileName::FileName(game.GetProjectFile()).GetPath();
    wxFileDialog fileDialog(this, _("Choose a font ( ttf/ttc files )"), gameDirectory, "", "Polices (*.ttf, *.ttc)|*.ttf;*.ttc");

    if ( fileDialog.ShowModal() == wxID_OK )
    {
        //Note that the file is relative to the project directory
        wxFileName filename(fileDialog.GetPath()); filename.MakeRelativeTo(gameDirectory);
        fontEdit->SetValue(filename.GetFullPath());
    }
}

void TextObjectEditor::OnSizeEditChange(wxSpinEvent& event)
{
}
#endif

