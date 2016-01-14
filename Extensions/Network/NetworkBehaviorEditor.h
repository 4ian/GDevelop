/**

GDevelop - Network Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#ifndef PHYSICSBEHAVIOREDITOR_H
#define PHYSICSBEHAVIOREDITOR_H

//(*Headers(NetworkBehaviorEditor)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/radiobox.h>
#include <wx/textctrl.h>
#include <wx/checkbox.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
#include <memory>
namespace gd { class Project; }
namespace gd { class MainFrameWrapper; }
class NetworkBehavior;
namespace gd { class Layout; }
class ScenePhysicsDatas;

class NetworkBehaviorEditor: public wxDialog
{
	public:

		NetworkBehaviorEditor(wxWindow* parent, gd::Project & game_, gd::Layout * scene, NetworkBehavior & behavior_ );
		virtual ~NetworkBehaviorEditor();

		//(*Declarations(NetworkBehaviorEditor)
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

		NetworkBehavior & behavior;

	protected:

		//(*Identifiers(NetworkBehaviorEditor)
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

		//(*Handlers(NetworkBehaviorEditor)
		void OncancelBtClick(wxCommandEvent& event);
		void OnokBtClick(wxCommandEvent& event);
		//*)

		gd::Project & game;
        gd::Layout * scene;

		DECLARE_EVENT_TABLE()
};

#endif
#endif

