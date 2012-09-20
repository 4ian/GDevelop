///////////////////////////////////////////////////////////////////////////////
// Name:        stemenum.h
// Purpose:     wxSTEditorMenuManager
// Author:      John Labenski, parts taken from wxGuide by Otto Wyss
// Modified by:
// Created:     11/05/2002
// Copyright:   (c) John Labenski, Otto Wyss
// Licence:     wxWidgets licence
///////////////////////////////////////////////////////////////////////////////

#ifndef _STEMENUM_H_
#define _STEMENUM_H_

#include "wx/stedit/stedefs.h"

class WXDLLEXPORT wxMenu;
class WXDLLEXPORT wxMenuBar;
class WXDLLEXPORT wxMenuItem;
class WXDLLEXPORT wxToolBar;

//-----------------------------------------------------------------------------
// wxSTEditorMenuManager - Menu creation for wxSTEditor and friends
//
// The enums STE_MenuXXX are used by the wxSTEditorMenuManager to create
//   the different menu items for a reasonable set of menus.
//
// FIXME? - wxSTEditorMenuManager is ugly, but it works
//
// Special note: STE_MENU_FRAME is added on-the-fly in the frame's menu creation
// code, don't add it to the menu options permanently only during the time when
// you're creating menus for a wxFrame. It adds things that if accessed from
// the popup menu in an editor would make your program crash.
// (ie. closing the page you're on within a popup menu event handler and the
//  Close item on the File menu, which wouldn't make sense in a popup menu).
//-----------------------------------------------------------------------------

// Generic overall options for the wxSTEditorMenuManager
enum STE_MenuOptionsType
{
    STE_MENU_NOTEBOOK = 0x0000001, // adds items for use with a wxSTEditorNotebook
                                   // or conversely blocks items if you don't have notebook
                                   //
    STE_MENU_READONLY = 0x0000002, // strips all items that cannot be used for RO editors
                                   //
    STE_MENU_FRAME    = 0x0000004  // A temporarily set bit to know if menu is for a frame
                                   // do not add this permamently, see usage in CreateMenuBar
};

// The menus on the menubar in order
enum STE_MenuType
{
    STE_MENU_FILE_MENU     = 0, // File menu (open, close, save...)
    STE_MENU_EDIT_MENU     = 1, // Edit menu (cut, copy, paste...)
    STE_MENU_TOOLS_MENU    = 2, // Tools menu (indent...)
    STE_MENU_VIEW_MENU     = 3, // View menu (wrap, guides, margin...)
    STE_MENU_BOOKMARK_MENU = 4, // Bookmarks menu (toggle, add, delete...)
    STE_MENU_PREFS_MENU    = 5, // Preferences menu (use tabs, indent...)
    STE_MENU_WINDOW_MENU   = 6, // Window menu (split, show windows...)
    STE_MENU_HELP_MENU     = 7  // Help menu (about...)
};

// Menu items to create in wxSTEditorMenuManager::CreateFileMenu
enum STE_FileMenuItemType
{
    STE_MENU_FILE_NEW      = 0x00000001, // New file and New file in new page if STE_MENU_NOTEBOOK
    STE_MENU_FILE_OPEN     = 0x00000002, // Open file and Open file in new page if STE_MENU_NOTEBOOK
    STE_MENU_FILE_CLOSE    = 0x00000004, // Close and Close All if STE_MENU_NOTEBOOK
    STE_MENU_FILE_SAVE     = 0x00000008, // Save, Save as
    STE_MENU_FILE_EXPORT   = 0x00000010, // Export to file
    STE_MENU_FILE_PROPERTY = 0x00000020, // Properties dialog
    STE_MENU_FILE_PRINT    = 0x00000040, // Print, preview, setup
//    STE_MENU_FILE_EXIT     = 0x00000080, // frames can quit not editors
    STE_MENU_FILE_DEFAULT  = STE_MENU_FILE_NEW|STE_MENU_FILE_OPEN|STE_MENU_FILE_SAVE|STE_MENU_FILE_EXPORT|STE_MENU_FILE_CLOSE|STE_MENU_FILE_PROPERTY|STE_MENU_FILE_PRINT
};

