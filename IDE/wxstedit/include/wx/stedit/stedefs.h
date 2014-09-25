///////////////////////////////////////////////////////////////////////////////
// File:        stedefs.h
// Purpose:     wxSTEditor definitions, constants and globals
// Maintainer:
// Created:     2003-04-04
// RCS-ID:      $Id: stedefs.h,v 1.46 2007/05/15 03:27:39 jrl1 Exp $
// Copyright:   (c) John Labenski, Otto Wyss
// Licence:     wxWidgets licence
///////////////////////////////////////////////////////////////////////////////

/**
 * Updated by Florian Rival to use the library directly in GDevelop
 * ( Commented out some defines -- see below )
 */

#ifndef _STEDEFS_H_
#define _STEDEFS_H_

// this include is required for WXDLLEXPORT definition...
#include "wx/defs.h"
#include "wx/dlimpexp.h"

// Include backward compatibility macros to allow this to work with wx2.4
//    This is no longer tested, 2/13/2007
#include "wx/stedit/wx24defs.h"
// Include wxStyledTextCtrl
#include "wx/stc/stc.h"

// Include our setup file that includes/excludes the different language
//   information for the wxSTEditorLangs.
// If you get an error on this line, maybe you forgot to copy
//   include/wx/stedit/setup0.h to include/wx/stedit/setup.h ?
#if !defined(_STESETUP_H_)
    #include "wx/stedit/setup.h"
#endif // !defined(_STESETUP_H_)

//-----------------------------------------------------------------------------
// The version of wxStEdit
//-----------------------------------------------------------------------------

#define STE_MAJOR_VERSION      1
#define STE_MINOR_VERSION      2
#define STE_RELEASE_VERSION    5
#define STE_SUBRELEASE_VERSION 0
#define STE_VERSION_STRING    wxT("wxStEdit 1.2.5")

// For non-Unix systems (i.e. when building without a configure script),
// users of this component can use the following macro to check if the
// current version is at least major.minor.release
#define wxCHECK_STE_VERSION(major,minor,release) \
    (STE_MAJOR_VERSION > (major) || \
    (STE_MAJOR_VERSION == (major) && STE_MINOR_VERSION > (minor)) || \
    (STE_MAJOR_VERSION == (major) && STE_MINOR_VERSION == (minor) && STE_RELEASE_VERSION >= (release)))

//-----------------------------------------------------------------------------
// These are our DLL macros (see the contrib libs like wxPlot)
//-----------------------------------------------------------------------------
/**
 * Updated by Florian Rival to use the library directly in GDevelop
 */
/*
#ifdef WXMAKINGDLL_STEDIT
    #define WXDLLIMPEXP_STEDIT WXEXPORT
    #define WXDLLIMPEXP_DATA_STEDIT(type) WXEXPORT type
#elif defined(WXUSINGDLL)
    #define WXDLLIMPEXP_STEDIT WXIMPORT
    #define WXDLLIMPEXP_DATA_STEDIT(type) WXIMPORT type
#else // not making nor using DLL*/
    #define WXDLLIMPEXP_STEDIT
    #define WXDLLIMPEXP_DATA_STEDIT(type) type
//#endif

//-----------------------------------------------------------------------------
// Generic convenience defines
//-----------------------------------------------------------------------------

#define STE_ARTBMP(id) wxArtProvider::GetBitmap(id, wxART_STEDIT)

#define STE_HASBIT(value, bit)      (((value) & (bit)) != 0)
#define STE_SETBIT(value, bit, set) ((set) ? (value)|(bit) : (value)&(~(bit)))

#define STE_MM wxSTEditorMenuManager

//-----------------------------------------------------------------------------
// Use wxHtmlEasyPrinting instead of normal printing
//   eg. in your build files use compiler flag -D STE_USE_HTML_PRINT=1
//-----------------------------------------------------------------------------

#ifndef STE_USE_HTML_PRINT
    #define STE_USE_HTML_PRINT 0
#endif

//-----------------------------------------------------------------------------
// Forward declaration of the wxSTEditor classes
//-----------------------------------------------------------------------------

class WXDLLIMPEXP_STEDIT wxSTEditor;                    // stedit.h
class WXDLLIMPEXP_STEDIT wxSTEditorEvent;

class WXDLLIMPEXP_STEDIT wxSTEditorSplitter;            // stesplit.h

class WXDLLIMPEXP_STEDIT wxSTEditorNotebook;            // stenoteb.h

class WXDLLIMPEXP_STEDIT wxSTEditorFrame;               // steframe.h
class WXDLLIMPEXP_STEDIT wxSTEditorFrameFileDropTarget;

class WXDLLIMPEXP_STEDIT wxSTEditorOptions;             // steopts.h

class WXDLLIMPEXP_STEDIT wxSTEditorMenuManager;         // stemenum.h

class WXDLLIMPEXP_STEDIT wxSTEditorPrefs;               // steprefs.h
class WXDLLIMPEXP_STEDIT wxSTEditorStyles;              // stestyls.h
class WXDLLIMPEXP_STEDIT wxSTEditorLangs;               // stelangs.h

class WXDLLIMPEXP_STEDIT wxSTEditorFindReplacePanel;    // stefindr.h
class WXDLLIMPEXP_STEDIT wxSTEditorFindReplaceDialog;
class WXDLLIMPEXP_STEDIT wxSTEditorFindReplaceData;

class WXDLLIMPEXP_STEDIT wxSTEditorPropertiesDialog;    // stedlgs.h
class WXDLLIMPEXP_STEDIT wxSTEditorInsertTextDialog;
class WXDLLIMPEXP_STEDIT wxSTEditorPrefDialog;

class WXDLLIMPEXP_STEDIT wxSTEditorPrintout;            // steprint.h
class WXDLLIMPEXP_STEDIT wxSTEditorPrintOptionsDialog;

//-----------------------------------------------------------------------------
// Maximum number of notebook pages, should be enough? You can readjust it
//  in the wxSTEditorNotebook.

#define STN_NOTEBOOK_PAGES_DEFAULT_MAX 200  // default max number of pages
#define STN_NOTEBOOK_PAGES_MAX         1000 // max number of pages before menu
                                            // IDs start to conflict

//-----------------------------------------------------------------------------
// STE_StateType - State of the wxSTEditor
//   see wxSTEditor::GetState and wxSTEditorEvent::GetState
//-----------------------------------------------------------------------------

enum STE_StateType
{
    STE_MODIFIED   = 0x0001, // the document has been modified
    STE_CANCUT     = 0x0002, // can cut, some text is selected and !readonly
    STE_CANCOPY    = 0x0004, // can copy, some text is selected
    STE_CANPASTE   = 0x0008, // can paste, text in clipboard and !readonly
    STE_CANUNDO    = 0x0010, // possible to undo
    STE_CANREDO    = 0x0020, // possible to redo
    STE_CANSAVE    = 0x0040, // is modified and has valid filename
    STE_CANFIND    = 0x0080, // possible to find, false if previous find failed

