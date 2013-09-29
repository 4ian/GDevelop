#include "ObjectsEditor.h"

//(*InternalHeaders(ObjectsEditor)
#include <wx/bitmap.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include <wx/toolbar.h>
#include <wx/log.h>
#include <wx/textdlg.h>
#include <wx/help.h>
#include <wx/config.h>
#include <wx/ribbon/bar.h>
#include <wx/ribbon/buttonbar.h>
#include <wx/ribbon/gallery.h>
#include <wx/ribbon/toolbar.h>
#include <wx/textdlg.h>
#include <wx/msgdlg.h>
#include <wx/choicdlg.h>
#include <wx/imaglist.h>
#include <wx/richtooltip.h>
#include <wx/dataobj.h>
#include <wx/dnd.h>
#include <boost/algorithm/string.hpp>

#include "GDCore/IDE/Dialogs/ChooseVariableDialog.h"
#include "GDCore/IDE/Dialogs/ChooseObjectTypeDialog.h"
#include "GDCore/Tools/HelpFileAccess.h"
#include "GDCore/IDE/CommonBitmapManager.h"
#include "GDCore/IDE/wxTools/TreeItemStringData.h"
#include "GDCore/IDE/Clipboard.h"
#include "GDCore/IDE/EventsRefactorer.h"
#include "GDCore/PlatformDefinition/Platform.h"
#include "GDCore/PlatformDefinition/Object.h"
#include "GDCore/CommonTools.h"
#include "LayoutEditorPropertiesPnl.h"
#include "../LogFileManager.h"
#include "../EditObjectGroup.h"

#ifdef __WXMSW__
#include <wx/msw/winundef.h>
#include <wx/msw/uxtheme.h>
#endif

using namespace std;

