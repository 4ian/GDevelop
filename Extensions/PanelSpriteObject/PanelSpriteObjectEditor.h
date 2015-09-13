/**

GDevelop - Panel Sprite Extension
Copyright (c) 2012-2015 Victor Levasseur (victorlevasseur01@orange.fr)
This project is released under the MIT License.
*/

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#ifndef TILEDSPRITEOBJECTEDITOR_H
#define TILEDSPRITEOBJECTEDITOR_H

//(*Headers(PanelSpriteObjectEditor)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/textctrl.h>
#include <wx/checkbox.h>
#include <wx/statline.h>
#include <wx/panel.h>
#include <wx/bmpbuttn.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
#include <wx/aui/aui.h>
namespace gd { class Project; }
class PanelSpriteObject;
namespace gd { class MainFrameWrapper; }
class ResourcesEditor;

class PanelSpriteObjectEditor: public wxDialog
{
	public:

		PanelSpriteObjectEditor( wxWindow* parent, gd::Project & game_, PanelSpriteObject & object_, gd::MainFrameWrapper & mainFrameWrapper_ );
		virtual ~PanelSpriteObjectEditor();

		//(*Declarations(PanelSpriteObjectEditor)
		wxPanel* Core;
		wxTextCtrl* topMarginTextCtrl;
		wxTextCtrl* widthEdit;
		wxStaticText* StaticText2;
		wxTextCtrl* heightEdit;
		wxStaticText* StaticText8;
		wxStaticText* StaticText1;
		wxStaticText* StaticText3;
		wxButton* cancelBt;
		wxCheckBox* tileCheck;
		wxButton* imageBankBt;
		wxTextCtrl* bottomMarginTextCtrl;
		wxStaticText* StaticText5;
		wxStaticText* StaticText7;
		wxStaticLine* StaticLine1;
		wxTextCtrl* rightMarginTextCtrl;
		wxBitmapButton* frontAddFromBt;
		wxStaticText* StaticText4;
		wxTextCtrl* leftMarginTextCtrl;
		wxButton* okBt;
		wxTextCtrl* frontTextureEdit;
		//*)
		ResourcesEditor * resourcesEditor;

	protected:

		//(*Identifiers(PanelSpriteObjectEditor)
		static const long ID_STATICTEXT7;
		static const long ID_TEXTCTRL7;
		static const long ID_STATICTEXT8;
		static const long ID_TEXTCTRL8;
		static const long ID_CHECKBOX1;
		static const long ID_STATICTEXT2;
		static const long ID_TEXTCTRL3;
		static const long ID_STATICTEXT1;
		static const long ID_TEXTCTRL2;
		static const long ID_STATICTEXT5;
		static const long ID_STATICTEXT3;
		static const long ID_TEXTCTRL4;
		static const long ID_STATICTEXT4;
		static const long ID_TEXTCTRL5;
		static const long ID_TEXTCTRL1;
		static const long ID_BITMAPBUTTON1;
		static const long ID_STATICLINE1;
		static const long ID_BUTTON3;
		static const long ID_BUTTON1;
		static const long ID_BUTTON2;
		static const long ID_PANEL1;
		//*)

	private:

		//(*Handlers(PanelSpriteObjectEditor)
		void OncancelBtClick(wxCommandEvent& event);
		void OnokBtClick(wxCommandEvent& event);
		void OnfrontAddFromBtClick(wxCommandEvent& event);
		void OnimageBankBtClick(wxCommandEvent& event);
		//*)

		gd::Project & game;
		gd::MainFrameWrapper & mainFrameWrapper;
		PanelSpriteObject & object;

		wxAuiManager m_mgr; ///< Used to display the image bank editor

		DECLARE_EVENT_TABLE()
};

#endif
#endif

