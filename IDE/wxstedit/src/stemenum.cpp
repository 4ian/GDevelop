///////////////////////////////////////////////////////////////////////////////
// Name:        stemenum.cpp
// Purpose:     wxSTEditorMenuManager
// Author:      John Labenski, parts taken from wxGuide by Otto Wyss
// Modified by:
// Created:     11/05/2002
// RCS-ID:
// Copyright:   (c) John Labenski, Otto Wyss
// Licence:     wxWidgets licence
///////////////////////////////////////////////////////////////////////////////

#ifdef __BORLANDC__
    #pragma hdrstop
#endif

// For compilers that support precompilation, includes "wx/wx.h".
#include "wx/wxprec.h"

#ifndef WX_PRECOMP
    #include "wx/wx.h"
#endif // WX_PRECOMP

#include "wx/stedit/stemenum.h"
#include "wx/stedit/stedit.h"

#include "wx/artprov.h"   // wxArtProvider

//-----------------------------------------------------------------------------
// wxSTEditorMenuManager - a holding place for menu generating code
//-----------------------------------------------------------------------------
void wxSTEditorMenuManager::Init()
{
    m_enabledEditorItems = true;
    m_menuOptionTypes = 0;
    m_menuItemTypes.Add(0, STE_MENU_HELP_MENU+1);
    m_toolBarToolTypes = 0;
}

void wxSTEditorMenuManager::CreateForSinglePage()
{
    m_menuOptionTypes  = 0;
    m_menuItemTypes[STE_MENU_FILE_MENU]     = STE_MENU_FILE_DEFAULT;
    m_menuItemTypes[STE_MENU_EDIT_MENU]     = STE_MENU_EDIT_DEFAULT;
    m_menuItemTypes[STE_MENU_TOOLS_MENU]    = STE_MENU_TOOLS_DEFAULT;
    m_menuItemTypes[STE_MENU_VIEW_MENU]     = STE_MENU_VIEW_DEFAULT;
    m_menuItemTypes[STE_MENU_BOOKMARK_MENU] = STE_MENU_BOOKMARK_DEFAULT;
    m_menuItemTypes[STE_MENU_PREFS_MENU]    = STE_MENU_PREFS_DEFAULT;
    m_menuItemTypes[STE_MENU_WINDOW_MENU]   = STE_MENU_WINDOW_DEFAULT;
    m_menuItemTypes[STE_MENU_HELP_MENU]     = STE_MENU_HELP_DEFAULT;
    m_toolBarToolTypes = STE_TOOLBAR_TOOLS;
}
void wxSTEditorMenuManager::CreateForNotebook()
{
    m_menuOptionTypes  = STE_MENU_NOTEBOOK;
    m_menuItemTypes[STE_MENU_FILE_MENU]     = STE_MENU_FILE_DEFAULT;
    m_menuItemTypes[STE_MENU_EDIT_MENU]     = STE_MENU_EDIT_DEFAULT;
    m_menuItemTypes[STE_MENU_TOOLS_MENU]    = STE_MENU_TOOLS_DEFAULT;
    m_menuItemTypes[STE_MENU_VIEW_MENU]     = STE_MENU_VIEW_DEFAULT;
    m_menuItemTypes[STE_MENU_BOOKMARK_MENU] = STE_MENU_BOOKMARK_DEFAULT;
    m_menuItemTypes[STE_MENU_PREFS_MENU]    = STE_MENU_PREFS_DEFAULT;
    m_menuItemTypes[STE_MENU_WINDOW_MENU]   = STE_MENU_WINDOW_DEFAULT|STE_MENU_WINDOW_FILECHOOSER|STE_MENU_WINDOW_PREVNEXT|STE_MENU_WINDOW_WINDOWS;
    m_menuItemTypes[STE_MENU_HELP_MENU]     = STE_MENU_HELP_DEFAULT;
    m_toolBarToolTypes = STE_TOOLBAR_TOOLS;
}

wxMenu *wxSTEditorMenuManager::CreateEditorPopupMenu(wxMenu *menu_) const
{
    wxMenu *menu = menu_;
    if (!menu) menu = new wxMenu;

    bool add_sep = false;

    wxMenu *fileMenu     = GetMenuItemTypes(STE_MENU_FILE_MENU)     != 0 ? CreateFileMenu()     : NULL;
    wxMenu *editMenu     = GetMenuItemTypes(STE_MENU_EDIT_MENU)     != 0 ? CreateEditMenu()     : NULL;
    wxMenu *toolsMenu    = GetMenuItemTypes(STE_MENU_TOOLS_MENU)    != 0 ? CreateToolsMenu()    : NULL;
    wxMenu *viewMenu     = GetMenuItemTypes(STE_MENU_VIEW_MENU)     != 0 ? CreateViewMenu()     : NULL;
    wxMenu *bookmarkMenu = GetMenuItemTypes(STE_MENU_BOOKMARK_MENU) != 0 ? CreateBookmarkMenu() : NULL;
    wxMenu *prefMenu     = GetMenuItemTypes(STE_MENU_PREFS_MENU)    != 0 ? CreatePreferenceMenu() : NULL;
    wxMenu *windowMenu   = GetMenuItemTypes(STE_MENU_WINDOW_MENU)   != 0 ? CreateWindowMenu()   : NULL;
    wxMenu *helpMenu     = GetMenuItemTypes(STE_MENU_HELP_MENU)     != 0 ? CreateHelpMenu()     : NULL;

    if (fileMenu)
    {
        menu->Append(ID_STE_MENU_FILE, _("&File"), fileMenu);
        add_sep = true;
    }

    if (editMenu)
    {
        if (add_sep) menu->AppendSeparator();
        menu->Append(ID_STE_MENU_EDIT, _("&Edit"), editMenu);
        add_sep = true;
    }

    if (toolsMenu)
    {
        if (add_sep) menu->AppendSeparator();
        menu->Append(ID_STE_MENU_TOOLS, _("&Tools"), toolsMenu);
        add_sep = true;
    }

    if (viewMenu)
    {
        if (add_sep) menu->AppendSeparator();
        menu->Append(ID_STE_MENU_VIEW, _("&View"), viewMenu);
        add_sep = true;
    }

    if (bookmarkMenu)
    {
        if (add_sep) menu->AppendSeparator();
        menu->Append(ID_STE_MENU_BOOKMARK, _("&Bookmarks"), bookmarkMenu);
        add_sep = true;
    }

    if (prefMenu)
    {
        if (add_sep) menu->AppendSeparator();
        menu->Append(ID_STE_MENU_PREF, _("&Preferences"), prefMenu);
        add_sep = true;
    }

    if (windowMenu)
    {
        if (add_sep) menu->AppendSeparator();
        menu->Append(ID_STE_MENU_PREF, _("&Window"), windowMenu);
    }

    if (helpMenu)
    {
        if (add_sep) menu->AppendSeparator();
        menu->Append(ID_STE_MENU_HELP, _("&Help"), helpMenu);
    }

    if (!menu_ && menu && (menu->GetMenuItemCount() == 0))
    {
        delete menu;
        return NULL;
    }

    return menu;
}

