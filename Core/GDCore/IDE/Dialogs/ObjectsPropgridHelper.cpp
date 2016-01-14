/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include "ObjectsPropgridHelper.h"
#include "GDCore/IDE/Dialogs/ChooseVariableDialog.h"
#include "GDCore/IDE/Dialogs/PropertyDescriptor.h"
#include "GDCore/IDE/Dialogs/ChooseBehaviorTypeDialog.h"
#include "GDCore/IDE/Events/EventsRefactorer.h"
#include "GDCore/Extensions/Metadata/MetadataProvider.h"
#include "GDCore/Tools/HelpFileAccess.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Project/Behavior.h"
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/CommonTools.h"
#include <wx/propgrid/propgrid.h>
#include <wx/richtooltip.h>
#include <wx/settings.h>
#include <wx/choicdlg.h>
#include <wx/textdlg.h>

//Let _ return wxString for convenience in this file.
#undef _
#define _(s) wxGetTranslation(wxString::FromUTF8(u8##s))

namespace gd
{

void ObjectsPropgridHelper::RefreshFrom(const gd::Object * object, bool displayedAfterInstanceProperties)
{
    if ( grid == NULL ) return;
    if ( !object ) return;
    auto metadata = gd::MetadataProvider::GetObjectMetadata(project.GetCurrentPlatform(),
        object->GetType());

    if ( !displayedAfterInstanceProperties ) grid->Clear();

    //Update the grid
    if ( !displayedAfterInstanceProperties )
        grid->Append( new wxPropertyCategory(_("General")) );
    else
        grid->Append( new wxPropertyCategory(_("General object properties")) );

    grid->EnableProperty(grid->Append( new wxStringProperty(_("Object name"), wxPG_LABEL, object->GetName())), false);
    grid->EnableProperty(grid->Append( new wxStringProperty(_("Kind"), wxPG_LABEL, metadata.GetFullName())), false);
    if (!metadata.GetHelpUrl().empty())
    {
        grid->Append( new wxStringProperty(_("Help"), wxPG_LABEL, _("Click to see help...")) );
        grid->SetPropertyCell(_("Help"), 1, _("Click to see help..."), wxNullBitmap, wxSystemSettings::GetColour(wxSYS_COLOUR_HOTLIGHT));
        grid->SetPropertyReadOnly(_("Help"));
    }

    auto properties = object->GetProperties(project);
    if ( properties.empty() || properties.find("PLEASE_ALSO_SHOW_EDIT_BUTTON_THANKS") != properties.end() )
    {
        //"Click to edit" is not shown if properties are not empty, except if the magic property is set.
        grid->Append( new wxStringProperty(_("Edit"), wxPG_LABEL, _("Click to edit...")) );
        grid->SetPropertyCell(_("Edit"), 1, _("Click to edit..."), wxNullBitmap, wxSystemSettings::GetColour(wxSYS_COLOUR_HOTLIGHT));
        grid->SetPropertyReadOnly(_("Edit"));
    }
    RefreshFrom(properties, "OBJ_PROP");

    if ( !displayedAfterInstanceProperties )
    {
        grid->Append( new wxPropertyCategory(_("Object variables") + " (" + gd::String::From(object->GetVariables().Count()) + ")", "OBJECT_VARIABLES_CATEGORY" ) );
        grid->Append( new wxStringProperty(_("Variables"), wxPG_LABEL, _("Click to edit...")) );
        grid->SetPropertyCell(_("Variables"), 1, _("Click to edit..."), wxNullBitmap, wxSystemSettings::GetColour(wxSYS_COLOUR_HOTLIGHT));
        grid->SetPropertyReadOnly(_("Variables"));
    }

    grid->Append( new wxPropertyCategory(_("Behaviors") + " (" + gd::String::From(object->GetAllBehaviors().size()) + ")" , "AUTO") );
    grid->Append( new wxStringProperty(_("Add a behavior"), "AUTO_ADD", _("Add...")) );
    grid->SetPropertyCell("AUTO_ADD", 1, _("Add..."), wxNullBitmap, wxSystemSettings::GetColour(wxSYS_COLOUR_HOTLIGHT));
    grid->SetPropertyReadOnly("AUTO_ADD");

    std::vector<gd::String> behaviors = object->GetAllBehaviorNames();
    if ( !behaviors.empty() ) {
        grid->AppendIn("AUTO", new wxStringProperty("", "AUTO_REMOVE", _("Remove...")) );
        grid->SetPropertyCell("AUTO_REMOVE", 1, _("Remove..."), wxNullBitmap, wxSystemSettings::GetColour(wxSYS_COLOUR_HOTLIGHT));
        grid->SetPropertyReadOnly("AUTO_REMOVE");
    }

    for (std::size_t i = 0;i<behaviors.size();++i)
    {
        const gd::Behavior & behavior = object->GetBehavior(behaviors[i]);
        auto properties = behavior.GetProperties(project);

        grid->AppendIn( "AUTO", new wxPropertyCategory(behavior.GetName()) );
        if ( properties.empty() || properties.find("PLEASE_ALSO_SHOW_EDIT_BUTTON_THANKS") != properties.end() )
        {
            //"Click to edit" is not shown if properties are not empty, except if the magic property is set.
            grid->Append( new wxStringProperty(_("Edit"), wxString("AUTO:"+behaviors[i]), _("Click to edit...")) );
            grid->SetPropertyCell(wxString("AUTO:"+behaviors[i]), 1, _("Click to edit..."), wxNullBitmap, wxSystemSettings::GetColour(wxSYS_COLOUR_HOTLIGHT));
            grid->SetPropertyReadOnly(wxString("AUTO:"+behaviors[i]));
        }
        grid->Append( new wxStringProperty("", "AUTO_RENAME:"+behaviors[i], _("Rename...")) );
        grid->SetPropertyCell(wxString("AUTO_RENAME:"+behaviors[i]), 1, _("Rename..."), wxNullBitmap, wxSystemSettings::GetColour(wxSYS_COLOUR_HOTLIGHT));
        grid->SetPropertyReadOnly(wxString("AUTO_RENAME:"+behaviors[i]));

        //Add behavior custom properties
        RefreshFrom(properties, "AUTO_PROP:"+behaviors[i]);
    }


    grid->SetPropertyAttributeAll(wxPG_BOOL_USE_CHECKBOX, true);
}

void ObjectsPropgridHelper::RefreshFrom(const std::map<gd::String, gd::PropertyDescriptor> & properties, gd::String propertiesNames)
{
    for (auto it = properties.begin();it != properties.end();++it)
    {
        if ( (*it).first == "PLEASE_ALSO_SHOW_EDIT_BUTTON_THANKS" ) continue; //Skip the magic property.

        gd::String type = (*it).second.GetType();
        gd::String value = (*it).second.GetValue();
        gd::String name = (*it).first;
        if ( type == "Choice" )
        {
            auto & choices = (*it).second.GetExtraInfo();
            wxArrayString choicesArray;
            for (std::size_t j = 0; j < choices.size(); ++j)
                choicesArray.push_back(choices[j]);

            wxEnumProperty * prop = new wxEnumProperty(name, propertiesNames, choicesArray);
            prop->SetChoiceSelection(choicesArray.Index(value));
            grid->Append(prop);
        }
        else if ( type == "Boolean" )
            grid->Append(new wxBoolProperty(name, propertiesNames, value == "true"));
        else
            grid->Append(new wxStringProperty(name, propertiesNames, value));
    }
}

bool ObjectsPropgridHelper::OnPropertySelected(gd::Object * object, gd::Layout * layout, wxPropertyGridEvent& event)
{
    if ( !grid || !object ) return false;

    //Check if the object is global
    bool globalObject = false;
    for (std::size_t i = 0;i<project.GetObjectsCount();++i)
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
            for ( std::size_t j = 0; j < project.GetUsedPlatforms().size();++j)
                project.GetUsedPlatforms()[j]->GetChangesNotifier().OnObjectEdited(project, globalObject ? NULL : layout, *object);

            //Reload resources : Do not forget to switch the working directory.
            wxString oldWorkingDir = wxGetCwd();
            if ( wxDirExists(wxFileName::FileName(project.GetProjectFile()).GetPath()))
                wxSetWorkingDirectory(wxFileName::FileName(project.GetProjectFile()).GetPath());

            if (layout) object->LoadResources(project, *layout);

            wxSetWorkingDirectory(oldWorkingDir);
        }
        else if ( event.GetPropertyName() == _("Help"))
        {
            auto metadata = gd::MetadataProvider::GetObjectMetadata(project.GetCurrentPlatform(),
                object->GetType());

            gd::HelpFileAccess::Get()->OpenPage(metadata.GetHelpUrl());
        }
        else if ( event.GetPropertyName() == _("Variables") )
        {
            gd::ChooseVariableDialog dialog(grid, object->GetVariables(), true);
            dialog.SetAssociatedObject(&project, layout, object);
            if ( dialog.ShowModal() == 1 )
            {
                for ( std::size_t j = 0; j < project.GetUsedPlatforms().size();++j)
                    project.GetUsedPlatforms()[j]->GetChangesNotifier().OnObjectVariablesChanged(project, globalObject ? NULL : layout, *object);

                //Update the grid:
                if ( grid->GetProperty("OBJECT_VARIABLES_CATEGORY") != NULL)
                    grid->SetPropertyLabel("OBJECT_VARIABLES_CATEGORY",
                        _("Object variables") + " (" + gd::String::From(object->GetVariables().Count()) + ")");
            }
        }
        else if ( event.GetPropertyName() == "AUTO_ADD" )
        {
            return gd::ChooseBehaviorTypeDialog::ChooseAndAddBehaviorToObject(grid, project,
                object, layout, globalObject);
        }
        else if ( event.GetPropertyName() == "AUTO_REMOVE" )
        {
            //Create behavior array
            wxArrayString behaviorsStr;

            //Fill array
            std::vector <gd::String> behaviors = object->GetAllBehaviorNames();
            for (std::size_t i = 0;i<behaviors.size();++i)
                behaviorsStr.Add(object->GetBehavior(behaviors[i]).GetName());

            int selection = wxGetSingleChoiceIndex(_("Choose the behavior to delete"), _("Choose the behavior to delete"), behaviorsStr);
            if ( selection == -1 ) return false;

            object->RemoveBehavior(behaviors[selection]);
            UpdateBehaviorsSharedData(project, globalObject ? NULL : layout);

            for ( std::size_t j = 0; j < project.GetUsedPlatforms().size();++j)
                project.GetUsedPlatforms()[j]->GetChangesNotifier().OnBehaviorDeleted(project, globalObject ? NULL : layout, *object, behaviors[selection]);

            return true;
        }
        else if ( event.GetPropertyName().substr(0,12) == "AUTO_RENAME:" )
        {
            event.Veto();
            gd::String oldName = event.GetPropertyName().substr(12);
            if ( !object->HasBehaviorNamed(oldName)) return true;

            gd::Behavior & behavior = object->GetBehavior(oldName);

            gd::String newName = wxGetTextFromUser(_("Enter a new name for the behavior"), _("Rename a behavior"), behavior.GetName());
            if ( newName == behavior.GetName() || object->HasBehaviorNamed(newName) || newName.empty() ) return false;

            object->RenameBehavior(oldName, newName);
            UpdateBehaviorsSharedData(project, globalObject ? NULL : layout);

            for ( std::size_t j = 0; j < project.GetUsedPlatforms().size();++j)
                project.GetUsedPlatforms()[j]->GetChangesNotifier().OnBehaviorRenamed(project, globalObject ? NULL : layout, *object, behavior, oldName);

            return true;
        }
        else if ( event.GetPropertyName().substr(0,5) == "AUTO:" )
        {
            event.Veto();
            gd::String autoName = event.GetPropertyName().substr(5);
            if ( !object->HasBehaviorNamed(autoName)) return true;

            gd::Behavior & behavior = object->GetBehavior(autoName);

            behavior.EditBehavior(grid, project, layout, mainFrameWrapper); //EditBehavior always need a valid layout!
            for ( std::size_t j = 0; j < project.GetUsedPlatforms().size();++j)
                project.GetUsedPlatforms()[j]->GetChangesNotifier().OnBehaviorEdited(project, globalObject ? NULL : layout, *object, behavior);
        }
    }

    return false;
}

