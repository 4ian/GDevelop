#ifndef OBJECTLISTPANEL_H
#define OBJECTLISTPANEL_H

//(*Headers(ObjectListPanel)
#include <wx/panel.h>
//*)

class ObjectListPanel: public wxPanel
{
	public:

		ObjectListPanel(wxWindow* parent,wxWindowID id=wxID_ANY,const wxPoint& pos=wxDefaultPosition,const wxSize& size=wxDefaultSize);
		virtual ~ObjectListPanel();

		//(*Declarations(ObjectListPanel)
		//*)

	protected:

		//(*Identifiers(ObjectListPanel)
		//*)

	private:

		//(*Handlers(ObjectListPanel)
		//*)

		DECLARE_EVENT_TABLE()
};

#endif