    STE_FILENAME   = 0x0100  // not a state, flag for wxSTEditorEvent
                             // saying that the editor's filename has changed
};

//-----------------------------------------------------------------------------
// STE_MarginType - predefined margin types and their number
//-----------------------------------------------------------------------------

enum STE_MarginType
{
    STE_MARGIN_NUMBER = 0, // line numbers are displayed here
    STE_MARGIN_MARKER = 1, // bookmark markers and others can be displayed here
    STE_MARGIN_FOLD   = 2, // code folding margin

    STE_MARGIN_0 = 0,      // these just make the code a little more readable
    STE_MARGIN_1 = 1,
    STE_MARGIN_2 = 2
};

//-----------------------------------------------------------------------------
// STE_MarkerType - predefined margin marker type,
//
// Markers are a little tricky, here's some sample code
//   MarkerNext(line, 1<<STE_MARKER_BOOKMARK);
//   MarkerPrevious(line, 1<<STE_MARKER_BOOKMARK)
//   MarkerDeleteAll(STE_MARKER_BOOKMARK);
//
//   if ((MarkerGet(line) & (1<<STE_MARKER_BOOKMARK)) != 0)
//       MarkerDelete(line, STE_MARKER_BOOKMARK);
//   else
//       MarkerAdd(line, STE_MARKER_BOOKMARK);
//-----------------------------------------------------------------------------

enum STE_MarkerType
{
    STE_MARKER_BOOKMARK = 0, // bookmarks use this (0 means at bottom)
    STE_MARKER__MAX          // start your own markers at STE_MARKER__MAX
                             // to avoid any conflicts
};

//-----------------------------------------------------------------------------
// IDs of all the menus, toolbar tools, windows
//-----------------------------------------------------------------------------

#ifndef ID_STE__FIRST
    #define ID_STE__FIRST 100 // first menu/window ID value
#endif

enum
{
    // ------------------------------------------------------------------------
    // IDs of wxSTEditorPrefs menu items, same order as enum STE_PrefType
    // note: starts at ID_STE__FIRST ends at ID_STE_PREF__LAST
    //       see scintilla/src/ScintillaBase.h need to skip over idcmdCopy...
    ID_STE_PREF__FIRST = ID_STE__FIRST,
    ID_STE_PREF_HIGHLIGHT_SYNTAX = ID_STE_PREF__FIRST,
    ID_STE_PREF_HIGHLIGHT_PREPROC,
    ID_STE_PREF_HIGHLIGHT_BRACES,
    ID_STE_PREF_LOAD_INIT_LANG,
    ID_STE_PREF_LOAD_UNICODE,
    ID_STE_PREF_WRAP_MODE,
    ID_STE_PREF_WRAP_VISUALFLAGS,       // not a menu item
    ID_STE_PREF_WRAP_VISUALFLAGSLOC,    // not a menu item
    ID_STE_PREF_WRAP_STARTINDENT,       // not a menu item
    ID_STE_PREF_ZOOM,
    ID_STE_PREF_VIEW_EOL,
    ID_STE_PREF_VIEW_WHITESPACE,
    ID_STE_PREF_INDENT_GUIDES,
    ID_STE_PREF_EDGE_MODE,
    ID_STE_PREF_EDGE_COLUMN,
    ID_STE_PREF_VIEW_LINEMARGIN,
    ID_STE_PREF_VIEW_MARKERMARGIN,
    ID_STE_PREF_VIEW_FOLDMARGIN,
    ID_STE_PREF_USE_TABS,
    ID_STE_PREF_TAB_INDENTS,
    ID_STE_PREF_TAB_WIDTH,
    ID_STE_PREF_INDENT_WIDTH,
    ID_STE_PREF_BACKSPACE_UNINDENTS,
    ID_STE_PREF_AUTOINDENT,
    ID_STE_PREF_CARET_LINE_VISIBLE,     // not a menu item
    ID_STE_PREF_CARET_WIDTH,            // not a menu item
    ID_STE_PREF_CARET_PERIOD,           // not a menu item
    ID_STE_PREF_CARET_POLICY_X,         // not a menu item
    ID_STE_PREF_CARET_POLICY_Y,         // not a menu item
    ID_STE_PREF_CARET_SLOP_X,           // not a menu item
    ID_STE_PREF_CARET_SLOP_Y,           // not a menu item
    ID_STE_PREF_VISIBLE_POLICY,         // not a menu item
    ID_STE_PREF_VISIBLE_SLOP,           // not a menu item
    ID_STE_PREF_EOL_MODE,
    ID_STE_PREF_SELECTION_MODE,         // FIXME unable to have persistent rect sel work w/ GTK
    ID_STE_PREF_PRINT_MAGNIFICATION,    // not a menu item
    ID_STE_PREF_PRINT_COLOURMODE,       // not a menu item
    ID_STE_PREF_PRINT_WRAPMODE,         // not a menu item
    ID_STE_PREF_PRINT_LINENUMBERS,      // not a menu item
    ID_STE_PREF_FOLD_FLAGS,             // not a menu item
    ID_STE_PREF_FOLD_STYLES,            // not a menu item
    ID_STE_PREF_FOLDMARGIN_STYLE,       // not a menu item
    ID_STE_PREF_BUFFERED_DRAW,          // not a menu item
    ID_STE_PREF_TWOPHASE_DRAW,          // not a menu item
    ID_STE_PREF_LAYOUT_CACHE,           // not a menu item
    ID_STE_PREF_USEANTIALIASING,        // not a menu item
    ID_STE_PREF_SAVE_REMOVE_WHITESP,    // not a menu item
    ID_STE_PREF_SAVE_CONVERT_EOL,       // not a menu item

    // non user preferences - these are probably not useful to show to users
    // but we keep them here to keep in sync with STE_PrefType
    ID_STE_PREF_HORIZ_SCROLLBAR,
    ID_STE_PREF_VERT_SCROLLBAR,
    ID_STE_PREF_MARGIN0_TYPE,
    ID_STE_PREF_MARGIN1_TYPE,
    ID_STE_PREF_MARGIN2_TYPE,
    ID_STE_PREF_MARGIN0_WIDTH,
    ID_STE_PREF_MARGIN1_WIDTH,
    ID_STE_PREF_MARGIN2_WIDTH,
    ID_STE_PREF_MARGIN0_MASK,
    ID_STE_PREF_MARGIN1_MASK,
    ID_STE_PREF_MARGIN2_MASK,
    ID_STE_PREF_MARGIN0_SENSITIVE,
    ID_STE_PREF_MARGIN1_SENSITIVE,
    ID_STE_PREF_MARGIN2_SENSITIVE,
    ID_STE_PREF_BOOKMARK_DCLICK,

