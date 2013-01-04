/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */
#include "InitialInstancesPropgridHelper.h"
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
    std::string nameProperty;
    std::string xProperty;
    std::string yProperty;
    std::string angleProperty;
    std::string zOrderProperty;
    std::string layerProperty;
    bool customSizeProperty;
    std::string widthProperty;
    std::string heightProperty;
    std::map<std::string, std::string> customProperties;

    for (unsigned int i = 0;i<selectedInitialInstances.size();++i)
    {
        if ( i == 0 )
        {
            nameProperty = selectedInitialInstances[0]->GetObjectName();
            xProperty = ToString(selectedInitialInstances[0]->GetX());
            yProperty = ToString(selectedInitialInstances[0]->GetY());
            angleProperty = ToString(selectedInitialInstances[0]->GetAngle());
            zOrderProperty = ToString(selectedInitialInstances[0]->GetZOrder());
            layerProperty = selectedInitialInstances[0]->GetLayer();
            customSizeProperty = selectedInitialInstances[0]->HasCustomSize();
            widthProperty = ToString(selectedInitialInstances[0]->GetCustomWidth());
            heightProperty = ToString(selectedInitialInstances[0]->GetCustomHeight());
            customProperties = selectedInitialInstances[0]->GetCustomProperties(project, layout);
        }
        else
        {
            if ( selectedInitialInstances[i]->GetObjectName() != nameProperty ) nameProperty = _("(Multiples values)");
            if ( ToString(selectedInitialInstances[i]->GetX()) != xProperty ) xProperty = _("(Multiples values)");
            if ( ToString(selectedInitialInstances[i]->GetY()) != yProperty ) yProperty = _("(Multiples values)");
            if ( ToString(selectedInitialInstances[i]->GetAngle()) != angleProperty ) angleProperty = _("(Multiples values)");
            if ( ToString(selectedInitialInstances[i]->GetZOrder()) != zOrderProperty ) zOrderProperty = _("(Multiples values)");
            if ( selectedInitialInstances[i]->GetLayer() != layerProperty ) layerProperty = _("(Multiples values)");
            if ( !selectedInitialInstances[i]->HasCustomSize() ) customSizeProperty = false;
            if ( ToString(selectedInitialInstances[i]->GetCustomWidth()) != widthProperty ) widthProperty = _("(Multiples values)");
            if ( ToString(selectedInitialInstances[i]->GetCustomHeight()) != heightProperty ) heightProperty = _("(Multiples values)");

            //Merge custom properties
            std::map<std::string, std::string> instanceCustomProperties = selectedInitialInstances[i]->GetCustomProperties(project, layout);
            for(std::map<std::string, std::string>::iterator it = instanceCustomProperties.begin(); it != instanceCustomProperties.end();++it)
            {
                if ( customProperties.find(it->first) == customProperties.end() ) continue;
                if ( customProperties[it->first] != it->second ) customProperties[it->first] = _("(Multiples values)");
            }
            //Also erase properties which are not in common.
            for(std::map<std::string, std::string>::iterator it = customProperties.begin(); it != customProperties.end();)
            {
                if ( instanceCustomProperties.find(it->first) == instanceCustomProperties.end() )
                    customProperties.erase(it++);
                else ++it;
            }
        }
    }

    //Update the grid
    grid->Append( new wxPropertyCategory(_("General")) );
    grid->EnableProperty(grid->Append( new wxStringProperty(_("Object name"), wxPG_LABEL, nameProperty)), false);
    grid->Append( new wxStringProperty(_("X"), wxPG_LABEL, xProperty));
    grid->Append( new wxStringProperty(_("Y"), wxPG_LABEL, yProperty));
    grid->Append( new wxStringProperty(_("Angle"), wxPG_LABEL, angleProperty));
    grid->Append( new wxStringProperty(_("Z Order"), wxPG_LABEL, zOrderProperty));
    grid->Append( new wxStringProperty(_("Layer"), wxPG_LABEL, layerProperty));
    grid->Append( new wxPropertyCategory(_("Size")) );
    grid->Append( new wxBoolProperty(_("Custom size?"), wxPG_LABEL, customSizeProperty));
    grid->EnableProperty(grid->Append( new wxStringProperty(_("Width"), wxPG_LABEL, widthProperty)), customSizeProperty);
    grid->EnableProperty(grid->Append( new wxStringProperty(_("Height"), wxPG_LABEL, heightProperty)), customSizeProperty);

    if ( !customProperties.empty() ) grid->Append( new wxPropertyCategory(_("Specific properties")) );
    for (std::map<std::string, std::string>::iterator it = customProperties.begin(); it != customProperties.end();++it)
    {
        grid->Append( new wxStringProperty(it->first, wxPG_LABEL, it->second));
    }

    if ( selectedInitialInstances.size() == 1)
    {
        grid->Append( new wxPropertyCategory(_("Instance variables") + " (" + gd::ToString(selectedInitialInstances[0]->GetVariables().GetVariableCount()) + ")" ) );
        grid->Append( new wxStringProperty(_("Variables"), wxPG_LABEL, _("Click to edit...")) );

        grid->SetPropertyCell(_("Variables"), 1, _("Click to edit..."), wxNullBitmap, wxSystemSettings::GetColour(wxSYS_COLOUR_HOTLIGHT ));
        grid->SetPropertyReadOnly(_("Variables"));
    }

    grid->SetPropertyAttributeAll(wxPG_BOOL_USE_CHECKBOX, true);
}

