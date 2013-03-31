#include "ImageEditor.h"

//(*InternalHeaders(ImageEditor)
#include <wx/intl.h>
#include <wx/string.h>
//*)

//(*IdInit(ImageEditor)
//*)

BEGIN_EVENT_TABLE(ImageEditor,wxFrame)
	//(*EventTable(ImageEditor)
	//*)
END_EVENT_TABLE()

ImageEditor::ImageEditor(wxWindow* parent)
{
	//(*Initialize(ImageEditor)
	Create(parent, wxID_ANY, wxEmptyString, wxDefaultPosition, wxDefaultSize, wxDEFAULT_FRAME_STYLE, _T("wxID_ANY"));
	SetClientSize(wxSize(400,403));
	//*)
}

ImageEditor::~ImageEditor()
{
	//(*Destroy(ImageEditor)
	//*)
}


