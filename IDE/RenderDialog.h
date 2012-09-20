/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */
#ifndef RENDERDIALOG_H
#define RENDERDIALOG_H

//(*Headers(RenderDialog)
#include "wxSFMLCanvas.hpp"
#include <wx/dialog.h>
//*)
class SceneCanvas;

/**
 * \brief Window used to mimic a sf::RenderWindow.
 */
class RenderDialog: public wxDialog
{
	public:

		RenderDialog(wxWindow* parent, SceneCanvas * sceneCanvasNotifiedOnClose = NULL);
		virtual ~RenderDialog();

		void SetSizeOfRenderingZone(unsigned int width, unsigned int height);

		//(*Declarations(RenderDialog)
		wxSFMLCanvas* renderCanvas;
		//*)

	protected:

		//(*Identifiers(RenderDialog)
		static const long ID_CUSTOM1;
		//*)

	private:

		//(*Handlers(RenderDialog)
		void OnClose(wxCloseEvent& event);
		//*)

		SceneCanvas * toBeNotifiedOnClose; ///< Optional scene canvas that can be notified when the window is closed.

		DECLARE_EVENT_TABLE()
};

#endif

