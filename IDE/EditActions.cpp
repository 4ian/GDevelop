#ifndef RELEASE
#define _MEMORY_TRACKER
#include "debugMem.h" //suivi mémoire
#endif

#ifdef DEBUG
#include "nommgr.h"
#endif

#include "CppUnitLite/TestHarness.h"

#include "EditActions.h"

//(*InternalHeaders(EditActions)
#include <wx/bitmap.h>
#include <wx/settings.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include <wx/imaglist.h>
#include <wx/log.h>
#include <wx/image.h>
#include <wx/icon.h>
#include <wx/help.h>

#include <stdexcept>

#ifdef DEBUG

#endif

#include "GDL/Event.h"
#include "GDL/Scene.h"
#include "GDL/Instruction.h"
#include "GDL/Game.h"
#include "GDL/ExtensionsManager.h"
#include "Clipboard.h"
#include "TranslateAction.h"
#include "MemTrace.h"
#include "ChoixAction.h"
#include "GDL/HelpFileAccess.h"

extern MemTrace MemTracer;

//(*IdInit(EditActions)
const long EditActions::ID_STATICTEXT1 = wxNewId();
const long EditActions::ID_PANEL1 = wxNewId();
const long EditActions::ID_STATICLINE2 = wxNewId();
const long EditActions::ID_LISTCTRL1 = wxNewId();
const long EditActions::ID_STATICLINE1 = wxNewId();
const long EditActions::ID_BUTTON1 = wxNewId();
const long EditActions::ID_BUTTON2 = wxNewId();
const long EditActions::ID_BUTTON3 = wxNewId();
const long EditActions::idMenuEdit = wxNewId();
const long EditActions::idMenuAdd = wxNewId();
const long EditActions::idMenuDel = wxNewId();
const long EditActions::idMenuCopy = wxNewId();
const long EditActions::idMenuCut = wxNewId();
const long EditActions::idMenuPaste = wxNewId();
//*)

BEGIN_EVENT_TABLE(EditActions,wxDialog)
	//(*EventTable(EditActions)
	//*)
END_EVENT_TABLE()

