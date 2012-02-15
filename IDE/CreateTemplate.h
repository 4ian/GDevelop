/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef CREATETEMPLATE_H
#define CREATETEMPLATE_H

//(*Headers(CreateTemplate)
#include <wx/notebook.h>
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/textctrl.h>
#include <wx/statline.h>
#include <wx/panel.h>
#include <wx/statbmp.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
#include "GDL/Game.h"
#include "GDL/Event.h"
#include <string>
#include <vector>

using namespace std;

class CreateTemplate: public wxDialog
{
	public:

		CreateTemplate(wxWindow* parent, vector < BaseEventSPtr > & pEvents);
		virtual ~CreateTemplate();

		//(*Declarations(CreateTemplate)
		wxTextCtrl* NomObj8Edit;
		wxButton* CreateBt;
		wxTextCtrl* NomObj6Edit;
		wxTextCtrl* Desc6Edit;
		wxNotebook* Notebook1;
		wxStaticText* StaticText2;
		wxTextCtrl* NomObj7Edit;
		wxButton* Button1;
		wxStaticText* StaticText6;
		wxTextCtrl* Desc5Edit;
		wxPanel* Panel1;
		wxStaticText* StaticText1;
		wxStaticText* StaticText3;
		wxPanel* Panel3;
		wxStaticLine* StaticLine2;
		wxTextCtrl* NomObj5Edit;
		wxTextCtrl* Desc2Edit;
		wxTextCtrl* NomObj3Edit;
		wxStaticText* StaticText5;
		wxStaticText* StaticText7;
		wxTextCtrl* NomObj2Edit;
		wxStaticLine* StaticLine1;
		wxTextCtrl* Desc1Edit;
		wxTextCtrl* Desc3Edit;
		wxTextCtrl* Desc7Edit;
		wxButton* AnnulerBt;
		wxTextCtrl* Desc8Edit;
		wxPanel* Panel2;
		wxTextCtrl* NomObj4Edit;
		wxStaticText* StaticText4;
		wxTextCtrl* nomEdit;
		wxStaticBitmap* StaticBitmap3;
		wxTextCtrl* descEdit;
		wxTextCtrl* NomObj1Edit;
		wxTextCtrl* Desc4Edit;
		wxButton* AideBt;
		//*)

	protected:

		//(*Identifiers(CreateTemplate)
		static const long ID_STATICBITMAP3;
		static const long ID_STATICTEXT1;
		static const long ID_PANEL1;
		static const long ID_STATICLINE1;
		static const long ID_STATICTEXT5;
		static const long ID_TEXTCTRL18;
		static const long ID_STATICTEXT4;
		static const long ID_TEXTCTRL17;
		static const long ID_BUTTON4;
		static const long ID_PANEL2;
		static const long ID_STATICTEXT2;
		static const long ID_STATICTEXT3;
		static const long ID_STATICTEXT6;
		static const long ID_STATICTEXT7;
		static const long ID_TEXTCTRL1;
		static const long ID_TEXTCTRL16;
		static const long ID_TEXTCTRL15;
		static const long ID_TEXTCTRL14;
		static const long ID_TEXTCTRL13;
		static const long ID_TEXTCTRL12;
		static const long ID_TEXTCTRL11;
		static const long ID_TEXTCTRL10;
		static const long ID_TEXTCTRL9;
		static const long ID_TEXTCTRL8;
		static const long ID_TEXTCTRL7;
		static const long ID_TEXTCTRL6;
		static const long ID_TEXTCTRL5;
		static const long ID_TEXTCTRL4;
		static const long ID_TEXTCTRL3;
		static const long ID_TEXTCTRL2;
		static const long ID_PANEL3;
		static const long ID_NOTEBOOK1;
		static const long ID_STATICLINE2;
		static const long ID_BUTTON2;
		static const long ID_BUTTON1;
		static const long ID_BUTTON3;
		//*)

	private:

		//(*Handlers(CreateTemplate)
		void OnCreateBtClick(wxCommandEvent& event);
		void OnAnnulerBtClick(wxCommandEvent& event);
		void OnAideBtClick(wxCommandEvent& event);
		void OnButton1Click(wxCommandEvent& event);
		//*)

        vector < BaseEventSPtr > events;

		string ConvertParam(string Parametre, string ToReplace, string ReplaceBy);
        void ProcessEvents(vector < BaseEventSPtr > & eventsToProcess, vector < std::pair<string, int> > parameters);

		DECLARE_EVENT_TABLE()
};

#endif
