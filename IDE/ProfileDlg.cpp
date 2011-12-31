/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

 #include "ProfileDlg.h"

//(*InternalHeaders(ProfileDlg)
#include <wx/intl.h>
#include <wx/string.h>
//*)
#include "GDL/EventsCodeCompiler.h"
#include "GDL/ProfileEvent.h"
#include "SceneCanvas.h"
#include <iostream>

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

ProfileDlg::ProfileDlg(wxWindow* parent,wxWindowID id,const wxPoint& pos,const wxSize& size) :
BaseProfiler(),
maxData(300),
sceneCanvas(NULL)
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
	activateCheck = new wxCheckBox(this, ID_CHECKBOX1, _("Activer le suivi des performances ( Relance la scène )"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX1"));
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
	MenuItem1 = new wxMenuItem(MenuItem3, ID_MENUITEM1, _("Changer le nombre de mesures"), wxEmptyString, wxITEM_NORMAL);
	MenuItem3->Append(MenuItem1);
	infiniteDataCheck = new wxMenuItem(MenuItem3, wxID_ANY, _("Nombre infini"), wxEmptyString, wxITEM_CHECK);
	MenuItem3->Append(infiniteDataCheck);
	contextMenu.Append(ID_MENUITEM3, _("Nombre de mesures"), MenuItem3, wxEmptyString);
	MenuItem2 = new wxMenuItem((&contextMenu), ID_MENUITEM2, _("Changer l\'intervalle des mesures"), wxEmptyString, wxITEM_NORMAL);
	contextMenu.Append(MenuItem2);
	contextMenu.AppendSeparator();
	totalTimeCheck = new wxMenuItem((&contextMenu), wxID_ANY, _("Afficher le temps total"), wxEmptyString, wxITEM_CHECK);
	contextMenu.Append(totalTimeCheck);
	eventsTimeCheck = new wxMenuItem((&contextMenu), wxID_ANY, _("Afficher le temps des évènements"), wxEmptyString, wxITEM_CHECK);
	contextMenu.Append(eventsTimeCheck);
	objectsCountCheck = new wxMenuItem((&contextMenu), wxID_ANY, _("Afficher le nombre d\'objets"), wxEmptyString, wxITEM_CHECK);
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

	UpdateGUI();
}

ProfileDlg::~ProfileDlg()
{
	//(*Destroy(ProfileDlg)
	//*)
}

void ProfileDlg::UpdateGUI()
{
    if ( !sceneCanvas || !profilingActivated )
    {
        eventsTimeTxt->SetLabel(_("Evenements"));
        totalTimeTxt->SetLabel(_("Temps de rendu total ( Affichage + Evenements )"));
        objectsCountTxt->SetLabel(_("Nombre d'objets"));

        return;
    }

    eventsTimeTxt->SetLabel(_("Evenements : ")+ToString(static_cast<double>(lastEventsTime)/1000.0f)+("ms")
                            +_(" / Pourcentage de temps utilisé par les évenements : ")
                                     +ToString(static_cast<double>(lastEventsTime)/static_cast<double>((lastEventsTime+lastRenderingTime))*100.0f)
                                     +("%"));

    totalTimeTxt->SetLabel(_("Temps de rendu total ( Affichage + Evenements )  : ")+ToString(static_cast<double>((lastRenderingTime+lastEventsTime))/1000.0f)+("ms"));

    unsigned int currentObjectCount = sceneCanvas->edittimeRenderer.runtimeScene.objectsInstances.GetAllObjects().size();
    objectsCountTxt->SetLabel(_("Nombre d'objets : ")+ToString(currentObjectCount));

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
    wxBufferedPaintDC dc( ratioGraphics ); //Création obligatoire du wxBufferedPaintDC
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
        scaleMaxTxt->SetLabel(ToString(50)+"ms\n("+ToString(1.0f/50*1000.0f)+" "+_("i/s")+")");
        scaleMidTxt->SetLabel(ToString(50/2.0f)+"ms\n("+ToString(1.0f/(50/2.0f)*1000.0f)+" "+_("i/s")+")");

        return;
    }

    unsigned int maximumTime = 50;

    scaleMaxTxt->SetLabel(ToString(maximumTime)+"ms\n("+ToString(1.0f/maximumTime*1000.0f)+" "+_("i/s")+")");
    scaleMidTxt->SetLabel(ToString(maximumTime/2.0f)+"ms\n("+ToString(1.0f/(maximumTime/2.0f)*1000.0f)+" "+_("i/s")+")");

    //FPS curve
    if ( totalTimeCheck->IsChecked() )
    {
        vector <wxPoint> points;
        unsigned int numberDisplay = infiniteDataCheck->IsChecked() ? totalTimeData.size() : maxData-1;

        points.push_back(wxPoint(ratioGraphics->GetSize().x, ratioGraphics->GetSize().y));
        for (unsigned int i = 0;i<totalTimeData.size();++i)
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
        unsigned int numberDisplay = infiniteDataCheck->IsChecked() ? eventsData.size() : maxData-1;

        points.push_back(wxPoint(ratioGraphics->GetSize().x, ratioGraphics->GetSize().y));
        for (unsigned int i = 0;i<eventsData.size();++i)
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
        std::deque<unsigned int>::iterator maximumElementIterator = std::max_element(objectsCountData.begin(), objectsCountData.end());
        unsigned int maximumElement = *maximumElementIterator;

        vector <wxPoint> points;
        unsigned int numberDisplay = infiniteDataCheck->IsChecked() ? objectsCountData.size() : maxData-1;

        points.push_back(wxPoint(ratioGraphics->GetSize().x, ratioGraphics->GetSize().y));
        for (unsigned int i = 0;i<objectsCountData.size();++i)
            points.push_back(wxPoint(static_cast<double>(ratioGraphics->GetSize().x)-(i)/static_cast<double>(numberDisplay)*static_cast<double>(ratioGraphics->GetSize().x),
                                     static_cast<double>(ratioGraphics->GetSize().y)-static_cast<double>(objectsCountData[i])/static_cast<double>(maximumElement)*static_cast<double>(ratioGraphics->GetSize().y)));
        points.push_back(wxPoint(points.back().x, ratioGraphics->GetSize().y));

        dc.SetPen(wxPen(wxColour( 221, 0, 16 )));
        if ( !points.empty() ) dc.DrawLines(points.size(), &points[0]);
    }
}


