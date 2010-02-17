#ifndef PROJECTMANAGER_H
#define PROJECTMANAGER_H

//(*Headers(ProjectManager)
#include <wx/treectrl.h>
#include <wx/sizer.h>
#include <wx/panel.h>
//*)
class Game_Develop_EditorFrame;

class ProjectManager: public wxPanel
{
	public:

		ProjectManager(wxWindow* parent, Game_Develop_EditorFrame & mainEditor_);
		virtual ~ProjectManager();

		//(*Declarations(ProjectManager)
		wxTreeCtrl* projectsTree;
		//*)

		Game_Develop_EditorFrame & mainEditor;

	protected:

		//(*Identifiers(ProjectManager)
		static const long ID_TREECTRL1;
		//*)

	private:

		//(*Handlers(ProjectManager)
		void OnprojectsTreeItemActivated(wxTreeEvent& event);
		//*)
        void Refresh();


		DECLARE_EVENT_TABLE()
};

#endif
