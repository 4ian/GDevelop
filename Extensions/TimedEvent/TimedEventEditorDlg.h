/**

GDevelop - Timed Event Extension
Copyright (c) 2011-2013 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#ifndef TIMEDEVENTEDITORDLG_H
#define TIMEDEVENTEDITORDLG_H

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)

//(*Headers(TimedEventEditorDlg)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/textctrl.h>
#include <wx/statline.h>
#include <wx/panel.h>
#include <wx/bmpbuttn.h>
#include <wx/statbmp.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
#include "TimedEvent.h"
namespace gd { class Project; }
namespace gd { class Layout; }

class TimedEventEditorDlg: public wxDialog
{
	public:

		TimedEventEditorDlg(wxWindow* parent, TimedEvent & event_, gd::Project & game_, gd::Layout & scene_);
		virtual ~TimedEventEditorDlg();

		//(*Declarations(TimedEventEditorDlg)
		wxBitmapButton* expressionBt;
		wxStaticText* StaticText2;
		wxPanel* Panel1;
		wxStaticText* StaticText1;
		wxStaticText* StaticText3;
		wxButton* cancelBt;
		wxStaticLine* StaticLine2;
		wxTextCtrl* nameEdit;
		wxStaticLine* StaticLine1;
		wxButton* okBt;
		wxStaticBitmap* StaticBitmap3;
		wxTextCtrl* timeoutEdit;
		//*)

		TimedEvent & eventEdited;

	protected:

		//(*Identifiers(TimedEventEditorDlg)
		static const long ID_STATICBITMAP3;
		static const long ID_STATICTEXT3;
		static const long ID_PANEL1;
		static const long ID_STATICLINE2;
		static const long ID_STATICTEXT1;
		static const long ID_TEXTCTRL1;
		static const long ID_BITMAPBUTTON1;
		static const long ID_STATICTEXT2;
		static const long ID_TEXTCTRL2;
		static const long ID_STATICLINE1;
		static const long ID_BUTTON1;
		static const long ID_BUTTON2;
		//*)

	private:

		//(*Handlers(TimedEventEditorDlg)
		void OnokBtClick(wxCommandEvent& event);
		void OncancelBtClick(wxCommandEvent& event);
		void OnexpressionBtClick(wxCommandEvent& event);
		//*)

		gd::Project & game;
		gd::Layout & scene;

		DECLARE_EVENT_TABLE()
};

#endif
#endif

