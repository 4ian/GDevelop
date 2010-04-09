#ifndef CHOIXTEMPLATEEVENT_H
#define CHOIXTEMPLATEEVENT_H

//(*Headers(ChoixTemplateEvent)
#include <wx/treectrl.h>
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/textctrl.h>
#include <wx/statline.h>
#include <wx/panel.h>
#include <wx/statbmp.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
#include "tinyxml.h"
#include "GDL/Game.h" // Mettre à jour les chemins
#include "TemplateEvents.h"

class ChoixTemplateEvent: public wxDialog
{
	public:

		ChoixTemplateEvent(wxWindow* parent);
		virtual ~ChoixTemplateEvent();

		void Refresh();
		void RefreshTree();

		vector < TemplateEvents > templatesList;
		TemplateEvents finalTemplate;

		//(*Declarations(ChoixTemplateEvent)
		wxTextCtrl* Param3Edit;
		wxStaticText* DesTxt;
		wxTextCtrl* Param2Edit;
		wxStaticText* StaticText2;
		wxTextCtrl* Param8Edit;
		wxTextCtrl* Param4Edit;
		wxStaticBitmap* StaticBitmap1;
		wxTreeCtrl* TemplateTree;
		wxStaticText* Txt6;
		wxStaticText* Txt3;
		wxStaticText* Txt2;
		wxTextCtrl* Param5Edit;
		wxButton* InsererBt;
		wxPanel* Panel1;
		wxStaticText* StaticText1;
		wxStaticLine* StaticLine2;
		wxFlexGridSizer* controlsSizer;
		wxTextCtrl* Param1Edit;
		wxStaticText* Txt4;
		wxStaticText* Txt7;
		wxTextCtrl* Param6Edit;
		wxStaticLine* StaticLine1;
		wxButton* AnnulerBt;
		wxStaticText* Txt8;
		wxStaticText* Txt5;
		wxStaticText* Txt1;
		wxTextCtrl* Param7Edit;
		wxButton* AideBt;
		//*)
		vector < wxStaticText* > descriptionsTxt;
		vector < wxTextCtrl* > parametersEdit;

	protected:

		//(*Identifiers(ChoixTemplateEvent)
		static const long ID_TREECTRL1;
		static const long ID_STATICBITMAP1;
		static const long ID_STATICTEXT1;
		static const long ID_PANEL1;
		static const long ID_STATICTEXT2;
		static const long ID_STATICLINE1;
		static const long ID_STATICTEXT3;
		static const long ID_STATICTEXT4;
		static const long ID_TEXTCTRL1;
		static const long ID_STATICTEXT5;
		static const long ID_TEXTCTRL2;
		static const long ID_STATICTEXT6;
		static const long ID_TEXTCTRL3;
		static const long ID_STATICTEXT8;
		static const long ID_TEXTCTRL4;
		static const long ID_STATICTEXT7;
		static const long ID_TEXTCTRL5;
		static const long ID_STATICTEXT9;
		static const long ID_TEXTCTRL6;
		static const long ID_STATICTEXT10;
		static const long ID_TEXTCTRL7;
		static const long ID_STATICTEXT11;
		static const long ID_TEXTCTRL8;
		static const long ID_STATICLINE2;
		static const long ID_BUTTON2;
		static const long ID_BUTTON1;
		static const long ID_BUTTON3;
		//*)

	private:

		//(*Handlers(ChoixTemplateEvent)
		void OnInsererBtClick(wxCommandEvent& event);
		void OnAnnulerBtClick(wxCommandEvent& event);
		void OnTemplateTreeSelectionChanged(wxTreeEvent& event);
		void OnAideBtClick(wxCommandEvent& event);
		//*)
		wxTreeItemId item;

		string ConvertParam(string Parametre, string ToReplace, string ReplaceBy);
        void ProcessEvents(vector < BaseEventSPtr > & events );

		DECLARE_EVENT_TABLE()
};

#endif
