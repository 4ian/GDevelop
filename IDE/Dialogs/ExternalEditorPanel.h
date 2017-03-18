#ifndef EXTERNALEDITORPANEL_H
#define EXTERNALEDITORPANEL_H
#include "GDIDEDialogs.h"
#include <functional>

class ExternalEditorPanel : public ExternalEditorPanelBase
{
public:
    ExternalEditorPanel(wxWindow* parent);
    virtual ~ExternalEditorPanel();

    void OnOpenEditor(std::function<void()> cb);

protected:
    virtual void onOpenEditorClicked(wxCommandEvent& event);

    std::function<void()> onOpenEditorCb;
};
#endif // EXTERNALEDITORPANEL_H
