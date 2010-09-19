#ifndef STARTHEREPAGE_H
#define STARTHEREPAGE_H

//(*Headers(StartHerePage)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/statline.h>
#include <wx/panel.h>
#include <wx/hyperlink.h>
#include <wx/statbmp.h>
//*)
class Game_Develop_EditorFrame;

class StartHerePage: public wxPanel
{
	public:

		StartHerePage(wxWindow* parent, Game_Develop_EditorFrame & mainEditor_);
		virtual ~StartHerePage();

		//(*Declarations(StartHerePage)
		wxHyperlinkCtrl* HyperlinkCtrl2;
		wxHyperlinkCtrl* recent6Bt;
		wxHyperlinkCtrl* recent3Bt;
		wxHyperlinkCtrl* HyperlinkCtrl3;
		wxStaticText* StaticText2;
		wxHyperlinkCtrl* recent2Bt;
		wxHyperlinkCtrl* recent1Bt;
		wxStaticBitmap* StaticBitmap1;
		wxHyperlinkCtrl* recent5Bt;
		wxStaticText* StaticText1;
		wxStaticText* StaticText3;
		wxHyperlinkCtrl* HyperlinkCtrl1;
		wxHyperlinkCtrl* recent8Bt;
		wxHyperlinkCtrl* HyperlinkCtrl4;
		wxStaticLine* StaticLine1;
		wxHyperlinkCtrl* recent7Bt;
		wxStaticText* StaticText4;
		wxHyperlinkCtrl* recent9Bt;
		wxHyperlinkCtrl* recent4Bt;
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
		static const long ID_HYPERLINKCTRL1;
		static const long ID_HYPERLINKCTRL2;
		static const long ID_HYPERLINKCTRL3;
		static const long ID_HYPERLINKCTRL4;
		static const long ID_HYPERLINKCTRL5;
		static const long ID_HYPERLINKCTRL6;
		static const long ID_HYPERLINKCTRL7;
		static const long ID_HYPERLINKCTRL9;
		static const long ID_HYPERLINKCTRL8;
		static const long ID_HYPERLINKCTRL10;
		static const long ID_HYPERLINKCTRL11;
		static const long ID_HYPERLINKCTRL12;
		static const long ID_HYPERLINKCTRL13;
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
