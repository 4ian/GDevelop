/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */
#include "EditorObjectList.h"

#include <string>
#include <vector>
#include <algorithm>
#include <numeric>
//(*InternalHeaders(EditorObjectList)
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
#include <boost/algorithm/string.hpp>

#include "GDCore/IDE/Dialogs/ChooseVariableDialog.h"
#include "GDCore/Tools/HelpFileAccess.h"
#include "GDCore/IDE/CommonBitmapManager.h"
#include "GDCore/PlatformDefinition/Platform.h"
#include "GDCore/PlatformDefinition/PlatformExtension.h"
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/PlatformDefinition/Layout.h"
#include "GDCore/PlatformDefinition/Object.h"
#include "GDCore/PlatformDefinition/AutomatismsSharedData.h"
#include "GDCore/PlatformDefinition/Automatism.h"
#include "GDCore/IDE/Clipboard.h"
#include "GDCore/CommonTools.h"

#include "EditorObjetsGroups.h"
#include "LogFileManager.h"
#include "DndTextObjectsEditor.h"
#include "GDCore/IDE/Dialogs/ChooseObjectTypeDialog.h"
#include "GDCore/IDE/Dialogs/ChooseAutomatismTypeDialog.h"
#include "GDCore/IDE/EventsRefactorer.h"
#include "MainFrame.h"
#include "Dialogs/LayoutEditorPropertiesPnl.h"

#ifdef __WXMSW__
#include <wx/msw/winundef.h>
#include <wx/msw/uxtheme.h>
#endif

#ifdef __WXGTK__
#include <gtk/gtk.h>
#endif

using namespace gd;

//(*IdInit(EditorObjectList)
const long EditorObjectList::ID_TREECTRL1 = wxNewId();
const long EditorObjectList::ID_TEXTCTRL1 = wxNewId();
const long EditorObjectList::idMenuModObj = wxNewId();
const long EditorObjectList::idMenuProp = wxNewId();
const long EditorObjectList::idMenuModName = wxNewId();
const long EditorObjectList::idMenuAddObj = wxNewId();
const long EditorObjectList::idMenuDelObj = wxNewId();
const long EditorObjectList::idMoveUp = wxNewId();
const long EditorObjectList::idMoveDown = wxNewId();
const long EditorObjectList::idMenuCopy = wxNewId();
const long EditorObjectList::idMenuCut = wxNewId();
const long EditorObjectList::idMenuPaste = wxNewId();
const long EditorObjectList::ID_MENUITEM4 = wxNewId();
const long EditorObjectList::ID_MENUITEM6 = wxNewId();
const long EditorObjectList::ID_MENUITEM7 = wxNewId();
//*)
const long EditorObjectList::ID_BITMAPBUTTON1 = wxNewId();
const long EditorObjectList::ID_BITMAPBUTTON2 = wxNewId();
const long EditorObjectList::ID_BITMAPBUTTON3 = wxNewId();
const long EditorObjectList::ID_BITMAPBUTTON6 = wxNewId();
const long EditorObjectList::ID_BITMAPBUTTON7 = wxNewId();
const long EditorObjectList::idRibbonAdd = wxNewId();
const long EditorObjectList::idRibbonDel = wxNewId();
const long EditorObjectList::idRibbonUp = wxNewId();
const long EditorObjectList::idRibbonDown = wxNewId();
const long EditorObjectList::idRibbonModProp = wxNewId();
const long EditorObjectList::idRibbonModName = wxNewId();
const long EditorObjectList::idRibbonCopy = wxNewId();
const long EditorObjectList::idRibbonCut = wxNewId();
const long EditorObjectList::idRibbonPaste = wxNewId();
const long EditorObjectList::idRibbonHelp = wxNewId();
const long EditorObjectList::idRibbonRefresh = wxNewId();

BEGIN_EVENT_TABLE(EditorObjectList,wxPanel)
	//(*EventTable(EditorObjectList)
	//*)
END_EVENT_TABLE()

