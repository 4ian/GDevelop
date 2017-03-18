#include "ExternalEditorPanel.h"

ExternalEditorPanel::ExternalEditorPanel(wxWindow* parent)
    : ExternalEditorPanelBase(parent)
{
}

ExternalEditorPanel::~ExternalEditorPanel()
{
}

void ExternalEditorPanel::onOpenEditorClicked(wxCommandEvent& event)
{
    if (onOpenEditorCb) onOpenEditorCb();
}

void ExternalEditorPanel::OnOpenEditor(std::function<void()> cb)
{
    onOpenEditorCb = cb;
}
