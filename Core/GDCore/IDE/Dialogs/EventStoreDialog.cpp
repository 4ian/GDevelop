/*
 * GDevelop Core
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include <sstream>
#include <ctime>
#include "EventStoreDialog.h"
#include "GDCore/Serialization/Serializer.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/IDE/EventsRefactorer.h"
#include "GDCore/CommonTools.h"
#include "SFML/Network.hpp"
#include <wx/htmllbox.h>

namespace gd
{

const std::string EventStoreDialog::host = "http://localhost";
const int EventStoreDialog::port = 3000;

EventStoreDialog::EventStoreDialog(wxWindow* parent, gd::Project & project_, gd::Layout & layout_)
    : BaseEventStoreDialog(parent),
    project(project_),
    layout(layout_),
    parametersHelper(this, paramCheckboxes, paramSpacers1, paramTexts, paramSpacers2, paramBmpBts, paramEdits)
{
    parametersHelper.SetSizer(parametersSizer);
    templatesList->Connect(wxEVT_COMMAND_LISTBOX_SELECTED, wxCommandEventHandler(EventStoreDialog::OnSelectionChanged), NULL, this);

	FetchTemplates();
	RefreshList();
    okBt->Enable(false);
}

EventStoreDialog::~EventStoreDialog()
{
}

sf::Http::Response::Status EventStoreDialog::FetchTemplates()
{
    // Create request
    sf::Http Http(host, port);
    sf::Http::Request request;
    request.setMethod(sf::Http::Request::Get);
    request.setUri("/events/");

    // Send the request
    sf::Http::Response response = Http.sendRequest(request, sf::seconds(2));

    if (response.getStatus() == sf::Http::Response::Ok)
        templates = Serializer::FromJSON(response.getBody());

    return response.getStatus();
}

sf::Http::Response::Status EventStoreDialog::FetchTemplate(std::string id)
{
    nameTxt->SetLabel("Loading the template...");
    descriptionTxt->SetLabel("");

    wxSafeYield();

    // Create request
    sf::Http Http(host, port);
    sf::Http::Request request;
    request.setMethod(sf::Http::Request::Get);
    request.setUri("/events/"+id);

    // Send the request
    sf::Http::Response response = Http.sendRequest(request, sf::seconds(2));

    if (response.getStatus() == sf::Http::Response::Ok)
        loadedTemplate = Serializer::FromJSON(response.getBody());

    return response.getStatus();
}

void EventStoreDialog::RefreshList()
{
	templatesList->Clear();
	templates.ConsiderAsArrayOf("Template");
	for (unsigned int i = 0;i<templates.GetChildrenCount();++i) {
		const SerializerElement & eventTemplate = templates.GetChild(i);
        wxString name = eventTemplate.GetChild("name").GetValue().GetString();
        wxString desc = eventTemplate.GetChild("description").GetValue().GetString();
		wxString id = eventTemplate.GetChild("_id").GetValue().GetString();
        if (desc.size() > 50) {
            desc.Truncate(50).Append(_("..."));
        }

        wxStringClientData * data = new wxStringClientData(id);
		templatesList->Append("<b>"+name+"</b><br>"+desc, data);
	}
}

void EventStoreDialog::RefreshTemplate()
{
    okBt->Enable();
    nameTxt->SetLabel(loadedTemplate.GetChild("name").GetValue().GetString());
    descriptionTxt->SetLabel(loadedTemplate.GetChild("description").GetValue().GetString());

    RefreshParameters();
}

void EventStoreDialog::RefreshParameters()
{
    const SerializerElement & parameters = loadedTemplate.GetChild("parameters");
    parameters.ConsiderAsArrayOf("Parameter");
    parametersHelper.UpdateControls(parameters.GetChildrenCount());

    for (unsigned int i = 0;i<parameters.GetChildrenCount();++i)
    {
        const SerializerElement & parameter = parameters.GetChild(i);

        gd::ParameterMetadata metadata;
        metadata.type = parameter.GetChild("type").GetValue().GetString();
        metadata.description = parameter.GetChild("description").GetValue().GetString();
        parametersHelper.UpdateParameterContent(i, metadata,
            parameter.GetChild("value").GetValue().GetString());
    }
}

void EventStoreDialog::InstantiateTemplate()
{
    //Create the group event that will contain the template
    gd::GroupEvent emptyEvent;
    groupEvent = emptyEvent;
    groupEvent.SetType("BuiltinCommonInstructions::Group");
    groupEvent.SetName(loadedTemplate.GetChild("name").GetValue().GetString());
    groupEvent.SetCreationTimestamp(std::time(0));
    groupEvent.SetSource(host+"/events/"+loadedTemplate.GetChild("_id").GetValue().GetString());

    //Insert the template events
    gd::EventsList templateEvents;
    templateEvents.UnserializeFrom(project,
        gd::Serializer::FromJSON(loadedTemplate.GetChild("content").GetValue().GetString()));
    groupEvent.GetSubEvents().InsertEvents(templateEvents, 0, templateEvents.GetEventsCount());

    const SerializerElement & parameters = loadedTemplate.GetChild("parameters");
    parameters.ConsiderAsArrayOf("Parameter");
    parametersHelper.UpdateControls(parameters.GetChildrenCount());

    for (unsigned int i = 0;i<parameters.GetChildrenCount() && i < paramEdits.size();++i)
    {
        const SerializerElement & parameter = parameters.GetChild(i);
        std::string newValue = gd::ToString(paramEdits[i]->GetValue());

        groupEvent.GetCreationParameters().push_back(newValue);

        gd::EventsRefactorer::ReplaceStringInEvents(project, layout, groupEvent.GetSubEvents(),
            parameter.GetChild("value").GetValue().GetString(), newValue, true, true, true);
    }
}

void EventStoreDialog::OnCancelBtClick(wxCommandEvent& event)
{
	EndModal(0);
}
void EventStoreDialog::OnOkBtClick(wxCommandEvent& event)
{
    InstantiateTemplate();
	EndModal(1);
}
void EventStoreDialog::OnSearchCtrlText(wxCommandEvent& event)
{
}

void EventStoreDialog::OnSelectionChanged(wxCommandEvent& event)
{
    int selectedId = templatesList->GetSelection();
    if (selectedId == wxNOT_FOUND)
        return;

    wxStringClientData * data = dynamic_cast<wxStringClientData*>(templatesList->GetClientObject(selectedId));
    if (!data)
        return;

    sf::Http::Response::Status status = FetchTemplate(gd::ToString(data->GetData()));
    if (status == sf::Http::Response::Ok)
        RefreshTemplate();
    else
    {
        nameTxt->SetLabel("Unable to load the template");
        descriptionTxt->SetLabel("An error occured during the loading (Code: "+gd::ToString(status)+" )");
    }

}

}
#endif
