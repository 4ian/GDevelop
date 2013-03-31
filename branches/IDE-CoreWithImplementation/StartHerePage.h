#ifndef STARTHEREPAGE_H
#define STARTHEREPAGE_H

//(*Headers(StartHerePage)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/panel.h>
#include <wx/hyperlink.h>
#include <wx/statbmp.h>
//*)
class MainFrame;

class StartHerePage: public wxPanel
{
	public:

		StartHerePage(wxWindow* parent, MainFrame & mainEditor_);
		virtual ~StartHerePage();

		//(*Declarations(StartHerePage)
		wxStaticBitmap* StaticBitmap2;
		wxStaticBitmap* StaticBitmap8;
		wxHyperlinkCtrl* recent6Bt;
		wxHyperlinkCtrl* recent3Bt;
		wxStaticBitmap* StaticBitmap5;
		wxStaticBitmap* StaticBitmap14;
		wxStaticBitmap* StaticBitmap7;
		wxHyperlinkCtrl* HyperlinkCtrl3;
		wxHyperlinkCtrl* HyperlinkCtrl6;
		wxHyperlinkCtrl* newProjectLink;
		wxStaticText* StaticText2;
		wxStaticBitmap* StaticBitmap16;
		wxHyperlinkCtrl* HyperlinkCtrl9;
		wxStaticBitmap* StaticBitmap11;
		wxHyperlinkCtrl* recent2Bt;
		wxHyperlinkCtrl* recent1Bt;
		wxStaticBitmap* StaticBitmap1;
		wxStaticBitmap* StaticBitmap17;
		wxHyperlinkCtrl* HyperlinkCtrl5;
		wxStaticBitmap* StaticBitmap4;
		wxHyperlinkCtrl* recent5Bt;
		wxStaticText* StaticText1;
		wxStaticBitmap* StaticBitmap15;
		wxHyperlinkCtrl* HyperlinkCtrl4;
		wxStaticBitmap* StaticBitmap10;
		wxHyperlinkCtrl* resourcesLink;
		wxHyperlinkCtrl* fbLink;
		wxStaticText* StaticText5;
		wxStaticBitmap* StaticBitmap9;
		wxStaticBitmap* StaticBitmap12;
		wxStaticBitmap* StaticBitmap6;
		wxHyperlinkCtrl* recent7Bt;
		wxStaticBitmap* StaticBitmap13;
		wxStaticBitmap* StaticBitmap18;
		wxStaticText* StaticText4;
		wxHyperlinkCtrl* googleplusLink;
		wxStaticBitmap* StaticBitmap3;
		wxHyperlinkCtrl* HyperlinkCtrl7;
		wxHyperlinkCtrl* recent4Bt;
		//*)

        void Refresh();

	protected:

		//(*Identifiers(StartHerePage)
		static const long ID_STATICBITMAP1;
		static const long ID_STATICTEXT2;
		static const long ID_STATICBITMAP18;
		static const long ID_HYPERLINKCTRL12;
		static const long ID_STATICBITMAP9;
		static const long ID_HYPERLINKCTRL18;
		static const long ID_STATICBITMAP10;
		static const long ID_HYPERLINKCTRL19;
		static const long ID_STATICTEXT5;
		static const long ID_STATICBITMAP5;
		static const long ID_HYPERLINKCTRL3;
		static const long ID_STATICBITMAP6;
		static const long ID_HYPERLINKCTRL4;
		static const long ID_STATICBITMAP7;
		static const long ID_HYPERLINKCTRL15;
		static const long ID_STATICBITMAP16;
		static const long ID_HYPERLINKCTRL1;
		static const long ID_STATICBITMAP17;
		static const long ID_HYPERLINKCTRL2;
		static const long ID_STATICTEXT1;
		static const long ID_STATICBITMAP2;
		static const long ID_HYPERLINKCTRL5;
		static const long ID_STATICBITMAP3;
		static const long ID_HYPERLINKCTRL6;
		static const long ID_STATICBITMAP4;
		static const long ID_HYPERLINKCTRL7;
		static const long ID_STATICBITMAP12;
		static const long ID_HYPERLINKCTRL9;
		static const long ID_STATICBITMAP13;
		static const long ID_HYPERLINKCTRL8;
		static const long ID_STATICBITMAP14;
		static const long ID_HYPERLINKCTRL10;
		static const long ID_STATICBITMAP15;
		static const long ID_HYPERLINKCTRL11;
		static const long ID_STATICTEXT4;
		static const long ID_STATICBITMAP11;
		static const long ID_HYPERLINKCTRL21;
		static const long ID_STATICBITMAP8;
		static const long ID_HYPERLINKCTRL16;
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
		void OnopenExamplesLinkClick(wxCommandEvent& event);
		void OnresourcesLinkClick(wxCommandEvent& event);
		void OnTutorial2BtClick(wxCommandEvent& event);
		void OnPanel1Paint(wxPaintEvent& event);
		void OncenterPanelPaint(wxPaintEvent& event);
		void OnfbLinkClick(wxCommandEvent& event);
		void OngoogleplusLinkClick(wxCommandEvent& event);
		void OnnewProjectLinkClick(wxCommandEvent& event);
		//*)

		MainFrame & mainEditor;

		DECLARE_EVENT_TABLE()
};

#endif

