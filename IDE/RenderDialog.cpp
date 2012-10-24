/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */
#include "RenderDialog.h"
#include "SceneCanvas.h"

//(*InternalHeaders(RenderDialog)
#include <wx/intl.h>
#include <wx/string.h>
//*)

const long RenderDialog::ID_CUSTOM1 = wxNewId();
//(*IdInit(RenderDialog)
//*)

BEGIN_EVENT_TABLE(RenderDialog,wxDialog)
	//(*EventTable(RenderDialog)
	//*)
END_EVENT_TABLE()

RenderDialog::RenderDialog(wxWindow* parent, SceneCanvas * sceneCanvasNotifiedOnClose_) :
    toBeNotifiedOnClose(sceneCanvasNotifiedOnClose_)
{
	//(*Initialize(RenderDialog)
	Create(parent, wxID_ANY, _("Preview"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE, _T("wxID_ANY"));
	renderCanvas = new wxSFMLCanvas(this,ID_CUSTOM1,wxDefaultPosition,wxSize(800,600),wxWANTS_CHARS | wxNO_BORDER);

	Connect(wxID_ANY,wxEVT_CLOSE_WINDOW,(wxObjectEventFunction)&RenderDialog::OnClose);
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
    renderCanvas->sf::RenderWindow::setSize(sf::Vector2u(width, height));

    renderCanvas->wxWindowBase::SetSize(wxSize(width, height));
    SetClientSize(width, height);

    Update();
    Refresh();
}

void RenderDialog::OnClose(wxCloseEvent& event)
{
    if ( toBeNotifiedOnClose != NULL ) toBeNotifiedOnClose->ExternalWindowClosed();
    Hide();
}

