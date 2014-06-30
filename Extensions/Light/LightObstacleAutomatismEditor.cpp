/**

Game Develop - Light Extension
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
#include "LightObstacleAutomatismEditor.h"

//(*InternalHeaders(LightObstacleAutomatismEditor)
#include <wx/intl.h>
#include <wx/string.h>
//*)
#include "GDCpp/Project.h"
#include "LightObstacleAutomatism.h"
#include "GDCore/IDE/Dialogs/MainFrameWrapper.h"
#include "GDCpp/CommonTools.h"
#include "GDCpp/Scene.h"

//(*IdInit(LightObstacleAutomatismEditor)
//*)

BEGIN_EVENT_TABLE(LightObstacleAutomatismEditor,wxDialog)
	//(*EventTable(LightObstacleAutomatismEditor)
	//*)
END_EVENT_TABLE()

LightObstacleAutomatismEditor::LightObstacleAutomatismEditor(wxWindow* parent, gd::Project & game_, gd::Layout * scene_, LightObstacleAutomatism & automatism_ ) :
automatism(automatism_),
game(game_),
scene(scene_)
{
	//(*Initialize(LightObstacleAutomatismEditor)
	wxFlexGridSizer* FlexGridSizer1;

	Create(parent, wxID_ANY, wxEmptyString, wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 3, 0, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);
	//*)

}

LightObstacleAutomatismEditor::~LightObstacleAutomatismEditor()
{
	//(*Destroy(LightObstacleAutomatismEditor)
	//*)
}

void LightObstacleAutomatismEditor::OncancelBtClick(wxCommandEvent& event)
{
    EndModal(0);
}

void LightObstacleAutomatismEditor::OnokBtClick(wxCommandEvent& event)
{
}
#endif