    ID_STE_PREF_AUTOC_STOPS,
    ID_STE_PREF_AUTOC_SEPARATOR,
    ID_STE_PREF_AUTOC_FILLUPS,
    ID_STE_PREF_AUTOC_CANCELATSTART,
    ID_STE_PREF_AUTOC_CHOOSESINGLE,
    ID_STE_PREF_AUTOC_IGNORECASE,
    ID_STE_PREF_AUTOC_AUTOHIDE,
    ID_STE_PREF_AUTOC_DROPRESTOFWORD,
    ID_STE_PREF_AUTOC_TYPESEPARATOR,

    ID_STE_PREF__LAST = ID_STE_PREF_AUTOC_TYPESEPARATOR,

    // ------------------------------------------------------------------------
    // List of IDs for the menu items in the order they're used
    // See : wxSTEditorMenuManager::CreateXXXMenu() functions and others

    // File menu items --------------------------------------------------------
    //wxID_NEW,
    //wxID_OPEN,
    //wxID_SAVE,
    //wxID_SAVEAS,
    ID_STE_EXPORT,
    //ID_STN_SAVE_ALL             STE_MENU_NOTEBOOK
    //ID_STN_CLOSE_PAGE,          STE_MENU_FRAME
    //ID_STN_CLOSE_ALL,           STE_MENU_FRAME|STE_MENU_NOTEBOOK
    ID_STE_PROPERTIES,
    //wxID_PRINT,
    //wxID_PREVIEW,
    //wxID_PRINT_SETUP,
    ID_STE_PRINT_PAGE_SETUP,
    ID_STE_PRINT_OPTIONS,
    //wxID_EXIT                   STE_MENU_FRAME
    // Edit menu items --------------------------------------------------------
    //wxID_CUT,
    //wxID_COPY,
    ID_STE_COPY_PRIMARY,  // unix copy to primary selection
    //wxID_PASTE,
    ID_STE_PASTE_RECT,
    //ID_STE_PREF_SELECTION_MODE, // rect sel check only
    //wxID_SELECTALL,
    ID_STE_LINE_CUT,
    ID_STE_LINE_COPY,
    ID_STE_LINE_DELETE,
    ID_STE_LINE_TRANSPOSE,
    ID_STE_LINE_DUPLICATE,
    //wxID_FIND,
    ID_STE_FIND_NEXT,
    ID_STE_FIND_DOWN,
    ID_STE_REPLACE,
    ID_STE_GOTO_LINE,
    //wxID_UNDO,
    //wxID_REDO,
    ID_STE_READONLY,
    // Tools menu items -------------------------------------------------------
    ID_STE_UPPERCASE,
    ID_STE_LOWERCASE,
    ID_STE_INCREASE_INDENT,
    ID_STE_DECREASE_INDENT,
    ID_STE_LINES_JOIN,
    ID_STE_LINES_SPLIT,
    ID_STE_TABS_TO_SPACES,
    ID_STE_SPACES_TO_TABS,
    ID_STE_CONVERT_EOL,
    ID_STE_TRAILING_WHITESPACE,
    ID_STE_INSERT_TEXT,
    ID_STE_COLUMNIZE,
    // View Menu items  -------------------------------------------------------
    //ID_STE_PREF_WRAPLINES
    //ID_STE_PREF_VIEWEOL
    //ID_STE_PREF_VIEWWHITESPACE
    //ID_STE_PREF_INDENTGUIDES
    //ID_STE_PREF_EDGEMODE
    //ID_STE_PREF_EDGECOLUMN
    //ID_STE_PREF_VIEWLINEMARGIN
    //ID_STE_PREF_VIEWMARKERMARGIN
    //ID_STE_PREF_VIEWFOLDMARGIN
    ID_STE_FOLDS_TOGGLE_CURRENT,
    ID_STE_FOLDS_COLLAPSE_LEVEL,
    ID_STE_FOLDS_EXPAND_LEVEL,
    ID_STE_FOLDS_COLLAPSE_ALL,
    ID_STE_FOLDS_EXPAND_ALL,
    //ID_STE_PREF_SYNTAXHILIGHT - FIXME this should be removed?
    //ID_STE_PREF_ZOOM
    ID_STE_SHOW_FULLSCREEN,
    // Bookmark menu items  ---------------------------------------------------
    ID_STE_BOOKMARK_TOGGLE,
    ID_STE_BOOKMARK_FIRST,
    ID_STE_BOOKMARK_PREVIOUS,
    ID_STE_BOOKMARK_NEXT,
    ID_STE_BOOKMARK_LAST,
    ID_STE_BOOKMARK_CLEAR,
    // Preference menu items  -------------------------------------------------
    ID_STE_PREFERENCES,
    //ID_STE_PREF_USETABS
    //ID_STE_PREF_TABINDENTS
    //ID_STE_PREF_BACKSPACEUNINDENTS
    //ID_STE_PREF_AUTOINDENT
    //ID_STE_PREF_TABWIDTH
    //ID_STE_PREF_INDENTWIDTH
    //ID_STE_PREF_EOLMODE
    ID_STE_SAVE_PREFERENCES,
    // Window menu items  -----------------------------------------------------
    //ID_STS_UNSPLIT,
    //ID_STS_SPLIT_HORIZ,
    //ID_STS_SPLIT_VERT,
    //ID_STF_SHOW_SIDEBAR,
    //ID_STN_WIN_PREVIOUS,
    //ID_STN_WIN_NEXT,
    //ID_STN_WINDOWS,

    // Menu items used by the wxSTEditorSplitter's menu
    ID_STS_UNSPLIT,
    ID_STS_SPLIT_HORIZ,
    ID_STS_SPLIT_VERT,

    // Menu items used for wxSTEditorNotebook's menu
    ID_STN_SAVE_ALL,
    ID_STN_CLOSE_PAGE,
    ID_STN_CLOSE_ALL,
    ID_STN_WINDOWS,
    ID_STN_WIN_PREVIOUS,
    ID_STN_WIN_NEXT,
    ID_STN_GOTO_PAGE_START,
    ID_STN_CLOSE_PAGE_START = ID_STN_GOTO_PAGE_START+STN_NOTEBOOK_PAGES_MAX,

    // Menu items used for wxSTEditorFrame
    ID_STF_SHOW_SIDEBAR = ID_STN_CLOSE_PAGE_START+STN_NOTEBOOK_PAGES_MAX,
    ID_STF_SIDE_SPLITTER,
    ID_STF_SIDE_NOTEBOOK,
    ID_STF_MAIN_SPLITTER,

    // Menu items for the insert character menu for dialogs
    ID_STEDLG_INSERTMENU_TAB,
    ID_STEDLG_INSERTMENU_CR,
    ID_STEDLG_INSERTMENU_LF,