bool ObjectsPropgridHelper::OnPropertyChanged(gd::Object * object, gd::Layout * layout, wxPropertyGridEvent& event)
{
    if ( !grid || !object ) return false;

    auto readEnumPropertyString = [&event](std::map<gd::String, gd::PropertyDescriptor> properties) {
        const std::vector<gd::String> & choices = properties[event.GetProperty()->GetLabel()].GetExtraInfo();

        unsigned int id = event.GetPropertyValue().GetLong();
        if (id < choices.size()) {
            return gd::String(choices[id]);
        }

        return gd::String("");
    };

    if ( event.GetPropertyName().substr(0,10) == "AUTO_PROP:" )
    {
        gd::String autoName = event.GetPropertyName().substr(10);
        if ( !object->HasBehaviorNamed(autoName))
        {
            event.Veto();
            return false;
        }

        gd::Behavior & behavior = object->GetBehavior(autoName);
        gd::String value = event.GetPropertyValue().GetString();

        //Special case for enums.
        if (wxEnumProperty * enumProperty = dynamic_cast<wxEnumProperty*>(event.GetProperty()))
            value = readEnumPropertyString(behavior.GetProperties(project));

        if (!behavior.UpdateProperty(event.GetProperty()->GetLabel(), value, project))
        {
            event.Veto();
            return false;
        }
    }
    else if ( event.GetPropertyName().substr(0,8) == "OBJ_PROP" )
    {
        gd::String value = event.GetPropertyValue().GetString();

        //Special case for enums.
        if (wxEnumProperty * enumProperty = dynamic_cast<wxEnumProperty*>(event.GetProperty()))
            value = readEnumPropertyString(object->GetProperties(project));

        if (!object->UpdateProperty(event.GetProperty()->GetLabel(), value, project))
        {
            event.Veto();
            return false;
        }
    }

    return false;
}

void ObjectsPropgridHelper::UpdateBehaviorsSharedData(gd::Project & project, gd::Layout * scene) const
{
    if ( scene )
        scene->UpdateBehaviorsSharedData(project);
    else //Scene pointer is NULL: Update shared data of all scenes
    {
        for (std::size_t i = 0;i<project.GetLayoutsCount();++i)
            project.GetLayout(i).UpdateBehaviorsSharedData(project);
    }
}

}
#endif
