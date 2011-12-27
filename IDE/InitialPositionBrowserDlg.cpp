#include "InitialPositionBrowserDlg.h"

//(*InternalHeaders(InitialPositionBrowserDlg)
#include <wx/intl.h>
#include <wx/string.h>
//*)
#include "GDL/Position.h"
#include "SceneCanvas.h"

//(*IdInit(InitialPositionBrowserDlg)
const long InitialPositionBrowserDlg::ID_LISTCTRL1 = wxNewId();
//*)

BEGIN_EVENT_TABLE(InitialPositionBrowserDlg,wxPanel)
	//(*EventTable(InitialPositionBrowserDlg)
	//*)
END_EVENT_TABLE()

InitialPositionBrowserDlg::InitialPositionBrowserDlg(wxWindow* parent, vector < InitialPosition > & initialPositions_, SceneCanvas & sceneCanvas_) :
initialPositions(initialPositions_),
sceneCanvas(sceneCanvas_)
{
	//(*Initialize(InitialPositionBrowserDlg)
	wxFlexGridSizer* FlexGridSizer1;

	Create(parent, wxID_ANY, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(0);
	initialPositionsList = new wxListCtrl(this, ID_LISTCTRL1, wxDefaultPosition, wxSize(206,167), wxLC_REPORT, wxDefaultValidator, _T("ID_LISTCTRL1"));
	FlexGridSizer1->Add(initialPositionsList, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	Connect(ID_LISTCTRL1,wxEVT_COMMAND_LIST_ITEM_ACTIVATED,(wxObjectEventFunction)&InitialPositionBrowserDlg::OninitialPositionsListItemActivated);
	//*)

	initialPositionsList->InsertColumn(0, _("Objet"));
	initialPositionsList->InsertColumn(1, _("X"));
	initialPositionsList->InsertColumn(2, _("Y"));
	initialPositionsList->InsertColumn(3, _("Angle"));
	initialPositionsList->InsertColumn(4, _("Plan"));

	Refresh();
}

InitialPositionBrowserDlg::~InitialPositionBrowserDlg()
{
	//(*Destroy(InitialPositionBrowserDlg)
	//*)
}

void InitialPositionBrowserDlg::Refresh()
{
    initialPositionsList->DeleteAllItems();
    for (unsigned int i = 0;i<initialPositions.size();++i)
    {
        initialPositionsList->InsertItem(i, initialPositions[i].objectName);
        initialPositionsList->SetItem(i, 1, ToString(initialPositions[i].x));
        initialPositionsList->SetItem(i, 2, ToString(initialPositions[i].y));
        initialPositionsList->SetItem(i, 3, ToString(initialPositions[i].angle));
        initialPositionsList->SetItem(i, 4, ToString(initialPositions[i].zOrder));
    }
}

/**
 * Scroll to object in Scene Editor when double clicking on it
 */
void InitialPositionBrowserDlg::OninitialPositionsListItemActivated(wxListEvent& event)
{
    if ( event.GetIndex() < 0 ) return;

    unsigned long id = static_cast<unsigned long>(event.GetIndex());

    if ( id >= initialPositions.size() ) return;

    sceneCanvas.edittimeRenderer.view.SetCenter( initialPositions[id].x,  initialPositions[id].y);

    //Update scene canvas selection with list selection
    sceneCanvas.edittimeRenderer.objectsSelected.clear();
    sceneCanvas.edittimeRenderer.xObjectsSelected.clear();
    sceneCanvas.edittimeRenderer.yObjectsSelected.clear();

    long itemIndex = -1;
    for (;;) { //Iterate over all controls
        itemIndex = initialPositionsList->GetNextItem(itemIndex,
                                             wxLIST_NEXT_ALL,
                                             wxLIST_STATE_SELECTED);

        if (itemIndex == -1) break;

        // Add each selected object to scene canvas selection
        if ( itemIndex < initialPositions.size() && itemIndex >= 0 )
        {
            ObjSPtr object = sceneCanvas.GetObjectFromInitialPosition(initialPositions[itemIndex]);
            if ( object )
            {
                sceneCanvas.edittimeRenderer.objectsSelected.push_back(object);
                sceneCanvas.edittimeRenderer.xObjectsSelected.push_back(object->GetX());
                sceneCanvas.edittimeRenderer.yObjectsSelected.push_back(object->GetY());
            }
        }
    }
}

void InitialPositionBrowserDlg::DeselectAll()
{
    int size = initialPositionsList->GetItemCount();
    for (int i = 0; i < size; ++i)
        initialPositionsList->SetItemState(i,0,wxLIST_STATE_SELECTED);
}

void InitialPositionBrowserDlg::SelectInitialPosition(unsigned int id)
{
    if ( id >= initialPositionsList->GetItemCount() ) return;

    initialPositionsList->SetItemState(id, wxLIST_STATE_SELECTED, wxLIST_STATE_SELECTED);
    initialPositionsList->EnsureVisible(id);
}
