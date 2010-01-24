#ifndef CONSOLEFRAME_H
#define CONSOLEFRAME_H

#ifdef ___WXMSW___
#include <wx/msw/winundef.h>
#endif

//(*Headers(ConsoleFrame)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/textctrl.h>
#include <wx/panel.h>
#include <wx/statbmp.h>
#include <wx/button.h>
#include <wx/frame.h>
//*)

class ConsoleFrame: public wxFrame
{
	public:

		ConsoleFrame(wxWindow* parent,wxWindowID id=wxID_ANY,const wxPoint& pos=wxDefaultPosition,const wxSize& size=wxDefaultSize);
		virtual ~ConsoleFrame();

		//(*Declarations(ConsoleFrame)
		wxStaticBitmap* StaticBitmap1;
		wxTextCtrl* consoleTextCtrl;
		wxPanel* Panel1;
		wxStaticText* StaticText1;
		wxButton* closeBt;
		//*)

	protected:

		//(*Identifiers(ConsoleFrame)
		static const long ID_STATICBITMAP1;
		static const long ID_STATICTEXT1;
		static const long ID_TEXTCTRL1;
		static const long ID_BUTTON1;
		static const long ID_PANEL1;
		//*)

	private:

		//(*Handlers(ConsoleFrame)
		void OncloseBtClick(wxCommandEvent& event);
		void OnClose(wxCloseEvent& event);
		//*)

		wxStreamToTextRedirector * redirector;

		DECLARE_EVENT_TABLE()
};

#endif
