/**

Game Develop - Primitive Drawing Extension
Copyright (c) 2008-2014 Florian Rival (Florian.Rival@gmail.com)

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

