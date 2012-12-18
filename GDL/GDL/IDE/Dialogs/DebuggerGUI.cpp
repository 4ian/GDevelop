/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */
#if defined(GD_IDE_ONLY)
#include "DebuggerGUI.h"

//(*InternalHeaders(DebuggerGUI)
#include <wx/bitmap.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include <wx/toolbar.h>
#include <wx/image.h>
#include <boost/weak_ptr.hpp>
#include <wx/textdlg.h>
#include <wx/log.h>
#include <string>
#include <set>
#include "GDL/CommonTools.h"
#include "GDL/ExtensionsManager.h"
#include "GDL/ExtensionBase.h"
#include "GDL/RuntimeGame.h"
#include "GDL/Object.h"
#include "GDL/ObjectHelpers.h"
#include "GDCore/IDE/Dialogs/ChooseObjectDialog.h"
#include "GDCore/IDE/Dialogs/ChooseLayerDialog.h"
#include "GDCore/IDE/wxTools/SkinHelper.h"


//(*IdInit(DebuggerGUI)
const long DebuggerGUI::ID_AUITOOLBARITEM1 = wxNewId();
const long DebuggerGUI::ID_AUITOOLBARITEM2 = wxNewId();
const long DebuggerGUI::ID_AUITOOLBARITEM3 = wxNewId();
const long DebuggerGUI::ID_AUITOOLBARITEM5 = wxNewId();
const long DebuggerGUI::ID_AUITOOLBARITEM6 = wxNewId();
const long DebuggerGUI::ID_AUITOOLBARITEM4 = wxNewId();
const long DebuggerGUI::ID_AUITOOLBAR1 = wxNewId();
const long DebuggerGUI::ID_PANEL3 = wxNewId();
const long DebuggerGUI::ID_LISTCTRL2 = wxNewId();
const long DebuggerGUI::ID_PANEL1 = wxNewId();
const long DebuggerGUI::ID_TREECTRL1 = wxNewId();
const long DebuggerGUI::ID_STATICTEXT1 = wxNewId();
const long DebuggerGUI::ID_STATICTEXT2 = wxNewId();
const long DebuggerGUI::ID_BITMAPBUTTON1 = wxNewId();
const long DebuggerGUI::ID_LISTCTRL1 = wxNewId();
const long DebuggerGUI::ID_PANEL2 = wxNewId();
const long DebuggerGUI::ID_NOTEBOOK1 = wxNewId();
//*)
const long DebuggerGUI::ID_PLAYBT = wxNewId();
const long DebuggerGUI::ID_PAUSEBT = wxNewId();
const long DebuggerGUI::ID_STEPBT = wxNewId();
const long DebuggerGUI::ID_CONSOLEBT = wxNewId();
const long DebuggerGUI::ID_VARSCENEBT = wxNewId();
const long DebuggerGUI::ID_VARGLOBALBT = wxNewId();
const long DebuggerGUI::ID_ADDOBJBT = wxNewId();
const long DebuggerGUI::ID_EXTLIST = wxNewId();


BEGIN_EVENT_TABLE(DebuggerGUI,wxPanel)
	//(*EventTable(DebuggerGUI)
	//*)
END_EVENT_TABLE()