// Menu items to create in wxSTEditorMenuManager::CreateEditMenu
enum STE_EditMenuItemType
{
    STE_MENU_EDIT_CUTCOPYPASTE  = 0x00000001, // cut/copy/paste/select all
    STE_MENU_EDIT_LINE          = 0x00000002, // cut/copy... line editing
    STE_MENU_EDIT_FINDREPLACE   = 0x00000004, // find/replace
    STE_MENU_EDIT_GOTOLINE      = 0x00000008, // goto line
    STE_MENU_EDIT_UNDOREDO      = 0x00000010, // undo/redo item
    STE_MENU_EDIT_READONLY      = 0x00000020, // readonly item
    STE_MENU_EDIT_DEFAULT       = STE_MENU_EDIT_CUTCOPYPASTE|STE_MENU_EDIT_LINE|STE_MENU_EDIT_FINDREPLACE|STE_MENU_EDIT_GOTOLINE|STE_MENU_EDIT_UNDOREDO
};

// Menu items to create in wxSTEditorMenuManager::CreateToolsMenu
enum STE_ToolsMenuItemType
{
    STE_MENU_TOOLS_CASE      = 0x00000001, // convert selection upper/lowercase
    STE_MENU_TOOLS_INDENT    = 0x00000002, // (un)indent selection
    STE_MENU_TOOLS_JOINSPLIT = 0x00000004, // join and split lines
    STE_MENU_TOOLS_TABS_SP   = 0x00000008, // tabs to spaces and reverse
    STE_MENU_TOOLS_EOL       = 0x00000010, // convert EOL
    STE_MENU_TOOLS_WHITE     = 0x00000020, // remove trailing whitespace
    STE_MENU_TOOLS_INSERT    = 0x00000040, // insert text dialog
    STE_MENU_TOOLS_COLUMNIZE = 0x00000080, // columnize selected text
    STE_MENU_TOOLS_DEFAULT   = STE_MENU_TOOLS_CASE|STE_MENU_TOOLS_INDENT|STE_MENU_TOOLS_JOINSPLIT|STE_MENU_TOOLS_TABS_SP|STE_MENU_TOOLS_EOL|STE_MENU_TOOLS_WHITE|STE_MENU_TOOLS_INSERT|STE_MENU_TOOLS_COLUMNIZE
};

// Menu items to create in wxSTEditorMenuManager::CreateViewMenu
enum STE_ViewMenuItemType
{
    STE_MENU_VIEW_WRAP       = 0x00000001, // wrap lines
    STE_MENU_VIEW_GUI        = 0x00000002, // various visual stuff
    STE_MENU_VIEW_FOLD       = 0x00000004, // fold margin
    STE_MENU_VIEW_ZOOM       = 0x00000008, // zoom dialog
    STE_MENU_VIEW_HILIGHT    = 0x00000010, // syntax hilighting FIXME remove this?
    STE_MENU_VIEW_FULLSCREEN = 0x00000020, // show fullscreen (only for frame)
    STE_MENU_VIEW_DEFAULT    = STE_MENU_VIEW_WRAP|STE_MENU_VIEW_GUI|STE_MENU_VIEW_FOLD|STE_MENU_VIEW_ZOOM|STE_MENU_VIEW_FULLSCREEN
};

// Menu items to create in wxSTEditorMenuManager::CreateBookmarkMenu
enum STE_BookmarkMenuItemType
{
    STE_MENU_BOOKMARK_DEFAULT = 0x00000001  // a bookmark menu for add/clear/first/next...
};

// Menu items to create in wxSTEditorMenuManager::CreatePrefsMenu
enum STE_PrefsMenuItemType
{
    STE_MENU_PREFS_DLG       = 0x00000001, // preferences/styles/langs dialog
    STE_MENU_PREFS_INDENT    = 0x00000002, // use tab, tab indents, etc...
    STE_MENU_PREFS_EOL       = 0x00000004, // EOL setting
    STE_MENU_PREFS_SAVE      = 0x00000008, // save preferences
    STE_MENU_PREFS_DEFAULT   = STE_MENU_PREFS_DLG|STE_MENU_PREFS_INDENT|STE_MENU_PREFS_EOL|STE_MENU_PREFS_SAVE
};

