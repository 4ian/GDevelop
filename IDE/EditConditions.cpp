
#ifndef RELEASE
#define _MEMORY_TRACKER
#include "debugMem.h" //suivi mémoire
#endif

#ifdef DEBUG
#include "nommgr.h"
#endif

#include "CppUnitLite/TestHarness.h"

#ifdef __WXMSW__
#include <wx/msw/winundef.h>
#endif
#include "EditConditions.h"

//(*InternalHeaders(EditConditions)
#include <wx/bitmap.h>
#include <wx/settings.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include <wx/bitmap.h>
#include <wx/image.h>
#include <wx/imaglist.h>
#include <wx/icon.h>
#include <wx/help.h>
#include <wx/config.h>
#include <wx/log.h>

#include <stdexcept>

#ifdef __WXMSW__
#include <wx/msw/winundef.h>
#endif

#ifdef DEBUG

#endif

#include "GDL/Event.h"
#include "GDL/Scene.h"
#include "GDL/Game.h"
#include "GDL/ExtensionsManager.h"
#include "Clipboard.h"

#include "GDL/HelpFileAccess.h"
#include "TranslateCondition.h"
#include "ChoixCondition.h"

#include "MemTrace.h"

extern MemTrace MemTracer;

//(*IdInit(EditConditions)
const long EditConditions::ID_STATICTEXT1 = wxNewId();
const long EditConditions::ID_PANEL1 = wxNewId();
const long EditConditions::ID_STATICLINE2 = wxNewId();
const long EditConditions::ID_RADIOBUTTON2 = wxNewId();
const long EditConditions::ID_RADIOBUTTON1 = wxNewId();
const long EditConditions::ID_LISTCTRL1 = wxNewId();
const long EditConditions::ID_STATICLINE1 = wxNewId();
const long EditConditions::ID_BUTTON1 = wxNewId();
const long EditConditions::ID_BUTTON3 = wxNewId();
const long EditConditions::ID_BUTTON2 = wxNewId();
const long EditConditions::idMenuEdit = wxNewId();
const long EditConditions::idMenuAdd = wxNewId();
const long EditConditions::idMenuDel = wxNewId();
const long EditConditions::idMenuCopy = wxNewId();
const long EditConditions::idMenuCouper = wxNewId();
const long EditConditions::idMenuPaste = wxNewId();
//*)

BEGIN_EVENT_TABLE( EditConditions, wxDialog )
    //(*EventTable(EditConditions)
    //*)
END_EVENT_TABLE()

