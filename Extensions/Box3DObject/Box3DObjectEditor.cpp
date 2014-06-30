/**

Game Develop - Box 3D Extension
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
#include "Box3DObjectEditor.h"

//(*InternalHeaders(Box3DObjectEditor)
#include <wx/bitmap.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include "GDCore/Tools/Log.h"
#include "GDCpp/Project.h"
#include "GDCpp/CommonTools.h"
#include "GDCore/IDE/Dialogs/MainFrameWrapper.h"
#include "GDCore/IDE/SkinHelper.h"
#include "GDCore/IDE/Dialogs/ResourcesEditor.h"
#include "GDCore/Tools/Localization.h"

#include "Box3DObject.h"

using namespace std;

//(*IdInit(Box3DObjectEditor)
const long Box3DObjectEditor::ID_STATICTEXT7 = wxNewId();
const long Box3DObjectEditor::ID_TEXTCTRL7 = wxNewId();
const long Box3DObjectEditor::ID_STATICTEXT8 = wxNewId();
const long Box3DObjectEditor::ID_TEXTCTRL8 = wxNewId();
const long Box3DObjectEditor::ID_STATICTEXT9 = wxNewId();
const long Box3DObjectEditor::ID_TEXTCTRL9 = wxNewId();
const long Box3DObjectEditor::ID_STATICTEXT1 = wxNewId();
const long Box3DObjectEditor::ID_TEXTCTRL1 = wxNewId();
const long Box3DObjectEditor::ID_BITMAPBUTTON1 = wxNewId();
const long Box3DObjectEditor::ID_STATICTEXT2 = wxNewId();
const long Box3DObjectEditor::ID_TEXTCTRL2 = wxNewId();
const long Box3DObjectEditor::ID_BITMAPBUTTON2 = wxNewId();
const long Box3DObjectEditor::ID_STATICTEXT3 = wxNewId();
const long Box3DObjectEditor::ID_TEXTCTRL3 = wxNewId();
const long Box3DObjectEditor::ID_BITMAPBUTTON3 = wxNewId();
const long Box3DObjectEditor::ID_STATICTEXT4 = wxNewId();
const long Box3DObjectEditor::ID_TEXTCTRL4 = wxNewId();
const long Box3DObjectEditor::ID_BITMAPBUTTON4 = wxNewId();
const long Box3DObjectEditor::ID_STATICTEXT5 = wxNewId();
const long Box3DObjectEditor::ID_TEXTCTRL5 = wxNewId();
const long Box3DObjectEditor::ID_BITMAPBUTTON5 = wxNewId();
const long Box3DObjectEditor::ID_STATICTEXT6 = wxNewId();
const long Box3DObjectEditor::ID_TEXTCTRL6 = wxNewId();
const long Box3DObjectEditor::ID_BITMAPBUTTON6 = wxNewId();
const long Box3DObjectEditor::ID_STATICLINE1 = wxNewId();
const long Box3DObjectEditor::ID_BUTTON3 = wxNewId();
const long Box3DObjectEditor::ID_BUTTON1 = wxNewId();
const long Box3DObjectEditor::ID_BUTTON2 = wxNewId();
const long Box3DObjectEditor::ID_PANEL1 = wxNewId();
//*)

BEGIN_EVENT_TABLE(Box3DObjectEditor,wxDialog)
	//(*EventTable(Box3DObjectEditor)
	//*)
END_EVENT_TABLE()

Box3DObjectEditor::Box3DObjectEditor( wxWindow* parent, gd::Project & game_, Box3DObject & object_, gd::MainFrameWrapper & mainFrameWrapper_ ) :
game(game_),
mainFrameWrapper(mainFrameWrapper_),
object(object_)
{
	//(*Initialize(Box3DObjectEditor)
	wxStaticBoxSizer* StaticBoxSizer2;
	wxFlexGridSizer* FlexGridSizer4;
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer5;
	wxFlexGridSizer* FlexGridSizer2;
	wxFlexGridSizer* FlexGridSizer7;
	wxFlexGridSizer* FlexGridSizer6;
	wxStaticBoxSizer* StaticBoxSizer1;
	wxFlexGridSizer* FlexGridSizer1;

	Create(parent, wxID_ANY, _("Settings of the 3D Box object"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE|wxRESIZE_BORDER, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(0);
	Core = new wxPanel(this, ID_PANEL1, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL1"));
	FlexGridSizer2 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer2->AddGrowableCol(0);
	FlexGridSizer2->AddGrowableRow(0);
	FlexGridSizer4 = new wxFlexGridSizer(0, 2, 0, 0);
	FlexGridSizer4->AddGrowableCol(1);
	FlexGridSizer4->AddGrowableRow(0);
	FlexGridSizer5 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer5->AddGrowableCol(0);
	StaticBoxSizer2 = new wxStaticBoxSizer(wxHORIZONTAL, Core, _("Size"));
	FlexGridSizer6 = new wxFlexGridSizer(0, 2, 0, 0);
	StaticText7 = new wxStaticText(Core, ID_STATICTEXT7, _("Width :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT7"));
	FlexGridSizer6->Add(StaticText7, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	widthEdit = new wxTextCtrl(Core, ID_TEXTCTRL7, _("32"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL7"));
	FlexGridSizer6->Add(widthEdit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText8 = new wxStaticText(Core, ID_STATICTEXT8, _("Height :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT8"));
	FlexGridSizer6->Add(StaticText8, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	heightEdit = new wxTextCtrl(Core, ID_TEXTCTRL8, _("32"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL8"));
	FlexGridSizer6->Add(heightEdit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText9 = new wxStaticText(Core, ID_STATICTEXT9, _("Depth :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT9"));
	FlexGridSizer6->Add(StaticText9, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	depthEdit = new wxTextCtrl(Core, ID_TEXTCTRL9, _("32"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL9"));
	FlexGridSizer6->Add(depthEdit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer2->Add(FlexGridSizer6, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer5->Add(StaticBoxSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer4->Add(FlexGridSizer5, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer1 = new wxStaticBoxSizer(wxHORIZONTAL, Core, _("Textures"));
	FlexGridSizer3 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer3->AddGrowableCol(1);
	StaticText1 = new wxStaticText(Core, ID_STATICTEXT1, _("Front :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	FlexGridSizer3->Add(StaticText1, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	frontTextureEdit = new wxTextCtrl(Core, ID_TEXTCTRL1, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL1"));
	FlexGridSizer3->Add(frontTextureEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	frontAddFromBt = new wxBitmapButton(Core, ID_BITMAPBUTTON1, wxBitmap(wxImage(_T("res/addfromimagebanque.png"))), wxDefaultPosition, wxDefaultSize, wxBU_AUTODRAW, wxDefaultValidator, _T("ID_BITMAPBUTTON1"));
	FlexGridSizer3->Add(frontAddFromBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText2 = new wxStaticText(Core, ID_STATICTEXT2, _("Top :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
	FlexGridSizer3->Add(StaticText2, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	topTextureEdit = new wxTextCtrl(Core, ID_TEXTCTRL2, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL2"));
	FlexGridSizer3->Add(topTextureEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	topAddFromBt = new wxBitmapButton(Core, ID_BITMAPBUTTON2, wxBitmap(wxImage(_T("res/addfromimagebanque.png"))), wxDefaultPosition, wxDefaultSize, wxBU_AUTODRAW, wxDefaultValidator, _T("ID_BITMAPBUTTON2"));
	FlexGridSizer3->Add(topAddFromBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText3 = new wxStaticText(Core, ID_STATICTEXT3, _("Bottom :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT3"));
	FlexGridSizer3->Add(StaticText3, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	bottomTextureEdit = new wxTextCtrl(Core, ID_TEXTCTRL3, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL3"));
	FlexGridSizer3->Add(bottomTextureEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	bottomAddFromBt = new wxBitmapButton(Core, ID_BITMAPBUTTON3, wxBitmap(wxImage(_T("res/addfromimagebanque.png"))), wxDefaultPosition, wxDefaultSize, wxBU_AUTODRAW, wxDefaultValidator, _T("ID_BITMAPBUTTON3"));
	FlexGridSizer3->Add(bottomAddFromBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText4 = new wxStaticText(Core, ID_STATICTEXT4, _("Left :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT4"));
	FlexGridSizer3->Add(StaticText4, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	leftTextureEdit = new wxTextCtrl(Core, ID_TEXTCTRL4, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL4"));
	FlexGridSizer3->Add(leftTextureEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	leftAddFromBt = new wxBitmapButton(Core, ID_BITMAPBUTTON4, wxBitmap(wxImage(_T("res/addfromimagebanque.png"))), wxDefaultPosition, wxDefaultSize, wxBU_AUTODRAW, wxDefaultValidator, _T("ID_BITMAPBUTTON4"));
	FlexGridSizer3->Add(leftAddFromBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText5 = new wxStaticText(Core, ID_STATICTEXT5, _("Right :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT5"));
	FlexGridSizer3->Add(StaticText5, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	rightTextureEdit = new wxTextCtrl(Core, ID_TEXTCTRL5, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL5"));
	FlexGridSizer3->Add(rightTextureEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	rightAddFromBt = new wxBitmapButton(Core, ID_BITMAPBUTTON5, wxBitmap(wxImage(_T("res/addfromimagebanque.png"))), wxDefaultPosition, wxDefaultSize, wxBU_AUTODRAW, wxDefaultValidator, _T("ID_BITMAPBUTTON5"));
	FlexGridSizer3->Add(rightAddFromBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText6 = new wxStaticText(Core, ID_STATICTEXT6, _("Back :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT6"));
	FlexGridSizer3->Add(StaticText6, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	backTextureEdit = new wxTextCtrl(Core, ID_TEXTCTRL6, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL6"));
	FlexGridSizer3->Add(backTextureEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	backAddFromBt = new wxBitmapButton(Core, ID_BITMAPBUTTON6, wxBitmap(wxImage(_T("res/addfromimagebanque.png"))), wxDefaultPosition, wxDefaultSize, wxBU_AUTODRAW, wxDefaultValidator, _T("ID_BITMAPBUTTON6"));
	FlexGridSizer3->Add(backAddFromBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer1->Add(FlexGridSizer3, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer4->Add(StaticBoxSizer1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer2->Add(FlexGridSizer4, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticLine1 = new wxStaticLine(Core, ID_STATICLINE1, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
	FlexGridSizer2->Add(StaticLine1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer7 = new wxFlexGridSizer(0, 3, 0, 0);
	imageBankBt = new wxButton(Core, ID_BUTTON3, _("Show image bank\'s editor"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON3"));
	FlexGridSizer7->Add(imageBankBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	okBt = new wxButton(Core, ID_BUTTON1, _("Ok"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer7->Add(okBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	cancelBt = new wxButton(Core, ID_BUTTON2, _("Cancel"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
	FlexGridSizer7->Add(cancelBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer2->Add(FlexGridSizer7, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 0);
	Core->SetSizer(FlexGridSizer2);
	FlexGridSizer2->Fit(Core);
	FlexGridSizer2->SetSizeHints(Core);
	FlexGridSizer1->Add(Core, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	Connect(ID_BITMAPBUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Box3DObjectEditor::OnfrontAddFromBtClick);
	Connect(ID_BITMAPBUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Box3DObjectEditor::OntopAddFromBtClick);
	Connect(ID_BITMAPBUTTON3,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Box3DObjectEditor::OnbottomAddFromBtClick);
	Connect(ID_BITMAPBUTTON4,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Box3DObjectEditor::OnleftAddFromBtClick);
	Connect(ID_BITMAPBUTTON5,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Box3DObjectEditor::OnrightAddFromBtClick);
	Connect(ID_BITMAPBUTTON6,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Box3DObjectEditor::OnbackAddFromBtClick);
	Connect(ID_BUTTON3,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Box3DObjectEditor::OnimageBankBtClick);
	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Box3DObjectEditor::OnokBtClick);
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Box3DObjectEditor::OncancelBtClick);
	//*)

	frontTextureEdit->ChangeValue(object.frontTextureName);
	topTextureEdit->ChangeValue(object.topTextureName);
	bottomTextureEdit->ChangeValue(object.bottomTextureName);
	leftTextureEdit->ChangeValue(object.leftTextureName);
	rightTextureEdit->ChangeValue(object.rightTextureName);
	backTextureEdit->ChangeValue(object.backTextureName);

	widthEdit->ChangeValue(ToString(object.GetWidth()));
	heightEdit->ChangeValue(ToString(object.GetHeight()));
	depthEdit->ChangeValue(ToString(object.GetDepth()));

    //Init the image bank editor
    resourcesEditor = new ResourcesEditor( this, game, mainFrameWrapper );
    resourcesEditor->Refresh();

	//Init wxAuiManager with two pane : the editor and the image bank editor
    m_mgr.SetManagedWindow( this );
    m_mgr.AddPane( Core, wxAuiPaneInfo().Name( wxT( "Core" ) ).Center().CaptionVisible(false) );
    m_mgr.AddPane( resourcesEditor, wxAuiPaneInfo().Name( wxT( "EI" ) ).Left().Caption( _T( "Editeur de la banque d'images" ) ).MaximizeButton( true ).MinimizeButton( false ).Show(false).MinSize(150, 100) );
    m_mgr.SetFlags( wxAUI_MGR_ALLOW_FLOATING | wxAUI_MGR_ALLOW_ACTIVE_PANE | wxAUI_MGR_TRANSPARENT_HINT
                    | wxAUI_MGR_TRANSPARENT_DRAG | wxAUI_MGR_HINT_FADE | wxAUI_MGR_NO_VENETIAN_BLINDS_FADE );
    gd::SkinHelper::ApplyCurrentSkin(m_mgr);
    m_mgr.Update();
}

Box3DObjectEditor::~Box3DObjectEditor()
{
	//(*Destroy(Box3DObjectEditor)
	//*)

    m_mgr.UnInit(); //We're using a wxAuiManager that need to be uninitialized.
}

/**
 * Close the editor without updating the object
 */