namespace gd {

//(*IdInit(ObjectsEditor)
const long ObjectsEditor::ID_TREECTRL1 = wxNewId();
const long ObjectsEditor::ID_TEXTCTRL1 = wxNewId();
const long ObjectsEditor::idMenuModObj = wxNewId();
const long ObjectsEditor::idMenuProp = wxNewId();
const long ObjectsEditor::idMenuModName = wxNewId();
const long ObjectsEditor::ID_SETGLOBALITEM = wxNewId();
const long ObjectsEditor::idMenuAddObj = wxNewId();
const long ObjectsEditor::idMenuDelObj = wxNewId();
const long ObjectsEditor::idMoveUp = wxNewId();
const long ObjectsEditor::idMoveDown = wxNewId();
const long ObjectsEditor::idMenuCopy = wxNewId();
const long ObjectsEditor::idMenuCut = wxNewId();
const long ObjectsEditor::idMenuPaste = wxNewId();
const long ObjectsEditor::ID_MENUITEM7 = wxNewId();
const long ObjectsEditor::IdGroupEdit = wxNewId();
const long ObjectsEditor::idModName = wxNewId();
const long ObjectsEditor::ID_MENUITEM8 = wxNewId();
const long ObjectsEditor::idAddGroup = wxNewId();
const long ObjectsEditor::idDelGroup = wxNewId();
const long ObjectsEditor::ID_MENUITEM1 = wxNewId();
const long ObjectsEditor::ID_MENUITEM2 = wxNewId();
const long ObjectsEditor::ID_MENUITEM3 = wxNewId();
const long ObjectsEditor::ID_MENUITEM4 = wxNewId();
const long ObjectsEditor::ID_MENUITEM5 = wxNewId();
const long ObjectsEditor::ID_MENUITEM6 = wxNewId();
//*)
const long ObjectsEditor::idRibbonAdd = wxNewId();
const long ObjectsEditor::idRibbonDel = wxNewId();
const long ObjectsEditor::idRibbonUp = wxNewId();
const long ObjectsEditor::idRibbonDown = wxNewId();
const long ObjectsEditor::idRibbonModProp = wxNewId();
const long ObjectsEditor::idRibbonModName = wxNewId();
const long ObjectsEditor::idRibbonCopy = wxNewId();
const long ObjectsEditor::idRibbonCut = wxNewId();
const long ObjectsEditor::idRibbonPaste = wxNewId();
const long ObjectsEditor::idRibbonHelp = wxNewId();
const long ObjectsEditor::idRibbonRefresh = wxNewId();

BEGIN_EVENT_TABLE(ObjectsEditor,wxPanel)
	//(*EventTable(ObjectsEditor)
	//*)
END_EVENT_TABLE()

ObjectsEditor::ObjectsEditor(wxWindow* parent, gd::Project & project_, gd::Layout * layout_, gd::MainFrameWrapper & mainFrameWrapper_) :
    project(project_),
    layout(layout_),
    mainFrameWrapper(mainFrameWrapper_),
    propPnl(NULL),
    propPnlManager(NULL)
{
    std::cout << "b" << std::endl;
	//(*Initialize(ObjectsEditor)
	wxMenuItem* delObjMenuI;
	wxMenuItem* editNameMenuI;
	wxMenuItem* editPropMenuItem;
	wxMenuItem* editMenuI;
	wxMenuItem* editMenuItem;
	wxFlexGridSizer* FlexGridSizer1;
	wxMenuItem* addObjMenuI;

	Create(parent, wxID_ANY, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(0);
	objectsList = new wxTreeCtrl(this, ID_TREECTRL1, wxDefaultPosition, wxDefaultSize, wxTR_EDIT_LABELS|wxTR_HIDE_ROOT|wxTR_ROW_LINES|wxTR_MULTIPLE|wxTR_DEFAULT_STYLE|wxNO_BORDER, wxDefaultValidator, _T("ID_TREECTRL1"));
	FlexGridSizer1->Add(objectsList, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	searchCtrl = new wxSearchCtrl(this, ID_TEXTCTRL1, wxEmptyString, wxDefaultPosition, wxDefaultSize, wxNO_BORDER, wxDefaultValidator, _T("ID_TEXTCTRL1"));
	FlexGridSizer1->Add(searchCtrl, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	editMenuI = new wxMenuItem((&contextMenu), idMenuModObj, _("Edit"), wxEmptyString, wxITEM_NORMAL);
	contextMenu.Append(editMenuI);
	editPropMenuItem = new wxMenuItem((&contextMenu), idMenuProp, _("Other properties"), wxEmptyString, wxITEM_NORMAL);
	editPropMenuItem->SetBitmap(wxBitmap(wxImage(_T("res/editpropicon.png"))));
	contextMenu.Append(editPropMenuItem);
	editNameMenuI = new wxMenuItem((&contextMenu), idMenuModName, _("Rename\tF2"), wxEmptyString, wxITEM_NORMAL);
	editNameMenuI->SetBitmap(wxBitmap(wxImage(_T("res/editnom.png"))));
	contextMenu.Append(editNameMenuI);
	MenuItem11 = new wxMenuItem((&contextMenu), ID_SETGLOBALITEM, _("Set as global object"), wxEmptyString, wxITEM_NORMAL);
	contextMenu.Append(MenuItem11);
	contextMenu.AppendSeparator();
	addObjMenuI = new wxMenuItem((&contextMenu), idMenuAddObj, _("Add an object"), wxEmptyString, wxITEM_NORMAL);
	addObjMenuI->SetBitmap(wxBitmap(wxImage(_T("res/addicon.png"))));
	contextMenu.Append(addObjMenuI);
	delObjMenuI = new wxMenuItem((&contextMenu), idMenuDelObj, _("Delete\tDel"), wxEmptyString, wxITEM_NORMAL);
	delObjMenuI->SetBitmap(wxBitmap(wxImage(_T("res/deleteicon.png"))));
	contextMenu.Append(delObjMenuI);
	contextMenu.AppendSeparator();
	moveUpMenuI = new wxMenuItem((&contextMenu), idMoveUp, _("Move up\tCtrl-Up"), wxEmptyString, wxITEM_NORMAL);
	moveUpMenuI->SetBitmap(wxBitmap(wxImage(_T("res/up.png"))));
	contextMenu.Append(moveUpMenuI);
	moveDownMenuI = new wxMenuItem((&contextMenu), idMoveDown, _("Move down\tCtrl-Down"), wxEmptyString, wxITEM_NORMAL);
	moveDownMenuI->SetBitmap(wxBitmap(wxImage(_T("res/down.png"))));
	contextMenu.Append(moveDownMenuI);
	contextMenu.AppendSeparator();
	copyMenuI = new wxMenuItem((&contextMenu), idMenuCopy, _("Copy\tCtrl-C"), wxEmptyString, wxITEM_NORMAL);
	copyMenuI->SetBitmap(wxBitmap(wxImage(_T("res/copyicon.png"))));
	contextMenu.Append(copyMenuI);
	cutMenuI = new wxMenuItem((&contextMenu), idMenuCut, _("Cut\tCtrl-X"), wxEmptyString, wxITEM_NORMAL);
	cutMenuI->SetBitmap(wxBitmap(wxImage(_T("res/cuticon.png"))));
	contextMenu.Append(cutMenuI);
	pasteMenuI = new wxMenuItem((&contextMenu), idMenuPaste, _("Paste\tCtrl-V"), wxEmptyString, wxITEM_NORMAL);
	pasteMenuI->SetBitmap(wxBitmap(wxImage(_T("res/pasteicon.png"))));
	contextMenu.Append(pasteMenuI);
	MenuItem2 = new wxMenuItem((&multipleContextMenu), ID_MENUITEM7, _("Delete\tDEL"), _("Delete all selected items"), wxITEM_NORMAL);
	MenuItem2->SetBitmap(wxBitmap(wxImage(_T("res/deleteicon.png"))));
	multipleContextMenu.Append(MenuItem2);
	editMenuItem = new wxMenuItem((&groupContextMenu), IdGroupEdit, _("Edit"), wxEmptyString, wxITEM_NORMAL);
	editMenuItem->SetBitmap(wxBitmap(wxImage(_T("res/editpropicon.png"))));
	groupContextMenu.Append(editMenuItem);
	MenuItem4 = new wxMenuItem((&groupContextMenu), idModName, _("Rename"), wxEmptyString, wxITEM_NORMAL);
	MenuItem4->SetBitmap(wxBitmap(wxImage(_T("res/editnom.png"))));
	groupContextMenu.Append(MenuItem4);
	MenuItem12 = new wxMenuItem((&groupContextMenu), ID_MENUITEM8, _("Set as global group"), wxEmptyString, wxITEM_NORMAL);
	groupContextMenu.Append(MenuItem12);
	groupContextMenu.AppendSeparator();
	MenuItem1 = new wxMenuItem((&groupContextMenu), idAddGroup, _("Add a group"), wxEmptyString, wxITEM_NORMAL);
	MenuItem1->SetBitmap(wxBitmap(wxImage(_T("res/addicon.png"))));
	groupContextMenu.Append(MenuItem1);
	MenuItem3 = new wxMenuItem((&groupContextMenu), idDelGroup, _("Delete"), wxEmptyString, wxITEM_NORMAL);
	MenuItem3->SetBitmap(wxBitmap(wxImage(_T("res/deleteicon.png"))));
	groupContextMenu.Append(MenuItem3);
	groupContextMenu.AppendSeparator();
	MenuItem5 = new wxMenuItem((&groupContextMenu), ID_MENUITEM1, _("Copy"), wxEmptyString, wxITEM_NORMAL);
	MenuItem5->SetBitmap(wxBitmap(wxImage(_T("res/copyicon.png"))));
	groupContextMenu.Append(MenuItem5);
	MenuItem6 = new wxMenuItem((&groupContextMenu), ID_MENUITEM2, _("Cut"), wxEmptyString, wxITEM_NORMAL);
	MenuItem6->SetBitmap(wxBitmap(wxImage(_T("res/cuticon.png"))));
	groupContextMenu.Append(MenuItem6);
	MenuItem7 = new wxMenuItem((&groupContextMenu), ID_MENUITEM3, _("Paste"), wxEmptyString, wxITEM_NORMAL);
	MenuItem7->SetBitmap(wxBitmap(wxImage(_T("res/pasteicon.png"))));
	groupContextMenu.Append(MenuItem7);
	MenuItem8 = new wxMenuItem((&emptyContextMenu), ID_MENUITEM4, _("Add an object"), wxEmptyString, wxITEM_NORMAL);
	MenuItem8->SetBitmap(wxBitmap(wxImage(_T("res/addicon.png"))));
	emptyContextMenu.Append(MenuItem8);
	MenuItem9 = new wxMenuItem((&emptyContextMenu), ID_MENUITEM5, _("Add a group"), wxEmptyString, wxITEM_NORMAL);
	emptyContextMenu.Append(MenuItem9);
	emptyContextMenu.AppendSeparator();
	MenuItem10 = new wxMenuItem((&emptyContextMenu), ID_MENUITEM6, _("Paste"), wxEmptyString, wxITEM_NORMAL);
	MenuItem10->SetBitmap(wxBitmap(wxImage(_T("res/pasteicon.png"))));
	emptyContextMenu.Append(MenuItem10);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_BEGIN_DRAG,(wxObjectEventFunction)&ObjectsEditor::OnobjectsListBeginDrag);
	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_BEGIN_LABEL_EDIT,(wxObjectEventFunction)&ObjectsEditor::OnobjectsListBeginLabelEdit);
	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_END_LABEL_EDIT,(wxObjectEventFunction)&ObjectsEditor::OnobjectsListEndLabelEdit);
	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_ITEM_ACTIVATED,(wxObjectEventFunction)&ObjectsEditor::OnobjectsListItemActivated);
	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_ITEM_RIGHT_CLICK,(wxObjectEventFunction)&ObjectsEditor::OnobjectsListItemRightClick);
	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_SEL_CHANGED,(wxObjectEventFunction)&ObjectsEditor::OnobjectsListSelectionChanged);
	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_KEY_DOWN,(wxObjectEventFunction)&ObjectsEditor::OnobjectsListKeyDown);
	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_ITEM_MENU,(wxObjectEventFunction)&ObjectsEditor::OnobjectsListItemMenu);
	Connect(ID_TEXTCTRL1,wxEVT_COMMAND_TEXT_UPDATED,(wxObjectEventFunction)&ObjectsEditor::OnsearchCtrlText);
	Connect(idMenuModObj,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ObjectsEditor::OnMenuEditObjectSelected);
	Connect(idMenuProp,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ObjectsEditor::OnMenuPropertiesSelected);
	Connect(idMenuModName,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ObjectsEditor::OnMenuRenameSelected);
	Connect(ID_SETGLOBALITEM,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ObjectsEditor::OnSetGlobalSelected);
	Connect(idMenuAddObj,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ObjectsEditor::OnAddObjectSelected);
	Connect(idMenuDelObj,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ObjectsEditor::OnDeleteSelected);
	Connect(idMoveUp,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ObjectsEditor::OnMoveupSelected);
	Connect(idMoveDown,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ObjectsEditor::OnMoveDownSelected);
	Connect(idMenuCopy,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ObjectsEditor::OnCopySelected);
	Connect(idMenuCut,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ObjectsEditor::OnCutSelected);
	Connect(idMenuPaste,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ObjectsEditor::OnPasteSelected);
	Connect(ID_MENUITEM7,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ObjectsEditor::OnDeleteSelected);
	Connect(IdGroupEdit,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ObjectsEditor::OnMenuEditObjectSelected);
	Connect(idModName,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ObjectsEditor::OnMenuRenameSelected);
	Connect(ID_MENUITEM8,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ObjectsEditor::OnSetGlobalSelected);
	Connect(idAddGroup,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ObjectsEditor::OnAddGroupSelected);
	Connect(idDelGroup,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ObjectsEditor::OnDeleteSelected);
	Connect(ID_MENUITEM1,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ObjectsEditor::OnCopySelected);
	Connect(ID_MENUITEM2,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ObjectsEditor::OnCutSelected);
	Connect(ID_MENUITEM3,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ObjectsEditor::OnPasteSelected);
	Connect(ID_MENUITEM4,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ObjectsEditor::OnAddObjectSelected);
	Connect(ID_MENUITEM5,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ObjectsEditor::OnAddGroupSelected);
	Connect(ID_MENUITEM6,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ObjectsEditor::OnPasteSelected);
	Connect(wxEVT_SET_FOCUS,(wxObjectEventFunction)&ObjectsEditor::OnSetFocus);
	//*)

    std::cout << "a" << std::endl;
    #if defined(__WXMSW__) //Offer nice look to wxTreeCtrl
    wxUxThemeEngine* theme =  wxUxThemeEngine::GetIfActive();
    if(theme) theme->SetWindowTheme((HWND) objectsList->GetHWND(), L"EXPLORER", NULL);
    #endif

    std::cout << "c" << std::endl;
    objectsImagesList = new wxImageList(24,24, true);
    objectsList->AssignImageList(objectsImagesList);

    std::cout << "Refresh" << std::endl;
    Refresh();
    std::cout << "RefreshEND" << std::endl;
}

