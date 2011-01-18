#ifndef BUILDMESSAGESPNL_H
#define BUILDMESSAGESPNL_H

//(*Headers(BuildMessagesPnl)
#include <wx/listctrl.h>
#include <wx/sizer.h>
#include <wx/panel.h>
//*)
#include <vector>
#include "GDL/CompilerMessagesParser.h"

class BuildMessagesPnl: public wxPanel
{
	public:

		BuildMessagesPnl(wxWindow* parent,wxWindowID id=wxID_ANY,const wxPoint& pos=wxDefaultPosition,const wxSize& size=wxDefaultSize);
		virtual ~BuildMessagesPnl();

		void RefreshWith(std::vector < CompilerMessage > messages);

		//(*Declarations(BuildMessagesPnl)
		wxListCtrl* messagesList;
		//*)

	protected:

		//(*Identifiers(BuildMessagesPnl)
		static const long ID_LISTCTRL1;
		//*)

	private:

		//(*Handlers(BuildMessagesPnl)
		//*)

		DECLARE_EVENT_TABLE()
};

#endif
