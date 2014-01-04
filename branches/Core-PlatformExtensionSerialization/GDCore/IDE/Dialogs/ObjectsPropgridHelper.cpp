/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */
#include "ObjectsPropgridHelper.h"
#include "GDCore/IDE/Dialogs/ChooseVariableDialog.h"
#include "GDCore/IDE/Dialogs/PropgridPropertyDescriptor.h"
#include "GDCore/IDE/Dialogs/ChooseAutomatismTypeDialog.h"
#include "GDCore/IDE/EventsRefactorer.h"
#include "GDCore/PlatformDefinition/Object.h"
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/PlatformDefinition/Layout.h"
#include "GDCore/PlatformDefinition/Platform.h"
#include "GDCore/PlatformDefinition/Automatism.h"
#include "GDCore/PlatformDefinition/PlatformExtension.h"
#include "GDCore/CommonTools.h"
#include <wx/propgrid/propgrid.h>
#include <wx/richtooltip.h>
#include <wx/settings.h>
#include <wx/choicdlg.h>
#include <wx/textdlg.h>

namespace gd
{

void ObjectsPropgridHelper::RefreshFrom(const gd::Object * object, bool displayedAfterInstanceProperties)
{
    if ( grid == NULL ) return;
    if ( !object ) return;

    if ( !displayedAfterInstanceProperties ) grid->Clear();

    //Update the grid
    if ( !displayedAfterInstanceProperties )
        grid->Append( new wxPropertyCategory(_("General")) );
    else
        grid->Append( new wxPropertyCategory(_("General object properties")) );

    grid->EnableProperty(grid->Append( new wxStringProperty(_("Object name"), wxPG_LABEL, object->GetName())), false);
    grid->Append( new wxStringProperty(_("Edit"), wxPG_LABEL, _("Click to edit...")) );
    grid->SetPropertyCell(_("Edit"), 1, _("Click to edit..."), wxNullBitmap, wxSystemSettings::GetColour(wxSYS_COLOUR_HOTLIGHT));
    grid->SetPropertyReadOnly(_("Edit"));

    if ( !displayedAfterInstanceProperties )
    {
        grid->Append( new wxPropertyCategory(_("Object variables") + " (" + gd::ToString(object->GetVariables().Count()) + ")", "OBJECT_VARIABLES_CATEGORY" ) );
        grid->Append( new wxStringProperty(_("Variables"), wxPG_LABEL, _("Click to edit...")) );
        grid->SetPropertyCell(_("Variables"), 1, _("Click to edit..."), wxNullBitmap, wxSystemSettings::GetColour(wxSYS_COLOUR_HOTLIGHT));
        grid->SetPropertyReadOnly(_("Variables"));
    }

    grid->Append( new wxPropertyCategory(_("Automatisms") + " (" + gd::ToString(object->GetAllAutomatisms().size()) + ")" , "AUTO") );
    grid->Append( new wxStringProperty(_("Add automatism"), "AUTO_ADD", _("Add...")) );
    grid->SetPropertyCell("AUTO_ADD", 1, _("Add..."), wxNullBitmap, wxSystemSettings::GetColour(wxSYS_COLOUR_HOTLIGHT));
    grid->SetPropertyReadOnly("AUTO_ADD");

    std::vector<std::string> automatisms = object->GetAllAutomatismNames();
    if ( !automatisms.empty() ) {
        grid->AppendIn("AUTO", new wxStringProperty("", "AUTO_REMOVE", _("Remove...")) );
        grid->SetPropertyCell("AUTO_REMOVE", 1, _("Remove..."), wxNullBitmap, wxSystemSettings::GetColour(wxSYS_COLOUR_HOTLIGHT));
        grid->SetPropertyReadOnly("AUTO_REMOVE");
    }

    for (unsigned int i = 0;i<automatisms.size();++i)
    {
        const gd::Automatism & automatism = object->GetAutomatism(automatisms[i]);
        std::map<std::string, gd::PropgridPropertyDescriptor> properties = automatism.GetProperties(project);

        grid->AppendIn( "AUTO", new wxPropertyCategory(gd::ToString(automatism.GetName())) );
        if ( properties.empty() || properties.find("PLEASE_ALSO_SHOW_EDIT_BUTTON_THANKS") != properties.end() )
        {
            //"Click to edit" is not shown if properties are not empty, except if the magic property is set.
            grid->Append( new wxStringProperty(_("Edition"), wxString("AUTO:"+automatisms[i]), _("Click to edit...")) );
            grid->SetPropertyCell(wxString("AUTO:"+automatisms[i]), 1, _("Click to edit..."), wxNullBitmap, wxSystemSettings::GetColour(wxSYS_COLOUR_HOTLIGHT));
            grid->SetPropertyReadOnly(wxString("AUTO:"+automatisms[i]));
        }
        grid->Append( new wxStringProperty("", "AUTO_RENAME:"+automatisms[i], _("Rename...")) );
        grid->SetPropertyCell(wxString("AUTO_RENAME:"+automatisms[i]), 1, _("Rename..."), wxNullBitmap, wxSystemSettings::GetColour(wxSYS_COLOUR_HOTLIGHT));
        grid->SetPropertyReadOnly(wxString("AUTO_RENAME:"+automatisms[i]));

        //Add automatism custom properties
        for (std::map<std::string, gd::PropgridPropertyDescriptor>::iterator it = properties.begin();
            it != properties.end();++it)
        {
            if ( (*it).first == "PLEASE_ALSO_SHOW_EDIT_BUTTON_THANKS" ) continue; //Skip the magic property.

            std::string type = (*it).second.GetType();
            std::string value = (*it).second.GetValue();
            std::string name = (*it).first;
            if ( type == "Choice" )
            {
                const std::vector<std::string> & choices = (*it).second.GetExtraInfo();
                wxArrayString choicesArray;
                for (unsigned int j = 0; j < choices.size(); ++j)
                    choicesArray.push_back(choices[j]);

                wxEnumProperty * prop = new wxEnumProperty(name, "AUTO_PROP:"+automatisms[i], choicesArray);
                prop->SetChoiceSelection(choicesArray.Index(value));
                grid->Append(prop);
            }
            else if ( type == "Boolean" )
            {
                grid->Append(new wxBoolProperty(name, "AUTO_PROP:"+automatisms[i], value == "true"));
            }
            else
                grid->Append(new wxStringProperty(name, "AUTO_PROP:"+automatisms[i], value));
        }

    }


    grid->SetPropertyAttributeAll(wxPG_BOOL_USE_CHECKBOX, true);
}

bool ObjectsPropgridHelper::OnPropertySelected(gd::Object * object, gd::Layout * layout, wxPropertyGridEvent& event)
{
    if ( !grid || !object ) return false;

    //Check if the object is global
    bool globalObject = false;
    for (unsigned int i = 0;i<project.GetObjectsCount();++i)
    {
        if ( &project.GetObject(i) == object )
        {
            globalObject = true;
            break;
        }
    }

    if ( event.GetColumn() == 1) //Manage button-like properties
    {
        if ( event.GetPropertyName() == _("Edit") )
        {
            object->EditObject(grid, project, mainFrameWrapper);
            for ( unsigned int j = 0; j < project.GetUsedPlatforms().size();++j)
                project.GetUsedPlatforms()[j]->GetChangesNotifier().OnObjectEdited(project, globalObject ? NULL : layout, *object);

            //Reload resources : Do not forget to switch the working directory.
            wxString oldWorkingDir = wxGetCwd();
            if ( wxDirExists(wxFileName::FileName(project.GetProjectFile()).GetPath()))
                wxSetWorkingDirectory(wxFileName::FileName(project.GetProjectFile()).GetPath());

            if (layout) object->LoadResources(project, *layout);

            wxSetWorkingDirectory(oldWorkingDir);
        }
        else if ( event.GetPropertyName() == _("Variables") )
        {
            gd::ChooseVariableDialog dialog(grid, object->GetVariables(), true);
            if ( dialog.ShowModal() == 1 )
            {
                for ( unsigned int j = 0; j < project.GetUsedPlatforms().size();++j)
                    project.GetUsedPlatforms()[j]->GetChangesNotifier().OnObjectVariablesChanged(project, globalObject ? NULL : layout, *object);

                //Update the grid:
                if ( grid->GetProperty("OBJECT_VARIABLES_CATEGORY") != NULL)
                    grid->SetPropertyLabel("OBJECT_VARIABLES_CATEGORY", 
                        _("Object variables") + " (" + gd::ToString(object->GetVariables().Count()) + ")");
            }
        }
        else if ( event.GetPropertyName() == "AUTO_ADD" )
        {
            gd::ChooseAutomatismTypeDialog dialog(grid, project);
            if ( dialog.ShowModal() == 1)
            {
                //Find automatism metadata
                boost::shared_ptr<gd::PlatformExtension> extension = boost::shared_ptr<gd::PlatformExtension> ();
                std::vector < boost::shared_ptr<gd::PlatformExtension> > extensions = project.GetCurrentPlatform().GetAllPlatformExtensions();
                for (unsigned int i = 0;i<extensions.size();++i)
                {
                    std::vector<std::string> automatismsTypes = extensions[i]->GetAutomatismsTypes();
                    if ( find(automatismsTypes.begin(), automatismsTypes.end(), dialog.GetSelectedAutomatismType()) != automatismsTypes.end() )
                        extension = extensions[i];
                }
                gd::AutomatismMetadata metadata = extension->GetAutomatismMetadata(dialog.GetSelectedAutomatismType());

                //Add automatism to object
                std::string autoName = metadata.GetDefaultName();
                for (unsigned int j = 2;object->HasAutomatismNamed(autoName);++j)
                    autoName = metadata.GetDefaultName()+ToString(j);

                object->AddNewAutomatism(project, dialog.GetSelectedAutomatismType(), autoName);
                UpdateAutomatismsSharedData(project, globalObject ? NULL : layout);
                for ( unsigned int j = 0; j < project.GetUsedPlatforms().size();++j)
                    project.GetUsedPlatforms()[j]->GetChangesNotifier().OnAutomatismAdded(project, globalObject ? NULL : layout, *object, object->GetAutomatism(autoName));

                return true;
            }
        }
        else if ( event.GetPropertyName() == "AUTO_REMOVE" )
        {
            //Create automatism array
            wxArrayString automatismsStr;

            //Fill array
            std::vector <std::string> automatisms = object->GetAllAutomatismNames();
            for (unsigned int i = 0;i<automatisms.size();++i)
                automatismsStr.Add(object->GetAutomatism(automatisms[i]).GetName());

            int selection = wxGetSingleChoiceIndex(_("Choose the automatism to delete"), _("Choose the automatism to delete"), automatismsStr);
            if ( selection == -1 ) return false;

            object->RemoveAutomatism(automatisms[selection]);
            UpdateAutomatismsSharedData(project, globalObject ? NULL : layout);

            for ( unsigned int j = 0; j < project.GetUsedPlatforms().size();++j)
                project.GetUsedPlatforms()[j]->GetChangesNotifier().OnAutomatismDeleted(project, globalObject ? NULL : layout, *object, automatisms[selection]);

            return true;
        }
        else if ( event.GetPropertyName().substr(0,12) == "AUTO_RENAME:" )
        {
            event.Veto();
            std::string autoName = gd::ToString(event.GetPropertyName().substr(12));
            if ( !object->HasAutomatismNamed(autoName)) return true;

            gd::Automatism & automatism = object->GetAutomatism(autoName);

            std::string newName = ToString(wxGetTextFromUser("Entrez le nouveau nom de l'automatisme", "Renommer un automatisme", automatism.GetName()));
            if ( newName == automatism.GetName() || object->HasAutomatismNamed(newName) || newName.empty() ) return false;

            std::string oldName = automatism.GetName();
            automatism.SetName(newName);
            UpdateAutomatismsSharedData(project, globalObject ? NULL : layout);

            for ( unsigned int j = 0; j < project.GetUsedPlatforms().size();++j)
                project.GetUsedPlatforms()[j]->GetChangesNotifier().OnAutomatismRenamed(project, globalObject ? NULL : layout, *object, automatism, oldName);

            return true;
        }
        else if ( event.GetPropertyName().substr(0,5) == "AUTO:" )
        {
            event.Veto();
            std::string autoName = gd::ToString(event.GetPropertyName().substr(5));
            if ( !object->HasAutomatismNamed(autoName)) return true;

            gd::Automatism & automatism = object->GetAutomatism(autoName);

            automatism.EditAutomatism(grid, project, layout, mainFrameWrapper); //EditAutomatism always need a valid layout!
            for ( unsigned int j = 0; j < project.GetUsedPlatforms().size();++j)
                project.GetUsedPlatforms()[j]->GetChangesNotifier().OnAutomatismEdited(project, globalObject ? NULL : layout, *object, automatism);
        }
    }

    return false;
}

bool ObjectsPropgridHelper::OnPropertyChanged(gd::Object * object, gd::Layout * layout, wxPropertyGridEvent& event)
{
    if ( !grid || !object ) return false;

    //Check if the object is global
    bool globalObject = false;
    for (unsigned int i = 0;i<project.GetObjectsCount();++i)
    {
        if ( &project.GetObject(i) == object )
        {
            globalObject = true;
            break;
        }
    }

    if ( event.GetPropertyName() == _("Object name") )
    {
        /*std::string oldName = object->GetName();
        std::string newName = gd::ToString(event.GetPropertyValue().GetString());

        //Be sure the name is valid
        if ( !project.ValidateObjectName(newName) )
        {
            wxRichToolTip tip(_("Invalid name"), project.GetBadObjectNameWarning());
            tip.SetIcon(wxICON_INFORMATION);
            tip.ShowFor(grid);

            event.Veto();
            return false;
        }

        if ( (!globalObject && layout && layout->HasObjectNamed(newName)) ||
             (globalObject && project.HasObjectNamed(newName)) ) return false;

        object->SetName( newName );

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
        }

        for ( unsigned int j = 0; j < project.GetUsedPlatforms().size();++j)
            project.GetUsedPlatforms()[j]->GetChangesNotifier().OnObjectRenamed(project, globalObject ? NULL : layout, *object, oldName);

        return true;*/
    }
    else if ( event.GetPropertyName().substr(0,10) == "AUTO_PROP:" )
    {
        std::string autoName = gd::ToString(event.GetPropertyName().substr(10));
        if ( !object->HasAutomatismNamed(autoName))
        {
            event.Veto();
            return false;
        }

        gd::Automatism & automatism = object->GetAutomatism(autoName);
        if ( !automatism.UpdateProperty(ToString(event.GetProperty()->GetLabel()), ToString(event.GetPropertyValue().GetString()), project) )
        {
            event.Veto();
            return false;
        }
    }

    return false;
}

void ObjectsPropgridHelper::UpdateAutomatismsSharedData(gd::Project & project, gd::Layout * scene) const
{
    if ( scene )
        scene->UpdateAutomatismsSharedData(project);
    else //Scene pointer is NULL: Update shared data of all scenes
    {
        for (unsigned int i = 0;i<project.GetLayoutCount();++i)
            project.GetLayout(i).UpdateAutomatismsSharedData(project);
    }
}

}