wxMenu* wxSTEditorMenuManager::CreateSplitterPopupMenu(wxMenu *menu_) const
{
    wxMenu *menu = menu_;
    if (!menu) menu = new wxMenu;

    menu->AppendRadioItem(ID_STS_UNSPLIT,     _("&Unsplit editor"), _("Unsplit the editor"));
    menu->AppendRadioItem(ID_STS_SPLIT_HORIZ, _("Split editor &horizontally\tCtrl+Shift+L"), _("Split editor horizontally"));
    menu->AppendRadioItem(ID_STS_SPLIT_VERT,  _("Split editor &vertically\tCtrl+Shift+T"), _("Split editor vertically"));

    return menu;
}
wxMenu* wxSTEditorMenuManager::CreateNotebookPopupMenu(wxMenu *menu_) const
{
    wxMenu *menu = menu_;
    if (!menu) menu = new wxMenu;

    menu->Append(wxID_NEW,  _("&Add empty page"));
    menu->Append(wxID_OPEN, _("&Open file(s)..."));
    menu->Append(ID_STN_SAVE_ALL,  _("&Save all files"));

    menu->AppendSeparator();
    // These are empty and are filled by wxSTEditorNotebook::UpdateMenuItems
    wxMenu *gotoMenu  = new wxMenu;
    wxMenu *closeMenu = new wxMenu;

    menu->Append(ID_STN_WIN_PREVIOUS, _("Previous page"));
    menu->Append(ID_STN_WIN_NEXT,     _("Next page"));

    menu->Append(ID_STN_MENU_GOTO,  _("Goto page"), gotoMenu);
    menu->AppendSeparator();
    menu->Append(ID_STN_CLOSE_PAGE, _("Close current page"));
    menu->Append(ID_STN_CLOSE_ALL,  _("Close all pages..."));
    menu->Append(ID_STN_MENU_CLOSE, _("Close page"), closeMenu);
    menu->AppendSeparator();
    menu->Append(ID_STN_WINDOWS,    _("&Windows..."), _("Manage opened windows"));

    return menu;
}
bool wxSTEditorMenuManager::CreateMenuBar(wxMenuBar *menuBar, bool for_frame) const
{
    wxCHECK_MSG(menuBar, false, wxT("Invalid wxMenuBar"));
    size_t menu_count = menuBar->GetMenuCount();

    // Note! here's where we specify that we want menu items for the frame
    int was_set_frame = HasMenuOptionType(STE_MENU_FRAME);
    if (!was_set_frame && for_frame)
        ((wxSTEditorMenuManager*)this)->SetMenuOptionType(STE_MENU_FRAME, true);

    wxMenu *fileMenu     = GetMenuItemTypes(STE_MENU_FILE_MENU)     != 0 ? CreateFileMenu()     : NULL;
    wxMenu *editMenu     = GetMenuItemTypes(STE_MENU_EDIT_MENU)     != 0 ? CreateEditMenu()     : NULL;
    wxMenu *toolsMenu    = GetMenuItemTypes(STE_MENU_TOOLS_MENU)    != 0 ? CreateToolsMenu()    : NULL;
    wxMenu *viewMenu     = GetMenuItemTypes(STE_MENU_VIEW_MENU)     != 0 ? CreateViewMenu()     : NULL;
    wxMenu *bookmarkMenu = GetMenuItemTypes(STE_MENU_BOOKMARK_MENU) != 0 ? CreateBookmarkMenu() : NULL;
    wxMenu *prefMenu     = GetMenuItemTypes(STE_MENU_PREFS_MENU)    != 0 ? CreatePreferenceMenu() : NULL;
    wxMenu *windowMenu   = GetMenuItemTypes(STE_MENU_WINDOW_MENU)   != 0 ? CreateWindowMenu()   : NULL;
    wxMenu *helpMenu     = GetMenuItemTypes(STE_MENU_HELP_MENU)     != 0 ? CreateHelpMenu()     : NULL;


    if (fileMenu)     menuBar->Append(fileMenu,     _("&File"));
    if (editMenu)     menuBar->Append(editMenu,     _("&Edit"));
    if (toolsMenu)    menuBar->Append(toolsMenu,    _("&Tools"));
    if (viewMenu)     menuBar->Append(viewMenu,     _("&View"));
    if (bookmarkMenu) menuBar->Append(bookmarkMenu, _("&Bookmarks"));
    if (prefMenu)     menuBar->Append(prefMenu,     _("&Preferences"));
    if (windowMenu)   menuBar->Append(windowMenu,   _("&Window"));
    if (helpMenu)     menuBar->Append(helpMenu,     _("&Help"));

    // reset the frame bit if it wasn't set
    if (!was_set_frame)
        ((wxSTEditorMenuManager*)this)->SetMenuOptionType(STE_MENU_FRAME, false);

    return menuBar->GetMenuCount() > menu_count;
}

bool wxSTEditorMenuManager::CreateToolBar(wxToolBar *tb) const
{
    wxCHECK_MSG(tb, false, wxT("Invalid toolbar"));
    size_t tools_count = tb->GetToolsCount();

    if (HasToolbarToolType(STE_TOOLBAR_FILE_NEW))
    {
        tb->AddTool(wxID_NEW,    _("New"), STE_ARTBMP(wxART_STEDIT_NEW), wxNullBitmap, wxITEM_NORMAL, _("New"), _("Clear editor for new file"));
    }
    if (HasToolbarToolType(STE_TOOLBAR_FILE_OPEN))
    {
        tb->AddTool(wxID_OPEN,   _("Open..."), STE_ARTBMP(wxART_STEDIT_OPEN), wxNullBitmap, wxITEM_NORMAL, _("Open..."), _("Open a file to edit"));
    }
    if (HasToolbarToolType(STE_TOOLBAR_FILE_SAVE))
    {
        tb->AddTool(wxID_SAVE,   _("Save"),       STE_ARTBMP(wxART_STEDIT_SAVE), wxNullBitmap, wxITEM_NORMAL, _("Save"), _("Save current file"));
        tb->AddTool(wxID_SAVEAS, _("Save as..."), STE_ARTBMP(wxART_STEDIT_SAVEAS), wxNullBitmap, wxITEM_NORMAL, _("Save as..."), _("Save to a specific filename..."));
        tb->EnableTool(wxID_SAVE, false);

        if (HasMenuOptionType(STE_MENU_NOTEBOOK))
        {
            tb->AddTool(ID_STN_SAVE_ALL, _("Save all files"), STE_ARTBMP(wxART_STEDIT_SAVEALL), wxNullBitmap, wxITEM_NORMAL, _("Save all files"), _("Save all open files"));
            tb->EnableTool(ID_STN_SAVE_ALL, false);
        }
    }
    if (HasToolbarToolType(STE_TOOLBAR_EDIT_CUTCOPYPASTE))
    {
        if (tb->GetToolsCount()) tb->AddSeparator();
        tb->AddTool(wxID_CUT,    _("Cut"),   STE_ARTBMP(wxART_STEDIT_CUT), wxNullBitmap, wxITEM_NORMAL, _("Cut"), _("Cut selected text"));
        tb->AddTool(wxID_COPY,   _("Copy"),  STE_ARTBMP(wxART_STEDIT_COPY), wxNullBitmap, wxITEM_NORMAL, _("Copy"), _("Copy selected text"));
        tb->AddTool(wxID_PASTE,  _("Paste"), STE_ARTBMP(wxART_STEDIT_PASTE), wxNullBitmap, wxITEM_NORMAL, _("Paste"), _("Paste text at cursor"));
    }
    if (HasToolbarToolType(STE_TOOLBAR_EDIT_UNDOREDO))
    {
        if (tb->GetToolsCount()) tb->AddSeparator();
        tb->AddTool(wxID_UNDO,   _("Undo"), STE_ARTBMP(wxART_STEDIT_UNDO), wxNullBitmap, wxITEM_NORMAL, _("Undo"), _("Undo last editing"));
        tb->AddTool(wxID_REDO,   _("Redo"), STE_ARTBMP(wxART_STEDIT_REDO), wxNullBitmap, wxITEM_NORMAL, _("Redo"), _("Redo last undo"));
    }
    if (HasToolbarToolType(STE_TOOLBAR_EDIT_FINDREPLACE))
    {
        if (tb->GetToolsCount()) tb->AddSeparator();
        tb->AddTool(ID_STE_FIND_DOWN, _("Search direction"), STE_ARTBMP(wxART_STEDIT_FINDDOWN), wxNullBitmap, wxITEM_CHECK, _("Search direction"), _("Search direction for next occurance in document"));
        tb->AddTool(wxID_FIND,        _("Find..."),    STE_ARTBMP(wxART_STEDIT_FIND), wxNullBitmap, wxITEM_NORMAL, _("Find..."), _("Find text in document..."));
        tb->AddTool(ID_STE_FIND_NEXT, _("Find next"),  STE_ARTBMP(wxART_STEDIT_FINDNEXT), wxNullBitmap, wxITEM_NORMAL, _("Find next"), _("Find next occurance in document"));
        tb->AddTool(ID_STE_REPLACE,   _("Replace..."), STE_ARTBMP(wxART_STEDIT_REPLACE), wxNullBitmap, wxITEM_NORMAL, _("Replace..."), _("Replace text in document"));
    }
    if (HasToolbarToolType(STE_TOOLBAR_EDIT_FINDCOMBO))
    {
        if (tb->GetToolsCount()) tb->AddSeparator();
        wxComboBox *combo = new wxComboBox(tb, ID_STE_TOOLBAR_FIND_COMBO);
        tb->AddControl(combo);
    }
    if (HasToolbarToolType(STE_TOOLBAR_BOOKMARK))
    {
        if (tb->GetToolsCount()) tb->AddSeparator();
        tb->AddTool(ID_STE_BOOKMARK_TOGGLE,   _("Toggle bookmark"),     STE_ARTBMP(wxART_ADD_BOOKMARK), wxNullBitmap, wxITEM_NORMAL, _("Toggle bookmark"), _("Toggle a bookmark on cursor line"));
        tb->AddTool(ID_STE_BOOKMARK_FIRST,    _("First bookmark"),      STE_ARTBMP(wxART_GO_UP),        wxNullBitmap, wxITEM_NORMAL, _("First bookmark"),  _("Goto first bookmark"));
        tb->AddTool(ID_STE_BOOKMARK_PREVIOUS, _("Previous bookmark"),   STE_ARTBMP(wxART_GO_BACK),      wxNullBitmap, wxITEM_NORMAL, _("Previous bookmark"), _("Goto previous bookmark"));
        tb->AddTool(ID_STE_BOOKMARK_NEXT,     _("Next bookmark"),       STE_ARTBMP(wxART_GO_FORWARD),   wxNullBitmap, wxITEM_NORMAL, _("Next bookmark"),   _("Goto next bookmark"));
        tb->AddTool(ID_STE_BOOKMARK_LAST,     _("Last bookmark"),       STE_ARTBMP(wxART_GO_DOWN),      wxNullBitmap, wxITEM_NORMAL, _("Last bookmark"),   _("Goto last bookmark"));
        tb->AddTool(ID_STE_BOOKMARK_CLEAR,    _("Clear all bookmarks"), STE_ARTBMP(wxART_DEL_BOOKMARK), wxNullBitmap, wxITEM_NORMAL, _("Clear bookmarks"), _("Clear all bookmarks"));
    }
    tb->Realize();

    return tb->GetToolsCount() > tools_count;
}

