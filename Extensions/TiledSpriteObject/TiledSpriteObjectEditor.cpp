/**

Game Develop - Tiled Sprite Extension
Copyright (c) 2012 Victor Levasseur (victorlevasseur01@orange.fr)
Copyright (c) 2014 Florian Rival (Florian.Rival@gmail.com)

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

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
//(*InternalHeaders(TiledSpriteObjectEditor)
#include <wx/bitmap.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include "GDCore/Tools/Log.h"
#include "GDCore/Tools/Localization.h"
#include "GDCore/IDE/Dialogs/MainFrameWrapper.h"
#include "GDCore/IDE/SkinHelper.h"
#include "GDCpp/Project.h"
#include "GDCpp/CommonTools.h"
#include "GDCore/IDE/Dialogs/ResourcesEditor.h"
#include "TiledSpriteObjectEditor.h"
#include "TiledSpriteObject.h"

//(*IdInit(TiledSpriteObjectEditor)
const long TiledSpriteObjectEditor::ID_STATICTEXT7 = wxNewId();
const long TiledSpriteObjectEditor::ID_TEXTCTRL7 = wxNewId();
const long TiledSpriteObjectEditor::ID_STATICTEXT8 = wxNewId();
const long TiledSpriteObjectEditor::ID_TEXTCTRL8 = wxNewId();
const long TiledSpriteObjectEditor::ID_TEXTCTRL1 = wxNewId();
const long TiledSpriteObjectEditor::ID_BITMAPBUTTON1 = wxNewId();
const long TiledSpriteObjectEditor::ID_CHECKBOX1 = wxNewId();
const long TiledSpriteObjectEditor::ID_STATICLINE1 = wxNewId();
const long TiledSpriteObjectEditor::ID_BUTTON3 = wxNewId();
const long TiledSpriteObjectEditor::ID_BUTTON1 = wxNewId();
const long TiledSpriteObjectEditor::ID_BUTTON2 = wxNewId();
const long TiledSpriteObjectEditor::ID_PANEL1 = wxNewId();
//*)

BEGIN_EVENT_TABLE(TiledSpriteObjectEditor,wxDialog)
	//(*EventTable(TiledSpriteObjectEditor)
	//*)
END_EVENT_TABLE()

TiledSpriteObjectEditor::TiledSpriteObjectEditor( wxWindow* parent, gd::Project & game_, TiledSpriteObject & object_, gd::MainFrameWrapper & mainFrameWrapper_ ) :
game(game_),
mainFrameWrapper(mainFrameWrapper_),
object(object_)
{
	//(*Initialize(TiledSpriteObjectEditor)
	wxStaticBoxSizer* StaticBoxSizer2;
	wxFlexGridSizer* FlexGridSizer4;
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer5;
	wxFlexGridSizer* FlexGridSizer2;
	wxFlexGridSizer* FlexGridSizer7;
	wxFlexGridSizer* FlexGridSizer6;
	wxStaticBoxSizer* StaticBoxSizer1;
	wxFlexGridSizer* FlexGridSizer1;

	Create(parent, wxID_ANY, _("Settings of the Tiled Sprite Object"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE|wxRESIZE_BORDER, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(0);
	Core = new wxPanel(this, ID_PANEL1, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL1"));
	FlexGridSizer2 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer2->AddGrowableCol(0);
	FlexGridSizer2->AddGrowableRow(0);
	FlexGridSizer4 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer4->AddGrowableCol(0);
	FlexGridSizer4->AddGrowableRow(0);
	FlexGridSizer5 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer5->AddGrowableCol(0);
	StaticBoxSizer2 = new wxStaticBoxSizer(wxHORIZONTAL, Core, _("Size"));
	FlexGridSizer6 = new wxFlexGridSizer(0, 2, 0, 0);
	FlexGridSizer6->AddGrowableCol(1);
	StaticText7 = new wxStaticText(Core, ID_STATICTEXT7, _("Width :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT7"));
	FlexGridSizer6->Add(StaticText7, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	widthEdit = new wxTextCtrl(Core, ID_TEXTCTRL7, _("32"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL7"));
	FlexGridSizer6->Add(widthEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText8 = new wxStaticText(Core, ID_STATICTEXT8, _("Height :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT8"));
	FlexGridSizer6->Add(StaticText8, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	heightEdit = new wxTextCtrl(Core, ID_TEXTCTRL8, _("32"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL8"));
	FlexGridSizer6->Add(heightEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer2->Add(FlexGridSizer6, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer5->Add(StaticBoxSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer4->Add(FlexGridSizer5, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer1 = new wxStaticBoxSizer(wxHORIZONTAL, Core, _("Textures"));
	FlexGridSizer3 = new wxFlexGridSizer(0, 2, 0, 0);
	FlexGridSizer3->AddGrowableCol(0);
	frontTextureEdit = new wxTextCtrl(Core, ID_TEXTCTRL1, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL1"));
	FlexGridSizer3->Add(frontTextureEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	frontAddFromBt = new wxBitmapButton(Core, ID_BITMAPBUTTON1, wxBitmap(wxImage(_T("res/addfromimagebanque.png"))), wxDefaultPosition, wxDefaultSize, wxBU_AUTODRAW, wxDefaultValidator, _T("ID_BITMAPBUTTON1"));
	FlexGridSizer3->Add(frontAddFromBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	smoothCheckBox = new wxCheckBox(Core, ID_CHECKBOX1, _("Smooth texture"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX1"));
	smoothCheckBox->SetValue(false);
	FlexGridSizer3->Add(smoothCheckBox, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
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

	Connect(ID_BITMAPBUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&TiledSpriteObjectEditor::OnfrontAddFromBtClick);
	Connect(ID_BUTTON3,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&TiledSpriteObjectEditor::OnimageBankBtClick);
	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&TiledSpriteObjectEditor::OnokBtClick);
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&TiledSpriteObjectEditor::OncancelBtClick);
	//*)

	frontTextureEdit->ChangeValue(object.textureName);

	widthEdit->ChangeValue(ToString(object.GetWidth()));
	heightEdit->ChangeValue(ToString(object.GetHeight()));

    //Init the image bank editor
    resourcesEditor = new ResourcesEditor( this, game, mainFrameWrapper );
    resourcesEditor->Refresh();

	//Init wxAuiManager with two pane : the editor and the image bank editor
    m_mgr.SetManagedWindow( this );
    gd::SkinHelper::ApplyCurrentSkin(m_mgr);
    m_mgr.AddPane( Core, wxAuiPaneInfo().Name( wxT( "Core" ) ).Center().CaptionVisible(false) );
    m_mgr.AddPane( resourcesEditor, wxAuiPaneInfo().Name( wxT( "EI" ) ).Left().Caption( _T( "Editeur de la banque d'images" ) ).MaximizeButton( true ).MinimizeButton( false ).Show(true).MinSize(210, 100) );
    m_mgr.SetFlags( wxAUI_MGR_ALLOW_FLOATING | wxAUI_MGR_ALLOW_ACTIVE_PANE | wxAUI_MGR_TRANSPARENT_HINT
                    | wxAUI_MGR_TRANSPARENT_DRAG | wxAUI_MGR_HINT_FADE | wxAUI_MGR_NO_VENETIAN_BLINDS_FADE );
    m_mgr.Update();

    SetSize(800,640);
    resourcesEditor->toolbar->Realize(); //Mandatory on linux to display the toolbar.
}

TiledSpriteObjectEditor::~TiledSpriteObjectEditor()
{
	//(*Destroy(TiledSpriteObjectEditor)
	//*)

    m_mgr.UnInit(); //We're using a wxAuiManager that need to be uninitialized.
}

/**
 * Close the editor without updating the object
 */
