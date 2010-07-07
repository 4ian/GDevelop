#include "ExternalEventsEditor.h"

//(*InternalHeaders(ExternalEventsEditor)
#include <wx/intl.h>
#include <wx/string.h>
//*)
#include "GDL/ExternalEvents.h"
#include "GDL/Game.h"
#include "GDL/MainEditorCommand.h"
#include "EditorEvents.h"

//(*IdInit(ExternalEventsEditor)
const long ExternalEventsEditor::ID_STATICTEXT1 = wxNewId();
const long ExternalEventsEditor::ID_COMBOBOX1 = wxNewId();
const long ExternalEventsEditor::ID_CUSTOM2 = wxNewId();
//*)

BEGIN_EVENT_TABLE(ExternalEventsEditor,wxPanel)
	//(*EventTable(ExternalEventsEditor)
	//*)
END_EVENT_TABLE()

ExternalEventsEditor::ExternalEventsEditor(wxWindow* parent, Game & game_, ExternalEvents & events_, const MainEditorCommand & mainEditorCommand_) :
events(events_),
game(game_),
mainEditorCommand(mainEditorCommand_)
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
	StaticText1 = new wxStaticText(this, ID_STATICTEXT1, _("Editer comme si les évènements étaient inclus à la scène :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	FlexGridSizer2->Add(StaticText1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	parentSceneComboBox = new wxComboBox(this, ID_COMBOBOX1, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, 0, 0, wxDefaultValidator, _T("ID_COMBOBOX1"));
	parentSceneComboBox->SetSelection( parentSceneComboBox->Append(_("Aucune scène")) );
	FlexGridSizer2->Add(parentSceneComboBox, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 3);
	FlexGridSizer1->Add(FlexGridSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer3 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer3->AddGrowableCol(0);
	FlexGridSizer3->AddGrowableRow(0);
	FlexGridSizer4 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer4->AddGrowableCol(0);
	FlexGridSizer4->AddGrowableRow(0);
	eventsEditor = new EditorEvents(this, game, emptyScene, &events.events, mainEditorCommand);
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
}

ExternalEventsEditor::~ExternalEventsEditor()
{
	//(*Destroy(ExternalEventsEditor)
	//*)
}

/**
 * Change the scene used as parent for editing.
 */
void ExternalEventsEditor::OnparentSceneComboBoxSelect(wxCommandEvent& event)
{
    vector< boost::shared_ptr<Scene> >::iterator sceneFound =
        find_if(game.scenes.begin(), game.scenes.end(), bind2nd(SceneHasName(), string(parentSceneComboBox->GetValue().mb_str())));

    Scene * scene = NULL;

    if ( sceneFound != game.scenes.end() )
        scene = (*sceneFound).get();
    else if ( parentSceneComboBox->GetSelection() == 0 ) //0 i.e. "No scene"
        scene = &emptyScene;
    else
    {
        wxLogWarning(_("Scène introuvable."));
        return;
    }

    //Need to recreate an events editor.
    delete eventsEditor;
    eventsEditor = new EditorEvents(this, game, *scene, &events.events, mainEditorCommand);

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
    parentSceneComboBox->Append(_("Aucune scène"));

    for (unsigned int i = 0;i<game.scenes.size();++i)
    	parentSceneComboBox->Append(game.scenes[i]->GetName());
}
