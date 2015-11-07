/*
 * GDevelop C++ Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include "ProfileDlg.h"

//(*InternalHeaders(ProfileDlg)
#include <wx/intl.h>
#include <wx/string.h>
//*)
#undef CreateDialog //Thanks windows.h
#include <iostream>
#include <wx/textdlg.h>
#include <wx/dcbuffer.h>
#include "GDCpp/IDE/CodeCompilationHelpers.h"
#include "GDCpp/Events/Builtin/ProfileEvent.h"
#include "GDCpp/IDE/Dialogs/CppLayoutPreviewer.h"
#include "GDCpp/CommonTools.h"
#include "GDCpp/Extensions/CppPlatform.h"

using namespace std;

//(*IdInit(ProfileDlg)
const long ProfileDlg::ID_CHECKBOX1 = wxNewId();
const long ProfileDlg::ID_STATICTEXT8 = wxNewId();
const long ProfileDlg::ID_STATICTEXT9 = wxNewId();
const long ProfileDlg::ID_PANEL1 = wxNewId();
const long ProfileDlg::ID_PANEL2 = wxNewId();
const long ProfileDlg::ID_STATICTEXT2 = wxNewId();
const long ProfileDlg::ID_PANEL3 = wxNewId();
const long ProfileDlg::ID_STATICTEXT1 = wxNewId();
const long ProfileDlg::ID_PANEL4 = wxNewId();
const long ProfileDlg::ID_STATICTEXT3 = wxNewId();
const long ProfileDlg::ID_MENUITEM1 = wxNewId();
const long ProfileDlg::ID_MENUITEM3 = wxNewId();
const long ProfileDlg::ID_MENUITEM2 = wxNewId();
//*)

BEGIN_EVENT_TABLE(ProfileDlg,wxPanel)
	//(*EventTable(ProfileDlg)
	//*)
END_EVENT_TABLE()

ProfileDlg::ProfileDlg(wxWindow* parent, CppLayoutPreviewer & associatedCppLayoutPreviewer) :
BaseProfiler(),
maxData(300),
sceneCanvas(associatedCppLayoutPreviewer)
{
	//(*Initialize(ProfileDlg)
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer2;
	wxFlexGridSizer* FlexGridSizer7;
	wxGridSizer* GridSizer1;
	wxFlexGridSizer* FlexGridSizer8;
	wxFlexGridSizer* FlexGridSizer1;

	Create(parent, wxID_ANY, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("wxID_ANY"));
	FlexGridSizer2 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer2->AddGrowableCol(0);
	FlexGridSizer2->AddGrowableRow(1);
	activateCheck = new wxCheckBox(this, ID_CHECKBOX1, _("Activate profiling ( Relaunch the scene )"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX1"));
	activateCheck->SetValue(false);
	FlexGridSizer2->Add(activateCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer7 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer7->AddGrowableCol(1);
	FlexGridSizer7->AddGrowableRow(0);
	GridSizer1 = new wxGridSizer(3, 1, 0, 0);
	scaleMaxTxt = new wxStaticText(this, ID_STATICTEXT8, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT8"));
	GridSizer1->Add(scaleMaxTxt, 1, wxALL|wxALIGN_TOP|wxALIGN_CENTER_HORIZONTAL, 5);
	scaleMidTxt = new wxStaticText(this, ID_STATICTEXT9, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT9"));
	GridSizer1->Add(scaleMidTxt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	GridSizer1->Add(65,20,1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer7->Add(GridSizer1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	ratioGraphics = new wxPanel(this, ID_PANEL1, wxDefaultPosition, wxSize(395,130), wxSIMPLE_BORDER|wxTAB_TRAVERSAL, _T("ID_PANEL1"));
	ratioGraphics->SetBackgroundColour(wxColour(255,255,255));
	FlexGridSizer7->Add(ratioGraphics, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer2->Add(FlexGridSizer7, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer8 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer8->AddGrowableCol(1);
	FlexGridSizer8->AddGrowableRow(0);
	Panel1 = new wxPanel(this, ID_PANEL2, wxDefaultPosition, wxSize(10,10), wxSIMPLE_BORDER|wxTAB_TRAVERSAL, _T("ID_PANEL2"));
	Panel1->SetBackgroundColour(wxColour(116,132,255));
	FlexGridSizer8->Add(Panel1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	eventsTimeTxt = new wxStaticText(this, ID_STATICTEXT2, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
	FlexGridSizer8->Add(eventsTimeTxt, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer2->Add(FlexGridSizer8, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer3 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer3->AddGrowableCol(1);
	FlexGridSizer3->AddGrowableRow(0);
	Panel2 = new wxPanel(this, ID_PANEL3, wxDefaultPosition, wxSize(10,10), wxSIMPLE_BORDER|wxTAB_TRAVERSAL, _T("ID_PANEL3"));
	Panel2->SetBackgroundColour(wxColour(255,209,12));
	FlexGridSizer3->Add(Panel2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	totalTimeTxt = new wxStaticText(this, ID_STATICTEXT1, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	FlexGridSizer3->Add(totalTimeTxt, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer2->Add(FlexGridSizer3, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer1 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer1->AddGrowableCol(1);
	FlexGridSizer1->AddGrowableRow(0);
	Panel3 = new wxPanel(this, ID_PANEL4, wxDefaultPosition, wxSize(10,10), wxSIMPLE_BORDER|wxTAB_TRAVERSAL, _T("ID_PANEL4"));
	Panel3->SetBackgroundColour(wxColour(221,0,16));
	FlexGridSizer1->Add(Panel3, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	objectsCountTxt = new wxStaticText(this, ID_STATICTEXT3, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT3"));
	FlexGridSizer1->Add(objectsCountTxt, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer2->Add(FlexGridSizer1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer2);
	MenuItem3 = new wxMenu();
	MenuItem1 = new wxMenuItem(MenuItem3, ID_MENUITEM1, _("Change the number of measure"), wxEmptyString, wxITEM_NORMAL);
	MenuItem3->Append(MenuItem1);
	infiniteDataCheck = new wxMenuItem(MenuItem3, wxID_ANY, _("Infinity number"), wxEmptyString, wxITEM_CHECK);
	MenuItem3->Append(infiniteDataCheck);
	contextMenu.Append(ID_MENUITEM3, _("Number of measures"), MenuItem3, wxEmptyString);
	MenuItem2 = new wxMenuItem((&contextMenu), ID_MENUITEM2, _("Change the interval between each measures."), wxEmptyString, wxITEM_NORMAL);
	contextMenu.Append(MenuItem2);
	contextMenu.AppendSeparator();
	totalTimeCheck = new wxMenuItem((&contextMenu), wxID_ANY, _("Display total time"), wxEmptyString, wxITEM_CHECK);
	contextMenu.Append(totalTimeCheck);
	eventsTimeCheck = new wxMenuItem((&contextMenu), wxID_ANY, _("Display time used by events"), wxEmptyString, wxITEM_CHECK);
	contextMenu.Append(eventsTimeCheck);
	objectsCountCheck = new wxMenuItem((&contextMenu), wxID_ANY, _("Display the number of objects"), wxEmptyString, wxITEM_CHECK);
	contextMenu.Append(objectsCountCheck);
	FlexGridSizer2->Fit(this);
	FlexGridSizer2->SetSizeHints(this);

	Connect(ID_CHECKBOX1,wxEVT_COMMAND_CHECKBOX_CLICKED,(wxObjectEventFunction)&ProfileDlg::OnactivateCheckClick);
	ratioGraphics->Connect(wxEVT_PAINT,(wxObjectEventFunction)&ProfileDlg::OnratioGraphicsPaint,0,this);
	ratioGraphics->Connect(wxEVT_RIGHT_UP,(wxObjectEventFunction)&ProfileDlg::OnratioGraphicsRightUp,0,this);
	ratioGraphics->Connect(wxEVT_SIZE,(wxObjectEventFunction)&ProfileDlg::OnratioGraphicsResize,0,this);
	Connect(ID_MENUITEM1,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ProfileDlg::OnChangeDurationSelected);
	Connect(ID_MENUITEM2,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&ProfileDlg::OnStepTimeSelected);
	//*)

	totalTimeCheck->Check();
	eventsTimeCheck->Check();
	objectsCountCheck->Check();

	sceneCanvas.GetRuntimeScene().SetProfiler(this);
	UpdateGUI();
}

ProfileDlg::~ProfileDlg()
{
	//(*Destroy(ProfileDlg)
	//*)
}

void ProfileDlg::UpdateGUI()
{
    if ( !profilingActivated )
    {
        eventsTimeTxt->SetLabel(_("Events"));
        totalTimeTxt->SetLabel(_("Total rendering time ( Display + Events )"));
        objectsCountTxt->SetLabel(_("Number of objects"));

        return;
    }

    eventsTimeTxt->SetLabel(_("Events:")+gd::String::From(static_cast<double>(lastEventsTime)/1000.0f)+_("ms")
                            +_("/ Percent of time used by events:")
                                     +gd::String::From(static_cast<double>(lastEventsTime)/static_cast<double>((lastEventsTime+lastRenderingTime))*100.0f)
                                     +"%");

    totalTimeTxt->SetLabel(_("Total rendering time ( Display + Events ):")+
        gd::String::From(static_cast<double>((lastRenderingTime+lastEventsTime))/1000.0f)+_("ms"));

    std::size_t currentObjectCount = sceneCanvas.GetRuntimeScene().objectsInstances.GetAllObjects().size();
    objectsCountTxt->SetLabel(_("Number of objects:")+gd::String::From(currentObjectCount));

    //Update events data
    eventsData.push_front(lastEventsTime/1000.0f);
    while ( !infiniteDataCheck->IsChecked() && eventsData.size() > maxData )
        eventsData.pop_back();

    //Update total time data
    totalTimeData.push_front((lastRenderingTime+lastEventsTime)/1000.0f);
    while ( !infiniteDataCheck->IsChecked() && totalTimeData.size() > maxData )
        totalTimeData.pop_back();

    //Update objects count data
    objectsCountData.push_front(currentObjectCount);
    while ( !infiniteDataCheck->IsChecked() && objectsCountData.size() > maxData )
        objectsCountData.pop_back();

    ratioGraphics->Refresh();
    ratioGraphics->Update();
}

void ProfileDlg::OnratioGraphicsPaint(wxPaintEvent& event)
{
    wxBufferedPaintDC dc( ratioGraphics ); //Cr�ation obligatoire du wxBufferedPaintDC
    ratioGraphics->SetBackgroundStyle( wxBG_STYLE_PAINT );

    dc.SetBackgroundMode( wxBG_STYLE_COLOUR );
    wxColour backgroundColor( wxColour( 250, 250, 250 ) );
    dc.SetBackground( backgroundColor );
    dc.SetFont( wxFont( 8, wxDEFAULT, wxNORMAL, wxNORMAL ) );
    dc.SetTextForeground( wxColour( 0, 0, 0 ) );

    //Background
    dc.GradientFillLinear( wxRect(0, 0, ratioGraphics->GetSize().x, ratioGraphics->GetSize().y), wxColour(81,81,81), wxColour(119,126,137), wxSOUTH );

    if ( !profilingActivated || totalTimeData.empty() )
    {
        scaleMaxTxt->SetLabel(gd::String::From(50)+_("ms\n(")+gd::String::From(1.0f/50*1000.0f)+" "+_("fps")+")");
        scaleMidTxt->SetLabel(gd::String::From(50/2.0f)+_("ms\n(")+gd::String::From(1.0f/(50/2.0f)*1000.0f)+" "+_("fps")+")");

        return;
    }

    std::size_t maximumTime = 50;

    scaleMaxTxt->SetLabel(gd::String::From(maximumTime)+_("ms\n(")+gd::String::From(1.0f/maximumTime*1000.0f)+" "+_("fps")+")");
    scaleMidTxt->SetLabel(gd::String::From(maximumTime/2.0f)+_("ms\n(")+gd::String::From(1.0f/(maximumTime/2.0f)*1000.0f)+" "+_("fps")+")");

    //FPS curve
    if ( totalTimeCheck->IsChecked() )
    {
        vector <wxPoint> points;
        std::size_t numberDisplay = infiniteDataCheck->IsChecked() ? totalTimeData.size() : maxData-1;

        points.push_back(wxPoint(ratioGraphics->GetSize().x, ratioGraphics->GetSize().y));
        for (std::size_t i = 0;i<totalTimeData.size();++i)
            points.push_back(wxPoint(static_cast<double>(ratioGraphics->GetSize().x)-(i)/static_cast<double>(numberDisplay)*static_cast<double>(ratioGraphics->GetSize().x),
                                     static_cast<double>(ratioGraphics->GetSize().y)-static_cast<double>(totalTimeData[i])/static_cast<double>(maximumTime)*static_cast<double>(ratioGraphics->GetSize().y)));
        points.push_back(wxPoint(points.back().x, ratioGraphics->GetSize().y));

        dc.SetBrush( wxBrush( wxColour(255, 209, 12), wxSOLID ) );
        dc.SetPen(wxPen(wxColour( 255, 137, 12 )));
        if ( !points.empty() ) dc.DrawPolygon(points.size(), &points[0]);
    }

    //Event curve
    if ( eventsTimeCheck->IsChecked() )
    {
        vector <wxPoint> points;
        std::size_t numberDisplay = infiniteDataCheck->IsChecked() ? eventsData.size() : maxData-1;

        points.push_back(wxPoint(ratioGraphics->GetSize().x, ratioGraphics->GetSize().y));
        for (std::size_t i = 0;i<eventsData.size();++i)
            points.push_back(wxPoint(static_cast<double>(ratioGraphics->GetSize().x)-(i)/static_cast<double>(numberDisplay)*static_cast<double>(ratioGraphics->GetSize().x),
                                     static_cast<double>(ratioGraphics->GetSize().y)-static_cast<double>(eventsData[i])/static_cast<double>(maximumTime)*static_cast<double>(ratioGraphics->GetSize().y)));
        points.push_back(wxPoint(points.back().x, ratioGraphics->GetSize().y));

        dc.SetBrush( wxBrush( wxColour(116, 132, 255), wxSOLID ) );
        dc.SetPen(wxPen(wxColour( 77, 88, 168 )));
        if ( !points.empty() ) dc.DrawPolygon(points.size(), &points[0]);
    }

    //Objects curve
    if ( objectsCountCheck->IsChecked() )
    {
        std::deque<std::size_t>::iterator maximumElementIterator = std::max_element(objectsCountData.begin(), objectsCountData.end());
        std::size_t maximumElement = *maximumElementIterator;

        vector <wxPoint> points;
        std::size_t numberDisplay = infiniteDataCheck->IsChecked() ? objectsCountData.size() : maxData-1;

        points.push_back(wxPoint(ratioGraphics->GetSize().x, ratioGraphics->GetSize().y));
        for (std::size_t i = 0;i<objectsCountData.size();++i)
            points.push_back(wxPoint(static_cast<double>(ratioGraphics->GetSize().x)-(i)/static_cast<double>(numberDisplay)*static_cast<double>(ratioGraphics->GetSize().x),
                                     static_cast<double>(ratioGraphics->GetSize().y)-static_cast<double>(objectsCountData[i])/static_cast<double>(maximumElement)*static_cast<double>(ratioGraphics->GetSize().y)));
        points.push_back(wxPoint(points.back().x, ratioGraphics->GetSize().y));

        dc.SetPen(wxPen(wxColour( 221, 0, 16 )));
        if ( !points.empty() ) dc.DrawLines(points.size(), &points[0]);
    }
}


void ProfileDlg::ParseProfileEvents()
{
    if (!sceneCanvas.GetRuntimeScene().GetProfiler()) return;

    for (std::size_t i = 0;i<sceneCanvas.GetRuntimeScene().GetProfiler()->profileEventsInformation.size();++i)
    {
        std::shared_ptr<gd::BaseEvent> event = sceneCanvas.GetRuntimeScene().GetProfiler()->profileEventsInformation[i].originalEvent.lock();
        if ( event != std::shared_ptr<gd::BaseEvent>())
        {
            event->totalTimeDuringLastSession = sceneCanvas.GetRuntimeScene().GetProfiler()->profileEventsInformation[i].GetTime();
            event->percentDuringLastSession = static_cast<double>(event->totalTimeDuringLastSession)/static_cast<double>(totalEventsTime)*100.0;
        }
        else
        {
            std::cout << "Unable to get originalEvent during profiling." << std::endl;
        }
    }
}

void ProfileDlg::OnratioGraphicsResize(wxSizeEvent& event)
{
    ratioGraphics->Refresh();
    ratioGraphics->Update();
}

void ProfileDlg::OnratioGraphicsRightUp(wxMouseEvent& event)
{
    PopupMenu(&contextMenu);
}

void ProfileDlg::OnChangeDurationSelected(wxCommandEvent& event)
{
    gd::String newMaxData = wxGetTextFromUser(_("Enter the number of measure to memorize"), _("Number of measures"), gd::String::From(maxData));
    maxData = newMaxData.To<int>();
}

void ProfileDlg::OnStepTimeSelected(wxCommandEvent& event)
{
    gd::String newStepTime = wxGetTextFromUser(_("Enter time between each measure ( milliseconds )"), _("Time between each measure"), gd::String::From(static_cast<double>(stepTime)*1000.0f));
    stepTime = newStepTime.To<float>()/1000.0f;
}

void ProfileDlg::OnactivateCheckClick(wxCommandEvent& event)
{
    profilingActivated = activateCheck->GetValue();

    gd::Project & project = sceneCanvas.GetProject();
    CppPlatform::Get().GetChangesNotifier().OnEventsModified(project, sceneCanvas.GetLayout());

}

#endif
