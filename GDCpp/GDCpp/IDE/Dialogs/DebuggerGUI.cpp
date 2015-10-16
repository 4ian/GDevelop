#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include "DebuggerGUI.h"

#include <wx/toolbar.h>
#include <wx/image.h>

#include <wx/textdlg.h>
#include "GDCore/Tools/Log.h"
#include <algorithm>
#include <string>
#include <set>
#include "GDCpp/CommonTools.h"
#include "GDCpp/ExtensionBase.h"
#include "GDCpp/Project.h"
#include "GDCpp/RuntimeGame.h"
#include "GDCpp/Object.h"
#include "GDCpp/ObjectHelpers.h"
#include "GDCpp/CppPlatform.h"
#include "GDCore/IDE/Dialogs/ChooseObjectDialog.h"
#include "GDCore/IDE/Dialogs/ChooseLayerDialog.h"
#include "GDCore/IDE/SkinHelper.h"
#include <SFML/Graphics.hpp>
#include "GDCore/Tools/Localization.h"

const long DebuggerGUI::ID_EXTLIST = wxNewId();

DebuggerGUI::DebuggerGUI(wxWindow* parent, RuntimeScene &scene_, std::function<void(bool)> playCallback_)
    : DebuggerGUIBase(parent),
      BaseDebugger(),
      scene(scene_),
      playCallback(playCallback_),
      mustRecreateTree(true),
      doUpdate(false),
      objectChanged(true)
{
    //Connect events
    Connect(ID_PLAY_TOOL,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&DebuggerGUI::OnPlayBtClick);
    Connect(ID_PAUSE_TOOL,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&DebuggerGUI::OnPauseBtClick);
    Connect(ID_STEP_TOOL,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&DebuggerGUI::OnStepBtClick);
    Connect(ID_ADD_OBJECT_TOOL,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&DebuggerGUI::OnAddObjBtClick);
    Connect(ID_ADD_VAR_TOOL,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&DebuggerGUI::OnAddVarSceneBtClick);
    Connect(ID_ADD_VARG_TOOL,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&DebuggerGUI::OnAddVarGlobalBtClick);
    Connect(ID_GENERAL_LIST_CTRL,wxEVT_COMMAND_LIST_ITEM_ACTIVATED,(wxObjectEventFunction)&DebuggerGUI::OngeneralListItemActivated);
    Connect(ID_OBJECTS_TREE_CTRL,wxEVT_COMMAND_TREE_SEL_CHANGED,(wxObjectEventFunction)&DebuggerGUI::OnobjectsTreeSelectionChanged);
    Connect(ID_DELETE_BT,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&DebuggerGUI::OndeleteBtClick);
    Connect(ID_OBJECT_LIST,wxEVT_COMMAND_LIST_ITEM_ACTIVATED,(wxObjectEventFunction)&DebuggerGUI::OnobjectListItemActivated);

    gd::SkinHelper::ApplyCurrentSkin(*m_toolbar);
    m_toolbar->Realize();

    font = *wxNORMAL_FONT;
    font.SetWeight(wxFONTWEIGHT_BOLD);

    //Apply some styles
    m_generalList->SetWindowStyleFlag(wxLC_REPORT);
    m_objectList->SetWindowStyleFlag(wxLC_REPORT|wxLC_EDIT_LABELS);

    m_generalList->InsertColumn(0, _("Property"));
    m_generalList->InsertColumn(1, _("Value"));
    m_generalList->SetColumnWidth(0, 225);
    m_generalList->SetColumnWidth(1, 165);

    m_generalList->InsertItem(0, _("Frame per seconds ( FPS )"));
    m_generalList->InsertItem(1, _("Time elapsed since the last image"));
    m_generalList->InsertItem(2, _("Number of objects"));
    m_generalList->InsertItem(3, _("Resources count"));
    m_generalList->InsertItem(4, _("Window's size"));
    m_generalList->InsertItem(5, _("Position of the mouse over the window"));
    m_generalList->InsertItem(6, _("Time elapsed since the beginning of the scene"));
    m_generalList->InsertItem(7, "");
    m_generalList->InsertItem(8, _("Scene variables"));
    m_generalList->SetItemFont(8, font);
    generalBaseItemCount = m_generalList->GetItemCount();

    m_objectList->InsertColumn(0, _("Property"));
    m_objectList->InsertColumn(1, _("Value"));
    m_objectList->SetColumnWidth(0, 175);
    m_objectList->SetColumnWidth(1, 100);

    m_objectsTree->AddRoot(_("Objects"));

    std::set<gd::String> alreadyCreatedPanels; //Just to be sure not to create a panel twice ( extensionsUsed can contains the same extension name twice )
    for (std::size_t i = 0;i<scene.game->GetUsedExtensions().size();++i)
    {
        std::shared_ptr<gd::PlatformExtension> gdExtension = CppPlatform::Get().GetExtension(scene.game->GetUsedExtensions()[i]);
        std::shared_ptr<ExtensionBase> extension = std::dynamic_pointer_cast<ExtensionBase>(gdExtension);

        if ( extension != std::shared_ptr<ExtensionBase>() && extension->HasDebuggingProperties() && alreadyCreatedPanels.find(extension->GetName()) == alreadyCreatedPanels.end())
        {
            alreadyCreatedPanels.insert(extension->GetName());
            wxPanel * extPanel = new wxPanel(m_notebook, wxID_ANY, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, extension->GetName());
            wxFlexGridSizer * sizer = new wxFlexGridSizer(0, 3, 0, 0);
            sizer->AddGrowableCol(0);
            sizer->AddGrowableRow(0);
            wxListCtrl * extList = new wxListCtrl(extPanel, ID_EXTLIST, wxDefaultPosition, wxSize(249,203), wxLC_REPORT, wxDefaultValidator, extension->GetName());
            sizer->Add(extList, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
            extPanel->SetSizer(sizer);
            sizer->Fit(extPanel);
            sizer->SetSizeHints(extPanel);

            extList->InsertColumn(0, _("Property"));
            extList->InsertColumn(1, _("Value"));
            extList->SetColumnWidth(0, 175);
            extList->SetColumnWidth(1, 100);

            m_notebook->AddPage(extPanel, extension->GetFullName(), false);
            extensionsListCtrls.push_back(extList);
        }
    }
}

void DebuggerGUI::OnPlayBtClick(wxCommandEvent& event)
{
    if (playCallback) playCallback(true);
}
void DebuggerGUI::OnPauseBtClick(wxCommandEvent& event)
{
    if (playCallback) playCallback(false);
}
void DebuggerGUI::OnStepBtClick(wxCommandEvent& event)
{
    scene.RenderAndStep();
    if (playCallback) playCallback(false);
}

void DebuggerGUI::Pause()
{
    doUpdate = false;
    mustRecreateTree = true;
    m_toolbar->Enable(false);
    m_deleteBt->Enable(false);
}

void DebuggerGUI::Play()
{
    doUpdate = true;
    mustRecreateTree = true;
    m_toolbar->Enable(true);
    m_deleteBt->Enable(true);
}

void DebuggerGUI::UpdateGUI()
{
    if ( !doUpdate || !IsShown())
        return;

    //General tab
    m_generalList->SetItem(0, 1, gd::String::From(1000000.0/static_cast<double>(scene.GetTimeManager().GetElapsedTime()))+_(" fps"));
    m_generalList->SetItem(1, 1, gd::String::From(static_cast<double>(scene.GetTimeManager().GetElapsedTime())/1000.0)+"ms");
    m_generalList->SetItem(2, 1, gd::String::From(scene.objectsInstances.GetAllObjects().size()));
    //TODO //m_generalList->SetItem(3, 1, gd::String::From(scene.game->resourcesManager.resources.size()));
    m_generalList->SetItem(4, 1, gd::String::From(scene.game->GetMainWindowDefaultWidth())+"*"+gd::String::From(scene.game->GetMainWindowDefaultHeight()));
    m_generalList->SetItem(5, 1, gd::String::From(scene.GetInputManager().GetMousePosition().x)+";"+gd::String::From(scene.GetInputManager().GetMousePosition().y));
    m_generalList->SetItem(6, 1, gd::String::From(static_cast<double>(scene.GetTimeManager().GetTimeFromStart())/1000000.0)+"s");

    //Suppression des lignes en trop pour les variables
    while(static_cast<std::size_t>(m_generalList->GetItemCount()) > generalBaseItemCount + scene.GetVariables().Count() + scene.game->GetVariables().Count()+2)
        m_generalList->DeleteItem(generalBaseItemCount);

    //Rajout si au contraire il n'y en a pas assez
    while(static_cast<std::size_t>(m_generalList->GetItemCount()) < generalBaseItemCount + scene.GetVariables().Count() + scene.game->GetVariables().Count()+2)
        m_generalList->InsertItem(generalBaseItemCount, "");

    //Update scene variables
    std::size_t i = 0;
    const std::map < gd::String, gd::Variable* > & sceneVariables = scene.GetVariables().DumpAllVariables();
    for (std::map < gd::String, gd::Variable* >::const_iterator it = sceneVariables.begin();
        it!=sceneVariables.end();++it, ++i)
    {
        m_generalList->SetItem(generalBaseItemCount+i, 0, it->first);
        m_generalList->SetItem(generalBaseItemCount+i, 1, it->second->IsStructure() ? _("(Structure)") : it->second->GetString());
        m_generalList->SetItemFont(generalBaseItemCount+i, *wxNORMAL_FONT);
    }

    //White space
    m_generalList->SetItem(generalBaseItemCount+scene.GetVariables().Count(), 0, "");
    m_generalList->SetItem(generalBaseItemCount+scene.GetVariables().Count(), 1, "");

    //Global variable title
    m_generalList->SetItem(generalBaseItemCount+scene.GetVariables().Count()+1, 0, _("Globals variables"));
    m_generalList->SetItem(generalBaseItemCount+scene.GetVariables().Count()+1, 1, "");
    m_generalList->SetItemFont(generalBaseItemCount+scene.GetVariables().Count()+1, font);
    generalBaseAndVariablesItemCount = generalBaseItemCount+scene.GetVariables().Count()+2;

    //Update global variables
    i = 0;
    const std::map < gd::String, gd::Variable* > & gameVariables = scene.game->GetVariables().DumpAllVariables();
    for (std::map < gd::String, gd::Variable* >::const_iterator it = gameVariables.begin();
        it!=gameVariables.end();++it, ++i)
    {
        m_generalList->SetItem(generalBaseAndVariablesItemCount+i, 0, it->first);
        m_generalList->SetItem(generalBaseAndVariablesItemCount+i, 1, it->second->IsStructure() ? _("(Structure)") : it->second->GetString());
        m_generalList->SetItemFont(generalBaseAndVariablesItemCount+i, *wxNORMAL_FONT);
    }

    //Extensions tab
    std::size_t extListCtrlId = 0;
    for (std::size_t i = 0;i<scene.game->GetUsedExtensions().size();++i)
    {
        std::shared_ptr<gd::PlatformExtension> gdExtension = CppPlatform::Get().GetExtension(scene.game->GetUsedExtensions()[i]);
        std::shared_ptr<ExtensionBase> extension = std::dynamic_pointer_cast<ExtensionBase>(gdExtension);

        if ( extension != std::shared_ptr<ExtensionBase>() && extension->HasDebuggingProperties() && extListCtrlId < extensionsListCtrls.size() )
        {
            //Update items count
            while(static_cast<std::size_t>(extensionsListCtrls[extListCtrlId]->GetItemCount()) > extension->GetNumberOfProperties(scene))
                extensionsListCtrls[extListCtrlId]->DeleteItem(0);
            while(static_cast<std::size_t>(extensionsListCtrls[extListCtrlId]->GetItemCount()) < extension->GetNumberOfProperties(scene))
                extensionsListCtrls[extListCtrlId]->InsertItem(0, "");

            //Update properties
            for (std::size_t propertyNb = 0;propertyNb<extension->GetNumberOfProperties(scene);++propertyNb)
            {
                gd::String name, value;
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
        m_objectsTree->DeleteAllItems();
        m_objectsTree->AddRoot(_("objects"));
        objectsInTree.clear();
        initialObjects.clear();
        mustRecreateTree = false;

        //Scene's objects
        for(std::size_t i = 0;i<scene.GetObjects().size();++i)
        {
            wxTreeItemId objectItem = m_objectsTree->AppendItem(m_objectsTree->GetRootItem(), scene.GetObjects()[i]->GetName());
            initialObjects[scene.GetObjects()[i]->GetName()] = objectItem;
        }
        //Globals objects
        for(std::size_t i = 0;i<scene.game->GetObjects().size();++i)
        {
            wxTreeItemId objectItem = m_objectsTree->AppendItem(m_objectsTree->GetRootItem(), scene.game->GetObjects()[i]->GetName());
            initialObjects[scene.game->GetObjects()[i]->GetName()] = objectItem;
        }

        m_objectsTree->ExpandAll();
    }

    //Ajout des objets
    RuntimeObjList allObjects = scene.objectsInstances.GetAllObjects();
    for(std::size_t i = 0;i<allObjects.size();++i)
    {
        std::weak_ptr<RuntimeObject> weakPtrToObject = allObjects[i];

        //L'objet n'est pas dans l'arbre : on l'ajoute
        if ( objectsInTree.find(weakPtrToObject) == objectsInTree.end() )
        {
            char str[24];
            snprintf(str, 24, "%p", allObjects[i].get());

            wxTreeItemId objectItem = m_objectsTree->AppendItem(initialObjects[allObjects[i]->GetName()], str);
            objectsInTree[weakPtrToObject] = std::pair<gd::String, wxTreeItemId>(allObjects[i]->GetName(), objectItem);
        }
        else
        {
            //Si l'objet qui est dans l'arbre n'est pas le même, on le supprime et le reajoute au bon endroit
            if ( objectsInTree[weakPtrToObject].first != allObjects[i]->GetName() && initialObjects.find(allObjects[i]->GetName()) != initialObjects.end() )
            {
                m_objectsTree->Delete(objectsInTree[weakPtrToObject].second);
                wxTreeItemId objectItem = m_objectsTree->AppendItem(initialObjects[allObjects[i]->GetName()], gd::String::From(i));
                objectsInTree[weakPtrToObject] = std::pair<gd::String, wxTreeItemId>(allObjects[i]->GetName(), objectItem);
            }
        }
    }

    //Suppression des éléments en trop
    std::map < std::weak_ptr<RuntimeObject>, std::pair<gd::String, wxTreeItemId> >::iterator objectsInTreeIter = objectsInTree.begin();
    std::map < std::weak_ptr<RuntimeObject>, std::pair<gd::String, wxTreeItemId> >::const_iterator objectsInTreeEnd = objectsInTree.end();

    while(objectsInTreeIter != objectsInTreeEnd)
    {
        if ( (*objectsInTreeIter).first.expired() )
        {
            m_objectsTree->Delete((*objectsInTreeIter).second.second); //Delete from the tree
            objectsInTree.erase(objectsInTreeIter++); //Post increment is important. It increment the iterator and then return the *original* iterator.
            //( Erasing an value does not invalidate any iterator except the deleted one )
        }
        else
            ++objectsInTreeIter;
    }

    //Obtain the shared_ptr to the selected object
    if ( !m_objectsTree->GetSelection().IsOk() )
        return;

    RuntimeObjSPtr object = std::shared_ptr<RuntimeObject>();
    std::map < std::weak_ptr<RuntimeObject>, std::pair<gd::String, wxTreeItemId> >::const_iterator end = objectsInTree.end();
    for (std::map < std::weak_ptr<RuntimeObject>, std::pair<gd::String, wxTreeItemId> >::iterator i = objectsInTree.begin();i != end;++i)
    {
        if ( i->second.second == m_objectsTree->GetSelection() && !i->first.expired())
        {
            object = i->first.lock();
            continue;
        }
    }

    if ( object == std::shared_ptr<RuntimeObject>() )
        return;

    m_objectName->SetLabel(object->GetName());

    //Object selected has changed, recreate the enitre table.
    if ( objectChanged )
        RecreateListForObject(object);

    gd::String value, uselessName;
    std::size_t currentLine = 1; //We start a the second line, after "General"

    //Properties of base object
    for (std::size_t i = 0;i<object->RuntimeObject::GetNumberOfProperties();++i)
    {
        object->RuntimeObject::GetPropertyForDebugger(i, uselessName, value);
        m_objectList->SetItem(currentLine, 1, value);

        currentLine++;
    }

    currentLine += 2; //We have two lines to jump for "Specific"

    //Specific properties of object
    for (std::size_t i = 0;i<object->GetNumberOfProperties();++i)
    {
        object->GetPropertyForDebugger(i, uselessName, value);
        m_objectList->SetItem(currentLine, 1, value);

        currentLine++;
    }

    currentLine += 2; //We have two lines to jump for "Variables"

    i = 0;
    const std::map < gd::String, gd::Variable* > & objectVariables = object->GetVariables().DumpAllVariables();

    //Suppression des lignes en trop pour les variables
    while(m_objectList->GetItemCount() > baseItemCount+objectVariables.size())
        m_objectList->DeleteItem(baseItemCount+objectVariables.size());

    //Rajout si au contraire il n'y en a pas assez
    while(m_objectList->GetItemCount() < baseItemCount+objectVariables.size())
    {
        m_objectList->InsertItem(baseItemCount, "");
    }

    //Mise à jour des variables
    for (std::map < gd::String, gd::Variable* >::const_iterator it = objectVariables.begin();
        it!=objectVariables.end();++it, ++i)
    {
        m_objectList->SetItem(baseItemCount+i, 0, it->first);
        m_objectList->SetItem(baseItemCount+i, 1, it->second->IsStructure() ? _("(Structure)") : it->second->GetString());
    }
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
    if ( !m_objectsTree->GetSelection().IsOk() )
        return;

    //Obtain the shared_ptr to the object
    RuntimeObjSPtr object = std::shared_ptr<RuntimeObject>();
    std::map < std::weak_ptr<RuntimeObject>, std::pair<gd::String, wxTreeItemId> >::const_iterator end = objectsInTree.end();
    for (std::map < std::weak_ptr<RuntimeObject>, std::pair<gd::String, wxTreeItemId> >::iterator i = objectsInTree.begin();i != end;++i)
    {
        if ( i->second.second == m_objectsTree->GetSelection() && !i->first.expired())
        {
            object = i->first.lock();
            continue;
        }
    }

    if ( object == std::shared_ptr<RuntimeObject>() )
        return;

    //Check if we are trying to modify a "general" property
    if ( event.GetIndex() < 1+object->RuntimeObject::GetNumberOfProperties()) //1+ for include the "General"
    {
        int propNb = event.GetIndex()-1;

        gd::String uselessName, oldValue;
        object->RuntimeObject::GetPropertyForDebugger(propNb, uselessName, oldValue);
        gd::String newValue = wxGetTextFromUser(_("Enter the new value"), _("Editing a value"), oldValue);

        if ( !object->RuntimeObject::ChangeProperty(propNb, newValue) )
        {
            gd::LogWarning(_("Unable to modify the value.\nThe value entered is either incorrect or the property is read-only."));
        }
    }
    //A specific property
    else if ( event.GetIndex() < 1+object->RuntimeObject::GetNumberOfProperties()
                                +2+object->GetNumberOfProperties()) //+2 for include the "Specific"
    {
        int propNb = event.GetIndex()-1-2-object->RuntimeObject::GetNumberOfProperties();

        gd::String uselessName, oldValue;
        object->GetPropertyForDebugger(propNb, uselessName, oldValue);
        gd::String newValue = wxGetTextFromUser(_("Enter the new value"), _("Editing a value"), oldValue);

        if ( !object->ChangeProperty(propNb, newValue) )
        {
            gd::LogWarning(_("Unable to modify the value.\nThe value entered is either incorrect or the property is read-only."));
        }
    }
    else //Or a variable
    {
        gd::String name = m_objectList->GetItemText(event.GetIndex());

        gd::String newValue = wxGetTextFromUser(_("Enter the new value"),
                                                _("Editing a variable"),
                                                object->GetVariables().Get(name).GetString());
        object->GetVariables().Get(name).SetString(newValue);
    }
}

/**
 * Edit scene/global variables
 */
void DebuggerGUI::OngeneralListItemActivated(wxListEvent& event)
{
    if ( event.GetIndex() < (generalBaseItemCount + scene.GetVariables().Count()))
    {
        gd::String name = m_generalList->GetItemText(event.GetIndex());

        gd::String newValue = wxGetTextFromUser(_("Enter the new value"),
                                                _("Editing a value"),
                                                scene.GetVariables().Get(name).GetString());
        scene.GetVariables().Get(name).SetString(newValue);
    }
    else if ( event.GetIndex() < ( generalBaseAndVariablesItemCount + scene.game->GetVariables().Count()) )
    {
        gd::String name = m_generalList->GetItemText(event.GetIndex());

        gd::String newValue = wxGetTextFromUser(_("Enter the new value"),
                                                _("Editing a value"),
                                                scene.game->GetVariables().Get(name).GetString());
        scene.game->GetVariables().Get(name).SetString(newValue);
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
        std::cout << "Received an event for a bad Extension wxListCtrl in debugger." << std::endl;
        return;
    }

    std::shared_ptr<gd::PlatformExtension> gdExtension = CppPlatform::Get().GetExtension(gd::String(list->GetName()));
    std::shared_ptr<ExtensionBase> extension = std::dynamic_pointer_cast<ExtensionBase>(gdExtension);

    if ( extension == std::shared_ptr<ExtensionBase>() )
    {
        std::cout << "Unknown extension in debugger ( " << list->GetName() << " )" << std::endl;
        return;
    }

    int propNb = event.GetIndex();
    gd::String uselessName, oldValue;
    extension->GetPropertyForDebugger(scene, propNb, uselessName, oldValue);
    gd::String newValue = wxGetTextFromUser(_("Enter the new value"), _("Editing a value"), oldValue);

    if ( !extension->ChangeProperty(scene, propNb, newValue) )
    {
        gd::LogWarning(_("Unable to modify the value.\nThe value entered is either incorrect or the property is read-only."));
    }
}

void DebuggerGUI::UpdateListCtrlColumnsWidth()
{
    m_generalList->SetColumnWidth(1, m_generalList->GetSize().GetWidth()-m_generalList->GetColumnWidth(0)-15);
    m_objectList->SetColumnWidth(1, m_objectList->GetSize().GetWidth()-m_objectList->GetColumnWidth(0)-15);
    for (std::size_t i = 0;i<extensionsListCtrls.size();++i)
        extensionsListCtrls[i]->SetColumnWidth(1, extensionsListCtrls[i]->GetSize().GetWidth()-extensionsListCtrls[i]->GetColumnWidth(0)-15);
}

/**
 * Create the list of properties for an object
 */
void DebuggerGUI::RecreateListForObject(const RuntimeObjSPtr & object)
{
    m_objectList->DeleteAllItems();
    std::size_t currentLine = 0;
    gd::String name, uselessValue;

    m_objectList->InsertItem(0, _("General"));
    m_objectList->SetItemFont(0, font);
    currentLine++;

    //Create base properties.
    for (std::size_t i = 0;i<object->RuntimeObject::GetNumberOfProperties();++i)
    {
        object->RuntimeObject::GetPropertyForDebugger(i, name, uselessValue);
        m_objectList->InsertItem(currentLine, name);

        currentLine++;
    }

    m_objectList->InsertItem(m_objectList->GetItemCount(), "");
    m_objectList->InsertItem(m_objectList->GetItemCount(), _("Specific"));
    m_objectList->SetItemFont(m_objectList->GetItemCount()-1, font);
    currentLine += 2;

    //Create object specific properties.
    for (std::size_t i = 0;i<object->GetNumberOfProperties();++i)
    {
        object->GetPropertyForDebugger(i, name, uselessValue);
        m_objectList->InsertItem(currentLine, name);

        currentLine++;
    }

    m_objectList->InsertItem(m_objectList->GetItemCount(), "");
    m_objectList->InsertItem(m_objectList->GetItemCount(), _("Variables"));
    m_objectList->SetItemFont(m_objectList->GetItemCount()-1, font);

    //On retient combien il y a d'item de base pour savoir où commencer
    //pour ajouter les variables.
    baseItemCount = m_objectList->GetItemCount();

    objectChanged = false;
}

/**
 * Delete the selected object
 */
void DebuggerGUI::OndeleteBtClick(wxCommandEvent& event)
{
    if ( !m_objectsTree->GetSelection().IsOk() )
        return;

    //Obtain the shared_ptr to the object
    RuntimeObjSPtr object = std::shared_ptr<RuntimeObject>();
    std::map < std::weak_ptr<RuntimeObject>, std::pair<gd::String, wxTreeItemId> >::const_iterator end = objectsInTree.end();
    for (std::map < std::weak_ptr<RuntimeObject>, std::pair<gd::String, wxTreeItemId> >::iterator i = objectsInTree.begin();i != end;++i)
    {
        if ( i->second.second == m_objectsTree->GetSelection() && !i->first.expired())
        {
            object = i->first.lock();
            continue;
        }
    }

    if ( object != std::shared_ptr<RuntimeObject>() ) object->DeleteFromScene(scene);
}

/**
 * Add a scene variable
 */
void DebuggerGUI::OnAddVarSceneBtClick( wxCommandEvent & event )
{
    gd::String variableName = wxGetTextFromUser(_("Type the name of the new variable"), _("Adding a scene variable"));

    if ( variableName == "" ) return;
    if ( scene.GetVariables().Has(variableName) )
    {
        gd::LogMessage(_("A variable with this name already exists!"));
        return;
    }

    gd::String variableValue = wxGetTextFromUser(_("Enter the value of the variable"), _("Adding a scene variable"));

    scene.GetVariables().Get(variableName).SetString(variableValue);
}

/**
 * Add a global variable
 */
void DebuggerGUI::OnAddVarGlobalBtClick( wxCommandEvent & event )
{
    gd::String variableName = wxGetTextFromUser(_("Type the name of the new variable"), _("Adding a global variable"));

    if ( variableName == "" ) return;
    if ( scene.game->GetVariables().Has(variableName) )
    {
        gd::LogMessage(_("A variable with this name already exists!"));
        return;
    }

    gd::String variableValue = wxGetTextFromUser(_("Enter the value of the variable"), _("Adding a global variable"));

    scene.game->GetVariables().Get(variableName).SetString(variableValue);
}

void DebuggerGUI::OnAddObjBtClick( wxCommandEvent & event )
{
    gd::ChooseObjectDialog dialog( this, *scene.game, scene, false );
    if ( dialog.ShowModal() != 1 ) return;

    gd::String objectWanted = dialog.GetChosenObject();
    std::vector<ObjSPtr>::iterator sceneObject = std::find_if(scene.GetObjects().begin(), scene.GetObjects().end(), std::bind2nd(ObjectHasName(), objectWanted));
    std::vector<ObjSPtr>::iterator globalObject = std::find_if(scene.game->GetObjects().begin(), scene.game->GetObjects().end(), std::bind2nd(ObjectHasName(), objectWanted));

    RuntimeObjSPtr newObject = std::shared_ptr<RuntimeObject> ();

    //Creation of the object
    if ( sceneObject != scene.GetObjects().end() ) //We check first scene's objects' list.
        newObject = CppPlatform::Get().CreateRuntimeObject(scene, **sceneObject);
    else if ( globalObject != scene.game->GetObjects().end() ) //Then the global object list
        newObject = CppPlatform::Get().CreateRuntimeObject(scene, **globalObject);

    if ( newObject == std::shared_ptr<RuntimeObject> () )
    {
        gd::LogWarning(_("Unable to create object."));
        return;
    }

    int x = gd::String(wxGetTextFromUser(_("Enter the X position of the object"), _("Adding an object"))).To<int>();
    int y = gd::String(wxGetTextFromUser(_("Enter the object's Y position"), _("Adding an object"))).To<int>();
    newObject->SetX( x );
    newObject->SetY( y );

    gd::ChooseLayerDialog layerDialog(this, scene, false);
    layerDialog.ShowModal();
    newObject->SetLayer( layerDialog.GetChosenLayer() );

    scene.objectsInstances.AddObject(newObject);

    return;
}

#endif