EditorObjectList::EditorObjectList(wxWindow* parent, gd::Project & project_, gd::ClassWithObjects & objects_, gd::MainFrameWrapper & mainFrameWrapper_, gd::Layout * layout_) :
    objects(objects_),
    project(project_),
    layout(layout_),
    mainFrameWrapper(mainFrameWrapper_),
    propPnl(NULL),
    propPnlManager(NULL),
    globalObjects(&objects == &project)
{
	//(*Initialize(EditorObjectList)
	wxMenuItem* delObjMenuI;
	wxMenuItem* editNameMenuI;
	wxMenuItem* editPropMenuItem;
	wxMenuItem* editMenuI;
	wxFlexGridSizer* FlexGridSizer1;
	wxMenuItem* addObjMenuI;

	Create(parent, wxID_ANY, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(0);
	objectsList = new wxTreeCtrl(this, ID_TREECTRL1, wxPoint(-72,-72), wxSize(179,170), wxTR_EDIT_LABELS|wxTR_MULTIPLE|wxTR_DEFAULT_STYLE|wxNO_BORDER, wxDefaultValidator, _T("ID_TREECTRL1"));
	FlexGridSizer1->Add(objectsList, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	searchCtrl = new wxSearchCtrl(this, ID_TEXTCTRL1, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL1"));
	FlexGridSizer1->Add(searchCtrl, 1, wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	SetSizer(FlexGridSizer1);
	editMenuI = new wxMenuItem((&ContextMenu), idMenuModObj, _("Edit"), wxEmptyString, wxITEM_NORMAL);
	ContextMenu.Append(editMenuI);
	editPropMenuItem = new wxMenuItem((&ContextMenu), idMenuProp, _("Other properties"), wxEmptyString, wxITEM_NORMAL);
	editPropMenuItem->SetBitmap(wxBitmap(wxImage(_T("res/editpropicon.png"))));
	ContextMenu.Append(editPropMenuItem);
	editNameMenuI = new wxMenuItem((&ContextMenu), idMenuModName, _("Rename\tF2"), wxEmptyString, wxITEM_NORMAL);
	editNameMenuI->SetBitmap(wxBitmap(wxImage(_T("res/editnom.png"))));
	ContextMenu.Append(editNameMenuI);
	ContextMenu.AppendSeparator();
	addObjMenuI = new wxMenuItem((&ContextMenu), idMenuAddObj, _("Add an object"), wxEmptyString, wxITEM_NORMAL);
	addObjMenuI->SetBitmap(wxBitmap(wxImage(_T("res/addicon.png"))));
	ContextMenu.Append(addObjMenuI);
	delObjMenuI = new wxMenuItem((&ContextMenu), idMenuDelObj, _("Delete\tDel"), wxEmptyString, wxITEM_NORMAL);
	delObjMenuI->SetBitmap(wxBitmap(wxImage(_T("res/deleteicon.png"))));
	ContextMenu.Append(delObjMenuI);
	ContextMenu.AppendSeparator();
	moveUpMenuI = new wxMenuItem((&ContextMenu), idMoveUp, _("Move up\tCtrl-Up"), wxEmptyString, wxITEM_NORMAL);
	moveUpMenuI->SetBitmap(wxBitmap(wxImage(_T("res/up.png"))));
	ContextMenu.Append(moveUpMenuI);
	moveDownMenuI = new wxMenuItem((&ContextMenu), idMoveDown, _("Move down\tCtrl-Down"), wxEmptyString, wxITEM_NORMAL);
	moveDownMenuI->SetBitmap(wxBitmap(wxImage(_T("res/down.png"))));
	ContextMenu.Append(moveDownMenuI);
	ContextMenu.AppendSeparator();
	copyMenuI = new wxMenuItem((&ContextMenu), idMenuCopy, _("Copy\tCtrl-C"), wxEmptyString, wxITEM_NORMAL);
	copyMenuI->SetBitmap(wxBitmap(wxImage(_T("res/copyicon.png"))));
	ContextMenu.Append(copyMenuI);
	cutMenuI = new wxMenuItem((&ContextMenu), idMenuCut, _("Cut\tCtrl-X"), wxEmptyString, wxITEM_NORMAL);
	cutMenuI->SetBitmap(wxBitmap(wxImage(_T("res/cuticon.png"))));
	ContextMenu.Append(cutMenuI);
	pasteMenuI = new wxMenuItem((&ContextMenu), idMenuPaste, _("Paste\tCtrl-V"), wxEmptyString, wxITEM_NORMAL);
	pasteMenuI->SetBitmap(wxBitmap(wxImage(_T("res/pasteicon.png"))));
	ContextMenu.Append(pasteMenuI);
	MenuItem1 = new wxMenuItem((&rootContextMenu), ID_MENUITEM4, _("Add an object"), wxEmptyString, wxITEM_NORMAL);
	MenuItem1->SetBitmap(wxBitmap(wxImage(_T("res/addicon.png"))));
	rootContextMenu.Append(MenuItem1);
	rootContextMenu.AppendSeparator();
	MenuItem3 = new wxMenuItem((&rootContextMenu), ID_MENUITEM6, _("Paste\tCtrl-V"), wxEmptyString, wxITEM_NORMAL);
	MenuItem3->SetBitmap(wxBitmap(wxImage(_T("res/pasteicon.png"))));
	rootContextMenu.Append(MenuItem3);
	MenuItem2 = new wxMenuItem((&multipleContextMenu), ID_MENUITEM7, _("Supprimer les objets\tDEL"), _("Delete all selected objects"), wxITEM_NORMAL);
	MenuItem2->SetBitmap(wxBitmap(wxImage(_T("res/deleteicon.png"))));
	multipleContextMenu.Append(MenuItem2);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_BEGIN_DRAG,(wxObjectEventFunction)&EditorObjectList::OnobjectsListBeginDrag);
	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_BEGIN_LABEL_EDIT,(wxObjectEventFunction)&EditorObjectList::OnobjectsListBeginLabelEdit);
	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_END_LABEL_EDIT,(wxObjectEventFunction)&EditorObjectList::OnobjectsListEndLabelEdit);
	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_ITEM_ACTIVATED,(wxObjectEventFunction)&EditorObjectList::OnobjectsListItemActivated);
	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_ITEM_RIGHT_CLICK,(wxObjectEventFunction)&EditorObjectList::OnobjectsListItemRightClick);
	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_SEL_CHANGED,(wxObjectEventFunction)&EditorObjectList::OnobjectsListSelectionChanged);
	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_KEY_DOWN,(wxObjectEventFunction)&EditorObjectList::OnobjectsListKeyDown);
	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_ITEM_MENU,(wxObjectEventFunction)&EditorObjectList::OnobjectsListItemMenu);
	Connect(ID_TEXTCTRL1,wxEVT_COMMAND_TEXT_UPDATED,(wxObjectEventFunction)&EditorObjectList::OnsearchCtrlText);
	Connect(idMenuModObj,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjectList::OneditMenuISelected);
	Connect(idMenuProp,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjectList::OneditPropMenuItemSelected);
	Connect(idMenuModName,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjectList::OneditNameMenuISelected);
	Connect(idMenuAddObj,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjectList::OnaddObjMenuISelected);
	Connect(idMenuDelObj,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjectList::OndelObjMenuISelected);
	Connect(idMoveUp,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjectList::OnMoveUpSelected);
	Connect(idMoveDown,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjectList::OnMoveDownSelected);
	Connect(idMenuCopy,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjectList::OnCopySelected);
	Connect(idMenuCut,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjectList::OnCutSelected);
	Connect(idMenuPaste,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjectList::OnPasteSelected);
	Connect(ID_MENUITEM4,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjectList::OnaddObjMenuISelected);
	Connect(ID_MENUITEM6,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjectList::OnPasteSelected);
	Connect(ID_MENUITEM7,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjectList::OndelObjMenuISelected);
	Connect(wxEVT_SET_FOCUS,(wxObjectEventFunction)&EditorObjectList::OnSetFocus);
	//*)

    #if defined(__WXMSW__) //Offer nice look to wxTreeCtrl
    wxUxThemeEngine* theme =  wxUxThemeEngine::GetIfActive();
    if(theme) theme->SetWindowTheme((HWND) objectsList->GetHWND(), L"EXPLORER", NULL);
    #endif

    objectsImagesList = new wxImageList(24,24, true);
    objectsList->AssignImageList(objectsImagesList);

    Connect(ID_BITMAPBUTTON1,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&EditorObjectList::OnRefreshBtClick);
    Connect(ID_BITMAPBUTTON3,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&EditorObjectList::OnAideBtClick);
    Connect(ID_BITMAPBUTTON6,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&EditorObjectList::OnMoreOptions);

    SetDropTarget(new DndTextObjectsEditor(*this));

    Refresh();
}

