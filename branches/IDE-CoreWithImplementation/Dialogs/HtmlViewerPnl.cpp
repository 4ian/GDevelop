#include "HtmlViewerPnl.h"

//(*InternalHeaders(HtmlViewerPnl)
#include <wx/intl.h>
#include <wx/string.h>
//*)

//(*IdInit(HtmlViewerPnl)
const long HtmlViewerPnl::ID_CUSTOM1 = wxNewId();
//*)

BEGIN_EVENT_TABLE(HtmlViewerPnl,wxPanel)
	//(*EventTable(HtmlViewerPnl)
	//*)
END_EVENT_TABLE()

HtmlViewerPnl::HtmlViewerPnl(wxWindow* parent,wxWindowID id,const wxPoint& pos,const wxSize& size)
{
	//(*Initialize(HtmlViewerPnl)
	wxFlexGridSizer* FlexGridSizer1;

	Create(parent, id, wxDefaultPosition, wxDefaultSize, wxNO_BORDER|wxTAB_TRAVERSAL, _T("id"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(0);
	Custom1 = wxWebView::New(this,ID_CUSTOM1,"www.wiki.compilgames.net",wxDefaultPosition,wxSize(278,334),wxWebViewBackendDefault, wxNO_BORDER);
	FlexGridSizer1->Add(Custom1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);
	//*)
}

HtmlViewerPnl::~HtmlViewerPnl()
{
	//(*Destroy(HtmlViewerPnl)
	//*)
}

void HtmlViewerPnl::OpenURL(wxString url)
{
    Custom1->LoadURL(url);
}

void HtmlViewerPnl::GoBack()
{
    Custom1->GoBack();
}

void HtmlViewerPnl::GoForward()
{
    if ( Custom1->CanGoForward() )
        Custom1->GoForward();
}
