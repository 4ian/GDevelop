#include "ExternalEditorPanel.h"

ExternalEditorPanel::ExternalEditorPanel(wxWindow* parent)
    : ExternalEditorPanelBase(parent)
{
    loadingProgress->Pulse();
    HideLoader(false);
}

ExternalEditorPanel::~ExternalEditorPanel()
{
}

void ExternalEditorPanel::HideLoader(bool hide)
{
    loadingProgress->Show(!hide);
    openButton->Show(hide);
    captionText->SetLabel(hide ?
        _("Click to show the scene editor:") :
        _("The editor is being loaded... (this can take a few seconds)")
    );
}

void ExternalEditorPanel::onOpenEditorClicked(wxCommandEvent& event)
{
    if (onOpenEditorCb) onOpenEditorCb();
}

void ExternalEditorPanel::OnOpenEditor(std::function<void()> cb)
{
    onOpenEditorCb = cb;
}
