/*
 * GDevelop Core
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include <wx/wx.h>
#include <vector>
#include <string>
#include <iostream>
#include "GDCore/CommonTools.h"
#include "GDCore/IDE/CommonBitmapManager.h"
#include "GDCore/IDE/InstructionSentenceFormatter.h"
#include "ParameterControlsHelper.h"
class wxCheckBox;
class wxPanel;
class wxStaticText;
class wxPanel;
class wxBitmapButton;
class wxTextCtrl;

using namespace std;

namespace gd
{

const long ParameterControlsHelper::ID_EDITARRAY = wxNewId();
const long ParameterControlsHelper::ID_TEXTARRAY = wxNewId();
const long ParameterControlsHelper::ID_BUTTONARRAY = wxNewId();
const long ParameterControlsHelper::ID_CHECKARRAY = wxNewId();

void ParameterControlsHelper::UpdateControls(unsigned int count)
{
    if (!sizer || !window) return;

    paramMetadata.resize(count);
    while ( paramEdits.size() < count )
    {
        const string num = gd::ToString( paramEdits.size() );
        long id = wxNewId(); //Bitmap buttons want an unique id so as to be displayed properly

        //Addings controls
        paramCheckboxes.push_back(new wxCheckBox(window, ID_CHECKARRAY, "", wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, num));
        paramTexts.push_back(new wxStaticText(window, ID_TEXTARRAY, _("Parameter:"), wxDefaultPosition, wxDefaultSize, 0, _T( "TxtPara" + num )));
        paramSpacers1.push_back(new wxPanel(window));
        paramSpacers2.push_back(new wxPanel(window));
        paramEdits.push_back(new wxTextCtrl( window, ID_EDITARRAY, "", wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T( "EditPara" + num )));
        paramBmpBts.push_back(new wxBitmapButton( window, id, gd::CommonBitmapManager::Get()->expressionBt, wxDefaultPosition, wxDefaultSize, wxBU_AUTODRAW, wxDefaultValidator, num));

        //Connecting events
        window->Bind(wxEVT_COMMAND_BUTTON_CLICKED, &ParameterControlsHelper::OnParameterBtClick, this, id);
        window->Bind(wxEVT_COMMAND_CHECKBOX_CLICKED, &ParameterControlsHelper::OnOptionalCheckboxClick, this, ID_CHECKARRAY);

        //Placing controls
        sizer->Add( paramCheckboxes.back(), 0, wxALL | wxALIGN_LEFT | wxALIGN_CENTER_VERTICAL, 5 );
        sizer->Add( paramTexts.back(), 1, wxALL | wxALIGN_LEFT | wxEXPAND | wxALIGN_CENTER_VERTICAL, 5 );
        sizer->Add( paramSpacers1.back(), 0, 0 );
        sizer->Add( paramSpacers2.back(), 0, 0 );
        sizer->Add( paramEdits.back(), 1, wxALL | wxALIGN_LEFT | wxEXPAND | wxALIGN_CENTER_VERTICAL, 5 );
        sizer->Add( paramBmpBts.back(), 0, wxALL | wxALIGN_LEFT | wxEXPAND | wxALIGN_CENTER_VERTICAL, 5 );

        paramSpacers1.back()->Show(false);
        paramSpacers2.back()->Show(false);
    }
    while ( paramEdits.size() > count )
    {
        paramCheckboxes.back()->Destroy();
        paramCheckboxes.erase(paramCheckboxes.begin()+paramCheckboxes.size()-1);
        paramTexts.back()->Destroy();
        paramTexts.erase(paramTexts.begin()+paramTexts.size()-1);
        paramSpacers1.back()->Destroy();
        paramSpacers1.erase(paramSpacers1.begin()+paramSpacers1.size()-1);
        paramSpacers2.back()->Destroy();
        paramSpacers2.erase(paramSpacers2.begin()+paramSpacers2.size()-1);
        paramEdits.back()->Destroy();
        paramEdits.erase(paramEdits.begin()+paramEdits.size()-1);
        paramBmpBts.back()->Destroy();
        paramBmpBts.erase(paramBmpBts.begin()+paramBmpBts.size()-1);
    }

    window->Layout(); //Ensure widgets just added are properly rendered.
}

void ParameterControlsHelper::UpdateParameterContent(unsigned int i, const ParameterMetadata & metadata, std::string content)
{
    if (i >= paramEdits.size()) return;
    paramMetadata[i] = metadata;

    if (metadata.IsCodeOnly())
    {
        paramCheckboxes.at(i)->Show(false);
        paramTexts.at(i)->Show(false);
        paramBmpBts.at(i)->Show(false);
        paramEdits.at(i)->Show(false);
        return;
    }

    const std::string & type = metadata.GetType();
    paramCheckboxes.at(i)->Show(metadata.IsOptional());
    paramTexts.at(i)->Show();
    paramBmpBts.at(i)->Show(!type.empty());
    paramEdits.at(i)->Show();

    paramCheckboxes.at(i)->SetValue(!paramEdits.at(i)->GetValue().empty());
    paramTexts.at(i)->SetLabel( metadata.GetDescription() + _(":") );
    paramBmpBts.at(i)->SetBitmapLabel( gd::InstructionSentenceFormatter::Get()->BitmapFromType(type));
    paramBmpBts.at(i)->SetToolTip( gd::InstructionSentenceFormatter::Get()->LabelFromType(type));
    paramEdits.at(i)->SetValue(content);

    //De/activate widgets if parameter is optional
    bool disable = metadata.IsOptional() && !paramCheckboxes.at(i)->GetValue() && paramEdits.at(i)->GetValue().empty();
    paramCheckboxes.at(i)->SetValue(!disable);
    paramTexts.at(i)->Enable(!disable);
    paramBmpBts.at(i)->Enable(!disable);
    paramEdits.at(i)->Enable(!disable);

    //Add defaults
    if (!metadata.IsOptional() && content.empty())
    {
        if ( type == "expression" ) paramEdits.at(i)->SetValue("0");
        else if ( type == "string" ) paramEdits.at(i)->SetValue("\"\"");
        else if ( type == "operator" ) paramEdits.at(i)->SetValue("=");
    }
}

void ParameterControlsHelper::OnOptionalCheckboxClick(wxCommandEvent& event)
{
    unsigned int i = gd::ToInt(gd::ToString(window->FindFocus()->GetName()));
    if (i >= paramCheckboxes.size()) return;

    bool enable = paramCheckboxes.at(i)->GetValue();
    paramBmpBts.at(i)->Enable(enable);
    paramTexts.at(i)->Enable(enable);
    paramEdits.at(i)->Enable(enable);
}

void ParameterControlsHelper::OnParameterBtClick(wxCommandEvent& event)
{
    unsigned int i = ToInt(gd::ToString(wxWindow::FindFocus()->GetName()));
    if (i >= paramMetadata.size() || i >= paramEdits.size()) return;
    if (!editionCallback) return;

    const ParameterMetadata & metadata = paramMetadata[i];
    editionCallback(*editionCallbackProject, *editionCallbackLayout, metadata, paramEdits, i);

    /*
    if ( gd::ParameterMetadata::IsObject(metadata.GetType()) )
    {
        gd::ChooseObjectDialog dialog(this, game, scene, true, metadata.GetExtraInfo());
        if ( dialog.ShowModal() == 1 )
        {
            paramEdits.at(i)->ChangeValue(dialog.GetChosenObject());
        }
        return;
    }
    else if ( metadata.GetType() == "automatism" )
    {
        std::string object = paramEdits.empty() ? "" : paramEdits[0]->GetValue().mb_str();
        gd::ChooseAutomatismDialog dialog(this, game, scene, object, metadata.GetExtraInfo());
        if ( dialog.ShowModal() == 1 )
            paramEdits.at(i)->ChangeValue(dialog.GetChosenAutomatism());

        return;
    }
    else if ( metadata.GetType() == "expression" )
    {
        gd::EditExpressionDialog dialog(this, ToString( paramEdits.at(i)->GetValue() ), game, scene);
        if ( dialog.ShowModal() == 1 )
        {
            paramEdits.at(i)->ChangeValue(dialog.GetExpression());
        }
        return;
    }
    else if ( metadata.GetType() == "mouse" )
    {
        ChoixBouton dialog(this, ToString( paramEdits.at(i)->GetValue() ));
        if ( dialog.ShowModal() == 1 )
        {
            paramEdits.at(i)->ChangeValue(dialog.bouton);
        }
        return;
    }
    else if ( metadata.GetType() == "key" )
    {
        ChoixClavier dialog(this, ToString( paramEdits.at(i)->GetValue() ));
        if ( dialog.ShowModal() == 1 )
        {
            paramEdits.at(i)->ChangeValue(dialog.selectedKey);
        }
        return;
    }
    else if ( metadata.GetType() == "string" )
    {
        gd::EditStrExpressionDialog dialog(this, ToString( paramEdits.at(i)->GetValue() ), game, scene);
        if ( dialog.ShowModal() == 1 )
        {
            paramEdits.at(i)->ChangeValue(dialog.GetExpression());
        }
        return;
    }
    else if ( metadata.GetType() == "relationalOperator" )
    {
        SigneTest dialog(this);
        int chosenOperator = dialog.ShowModal();

        if ( chosenOperator == 1 )
            paramEdits.at(i)->ChangeValue("=");
        if ( chosenOperator == 2 )
            paramEdits.at(i)->ChangeValue(">");
        if ( chosenOperator == 3 )
            paramEdits.at(i)->ChangeValue("<");
        if ( chosenOperator == 4 )
            paramEdits.at(i)->ChangeValue(">=");
        if ( chosenOperator == 5 )
            paramEdits.at(i)->ChangeValue("<=");
        if ( chosenOperator == 6 )
            paramEdits.at(i)->ChangeValue("!=");

        return;
    }
    else if ( metadata.GetType() == "color" )
    {
        wxColour color = wxGetColourFromUser(this, wxColour(0,0,0));
        if ( color.IsOk() )
        {
            wxString r; r << static_cast<int>(color.Red());
            wxString v; v << static_cast<int>(color.Green());
            wxString b; b << static_cast<int>(color.Blue());

            paramEdits.at(i)->ChangeValue("\""+r+";"+v+";"+b+"\"");
        }
        return;
    }
    else if ( metadata.GetType() == "police" )
    {
        wxString gameDirectory = wxFileName::FileName(game.GetProjectFile()).GetPath();
        wxFileDialog dialog(this, _("Choose a font ( ttf/ttc files )"), gameDirectory, "", "Polices (*.ttf, *.ttc)|*.ttf;*.ttc");
        dialog.ShowModal();

        if ( dialog.GetPath() != "" ) //Note that path is relative to the project file:
        {
            wxFileName filename(dialog.GetPath()); filename.MakeRelativeTo(gameDirectory);
            paramEdits[i]->ChangeValue(filename.GetFullPath());
        }

        return;
    }
    else if ( metadata.GetType() == "musicfile" )
    {
        wxString gameDirectory = wxFileName::FileName(game.GetProjectFile()).GetPath();
        wxFileDialog dialog(this, _("Choose a music ( ogg files )"), gameDirectory, "", _("Audio files (*.ogg)|*.ogg"));
        dialog.ShowModal();

        if ( dialog.GetPath() != "" ) //Note that path is relative to the project file:
        {
            wxFileName filename(dialog.GetPath()); filename.MakeRelativeTo(gameDirectory);
            paramEdits[i]->ChangeValue(filename.GetFullPath());
        }

        return;
    }
    else if ( metadata.GetType() == "soundfile" )
    {
        wxString gameDirectory = wxFileName::FileName(game.GetProjectFile()).GetPath();
        wxFileDialog dialog(this, _("Choose a sound"), gameDirectory, "", _("Audio files (*.wav, *.ogg)|*.wav;*.ogg"));
        dialog.ShowModal();

        if ( dialog.GetPath() != "" ) //Note that path is relative to the project file:
        {
            wxFileName filename(dialog.GetPath()); filename.MakeRelativeTo(gameDirectory);
            paramEdits[i]->ChangeValue(filename.GetFullPath());
        }

        return;
    }
    else if ( metadata.GetType() == "operator" )
    {
        SigneModification dialog(this);
        int retour = dialog.ShowModal();

        if ( retour == 1 )
            paramEdits.at(i)->ChangeValue("=");
        if ( retour == 2 )
            paramEdits.at(i)->ChangeValue("+");
        if ( retour == 3 )
            paramEdits.at(i)->ChangeValue("-");
        if ( retour == 4 )
            paramEdits.at(i)->ChangeValue("*");
        if ( retour == 5 )
            paramEdits.at(i)->ChangeValue("/");

        return;
    }
    else if ( metadata.GetType() == "password" )
    {
        GeneratePassword dialog(this);

        if ( dialog.ShowModal() == 1 )
            paramEdits.at(i)->ChangeValue(dialog.mdp);

        return;
    }
    else if ( metadata.GetType() == "trueorfalse" )
    {
        TrueOrFalse dialog(this, _("Choose True or False to fill the parameter"), _("True or False"));
        if ( dialog.ShowModal() == 1 )
            paramEdits.at(i)->ChangeValue(_("True"));
        else
            paramEdits.at(i)->ChangeValue(_("False"));
    }
    else if ( metadata.GetType() == "yesorno" )
    {
        if (wxMessageBox(_("Choose yes or no to fullfil this parameter:"), _("Yes or no") ,wxYES_NO ) == wxYES)
            paramEdits.at(i)->ChangeValue(_("yes"));
        else
            paramEdits.at(i)->ChangeValue(_("no"));

        return;
    }
    else if ( metadata.GetType() == "layer" )
    {
        gd::ChooseLayerDialog dialog(this, scene);
        if( dialog.ShowModal() == 1 )
            paramEdits.at(i)->ChangeValue(dialog.GetChosenLayer());

        return;
    }
    else if ( metadata.GetType() == "joyaxis" )
    {
        ChoiceJoyAxis dialog(this, static_cast<string>( paramEdits.at(i)->GetValue() ), game, scene);
        if( dialog.ShowModal() == 1 )
            paramEdits.at(i)->ChangeValue(dialog.joyaxis);

        return;
    }
    else if ( metadata.GetType() == "file" )
    {
        ChoiceFile dialog(this, ToString( paramEdits.at(i)->GetValue() ), game, scene);

        if ( dialog.ShowModal() == 1 )
            paramEdits[i]->ChangeValue(dialog.file);

        return;
    }
    else if ( metadata.GetType() == "objectvar" )
    {
        if ( paramEdits.empty() ) return;

        std::string objectWanted = ToString(paramEdits[0]->GetValue());
        gd::Object * object = NULL;

        if ( scene.HasObjectNamed(objectWanted) )
            object = &scene.GetObject(objectWanted);
        else if ( game.HasObjectNamed(objectWanted) )
            object = &game.GetObject(objectWanted);
        else
            return;

        gd::ChooseVariableDialog dialog(this, object->GetVariables());
        dialog.SetAssociatedObject(&game, &scene, object);
        if ( dialog.ShowModal() == 1 )
            paramEdits.at(i)->ChangeValue(dialog.GetSelectedVariable());

        return;
    }
    else if ( metadata.GetType() == "scenevar" )
    {
        gd::ChooseVariableDialog dialog(this, scene.GetVariables());
        dialog.SetAssociatedLayout(&game, &scene);
        if ( dialog.ShowModal() == 1 )
            paramEdits.at(i)->ChangeValue(dialog.GetSelectedVariable());

        return;
    }
    else if ( metadata.GetType() == "globalvar" )
    {
        gd::ChooseVariableDialog dialog(this, game.GetVariables());
        dialog.SetAssociatedProject(&game);
        if ( dialog.ShowModal() == 1 )
            paramEdits.at(i)->ChangeValue(dialog.GetSelectedVariable());

        return;
    }*/
}

ParameterControlsHelper & ParameterControlsHelper::SetSizer(wxFlexGridSizer * sizer_)
{
    sizer = sizer_;
    sizer->SetCols(3);
    sizer->AddGrowableCol(1);
    return *this;
}

}
#endif