wxMenu *wxSTEditorMenuManager::CreateFileMenu(wxMenu *menu_) const
{
    wxMenu *menu = menu_;
    if (!menu) menu = new wxMenu;
    bool add_sep = false;

    if (HasMenuItemType(STE_MENU_FILE_MENU, STE_MENU_FILE_NEW))
    {
        menu->Append(MenuItem(menu, wxID_NEW, _("&New...\tCtrl-N"), _("Clear contents and start a new file"), wxITEM_NORMAL, STE_ARTBMP(wxART_STEDIT_NEW)));
        add_sep = true;
    }
    if (HasMenuItemType(STE_MENU_FILE_MENU, STE_MENU_FILE_OPEN))
    {
        menu->Append(MenuItem(menu, wxID_OPEN, _("&Open...\tCtrl-O"), _("Open file..."), wxITEM_NORMAL, STE_ARTBMP(wxART_STEDIT_OPEN)));
        add_sep = true;
    }
    if (HasMenuItemType(STE_MENU_FILE_MENU, STE_MENU_FILE_CLOSE) && HasMenuOptionType(STE_MENU_FRAME))
    {
        if (add_sep) menu->AppendSeparator();

        menu->Append(ID_STN_CLOSE_PAGE, _("&Close current page\tCtrl-Shift-Q"), _("Close current page"));
        if (HasMenuOptionType(STE_MENU_NOTEBOOK))
            menu->Append(ID_STN_CLOSE_ALL, _("Cl&ose all pages..."), _("Close all pages"));

        add_sep = true;
    }
    if (HasMenuItemType(STE_MENU_FILE_MENU, STE_MENU_FILE_SAVE))
    {
        if (add_sep) menu->AppendSeparator();

        menu->Append(MenuItem(menu, wxID_SAVE,   _("&Save \tCtrl-S"), _("Save current file"), wxITEM_NORMAL, STE_ARTBMP(wxART_STEDIT_SAVE)));
        menu->Enable(wxID_SAVE, false);
        menu->Append(MenuItem(menu, wxID_SAVEAS, _("Save &As...\tAlt-S"), _("Save as file..."), wxITEM_NORMAL, STE_ARTBMP(wxART_STEDIT_SAVEAS)));
        if (HasMenuOptionType(STE_MENU_NOTEBOOK))
        {
            menu->Append(MenuItem(menu, ID_STN_SAVE_ALL, _("Save A&ll\tCtrl-Shift-S"), _("Save all files"), wxITEM_NORMAL, STE_ARTBMP(wxART_STEDIT_SAVEALL)));
            menu->Enable(ID_STN_SAVE_ALL, false);
        }
        add_sep = true;
    }
    if (HasMenuItemType(STE_MENU_FILE_MENU, STE_MENU_FILE_EXPORT))
    {
        if (add_sep) menu->AppendSeparator();

        menu->Append(MenuItem(menu, ID_STE_EXPORT,   _("Expor&t..."), _("Export to file..."), wxITEM_NORMAL));
        add_sep = true;
    }
    if (HasMenuItemType(STE_MENU_FILE_MENU, STE_MENU_FILE_PROPERTY))
    {
        if (add_sep) menu->AppendSeparator();

        menu->Append(ID_STE_PROPERTIES, _("Document propert&ies..."), _("Show document properties dialog"));
        add_sep = true;
    }
    if (HasMenuItemType(STE_MENU_FILE_MENU, STE_MENU_FILE_PRINT))
    {
        if (add_sep) menu->AppendSeparator();

        menu->Append(MenuItem(menu, wxID_PRINT,              _("&Print...\tCtrl-P"), _("Print current document"), wxITEM_NORMAL, STE_ARTBMP(wxART_STEDIT_PRINT)));
        menu->Append(MenuItem(menu, wxID_PREVIEW,            _("Print pre&view...\tCtrl-Shift-P"), _("Print preview of the current document"), wxITEM_NORMAL, STE_ARTBMP(wxART_STEDIT_PRINTPREVIEW)));
        menu->Append(MenuItem(menu, wxID_PRINT_SETUP,        _("Printer set&up..."), _("Setup the printer"), wxITEM_NORMAL, STE_ARTBMP(wxART_STEDIT_PRINTSETUP)));
        menu->Append(MenuItem(menu, ID_STE_PRINT_PAGE_SETUP, _("Printer pa&ge setup..."), _("Setup the printout page"), wxITEM_NORMAL, STE_ARTBMP(wxART_STEDIT_PRINTPAGESETUP)));
        menu->Append(MenuItem(menu, ID_STE_PRINT_OPTIONS,    _("Printer options..."), _("Set other printout options"), wxITEM_NORMAL, STE_ARTBMP(wxART_STEDIT_PRINTPREVIEW)));
    }

    if (HasMenuOptionType(STE_MENU_FRAME))
    {
        if (add_sep) menu->AppendSeparator();
        menu->Append(MenuItem(menu, wxID_EXIT, _("E&xit\tCtrl-Q"), _("Exit editor"), wxITEM_NORMAL, STE_ARTBMP(wxART_STEDIT_EXIT)));
    }

    if (!menu_ && menu && (menu->GetMenuItemCount() == 0))
    {
        delete menu;
        return NULL;
    }

    return menu;
}

