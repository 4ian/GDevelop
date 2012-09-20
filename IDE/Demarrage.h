#ifndef DEMARRAGE_H
#define DEMARRAGE_H

//(*Headers(Demarrage)
#include <wx/notebook.h>
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/checkbox.h>
#include <wx/statline.h>
#include <wx/panel.h>
#include <wx/hyperlink.h>
#include <wx/statbmp.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)

class Demarrage: public wxDialog
{
	public:

		Demarrage(wxWindow* parent);
		virtual ~Demarrage();

		//(*Declarations(Demarrage)
		wxHyperlinkCtrl* HyperlinkCtrl2;
		wxHyperlinkCtrl* HyperlinkCtrl8;
		wxStaticBitmap* StaticBitmap2;
		wxStaticBitmap* StaticBitmap5;
		wxNotebook* Notebook1;
		wxHyperlinkCtrl* HyperlinkCtrl10;
		wxStaticText* StaticText2;
		wxPanel* Panel4;
		wxButton* FermerBt;
		wxHyperlinkCtrl* HyperlinkCtrl9;
		wxStaticBitmap* StaticBitmap11;
		wxButton* Button1;
		wxStaticText* StaticText6;
		wxStaticBitmap* StaticBitmap1;
		wxStaticBitmap* StaticBitmap4;
		wxHyperlinkCtrl* secondTutoLink;
		wxPanel* Panel1;
		wxStaticText* StaticText1;
		wxStaticText* StaticText3;
		wxHyperlinkCtrl* HyperlinkCtrl1;
		wxButton* Button2;
		wxCheckBox* majCheck;
		wxPanel* Panel3;
		wxStaticText* StaticText5;
		wxStaticText* StaticText7;
		wxStaticLine* StaticLine1;
		wxStaticBitmap* StaticBitmap12;
		wxPanel* Panel2;
		wxStaticBitmap* StaticBitmap13;
		wxStaticText* StaticText4;
		wxStaticBitmap* StaticBitmap3;
		//*)

	protected:

		//(*Identifiers(Demarrage)
		static const long ID_STATICBITMAP1;
		static const long ID_PANEL4;
		static const long ID_STATICLINE1;
		static const long ID_STATICTEXT6;
		static const long ID_STATICTEXT2;
		static const long ID_STATICTEXT5;
		static const long ID_STATICBITMAP2;
		static const long ID_STATICTEXT3;
		static const long ID_BUTTON6;
		static const long ID_PANEL1;
		static const long ID_STATICTEXT1;
		static const long ID_CHECKBOX1;
		static const long ID_STATICBITMAP3;
		static const long ID_BUTTON7;
		static const long ID_PANEL2;
		static const long ID_STATICBITMAP4;
		static const long ID_HYPERLINKCTRL1;
		static const long ID_STATICTEXT4;
		static const long ID_STATICBITMAP5;
		static const long ID_HYPERLINKCTRL2;
		static const long ID_HYPERLINKCTRL17;
		static const long ID_STATICBITMAP11;
		static const long ID_HYPERLINKCTRL8;
		static const long ID_STATICBITMAP12;
		static const long ID_HYPERLINKCTRL9;
		static const long ID_STATICBITMAP13;
		static const long ID_HYPERLINKCTRL10;
		static const long ID_STATICTEXT7;
		static const long ID_BUTTON4;
		static const long ID_PANEL3;
		static const long ID_NOTEBOOK1;
		//*)

	private:

		//(*Handlers(Demarrage)
		void OnGuideBtClick(wxCommandEvent& event);
		void OnExempleBtClick(wxCommandEvent& event);
		void OnForumBtClick(wxCommandEvent& event);
		void OnFermerBtClick(wxCommandEvent& event);
		void OnTutorielBtClick(wxCommandEvent& event);
		void OnwikiBtClick(wxCommandEvent& event);
		void OnButton1Click(wxCommandEvent& event);
		void OnButton2Click(wxCommandEvent& event);
		void OnsecondTutoLinkClick(wxCommandEvent& event);
		//*)

		DECLARE_EVENT_TABLE()
};

#endif

