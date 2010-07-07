#ifndef EXTERNALEVENTSEDITOR_H
#define EXTERNALEVENTSEDITOR_H

//(*Headers(ExternalEventsEditor)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/panel.h>
#include <wx/combobox.h>
//*)
class Game;
class ExternalEvents;
class EditorEvents;
#include "GDL/Scene.h"
#include "GDL/MainEditorCommand.h"

class ExternalEventsEditor: public wxPanel
{
	public:

		ExternalEventsEditor(wxWindow* parent, Game & game_, ExternalEvents & events_, const MainEditorCommand & mainEditorCommand_);
		virtual ~ExternalEventsEditor();

		//(*Declarations(ExternalEventsEditor)
		wxFlexGridSizer* FlexGridSizer4;
		wxStaticText* StaticText1;
		EditorEvents* eventsEditor;
		wxComboBox* parentSceneComboBox;
		wxFlexGridSizer* FlexGridSizer1;
		//*)

		ExternalEvents & events;

	protected:

		//(*Identifiers(ExternalEventsEditor)
		static const long ID_STATICTEXT1;
		static const long ID_COMBOBOX1;
		static const long ID_CUSTOM2;
		//*)

	private:

		//(*Handlers(ExternalEventsEditor)
		void OnComboBox1Select(wxCommandEvent& event);
		void OnparentSceneComboBoxSelect(wxCommandEvent& event);
		//*)
		void OnparentSceneComboBoxDropDown(wxCommandEvent& event);

		Game & game;
        Scene emptyScene;
		MainEditorCommand mainEditorCommand;

		DECLARE_EVENT_TABLE()
};

#endif