    ID_STEDLG_INSERTMENURE_ANYCHAR,
    ID_STEDLG_INSERTMENURE_RANGE,
    ID_STEDLG_INSERTMENURE_NOTRANGE,
    ID_STEDLG_INSERTMENURE_BEGINLINE,
    ID_STEDLG_INSERTMENURE_ENDLINE,
    ID_STEDLG_INSERTMENURE_TAGEXPR,
    ID_STEDLG_INSERTMENURE_0MATCHES,
    ID_STEDLG_INSERTMENURE_1MATCHES,
    ID_STEDLG_INSERTMENURE_01MATCHES,
    ID_STEDLG_INSERTMENURE_GROUP,

    ID_STEDLG_INSERTMENURE_ALPHANUM,
    ID_STEDLG_INSERTMENURE_ALPHA,
    ID_STEDLG_INSERTMENURE_NUMERIC,
    ID_STEDLG_INSERTMENURE_TAB,

    // ------------------------------------------------------------------------
    // Non menuitem IDs

    ID_STE_VSCROLLBAR,
    ID_STE_HSCROLLBAR,
    ID_STS_VSPLITBUTTON,
    ID_STS_HSPLITBUTTON,

    ID_STE_TOOLBAR_FIND_COMBO,
    ID_STEDLG_PREF_NOTEBOOK,    // id of the notebook in the pref dialog

    // ------------------------------------------------------------------------
    // wxMenu ID's when attached as a submenu or to a menubar

    ID_STE_MENU_FILE,           // id of the File menu
    ID_STE_MENU_EDIT,           // id of the Edit menu
    ID_STE_MENU_TOOLS,          // id of the Tools menu
    ID_STE_MENU_VIEW,           // id of the View menu
    ID_STE_MENU_BOOKMARK,       // id of the Bookmark menu
    ID_STE_MENU_PREF,           // id of the Preferences menu
    ID_STE_MENU_WINDOW,         // id of the Window menu
    ID_STE_MENU_HELP,           // id of the Help menu

    ID_STE_MENU_LINE,           // id of the Line Edit submenu in Edit
    ID_STE_MENU_GUIDES,         // id of the Guides submenu in View
    ID_STE_MENU_MARGINS,        // id of the Margins submenu in View
    ID_STE_MENU_FOLDING,        // id of the Folds submenu in View

    // wxMenu ID's for menu's attached to the STN menu
    ID_STN_MENU_GOTO,           // id of the Goto page submenu
    ID_STN_MENU_CLOSE,          // id of the Close page submenu

    // wxMenu ID of the regexp menu on the insert chars menu
    ID_STEDLG_MENU_INSERTMENURE,

    // ------------------------------------------------------------------------
    // Dialog and Window IDs

    // ID of the find replace dialog
    ID_STE_FINDREPLACE_DIALOG,

    // ID of the wxListBox used to display files for the STF
    ID_STF_FILE_TREECTRL,

    // IDs of the editors used in the wxSTEditorPrefDialogPageStyles
    ID_STEDLG_STYLE_COLOUR_EDITOR,
    ID_STEDLG_STYLE_STYLE_EDITOR,

    ID_STE__LAST = ID_STEDLG_STYLE_STYLE_EDITOR
};

//-----------------------------------------------------------------------------
// STE_PrefType - indexes in wxSTEditorPrefs::Get/SetPref(int pref)
//
// The name of the pref enum nearly matches wxStyledTextCtrl's function name
// If you want to be sure what the pref does, look at
//  wxSTEditorPrefs::UpdateEditor
//
// To permanently add a new pref, see comment before wxSTEditorPrefs, steprefs.h
//-----------------------------------------------------------------------------

