/**

Game Develop - A Star Automatism Extension
Copyright (c) 2010-2012 Florian Rival (Florian.Rival@gmail.com)

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
#ifndef PHYSICSAUTOMATISMEDITOR_H
#define PHYSICSAUTOMATISMEDITOR_H

//(*Headers(AStarAutomatismEditor)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/textctrl.h>
#include <wx/checkbox.h>
#include <wx/statline.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
#include <boost/shared_ptr.hpp>
class Game;
namespace gd { class MainFrameWrapper; }
class AStarAutomatism;
class Scene;
class SceneAStarDatas;

class AStarAutomatismEditor: public wxDialog
{
	public:

		AStarAutomatismEditor(wxWindow* parent, Game & game_, Scene * scene, AStarAutomatism & automatism_ );
		virtual ~AStarAutomatismEditor();

		//(*Declarations(AStarAutomatismEditor)
		wxButton* OkBt;
		wxStaticText* StaticText2;
		wxTextCtrl* bottomBorderEdit;
		wxStaticText* StaticText1;
		wxStaticText* StaticText3;
		wxButton* cancelBt;
		wxTextCtrl* gridHeightEdit;
		wxTextCtrl* topBorderEdit;
		wxStaticText* StaticText5;
		wxStaticLine* StaticLine1;
		wxTextCtrl* rightBorderEdit;
		wxTextCtrl* costEdit;
		wxTextCtrl* gridWidthEdit;
		wxTextCtrl* leftBorderEdit;
		wxCheckBox* diagonalMoveCheck;
		wxStaticText* StaticText4;
		//*)

		AStarAutomatism & automatism;

	protected:

		//(*Identifiers(AStarAutomatismEditor)
		static const long ID_STATICTEXT1;
		static const long ID_TEXTCTRL1;
		static const long ID_STATICTEXT2;
		static const long ID_STATICTEXT4;
		static const long ID_TEXTCTRL4;
		static const long ID_TEXTCTRL5;
		static const long ID_TEXTCTRL6;
		static const long ID_TEXTCTRL7;
		static const long ID_STATICTEXT3;
		static const long ID_TEXTCTRL2;
		static const long ID_STATICTEXT5;
		static const long ID_TEXTCTRL3;
		static const long ID_CHECKBOX1;
		static const long ID_STATICLINE1;
		static const long ID_BUTTON1;
		static const long ID_BUTTON2;
		//*)

	private:

		//(*Handlers(AStarAutomatismEditor)
		void OncancelBtClick(wxCommandEvent& event);
		void OnokBtClick(wxCommandEvent& event);
		//*)

		Game & game;
        Scene * scene;
        boost::shared_ptr<SceneAStarDatas> sharedDatas;

		DECLARE_EVENT_TABLE()
};

#endif
#endif

