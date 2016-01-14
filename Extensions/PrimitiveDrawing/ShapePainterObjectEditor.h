/**

GDevelop - Primitive Drawing Extension
Copyright (c) 2008-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)

#ifndef DRAWEROBJECTEDITOR_H
#define DRAWEROBJECTEDITOR_H

//(*Headers(ShapePainterObjectEditor)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/radiobox.h>
#include <wx/spinctrl.h>
#include <wx/statline.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
namespace gd { class Project; }
class ShapePainterObject;
namespace gd { class MainFrameWrapper; }

/**
 * The editor dialog for drawer objects
 */
class ShapePainterObjectEditor: public wxDialog
{
	public:

		ShapePainterObjectEditor( wxWindow* parent, gd::Project & game_, ShapePainterObject & object_ );
		virtual ~ShapePainterObjectEditor();

		//(*Declarations(ShapePainterObjectEditor)
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

		//(*Identifiers(ShapePainterObjectEditor)
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

		//(*Handlers(ShapePainterObjectEditor)
		void OnokBtClick(wxCommandEvent& event);
		void OncancelBtClick(wxCommandEvent& event);
		void OnfillColorBtClick(wxCommandEvent& event);
		void OnoutlineColorBtClick(wxCommandEvent& event);
		//*)

		gd::Project & game;
		ShapePainterObject & object;

		DECLARE_EVENT_TABLE()
};

#endif

#endif

