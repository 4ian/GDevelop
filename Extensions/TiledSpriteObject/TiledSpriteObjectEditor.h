/**

GDevelop - Tiled Sprite Extension
Copyright (c) 2012-2016 Victor Levasseur (victorlevasseur01@orange.fr)
Copyright (c) 2013-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#ifndef TILEDSPRITEOBJECTEDITOR_H
#define TILEDSPRITEOBJECTEDITOR_H

//(*Headers(TiledSpriteObjectEditor)
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
class TiledSpriteObject;
namespace gd { class MainFrameWrapper; }
class ResourcesEditor;

class TiledSpriteObjectEditor: public wxDialog
{
	public:

		TiledSpriteObjectEditor( wxWindow* parent, gd::Project & game_, TiledSpriteObject & object_, gd::MainFrameWrapper & mainFrameWrapper_ );
		virtual ~TiledSpriteObjectEditor();

		//(*Declarations(TiledSpriteObjectEditor)
		wxPanel* Core;
		wxTextCtrl* widthEdit;
		wxTextCtrl* heightEdit;
		wxStaticText* StaticText8;
		wxButton* cancelBt;
		wxButton* imageBankBt;
		wxStaticText* StaticText7;
		wxStaticLine* StaticLine1;
		wxCheckBox* smoothCheckBox;
		wxBitmapButton* frontAddFromBt;
		wxButton* okBt;
		wxTextCtrl* frontTextureEdit;
		//*)
		ResourcesEditor * resourcesEditor;

	protected:

		//(*Identifiers(TiledSpriteObjectEditor)
		static const long ID_STATICTEXT7;
		static const long ID_TEXTCTRL7;
		static const long ID_STATICTEXT8;
		static const long ID_TEXTCTRL8;
		static const long ID_TEXTCTRL1;
		static const long ID_BITMAPBUTTON1;
		static const long ID_CHECKBOX1;
		static const long ID_STATICLINE1;
		static const long ID_BUTTON3;
		static const long ID_BUTTON1;
		static const long ID_BUTTON2;
		static const long ID_PANEL1;
		//*)

	private:

		//(*Handlers(TiledSpriteObjectEditor)
		void OncancelBtClick(wxCommandEvent& event);
		void OnokBtClick(wxCommandEvent& event);
		void OnfrontAddFromBtClick(wxCommandEvent& event);
		void OnimageBankBtClick(wxCommandEvent& event);
		//*)

		gd::Project & game;
		gd::MainFrameWrapper & mainFrameWrapper;
		TiledSpriteObject & object;

		wxAuiManager m_mgr; ///< Used to display the image bank editor

		DECLARE_EVENT_TABLE()
};

#endif
#endif

