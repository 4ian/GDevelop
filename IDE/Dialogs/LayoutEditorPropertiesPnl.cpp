/*
 * GDevelop IDE
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU General Public License version 3.
 */
#include "LayoutEditorPropertiesPnl.h"

//(*InternalHeaders(LayoutEditorPropertiesPnl)
#include <wx/intl.h>
#include <wx/string.h>
//*)
#include "GDCore/IDE/wxTools/SkinHelper.h"
#include "GDCore/IDE/Dialogs/LayoutEditorCanvas/LayoutEditorCanvas.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/InitialInstancesContainer.h"
#include "GDCore/Project/InitialInstance.h"
#include "GDCore/CommonTools.h"

using namespace gd;

//(*IdInit(LayoutEditorPropertiesPnl)
const long LayoutEditorPropertiesPnl::ID_PROPGRID = wxNewId();
//*)
const wxEventType LayoutEditorPropertiesPnl::refreshEventType = wxNewEventType();

BEGIN_EVENT_TABLE(LayoutEditorPropertiesPnl,wxPanel)
	//(*EventTable(LayoutEditorPropertiesPnl)
	//*)
    EVT_COMMAND(wxID_ANY, LayoutEditorPropertiesPnl::refreshEventType, LayoutEditorPropertiesPnl::OnMustRefresh)
END_EVENT_TABLE()

LayoutEditorPropertiesPnl::LayoutEditorPropertiesPnl(wxWindow* parent, gd::Project & project_,
                                                     gd::Layout & layout_, gd::LayoutEditorCanvas * layoutEditorCanvas_,
                                                     gd::MainFrameWrapper & mainFrameWrapper) :
    grid(NULL),
    project(project_),
    layout(layout_),
    layoutEditorCanvas(layoutEditorCanvas_),
    object(NULL),
    instancesHelper(project, layout),
    objectsHelper(project, mainFrameWrapper),
    displayInstancesProperties(true)
{
	//(*Initialize(LayoutEditorPropertiesPnl)
	wxFlexGridSizer* FlexGridSizer1;

	Create(parent, wxID_ANY, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(0);
	grid = new wxPropertyGrid(this,ID_PROPGRID,wxDefaultPosition,wxSize(359,438), wxPG_HIDE_MARGIN|wxPG_SPLITTER_AUTO_CENTER,_T("ID_PROPGRID"));
	FlexGridSizer1->Add(grid, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	Connect(wxEVT_SIZE,(wxObjectEventFunction)&LayoutEditorPropertiesPnl::OnResize);
	//*)
	instancesHelper.SetGrid(grid);
	objectsHelper.SetGrid(grid);
    Connect(ID_PROPGRID, wxEVT_PG_SELECTED, (wxObjectEventFunction)&LayoutEditorPropertiesPnl::OnPropertySelected);
    Connect(ID_PROPGRID, wxEVT_PG_CHANGED, (wxObjectEventFunction)&LayoutEditorPropertiesPnl::OnPropertyChanged);

    //Offer nice theme to property grid
    gd::SkinHelper::ApplyCurrentSkin(*grid);
}

LayoutEditorPropertiesPnl::~LayoutEditorPropertiesPnl()
{
	//(*Destroy(LayoutEditorPropertiesPnl)
	//*)
}

void LayoutEditorPropertiesPnl::OnMustRefresh(wxCommandEvent&)
{
    Refresh();
}

void LayoutEditorPropertiesPnl::Refresh()
{
    if ( layoutEditorCanvas && displayInstancesProperties )
    {
        std::vector<gd::InitialInstance*> selection = layoutEditorCanvas->GetSelection();
        instancesHelper.RefreshFrom(selection);
        gd::String objectName;
        for (std::size_t i = 0;i<selection.size();++i)
        {
            if ( !selection[i] ) continue;
            if ( i == 0 ) objectName = selection[i]->GetObjectName();
            else if ( selection[i]->GetObjectName() != objectName )
            {
                objectName.clear();
                break;
            }
        }

        object = NULL;
        if  ( layout.HasObjectNamed(objectName) )
            object = &layout.GetObject(objectName);
        else if  ( project.HasObjectNamed(objectName) )
            object = &project.GetObject(objectName);

        if ( object )
            objectsHelper.RefreshFrom(object, /*has initial instance content=*/true);
    }
    else if ( !displayInstancesProperties ) objectsHelper.RefreshFrom(object);

    grid->Refresh();
    grid->Update();
    if (onRefreshedCb) onRefreshedCb();
}

void LayoutEditorPropertiesPnl::SelectedInitialInstance(const gd::InitialInstance &)
{
    displayInstancesProperties = true;
    Refresh();
}

void LayoutEditorPropertiesPnl::DeselectedInitialInstance(const gd::InitialInstance &)
{
    Refresh();
}

void LayoutEditorPropertiesPnl::DeselectedAllInitialInstance()
{
    displayInstancesProperties = true;
    grid->Clear();
}

void LayoutEditorPropertiesPnl::InitialInstancesUpdated()
{
    displayInstancesProperties = true;
    Refresh();
}

void LayoutEditorPropertiesPnl::SelectedObject(gd::Object * object_)
{
    displayInstancesProperties = false;
    object = object_;
    Refresh();
}

void LayoutEditorPropertiesPnl::OnPropertySelected(wxPropertyGridEvent& event)
{
    if ( layoutEditorCanvas && displayInstancesProperties ) instancesHelper.OnPropertySelected(layoutEditorCanvas->GetSelection(), event);
    if ( object )
    {
        if ( objectsHelper.OnPropertySelected(object, &layout, event) ) {
            wxCommandEvent refreshEvent(refreshEventType);
            wxPostEvent(grid, refreshEvent);
            //Refresh(); Can trigger a crash
        }
    }
}

void LayoutEditorPropertiesPnl::OnPropertyChanged(wxPropertyGridEvent& event)
{
    if ( layoutEditorCanvas && displayInstancesProperties )
    {
        std::vector<InitialInstance*> selectedInitialInstances = layoutEditorCanvas->GetSelection();

        //In case "Custom size" property is checked, we do some extra work : Setting the custom width/height
        //of instances at their original width/height
        if ( event.GetPropertyName() == _("Custom size?") && grid->GetProperty(_("Custom size?"))->GetValue().GetBool() )
        {
            for (std::size_t i = 0;i<selectedInitialInstances.size();++i)
            {
                sf::Vector2f size = layoutEditorCanvas->GetInitialInstanceSize(*selectedInitialInstances[i]);
                selectedInitialInstances[i]->SetCustomWidth(size.x);
                selectedInitialInstances[i]->SetCustomHeight(size.y);
            }
        }

        instancesHelper.OnPropertyChanged(selectedInitialInstances, event);
    }
    if ( object )
    {
        if ( objectsHelper.OnPropertyChanged(object, &layout, event) ){
            wxCommandEvent refreshEvent(refreshEventType);
            wxPostEvent(grid, refreshEvent);
            //Refresh(); Can trigger a crash
        }
    }
}

void LayoutEditorPropertiesPnl::OnResize(wxSizeEvent& event)
{
    if ( grid ) grid->SetSplitterPosition(grid->GetSize().GetWidth()/2);
    event.Skip();
}