// Menu items to create in wxSTEditorMenuManager::CreateWindowMenu
enum STE_WindowMenuItemType
{
    STE_MENU_WINDOW_SPLIT       = 0x00000001, // split/unsplit editor
    STE_MENU_WINDOW_FILECHOOSER = 0x00000002, // show hide file chooser sidepanel
    STE_MENU_WINDOW_PREVNEXT    = 0x00000004, // previous/next page for notebook
    STE_MENU_WINDOW_WINDOWS     = 0x00000008, // show a windows selection dialog, for notebook
    STE_MENU_WINDOW_DEFAULT     = STE_MENU_WINDOW_SPLIT
};

// Menu items to create in wxSTEditorMenuManager::CreateHelpMenu
enum STE_HelpMenuItemType
{
    STE_MENU_HELP_ABOUT   = 0x00000001, // help dialog
    STE_MENU_HELP_DEFAULT = STE_MENU_HELP_ABOUT
};

// Tools to create in wxSTEditorMenuManager::CreateToolBar
enum STE_ToolbarToolType
{
    STE_TOOLBAR_FILE_NEW          = 0x00000010,
    STE_TOOLBAR_FILE_OPEN         = 0x00000020,
    STE_TOOLBAR_FILE_SAVE         = 0x00000040,
    STE_TOOLBAR_EDIT_CUTCOPYPASTE = 0x00000100,
    STE_TOOLBAR_EDIT_UNDOREDO     = 0x00000200,
    STE_TOOLBAR_EDIT_FINDREPLACE  = 0x00000400,
    STE_TOOLBAR_EDIT_FINDCOMBO    = 0x00000800,
    STE_TOOLBAR_BOOKMARK          = 0x00001000,
    STE_TOOLBAR_TOOLS = STE_TOOLBAR_FILE_NEW|STE_TOOLBAR_FILE_OPEN|STE_TOOLBAR_FILE_SAVE|STE_TOOLBAR_EDIT_CUTCOPYPASTE|STE_TOOLBAR_EDIT_UNDOREDO|STE_TOOLBAR_EDIT_FINDREPLACE|STE_TOOLBAR_BOOKMARK
};

//-----------------------------------------------------------------------------
// Menu items for an insert char menu for the find/replace dialog and
//  insert dialog

enum STE_InsertCharsMenuType
{
    STE_MENU_INSERTCHARS_CHARS    = 0x00000001, // normals chars \t\r\n
    STE_MENU_INSERTCHARS_REGEXP   = 0x00000002, // regexp strings
};

//-----------------------------------------------------------------------------
// wxSTEditorMenuManager - a holding place for menu generating code
//
//
//
// Get's rid of static members of wxSTEditor since the Frame
//  creates virtually identical menus as the editor's popup menu.
//-----------------------------------------------------------------------------

class WXDLLIMPEXP_STEDIT wxSTEditorMenuManager
{
public:
    wxSTEditorMenuManager() { Init(); } // everything set to 0

    wxSTEditorMenuManager(int menuOptionTypes, // = 0 or STE_MENU_NOTEBOOK,
                          int fileMenuItemTypes     = STE_MENU_FILE_DEFAULT,
                          int editMenuItemTypes     = STE_MENU_EDIT_DEFAULT,
                          int toolsMenuItemTypes    = STE_MENU_TOOLS_DEFAULT,
                          int viewMenuItemTypes     = STE_MENU_VIEW_DEFAULT,
                          int bookmarkMenuItemTypes = STE_MENU_BOOKMARK_DEFAULT,
                          int prefsMenuItemTypes    = STE_MENU_PREFS_DEFAULT,
                          int winMenuItemTypes      = STE_MENU_WINDOW_DEFAULT,
                          int helpMenuItemTypes     = STE_MENU_HELP_DEFAULT,
                          int toolBarToolTypes      = STE_TOOLBAR_TOOLS)
    {
        Init();
        m_menuOptionTypes = menuOptionTypes;
        m_menuItemTypes[STE_MENU_FILE_MENU]     = fileMenuItemTypes;
        m_menuItemTypes[STE_MENU_EDIT_MENU]     = editMenuItemTypes;
        m_menuItemTypes[STE_MENU_TOOLS_MENU]    = toolsMenuItemTypes;
        m_menuItemTypes[STE_MENU_VIEW_MENU]     = viewMenuItemTypes;
        m_menuItemTypes[STE_MENU_BOOKMARK_MENU] = bookmarkMenuItemTypes;
        m_menuItemTypes[STE_MENU_PREFS_MENU]    = prefsMenuItemTypes;
        m_menuItemTypes[STE_MENU_WINDOW_MENU]   = winMenuItemTypes;
        m_menuItemTypes[STE_MENU_HELP_MENU]     = helpMenuItemTypes;
        m_toolBarToolTypes = toolBarToolTypes;
    }

