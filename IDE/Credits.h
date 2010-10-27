#ifndef CREDITS_H
#define CREDITS_H

//(*Headers(Credits)
#include <wx/notebook.h>
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/textctrl.h>
#include <wx/panel.h>
#include <wx/hyperlink.h>
#include <wx/bmpbuttn.h>
#include <wx/statbmp.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)

class Credits: public wxDialog
{
	public:

		Credits(wxWindow* parent);
		virtual ~Credits();

		//(*Declarations(Credits)
		wxButton* OkBt;
		wxNotebook* Notebook1;
		wxBitmapButton* GccBt;
		wxStaticText* StaticText2;
		wxBitmapButton* CBBt;
		wxStaticText* StaticText6;
		wxStaticBitmap* StaticBitmap1;
		wxBitmapButton* WxBt;
		wxPanel* Panel1;
		wxStaticText* StaticText1;
		wxBitmapButton* DonBt;
		wxHyperlinkCtrl* florianRival;
		wxPanel* Panel3;
		wxStaticText* StaticText5;
		wxStaticText* StaticText7;
		wxBitmapButton* SFMLBt;
		wxTextCtrl* TextCtrl1;
		wxPanel* Panel2;
		wxStaticText* StaticText4;
		wxBitmapButton* CppBt;
		wxBitmapButton* CompilGamesBt;
		//*)

	protected:

		//(*Identifiers(Credits)
		static const long ID_STATICBITMAP1;
		static const long ID_STATICTEXT1;
		static const long ID_STATICTEXT4;
		static const long ID_HYPERLINKCTRL1;
		static const long ID_STATICTEXT5;
		static const long ID_BITMAPBUTTON1;
		static const long ID_BITMAPBUTTON7;
		static const long ID_PANEL1;
		static const long ID_TEXTCTRL1;
		static const long ID_PANEL2;
		static const long ID_STATICTEXT7;
		static const long ID_BITMAPBUTTON2;
		static const long ID_BITMAPBUTTON3;
		static const long ID_BITMAPBUTTON4;
		static const long ID_STATICTEXT6;
		static const long ID_BITMAPBUTTON5;
		static const long ID_BITMAPBUTTON6;
		static const long ID_STATICTEXT2;
		static const long ID_PANEL3;
		static const long ID_NOTEBOOK1;
		static const long ID_BUTTON1;
		//*)

	private:

		//(*Handlers(Credits)
		void OnOkBtClick(wxCommandEvent& event);
		void OnCppBtClick(wxCommandEvent& event);
		void OnGccBtClick(wxCommandEvent& event);
		void OnCBBtClick(wxCommandEvent& event);
		void OnSFMLBtClick(wxCommandEvent& event);
		void OnWxBtClick(wxCommandEvent& event);
		void OnCompilGamesBtClick(wxCommandEvent& event);
		void OnDonBtClick(wxCommandEvent& event);
		void OnTextCtrl1Text(wxCommandEvent& event);
		//*)
        void OpenLink(wxString link);

		DECLARE_EVENT_TABLE()
};

#endif
