/**

Game Develop - Physic Automatism Extension
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

//(*Headers(NetworkAutomatismEditor)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/radiobox.h>
#include <wx/textctrl.h>
#include <wx/checkbox.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
#include <boost/shared_ptr.hpp>
class Game;
namespace gd { class MainFrameWrapper; }
class NetworkAutomatism;
class Scene;
class ScenePhysicsDatas;

class NetworkAutomatismEditor: public wxDialog
{
	public:

		NetworkAutomatismEditor(wxWindow* parent, Game & game_, Scene * scene, NetworkAutomatism & automatism_ );
		virtual ~NetworkAutomatismEditor();

		//(*Declarations(NetworkAutomatismEditor)
		wxTextCtrl* dataPrefixEdit;
		wxStaticText* StaticText2;
		wxCheckBox* widthCheck;
		wxCheckBox* angleCheck;
		wxCheckBox* yPosCheck;
		wxCheckBox* xPosCheck;
		wxStaticText* StaticText1;
		wxStaticText* StaticText3;
		wxButton* cancelBt;
		wxRadioBox* initialBehaviourList;
		wxButton* okBt;
		wxCheckBox* heightCheck;
		//*)

		NetworkAutomatism & automatism;

	protected:

		//(*Identifiers(NetworkAutomatismEditor)
		static const long ID_RADIOBOX1;
		static const long ID_STATICTEXT1;
		static const long ID_CHECKBOX1;
		static const long ID_CHECKBOX2;
		static const long ID_CHECKBOX3;
		static const long ID_CHECKBOX4;
		static const long ID_CHECKBOX5;
		static const long ID_TEXTCTRL1;
		static const long ID_STATICTEXT2;
		static const long ID_STATICTEXT3;
		static const long ID_BUTTON1;
		static const long ID_BUTTON2;
		//*)

	private:

		//(*Handlers(NetworkAutomatismEditor)
		void OncancelBtClick(wxCommandEvent& event);
		void OnokBtClick(wxCommandEvent& event);
		//*)

		Game & game;
        Scene * scene;

		DECLARE_EVENT_TABLE()
};

#endif
#endif