wxMenu *wxSTEditorMenuManager::CreateEditMenu(wxMenu *menu_) const
{
    wxMenu *menu = menu_;
    if (!menu) menu = new wxMenu;
    bool add_sep = false;

    if (HasMenuItemType(STE_MENU_EDIT_MENU, STE_MENU_EDIT_CUTCOPYPASTE))
    {
        if (!HasMenuOptionType(STE_MENU_READONLY))
            menu->Append(MenuItem(menu, wxID_CUT,   _("Cu&t   \tCtrl-X"), _("Cut selected text to clipboard"), wxITEM_NORMAL, STE_ARTBMP(wxART_STEDIT_CUT)));
        menu->Append(MenuItem(menu, wxID_COPY,  _("&Copy  \tCtrl-C"), _("Copy selected text to clipboard"), wxITEM_NORMAL, STE_ARTBMP(wxART_STEDIT_COPY)));
#ifdef __UNIX__
        menu->Append(ID_STE_COPY_PRIMARY,  _("Copy primary\tCtrl-Shift-C"), _("Copy selected text to primary clipboard"));
#endif // __UNIX__
        if (!HasMenuOptionType(STE_MENU_READONLY))
        {
            menu->Append(MenuItem(menu, wxID_PASTE, _("&Paste \tCtrl-V"), _("Paste text from clipboard"), wxITEM_NORMAL, STE_ARTBMP(wxART_STEDIT_PASTE)));
            menu->Append(ID_STE_PASTE_RECT, _("Paste Rect\tAlt-Shift-V"), _("Paste rectangular text from clipboard (select with Shift+Alt)"));
        }

        // FIXME - ID_STE_PREF_SELECTION_MODE remmed out since I can't make it work in GTK
        //menu->AppendCheckItem(ID_STE_PREF_SELECTION_MODE, _("Rectan&gular Selection \tCtrl-R"), _("Rectangular selections for cut/copy/paste"));
        menu->Append(wxID_SELECTALL, _("Select A&ll\tCtrl-A"), _("Selects entire document"));

        add_sep = true;
    }
    if (HasMenuItemType(STE_MENU_EDIT_MENU, STE_MENU_EDIT_LINE))
    {
        if (add_sep) menu->AppendSeparator();

        wxMenu *m = new wxMenu();
        // FIXME - these aren't Ctrl-L since the stc handles the keys already (works everywhere?)
        if (!HasMenuOptionType(STE_MENU_READONLY))
            m->Append(ID_STE_LINE_CUT,   _("Line Cu&t \tCtrl-L"), _("Cut current line to clipboard"));

        m->Append(ID_STE_LINE_COPY,  _("Line &Copy  \tCtrl-Shift-T"), _("Copy current line to clipboard"));

        if (!HasMenuOptionType(STE_MENU_READONLY))
        {
            m->Append(ID_STE_LINE_DELETE, _("Line &Delete \tCtrl-Shift-L"), _("Delete current line"));
            m->Append(ID_STE_LINE_TRANSPOSE, _("Line &Transpose \tCtrl-T"), _("Transpose current line upwards"));
            m->Append(ID_STE_LINE_DUPLICATE, _("Line D&uplicate \tCtrl-D"), _("Duplicate current line"));
        }

        menu->Append(ID_STE_MENU_LINE, _("L&ine Editing"), m);
        add_sep = true;
    }
    if (HasMenuItemType(STE_MENU_EDIT_MENU, STE_MENU_EDIT_FINDREPLACE))
    {
        if (add_sep) menu->AppendSeparator();

        menu->Append(MenuItem(menu, wxID_FIND,        _("&Find...\tCtrl-F"), _("Find text"), wxITEM_NORMAL, STE_ARTBMP(wxART_STEDIT_FIND)));
        menu->Append(MenuItem(menu, ID_STE_FIND_NEXT, _("Find &Next\tF3"),   _("Find next occurance"), wxITEM_NORMAL, STE_ARTBMP(wxART_STEDIT_FINDNEXT)));
        menu->AppendCheckItem(ID_STE_FIND_DOWN,       _("Search F&orward\tF2"), _("Search forward/reverse in document"));
        if (!HasMenuOptionType(STE_MENU_READONLY))
            menu->Append(MenuItem(menu, ID_STE_REPLACE,   _("R&eplace...\tCtrl-H"), _("Replace text"), wxITEM_NORMAL, STE_ARTBMP(wxART_STEDIT_REPLACE)));
        add_sep = true;
    }
    if (HasMenuItemType(STE_MENU_EDIT_MENU, STE_MENU_EDIT_GOTOLINE))
    {
        if (add_sep) menu->AppendSeparator();

        menu->Append(ID_STE_GOTO_LINE, _("&Go To... \tCtrl-G"), _("Goto line number"));
        add_sep = true;
    }
    if (HasMenuItemType(STE_MENU_EDIT_MENU, STE_MENU_EDIT_UNDOREDO) && !HasMenuOptionType(STE_MENU_READONLY))
    {
        if (add_sep) menu->AppendSeparator();

        menu->Append(MenuItem(menu, wxID_UNDO, _("&Undo \tCtrl-Z"), _("Undo last operation"), wxITEM_NORMAL, STE_ARTBMP(wxART_STEDIT_UNDO)));
        menu->Append(MenuItem(menu, wxID_REDO, _("&Redo \tCtrl-Y"), _("Redo last undo"), wxITEM_NORMAL, STE_ARTBMP(wxART_STEDIT_REDO)));
        add_sep = true;
    }
    if (HasMenuItemType(STE_MENU_EDIT_MENU, STE_MENU_EDIT_READONLY) && !HasMenuOptionType(STE_MENU_READONLY))
    {
        if (add_sep) menu->AppendSeparator();

        menu->AppendCheckItem(ID_STE_READONLY, _("Readonly"), _("Make document readonly"));
        add_sep = true;
    }

    if (!menu_ && menu && (menu->GetMenuItemCount() == 0))
    {
        delete menu;
        return NULL;
    }

    return menu;
}