enum STE_PrefType
{
                                    // [default value], [value type and range], description
    STE_PREF_HIGHLIGHT_SYNTAX = 0,  // true, bool, turns off lexer
    STE_PREF_HIGHLIGHT_PREPROC,     // true, bool, SetProperty("styling.within.preprocessor"
    STE_PREF_HIGHLIGHT_BRACES,      // true, bool, code in wxSTEditor
    STE_PREF_LOAD_INIT_LANG,        // true, bool, call STE::SetLanguage(filename) on LoadFile
    STE_PREF_LOAD_UNICODE,          // STE_LOAD_DEFAULT, int, enum STE_LoadFileType
    STE_PREF_WRAP_MODE,             // wxSTC_WRAP_NONE, int wxSTC_WRAP_XXX, see SetWrapMode
    STE_PREF_WRAP_VISUALFLAGS,      // wxSTC_WRAPVISUALFLAG_END, int wxSTC_WRAPVISUALFLAG_XXX, see SetWrapVisualFlags
    STE_PREF_WRAP_VISUALFLAGSLOC,   // wxSTC_WRAPVISUALFLAGLOC_DEFAULT, int wxSTC_WRAPVISUALFLAGLOC_XXX, see SetWrapVisualFlagsLocation
    STE_PREF_WRAP_STARTINDENT,      // 0, int, spaces to indent wrapped lines, see SetWrapStartIndent
    STE_PREF_ZOOM,                  // 0, int -10...20, see SetZoom
    STE_PREF_VIEW_EOL,              // false, bool, see SetViewEOL
    STE_PREF_VIEW_WHITESPACE,       // wxSTC_WS_INVISIBLE, int, wxSTC_WS_XXX, see SetViewWhiteSpace
    STE_PREF_INDENT_GUIDES,         // true,  bool, see SetIndentationGuides
    STE_PREF_EDGE_MODE,             // wxSTC_EDGE_LINE, int wxSTC_EDGE_XXX, see SetEdgeMode
    STE_PREF_EDGE_COLUMN,           // 80,    int 0...?, see SetEdgeColumn
    STE_PREF_VIEW_LINEMARGIN,       // false, bool
    STE_PREF_VIEW_MARKERMARGIN,     // false, bool
    STE_PREF_VIEW_FOLDMARGIN,       // true,  bool
    STE_PREF_USE_TABS,              // false, bool, see SetUseTabs
    STE_PREF_TAB_INDENTS,           // true,  bool, see SetTabIndents
    STE_PREF_TAB_WIDTH,             // 4,     int 0...?, see SetTabWidth
    STE_PREF_INDENT_WIDTH,          // 4,     int 0...?, see SetIndent
    STE_PREF_BACKSPACE_UNINDENTS,   // true,  bool, see SetBackSpaceUnIndents
    STE_PREF_AUTOINDENT,            // true,  bool, implemented in wxSTEditor::OnSTCCharAdded
    STE_PREF_CARET_LINE_VISIBLE,    // true,  bool, see SetCaretLineVisible
    STE_PREF_CARET_WIDTH,           // 1,     int 0...3, see SetCaretWidth
    STE_PREF_CARET_PERIOD,          // 500,   int 0...? ms per blink, see SetCaretPeriod
    STE_PREF_CARET_POLICY_X,        // wxSTC_CARET_EVEN|wxSTC_VISIBLE_STRICT|wxSTC_CARET_SLOP, int, wxSTC_CARET_XXX, see SetXCaretPolicy
    STE_PREF_CARET_POLICY_Y,        // same as X, see SetYCaretPolicy
    STE_PREF_CARET_SLOP_X,          // 1, int, number of pixels, see SetXCaretPolicy
    STE_PREF_CARET_SLOP_Y,          // 1, int, number of pixels, see SetYCaretPolicy
    STE_PREF_VISIBLE_POLICY,        // wxSTC_VISIBLE_STRICT|wxSTC_VISIBLE_SLOP, int, wxSTC_VISIBLE_XXX, see SetVisiblePolicy
    STE_PREF_VISIBLE_SLOP,          // 1, int, number of pixels, see SetVisiblePolicy
    STE_PREF_EOL_MODE,              // platform dependent, int wxSTC_EOL_CRLF, wxSTC_EOL_CR, wxSTC_EOL_LF, see SetEOLMode
    STE_PREF_SELECTION_MODE,        // -1, int wxSTC_SEL_STREAM, wxSTC_SEL_RECTANGLE, wxSTC_SEL_LINES (note wxSTC::Cancel() is off)
    STE_PREF_PRINT_MAGNIFICATION,   // -2,    int -20...20, see SetPrintMagnification
    STE_PREF_PRINT_COLOURMODE,      // wxSTC_PRINT_COLOURONWHITE, int wxSTC_PRINT_XXX, see SetPrintColourMode
    STE_PREF_PRINT_WRAPMODE,        // wxSTC_WRAP_WORD, int wxSTC_WRAP_XXX, see SetPrintWrapMode
    STE_PREF_PRINT_LINENUMBERS,     // STE_PRINT_LINENUMBERS_DEFAULT, int, see enum STE_PrintLinenumbersType
    STE_PREF_FOLD_FLAGS,            // wxSTC_FOLDFLAG_LINEBEFORE_CONTRACTED|wxSTC_FOLDFLAG_LINEAFTER_CONTRACTED, int, wxSTC_FOLDFLAG_XXX, see SetFoldFlags
    STE_PREF_FOLD_STYLES,           // STE_FOLD_STYLE_DEFAULT, int, see STE_FoldStyleType, see SetProperty
    STE_PREF_FOLDMARGIN_STYLE,      // STE_FOLDMARGIN_STYLE_SQUARES, int, see STE_FoldMarginStyleType
    STE_PREF_BUFFERED_DRAW,         // true, bool, see SetBufferedDraw
    STE_PREF_TWOPHASE_DRAW,         // true, bool, see SetTwoPhaseDraw
    STE_PREF_LAYOUT_CACHE,          // wxSTC_CACHE_PAGE, int, wxSTC_CACHE_XXX, see SetLayoutCache
    STE_PREF_USEANTIALIASING,       // true, bool, see SetUseAntiAliasing
    STE_PREF_SAVE_REMOVE_WHITESP,   // false, bool, remove trailing whitespace on save
    STE_PREF_SAVE_CONVERT_EOL,      // false, bool, convert all EOL chars to STE_PREF_EOL_MODE

    // non user preferences - these are probably not useful to show to users
    // and you will probably want to hard code their values at startup

    STE_PREF_HORIZ_SCROLLBAR,       // true, bool, see SetUseHorizontalScrollBar
    STE_PREF_VERT_SCROLLBAR,        // true, bool, see SetUseVerticalScrollBar
    STE_PREF_MARGIN0_TYPE,          // wxSTC_MARGIN_NUMBER, int, see SetMarginType
    STE_PREF_MARGIN1_TYPE,          // wxSTC_MARGIN_SYMBOL, int, see SetMarginType
    STE_PREF_MARGIN2_TYPE,          // wxSTC_MARGIN_SYMBOL, int, see SetMarginType
    STE_PREF_MARGIN0_WIDTH,         // -1 (width of "_999999"), int, see SetMarginWidth
    STE_PREF_MARGIN1_WIDTH,         // 16 (widths are set to 0 if not shown), int, see SetMarginWidth
    STE_PREF_MARGIN2_WIDTH,         // 16, int, see SetMarginWidth
    STE_PREF_MARGIN0_MASK,          // 0, int, see SetMarginMask
    STE_PREF_MARGIN1_MASK,          // ~wxSTC_MASK_FOLDERS, int, see SetMarginMask
    STE_PREF_MARGIN2_MASK,          // wxSTC_MASK_FOLDERS, int, see SetMarginMask
    STE_PREF_MARGIN0_SENSITIVE,     // false, bool, see SetMarginSensitive
    STE_PREF_MARGIN1_SENSITIVE,     // true, bool, see SetMarginSensitive
    STE_PREF_MARGIN2_SENSITIVE,     // true, bool, see SetMarginSensitive

    STE_PREF_BOOKMARK_DCLICK,       // true, bool if margin 1 is dclicked put a bookmark marker on it

    STE_PREF_AUTOC_STOPS,           // " ()[]{}<>:;.?", string, see AutoCompStops
    STE_PREF_AUTOC_SEPARATOR,       // int(' '), int, see AutoCompSetSeparator
    STE_PREF_AUTOC_FILLUPS,         // "", string,    see AutoCompSetFillUps
    STE_PREF_AUTOC_CANCELATSTART,   // true, bool,    see AutoCompSetCancelAtStart
    STE_PREF_AUTOC_CHOOSESINGLE,    // true, bool,    see AutoCompSetChooseSingle
    STE_PREF_AUTOC_IGNORECASE,      // false, bool,   see AutoCompSetIgnoreCase
    STE_PREF_AUTOC_AUTOHIDE,        // true, bool,    see AutoCompSetAutoHide
    STE_PREF_AUTOC_DROPRESTOFWORD,  // true, bool,    see AutoCompSetDropRestOfWord
    STE_PREF_AUTOC_TYPESEPARATOR,   // int('?'), int, see AutoCompSetTypeSeparator

    STE_PREF__MAX                   // number of initial built in preferences
};

//-----------------------------------------------------------------------------
// STE_PrefFlagType - additional information about the wxSTEditorPrefs
//  For wxSTEditorPrefs::Get/SetPrefFlags, determines what values are stored
//  in the pref, though the actual usage is dependent on the pref.
//-----------------------------------------------------------------------------

enum STE_PrefFlagType
{
    STE_PREF_FLAG_STRING    = 0x0000, // default is a string valued pref
    STE_PREF_FLAG_INT       = 0x0001, // pref is an int value
    STE_PREF_FLAG_BOOL      = 0x0002, // pref is a bool 0/1 value

