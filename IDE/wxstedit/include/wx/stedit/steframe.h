///////////////////////////////////////////////////////////////////////////////
// Name:        steframe.h
// Purpose:     wxSTEditorFrame
// Author:      John Labenski, parts taken from wxGuide by Otto Wyss
// Modified by:
// Created:     11/05/2002
// Copyright:   (c) John Labenski, Otto Wyss
// Licence:     wxWidgets licence
///////////////////////////////////////////////////////////////////////////////

#ifndef _STEFRAME_H_
#define _STEFRAME_H_

#include "wx/frame.h"
#include "wx/dnd.h"
#include "wx/treectrl.h"

class WXDLLEXPORT wxFrame;
class WXDLLEXPORT wxSplitterWindow;
class WXDLLEXPORT wxNotebook;
class WXDLLEXPORT wxNotebookEvent;
class WXDLLEXPORT wxMenu;
class WXDLLEXPORT wxKeyEvent;
class WXDLLEXPORT wxToolBar;
class WXDLLEXPORT wxConfigBase;
class WXDLLEXPORT wxFileHistory;
class WXDLLEXPORT wxTreeCtrl;
class WXDLLEXPORT wxTreeEvent;

#include "wx/stedit/stedefs.h"

//-----------------------------------------------------------------------------
// wxSTEditorFrame - a generic frame to contain either a single editor
//   or editors in a wxSTEditorNotebook. You can optionally have a splitter
//   that will contain a wxNotebook in the left panel with a wxListBox
//   containing a list of the pages in the notebook.
//   See the CreateOptions function.
//
// In order to make this as generic as possible all requests for windows call
//   the virtual functions GetEditor, GetEditorSplitter, GetEditorNotebook,
//   GetSideSplitter etc. You can also just create the windows any way you like
//   and set the member pointers appropriately, even to NULL.
//   This way you can still allow HandleMenuEvent to
//   do some work for you, but you can make a more complicated window layout
//   so long as you return the appropriate windows. The functions to get the
//   windows can return NULL and any action from the HandleMenuEvent function
//   will be silently ignored.
//-----------------------------------------------------------------------------

//  |--------------------------------------------------------|
//  | wxSTEditorFrame, menu & toolbar                        |
//  |--------------------------------------------------------|
//  |                |                                       |
//  |                |         wxSTEditorNotebook            |
//  |                |                or                     |
//  |  SideNotebook  |         wxSTEditorSplitter            |
//  |                |                                       |
//  |                |---------------------------------------| < MainSplitter
//  |                |    Some user added window (unused)    |
//  |--------------------------------------------------------|
//                   ^
//              SideSplitter

class WXDLLIMPEXP_STEDIT wxSTEditorFrame : public wxFrame
{
public:
    wxSTEditorFrame() : wxFrame() { Init(); }
    wxSTEditorFrame(wxWindow *parent, wxWindowID id,
                    const wxString& title = wxT("wxStEdit"),
                    const wxPoint& pos = wxDefaultPosition,
                    const wxSize& size = wxSize(400, 400),
                    long style = wxDEFAULT_FRAME_STYLE,
                    const wxString& name = wxT("wxSTEditorFrame")) : wxFrame()
    {
        Init();
        Create(parent, id, title, pos, size, style, name);
    }

    virtual ~wxSTEditorFrame();
    virtual bool Destroy();

    bool Create(wxWindow *parent, wxWindowID id,
                const wxString& title = wxT("wxStEdit"),
                const wxPoint& pos = wxDefaultPosition,
                const wxSize& size = wxDefaultSize,
                long style = wxDEFAULT_FRAME_STYLE,
                const wxString& name = wxT("wxSTEditorFrame"));

    // Create and set the wxSTEditorOptions, call this after creation
    //  or just create the child windows yourself.
    virtual void CreateOptions(const wxSTEditorOptions& options);
    // GetOptions, use this to change editor option values
    const wxSTEditorOptions& GetOptions() const { return m_options; }
    wxSTEditorOptions& GetOptions() { return m_options; }
    // Set the options, the options will now be refed copies of the ones you send
    // in. This can be used to detach the options for a particular editor from
    // the rest of them.
    void SetOptions(const wxSTEditorOptions& options) { m_options = options; }

    // enable/disable sending wxSTEditor events from children editors
    void SetSendSTEEvents(bool send);