EditorObjectList::~EditorObjectList()
{
	//(*Destroy(EditorObjectList)
	//*)
}

/**
 * Static method for creating ribbon page for this kind of editor
 */
void EditorObjectList::CreateRibbonPage(wxRibbonPage * page)
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

void EditorObjectList::ConnectEvents()
{
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonAdd, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EditorObjectList::OnaddObjMenuISelected, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonDel, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EditorObjectList::OndelObjMenuISelected, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonUp, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EditorObjectList::OnMoveUpSelected, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonDown, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EditorObjectList::OnMoveDownSelected, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonModProp, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EditorObjectList::OneditMenuISelected, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonModName, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EditorObjectList::OneditNameMenuISelected, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonCopy, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EditorObjectList::OnCopySelected, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonCut, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EditorObjectList::OnCutSelected, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonPaste, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EditorObjectList::OnPasteSelected, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonHelp, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EditorObjectList::OnAideBtClick, NULL, this);
    mainFrameWrapper.GetMainEditor()->Connect(idRibbonRefresh, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EditorObjectList::Refresh, NULL, this);
}

void EditorObjectList::SetAssociatedPropertiesPanel(LayoutEditorPropertiesPnl * propPnl_, wxAuiManager * manager_)
{
    propPnl = propPnl_;
    propPnlManager = manager_;
}