    STE_PREF_FLAG_IGNORE    = 0x0004, // do not set the pref value for editor
    STE_PREF_FLAG_NOCONFIG  = 0x0008, // don't load/save this in the wxConfig
                                      // eg. your program "hard codes" this value
};

//-----------------------------------------------------------------------------
// STE_LoadFileType - options when loading a file
//   See wxSTEditor::LoadInputStream
//   and wxSTEditorPrefs and STE_PREF_LOAD_UNICODE
//-----------------------------------------------------------------------------

enum STE_LoadFileType
{
    // If a file(stream) starts with 0xfffe as first two chars it's probably unicode.

    STE_LOAD_DEFAULT       = 0,      // load as unicode if it has the header,
                                     //   else load as ascii

    STE_LOAD_QUERY_UNICODE = 0x0001, // popup dialog to ask if to load in unicode
                                     //   if the file starts w/ unicode signature
    STE_LOAD_ASCII         = 0x0002, // load as ascii in all cases
    STE_LOAD_UNICODE       = 0x0004, // load as unicode in all cases

    STE_LOAD_NOERRDLG      = 0x0010, // never show an error message dialog
                                     //   silent failure, return false
                                     //   this flag can be used with one of the others
};

//-----------------------------------------------------------------------------
// STE_PrintLinenumbersType - Print the line numbers in wxSTEditorPrintout?
//   See wxSTEditorPrefs and STE_PREF_PRINT_LINENUMBERS
//-----------------------------------------------------------------------------

enum STE_PrintLinenumbersType
{
    STE_PRINT_LINENUMBERS_DEFAULT, // print linenumbers if shown in editor
    STE_PRINT_LINENUMBERS_NEVER,   // never print linenumbers
    STE_PRINT_LINENUMBERS_ALWAYS   // always print linenumbers
};

//-----------------------------------------------------------------------------
// STE_FoldStyleType - different folds that the language supports translated to
//                     wxSTC::SetProperty(wxT("fold.comment"), 1/0)
// These lexer properties can be set for any lexer, they might not be used.
// For wxSTEditorPrefs STE_PREF_FOLD_STYLES
//-----------------------------------------------------------------------------

enum STE_FoldStyleType
{
    STE_FOLD_COMPACT       = 0x0001, // "fold.compact"
    STE_FOLD_COMMENT       = 0x0002, // "fold.comment"
    STE_FOLD_PREPROC       = 0x0004, // "fold.preprocessor"
    STE_FOLD_ATELSE        = 0x0008, // "fold.at.else"        c++ only

    STE_FOLD_HTML          = 0x0010, // "fold.html"
    STE_FOLD_HTMLPREP      = 0x0020, // "fold.html.preprocessor"

    STE_FOLD_DIRECTIVE     = 0x0040, // "fold.directive"
    STE_FOLD_COMMENTPY     = 0x0080, // "fold.comment.python"
    STE_FOLD_QUOTESPY      = 0x0100, // "fold.quotes.python"
    STE_FOLD_TABTIMMY      = 0x0200, // "tab.timmy.whinge.level" python indent check

    // everything set
    STE_FOLD_STYLE_DEFAULT = STE_FOLD_COMPACT|STE_FOLD_COMMENT|STE_FOLD_PREPROC|STE_FOLD_ATELSE|STE_FOLD_HTML|STE_FOLD_HTMLPREP|STE_FOLD_DIRECTIVE|STE_FOLD_COMMENTPY|STE_FOLD_QUOTESPY|STE_FOLD_TABTIMMY
};

//-----------------------------------------------------------------------------
// STE_FoldMarginStyleType - different sets of nice looking fold margin symbols
//  For wxSTEditorPrefs STE_PREF_FOLDMARGIN_STYLE
//-----------------------------------------------------------------------------

enum STE_FoldMarginStyleType
{
    STE_FOLDMARGIN_STYLE_UNSET     =-1, // the fold code won't be run
    STE_FOLDMARGIN_STYLE_ARROWS    = 0, // "..." for contracted folders, arrow pointing down for expanded
    STE_FOLDMARGIN_STYLE_CIRCLES   = 1, // Like a flattened tree control using circular headers and curved joins
    STE_FOLDMARGIN_STYLE_SQUARES   = 2, // Like a flattened tree control using square headers (default)
    STE_FOLDMARGIN_STYLE_PLUSMINUS = 3, // Plus for contracted folders, minus for expanded
};

//-----------------------------------------------------------------------------
// STE_StyleType - styles for wxSTEditorStyles controlling how different
//                 text items will appear (not all languages use every one).
//                 Scintilla uses styles 0-127 with 32-37 having special meaning
// ------------------------------------------------------------------------
// These are arbitrarily mapped to the styles that the lexer uses.
//   You can have up to STE_STYLE_LANG__MAX (10000) of them, however you
//   can only set 128 of them to scintilla, minus the hardcoded ones, at a time.
//   See wxSTEditorLangs::GetSciStyle and GetSTEStyle which does the mapping
//   per language between the two.
//
//  Additional "styles" (GUI colours) are stored after STE_STYLE_GUI_FIRST
//     these styles may make use of only some of the information (see below)
//
//  Indicators and markers are also stored here.
//-----------------------------------------------------------------------------
enum STE_StyleType
{
    STE_STYLE_DEFAULT = 0,    // 0  This style is always mapped to Scintilla's #32 default text
    STE_STYLE_KEYWORD1,
    STE_STYLE_KEYWORD2,
    STE_STYLE_KEYWORD3,
    STE_STYLE_KEYWORD4,
    STE_STYLE_KEYWORD5,
    STE_STYLE_KEYWORD6,
    STE_STYLE_COMMENT,
    STE_STYLE_COMMENTDOC,
    STE_STYLE_COMMENTLINE,
    STE_STYLE_COMMENTOTHER,   // 10  other comments line block
    STE_STYLE_CHARACTER,
    STE_STYLE_CHARACTEREOL,
    STE_STYLE_STRING,
    STE_STYLE_STRINGEOL,
    STE_STYLE_DELIMITER,
    STE_STYLE_PUNCTUATION,
    STE_STYLE_OPERATOR,
    STE_STYLE_BRACE,
    STE_STYLE_COMMAND,
    STE_STYLE_IDENTIFIER,       // 20
    STE_STYLE_LABEL,
    STE_STYLE_NUMBER,
    STE_STYLE_PARAMETER,
    STE_STYLE_REGEX,
    STE_STYLE_UUID,
    STE_STYLE_VALUE,
    STE_STYLE_PREPROCESSOR,
    STE_STYLE_SCRIPT,
    STE_STYLE_ERROR,
    STE_STYLE_UNDEFINED,        // 30
    //STE_STYLE_UNUSED,           // unused, last user style
    //STE_STYLE_DEFAULT,          // 32 = wxSTC_STYLE_DEFAULT, the background

