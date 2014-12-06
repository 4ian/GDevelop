/**

GDevelop - Primitive Drawing Extension
Copyright (c) 2008-2014 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#if defined(GD_IDE_ONLY)

#ifndef DRAWEROBJECTEDITOR_H
#define DRAWEROBJECTEDITOR_H

//(*Headers(DrawerObjectEditor)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/radiobox.h>
#include <wx/spinctrl.h>
#include <wx/statline.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
namespace gd { class Project; }
class DrawerObject;
namespace gd { class MainFrameWrapper; }

/**
 * The editor dialog for drawer objects
 */
class DrawerObjectEditor: public wxDialog
{
	public:

		DrawerObjectEditor( wxWindow* parent, gd::Project & game_, DrawerObject & object_ );
		virtual ~DrawerObjectEditor();

		//(*Declarations(DrawerObjectEditor)
		wxStaticText* StaticText2;
		wxRadioBox* coordinatesRadio;
		wxSpinCtrl* outlineSizeEdit;
		wxSpinCtrl* fillOpacityEdit;
		wxStaticText* StaticText1;
		wxStaticText* StaticText3;
		wxButton* cancelBt;
		wxButton* fillColorBt;
		wxButton* outlineColorBt;
		wxStaticText* StaticText5;
		wxStaticLine* StaticLine1;
		wxSpinCtrl* outlineOpacityEdit;
		wxStaticText* StaticText4;
		wxButton* okBt;
		//*)

	protected:

		//(*Identifiers(DrawerObjectEditor)
		static const long ID_STATICTEXT3;
		static const long ID_BUTTON1;
		static const long ID_STATICTEXT5;
		static const long ID_SPINCTRL3;
		static const long ID_STATICTEXT1;
		static const long ID_BUTTON3;
		static const long ID_STATICTEXT2;
		static const long ID_SPINCTRL2;
		static const long ID_STATICTEXT4;
		static const long ID_SPINCTRL1;
		static const long ID_RADIOBOX1;
		static const long ID_STATICLINE1;
		static const long ID_BUTTON2;
		static const long ID_BUTTON4;
		//*)

	private:

		//(*Handlers(DrawerObjectEditor)
		void OnokBtClick(wxCommandEvent& event);
		void OncancelBtClick(wxCommandEvent& event);
		void OnfillColorBtClick(wxCommandEvent& event);
		void OnoutlineColorBtClick(wxCommandEvent& event);
		//*)

		gd::Project & game;
		DrawerObject & object;

		DECLARE_EVENT_TABLE()
};

#endif

#endif

