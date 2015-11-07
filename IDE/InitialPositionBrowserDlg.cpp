/*
 * GDevelop IDE
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU General Public License version 3.
 */
#include "InitialPositionBrowserDlg.h"

//(*InternalHeaders(InitialPositionBrowserDlg)
#include <wx/intl.h>
#include <wx/string.h>
//*)
#include <wx/imaglist.h>
#include "GDCore/Project/InitialInstancesContainer.h"
#include "GDCore/Project/InitialInstance.h"
#include "GDCore/IDE/Dialogs/LayoutEditorCanvas/LayoutEditorCanvas.h"
#include "GDCore/CommonTools.h"

using namespace gd;

//(*IdInit(InitialPositionBrowserDlg)
const long InitialPositionBrowserDlg::ID_LISTCTRL1 = wxNewId();
//*)

BEGIN_EVENT_TABLE(InitialPositionBrowserDlg,wxPanel)
	//(*EventTable(InitialPositionBrowserDlg)
	//*)
END_EVENT_TABLE()

InitialPositionBrowserDlg::InitialPositionBrowserDlg(wxWindow* parent, gd::InitialInstancesContainer & initialInstancesContainer_, gd::LayoutEditorCanvas & layoutCanvas_) :
instancesContainer(initialInstancesContainer_),
layoutCanvas(layoutCanvas_),
deletingInitialInstances(false),
notUserSelection(false)
{
	//(*Initialize(InitialPositionBrowserDlg)
	wxFlexGridSizer* FlexGridSizer1;

	Create(parent, wxID_ANY, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(0);
	initialPositionsList = new wxListCtrl(this, ID_LISTCTRL1, wxDefaultPosition, wxSize(206,167), wxLC_REPORT, wxDefaultValidator, _T("ID_LISTCTRL1"));
	FlexGridSizer1->Add(initialPositionsList, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	Connect(ID_LISTCTRL1,wxEVT_COMMAND_LIST_ITEM_SELECTED,(wxObjectEventFunction)&InitialPositionBrowserDlg::OninitialPositionsListItemSelect);
	Connect(ID_LISTCTRL1,wxEVT_COMMAND_LIST_ITEM_DESELECTED,(wxObjectEventFunction)&InitialPositionBrowserDlg::OninitialPositionsListItemDeselect);
	Connect(ID_LISTCTRL1,wxEVT_COMMAND_LIST_KEY_DOWN,(wxObjectEventFunction)&InitialPositionBrowserDlg::OninitialPositionsListKeyDown);
	//*)

	initialPositionsList->InsertColumn(0, _("Object"));
	initialPositionsList->InsertColumn(1, _("Locked?"), wxLIST_FORMAT_LEFT, 24);
	initialPositionsList->InsertColumn(2, _("X"));
	initialPositionsList->InsertColumn(3, _("Y"));
	initialPositionsList->InsertColumn(4, _("Angle"));
	initialPositionsList->InsertColumn(5, _("Z order"));

	wxImageList * imageList = new wxImageList(16,16);
	imageList->Add(wxBitmap("res/blankicon.png",wxBITMAP_TYPE_ANY));
	imageList->Add(wxBitmap("res/lockicon.png",wxBITMAP_TYPE_ANY));
	initialPositionsList->AssignImageList(imageList, wxIMAGE_LIST_SMALL);

	Refresh();
}

InitialPositionBrowserDlg::~InitialPositionBrowserDlg()
{
	//(*Destroy(InitialPositionBrowserDlg)
	//*)
}

/** \brief Tool class used to refresh the list of instances
 */
class InitialPositionBrowserDlgRefresher : public gd::InitialInstanceFunctor
{
public:
    InitialPositionBrowserDlgRefresher(const InitialPositionBrowserDlg & editor_, const std::vector<InitialInstance*> & selectedInstance_) : editor(editor_), selectedInstance(selectedInstance_), i(0) {};
    virtual ~InitialPositionBrowserDlgRefresher() {};

    virtual void operator()(gd::InitialInstance * instancePtr)
    {
        gd::InitialInstance & instance = *instancePtr;
        if ( i >= editor.initialPositionsList->GetItemCount() ) editor.initialPositionsList->InsertItem(i, "");
        editor.initialPositionsList->SetItem(i, 0, instance.GetObjectName());
        editor.initialPositionsList->SetItemColumnImage(i, 1, instance.IsLocked() ? 1 : 0 );
        editor.initialPositionsList->SetItem(i, 2, gd::String::From(instance.GetX()));
        editor.initialPositionsList->SetItem(i, 3, gd::String::From(instance.GetY()));
        editor.initialPositionsList->SetItem(i, 4, gd::String::From(instance.GetAngle())+"�");
        editor.initialPositionsList->SetItem(i, 5, gd::String::From(instance.GetZOrder()));
        editor.initialPositionsList->SetItemPtrData(i, wxPtrToUInt(&instance));

        if ( std::find(selectedInstance.begin(), selectedInstance.end(), &instance) != selectedInstance.end())
            editor.initialPositionsList->SetItemState(i, wxLIST_STATE_SELECTED, wxLIST_STATE_SELECTED);
        else
            editor.initialPositionsList->SetItemState(i, 0, wxLIST_STATE_SELECTED);

        ++i;
    }

private:
    const InitialPositionBrowserDlg & editor;
    const std::vector<InitialInstance*> & selectedInstance;
    std::size_t i; ///< The index of the currently added item in the wxWidgets control.
};

void InitialPositionBrowserDlg::Refresh()
{
    notUserSelection = true;

    std::vector<InitialInstance*> selection;
    selection = layoutCanvas.GetSelection();

    InitialPositionBrowserDlgRefresher refresher(*this, selection);
    instancesContainer.IterateOverInstances(refresher);

    //Be sure that there is no too much lines.
    while( instancesContainer.GetInstancesCount() < initialPositionsList->GetItemCount() )
        initialPositionsList->DeleteItem(instancesContainer.GetInstancesCount());

    notUserSelection = false;
}

/**
 * Select and scroll to object in the layout canvas when clicking on it
 */
void InitialPositionBrowserDlg::OninitialPositionsListItemSelect(wxListEvent& event)
{
    if ( notUserSelection || event.GetIndex() < 0 ) return;

    gd::InitialInstance * instance = static_cast<gd::InitialInstance*>(wxUIntToPtr(initialPositionsList->GetItemData(event.GetIndex())));
    layoutCanvas.SelectInstance(instance);
    layoutCanvas.EnsureVisible( *instance );  //Also center the view on the last clicked object
}

void InitialPositionBrowserDlg::OninitialPositionsListItemDeselect(wxListEvent& event)
{
    if ( notUserSelection || event.GetIndex() < 0 ) return;

    gd::InitialInstance * instance = static_cast<gd::InitialInstance*>(wxUIntToPtr(initialPositionsList->GetItemData(event.GetIndex())));
    layoutCanvas.UnselectInstance(instance);
}


void InitialPositionBrowserDlg::DeselectedAllInitialInstance()
{
    notUserSelection = true;

    int size = initialPositionsList->GetItemCount();
    for (int i = 0; i < size; ++i)
        initialPositionsList->SetItemState(i,0,wxLIST_STATE_SELECTED);

    notUserSelection = false;
}

void InitialPositionBrowserDlg::SelectedInitialInstance(const gd::InitialInstance & instance)
{
    notUserSelection = true;

    int size = initialPositionsList->GetItemCount();
    for (int i = 0; i < size; ++i)
    {
        gd::InitialInstance * itemInstance = static_cast<gd::InitialInstance*>(wxUIntToPtr(initialPositionsList->GetItemData(i)));
        if ( itemInstance == &instance)
            initialPositionsList->SetItemState(i,wxLIST_STATE_SELECTED,wxLIST_STATE_SELECTED);
    }

    notUserSelection = false;
}

void InitialPositionBrowserDlg::DeselectedInitialInstance(const gd::InitialInstance & instance)
{
    notUserSelection = true;

    int size = initialPositionsList->GetItemCount();
    for (int i = 0; i < size; ++i)
    {
        gd::InitialInstance * itemInstance = static_cast<gd::InitialInstance*>(wxUIntToPtr(initialPositionsList->GetItemData(i)));
        if ( itemInstance == &instance)
            initialPositionsList->SetItemState(i,0,wxLIST_STATE_SELECTED);
    }

    notUserSelection = false;
}

void InitialPositionBrowserDlg::OninitialPositionsListKeyDown(wxListEvent& event)
{
    if ( event.GetKeyCode() == WXK_DELETE || event.GetKeyCode() == WXK_BACK )
    {
        deletingInitialInstances = true;
        std::vector<InitialInstance*> instancesToDelete;
        long itemIndex = -1;
        for (;;) { //Iterate over all controls
            itemIndex = initialPositionsList->GetNextItem(itemIndex,
                                                 wxLIST_NEXT_ALL,
                                                 wxLIST_STATE_SELECTED);

            if (itemIndex == -1) break;
            instancesToDelete.push_back(static_cast<gd::InitialInstance*>(wxUIntToPtr(initialPositionsList->GetItemData(itemIndex))));
        }
        layoutCanvas.DeleteInstances(instancesToDelete);
        deletingInitialInstances = false;
        Refresh();
    }

}

void InitialPositionBrowserDlg::InitialInstancesUpdated()
{
    if ( !deletingInitialInstances ) Refresh();
}