EditConditions::EditConditions( wxWindow* parent, Game & game_, Scene & scene_, const Event & event_) :
eventEdited(event_),
game(game_),
scene(scene_)
{
    MemTracer.AddObj("Fenetre d'edition des conditions", (long)this);
    //(*Initialize(EditConditions)
    wxStaticBoxSizer* StaticBoxSizer2;
    wxMenuItem* MenuItem2;
    wxFlexGridSizer* FlexGridSizer3;
    wxFlexGridSizer* FlexGridSizer2;
    wxMenuItem* MenuItem3;
    wxGridSizer* GridSizer1;
    wxMenuItem* MenuItem6;
    wxBoxSizer* BoxSizer1;
    wxMenuItem* editMenuItem;
    wxStaticBoxSizer* StaticBoxSizer1;
    wxFlexGridSizer* FlexGridSizer1;

    Create(parent, wxID_ANY, _("Edition des conditions de l\'évènement"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE|wxRESIZE_BORDER|wxMAXIMIZE_BOX, _T("wxID_ANY"));
    SetClientSize(wxSize(428,327));
    wxIcon FrameIcon;
    FrameIcon.CopyFromBitmap(wxBitmap(wxImage(_T("res/conditionicon.png"))));
    SetIcon(FrameIcon);
    FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
    FlexGridSizer1->AddGrowableCol(0);
    FlexGridSizer1->AddGrowableRow(3);
    Panel1 = new wxPanel(this, ID_PANEL1, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL1"));
    Panel1->SetBackgroundColour(wxSystemSettings::GetColour(wxSYS_COLOUR_WINDOW));
    FlexGridSizer3 = new wxFlexGridSizer(0, 3, 0, 0);
    FlexGridSizer3->AddGrowableCol(0);
    StaticText1 = new wxStaticText(Panel1, ID_STATICTEXT1, _("Ajoutez, modifiez et supprimez les conditions de l\'évènement \ndepuis cette fenêtre.\nEn fonction du type de validation, si toutes ou une des conditions est validée, \nalors les actions seront executées."), wxPoint(-168,0), wxDefaultSize, wxALIGN_CENTRE, _T("ID_STATICTEXT1"));
    FlexGridSizer3->Add(StaticText1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    Panel1->SetSizer(FlexGridSizer3);
    FlexGridSizer3->Fit(Panel1);
    FlexGridSizer3->SetSizeHints(Panel1);
    FlexGridSizer1->Add(Panel1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    StaticLine2 = new wxStaticLine(this, ID_STATICLINE2, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE2"));
    FlexGridSizer1->Add(StaticLine2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    StaticBoxSizer1 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Validation des conditions"));
    GridSizer1 = new wxGridSizer(0, 2, 0, 0);
    EtRadio = new wxRadioButton(this, ID_RADIOBUTTON2, _("ET ( Toutes les conditions vraie )"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_RADIOBUTTON2"));
    EtRadio->SetToolTip(_("Toutes les conditions devront être remplies pour que les actions soient executées."));
    GridSizer1->Add(EtRadio, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    OuRadio = new wxRadioButton(this, ID_RADIOBUTTON1, _("OU ( Une seule condition vraie )"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_RADIOBUTTON1"));
    OuRadio->SetToolTip(_("Une seule condition devra être remplie pour que les actions soient executées."));
    GridSizer1->Add(OuRadio, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticBoxSizer1->Add(GridSizer1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer1->Add(StaticBoxSizer1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticBoxSizer2 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Conditions à remplir"));
    ConditionsList = new wxListCtrl(this, ID_LISTCTRL1, wxDefaultPosition, wxSize(442,131), wxLC_LIST|wxLC_ALIGN_LEFT|wxSIMPLE_BORDER, wxDefaultValidator, _T("ID_LISTCTRL1"));
    ConditionsList->SetToolTip(_("Utilisez le clic droit pour modifier les conditions."));
    StaticBoxSizer2->Add(ConditionsList, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer1->Add(StaticBoxSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    BoxSizer1 = new wxBoxSizer(wxHORIZONTAL);
    StaticLine1 = new wxStaticLine(this, ID_STATICLINE1, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
    BoxSizer1->Add(StaticLine1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer1->Add(BoxSizer1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer2 = new wxFlexGridSizer(0, 3, 0, 0);
    FlexGridSizer2->AddGrowableCol(0);
    OkBt = new wxButton(this, ID_BUTTON1, _("Ok"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
    FlexGridSizer2->Add(OkBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
    AnnulerBt = new wxButton(this, ID_BUTTON3, _("Annuler"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON3"));
    FlexGridSizer2->Add(AnnulerBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    AideBt = new wxButton(this, ID_BUTTON2, _("Aide"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
    FlexGridSizer2->Add(AideBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer1->Add(FlexGridSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    SetSizer(FlexGridSizer1);
    editMenuItem = new wxMenuItem((&ContextMenu), idMenuEdit, _("Editer cette condition"), wxEmptyString, wxITEM_NORMAL);
    editMenuItem->SetBitmap(wxBitmap(wxImage(_T("res/editicon.png"))));
    ContextMenu.Append(editMenuItem);
    #ifdef __WXMSW__
     ContextMenu.Remove(editMenuItem);
     wxFont boldFont(wxDEFAULT,wxDEFAULT,wxFONTSTYLE_NORMAL,wxBOLD,false,wxEmptyString,wxFONTENCODING_DEFAULT);
     editMenuItem->SetFont(boldFont);
     ContextMenu.Append(editMenuItem);
    #endif
    ContextMenu.AppendSeparator();
    MenuItem2 = new wxMenuItem((&ContextMenu), idMenuAdd, _("Ajouter une condition"), wxEmptyString, wxITEM_NORMAL);
    MenuItem2->SetBitmap(wxBitmap(wxImage(_T("res/addicon.png"))));
    ContextMenu.Append(MenuItem2);
    MenuItem3 = new wxMenuItem((&ContextMenu), idMenuDel, _("Supprimer la condition"), wxEmptyString, wxITEM_NORMAL);
    MenuItem3->SetBitmap(wxBitmap(wxImage(_T("res/remove.png"))));
    ContextMenu.Append(MenuItem3);
    ContextMenu.AppendSeparator();
    MenuItem4 = new wxMenuItem((&ContextMenu), idMenuCopy, _("Copier"), wxEmptyString, wxITEM_NORMAL);
    MenuItem4->SetBitmap(wxBitmap(wxImage(_T("res/copyicon.png"))));
    ContextMenu.Append(MenuItem4);
    MenuItem5 = new wxMenuItem((&ContextMenu), idMenuCouper, _("Couper"), wxEmptyString, wxITEM_NORMAL);
    MenuItem5->SetBitmap(wxBitmap(wxImage(_T("res/cuticon.png"))));
    ContextMenu.Append(MenuItem5);
    MenuItem6 = new wxMenuItem((&ContextMenu), idMenuPaste, _("Coller"), wxEmptyString, wxITEM_NORMAL);
    MenuItem6->SetBitmap(wxBitmap(wxImage(_T("res/pasteicon.png"))));
    ContextMenu.Append(MenuItem6);
    FlexGridSizer1->SetSizeHints(this);
    Center();

    Connect(ID_RADIOBUTTON2,wxEVT_COMMAND_RADIOBUTTON_SELECTED,(wxObjectEventFunction)&EditConditions::OnEtRadioSelect);
    Connect(ID_RADIOBUTTON1,wxEVT_COMMAND_RADIOBUTTON_SELECTED,(wxObjectEventFunction)&EditConditions::OnOuRadioSelect);
    Connect(ID_LISTCTRL1,wxEVT_COMMAND_LIST_ITEM_SELECTED,(wxObjectEventFunction)&EditConditions::OnConditionsListItemActivated);
    Connect(ID_LISTCTRL1,wxEVT_COMMAND_LIST_ITEM_ACTIVATED,(wxObjectEventFunction)&EditConditions::OnConditionsListItemDoubleClicked);
    Connect(ID_LISTCTRL1,wxEVT_COMMAND_LIST_ITEM_RIGHT_CLICK,(wxObjectEventFunction)&EditConditions::OnConditionsListItemRClick);
    Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditConditions::OnOkBtClick);
    Connect(ID_BUTTON3,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditConditions::OnAnnulerBtClick);
    Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditConditions::OnAideBtClick);
    Connect(idMenuEdit,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditConditions::OnEditCondition);
    Connect(idMenuAdd,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditConditions::OnAddCondition);
    Connect(idMenuDel,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditConditions::OnDelCondition);
    Connect(idMenuCopy,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditConditions::OnMenuCopySelected);
    Connect(idMenuCouper,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditConditions::OnMenuCutSelected);
    Connect(idMenuPaste,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditConditions::OnMenuPasteSelected);
    Connect(wxEVT_KEY_UP,(wxObjectEventFunction)&EditConditions::OnKeyUp);
    //*)

    imageList = new wxImageList(16, 16);
    ConditionsList->AssignImageList(imageList, wxIMAGE_LIST_SMALL);

    RefreshFromEvent();
    id = -1;

    //On vérifie si on est pas en mode simple.
    wxConfigBase * pConfig = wxConfigBase::Get();

    bool result = false;
    pConfig->Read("/ModeSimple", &result);

    if ( result == true )
        OuRadio->Enable(false);
}

EditConditions::~EditConditions()
{
    MemTracer.DelObj((long)this);
    //delete imageList;
    //(*Destroy(EditConditions)
    //*)
}


void EditConditions::OnOkBtClick( wxCommandEvent& event )
{
    EndModal(1);
}

void EditConditions::RefreshFromEvent()
{
    //Le type
    if ( eventEdited.type == "OR" )
    {
        OuRadio->SetValue( true );
        EtRadio->SetValue( false );
    }
    else
    {
        OuRadio->SetValue( false );
        EtRadio->SetValue( true );
    }

    ConditionsList->DeleteAllItems();
    imageList->RemoveAll();

    gdp::ExtensionsManager * extensionManager = gdp::ExtensionsManager::getInstance();

    //Insertion
    for ( unsigned int j = 0;j < eventEdited.conditions.size();j++ )
    {
        InstructionInfos infos = extensionManager->GetConditionInfos(eventEdited.conditions[j].GetType());
        string finalText = TranslateCondition::Translate(eventEdited.conditions.at( j ), infos, true);

        imageList->Add(infos.smallicon);
        ConditionsList->InsertItem(j, finalText, imageList->GetImageCount()-1 );
    }

    if ( eventEdited.conditions.empty() )
    {
        imageList->Add(wxBitmap("res/actions/add.png", wxBITMAP_TYPE_ANY));
        ConditionsList->InsertItem(0, _("Clic droit pour ajouter une condition"), 0);
    }
}

void EditConditions::OnEtRadioSelect(wxCommandEvent& event)
{
    eventEdited.type = "AND";
}

void EditConditions::OnOuRadioSelect(wxCommandEvent& event)
{
    eventEdited.type = "OR";
}


void EditConditions::OnConditionsListItemRClick(wxListEvent& event)
{
    PopupMenu(&ContextMenu);
}

void EditConditions::OnAddCondition(wxCommandEvent& event)
{

    ChoixCondition ChoixDialog(this, game, scene);

    int retour = 0;
    retour = ChoixDialog.ShowModal();
    if ( retour == 0)
    {
        Instruction instruction;
        instruction.SetType(ChoixDialog.Type);
        instruction.SetParameters(ChoixDialog.Param);
        instruction.SetLocal(ChoixDialog.Loc);
        instruction.SetInversion(ChoixDialog.Contraire);

        eventEdited.conditions.push_back(instruction);

        RefreshFromEvent();
    }
}

void EditConditions::OnDelCondition(wxCommandEvent& event)
{
    if ( id == -1 ) return;
    if ( static_cast<unsigned>(id) >= eventEdited.conditions.size() ) { wxLogWarning("Aucune condition à effacer !"); return; }

    eventEdited.conditions.erase( eventEdited.conditions.begin() + id );

    RefreshFromEvent();
}

////////////////////////////////////////////////////////////
/// Edition d'une condition
////////////////////////////////////////////////////////////
void EditConditions::OnEditCondition(wxCommandEvent& event)
{
    if ( id == -1 ) return ;
    if ( static_cast<unsigned>(id) >= eventEdited.conditions.size() ) { wxLogWarning("Aucune condition à éditer. Pour ajouter une condition, faites un clic droit et cliquez sur \"Ajouter une condition\"."); return; }

    ChoixCondition ChoixDialog(this, game, scene);
    ChoixDialog.Type = eventEdited.conditions.at(id).GetType(); // On rafraichit la fenêtre
    ChoixDialog.Param = eventEdited.conditions.at(id).GetParameters(); // avec la condition
    ChoixDialog.Loc = eventEdited.conditions.at(id).IsLocal();
    ChoixDialog.Contraire = eventEdited.conditions.at(id).IsInverted();
    ChoixDialog.RefreshFromCondition();
    ChoixDialog.Fit();

    int retour = 0;
    retour = ChoixDialog.ShowModal();
    if ( retour == 0)
    {
        eventEdited.conditions.at(id).SetType( ChoixDialog.Type );
        eventEdited.conditions.at(id).SetParameters( ChoixDialog.Param );
        eventEdited.conditions.at(id).SetLocal( ChoixDialog.Loc );
        eventEdited.conditions.at(id).SetInversion( ChoixDialog.Contraire );

        RefreshFromEvent();
    }

}

////////////////////////////////////////////////////////////
/// Edition d'une condition directe par double clique
////////////////////////////////////////////////////////////
void EditConditions::OnConditionsListItemDoubleClicked(wxListEvent& event)
{
    id = event.GetIndex();
    wxCommandEvent uselessEvent;
    OnEditCondition(uselessEvent);
}

////////////////////////////////////////////////////////////
/// Choix d'une condition ( clic gauche/clic droit... )
////////////////////////////////////////////////////////////
void EditConditions::OnConditionsListItemActivated(wxListEvent& event)
{
    id = event.GetIndex();
}

void EditConditions::OnMenuCopySelected(wxCommandEvent& event)
{
    if ( id == -1 ) return ;
    if ( static_cast<unsigned>(id) >= eventEdited.conditions.size() ) { wxLogWarning("Aucune condition à copier. Pour ajouter une condition, faites un clic droit et cliquez sur \"Ajouter une condition\"."); return; }

    Clipboard * clipboard = Clipboard::getInstance();
    clipboard->SetCondition(eventEdited.conditions.at(id));
}

void EditConditions::OnMenuCutSelected(wxCommandEvent& event)
{
    if ( id == -1 ) return ;
    if ( static_cast<unsigned>(id) >= eventEdited.conditions.size() ) { wxLogWarning("Aucune condition à couper. Pour ajouter une condition, faites un clic droit et cliquez sur \"Ajouter une condition\"."); return; }

    Clipboard * clipboard = Clipboard::getInstance();
    clipboard->SetCondition(eventEdited.conditions.at(id));

    //On efface l'ancienne condition
    eventEdited.conditions.erase( eventEdited.conditions.begin() + id );

    RefreshFromEvent();
}

void EditConditions::OnMenuPasteSelected(wxCommandEvent& event)
{
    Clipboard * clipboard = Clipboard::getInstance();
    if ( !clipboard->HasCondition() )
    {
        wxLogWarning(_("Aucune condition à coller."));
    }

    if ( id == -1 ) return ;
    if ( static_cast<unsigned>(id) >= eventEdited.conditions.size() )
        eventEdited.conditions.push_back(clipboard->GetCondition());
    else
        eventEdited.conditions.insert(eventEdited.conditions.begin()+id, clipboard->GetCondition());

    RefreshFromEvent();
}

void EditConditions::OnAideBtClick(wxCommandEvent& event)
{
    HelpFileAccess * helpFileAccess = HelpFileAccess::getInstance();
    helpFileAccess->DisplaySection(19);
}

void EditConditions::OnAnnulerBtClick(wxCommandEvent& event)
{
    EndModal(0);
}

TEST( Dialogues, EditConditions )
{
    wxLogNull log;

    Event event;
    Scene scene;
    Game game;
    EditConditions Dialog(NULL, game, scene, event);

    CHECK_EQUAL(Dialog.EtRadio->GetValue(), true); //Bouton "ET" réglé par défaut
    LONGS_EQUAL(Dialog.ConditionsList->GetItemCount(), 1); //Un item par défaut


    Instruction instruction;

    Dialog.eventEdited.conditions.push_back(instruction);
    Dialog.eventEdited.conditions.push_back(instruction);
    Dialog.RefreshFromEvent(); //Pas d'erreur cette fois ci
    LONGS_EQUAL(Dialog.ConditionsList->GetItemCount(), 2); //Un item : la condition

}

void EditConditions::OnKeyUp(wxKeyEvent& event)
{
    if ( event.GetKeyCode() == WXK_DELETE )
    {
        wxCommandEvent unusedEvent;
        OnDelCondition( unusedEvent );
    }
    if ( event.GetKeyCode() == WXK_INSERT )
    {
        wxCommandEvent unusedEvent;
        OnAddCondition( unusedEvent );
    }
    else if ( event.GetModifiers() == wxMOD_CMD ) //Ctrl-xxx
    {
        switch ( event.GetKeyCode() )
        {
            case 67: //Ctrl C
            {
                wxCommandEvent unusedEvent;
                OnMenuCopySelected( unusedEvent );
                break;
            }
            case 86: //Ctrl-V
            {
                wxCommandEvent unusedEvent;
                OnMenuPasteSelected( unusedEvent );
                break;
            }
            case 88: //Ctrl-X
            {
                wxCommandEvent unusedEvent;
                OnMenuCutSelected( unusedEvent );
                break;
            }
            default:
                break;
        }
    }
}
