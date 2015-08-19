/*
 * GDevelop IDE
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU General Public License.
 */
#include "ParameterEditorLauncher.h"
#include <vector>
#include <string>
#include <iostream>
#include "GDCore/Tools/Log.h"
#include <wx/wx.h>
#include <wx/imaglist.h>
#include <wx/colordlg.h>
#include <wx/filedlg.h>
#include <wx/filename.h>
#include <wx/help.h>
#include <wx/msgdlg.h>
#include <wx/config.h>
#include "GDCore/CommonTools.h"
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/PlatformDefinition/Object.h"
#include "GDCore/PlatformDefinition/Layout.h"
#include "GDCore/IDE/Dialogs/ParameterControlsHelper.h"

//Editors:
#include "GDCore/IDE/Dialogs/ChooseObjectDialog.h"
#include "GDCore/IDE/Dialogs/EditExpressionDialog.h"
#include "GDCore/IDE/Dialogs/EditStrExpressionDialog.h"
#include "GDCore/IDE/Dialogs/ChooseVariableDialog.h"
#include "GDCore/IDE/Dialogs/ChooseBehaviorDialog.h"
#include "GDCore/IDE/Dialogs/ChooseLayerDialog.h"
#include "../ChoixClavier.h"
#include "../SigneModification.h"
#include "../GeneratePassword.h"
#include "../ChoiceJoyAxis.h"
#include "../ChoiceFile.h"
#include "../SigneTest.h"
#include "../ChoixBouton.h"
#include "../TrueOrFalse.h"

using namespace std;