////////////////////////////////////////////////////////////
/// Menu contextuel
////////////////////////////////////////////////////////////
void EditorObjectList::OnMoreOptions( wxCommandEvent& event )
{
    PopupMenu( &ContextMenu );
}

/**
 * Popup context menu
 */
void EditorObjectList::OnobjectsListItemMenu(wxTreeEvent& event)
{
    wxFocusEvent unusedEvent;
    OnSetFocus(unusedEvent);

    item = event.GetItem();
    wxArrayTreeItemIds selection;

    if ( item == objectsList->GetRootItem())
        PopupMenu( &rootContextMenu );
    else if ( objectsList->GetSelections(selection) > 1 )
    {
        PopupMenu( &multipleContextMenu );
    }
    else
    {
        //Popup menu
        PopupMenu( &ContextMenu );
    }
}

void EditorObjectList::OnobjectsListItemRightClick(wxTreeEvent& event)
{
    item = event.GetItem();
}

/**
 * Selection has changed
 */
void EditorObjectList::OnobjectsListSelectionChanged(wxTreeEvent& event)
{
    wxFocusEvent unusedEvent;
    OnSetFocus(unusedEvent);

    item = event.GetItem();

    if ( item != objectsList->GetRootItem() )
    {
        if ( layout != NULL )
            LogFileManager::GetInstance()->WriteToLogFile(ToString("Object \""+objectsList->GetItemText(item)+"\" selected ( Layout \""+layout->GetName()+"\" )"));
        else
            LogFileManager::GetInstance()->WriteToLogFile(ToString("Object \""+objectsList->GetItemText(item)+"\" selected"));

        std::string selectedObject = gd::ToString(objectsList->GetItemText(item));
        if ( propPnl ) propPnl->SelectedObject(objects.HasObjectNamed(selectedObject) ? &objects.GetObject(selectedObject) : NULL,
                                               globalObjects ? NULL : layout);
    }
    else
        if ( propPnl ) propPnl->SelectedObject(NULL, globalObjects ? NULL : layout);
}


