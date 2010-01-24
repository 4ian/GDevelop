#ifndef DEMARRAGE_H
#define DEMARRAGE_H

//(*Headers(Demarrage)
#include <wx/notebook.h>
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/checkbox.h>
#include <wx/panel.h>
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
		wxStaticText* StaticText9;
		wxStaticBitmap* StaticBitmap2;
		wxButton* wikiBt;
		wxNotebook* Notebook1;
		wxStaticText* StaticText2;
		wxButton* FermerBt;
		wxButton* TutorielBt;
		wxCheckBox* simpleCheck;
		wxButton* Button1;
		wxStaticText* StaticText6;
		wxStaticBitmap* StaticBitmap1;
		wxStaticText* StaticText8;
		wxStaticBitmap* StaticBitmap4;
		wxPanel* Panel1;
		wxStaticText* StaticText1;
		wxStaticText* StaticText3;
		wxButton* Button2;
		wxCheckBox* majCheck;
		wxPanel* Panel3;
		wxStaticText* StaticText5;
		wxStaticText* StaticText7;
		wxButton* ForumBt;
		wxButton* GuideBt;
		wxButton* ExempleBt;
		wxPanel* Panel2;
		wxStaticText* StaticText4;
		wxStaticBitmap* StaticBitmap3;
		//*)

	protected:

		//(*Identifiers(Demarrage)
		static const long ID_STATICBITMAP1;
		static const long ID_STATICTEXT2;
		static const long ID_STATICTEXT5;
		static const long ID_STATICTEXT3;
		static const long ID_STATICBITMAP2;
		static const long ID_BUTTON6;
		static const long ID_PANEL1;
		static const long ID_STATICTEXT1;
		static const long ID_CHECKBOX1;
		static const long ID_STATICBITMAP3;
		static const long ID_STATICTEXT6;
		static const long ID_CHECKBOX2;
		static const long ID_STATICBITMAP4;
		static const long ID_BUTTON7;
		static const long ID_PANEL2;
		static const long ID_STATICTEXT7;
		static const long ID_BUTTON1;
		static const long ID_STATICTEXT9;
		static const long ID_BUTTON5;
		static const long ID_STATICTEXT8;
		static const long ID_BUTTON2;
		static const long ID_STATICTEXT4;
		static const long ID_BUTTON3;
		static const long ID_BUTTON8;
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
		//*)

		DECLARE_EVENT_TABLE()
};

#endif
