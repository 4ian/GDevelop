#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
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
    for ( std::size_t i = 0; i < game.GetExternalEventsCount(); ++i )
        m_eventsComboBox->Append( game.GetExternalEvents(i).GetName() );
    for ( std::size_t i = 0; i < game.GetLayoutsCount(); ++i )
    	m_eventsComboBox->Append( game.GetLayout(i).GetName() );

    m_includeAllEventsRadio->SetValue( editedEvent.GetIncludeConfig() == LinkEvent::INCLUDE_ALL );
    m_includeEventsGroupRadio->SetValue( editedEvent.GetIncludeConfig() == LinkEvent::INCLUDE_EVENTS_GROUP );
    m_includeEventsByIndexRadio->SetValue( editedEvent.GetIncludeConfig() == LinkEvent::INCLUDE_BY_INDEX );

    m_eventsComboBox->SetValue( editedEvent.GetTarget() );
    if ( editedEvent.GetIncludeConfig() == LinkEvent::INCLUDE_EVENTS_GROUP )
    {
        m_eventsGroupComboBox->SetValue(editedEvent.GetEventsGroupName());
    }
    else if ( editedEvent.GetIncludeConfig() == LinkEvent::INCLUDE_BY_INDEX )
    {
        m_startTextCtrl->SetValue( gd::String::From<std::size_t>( editedEvent.GetIncludeStart() + 1 ) );
        m_endTextCtrl->SetValue( gd::String::From<std::size_t>( editedEvent.GetIncludeEnd() + 1 ) );
    }

    //Display the deprecated features if the event was using them
    m_includeEventsByIndexRadio->Show( editedEvent.GetIncludeConfig() == LinkEvent::INCLUDE_BY_INDEX );
    m_deprecatedPanel->Show( editedEvent.GetIncludeConfig() == LinkEvent::INCLUDE_BY_INDEX );
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
    editedEvent.SetTarget( m_eventsComboBox->GetValue() );
    if ( m_includeAllEventsRadio->GetValue() )
    {
        editedEvent.SetIncludeAllEvents();
    }
    else if ( m_includeEventsGroupRadio->GetValue() )
    {
        editedEvent.SetIncludeEventsGroup( m_eventsGroupComboBox->GetValue() );
    }
    else if ( m_includeEventsByIndexRadio->GetValue() )
    {
        editedEvent.SetIncludeStartAndEnd(
            gd::String( m_startTextCtrl->GetValue() ).To<std::size_t>() - 1,
            gd::String( m_endTextCtrl->GetValue() ).To<std::size_t>() - 1
        );
    }

    EndModal(1);
}

void LinkEventEditor::OnEventsComboBoxTextChanged(wxCommandEvent& event)
{
    UpdateEventsGroupsList();
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

void LinkEventEditor::UpdateEventsGroupsList()
{

}

}

#endif
