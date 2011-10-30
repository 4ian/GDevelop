#ifndef RENDERDIALOG_H
#define RENDERDIALOG_H

//(*Headers(RenderDialog)
#include "wxSFMLCanvas.hpp"
#include <wx/dialog.h>
//*)

/**
 * \brief Window used to mimic a sf::RenderWindow.
 */
class RenderDialog: public wxDialog
{
	public:

		RenderDialog(wxWindow* parent);
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
		//*)

		DECLARE_EVENT_TABLE()
};

#endif
