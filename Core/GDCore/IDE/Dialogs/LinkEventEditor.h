#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#ifndef LINKEVENTEDITOR_H
#define LINKEVENTEDITOR_H

#include "GDCoreDialogs.h"

#include "GDCore/Events/Builtin/LinkEvent.h"
namespace gd { class Project; }

namespace gd
{

class LinkEventEditor : public LinkEventEditorBase
{
public:
    LinkEventEditor(wxWindow* parent, LinkEvent & event, const gd::Project & project);
    virtual ~LinkEventEditor();

protected:
    virtual void OnIncludeByIndexRadioButtonClicked(wxCommandEvent& event);
    virtual void OnIncludeAllEventsRadioButtonClicked(wxCommandEvent& event);
    virtual void OnCancelButtonClicked(wxCommandEvent& event);
    virtual void OnEventsComboBoxTextChanged(wxCommandEvent& event);
    virtual void OnEventsGroupComboBoxTextChanged(wxCommandEvent& event);
    virtual void OnIncludeEventsGroupRadioButtonClicked(wxCommandEvent& event);
    virtual void OnOkButtonClicked(wxCommandEvent& event);

private:
    void EnableControls();

    void UpdateEventsGroupsList();

    LinkEvent & editedEvent;
    const gd::Project & project;
};

}

#endif // LINKEVENTEDITOR_H
#endif