void Box3DObjectEditor::OncancelBtClick(wxCommandEvent& event)
{
    EndModal(0);
}

/**
 * Update the object and close the editor
 */
void Box3DObjectEditor::OnokBtClick(wxCommandEvent& event)
{
	object.frontTextureName = string(frontTextureEdit->GetValue().mb_str());
	object.topTextureName = string(topTextureEdit->GetValue().mb_str());
	object.bottomTextureName = string(bottomTextureEdit->GetValue().mb_str());
	object.leftTextureName = string(leftTextureEdit->GetValue().mb_str());
	object.rightTextureName = string(rightTextureEdit->GetValue().mb_str());
	object.backTextureName = string(backTextureEdit->GetValue().mb_str());

	object.SetWidth(ToInt(string(widthEdit->GetValue().mb_str())));
	object.SetHeight(ToInt(string(heightEdit->GetValue().mb_str())));
	object.SetDepth(ToInt(string(depthEdit->GetValue().mb_str())));

    EndModal(1);
}


void Box3DObjectEditor::OnfrontAddFromBtClick(wxCommandEvent& event)
{
    if ( !m_mgr.GetPane( resourcesEditor ).IsShown() )
    {
        gd::LogMessage(_("Please display the image bank's editor and select an image before clicking on this button."));
        return;
    }

    frontTextureEdit->ChangeValue(resourcesEditor->resourcesTree->GetItemText(resourcesEditor->m_itemSelected));
}

