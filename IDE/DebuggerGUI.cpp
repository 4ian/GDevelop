#include "DebuggerGUI.h"

//(*InternalHeaders(DebuggerGUI)
#include <wx/bitmap.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include <wx/toolbar.h>
#include <wx/image.h>
#include "StdAlgo.h"

#ifdef ___WXMSW___
#include <wx/msw/winundef.h>
#endif

#include "GDL/ExtensionsManager.h"
#include "GDL/Chercher.h"
#include "ChoixObjet.h"
#include "ConsoleManager.h"
#include "ChoixLayer.h"
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
    generalList->SetItem(0, 1, toString(1/scene.GetElapsedTime())+_(" i/s"));
    generalList->SetItem(1, 1, toString(scene.GetElapsedTime())+"s");
    generalList->SetItem(2, 1, toString(scene.objets.size()));
    generalList->SetItem(3, 1, toString(scene.game->images.size()));
    generalList->SetItem(4, 1, toString(scene.game->windowWidth)+"*"+toString(scene.game->windowHeight));
    generalList->SetItem(5, 1, toString(scene.input->GetMouseX())+";"+toString(scene.input->GetMouseY()));
    generalList->SetItem(6, 1, toString(scene.GetTimeFromStart())+"s");

    //Suppression des lignes en trop pour les variables
    while(generalList->GetItemCount() >
            generalBaseItemCount + scene.variables.variables.size() + scene.game->variables.variables.size()+2)
        generalList->DeleteItem(generalBaseItemCount);

    //Rajout si au contraire il n'y en a pas assez
    while(generalList->GetItemCount() < generalBaseItemCount + scene.variables.variables.size() + scene.game->variables.variables.size()+2)
        generalList->InsertItem(generalBaseItemCount, "");

    //Update scene variables
    for (unsigned int i =0;i<scene.variables.variables.size();++i)
    {
        generalList->SetItem(generalBaseItemCount+i, 0, scene.variables.variables[i].GetName());
        generalList->SetItem(generalBaseItemCount+i, 1, scene.variables.variables[i].Gettexte());
        generalList->SetItemFont(generalBaseItemCount+i, *wxNORMAL_FONT);
    }

    //White space
    generalList->SetItem(generalBaseItemCount+scene.variables.variables.size(), 0, "");
    generalList->SetItem(generalBaseItemCount+scene.variables.variables.size(), 1, "");

    //Global variable title
    generalList->SetItem(generalBaseItemCount+scene.variables.variables.size()+1, 0, _("Variables globales"));
    generalList->SetItem(generalBaseItemCount+scene.variables.variables.size()+1, 1, "");
    generalList->SetItemFont(generalBaseItemCount+scene.variables.variables.size()+1, font);
    generalBaseAndVariablesItemCount = generalBaseItemCount+scene.variables.variables.size()+2;

    //Update global variables
    for (unsigned int i =0;i<scene.game->variables.variables.size();++i)
    {
        generalList->SetItem(generalBaseAndVariablesItemCount+i, 0, scene.game->variables.variables[i].GetName());
        generalList->SetItem(generalBaseAndVariablesItemCount+i, 1, scene.game->variables.variables[i].Gettexte());
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
        for(unsigned int i = 0;i<scene.objetsInitiaux.size();++i)
        {
            wxTreeItemId objectItem = objectsTree->AppendItem(objectsTree->GetRootItem(), scene.objetsInitiaux[i]->GetName());
            initialObjects[scene.objetsInitiaux[i]->GetName()] = objectItem;
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
    for(unsigned int i = 0;i<scene.objets.size();++i)
    {
        //L'objet n'est pas dans l'arbre : on l'ajoute
        if ( objectsInTree.find(i) == objectsInTree.end() )
        {
            wxTreeItemId objectItem = objectsTree->AppendItem(initialObjects[scene.objets[i]->GetName()], toString(i));
            objectsInTree[i] = pair<string, wxTreeItemId>(scene.objets[i]->GetName(), objectItem);
        }
        else
        {
            //Si l'objet qui est dans l'arbre n'est pas le même, on le supprime et le reajoute au bon endroit
            if ( objectsInTree[i].first != scene.objets[i]->GetName() )
            {
                objectsTree->Delete(objectsInTree[i].second);
                wxTreeItemId objectItem = objectsTree->AppendItem(initialObjects[scene.objets[i]->GetName()], toString(i));
                objectsInTree[i] = pair<string, wxTreeItemId>(scene.objets[i]->GetName(), objectItem);
            }
        }
    }

    //Suppression des élements en trop
    map < int, pair<string, wxTreeItemId> >::iterator objectsInTreeIter = objectsInTree.begin();
    map < int, pair<string, wxTreeItemId> >::const_iterator objectsInTreeEnd = objectsInTree.end();

    for(;objectsInTreeIter != objectsInTreeEnd;++objectsInTreeIter)
    {
        if ( (*objectsInTreeIter).first < 0 || static_cast<unsigned>((*objectsInTreeIter).first) > scene.objets.size() )
        {
            objectsTree->Delete((*objectsInTreeIter).second.second); //Suppression de l'arbre
            map < int, pair<string, wxTreeItemId> >::iterator temp = objectsInTreeIter;
            objectsInTreeIter++;
            objectsInTree.erase(temp); //Suppression de la map
        }
    }


    //Objet selectionné
    if ( !objectsTree->GetSelection().IsOk() )
        return;

    int idObject = toInt(static_cast<string>(objectsTree->GetItemText( objectsTree->GetSelection() )));
    if ( idObject < 0 || static_cast<unsigned>(idObject) >= scene.objets.size() )
        return;

    objectName->SetLabel(scene.objets[idObject]->GetName());

    //Object selected has changed, recreate the enitre table.
    if ( objectChanged )
        RecreateListForObject(scene.objets[idObject]);

    string value, uselessName;
    unsigned int currentLine = 1; //We start a the second line, after "General"

    //Properties of base object
    for (unsigned int i = 0;i<scene.objets[idObject]->Object::GetNumberOfProperties();++i)
    {
        scene.objets[idObject]->Object::GetPropertyForDebugger(i, uselessName, value);
        objectList->SetItem(currentLine, 1, value);

        currentLine++;
    }

    currentLine += 2; //We have two lines to jump for "Specific"

    //Specific properties of object
    for (unsigned int i = 0;i<scene.objets[idObject]->GetNumberOfProperties();++i)
    {
        scene.objets[idObject]->GetPropertyForDebugger(i, uselessName, value);
        objectList->SetItem(currentLine, 1, value);

        currentLine++;
    }

    currentLine += 2; //We have two lines to jump for "Variables"

    //Suppression des lignes en trop pour les variables
    while(objectList->GetItemCount() > baseItemCount+scene.objets[idObject]->variablesObjet.variables.size())
        objectList->DeleteItem(baseItemCount+scene.objets[idObject]->variablesObjet.variables.size());

    //Rajout si au contraire il n'y en a pas assez
    while(objectList->GetItemCount() < baseItemCount+scene.objets[idObject]->variablesObjet.variables.size())
    {
        objectList->InsertItem(baseItemCount, "");
    }

    //Mise à jour des variables
    for (unsigned int i =0;i<scene.objets[idObject]->variablesObjet.variables.size();++i)
    {
        objectList->SetItem(baseItemCount+i, 0, scene.objets[idObject]->variablesObjet.variables[i].GetName());
        objectList->SetItem(baseItemCount+i, 1, scene.objets[idObject]->variablesObjet.variables[i].Gettexte());
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

    int idObject = toInt(static_cast<string>(objectsTree->GetItemText( objectsTree->GetSelection() )));
    if ( idObject < 0 || static_cast<unsigned>(idObject) >= scene.objets.size() )
        return;

    //Check if we are trying to modify a "general" property
    if ( event.GetIndex() < 1+scene.objets[idObject]->Object::GetNumberOfProperties()) //1+ for include the "General"
    {
        int propNb = event.GetIndex()-1;

        string uselessName, oldValue;
        scene.objets[idObject]->Object::GetPropertyForDebugger(propNb, uselessName, oldValue);
        string newValue = string(wxGetTextFromUser(_("Entrez la nouvelle valeur"), _("Edition d'une valeur"), oldValue).mb_str());

        if ( !scene.objets[idObject]->Object::ChangeProperty(propNb, newValue) )
        {
            wxLogWarning(_("Impossible de modifier la valeur.\nLa valeur entrée peut être incorrecte, ou la propriété en lecture seule."));
        }
    }
    //A specific property
    else if ( event.GetIndex() < 1+scene.objets[idObject]->Object::GetNumberOfProperties()
                                +2+scene.objets[idObject]->GetNumberOfProperties()) //+2 for include the "Specific"
    {
        int propNb = event.GetIndex()-1-2-scene.objets[idObject]->Object::GetNumberOfProperties();

        string uselessName, oldValue;
        scene.objets[idObject]->GetPropertyForDebugger(propNb, uselessName, oldValue);
        string newValue = string(wxGetTextFromUser(_("Entrez la nouvelle valeur"), _("Edition d'une valeur"), oldValue).mb_str());

        if ( !scene.objets[idObject]->ChangeProperty(propNb, newValue) )
        {
            wxLogWarning(_("Impossible de modifier la valeur.\nLa valeur entrée peut être incorrecte, ou la propriété en lecture seule."));
        }
    }
    else //Or a variable
    {
        int idVariable = event.GetIndex() - ( 1+scene.objets[idObject]->Object::GetNumberOfProperties()
                                              +2+scene.objets[idObject]->GetNumberOfProperties()
                                              +2);

        if ( idVariable >= 0 && idVariable < scene.objets[idObject]->variablesObjet.variables.size() )
        {
            string newValue = string(wxGetTextFromUser(_("Entrez la nouvelle valeur"), _("Edition d'une variable"), scene.objets[idObject]->variablesObjet.variables[idVariable].Gettexte()).mb_str());

            scene.objets[idObject]->variablesObjet.variables[idVariable] = newValue;
        }
    }

}

/**
 * Edit scene/global variables
 */
void DebuggerGUI::OngeneralListItemActivated(wxListEvent& event)
{
    if ( event.GetIndex() < (generalBaseItemCount + scene.variables.variables.size()))
    {
        int id = event.GetIndex() - ( generalBaseItemCount );
        if (id < 0 || id > scene.variables.variables.size())
            return;

        string newValue = string(wxGetTextFromUser(_("Entrez la nouvelle valeur"), _("Edition d'une valeur"), scene.variables.variables[id].Gettexte()).mb_str());
        scene.variables.variables[id].Settexte(newValue);
    }
    else if ( event.GetIndex() < ( generalBaseAndVariablesItemCount + scene.game->variables.variables.size()) )
    {
        int id = event.GetIndex() - ( generalBaseAndVariablesItemCount );
        if (id < 0 || id > scene.game->variables.variables.size())
            return;

        string newValue = string(wxGetTextFromUser(_("Entrez la nouvelle valeur"), _("Edition d'une valeur"),scene.game->variables.variables[id].Gettexte()).mb_str());
        scene.game->variables.variables[id].Settexte(newValue);
    }
}

/**
 * Delete the selected object
 */
void DebuggerGUI::OndeleteBtClick(wxCommandEvent& event)
{
    if ( !objectsTree->GetSelection().IsOk() )
        return;

    int idObject = toInt(static_cast<string>(objectsTree->GetItemText( objectsTree->GetSelection() )));
    if ( idObject < 0 || static_cast<unsigned>(idObject) >= scene.objets.size() )
        return;

    scene.objets[idObject]->SetName("");
}

/**
 * Add a scene variable
 */
void DebuggerGUI::OnAddVarSceneBtClick( wxCommandEvent & event )
{
    string variableName = string(wxGetTextFromUser(_("Entrez le nom de la nouvelle variable"), _("Ajout d'une variable de la scène")).mb_str());

    if ( variableName == "" ) return;

    if ( scene.variables.FindVariable(variableName) != -1)
    {
        wxLogMessage(_("Une variable avec ce nom existe déjà"));
        return;
    }

    string variableValue = string(wxGetTextFromUser(_("Entrez la valeur de la variable"), _("Ajout d'une variable de la scène")).mb_str());

    Variable variable(variableName);
    variable = variableValue;
    scene.variables.variables.push_back(variable);
}

/**
 * Add a global variable
 */
void DebuggerGUI::OnAddVarGlobalBtClick( wxCommandEvent & event )
{
    string variableName = string(wxGetTextFromUser(_("Entrez le nom de la nouvelle variable"), _("Ajout d'une variable globale")).mb_str());

    if ( variableName == "" ) return;

    if ( scene.game->variables.FindVariable(variableName) != -1)
    {
        wxLogMessage(_("Une variable avec ce nom existe déjà"));
        return;
    }

    string variableValue = string(wxGetTextFromUser(_("Entrez la valeur de la variable"), _("Ajout d'une variable globale")).mb_str());

    Variable variable(variableName);
    variable = variableValue;
    scene.game->variables.variables.push_back(variable);
}

void DebuggerGUI::OnAddObjBtClick( wxCommandEvent & event )
{
    ChoixObjet dialog( this, *scene.game, scene, false );
    if ( dialog.ShowModal() != 1 ) return;

    string objectWanted = dialog.NomObjet;
    int IDsceneObject = Picker::PickOneObject( &scene.objetsInitiaux, objectWanted );
    int IDglobalObject = Picker::PickOneObject( &scene.game->globalObjects, objectWanted );

    gdp::ExtensionsManager * extensionManager = gdp::ExtensionsManager::getInstance();

    //Creation of the object
    if ( IDsceneObject != -1)
        scene.objets.push_back( extensionManager->CreateObject(scene.objetsInitiaux[IDsceneObject]) );
    else if ( IDglobalObject != -1)
        scene.objets.push_back( extensionManager->CreateObject(scene.game->globalObjects[IDglobalObject]) );
    else
    {
        wxLogWarning(_("Impossible de créer l'objet."));
        return;
    }

    //Initialisation
    scene.objets.back()->errors = &scene.errors;

    int x = toInt(string(wxGetTextFromUser(_("Entrez la position X de l'objet"), _("Ajout d'un objet")).mb_str()));
    int y = toInt(string(wxGetTextFromUser(_("Entrez la position Y de l'objet"), _("Ajout d'un objet")).mb_str()));
    scene.objets.back()->SetX( x );
    scene.objets.back()->SetY( y );

    ChoixLayer layerDialog(this, scene.layers);
    layerDialog.ShowModal();
    scene.objets.back()->SetLayer( layerDialog.layerChosen );

    return;
}
