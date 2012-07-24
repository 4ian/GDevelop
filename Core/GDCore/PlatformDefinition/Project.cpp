/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#include <map>
#include <vector>
#include <string>
#include <wx/propgrid/propgrid.h>
#include "GDCore/IDE/Dialogs/ProjectExtensionsDialog.h"
#include "GDCore/IDE/Dialogs/ChooseVariableDialog.h"
#include "GDCore/PlatformDefinition/Platform.h"
#include "GDCore/PlatformDefinition/PlatformExtension.h"
#include "GDCore/Events/ExpressionMetadata.h"
#include "GDCore/PlatformDefinition/InstructionsMetadataHolder.h"
#include "GDCore/CommonTools.h"
#include "Project.h"

namespace gd
{

std::vector < std::string > Project::noPlatformExtensionsUsed;

Project::Project()
{
    //ctor
}

Project::~Project()
{
    //dtor
}

void Project::PopulatePropertyGrid(wxPropertyGrid * grid)
{
    grid->Append( new wxPropertyCategory(_("Propriétés")) );
    grid->Append( new wxStringProperty(_("Nom du projet"), wxPG_LABEL, GetName()) );
    grid->Append( new wxStringProperty(_("Auteur"), wxPG_LABEL, GetAuthor()) );
    grid->Append( new wxStringProperty(_("Variables globales"), wxPG_LABEL, _("Cliquez pour éditer...")) );
    grid->Append( new wxStringProperty(_("Extensions"), wxPG_LABEL, _("Cliquez pour éditer...")) );
    grid->Append( new wxPropertyCategory(_("Fenêtre de jeu")) );
    grid->Append( new wxUIntProperty(_("Largeur"), wxPG_LABEL, GetMainWindowDefaultWidth()) );
    grid->Append( new wxUIntProperty(_("Hauteur"), wxPG_LABEL, GetMainWindowDefaultHeight()) );
    grid->Append( new wxBoolProperty(_("Synchronisation verticale"), wxPG_LABEL, IsVerticalSynchronizationEnabledByDefault()) );
    grid->Append( new wxBoolProperty(_("Limiter le framerate"), wxPG_LABEL, GetMaximumFPS() != -1) );
    grid->Append( new wxIntProperty(_("FPS maximum"), wxPG_LABEL, GetMaximumFPS()) );
    grid->Append( new wxUIntProperty(_("FPS minimum"), wxPG_LABEL, GetMinimumFPS()) );

    grid->SetPropertyCell(_("Variables globales"), 1, _("Cliquez pour éditer..."), wxNullBitmap, wxSystemSettings::GetColour(wxSYS_COLOUR_HOTLIGHT ));
    grid->SetPropertyReadOnly(_("Variables globales"));
    grid->SetPropertyCell(_("Extensions"), 1, _("Cliquez pour éditer..."), wxNullBitmap, wxSystemSettings::GetColour(wxSYS_COLOUR_HOTLIGHT ));
    grid->SetPropertyReadOnly(_("Extensions"));

    if ( GetMaximumFPS() == -1 )
    {
        grid->GetProperty(_("FPS maximum"))->Enable(false);
        grid->GetProperty(_("FPS maximum"))->SetValue("");
    }
    else
        grid->GetProperty(_("FPS maximum"))->Enable(true);
}

void Project::UpdateFromPropertyGrid(wxPropertyGrid * grid)
{
    if ( grid->GetProperty(_("Nom du projet")) != NULL)
        SetName(gd::ToString(grid->GetProperty(_("Nom du projet"))->GetValueAsString()));
    if ( grid->GetProperty(_("Auteur")) != NULL)
        SetAuthor(gd::ToString(grid->GetProperty(_("Auteur"))->GetValueAsString()));
    if ( grid->GetProperty(_("Largeur")) != NULL)
        SetMainWindowDefaultWidth(grid->GetProperty(_("Largeur"))->GetValue().GetInteger());
    if ( grid->GetProperty(_("Hauteur")) != NULL)
        SetMainWindowDefaultHeight(grid->GetProperty(_("Hauteur"))->GetValue().GetInteger());
    if ( grid->GetProperty(_("Synchronisation verticale")) != NULL)
        SetVerticalSyncActivatedByDefault(grid->GetProperty(_("Synchronisation verticale"))->GetValue().GetBool());
    if ( grid->GetProperty(_("Limiter le framerate")) != NULL && !grid->GetProperty(_("Limiter le framerate"))->GetValue().GetBool())
        SetMaximumFPS(-1);
    else if ( grid->GetProperty(_("FPS maximum")) != NULL)
        SetMaximumFPS(grid->GetProperty(_("FPS maximum"))->GetValue().GetInteger());
    if ( grid->GetProperty(_("FPS minimum")) != NULL)
        SetMinimumFPS(grid->GetProperty(_("FPS minimum"))->GetValue().GetInteger());
}

void Project::OnSelectionInPropertyGrid(wxPropertyGrid * grid, wxPropertyGridEvent & event)
{
    if ( event.GetColumn() == 1) //Manage button-like properties
    {
        if ( event.GetPropertyName() == _("Extensions") )
        {
            gd::ProjectExtensionsDialog dialog(NULL, *this);
            dialog.ShowModal();
        }
        else if ( event.GetPropertyName() == _("Variables globales") )
        {
            gd::ChooseVariableDialog dialog(NULL, GetVariables(), /*editingOnly=*/true);
            dialog.SetAssociatedProject(this);
            dialog.ShowModal();
        }
    }
}

void Project::OnChangeInPropertyGrid(wxPropertyGrid * grid, wxPropertyGridEvent & event)
{
    if (event.GetPropertyName() == _("Limiter le framerate") )
        grid->EnableProperty(_("FPS maximum"), grid->GetProperty(_("Limiter le framerate"))->GetValue().GetBool());

    UpdateFromPropertyGrid(grid);
}

bool Project::ValidateObjectName(const std::string & name)
{
    const std::vector < boost::shared_ptr<PlatformExtension> > extensions = GetPlatform().GetAllPlatformExtensions();

    //Check if name is not an expression
    bool nameUsedByExpression = (GetPlatform().GetInstructionsMetadataHolder().HasExpression(name) ||
                                 GetPlatform().GetInstructionsMetadataHolder().HasStrExpression(name));

    //Check if name is not an object expression
    for (unsigned int i = 0;i<extensions.size();++i)
    {
        if ( find(GetUsedPlatformExtensions().begin(),
                  GetUsedPlatformExtensions().end(),
                  extensions[i]->GetName()) == GetUsedPlatformExtensions().end() )
            continue; //Do not take care of unused extensions

        std::vector<std::string> objectsTypes = extensions[i]->GetExtensionObjectsTypes();

        for(unsigned int j = 0;j<objectsTypes.size();++j)
        {
            std::map<std::string, gd::ExpressionMetadata > allObjExpr = extensions[i]->GetAllExpressionsForObject(objectsTypes[j]);
            for(std::map<std::string, gd::ExpressionMetadata>::const_iterator it = allObjExpr.begin(); it != allObjExpr.end(); ++it)
            {
                if ( name == it->first )
                    nameUsedByExpression = true;
            }
        }
    }

    //Finally check if the name has only allowed characters
    std::string allowedCharacter = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_";
    return !(name.find_first_not_of(allowedCharacter) != std::string::npos || nameUsedByExpression);
}

std::string Project::GetBadObjectNameWarning()
{
    return gd::ToString(_("Utilisez uniquement des lettres,\nchiffres et underscores ( _ ).\nLes noms réservés par des\nexpressions sont aussi interdits."));
}

}
