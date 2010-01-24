#ifndef IMAGEEDITOR_H
#define IMAGEEDITOR_H

//(*Headers(ImageEditor)
#include <wx/frame.h>
//*)

class ImageEditor: public wxFrame
{
	public:

		ImageEditor(wxWindow* parent);
		virtual ~ImageEditor();

		//(*Declarations(ImageEditor)
		//*)

	protected:

		//(*Identifiers(ImageEditor)
		//*)

	private:

		//(*Handlers(ImageEditor)
		//*)

		DECLARE_EVENT_TABLE()
};

#endif