void ProfileDlg::ParseProfileEvents()
{
    if ( !sceneCanvas ) return;

    for (unsigned int i = 0;i<sceneCanvas->sceneEdited.profiler->profileEventsInformation.size();++i)
    {
        boost::shared_ptr<BaseEvent> event = sceneCanvas->sceneEdited.profiler->profileEventsInformation[i].originalEvent.lock();
        if ( event != boost::shared_ptr<BaseEvent>())
        {
            event->totalTimeDuringLastSession = sceneCanvas->sceneEdited.profiler->profileEventsInformation[i].GetTime();
            event->percentDuringLastSession = static_cast<double>(event->totalTimeDuringLastSession)/static_cast<double>(totalEventsTime)*100.0;
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
    std::string newMaxData = string(wxGetTextFromUser(_("Entrez le nombre de mesure à conserver"), _("Nombre de mesures"), ToString(maxData)).mb_str());
    maxData = ToInt(newMaxData);
}

void ProfileDlg::OnStepTimeSelected(wxCommandEvent& event)
{
    std::string newStepTime = string(wxGetTextFromUser(_("Entrez le temps entre chaque relevé ( en millisecondes )"), _("Temps entre chaque relevé"), ToString(static_cast<double>(stepTime)*1000.0f)).mb_str());
    stepTime = ToFloat(newStepTime)/1000.0f;
}

void ProfileDlg::OnactivateCheckClick(wxCommandEvent& event)
{
    profilingActivated = activateCheck->GetValue();
    if ( sceneCanvas )
    {
        sceneCanvas->sceneEdited.wasModified = true;
        sceneCanvas->sceneEdited.eventsModified = true;
        EventsCodeCompiler::GetInstance()->EventsCompilationNeeded(EventsCodeCompiler::Task(&sceneCanvas->gameEdited, &sceneCanvas->sceneEdited));
        sceneCanvas->Reload();
    }
}
