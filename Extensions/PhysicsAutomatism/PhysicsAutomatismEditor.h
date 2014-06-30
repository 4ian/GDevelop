/**

Game Develop - Physics Automatism Extension
Copyright (c) 2010-2014 Florian Rival (Florian.Rival@gmail.com)

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

#ifdef __WXMSW__
#include <wx/msw/winundef.h>
#endif
//(*Headers(PhysicsAutomatismEditor)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/textctrl.h>
#include <wx/checkbox.h>
#include <wx/statline.h>
#include <wx/radiobut.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)

#include <vector>
#include "SFML/System/Vector2.hpp"

#ifdef __WXMSW__
#include <wx/msw/winundef.h>
#endif
#include <boost/shared_ptr.hpp>
namespace gd { class Project; }
namespace gd { class MainFrameWrapper; }
class PhysicsAutomatism;
namespace gd { class Layout; }
class ScenePhysicsDatas;

class PhysicsAutomatismEditor: public wxDialog
{
	public:

		PhysicsAutomatismEditor(wxWindow* parent, gd::Project & game_, gd::Layout * scene, PhysicsAutomatism & automatism_, gd::MainFrameWrapper & mainFrameWrapper_ );
		virtual ~PhysicsAutomatismEditor();

		//(*Declarations(PhysicsAutomatismEditor)
		wxTextCtrl* scaleYEdit;
		wxStaticText* StaticText10;
		wxTextCtrl* gravityXEdit;
		wxStaticText* StaticText9;
		wxCheckBox* fixedRotationCheck;
		wxTextCtrl* frictionEdit;
		wxStaticText* StaticText2;
		wxTextCtrl* restitutionEdit;
		wxStaticText* StaticText6;
		wxStaticText* StaticText8;
		wxStaticText* StaticText11;
		wxTextCtrl* scaleXEdit;
		wxStaticText* StaticText1;
		wxStaticText* StaticText3;
		wxButton* cancelBt;
		wxTextCtrl* linearDampingEdit;
		wxStaticText* StaticText5;
		wxStaticText* StaticText7;
		wxTextCtrl* angularDampingEdit;
		wxTextCtrl* gravityYEdit;
		wxRadioButton* polygonCheck;
		wxStaticLine* StaticLine1;
		wxTextCtrl* massDensityEdit;
		wxRadioButton* rectCheck;
		wxStaticText* StaticText12;
		wxCheckBox* bulletCheck;
		wxStaticText* StaticText4;
		wxRadioButton* circleCheck;
		wxButton* okBt;
		wxButton* polygonBt;
		wxCheckBox* staticCheck;
		//*)

		PhysicsAutomatism & automatism;

	protected:

		//(*Identifiers(PhysicsAutomatismEditor)
		static const long ID_STATICTEXT11;
		static const long ID_RADIOBUTTON1;
		static const long ID_RADIOBUTTON2;
		static const long ID_RADIOBUTTON3;
		static const long ID_BUTTON3;
		static const long ID_CHECKBOX1;
		static const long ID_CHECKBOX3;
		static const long ID_CHECKBOX2;
		static const long ID_STATICTEXT1;
		static const long ID_TEXTCTRL1;
		static const long ID_STATICTEXT2;
		static const long ID_TEXTCTRL2;
		static const long ID_STATICTEXT12;
		static const long ID_TEXTCTRL9;
		static const long ID_STATICTEXT9;
		static const long ID_TEXTCTRL7;
		static const long ID_STATICTEXT10;
		static const long ID_TEXTCTRL8;
		static const long ID_STATICTEXT3;
		static const long ID_TEXTCTRL3;
		static const long ID_STATICTEXT4;
		static const long ID_TEXTCTRL4;
		static const long ID_STATICTEXT5;
		static const long ID_STATICTEXT7;
		static const long ID_TEXTCTRL5;
		static const long ID_STATICTEXT6;
		static const long ID_TEXTCTRL6;
		static const long ID_STATICTEXT8;
		static const long ID_STATICLINE1;
		static const long ID_BUTTON1;
		static const long ID_BUTTON2;
		//*)

	private:

		//(*Handlers(PhysicsAutomatismEditor)
		void OncancelBtClick(wxCommandEvent& event);
		void OnokBtClick(wxCommandEvent& event);
		void OnpolygonCheckSelect(wxCommandEvent& event);
		void OncircleCheckSelect(wxCommandEvent& event);
		void OnrectCheckSelect(wxCommandEvent& event);
		void OnpolygonBtClick(wxCommandEvent& event);
		//*)

		gd::Project & game;
        gd::Layout * scene;
        boost::shared_ptr<ScenePhysicsDatas> sharedDatas;

		std::vector<sf::Vector2f> coordsVector;
		unsigned int positioning;

		float polygonWidth;
		float polygonHeight;
		bool automaticResizing;

		DECLARE_EVENT_TABLE()
};

#endif
#endif

