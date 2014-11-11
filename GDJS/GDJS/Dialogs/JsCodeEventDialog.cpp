#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include "JsCodeEventDialog.h"
#include "GDCore/CommonTools.h"
#include "GDCore/IDE/Dialogs/ChooseObjectDialog.h"
#include "GDJS/JsCodeEvent.h"

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
    #if defined(WINDOWS)
    wxFont font(9, wxFONTFAMILY_TELETYPE, wxFONTSTYLE_NORMAL, wxFONTWEIGHT_NORMAL, false, "Consolas");
    #else
	wxFont font(9, wxFONTFAMILY_TELETYPE, wxFONTSTYLE_NORMAL, wxFONTWEIGHT_NORMAL);
	#endif

	codeEdit->StyleSetFont(wxSTC_STYLE_DEFAULT, font);
	codeEdit->StyleSetBackground(34, wxColour(119, 255, 119)); //Brace
	codeEdit->StyleSetBackground(35, wxColour(255, 119, 119)); //Brace
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
	event.SetInlineCode(gd::ToString(codeEdit->GetText()));
	event.SetParameterObjects(gd::ToString(objectsEdit->GetValue()));
	EndModal(1);
}

void JsCodeEventDialog::onCancelBtClick(wxCommandEvent& event)
{
	EndModal(0);
}
#endif
