/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */
#include "ExternalEventsEditor.h"

//(*InternalHeaders(ExternalEventsEditor)
#include <wx/intl.h>
#include <wx/string.h>
//*)
#include <wx/textctrl.h>
#include <wx/log.h>
#include <wx/ribbon/bar.h>
#include "GDCore/PlatformDefinition/ExternalEvents.h"
#include "GDL/Game.h"
#include "GDCore/IDE/Dialogs/MainFrameWrapper.h"
#include "EventsEditor.h"

//(*IdInit(ExternalEventsEditor)
const long ExternalEventsEditor::ID_STATICTEXT1 = wxNewId();
const long ExternalEventsEditor::ID_COMBOBOX1 = wxNewId();
const long ExternalEventsEditor::ID_CUSTOM2 = wxNewId();
//*)

BEGIN_EVENT_TABLE(ExternalEventsEditor,wxPanel)
	//(*EventTable(ExternalEventsEditor)
	//*)
END_EVENT_TABLE()

ExternalEventsEditor::ExternalEventsEditor(wxWindow* parent, Game & game_, gd::ExternalEvents & events_, const gd::MainFrameWrapper & mainFrameWrapper_) :
events(events_),
game(game_),
mainFrameWrapper(mainFrameWrapper_)
{
	//(*Initialize(ExternalEventsEditor)
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer2;

	Create(parent, wxID_ANY, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("wxID_ANY"));
	SetBackgroundColour(wxColour(255,255,255));
	FlexGridSizer1 = new wxFlexGridSizer(2, 1, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(1);
	FlexGridSizer2 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer2->AddGrowableCol(1);
	FlexGridSizer2->AddGrowableRow(0);
	StaticText1 = new wxStaticText(this, ID_STATICTEXT1, _("Edit as if the events were included to scene :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	FlexGridSizer2->Add(StaticText1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	parentSceneComboBox = new wxComboBox(this, ID_COMBOBOX1, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, 0, 0, wxDefaultValidator, _T("ID_COMBOBOX1"));
	parentSceneComboBox->SetSelection( parentSceneComboBox->Append(_("No scene")) );
	FlexGridSizer2->Add(parentSceneComboBox, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 3);
	FlexGridSizer1->Add(FlexGridSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer3 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer3->AddGrowableCol(0);
	FlexGridSizer3->AddGrowableRow(0);
	FlexGridSizer4 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer4->AddGrowableCol(0);
	FlexGridSizer4->AddGrowableRow(0);
	eventsEditor = new EventsEditor(this, game, emptyScene, &events.GetEvents(), mainFrameWrapper);
	FlexGridSizer4->Add(eventsEditor, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer3->Add(FlexGridSizer4, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer1->Add(FlexGridSizer3, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	Connect(ID_COMBOBOX1,wxEVT_COMMAND_COMBOBOX_SELECTED,(wxObjectEventFunction)&ExternalEventsEditor::OnparentSceneComboBoxSelect);
	Connect(ID_COMBOBOX1,wxEVT_COMMAND_TEXT_ENTER,(wxObjectEventFunction)&ExternalEventsEditor::OnparentSceneComboBoxSelect);
	//*)
	Connect(ID_COMBOBOX1,wxEVT_COMMAND_COMBOBOX_DROPDOWN,(wxObjectEventFunction)&ExternalEventsEditor::OnparentSceneComboBoxDropDown);

	eventsEditor->SetExternalEvents(&events);
	if ( !events.GetAssociatedScene().empty() ) parentSceneComboBox->SetValue(events.GetAssociatedScene());
}

ExternalEventsEditor::~ExternalEventsEditor()
{
	//(*Destroy(ExternalEventsEditor)
	//*)
}

void ExternalEventsEditor::ForceRefreshRibbonAndConnect()
{
    mainFrameWrapper.GetRibbon()->SetActivePage(3);
    eventsEditor->ConnectEvents();
}

/**
 * Change the scene used as parent for editing.
 */
void ExternalEventsEditor::OnparentSceneComboBoxSelect(wxCommandEvent& event)
{
    vector< boost::shared_ptr<Scene> >::iterator sceneFound =
        find_if(game.GetLayouts().begin(), game.GetLayouts().end(), bind2nd(SceneHasName(), string(parentSceneComboBox->GetValue().mb_str())));

    Scene * scene = NULL;

    if ( sceneFound != game.GetLayouts().end() )
        scene = (*sceneFound).get();
    else if ( parentSceneComboBox->GetSelection() == 0 ) //0 i.e. "No scene"
        scene = &emptyScene;
    else
    {
        wxLogWarning(_("Scene not found."));
        return;
    }

    //Save the scene chosen
    events.SetAssociatedScene(scene->GetName());

    //Need to recreate an events editor.
    delete eventsEditor;
    eventsEditor = new EventsEditor(this, game, *scene, &events.GetEvents(), mainFrameWrapper);

    //Make sure the new events editor is properly displayed.
    FlexGridSizer4->Detach(eventsEditor);
	FlexGridSizer4->Add(eventsEditor, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer4->Layout();
}

/**
 * Update scene list.
 */
void ExternalEventsEditor::OnparentSceneComboBoxDropDown(wxCommandEvent& event)
{
    parentSceneComboBox->Clear();
    parentSceneComboBox->Append(_("No scene"));

    for (unsigned int i = 0;i<game.GetLayoutCount();++i)
    	parentSceneComboBox->Append(game.GetLayout(i).GetName());
}

