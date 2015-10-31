/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include <wx/wx.h>
#include <vector>
#include "GDCore/String.h"
#include <algorithm>
#include <iostream>
#include "GDCore/CommonTools.h"
#include "GDCore/IDE/wxTools/CommonBitmapProvider.h"
#include "GDCore/IDE/Events/InstructionSentenceFormatter.h"
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


ParameterControlsHelper::EditParameterFunction ParameterControlsHelper::editionCallback = NULL;
const long ParameterControlsHelper::ID_EDITARRAY = wxNewId();
const long ParameterControlsHelper::ID_TEXTARRAY = wxNewId();
const long ParameterControlsHelper::ID_BUTTONARRAY = wxNewId();
const long ParameterControlsHelper::ID_CHECKARRAY = wxNewId();

void ParameterControlsHelper::UpdateControls(std::size_t count)
{
    if (!sizer || !window) return;

    paramMetadata.resize(count);

    //Erase all parameter widgets
    sizer->Clear();

    std::function<void(wxWindow*)> destroyAllFunction = [](wxWindow *widget) {
        widget->Destroy();
    };

    std::for_each(paramCheckboxes.begin(), paramCheckboxes.end(), destroyAllFunction);
    std::for_each(paramTexts.begin(), paramTexts.end(), destroyAllFunction);
    std::for_each(paramSpacers1.begin(), paramSpacers1.end(), destroyAllFunction);
    std::for_each(paramSpacers2.begin(), paramSpacers2.end(), destroyAllFunction);
    std::for_each(paramEdits.begin(), paramEdits.end(), destroyAllFunction);
    std::for_each(paramBmpBts.begin(), paramBmpBts.end(), destroyAllFunction);

    paramCheckboxes.clear();
    paramTexts.clear();
    paramSpacers1.clear();
    paramSpacers2.clear();
    paramEdits.clear();
    paramBmpBts.clear();

    while ( paramEdits.size() < count )
    {
        const gd::String num = gd::String::From( paramEdits.size() );
        long id = wxNewId(); //Bitmap buttons want an unique id so as to be displayed properly

        //Addings controls
        paramCheckboxes.push_back(new wxCheckBox(window, ID_CHECKARRAY, "", wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, num));
        paramTexts.push_back(new wxStaticText(window, ID_TEXTARRAY, _("Parameter:"), wxDefaultPosition, wxDefaultSize, 0, "TxtPara" + num ));
        paramSpacers1.push_back(new wxPanel(window));
        paramSpacers2.push_back(new wxPanel(window));
        paramEdits.push_back(new wxTextCtrl( window, ID_EDITARRAY, "", wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, "EditPara" + num ));
        paramBmpBts.push_back(new wxBitmapButton( window, id, gd::CommonBitmapProvider::Get()->expressionBt, wxDefaultPosition, wxSize(32,-1), wxBU_AUTODRAW, wxDefaultValidator, num));
        paramBmpBts.back()->SetMinSize(wxSize(32, 32));

        //Connecting events
        window->Bind(wxEVT_COMMAND_BUTTON_CLICKED, &ParameterControlsHelper::OnParameterBtClick, this, id);
        window->Bind(wxEVT_COMMAND_CHECKBOX_CLICKED, &ParameterControlsHelper::OnOptionalCheckboxClick, this, ID_CHECKARRAY);

        //Placing controls
        sizer->Add( paramCheckboxes.back(), 0, wxALL | wxALIGN_LEFT | wxALIGN_CENTER_VERTICAL, 5 );
        sizer->Add( paramTexts.back(), 1, wxALL | wxALIGN_LEFT | wxEXPAND | wxALIGN_CENTER_VERTICAL, 5 );
        sizer->Add( paramSpacers1.back(), 0, 0 );
        sizer->Add( paramSpacers2.back(), 0, 0 );
        sizer->Add( paramEdits.back(), 1, wxALL | wxALIGN_LEFT | wxEXPAND | wxALIGN_CENTER_VERTICAL, 5 );
        sizer->Add( paramBmpBts.back(), 0, wxALL | wxALIGN_LEFT | wxFIXED_MINSIZE | wxALIGN_CENTER_VERTICAL, 5 );

        paramSpacers1.back()->Show(false);
        paramSpacers2.back()->Show(false);
    }

    window->Layout(); //Ensure widgets just added are properly rendered.
}

void ParameterControlsHelper::UpdateParameterContent(std::size_t i, const ParameterMetadata & metadata, gd::String content)
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

    const gd::String & type = metadata.GetType();
    paramCheckboxes.at(i)->Show(metadata.IsOptional());
    paramTexts.at(i)->Show();
    paramBmpBts.at(i)->Show(!type.empty());
    paramEdits.at(i)->Show();

    paramCheckboxes.at(i)->SetValue(!paramEdits.at(i)->GetValue().empty());
    paramTexts.at(i)->SetLabel(metadata.GetDescription() + _(":"));
    paramBmpBts.at(i)->SetBitmapLabel(gd::InstructionSentenceFormatter::Get()->BitmapFromType(type));
    paramBmpBts.at(i)->SetToolTip(gd::InstructionSentenceFormatter::Get()->LabelFromType(type));
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
        if (!metadata.GetDefaultValue().empty()) paramEdits.at(i)->SetValue(metadata.GetDefaultValue());
        else if ( type == "expression" ) paramEdits.at(i)->SetValue("0");
        else if ( type == "string" ) paramEdits.at(i)->SetValue("\"\"");
        else if ( type == "operator" ) paramEdits.at(i)->SetValue("=");
    }
}

void ParameterControlsHelper::OnOptionalCheckboxClick(wxCommandEvent& event)
{
    wxWindow * control = dynamic_cast<wxWindow*>(event.GetEventObject());
    if (!control) return;

    std::size_t i = gd::String(control->GetName()).To<std::size_t>();
    if (i >= paramCheckboxes.size()) return;

    bool enable = paramCheckboxes.at(i)->GetValue();
    paramBmpBts.at(i)->Enable(enable);
    paramTexts.at(i)->Enable(enable);
    paramEdits.at(i)->Enable(enable);
}

void ParameterControlsHelper::OnParameterBtClick(wxCommandEvent& event)
{
    wxWindow * control = dynamic_cast<wxWindow*>(event.GetEventObject());
    if (!control) return;

    std::size_t i = gd::String(control->GetName()).To<std::size_t>();
    if (i >= paramMetadata.size() || i >= paramEdits.size()) return;
    if (!editionCallback || !editionCallbackProject || !editionCallbackLayout) return;

    const ParameterMetadata & metadata = paramMetadata[i];
    editionCallback(window, *editionCallbackProject, *editionCallbackLayout, metadata, paramEdits, i);
}

ParameterControlsHelper & ParameterControlsHelper::SetWindowAndSizer(wxWindow * window_, wxFlexGridSizer * sizer_)
{
    window = window_;
    sizer = sizer_;

    if(sizer)
    {
        sizer->SetCols(3);
        sizer->AddGrowableCol(1);
    }
    return *this;
}

}
#endif
