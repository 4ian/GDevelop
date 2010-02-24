#ifndef STARTHEREPAGE_H
#define STARTHEREPAGE_H

//(*Headers(StartHerePage)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/statline.h>
#include <wx/panel.h>
#include <wx/statbmp.h>
#include <wx/button.h>
//*)
class Game_Develop_EditorFrame;

class StartHerePage: public wxPanel
{
	public:

		StartHerePage(wxWindow* parent, Game_Develop_EditorFrame & mainEditor_);
		virtual ~StartHerePage();

		//(*Declarations(StartHerePage)
		wxButton* recent8Bt;
		wxButton* recent5Bt;
		wxButton* wikiBt;
		wxStaticText* StaticText2;
		wxStaticBitmap* StaticBitmap1;
		wxButton* recent6Bt;
		wxButton* recent3Bt;
		wxStaticText* StaticText1;
		wxStaticText* StaticText3;
		wxButton* forumBt;
		wxButton* guideBt;
		wxButton* recent7Bt;
		wxStaticLine* StaticLine1;
		wxButton* recent2Bt;
		wxButton* recent4Bt;
		wxButton* tutoBt;
		wxStaticText* StaticText4;
		wxButton* recent9Bt;
		wxButton* recent1Bt;
		//*)

        void Refresh();

	protected:

		//(*Identifiers(StartHerePage)
		static const long ID_STATICBITMAP1;
		static const long ID_STATICLINE1;
		static const long ID_STATICTEXT2;
		static const long ID_STATICTEXT1;
		static const long ID_STATICTEXT3;
		static const long ID_STATICTEXT4;
		static const long ID_BUTTON10;
		static const long ID_BUTTON11;
		static const long ID_BUTTON12;
		static const long ID_BUTTON13;
		static const long ID_BUTTON1;
		static const long ID_BUTTON2;
		static const long ID_BUTTON3;
		static const long ID_BUTTON4;
		static const long ID_BUTTON9;
		static const long ID_BUTTON8;
		static const long ID_BUTTON7;
		static const long ID_BUTTON6;
		static const long ID_BUTTON5;
		//*)

	private:

		//(*Handlers(StartHerePage)
		void Onrecent1BtClick(wxCommandEvent& event);
		void Onrecent2BtClick(wxCommandEvent& event);
		void Onrecent3BtClick(wxCommandEvent& event);
		void Onrecent4BtClick(wxCommandEvent& event);
		void Onrecent5BtClick(wxCommandEvent& event);
		void Onrecent6BtClick(wxCommandEvent& event);
		void Onrecent7BtClick(wxCommandEvent& event);
		void Onrecent8BtClick(wxCommandEvent& event);
		void Onrecent9BtClick(wxCommandEvent& event);
		void OnguideBtClick(wxCommandEvent& event);
		void OntutoBtClick(wxCommandEvent& event);
		void OnwikiBtClick(wxCommandEvent& event);
		void OnforumBtClick(wxCommandEvent& event);
		//*)

		Game_Develop_EditorFrame & mainEditor;

		DECLARE_EVENT_TABLE()
};

#endif