    virtual ~wxSTEditorMenuManager() {}

    // ------------------------------------------------------------------------
    // Convenience functions to call after using the default constructor
    //   to set up the flags    and before use
    void CreateForSinglePage();
    void CreateForNotebook();

    // ------------------------------------------------------------------------
    // Get/Set the menu option, item, and toolbar tool types you want to have
    // created when calling the CreateMenu/Toolbar functions.
    // These are only for storage of the values for the CreateXXX functions and
    // are not used again so feel free to change them as necessary between
    // calls to the Create functions.

    // Get/Has/SetMenuOptionsType are combinations of enum STE_MenuOptionsType
    // Get/Has/SetMenuItemTypes are for the creation of specific menu items
    //    menu_type is the enum STE_MenuType
    //    menu_item are combinations of the appropriate enum
    //       STE_File/Edit/Tools/XXXMenuItemType based on the menu_type.
    // Get/Has/SetToolbarTools are combinations of enum STE_ToolbarToolType

    int GetMenuOptionTypes() const              { return m_menuOptionTypes; }
    int GetMenuItemTypes( int menu_type ) const { return m_menuItemTypes[menu_type]; }
    int GetToolbarToolTypes() const             { return m_toolBarToolTypes; }

    bool HasMenuOptionType( int menu_opt ) const               { return (menu_opt & GetMenuOptionTypes()) != 0; }
    bool HasMenuItemType( int menu_type, int menu_item ) const { return (menu_item & GetMenuItemTypes(menu_type)) != 0; }
    bool HasToolbarToolType( int tool_opt ) const              { return (tool_opt & GetToolbarToolTypes()) != 0; }

    void SetMenuOptionType( int menu_opt, bool val )               { m_menuOptionTypes          = STE_SETBIT(m_menuOptionTypes, menu_opt, val); }
    void SetMenuItemType( int menu_type, int menu_item, bool val ) { m_menuItemTypes[menu_type] = STE_SETBIT(m_menuItemTypes[menu_type], menu_item, val); }
    void SetToolbarToolType( int tool_opt, bool val )              { m_toolBarToolTypes         = STE_SETBIT(m_toolBarToolTypes, tool_opt, val); }

    void SetMenuOptions( int menu_opt )                { m_menuOptionTypes          = menu_opt; }
    void SetMenuItems( int menu_type, int menu_items ) { m_menuItemTypes[menu_type] = menu_items; }
    void SetToolbarTools( int tool_opt )               { m_toolBarToolTypes         = tool_opt; }

    // ------------------------------------------------------------------------
    // You adjust the SetMenuOptionType and SetMenuItemType as necessary before
    // calling these Create functions to have the appropriate menus/tools added

    // Create a menu, if menu != NULL then append the items, else create a new
    // menu. You must delete the returned menu or attach it to a menubar.
    // returns NULL (if NULL input menu) and no items are added, check for this
    virtual wxMenu* CreateEditorPopupMenu(wxMenu *menu = NULL) const;
    // Create or add items to a menu appropriate for the splitter window's sash
    //   you must delete or attach the menu to a menubar when done
    virtual wxMenu* CreateSplitterPopupMenu(wxMenu *menu = NULL) const;
    // Create or add items to a menu appropriate for the notebook's tabs
    //   you must delete or attach the menu to a menubar when done
    virtual wxMenu* CreateNotebookPopupMenu(wxMenu *menu = NULL) const;

    // Fill a wxMenuBar for a wxFrame using the items set in SetMenuItemType.
    //   The menuBar must not be NULL, returns true if anything was added
    virtual bool CreateMenuBar(wxMenuBar *menuBar, bool for_frame = true) const;
    // Fill the wxToolBar with items set in SetToolbarToolType.
    //   The toolBar must not be NULL, returns true if anything was added.
    virtual bool CreateToolBar(wxToolBar *toolBar) const;

