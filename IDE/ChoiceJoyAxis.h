/*
 * GDevelop IDE
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU General Public License version 3.
 */

#ifndef CHOICEJOYAXIS_H
#define CHOICEJOYAXIS_H

//(*Headers(ChoiceJoyAxis)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/radiobox.h>
#include <wx/statline.h>
#include <wx/hyperlink.h>
#include <wx/statbmp.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
#include <string>
#include <vector>
#include "GDCore/String.h"
namespace gd { class Project; }
namespace gd { class Layout; }

/**
 * \brief Dialog to let the user choose a joystick axis, for parameters of actions/conditions/expressions.
 */
class ChoiceJoyAxis: public wxDialog
{
	public:

		ChoiceJoyAxis(wxWindow* parent, gd::String joyaxis_, gd::Project & game_, gd::Layout & scene_);
		virtual ~ChoiceJoyAxis();

		//(*Declarations(ChoiceJoyAxis)
		wxStaticBitmap* StaticBitmap2;
		wxRadioBox* axisRadio;
		wxButton* advancedBt;
		wxStaticText* StaticText1;
		wxStaticLine* StaticLine1;
		wxHyperlinkCtrl* helpBt;
		wxButton* okBt;
		wxButton* annulerBt;
		//*)

		gd::String joyaxis;

	protected:

		//(*Identifiers(ChoiceJoyAxis)
		static const long ID_STATICTEXT1;
		static const long ID_RADIOBOX1;
		static const long ID_STATICLINE1;
		static const long ID_STATICBITMAP2;
		static const long ID_HYPERLINKCTRL1;
		static const long ID_BUTTON3;
		static const long ID_BUTTON2;
		static const long ID_BUTTON4;
		//*)

	private:

		gd::Project & game;
		gd::Layout & scene;
		bool canSelectGroup;

		//(*Handlers(ChoiceJoyAxis)
		void OnadvancedBtClick(wxCommandEvent& event);
		void OnaxisRadioSelect(wxCommandEvent& event);
		void OnokBtClick(wxCommandEvent& event);
		void OnannulerBtClick(wxCommandEvent& event);
		void OnhelpBtClick(wxCommandEvent& event);
		//*)

		DECLARE_EVENT_TABLE()
};

#endif