void ParameterEditorLauncher::LaunchEditor(wxWindow * parent, gd::Project & project, gd::Layout & layout,
	const gd::ParameterMetadata & metadata, std::vector<wxTextCtrl * > & paramEdits, unsigned int paramIndex)
{
	if (paramIndex >= paramEdits.size()) return;
	wxTextCtrl * editCtrl = paramEdits.at(paramIndex);
	if (!editCtrl) return;

    if ( gd::ParameterMetadata::IsObject(metadata.GetType()) )
    {
        gd::ChooseObjectDialog dialog(parent, project, layout, true, metadata.GetExtraInfo());
        if ( dialog.ShowModal() == 1 )
        {
            editCtrl->ChangeValue(dialog.GetChosenObject());
        }
        return;
    }
    else if ( metadata.GetType() == "behavior" )
    {
        gd::String object = paramEdits.empty() ? "" : paramEdits[0]->GetValue();
        gd::ChooseBehaviorDialog dialog(parent, project, layout, object, metadata.GetExtraInfo());
        if (dialog.DeduceBehavior() || dialog.ShowModal() == 1 )
            editCtrl->ChangeValue(dialog.GetChosenBehavior());

        return;
    }
    else if ( metadata.GetType() == "expression" )
    {
        gd::EditExpressionDialog dialog(parent, editCtrl->GetValue(), project, layout);
        if ( dialog.ShowModal() == 1 )
        {
            editCtrl->ChangeValue(dialog.GetExpression());
        }
        return;
    }
    else if ( metadata.GetType() == "mouse" )
    {
        ChoixBouton dialog(parent, editCtrl->GetValue());
        if ( dialog.ShowModal() == 1 )
        {
            editCtrl->ChangeValue(dialog.bouton);
        }
        return;
    }
    else if ( metadata.GetType() == "key" )
    {
        ChoixClavier dialog(parent, editCtrl->GetValue());
        if ( dialog.ShowModal() == 1 )
        {
            editCtrl->ChangeValue(dialog.selectedKey);
        }
        return;
    }
    else if ( metadata.GetType() == "string" )
    {
        gd::EditStrExpressionDialog dialog(parent, editCtrl->GetValue(), project, layout);
        if ( dialog.ShowModal() == 1 )
        {
            editCtrl->ChangeValue(dialog.GetExpression());
        }
        return;
    }
    else if ( metadata.GetType() == "relationalOperator" )
    {
        SigneTest dialog(parent);
        int chosenOperator = dialog.ShowModal();

        if ( chosenOperator == 1 )
            editCtrl->ChangeValue("=");
        if ( chosenOperator == 2 )
            editCtrl->ChangeValue(">");
        if ( chosenOperator == 3 )
            editCtrl->ChangeValue("<");
        if ( chosenOperator == 4 )
            editCtrl->ChangeValue(">=");
        if ( chosenOperator == 5 )
            editCtrl->ChangeValue("<=");
        if ( chosenOperator == 6 )
            editCtrl->ChangeValue("!=");

        return;
    }
    else if ( metadata.GetType() == "color" )
    {
        wxColour color = wxGetColourFromUser(parent, wxColour(0,0,0));
        if ( color.IsOk() )
        {
            wxString r; r << static_cast<int>(color.Red());
            wxString v; v << static_cast<int>(color.Green());
            wxString b; b << static_cast<int>(color.Blue());

            wxString colorStr = "\""+r+";"+v+";"+b+"\"";

            editCtrl->ChangeValue(colorStr);
        }
        return;
    }
    else if ( metadata.GetType() == "police" )
    {
        wxString projectDirectory = wxFileName::FileName(project.GetProjectFile()).GetPath();
        wxFileDialog dialog(parent, _("Choose a font ( ttf/ttc files )"), projectDirectory, "", "Polices (*.ttf, *.ttc)|*.ttf;*.ttc");
        dialog.ShowModal();

        if ( dialog.GetPath() != "" ) //Note that path is relative to the project file:
        {
            wxFileName filename(dialog.GetPath()); filename.MakeRelativeTo(projectDirectory);
            editCtrl->ChangeValue(filename.GetFullPath());
        }

        return;
    }
    else if ( metadata.GetType() == "musicfile" )
    {
        wxString projectDirectory = wxFileName::FileName(project.GetProjectFile()).GetPath();
        wxFileDialog dialog(parent, _("Choose a music ( ogg files )"), projectDirectory, "", _("Audio files (*.ogg)|*.ogg"));
        dialog.ShowModal();

        if ( dialog.GetPath() != "" ) //Note that path is relative to the project file:
        {
            wxFileName filename(dialog.GetPath()); filename.MakeRelativeTo(projectDirectory);
            editCtrl->ChangeValue(filename.GetFullPath());
        }

        return;
    }
    else if ( metadata.GetType() == "soundfile" )
    {
        wxString projectDirectory = wxFileName::FileName(project.GetProjectFile()).GetPath();
        wxFileDialog dialog(parent, _("Choose a sound"), projectDirectory, "", _("Audio files (*.wav, *.ogg)|*.wav;*.ogg"));
        dialog.ShowModal();

        if ( dialog.GetPath() != "" ) //Note that path is relative to the project file:
        {
            wxFileName filename(dialog.GetPath()); filename.MakeRelativeTo(projectDirectory);
            editCtrl->ChangeValue(filename.GetFullPath());
        }

        return;
    }
    else if ( metadata.GetType() == "operator" )
    {
        SigneModification dialog(parent);
        int retour = dialog.ShowModal();

        if ( retour == 1 )
            editCtrl->ChangeValue("=");
        if ( retour == 2 )
            editCtrl->ChangeValue("+");
        if ( retour == 3 )
            editCtrl->ChangeValue("-");
        if ( retour == 4 )
            editCtrl->ChangeValue("*");
        if ( retour == 5 )
            editCtrl->ChangeValue("/");

        return;
    }
    else if ( metadata.GetType() == "password" )
    {
        GeneratePassword dialog(parent);

        if ( dialog.ShowModal() == 1 )
            editCtrl->ChangeValue(dialog.mdp);

        return;
    }
    else if ( metadata.GetType() == "trueorfalse" )
    {
        TrueOrFalse dialog(parent, _("Choose True or False to fill the parameter"), _("True or False"));
        if ( dialog.ShowModal() == 1 )
            editCtrl->ChangeValue(_("True"));
        else
            editCtrl->ChangeValue(_("False"));
    }
    else if ( metadata.GetType() == "yesorno" )
    {
        if (wxMessageBox(_("Choose yes or no to fullfil parent parameter:"), _("Yes or no") ,wxYES_NO ) == wxYES)
            editCtrl->ChangeValue(_("yes"));
        else
            editCtrl->ChangeValue(_("no"));

        return;
    }
    else if ( metadata.GetType() == "layer" )
    {
        gd::ChooseLayerDialog dialog(parent, layout);
        if( dialog.ShowModal() == 1 )
            editCtrl->ChangeValue(dialog.GetChosenLayer());

        return;
    }
    else if ( metadata.GetType() == "joyaxis" )
    {
        ChoiceJoyAxis dialog(parent, editCtrl->GetValue(), project, layout);
        if( dialog.ShowModal() == 1 )
            editCtrl->ChangeValue(dialog.joyaxis);

        return;
    }
    else if ( metadata.GetType() == "file" )
    {
        ChoiceFile dialog(parent, editCtrl->GetValue(), project, layout);

        if ( dialog.ShowModal() == 1 )
            editCtrl->ChangeValue(dialog.file);

        return;
    }
    else if ( metadata.GetType() == "objectvar" )
    {
        if ( paramEdits.empty() ) return;

        gd::String objectWanted = paramEdits[0]->GetValue();
        gd::Object * object = NULL;

        if ( layout.HasObjectNamed(objectWanted) )
            object = &layout.GetObject(objectWanted);
        else if ( project.HasObjectNamed(objectWanted) )
            object = &project.GetObject(objectWanted);
        else
            return;

        gd::ChooseVariableDialog dialog(parent, object->GetVariables());
        dialog.SetAssociatedObject(&project, &layout, object);
        if ( dialog.ShowModal() == 1 )
            editCtrl->ChangeValue(dialog.GetSelectedVariable());

        return;
    }
    else if ( metadata.GetType() == "scenevar" )
    {
        gd::ChooseVariableDialog dialog(parent, layout.GetVariables());
        dialog.SetAssociatedLayout(&project, &layout);
        if ( dialog.ShowModal() == 1 )
            editCtrl->ChangeValue(dialog.GetSelectedVariable());

        return;
    }
    else if ( metadata.GetType() == "globalvar" )
    {
        gd::ChooseVariableDialog dialog(parent, project.GetVariables());
        dialog.SetAssociatedProject(&project);
        if ( dialog.ShowModal() == 1 )
            editCtrl->ChangeValue(dialog.GetSelectedVariable());

        return;
    }
}
