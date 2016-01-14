/*
 * GDevelop JS Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include "JsCodeEventDialog.h"
#include "GDCore/CommonTools.h"
#include "GDCore/IDE/Dialogs/ChooseObjectDialog.h"
#include "GDCore/IDE/Dialogs/EventsEditor/EventsRenderingHelper.h"
#include "GDJS/Events/Builtin/JsCodeEvent.h"

enum
{
    MARGIN_LINE_NUMBERS,
    MARGIN_FOLD
};

JsCodeEventDialog::JsCodeEventDialog(wxWindow* parent, gdjs::JsCodeEvent & event_, gd::Project & project_, gd::Layout & layout_)
    : BaseJsCodeEventDialog(parent),
    event(event_),
    project(project_),
    layout(layout_)
{
	//Customize the code editor
	codeEdit->SetLexer(wxSTC_LEX_ESCRIPT);
    codeEdit->StyleSetFont(wxSTC_STYLE_DEFAULT, gd::EventsRenderingHelper::Get()->GetFont());
    for(unsigned int i = 0;i<12;++i) codeEdit->StyleSetFont(i, gd::EventsRenderingHelper::Get()->GetFont());
	codeEdit->StyleSetBackground(34, wxColour(119, 255, 119)); //Brace
	codeEdit->StyleSetBackground(35, wxColour(255, 119, 119)); //Brace
    codeEdit->StyleSetForeground(wxSTC_ESCRIPT_STRING, *wxBLUE);
    codeEdit->StyleSetForeground(wxSTC_ESCRIPT_OPERATOR, *wxRED);
    codeEdit->StyleSetForeground(wxSTC_ESCRIPT_IDENTIFIER, wxColour(40,0,60));
    codeEdit->StyleSetForeground(wxSTC_ESCRIPT_WORD, wxColour(0,0,150));
    codeEdit->StyleSetForeground(wxSTC_ESCRIPT_WORD2, wxColour(0,150,0));
    codeEdit->StyleSetForeground(wxSTC_ESCRIPT_WORD3, wxColour(0,150,0));
    codeEdit->StyleSetForeground(wxSTC_ESCRIPT_COMMENT, wxColour(0,78,193));
    codeEdit->StyleSetForeground(wxSTC_ESCRIPT_COMMENTLINE, wxColour(0,78,193));
    codeEdit->StyleSetForeground(wxSTC_ESCRIPT_NUMBER, wxColour(203,73,170));
    codeEdit->StyleSetBold(wxSTC_ESCRIPT_WORD, true);
    codeEdit->StyleSetBold(wxSTC_ESCRIPT_WORD2, true);
    codeEdit->SetKeyWords(0, wxT("break case catch continue default delete do else finally for function if in instanceof new return switch this throw try typeof var void while with"));
    codeEdit->SetKeyWords(1, wxT("null true false"));
    codeEdit->SetKeyWords(2, wxT("push join slice splice Math exec match split length toString alert window"));
    codeEdit->SetTabWidth(4);

    codeEdit->SetMarginWidth (MARGIN_LINE_NUMBERS, 20);
    codeEdit->StyleSetForeground (wxSTC_STYLE_LINENUMBER, wxColour (75, 75, 75) );
    codeEdit->StyleSetBackground (wxSTC_STYLE_LINENUMBER, wxColour (220, 220, 220));
    codeEdit->SetMarginType (MARGIN_LINE_NUMBERS, wxSTC_MARGIN_NUMBER);

	objectsEdit->SetValue(event.GetParameterObjects());
	codeEdit->SetText(event.GetInlineCode());
}

JsCodeEventDialog::~JsCodeEventDialog()
{
}
void JsCodeEventDialog::onHelpBtClick(wxHyperlinkEvent& event)
{
}

void JsCodeEventDialog::onObjectsButtonClick(wxCommandEvent& event)
{
    gd::ChooseObjectDialog dialog(this, project, layout, true);
    if ( dialog.ShowModal() == 1 )
        objectsEdit->ChangeValue(dialog.GetChosenObject());
}

void JsCodeEventDialog::onOkBtClick(wxCommandEvent&)
{
	event.SetInlineCode(codeEdit->GetText());
	event.SetParameterObjects(objectsEdit->GetValue());
	EndModal(1);
}

void JsCodeEventDialog::onCancelBtClick(wxCommandEvent& event)
{
	EndModal(0);
}
#endif