wxMenu *wxSTEditorMenuManager::CreateToolsMenu(wxMenu *menu_) const
{
    // all of these modify the document
    if (HasMenuOptionType(STE_MENU_READONLY))
        return menu_;

    wxMenu *menu = menu_;
    if (!menu) menu = new wxMenu;
    bool add_sep = false;

    if (HasMenuItemType(STE_MENU_TOOLS_MENU, STE_MENU_TOOLS_CASE))
    {
        if (add_sep) menu->AppendSeparator();

        menu->Append(ID_STE_UPPERCASE, _("Selection &uppercase\tCtrl-Shift-U"), _("Convert the selected text to uppercase"));
        menu->Append(ID_STE_LOWERCASE, _("Selection &lowercase\tCtrl-U"), _("Convert the selected text to lowercase"));
        add_sep = true;
    }
    if (HasMenuItemType(STE_MENU_TOOLS_MENU, STE_MENU_TOOLS_INDENT))
    {
        if (add_sep) menu->AppendSeparator();

        menu->Append(ID_STE_INCREASE_INDENT, _("&Increase indent"), _("Increase indent of selected text or current line"));
        menu->Append(ID_STE_DECREASE_INDENT, _("&Decrease indent"), _("Decrease indent of selected text or current line"));
        add_sep = true;
    }
    if (HasMenuItemType(STE_MENU_TOOLS_MENU, STE_MENU_TOOLS_JOINSPLIT))
    {
        if (add_sep) menu->AppendSeparator();

        menu->Append(ID_STE_LINES_JOIN,  _("&Join selected lines\tCtrl-J"), _("Join selected lines together"));
        menu->Append(ID_STE_LINES_SPLIT, _("&Split selected lines\tCtrl-K"), _("Split selected lines to edge marker"));
        add_sep = true;
    }
    if (HasMenuItemType(STE_MENU_TOOLS_MENU, STE_MENU_TOOLS_TABS_SP))
    {
        if (add_sep) menu->AppendSeparator();

        menu->Append(ID_STE_TABS_TO_SPACES, _("Convert &tabs to spaces"), _("Convert tabs to spaces in selection or current line"));
        menu->Append(ID_STE_SPACES_TO_TABS, _("Convert s&paces to tabs"), _("Convert spaces to tabs in selection or current line"));
        add_sep = true;
    }
    if (HasMenuItemType(STE_MENU_TOOLS_MENU, STE_MENU_TOOLS_EOL))
    {
        if (add_sep) menu->AppendSeparator();

        menu->Append(ID_STE_CONVERT_EOL, _("Convert &EOL characters..."), _("Convert all end of line characters in doc"));
        add_sep = true;
    }
    if (HasMenuItemType(STE_MENU_TOOLS_MENU, STE_MENU_TOOLS_WHITE))
    {
        if (add_sep) menu->AppendSeparator();

        menu->Append(ID_STE_TRAILING_WHITESPACE, _("Remove trailing &whitespace\tCtrl-W"), _("Remove whitespace at the ends of lines"));
        add_sep = true;
    }
    if (HasMenuItemType(STE_MENU_TOOLS_MENU, STE_MENU_TOOLS_INSERT))
    {
        if (add_sep) menu->AppendSeparator();

        menu->Append(ID_STE_INSERT_TEXT, _("I&nsert text...\tCtrl-I"), _("Prepend, Append, or insert text at column..."));
        add_sep = true;
    }
    if (HasMenuItemType(STE_MENU_TOOLS_MENU, STE_MENU_TOOLS_COLUMNIZE))
    {
        if (add_sep) menu->AppendSeparator();

        menu->Append(ID_STE_COLUMNIZE, _("&Columnize..."), _("Reformat selected lines in columns..."));
        add_sep = true;
    }

    if (!menu_ && menu && (menu->GetMenuItemCount() == 0))
    {
        delete menu;
        return NULL;
    }

    return menu;
}

wxMenu *wxSTEditorMenuManager::CreateViewMenu(wxMenu *menu_) const
{
    wxMenu *menu = menu_;
    if (!menu) menu = new wxMenu;
    bool add_sep = false;

    if (HasMenuItemType(STE_MENU_VIEW_MENU, STE_MENU_VIEW_WRAP))
    {
        menu->AppendCheckItem(ID_STE_PREF_WRAP_MODE, _("&Wrap text to window"), _("Wrap the text to fit inside window"));
        add_sep = true;
    }
    if (HasMenuItemType(STE_MENU_VIEW_MENU, STE_MENU_VIEW_GUI))
    {
        if (add_sep) menu->AppendSeparator();

        menu->AppendCheckItem(ID_STE_PREF_VIEW_EOL,        _("Show &EOL"), _("Show end of line symbols"));
        menu->AppendCheckItem(ID_STE_PREF_VIEW_WHITESPACE, _("Show whi&tespace"), _("Show whitespace using symbols"));

        menu->AppendSeparator();

        wxMenu *guideMenu = new wxMenu;
        guideMenu->AppendCheckItem(ID_STE_PREF_INDENT_GUIDES,   _("Show indent &guides"), _("Show indentation column guides"));
        guideMenu->AppendCheckItem(ID_STE_PREF_EDGE_MODE,       _("Show l&ong line guide"), _("Show column guide for long lines"));
        guideMenu->Append(ID_STE_PREF_EDGE_COLUMN,              _("Set long l&ine guide column..."), _("Set column long line guide..."));
        menu->Append(ID_STE_MENU_GUIDES, _("&Guides"), guideMenu);

        menu->AppendSeparator();

        wxMenu *marginMenu = new wxMenu;
        marginMenu->AppendCheckItem(ID_STE_PREF_VIEW_LINEMARGIN, _("Show &line number margin"), _("Show line number margin"));
        marginMenu->AppendCheckItem(ID_STE_PREF_VIEW_MARKERMARGIN, _("Show &marker margin"), _("Show a margin for markers"));
        marginMenu->AppendCheckItem(ID_STE_PREF_VIEW_FOLDMARGIN, _("Show &folding margin"), _("Show code folding margin"));
        menu->Append(ID_STE_MENU_MARGINS, _("&Margins"), marginMenu);
        add_sep = true;
    }
    if (HasMenuItemType(STE_MENU_VIEW_MENU, STE_MENU_VIEW_FOLD))
    {
        if (add_sep) menu->AppendSeparator();

        wxMenu *foldsMenu = new wxMenu;
        foldsMenu->Append(ID_STE_FOLDS_TOGGLE_CURRENT, _("To&ggle current fold"), _("Toggle the current fold level"));
        foldsMenu->Append(ID_STE_FOLDS_COLLAPSE_LEVEL, _("&Collapse folds below level..."), _("Collapse all folds below the level in document"));
        foldsMenu->Append(ID_STE_FOLDS_EXPAND_LEVEL,   _("E&xpand folds above level..."), _("Expand all folds above the level in document"));
        foldsMenu->Append(ID_STE_FOLDS_COLLAPSE_ALL,   _("&Collapse all folds"), _("Collapse all folds in document"));
        foldsMenu->Append(ID_STE_FOLDS_EXPAND_ALL,     _("E&xpand all folds"), _("Expand all folds in document"));
        menu->Append(ID_STE_MENU_FOLDING, _("&Folding"), foldsMenu);
        add_sep = true;
    }
    if (HasMenuItemType(STE_MENU_VIEW_MENU, STE_MENU_VIEW_HILIGHT))
    {
        if (add_sep) menu->AppendSeparator();

        menu->AppendCheckItem(ID_STE_PREF_HIGHLIGHT_SYNTAX, _("S&yntax coloring"), _("Hilight document based on the syntax"));
        add_sep = true;
    }
    if (HasMenuItemType(STE_MENU_VIEW_MENU, STE_MENU_VIEW_ZOOM))
    {
        if (add_sep) menu->AppendSeparator();

        menu->Append(ID_STE_PREF_ZOOM, _("&Scale font size..."), _("Increase or decrease the size of the text"));
        add_sep = true;
    }
    if (HasMenuItemType(STE_MENU_VIEW_MENU, STE_MENU_VIEW_FULLSCREEN) && HasMenuOptionType(STE_MENU_FRAME))
    {
        if (add_sep) menu->AppendSeparator();

        menu->AppendCheckItem(ID_STE_SHOW_FULLSCREEN, _("Show f&ullscreen\tF11"), _("Show the editor fullscreen"));
        add_sep = true;
    }

    if (!menu_ && menu && (menu->GetMenuItemCount() == 0))
    {
        delete menu;
        return NULL;
    }

    return menu;
}

