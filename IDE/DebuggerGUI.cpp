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
#include "GDL/CommonTools.h"

#ifdef ___WXMSW___
#include <wx/msw/winundef.h>
#endif

#include "GDL/ExtensionsManager.h"
#include "GDL/Chercher.h"
#include "GDL/ChooseObject.h"
#include "ConsoleManager.h"
#include "GDL/ChooseLayer.h"
#include <wx/textdlg.h>

#ifdef ___WXMSW___
#include <wx/msw/winundef.h>
#endif


//(*IdInit(DebuggerGUI)
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
	toolbarPanel = new wxPanel(this, ID_PANEL3, wxDefaultPosition, wxSize(-1,25), wxTAB_TRAVERSAL, _T("ID_PANEL3"));
	FlexGridSizer6->Add(toolbarPanel, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
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
	StaticText1 = new wxStaticText(Panel2, ID_STATICTEXT1, _("Objet :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	FlexGridSizer5->Add(StaticText1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	objectName = new wxStaticText(Panel2, ID_STATICTEXT2, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
	FlexGridSizer5->Add(objectName, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	deleteBt = new wxBitmapButton(Panel2, ID_BITMAPBUTTON1, wxBitmap(wxImage(_T("res/deleteicon.png"))), wxDefaultPosition, wxDefaultSize, wxBU_AUTODRAW, wxDefaultValidator, _T("ID_BITMAPBUTTON1"));
	deleteBt->SetToolTip(_("Supprimer cet objet"));
	FlexGridSizer5->Add(deleteBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 2);
	FlexGridSizer4->Add(FlexGridSizer5, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	objectList = new wxListCtrl(Panel2, ID_LISTCTRL1, wxDefaultPosition, wxSize(249,203), wxLC_REPORT|wxLC_EDIT_LABELS, wxDefaultValidator, _T("ID_LISTCTRL1"));
	FlexGridSizer4->Add(objectList, 1, wxTOP|wxBOTTOM|wxRIGHT|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 2);
	FlexGridSizer2->Add(FlexGridSizer4, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	Panel2->SetSizer(FlexGridSizer2);
	FlexGridSizer2->Fit(Panel2);
	FlexGridSizer2->SetSizeHints(Panel2);
	Notebook1->AddPage(Panel1, _("Général"), false);
	Notebook1->AddPage(Panel2, _("Objets"), false);
	FlexGridSizer1->Add(Notebook1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	toolbarPanel->Connect(wxEVT_SIZE,(wxObjectEventFunction)&DebuggerGUI::OntoolbarPanelResize,0,this);
	Connect(ID_LISTCTRL2,wxEVT_COMMAND_LIST_ITEM_ACTIVATED,(wxObjectEventFunction)&DebuggerGUI::OngeneralListItemActivated);
	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_SEL_CHANGED,(wxObjectEventFunction)&DebuggerGUI::OnobjectsTreeSelectionChanged);
	Connect(ID_BITMAPBUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&DebuggerGUI::OndeleteBtClick);
	Connect(ID_LISTCTRL1,wxEVT_COMMAND_LIST_ITEM_ACTIVATED,(wxObjectEventFunction)&DebuggerGUI::OnobjectListItemActivated);
	//*)
    toolbar = new wxToolBar( toolbarPanel, -1, wxDefaultPosition, wxDefaultSize,
                                   wxTB_FLAT | wxTB_NODIVIDER );

    toolbar->ClearTools();
    toolbar->SetToolBitmapSize( wxSize( 16, 16 ) );
    toolbar->AddTool( ID_PLAYBT, wxT( "Jouer la scène" ), wxBitmap( wxImage( "res/starticon.png" ) ), _("Jouer la scène") );
    toolbar->AddTool( ID_PAUSEBT, wxT( "Mettre en pause" ), wxBitmap( wxImage( "res/pauseicon.png" ) ), _("Mettre en pause la scène") );
    toolbar->AddSeparator();
    toolbar->AddTool( ID_STEPBT, wxT( "Avancer d'une étape" ), wxBitmap( wxImage( "res/stepicon.png" ) ), _("Avancer d'une étape") );
    toolbar->AddSeparator();
    toolbar->AddTool( ID_ADDOBJBT, wxT( "Ajouter un objet" ), wxBitmap( wxImage( "res/addobjetdbg.png" ) ), _("Ajouter un objet") );
    toolbar->AddTool( ID_VARSCENEBT, wxT( "Ajouter une variable de la scène" ), wxBitmap( wxImage( "res/addvaricon.png" ) ), _("Ajouter une variable de la scène") );
    toolbar->AddTool( ID_VARGLOBALBT, wxT( "Ajouter une variable globale" ), wxBitmap( wxImage( "res/addvargicon.png" ) ), _("Ajouter une variable globale") );
    toolbar->AddSeparator();
    toolbar->AddTool( ID_CONSOLEBT, wxT( "Console Game Develop" ), wxBitmap( wxImage( "res/console.png" ) ), _("Console Game Develop") );
    toolbar->Realize();

    Connect(ID_PLAYBT,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&DebuggerGUI::OnPlayBtClick);
    Connect(ID_PAUSEBT,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&DebuggerGUI::OnPauseBtClick);
    Connect(ID_STEPBT,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&DebuggerGUI::OnStepBtClick);
    Connect(ID_CONSOLEBT,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&DebuggerGUI::OnConsoleBtClick);
    Connect(ID_VARSCENEBT,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&DebuggerGUI::OnAddVarSceneBtClick);
    Connect(ID_VARGLOBALBT,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&DebuggerGUI::OnAddVarGlobalBtClick);
    Connect(ID_ADDOBJBT,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&DebuggerGUI::OnAddObjBtClick);

    font = *wxNORMAL_FONT;
    font.SetWeight(wxFONTWEIGHT_BOLD);

    generalList->InsertColumn(0, "Propriété");
    generalList->InsertColumn(1, "Valeur");
    generalList->SetColumnWidth(0, 170);
    generalList->SetColumnWidth(1, 165);

    generalList->InsertItem(0, _("Images par secondes ( FPS )"));
    generalList->InsertItem(1, _("Temps depuis la dernière image"));
    generalList->InsertItem(2, _("Nombres d'objets"));
    generalList->InsertItem(3, _("Nombres d'images"));
    generalList->InsertItem(4, _("Taille de la fenêtre"));
    generalList->InsertItem(5, _("Position de la souris sur la fenêtre"));
    generalList->InsertItem(6, _("Temps depuis le début de la scène"));
    generalList->InsertItem(7, "");
    generalList->InsertItem(8, _("Variables de la scène"));
    generalList->SetItemFont(8, font);
    generalBaseItemCount = generalList->GetItemCount();

    objectList->InsertColumn(0, "Propriété");
    objectList->InsertColumn(1, "Valeur");
    objectList->SetColumnWidth(0, 100);
    objectList->SetColumnWidth(1, 100);

    objectsTree->AddRoot(_("Objets"));
}

DebuggerGUI::~DebuggerGUI()
{
	//(*Destroy(DebuggerGUI)
	//*)
}


////////////////////////////////////////////////////////////
/// Mise à jour de la taille de la toolbar
////////////////////////////////////////////////////////////
void DebuggerGUI::OntoolbarPanelResize(wxSizeEvent& event)
{
    toolbar->SetSize(toolbarPanel->GetSize().x, -1);
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
    scene.RenderAndStep(1);
    scene.running = false;
}

void DebuggerGUI::OnConsoleBtClick(wxCommandEvent& event)
{
    ConsoleManager * consoleManager = ConsoleManager::getInstance();
    consoleManager->ShowConsole();
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

    //Général
    generalList->SetItem(0, 1, ToString(1/scene.GetElapsedTime())+_(" i/s"));
    generalList->SetItem(1, 1, ToString(scene.GetElapsedTime())+"s");
    generalList->SetItem(2, 1, ToString(scene.objectsInstances.GetAllObjects().size()));
    generalList->SetItem(3, 1, ToString(scene.game->images.size()));
    generalList->SetItem(4, 1, ToString(scene.game->windowWidth)+"*"+ToString(scene.game->windowHeight));
    generalList->SetItem(5, 1, ToString(scene.input->GetMouseX())+";"+ToString(scene.input->GetMouseY()));
    generalList->SetItem(6, 1, ToString(scene.GetTimeFromStart())+"s");

    const vector < Variable > sceneVariables = scene.variables.GetVariablesVector();
    const vector < Variable > gameVariables = scene.game->variables.GetVariablesVector();

    //Suppression des lignes en trop pour les variables
    while(generalList->GetItemCount() >
            generalBaseItemCount + sceneVariables.size() + gameVariables.size()+2)
        generalList->DeleteItem(generalBaseItemCount);

    //Rajout si au contraire il n'y en a pas assez
    while(generalList->GetItemCount() < generalBaseItemCount + sceneVariables.size() + gameVariables.size()+2)
        generalList->InsertItem(generalBaseItemCount, "");

    //Update scene variables
    for (unsigned int i =0;i<sceneVariables.size();++i)
    {
        generalList->SetItem(generalBaseItemCount+i, 0, sceneVariables[i].GetName());
        generalList->SetItem(generalBaseItemCount+i, 1, sceneVariables[i].Gettexte());
        generalList->SetItemFont(generalBaseItemCount+i, *wxNORMAL_FONT);
    }

    //White space
    generalList->SetItem(generalBaseItemCount+sceneVariables.size(), 0, "");
    generalList->SetItem(generalBaseItemCount+sceneVariables.size(), 1, "");

    //Global variable title
    generalList->SetItem(generalBaseItemCount+sceneVariables.size()+1, 0, _("Variables globales"));
    generalList->SetItem(generalBaseItemCount+sceneVariables.size()+1, 1, "");
    generalList->SetItemFont(generalBaseItemCount+sceneVariables.size()+1, font);
    generalBaseAndVariablesItemCount = generalBaseItemCount+sceneVariables.size()+2;

    //Update global variables
    for (unsigned int i =0;i<gameVariables.size();++i)
    {
        generalList->SetItem(generalBaseAndVariablesItemCount+i, 0, gameVariables[i].GetName());
        generalList->SetItem(generalBaseAndVariablesItemCount+i, 1, gameVariables[i].Gettexte());
        generalList->SetItemFont(generalBaseAndVariablesItemCount+i, *wxNORMAL_FONT);
    }

    //Arbre des objets : Création des objets
    if ( mustRecreateTree )
    {
        objectsTree->DeleteAllItems();
        objectsTree->AddRoot(_("objets"));
        objectsInTree.clear();
        initialObjects.clear();
        mustRecreateTree = false;

        //Scene's objects
        for(unsigned int i = 0;i<scene.initialObjects.size();++i)
        {
            wxTreeItemId objectItem = objectsTree->AppendItem(objectsTree->GetRootItem(), scene.initialObjects[i]->GetName());
            initialObjects[scene.initialObjects[i]->GetName()] = objectItem;
        }
        //Globals objects
        for(unsigned int i = 0;i<scene.game->globalObjects.size();++i)
        {
            wxTreeItemId objectItem = objectsTree->AppendItem(objectsTree->GetRootItem(), scene.game->globalObjects[i]->GetName());
            initialObjects[scene.game->globalObjects[i]->GetName()] = objectItem;
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
            if ( objectsInTree[weakPtrToObject].first != allObjects[i]->GetName() )
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

    for(;objectsInTreeIter != objectsInTreeEnd;++objectsInTreeIter)
    {
        if ( (*objectsInTreeIter).first.expired() )
        {
            objectsTree->Delete((*objectsInTreeIter).second.second); //Suppression de l'arbre
            map < boost::weak_ptr<Object>, pair<string, wxTreeItemId> >::iterator temp = objectsInTreeIter;
            objectsInTreeIter--;
            objectsInTree.erase(temp); //Suppression de la map
        }
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

    const vector < Variable > objectVariables = object->variablesObjet.GetVariablesVector();
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
        objectList->SetItem(baseItemCount+i, 1, objectVariables[i].Gettexte());
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

    objectList->InsertItem(0, _("Général"));
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
    objectList->InsertItem(objectList->GetItemCount(), _("Spécifique"));
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
        string newValue = string(wxGetTextFromUser(_("Entrez la nouvelle valeur"), _("Edition d'une valeur"), oldValue).mb_str());

        if ( !object->Object::ChangeProperty(propNb, newValue) )
        {
            wxLogWarning(_("Impossible de modifier la valeur.\nLa valeur entrée peut être incorrecte, ou la propriété en lecture seule."));
        }
    }
    //A specific property
    else if ( event.GetIndex() < 1+object->Object::GetNumberOfProperties()
                                +2+object->GetNumberOfProperties()) //+2 for include the "Specific"
    {
        int propNb = event.GetIndex()-1-2-object->Object::GetNumberOfProperties();

        string uselessName, oldValue;
        object->GetPropertyForDebugger(propNb, uselessName, oldValue);
        string newValue = string(wxGetTextFromUser(_("Entrez la nouvelle valeur"), _("Edition d'une valeur"), oldValue).mb_str());

        if ( !object->ChangeProperty(propNb, newValue) )
        {
            wxLogWarning(_("Impossible de modifier la valeur.\nLa valeur entrée peut être incorrecte, ou la propriété en lecture seule."));
        }
    }
    else //Or a variable
    {
        const vector < Variable > objectVariables = object->variablesObjet.GetVariablesVector();
        int idVariable = event.GetIndex() - ( 1+object->Object::GetNumberOfProperties()
                                              +2+object->GetNumberOfProperties()
                                              +2);

        if ( idVariable >= 0 && idVariable < objectVariables.size() )
        {
            string newValue = string(wxGetTextFromUser(_("Entrez la nouvelle valeur"), _("Edition d'une variable"), objectVariables[idVariable].Gettexte()).mb_str());

            object->variablesObjet.ObtainVariable(objectVariables[idVariable].GetName()) = newValue;
        }
    }

}

/**
 * Edit scene/global variables
 */
void DebuggerGUI::OngeneralListItemActivated(wxListEvent& event)
{
    const vector < Variable > sceneVariables = scene.variables.GetVariablesVector();
    const vector < Variable > gameVariables = scene.game->variables.GetVariablesVector();

    if ( event.GetIndex() < (generalBaseItemCount + sceneVariables.size()))
    {
        int id = event.GetIndex() - ( generalBaseItemCount );
        if (id < 0 || id > sceneVariables.size())
            return;

        string newValue = string(wxGetTextFromUser(_("Entrez la nouvelle valeur"), _("Edition d'une valeur"), sceneVariables[id].Gettexte()).mb_str());
        scene.variables.ObtainVariable(sceneVariables[id].GetName()).Settexte(newValue);
    }
    else if ( event.GetIndex() < ( generalBaseAndVariablesItemCount + gameVariables.size()) )
    {
        int id = event.GetIndex() - ( generalBaseAndVariablesItemCount );
        if (id < 0 || id > gameVariables.size())
            return;

        string newValue = string(wxGetTextFromUser(_("Entrez la nouvelle valeur"), _("Edition d'une valeur"),gameVariables[id].Gettexte()).mb_str());
        scene.game->variables.ObtainVariable(gameVariables[id].GetName()).Settexte(newValue);
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
    string variableName = string(wxGetTextFromUser(_("Entrez le nom de la nouvelle variable"), _("Ajout d'une variable de la scène")).mb_str());

    if ( variableName == "" ) return;
    if ( scene.variables.HasVariable(variableName) )
    {
        wxLogMessage(_("Une variable avec ce nom existe déjà"));
        return;
    }

    string variableValue = string(wxGetTextFromUser(_("Entrez la valeur de la variable"), _("Ajout d'une variable de la scène")).mb_str());

    scene.variables.ObtainVariable(variableName) = variableValue;
}

/**
 * Add a global variable
 */
void DebuggerGUI::OnAddVarGlobalBtClick( wxCommandEvent & event )
{
    string variableName = string(wxGetTextFromUser(_("Entrez le nom de la nouvelle variable"), _("Ajout d'une variable globale")).mb_str());

    if ( variableName == "" ) return;
    if ( scene.game->variables.HasVariable(variableName) )
    {
        wxLogMessage(_("Une variable avec ce nom existe déjà"));
        return;
    }

    string variableValue = string(wxGetTextFromUser(_("Entrez la valeur de la variable"), _("Ajout d'une variable globale")).mb_str());

    scene.game->variables.ObtainVariable(variableName) = variableValue;
}

void DebuggerGUI::OnAddObjBtClick( wxCommandEvent & event )
{
    ChooseObject dialog( this, *scene.game, scene, false );
    if ( dialog.ShowModal() != 1 ) return;

    string objectWanted = dialog.objectChosen;
    int IDsceneObject = Picker::PickOneObject( &scene.initialObjects, objectWanted );
    int IDglobalObject = Picker::PickOneObject( &scene.game->globalObjects, objectWanted );

    ObjSPtr newObject = boost::shared_ptr<Object> ();

    //Creation of the object
    if ( IDsceneObject != -1)
        newObject = scene.initialObjects[IDsceneObject]->Clone();
    else if ( IDglobalObject != -1)
        newObject = scene.game->globalObjects[IDglobalObject]->Clone();
    else
    {
        wxLogWarning(_("Impossible de créer l'objet."));
        return;
    }

    //Initialisation
    newObject->errors = &scene.errors;

    int x = ToInt(string(wxGetTextFromUser(_("Entrez la position X de l'objet"), _("Ajout d'un objet")).mb_str()));
    int y = ToInt(string(wxGetTextFromUser(_("Entrez la position Y de l'objet"), _("Ajout d'un objet")).mb_str()));
    newObject->SetX( x );
    newObject->SetY( y );

    ChooseLayer layerDialog(this, scene.initialLayers, false);
    layerDialog.ShowModal();
    newObject->SetLayer( layerDialog.layerChosen );

    scene.objectsInstances.AddObject(newObject);

    return;
}