void Box3DObjectEditor::OntopAddFromBtClick(wxCommandEvent& event)
{
    if ( !m_mgr.GetPane( resourcesEditor ).IsShown() )
    {
        gd::LogMessage(_("Please display the image bank's editor and select an image before clicking on this button."));
        return;
    }

    topTextureEdit->ChangeValue(resourcesEditor->resourcesTree->GetItemText(resourcesEditor->m_itemSelected));
}


void Box3DObjectEditor::OnbottomAddFromBtClick(wxCommandEvent& event)
{
    if ( !m_mgr.GetPane( resourcesEditor ).IsShown() )
    {
        gd::LogMessage(_("Please display the image bank's editor and select an image before clicking on this button."));
        return;
    }

    bottomTextureEdit->ChangeValue(resourcesEditor->resourcesTree->GetItemText(resourcesEditor->m_itemSelected));
}

void Box3DObjectEditor::OnleftAddFromBtClick(wxCommandEvent& event)
{
    if ( !m_mgr.GetPane( resourcesEditor ).IsShown() )
    {
        gd::LogMessage(_("Please display the image bank's editor and select an image before clicking on this button."));
        return;
    }

    leftTextureEdit->ChangeValue(resourcesEditor->resourcesTree->GetItemText(resourcesEditor->m_itemSelected));
}

