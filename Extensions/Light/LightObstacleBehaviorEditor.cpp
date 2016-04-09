/**

GDevelop - Light Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include "LightObstacleBehaviorEditor.h"

//(*InternalHeaders(LightObstacleBehaviorEditor)
#include <wx/intl.h>
#include <wx/string.h>
//*)
#include "GDCpp/Runtime/Project/Project.h"
#include "LightObstacleBehavior.h"
#include "GDCore/IDE/Dialogs/MainFrameWrapper.h"
#include "GDCpp/Runtime/CommonTools.h"
#include "GDCpp/Runtime/Project/Layout.h"

//(*IdInit(LightObstacleBehaviorEditor)
//*)

BEGIN_EVENT_TABLE(LightObstacleBehaviorEditor,wxDialog)
	//(*EventTable(LightObstacleBehaviorEditor)
	//*)
END_EVENT_TABLE()

LightObstacleBehaviorEditor::LightObstacleBehaviorEditor(wxWindow* parent, gd::Project & game_, gd::Layout * scene_, LightObstacleBehavior & behavior_ ) :
behavior(behavior_),
game(game_),
scene(scene_)
{
	//(*Initialize(LightObstacleBehaviorEditor)
	wxFlexGridSizer* FlexGridSizer1;

	Create(parent, wxID_ANY, wxEmptyString, wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 3, 0, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);
	//*)

}

LightObstacleBehaviorEditor::~LightObstacleBehaviorEditor()
{
	//(*Destroy(LightObstacleBehaviorEditor)
	//*)
}

void LightObstacleBehaviorEditor::OncancelBtClick(wxCommandEvent& event)
{
    EndModal(0);
}

void LightObstacleBehaviorEditor::OnokBtClick(wxCommandEvent& event)
{
}
#endif

