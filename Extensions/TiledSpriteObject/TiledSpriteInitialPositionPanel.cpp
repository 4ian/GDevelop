/**

Game Develop - Tiled Sprite Extension
Copyright (c) 2012 Victor Levasseur (victorlevasseur01@orange.fr)

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
#include "TiledSpriteInitialPositionPanel.h"

//(*InternalHeaders(TiledSpriteInitialPositionPanel)
#include <wx/intl.h>
#include <wx/string.h>
//*)

//(*IdInit(TiledSpriteInitialPositionPanel)
const long TiledSpriteInitialPositionPanel::ID_STATICTEXT1 = wxNewId();
const long TiledSpriteInitialPositionPanel::ID_TEXTCTRL1 = wxNewId();
//*)

BEGIN_EVENT_TABLE(TiledSpriteInitialPositionPanel,wxPanel)
	//(*EventTable(TiledSpriteInitialPositionPanel)
	//*)
END_EVENT_TABLE()

TiledSpriteInitialPositionPanel::TiledSpriteInitialPositionPanel(wxWindow* parent,wxWindowID id,const wxPoint& pos,const wxSize& size)
{
	//(*Initialize(TiledSpriteInitialPositionPanel)
	wxFlexGridSizer* FlexGridSizer1;

	Create(parent, id, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("id"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 2, 0, 0);
	StaticText1 = new wxStaticText(this, ID_STATICTEXT1, _("Angle :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	FlexGridSizer1->Add(StaticText1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	angleTextCtrl = new wxTextCtrl(this, ID_TEXTCTRL1, _("0"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL1"));
	FlexGridSizer1->Add(angleTextCtrl, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);
	//*)
}

TiledSpriteInitialPositionPanel::~TiledSpriteInitialPositionPanel()
{
	//(*Destroy(TiledSpriteInitialPositionPanel)
	//*)
}

#endif

