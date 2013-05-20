/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */
#include "LayoutEditorPropertiesPnl.h"

//(*InternalHeaders(LayoutEditorPropertiesPnl)
#include <wx/intl.h>
#include <wx/string.h>
//*)
#include "GDCore/IDE/wxTools/SkinHelper.h"
#include "GDCore/IDE/Dialogs/LayoutEditorCanvas/LayoutEditorCanvas.h"
#include "GDCore/PlatformDefinition/Layout.h"
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/PlatformDefinition/InitialInstancesContainer.h"
#include "GDCore/PlatformDefinition/InitialInstance.h"
#include "GDCore/CommonTools.h"

using namespace gd;

//(*IdInit(LayoutEditorPropertiesPnl)
const long LayoutEditorPropertiesPnl::ID_PROPGRID = wxNewId();
//*)

BEGIN_EVENT_TABLE(LayoutEditorPropertiesPnl,wxPanel)
	//(*EventTable(LayoutEditorPropertiesPnl)
	//*)
END_EVENT_TABLE()

LayoutEditorPropertiesPnl::LayoutEditorPropertiesPnl(wxWindow* parent, gd::Project & project_, gd::Layout & layout_, gd::LayoutEditorCanvas * layoutEditorCanvas_) :
    grid(NULL),
    project(project_),
    layout(layout_),
    layoutEditorCanvas(layoutEditorCanvas_),
    instancesHelper(project, layout),
    displayInstancesProperties(true)
{
	//(*Initialize(LayoutEditorPropertiesPnl)
	wxFlexGridSizer* FlexGridSizer1;

	Create(parent, wxID_ANY, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(0);
	grid = new wxPropertyGrid(this,ID_PROPGRID,wxDefaultPosition,wxSize(359,438),0,_T("ID_PROPGRID"));
	FlexGridSizer1->Add(grid, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	Connect(wxEVT_SIZE,(wxObjectEventFunction)&LayoutEditorPropertiesPnl::OnResize);
	//*)
	instancesHelper.SetGrid(grid);
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

void LayoutEditorPropertiesPnl::Refresh()
{
    if ( layoutEditorCanvas && displayInstancesProperties ) instancesHelper.RefreshFrom(layoutEditorCanvas->GetSelection());
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

void LayoutEditorPropertiesPnl::OnPropertySelected(wxPropertyGridEvent& event)
{
    if ( layoutEditorCanvas && displayInstancesProperties ) instancesHelper.OnPropertySelected(layoutEditorCanvas->GetSelection(), event);
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
            for (unsigned int i = 0;i<selectedInitialInstances.size();++i)
            {
                sf::Vector2f size = layoutEditorCanvas->GetInitialInstanceSize(*selectedInitialInstances[i]);
                selectedInitialInstances[i]->SetCustomWidth(size.x);
                selectedInitialInstances[i]->SetCustomHeight(size.y);
            }
        }

        instancesHelper.OnPropertyChanged(selectedInitialInstances, event);
    }
}

void LayoutEditorPropertiesPnl::OnResize(wxSizeEvent& event)
{
    if ( grid ) grid->SetSplitterPosition(grid->GetSize().GetWidth()/2);
    event.Skip();
}
