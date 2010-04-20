/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */

#ifdef DEBUG
#define _MEMORY_TRACKER
#include "debugMem.h" //suivi mémoire
#endif

#include "CppUnitLite/TestHarness.h"
#include "EditorEvents.h"

//(*InternalHeaders(EditorEvents)
#include <wx/bitmap.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include <wx/config.h>
#include <wx/gdicmn.h>
#include <wx/image.h>
#include <wx/bitmap.h>
#include <wx/statbmp.h>
#include <wx/settings.h>
#include <wx/log.h>
#include <wx/config.h>
#include <wx/help.h>
#include <wx/dc.h>
#include <wx/dcbuffer.h>
#include "GDL/Game.h"
#include "GDL/ExtensionsManager.h"
#include "GDL/StandardEvent.h"
#include "GDL/StdAlgo.h"
#include "GDL/HelpFileAccess.h"
#ifdef __WXMSW__
#include <wx/msw/winundef.h>
#endif
#include "Clipboard.h"
#include "ChoixTemplateEvent.h"
#include "CreateTemplate.h"
#include "Game_Develop_EditorMain.h"
#include <time.h>

#ifdef __WXGTK__
#include <gtk/gtk.h>
#endif

extern MemTrace MemTracer;

//(*IdInit(EditorEvents)
const long EditorEvents::ID_PANEL1 = wxNewId();
const long EditorEvents::ID_PANEL2 = wxNewId();
const long EditorEvents::ID_SCROLLBAR1 = wxNewId();
const long EditorEvents::ID_SCROLLBAR2 = wxNewId();
const long EditorEvents::idEventInsert = wxNewId();
const long EditorEvents::idMenuCom = wxNewId();
const long EditorEvents::idMenuSubEvent = wxNewId();
const long EditorEvents::idMenuLien = wxNewId();
const long EditorEvents::ID_MENUITEM1 = wxNewId();
const long EditorEvents::idMenuEventDel = wxNewId();
const long EditorEvents::idMenuUndo = wxNewId();
const long EditorEvents::idMenuRedo = wxNewId();
const long EditorEvents::idMenuClearHistory = wxNewId();
const long EditorEvents::idMenuCopy = wxNewId();
const long EditorEvents::idMenuCut = wxNewId();
const long EditorEvents::idMenuPastAvant = wxNewId();
const long EditorEvents::idMenuPasteApres = wxNewId();
const long EditorEvents::idMenuPasteSubEvent = wxNewId();
const long EditorEvents::idMenuPaste = wxNewId();
const long EditorEvents::idMenuEdit = wxNewId();
const long EditorEvents::idMenuAdd = wxNewId();
const long EditorEvents::idMenuDel = wxNewId();
const long EditorEvents::ID_MENUITEM2 = wxNewId();
const long EditorEvents::ID_MENUITEM17 = wxNewId();
const long EditorEvents::ID_MENUITEM21 = wxNewId();
const long EditorEvents::ID_MENUITEM3 = wxNewId();
const long EditorEvents::idMenuCouper = wxNewId();
const long EditorEvents::ID_MENUITEM4 = wxNewId();
const long EditorEvents::ID_MENUITEM5 = wxNewId();
const long EditorEvents::ID_MENUITEM6 = wxNewId();
const long EditorEvents::ID_MENUITEM7 = wxNewId();
const long EditorEvents::ID_MENUITEM18 = wxNewId();
const long EditorEvents::ID_MENUITEM19 = wxNewId();
const long EditorEvents::ID_MENUITEM20 = wxNewId();
const long EditorEvents::ID_MENUITEM8 = wxNewId();
const long EditorEvents::ID_MENUITEM9 = wxNewId();
const long EditorEvents::ID_MENUITEM10 = wxNewId();
const long EditorEvents::ID_MENUITEM11 = wxNewId();
const long EditorEvents::ID_MENUITEM13 = wxNewId();
const long EditorEvents::ID_MENUITEM12 = wxNewId();
const long EditorEvents::ID_MENUITEM14 = wxNewId();
//*)
const long EditorEvents::ID_TEMPLATEBUTTON = wxNewId();
const long EditorEvents::ID_CREATETEMPLATEBUTTON = wxNewId();
const long EditorEvents::ID_HELPBUTTON = wxNewId();
const long EditorEvents::ID_SEARCHBUTTON = wxNewId();

const long EditorEvents::idRibbonEvent = wxNewId();
const long EditorEvents::idRibbonCom = wxNewId();
const long EditorEvents::idRibbonSubEvent = wxNewId();
const long EditorEvents::idRibbonLink = wxNewId();
const long EditorEvents::idRibbonDelEvent = wxNewId();
const long EditorEvents::idRibbonUndo = wxNewId();
const long EditorEvents::idRibbonRedo = wxNewId();
const long EditorEvents::idRibbonCopy = wxNewId();
const long EditorEvents::idRibbonCut = wxNewId();
const long EditorEvents::idRibbonPaste = wxNewId();
const long EditorEvents::idRibbonTemplate = wxNewId();
const long EditorEvents::idRibbonCreateTemplate = wxNewId();
const long EditorEvents::idRibbonHelp = wxNewId();

BEGIN_EVENT_TABLE( EditorEvents, wxPanel )
    //(*EventTable(EditorEvents)
    //*)
END_EVENT_TABLE()

BaseEventSPtr EditorEvents::badEvent(new BaseEvent);
Instruction EditorEvents::badInstruction;