    // All of these create and/or append items to the menu
    // returns NULL (if NULL input menu) if no items are added, check for this

    // Create menu items where menu_types = enum STE_FileMenuItemType
    //   the Close item is added only if the option STE_MENU_FRAME is set
    virtual wxMenu* CreateFileMenu(wxMenu *menu = NULL) const;
    // Create menu items where menu_types = enum STE_EditMenuItemType
    virtual wxMenu* CreateEditMenu(wxMenu *menu = NULL) const;
    // Create menu items where menu_types = enum STE_ToolsMenuItemType
    virtual wxMenu* CreateToolsMenu(wxMenu *menu = NULL) const;
    // Create menu items where menu_types = enum STE_ViewMenuItemType
    virtual wxMenu* CreateViewMenu(wxMenu *menu = NULL) const;
    // Create menu items where menu_types = enum STE_BookmarkMenuItemType
    virtual wxMenu* CreateBookmarkMenu(wxMenu *menu = NULL) const;
    // Create menu items where menu_types = enum STE_PrefMenuItemType
    virtual wxMenu* CreatePreferenceMenu(wxMenu *menu = NULL) const;
    // Create menu items where menu_types = enum STE_WindowMenuItemType
    virtual wxMenu* CreateWindowMenu(wxMenu *menu = NULL) const;
    // Create menu items where menu_types = enum STE_HelpMenuItemType
    //   only set if the option STE_MENU_FRAME is set
    virtual wxMenu* CreateHelpMenu(wxMenu *menu = NULL) const;

    // ------------------------------------------------------------------------
    // Create an insert menu for the find/replace and insert dialogs.
    //  types is ored values of enum STE_InsertCharsMenuType

    static wxMenu* CreateInsertCharsMenu(wxMenu *menu = NULL,
                                         int types = STE_MENU_INSERTCHARS_CHARS);

    // ------------------------------------------------------------------------
    // Helper function to delete an item in the menu. If clean_sep, any extra
    //   separators will be deleted (eg. two in a row)
    //   Can use this to customize the popupmenu even more than than what you
    //   can do with CreatePopupMenu.
    void DestroyMenuItem(wxMenu *menu, int menu_id, bool clean_sep = true) const;

    // Helper function to create a new wxMenuItem for the menu with a bitmap
    //  in a single line.
    //  This doesn't attach the item to the menu,
    //    use menu->Append/Insert(stemm.MenuItem(menu, ...));
    wxMenuItem *MenuItem(wxMenu *menu, wxWindowID win_id,
                         const wxString &text,
                         const wxString &help = wxEmptyString,
                         wxItemKind kind = wxITEM_NORMAL,
                         const wxBitmap &bitmap = wxNullBitmap) const;

    // ------------------------------------------------------------------------
    // Create an wxAcceleratorTable from a wxMenu and/or wxMenuBar
    wxAcceleratorTable CreateAcceleratorTable(const wxMenu* menu, const wxMenuBar* menuBar);
    // helper function - Add items from a wxMenu/wxMenuBar (either can be NULL)
    //  to a wxArrayPtrVoid array of 'new' wxAcceleratorEntries.
    //  Returns true if any were added.
    //  You must delete the entries when done with them
    bool GetAcceleratorEntries(const wxMenu* menu, const wxMenuBar* menuBar,
                               wxArrayPtrVoid& entries) const;
    // helper function=Create an wxAcceleratorTable from array of wxAcceleratorEntries
    wxAcceleratorTable CreateAcceleratorTable(wxArrayPtrVoid& entries);

    // ------------------------------------------------------------------------
    // Enable/disable all items that are associated with the editor.
    //  eg. if the notebook has no pages call with enable false
    virtual void EnableEditorItems(bool enable, wxMenu *menu,
                                   wxMenuBar *menuBar, wxToolBar *toolBar);
    // remembers last value of the call to EnableEditorItems (initially true)
    bool HasEnabledEditorItems() const { return m_enabledEditorItems; }

    // These are extra wxWindowIDs to enable for EnableEditorItems
    wxArrayInt* GetEnableEditorIDs() { return &m_enableItemsArray; }