void Box3DObjectEditor::OnrightAddFromBtClick(wxCommandEvent& event)
{
    if ( !m_mgr.GetPane( resourcesEditor ).IsShown() )
    {
        gd::LogMessage(_("Please display the image bank's editor and select an image before clicking on this button."));
        return;
    }

    rightTextureEdit->ChangeValue(resourcesEditor->resourcesTree->GetItemText(resourcesEditor->m_itemSelected));
}

void Box3DObjectEditor::OnbackAddFromBtClick(wxCommandEvent& event)
{
    if ( !m_mgr.GetPane( resourcesEditor ).IsShown() )
    {
        gd::LogMessage(_("Please display the image bank's editor and select an image before clicking on this button."));
        return;
    }

    backTextureEdit->ChangeValue(resourcesEditor->resourcesTree->GetItemText(resourcesEditor->m_itemSelected));
}

/**
 * Display the pane of the image bank editor
 */
void Box3DObjectEditor::OnimageBankBtClick(wxCommandEvent& event)
{
    //Update the window size
    if ( !m_mgr.GetPane( resourcesEditor ).IsShown() )
        SetSize(GetSize().GetWidth()+150, GetSize().GetHeight());

    m_mgr.GetPane( resourcesEditor ).Show();
    m_mgr.Update();
    resourcesEditor->wxWindow::Refresh();
    resourcesEditor->Update();
}

#endif

