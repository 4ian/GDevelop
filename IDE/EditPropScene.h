/*
 * GDevelop IDE
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU General Public License version 3.
 */

#ifndef EDITPROPSCENE_H
#define EDITPROPSCENE_H

//(*Headers(EditPropScene)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/textctrl.h>
#include <wx/checkbox.h>
#include <wx/statline.h>
#include <wx/radiobut.h>
#include <wx/panel.h>
#include <wx/hyperlink.h>
#include <wx/statbmp.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
namespace gd { class Layout; }
namespace gd { class Layout; }

/**
 * \brief Dialog showing the properties of a scene.
 *
 * \todo Use the properties grid of the project manager instead of this custom dialog.
 */
class EditPropScene: public wxDialog
{
	public:

		EditPropScene(wxWindow* parent, gd::Layout & layout_);
		virtual ~EditPropScene();

		gd::Layout & layout;

		//(*Declarations(EditPropScene)
		wxButton* OkBt;
		wxStaticText* StaticText9;
		wxCheckBox* disableInputCheck;
		wxTextCtrl* zFarEdit;
		wxStaticText* StaticText2;
		wxTextCtrl* CaptionEdit;
		wxStaticText* StaticText6;
		wxStaticBitmap* StaticBitmap1;
		wxStaticText* StaticText8;
		wxPanel* Panel1;
		wxStaticText* StaticText1;
		wxStaticText* StaticText3;
		wxHyperlinkCtrl* HyperlinkCtrl1;
		wxStaticLine* StaticLine2;
		wxTextCtrl* zNearEdit;
		wxStaticText* StaticText5;
		wxTextCtrl* fovEdit;
		wxStaticText* StaticText7;
		wxRadioButton* stableSortCheck;
		wxRadioButton* fastSortCheck;
		wxButton* AnnulerBt;
		wxCheckBox* stopSoundsCheck;
		wxStaticText* StaticText4;
		//*)

	protected:

		//(*Identifiers(EditPropScene)
		static const long ID_STATICTEXT4;
		static const long ID_STATICTEXT8;
		static const long ID_TEXTCTRL1;
		static const long ID_STATICTEXT9;
		static const long ID_PANEL1;
		static const long ID_CHECKBOX2;
		static const long ID_CHECKBOX1;
		static const long ID_STATICTEXT1;
		static const long ID_RADIOBUTTON1;
		static const long ID_RADIOBUTTON2;
		static const long ID_STATICTEXT3;
		static const long ID_STATICTEXT2;
		static const long ID_TEXTCTRL2;
		static const long ID_STATICTEXT5;
		static const long ID_STATICTEXT6;
		static const long ID_TEXTCTRL3;
		static const long ID_STATICTEXT7;
		static const long ID_TEXTCTRL4;
		static const long ID_STATICLINE2;
		static const long ID_STATICBITMAP2;
		static const long ID_HYPERLINKCTRL1;
		static const long ID_BUTTON2;
		static const long ID_BUTTON3;
		//*)

	private:

		//(*Handlers(EditPropScene)
		void OnOkBtClick(wxCommandEvent& event);
		void OnAnnulerBtClick(wxCommandEvent& event);
		void OnColorBtClick(wxCommandEvent& event);
		void OnAideBtClick(wxCommandEvent& event);
		void OnPanel1LeftUp(wxMouseEvent& event);
		//*)

		DECLARE_EVENT_TABLE()
};

#endif