void TiledSpriteObjectEditor::OncancelBtClick(wxCommandEvent& event)
{
    EndModal(0);
}

/**
 * Update the object and close the editor
 */
void TiledSpriteObjectEditor::OnokBtClick(wxCommandEvent& event)
{
	object.textureName = ToString(frontTextureEdit->GetValue());

	object.SetWidth(ToInt(ToString(widthEdit->GetValue())));
	object.SetHeight(ToInt(ToString(heightEdit->GetValue())));

    EndModal(1);
}


void TiledSpriteObjectEditor::OnfrontAddFromBtClick(wxCommandEvent& event)
{
    if ( !m_mgr.GetPane( resourcesEditor ).IsShown() )
    {
        gd::LogMessage(_("Please display the image bank's editor and select an image before clicking on this button."));
        return;
    }

    frontTextureEdit->ChangeValue(resourcesEditor->resourcesTree->GetItemText(resourcesEditor->m_itemSelected));
}

/**
 * Display the pane of the image bank editor
 */
void TiledSpriteObjectEditor::OnimageBankBtClick(wxCommandEvent& event)
{
    //Update the window size
    if ( !m_mgr.GetPane( resourcesEditor ).IsShown() )
        SetSize(GetSize().GetWidth()+150, GetSize().GetHeight());

    m_mgr.GetPane( resourcesEditor ).Show();
    m_mgr.Update();
}

#endif

