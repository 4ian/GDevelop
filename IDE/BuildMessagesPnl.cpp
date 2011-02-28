/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#include "BuildMessagesPnl.h"

//(*InternalHeaders(BuildMessagesPnl)
#include <wx/intl.h>
#include <wx/string.h>
//*)
#include "GDL/Game.h"
#include "GDL/CommonTools.h"
#include "ProjectManager.h"

using namespace GDpriv;

//(*IdInit(BuildMessagesPnl)
const long BuildMessagesPnl::ID_LISTCTRL1 = wxNewId();
//*)

BEGIN_EVENT_TABLE(BuildMessagesPnl,wxPanel)
    //(*EventTable(BuildMessagesPnl)
    //*)
END_EVENT_TABLE()

BuildMessagesPnl::BuildMessagesPnl(wxWindow* parent, ProjectManager * projectManager_) :
    projectManager(projectManager_),
    gameAssociatedWithErrors(NULL)
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

    Connect(ID_LISTCTRL1,wxEVT_COMMAND_LIST_ITEM_ACTIVATED,(wxObjectEventFunction)&BuildMessagesPnl::OnmessagesListItemActivated);
    Connect(wxEVT_SIZE,(wxObjectEventFunction)&BuildMessagesPnl::OnResize);
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

void BuildMessagesPnl::RefreshWith(Game * game, std::vector < CompilerMessage > messages)
{
    gameAssociatedWithErrors = game;

    messagesList->DeleteAllItems();
    for (unsigned int i = 0; i<messages.size(); ++i)
    {
        messagesList->InsertItem(i, messages[i].file);
        messagesList->SetItem(i, 1, messages[i].line != std::string::npos ? ToString(messages[i].line) : "");
        messagesList->SetItem(i, 2, messages[i].message);

        if ( messages[i].messageType == CompilerMessage::error)
            messagesList->SetItemTextColour(i, *wxRED);
    }
}

void BuildMessagesPnl::OpenFileContainingFirstError()
{
    if ( messagesList->GetItemCount() == 0)
        return;

    //Painful
    wxListItem row_info;
    row_info.m_itemId = 0;
    row_info.m_col = 1;
    row_info.m_mask = wxLIST_MASK_TEXT;

    messagesList->GetItem( row_info );
    size_t line = row_info.m_text.empty() ? std::string::npos : ToInt(string(row_info.m_text.mb_str()));
    std::string file = string(messagesList->GetItemText(0).mb_str());

    if ( projectManager && wxFileExists(file) ) projectManager->EditSourceFile(gameAssociatedWithErrors, file, line);
}

void BuildMessagesPnl::OnmessagesListItemActivated(wxListEvent& event)
{
    //Painful
    wxListItem row_info;
    row_info.m_itemId = event.GetIndex();
    row_info.m_col = 1;
    row_info.m_mask = wxLIST_MASK_TEXT;

    messagesList->GetItem( row_info );
    size_t line = row_info.m_text.empty() ? std::string::npos : ToInt(string(row_info.m_text.mb_str()));
    std::string file = string(messagesList->GetItemText(event.GetIndex()).mb_str());

    if ( projectManager && wxFileExists(file) ) projectManager->EditSourceFile(gameAssociatedWithErrors, file, line);
}

void BuildMessagesPnl::OnResize(wxSizeEvent& event)
{
    messagesList->SetSize(event.GetSize());
    messagesList->SetColumnWidth(2, messagesList->GetSize().GetWidth()-messagesList->GetColumnWidth(0)-messagesList->GetColumnWidth(1));
}