EditActions::EditActions(wxWindow* parent, Game & game_, Scene & scene_, const Event & event_) :
eventEdited(event_),
game(game_),
scene(scene_)
{
    MemTracer.AddObj("Fenetre d'édition d'actions", (long)this);
	//(*Initialize(EditActions)
	wxStaticBoxSizer* StaticBoxSizer2;
	wxMenuItem* MenuItem5;
	wxFlexGridSizer* FlexGridSizer3;
	wxMenuItem* MenuItem4;
	wxFlexGridSizer* FlexGridSizer2;
	wxMenuItem* MenuItem3;
	wxMenuItem* MenuItem6;
	wxBoxSizer* BoxSizer1;
	wxFlexGridSizer* FlexGridSizer1;

	Create(parent, wxID_ANY, _("Modifier les actions de l\'évènement"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE|wxRESIZE_BORDER, _T("wxID_ANY"));
	wxIcon FrameIcon;
	FrameIcon.CopyFromBitmap(wxBitmap(wxImage(_T("res/actionicon.png"))));
	SetIcon(FrameIcon);
	FlexGridSizer2 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer2->AddGrowableCol(0);
	FlexGridSizer2->AddGrowableRow(2);
	Panel1 = new wxPanel(this, ID_PANEL1, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL1"));
	Panel1->SetBackgroundColour(wxSystemSettings::GetColour(wxSYS_COLOUR_WINDOW));
	FlexGridSizer3 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer3->AddGrowableCol(0);
	StaticText1 = new wxStaticText(Panel1, ID_STATICTEXT1, _("Ajoutez, modifiez et supprimez les actions de l\'évènement \ndepuis cette fenêtre.\nSi les conditions de l\'évènement sont remplis, alors les actions\nseront executées."), wxPoint(96,-8), wxDefaultSize, wxALIGN_CENTRE, _T("ID_STATICTEXT1"));
	FlexGridSizer3->Add(StaticText1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	Panel1->SetSizer(FlexGridSizer3);
	FlexGridSizer3->Fit(Panel1);
	FlexGridSizer3->SetSizeHints(Panel1);
	FlexGridSizer2->Add(Panel1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticLine2 = new wxStaticLine(this, ID_STATICLINE2, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE2"));
	FlexGridSizer2->Add(StaticLine2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer2 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Actions à executer"));
	ActionsList = new wxListCtrl(this, ID_LISTCTRL1, wxDefaultPosition, wxSize(442,131), wxLC_LIST|wxSIMPLE_BORDER, wxDefaultValidator, _T("ID_LISTCTRL1"));
	ActionsList->SetFocus();
	ActionsList->SetToolTip(_("Clic droit pour éditer les actions."));
	StaticBoxSizer2->Add(ActionsList, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer2->Add(StaticBoxSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	BoxSizer1 = new wxBoxSizer(wxHORIZONTAL);
	StaticLine1 = new wxStaticLine(this, ID_STATICLINE1, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
	BoxSizer1->Add(StaticLine1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer2->Add(BoxSizer1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer1 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	OkBt = new wxButton(this, ID_BUTTON1, _("Ok"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer1->Add(OkBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	AnnulerBt = new wxButton(this, ID_BUTTON2, _("Annuler"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
	FlexGridSizer1->Add(AnnulerBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	AideBt = new wxButton(this, ID_BUTTON3, _("Aide"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON3"));
	FlexGridSizer1->Add(AideBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer2->Add(FlexGridSizer1, 1, wxALL|wxEXPAND|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer2);
	editMenuItem = new wxMenuItem((&ContextMenu), idMenuEdit, _("Editer cette action"), wxEmptyString, wxITEM_NORMAL);
	editMenuItem->SetBitmap(wxBitmap(wxImage(_T("res/editicon.png"))));
	ContextMenu.Append(editMenuItem);
	#ifdef __WXMSW__
	ContextMenu.Remove(editMenuItem);
	 wxFont boldFont(wxDEFAULT,wxDEFAULT,wxFONTSTYLE_NORMAL,wxBOLD,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	 editMenuItem->SetFont(boldFont);
	 ContextMenu.Append(editMenuItem);
	#endif
	ContextMenu.AppendSeparator();
	MenuItem2 = new wxMenuItem((&ContextMenu), idMenuAdd, _("Ajouter une action"), wxEmptyString, wxITEM_NORMAL);
	MenuItem2->SetBitmap(wxBitmap(wxImage(_T("res/addicon.png"))));
	ContextMenu.Append(MenuItem2);
	MenuItem3 = new wxMenuItem((&ContextMenu), idMenuDel, _("Supprimer cette action"), wxEmptyString, wxITEM_NORMAL);
	MenuItem3->SetBitmap(wxBitmap(wxImage(_T("res/remove.png"))));
	ContextMenu.Append(MenuItem3);
	ContextMenu.AppendSeparator();
	MenuItem4 = new wxMenuItem((&ContextMenu), idMenuCopy, _("Copier"), wxEmptyString, wxITEM_NORMAL);
	MenuItem4->SetBitmap(wxBitmap(wxImage(_T("res/copyicon.png"))));
	ContextMenu.Append(MenuItem4);
	MenuItem5 = new wxMenuItem((&ContextMenu), idMenuCut, _("Couper"), wxEmptyString, wxITEM_NORMAL);
	MenuItem5->SetBitmap(wxBitmap(wxImage(_T("res/cuticon.png"))));
	ContextMenu.Append(MenuItem5);
	MenuItem6 = new wxMenuItem((&ContextMenu), idMenuPaste, _("Coller"), wxEmptyString, wxITEM_NORMAL);
	MenuItem6->SetBitmap(wxBitmap(wxImage(_T("res/pasteicon.png"))));
	ContextMenu.Append(MenuItem6);
	FlexGridSizer2->Fit(this);
	FlexGridSizer2->SetSizeHints(this);
	Center();

	Connect(ID_LISTCTRL1,wxEVT_COMMAND_LIST_ITEM_SELECTED,(wxObjectEventFunction)&EditActions::OnActionsListItemSelect);
	Connect(ID_LISTCTRL1,wxEVT_COMMAND_LIST_ITEM_ACTIVATED,(wxObjectEventFunction)&EditActions::OnActionsListItemActivated);
	Connect(ID_LISTCTRL1,wxEVT_COMMAND_LIST_ITEM_RIGHT_CLICK,(wxObjectEventFunction)&EditActions::OnActionsListItemRClick);
	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditActions::OnOkBtClick);
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditActions::OnAnnulerBtClick);
	Connect(ID_BUTTON3,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditActions::OnAideBtClick);
	Connect(idMenuEdit,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditActions::OnEditAction);
	Connect(idMenuAdd,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditActions::OnAddAction);
	Connect(idMenuDel,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditActions::OnDelAction);
	Connect(idMenuCopy,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditActions::OnMenuItem4Selected);
	Connect(idMenuCut,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditActions::OnMenuItem5Selected);
	Connect(idMenuPaste,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditActions::OnMenuItem6Selected);
	Connect(wxEVT_KEY_UP,(wxObjectEventFunction)&EditActions::OnKeyUp);
	//*)

    imageList = new wxImageList(16, 16);
    ActionsList->AssignImageList(imageList, wxIMAGE_LIST_SMALL);

    RefreshFromEvent();
    id = -1;
}

EditActions::~EditActions()
{
    MemTracer.DelObj((long)this);
	//(*Destroy(EditActions)
	//*)
}


void EditActions::OnOkBtClick(wxCommandEvent& event)
{
    EndModal(1);
}


void EditActions::RefreshFromEvent()
{
    imageList->RemoveAll();
    ActionsList->DeleteAllItems();

    gdp::ExtensionsManager * extensionManager = gdp::ExtensionsManager::getInstance();

    //Insertion
    for ( unsigned int j = 0;j < eventEdited.actions.size();j++ )
    {
        InstructionInfos infos = extensionManager->GetActionInfos(eventEdited.actions[j].GetType());

        string finalText = TranslateAction::Translate( eventEdited.actions.at( j ), infos, true );

        imageList->Add(infos.smallicon);
        ActionsList->InsertItem(j, finalText, imageList->GetImageCount()-1);
    }

    if ( eventEdited.actions.empty() )
    {
        imageList->Add(wxBitmap("res/actions/add.png", wxBITMAP_TYPE_ANY));
        ActionsList->InsertItem(0, "Clic droit pour ajouter une action", 0);
    }
}

void EditActions::OnActionsListItemRClick(wxListEvent& event)
{
    PopupMenu(&ContextMenu);
}

void EditActions::OnEditAction(wxCommandEvent& event)
{
    if ( id == -1 ) return;
    if ( static_cast<unsigned>(id) >= eventEdited.actions.size() ) { wxLogWarning("Aucune action à éditer. Pour ajouter une action, faites un clic droit et cliquez sur \"Ajouter une action\"."); return; }

    ChoixAction ChoixDialog(this, game, scene);
    ChoixDialog.Type = eventEdited.actions.at(id).GetType(); // On rafraichit la fenêtre
    ChoixDialog.Param = eventEdited.actions.at(id).GetParameters(); // avec la condition
    ChoixDialog.Loc = eventEdited.actions.at(id).IsLocal();
    ChoixDialog.RefreshFromAction();
    ChoixDialog.Fit();


    if ( ChoixDialog.ShowModal() == 0 )
    {
        eventEdited.actions.at(id).SetType( ChoixDialog.Type );
        eventEdited.actions.at(id).SetParameters( ChoixDialog.Param );
        eventEdited.actions.at(id).SetLocal( ChoixDialog.Loc );

        RefreshFromEvent();
    }

}

////////////////////////////////////////////////////////////
/// Edition directe par double clic
////////////////////////////////////////////////////////////
void EditActions::OnActionsListItemActivated(wxListEvent& event)
{
    id = event.GetIndex();
    wxCommandEvent uselessEvent;
    OnEditAction(uselessEvent);
}

void EditActions::OnAddAction(wxCommandEvent& event)
{
    ChoixAction ChoixDialog(this, game, scene);

    if ( ChoixDialog.ShowModal() == 0 )
    {
        Instruction instruction;
        instruction.SetType(ChoixDialog.Type);
        instruction.SetParameters(ChoixDialog.Param);
        instruction.SetLocal(ChoixDialog.Loc);

        eventEdited.actions.push_back(instruction);

        RefreshFromEvent();
    }
}

void EditActions::OnDelAction(wxCommandEvent& event)
{
    if ( id == -1 ) return ;
    if ( static_cast<unsigned>(id) >= eventEdited.actions.size() ) { wxLogWarning("Aucune action à effacer !"); return;  }

    eventEdited.actions.erase( eventEdited.actions.begin() + id );

    RefreshFromEvent();
}

void EditActions::OnActionsListItemSelect(wxListEvent& event)
{
    id = event.GetIndex();
}
////////////////////////////////////////////////////////////
/// Copier
////////////////////////////////////////////////////////////
void EditActions::OnMenuItem4Selected(wxCommandEvent& event)
{
    if ( id == -1 ) return ;
    if ( static_cast<unsigned>(id) >= eventEdited.actions.size() ) { wxLogWarning("Aucune condition à copier. Pour ajouter une condition, faites un clic droit et cliquez sur \"Ajouter une condition\"."); return; }

    Clipboard * clipboard = Clipboard::getInstance();
    clipboard->SetAction(eventEdited.actions.at(id));
}

////////////////////////////////////////////////////////////
/// Couper
////////////////////////////////////////////////////////////
void EditActions::OnMenuItem5Selected(wxCommandEvent& event)
{
    if ( id == -1 ) return ;
    if ( static_cast<unsigned>(id) >= eventEdited.actions.size() ) { wxLogWarning("Aucune condition à couper. Pour ajouter une condition, faites un clic droit et cliquez sur \"Ajouter une condition\"."); return;  }

    Clipboard * clipboard = Clipboard::getInstance();
    clipboard->SetAction(eventEdited.actions.at(id));

    //On efface l'ancienne condition
    eventEdited.actions.erase( eventEdited.actions.begin() + id );

    RefreshFromEvent();
}

////////////////////////////////////////////////////////////
/// Coller
////////////////////////////////////////////////////////////
void EditActions::OnMenuItem6Selected(wxCommandEvent& event)
{
    Clipboard * clipboard = Clipboard::getInstance();
    if ( !clipboard->HasAction() )
    {
        wxLogWarning(_("Aucune action à coller."));
    }
    if ( id == -1 ) return ;
    if ( static_cast<unsigned>(id) >= eventEdited.actions.size() )
        eventEdited.actions.push_back(clipboard->GetAction());
    else
        eventEdited.actions.insert(eventEdited.actions.begin()+id, clipboard->GetAction());

    RefreshFromEvent();
}

void EditActions::OnAideBtClick(wxCommandEvent& event)
{
    HelpFileAccess * helpFileAccess = HelpFileAccess::getInstance();
    helpFileAccess->DisplaySection(20);
}

void EditActions::OnAnnulerBtClick(wxCommandEvent& event)
{
    EndModal(0);
}

TEST(Dialogues, EditActions )
{

    wxLogNull log;

    Event event;
    Scene scene;
    Game game;
    EditActions Dialog(NULL, game, scene, event);

    LONGS_EQUAL(Dialog.ActionsList->GetItemCount(), 1); //Un item par défaut

    Instruction instruction;
    Dialog.eventEdited.actions.push_back(instruction);
    Dialog.eventEdited.actions.push_back(instruction);
    Dialog.RefreshFromEvent();
    LONGS_EQUAL(Dialog.ActionsList->GetItemCount(), 2); //Un item : la condition

}

void EditActions::OnKeyUp(wxKeyEvent& event)
{
    if ( event.GetKeyCode() == WXK_DELETE )
    {
        wxCommandEvent unusedEvent;
        OnDelAction( unusedEvent );
    }
    if ( event.GetKeyCode() == WXK_INSERT )
    {
        wxCommandEvent unusedEvent;
        OnAddAction( unusedEvent );
    }
    else if ( event.GetModifiers() == wxMOD_CMD ) //Ctrl-xxx
    {
        switch ( event.GetKeyCode() )
        {
            case 67: //Ctrl C
            {
                wxCommandEvent unusedEvent;
                OnMenuItem4Selected( unusedEvent );
                break;
            }
            case 86: //Ctrl-V
            {
                wxCommandEvent unusedEvent;
                OnMenuItem6Selected( unusedEvent );
                break;
            }
            case 88: //Ctrl-X
            {
                wxCommandEvent unusedEvent;
                OnMenuItem5Selected( unusedEvent );
                break;
            }
            default:
                break;
        }
    }
}