    // ------------------------------------------------------------------------
    // Fail-safe ways to enable menu/tool items, returns sucess
    // menu, menuBar, and/or toolBar can be NULL, ids don't have to exist
    static bool DoEnableItem(wxMenu *menu, wxMenuBar *menuBar, wxToolBar *toolBar,
                             wxWindowID menu_id, bool val);
    static bool DoCheckItem(wxMenu *menu, wxMenuBar *menuBar, wxToolBar *toolBar,
                            wxWindowID menu_id, bool val);
    static bool DoSetTextItem(wxMenu *menu, wxMenuBar *menuBar,
                              wxWindowID menu_id, const wxString &val);

    // -----------------------------------------------------------------------
    // implementation

    bool       m_enabledEditorItems;
    wxArrayInt m_enableItemsArray;

    int        m_menuOptionTypes;
    wxArrayInt m_menuItemTypes;
    int        m_toolBarToolTypes;

private:
    void Init();
};

//-----------------------------------------------------------------------------
// wxSTEditorArtProvider - a holding place for our art for menu items and
//  toolbar tools.
//
// The XPM files located in the "art" directory contain the images used by
//  this art provider. If you wish to use you own images then just call
//  wxArtProvider::PushProvider(new myArtProvider);
//  and have it return your own bitmaps using the wxArtIDs set below.
//-----------------------------------------------------------------------------
#include "wx/artprov.h"

#define wxART_STEDIT                wxART_MAKE_CLIENT_ID(wxART_STEDIT)

#define wxART_STEDIT_NEW            wxART_MAKE_ART_ID(wxART_STEDIT_NEW)
#define wxART_STEDIT_OPEN           wxART_MAKE_ART_ID(wxART_STEDIT_OPEN)
#define wxART_STEDIT_SAVE           wxART_MAKE_ART_ID(wxART_STEDIT_SAVE)
#define wxART_STEDIT_SAVEALL        wxART_MAKE_ART_ID(wxART_STEDIT_SAVEALL)
#define wxART_STEDIT_SAVEAS         wxART_MAKE_ART_ID(wxART_STEDIT_SAVEAS)
#define wxART_STEDIT_PRINT          wxART_MAKE_ART_ID(wxART_STEDIT_PRINT)
#define wxART_STEDIT_PRINTPREVIEW   wxART_MAKE_ART_ID(wxART_STEDIT_PRINTPREVIEW)
#define wxART_STEDIT_PRINTSETUP     wxART_MAKE_ART_ID(wxART_STEDIT_PRINTSETUP)
#define wxART_STEDIT_PRINTPAGESETUP wxART_MAKE_ART_ID(wxART_STEDIT_PRINTPAGESETUP)
#define wxART_STEDIT_EXIT           wxART_MAKE_ART_ID(wxART_STEDIT_EXIT)
#define wxART_STEDIT_CUT            wxART_MAKE_ART_ID(wxART_STEDIT_CUT)
#define wxART_STEDIT_COPY           wxART_MAKE_ART_ID(wxART_STEDIT_COPY)
#define wxART_STEDIT_PASTE          wxART_MAKE_ART_ID(wxART_STEDIT_PASTE)
#define wxART_STEDIT_FIND           wxART_MAKE_ART_ID(wxART_STEDIT_FIND)
#define wxART_STEDIT_FINDNEXT       wxART_MAKE_ART_ID(wxART_STEDIT_FINDNEXT)
#define wxART_STEDIT_FINDDOWN       wxART_MAKE_ART_ID(wxART_STEDIT_FINDDOWN)
#define wxART_STEDIT_REPLACE        wxART_MAKE_ART_ID(wxART_STEDIT_REPLACE)
#define wxART_STEDIT_UNDO           wxART_MAKE_ART_ID(wxART_STEDIT_UNDO)
#define wxART_STEDIT_REDO           wxART_MAKE_ART_ID(wxART_STEDIT_REDO)

class WXDLLIMPEXP_STEDIT wxSTEditorArtProvider : public wxArtProvider
{
public:
    wxSTEditorArtProvider() {}

    virtual wxBitmap CreateBitmap(const wxArtID& id,
                                  const wxArtClient& client,
                                  const wxSize& size);
};

#endif  // _STEMENUM_H_