wxMenu *wxSTEditorMenuManager::CreateBookmarkMenu(wxMenu *menu_) const
{
    wxMenu *menu = menu_;

    if (HasMenuItemType(STE_MENU_BOOKMARK_MENU, STE_MENU_BOOKMARK_DEFAULT))
    {
        if (!menu) menu = new wxMenu;
        menu->Append(MenuItem(menu, ID_STE_BOOKMARK_TOGGLE, _("&Toggle bookmark\tF4"), _("Toggle a bookmark on cursor line"), wxITEM_NORMAL, STE_ARTBMP(wxART_ADD_BOOKMARK)));
        menu->AppendSeparator();
        menu->Append(MenuItem(menu, ID_STE_BOOKMARK_FIRST,    _("&First bookmark\tShift+F5"),    _("Goto first bookmark"), wxITEM_NORMAL, STE_ARTBMP(wxART_GO_UP)));
        menu->Append(MenuItem(menu, ID_STE_BOOKMARK_PREVIOUS, _("&Previous bookmark\tF5"), _("Goto previous bookmark"), wxITEM_NORMAL, STE_ARTBMP(wxART_GO_BACK)));
        menu->Append(MenuItem(menu, ID_STE_BOOKMARK_NEXT,     _("&Next bookmark\tF6"),     _("Goto next bookmark"), wxITEM_NORMAL, STE_ARTBMP(wxART_GO_FORWARD)));
        menu->Append(MenuItem(menu, ID_STE_BOOKMARK_LAST,     _("&Last bookmark\tShift+F6"),     _("Goto last bookmark"), wxITEM_NORMAL, STE_ARTBMP(wxART_GO_DOWN)));
        menu->AppendSeparator();
        menu->Append(MenuItem(menu, ID_STE_BOOKMARK_CLEAR, _("&Clear all bookmarks\tShift+F4"), _("Clear all bookmarks"), wxITEM_NORMAL, STE_ARTBMP(wxART_DEL_BOOKMARK)));
    }

    return menu;
}

wxMenu *wxSTEditorMenuManager::CreatePreferenceMenu(wxMenu *menu_) const
{
    wxMenu *menu = menu_;
    if (!menu) menu = new wxMenu;
    bool add_sep = false;

    if (HasMenuItemType(STE_MENU_PREFS_MENU, STE_MENU_PREFS_DLG))
    {
        menu->Append(ID_STE_PREFERENCES, _("Show &preference dialog..."), _("Show preference dialog..."));
        add_sep = true;
    }
    if (HasMenuItemType(STE_MENU_PREFS_MENU, STE_MENU_PREFS_INDENT))
    {
        if (add_sep) menu->AppendSeparator();

        menu->AppendCheckItem(ID_STE_PREF_USE_TABS,        _("Use &tabs"),    _("Tab key inserts a tab character"));
        menu->AppendCheckItem(ID_STE_PREF_TAB_INDENTS,     _("Tab &indents"), _("Tab key indents"));
        menu->AppendCheckItem(ID_STE_PREF_BACKSPACE_UNINDENTS, _("&Backspace unindents"), _("Backspace key unindents"));
        menu->AppendCheckItem(ID_STE_PREF_AUTOINDENT,     _("&Auto indent"), _("Indent new lines to previous indentation"));

        menu->Append(ID_STE_PREF_TAB_WIDTH,    _("Set tab &width..."),    _("Set the number of spaces to show for tab character"));
        menu->Append(ID_STE_PREF_INDENT_WIDTH, _("Set indent wi&dth..."), _("Set the number of spaces to use for indentation"));
        add_sep = true;
    }
    if (HasMenuItemType(STE_MENU_PREFS_MENU, STE_MENU_PREFS_EOL))
    {
        if (add_sep) menu->AppendSeparator();

        menu->Append(ID_STE_PREF_EOL_MODE, _("&EOL Mode..."), _("Set the end of line mode"));
        add_sep = true;
    }
    if (HasMenuItemType(STE_MENU_PREFS_MENU, STE_MENU_PREFS_SAVE))
    {
        if (add_sep) menu->AppendSeparator();

        menu->Append(ID_STE_SAVE_PREFERENCES, _("Save preferences"), _("Save current preferences"));
        add_sep = true;
    }

    if (!menu_ && menu && (menu->GetMenuItemCount() == 0))
    {
        delete menu;
        return NULL;
    }

    return menu;
}

wxMenu *wxSTEditorMenuManager::CreateWindowMenu(wxMenu *menu_) const
{
    wxMenu *menu = menu_;
    if (!menu) menu = new wxMenu;
    bool add_sep = false;

    if (HasMenuItemType(STE_MENU_WINDOW_MENU, STE_MENU_WINDOW_SPLIT))
    {
        menu = CreateSplitterPopupMenu(menu);
        add_sep = true;
    }

    if (HasMenuItemType(STE_MENU_WINDOW_MENU, STE_MENU_WINDOW_FILECHOOSER))
    {
        if (add_sep) menu->AppendSeparator();
        menu->AppendCheckItem(ID_STF_SHOW_SIDEBAR, _("&Show sidebar"), _("Show the sidebar panel"));
    }

    if (HasMenuItemType(STE_MENU_WINDOW_MENU, STE_MENU_WINDOW_PREVNEXT))
    {
        if (add_sep) menu->AppendSeparator();

        menu->Append(ID_STN_WIN_PREVIOUS, _("Pr&evious page\tShift+F8"), _("Goto previous page"));
        menu->Append(ID_STN_WIN_NEXT,     _("Ne&xt page\tF8"), _("Goto next page"));
        add_sep = true;
    }

    if (HasMenuItemType(STE_MENU_WINDOW_MENU, STE_MENU_WINDOW_WINDOWS))
    {
        if (add_sep) menu->AppendSeparator();

        menu->Append(ID_STN_WINDOWS, _("&Windows..."), _("Manage opened windows"));
        add_sep = true;
    }

    if (!menu_ && menu && (menu->GetMenuItemCount() == 0))
    {
        delete menu;
        return NULL;
    }

    return menu;
}

wxMenu *wxSTEditorMenuManager::CreateHelpMenu(wxMenu *menu_) const
{
    wxMenu *menu = menu_;
    if (!menu) menu = new wxMenu;

    if (HasMenuOptionType(STE_MENU_FRAME) && HasMenuItemType(STE_MENU_HELP_MENU, STE_MENU_HELP_ABOUT))
    {
        menu->Append(wxID_ABOUT, _("&About..."), _("About this program"));
    }

    if (!menu_ && menu && (menu->GetMenuItemCount() == 0))
    {
        delete menu;
        return NULL;
    }

    return menu;
}