    STE_STYLE_LANG__LAST = STE_STYLE_UNDEFINED,
    STE_STYLE_LANG__MAX = 10000,

    // ------------------------------------------------------------------------
    // Styles that scintilla hardcodes that are always set regardless of lexer

    STE_STYLE_SCINTILLA__FIRST = 10000,
    STE_STYLE_LINENUMBER = STE_STYLE_SCINTILLA__FIRST, // 33 wxSTC_STYLE_LINENUMBER
    STE_STYLE_BRACELIGHT,                              // 34 wxSTC_STYLE_BRACELIGHT
    STE_STYLE_BRACEBAD,                                // 35 wxSTC_STYLE_BRACEBAD
    STE_STYLE_CONTROLCHAR,                             // 36 wxSTC_STYLE_CONTROLCHAR font no colour
    STE_STYLE_INDENTGUIDE,                             // 37 wxSTC_STYLE_INDENTGUIDE fore/back colours
    STE_STYLE_SCINTILLA__LAST = STE_STYLE_INDENTGUIDE,

    // ------------------------------------------------------------------------
    // Extra styles/colours for the GUI are stored here

    STE_STYLE_GUI__FIRST = 20000,
    STE_STYLE_SELECTION_COLOUR = STE_STYLE_GUI__FIRST,// fore/back colours only
    STE_STYLE_WHITESPACE_COLOUR,                      // fore/back colours only
    STE_STYLE_EDGE_COLOUR,                            // fore colour only
    STE_STYLE_CARET_COLOUR,                           // fore/back colours only
    STE_STYLE_FOLD_COLOUR,                            // fore/back colours only
    STE_STYLE_GUI__LAST = STE_STYLE_FOLD_COLOUR,

    // ------------------------------------------------------------------------
    // Styles below have their own accessor functions, use them instead of
    //  the generic style methods.

    // ------------------------------------------------------------------------
    // Indicators for hilighting text (only 3) uses fore colour and style only
    // To change the indicators use wxSTEditorStyles::Get/SetIndicatorXXX
    // These values are used internally.
    //  note: scintilla uses less styles if indicators are used,
    //        see wxSTC::SetStyleBits, 5 bits = 3 indicators = 2^5 styles,
    //                                 6 bits = 2 indicators = 2^6 styles...
    STE_STYLE_INDIC__FIRST = 30000,
    STE_STYLE_INDIC_0 = STE_STYLE_INDIC__FIRST,
    STE_STYLE_INDIC_1,
    STE_STYLE_INDIC_2,
    STE_STYLE_INDIC__LAST = STE_STYLE_INDIC_2,

    // ------------------------------------------------------------------------
    // Markers for the margins
    // To change the indicators use wxSTEditorStyles::Get/SetMarkerXXX
    // These values are used internally.
    STE_STYLE_MARKER__FIRST        = 40000,

    STE_STYLE_MARKER_BOOKMARK      = STE_STYLE_MARKER__FIRST,

    STE_STYLE_MARKER_FOLDER        = STE_STYLE_MARKER__FIRST + wxSTC_MARKNUM_FOLDER,
    STE_STYLE_MARKER_FOLDEROPEN    = STE_STYLE_MARKER__FIRST + wxSTC_MARKNUM_FOLDEROPEN,
    STE_STYLE_MARKER_FOLDERSUB     = STE_STYLE_MARKER__FIRST + wxSTC_MARKNUM_FOLDERSUB,
    STE_STYLE_MARKER_FOLDERTAIL    = STE_STYLE_MARKER__FIRST + wxSTC_MARKNUM_FOLDERTAIL,
    STE_STYLE_MARKER_FOLDEREND     = STE_STYLE_MARKER__FIRST + wxSTC_MARKNUM_FOLDEREND,
    STE_STYLE_MARKER_FOLDEROPENMID = STE_STYLE_MARKER__FIRST + wxSTC_MARKNUM_FOLDEROPENMID,
    STE_STYLE_MARKER_FOLDERMIDTAIL = STE_STYLE_MARKER__FIRST + wxSTC_MARKNUM_FOLDERMIDTAIL,

    STE_STYLE_MARKER__LAST         = STE_STYLE_MARKER__FIRST + wxSTC_MARKER_MAX
};

//-----------------------------------------------------------------------------
// Some default initial values for the font
//-----------------------------------------------------------------------------

// A smallish font size that is nicely readable (your mileage may vary)
#ifndef STE_DEF_FONTSIZE
    #ifdef __WXGTK__
        #define STE_DEF_FONTSIZE 12
    #else
        #define STE_DEF_FONTSIZE 10
    #endif
#endif // #ifndef STE_DEF_FONTSIZE

// A fixed width font - courier is not great, but a reasonable start
#ifndef STE_DEF_FACENAME
    #define STE_DEF_FACENAME wxT("courier")
#endif // #ifndef STE_DEF_FACENAME

// ----------------------------------------------------------------------------
// STE_FontAttrType - Font attributes for a style
// see wxSTEditorStyle::Get/SetFontAttr(style_n, STE_STYLE_FONT_BOLD|...)
enum STE_FontAttrType
{
    STE_STYLE_FONT_NONE       = 0x0000,
    STE_STYLE_FONT_BOLD       = 0x0001,
    STE_STYLE_FONT_ITALIC     = 0x0002,
    STE_STYLE_FONT_UNDERLINED = 0x0004,
    STE_STYLE_FONT_HIDDEN     = 0x0008,
    STE_STYLE_FONT_EOLFILLED  = 0x0010,
    STE_STYLE_FONT_HOTSPOT    = 0x0020,
    // only one of these, (replacements for wxSTC_CASE_MIXED/UPPER/LOWER)
    STE_STYLE_FONT_CASEMIXED  = 0,      // default
    STE_STYLE_FONT_CASEUPPER  = 0x0080,
    STE_STYLE_FONT_CASELOWER  = 0x0100,

    STE_STYLE_FONT_MASK       = (STE_STYLE_FONT_BOLD|STE_STYLE_FONT_ITALIC|STE_STYLE_FONT_UNDERLINED|STE_STYLE_FONT_HIDDEN|STE_STYLE_FONT_EOLFILLED|STE_STYLE_FONT_HOTSPOT|STE_STYLE_FONT_CASEMIXED|STE_STYLE_FONT_CASEUPPER|STE_STYLE_FONT_CASELOWER)
};