////////////////////////////////////////////////////////////
/// Recréer le TreeCtrl
////////////////////////////////////////////////////////////
void EditorObjectList::Refresh()
{
    std::string searchText = boost::to_upper_copy(ToString(searchCtrl->GetValue()));
    bool searching = searchText.empty() ? false : true;

    objectsList->DeleteAllItems();
    objectsImagesList->RemoveAll();
    objectsImagesList->Add(gd::CommonBitmapManager::GetInstance()->objects24);

    objectsList->AddRoot( _( "All objects" ), 0 );

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

            objectsList->AppendItem( objectsList->GetRootItem(), objects.GetObject(i).GetName(), thumbnailID );
        }
    }

    objectsList->ExpandAll();
}

////////////////////////////////////////////////////////////
/// Clic sur le bouton de rafraichissement
////////////////////////////////////////////////////////////
void EditorObjectList::OnRefreshBtClick( wxCommandEvent& event )
{
    Refresh();
}

/**
 * Edit an object
 */
void EditorObjectList::OneditMenuISelected(wxCommandEvent& event)
{
    string name = ToString(objectsList->GetItemText( item ));
    if ( !objects.HasObjectNamed(name) ) return;

    objects.GetObject(name).EditObject(this, project, mainFrameWrapper);
    for ( unsigned int j = 0; j < project.GetUsedPlatforms().size();++j)
        project.GetUsedPlatforms()[j]->GetChangesNotifier().OnObjectEdited(project, globalObjects ? NULL : layout, objects.GetObject(name));

    //Reload thumbnail
    int thumbnailID = -1;
    wxBitmap thumbnail;
    if ( objects.GetObject(name).GenerateThumbnail(project, thumbnail) && thumbnail.IsOk() )
    {
        objectsImagesList->Add(thumbnail);
        thumbnailID = objectsImagesList->GetImageCount()-1;
    }

    objectsList->SetItemImage( item, thumbnailID );

    //Reload resources
    if (!globalObjects && layout) objects.GetObject(name).LoadResources(project, *layout);
}

////////////////////////////////////////////////////////////
/// Editer un objet en double cliquant dessus
////////////////////////////////////////////////////////////
void EditorObjectList::OnobjectsListItemActivated(wxTreeEvent& event)
{
    wxFocusEvent unusedEvent;
    OnSetFocus(unusedEvent);

    item = event.GetItem();
    wxCommandEvent eventUseless;
    OneditMenuISelected( eventUseless );
}


////////////////////////////////////////////////////////////
/// Modifier le nom d'un objet
////////////////////////////////////////////////////////////
void EditorObjectList::OneditNameMenuISelected(wxCommandEvent& event)
{
    wxFocusEvent unusedEvent;
    OnSetFocus(unusedEvent);

    if ( item.IsOk() && item != objectsList->GetRootItem() )
        objectsList->EditLabel( item );
    else
        wxLogStatus( _( "No object selected" ) );
}

////////////////////////////////////////////////////////////
/// Ajouter un objet
////////////////////////////////////////////////////////////
void EditorObjectList::OnaddObjMenuISelected(wxCommandEvent& event)
{
    gd::ChooseObjectTypeDialog chooseTypeDialog(this, project);
    if ( chooseTypeDialog.ShowModal() == 0 )
        return;

    std::string name = ToString(_("NewObject"));

    //Tant qu'un objet avec le même nom existe, on ajoute un chiffre
    unsigned int i = 0;
    while ( objects.HasObjectNamed(name) )
    {
        ++i;
        name =  _("NewObject")+ToString(i);
    }

    //Add a new object of selected type to objects list
    objects.InsertNewObject(project, chooseTypeDialog.GetSelectedObjectType(), ToString(name), objects.GetObjectsCount());

    //And to the TreeCtrl
    wxTreeItemId rootId = objectsList->GetRootItem();
    wxTreeItemId itemAdded = objectsList->AppendItem( rootId, name );
    objectsList->ExpandAll();

    //Reload thumbnail
    int thumbnailID = -1;
    wxBitmap thumbnail;
    if ( objects.GetObject(objects.GetObjectsCount()-1).GenerateThumbnail(project, thumbnail) )
    {
        objectsImagesList->Add(thumbnail);
        thumbnailID = objectsImagesList->GetImageCount()-1;
    }
    objectsList->SetItemImage( itemAdded, thumbnailID );

    for ( unsigned int j = 0; j < project.GetUsedPlatforms().size();++j)
        project.GetUsedPlatforms()[j]->GetChangesNotifier().OnObjectAdded(project, globalObjects ? NULL : layout, objects.GetObject(name));

    objectsList->EditLabel(itemAdded);

    wxLogStatus( _( "The object was correctly added" ) );
}