DebuggerGUI::DebuggerGUI(wxWindow* parent, RuntimeScene & scene_) :
scene(scene_),
mustRecreateTree(true),
doMAJ(false),
objectChanged(true)
{
	//(*Initialize(DebuggerGUI)
	wxFlexGridSizer* FlexGridSizer4;
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer5;
	wxFlexGridSizer* FlexGridSizer2;
	wxFlexGridSizer* FlexGridSizer6;
	wxFlexGridSizer* FlexGridSizer1;

	Create(parent, wxID_ANY, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(1);
	FlexGridSizer6 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer6->AddGrowableCol(0);
	FlexGridSizer6->AddGrowableRow(0);
	toolbarPanel = new wxPanel(this, ID_PANEL3, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL3"));
	AuiManager1 = new wxAuiManager(toolbarPanel, wxAUI_MGR_DEFAULT);
	toolbar = new wxAuiToolBar(toolbarPanel, ID_AUITOOLBAR1, wxDefaultPosition, wxDefaultSize, wxAUI_TB_DEFAULT_STYLE);
	toolbar->AddTool(ID_AUITOOLBARITEM1, _("Play the scene"), wxBitmap(wxImage(_T("res/starticon.png"))), wxNullBitmap, wxITEM_NORMAL, _("Play the scene"), _("Play the scene"), NULL);
	toolbar->AddTool(ID_AUITOOLBARITEM2, _("Pause the scene"), wxBitmap(wxImage(_T("res/pauseicon.png"))), wxNullBitmap, wxITEM_NORMAL, _("Pause the scene"), _("Pause the scene being played"), NULL);
	toolbar->AddTool(ID_AUITOOLBARITEM3, _("Step"), wxBitmap(wxImage(_T("res/stepicon.png"))), wxNullBitmap, wxITEM_NORMAL, _("Render only one frame of the scene"), _("Render only one frame of the scene"), NULL);
	toolbar->AddSeparator();
	toolbar->AddTool(ID_AUITOOLBARITEM5, _("Item label"), wxBitmap(wxImage(_T("res/addobjetdbg.png"))), wxNullBitmap, wxITEM_NORMAL, _("Create a new object"), _("Create a new object"), NULL);
	toolbar->AddTool(ID_AUITOOLBARITEM6, _("Add a scene variable"), wxBitmap(wxImage(_T("res/addvaricon.png"))), wxNullBitmap, wxITEM_NORMAL, _("Add a scene variable"), _("Add a scene variable"), NULL);
	toolbar->AddTool(ID_AUITOOLBARITEM4, _("Add a new global variable"), wxBitmap(wxImage(_T("res/addvargicon.png"))), wxNullBitmap, wxITEM_NORMAL, _("Create a new global variable"), _("Create a new global variable"), NULL);
	toolbar->Realize();
	AuiManager1->AddPane(toolbar, wxAuiPaneInfo().Name(_T("PaneName")).ToolbarPane().Caption(_("Pane caption")).Layer(10).Top().Gripper(false));
	AuiManager1->Update();
	FlexGridSizer6->Add(toolbarPanel, 1, wxBOTTOM|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer6, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	Notebook1 = new wxNotebook(this, ID_NOTEBOOK1, wxDefaultPosition, wxDefaultSize, 0, _T("ID_NOTEBOOK1"));
	Panel1 = new wxPanel(Notebook1, ID_PANEL1, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL1"));
	FlexGridSizer3 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer3->AddGrowableCol(0);
	FlexGridSizer3->AddGrowableRow(0);
	generalList = new wxListCtrl(Panel1, ID_LISTCTRL2, wxDefaultPosition, wxSize(249,203), wxLC_REPORT, wxDefaultValidator, _T("ID_LISTCTRL2"));
	FlexGridSizer3->Add(generalList, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	Panel1->SetSizer(FlexGridSizer3);
	FlexGridSizer3->Fit(Panel1);
	FlexGridSizer3->SetSizeHints(Panel1);
	Panel2 = new wxPanel(Notebook1, ID_PANEL2, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL2"));
	FlexGridSizer2 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer2->AddGrowableCol(1);
	FlexGridSizer2->AddGrowableRow(0);
	objectsTree = new wxTreeCtrl(Panel2, ID_TREECTRL1, wxDefaultPosition, wxSize(138,203), wxTR_DEFAULT_STYLE, wxDefaultValidator, _T("ID_TREECTRL1"));
	FlexGridSizer2->Add(objectsTree, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 2);
	FlexGridSizer4 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer4->AddGrowableCol(0);
	FlexGridSizer4->AddGrowableRow(1);
	FlexGridSizer5 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer5->AddGrowableCol(2);
	FlexGridSizer5->AddGrowableRow(0);
	StaticText1 = new wxStaticText(Panel2, ID_STATICTEXT1, _("Object :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	FlexGridSizer5->Add(StaticText1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	objectName = new wxStaticText(Panel2, ID_STATICTEXT2, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
	FlexGridSizer5->Add(objectName, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	deleteBt = new wxBitmapButton(Panel2, ID_BITMAPBUTTON1, wxBitmap(wxImage(_T("res/deleteicon.png"))), wxDefaultPosition, wxDefaultSize, wxBU_AUTODRAW, wxDefaultValidator, _T("ID_BITMAPBUTTON1"));
	deleteBt->SetToolTip(_("Delete this object"));
	FlexGridSizer5->Add(deleteBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 2);
	FlexGridSizer4->Add(FlexGridSizer5, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	objectList = new wxListCtrl(Panel2, ID_LISTCTRL1, wxDefaultPosition, wxSize(249,203), wxLC_REPORT|wxLC_EDIT_LABELS, wxDefaultValidator, _T("ID_LISTCTRL1"));
	FlexGridSizer4->Add(objectList, 1, wxTOP|wxBOTTOM|wxRIGHT|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 2);
	FlexGridSizer2->Add(FlexGridSizer4, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	Panel2->SetSizer(FlexGridSizer2);
	FlexGridSizer2->Fit(Panel2);
	FlexGridSizer2->SetSizeHints(Panel2);
	Notebook1->AddPage(Panel1, _("General"), false);
	Notebook1->AddPage(Panel2, _("Objects"), false);
	FlexGridSizer1->Add(Notebook1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	Connect(ID_AUITOOLBARITEM1,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&DebuggerGUI::OnPlayBtClick);
	Connect(ID_AUITOOLBARITEM2,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&DebuggerGUI::OnPauseBtClick);
	Connect(ID_AUITOOLBARITEM3,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&DebuggerGUI::OnStepBtClick);
	Connect(ID_AUITOOLBARITEM5,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&DebuggerGUI::OnAddObjBtClick);
	Connect(ID_AUITOOLBARITEM6,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&DebuggerGUI::OnAddVarSceneBtClick);
	Connect(ID_AUITOOLBARITEM4,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&DebuggerGUI::OnAddVarGlobalBtClick);
	toolbarPanel->Connect(wxEVT_SIZE,(wxObjectEventFunction)&DebuggerGUI::OntoolbarPanelResize,0,this);
	Connect(ID_LISTCTRL2,wxEVT_COMMAND_LIST_ITEM_ACTIVATED,(wxObjectEventFunction)&DebuggerGUI::OngeneralListItemActivated);
	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_SEL_CHANGED,(wxObjectEventFunction)&DebuggerGUI::OnobjectsTreeSelectionChanged);
	Connect(ID_BITMAPBUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&DebuggerGUI::OndeleteBtClick);
	Connect(ID_LISTCTRL1,wxEVT_COMMAND_LIST_ITEM_ACTIVATED,(wxObjectEventFunction)&DebuggerGUI::OnobjectListItemActivated);
	Connect(wxEVT_SIZE,(wxObjectEventFunction)&DebuggerGUI::OnResize);
	//*)

	Connect(ID_EXTLIST,wxEVT_COMMAND_LIST_ITEM_ACTIVATED,(wxObjectEventFunction)&DebuggerGUI::OnExtensionListItemActivated);

    gd::SkinHelper::ApplyCurrentSkin(*toolbar);

    font = *wxNORMAL_FONT;
    font.SetWeight(wxFONTWEIGHT_BOLD);

    generalList->InsertColumn(0, "Propriété");
    generalList->InsertColumn(1, "Valeur");
    generalList->SetColumnWidth(0, 225);
    generalList->SetColumnWidth(1, 165);

    generalList->InsertItem(0, _("Frame per seconds ( FPS )"));
    generalList->InsertItem(1, _("Time elapsed since the last image"));
    generalList->InsertItem(2, _("Number of objects"));
    generalList->InsertItem(3, _("Resources count"));
    generalList->InsertItem(4, _("Window's size"));
    generalList->InsertItem(5, _("Position of the mouse over the window"));
    generalList->InsertItem(6, _("Time elapsed since the beginning of the scene"));
    generalList->InsertItem(7, "");
    generalList->InsertItem(8, _("Scene variables"));
    generalList->SetItemFont(8, font);
    generalBaseItemCount = generalList->GetItemCount();

    objectList->InsertColumn(0, "Propriété");
    objectList->InsertColumn(1, "Valeur");
    objectList->SetColumnWidth(0, 175);
    objectList->SetColumnWidth(1, 100);

    objectsTree->AddRoot(_("Objects"));

    std::set<std::string> alreadyCreatedPanels; //Just to be sure not to create a panel twice ( extensionsUsed can contains the same extension name twice )
    for (unsigned int i = 0;i<scene.game->GetUsedPlatformExtensions().size();++i)
    {
        boost::shared_ptr<ExtensionBase> extension = ExtensionsManager::GetInstance()->GetExtension(scene.game->GetUsedPlatformExtensions()[i]);

        if ( extension != boost::shared_ptr<ExtensionBase>() && extension->HasDebuggingProperties() && alreadyCreatedPanels.find(extension->GetName()) == alreadyCreatedPanels.end())
        {
            alreadyCreatedPanels.insert(extension->GetName());
            wxPanel * extPanel = new wxPanel(Notebook1, wxID_ANY, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, extension->GetName());
            wxFlexGridSizer * sizer = new wxFlexGridSizer(0, 3, 0, 0);
            sizer->AddGrowableCol(0);
            sizer->AddGrowableRow(0);
            wxListCtrl * extList = new wxListCtrl(extPanel, ID_EXTLIST, wxDefaultPosition, wxSize(249,203), wxLC_REPORT, wxDefaultValidator, extension->GetName());
            sizer->Add(extList, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
            extPanel->SetSizer(sizer);
            sizer->Fit(extPanel);
            sizer->SetSizeHints(extPanel);

            extList->InsertColumn(0, "Propriété");
            extList->InsertColumn(1, "Valeur");
            extList->SetColumnWidth(0, 175);
            extList->SetColumnWidth(1, -1);

            Notebook1->AddPage(extPanel, extension->GetFullName(), false);
            extensionsListCtrls.push_back(extList);
        }
    }
}

DebuggerGUI::~DebuggerGUI()
{
	//(*Destroy(DebuggerGUI)
	//*)

	AuiManager1->UnInit();
}


////////////////////////////////////////////////////////////
/// Mise à jour de la taille de la toolbar
////////////////////////////////////////////////////////////
void DebuggerGUI::OntoolbarPanelResize(wxSizeEvent& event)
{
}

////////////////////////////////////////////////////////////
/// Contrôle du déroulement de la scène
////////////////////////////////////////////////////////////
void DebuggerGUI::OnPlayBtClick(wxCommandEvent& event)
{
    scene.running = true;
}
void DebuggerGUI::OnPauseBtClick(wxCommandEvent& event)
{
    scene.running = false;
}
void DebuggerGUI::OnStepBtClick(wxCommandEvent& event)
{
    scene.RenderAndStep();
    scene.running = false;
}

////////////////////////////////////////////////////////////
/// Activation/Desactivation du Debugger
////////////////////////////////////////////////////////////
void DebuggerGUI::Pause()
{
    doMAJ = false;
    mustRecreateTree = true;
    toolbar->Enable(false);
    deleteBt->Enable(false);
}

void DebuggerGUI::Play()
{
    doMAJ = true;
    mustRecreateTree = true;
    toolbar->Enable(true);
    deleteBt->Enable(true);
}


/**
 * Refreshing the debugger.
 * Automatically called by the RuntimeScene
 */
void DebuggerGUI::UpdateGUI()
{
    if ( !doMAJ || !IsShown())
        return;

    //General tab
    generalList->SetItem(0, 1, ToString(1000000.0/static_cast<double>(scene.GetElapsedTime()))+_(" fps"));
    generalList->SetItem(1, 1, ToString(static_cast<double>(scene.GetElapsedTime())/1000.0)+"ms");
    generalList->SetItem(2, 1, ToString(scene.objectsInstances.GetAllObjects().size()));
    //TODO //generalList->SetItem(3, 1, ToString(scene.game->resourcesManager.resources.size()));
    generalList->SetItem(4, 1, ToString(scene.game->GetMainWindowDefaultWidth())+"*"+ToString(scene.game->GetMainWindowDefaultHeight()));
    generalList->SetItem(5, 1, ToString(sf::Mouse::getPosition(*scene.renderWindow).x)+";"+ToString(sf::Mouse::getPosition(*scene.renderWindow).y));
    generalList->SetItem(6, 1, ToString(static_cast<double>(scene.GetTimeFromStart())/1000000.0)+"s");

    const vector < Variable > sceneVariables = scene.GetVariables().GetVariablesVector();
    const vector < Variable > gameVariables = scene.game->GetVariables().GetVariablesVector();

    //Suppression des lignes en trop pour les variables
    while(static_cast<unsigned int>(generalList->GetItemCount()) > generalBaseItemCount + sceneVariables.size() + gameVariables.size()+2)
        generalList->DeleteItem(generalBaseItemCount);

    //Rajout si au contraire il n'y en a pas assez
    while(static_cast<unsigned int>(generalList->GetItemCount()) < generalBaseItemCount + sceneVariables.size() + gameVariables.size()+2)
        generalList->InsertItem(generalBaseItemCount, "");

    //Update scene variables
    for (unsigned int i =0;i<sceneVariables.size();++i)
    {
        generalList->SetItem(generalBaseItemCount+i, 0, sceneVariables[i].GetName());
        generalList->SetItem(generalBaseItemCount+i, 1, sceneVariables[i].GetString());
        generalList->SetItemFont(generalBaseItemCount+i, *wxNORMAL_FONT);
    }

    //White space
    generalList->SetItem(generalBaseItemCount+sceneVariables.size(), 0, "");
    generalList->SetItem(generalBaseItemCount+sceneVariables.size(), 1, "");

    //Global variable title
    generalList->SetItem(generalBaseItemCount+sceneVariables.size()+1, 0, _("Globals variables"));
    generalList->SetItem(generalBaseItemCount+sceneVariables.size()+1, 1, "");
    generalList->SetItemFont(generalBaseItemCount+sceneVariables.size()+1, font);
    generalBaseAndVariablesItemCount = generalBaseItemCount+sceneVariables.size()+2;

    //Update global variables
    for (unsigned int i =0;i<gameVariables.size();++i)
    {
        generalList->SetItem(generalBaseAndVariablesItemCount+i, 0, gameVariables[i].GetName());
        generalList->SetItem(generalBaseAndVariablesItemCount+i, 1, gameVariables[i].GetString());
        generalList->SetItemFont(generalBaseAndVariablesItemCount+i, *wxNORMAL_FONT);
    }

    //Extensions tab
    unsigned int extListCtrlId = 0;
    for (unsigned int i = 0;i<scene.game->GetUsedPlatformExtensions().size();++i)
    {
        boost::shared_ptr<ExtensionBase> extension = ExtensionsManager::GetInstance()->GetExtension(scene.game->GetUsedPlatformExtensions()[i]);

        if ( extension != boost::shared_ptr<ExtensionBase>() && extension->HasDebuggingProperties() && extListCtrlId < extensionsListCtrls.size() )
        {
            //Update items count
            while(static_cast<unsigned int>(extensionsListCtrls[extListCtrlId]->GetItemCount()) > extension->GetNumberOfProperties(scene))
                extensionsListCtrls[extListCtrlId]->DeleteItem(0);
            while(static_cast<unsigned int>(extensionsListCtrls[extListCtrlId]->GetItemCount()) < extension->GetNumberOfProperties(scene))
                extensionsListCtrls[extListCtrlId]->InsertItem(0, "");

            //Update properties
            for (unsigned int propertyNb = 0;propertyNb<extension->GetNumberOfProperties(scene);++propertyNb)
            {
                std::string name, value;
                extension->GetPropertyForDebugger(scene, propertyNb, name, value);
                extensionsListCtrls[extListCtrlId]->SetItem(propertyNb, 0, name);
                extensionsListCtrls[extListCtrlId]->SetItem(propertyNb, 1, value);
            }

            extListCtrlId++;
        }
    }

    //Arbre des objets : Création des objets
    if ( mustRecreateTree )
    {
        objectsTree->DeleteAllItems();
        objectsTree->AddRoot(_("objects"));
        objectsInTree.clear();
        initialObjects.clear();
        mustRecreateTree = false;

        //Scene's objects
        for(unsigned int i = 0;i<scene.GetInitialObjects().size();++i)
        {
            wxTreeItemId objectItem = objectsTree->AppendItem(objectsTree->GetRootItem(), scene.GetInitialObjects()[i]->GetName());
            initialObjects[scene.GetInitialObjects()[i]->GetName()] = objectItem;
        }
        //Globals objects
        for(unsigned int i = 0;i<scene.game->GetGlobalObjects().size();++i)
        {
            wxTreeItemId objectItem = objectsTree->AppendItem(objectsTree->GetRootItem(), scene.game->GetGlobalObjects()[i]->GetName());
            initialObjects[scene.game->GetGlobalObjects()[i]->GetName()] = objectItem;
        }

        objectsTree->ExpandAll();
    }

    //Ajout des objets
    ObjList allObjects = scene.objectsInstances.GetAllObjects();
    for(unsigned int i = 0;i<allObjects.size();++i)
    {
        boost::weak_ptr<Object> weakPtrToObject = allObjects[i];

        //L'objet n'est pas dans l'arbre : on l'ajoute
        if ( objectsInTree.find(weakPtrToObject) == objectsInTree.end() )
        {
            char str[24];
            snprintf(str, 24, "%p", allObjects[i].get());

            wxTreeItemId objectItem = objectsTree->AppendItem(initialObjects[allObjects[i]->GetName()], str);
            objectsInTree[weakPtrToObject] = pair<string, wxTreeItemId>(allObjects[i]->GetName(), objectItem);
        }
        else
        {
            //Si l'objet qui est dans l'arbre n'est pas le même, on le supprime et le reajoute au bon endroit
            if ( objectsInTree[weakPtrToObject].first != allObjects[i]->GetName() && initialObjects.find(allObjects[i]->GetName()) != initialObjects.end() )
            {
                objectsTree->Delete(objectsInTree[weakPtrToObject].second);
                wxTreeItemId objectItem = objectsTree->AppendItem(initialObjects[allObjects[i]->GetName()], ToString(i));
                objectsInTree[weakPtrToObject] = pair<string, wxTreeItemId>(allObjects[i]->GetName(), objectItem);
            }
        }
    }

    //Suppression des élements en trop
    map < boost::weak_ptr<Object>, pair<string, wxTreeItemId> >::iterator objectsInTreeIter = objectsInTree.begin();
    map < boost::weak_ptr<Object>, pair<string, wxTreeItemId> >::const_iterator objectsInTreeEnd = objectsInTree.end();

    while(objectsInTreeIter != objectsInTreeEnd)
    {
        if ( (*objectsInTreeIter).first.expired() )
        {
            objectsTree->Delete((*objectsInTreeIter).second.second); //Delete from the tree
            objectsInTree.erase(objectsInTreeIter++); //Post increment is important. It increment the iterator and then return the *original* iterator.
            //( Erasing an value does not invalidate any iterator except the deleted one )
        }
        else
            ++objectsInTreeIter;
    }

    //Obtain the shared_ptr to the selected object
    if ( !objectsTree->GetSelection().IsOk() )
        return;

    ObjSPtr object = boost::shared_ptr<Object>();
    map < boost::weak_ptr<Object>, pair<string, wxTreeItemId> >::const_iterator end = objectsInTree.end();
    for (map < boost::weak_ptr<Object>, pair<string, wxTreeItemId> >::iterator i = objectsInTree.begin();i != end;++i)
    {
        if ( i->second.second == objectsTree->GetSelection() && !i->first.expired())
        {
            object = i->first.lock();
            continue;
        }
    }

    if ( object == boost::shared_ptr<Object>() )
        return;

    objectName->SetLabel(object->GetName());

    //Object selected has changed, recreate the enitre table.
    if ( objectChanged )
        RecreateListForObject(object);

    string value, uselessName;
    unsigned int currentLine = 1; //We start a the second line, after "General"

    //Properties of base object
    for (unsigned int i = 0;i<object->Object::GetNumberOfProperties();++i)
    {
        object->Object::GetPropertyForDebugger(i, uselessName, value);
        objectList->SetItem(currentLine, 1, value);

        currentLine++;
    }

    currentLine += 2; //We have two lines to jump for "Specific"

    //Specific properties of object
    for (unsigned int i = 0;i<object->GetNumberOfProperties();++i)
    {
        object->GetPropertyForDebugger(i, uselessName, value);
        objectList->SetItem(currentLine, 1, value);

        currentLine++;
    }

    currentLine += 2; //We have two lines to jump for "Variables"

    const vector < Variable > objectVariables = object->GetVariables().GetVariablesVector();
    //Suppression des lignes en trop pour les variables
    while(objectList->GetItemCount() > baseItemCount+objectVariables.size())
        objectList->DeleteItem(baseItemCount+objectVariables.size());

    //Rajout si au contraire il n'y en a pas assez
    while(objectList->GetItemCount() < baseItemCount+objectVariables.size())
    {
        objectList->InsertItem(baseItemCount, "");
    }

    //Mise à jour des variables
    for (unsigned int i =0;i<objectVariables.size();++i)
    {
        objectList->SetItem(baseItemCount+i, 0, objectVariables[i].GetName());
        objectList->SetItem(baseItemCount+i, 1, objectVariables[i].GetString());
    }
}

/**
 * Create the list of properties for an object
 */
void DebuggerGUI::RecreateListForObject(const ObjSPtr & object)
{
    objectList->DeleteAllItems();
    unsigned int currentLine = 0;
    string name, uselessValue;

    objectList->InsertItem(0, _("General"));
    objectList->SetItemFont(0, font);
    currentLine++;

    //Create base properties.
    for (unsigned int i = 0;i<object->Object::GetNumberOfProperties();++i)
    {
        object->Object::GetPropertyForDebugger(i, name, uselessValue);
        objectList->InsertItem(currentLine, name);

        currentLine++;
    }

    objectList->InsertItem(objectList->GetItemCount(), "");
    objectList->InsertItem(objectList->GetItemCount(), _("Specific"));
    objectList->SetItemFont(objectList->GetItemCount()-1, font);
    currentLine += 2;

    //Create object specific properties.
    for (unsigned int i = 0;i<object->GetNumberOfProperties();++i)
    {
        object->GetPropertyForDebugger(i, name, uselessValue);
        objectList->InsertItem(currentLine, name);

        currentLine++;
    }

    objectList->InsertItem(objectList->GetItemCount(), "");
    objectList->InsertItem(objectList->GetItemCount(), _("Variables"));
    objectList->SetItemFont(objectList->GetItemCount()-1, font);

    //On retient combien il y a d'item de base pour savoir où commencer
    //pour ajouter les variables.
    baseItemCount = objectList->GetItemCount();

    objectChanged = false;
}

void DebuggerGUI::OnobjectsTreeSelectionChanged(wxTreeEvent& event)
{
    objectChanged = true;
}

/**
 * Edit properties of selected object in live
 */
void DebuggerGUI::OnobjectListItemActivated(wxListEvent& event)
{
    if ( !objectsTree->GetSelection().IsOk() )
        return;

    //Obtain the shared_ptr to the object
    ObjSPtr object = boost::shared_ptr<Object>();
    map < boost::weak_ptr<Object>, pair<string, wxTreeItemId> >::const_iterator end = objectsInTree.end();
    for (map < boost::weak_ptr<Object>, pair<string, wxTreeItemId> >::iterator i = objectsInTree.begin();i != end;++i)
    {
        if ( i->second.second == objectsTree->GetSelection() && !i->first.expired())
        {
            object = i->first.lock();
            continue;
        }
    }

    if ( object == boost::shared_ptr<Object>() )
        return;

    //Check if we are trying to modify a "general" property
    if ( event.GetIndex() < 1+object->Object::GetNumberOfProperties()) //1+ for include the "General"
    {
        int propNb = event.GetIndex()-1;

        string uselessName, oldValue;
        object->Object::GetPropertyForDebugger(propNb, uselessName, oldValue);
        string newValue = string(wxGetTextFromUser(_("Enter the new value"), _("Editing a value"), oldValue).mb_str());

        if ( !object->Object::ChangeProperty(propNb, newValue) )
        {
            wxLogWarning(_("Unable to modify the value.\nThe value entered is either incorrect or the property is read-only."));
        }
    }
    //A specific property
    else if ( event.GetIndex() < 1+object->Object::GetNumberOfProperties()
                                +2+object->GetNumberOfProperties()) //+2 for include the "Specific"
    {
        int propNb = event.GetIndex()-1-2-object->Object::GetNumberOfProperties();

        string uselessName, oldValue;
        object->GetPropertyForDebugger(propNb, uselessName, oldValue);
        string newValue = string(wxGetTextFromUser(_("Enter the new value"), _("Editing a value"), oldValue).mb_str());

        if ( !object->ChangeProperty(propNb, newValue) )
        {
            wxLogWarning(_("Unable to modify the value.\nThe value entered is either incorrect or the property is read-only."));
        }
    }
    else //Or a variable
    {
        const vector < Variable > objectVariables = object->GetVariables().GetVariablesVector();
        int idVariable = event.GetIndex() - ( 1+object->Object::GetNumberOfProperties()
                                              +2+object->GetNumberOfProperties()
                                              +2);

        if ( idVariable >= 0 && static_cast<unsigned int>(idVariable) < objectVariables.size() )
        {
            string newValue = string(wxGetTextFromUser(_("Enter the new value"), _("Editing a variable"), objectVariables[idVariable].GetString()).mb_str());

            object->GetVariables().ObtainVariable(objectVariables[idVariable].GetName()) = newValue;
        }
    }

}

/**
 * Edit scene/global variables
 */
void DebuggerGUI::OngeneralListItemActivated(wxListEvent& event)
{
    const vector < Variable > sceneVariables = scene.GetVariables().GetVariablesVector();
    const vector < Variable > gameVariables = scene.game->GetVariables().GetVariablesVector();

    if ( event.GetIndex() < (generalBaseItemCount + sceneVariables.size()))
    {
        int id = event.GetIndex() - ( generalBaseItemCount );
        if (id < 0 || static_cast<unsigned int>(id) > sceneVariables.size())
            return;

        string newValue = string(wxGetTextFromUser(_("Enter the new value"), _("Editing a value"), sceneVariables[id].GetString()).mb_str());
        scene.GetVariables().ObtainVariable(sceneVariables[id].GetName()).SetString(newValue);
    }
    else if ( event.GetIndex() < ( generalBaseAndVariablesItemCount + gameVariables.size()) )
    {
        int id = event.GetIndex() - ( generalBaseAndVariablesItemCount );
        if (id < 0 || static_cast<unsigned int>(id) > gameVariables.size())
            return;

        string newValue = string(wxGetTextFromUser(_("Enter the new value"), _("Editing a value"),gameVariables[id].GetString()).mb_str());
        scene.game->GetVariables().ObtainVariable(gameVariables[id].GetName()).SetString(newValue);
    }
}

/**
 * Edit property of an extension
 */
void DebuggerGUI::OnExtensionListItemActivated(wxListEvent& event)
{
    wxListCtrl * list = dynamic_cast<wxListCtrl*>(event.GetEventObject());
    if ( !list )
    {
        cout << "Received an event for a bad Extension wxListCtrl in debugger." << endl;
        return;
    }

    boost::shared_ptr<ExtensionBase> extension = ExtensionsManager::GetInstance()->GetExtension(string(list->GetName().mb_str()));
    if ( extension == boost::shared_ptr<ExtensionBase>() )
    {
        cout << "Unknown extension in debugger ( " << list->GetName() << " )" << endl;
        return;
    }

    int propNb = event.GetIndex();
    string uselessName, oldValue;
    extension->GetPropertyForDebugger(scene, propNb, uselessName, oldValue);
    string newValue = string(wxGetTextFromUser(_("Enter the new value"), _("Editing a value"), oldValue).mb_str());

    if ( !extension->ChangeProperty(scene, propNb, newValue) )
    {
        wxLogWarning(_("Unable to modify the value.\nThe value entered is either incorrect or the property is read-only."));
    }
}

/**
 * Delete the selected object
 */
void DebuggerGUI::OndeleteBtClick(wxCommandEvent& event)
{
    if ( !objectsTree->GetSelection().IsOk() )
        return;

    //Obtain the shared_ptr to the object
    ObjSPtr object = boost::shared_ptr<Object>();
    map < boost::weak_ptr<Object>, pair<string, wxTreeItemId> >::const_iterator end = objectsInTree.end();
    for (map < boost::weak_ptr<Object>, pair<string, wxTreeItemId> >::iterator i = objectsInTree.begin();i != end;++i)
    {
        if ( i->second.second == objectsTree->GetSelection() && !i->first.expired())
        {
            object = i->first.lock();
            continue;
        }
    }

    if ( object == boost::shared_ptr<Object>() )
        return;

    object->SetName(""); //Simply set the name to nothing to let the object be deleted
}

/**
 * Add a scene variable
 */
void DebuggerGUI::OnAddVarSceneBtClick( wxCommandEvent & event )
{
    string variableName = string(wxGetTextFromUser(_("Type the name of the new variable"), _("Adding a scene variable")).mb_str());

    if ( variableName == "" ) return;
    if ( scene.GetVariables().HasVariableNamed(variableName) )
    {
        wxLogMessage(_("A variable with this name already exists!"));
        return;
    }

    string variableValue = string(wxGetTextFromUser(_("Enter the value of the variable"), _("Adding a scene variable")).mb_str());

    scene.GetVariables().ObtainVariable(variableName) = variableValue;
}

/**
 * Add a global variable
 */
void DebuggerGUI::OnAddVarGlobalBtClick( wxCommandEvent & event )
{
    string variableName = string(wxGetTextFromUser(_("Type the name of the new variable"), _("Adding a global variable")).mb_str());

    if ( variableName == "" ) return;
    if ( scene.game->GetVariables().HasVariableNamed(variableName) )
    {
        wxLogMessage(_("A variable with this name already exists!"));
        return;
    }

    string variableValue = string(wxGetTextFromUser(_("Enter the value of the variable"), _("Adding a global variable")).mb_str());

    scene.game->GetVariables().ObtainVariable(variableName) = variableValue;
}

void DebuggerGUI::OnAddObjBtClick( wxCommandEvent & event )
{
    gd::ChooseObjectDialog dialog( this, *scene.game, scene, false );
    if ( dialog.ShowModal() != 1 ) return;

    string objectWanted = dialog.GetChosenObject();
    std::vector<ObjSPtr>::iterator sceneObject = std::find_if(scene.GetInitialObjects().begin(), scene.GetInitialObjects().end(), std::bind2nd(ObjectHasName(), objectWanted));
    std::vector<ObjSPtr>::iterator globalObject = std::find_if(scene.game->GetGlobalObjects().begin(), scene.game->GetGlobalObjects().end(), std::bind2nd(ObjectHasName(), objectWanted));

    ObjSPtr newObject = boost::shared_ptr<Object> ();

    //Creation of the object
    if ( sceneObject != scene.GetInitialObjects().end() )
        newObject = boost::shared_ptr<Object>((*sceneObject)->Clone());
    else if ( globalObject != scene.game->GetGlobalObjects().end() )
        newObject = boost::shared_ptr<Object>((*globalObject)->Clone());
    else
    {
        wxLogWarning(_("Unable to create object."));
        return;
    }

    int x = ToInt(string(wxGetTextFromUser(_("Enter the X position of the object"), _("Adding an object")).mb_str()));
    int y = ToInt(string(wxGetTextFromUser(_("Enter the object's Y position"), _("Adding an object")).mb_str()));
    newObject->SetX( x );
    newObject->SetY( y );

    gd::ChooseLayerDialog layerDialog(this, scene, false);
    layerDialog.ShowModal();
    newObject->SetLayer( layerDialog.GetChosenLayer() );

    newObject->LoadRuntimeResources(scene, *scene.game->imageManager);

    scene.objectsInstances.AddObject(newObject);

    return;
}

void DebuggerGUI::OnResize(wxSizeEvent& event)
{
    Notebook1->SetSize(GetSize().GetWidth()-5, GetSize().GetHeight()-toolbarPanel->GetSize().GetHeight()-10);
    UpdateListCtrlColumnsWidth();
}

void DebuggerGUI::UpdateListCtrlColumnsWidth()
{
    generalList->SetColumnWidth(1, generalList->GetSize().GetWidth()-generalList->GetColumnWidth(0)-15);
    objectList->SetColumnWidth(1, objectList->GetSize().GetWidth()-objectList->GetColumnWidth(0)-15);
    for (unsigned int i = 0;i<extensionsListCtrls.size();++i)
        extensionsListCtrls[i]->SetColumnWidth(1, extensionsListCtrls[i]->GetSize().GetWidth()-extensionsListCtrls[i]->GetColumnWidth(0)-15);
}

#endif