void InitialInstancesPropgridHelper::OnPropertySelected(const std::vector<gd::InitialInstance*> & selectedInitialInstances, wxPropertyGridEvent& event)
{
    if ( grid == NULL ) return;

    if ( event.GetColumn() == 1) //Manage button-like properties
    {
        if ( selectedInitialInstances.empty() ) return;

        if ( event.GetPropertyName() == _("Variables") )
        {
            gd::ChooseVariableDialog dialog(NULL, selectedInitialInstances[0]->GetVariables(), true);
            dialog.ShowModal();
        }
    }
}

void InitialInstancesPropgridHelper::OnPropertyChanged(const std::vector<gd::InitialInstance*> & selectedInitialInstances, wxPropertyGridEvent& event)
{
    if ( grid == NULL ) return;
    if ( selectedInitialInstances.empty() ) return;

    if ( event.GetPropertyName() == _("Custom size?") )
    {
        bool hasCustomSize = grid->GetProperty(_("Custom size?"))->GetValue().GetBool();

        grid->EnableProperty(_("Width"), hasCustomSize);
        grid->EnableProperty(_("Height"), hasCustomSize);

        for (unsigned int i = 0;i<selectedInitialInstances.size();++i)
            selectedInitialInstances[i]->SetHasCustomSize(hasCustomSize);
    }
    else if ( event.GetPropertyName() == _("Width") )
    {
        for (unsigned int i = 0;i<selectedInitialInstances.size();++i)
            selectedInitialInstances[i]->SetCustomWidth(event.GetValue().GetReal());
    }
    else if ( event.GetPropertyName() == _("Height") )
    {
        for (unsigned int i = 0;i<selectedInitialInstances.size();++i)
            selectedInitialInstances[i]->SetCustomHeight(event.GetValue().GetReal());
    }
    else if ( event.GetPropertyName() == _("X") )
    {
        for (unsigned int i = 0;i<selectedInitialInstances.size();++i)
            selectedInitialInstances[i]->SetX(event.GetValue().GetReal());
    }
    else if ( event.GetPropertyName() == _("Y") )
    {
        for (unsigned int i = 0;i<selectedInitialInstances.size();++i)
            selectedInitialInstances[i]->SetY(event.GetValue().GetReal());
    }
    else if ( event.GetPropertyName() == _("Angle") )
    {
        for (unsigned int i = 0;i<selectedInitialInstances.size();++i)
            selectedInitialInstances[i]->SetAngle(event.GetValue().GetReal());
    }
    else if ( event.GetPropertyName() == _("Z Order") )
    {
        for (unsigned int i = 0;i<selectedInitialInstances.size();++i)
            selectedInitialInstances[i]->SetZOrder(event.GetValue().GetInteger());
    }
    else if ( event.GetPropertyName() == _("Layer") )
    {
        for (unsigned int i = 0;i<selectedInitialInstances.size();++i)
            selectedInitialInstances[i]->SetLayer(ToString(event.GetValue().GetString()));
    }
    else
    {
        for (unsigned int i = 0;i<selectedInitialInstances.size();++i)
        {
            selectedInitialInstances[i]->UpdateCustomProperty(ToString(event.GetPropertyName()),
                                                              ToString(event.GetValue().GetString()),
                                                              project, layout);
        }
    }
}

}