////////////////////////////////////////////////////////////
/// Supprimer un objet
////////////////////////////////////////////////////////////
void EditorObjectList::OndelObjMenuISelected(wxCommandEvent& event)
{
    wxArrayTreeItemIds selection;
    objectsList->GetSelections(selection);
    std::vector < string > objectsDeleted;

    int answer = wxMessageBox(selection.GetCount() <= 1 ? _("Delete also all references to the object in groups and events ( i.e. Actions and conditions using the object )\?") :
                                                             wxString::Format(_("Delete also all references to these %i objects in groups and events ( i.e. Actions and conditions using the objects )\?"), selection.GetCount()),
                              _("Confirm deletion"), wxYES_NO | wxCANCEL | wxCANCEL_DEFAULT);

    if ( answer == wxCANCEL ) return;

    //Removing objects
    for (unsigned int i = 0;i<selection.GetCount();++i)
    {
        std::string objectName = string(objectsList->GetItemText( selection[i] ).mb_str());
        objectsDeleted.push_back(objectName); //Generate also a list containing the names of the objects deleted.

        if ( selection[i].IsOk() && objectsList->GetRootItem() != selection[i] )
        {
            if ( objects.HasObjectNamed(objectName) )
            {
                //Remove objects
                objects.RemoveObject(objectName);

                if ( layout )
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
                }
            }
        }
    }

    for ( unsigned int j = 0; j < project.GetUsedPlatforms().size();++j)
        project.GetUsedPlatforms()[j]->GetChangesNotifier().OnObjectsDeleted(project, globalObjects ? NULL : layout, objectsDeleted);

    //Removing items
    void * nothing;
    wxTreeItemId item = objectsList->GetFirstChild( objectsList->GetRootItem(), nothing);
    while( item.IsOk() )
    {
        if ( find(objectsDeleted.begin(), objectsDeleted.end(), ToString(objectsList->GetItemText( item ))) != objectsDeleted.end() )
        {
            objectsList->Delete(item);
            item = objectsList->GetFirstChild(objectsList->GetRootItem(), nothing);
        }
        else
            item = objectsList->GetNextSibling(item);
    }
}

////////////////////////////////////////////////////////////
/// Edition du nom d'un objet
////////////////////////////////////////////////////////////
void EditorObjectList::OnobjectsListBeginLabelEdit(wxTreeEvent& event)
{
    if ( objectsList->GetItemText( event.GetItem() ) != _( "All objects" ) )
    {
        ancienNom = objectsList->GetItemText( event.GetItem() );
        return;
    }

    //On ne touche pas au dossier "Tous les objets"
    objectsList->EndEditLabel( event.GetItem(), true );
}

void EditorObjectList::OnobjectsListEndLabelEdit(wxTreeEvent& event)
{
    if ( event.IsEditCancelled() ) return;

    string newName = ToString(event.GetLabel());

    //Be sure there is not already another object with this name
    if ( objects.HasObjectNamed(newName) )
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

    if ( !objects.HasObjectNamed(ancienNom) ) return;

    objects.GetObject(ancienNom).SetName( newName );

    if ( layout ) //Change the object name in the layout.
    {
        gd::EventsRefactorer::RenameObjectInEvents(project.GetCurrentPlatform(), project, *layout, layout->GetEvents(), ancienNom, newName);
        layout->GetInitialInstances().RenameInstancesOfObject(ancienNom, newName);
        for (unsigned int g = 0;g<layout->GetObjectGroups().size();++g)
        {
            if ( layout->GetObjectGroups()[g].Find(ancienNom))
            {
                layout->GetObjectGroups()[g].RemoveObject(ancienNom);
                layout->GetObjectGroups()[g].AddObject(newName);
            }
        }
    }
    for ( unsigned int j = 0; j < project.GetUsedPlatforms().size();++j)
        project.GetUsedPlatforms()[j]->GetChangesNotifier().OnObjectRenamed(project, globalObjects ? NULL : layout, objects.GetObject(newName), ancienNom);

    objectsList->SetItemText( event.GetItem(), event.GetLabel() );
    if ( propPnl ) propPnl->SelectedObject(&objects.GetObject(newName), globalObjects ? NULL : layout);
    return;
}

