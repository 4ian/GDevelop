/**

GDevelop - Physics Behavior Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#ifndef PHYSICSBEHAVIOREDITOR_H
#define PHYSICSBEHAVIOREDITOR_H

#ifdef __WXMSW__
#include <wx/msw/winundef.h>
#endif
//(*Headers(PhysicsBehaviorEditor)
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
#include <memory>
namespace gd { class Project; }
namespace gd { class MainFrameWrapper; }
class PhysicsBehavior;
namespace gd { class Layout; }
class ScenePhysicsDatas;

class PhysicsBehaviorEditor: public wxDialog
{
	public:

		PhysicsBehaviorEditor(wxWindow* parent, gd::Project & game_, gd::Layout * scene, PhysicsBehavior & behavior_, gd::MainFrameWrapper & mainFrameWrapper_ );
		virtual ~PhysicsBehaviorEditor();

		//(*Declarations(PhysicsBehaviorEditor)
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

		PhysicsBehavior & behavior;

	protected:

		//(*Identifiers(PhysicsBehaviorEditor)
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

		//(*Handlers(PhysicsBehaviorEditor)
		void OncancelBtClick(wxCommandEvent& event);
		void OnokBtClick(wxCommandEvent& event);
		void OnpolygonCheckSelect(wxCommandEvent& event);
		void OncircleCheckSelect(wxCommandEvent& event);
		void OnrectCheckSelect(wxCommandEvent& event);
		void OnpolygonBtClick(wxCommandEvent& event);
		//*)

		gd::Project & game;
        gd::Layout * scene;
        std::shared_ptr<ScenePhysicsDatas> sharedDatas;

		std::vector<sf::Vector2f> coordsVector;
		unsigned int positioning;

		float polygonWidth;
		float polygonHeight;
		bool automaticResizing;

		DECLARE_EVENT_TABLE()
};

#endif
#endif

