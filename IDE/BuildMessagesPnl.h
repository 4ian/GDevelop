/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef BUILDMESSAGESPNL_H
#define BUILDMESSAGESPNL_H

//(*Headers(BuildMessagesPnl)
#include <wx/listctrl.h>
#include <wx/sizer.h>
#include <wx/panel.h>
//*)
class Game;
class ProjectManager;
#include <vector>
#include "GDL/CompilerMessagesParser.h"

class BuildMessagesPnl: public wxPanel
{
	public:

		BuildMessagesPnl(wxWindow* parent, ProjectManager * projectManager);
		virtual ~BuildMessagesPnl();

		void RefreshWith(Game * game, std::vector < CompilerMessage > messages);
		void OpenFileContainingFirstError();

        ProjectManager * projectManager; ///< Used to open files.
		Game * gameAssociatedWithErrors; ///< Game for which errors have been emitted.

		//(*Declarations(BuildMessagesPnl)
		wxListCtrl* messagesList;
		//*)

	protected:

		//(*Identifiers(BuildMessagesPnl)
		static const long ID_LISTCTRL1;
		//*)

	private:

		//(*Handlers(BuildMessagesPnl)
		void OnmessagesListItemActivated(wxListEvent& event);
		void OnResize(wxSizeEvent& event);
		//*)

		DECLARE_EVENT_TABLE()
};

#endif