/**
 * Copy
 */
void EditorObjectList::OnCopySelected(wxCommandEvent& event)
{
    if ( !objects.HasObjectNamed(ToString(objectsList->GetItemText( item ))) )
    {
        wxLogWarning(_("Unable to find the object to copy"));
        return;
    }

    gd::Clipboard::GetInstance()->SetObject(&objects.GetObject(ToString(objectsList->GetItemText( item ))));
}

/**
 * Cut
 */
void EditorObjectList::OnCutSelected(wxCommandEvent& event)
{
    if ( !item.IsOk() || objectsList->GetRootItem() == item )
        return;

    std::string name = ToString(objectsList->GetItemText( item ));
    if ( !objects.HasObjectNamed(name) )
    {
        wxLogWarning(_("Unable to find the object to cut"));
        return;
    }

    objectsList->Delete( item );

    gd::Clipboard::GetInstance()->SetObject(&objects.GetObject(name));

    //Remove object
    objects.RemoveObject(name);

    std::vector<std::string> objectsDeleted;
    objectsDeleted.push_back(name);
    for ( unsigned int j = 0; j < project.GetUsedPlatforms().size();++j)
        project.GetUsedPlatforms()[j]->GetChangesNotifier().OnObjectsDeleted(project, globalObjects ? NULL : layout, objectsDeleted);
}

/**
 * Paste
 */
void EditorObjectList::OnPasteSelected(wxCommandEvent& event)
{
    gd::Clipboard * clipboard = gd::Clipboard::GetInstance();

    if ( !clipboard->HasObject() )
    {
        wxLogWarning(_("No object to paste"));
        return;
    }

    //Add a new object of selected type to objects list
    gd::Object * object = clipboard->GetObject()->Clone();

    wxString name = object->GetName();

    //Add a number to the new name if necessary
    unsigned int i = 2;
    while ( objects.HasObjectNamed(ToString(name)) )
    {
        name =  _( "CopyOf" ) + object->GetName()+ToString(i);
        i++;
    }

    //Name the object
    object->SetName( ToString(name) );

    //Add it to the list
    objects.InsertObject(*object, objects.GetObjectsCount());
    for ( unsigned int j = 0; j < project.GetUsedPlatforms().size();++j)
        project.GetUsedPlatforms()[j]->GetChangesNotifier().OnObjectAdded(project, globalObjects ? NULL : layout, *object);

    //Refresh the list and select the newly added item
    searchCtrl->Clear();
    Refresh();

    wxTreeItemId item = objectsList->GetLastChild(objectsList->GetRootItem());
    while ( item.IsOk() )
    {
        if ( objectsList->GetItemText( item ) == name )
        {
            objectsList->SelectItem(item);
            return;
        }
        item = objectsList->GetPrevSibling(item);
    }

    wxLogStatus( _( "The object was correctly added" ) );
}

////////////////////////////////////////////////////////////
/// Déplacer vers le haut
////////////////////////////////////////////////////////////
void EditorObjectList::OnMoveUpSelected(wxCommandEvent& event)
{
    string name = ToString( objectsList->GetItemText( item ));
    unsigned int index = objects.GetObjectPosition(name);

    if ( index >= objects.GetObjectsCount() )
    {
        wxLogStatus( _( "The object to move was not found." ) );
        return;
    }

    if ( index-1 >= 0 )
    {
        //On déplace l'image
        objects.SwapObjects(index, index-1);
        Refresh();

        //On la reselectionne
        wxTreeItemId item = objectsList->GetLastChild(objectsList->GetRootItem());
        while ( item.IsOk() )
        {
            if ( objectsList->GetItemText( item ) == name )
            {
                objectsList->SelectItem(item);
                return;
            }
            item = objectsList->GetPrevSibling(item);
        }

    }
}

