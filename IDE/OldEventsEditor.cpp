/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#include "CppUnitLite/TestHarness.h"
#include "OldEventsEditor.h"

//(*InternalHeaders(OldEventsEditor)
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
#include "GDL/CommonTools.h"
#include "GDL/BaseProfiler.h"
#include "GDL/HelpFileAccess.h"
#include "GDL/EventsCodeCompiler.h"
#include "SearchEvents.h"
#ifdef __WXMSW__
#include <wx/msw/winundef.h>
#endif
#include "Clipboard.h"
#include "ChoixTemplateEvent.h"
#include "ProfileDlg.h"
#include "CreateTemplate.h"
#include "Game_Develop_EditorMain.h"
#include <time.h>

#ifdef __WXGTK__
#include <gtk/gtk.h>
#endif

//(*IdInit(OldEventsEditor)
const long OldEventsEditor::ID_PANEL1 = wxNewId();
const long OldEventsEditor::ID_PANEL2 = wxNewId();
const long OldEventsEditor::ID_SCROLLBAR1 = wxNewId();
const long OldEventsEditor::ID_SCROLLBAR2 = wxNewId();
const long OldEventsEditor::idEventInsert = wxNewId();
const long OldEventsEditor::idMenuCom = wxNewId();
const long OldEventsEditor::idMenuSubEvent = wxNewId();
const long OldEventsEditor::ID_MENUITEM1 = wxNewId();
const long OldEventsEditor::idMenuEventDel = wxNewId();
const long OldEventsEditor::ID_MENUITEM15 = wxNewId();
const long OldEventsEditor::idMenuUndo = wxNewId();
const long OldEventsEditor::idMenuRedo = wxNewId();
const long OldEventsEditor::idMenuClearHistory = wxNewId();
const long OldEventsEditor::idMenuCopy = wxNewId();
const long OldEventsEditor::idMenuCut = wxNewId();
const long OldEventsEditor::idMenuPastAvant = wxNewId();
const long OldEventsEditor::idMenuPasteApres = wxNewId();
const long OldEventsEditor::idMenuPasteSubEvent = wxNewId();
const long OldEventsEditor::idMenuPaste = wxNewId();
const long OldEventsEditor::idMenuEdit = wxNewId();
const long OldEventsEditor::idMenuAdd = wxNewId();
const long OldEventsEditor::idMenuDel = wxNewId();
const long OldEventsEditor::ID_MENUITEM2 = wxNewId();
const long OldEventsEditor::ID_MENUITEM17 = wxNewId();
const long OldEventsEditor::ID_MENUITEM21 = wxNewId();
const long OldEventsEditor::ID_MENUITEM3 = wxNewId();
const long OldEventsEditor::idMenuCouper = wxNewId();
const long OldEventsEditor::ID_MENUITEM4 = wxNewId();
const long OldEventsEditor::ID_MENUITEM5 = wxNewId();
const long OldEventsEditor::ID_MENUITEM6 = wxNewId();
const long OldEventsEditor::ID_MENUITEM7 = wxNewId();
const long OldEventsEditor::ID_MENUITEM18 = wxNewId();
const long OldEventsEditor::ID_MENUITEM19 = wxNewId();
const long OldEventsEditor::ID_MENUITEM20 = wxNewId();
const long OldEventsEditor::ID_MENUITEM8 = wxNewId();
const long OldEventsEditor::ID_MENUITEM9 = wxNewId();
const long OldEventsEditor::ID_MENUITEM10 = wxNewId();
const long OldEventsEditor::ID_MENUITEM11 = wxNewId();
const long OldEventsEditor::ID_MENUITEM13 = wxNewId();
const long OldEventsEditor::ID_MENUITEM12 = wxNewId();
const long OldEventsEditor::ID_MENUITEM14 = wxNewId();
//*)
const long OldEventsEditor::ID_TEMPLATEBUTTON = wxNewId();
const long OldEventsEditor::ID_CREATETEMPLATEBUTTON = wxNewId();
const long OldEventsEditor::ID_HELPBUTTON = wxNewId();
const long OldEventsEditor::ID_SEARCHBUTTON = wxNewId();

const long OldEventsEditor::idRibbonEvent = wxNewId();
const long OldEventsEditor::idRibbonCom = wxNewId();
const long OldEventsEditor::idRibbonSubEvent = wxNewId();
const long OldEventsEditor::idRibbonSomeEvent = wxNewId();
const long OldEventsEditor::idRibbonDelEvent = wxNewId();
const long OldEventsEditor::idRibbonUndo = wxNewId();
const long OldEventsEditor::idRibbonRedo = wxNewId();
const long OldEventsEditor::idRibbonCopy = wxNewId();
const long OldEventsEditor::idRibbonCut = wxNewId();
const long OldEventsEditor::idRibbonPaste = wxNewId();
const long OldEventsEditor::idRibbonTemplate = wxNewId();
const long OldEventsEditor::idRibbonCreateTemplate = wxNewId();
const long OldEventsEditor::idRibbonHelp = wxNewId();
const long OldEventsEditor::idRibbonProfiling = wxNewId();
const long OldEventsEditor::idSearchReplace = wxNewId();

vector < std::pair<long, std::string> > OldEventsEditor::idForEventTypesMenu;

BEGIN_EVENT_TABLE( OldEventsEditor, wxPanel )
    //(*EventTable(OldEventsEditor)
    //*)
END_EVENT_TABLE()

BaseEventSPtr OldEventsEditor::badEvent(new BaseEvent);
Instruction OldEventsEditor::badInstruction;

