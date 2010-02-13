#ifndef RENDERDIALOG_H
#define RENDERDIALOG_H

//(*Headers(RenderDialog)
#include <wx/sizer.h>
#include "wxSFMLCanvas.hpp"
#include <wx/dialog.h>
//*)

class RenderDialog: public wxDialog
{
	public:

		RenderDialog(wxWindow* parent);
		virtual ~RenderDialog();

		//(*Declarations(RenderDialog)
		wxSFMLCanvas* renderCanvas;
		//*)

	protected:

		//(*Identifiers(RenderDialog)
		static const long ID_CUSTOM1;
		//*)

	private:

		//(*Handlers(RenderDialog)
		void OnResize(wxSizeEvent& event);
		//*)

		DECLARE_EVENT_TABLE()
};

#endif