EditorEvents::EditorEvents( wxWindow* parent, Game & game_, Scene & scene_, vector < BaseEventSPtr > * events_, MainEditorCommand & mainEditorCommand_ ) :
game(game_),
scene(scene_),
events(events_),
mainEditorCommand(mainEditorCommand_),
conditionsColumnWidth(350),
ctrlPressed(false),
isResizingColumns(false)
{
    MemTracer.AddObj( "Editeur d'evenements", ( long )this );
    //(*Initialize(EditorEvents)
    wxMenuItem* MenuItem26;
    wxFlexGridSizer* FlexGridSizer3;
    wxMenuItem* MenuItem11;
    wxMenuItem* MenuItem29;
    wxFlexGridSizer* FlexGridSizer2;
    wxMenuItem* MenuItem27;
    wxMenuItem* MenuItem20;
    wxMenuItem* MenuItem28;
    wxMenuItem* MenuItem23;
    wxMenuItem* editMenuItem;
    wxMenu* MenuItem5;
    wxFlexGridSizer* FlexGridSizer1;
    wxMenuItem* MenuItem19;

    Create(parent, wxID_ANY, wxDefaultPosition, wxSize(536,252), 0, _T("wxID_ANY"));
    FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
    FlexGridSizer1->AddGrowableCol(0);
    FlexGridSizer1->AddGrowableRow(1);
    FlexGridSizer2 = new wxFlexGridSizer(0, 1, 0, 0);
    FlexGridSizer2->AddGrowableCol(0);
    FlexGridSizer2->AddGrowableRow(0);
    Panel1 = new wxPanel(this, ID_PANEL1, wxDefaultPosition, wxSize(-1,0), wxTAB_TRAVERSAL, _T("ID_PANEL1"));
    Panel1->SetBackgroundColour(wxColour(255,255,255));
    FlexGridSizer2->Add(Panel1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer1->Add(FlexGridSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer3 = new wxFlexGridSizer(0, 2, 0, 0);
    FlexGridSizer3->AddGrowableCol(0);
    FlexGridSizer3->AddGrowableRow(0);
    EventsPanel = new wxPanel(this, ID_PANEL2, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL2"));
    FlexGridSizer3->Add(EventsPanel, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    ScrollBar1 = new wxScrollBar(this, ID_SCROLLBAR1, wxDefaultPosition, wxSize(18,130), wxSB_VERTICAL, wxDefaultValidator, _T("ID_SCROLLBAR1"));
    ScrollBar1->SetScrollbar(0, 1, 1000, 1);
    FlexGridSizer3->Add(ScrollBar1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    horizontalScrollbar = new wxScrollBar(this, ID_SCROLLBAR2, wxDefaultPosition, wxDefaultSize, wxSB_HORIZONTAL, wxDefaultValidator, _T("ID_SCROLLBAR2"));
    horizontalScrollbar->SetScrollbar(0, 1, 10, 1);
    horizontalScrollbar->Hide();
    FlexGridSizer3->Add(horizontalScrollbar, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer1->Add(FlexGridSizer3, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    SetSizer(FlexGridSizer1);
    MenuItem8 = new wxMenuItem((&ContextMenu), idEventInsert, _("Insérer un évènement\tINSERT"), wxEmptyString, wxITEM_NORMAL);
    MenuItem8->SetBitmap(wxBitmap(wxImage(_T("res/eventaddicon.png"))));
    ContextMenu.Append(MenuItem8);
    MenuItem7 = new wxMenuItem((&ContextMenu), idMenuCom, _("Insérer un commentaire"), wxEmptyString, wxITEM_NORMAL);
    MenuItem7->SetBitmap(wxBitmap(wxImage(_T("res/commentaireaddicon.png"))));
    ContextMenu.Append(MenuItem7);
    MenuItem9 = new wxMenu();
    SubEventMenuItem = new wxMenuItem(MenuItem9, idMenuSubEvent, _("Un sous évènement"), wxEmptyString, wxITEM_NORMAL);
    SubEventMenuItem->SetBitmap(wxBitmap(wxImage(_T("res/subeventaddicon.png"))));
    MenuItem9->Append(SubEventMenuItem);
    MenuItem12 = new wxMenuItem(MenuItem9, idMenuLien, _("Un lien"), wxEmptyString, wxITEM_NORMAL);
    MenuItem12->SetBitmap(wxBitmap(wxImage(_T("res/lienaddicon.png"))));
    MenuItem9->Append(MenuItem12);
    ContextMenu.Append(ID_MENUITEM1, _("Insérer..."), MenuItem9, wxEmptyString);
    ContextMenu.AppendSeparator();
    MenuItem1 = new wxMenuItem((&ContextMenu), idMenuEventDel, _("Supprimer cet évènement\tDEL"), _("Supprimer l\'évènement complet ( Action et Condition ) de la scène"), wxITEM_NORMAL);
    MenuItem1->SetBitmap(wxBitmap(wxImage(_T("res/deleteicon.png"))));
    ContextMenu.Append(MenuItem1);
    ContextMenu.AppendSeparator();
    MenuItem16 = new wxMenuItem((&ContextMenu), idMenuUndo, _("Annuler\tCtrl-Z"), _("Annuler les modifications précédentes"), wxITEM_NORMAL);
    MenuItem16->SetBitmap(wxBitmap(wxImage(_T("res/undo.png"))));
    ContextMenu.Append(MenuItem16);
    MenuItem17 = new wxMenuItem((&ContextMenu), idMenuRedo, _("Refaire\tCtrl-Y"), _("Rétablir les modifications annulées"), wxITEM_NORMAL);
    MenuItem17->SetBitmap(wxBitmap(wxImage(_T("res/redo.png"))));
    ContextMenu.Append(MenuItem17);
    MenuItem18 = new wxMenuItem((&ContextMenu), idMenuClearHistory, _("Supprimer l\'historique"), wxEmptyString, wxITEM_NORMAL);
    ContextMenu.Append(MenuItem18);
    ContextMenu.AppendSeparator();
    MenuItem4 = new wxMenuItem((&ContextMenu), idMenuCopy, _("Copier cet évènement\tCtrl-C"), wxEmptyString, wxITEM_NORMAL);
    MenuItem4->SetBitmap(wxBitmap(wxImage(_T("res/copyicon.png"))));
    ContextMenu.Append(MenuItem4);
    MenuItem6 = new wxMenuItem((&ContextMenu), idMenuCut, _("Couper cet évènement\tCtrl-X"), wxEmptyString, wxITEM_NORMAL);
    MenuItem6->SetBitmap(wxBitmap(wxImage(_T("res/cuticon.png"))));
    ContextMenu.Append(MenuItem6);
    MenuItem5 = new wxMenu();
    MenuItem10 = new wxMenuItem(MenuItem5, idMenuPastAvant, _("Avant"), wxEmptyString, wxITEM_NORMAL);
    MenuItem5->Append(MenuItem10);
    MenuItem11 = new wxMenuItem(MenuItem5, idMenuPasteApres, _("Après\tCtrl-V"), wxEmptyString, wxITEM_NORMAL);
    MenuItem5->Append(MenuItem11);
    MenuItem13 = new wxMenuItem(MenuItem5, idMenuPasteSubEvent, _("En tant que sous évènement\tCtrl-Shift-V"), wxEmptyString, wxITEM_NORMAL);
    MenuItem5->Append(MenuItem13);
    ContextMenu.Append(idMenuPaste, _("Coller"), MenuItem5, wxEmptyString);
    editMenuItem = new wxMenuItem((&conditionsMenu), idMenuEdit, _("Editer cette condition"), wxEmptyString, wxITEM_NORMAL);
    editMenuItem->SetBitmap(wxBitmap(wxImage(_T("res/editicon.png"))));
    conditionsMenu.Append(editMenuItem);
    conditionsMenu.AppendSeparator();
    MenuItem19 = new wxMenuItem((&conditionsMenu), idMenuAdd, _("Ajouter une condition"), wxEmptyString, wxITEM_NORMAL);
    MenuItem19->SetBitmap(wxBitmap(wxImage(_T("res/addicon.png"))));
    conditionsMenu.Append(MenuItem19);
    conditionsMenu.AppendSeparator();
    MenuItem20 = new wxMenuItem((&conditionsMenu), idMenuDel, _("Supprimer la condition"), wxEmptyString, wxITEM_NORMAL);
    MenuItem20->SetBitmap(wxBitmap(wxImage(_T("res/remove.png"))));
    conditionsMenu.Append(MenuItem20);
    MenuItem37 = new wxMenu();
    MenuItem2 = new wxMenuItem(MenuItem37, ID_MENUITEM2, _("...toutes les conditions"), wxEmptyString, wxITEM_NORMAL);
    MenuItem2->SetBitmap(wxBitmap(wxImage(_T("res/deletecondition.png"))));
    MenuItem37->Append(MenuItem2);
    MenuItem3 = new wxMenuItem(MenuItem37, ID_MENUITEM17, _("...les sous évènements"), wxEmptyString, wxITEM_NORMAL);
    MenuItem37->Append(MenuItem3);
    conditionsMenu.Append(ID_MENUITEM21, _("Supprimer..."), MenuItem37, wxEmptyString);
    conditionsMenu.AppendSeparator();
    MenuItem21 = new wxMenuItem((&conditionsMenu), ID_MENUITEM3, _("Copier"), wxEmptyString, wxITEM_NORMAL);
    MenuItem21->SetBitmap(wxBitmap(wxImage(_T("res/copyicon.png"))));
    conditionsMenu.Append(MenuItem21);
    MenuItem22 = new wxMenuItem((&conditionsMenu), idMenuCouper, _("Couper"), wxEmptyString, wxITEM_NORMAL);
    MenuItem22->SetBitmap(wxBitmap(wxImage(_T("res/cuticon.png"))));
    conditionsMenu.Append(MenuItem22);
    MenuItem23 = new wxMenuItem((&conditionsMenu), ID_MENUITEM4, _("Coller"), wxEmptyString, wxITEM_NORMAL);
    MenuItem23->SetBitmap(wxBitmap(wxImage(_T("res/pasteicon.png"))));
    conditionsMenu.Append(MenuItem23);
    conditionsMenu.AppendSeparator();
    MenuItem24 = new wxMenuItem((&actionsMenu), ID_MENUITEM5, _("Editer cette action"), wxEmptyString, wxITEM_NORMAL);
    MenuItem24->SetBitmap(wxBitmap(wxImage(_T("res/editicon.png"))));
    actionsMenu.Append(MenuItem24);
    actionsMenu.AppendSeparator();
    MenuItem25 = new wxMenuItem((&actionsMenu), ID_MENUITEM6, _("Ajouter une action"), wxEmptyString, wxITEM_NORMAL);
    MenuItem25->SetBitmap(wxBitmap(wxImage(_T("res/addicon.png"))));
    actionsMenu.Append(MenuItem25);
    actionsMenu.AppendSeparator();
    MenuItem26 = new wxMenuItem((&actionsMenu), ID_MENUITEM7, _("Supprimer cette action"), wxEmptyString, wxITEM_NORMAL);
    MenuItem26->SetBitmap(wxBitmap(wxImage(_T("res/remove.png"))));
    actionsMenu.Append(MenuItem26);
    MenuItem36 = new wxMenu();
    MenuItem14 = new wxMenuItem(MenuItem36, ID_MENUITEM18, _("...toutes les actions"), wxEmptyString, wxITEM_NORMAL);
    MenuItem14->SetBitmap(wxBitmap(wxImage(_T("res/deleteaction.png"))));
    MenuItem36->Append(MenuItem14);
    MenuItem15 = new wxMenuItem(MenuItem36, ID_MENUITEM19, _("...les sous évènements"), wxEmptyString, wxITEM_NORMAL);
    MenuItem36->Append(MenuItem15);
    actionsMenu.Append(ID_MENUITEM20, _("Supprimer..."), MenuItem36, wxEmptyString);
    actionsMenu.AppendSeparator();
    MenuItem27 = new wxMenuItem((&actionsMenu), ID_MENUITEM8, _("Copier"), wxEmptyString, wxITEM_NORMAL);
    MenuItem27->SetBitmap(wxBitmap(wxImage(_T("res/copyicon.png"))));
    actionsMenu.Append(MenuItem27);
    MenuItem28 = new wxMenuItem((&actionsMenu), ID_MENUITEM9, _("Couper"), wxEmptyString, wxITEM_NORMAL);
    MenuItem28->SetBitmap(wxBitmap(wxImage(_T("res/cuticon.png"))));
    actionsMenu.Append(MenuItem28);
    MenuItem29 = new wxMenuItem((&actionsMenu), ID_MENUITEM10, _("Coller"), wxEmptyString, wxITEM_NORMAL);
    MenuItem29->SetBitmap(wxBitmap(wxImage(_T("res/pasteicon.png"))));
    actionsMenu.Append(MenuItem29);
    actionsMenu.AppendSeparator();
    MenuItem30 = new wxMenuItem((&noConditionsMenu), ID_MENUITEM11, _("Ajouter une condition"), wxEmptyString, wxITEM_NORMAL);
    MenuItem30->SetBitmap(wxBitmap(wxImage(_T("res/addicon.png"))));
    noConditionsMenu.Append(MenuItem30);
    noConditionsMenu.AppendSeparator();
    MenuItem32 = new wxMenuItem((&noConditionsMenu), ID_MENUITEM13, _("Coller"), wxEmptyString, wxITEM_NORMAL);
    MenuItem32->SetBitmap(wxBitmap(wxImage(_T("res/pasteicon.png"))));
    noConditionsMenu.Append(MenuItem32);
    noConditionsMenu.AppendSeparator();
    MenuItem31 = new wxMenuItem((&noActionsMenu), ID_MENUITEM12, _("Ajouter une action"), wxEmptyString, wxITEM_NORMAL);
    MenuItem31->SetBitmap(wxBitmap(wxImage(_T("res/addicon.png"))));
    noActionsMenu.Append(MenuItem31);
    noActionsMenu.AppendSeparator();
    MenuItem33 = new wxMenuItem((&noActionsMenu), ID_MENUITEM14, _("Coller"), wxEmptyString, wxITEM_NORMAL);
    MenuItem33->SetBitmap(wxBitmap(wxImage(_T("res/pasteicon.png"))));
    noActionsMenu.Append(MenuItem33);
    noActionsMenu.AppendSeparator();
    FlexGridSizer1->SetSizeHints(this);

    Panel1->Connect(wxEVT_KEY_UP,(wxObjectEventFunction)&EditorEvents::OnEventsPanelKeyUp,0,this);
    Panel1->Connect(wxEVT_SIZE,(wxObjectEventFunction)&EditorEvents::OnPanel1Resize,0,this);
    EventsPanel->Connect(wxEVT_PAINT,(wxObjectEventFunction)&EditorEvents::OnEventsPanelPaint,0,this);
    EventsPanel->Connect(wxEVT_KEY_UP,(wxObjectEventFunction)&EditorEvents::OnEventsPanelKeyUp,0,this);
    EventsPanel->Connect(wxEVT_SET_FOCUS,(wxObjectEventFunction)&EditorEvents::OnEventsPanelSetFocus,0,this);
    EventsPanel->Connect(wxEVT_LEFT_DOWN,(wxObjectEventFunction)&EditorEvents::OnEventsPanelLeftDown,0,this);
    EventsPanel->Connect(wxEVT_LEFT_UP,(wxObjectEventFunction)&EditorEvents::OnEventsPanelLeftUp,0,this);
    EventsPanel->Connect(wxEVT_LEFT_DCLICK,(wxObjectEventFunction)&EditorEvents::OnEventsPanelLeftDClick,0,this);
    EventsPanel->Connect(wxEVT_RIGHT_UP,(wxObjectEventFunction)&EditorEvents::OnEventsPanelRightUp,0,this);
    EventsPanel->Connect(wxEVT_MOTION,(wxObjectEventFunction)&EditorEvents::OnEventsPanelMouseMove,0,this);
    EventsPanel->Connect(wxEVT_MOUSEWHEEL,(wxObjectEventFunction)&EditorEvents::OnEventsPanelMouseWheel,0,this);
    EventsPanel->Connect(wxEVT_SIZE,(wxObjectEventFunction)&EditorEvents::OnEventsPanelResize,0,this);
    Connect(ID_SCROLLBAR1,wxEVT_SCROLL_TOP|wxEVT_SCROLL_BOTTOM|wxEVT_SCROLL_LINEUP|wxEVT_SCROLL_LINEDOWN|wxEVT_SCROLL_PAGEUP|wxEVT_SCROLL_PAGEDOWN|wxEVT_SCROLL_THUMBTRACK|wxEVT_SCROLL_THUMBRELEASE|wxEVT_SCROLL_CHANGED,(wxObjectEventFunction)&EditorEvents::OnScrollBar1ScrollChanged);
    Connect(ID_SCROLLBAR1,wxEVT_SCROLL_LINEUP,(wxObjectEventFunction)&EditorEvents::OnScrollBar1ScrollChanged);
    Connect(ID_SCROLLBAR1,wxEVT_SCROLL_LINEDOWN,(wxObjectEventFunction)&EditorEvents::OnScrollBar1ScrollChanged);
    Connect(ID_SCROLLBAR1,wxEVT_SCROLL_THUMBTRACK,(wxObjectEventFunction)&EditorEvents::OnScrollBar1ScrollChanged);
    Connect(ID_SCROLLBAR1,wxEVT_SCROLL_CHANGED,(wxObjectEventFunction)&EditorEvents::OnScrollBar1ScrollChanged);
    Connect(ID_SCROLLBAR2,wxEVT_SCROLL_TOP|wxEVT_SCROLL_BOTTOM|wxEVT_SCROLL_LINEUP|wxEVT_SCROLL_LINEDOWN|wxEVT_SCROLL_PAGEUP|wxEVT_SCROLL_PAGEDOWN|wxEVT_SCROLL_THUMBTRACK|wxEVT_SCROLL_THUMBRELEASE|wxEVT_SCROLL_CHANGED,(wxObjectEventFunction)&EditorEvents::OnhorizontalScrollbarScroll);
    Connect(ID_SCROLLBAR2,wxEVT_SCROLL_CHANGED,(wxObjectEventFunction)&EditorEvents::OnhorizontalScrollbarScroll);
    Connect(idEventInsert,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorEvents::OnInsertEventSelected);
    Connect(idMenuCom,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorEvents::OnMenuItem7Selected);
    Connect(idMenuSubEvent,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorEvents::OnSubEventMenuItemSelected);
    Connect(idMenuLien,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorEvents::OnAddLienSelected);
    Connect(idMenuEventDel,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorEvents::OnDelEventSelected);
    Connect(idMenuUndo,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorEvents::OnUndoSelected);
    Connect(idMenuRedo,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorEvents::OnRedoSelected);
    Connect(idMenuClearHistory,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorEvents::OnClearHistorySelected);
    Connect(idMenuCopy,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorEvents::OnMenuCopySelected);
    Connect(idMenuCut,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorEvents::OnCutSelected);
    Connect(idMenuPastAvant,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorEvents::OnMenuPasteSelected);
    Connect(idMenuPasteApres,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorEvents::OnMenuPasteAfterSelected);
    Connect(idMenuPasteSubEvent,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorEvents::OnPasteAsASubEventSelected);
    Connect(idMenuEdit,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorEvents::OneEditConditionMenuSelected);
    Connect(idMenuAdd,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorEvents::OnAddConditionMenuSelected);
    Connect(idMenuDel,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorEvents::OnDelConditionMenuSelected);
    Connect(ID_MENUITEM2,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorEvents::OnDelConditionsSelected);
    Connect(ID_MENUITEM17,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorEvents::OnDelSubEventsSelected);
    Connect(ID_MENUITEM3,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorEvents::OnCopyConditionMenuSelected);
    Connect(idMenuCouper,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorEvents::OnCutConditionMenuSelected);
    Connect(ID_MENUITEM4,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorEvents::OnPasteConditionMenuSelected);
    Connect(ID_MENUITEM5,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorEvents::OnEditActionMenuSelected);
    Connect(ID_MENUITEM6,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorEvents::OnAddActionMenuSelected);
    Connect(ID_MENUITEM7,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorEvents::OnDelActionMenuSelected);
    Connect(ID_MENUITEM18,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorEvents::OnDelActionsSelected);
    Connect(ID_MENUITEM19,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorEvents::OnDelSubEventsSelected);
    Connect(ID_MENUITEM8,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorEvents::OnCopyActionMenuSelected);
    Connect(ID_MENUITEM9,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorEvents::OnCutActionMenuSelected);
    Connect(ID_MENUITEM10,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorEvents::OnPasteActionMenuSelected);
    Connect(ID_MENUITEM11,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorEvents::OnAddConditionMenuSelected);
    Connect(ID_MENUITEM13,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorEvents::OnPasteConditionMenuSelected);
    Connect(ID_MENUITEM12,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorEvents::OnAddActionMenuSelected);
    Connect(ID_MENUITEM14,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorEvents::OnPasteActionMenuSelected);
    Connect(wxEVT_KEY_UP,(wxObjectEventFunction)&EditorEvents::OnEventsPanelKeyUp);
    Connect(wxEVT_MOUSEWHEEL,(wxObjectEventFunction)&EditorEvents::OnEventsPanelMouseWheel);
    //*)
    Connect( ID_TEMPLATEBUTTON, wxEVT_COMMAND_TOOL_CLICKED, ( wxObjectEventFunction )&EditorEvents::OnTemplateBtClick );
    Connect( ID_CREATETEMPLATEBUTTON, wxEVT_COMMAND_TOOL_CLICKED, ( wxObjectEventFunction )&EditorEvents::OnCreateTemplateBtClick );
    Connect( ID_SEARCHBUTTON, wxEVT_COMMAND_TOOL_CLICKED, ( wxObjectEventFunction )&EditorEvents::OnSearchBtClick );
    Connect( ID_HELPBUTTON, wxEVT_COMMAND_TOOL_CLICKED, ( wxObjectEventFunction )&EditorEvents::OnAideBtClick );

    toolbar = new wxToolBar( Panel1, -1, wxDefaultPosition, wxDefaultSize,
                             wxTB_FLAT | wxTB_NODIVIDER | wxTB_HORIZONTAL );

    toolbar->ClearTools();
    toolbar->SetToolBitmapSize( wxSize( 16, 16 ) );
    toolbar->AddTool( idEventInsert, wxT( "Insérer un évènement" ), wxBitmap( wxImage( "res/eventaddicon.png" ) ), _( "Insérer un évènement" ) );
    toolbar->AddTool( idMenuSubEvent, wxT( "Insérer un sous-évènement" ), wxBitmap( wxImage( "res/subeventaddicon.png" ) ), _( "Insérer un sous-évènement" ) );
    toolbar->AddTool( idMenuCom, wxT( "Insérer un commentaire" ), wxBitmap( wxImage( "res/commentaireaddicon.png" ) ), _( "Insérer un commentaire" ) );
    toolbar->AddTool( idMenuLien, wxT( "Insérer un lien vers des évènements" ), wxBitmap( wxImage( "res/lienaddicon.png" ) ), _( "Insérer un lien vers des évènements" ) );
    toolbar->AddSeparator();
    toolbar->AddTool( idMenuEventDel, wxT( "Supprimer l'évènement selectionné" ), wxBitmap( wxImage( "res/deleteicon.png" ) ), _( "Supprimer l'évènement selectionné" ) );
    toolbar->AddSeparator();
    toolbar->AddTool( ID_TEMPLATEBUTTON, wxT( "Modèle d'évènements" ), wxBitmap( wxImage( "res/templateicon.png" ) ), _( "Ajouter des évènements depuis un modèle" ) );
    toolbar->AddTool( ID_CREATETEMPLATEBUTTON, wxT( "Création de modèle d'évènements" ), wxBitmap( wxImage( "res/addtemplateicon.png" ) ), _( "Créer un modèle d'évènements depuis la scène" ) );
    toolbar->AddSeparator();
    toolbar->AddTool( idMenuUndo, wxT( "Annuler les modifications précédentes" ), wxBitmap( wxImage( "res/undo.png" ) ), _( "Annuler les modifications précédentes" ) );
    toolbar->AddTool( idMenuRedo, wxT( "Rétablir les modifications annulées" ), wxBitmap( wxImage( "res/redo.png" ) ), _( "Rétablir les modifications annulées" ) );
    toolbar->AddSeparator();
    toolbar->AddTool( idMenuCopy, wxT( "Copier l'évènement selectionné" ), wxBitmap( wxImage( "res/copyicon.png" ) ), _( "Copier l'évènement selectionné" ) );
    toolbar->AddTool( idMenuCut, wxT( "Couper l'évènement selectionné" ), wxBitmap( wxImage( "res/cuticon.png" ) ), _( "Couper l'évènement selectionné" ) );
    toolbar->AddTool( idMenuPasteApres, wxT( "Coller après l'évènement selectionné" ), wxBitmap( wxImage( "res/pasteicon.png" ) ), _( "Coller après l'évènement selectionné" ) );

    toolbar->AddSeparator();
    toolbar->AddTool( ID_SEARCHBUTTON, wxT( "Rechercher dans les évènements" ), wxBitmap( wxImage( "res/searchicon.png" ) ), _( "Rechercher dans les évènements" ) );
    toolbar->AddSeparator();
    toolbar->AddTool( ID_HELPBUTTON, wxT( "Aide" ), wxBitmap( wxImage( "res/helpicon.png" ) ), _( "Aide de l'éditeur d'évènements" ) );
    toolbar->AddSeparator();
    toolbar->Realize();

    //On vérifie si on est pas en mode simple.
    wxConfigBase * pConfig = wxConfigBase::Get();

    bool result = false;
    pConfig->Read("/ModeSimple", &result);

    //TODO : Desactiver ceci quand implementé
    toolbar->EnableTool(ID_SEARCHBUTTON, false);

    //Désactivation d'options du menu en mode simple
    if ( result )
    {
        toolbar->EnableTool(idMenuSubEvent, false);
        toolbar->EnableTool(idMenuLien, false);
        toolbar->EnableTool(ID_CREATETEMPLATEBUTTON, false);
        SubEventMenuItem->Enable(false);
        MenuItem12->Enable(false);
        MenuItem2->Enable(false);
        MenuItem3->Enable(false);
        MenuItem15->Enable(false);
        MenuItem13->Enable(false);
    }

    actionsMenu.AppendSubMenu(&ContextMenu, _("Evènement"), _("Edition de l'évènement"));
    conditionsMenu.AppendSubMenu(&ContextMenu, _("Evènement"), _("Edition de l'évènement"));
    noActionsMenu.AppendSubMenu(&ContextMenu, _("Evènement"), _("Edition de l'évènement"));
    noConditionsMenu.AppendSubMenu(&ContextMenu, _("Evènement"), _("Edition de l'évènement"));

    //Obligatoire avec wxGTK, sinon la toolbar ne s'affiche pas
#ifdef __WXGTK__
    wxSize tbSize = toolbar->GetSize();
    gtk_widget_set_usize( toolbar->m_widget, tbSize.GetWidth(), tbSize.GetHeight() );
#endif

    searchDialog = new SearchEvents(this, unusedEventList);
}

/**
 * Static method for creating ribbon for events editors.
 */
void EditorEvents::CreateRibbonPage(wxRibbonPage * page)
{
    wxConfigBase *pConfig = wxConfigBase::Get();
    bool hideLabels = false;
    pConfig->Read( _T( "/Skin/HideLabels" ), &hideLabels );

    {
        wxRibbonPanel *ribbonPanel = new wxRibbonPanel(page, wxID_ANY, _("Insertion"), wxBitmap("res/add24.png", wxBITMAP_TYPE_ANY), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        wxRibbonButtonBar *ribbonBar = new wxRibbonButtonBar(ribbonPanel, wxID_ANY);
        ribbonBar->AddButton(idRibbonEvent, !hideLabels ? _("Ajouter un évènement") : "", wxBitmap("res/eventadd24.png", wxBITMAP_TYPE_ANY));
        ribbonBar->AddButton(idRibbonSubEvent, !hideLabels ? _("Ajouter un sous-évènement") : "", wxBitmap("res/subeventadd24.png", wxBITMAP_TYPE_ANY));
        ribbonBar->AddButton(idRibbonCom, !hideLabels ? _("Ajouter un commentaire") : "", wxBitmap("res/commentaireadd24.png", wxBITMAP_TYPE_ANY));
        ribbonBar->AddButton(idRibbonLink, !hideLabels ? _("Ajout. un lien") : "", wxBitmap("res/lienadd24.png", wxBITMAP_TYPE_ANY));
    }
    {
        wxRibbonPanel *ribbonPanel = new wxRibbonPanel(page, wxID_ANY, _("Suppression"), wxBitmap("res/delete24.png", wxBITMAP_TYPE_ANY), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        wxRibbonButtonBar *ribbonBar = new wxRibbonButtonBar(ribbonPanel, wxID_ANY);
        ribbonBar->AddButton(idRibbonDelEvent, !hideLabels ? _("Supprimer l'évènement") : "", wxBitmap("res/delete24.png", wxBITMAP_TYPE_ANY));
    }
    {
        wxRibbonPanel *ribbonPanel = new wxRibbonPanel(page, wxID_ANY, _("Annulation"), wxBitmap("res/unredo24.png", wxBITMAP_TYPE_ANY), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        wxRibbonButtonBar *ribbonBar = new wxRibbonButtonBar(ribbonPanel, wxID_ANY);
        ribbonBar->AddButton(idRibbonUndo, !hideLabels ? _("Annuler") : "", wxBitmap("res/undo24.png", wxBITMAP_TYPE_ANY));
        ribbonBar->AddButton(idRibbonRedo, !hideLabels ? _("Refaire") : "", wxBitmap("res/redo24.png", wxBITMAP_TYPE_ANY));
    }
    {
        wxRibbonPanel *ribbonPanel = new wxRibbonPanel(page, wxID_ANY, _("Presse papiers"), wxBitmap("res/copy24.png", wxBITMAP_TYPE_ANY), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        wxRibbonButtonBar *ribbonBar = new wxRibbonButtonBar(ribbonPanel, wxID_ANY);
        ribbonBar->AddButton(idRibbonCopy, !hideLabels ? _("Copier") : "", wxBitmap("res/copy24.png", wxBITMAP_TYPE_ANY));
        ribbonBar->AddButton(idRibbonCut, !hideLabels ? _("Couper") : "", wxBitmap("res/cut24.png", wxBITMAP_TYPE_ANY));
        ribbonBar->AddButton(idRibbonPaste, !hideLabels ? _("Coller") : "", wxBitmap("res/paste24.png", wxBITMAP_TYPE_ANY));
    }
    {
        wxRibbonPanel *ribbonPanel = new wxRibbonPanel(page, wxID_ANY, _("Modèles"), wxBitmap("res/template24.png", wxBITMAP_TYPE_ANY), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        wxRibbonButtonBar *ribbonBar = new wxRibbonButtonBar(ribbonPanel, wxID_ANY);
        ribbonBar->AddButton(idRibbonTemplate, !hideLabels ? _("Insérer") : "", wxBitmap("res/template24.png", wxBITMAP_TYPE_ANY));
        ribbonBar->AddButton(idRibbonCreateTemplate, !hideLabels ? _("Créer") : "", wxBitmap("res/addtemplate24.png", wxBITMAP_TYPE_ANY));
    }
    {
        wxRibbonPanel *ribbonPanel = new wxRibbonPanel(page, wxID_ANY, _("Aide"), wxBitmap("res/helpicon24.png", wxBITMAP_TYPE_ANY), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        wxRibbonButtonBar *ribbonBar = new wxRibbonButtonBar(ribbonPanel, wxID_ANY);
        ribbonBar->AddButton(idRibbonHelp, !hideLabels ? _("Aide") : "", wxBitmap("res/helpicon24.png", wxBITMAP_TYPE_ANY));
    }
}

void EditorEvents::ConnectEvents()
{
    mainEditorCommand.GetMainEditor()->Connect(idRibbonEvent, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EditorEvents::OnInsertEventSelected, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonCom, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EditorEvents::OnMenuItem7Selected, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonLink, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EditorEvents::OnAddLienSelected, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonSubEvent, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EditorEvents::OnSubEventMenuItemSelected, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonDelEvent, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EditorEvents::OnDelEventSelected, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonUndo, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EditorEvents::OnUndoSelected, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonRedo, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EditorEvents::OnRedoSelected, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonCopy, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EditorEvents::OnMenuCopySelected, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonCut, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EditorEvents::OnCutSelected, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonPaste, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EditorEvents::OnMenuPasteSelected, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonTemplate, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EditorEvents::OnTemplateBtClick, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonCreateTemplate, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EditorEvents::OnCreateTemplateBtClick, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonHelp, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EditorEvents::OnAideBtClick, NULL, this);
}

EditorEvents::~EditorEvents()
{
    MemTracer.DelObj(( long )this );

    //Be careful to remove ( not delete ) the common sub menu, so as to prevent its multiple deletion.
    actionsMenu.Remove(actionsMenu.FindItemByPosition(actionsMenu.GetMenuItemCount()-1));
    conditionsMenu.Remove(conditionsMenu.FindItemByPosition(conditionsMenu.GetMenuItemCount()-1));
    noActionsMenu.Remove(noActionsMenu.FindItemByPosition(noActionsMenu.GetMenuItemCount()-1));
    noConditionsMenu.Remove(noConditionsMenu.FindItemByPosition(noConditionsMenu.GetMenuItemCount()-1));
    //(*Destroy(EditorEvents)
    //*)
}

////////////////////////////////////////////////////////////
/// Mise à jour de la taille de la toolbar
/// quand on redimensionne le panel
////////////////////////////////////////////////////////////
void EditorEvents::OnPanel1Resize( wxSizeEvent& event )
{
    toolbar->SetSize(Panel1->GetSize().x, -1);
}

////////////////////////////////////////////////////////////
/// Rafraichissement à chaque changement de la scrollbar
////////////////////////////////////////////////////////////
void EditorEvents::OnScrollBar1ScrollChanged( wxScrollEvent& event )
{
    EventsPanel->Refresh();
    EventsPanel->Update();
}
void EditorEvents::OnhorizontalScrollbarScroll(wxScrollEvent& event)
{
    EventsPanel->Refresh();
    EventsPanel->Update();
}

////////////////////////////////////////////////////////////
/// Rafraichissement en cas de changement de taille
////////////////////////////////////////////////////////////
void EditorEvents::OnEventsPanelResize( wxSizeEvent& event )
{
    ResetEventsSizeCache(*events);

    EventsPanel->Refresh();
    EventsPanel->Update();
}

////////////////////////////////////////////////////////////
/// Remise à zéro des variables contenant les tailles des évènements
////////////////////////////////////////////////////////////
void EditorEvents::ResetEventsSizeCache(vector < BaseEventSPtr > & eventsToReset)
{
    vector<BaseEventSPtr>::iterator e = eventsToReset.begin();
    vector<BaseEventSPtr>::const_iterator end = eventsToReset.end();

    for(;e != end;++e)
    {
        (*e)->eventRenderingNeedUpdate = true;

        if ( (*e)->CanHaveSubEvents() )
            ResetEventsSizeCache((*e)->GetSubEvents());
    }
}

////////////////////////////////////////////////////////////
/// Appelé à chaque changements dans les évènements
////////////////////////////////////////////////////////////
void EditorEvents::ChangesMadeOnEvents()
{
    //Mise à jour de l'historique d'annulation
    history.push_back(*events);
    redoHistory.clear();

    scene.wasModified = true;

    //Rafraichissement
    EventsPanel->Refresh();
    EventsPanel->Update();
}

Instruction & EditorEvents::GetLastSelectedInstruction()
{
    return GetSelectedInstruction(eventsSelected.size()-1);
}

Instruction & EditorEvents::GetSelectedInstruction(unsigned int nb)
{
    if ( nb >= eventsSelected.size() || boost::tuples::get<3>(eventsSelected[nb]) >= boost::tuples::get<2>(eventsSelected[nb])->size())
        return badInstruction;

    return boost::tuples::get<2>(eventsSelected[nb])->at(boost::tuples::get<3>(eventsSelected[nb]));
}

vector < Instruction > * EditorEvents::GetLastSelectedListOfInstructions()
{
    return GetSelectedListOfInstructions(eventsSelected.size()-1);
}

vector < Instruction > * EditorEvents::GetSelectedListOfInstructions(unsigned int nb)
{
    if ( nb >= eventsSelected.size() )
        return NULL;

    return boost::tuples::get<2>(eventsSelected[nb]);
}

BaseEventSPtr EditorEvents::GetLastSelectedEvent()
{
    return GetSelectedEvent(eventsSelected.size()-1);
}

BaseEventSPtr EditorEvents::GetSelectedEvent(unsigned int nb)
{
    if ( nb >= eventsSelected.size() || boost::tuples::get<1>(eventsSelected[nb]) >= boost::tuples::get<0>(eventsSelected[nb])->size() )
        return badEvent;

    return boost::tuples::get<0>(eventsSelected[nb])->at(boost::tuples::get<1>(eventsSelected[nb]));
}

vector < BaseEventSPtr > * EditorEvents::GetLastSelectedListOfEvents()
{
    return GetSelectedListOfEvents(eventsSelected.size()-1);
}

vector < BaseEventSPtr > * EditorEvents::GetSelectedListOfEvents(unsigned int nb)
{
    if ( nb >= eventsSelected.size() )
        return NULL;

    return boost::tuples::get<0>(eventsSelected[nb]);
}

////////////////////////////////////////////////////////////
/// Affichage des évènements de la scène
////////////////////////////////////////////////////////////
void EditorEvents::OnEventsPanelPaint( wxPaintEvent& event )
{
    EventsRenderingHelper * eventsRenderingHelper = EventsRenderingHelper::getInstance();

    wxBufferedPaintDC dc( EventsPanel ); //Création obligatoire du wxBufferedPaintDC
    EventsPanel->SetBackgroundStyle( wxBG_STYLE_PAINT );

    //Préparation de la zone de dessin
    dc.SetBackgroundMode( wxTRANSPARENT );
    wxColour backgroundColor( wxColour( 250, 250, 250 ) );
    dc.SetBackground( backgroundColor );
    dc.SetBrush( wxBrush( backgroundColor ) );
    dc.SetFont( wxFont( 8, wxDEFAULT, wxNORMAL, wxNORMAL ) );
    dc.SetTextForeground( wxColour( 0, 0, 0 ) );

    //Effacement de l'arrière plan
    dc.SetPen( wxPen( backgroundColor ) );
    dc.DrawRectangle( 0, 0, EventsPanel->GetSize().x, EventsPanel->GetSize().y );

    dc.SetPen( wxPen( wxColour( 120, 120, 120 ), 1, wxSOLID ) );

    //On récupère la position de dessin initiale
    int Yposition = -( ScrollBar1->GetThumbPosition() );
    int positionScrollbar = ScrollBar1->GetThumbPosition();
    int initialXposition = 2 + dc.GetTextExtent(st(events->size())).GetWidth() + 2 - horizontalScrollbar->GetThumbPosition();
    int maximalWidth = 0;

    //Setup renderings datas which are constants.
    eventsRenderingHelper->SetConditionsColumnWidth(conditionsColumnWidth);

    instructionsSelected = false;

    //Phase de dessin des évènements
    DrawEvents(*events, dc, Yposition, initialXposition, maximalWidth, true);

    //Phase de dessin du texte final
    dc.SetFont(eventsRenderingHelper->GetFont());
    wxString text = _("Utilisez le clic droit pour ajouter des évènements, actions et conditions.\nVous pouvez ensuite double cliquer sur les évènements pour les éditer.");
    dc.DrawLabel(text,
                wxRect( (EventsPanel->GetSize().x-dc.GetMultiLineTextExtent(text).GetWidth())/2,Yposition+15,
                        (EventsPanel->GetSize().x+dc.GetMultiLineTextExtent(text).GetWidth())/2-(EventsPanel->GetSize().x-dc.GetMultiLineTextExtent(text).GetWidth())/2,0)
                , wxALIGN_CENTER);

    //Mise à jour des scrollbars
    ScrollBar1->SetScrollbar( positionScrollbar, EventsPanel->GetSize().y, Yposition + positionScrollbar + 5 + dc.GetMultiLineTextExtent(text).GetHeight(), EventsPanel->GetSize().y );
    horizontalScrollbar->SetScrollbar( horizontalScrollbar->GetThumbPosition(), EventsPanel->GetSize().x, maximalWidth, EventsPanel->GetSize().x );
}

////////////////////////////////////////////////////////////
/// Permet d'afficher une liste d'évènement.
/// Cette fonction est récursive en cas de sous évènements.
/// Met aussi à jour eventTreeSelected avec l'évènement selectionné.
////////////////////////////////////////////////////////////
void EditorEvents::DrawEvents(vector < BaseEventSPtr > & list, wxBufferedPaintDC & dc, int & Yposition, int initialXposition, int & parentMaximalWidth, bool draw)
{
    EventsRenderingHelper * eventsRenderingHelper = EventsRenderingHelper::getInstance();

    int positionScrollbar = ScrollBar1->GetThumbPosition();
    const int separation = 3;

    int maximalWidth = 0;
    for ( unsigned int i = 0;i < list.size();++i )
    {
        eventsRenderingHelper->SetConditionsColumnWidth(conditionsColumnWidth-initialXposition);

        //Numérotation
        //i+1 permet de commencer la numérotation à 1
        if ( draw )
        {
            dc.SetFont( eventsRenderingHelper->GetFont() );
            dc.DrawText(st(i+1), initialXposition-(dc.GetTextExtent(st(i+1)).GetWidth()+2), Yposition);
        }

        int width = EventsPanel->GetSize().x-initialXposition;
        unsigned int renderedHeight = list[i]->GetRenderedHeight(width < 0 ? 0 : width);

        //Hit test
        if ( MouseY >= Yposition+positionScrollbar &&
             MouseY <= Yposition+positionScrollbar+renderedHeight )
        {
            eventsSelected.push_back(boost::make_tuple(&list, i,              //Useful part
                                                       (vector<Instruction>*)NULL, 0)); //Useless
            list[i]->selected = true;
            list[i]->eventRenderingNeedUpdate = true;
            list[i]->OnSingleClick(MouseX, MouseY-(Yposition+positionScrollbar), eventsSelected, conditionsSelected, instructionsSelected);
        }

        //Render
        if ( Yposition + renderedHeight + positionScrollbar >= positionScrollbar &&
             Yposition + positionScrollbar < ( positionScrollbar + EventsPanel->GetSize().y ) &&
             draw)
        {
            list[i]->Render(dc, initialXposition, Yposition, width < 0 ? 0 : width );
        }

        Yposition += renderedHeight;

        //Sub events
        if ( list[i]->CanHaveSubEvents() )
        {
            Yposition += separation;
            DrawEvents(list[i]->GetSubEvents(), dc, Yposition, initialXposition+32, maximalWidth, draw);
        }

        Yposition += separation;
    }

    if ( initialXposition + maximalWidth > parentMaximalWidth )
        parentMaximalWidth = initialXposition + maximalWidth;
}

////////////////////////////////////////////////////////////
/// Suppression de l'évènement entier
////////////////////////////////////////////////////////////
void EditorEvents::OnDelEventSelected( wxCommandEvent& event )
{
    for (unsigned int i = 0;i<eventsSelected.size();++i)
    	GetSelectedListOfEvents(i)->erase(GetSelectedListOfEvents(i)->begin() + eventsSelected[i].get<1>());

    eventsSelected.clear();

    ChangesMadeOnEvents();
}

////////////////////////////////////////////////////////////
/// Suppression des conditions
////////////////////////////////////////////////////////////
void EditorEvents::OnDelConditionsSelected( wxCommandEvent& event )
{
    if ( !instructionsSelected || !conditionsSelected) return;

    for (unsigned int i = 0;i<eventsSelected.size();++i)
    	GetSelectedListOfInstructions(i)->clear();

    ChangesMadeOnEvents();
}

////////////////////////////////////////////////////////////
/// Suppression des actions
////////////////////////////////////////////////////////////
void EditorEvents::OnDelActionsSelected( wxCommandEvent& event )
{
    if ( !instructionsSelected || conditionsSelected) return;

    for (unsigned int i = 0;i<eventsSelected.size();++i)
    	GetSelectedListOfInstructions(i)->clear();

    ChangesMadeOnEvents();
}

////////////////////////////////////////////////////////////
/// Ouvrir la fenêtre des modèles d'évènements
////////////////////////////////////////////////////////////
void EditorEvents::OnTemplateBtClick( wxCommandEvent& event )
{
    if ( eventsSelected.empty() )
    {
        wxLogStatus(_("Aucun endroit où insérer le modèle d'évènement."));
        return;
    }

    ChoixTemplateEvent dialog( this );
    if ( dialog.ShowModal() == 1 )
    {
        //Insertion des évènements ( déjà personnalisés )
        for ( unsigned int i = 0;i < dialog.finalTemplate.events.size();i++ )
            GetLastSelectedListOfEvents()->push_back( dialog.finalTemplate.events.at( i ) );

    }

    ChangesMadeOnEvents();
}


////////////////////////////////////////////////////////////
/// Insertion d'un commentaire
////////////////////////////////////////////////////////////
void EditorEvents::OnMenuItem7Selected( wxCommandEvent& event )
{
    if ( eventsSelected.empty() )
        eventsSelected.push_back(boost::tuples::make_tuple(events, events->size(), (vector <Instruction>*)NULL, 0));

    gdp::ExtensionsManager * extensionsManager = gdp::ExtensionsManager::getInstance();

    BaseEventSPtr eventToAdd = extensionsManager->CreateEvent("BuiltinCommonInstructions::Comment");
    eventToAdd->EditEvent(this, game, scene, mainEditorCommand);
}


////////////////////////////////////////////////////////////
/// Insertion d'un évènement
////////////////////////////////////////////////////////////
void EditorEvents::OnInsertEventSelected( wxCommandEvent& event )
{
    if ( eventsSelected.empty() )
        eventsSelected.push_back(boost::tuples::make_tuple(events, events->size(), (vector <Instruction>*)NULL, 0));

    gdp::ExtensionsManager * extensionsManager = gdp::ExtensionsManager::getInstance();

    BaseEventSPtr eventToAdd = extensionsManager->CreateEvent("BuiltinCommonInstructions::Standard");
    eventToAdd->EditEvent(this, game, scene, mainEditorCommand);
}


////////////////////////////////////////////////////////////
/// Insertion d'un sous évènement
////////////////////////////////////////////////////////////
void EditorEvents::OnSubEventMenuItemSelected(wxCommandEvent& event)
{
    if ( eventsSelected.empty() )
    {
        wxLogStatus(_("Aucun endroit où insérer le sous évènement"));
        return;
    }
    if ( !GetLastSelectedEvent()->CanHaveSubEvents() ) return;

    gdp::ExtensionsManager * extensionsManager = gdp::ExtensionsManager::getInstance();
    BaseEventSPtr eventToAdd = extensionsManager->CreateEvent("BuiltinCommonInstructions::Standard");

    GetLastSelectedEvent()->GetSubEvents().push_back(eventToAdd);

    ChangesMadeOnEvents();
}


////////////////////////////////////////////////////////////
/// Insertion d'un lien
////////////////////////////////////////////////////////////
void EditorEvents::OnAddLienSelected( wxCommandEvent& event )
{
    if ( eventsSelected.empty() )
        eventsSelected.push_back(boost::tuples::make_tuple(events, events->size(), (vector <Instruction>*)NULL, 0));

    gdp::ExtensionsManager * extensionsManager = gdp::ExtensionsManager::getInstance();

    BaseEventSPtr eventToAdd = extensionsManager->CreateEvent("BuiltinCommonInstructions::Link");

    eventToAdd->EditEvent(this, game, scene, mainEditorCommand);
}


////////////////////////////////////////////////////////////
/// Copier un évènement
////////////////////////////////////////////////////////////
void EditorEvents::OnMenuCopySelected( wxCommandEvent& event )
{
    if ( eventsSelected.empty() ) return;

    Clipboard * clipboard = Clipboard::getInstance();
    clipboard->SetEvent( GetLastSelectedEvent() );
}

////////////////////////////////////////////////////////////
/// Couper un évènement
////////////////////////////////////////////////////////////
void EditorEvents::OnCutSelected( wxCommandEvent& event )
{
    if ( eventsSelected.empty() ) return;

    Clipboard * clipboard = Clipboard::getInstance();
    clipboard->SetEvent( GetLastSelectedEvent() );

    GetLastSelectedListOfEvents()->erase( GetLastSelectedListOfEvents()->begin() + boost::tuples::get<1>(eventsSelected[0]) );
    eventsSelected.clear();

    ChangesMadeOnEvents();
}

////////////////////////////////////////////////////////////
/// Coller un évènement avant l'évènement choisi
////////////////////////////////////////////////////////////
void EditorEvents::OnMenuPasteSelected( wxCommandEvent& event )
{
    if ( eventsSelected.empty() )
        eventsSelected.push_back(boost::tuples::make_tuple(events, events->size(), (vector <Instruction>*)NULL, 0));

    Clipboard * clipboard = Clipboard::getInstance();

    if ( boost::tuples::get<1>(eventsSelected[0]) < GetLastSelectedListOfEvents()->size() )
        GetLastSelectedListOfEvents()->insert( GetLastSelectedListOfEvents()->begin() + boost::tuples::get<1>(eventsSelected[0]), clipboard->GetEvent() );
    else
        GetLastSelectedListOfEvents()->push_back( clipboard->GetEvent() );

    ChangesMadeOnEvents();
}

////////////////////////////////////////////////////////////
/// Coller après l'évènement choisi
////////////////////////////////////////////////////////////
void EditorEvents::OnMenuPasteAfterSelected( wxCommandEvent& event )
{
    if ( eventsSelected.empty() )
        eventsSelected.push_back(boost::tuples::make_tuple(events, events->size(), (vector <Instruction>*)NULL, 0));

    Clipboard * clipboard = Clipboard::getInstance();

    if ( boost::tuples::get<1>(eventsSelected[0])+1 < GetLastSelectedListOfEvents()->size() )
        GetLastSelectedListOfEvents()->insert( GetLastSelectedListOfEvents()->begin() + boost::tuples::get<1>(eventsSelected[0])+1, clipboard->GetEvent() );
    else
        GetLastSelectedListOfEvents()->push_back( clipboard->GetEvent() );

    ChangesMadeOnEvents();
}

////////////////////////////////////////////////////////////
/// Coller en tant que sous évènement
////////////////////////////////////////////////////////////
void EditorEvents::OnPasteAsASubEventSelected(wxCommandEvent& event)
{
    if ( eventsSelected.empty() || !GetLastSelectedEvent()->CanHaveSubEvents() ) return;

    Clipboard * clipboard = Clipboard::getInstance();
    GetLastSelectedEvent()->GetSubEvents().push_back( clipboard->GetEvent() );

    ChangesMadeOnEvents();
}

////////////////////////////////////////////////////////////
/// Supprimer les sous évènements de l'évènement
////////////////////////////////////////////////////////////
void EditorEvents::OnDelSubEventsSelected(wxCommandEvent& event)
{
    if ( eventsSelected.empty() || !GetLastSelectedEvent()->CanHaveSubEvents()  ) return;

    GetLastSelectedEvent()->GetSubEvents().clear();

    ChangesMadeOnEvents();
}


void EditorEvents::OnAideBtClick( wxCommandEvent& event )
{
    HelpFileAccess * helpFileAccess = HelpFileAccess::getInstance();
    helpFileAccess->DisplaySection(11);
}

////////////////////////////////////////////////////////////
/// Création d'un modèle d'évènement
/// à partir des évènements du jeu
////////////////////////////////////////////////////////////
void EditorEvents::OnCreateTemplateBtClick( wxCommandEvent& event )
{
    if ( eventsSelected.empty() )
        eventsSelected.push_back(boost::tuples::make_tuple(events, events->size(), (vector <Instruction>*)NULL, 0));

    CreateTemplate dialog( this, *GetLastSelectedListOfEvents() );
    dialog.ShowModal();
}

////////////////////////////////////////////////////////////
/// Double clic gauche : Edition d'un évènement
////////////////////////////////////////////////////////////
void EditorEvents::OnEventsPanelLeftDClick( wxMouseEvent& event )
{
    if ( eventsSelected.empty() ) return;

    //Update mouse position
    MouseX = event.GetX();
    MouseY = event.GetY()+ScrollBar1->GetThumbPosition();

    //Refresh, so as to display selection and refresh events selected
    EventsPanel->Refresh();
    EventsPanel->Update();

    //Get the selection
    BaseEventSPtr eventSelected = GetLastSelectedEvent();
    vector < Instruction > * instructionsListSelected = GetLastSelectedListOfInstructions();

    wxCommandEvent unusedEvent;

    //Edition of a condition
    if ( instructionsListSelected != NULL && conditionsSelected )
    {
        if ( !instructionsListSelected->empty() )
            OneEditConditionMenuSelected( unusedEvent );
        else
            OnAddConditionMenuSelected( unusedEvent );
    }
    //Edition of an action
    else if ( instructionsListSelected != NULL && !conditionsSelected )
    {
        if ( !instructionsListSelected->empty() )
            OnEditActionMenuSelected(unusedEvent);
        else
            OnAddActionMenuSelected(unusedEvent);
    }
    //Menu for events
    else
        eventSelected->EditEvent(this, game, scene, mainEditorCommand);

}

////////////////////////////////////////////////////////////
/// Clic gauche : selection
////////////////////////////////////////////////////////////
void EditorEvents::OnEventsPanelLeftUp(wxMouseEvent& event)
{
    wxFocusEvent unusedEvent;
    OnEventsPanelSetFocus(unusedEvent);

    if ( !ctrlPressed )
    {
        instructionsSelected = false;
        DeselectAllEvents(*events);
        DeselectAllActions(*events);
        DeselectAllConditions(*events);
    }

    //Update mouse position
    MouseX = event.GetX();
    MouseY = event.GetY()+ScrollBar1->GetThumbPosition();

    //Resize the column size if necessary
    if ( isResizingColumns )
    {
        conditionsColumnWidth = event.GetX();
        ResetEventsSizeCache(*events);
        isResizingColumns = false;
    }

    //Refresh the events
    EventsPanel->Refresh();
    EventsPanel->Update();
}

////////////////////////////////////////////////////////////
/// Clic droit : menu contextuel
////////////////////////////////////////////////////////////
void EditorEvents::OnEventsPanelRightUp( wxMouseEvent& event )
{
    wxFocusEvent unusedEvent;
    OnEventsPanelSetFocus(unusedEvent);

    if ( !ctrlPressed )
    {
        instructionsSelected = false;
        DeselectAllEvents(*events);
        DeselectAllActions(*events);
        DeselectAllConditions(*events);
    }

    //Update mouse position
    MouseX = event.GetX();
    MouseY = event.GetY()+ScrollBar1->GetThumbPosition();

    //Refresh, so as to display selection and refresh events selected
    EventsPanel->Refresh();
    EventsPanel->Update();

    //Get the selection
    BaseEventSPtr eventSelected = GetLastSelectedEvent();
    vector < Instruction > * instructionsListSelected = GetLastSelectedListOfInstructions();

    //Menu for conditions list
    if ( instructionsListSelected != NULL && conditionsSelected )
    {
        if ( !instructionsListSelected->empty() )
            PopupMenu( &conditionsMenu );
        else
            PopupMenu( &noConditionsMenu );
    }
    //Menu for actions list
    else if ( instructionsListSelected != NULL && !conditionsSelected )
    {
        if ( !instructionsListSelected->empty() )
            PopupMenu( &actionsMenu );
        else
            PopupMenu( &noActionsMenu );
    }
    //Menu for events
    else
        PopupMenu( &ContextMenu );
}

////////////////////////////////////////////////////////////
/// Scroll avec la molette
////////////////////////////////////////////////////////////
void EditorEvents::OnEventsPanelMouseWheel(wxMouseEvent& event)
{
    ScrollBar1->SetScrollbar(ScrollBar1->GetThumbPosition()-event.GetWheelRotation(), ScrollBar1->GetThumbSize(), ScrollBar1->GetRange(), ScrollBar1->GetPageSize());
    EventsPanel->Refresh();
    EventsPanel->Update();
}

////////////////////////////////////////////////////////////
/// Afficher la fenêtre de recherche
////////////////////////////////////////////////////////////
void EditorEvents::OnSearchBtClick(wxCommandEvent& event)
{
    if ( searchDialog )
        searchDialog->ShowModal();
}

////////////////////////////////////////////////////////////
/// Suppression de l'historique des changements
////////////////////////////////////////////////////////////
void EditorEvents::OnClearHistorySelected(wxCommandEvent& event)
{
    history.clear();
    redoHistory.clear();
}

////////////////////////////////////////////////////////////
/// Annuler le dernier changement
////////////////////////////////////////////////////////////
void EditorEvents::OnUndoSelected(wxCommandEvent& event)
{
    if ( history.size() < 2 )
        return;

    redoHistory.push_back(*events); //On pourra revenir à l'état actuel avec "Refaire"
    *events = history.at( history.size() - 2 ); //-2 car le dernier élément est la liste d'évènement actuelle
    history.pop_back();

    EventsPanel->Refresh();
    EventsPanel->Update();

    scene.wasModified = true;
}

////////////////////////////////////////////////////////////
/// Rétablir le dernier changement
////////////////////////////////////////////////////////////
void EditorEvents::OnRedoSelected(wxCommandEvent& event)
{
    if ( redoHistory.empty() )
        return;

    history.push_back(redoHistory.back()); //Le dernier élément est la liste d'évènement actuellement éditée
    *events = redoHistory.back();
    redoHistory.pop_back();

    EventsPanel->Refresh();
    EventsPanel->Update();

    scene.wasModified = true;
}

////////////////////////////////////////////////////////////
/// Déplacement de la souris : Changement de curseur si besoin
////////////////////////////////////////////////////////////
void EditorEvents::OnEventsPanelMouseMove(wxMouseEvent& event)
{
    if (    (event.GetX() >= conditionsColumnWidth-2 && event.GetX() <= conditionsColumnWidth+2)
        ||  isResizingColumns)
        SetCursor(wxCURSOR_SIZEWE);
    else
        SetCursor(wxNullCursor);
}

void EditorEvents::OnEventsPanelLeftDown(wxMouseEvent& event)
{
    if ( event.GetX() >= conditionsColumnWidth-2 && event.GetX() <= conditionsColumnWidth+2  )
        isResizingColumns = true;
}

void EditorEvents::DeselectAllEvents(vector < BaseEventSPtr > & eventsToUnselected)
{
    eventsSelected.clear();

    for (unsigned int i = 0;i<eventsToUnselected.size();++i)
    {
        if ( eventsToUnselected[i]->selected )
        {
            eventsToUnselected[i]->selected = false;
            eventsToUnselected[i]->eventRenderingNeedUpdate = true;
        }

    	if ( eventsToUnselected[i]->CanHaveSubEvents() )
            DeselectAllEvents(eventsToUnselected[i]->GetSubEvents());
    }
}

void EditorEvents::DeselectAllActions(vector < BaseEventSPtr > & eventsToUnselected)
{
    eventsSelected.clear();

    for (unsigned int eId = 0;eId<eventsToUnselected.size();++eId)
    {
        vector < vector<Instruction>* > allActionsVectors = eventsToUnselected[eId]->GetAllActionsVectors();
        for (unsigned int i = 0;i<allActionsVectors.size();++i)
        {
            for (unsigned int j = 0;j<allActionsVectors[i]->size();++j)
            {
                if ( allActionsVectors[i]->at(j).selected )
                {
                    allActionsVectors[i]->at(j).selected = false;
                    eventsToUnselected[eId]->eventRenderingNeedUpdate = true;
                }

            }
        }

    	if ( eventsToUnselected[eId]->CanHaveSubEvents() )
            DeselectAllActions(eventsToUnselected[eId]->GetSubEvents());
    }
}

void EditorEvents::DeselectAllConditions(vector < BaseEventSPtr > & eventsToUnselected)
{
    eventsSelected.clear();

    for (unsigned int eId = 0;eId<eventsToUnselected.size();++eId)
    {
        vector < vector<Instruction>* > allConditionsVector = eventsToUnselected[eId]->GetAllConditionsVectors();
        for (unsigned int i = 0;i<allConditionsVector.size();++i)
        {
            for (unsigned int j = 0;j<allConditionsVector[i]->size();++j)
            {
                if ( allConditionsVector[i]->at(j).selected )
                {
                    allConditionsVector[i]->at(j).selected = false;
                    eventsToUnselected[eId]->eventRenderingNeedUpdate = true;
                }
            }
        }

    	if ( eventsToUnselected[eId]->CanHaveSubEvents() )
            DeselectAllConditions(eventsToUnselected[eId]->GetSubEvents());
    }
}


////////////////////////////////////////////////////////////
/// Tests unitaires
////////////////////////////////////////////////////////////
TEST( Dialogues, EditorEvents )
{
    Game game;
    MainEditorCommand nrC;
    Scene scene;

    wxLogNull noLog;

    //On vérifie que rien ne plante
    EditorEvents editor(NULL, game, scene, &scene.events, nrC);

    wxCommandEvent unusedEvent;
    editor.OnDelEventSelected(unusedEvent);
    editor.OnDelConditionsSelected(unusedEvent);
    editor.OnDelActionsSelected(unusedEvent);

    editor.OnCutSelected(unusedEvent);
    editor.OnMenuCopySelected(unusedEvent);
    //editor.OnMenuItem7Selected(unusedEvent);
    //editor.OnAddLienSelected(unusedEvent);
    editor.OnInsertEventSelected(unusedEvent);
    editor.OnSubEventMenuItemSelected(unusedEvent);
    //editor.OnAddLienSelected(unusedEvent);
    editor.OnMenuPasteAfterSelected(unusedEvent);
    editor.OnMenuPasteSelected(unusedEvent);
    editor.OnPasteAsASubEventSelected(unusedEvent);
    editor.OnDelSubEventsSelected(unusedEvent);

}

////////////////////////////////////////////////////////////
/// Raccourcis clavier, renvoyant aux fonctions déjà existantes
////////////////////////////////////////////////////////////
void EditorEvents::OnEventsPanelKeyUp(wxKeyEvent& event)
{
    ctrlPressed = event.GetModifiers() == wxMOD_CMD ? true : false;

    if ( event.GetKeyCode() == WXK_DELETE )
    {
        wxCommandEvent unusedEvent;
        OnDelEventSelected( unusedEvent );
    }
    if ( event.GetKeyCode() == WXK_INSERT )
    {
        wxCommandEvent unusedEvent;
        OnInsertEventSelected( unusedEvent );
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
                OnMenuPasteAfterSelected( unusedEvent );
                break;
            }
            case 88: //Ctrl-X
            {
                wxCommandEvent unusedEvent;
                OnCutSelected( unusedEvent );
                break;
            }
            case 89: //Ctrl-Y
            {
                wxCommandEvent unusedEvent;
                OnRedoSelected( unusedEvent );
                break;
            }
            case 90: //Ctrl-Z
            {
                wxCommandEvent unusedEvent;
                OnUndoSelected( unusedEvent );
                break;
            }
            default:
                break;
        }
    }
    else if ( event.GetModifiers() == (wxMOD_CMD|wxMOD_SHIFT) )
    {

        switch ( event.GetKeyCode() )
        {
            case 86: //Ctrl-V
            {
                wxCommandEvent unusedEvent;
                OnPasteAsASubEventSelected( unusedEvent );
                break;
            }
            default:
                break;
        }
    }
}

/**
 * Display ribbon and connect events when get focus
 */
void EditorEvents::OnEventsPanelSetFocus(wxFocusEvent& event)
{
    mainEditorCommand.GetRibbon()->SetActivePage(4);
    ConnectEvents();
}

//TODO : Selection de plusieurs events
