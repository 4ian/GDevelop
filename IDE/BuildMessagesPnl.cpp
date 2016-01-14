/*
 * GDevelop IDE
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU General Public License version 3.
 */

#include "BuildMessagesPnl.h"

//(*InternalHeaders(BuildMessagesPnl)
#include <wx/intl.h>
#include <wx/string.h>
//*)
#include "GDCore/Project/Project.h"
#include "GDCore/CommonTools.h"
#include "GDCpp/IDE/CodeCompiler.h"
#include "GDCpp/IDE/CompilerMessagesParser.h"
#include "ProjectManager.h"

using namespace GDpriv;
using namespace gd;
using namespace std;

//(*IdInit(BuildMessagesPnl)
const long BuildMessagesPnl::ID_LISTCTRL1 = wxNewId();
//*)

BEGIN_EVENT_TABLE(BuildMessagesPnl,wxPanel)
    //(*EventTable(BuildMessagesPnl)
    //*)
	EVT_COMMAND(wxID_ANY, CodeCompiler::refreshEventType, BuildMessagesPnl::OnMustRefresh)
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

    messagesList->InsertColumn(0, _("File"));
    messagesList->InsertColumn(1, _("Line"));
    messagesList->InsertColumn(2, _("Column"));
    messagesList->InsertColumn(3, _("Message"));
}

BuildMessagesPnl::~BuildMessagesPnl()
{
    //(*Destroy(BuildMessagesPnl)
    //*)
}

void BuildMessagesPnl::OnMustRefresh(wxCommandEvent&)
{
    CompilerMessagesParser parser;
    parser.ParseOutput(CodeCompiler::Get()->GetLastTaskMessages());

    RefreshWith(NULL, parser.parsedMessages);
}

void BuildMessagesPnl::RefreshWith(gd::Project * game, std::vector < CompilerMessage > messages)
{
    gameAssociatedWithErrors = game;

    messagesList->DeleteAllItems();
    for (std::size_t i = 0; i<messages.size(); ++i)
    {
        messagesList->InsertItem(i, messages[i].file);
        messagesList->SetItem(i, 1, messages[i].line != gd::String::npos ? gd::String::From(messages[i].line) : "");
        messagesList->SetItem(i, 2, messages[i].column != gd::String::npos ? gd::String::From(messages[i].column) : "");
        messagesList->SetItem(i, 3, messages[i].message);

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
    size_t line = row_info.m_text.empty() ? gd::String::npos : gd::String(row_info.m_text).To<int>();
    gd::String file = messagesList->GetItemText(0);

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
    size_t line = row_info.m_text.empty() ? gd::String::npos : gd::String(row_info.m_text).To<int>();
    gd::String file = messagesList->GetItemText(event.GetIndex());

    if ( projectManager && wxFileExists(file) ) projectManager->EditSourceFile(gameAssociatedWithErrors, file, line);
}

void BuildMessagesPnl::OnResize(wxSizeEvent& event)
{
    messagesList->SetSize(event.GetSize());
    messagesList->SetColumnWidth(1, 40);
    messagesList->SetColumnWidth(2, 35);
    messagesList->SetColumnWidth(3, messagesList->GetSize().GetWidth()-messagesList->GetColumnWidth(0)-messagesList->GetColumnWidth(1)-messagesList->GetColumnWidth(2));
}