ObjectsEditor::~ObjectsEditor()
{
	//(*Destroy(ObjectsEditor)
	//*)
}

void ObjectsEditor::SetAssociatedPropertiesPanel(LayoutEditorPropertiesPnl * propPnl_, wxAuiManager * manager_)
{
    propPnl = propPnl_;
    propPnlManager = manager_;
}

/**
 * Static method for creating ribbon page for this kind of editor
 */
void ObjectsEditor::CreateRibbonPage(wxRibbonPage * page)
{
    wxConfigBase *pConfig = wxConfigBase::Get();
    bool hideLabels = false;
    pConfig->Read( _T( "/Skin/HideLabels" ), &hideLabels );

    {
        wxRibbonPanel *ribbonPanel = new wxRibbonPanel(page, wxID_ANY, _("Objects list"), wxBitmap("res/list24.png", wxBITMAP_TYPE_ANY), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        wxRibbonButtonBar *ribbonBar = new wxRibbonButtonBar(ribbonPanel, wxID_ANY);
        ribbonBar->AddButton(idRibbonAdd, !hideLabels ? _("Add an object") : "", wxBitmap("res/add24.png", wxBITMAP_TYPE_ANY));
        ribbonBar->AddButton(idRibbonDel, !hideLabels ? _("Delete") : "", wxBitmap("res/delete24.png", wxBITMAP_TYPE_ANY));
        ribbonBar->AddButton(idRibbonUp, !hideLabels ? _("Move up") : "", wxBitmap("res/up24.png", wxBITMAP_TYPE_ANY));
        ribbonBar->AddButton(idRibbonDown, !hideLabels ? _("Move down") : "", wxBitmap("res/down24.png", wxBITMAP_TYPE_ANY));
        ribbonBar->AddButton(idRibbonRefresh, !hideLabels ? _("Refresh") : "", wxBitmap("res/refreshicon24.png", wxBITMAP_TYPE_ANY));
    }
    {
        wxRibbonPanel *ribbonPanel = new wxRibbonPanel(page, wxID_ANY, _("Selected object"), wxBitmap("res/edit24.png", wxBITMAP_TYPE_ANY), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        wxRibbonButtonBar *ribbonBar = new wxRibbonButtonBar(ribbonPanel, wxID_ANY);
        ribbonBar->AddButton(idRibbonModProp, !hideLabels ? _("Edition") : "", wxBitmap("res/editprop24.png", wxBITMAP_TYPE_ANY));
        ribbonBar->AddButton(idRibbonModName, !hideLabels ? _("Rename") : "", wxBitmap("res/editname24.png", wxBITMAP_TYPE_ANY));
    }
    {
        wxRibbonPanel *ribbonPanel = new wxRibbonPanel(page, wxID_ANY, _("Clipboard"), wxBitmap("res/copy24.png", wxBITMAP_TYPE_ANY), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        wxRibbonButtonBar *ribbonBar = new wxRibbonButtonBar(ribbonPanel, wxID_ANY);
        ribbonBar->AddButton(idRibbonCopy, !hideLabels ? _("Copy") : "", wxBitmap("res/copy24.png", wxBITMAP_TYPE_ANY));
        ribbonBar->AddButton(idRibbonCut, !hideLabels ? _("Cut") : "", wxBitmap("res/cut24.png", wxBITMAP_TYPE_ANY));
        ribbonBar->AddButton(idRibbonPaste, !hideLabels ? _("Paste") : "", wxBitmap("res/paste24.png", wxBITMAP_TYPE_ANY));
    }
    {
        wxRibbonPanel *ribbonPanel = new wxRibbonPanel(page, wxID_ANY, _("Help"), wxBitmap("res/helpicon24.png", wxBITMAP_TYPE_ANY), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        wxRibbonButtonBar *ribbonBar = new wxRibbonButtonBar(ribbonPanel, wxID_ANY);
        ribbonBar->AddButton(idRibbonHelp, !hideLabels ? _("Help") : "", wxBitmap("res/helpicon24.png", wxBITMAP_TYPE_ANY));
    }

}

void ObjectsEditor::OnHelpSelected( wxCommandEvent& event )
{
    gd::HelpFileAccess::GetInstance()->OpenURL(_("http://www.wiki.compilgames.net/doku.php/en/game_develop/documentation/manual/edit_object"));
}

void ObjectsEditor::ConnectEvents()
{
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonAdd, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&ObjectsEditor::OnMenuEditObjectSelected, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonDel, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&ObjectsEditor::OnDeleteSelected, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonUp, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&ObjectsEditor::OnMoveupSelected, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonDown, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&ObjectsEditor::OnMoveDownSelected, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonModProp, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&ObjectsEditor::OnMenuPropertiesSelected, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonModName, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&ObjectsEditor::OnMenuRenameSelected, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonCopy, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&ObjectsEditor::OnCopySelected, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonCut, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&ObjectsEditor::OnCutSelected, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonPaste, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&ObjectsEditor::OnPasteSelected, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonHelp, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&ObjectsEditor::OnHelpSelected, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonRefresh, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&ObjectsEditor::Refresh, NULL, this);
}

void ObjectsEditor::Refresh()
{
    objectsList->DeleteAllItems();
    objectsImagesList->RemoveAll();
    objectsImagesList->Add(gd::CommonBitmapManager::GetInstance()->objects24);
    objectsImagesList->Add(gd::CommonBitmapManager::GetInstance()->group24);

    objectsList->AddRoot( "Root", 0 );

    if ( layout ) latestObjItem = AddObjectsToList(*layout, false);
    if ( layout ) latestGroupItem = AddGroupsToList(layout->GetObjectGroups(), false);
    latestGlobalObjItem = AddObjectsToList(project, true);
    latestGlobalGroupItem = AddGroupsToList(project.GetObjectGroups(), true);

    objectsList->ExpandAll();
}

wxTreeItemId ObjectsEditor::AddObjectsToList(gd::ClassWithObjects & objects, bool globalObjects)
{
    std::string searchText = boost::to_upper_copy(gd::ToString(searchCtrl->GetValue()));
    bool searching = searchText.empty() ? false : true;

    wxTreeItemId lastAddedItem;
    for ( unsigned int i = 0;i < objects.GetObjectsCount();i++ )
    {
        std::string name = objects.GetObject(i).GetName();

        //Only add objects if they match the search criteria
        if ( ( !searching || (searching && boost::to_upper_copy(name).find(searchText) != std::string::npos)) )
        {
            int thumbnailID = -1;
            wxBitmap thumbnail;
            if ( objects.GetObject(i).GenerateThumbnail(project, thumbnail)  && thumbnail.IsOk() )
            {
                objectsImagesList->Add(thumbnail);
                thumbnailID = objectsImagesList->GetImageCount()-1;
            }

            wxTreeItemId item = objectsList->AppendItem( objectsList->GetRootItem(),
                objects.GetObject(i).GetName(), thumbnailID );
            objectsList->SetItemData(item, new gd::TreeItemStringData(globalObjects ? "GlobalObject" : "LayoutObject"));
            if ( globalObjects ) objectsList->SetItemTextColour(item, wxColour(40,40,45));

            lastAddedItem = item;
        }
    }

    if ( !globalObjects && objects.GetObjectsCount() == 0 )
    {
        wxTreeItemId item = objectsList->AppendItem( objectsList->GetRootItem(), _("No objects"), 0 );
        substituteObjItem = item;
        lastAddedItem = item;
    }

    return lastAddedItem;
}

wxTreeItemId ObjectsEditor::AddGroupsToList(std::vector <ObjectGroup> & groups, bool globalGroup)
{
    std::string searchText = boost::to_upper_copy(gd::ToString(searchCtrl->GetValue()));
    bool searching = searchText.empty() ? false : true;

    wxTreeItemId lastAddedItem;
    for (unsigned int i = 0;i<groups.size();++i)
    {
        if ( ( !searching || (searching && boost::to_upper_copy(groups[i].GetName()).find(searchText) != std::string::npos)) )
        {
            wxTreeItemId item = objectsList->AppendItem( objectsList->GetRootItem(), groups[i].GetName(), 1 );
            objectsList->SetItemData(item, new gd::TreeItemStringData(globalGroup ? "GlobalGroup" : "LayoutGroup"));
            if ( globalGroup ) objectsList->SetItemTextColour(item, wxColour(40,40,45));

            lastAddedItem = item;
        }
    }

    if ( !globalGroup && groups.empty() )
    {
        wxTreeItemId item = objectsList->AppendItem( objectsList->GetRootItem(), _("No groups"), 1 );
        substituteGroupItem = item;
        lastAddedItem = item;
    }

    return lastAddedItem;
}

void ObjectsEditor::OnobjectsListItemActivated(wxTreeEvent& event)
{
    mainFrameWrapper.GetRibbon()->SetActivePage(4);
    ConnectEvents();

    lastSelectedItem = event.GetItem();
    wxCommandEvent useless;
    OnMenuEditObjectSelected( useless );
}

void ObjectsEditor::OnobjectsListItemRightClick(wxTreeEvent& event)
{
    mainFrameWrapper.GetRibbon()->SetActivePage(4);
    ConnectEvents();

    lastSelectedItem = event.GetItem();
}

void ObjectsEditor::OnobjectsListItemMenu(wxTreeEvent& event)
{
    lastSelectedItem = event.GetItem();
    gd::TreeItemStringData * data = dynamic_cast<gd::TreeItemStringData*>(objectsList->GetItemData(lastSelectedItem));
    wxArrayTreeItemIds selection;

    if ( objectsList->GetSelections(selection) > 1 )
    {
        PopupMenu( &multipleContextMenu );
    }
    else if ( lastSelectedItem == substituteGroupItem || lastSelectedItem == substituteObjItem )
        PopupMenu( &emptyContextMenu );
    else if ( data && (data->GetString() == "GlobalObject" || data->GetString() == "LayoutObject") )
    {
        contextMenu.Enable(ID_SETGLOBALITEM, data->GetString() == "LayoutObject");
        PopupMenu( &contextMenu );
    }
    else if ( data && (data->GetString() == "GlobalGroup" || data->GetString() == "LayoutGroup") )
    {
        contextMenu.Enable(ID_SETGLOBALITEM, data->GetString() == "LayoutGroup");
        PopupMenu( &groupContextMenu );
    }
}

void ObjectsEditor::OnobjectsListKeyDown(wxTreeEvent& event)
{
    mainFrameWrapper.GetRibbon()->SetActivePage(4);
    ConnectEvents();

    if ( event.GetKeyCode() == WXK_DELETE )
    {
        wxCommandEvent unusedEvent;
        OnDeleteSelected( unusedEvent );
    }
    else if (event.GetKeyCode() == WXK_F2)
    {
        wxCommandEvent unusedEvent;
        OnMenuRenameSelected( unusedEvent );
    }
    else if (event.GetKeyEvent().GetModifiers() == wxMOD_CMD)
    {
        switch ( event.GetKeyCode() )
        {
            case 67: //Ctrl C
            {
                wxCommandEvent unusedEvent;
                OnCopySelected( unusedEvent );
                break;
            }
            case 86: //Ctrl-V
            {
                wxCommandEvent unusedEvent;
                OnPasteSelected( unusedEvent );
                break;
            }
            case 88: //Ctrl-X
            {
                wxCommandEvent unusedEvent;
                OnCutSelected( unusedEvent );
                break;
            }
            case WXK_UP:
            {
                wxCommandEvent unusedEvent;
                OnMoveupSelected( unusedEvent );
                break;
            }
            case WXK_DOWN:
            {
                wxCommandEvent unusedEvent;
                OnMoveDownSelected( unusedEvent );
                break;
            }
            default:
                break;
        }
    }
}

void ObjectsEditor::OnobjectsListBeginLabelEdit(wxTreeEvent& event)
{
	if ( !event.GetLabel().empty() ) //event.GetLabel() is empty on linux.
    	renamedItemOldName = gd::ToString(event.GetLabel());
}

void ObjectsEditor::OnobjectsListEndLabelEdit(wxTreeEvent& event)
{
    if ( event.IsEditCancelled() ) return;

    string newName = ToString(event.GetLabel());
    string oldName = renamedItemOldName;

    lastSelectedItem = event.GetItem();
    gd::TreeItemStringData * data = dynamic_cast<gd::TreeItemStringData*>(objectsList->GetItemData(lastSelectedItem));
    if (!data) return;

    //Rename an object
    if ( data->GetString() == "GlobalObject" || data->GetString() == "LayoutObject" )
    {
        bool globalObject = data->GetString() == "GlobalObject";
        gd::ClassWithObjects * objects = layout;
        if ( globalObject ) objects = &project;
        if (!objects) return;

        //Be sure there is not already another object with this name
        if ( objects->HasObjectNamed(newName) )
        {
            wxLogWarning( _( "Unable to rename the object : another object has already this name." ) );

            event.Veto();
            return;
        }

        //Be sure the name is valid
        if ( !project.ValidateObjectName(newName) )
        {
            wxRichToolTip tip(_("Invalid name"), project.GetBadObjectNameWarning());
            tip.SetIcon(wxICON_INFORMATION);
            tip.ShowFor(this);

            event.Veto();
            return;
        }

        if ( !objects->HasObjectNamed(oldName) ) return;
        objects->GetObject(oldName).SetName( newName );

        if ( !globalObject && layout ) //Change the object name in the layout.
        {
            gd::EventsRefactorer::RenameObjectInEvents(project.GetCurrentPlatform(), project, *layout, layout->GetEvents(), oldName, newName);
            layout->GetInitialInstances().RenameInstancesOfObject(oldName, newName);
            for (unsigned int g = 0;g<layout->GetObjectGroups().size();++g)
            {
                if ( layout->GetObjectGroups()[g].Find(oldName))
                {
                    layout->GetObjectGroups()[g].RemoveObject(oldName);
                    layout->GetObjectGroups()[g].AddObject(newName);
                }
            }
            //TODO: Factor this? And change the name in external events.
        }
        else if ( globalObject ) //Change the object name in all layouts
        {
            for (unsigned int g = 0;g<project.GetObjectGroups().size();++g)
            {
                if ( project.GetObjectGroups()[g].Find(oldName))
                {
                    project.GetObjectGroups()[g].RemoveObject(oldName);
                    project.GetObjectGroups()[g].AddObject(newName);
                }
            }

            for (unsigned int i = 0;i<project.GetLayoutCount();++i)
            {
                gd::Layout & layout = project.GetLayout(i);
                if ( layout.HasObjectNamed(oldName) ) continue;

                gd::EventsRefactorer::RenameObjectInEvents(project.GetCurrentPlatform(), project, layout, layout.GetEvents(), oldName, newName);
                layout.GetInitialInstances().RenameInstancesOfObject(oldName, newName);
                for (unsigned int g = 0;g<layout.GetObjectGroups().size();++g)
                {
                    if ( layout.GetObjectGroups()[g].Find(oldName))
                    {
                        layout.GetObjectGroups()[g].RemoveObject(oldName);
                        layout.GetObjectGroups()[g].AddObject(newName);
                    }
                }
            }

            //TODO: Factor this? And change the name in external events.
        }

        for ( unsigned int j = 0; j < project.GetUsedPlatforms().size();++j)
            project.GetUsedPlatforms()[j]->GetChangesNotifier().OnObjectRenamed(project, globalObject ? NULL : layout, objects->GetObject(newName), oldName);
    }
    // Rename a group
    else if ( data && (data->GetString() == "GlobalGroup" || data->GetString() == "LayoutGroup") )
    {
        bool globalGroup = data->GetString() == "GlobalGroup";
        vector<gd::ObjectGroup> & objectsGroups =
            (globalGroup || !layout) ? project.GetObjectGroups() : layout->GetObjectGroups();

        if ( std::find_if(  objectsGroups.begin(),
                            objectsGroups.end(),
                            std::bind2nd(gd::GroupHasTheSameName(), event.GetLabel())) != objectsGroups.end())
        {
            wxLogWarning( _( "Unable to rename the groupe : another group has already this name." ) );

            event.Veto();
            return;
        }

        vector<gd::ObjectGroup>::iterator i = std::find_if( objectsGroups.begin(),
                                                        objectsGroups.end(),
                                                        std::bind2nd(gd::GroupHasTheSameName(), oldName));

        if ( i != objectsGroups.end() )
        {
            i->SetName( newName );

            //TODO: Factor this? And change the name in external events.
            if (!globalGroup && layout)
                gd::EventsRefactorer::RenameObjectInEvents(project.GetCurrentPlatform(), project, *layout, layout->GetEvents(), oldName, newName);
            else
            {
                for (unsigned int i = 0;i<project.GetLayoutCount();++i)
                {
                    gd::Layout & layout = project.GetLayout(i);
                    if (std::find_if( layout.GetObjectGroups().begin(),
                                      layout.GetObjectGroups().end(),
                                      std::bind2nd(gd::GroupHasTheSameName(), newName)) != layout.GetObjectGroups().end())
                        continue;

                    gd::EventsRefactorer::RenameObjectInEvents(project.GetCurrentPlatform(), project, layout, layout.GetEvents(), oldName, newName);
                }
            }

            for ( unsigned int j = 0; j < project.GetUsedPlatforms().size();++j)
                project.GetUsedPlatforms()[j]->GetChangesNotifier().OnObjectGroupRenamed(project, globalGroup ? NULL : layout, newName, oldName);
        }
    }
}

void ObjectsEditor::OnobjectsListSelectionChanged(wxTreeEvent& event)
{
    lastSelectedItem = event.GetItem();
    renamedItemOldName = gd::ToString(objectsList->GetItemText(lastSelectedItem));

    mainFrameWrapper.GetRibbon()->SetActivePage(4);
    ConnectEvents();

    //Get the selected item
    gd::TreeItemStringData * data = dynamic_cast<gd::TreeItemStringData*>(objectsList->GetItemData(lastSelectedItem));

    //Object clicked?
    if ( data && (data->GetString() == "GlobalObject" || data->GetString() == "LayoutObject") )
    {
        objectsList->SetToolTip( "" );
    }
    else if ( data && (data->GetString() == "GlobalGroup" || data->GetString() == "LayoutGroup") )
    {
        gd::ObjectGroup * group = GetSelectedGroup();
        if ( !group ) return;

        wxString tooltip = _("Contents of group \"");
        tooltip += group->GetName();
        tooltip += "\" :\n";
        vector < string > allObjects = group->GetAllObjectsNames();
        for (unsigned int j = 0;j< allObjects.size() && j < 10;++j)
        {
        	tooltip += allObjects.at(j)+"\n";
        	if ( j == 9 ) tooltip += "...";
        }
        objectsList->SetToolTip( tooltip );

    }

    UpdateAssociatedPropertiesPanel();
}

gd::Object * ObjectsEditor::GetSelectedObject()
{
    std::string objectName = gd::ToString(objectsList->GetItemText(lastSelectedItem));
    gd::TreeItemStringData * data = dynamic_cast<gd::TreeItemStringData*>(objectsList->GetItemData(lastSelectedItem));
    bool globalObject = data->GetString() == "GlobalObject";
    gd::Object * object = NULL;
    if ( globalObject && project.HasObjectNamed(objectName) )
        object = &project.GetObject(objectName);
    else if ( !globalObject && layout && layout->HasObjectNamed(objectName) )
        object = &layout->GetObject(objectName);

    return object;
}

gd::ObjectGroup * ObjectsEditor::GetSelectedGroup()
{
    std::string groupName = gd::ToString(objectsList->GetItemText(lastSelectedItem));
    gd::TreeItemStringData * data = dynamic_cast<gd::TreeItemStringData*>(objectsList->GetItemData(lastSelectedItem));
    bool globalGroup = data->GetString() == "GlobalGroup";

    std::vector<gd::ObjectGroup> & objectsGroups =
        globalGroup || !layout ? project.GetObjectGroups() : layout->GetObjectGroups();

    std::vector<gd::ObjectGroup>::iterator it = std::find_if(objectsGroups.begin(), objectsGroups.end(),
        std::bind2nd(gd::GroupHasTheSameName(), groupName));

    return it != objectsGroups.end() ? &(*it) : NULL;
}

void ObjectsEditor::OnMenuEditObjectSelected(wxCommandEvent& event)
{
    //Get the selected item
    gd::TreeItemStringData * data = dynamic_cast<gd::TreeItemStringData*>(objectsList->GetItemData(lastSelectedItem));

    //Object clicked?
    if ( data && (data->GetString() == "GlobalObject" || data->GetString() == "LayoutObject") )
    {
        bool globalObject = data->GetString() == "GlobalObject";
        gd::Object * object = GetSelectedObject();
        if ( !object ) return;

        object->EditObject(this, project, mainFrameWrapper);
        for ( unsigned int j = 0; j < project.GetUsedPlatforms().size();++j)
            project.GetUsedPlatforms()[j]->GetChangesNotifier().OnObjectEdited(project, globalObject ? NULL : layout, *object);

        //Reload thumbnail
        int thumbnailID = -1;
        wxBitmap thumbnail;
        if ( object->GenerateThumbnail(project, thumbnail) && thumbnail.IsOk() )
        {
            objectsImagesList->Add(thumbnail);
            thumbnailID = objectsImagesList->GetImageCount()-1;
        }

        objectsList->SetItemImage( lastSelectedItem, thumbnailID );

        //Reload resources
        if (layout)
        {
            //Reload resources : Do not forget to switch the working directory.
            wxString oldWorkingDir = wxGetCwd();
            if ( wxDirExists(wxFileName::FileName(project.GetProjectFile()).GetPath()))
                wxSetWorkingDirectory(wxFileName::FileName(project.GetProjectFile()).GetPath());

            object->LoadResources(project, *layout);

            wxSetWorkingDirectory(oldWorkingDir);
        }
    }
    //Group clicked?
    else if ( data && (data->GetString() == "GlobalGroup" || data->GetString() == "LayoutGroup") )
    {
        bool globalGroup = data->GetString() == "GlobalGroup";
        gd::ObjectGroup * group = GetSelectedGroup();
        if (group && layout)
        {
            EditObjectGroup dialog(this, project, *layout, *group); //TODO: Layout is mandatory here
            if ( dialog.ShowModal() == 1 )
                *group = dialog.group;

            for ( unsigned int j = 0; j < project.GetUsedPlatforms().size();++j)
                project.GetUsedPlatforms()[j]->GetChangesNotifier().OnObjectGroupEdited(project, globalGroup ? NULL : layout, group->GetName());
            return;
        }
    }
}


void ObjectsEditor::OnMenuPropertiesSelected(wxCommandEvent& event)
{
    if ( propPnl && propPnlManager ) {
    	propPnlManager->GetPane("PROPERTIES").Show();
    	propPnlManager->Update();
	}    	
}

void ObjectsEditor::OnMenuRenameSelected(wxCommandEvent& event)
{
    objectsList->EditLabel( lastSelectedItem );
}

void ObjectsEditor::OnAddObjectSelected(wxCommandEvent& event)
{
    gd::ChooseObjectTypeDialog chooseTypeDialog(this, project);
    if ( chooseTypeDialog.ShowModal() == 0 )
        return;

    gd::ClassWithObjects & objects = layout ? static_cast<gd::ClassWithObjects &>(*layout) : (project);

    //Find a new unique name for the object
    std::string name = ToString(_("NewObject"));
    for (unsigned int i = 2;objects.HasObjectNamed(name);++i)
        name = _("NewObject")+ToString(i);

    //Add a new object of selected type to objects list
    objects.InsertNewObject(project, chooseTypeDialog.GetSelectedObjectType(), ToString(name), objects.GetObjectsCount());

    //And to the TreeCtrl
    wxTreeItemId previous = layout ? latestObjItem : latestGlobalObjItem;
    wxTreeItemId itemAdded = objectsList->InsertItem( objectsList->GetRootItem(), previous, name );
    if ( previous == substituteObjItem ) objectsList->Delete(substituteObjItem);

    //Reload thumbnail
    int thumbnailID = -1;
    wxBitmap thumbnail;
    if ( objects.GetObject(objects.GetObjectsCount()-1).GenerateThumbnail(project, thumbnail) )
    {
        objectsImagesList->Add(thumbnail);
        thumbnailID = objectsImagesList->GetImageCount()-1;
    }
    objectsList->SetItemImage( itemAdded, thumbnailID );

    //Data
    objectsList->SetItemData( itemAdded, new gd::TreeItemStringData("LayoutObject") );
    latestObjItem = itemAdded;

    for ( unsigned int j = 0; j < project.GetUsedPlatforms().size();++j)
        project.GetUsedPlatforms()[j]->GetChangesNotifier().OnObjectAdded(project, layout, objects.GetObject(name));

    objectsList->EditLabel(itemAdded);

    wxLogStatus( _( "The object was correctly added" ) );
}

void ObjectsEditor::OnAddGroupSelected(wxCommandEvent& event)
{
    gd::ObjectGroup newGroup;
    wxTreeItemId rootId = objectsList->GetRootItem();

    vector<gd::ObjectGroup> & objectsGroups = !layout ? project.GetObjectGroups() : layout->GetObjectGroups();

    std::string name = ToString(_("NewGroup"));
    for (unsigned int i = 2;
        std::find_if( objectsGroups.begin(), objectsGroups.end(), std::bind2nd(gd::GroupHasTheSameName(), name))
            != objectsGroups.end();
        ++i)
        name = _("NewGroup")+ToString(i);

    newGroup.SetName( name );

    objectsGroups.push_back( newGroup );

    wxTreeItemId previous = layout ? latestGroupItem : latestGlobalGroupItem;
    wxTreeItemId itemAdded = objectsList->InsertItem( rootId, previous, name, 1 );
    objectsList->SetItemData( itemAdded, new gd::TreeItemStringData("LayoutGroup") );
    if ( previous == substituteGroupItem ) objectsList->Delete(substituteGroupItem);
    latestGroupItem = itemAdded;

    for ( unsigned int j = 0; j < project.GetUsedPlatforms().size();++j)
        project.GetUsedPlatforms()[j]->GetChangesNotifier().OnObjectGroupAdded(project, layout ? layout : NULL, name);
    wxLogStatus( _( "The group was correctly added." ) );
}


void ObjectsEditor::OnDeleteSelected(wxCommandEvent& event)
{
    wxArrayTreeItemIds selection;
    objectsList->GetSelections(selection);
    std::vector < string > objectsDeleted;
    std::vector < string > gObjectsDeleted;

    int answer = wxMessageBox(selection.GetCount() <= 1 ? _("Delete also all references to this item in groups and events ( i.e. Actions and conditions using the object )\?") :
                                                             wxString::Format(_("Delete also all references to these %i items in groups and events ( i.e. Actions and conditions using the objects )\?"), selection.GetCount()),
                              _("Confirm deletion"), wxYES_NO | wxCANCEL | wxCANCEL_DEFAULT);

    if ( answer == wxCANCEL ) return;

    //Removing objects
    for (unsigned int i = 0;i<selection.GetCount();++i)
    {
        if (!selection[i].IsOk()) continue;
        gd::TreeItemStringData * data = dynamic_cast<gd::TreeItemStringData*>(objectsList->GetItemData(selection[i]));
        if (!data) continue;

        if ( data->GetString() == "GlobalObject" || data->GetString() == "LayoutObject" )
        {
            bool globalObject = data->GetString() == "GlobalObject";
            std::string objectName = ToString(objectsList->GetItemText( selection[i] ));
            gd::ClassWithObjects & objects = !globalObject && layout ? static_cast<gd::ClassWithObjects&>(*layout) : project;
            //Generate also a list containing the names of the objects deleted :
            if ( globalObject ) gObjectsDeleted.push_back(objectName);
            else  objectsDeleted.push_back(objectName);

            if ( objects.HasObjectNamed(objectName) )
            {
                //Remove objects
                objects.RemoveObject(objectName);

                if ( !globalObject && layout )
                {
                    if ( answer == wxYES )
                    {
                        gd::EventsRefactorer::RemoveObjectInEvents(project.GetCurrentPlatform(), project, *layout, layout->GetEvents(), objectName);
                        for (unsigned int g = 0;g<layout->GetObjectGroups().size();++g)
                        {
                            if ( layout->GetObjectGroups()[g].Find(objectName)) layout->GetObjectGroups()[g].RemoveObject(objectName);
                        }
                    }
                    layout->GetInitialInstances().RemoveInitialInstancesOfObject(objectName);
                    //TODO: Refactor also in external events
                }
                else if ( globalObject )
                {
                    //TODO: Refactor
                }
            }
        }
        else if ( data->GetString() == "GlobalGroup" || data->GetString() == "LayoutGroup" )
        {
            bool globalGroup = data->GetString() == "GlobalGroup";
            std::string groupName = ToString(objectsList->GetItemText( selection[i] ));

            std::vector<gd::ObjectGroup> & objectsGroups =
                globalGroup || !layout ? project.GetObjectGroups() : layout->GetObjectGroups();

            vector<gd::ObjectGroup>::iterator g = std::find_if( objectsGroups.begin(),
                                                            objectsGroups.end(),
                                                            std::bind2nd(gd::GroupHasTheSameName(), groupName));
            if ( g != objectsGroups.end() )
                objectsGroups.erase( g );

            if ( answer == wxYES )
            {
                if ( !globalGroup && layout )
                    gd::EventsRefactorer::RemoveObjectInEvents(project.GetCurrentPlatform(), project, *layout, layout->GetEvents(), groupName);
                else
                    ;//TODO
            }

            for ( unsigned int j = 0; j < project.GetUsedPlatforms().size();++j)
                project.GetUsedPlatforms()[j]->GetChangesNotifier().OnObjectGroupDeleted(project, globalGroup ? NULL : layout, groupName);
        }
    }

    //Call the notifiers
    for ( unsigned int j = 0; j < project.GetUsedPlatforms().size();++j)
        project.GetUsedPlatforms()[j]->GetChangesNotifier().OnObjectsDeleted(project, layout, objectsDeleted);
    for ( unsigned int j = 0; j < project.GetUsedPlatforms().size();++j)
        project.GetUsedPlatforms()[j]->GetChangesNotifier().OnObjectsDeleted(project, NULL, gObjectsDeleted);

    //Remove the real items in the list
    Refresh();
}

void ObjectsEditor::OnMoveupSelected(wxCommandEvent& event)
{
    gd::TreeItemStringData * data = dynamic_cast<gd::TreeItemStringData*>(objectsList->GetItemData(lastSelectedItem));
    if (!data) return;
    std::string dataStr = data->GetString();
    std::string dataStr2 = data->GetSecondString();
    std::string name = ToString( objectsList->GetItemText( lastSelectedItem ));

    //Object clicked?
    if ( data && (data->GetString() == "GlobalObject" || data->GetString() == "LayoutObject") )
    {
        bool globalObject = data->GetString() == "GlobalObject";
        gd::ClassWithObjects & objects = !globalObject && layout ? static_cast<gd::ClassWithObjects &>(*layout) : (project);
        unsigned int index = objects.GetObjectPosition(name);

        if ( index >= objects.GetObjectsCount() )
            return;

        if ( index >= 1 )
            objects.SwapObjects(index, index-1);
    }

    Refresh();
    //Select again the moved item
    wxTreeItemId item = objectsList->GetLastChild(objectsList->GetRootItem());
    while ( item.IsOk() )
    {
        gd::TreeItemStringData * itemData = dynamic_cast<gd::TreeItemStringData*>(objectsList->GetItemData(item));
        if (itemData) 
        {
	        if (objectsList->GetItemText( item ) == name
	            && itemData->GetString() == dataStr
	            && itemData->GetSecondString() == dataStr2)
	        {
	            objectsList->SelectItem(item);
	            return;
	        }
    	}
	    item = objectsList->GetPrevSibling(item);
    }
}

void ObjectsEditor::OnMoveDownSelected(wxCommandEvent& event)
{
    gd::TreeItemStringData * data = dynamic_cast<gd::TreeItemStringData*>(objectsList->GetItemData(lastSelectedItem));
    if (!data) return;
    std::string dataStr = data->GetString();
    std::string dataStr2 = data->GetSecondString();
    std::string name = ToString( objectsList->GetItemText( lastSelectedItem ));

    //Object clicked?
    if ( data->GetString() == "GlobalObject" || data->GetString() == "LayoutObject" )
    {
        bool globalObject = data->GetString() == "GlobalObject";
        gd::ClassWithObjects & objects = !globalObject && layout ? static_cast<gd::ClassWithObjects &>(*layout) : (project);
        unsigned int index = objects.GetObjectPosition(name);

        if ( index >= objects.GetObjectsCount() )
            return;

        if ( static_cast<unsigned>(index+1) < objects.GetObjectsCount() )
            objects.SwapObjects(index, index+1);
    }

    Refresh();
    //Select again the moved item
    wxTreeItemId item = objectsList->GetLastChild(objectsList->GetRootItem());
    while ( item.IsOk() )
    {
        gd::TreeItemStringData * itemData = dynamic_cast<gd::TreeItemStringData*>(objectsList->GetItemData(item));
        if (itemData)
        {
	        if (objectsList->GetItemText( item ) == name
	            && itemData->GetString() == dataStr
	            && itemData->GetSecondString() == dataStr2)
	        {
	            objectsList->SelectItem(item);
	            return;
	        }
        }
	    item = objectsList->GetPrevSibling(item);
    }
}

void ObjectsEditor::OnCopySelected(wxCommandEvent& event)
{
    gd::TreeItemStringData * data = dynamic_cast<gd::TreeItemStringData*>(objectsList->GetItemData(lastSelectedItem));
    if (!data) return;
    std::string name = ToString( objectsList->GetItemText( lastSelectedItem ));

    //Object clicked?
    if ( data->GetString() == "GlobalObject" || data->GetString() == "LayoutObject" )
    {
        bool globalObject = data->GetString() == "GlobalObject";
        gd::ClassWithObjects & objects = !globalObject && layout ? static_cast<gd::ClassWithObjects &>(*layout) : (project);

        if ( !objects.HasObjectNamed(name) )
            return;

        gd::Clipboard::GetInstance()->SetObject(&objects.GetObject(name));
        gd::Clipboard::GetInstance()->ForgetObjectGroup();
    }
    else if ( data->GetString() == "GlobalGroup" || data->GetString() == "LayoutGroup" )
    {
        bool globalGroup = data->GetString() == "GlobalGroup";
        std::vector<gd::ObjectGroup> & objectsGroups =
            globalGroup || !layout ? project.GetObjectGroups() : layout->GetObjectGroups();

        if ( !HasGroupNamed(name, objectsGroups) )
            return;

        gd::Clipboard::GetInstance()->SetObjectGroup(GetGroup(name, objectsGroups));
        gd::Clipboard::GetInstance()->ForgetObject();
    }
}

void ObjectsEditor::OnCutSelected(wxCommandEvent& event)
{
    gd::TreeItemStringData * data = dynamic_cast<gd::TreeItemStringData*>(objectsList->GetItemData(lastSelectedItem));
    if (!data) return;
    std::string name = ToString( objectsList->GetItemText( lastSelectedItem ));

    //Object clicked?
    if ( data->GetString() == "GlobalObject" || data->GetString() == "LayoutObject" )
    {
        bool globalObject = data->GetString() == "GlobalObject";
        gd::ClassWithObjects & objects = !globalObject && layout ? static_cast<gd::ClassWithObjects &>(*layout) : (project);

        if ( !objects.HasObjectNamed(name) )
            return;

        gd::Clipboard::GetInstance()->SetObject(&objects.GetObject(name));
        gd::Clipboard::GetInstance()->ForgetObjectGroup();

        objects.RemoveObject(name);

        std::vector<std::string> objectsDeleted;
        objectsDeleted.push_back(name);
        for ( unsigned int j = 0; j < project.GetUsedPlatforms().size();++j)
            project.GetUsedPlatforms()[j]->GetChangesNotifier().OnObjectsDeleted(project, globalObject ? NULL : layout, objectsDeleted);
    }
    else if ( data->GetString() == "GlobalGroup" || data->GetString() == "LayoutGroup" )
    {
        bool globalGroup = data->GetString() == "GlobalGroup";
        std::vector<gd::ObjectGroup> & objectsGroups =
            globalGroup || !layout ? project.GetObjectGroups() : layout->GetObjectGroups();

        if ( !HasGroupNamed(name, objectsGroups) )
            return;

        gd::Clipboard::GetInstance()->SetObjectGroup(GetGroup(name, objectsGroups));
        gd::Clipboard::GetInstance()->ForgetObject();

        RemoveGroup(name, objectsGroups);
        for ( unsigned int j = 0; j < project.GetUsedPlatforms().size();++j)
            project.GetUsedPlatforms()[j]->GetChangesNotifier().OnObjectGroupDeleted(project, globalGroup ? NULL : layout, name);
    }

    Refresh();
}

void ObjectsEditor::OnPasteSelected(wxCommandEvent& event)
{
    gd::TreeItemStringData * data = dynamic_cast<gd::TreeItemStringData*>(objectsList->GetItemData(lastSelectedItem));
    if (!data) return;
    gd::Clipboard * clipboard = gd::Clipboard::GetInstance();

    if ( clipboard->HasObject() )
    {
        bool globalObject = data->GetString() == "GlobalObject";
        gd::ClassWithObjects & objects = !globalObject && layout ? static_cast<gd::ClassWithObjects &>(*layout) : (project);

        //Add a new object of selected type to objects list
        gd::Object * object = clipboard->GetObject()->Clone();

        std::string name = ToString(object->GetName());

        //Add a number to the new name if necessary
        if ( objects.HasObjectNamed(name) )
        {
            name =  _( "CopyOf" ) + object->GetName();
            for (unsigned int i = 2;objects.HasObjectNamed(name);++i)
                name = _("CopyOf")+ object->GetName()+ToString(i);
        }

        //Name the object
        object->SetName( name );

        //Add it to the list
        objects.InsertObject(*object, objects.GetObjectsCount());
        for ( unsigned int j = 0; j < project.GetUsedPlatforms().size();++j)
            project.GetUsedPlatforms()[j]->GetChangesNotifier().OnObjectAdded(project, globalObject ? NULL : layout, *object);
    }
    else if ( clipboard->HasObjectGroup())
    {
        bool globalGroup = data->GetString() == "GlobalGroup";
        std::vector<gd::ObjectGroup> & objectsGroups =
            globalGroup || !layout ? project.GetObjectGroups() : layout->GetObjectGroups();

        gd::ObjectGroup groupPasted = clipboard->GetObjectGroup();

        std::string name = ToString(groupPasted.GetName());

        //Add a number to the new name if necessary
        if ( HasGroupNamed(name, objectsGroups) )
        {
            name =  _( "CopyOf" ) + name;
            for (unsigned int i = 2;HasGroupNamed(name, objectsGroups);++i)
                name = _("CopyOf")+ groupPasted.GetName()+ToString(i);
        }
        groupPasted.SetName(name);
        objectsGroups.push_back( groupPasted );

        for ( unsigned int j = 0; j < project.GetUsedPlatforms().size();++j)
            project.GetUsedPlatforms()[j]->GetChangesNotifier().OnObjectGroupAdded(project, globalGroup ? layout : NULL,  groupPasted.GetName());
    }

    //Refresh the list and select the newly added item
    searchCtrl->Clear();
    Refresh();
}

void ObjectsEditor::OnsearchCtrlText(wxCommandEvent& event)
{
    Refresh();
}

void ObjectsEditor::OnSetGlobalSelected(wxCommandEvent& event)
{
    //Get the selected item
    gd::TreeItemStringData * data = dynamic_cast<gd::TreeItemStringData*>(objectsList->GetItemData(lastSelectedItem));
    if (!data || !layout) return;

    //Object clicked?
    if ( data->GetString() == "LayoutObject")
    {
        gd::Object * object = GetSelectedObject();
        if ( !object ) return;
        std::string objectName = object->GetName();
        if ( project.HasObjectNamed(objectName) )
        {
            wxLogMessage(_("There is already a global object with this name."));
            return;
        }

        project.InsertObject(*object, -1);
        layout->RemoveObject(objectName);

        std::vector<std::string> removedObject;
        removedObject.push_back(objectName);
        for ( unsigned int j = 0; j < project.GetUsedPlatforms().size();++j)
        {
            project.GetUsedPlatforms()[j]->GetChangesNotifier().OnObjectsDeleted(project, layout, removedObject);
            project.GetUsedPlatforms()[j]->GetChangesNotifier().OnObjectAdded(project, NULL, project.GetObject(objectName));
        }

        Refresh();
    }
    //Group clicked?
    else if ( data->GetString() == "LayoutGroup" )
    {
        gd::ObjectGroup * group = GetSelectedGroup();
        if ( !group ) return;
        std::string groupName = group->GetName();

        if ( HasGroupNamed(groupName, project.GetObjectGroups()) )
        {
            wxLogMessage(_("There is already a global object group with this name."));
            return;
        }
        project.GetObjectGroups().push_back(*group);
        RemoveGroup(groupName, layout->GetObjectGroups());

        for ( unsigned int j = 0; j < project.GetUsedPlatforms().size();++j)
        {
            project.GetUsedPlatforms()[j]->GetChangesNotifier().OnObjectGroupDeleted(project, layout, groupName);
            project.GetUsedPlatforms()[j]->GetChangesNotifier().OnObjectGroupAdded(project, NULL, groupName);
        }

        Refresh();
    }
}

void ObjectsEditor::OnSetFocus(wxFocusEvent& event)
{
    mainFrameWrapper.GetRibbon()->SetActivePage(4);
    ConnectEvents();

    if ( objectsList->GetFocusedItem().IsOk() )
    {
        lastSelectedItem = objectsList->GetFocusedItem();
        UpdateAssociatedPropertiesPanel();
    }
}

void ObjectsEditor::OnobjectsListBeginDrag(wxTreeEvent& event)
{
    gd::TreeItemStringData * data = dynamic_cast<gd::TreeItemStringData*>(objectsList->GetItemData(lastSelectedItem));
    if (!data) return;

    if ( data->GetString() == "GlobalObject" || data->GetString() == "LayoutObject" )
    {
        gd::Object * object = GetSelectedObject();
        if ( !object ) return;

        wxTextDataObject objectName(object->GetName());
        wxDropSource dragSource( this );
        dragSource.SetData( objectName );
        dragSource.DoDragDrop( true );
    }
}


void ObjectsEditor::UpdateAssociatedPropertiesPanel()
{
    gd::TreeItemStringData * data = dynamic_cast<gd::TreeItemStringData*>(objectsList->GetItemData(lastSelectedItem));
    if (!data) return;

    if ( data->GetString() == "GlobalObject" || data->GetString() == "LayoutObject" )
    {
        bool globalObject = data->GetString() == "GlobalObject";
        gd::Object * object = GetSelectedObject();
        if ( !object ) return;

        //Log the selection
        if ( layout && !globalObject )
            LogFileManager::GetInstance()->WriteToLogFile(ToString("Object \""+object->GetName()+"\" selected ( Layout \""+layout->GetName()+"\" )"));
        else
            LogFileManager::GetInstance()->WriteToLogFile(ToString("Object \""+object->GetName()+"\" selected"));

        //Notify other editors of the selection of the object
        if ( propPnl ) propPnl->SelectedObject(object);
    }
    else
        if ( propPnl ) propPnl->SelectedObject(NULL);

    if ( data && (data->GetString() == "GlobalGroup" || data->GetString() == "LayoutGroup") )
    {
        //TODO: Use the associated property grid for groups
        if ( propPnl ) propPnl->SelectedObject(NULL);
    }
}

bool ObjectsEditor::HasGroupNamed(std::string name, std::vector<gd::ObjectGroup> & groups)
{
    return std::find_if( groups.begin(), groups.end(), std::bind2nd(gd::GroupHasTheSameName(), name))
            != groups.end();
}

gd::ObjectGroup & ObjectsEditor::GetGroup(std::string name, std::vector<gd::ObjectGroup> & groups)
{
    return *std::find_if( groups.begin(), groups.end(), std::bind2nd(gd::GroupHasTheSameName(), name));
}

void ObjectsEditor::RemoveGroup(std::string name, std::vector<gd::ObjectGroup> & groups)
{
    groups.erase(std::remove_if(groups.begin(), groups.end(), std::bind2nd(gd::GroupHasTheSameName(), name)), groups.end());
}

}
