/*
 * GDevelop IDE
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU General Public License version 3.
 */

#ifndef CHOICEFILE_H
#define CHOICEFILE_H

//(*Headers(ChoiceFile)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/textctrl.h>
#include <wx/statline.h>
#include <wx/hyperlink.h>
#include <wx/statbmp.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
namespace gd { class Project; }
namespace gd { class Layout; }
#include "GDCore/Project/Layout.h"
#include <string>
#include <vector>
#include "GDCore/String.h"

using namespace std;

/**
 * \brief Dialog to let the user choose a file, for parameters of actions/conditions/expressions.
 */
class ChoiceFile: public wxDialog
{
	public:

		ChoiceFile(wxWindow* parent, gd::String file_, gd::Project & game_, gd::Layout & scene_);
		virtual ~ChoiceFile();

		//(*Declarations(ChoiceFile)
		wxStaticBitmap* StaticBitmap2;
		wxStaticText* StaticText2;
		wxButton* advancedBt;
		wxStaticText* StaticText1;
		wxButton* cancelBt;
		wxTextCtrl* fileEdit;
		wxStaticLine* StaticLine1;
		wxButton* browseBt;
		wxHyperlinkCtrl* helpBt;
		wxButton* okBt;
		//*)

		gd::String file;

	protected:

		//(*Identifiers(ChoiceFile)
		static const long ID_STATICTEXT1;
		static const long ID_TEXTCTRL1;
		static const long ID_BUTTON1;
		static const long ID_STATICTEXT2;
		static const long ID_STATICLINE1;
		static const long ID_STATICBITMAP2;
		static const long ID_HYPERLINKCTRL1;
		static const long ID_BUTTON4;
		static const long ID_BUTTON3;
		static const long ID_BUTTON2;
		//*)

	private:

		//(*Handlers(ChoiceFile)
		void OnadvancedBtClick(wxCommandEvent& event);
		void OnokBtClick(wxCommandEvent& event);
		void OncancelBtClick(wxCommandEvent& event);
		void OnfileEditText(wxCommandEvent& event);
		void OnbrowseBtClick(wxCommandEvent& event);
		void OnhelpBtClick(wxCommandEvent& event);
		//*)

        //Donn�es pour �diter une expression textuelle
		gd::Project & game;
		gd::Layout & scene;
		bool canSelectGroup;

		DECLARE_EVENT_TABLE()
};

#endif
