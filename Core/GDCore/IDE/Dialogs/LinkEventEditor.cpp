
#include "LinkEventEditor.h"

#include <sstream>
#include "GDCore/IDE/wxTools/SkinHelper.h"
#include "GDCore/Tools/HelpFileAccess.h"
#include "GDCore/Events/Builtin/LinkEvent.h"
#include "GDCore/Project/ExternalEvents.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/CommonTools.h"
#include <wx/help.h>

namespace gd
{

LinkEventEditor::LinkEventEditor(wxWindow* parent, LinkEvent & event, const gd::Project & game)
    : LinkEventEditorBase(parent),
    editedEvent(event),
    game(game)
{
    //Add all the scenes and external events into the combobox.
    for (std::size_t i = 0; i < game.GetExternalEventsCount(); ++i)
        m_eventsComboBox->Append(game.GetExternalEvents(i).GetName());
    for (std::size_t i = 0; i < game.GetLayoutsCount(); ++i)
    	m_eventsComboBox->Append(game.GetLayout(i).GetName());

    m_includeAllEventsRadio->SetValue(editedEvent.GetIncludeConfig() == LinkEvent::INCLUDE_ALL);
    m_includeEventsGroupRadio->SetValue(editedEvent.GetIncludeConfig() == LinkEvent::INCLUDE_EVENTS_GROUP);
    m_includeEventsByIndexRadio->SetValue(editedEvent.GetIncludeConfig() == LinkEvent::INCLUDE_BY_INDEX);

    //Display the deprecated features if the event was using them
    m_includeEventsByIndexRadio->Show(editedEvent.GetIncludeConfig() == LinkEvent::INCLUDE_BY_INDEX);
    m_deprecatedPanel->Show(editedEvent.GetIncludeConfig() == LinkEvent::INCLUDE_BY_INDEX);
    GetSizer()->Fit(this);

    EnableControls();
}

LinkEventEditor::~LinkEventEditor()
{

}

void LinkEventEditor::OnCancelButtonClicked(wxCommandEvent& event)
{
    EndModal(0);
}

void LinkEventEditor::OnOkButtonClicked(wxCommandEvent& event)
{
    EndModal(1);
}

void LinkEventEditor::OnEventsComboBoxTextChanged(wxCommandEvent& event)
{

}

void LinkEventEditor::OnEventsGroupComboBoxTextChanged(wxCommandEvent& event)
{

}

void LinkEventEditor::OnIncludeEventsGroupRadioButtonClicked(wxCommandEvent& event)
{
    EnableControls();
}

void LinkEventEditor::OnIncludeAllEventsRadioButtonClicked(wxCommandEvent& event)
{
    EnableControls();
}

void LinkEventEditor::OnIncludeByIndexRadioButtonClicked(wxCommandEvent& event)
{
    EnableControls();
}

void LinkEventEditor::EnableControls()
{
    m_eventsGroupComboBox->Enable(m_includeEventsGroupRadio->GetValue());

    m_startTextCtrl->Enable(m_includeEventsByIndexRadio->GetValue());
    m_endTextCtrl->Enable(m_includeEventsByIndexRadio->GetValue());
}

}
