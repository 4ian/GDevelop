#include "ObjectListPanel.h"

//(*InternalHeaders(ObjectListPanel)
#include <wx/intl.h>
#include <wx/string.h>
//*)

//(*IdInit(ObjectListPanel)
//*)

BEGIN_EVENT_TABLE(ObjectListPanel,wxPanel)
	//(*EventTable(ObjectListPanel)
	//*)
END_EVENT_TABLE()

ObjectListPanel::ObjectListPanel(wxWindow* parent,wxWindowID id,const wxPoint& pos,const wxSize& size)
{
	//(*Initialize(ObjectListPanel)
	Create(parent, id, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("id"));
	//*)
}

ObjectListPanel::~ObjectListPanel()
{
	//(*Destroy(ObjectListPanel)
	//*)
}

