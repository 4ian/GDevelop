/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include "InitialInstancesPropgridHelper.h"
#include "GDCore/IDE/Dialogs/PropertyDescriptor.h"
#include "GDCore/IDE/Dialogs/ChooseVariableDialog.h"
#include "GDCore/PlatformDefinition/InitialInstance.h"
#include "GDCore/CommonTools.h"
#include <wx/propgrid/propgrid.h>
#include <wx/settings.h>

namespace gd
{

void InitialInstancesPropgridHelper::RefreshFrom(const std::vector<gd::InitialInstance*> & selectedInitialInstances)
{
    if ( grid == NULL ) return;

    grid->Clear();
    if ( selectedInitialInstances.empty() ) return;

    //Get the properties values
    gd::String nameProperty;
    gd::String xProperty;
    gd::String yProperty;
    gd::String angleProperty;
    gd::String zOrderProperty;
    gd::String layerProperty;
    bool customSizeProperty = false;
    gd::String widthProperty;
    gd::String heightProperty;
    bool lockedProperty = false;
    std::map<gd::String, gd::PropertyDescriptor> customProperties;

    for (std::size_t i = 0;i<selectedInitialInstances.size();++i)
    {
        if ( i == 0 )
        {
            xProperty = gd::String::From(selectedInitialInstances[0]->GetX());
            yProperty = gd::String::From(selectedInitialInstances[0]->GetY());
            angleProperty = gd::String::From(selectedInitialInstances[0]->GetAngle());
            zOrderProperty = gd::String::From(selectedInitialInstances[0]->GetZOrder());
            layerProperty = selectedInitialInstances[0]->GetLayer();
            customSizeProperty = selectedInitialInstances[0]->HasCustomSize();
            widthProperty = gd::String::From(selectedInitialInstances[0]->GetCustomWidth());
            heightProperty = gd::String::From(selectedInitialInstances[0]->GetCustomHeight());
            lockedProperty = selectedInitialInstances[0]->IsLocked();
            customProperties = selectedInitialInstances[0]->GetCustomProperties(project, layout);
        }
        else
        {
            if ( gd::String::From(selectedInitialInstances[i]->GetX()) != xProperty ) xProperty = _("(Multiples values)");
            if ( gd::String::From(selectedInitialInstances[i]->GetY()) != yProperty ) yProperty = _("(Multiples values)");
            if ( gd::String::From(selectedInitialInstances[i]->GetAngle()) != angleProperty ) angleProperty = _("(Multiples values)");
            if ( gd::String::From(selectedInitialInstances[i]->GetZOrder()) != zOrderProperty ) zOrderProperty = _("(Multiples values)");
            if ( selectedInitialInstances[i]->GetLayer() != layerProperty ) layerProperty = _("(Multiples values)");
            if ( !selectedInitialInstances[i]->HasCustomSize() ) customSizeProperty = false;
            if ( !selectedInitialInstances[i]->IsLocked() ) lockedProperty = false;
            if ( gd::String::From(selectedInitialInstances[i]->GetCustomWidth()) != widthProperty ) widthProperty = _("(Multiples values)");
            if ( gd::String::From(selectedInitialInstances[i]->GetCustomHeight()) != heightProperty ) heightProperty = _("(Multiples values)");

            //Merge custom properties
            std::map<gd::String, gd::PropertyDescriptor> instanceCustomProperties = selectedInitialInstances[i]->GetCustomProperties(project, layout);
            for(std::map<gd::String, gd::PropertyDescriptor>::iterator it = instanceCustomProperties.begin();
                it != instanceCustomProperties.end();++it)
            {
                if ( customProperties.find(it->first) == customProperties.end() ) continue;
                if ( customProperties[it->first].GetValue() != it->second.GetValue() )
                    customProperties[it->first].SetValue(_("(Multiples values)"));
            }
            //Also erase properties which are not in common.
            for(std::map<gd::String, gd::PropertyDescriptor>::iterator it = customProperties.begin();
                it != customProperties.end();)
            {
                if ( instanceCustomProperties.find(it->first) == instanceCustomProperties.end() )
                    customProperties.erase(it++);
                else ++it;
            }
        }
    }

    //Update the grid
    grid->Append( new wxPropertyCategory(_("Instance properties")) );
    grid->Append( new wxStringProperty(_("X"), "INSTANCE_X", xProperty));
    grid->Append( new wxStringProperty(_("Y"), "INSTANCE_Y", yProperty));
    grid->Append( new wxStringProperty(_("Angle"), "INSTANCE_ANGLE", angleProperty));
    grid->Append( new wxStringProperty(_("Z Order"), "INSTANCE_Z", zOrderProperty));
    grid->Append( new wxStringProperty(_("Layer"), "INSTANCE_LAYER", layerProperty));
    grid->Append( new wxBoolProperty(_("Locked"), "INSTANCE_LOCKED", lockedProperty));
    grid->Append( new wxBoolProperty(_("Custom size?"), "INSTANCE_CUSTOM_SIZE", customSizeProperty));
    grid->EnableProperty(grid->AppendIn( "INSTANCE_CUSTOM_SIZE", new wxStringProperty(_("Width"), "INSTANCE_SIZE_WIDTH", widthProperty)), customSizeProperty);
    grid->EnableProperty(grid->AppendIn( "INSTANCE_CUSTOM_SIZE", new wxStringProperty(_("Height"), "INSTANCE_SIZE_HEIGHT", heightProperty)), customSizeProperty);
    for (std::map<gd::String, gd::PropertyDescriptor>::iterator it = customProperties.begin(); it != customProperties.end();++it)
    {
        grid->Append( new wxStringProperty(it->first, wxPG_LABEL, it->second.GetValue()));
    }

    if ( selectedInitialInstances.size() == 1)
    {
        grid->Append( new wxStringProperty(_("Variables") + " (" + gd::String::From(selectedInitialInstances[0]->GetVariables().Count())
            + ")", "INSTANCE_VARIABLES", _("Click to edit...")) );

        grid->SetPropertyCell("INSTANCE_VARIABLES", 1, _("Click to edit..."), wxNullBitmap, wxSystemSettings::GetColour(wxSYS_COLOUR_HOTLIGHT ));
        grid->SetPropertyReadOnly("INSTANCE_VARIABLES");
    }

    grid->SetPropertyAttributeAll(wxPG_BOOL_USE_CHECKBOX, true);
}

void InitialInstancesPropgridHelper::OnPropertySelected(const std::vector<gd::InitialInstance*> & selectedInitialInstances, wxPropertyGridEvent& event)
{
    if ( grid == NULL ) return;

    if ( event.GetColumn() == 1) //Manage button-like properties
    {
        if ( selectedInitialInstances.empty() ) return;

        if ( event.GetPropertyName() ==  "INSTANCE_VARIABLES" )
        {
            gd::ChooseVariableDialog dialog(NULL, selectedInitialInstances[0]->GetVariables(), true);
            dialog.ShowModal();

            grid->SetPropertyLabel("INSTANCE_VARIABLES", _("Variables") + " ("
                + gd::String::From(selectedInitialInstances[0]->GetVariables().Count()) + ")");
        }
    }
}

void InitialInstancesPropgridHelper::OnPropertyChanged(const std::vector<gd::InitialInstance*> & selectedInitialInstances, wxPropertyGridEvent& event)
{
    if ( grid == NULL ) return;
    if ( selectedInitialInstances.empty() ) return;

    if ( event.GetPropertyName() == "INSTANCE_CUSTOM_SIZE" )
    {
        bool hasCustomSize = grid->GetProperty("INSTANCE_CUSTOM_SIZE")->GetValue().GetBool();

        grid->EnableProperty("INSTANCE_CUSTOM_SIZE.INSTANCE_SIZE_WIDTH", hasCustomSize);
        grid->EnableProperty("INSTANCE_CUSTOM_SIZE.INSTANCE_SIZE_HEIGHT", hasCustomSize);

        for (std::size_t i = 0;i<selectedInitialInstances.size();++i)
            selectedInitialInstances[i]->SetHasCustomSize(hasCustomSize);
    }
    else if ( event.GetPropertyName() == "INSTANCE_CUSTOM_SIZE.INSTANCE_SIZE_WIDTH" )
    {
        for (std::size_t i = 0;i<selectedInitialInstances.size();++i)
            selectedInitialInstances[i]->SetCustomWidth(event.GetValue().GetReal());
    }
    else if ( event.GetPropertyName() == "INSTANCE_CUSTOM_SIZE.INSTANCE_SIZE_HEIGHT" )
    {
        for (std::size_t i = 0;i<selectedInitialInstances.size();++i)
            selectedInitialInstances[i]->SetCustomHeight(event.GetValue().GetReal());
    }
    else if ( event.GetPropertyName() == "INSTANCE_X" )
    {
        for (std::size_t i = 0;i<selectedInitialInstances.size();++i)
            selectedInitialInstances[i]->SetX(event.GetValue().GetReal());
    }
    else if ( event.GetPropertyName() == "INSTANCE_Y" )
    {
        for (std::size_t i = 0;i<selectedInitialInstances.size();++i)
            selectedInitialInstances[i]->SetY(event.GetValue().GetReal());
    }
    else if ( event.GetPropertyName() == "INSTANCE_ANGLE" )
    {
        for (std::size_t i = 0;i<selectedInitialInstances.size();++i)
            selectedInitialInstances[i]->SetAngle(event.GetValue().GetReal());
    }
    else if ( event.GetPropertyName() == "INSTANCE_Z" )
    {
        for (std::size_t i = 0;i<selectedInitialInstances.size();++i)
            selectedInitialInstances[i]->SetZOrder(event.GetValue().GetInteger());
    }
    else if ( event.GetPropertyName() == "INSTANCE_LAYER" )
    {
        for (std::size_t i = 0;i<selectedInitialInstances.size();++i)
            selectedInitialInstances[i]->SetLayer(event.GetValue().GetString());
    }
    else if ( event.GetPropertyName() == "INSTANCE_LOCKED" )
    {
        for (std::size_t i = 0;i<selectedInitialInstances.size();++i)
            selectedInitialInstances[i]->SetLocked(event.GetValue().GetBool());
    }
    else
    {
        for (std::size_t i = 0;i<selectedInitialInstances.size();++i)
        {
            selectedInitialInstances[i]->UpdateCustomProperty(event.GetPropertyName(),
                                                              event.GetValue().GetString(),
                                                              project, layout);
        }
    }
}

}
#endif
