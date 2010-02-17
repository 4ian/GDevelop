#include "ProjectManager.h"

//(*InternalHeaders(ProjectManager)
#include <wx/intl.h>
#include <wx/string.h>
//*)
#include "Game_Develop_EditorMain.h"
#include "gdTreeItemStringData.h"

//(*IdInit(ProjectManager)
const long ProjectManager::ID_TREECTRL1 = wxNewId();
//*)

BEGIN_EVENT_TABLE(ProjectManager,wxPanel)
	//(*EventTable(ProjectManager)
	//*)
END_EVENT_TABLE()

ProjectManager::ProjectManager(wxWindow* parent, Game_Develop_EditorFrame & mainEditor_) :
mainEditor(mainEditor_)
{
	//(*Initialize(ProjectManager)
	wxFlexGridSizer* FlexGridSizer1;

	Create(parent, wxID_ANY, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(0);
	projectsTree = new wxTreeCtrl(this, ID_TREECTRL1, wxDefaultPosition, wxSize(209,197), wxTR_HIDE_ROOT|wxTR_DEFAULT_STYLE, wxDefaultValidator, _T("ID_TREECTRL1"));
	FlexGridSizer1->Add(projectsTree, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_ITEM_ACTIVATED,(wxObjectEventFunction)&ProjectManager::OnprojectsTreeItemActivated);
	//*)

    projectsTree->AddRoot(_("Projets"));

    Refresh();
}

ProjectManager::~ProjectManager()
{
	//(*Destroy(ProjectManager)
	//*)
}

void ProjectManager::Refresh()
{
    wxTreeItemId projectItem = projectsTree->AppendItem(projectsTree->GetRootItem(), _("Projet 1"));

    gdTreeItemStringData * data = new gdTreeItemStringData("AppName", "Images");
    projectsTree->AppendItem(projectItem, _("Images"), -1 ,-1, data);
}

void ProjectManager::OnprojectsTreeItemActivated(wxTreeEvent& event)
{
    if ( dynamic_cast<gdTreeItemStringData*>(projectsTree->GetItemData(event.GetItem())) == NULL)
        return;

    gdTreeItemStringData * data = dynamic_cast<gdTreeItemStringData*>(projectsTree->GetItemData(event.GetItem()));
    if ( data->GetSecondString() == "Images")
    {
        MainEditorCommand mainEditorCommand(mainEditor.nr, -1);
        mainEditorCommand.SetMainEditor(&mainEditor);
        mainEditorCommand.SetRibbon(mainEditor.GetRibbon());

        EditorImages * editorImages = new EditorImages(&mainEditor, mainEditor.game, mainEditorCommand, true);
        mainEditor.GetEditorsNotebook()->AddPage(editorImages, _("Editeur de la banque d'images"));
    }
}
