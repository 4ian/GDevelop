#include "RenderDialog.h"

//(*InternalHeaders(RenderDialog)
#include <wx/intl.h>
#include <wx/string.h>
//*)
#include <iostream>
using namespace std;

//(*IdInit(RenderDialog)
const long RenderDialog::ID_CUSTOM1 = wxNewId();
//*)

BEGIN_EVENT_TABLE(RenderDialog,wxDialog)
	//(*EventTable(RenderDialog)
	//*)
END_EVENT_TABLE()

RenderDialog::RenderDialog(wxWindow* parent)
{
	//(*Initialize(RenderDialog)
	wxFlexGridSizer* FlexGridSizer1;

	Create(parent, wxID_ANY, _("Aperçu"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 3, 0, 0);
	renderCanvas = new wxSFMLCanvas(this,ID_CUSTOM1,wxDefaultPosition,wxSize(800,600),wxWANTS_CHARS | wxNO_BORDER);
	FlexGridSizer1->Add(renderCanvas, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	Connect(wxEVT_SIZE,(wxObjectEventFunction)&RenderDialog::OnResize);
	//*)
}

RenderDialog::~RenderDialog()
{
	//(*Destroy(RenderDialog)
	//*)
}


/**
 * Resize manually the canvas to accord to windows size.
 */
void RenderDialog::OnResize(wxSizeEvent& event)
{
    renderCanvas->wxWindowBase::SetSize(event.GetSize());
    renderCanvas->sf::RenderWindow::SetSize(event.GetSize().GetWidth(), event.GetSize().GetHeight());
}