    // returns either the single editor for STF_SINGLEPAGE or
    // the editor at page, if page = -1 get the current editor
    // override these in your frame for more complex scenarios where you may have
    // different or more layers of windows.
    virtual wxSTEditor *GetEditor(int page = -1) const;
    virtual wxSTEditorSplitter *GetEditorSplitter(int page = -1) const;
    // Get the notebook containing the editor, NULL if style STF_SINGLEPAGE
    virtual wxSTEditorNotebook *GetEditorNotebook() const { return m_steNotebook; }

    // Get the splitter between editor (notebook) and some user set window
    virtual wxSplitterWindow* GetMainSplitter() const { return m_mainSplitter; }
    // Get the splitter between sidebar notebook and editors, NULL if not style STF_SIDEBAR
    virtual wxSplitterWindow* GetSideSplitter() const { return m_sideSplitter; }
    // Get the sidebar notebook, NULL if not style STF_SIDEBAR
    virtual wxNotebook* GetSideNotebook() const { return m_sideNotebook; }
    // Get the file treectrl in the sidebar notebook, NULL if not style STF_SIDEBAR
    virtual wxTreeCtrl* GetFileTreeCtrl() const { return m_fileTreeCtrl; }

    // Update all the menu/tool items in the wxSTEditorOptions
    virtual void UpdateAllItems();
    // Update popupmenu, menubar, toolbar if any
    virtual void UpdateItems(wxMenu *menu=NULL, wxMenuBar *menuBar=NULL, wxToolBar *toolBar=NULL);

    // Get/Set the base of the title (default is title set in constructor)
    // Title is "titleBase - [*] editor fileName", * used to denote modified
    wxString GetTitleBase() const { return m_titleBase; }
    void SetTitleBase( const wxString& titleBase ) { m_titleBase = titleBase; }

    // Show the about dialog, called for wxID_ABOUT
    virtual void ShowAboutDialog();

    // Load/Save the config for showing sidebar and frame size
    //   See also wxSTEditorOptions for paths and internal saving config.
    void LoadConfig( wxConfigBase &config,
                     const wxString &configPath = wxT("/wxSTEditor/Frame") );
    void SaveConfig( wxConfigBase &config,
                     const wxString &configPath = wxT("/wxSTEditor/Frame") );

    // -----------------------------------------------------------------------
    // implementation
    void OnNotebookPageChanged(wxNotebookEvent &event);
    void OnFileTreeCtrl(wxTreeEvent &event);
    virtual void UpdateFileTreeCtrl();

    void OnSTECreated(wxCommandEvent &event);
    void OnSTEState(wxSTEditorEvent &event);
    void OnSTEPopupMenu(wxSTEditorEvent &event);
    void OnSTCUpdateUI(wxStyledTextEvent &event);

    void OnMenuOpen(wxMenuEvent &event);
    void OnMenu(wxCommandEvent &event);
    virtual bool HandleMenuEvent(wxCommandEvent &event);

    void OnClose(wxCloseEvent &event);

protected:
    wxSTEditorOptions m_options;
    wxString m_titleBase;

    wxSTEditorNotebook *m_steNotebook;   // notebook for editors (not single editor), may be NULL
    wxSTEditorSplitter *m_steSplitter;   // single editor (not notebook), may be NULL
    wxSplitterWindow   *m_mainSplitter;  // splitter for notebook/editor and bottom notebook
    wxSplitterWindow   *m_sideSplitter;  // splitter for editor and left hand panels
    wxNotebook         *m_sideNotebook;  // notebook to hold... file listbox
    wxTreeCtrl         *m_fileTreeCtrl;  // display the notebook pages, may be NULL

    wxWindow           *m_sideSplitterWin1; // these are the two pages of the side splitter
    wxWindow           *m_sideSplitterWin2;

    wxSTERecursionGuardFlag m_rGuard_OnMenu;
    wxSTERecursionGuardFlag m_rGuard_HandleMenuEvent;

private:
    void Init();
    DECLARE_EVENT_TABLE()
    DECLARE_DYNAMIC_CLASS(wxSTEditorFrame)
};

//-----------------------------------------------------------------------------
// wxSTEditorFrameFileDropTarget
//-----------------------------------------------------------------------------
#if wxUSE_DRAG_AND_DROP
class WXDLLIMPEXP_STEDIT wxSTEditorFrameFileDropTarget : public wxFileDropTarget
{
public:
    wxSTEditorFrameFileDropTarget(wxSTEditorFrame *owner) : m_owner(owner) {}
    virtual bool OnDropFiles(wxCoord x, wxCoord y, const wxArrayString& filenames);