////////////////////////////////////////////////////////////
/// Déplacer vers le bas
////////////////////////////////////////////////////////////
void EditorObjectList::OnMoveDownSelected(wxCommandEvent& event)
{
    std::string name = ToString( objectsList->GetItemText( item ));
    unsigned int index = objects.GetObjectPosition(name);

    if ( index >= objects.GetObjectsCount() )
    {
        wxLogStatus( _( "The object to move was not found." ) );
        return;
    }

    if ( static_cast<unsigned>(index+1) < objects.GetObjectsCount() )
    {
        //On déplace l'image
        objects.SwapObjects(index, index+1);
        Refresh();

        //On la reselectionne
        wxTreeItemId item = objectsList->GetLastChild(objectsList->GetRootItem());
        while ( item.IsOk() )
        {
            if ( objectsList->GetItemText( item ) == name )
            {
                objectsList->SelectItem(item);
                return;
            }
            item = objectsList->GetPrevSibling(item);
        }

    }
}

/**
 * Begin dragging object ( to layoutCanvas )
 */
void EditorObjectList::OnobjectsListBeginDrag(wxTreeEvent& event)
{
    if ( event.GetItem().IsOk() && event.GetItem() != objectsList->GetRootItem() )
    {
        wxTextDataObject objectName(objectsList->GetItemText(event.GetItem()));
        wxDropSource dragSource( this );
        dragSource.SetData( objectName );
        dragSource.DoDragDrop( true );
    }
}

/**
 * Change ribbon page and connect events with the editor when selected
 */
void EditorObjectList::OnSetFocus(wxFocusEvent& event)
{
    mainFrameWrapper.GetRibbon()->SetActivePage(4);
    ConnectEvents();
}

/**
 * Editing initial variables
 */
/*
void EditorObjectList::OneditVarMenuISelected(wxCommandEvent& event)
{
    std::string name = ToString( objectsList->GetItemText( item ));
    if ( !objects.HasObjectNamed(name) )
    {
        wxLogStatus( _( "Can't find the object to edit" ) );
        return;
    }

    gd::ChooseVariableDialog dialog(this, objects.GetObject(name).GetVariables(), true);
    if ( dialog.ShowModal() == 1 )
    {
        for ( unsigned int j = 0; j < project.GetUsedPlatforms().size();++j)
            project.GetUsedPlatforms()[j]->GetChangesNotifier().OnObjectVariablesChanged(project, globalObjects ? NULL : layout, objects.GetObject(name));
    }
}*/

/**
 * Handle accelerators
 */
void EditorObjectList::OnobjectsListKeyDown(wxTreeEvent& event)
{
    if ( event.GetKeyCode() == WXK_DELETE )
    {
        wxCommandEvent unusedEvent;
        OndelObjMenuISelected( unusedEvent );
    }
    else if (event.GetKeyCode() == WXK_F2)
    {
        wxCommandEvent unusedEvent;
        OneditNameMenuISelected( unusedEvent );
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
                OnMoveUpSelected( unusedEvent );
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

void EditorObjectList::OnAideBtClick( wxCommandEvent& event )
{
    gd::HelpFileAccess::GetInstance()->OpenURL(_("http://www.wiki.compilgames.net/doku.php/en/game_develop/documentation/manual/edit_object"));
}

void EditorObjectList::OnsearchCtrlText(wxCommandEvent& event)
{
    Refresh();
}

void EditorObjectList::OneditPropMenuItemSelected(wxCommandEvent& event)
{
    if ( propPnl && propPnlManager ) propPnlManager->GetPane("PROPERTIES").Show();
    propPnlManager->Update();
}
