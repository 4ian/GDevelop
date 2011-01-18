#include "BuildMessagesPnl.h"

//(*InternalHeaders(BuildMessagesPnl)
#include <wx/intl.h>
#include <wx/string.h>
//*)
#include "GDL/CommonTools.h"

//(*IdInit(BuildMessagesPnl)
const long BuildMessagesPnl::ID_LISTCTRL1 = wxNewId();
//*)

BEGIN_EVENT_TABLE(BuildMessagesPnl,wxPanel)
	//(*EventTable(BuildMessagesPnl)
	//*)
END_EVENT_TABLE()

BuildMessagesPnl::BuildMessagesPnl(wxWindow* parent,wxWindowID id,const wxPoint& pos,const wxSize& size)
{
	//(*Initialize(BuildMessagesPnl)
	wxFlexGridSizer* FlexGridSizer1;

	Create(parent, wxID_ANY, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(0);
	messagesList = new wxListCtrl(this, ID_LISTCTRL1, wxDefaultPosition, wxDefaultSize, wxLC_REPORT, wxDefaultValidator, _T("ID_LISTCTRL1"));
	FlexGridSizer1->Add(messagesList, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);
	//*)

	messagesList->InsertColumn(0, _("Fichier"));
	messagesList->InsertColumn(1, _("Ligne"));
	messagesList->InsertColumn(2, _("Message"));
}

BuildMessagesPnl::~BuildMessagesPnl()
{
	//(*Destroy(BuildMessagesPnl)
	//*)
}

void BuildMessagesPnl::RefreshWith(std::vector < CompilerMessage > messages)
{
    messagesList->DeleteAllItems();
    for (unsigned int i = 0;i<messages.size();++i)
    {
        messagesList->InsertItem(i, messages[i].file);
        messagesList->SetItem(i, 1, messages[i].line != std::string::npos ? ToString(messages[i].line) : "");
        messagesList->SetItem(i, 2, messages[i].message);

        if ( messages[i].messageType == CompilerMessage::error)
            messagesList->SetItemTextColour(i, *wxRED);
    }
}