    wxSTEditorFrame *m_owner;
};
#endif //wxUSE_DRAG_AND_DROP

//-----------------------------------------------------------------------------
// wxSTETreeItemData - wxTreeItemData for the wxTreeCtrl file list
//-----------------------------------------------------------------------------

class wxSTETreeItemData : public wxTreeItemData
{
public:
    wxSTETreeItemData(int page_num = -1, wxWindow* win = NULL) :
        m_page_num(page_num), m_window(win), m_modified(false) { }

    wxSTETreeItemData(const wxSTETreeItemData& steTreeData) :
        m_page_num(steTreeData.m_page_num), m_window(steTreeData.m_window),
        m_modified(steTreeData.m_modified), m_root(steTreeData.m_root),
        m_fileName(steTreeData.m_fileName), m_treePath(steTreeData.m_treePath) {}

    int m_page_num;                 // the notebook page #, or -1 for none
    wxWindow* m_window;             // should be a wxSTEditorSplitter
    bool m_modified;                // is it modified
    wxString m_root;                // root leaf in the treectrl
    wxString m_fileName;            // filename of the page
    wxArrayString m_treePath;       // path to the tree item, without root item
};

/*
WX_DEFINE_ARRAY(wxSTETreeItemData *, wxArraySTETreeItemData);

int wxCMPFUNC_CONV STE_TreeItemSortCompareFunction( wxSTETreeItemData** first, wxSTETreeItemData** second)
{
    int ret = wxStrcmp((*first)->m_root, (*second)->m_root);
    if (ret == 0)
        ret = wxStrcmp((*first)->m_fileName, (*second)->m_fileName);
    return ret;
}
*/

//-----------------------------------------------------------------------------
// wxSTETreeCtrlHelper - wxTreeCtrl helper class
//-----------------------------------------------------------------------------

// options for the wxSTETreeCtrlHelper::GetAllItemIds function
enum STE_TreeCtrlHelperGetAll_Type
{
    STE_TREECTRLHELPER_GET_DATA   = 1, // get items that have data
    STE_TREECTRLHELPER_GET_NODATA = 2, // get items that don't have data
    STE_TREECTRLHELPER_GET_ALL    = 3  // get all items
};

// options for the wxSTETreeCtrlHelper::FindOrInsertItem function
enum STE_TreeCtrlHelperFindInsert_Type
{
    STE_TREECTRLHELPER_FIND           = 1, // only find an existing item
    STE_TREECTRLHELPER_INSERT         = 2, // just insert the item, even if one with same path exists
    STE_TREECTRLHELPER_FIND_OR_INSERT = 3  // try to find existing, else insert
};

class wxSTETreeCtrlHelper
{
public:
    wxSTETreeCtrlHelper(wxTreeCtrl* treeCtrl) : m_treeCtrl(treeCtrl) {}

    // Get the "path" to the item by traversing up the tree from the item
    wxArrayString GetItemPath(const wxTreeItemId& id);

    // Find or creates paths to insert the item, each index in array is a leaf
    //   the last array element is the item itself, if only_find then if the
    //   item doesn't exist an invalid wxTreeItemId is returned.
    //   returns the existing or new item id or invalid one if it didn't exist
    wxTreeItemId FindOrInsertItem(const wxArrayString& treePath, int find_type = STE_TREECTRLHELPER_FIND_OR_INSERT);

    // Delete the item with the given path, if delete_empty then remove parents
    //   that are empty after removing the item
    bool DeleteItem(const wxArrayString& treePath, bool delete_empty = true);

    // Delete the item with the given id and travel up the parents if
    //  delete_empty deleting item + parents the number of levels up,
    //  levels = -1 means go all the way up to the root tree item.
    //  returns the # of nodes deleted
    int DeleteItem(const wxTreeItemId& id, bool delete_empty, int levels = -1);

    // Get all the treectrl items in an array, type determines what items to add
    size_t GetAllItemIds(const wxTreeItemId& start_id, wxArrayTreeItemIds& arrayIds, int get_type = STE_TREECTRLHELPER_GET_ALL);
    size_t DoGetAllItemIds(const wxTreeItemId& start_id, wxArrayTreeItemIds& arrayIds, int get_type = STE_TREECTRLHELPER_GET_ALL);

    // Recursively sort all the children starting with this parent
    void SortChildren(const wxTreeItemId& item);

    wxTreeCtrl* m_treeCtrl;
};

#endif  // _STEFRAME_H_

