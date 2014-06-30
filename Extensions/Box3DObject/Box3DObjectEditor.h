/**

Game Develop - Box 3D Extension
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
#ifndef BOX3DOBJECTEDITOR_H
#define BOX3DOBJECTEDITOR_H

//(*Headers(Box3DObjectEditor)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/textctrl.h>
#include <wx/statline.h>
#include <wx/panel.h>
#include <wx/bmpbuttn.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
#include <wx/aui/aui.h>
namespace gd { class Project; }
class Box3DObject;
namespace gd { class MainFrameWrapper; }
class ResourcesEditor;

class Box3DObjectEditor: public wxDialog
{
	public:

		Box3DObjectEditor( wxWindow* parent, gd::Project & game_, Box3DObject & object_, gd::MainFrameWrapper & mainFrameWrapper_ );
		virtual ~Box3DObjectEditor();

		//(*Declarations(Box3DObjectEditor)
		wxPanel* Core;
		wxStaticText* StaticText9;
		wxTextCtrl* widthEdit;
		wxTextCtrl* bottomTextureEdit;
		wxStaticText* StaticText2;
		wxTextCtrl* backTextureEdit;
		wxStaticText* StaticText6;
		wxTextCtrl* heightEdit;
		wxStaticText* StaticText8;
		wxTextCtrl* depthEdit;
		wxBitmapButton* rightAddFromBt;
		wxStaticText* StaticText1;
		wxStaticText* StaticText3;
		wxTextCtrl* topTextureEdit;
		wxButton* cancelBt;
		wxBitmapButton* topAddFromBt;
		wxBitmapButton* leftAddFromBt;
		wxButton* imageBankBt;
		wxBitmapButton* backAddFromBt;
		wxTextCtrl* leftTextureEdit;
		wxTextCtrl* rightTextureEdit;
		wxStaticText* StaticText5;
		wxStaticText* StaticText7;
		wxStaticLine* StaticLine1;
		wxBitmapButton* frontAddFromBt;
		wxStaticText* StaticText4;
		wxButton* okBt;
		wxBitmapButton* bottomAddFromBt;
		wxTextCtrl* frontTextureEdit;
		//*)
		ResourcesEditor * resourcesEditor;

	protected:

		//(*Identifiers(Box3DObjectEditor)
		static const long ID_STATICTEXT7;
		static const long ID_TEXTCTRL7;
		static const long ID_STATICTEXT8;
		static const long ID_TEXTCTRL8;
		static const long ID_STATICTEXT9;
		static const long ID_TEXTCTRL9;
		static const long ID_STATICTEXT1;
		static const long ID_TEXTCTRL1;
		static const long ID_BITMAPBUTTON1;
		static const long ID_STATICTEXT2;
		static const long ID_TEXTCTRL2;
		static const long ID_BITMAPBUTTON2;
		static const long ID_STATICTEXT3;
		static const long ID_TEXTCTRL3;
		static const long ID_BITMAPBUTTON3;
		static const long ID_STATICTEXT4;
		static const long ID_TEXTCTRL4;
		static const long ID_BITMAPBUTTON4;
		static const long ID_STATICTEXT5;
		static const long ID_TEXTCTRL5;
		static const long ID_BITMAPBUTTON5;
		static const long ID_STATICTEXT6;
		static const long ID_TEXTCTRL6;
		static const long ID_BITMAPBUTTON6;
		static const long ID_STATICLINE1;
		static const long ID_BUTTON3;
		static const long ID_BUTTON1;
		static const long ID_BUTTON2;
		static const long ID_PANEL1;
		//*)

	private:

		//(*Handlers(Box3DObjectEditor)
		void OncancelBtClick(wxCommandEvent& event);
		void OnokBtClick(wxCommandEvent& event);
		void OnfrontAddFromBtClick(wxCommandEvent& event);
		void OntopAddFromBtClick(wxCommandEvent& event);
		void OnbottomAddFromBtClick(wxCommandEvent& event);
		void OnleftAddFromBtClick(wxCommandEvent& event);
		void OnrightAddFromBtClick(wxCommandEvent& event);
		void OnbackAddFromBtClick(wxCommandEvent& event);
		void OnimageBankBtClick(wxCommandEvent& event);
		//*)

		gd::Project & game;
		gd::MainFrameWrapper & mainFrameWrapper;
		Box3DObject & object;

		wxAuiManager m_mgr; ///< Used to display the image bank editor

		DECLARE_EVENT_TABLE()
};

#endif
#endif

