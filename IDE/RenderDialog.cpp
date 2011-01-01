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
	Create(parent, wxID_ANY, _("Aperçu"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE, _T("wxID_ANY"));
	renderCanvas = new wxSFMLCanvas(this,ID_CUSTOM1,wxDefaultPosition,wxSize(800,600),wxWANTS_CHARS | wxNO_BORDER);
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
void RenderDialog::SetSizeOfRenderingZone(unsigned int width, unsigned int height)
{
    renderCanvas->sf::RenderWindow::SetSize(width, height);
    renderCanvas->wxWindowBase::SetSize(wxSize(width, height));

    SetVirtualSize(width, height);

    Update();
    Refresh();
}