wxMenu* wxSTEditorMenuManager::CreateInsertCharsMenu(wxMenu *menu_, int types)
{
    wxMenu *menu = menu_;
    if (!menu) menu = new wxMenu;

    if (STE_HASBIT(types, STE_MENU_INSERTCHARS_CHARS))
    {
        menu->Append(ID_STEDLG_INSERTMENU_TAB, _("Tab character"));
        menu->Append(ID_STEDLG_INSERTMENU_CR,  _("Carriage return"));
        menu->Append(ID_STEDLG_INSERTMENU_LF,  _("Line feed"));
    }
    if (STE_HASBIT(types, STE_MENU_INSERTCHARS_REGEXP))
    {
        wxMenu* reMenu = new wxMenu;
        reMenu->Append(ID_STEDLG_INSERTMENURE_ANYCHAR,   _("Any character"));
        reMenu->Append(ID_STEDLG_INSERTMENURE_RANGE,     _("Character in range"));
        reMenu->Append(ID_STEDLG_INSERTMENURE_NOTRANGE,  _("Character not in range"));
        reMenu->Append(ID_STEDLG_INSERTMENURE_BEGINLINE, _("Beginning of line"));
        reMenu->Append(ID_STEDLG_INSERTMENURE_ENDLINE,   _("End of line"));
        reMenu->Append(ID_STEDLG_INSERTMENURE_TAGEXPR,   _("Tagged expression"));
        reMenu->Append(ID_STEDLG_INSERTMENURE_0MATCHES,  _("0 or more matches"));
        reMenu->Append(ID_STEDLG_INSERTMENURE_1MATCHES,  _("1 or more matches"));
        reMenu->Append(ID_STEDLG_INSERTMENURE_01MATCHES, _("0 or 1 matches"));
        reMenu->AppendSeparator();
        reMenu->Append(ID_STEDLG_INSERTMENURE_ALPHANUM,  _("Alphanumeric characters"));
        reMenu->Append(ID_STEDLG_INSERTMENURE_ALPHA,     _("Alphabetical characters"));
        reMenu->Append(ID_STEDLG_INSERTMENURE_NUMERIC,   _("Numeric characters"));
        reMenu->Append(ID_STEDLG_INSERTMENURE_TAB,       _("Tab characters"));

        menu->Append(ID_STEDLG_MENU_INSERTMENURE, _("Regexp"), reMenu);
    }

    if (!menu_ && menu && (menu->GetMenuItemCount() == 0))
    {
        delete menu;
        return NULL;
    }

    return menu;
}

static bool AddAccelFromMenuItem(const wxMenu* menu, wxArrayPtrVoid& entries)
{
    if (!menu)
        return false;

    bool ret = false;
    const wxMenuItemList& itemList = menu->GetMenuItems();
    for ( wxMenuItemList::compatibility_iterator node = itemList.GetFirst();
          node;
          node = node->GetNext() )
    {
        wxMenuItem *menuItem = node->GetData();
        if (!menuItem)
            continue;

        if (menuItem->IsSubMenu())
            ret |= AddAccelFromMenuItem(menuItem->GetSubMenu(), entries);
        else
        {
            wxAcceleratorEntry *entry = menuItem->GetAccel();
            if (entry)
            {
                ret = true;
                // make sure the id is set correctly (for GTK at least)
                entry->Set(entry->GetFlags(), entry->GetKeyCode(), menuItem->GetId());
                bool exists = false;
                for (size_t n = 0; n < entries.GetCount(); n++)
                {
                    if (*entry == *((wxAcceleratorEntry*)entries[n]))
                    {
                        exists = true;
                        break;
                    }
                }

                if (exists)
                    delete entry;
                else
                    entries.Add(entry);
            }
        }
    }

    return ret;
}
bool wxSTEditorMenuManager::GetAcceleratorEntries(const wxMenu* menu,
                                                  const wxMenuBar* menuBar,
                                                  wxArrayPtrVoid& entries) const
{
    bool ret = false;
    if (menu)
        ret = AddAccelFromMenuItem(menu, entries);
    if (menuBar)
    {
        for (size_t n = 0; n < menuBar->GetMenuCount(); n++)
            ret |= AddAccelFromMenuItem(menuBar->GetMenu(n), entries);
    }

    return ret;
}
wxAcceleratorTable wxSTEditorMenuManager::CreateAcceleratorTable(wxArrayPtrVoid& entries)
{
    if (entries.GetCount() == 0)
        return wxAcceleratorTable();

    return wxAcceleratorTable(entries.GetCount(),
#if wxCHECK_VERSION(2,5,0)
	#if (wxUSE_STD_CONTAINERS == 0)
                              (wxAcceleratorEntry*)entries.begin());
    #else
							  (wxAcceleratorEntry*)&(*entries.begin()));
    #endif
#else
                              (wxAcceleratorEntry*)entries[0]);
#endif // wxCHECK_VERSION(2,5,0)
}
wxAcceleratorTable wxSTEditorMenuManager::CreateAcceleratorTable(const wxMenu* menu,
                                                                 const wxMenuBar* menuBar)
{
    wxArrayPtrVoid entries;
    GetAcceleratorEntries(menu, menuBar, entries);
    wxAcceleratorTable table(CreateAcceleratorTable(entries));
    while ( entries.GetCount() > 0 )
    {
        wxAcceleratorEntry *item = (wxAcceleratorEntry*)entries[0];
        //wxPrintf(wxT("Accel %d, '%c' %d %d\n"), item->GetFlags(), (wxChar)item->GetKeyCode(), item->GetKeyCode(), item->GetCommand()); fflush(stdout);
        delete item;
        entries.RemoveAt(0);
    }
    return table;
}

void wxSTEditorMenuManager::EnableEditorItems(bool enable, wxMenu *menu,
                                              wxMenuBar *menuBar, wxToolBar *toolBar)
{
    m_enabledEditorItems = enable;

    int n, count;
    for (n = ID_STE_PREF__FIRST; n <= ID_STE_PREF__LAST; n++)
        DoEnableItem(menu, menuBar, toolBar, n, enable);

    for (n = 0; n < int(m_enableItemsArray.GetCount()); n++)
        DoEnableItem(menu, menuBar, toolBar, m_enableItemsArray[n], enable);

    int menuIds[] = {
        wxID_SAVE,
        wxID_SAVEAS,
        ID_STN_SAVE_ALL,
        ID_STN_CLOSE_PAGE,
        ID_STN_CLOSE_ALL,
        ID_STN_CLOSE_PAGE,
        ID_STN_CLOSE_ALL,
        ID_STE_PROPERTIES,
        wxID_PRINT,
        wxID_PREVIEW,
        wxID_PRINT_SETUP,
        ID_STE_PRINT_PAGE_SETUP,
        ID_STE_PRINT_OPTIONS,

        wxID_CUT,
        wxID_COPY,
        ID_STE_COPY_PRIMARY,
        wxID_PASTE,
        ID_STE_PASTE_RECT,
        wxID_SELECTALL,
        wxID_FIND,
        ID_STE_FIND_NEXT,
        ID_STE_FIND_DOWN,
        ID_STE_REPLACE,
        ID_STE_GOTO_LINE,
        wxID_UNDO,
        wxID_REDO,

        ID_STE_UPPERCASE,
        ID_STE_INCREASE_INDENT,
        ID_STE_DECREASE_INDENT,
        ID_STE_LINES_JOIN,
        ID_STE_LINES_SPLIT,
        ID_STE_TABS_TO_SPACES,
        ID_STE_SPACES_TO_TABS,
        ID_STE_CONVERT_EOL,
        ID_STE_TRAILING_WHITESPACE,

        ID_STE_FOLDS_TOGGLE_CURRENT,
        ID_STE_FOLDS_COLLAPSE_LEVEL,
        ID_STE_FOLDS_EXPAND_LEVEL,
        ID_STE_FOLDS_COLLAPSE_ALL,
        ID_STE_FOLDS_EXPAND_ALL,

        ID_STE_BOOKMARK_TOGGLE,
        ID_STE_BOOKMARK_FIRST,
        ID_STE_BOOKMARK_PREVIOUS,
        ID_STE_BOOKMARK_NEXT,
        ID_STE_BOOKMARK_LAST,
        ID_STE_BOOKMARK_CLEAR,

        ID_STE_PREFERENCES,
        ID_STE_SAVE_PREFERENCES,

        ID_STS_UNSPLIT,
        ID_STS_SPLIT_HORIZ,
        ID_STS_SPLIT_VERT
    };

    count = WXSIZEOF(menuIds);
    for (n = 0; n < count; n++)
        DoEnableItem(menu, menuBar, toolBar, menuIds[n], enable);
}