OldEventsEditor::OldEventsEditor( wxWindow* parent, Game & game_, Scene & scene_, vector < BaseEventSPtr > * events_, MainEditorCommand & mainEditorCommand_ ) :
searchDialog(NULL),
profilingActivated(false),
game(game_),
scene(scene_),
events(events_),
sceneCanvas(NULL),
mainEditorCommand(mainEditorCommand_),
conditionsColumnWidth(350),
ctrlPressed(false),
isResizingColumns(false)
{
    //(*Initialize(OldEventsEditor)
    wxMenuItem* MenuItem26;
    wxFlexGridSizer* FlexGridSizer3;
    wxMenuItem* MenuItem11;
    wxMenuItem* MenuItem29;
    wxMenuItem* MenuItem27;
    wxMenuItem* MenuItem20;
    wxMenuItem* MenuItem28;
    wxMenuItem* MenuItem23;
    wxMenuItem* editMenuItem;
    wxMenu* MenuItem5;
    wxMenuItem* MenuItem9;
    wxMenuItem* MenuItem19;

    Create(parent, wxID_ANY, wxDefaultPosition, wxSize(536,252), 0, _T("wxID_ANY"));
    FlexGridSizer3 = new wxFlexGridSizer(0, 2, 0, 0);
    FlexGridSizer3->AddGrowableCol(0);
    FlexGridSizer3->AddGrowableRow(0);
    EventsPanel = new wxPanel(this, ID_PANEL2, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL2"));
    contextPanel = new wxPanel(EventsPanel, ID_PANEL1, wxPoint(56,72), wxSize(24,40), wxSIMPLE_BORDER|wxTAB_TRAVERSAL, _T("ID_PANEL1"));
    contextPanel->SetBackgroundColour(wxColour(255,255,255));
    FlexGridSizer3->Add(EventsPanel, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    ScrollBar1 = new wxScrollBar(this, ID_SCROLLBAR1, wxDefaultPosition, wxSize(18,130), wxSB_VERTICAL, wxDefaultValidator, _T("ID_SCROLLBAR1"));
    ScrollBar1->SetScrollbar(0, 1, 1000, 1);
    FlexGridSizer3->Add(ScrollBar1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    horizontalScrollbar = new wxScrollBar(this, ID_SCROLLBAR2, wxDefaultPosition, wxDefaultSize, wxSB_HORIZONTAL, wxDefaultValidator, _T("ID_SCROLLBAR2"));
    horizontalScrollbar->SetScrollbar(0, 1, 10, 1);
    horizontalScrollbar->Hide();
    FlexGridSizer3->Add(horizontalScrollbar, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    SetSizer(FlexGridSizer3);
    MenuItem8 = new wxMenuItem((&ContextMenu), idEventInsert, _("Insérer un évènement\tINSERT"), wxEmptyString, wxITEM_NORMAL);
    MenuItem8->SetBitmap(wxBitmap(wxImage(_T("res/eventaddicon.png"))));
    ContextMenu.Append(MenuItem8);
    MenuItem7 = new wxMenuItem((&ContextMenu), idMenuCom, _("Insérer un commentaire"), wxEmptyString, wxITEM_NORMAL);
    MenuItem7->SetBitmap(wxBitmap(wxImage(_T("res/commentaireaddicon.png"))));
    ContextMenu.Append(MenuItem7);
    eventTypesMenu = new wxMenu();
    SubEventMenuItem = new wxMenuItem(eventTypesMenu, idMenuSubEvent, _("Un sous évènement\tShift-INSERT"), wxEmptyString, wxITEM_NORMAL);
    SubEventMenuItem->SetBitmap(wxBitmap(wxImage(_T("res/subeventaddicon.png"))));
    eventTypesMenu->Append(SubEventMenuItem);
    eventTypesMenu->AppendSeparator();
    ContextMenu.Append(ID_MENUITEM1, _("Insérer..."), eventTypesMenu, wxEmptyString);
    ContextMenu.AppendSeparator();
    MenuItem1 = new wxMenuItem((&ContextMenu), idMenuEventDel, _("Supprimer cet évènement\tDEL"), _("Supprimer l\'évènement complet ( Action et Condition ) de la scène"), wxITEM_NORMAL);
    MenuItem1->SetBitmap(wxBitmap(wxImage(_T("res/deleteicon.png"))));
    ContextMenu.Append(MenuItem1);
    MenuItem9 = new wxMenuItem((&ContextMenu), ID_MENUITEM15, _("Dés/activer l\'évènement"), wxEmptyString, wxITEM_NORMAL);
    ContextMenu.Append(MenuItem9);
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
    MenuItem20 = new wxMenuItem((&conditionsMenu), idMenuDel, _("Supprimer la condition\tDEL"), wxEmptyString, wxITEM_NORMAL);
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
    MenuItem26 = new wxMenuItem((&actionsMenu), ID_MENUITEM7, _("Supprimer cette action\tDEL"), wxEmptyString, wxITEM_NORMAL);
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
    FlexGridSizer3->SetSizeHints(this);

    EventsPanel->Connect(wxEVT_PAINT,(wxObjectEventFunction)&OldEventsEditor::OnEventsPanelPaint,0,this);
    EventsPanel->Connect(wxEVT_KEY_UP,(wxObjectEventFunction)&OldEventsEditor::OnEventsPanelKeyUp,0,this);
    EventsPanel->Connect(wxEVT_SET_FOCUS,(wxObjectEventFunction)&OldEventsEditor::OnEventsPanelSetFocus,0,this);
    EventsPanel->Connect(wxEVT_LEFT_DOWN,(wxObjectEventFunction)&OldEventsEditor::OnEventsPanelLeftDown,0,this);
    EventsPanel->Connect(wxEVT_LEFT_UP,(wxObjectEventFunction)&OldEventsEditor::OnEventsPanelLeftUp,0,this);
    EventsPanel->Connect(wxEVT_LEFT_DCLICK,(wxObjectEventFunction)&OldEventsEditor::OnEventsPanelLeftDClick,0,this);
    EventsPanel->Connect(wxEVT_RIGHT_UP,(wxObjectEventFunction)&OldEventsEditor::OnEventsPanelRightUp,0,this);
    EventsPanel->Connect(wxEVT_MOTION,(wxObjectEventFunction)&OldEventsEditor::OnEventsPanelMouseMove,0,this);
    EventsPanel->Connect(wxEVT_MOUSEWHEEL,(wxObjectEventFunction)&OldEventsEditor::OnEventsPanelMouseWheel,0,this);
    EventsPanel->Connect(wxEVT_SIZE,(wxObjectEventFunction)&OldEventsEditor::OnEventsPanelResize,0,this);
    Connect(ID_SCROLLBAR1,wxEVT_SCROLL_TOP|wxEVT_SCROLL_BOTTOM|wxEVT_SCROLL_LINEUP|wxEVT_SCROLL_LINEDOWN|wxEVT_SCROLL_PAGEUP|wxEVT_SCROLL_PAGEDOWN|wxEVT_SCROLL_THUMBTRACK|wxEVT_SCROLL_THUMBRELEASE|wxEVT_SCROLL_CHANGED,(wxObjectEventFunction)&OldEventsEditor::OnScrollBar1ScrollChanged);
    Connect(ID_SCROLLBAR1,wxEVT_SCROLL_LINEUP,(wxObjectEventFunction)&OldEventsEditor::OnScrollBar1ScrollChanged);
    Connect(ID_SCROLLBAR1,wxEVT_SCROLL_LINEDOWN,(wxObjectEventFunction)&OldEventsEditor::OnScrollBar1ScrollChanged);
    Connect(ID_SCROLLBAR1,wxEVT_SCROLL_THUMBTRACK,(wxObjectEventFunction)&OldEventsEditor::OnScrollBar1ScrollChanged);
    Connect(ID_SCROLLBAR1,wxEVT_SCROLL_CHANGED,(wxObjectEventFunction)&OldEventsEditor::OnScrollBar1ScrollChanged);
    Connect(ID_SCROLLBAR2,wxEVT_SCROLL_TOP|wxEVT_SCROLL_BOTTOM|wxEVT_SCROLL_LINEUP|wxEVT_SCROLL_LINEDOWN|wxEVT_SCROLL_PAGEUP|wxEVT_SCROLL_PAGEDOWN|wxEVT_SCROLL_THUMBTRACK|wxEVT_SCROLL_THUMBRELEASE|wxEVT_SCROLL_CHANGED,(wxObjectEventFunction)&OldEventsEditor::OnhorizontalScrollbarScroll);
    Connect(ID_SCROLLBAR2,wxEVT_SCROLL_CHANGED,(wxObjectEventFunction)&OldEventsEditor::OnhorizontalScrollbarScroll);
    Connect(idEventInsert,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&OldEventsEditor::OnInsertEventSelected);
    Connect(idMenuCom,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&OldEventsEditor::OnMenuItem7Selected);
    Connect(idMenuSubEvent,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&OldEventsEditor::OnSubEventMenuItemSelected);
    Connect(idMenuEventDel,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&OldEventsEditor::OnDelEventSelected);
    Connect(ID_MENUITEM15,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&OldEventsEditor::OnToggleEventSelected);
    Connect(idMenuUndo,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&OldEventsEditor::OnUndoSelected);
    Connect(idMenuRedo,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&OldEventsEditor::OnRedoSelected);
    Connect(idMenuClearHistory,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&OldEventsEditor::OnClearHistorySelected);
    Connect(idMenuCopy,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&OldEventsEditor::OnMenuCopySelected);
    Connect(idMenuCut,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&OldEventsEditor::OnCutSelected);
    Connect(idMenuPastAvant,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&OldEventsEditor::OnMenuPasteSelected);
    Connect(idMenuPasteApres,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&OldEventsEditor::OnMenuPasteAfterSelected);
    Connect(idMenuPasteSubEvent,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&OldEventsEditor::OnPasteAsASubEventSelected);
    Connect(idMenuEdit,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&OldEventsEditor::OneEditConditionMenuSelected);
    Connect(idMenuAdd,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&OldEventsEditor::OnAddConditionMenuSelected);
    Connect(idMenuDel,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&OldEventsEditor::OnDelConditionMenuSelected);
    Connect(ID_MENUITEM2,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&OldEventsEditor::OnDelConditionsSelected);
    Connect(ID_MENUITEM17,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&OldEventsEditor::OnDelSubEventsSelected);
    Connect(ID_MENUITEM3,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&OldEventsEditor::OnCopyConditionMenuSelected);
    Connect(idMenuCouper,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&OldEventsEditor::OnCutConditionMenuSelected);
    Connect(ID_MENUITEM4,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&OldEventsEditor::OnPasteConditionMenuSelected);
    Connect(ID_MENUITEM5,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&OldEventsEditor::OnEditActionMenuSelected);
    Connect(ID_MENUITEM6,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&OldEventsEditor::OnAddActionMenuSelected);
    Connect(ID_MENUITEM7,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&OldEventsEditor::OnDelActionMenuSelected);
    Connect(ID_MENUITEM18,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&OldEventsEditor::OnDelActionsSelected);
    Connect(ID_MENUITEM19,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&OldEventsEditor::OnDelSubEventsSelected);
    Connect(ID_MENUITEM8,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&OldEventsEditor::OnCopyActionMenuSelected);
    Connect(ID_MENUITEM9,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&OldEventsEditor::OnCutActionMenuSelected);
    Connect(ID_MENUITEM10,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&OldEventsEditor::OnPasteActionMenuSelected);
    Connect(ID_MENUITEM11,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&OldEventsEditor::OnAddConditionMenuSelected);
    Connect(ID_MENUITEM13,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&OldEventsEditor::OnPasteConditionMenuSelected);
    Connect(ID_MENUITEM12,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&OldEventsEditor::OnAddActionMenuSelected);
    Connect(ID_MENUITEM14,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&OldEventsEditor::OnPasteActionMenuSelected);
    Connect(wxEVT_KEY_UP,(wxObjectEventFunction)&OldEventsEditor::OnEventsPanelKeyUp);
    Connect(wxEVT_MOUSEWHEEL,(wxObjectEventFunction)&OldEventsEditor::OnEventsPanelMouseWheel);
    //*)
    Connect( ID_TEMPLATEBUTTON, wxEVT_COMMAND_TOOL_CLICKED, ( wxObjectEventFunction )&OldEventsEditor::OnTemplateBtClick );
    Connect( ID_CREATETEMPLATEBUTTON, wxEVT_COMMAND_TOOL_CLICKED, ( wxObjectEventFunction )&OldEventsEditor::OnCreateTemplateBtClick );
    Connect( ID_SEARCHBUTTON, wxEVT_COMMAND_TOOL_CLICKED, ( wxObjectEventFunction )&OldEventsEditor::OnSearchBtClick );
    Connect( ID_HELPBUTTON, wxEVT_COMMAND_TOOL_CLICKED, ( wxObjectEventFunction )&OldEventsEditor::OnAideBtClick );

    //Adding events types
    GDpriv::ExtensionsManager * extensionManager = GDpriv::ExtensionsManager::GetInstance();
    const vector < boost::shared_ptr<ExtensionBase> > extensions = extensionManager->GetExtensions();

    //Insert extension objects actions
	for (unsigned int i = 0;i<extensions.size();++i)
	{
	    //Verify if that extension is enabled
	    if ( find(game.extensionsUsed.begin(),
                  game.extensionsUsed.end(),
                  extensions[i]->GetName()) == game.extensionsUsed.end() )
            continue;

        //Add each event type provided
	    std::map<std::string, EventInfos > allEventsProvidedByExtension = extensions[i]->GetAllEvents();
        for(std::map<string, EventInfos>::const_iterator it = allEventsProvidedByExtension.begin(); it != allEventsProvidedByExtension.end(); ++it)
        {
            //Find an identifier for the menu item
            long id = wxID_ANY;
            for (vector < std::pair<long, std::string> >::iterator idIter = idForEventTypesMenu.begin();
                 idIter != idForEventTypesMenu.end();
                 ++idIter)
            {
            	if ( idIter->second == it->first )
                    id = idIter->first;
            }
            if ( id == wxID_ANY )
            {
                id = wxNewId();
                idForEventTypesMenu.push_back(std::make_pair(id, it->first));
            }

            wxMenuItem * menuItem = new wxMenuItem(eventTypesMenu, id, it->second.fullname, it->second.description);
            menuItem->SetBitmap(it->second.smallicon);
            eventTypesMenu->Append(menuItem);
            Connect(id,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&OldEventsEditor::OnInsertSomeEventSelected);
            mainEditorCommand.GetMainEditor()->Connect(id, wxEVT_COMMAND_MENU_SELECTED, (wxObjectEventFunction)&OldEventsEditor::OnInsertSomeEventSelected, NULL, this);
        }
	}

    searchDialog = new SearchEvents(this, game, scene, events);

    /*for (unsigned int i = 0;i<4000;++i)
    {
        wxPanel * newPanel = new wxPanel(this, ID_PANEL2, wxPoint(5,((double)i)/100), wxSize(400,100), wxTAB_TRAVERSAL, _T("ID_PANEL2"));
        if ( i > 100 ) newPanel->Show(false);
    }*/
}

/**
 * Static method for creating ribbon for events editors.
 */
void OldEventsEditor::CreateRibbonPage(wxRibbonPage * page)
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
        ribbonBar->AddDropdownButton(idRibbonSomeEvent, !hideLabels ? _("Ajouter...") : "", wxBitmap("res/add24.png", wxBITMAP_TYPE_ANY));
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
        wxRibbonPanel *ribbonPanel = new wxRibbonPanel(page, wxID_ANY, _("Recherche"), wxBitmap("res/search24.png", wxBITMAP_TYPE_ANY), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        wxRibbonButtonBar *ribbonBar = new wxRibbonButtonBar(ribbonPanel, wxID_ANY);
        ribbonBar->AddButton(idSearchReplace, !hideLabels ? _("Chercher / Remplacer") : "", wxBitmap("res/search24.png", wxBITMAP_TYPE_ANY));
    }
    {
        wxRibbonPanel *ribbonPanel = new wxRibbonPanel(page, wxID_ANY, _("Outils"), wxBitmap("res/profiler24.png", wxBITMAP_TYPE_ANY), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        wxRibbonButtonBar *ribbonBar = new wxRibbonButtonBar(ribbonPanel, wxID_ANY);
        ribbonBar->AddButton(idRibbonProfiling, !hideLabels ? _("Afficher les performances") : "", wxBitmap("res/profiler24.png", wxBITMAP_TYPE_ANY));
    }
    {
        wxRibbonPanel *ribbonPanel = new wxRibbonPanel(page, wxID_ANY, _("Aide"), wxBitmap("res/helpicon24.png", wxBITMAP_TYPE_ANY), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        wxRibbonButtonBar *ribbonBar = new wxRibbonButtonBar(ribbonPanel, wxID_ANY);
        ribbonBar->AddButton(idRibbonHelp, !hideLabels ? _("Aide") : "", wxBitmap("res/helpicon24.png", wxBITMAP_TYPE_ANY));
    }
}

void OldEventsEditor::ConnectEvents()
{
    mainEditorCommand.GetMainEditor()->Connect(idRibbonEvent, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&OldEventsEditor::OnInsertEventSelected, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonCom, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&OldEventsEditor::OnMenuItem7Selected, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonSomeEvent, wxEVT_COMMAND_RIBBONBUTTON_DROPDOWN_CLICKED, (wxObjectEventFunction)&OldEventsEditor::OnAddSomeEventSelected, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonSubEvent, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&OldEventsEditor::OnSubEventMenuItemSelected, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonDelEvent, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&OldEventsEditor::OnDelEventSelected, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonUndo, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&OldEventsEditor::OnUndoSelected, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonRedo, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&OldEventsEditor::OnRedoSelected, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonCopy, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&OldEventsEditor::OnMenuCopySelected, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonCut, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&OldEventsEditor::OnCutSelected, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonPaste, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&OldEventsEditor::OnMenuPasteSelected, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonTemplate, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&OldEventsEditor::OnTemplateBtClick, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonCreateTemplate, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&OldEventsEditor::OnCreateTemplateBtClick, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idSearchReplace, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&OldEventsEditor::OnSearchBtClick, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonProfiling, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&OldEventsEditor::OnProfilingBtClick, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonHelp, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&OldEventsEditor::OnAideBtClick, NULL, this);
}

OldEventsEditor::~OldEventsEditor()
{
    delete searchDialog;

    //Be careful to remove ( not delete ) the common sub menu, so as to prevent its multiple deletion.
    if ( actionsMenu.FindItem(_("Evènement")) != wxNOT_FOUND ) actionsMenu.Remove(actionsMenu.FindItem(_("Evènement")));
    if ( conditionsMenu.FindItem(_("Evènement")) != wxNOT_FOUND ) conditionsMenu.Remove(conditionsMenu.FindItem(_("Evènement")));
    if ( noActionsMenu.FindItem(_("Evènement")) != wxNOT_FOUND ) noActionsMenu.Remove(noActionsMenu.FindItem(_("Evènement")));
    if ( noConditionsMenu.FindItem(_("Evènement")) != wxNOT_FOUND ) noConditionsMenu.Remove(noConditionsMenu.FindItem(_("Evènement")));
    //(*Destroy(OldEventsEditor)
    //*)
}

void OldEventsEditor::ForceRefresh()
{
    EventsPanel->Refresh();
    EventsPanel->Update();
}

////////////////////////////////////////////////////////////
/// Rafraichissement à chaque changement de la scrollbar
////////////////////////////////////////////////////////////
void OldEventsEditor::OnScrollBar1ScrollChanged( wxScrollEvent& event )
{
    ForceRefresh();
}
void OldEventsEditor::OnhorizontalScrollbarScroll(wxScrollEvent& event)
{
    ForceRefresh();
}

////////////////////////////////////////////////////////////
/// Rafraichissement en cas de changement de taille
////////////////////////////////////////////////////////////
void OldEventsEditor::OnEventsPanelResize( wxSizeEvent& event )
{
    sf::Clock eventsNeedUpdate;
    SetEventsNeedUpdate(*events);
    cout << "eventsNeedUpdate" << eventsNeedUpdate.GetElapsedTime() << endl;

    sf::Clock refresh;
    ForceRefresh();
    cout << "refresh" << refresh.GetElapsedTime() << endl;
}

/**
 * Mark all events as must be redraw
 */
void OldEventsEditor::SetEventsNeedUpdate(vector < BaseEventSPtr > & eventsToRefresh)
{
    vector<BaseEventSPtr>::iterator e = eventsToRefresh.begin();
    vector<BaseEventSPtr>::const_iterator end = eventsToRefresh.end();

    for(;e != end;++e)
    {
        (*e)->eventHeightNeedUpdate = true;

        if ( (*e)->CanHaveSubEvents() )
            SetEventsNeedUpdate((*e)->GetSubEvents());
    }
}

////////////////////////////////////////////////////////////
/// Appelé à chaque changements dans les évènements
////////////////////////////////////////////////////////////
void OldEventsEditor::ChangesMadeOnEvents()
{
    //Mise à jour de l'historique d'annulation
    history.push_back(CloneVectorOfEvents(*events));
    redoHistory.clear();

    scene.wasModified = true;
    scene.eventsModified = true;
    std::cout << "ChanesMadeOnevents\n";
    EventsCodeCompiler::GetInstance()->EventsCompilationNeeded(EventsCodeCompiler::Task(&game, &scene));

    //Rafraichissement
    ForceRefresh();
}

Instruction & OldEventsEditor::GetLastSelectedInstruction()
{
    return GetSelectedInstruction(eventsSelected.size()-1);
}

Instruction & OldEventsEditor::GetSelectedInstruction(unsigned int nb)
{
    if ( nb >= eventsSelected.size() || boost::tuples::get<3>(eventsSelected[nb]) >= boost::tuples::get<2>(eventsSelected[nb])->size())
        return badInstruction;

    return boost::tuples::get<2>(eventsSelected[nb])->at(boost::tuples::get<3>(eventsSelected[nb]));
}

vector < Instruction > * OldEventsEditor::GetLastSelectedListOfInstructions()
{
    return GetSelectedListOfInstructions(eventsSelected.size()-1);
}

vector < Instruction > * OldEventsEditor::GetSelectedListOfInstructions(unsigned int nb)
{
    if ( nb >= eventsSelected.size() )
        return NULL;

    return boost::tuples::get<2>(eventsSelected[nb]);
}

BaseEventSPtr OldEventsEditor::GetLastSelectedEvent()
{
    return GetSelectedEvent(eventsSelected.size()-1);
}

BaseEventSPtr OldEventsEditor::GetSelectedEvent(unsigned int nb)
{
    if ( nb >= eventsSelected.size() || boost::tuples::get<1>(eventsSelected[nb]) >= boost::tuples::get<0>(eventsSelected[nb])->size() )
        return badEvent;

    return boost::tuples::get<0>(eventsSelected[nb])->at(boost::tuples::get<1>(eventsSelected[nb]));
}

vector < BaseEventSPtr > * OldEventsEditor::GetLastSelectedListOfEvents()
{
    return GetSelectedListOfEvents(eventsSelected.size()-1);
}

vector < BaseEventSPtr > * OldEventsEditor::GetSelectedListOfEvents(unsigned int nb)
{
    if ( nb >= eventsSelected.size() )
        return NULL;

    return boost::tuples::get<0>(eventsSelected[nb]);
}

////////////////////////////////////////////////////////////
/// Affichage des évènements de la scène
////////////////////////////////////////////////////////////
void OldEventsEditor::OnEventsPanelPaint( wxPaintEvent& event )
{
    EventsRenderingHelper * eventsRenderingHelper = EventsRenderingHelper::GetInstance();

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
    int initialXposition = 2 + dc.GetTextExtent(ToString(events->size())).GetWidth() + 2 - horizontalScrollbar->GetThumbPosition();
    int maximalWidth = 0;
    if ( profilingActivated ) initialXposition+=62;

    //Setup renderings datas which are constants.
    eventsRenderingHelper->SetConditionsColumnWidth(conditionsColumnWidth);

    instructionsSelected = false;

    //Phase de dessin des évènements
    sf::Clock startDraw;
    DrawEvents(*events, dc, Yposition, initialXposition, maximalWidth, true);
    cout << "Draw ended: " << startDraw.GetElapsedTime() << endl;


    dc.GradientFillLinear(wxRect(contextPanel->GetPosition().x, contextPanel->GetPosition().y+contextPanel->GetSize().y, contextPanel->GetSize().x+1, 3),
                          wxColour(190,190,190), wxColour(230,230,230,0), wxDOWN);

    dc.GradientFillLinear(wxRect(contextPanel->GetPosition().x+contextPanel->GetSize().x, contextPanel->GetPosition().y, 3, contextPanel->GetSize().y+1),
                          wxColour(190,190,190), wxColour(230,230,230,0), wxRIGHT);

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
void OldEventsEditor::DrawEvents(vector < BaseEventSPtr > & list, wxDC & dc, int & Yposition, int initialXposition, int & parentMaximalWidth, bool draw)
{
    EventsRenderingHelper * eventsRenderingHelper = EventsRenderingHelper::GetInstance();

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
            dc.SetTextForeground(wxColour(0,0,0));
            dc.SetFont( eventsRenderingHelper->GetFont() );

            if (profilingActivated && list[i]->IsExecutable())
            {
                dc.DrawText(ToString(i+1), initialXposition-(dc.GetTextExtent(ToString(i+1)).GetWidth()+2)-62, Yposition);

                //Draw profile results
                dc.SetPen(wxPen(wxColour(0,0,0)));
                dc.SetBrush(wxColour(255.0f,255.0f*(1.0f-list[i]->percentDuringLastSession*0.05f),255.0f*(1.0f-list[i]->percentDuringLastSession*0.05f)));
                dc.DrawRectangle(initialXposition-61, Yposition, 61,31);

                std::ostringstream timeStr; timeStr.setf(ios::fixed,ios::floatfield); timeStr.precision(2);
                timeStr << list[i]->totalTimeDuringLastSession/1000.0f;
                dc.DrawText(timeStr.str()+"ms", initialXposition-59, Yposition);

                std::ostringstream percentStr; percentStr.setf(ios::fixed,ios::floatfield); percentStr.precision(2);
                percentStr << list[i]->percentDuringLastSession;
                dc.DrawText(percentStr.str()+"%", initialXposition-59, Yposition+15);
            }
            else
                dc.DrawText(ToString(i+1), initialXposition-(dc.GetTextExtent(ToString(i+1)).GetWidth()+2), Yposition);
        }

        int width = EventsPanel->GetSize().x-initialXposition;
        unsigned int renderedHeight = list[i]->GetRenderedHeight(width < 0 ? 0 : width);

        //Hit test
        if ( MouseY >= Yposition+positionScrollbar &&
             MouseY <= Yposition+positionScrollbar+static_cast<signed>(renderedHeight) &&
             MouseX-initialXposition >= 0 )
        {
            eventsSelected.push_back(boost::make_tuple(&list, i,              //Useful part
                                                       (vector<Instruction>*)NULL, 0)); //Useless
            list[i]->selected = true;
            list[i]->eventHeightNeedUpdate = true;
            list[i]->OnSingleClick(MouseX-initialXposition, MouseY-(Yposition+positionScrollbar), eventsSelected, conditionsSelected, instructionsSelected);

            contextPanel->SetPosition(wxPoint(EventsPanel->GetSize().x-contextPanel->GetSize().x-5, Yposition+renderedHeight));
        }

        //Render
        if ( Yposition + static_cast<signed>(renderedHeight) + positionScrollbar >= positionScrollbar &&
             Yposition + positionScrollbar < ( positionScrollbar + EventsPanel->GetSize().y ) &&
             draw)
        {
            list[i]->Render(dc, initialXposition, Yposition, width < 0 ? 0 : width );
        }

        //Be sure there is enough place for profiling results
        if ( profilingActivated && renderedHeight < 35 )
            renderedHeight = 35;

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

void OldEventsEditor::ScrollToEvent(BaseEventSPtr eventToScrollTo)
{
    wxClientDC dc( EventsPanel );
    dc.SetFont( wxFont( 8, wxDEFAULT, wxNORMAL, wxNORMAL ) );

    int YPosition = 0;
    int initialXposition = 2 + dc.GetTextExtent(ToString(events->size())).GetWidth() + 2 - horizontalScrollbar->GetThumbPosition();

    if ( ScrollToEvent(*events, eventToScrollTo, YPosition, initialXposition) )
        ForceRefresh();
}

bool OldEventsEditor::ScrollToEvent(vector < BaseEventSPtr > & list, BaseEventSPtr eventToScrollTo, int & YPosition, int initialXposition)
{
    const int separation = 3;

    for ( unsigned int i = 0;i < list.size();++i )
    {
        //If event is found, scroll and select it
        if ( list[i] == eventToScrollTo )
        {
            DeselectAllEvents(*events);
            DeselectAllActions(*events);
            DeselectAllConditions(*events);

            eventsSelected.push_back(boost::make_tuple(&list, i,              //Useful part
                                                       (vector<Instruction>*)NULL, 0)); //Useless
            list[i]->selected = true;
            list[i]->eventHeightNeedUpdate = true;

            ScrollBar1->SetThumbPosition(YPosition);

            return true;
        }

        EventsRenderingHelper::GetInstance()->SetConditionsColumnWidth(conditionsColumnWidth-initialXposition);

        int width = EventsPanel->GetSize().x-initialXposition;
        unsigned int renderedHeight = list[i]->GetRenderedHeight(width < 0 ? 0 : width);

        YPosition += renderedHeight;

        //Sub events
        if ( list[i]->CanHaveSubEvents() )
        {
            YPosition += separation;
            if ( ScrollToEvent(list[i]->GetSubEvents(), eventToScrollTo, YPosition, initialXposition+32) ) return true;
        }

        YPosition += separation;
    }

    return false;
}

////////////////////////////////////////////////////////////
/// Suppression de l'évènement entier
////////////////////////////////////////////////////////////
void OldEventsEditor::OnDelEventSelected( wxCommandEvent& event )
{
    for (unsigned int i = 0;i<eventsSelected.size();++i)
    {
        unsigned int indexInList = boost::tuples::get<1>(eventsSelected[i]);
        if ( indexInList < GetSelectedListOfEvents(i)->size() )
            GetSelectedListOfEvents(i)->erase(GetSelectedListOfEvents(i)->begin() + indexInList);
    }

    eventsSelected.clear();

    ChangesMadeOnEvents();
}

////////////////////////////////////////////////////////////
/// Suppression des conditions
////////////////////////////////////////////////////////////
void OldEventsEditor::OnDelConditionsSelected( wxCommandEvent& event )
{
    if ( !instructionsSelected || !conditionsSelected) return;

    for (unsigned int i = 0;i<eventsSelected.size();++i)
    	GetSelectedListOfInstructions(i)->clear();

    ChangesMadeOnEvents();
}

////////////////////////////////////////////////////////////
/// Suppression des actions
////////////////////////////////////////////////////////////
void OldEventsEditor::OnDelActionsSelected( wxCommandEvent& event )
{
    if ( !instructionsSelected || conditionsSelected) return;

    for (unsigned int i = 0;i<eventsSelected.size();++i)
    	GetSelectedListOfInstructions(i)->clear();

    ChangesMadeOnEvents();
}

////////////////////////////////////////////////////////////
/// Ouvrir la fenêtre des modèles d'évènements
////////////////////////////////////////////////////////////
void OldEventsEditor::OnTemplateBtClick( wxCommandEvent& event )
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

/**
 * Click on "Add..." in ribbon
 */
void OldEventsEditor::OnAddSomeEventSelected(wxRibbonButtonBarEvent& evt)
{
    evt.PopupMenu(eventTypesMenu);
}

/**
 * Add a custom event by clicking on it in the event type menu
 */
void OldEventsEditor::OnInsertSomeEventSelected( wxCommandEvent& event )
{
    //Retrieve event type
    string eventType;
    for (unsigned int i = 0;i<idForEventTypesMenu.size();++i)
    {
    	if ( idForEventTypesMenu[i].first == event.GetId() )
            eventType = idForEventTypesMenu[i].second;
    }

    if ( eventsSelected.empty() )
        eventsSelected.push_back(boost::tuples::make_tuple(events, events->size(), (vector <Instruction>*)NULL, 0));

    GDpriv::ExtensionsManager * extensionsManager = GDpriv::ExtensionsManager::GetInstance();

    if ( !extensionsManager->HasEventType(eventType) ) return;
    BaseEventSPtr eventToAdd = extensionsManager->CreateEvent(eventType);
    eventToAdd->EditEvent(this, game, scene, mainEditorCommand);

    //Adding event
    if ( boost::tuples::get<1>(eventsSelected[0]) < GetLastSelectedListOfEvents()->size() )
        GetLastSelectedListOfEvents()->insert( GetLastSelectedListOfEvents()->begin() + boost::tuples::get<1>(eventsSelected[0]), eventToAdd );
    else
        GetLastSelectedListOfEvents()->push_back( eventToAdd );

    ChangesMadeOnEvents();

}

////////////////////////////////////////////////////////////
/// Insertion d'un commentaire
////////////////////////////////////////////////////////////
void OldEventsEditor::OnMenuItem7Selected( wxCommandEvent& event )
{
    if ( eventsSelected.empty() )
        eventsSelected.push_back(boost::tuples::make_tuple(events, events->size(), (vector <Instruction>*)NULL, 0));

    GDpriv::ExtensionsManager * extensionsManager = GDpriv::ExtensionsManager::GetInstance();

    BaseEventSPtr eventToAdd = extensionsManager->CreateEvent("BuiltinCommonInstructions::Comment");

    if ( eventToAdd != boost::shared_ptr<BaseEvent>() )
    {
        eventToAdd->EditEvent(this, game, scene, mainEditorCommand);

        //Adding event
        if ( boost::tuples::get<1>(eventsSelected[0]) < GetLastSelectedListOfEvents()->size() )
            GetLastSelectedListOfEvents()->insert( GetLastSelectedListOfEvents()->begin() + boost::tuples::get<1>(eventsSelected[0]), eventToAdd );
        else
            GetLastSelectedListOfEvents()->push_back( eventToAdd );

        ChangesMadeOnEvents();
    }
    else
        wxLogError(_("Impossible de créer un évènement commentaire standard."));
}


////////////////////////////////////////////////////////////
/// Insertion d'un évènement
////////////////////////////////////////////////////////////
void OldEventsEditor::OnInsertEventSelected( wxCommandEvent& event )
{
    if ( eventsSelected.empty() )
        eventsSelected.push_back(boost::tuples::make_tuple(events, events->size(), (vector <Instruction>*)NULL, 0));

    GDpriv::ExtensionsManager * extensionsManager = GDpriv::ExtensionsManager::GetInstance();

    BaseEventSPtr eventToAdd = extensionsManager->CreateEvent("BuiltinCommonInstructions::Standard");
    if ( eventToAdd != boost::shared_ptr<BaseEvent>() )
    {
        eventToAdd->EditEvent(this, game, scene, mainEditorCommand);

        //Adding event
        if ( boost::tuples::get<1>(eventsSelected[0]) < GetLastSelectedListOfEvents()->size() )
            GetLastSelectedListOfEvents()->insert( GetLastSelectedListOfEvents()->begin() + boost::tuples::get<1>(eventsSelected[0]), eventToAdd );
        else
            GetLastSelectedListOfEvents()->push_back( eventToAdd );

        ChangesMadeOnEvents();
    }
    else
        wxLogError(_("Impossible de créer un évènement standard"));
}


////////////////////////////////////////////////////////////
/// Insertion d'un sous évènement
////////////////////////////////////////////////////////////
void OldEventsEditor::OnSubEventMenuItemSelected(wxCommandEvent& event)
{
    if ( eventsSelected.empty() )
    {
        wxLogStatus(_("Aucun endroit où insérer le sous évènement"));
        return;
    }
    if ( !GetLastSelectedEvent()->CanHaveSubEvents() ) return;

    //Creating the event
    GDpriv::ExtensionsManager * extensionsManager = GDpriv::ExtensionsManager::GetInstance();
    BaseEventSPtr eventToAdd = extensionsManager->CreateEvent("BuiltinCommonInstructions::Standard");
    if ( eventToAdd != boost::shared_ptr<BaseEvent>() )
    {
        GetLastSelectedEvent()->GetSubEvents().push_back(eventToAdd);

        ChangesMadeOnEvents();
    }
    else
        wxLogError(_("Impossible de créer un évènement standard"));
}


////////////////////////////////////////////////////////////
/// Insertion d'un lien
////////////////////////////////////////////////////////////
void OldEventsEditor::OnAddLienSelected( wxCommandEvent& event )
{
    if ( eventsSelected.empty() )
        eventsSelected.push_back(boost::tuples::make_tuple(events, events->size(), (vector <Instruction>*)NULL, 0));

    //Creating the event
    GDpriv::ExtensionsManager * extensionsManager = GDpriv::ExtensionsManager::GetInstance();
    BaseEventSPtr eventToAdd = extensionsManager->CreateEvent("BuiltinCommonInstructions::Link");

    if ( eventToAdd != boost::shared_ptr<BaseEvent>() )
    {
        eventToAdd->EditEvent(this, game, scene, mainEditorCommand);

        //Adding event
        if ( boost::tuples::get<1>(eventsSelected[0]) < GetLastSelectedListOfEvents()->size() )
            GetLastSelectedListOfEvents()->insert( GetLastSelectedListOfEvents()->begin() + boost::tuples::get<1>(eventsSelected[0]), eventToAdd );
        else
            GetLastSelectedListOfEvents()->push_back( eventToAdd );

        ChangesMadeOnEvents();
    }
    else
        wxLogError(_("Impossible de créer un évènement lien standard"));
}


////////////////////////////////////////////////////////////
/// Copier un évènement
////////////////////////////////////////////////////////////
void OldEventsEditor::OnMenuCopySelected( wxCommandEvent& event )
{
    if ( eventsSelected.empty() ) return;

    Clipboard * clipboard = Clipboard::GetInstance();
    clipboard->SetEvent( GetLastSelectedEvent() );
}

////////////////////////////////////////////////////////////
/// Couper un évènement
////////////////////////////////////////////////////////////
void OldEventsEditor::OnCutSelected( wxCommandEvent& event )
{
    if ( eventsSelected.empty() ) return;

    Clipboard * clipboard = Clipboard::GetInstance();
    clipboard->SetEvent( GetLastSelectedEvent() );

    GetLastSelectedListOfEvents()->erase( GetLastSelectedListOfEvents()->begin() + boost::tuples::get<1>(eventsSelected[0]) );
    eventsSelected.clear();

    ChangesMadeOnEvents();
}

////////////////////////////////////////////////////////////
/// Coller un évènement avant l'évènement choisi
////////////////////////////////////////////////////////////
void OldEventsEditor::OnMenuPasteSelected( wxCommandEvent& event )
{
    if ( eventsSelected.empty() )
        eventsSelected.push_back(boost::tuples::make_tuple(events, events->size(), (vector <Instruction>*)NULL, 0));

    Clipboard * clipboard = Clipboard::GetInstance();
    if ( !clipboard->HasEvent() ) return;

    if ( boost::tuples::get<1>(eventsSelected[0]) < GetLastSelectedListOfEvents()->size() )
        GetLastSelectedListOfEvents()->insert( GetLastSelectedListOfEvents()->begin() + boost::tuples::get<1>(eventsSelected[0]), clipboard->GetEvent() );
    else
        GetLastSelectedListOfEvents()->push_back( clipboard->GetEvent() );

    ChangesMadeOnEvents();
}

////////////////////////////////////////////////////////////
/// Coller après l'évènement choisi
////////////////////////////////////////////////////////////
void OldEventsEditor::OnMenuPasteAfterSelected( wxCommandEvent& event )
{
    if ( eventsSelected.empty() )
        eventsSelected.push_back(boost::tuples::make_tuple(events, events->size(), (vector <Instruction>*)NULL, 0));

    Clipboard * clipboard = Clipboard::GetInstance();
    if ( !clipboard->HasEvent() ) return;

    if ( boost::tuples::get<1>(eventsSelected[0])+1 < GetLastSelectedListOfEvents()->size() )
        GetLastSelectedListOfEvents()->insert( GetLastSelectedListOfEvents()->begin() + boost::tuples::get<1>(eventsSelected[0])+1, clipboard->GetEvent() );
    else
        GetLastSelectedListOfEvents()->push_back( clipboard->GetEvent() );

    ChangesMadeOnEvents();
}

////////////////////////////////////////////////////////////
/// Coller en tant que sous évènement
////////////////////////////////////////////////////////////
void OldEventsEditor::OnPasteAsASubEventSelected(wxCommandEvent& event)
{
    if ( eventsSelected.empty() || !GetLastSelectedEvent()->CanHaveSubEvents() ) return;

    Clipboard * clipboard = Clipboard::GetInstance();
    if ( !clipboard->HasEvent() ) return;

    GetLastSelectedEvent()->GetSubEvents().push_back( clipboard->GetEvent() );

    ChangesMadeOnEvents();
}

////////////////////////////////////////////////////////////
/// Supprimer les sous évènements de l'évènement
////////////////////////////////////////////////////////////
void OldEventsEditor::OnDelSubEventsSelected(wxCommandEvent& event)
{
    if ( eventsSelected.empty() || !GetLastSelectedEvent()->CanHaveSubEvents()  ) return;

    GetLastSelectedEvent()->GetSubEvents().clear();

    ChangesMadeOnEvents();
}

/**
 * De/activate an event
 */
void OldEventsEditor::OnToggleEventSelected(wxCommandEvent& event)
{
    if ( eventsSelected.empty() ) return;

    bool newState = !GetLastSelectedEvent()->IsDisabled();
    GetLastSelectedEvent()->SetDisabled(newState);
    if ( GetLastSelectedEvent()->CanHaveSubEvents() )
    {
        for (unsigned int i = 0;i<GetLastSelectedEvent()->GetSubEvents().size();++i)
        	GetLastSelectedEvent()->GetSubEvents()[i]->SetDisabled(newState);
    }

    ChangesMadeOnEvents();
}


void OldEventsEditor::OnAideBtClick( wxCommandEvent& event )
{
    HelpFileAccess * helpFileAccess = HelpFileAccess::GetInstance();
    helpFileAccess->DisplaySection(11);
}

////////////////////////////////////////////////////////////
/// Création d'un modèle d'évènement
/// à partir des évènements du jeu
////////////////////////////////////////////////////////////
void OldEventsEditor::OnCreateTemplateBtClick( wxCommandEvent& event )
{
    if ( eventsSelected.empty() )
        eventsSelected.push_back(boost::tuples::make_tuple(events, events->size(), (vector <Instruction>*)NULL, 0));

    CreateTemplate dialog( this, *GetLastSelectedListOfEvents() );
    dialog.ShowModal();
}

////////////////////////////////////////////////////////////
/// Double clic gauche : Edition d'un évènement
////////////////////////////////////////////////////////////
void OldEventsEditor::OnEventsPanelLeftDClick( wxMouseEvent& event )
{
    if ( eventsSelected.empty() ) return;

    //Update mouse position
    MouseX = event.GetX();
    MouseY = event.GetY()+ScrollBar1->GetThumbPosition();

    //Refresh, so as to display selection and refresh events selected
    ForceRefresh();

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
    {
        eventSelected->EditEvent(this, game, scene, mainEditorCommand);
        ChangesMadeOnEvents();
    }

    eventSelected->eventHeightNeedUpdate = true;
}

////////////////////////////////////////////////////////////
/// Clic gauche : selection
////////////////////////////////////////////////////////////
void OldEventsEditor::OnEventsPanelLeftUp(wxMouseEvent& event)
{
    SetFocus();
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
        SetEventsNeedUpdate(*events);
        isResizingColumns = false;
    }

    //Refresh the events
    ForceRefresh();
}

////////////////////////////////////////////////////////////
/// Clic droit : menu contextuel
////////////////////////////////////////////////////////////
void OldEventsEditor::OnEventsPanelRightUp( wxMouseEvent& event )
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
    ForceRefresh();

    //Get the selection
    BaseEventSPtr eventSelected = GetLastSelectedEvent();
    vector < Instruction > * instructionsListSelected = GetLastSelectedListOfInstructions();

    //Remove the common submenu from all menus ( wxGTK does not support sub menus to be inserted more than one time )
    if ( actionsMenu.FindItem(_("Evènement")) != wxNOT_FOUND ) actionsMenu.Remove(actionsMenu.FindItem(_("Evènement")));
    if ( conditionsMenu.FindItem(_("Evènement")) != wxNOT_FOUND ) conditionsMenu.Remove(conditionsMenu.FindItem(_("Evènement")));
    if ( noActionsMenu.FindItem(_("Evènement")) != wxNOT_FOUND ) noActionsMenu.Remove(noActionsMenu.FindItem(_("Evènement")));
    if ( noConditionsMenu.FindItem(_("Evènement")) != wxNOT_FOUND ) noConditionsMenu.Remove(noConditionsMenu.FindItem(_("Evènement")));

    //Menu for conditions list
    if ( instructionsListSelected != NULL && conditionsSelected )
    {
        if ( !instructionsListSelected->empty() )
        {
            conditionsMenu.AppendSubMenu(&ContextMenu, _("Evènement"), _("Edition de l'évènement"));
            PopupMenu( &conditionsMenu );
        }
        else
        {
            noConditionsMenu.AppendSubMenu(&ContextMenu, _("Evènement"), _("Edition de l'évènement"));
            PopupMenu( &noConditionsMenu );
        }
    }
    //Menu for actions list
    else if ( instructionsListSelected != NULL && !conditionsSelected )
    {
        if ( !instructionsListSelected->empty() )
        {
            actionsMenu.AppendSubMenu(&ContextMenu, _("Evènement"), _("Edition de l'évènement"));
            PopupMenu( &actionsMenu );
        }
        else
        {
            noActionsMenu.AppendSubMenu(&ContextMenu, _("Evènement"), _("Edition de l'évènement"));
            PopupMenu( &noActionsMenu );
        }
    }
    //Menu for events
    else
        PopupMenu( &ContextMenu );
}

////////////////////////////////////////////////////////////
/// Scroll avec la molette
////////////////////////////////////////////////////////////
void OldEventsEditor::OnEventsPanelMouseWheel(wxMouseEvent& event)
{
    ScrollBar1->SetScrollbar(ScrollBar1->GetThumbPosition()-event.GetWheelRotation(), ScrollBar1->GetThumbSize(), ScrollBar1->GetRange(), ScrollBar1->GetPageSize());
    ForceRefresh();
}

/**
 * De/activate profiling
 */
void OldEventsEditor::OnProfilingBtClick(wxCommandEvent& event)
{
    if ( !profilingActivated && sceneCanvas && sceneCanvas->GetOwnedProfileDialog() != boost::shared_ptr<ProfileDlg>() && !sceneCanvas->GetOwnedProfileDialog()->profilingActivated)
    {
        wxLogMessage(_("Le suivi des performances n'est pas activé. Activez le suivi des évènements à l'aide de la fenêtre Performances lors de l'aperçu puis lancez un aperçu de la scène."));
        return;
    }

    profilingActivated = !profilingActivated;
    ForceRefresh();
}

////////////////////////////////////////////////////////////
/// Afficher la fenêtre de recherche
////////////////////////////////////////////////////////////
void OldEventsEditor::OnSearchBtClick(wxCommandEvent& event)
{
    if ( searchDialog )
        searchDialog->Show();
}

////////////////////////////////////////////////////////////
/// Suppression de l'historique des changements
////////////////////////////////////////////////////////////
void OldEventsEditor::OnClearHistorySelected(wxCommandEvent& event)
{
    history.clear();
    redoHistory.clear();
}

////////////////////////////////////////////////////////////
/// Annuler le dernier changement
////////////////////////////////////////////////////////////
void OldEventsEditor::OnUndoSelected(wxCommandEvent& event)
{
    if ( history.size() < 2 )
        return;

    redoHistory.push_back(CloneVectorOfEvents(*events)); //On pourra revenir à l'état actuel avec "Refaire"
    *events = CloneVectorOfEvents(history.at( history.size() - 2 )); //-2 car le dernier élément est la liste d'évènement actuelle
    history.pop_back();

    ForceRefresh();

    scene.wasModified = true;
}

////////////////////////////////////////////////////////////
/// Rétablir le dernier changement
////////////////////////////////////////////////////////////
void OldEventsEditor::OnRedoSelected(wxCommandEvent& event)
{
    if ( redoHistory.empty() )
        return;

    history.push_back(CloneVectorOfEvents(redoHistory.back())); //Le dernier élément est la liste d'évènement actuellement éditée
    *events = CloneVectorOfEvents(redoHistory.back());
    redoHistory.pop_back();

    ForceRefresh();

    scene.wasModified = true;
}

////////////////////////////////////////////////////////////
/// Déplacement de la souris : Changement de curseur si besoin
////////////////////////////////////////////////////////////
void OldEventsEditor::OnEventsPanelMouseMove(wxMouseEvent& event)
{
    if (    (event.GetX() >= conditionsColumnWidth-2 && event.GetX() <= conditionsColumnWidth+2)
        ||  isResizingColumns)
        SetCursor(wxCURSOR_SIZEWE);
    else
        SetCursor(wxNullCursor);

    MouseX = event.GetX();
    MouseY = event.GetY()+ScrollBar1->GetThumbPosition();

    EventsRenderingHelper * eventsRenderingHelper = EventsRenderingHelper::GetInstance();

    wxClientDC realdc( EventsPanel ); //Création obligatoire du wxBufferedPaintDC
    EventsPanel->SetBackgroundStyle( wxBG_STYLE_PAINT );

    wxBufferedDC dc(&realdc);

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
    int initialXposition = 2 + dc.GetTextExtent(ToString(events->size())).GetWidth() + 2 - horizontalScrollbar->GetThumbPosition();
    int maximalWidth = 0;
    if ( profilingActivated ) initialXposition+=62;

    //Setup renderings datas which are constants.
    eventsRenderingHelper->SetConditionsColumnWidth(conditionsColumnWidth);

    instructionsSelected = false;

    //Phase de dessin des évènements
    sf::Clock startDraw;
    DrawEvents(*events, dc, Yposition, initialXposition, maximalWidth, true);
    cout << "Draw ended: " << startDraw.GetElapsedTime() << endl;

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

void OldEventsEditor::OnEventsPanelLeftDown(wxMouseEvent& event)
{
    if ( event.GetX() >= conditionsColumnWidth-2 && event.GetX() <= conditionsColumnWidth+2  )
        isResizingColumns = true;
}

void OldEventsEditor::DeselectAllEvents(vector < BaseEventSPtr > & eventsToUnselected)
{
    eventsSelected.clear();

    for (unsigned int i = 0;i<eventsToUnselected.size();++i)
    {
        if ( eventsToUnselected[i]->selected )
        {
            eventsToUnselected[i]->selected = false;
            eventsToUnselected[i]->eventHeightNeedUpdate = true;
        }

    	if ( eventsToUnselected[i]->CanHaveSubEvents() )
            DeselectAllEvents(eventsToUnselected[i]->GetSubEvents());
    }
}

void OldEventsEditor::DeselectAllActions(vector < BaseEventSPtr > & eventsToUnselected)
{
    eventsSelected.clear();

    for (unsigned int eId = 0;eId<eventsToUnselected.size();++eId)
    {
        vector < vector<Instruction>* > allActionsVectors = eventsToUnselected[eId]->GetAllActionsVectors();
        for (unsigned int i = 0;i<allActionsVectors.size();++i)
            DeselectAllInstructions(eventsToUnselected[eId], *allActionsVectors[i]);

    	if ( eventsToUnselected[eId]->CanHaveSubEvents() )
            DeselectAllActions(eventsToUnselected[eId]->GetSubEvents());
    }
}

void OldEventsEditor::DeselectAllConditions(vector < BaseEventSPtr > & eventsToUnselected)
{
    eventsSelected.clear();

    for (unsigned int eId = 0;eId<eventsToUnselected.size();++eId)
    {
        vector < vector<Instruction>* > allConditionsVector = eventsToUnselected[eId]->GetAllConditionsVectors();
        for (unsigned int i = 0;i<allConditionsVector.size();++i)
            DeselectAllInstructions(eventsToUnselected[eId], *allConditionsVector[i]);

    	if ( eventsToUnselected[eId]->CanHaveSubEvents() )
            DeselectAllConditions(eventsToUnselected[eId]->GetSubEvents());
    }
}

void OldEventsEditor::DeselectAllInstructions(BaseEventSPtr parentEvent, vector<Instruction> & instrsToUnselected)
{
    for (unsigned int j = 0;j<instrsToUnselected.size();++j)
    {
        if ( instrsToUnselected[j].selected )
        {
            instrsToUnselected[j].selected = false;
            parentEvent->eventHeightNeedUpdate = true;
        }

        DeselectAllInstructions(parentEvent, instrsToUnselected[j].GetSubInstructions());
    }
}

////////////////////////////////////////////////////////////
/// Raccourcis clavier, renvoyant aux fonctions déjà existantes
////////////////////////////////////////////////////////////
void OldEventsEditor::OnEventsPanelKeyUp(wxKeyEvent& event)
{
    ctrlPressed = event.GetModifiers() == wxMOD_CMD ? true : false;

    if ( event.GetModifiers() == wxMOD_SHIFT ) //Shift-xxx
    {
        switch ( event.GetKeyCode() )
        {
            case WXK_INSERT:
            {
                wxCommandEvent unusedEvent;
                OnSubEventMenuItemSelected( unusedEvent );
                break;
            }
            default:
                break;
        }
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
    else if ( event.GetModifiers() == (wxMOD_CMD|wxMOD_SHIFT) ) //Ctrl-Shift-xxx
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
    else
    {
        switch ( event.GetKeyCode() )
        {
            case WXK_DELETE:
            {
                wxCommandEvent unusedEvent;

                if ( GetLastSelectedListOfInstructions() == NULL || GetLastSelectedListOfInstructions()->empty() )
                    OnDelEventSelected( unusedEvent );
                else if ( conditionsSelected )
                    OnDelConditionMenuSelected( unusedEvent );
                else
                    OnDelActionMenuSelected( unusedEvent );

                break;
            }
            case WXK_INSERT:
            {
                wxCommandEvent unusedEvent;
                OnInsertEventSelected( unusedEvent );
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
void OldEventsEditor::OnEventsPanelSetFocus(wxFocusEvent& event)
{
    mainEditorCommand.GetRibbon()->SetActivePage(4);
    ConnectEvents();
}

//TODO : Selection de plusieurs events

