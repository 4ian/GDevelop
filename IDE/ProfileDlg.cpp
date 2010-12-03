/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */

 #include "ProfileDlg.h"

//(*InternalHeaders(ProfileDlg)
#include <wx/intl.h>
#include <wx/string.h>
//*)
#include "GDL/ProfileEvent.h"
#include "SceneCanvas.h"
#include <iostream>

//(*IdInit(ProfileDlg)
const long ProfileDlg::ID_STATICTEXT1 = wxNewId();
const long ProfileDlg::ID_STATICTEXT2 = wxNewId();
const long ProfileDlg::ID_STATICTEXT3 = wxNewId();
//*)

BEGIN_EVENT_TABLE(ProfileDlg,wxPanel)
	//(*EventTable(ProfileDlg)
	//*)
END_EVENT_TABLE()

ProfileDlg::ProfileDlg(wxWindow* parent,wxWindowID id,const wxPoint& pos,const wxSize& size)
{
	//(*Initialize(ProfileDlg)
	wxFlexGridSizer* FlexGridSizer2;

	Create(parent, id, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("id"));
	FlexGridSizer2 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer2->AddGrowableCol(0);
	renderingTimeTxt = new wxStaticText(this, ID_STATICTEXT1, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	FlexGridSizer2->Add(renderingTimeTxt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	eventsTimeTxt = new wxStaticText(this, ID_STATICTEXT2, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
	FlexGridSizer2->Add(eventsTimeTxt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	ratioTxt = new wxStaticText(this, ID_STATICTEXT3, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT3"));
	FlexGridSizer2->Add(ratioTxt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	SetSizer(FlexGridSizer2);
	FlexGridSizer2->Fit(this);
	FlexGridSizer2->SetSizeHints(this);
	//*)
}

ProfileDlg::~ProfileDlg()
{
	//(*Destroy(ProfileDlg)
	//*)
}

void ProfileDlg::UpdateGUI()
{
    renderingTimeTxt->SetLabel(_("Rendu : ")+ToString(lastRenderingTime)+("µs"));
    eventsTimeTxt->SetLabel(_("Evenements : ")+ToString(lastEventsTime)+("µs"));
    ratioTxt->SetLabel(_("Pourcentage de temps utilisé par les évenements : ")
                                     +ToString(static_cast<double>(lastEventsTime)/static_cast<double>((lastEventsTime+lastRenderingTime))*100.0f)
                                     +("%"));
}

void ProfileDlg::ParseProfileEvents()
{
    if ( !sceneCanvas ) return;

    ParseProfileEvents(sceneCanvas->scene.events);
}

void ProfileDlg::ParseProfileEvents(const std::vector < BaseEventSPtr > & events)
{
    for (unsigned int i =0;i<events.size();++i)
    {
        boost::shared_ptr<ProfileEvent> profileEvent = boost::shared_dynamic_cast< ProfileEvent >(events[i]);
        if ( profileEvent != boost::shared_ptr<ProfileEvent>() )
        {
            BaseEventSPtr originalEvent = profileEvent->originalEvent.lock();
            if ( originalEvent )
                originalEvent->totalTimeDuringLastSession = profileEvent->GetTime();
        }
        else
        {
            if ( events[i]->CanHaveSubEvents() )
                ParseProfileEvents(events[i]->GetSubEvents());
        }
    }
}

