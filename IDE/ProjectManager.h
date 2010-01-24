#ifndef PROJECTMANAGER_H
#define PROJECTMANAGER_H

//(*Headers(ProjectManager)
#include <wx/treectrl.h>
#include <wx/sizer.h>
#include <wx/dialog.h>
//*)

class ProjectManager: public wxDialog
{
	public:

		ProjectManager(wxWindow* parent,wxWindowID id=wxID_ANY,const wxPoint& pos=wxDefaultPosition,const wxSize& size=wxDefaultSize);
		virtual ~ProjectManager();

		//(*Declarations(ProjectManager)
		wxTreeCtrl* TreeCtrl1;
		//*)

	protected:

		//(*Identifiers(ProjectManager)
		static const long ID_TREECTRL1;
		//*)

	private:

		//(*Handlers(ProjectManager)
		//*)

		DECLARE_EVENT_TABLE()
};

#endif
