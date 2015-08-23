/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include <sstream>
#include <ctime>
#include "EventStoreDialog.h"
#include "GDCore/Serialization/Serializer.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/IDE/EventsRefactorer.h"
#include "GDCore/IDE/wxTools/SafeYield.h"
#include "GDCore/CommonTools.h"
#include "SFML/Network.hpp"

#include <wx/htmllbox.h>

namespace gd
{

const gd::String EventStoreDialog::host = "http://gdevapp.com";
const int EventStoreDialog::port = 80;
gd::SerializerElement * EventStoreDialog::templates = NULL;

EventStoreDialog::EventStoreDialog(wxWindow* parent, gd::Project & project_, gd::Layout & layout_)
    : BaseEventStoreDialog(parent),
    project(project_),
    layout(layout_),
    parametersHelper(paramCheckboxes, paramSpacers1, paramTexts, paramSpacers2, paramBmpBts, paramEdits)
{
    parametersHelper.SetWindowAndSizer(parametersScrolledWindow, parametersSizer)
        .SetProjectAndLayout(project, layout);
    templatesList->Connect(wxEVT_COMMAND_LISTBOX_SELECTED, wxCommandEventHandler(EventStoreDialog::OnSelectionChanged), NULL, this);

    descriptionEdit->SetValue(_("Please choose a template in the list."));
	FetchTemplates();
	RefreshList();
    okBt->Enable(false);
}

EventStoreDialog::~EventStoreDialog()
{
}

void EventStoreDialog::RefreshWith(gd::String templateId, const std::vector<gd::String> & parameters)
{
    FetchTemplate(templateId);
    RefreshTemplate();
    for(std::size_t i = 0;i<parameters.size() && i<paramEdits.size();++i) {
        paramEdits[i]->SetValue(parameters[i]);
    }
}

sf::Http::Response::Status EventStoreDialog::FetchTemplates(bool forceFetch)
{
    if (templates && !forceFetch) return sf::Http::Response::Ok;

    // Create request
    sf::Http Http(host.ToLocale(), port);
    sf::Http::Request request;
    request.setMethod(sf::Http::Request::Get);
    request.setUri("/events/");

    // Send the request
    sf::Http::Response response = Http.sendRequest(request, sf::seconds(2));

    if (response.getStatus() == sf::Http::Response::Ok)
    {
        if (templates) delete templates;
        templates = new gd::SerializerElement(Serializer::FromJSON(response.getBody()));
    }

    return response.getStatus();
}

sf::Http::Response::Status EventStoreDialog::FetchTemplate(gd::String id)
{
    nameTxt->SetLabel("Loading the template...");
    descriptionEdit->SetValue("");

    gd::SafeYield::Do();

    // Create request
    sf::Http Http(host.ToLocale(), port);
    sf::Http::Request request;
    request.setMethod(sf::Http::Request::Get);
    request.setUri("/events/"+id.ToLocale());

    // Send the request
    sf::Http::Response response = Http.sendRequest(request, sf::seconds(2));

    if (response.getStatus() == sf::Http::Response::Ok)
        loadedTemplate = Serializer::FromJSON(response.getBody());

    return response.getStatus();
}

void EventStoreDialog::RefreshList()
{
    templatesList->Clear();
    gd::String searchText = searchCtrl->GetValue();
    searchText = searchText.CaseFold();
    bool searching = searchText.empty() ? false : true;

    if (!templates) return;
	templates->ConsiderAsArrayOf("Template");
	for (std::size_t i = 0;i<templates->GetChildrenCount();++i) {
		const SerializerElement & eventTemplate = templates->GetChild(i);
        gd::String name = eventTemplate.GetChild("name").GetValue().GetString();
        gd::String desc = eventTemplate.GetChild("description").GetValue().GetString();

        if (!searching || name.CaseFold().find(searchText) != gd::String::npos
            || desc.CaseFold().find(searchText) != gd::String::npos)
        {
    		wxString id = eventTemplate.GetChild("_id").GetValue().GetString();
            if (desc.size() > 50) {
                while(desc.size() > 50)
                    desc.pop_back();
                desc += "...";
            }

            wxStringClientData * data = new wxStringClientData(id);
    		templatesList->Append("<b>"+name+"</b><br>"+desc, data);
        }
	}
}

void EventStoreDialog::RefreshTemplate()
{
    okBt->Enable();
    nameTxt->SetLabel(loadedTemplate.GetChild("name").GetValue().GetString());
    descriptionEdit->SetValue(loadedTemplate.GetChild("description").GetValue().GetString());
    authorTxt->SetLabel(_("By ")+loadedTemplate.GetChild("_ownerId").
        GetChild("local").GetChild("username").GetValue().GetString());

    RefreshParameters();
    Layout();
}

void EventStoreDialog::RefreshParameters()
{
    const SerializerElement & parameters = loadedTemplate.GetChild("parameters");
    parameters.ConsiderAsArrayOf("Parameter");
    parametersHelper.UpdateControls(parameters.GetChildrenCount());

    for (std::size_t i = 0;i<parameters.GetChildrenCount();++i)
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

    for (std::size_t i = 0;i<parameters.GetChildrenCount() && i < paramEdits.size();++i)
    {
        const SerializerElement & parameter = parameters.GetChild(i);
        gd::String newValue = paramEdits[i]->GetValue();

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
    RefreshList();
}

void EventStoreDialog::OnSelectionChanged(wxCommandEvent& event)
{
    int selectedId = templatesList->GetSelection();
    if (selectedId == wxNOT_FOUND)
        return;

    wxStringClientData * data = dynamic_cast<wxStringClientData*>(templatesList->GetClientObject(selectedId));
    if (!data)
        return;

    sf::Http::Response::Status status = FetchTemplate(data->GetData());
    if (status == sf::Http::Response::Ok)
        RefreshTemplate();
    else
    {
        nameTxt->SetLabel("Unable to load the template");
        descriptionEdit->SetValue("An error occured during the loading (Code: "+gd::String::From(status)+" )");
    }

}

}
#endif
