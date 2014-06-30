/**

Game Develop - Timed Event Extension
Copyright (c) 2011-2013 Florian Rival (Florian.Rival@gmail.com)

This software is provided 'as-is', without any express or implied
warranty. In no event will the authors be held liable for any damages
arising from the use of this software.

Permission is granted to anyone to use this software for any purpose,
including commercial applications, and to alter it and redistribute it
freely, subject to the following restrictions:

    1. The origin of this software must not be misrepresented; you must not
    claim that you wrote the original software. If you use this software
    in a product, an acknowledgment in the product documentation would be
    appreciated but is not required.

    2. Altered source versions must be plainly marked as such, and must not be
    misrepresented as being the original software.

    3. This notice may not be removed or altered from any source
    distribution.

*/

#ifndef TIMEDEVENTEDITORDLG_H
#define TIMEDEVENTEDITORDLG_H

#if defined(GD_IDE_ONLY)

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