// ----------------------------------------------------------------------------
// STE_StyleUseDefaultType - Should the default value be used instead of the set one?
// see wxSTEditorStyle::Get/SetUseDefault(style_n, STE_STYLE_USEDEFAULT_FORECOLOUR|...)
// The styles always contain values, even if the defaults are used to make it
//   easy for a user to revert to default and then back to what they set.
enum STE_StyleUseDefaultType
{
    STE_STYLE_USEDEFAULT_NONE         = 0x0000,
    STE_STYLE_USEDEFAULT_FORECOLOUR   = 0x0002,
    STE_STYLE_USEDEFAULT_BACKCOLOUR   = 0x0004,
    STE_STYLE_USEDEFAULT_FACENAME     = 0x0008,
    STE_STYLE_USEDEFAULT_FONTSIZE     = 0x0010,
    STE_STYLE_USEDEFAULT_FONTSTYLE    = 0x0020,

    STE_STYLE_USEDEFAULT_MASK         = (STE_STYLE_USEDEFAULT_FORECOLOUR|STE_STYLE_USEDEFAULT_BACKCOLOUR|STE_STYLE_USEDEFAULT_FACENAME|STE_STYLE_USEDEFAULT_FONTSIZE|STE_STYLE_USEDEFAULT_FONTSTYLE),

    // Convenience enums - what default values should be used
    STE_STYLE_USEDEFAULT_ALL          = STE_STYLE_USEDEFAULT_MASK,
    STE_STYLE_USEDEFAULT_NOFORECOLOUR = (STE_STYLE_USEDEFAULT_MASK & (~STE_STYLE_USEDEFAULT_FORECOLOUR)),
    STE_STYLE_USEDEFAULT_NOCOLOUR     = (STE_STYLE_USEDEFAULT_NOFORECOLOUR & (~STE_STYLE_USEDEFAULT_BACKCOLOUR)),
    STE_STYLE_USEDEFAULT_NOFONTSTYLE  = (STE_STYLE_USEDEFAULT_NOFORECOLOUR & (~STE_STYLE_USEDEFAULT_FONTSTYLE))
};

// ----------------------------------------------------------------------------
// STE_StyleUsesType - what parts of the style are actually used
// see wxSTEditorStyle::GetStyleUsage(style_n)
enum STE_StyleUsesType
{
    STE_STYLE_USES_FORECOLOUR = 0x0001,
    STE_STYLE_USES_BACKCOLOUR = 0x0002,
    STE_STYLE_USES_FACENAME   = 0x0004,
    STE_STYLE_USES_FONTSIZE   = 0x0008,
    STE_STYLE_USES_FONTSTYLE  = 0x0010,
    STE_STYLE_USES_STYLE      = 0x0020, // special for indicators and markers

    STE_STYLE_USES_FONT       = (STE_STYLE_USES_FACENAME|STE_STYLE_USES_FONTSIZE|STE_STYLE_USES_FONTSTYLE),
    STE_STYLE_USES_COLOUR     = (STE_STYLE_USES_FORECOLOUR|STE_STYLE_USES_BACKCOLOUR),
    STE_STYLE_USES_ALL        = (STE_STYLE_USES_COLOUR|STE_STYLE_USES_FONT),

    STE_STYLE_USES_MASK       = STE_STYLE_USES_ALL
};

//-----------------------------------------------------------------------------
// STE_LangTypes - all of the languages used in the wxSTEditorLangs in order

enum STE_LangTypes
{
    STE_LANG_CONTAINER,    // 0
    STE_LANG_NULL,         // 1
    STE_LANG_PYTHON,       // 2
    STE_LANG_CPP,          // 3
    STE_LANG_HTML,         // 4
    STE_LANG_XML,          // 5
    STE_LANG_PERL,         // 6
    STE_LANG_SQL,          // 7
    STE_LANG_VB,           // 8
    STE_LANG_PROPERTIES,   // 9
    STE_LANG_ERRORLIST,    // 10
    STE_LANG_MAKEFILE,     // 11
    STE_LANG_BATCH,        // 12
    STE_LANG_XCODE,        // 13
    STE_LANG_LATEX,        // 14
    STE_LANG_LUA,          // 15
    STE_LANG_DIFF,         // 16
    STE_LANG_CONF,         // 17
    STE_LANG_PASCAL,       // 18
    STE_LANG_AVE,          // 19
    STE_LANG_ADA,          // 20
    STE_LANG_LISP,         // 21
    STE_LANG_RUBY,         // 22
    STE_LANG_EIFFEL,       // 23
    STE_LANG_EIFFELKW,     // 24
    STE_LANG_TCL,          // 25
    STE_LANG_NNCRONTAB,    // 26
    STE_LANG_BULLANT,      // 27
    STE_LANG_VBSCRIPT,     // 28
    STE_LANG_ASP,          // 29
    STE_LANG_PHP,          // 30
    STE_LANG_BAAN,         // 31
    STE_LANG_MATLAB,       // 32
    STE_LANG_SCRIPTOL,     // 33
    STE_LANG_ASM,          // 34
    STE_LANG_CPPNOCASE,    // 35
    STE_LANG_FORTRAN,      // 36
    STE_LANG_F77,          // 37
    STE_LANG_CSS,          // 38
    STE_LANG_POV,          // 39
    STE_LANG_LOUT,         // 40
    STE_LANG_ESCRIPT,      // 41
    STE_LANG_PS,           // 42
    STE_LANG_NSIS,         // 43
    STE_LANG_MMIXAL,       // 44
#if wxCHECK_VERSION(2,5,0)
    STE_LANG_CLW,          // 45
    STE_LANG_CLWNOCASE,    // 46
    STE_LANG_LOT,          // 47
    STE_LANG_YAML,         // 48
    STE_LANG_TEX,          // 49
    STE_LANG_METAPOST,     // 50
    STE_LANG_POWERBASIC,   // 51
    STE_LANG_FORTH,        // 52
    STE_LANG_ERLANG,       // 53
    STE_LANG_OCTAVE,       // 54
    STE_LANG_MSSQL,        // 55
    STE_LANG_VERILOG,      // 56
    STE_LANG_KIX,          // 57
    STE_LANG_GUI4CLI,      // 58
    STE_LANG_SPECMAN,      // 59
    STE_LANG_AU3,          // 60
    STE_LANG_APDL,         // 61
    STE_LANG_BASH,         // 62
    STE_LANG_ASN1,         // 63
    STE_LANG_VHDL,         // 64
#endif // wxCHECK_VERSION(2,5,0)
    // Derived languages that use a lexer above, but have their own keywords
    STE_LANG_JAVA,         // 65
    STE_LANG_JAVASCRIPT,   // 66
    STE_LANG_RC,           // 67
    STE_LANG_CS,           // 68
    STE_LANG_D,            // 69
    STE_LANG_IDL,          // 70
    STE_LANG_PLSQL,        // 71
    STE_LANG__MAX
};

//-----------------------------------------------------------------------------
// STE_LangFlagsType - extra flags for wxSTEditorLangs::Get/SetFlags

enum STE_LangFlagsType
{
    STE_LANG_FLAG_DONTUSE = 0x0001 // ignore this language in the pref dialog
};

#endif // _STEDEFS_H_

