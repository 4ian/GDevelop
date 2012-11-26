#ifndef OBJECTSONBADLAYERBOX_H
#define OBJECTSONBADLAYERBOX_H

#ifdef __WXMSW__
#include <wx/msw/winundef.h>
#endif
//(*Headers(ObjectsOnBadLayerBox)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/statline.h>
#include <wx/panel.h>
#include <wx/choice.h>
#include <wx/statbmp.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
#include <string>
#include <vector>

class ObjectsOnBadLayerBox: public wxDialog
{
	public:

		ObjectsOnBadLayerBox(wxWindow* parent, const std::vector < std::string > & availableLayers);
		virtual ~ObjectsOnBadLayerBox();

		//(*Declarations(ObjectsOnBadLayerBox)
		wxStaticText* StaticText2;
		wxButton* Button1;
		wxStaticBitmap* StaticBitmap1;
		wxPanel* Panel1;
		wxStaticText* StaticText1;
		wxButton* Button2;
		wxButton* Button3;
		wxStaticLine* StaticLine1;
		wxChoice* Choice1;
		//*)

		std::string moveOnLayerNamed;

	protected:

		//(*Identifiers(ObjectsOnBadLayerBox)
		static const long ID_STATICBITMAP1;
		static const long ID_STATICTEXT1;
		static const long ID_PANEL1;
		static const long ID_STATICLINE1;
		static const long ID_BUTTON1;
		static const long ID_BUTTON2;
		static const long ID_STATICTEXT2;
		static const long ID_CHOICE1;
		static const long ID_BUTTON3;
		//*)

	private:

		//(*Handlers(ObjectsOnBadLayerBox)
		void OnDelClick(wxCommandEvent& event);
		void OnMoveClick(wxCommandEvent& event);
		void OnCancelClick(wxCommandEvent& event);
		//*)

		DECLARE_EVENT_TABLE()
};

#endif