wxMenuItem *wxSTEditorMenuManager::MenuItem(wxMenu *menu, wxWindowID win_id,
                                     const wxString &text, const wxString &help,
                                     wxItemKind kind, const wxBitmap &bitmap) const
{
    wxMenuItem *item = new wxMenuItem(menu, win_id, text, help, kind);
    if (bitmap.Ok())
        item->SetBitmap(bitmap);
    return item;
}

void wxSTEditorMenuManager::DestroyMenuItem(wxMenu *menu, int menu_id, bool clean_sep) const
{
    wxCHECK_RET(menu, wxT("Invalid menu"));
    wxMenuItem *lastItem = menu->FindItem(menu_id);
    if (lastItem)
        menu->Destroy(lastItem);

    if (!clean_sep) return;

    // find any separators that are next to each other and delete them
    wxMenuItemList &menuItems = menu->GetMenuItems();
    #if (wxUSE_STD_CONTAINERS == 1)
    wxMenuItemList::compatibility_iterator node = menuItems.GetFirst();
    #else
    wxwxMenuItemListNode *node = menuItems.GetFirst();
    #endif

    // delete leading separator
    if (node && ((wxMenuItem*)node->GetData())->IsSeparator())
    {
        menu->Destroy((wxMenuItem*)node->GetData());
        node = node->GetNext();
    }

    // delete duplicate separators
    while (node)
    {
        wxMenuItem *item = (wxMenuItem*)node->GetData();
        if (lastItem && lastItem->IsSeparator() && item->IsSeparator())
            menu->Destroy(lastItem);

        lastItem = item;
        node = node->GetNext();
    }

    // delete trailing separator too
    node = menuItems.GetLast();
    if (node && ((wxMenuItem*)node->GetData())->IsSeparator())
    {
        menu->Destroy((wxMenuItem*)node->GetData());
    }
}

bool wxSTEditorMenuManager::DoEnableItem(wxMenu *menu, wxMenuBar *menuBar,
                               wxToolBar *toolBar, wxWindowID menu_id, bool val)
{
    //wxPrintf(wxT("DoEnableItem %d - val %d\n"), menu_id, int(val));
    bool ret = false;

    if (menu)
    {
        wxMenuItem *menuItem = menu->FindItem(menu_id);
        if (menuItem)
        {
            menuItem->Enable(val);
            ret = true;
        }
    }
    if (menuBar)
    {
        wxMenuItem *menuItem = menuBar->FindItem(menu_id);
        if (menuItem)
        {
            menuItem->Enable(val);
            ret = true;
        }
    }
    if (toolBar)
    {
        toolBar->EnableTool(menu_id, val);
        ret = true; // don't know if it exists, pretend that it did...
    }

    return ret;
}
bool wxSTEditorMenuManager::DoCheckItem(wxMenu *menu, wxMenuBar *menuBar,
                              wxToolBar *toolBar, wxWindowID menu_id, bool val)
{
    //wxPrintf(wxT("DoCheckItem %d - val %d\n"), menu_id, int(val));
    bool ret = false;

    if (menu)
    {
        wxMenuItem *menuItem = menu->FindItem(menu_id);
        if (menuItem)
        {
            menuItem->Check(val);
            ret = true;
        }
    }
    if (menuBar)
    {
        wxMenuItem *menuItem = menuBar->FindItem(menu_id);
        if (menuItem)
        {
            menuItem->Check(val);
            ret = true;
        }
    }
    if (toolBar)
    {
        toolBar->ToggleTool(menu_id, val);
        ret = true; // don't know if it exists, pretend that it did...
    }

    return ret;
}
bool wxSTEditorMenuManager::DoSetTextItem(wxMenu *menu, wxMenuBar *menuBar,
                                        wxWindowID menu_id, const wxString &val)
{
    bool ret = false;

    if (menu)
    {
        wxMenuItem *menuItem = menu->FindItem(menu_id);
        if (menuItem)
        {
            menuItem->SetItemLabel(val);
            ret = true;
        }
    }
    if (menuBar)
    {
        wxMenuItem *menuItem = menuBar->FindItem(menu_id);
        if (menuItem)
        {
            menuItem->SetItemLabel(val);
            ret = true;
        }
    }

    return ret;
}

//-----------------------------------------------------------------------------
// wxSTEditorArtProvider
//-----------------------------------------------------------------------------
#include "wx/image.h"

// Bitmaps used for the toolbar in the wxSTEditorFrame
#include "../art/new.xpm"
#include "../art/open.xpm"
#include "../art/save.xpm"
#include "../art/saveall.xpm"
#include "../art/saveas.xpm"
#include "../art/print.xpm"
#include "../art/print_preview.xpm"
#include "../art/print_setup.xpm"
#include "../art/print_page_setup.xpm"
#include "../art/x_red.xpm"

#include "../art/cut.xpm"
#include "../art/copy.xpm"
#include "../art/paste.xpm"
#include "../art/find.xpm"
#include "../art/findnext.xpm"
#include "../art/finddown.xpm"
//#include "../art/findup.xpm"
#include "../art/replace.xpm"
#include "../art/undo.xpm"
#include "../art/redo.xpm"

#define ART(artid, xpmRc) \
    if (id == (artid)) return wxBitmap(xpmRc##_xpm);

wxBitmap wxSTEditorArtProvider_GetBitmap(const wxArtID& id)
{
    ART(wxART_STEDIT_NEW,            new)
    ART(wxART_STEDIT_OPEN,           open)
    ART(wxART_STEDIT_SAVE,           save)
    ART(wxART_STEDIT_SAVEALL,        saveall)
    ART(wxART_STEDIT_SAVEAS,         saveas)
    ART(wxART_STEDIT_PRINT,          print)
    ART(wxART_STEDIT_PRINTPREVIEW,   print_preview)
    ART(wxART_STEDIT_PRINTSETUP,     print_setup)
    ART(wxART_STEDIT_PRINTPAGESETUP, print_page_setup)
    ART(wxART_STEDIT_EXIT,           x_red)
    ART(wxART_STEDIT_CUT,            cut)
    ART(wxART_STEDIT_COPY,           copy)
    ART(wxART_STEDIT_PASTE,          paste)
    ART(wxART_STEDIT_FIND,           find)
    ART(wxART_STEDIT_FINDNEXT,       findnext)
    ART(wxART_STEDIT_FINDDOWN,       finddown)
    ART(wxART_STEDIT_REPLACE,        replace)
    ART(wxART_STEDIT_UNDO,           undo)
    ART(wxART_STEDIT_REDO,           redo)

    return wxNullBitmap;
}

wxBitmap wxSTEditorArtProvider::CreateBitmap(const wxArtID& id,
                                             const wxArtClient& client,
                                             const wxSize& reqSize)
{
    wxBitmap bmp(wxSTEditorArtProvider_GetBitmap(id));

#if wxUSE_IMAGE
    if (bmp.Ok())
    {
        // fit into transparent image with desired size hint from the client
        if (reqSize == wxDefaultSize)
        {
            // find out if there is a desired size for this client
            wxSize bestSize = GetSizeHint(client);
            if (bestSize != wxDefaultSize)
            {
                int bmp_w = bmp.GetWidth();
                int bmp_h = bmp.GetHeight();
                // want default size but it's smaller, paste into transparent image
                if ((bmp_h < bestSize.x) && (bmp_w < bestSize.y))
                {
                    wxPoint offset((bestSize.x - bmp_w)/2, (bestSize.y - bmp_h)/2);
                    wxImage img = bmp.ConvertToImage();
                    img.Resize(bestSize, offset);
                    bmp = wxBitmap(img);
                }
            }
        }
    }
#endif // wxUSE_IMAGE

    return bmp;
}

