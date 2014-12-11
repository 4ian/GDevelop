#include <sstream>
#include "EventStoreDialog.h"
#include "GDCore/Serialization/Serializer.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/CommonTools.h"
#include "SFML/Network.hpp"
#include <wx/htmllbox.h>

namespace gd
{

const std::string EventStoreDialog::host = "http://localhost";
const int EventStoreDialog::port = 3000;

EventStoreDialog::EventStoreDialog(wxWindow* parent)
    : BaseEventStoreDialog(parent)
{

	FetchTemplates();
	RefreshList();
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
    nameTxt->SetLabel(loadedTemplate.GetChild("name").GetValue().GetString());
    descriptionTxt->SetLabel(loadedTemplate.GetChild("description").GetValue().GetString());

    RefreshParameters();
}

void EventStoreDialog::RefreshParameters()
{

}

void EventStoreDialog::OnCancelBtClick(wxCommandEvent& event)
{
	EndModal(0);
}
void EventStoreDialog::OnOkBtClick(wxCommandEvent& event)
{
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
