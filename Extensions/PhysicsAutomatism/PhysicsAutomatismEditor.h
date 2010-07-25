#if defined(GDE)
#ifndef PHYSICSAUTOMATISMEDITOR_H
#define PHYSICSAUTOMATISMEDITOR_H

//(*Headers(PhysicsAutomatismEditor)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/textctrl.h>
#include <wx/statline.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
class Game;
class MainEditorCommand;
class PhysicsAutomatism;
class Scene;

class PhysicsAutomatismEditor: public wxDialog
{
	public:

		PhysicsAutomatismEditor(wxWindow* parent, Game & game_, Scene * scene, PhysicsAutomatism & automatism_, MainEditorCommand & mainEditorCommand_ );
		virtual ~PhysicsAutomatismEditor();

		//(*Declarations(PhysicsAutomatismEditor)
		wxTextCtrl* gravityXEdit;
		wxTextCtrl* frictionEdit;
		wxStaticText* StaticText2;
		wxStaticText* StaticText1;
		wxStaticText* StaticText3;
		wxButton* cancelBt;
		wxTextCtrl* gravityYEdit;
		wxStaticLine* StaticLine1;
		wxTextCtrl* massDensityEdit;
		wxStaticText* StaticText4;
		wxButton* okBt;
		//*)

		PhysicsAutomatism & automatism;

	protected:

		//(*Identifiers(PhysicsAutomatismEditor)
		static const long ID_STATICTEXT1;
		static const long ID_TEXTCTRL1;
		static const long ID_STATICTEXT2;
		static const long ID_TEXTCTRL2;
		static const long ID_STATICTEXT3;
		static const long ID_TEXTCTRL3;
		static const long ID_STATICTEXT4;
		static const long ID_TEXTCTRL4;
		static const long ID_STATICLINE1;
		static const long ID_BUTTON1;
		static const long ID_BUTTON2;
		//*)

	private:

		//(*Handlers(PhysicsAutomatismEditor)
		void OncancelBtClick(wxCommandEvent& event);
		void OnokBtClick(wxCommandEvent& event);
		//*)

		Game & game;
        Scene * scene;
		MainEditorCommand & mainEditorCommand;

		DECLARE_EVENT_TABLE()
};

#endif
#endif
