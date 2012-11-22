#ifndef TRUEORFALSE_H
#define TRUEORFALSE_H

//(*Headers(TrueOrFalse)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/statline.h>
#include <wx/hyperlink.h>
#include <wx/statbmp.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
#include <string>

using namespace std;

class TrueOrFalse: public wxDialog
{
	public:

		TrueOrFalse(wxWindow* parent, wxString message, wxString caption);
		virtual ~TrueOrFalse();

		//(*Declarations(TrueOrFalse)
		wxStaticBitmap* StaticBitmap2;
		wxButton* Button1;
		wxStaticBitmap* StaticBitmap1;
		wxStaticText* StaticText1;
		wxButton* Button2;
		wxStaticLine* StaticLine1;
		wxHyperlinkCtrl* helpBt;
		//*)

	protected:

		//(*Identifiers(TrueOrFalse)
		static const long ID_STATICBITMAP1;
		static const long ID_STATICTEXT1;
		static const long ID_STATICLINE1;
		static const long ID_STATICBITMAP2;
		static const long ID_HYPERLINKCTRL1;
		static const long ID_BUTTON2;
		static const long ID_BUTTON1;
		//*)

	private:

		//(*Handlers(TrueOrFalse)
		void OnButton2Click(wxCommandEvent& event);
		void OnButton1Click(wxCommandEvent& event);
		void OnhelpBtClick(wxCommandEvent& event);
		//*)

		DECLARE_EVENT_TABLE()
};

#endif

