/**

GDevelop - Network Extension
Copyright (c) 2010-2014 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
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
#include <memory>
namespace gd { class Project; }
namespace gd { class MainFrameWrapper; }
class NetworkAutomatism;
namespace gd { class Layout; }
class ScenePhysicsDatas;

class NetworkAutomatismEditor: public wxDialog
{
	public:

		NetworkAutomatismEditor(wxWindow* parent, gd::Project & game_, gd::Layout * scene, NetworkAutomatism & automatism_ );
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

		gd::Project & game;
        gd::Layout * scene;

		DECLARE_EVENT_TABLE()
};

#endif
#endif

