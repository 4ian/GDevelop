#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include "JsCodeEventDialog.h"
#include "GDCore/CommonTools.h"
#include "GDCore/IDE/Dialogs/ChooseObjectDialog.h"
#include "GDJS/JsCodeEvent.h"

JsCodeEventDialog::JsCodeEventDialog(wxWindow* parent, gdjs::JsCodeEvent & event_, gd::Project & project_, gd::Layout & layout_)
    : BaseJsCodeEventDialog(parent),
    event(event_),
    project(project_),
    layout(layout_)
{
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
