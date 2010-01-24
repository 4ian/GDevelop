/////////////////////////////////////////////////////////////////////////////
// Name:        thumbnailctrl.h
// Purpose:     Displays a scrolling window of thumbnails
// Author:      Julian Smart
// Modified by:
// Created:     03/08/04 17:22:46
// RCS-ID:
// Copyright:   (c) Julian Smart
// Licence:     wxWidgets Licence
/////////////////////////////////////////////////////////////////////////////

#ifndef _WX_THUMBNAILCTRL_H_
#define _WX_THUMBNAILCTRL_H_

#if defined(__GNUG__) && !defined(__APPLE__)
#pragma interface "thumbnailctrl.cpp"
#endif

#include <wx/dynarray.h>
#include <wx/settings.h>
#include <wx/arrimpl.cpp>
#include <wx/image.h>
#include <wx/filename.h>
#include <wx/dcbuffer.h>
#include <wx/scrolwin.h>

/*!
 * Includes
 */

/*!
 * Styles and flags
 */

/* Styles
 */

#define wxTH_MULTIPLE_SELECT    0x0010
#define wxTH_SINGLE_SELECT      0x0000
#define wxTH_TEXT_LABEL         0x0020
#define wxTH_IMAGE_LABEL        0x0040
#define wxTH_EXTENSION_LABEL    0x0080

/* Flags
 */

#define wxTHUMBNAIL_SHIFT_DOWN  0x01
#define wxTHUMBNAIL_CTRL_DOWN   0x02
#define wxTHUMBNAIL_ALT_DOWN    0x04

#define wxTHUMBNAIL_SORT_NAME_UP            1
#define wxTHUMBNAIL_SORT_NAME_DOWN          2
#define wxTHUMBNAIL_SORT_TIMESTAMP_UP       3
#define wxTHUMBNAIL_SORT_TIMESTAMP_DOWN     4
#define wxTHUMBNAIL_SORT_NUMERICALLY_UP     5
#define wxTHUMBNAIL_SORT_NUMERICALLY_DOWN   6
#define wxTHUMBNAIL_SORT_TYPE_UP            7
#define wxTHUMBNAIL_SORT_TYPE_DOWN          8

/* Defaults
 */

#define wxTHUMBNAIL_DEFAULT_OVERALL_SIZE wxSize(-1, -1)
#define wxTHUMBNAIL_DEFAULT_IMAGE_SIZE wxSize(80, 80)
#define wxTHUMBNAIL_DEFAULT_SPACING 3
#define wxTHUMBNAIL_DEFAULT_MARGIN 3
#define wxTHUMBNAIL_DEFAULT_UNFOCUSSED_BACKGROUND wxColour(175, 175, 175)
#define wxTHUMBNAIL_DEFAULT_FOCUSSED_BACKGROUND wxColour(140, 140, 140)
// #define wxTHUMBNAIL_DEFAULT_UNSELECTED_BACKGROUND wxColour(205, 205, 205)
#define wxTHUMBNAIL_DEFAULT_UNSELECTED_BACKGROUND wxSystemSettings::GetColour(wxSYS_COLOUR_3DFACE)
#define wxTHUMBNAIL_DEFAULT_TYPE_COLOUR wxColour(0, 0, 200)
#define wxTHUMBNAIL_DEFAULT_TAG_COLOUR wxColour(0, 0, 255)
#define wxTHUMBNAIL_DEFAULT_FOCUS_RECT_COLOUR wxColour(100, 80, 80)

/*!
 * Forward declarations
 */

class wxThumbnailCtrl;

/*!
 * wxThumbnailItem class declaration
 */

// Drawing styles/states
#define wxTHUMBNAIL_SELECTED    0x01
#define wxTHUMBNAIL_TAGGED      0x02
// The control is focussed
#define wxTHUMBNAIL_FOCUSSED    0x04
// The item itself has the focus
#define wxTHUMBNAIL_IS_FOCUS    0x08

class wxThumbnailItem: public wxObject
{
    DECLARE_CLASS(wxThumbnailItem)
public:
// Constructors

    wxThumbnailItem(const wxString& filename = wxEmptyString)
    { m_filename = filename; m_state = 0; }

// Accessors

    /// Filename
    void SetFilename(const wxString& filename) { m_filename = filename; }
    const wxString& GetFilename() const { return m_filename; }

    /// State storage while sorting
    void SetState(int state) { m_state = state; }
    int GetState() const { return m_state; }

// Overrideables

    /// Draw the item
    virtual bool Draw(wxDC& dc, wxThumbnailCtrl* ctrl, const wxRect& rect, int style) ;

    /// Draw the background
    virtual bool DrawBackground(wxDC& dc, wxThumbnailCtrl* ctrl, const wxRect& rect, const wxRect& imageRect, int style, int index) ;

    /// Load the thumbnail
    virtual bool Load(wxThumbnailCtrl* WXUNUSED(ctrl), bool WXUNUSED(forceLoad)) { return false; }

protected:
    wxString    m_filename;
    int         m_state; // state storage while sorting
};

/*!
 * wxImageThumbnailItem class declaration
 */

class wxImageThumbnailItem: public wxThumbnailItem
{
    DECLARE_CLASS(wxImageThumbnailItem)
public:
// Constructors

    wxImageThumbnailItem(const wxString& filename = wxEmptyString):
        wxThumbnailItem(filename) {}

// Overrideables

    /// Draw the item
    virtual bool Draw(wxDC& dc, wxThumbnailCtrl* ctrl, const wxRect& rect, int style) ;

    /// Load the thumbnail
    virtual bool Load(wxThumbnailCtrl* ctrl, bool forceLoad) ;

    wxBitmap& GetCachedBitmap() { return m_cachedBitmap; }

protected:
    wxBitmap    m_cachedBitmap;
};



WX_DECLARE_OBJARRAY(wxThumbnailItem, wxThumbnailItemArray);

/*!
 * wxThumbnailCtrl class declaration
 */

class wxThumbnailCtrl: public wxScrolledWindow
{
    DECLARE_CLASS( wxThumbnailCtrl )
    DECLARE_EVENT_TABLE()

public:
// Constructors

    wxThumbnailCtrl( );
    wxThumbnailCtrl( wxWindow* parent, wxWindowID id = -1, const wxPoint& pos = wxDefaultPosition, const wxSize& size = wxDefaultSize,
        long style = wxTH_TEXT_LABEL|wxTH_IMAGE_LABEL|wxTH_EXTENSION_LABEL );

// Operations

    /// Creation
    bool Create( wxWindow* parent, wxWindowID id = -1, const wxPoint& pos = wxDefaultPosition, const wxSize& size = wxDefaultSize,
        long style = wxTH_TEXT_LABEL|wxTH_IMAGE_LABEL|wxTH_EXTENSION_LABEL );

    /// Member initialisation
    void Init();

    /// Call Freeze to prevent refresh
    void Freeze();

    /// Call Thaw to refresh
    void Thaw();

    /// Scrolls the item into view if necessary
    void EnsureVisible(int n);

    /// Forces a reload of this item's thumbnail image
    void Reload(int n);

    /// Finds an item that matches a given filename
    int FindItemForFilename(const wxString& filename);

    /// Sorts items in the specified way
    void Sort(int sortMode);

    /// Draws the item. Normally you override function in wxThumbnailItem.
    virtual bool DrawItem(int n, wxDC& dc, const wxRect& rect, int style) ;

    /// Draws the background for the item, including bevel
    virtual bool DrawItemBackground(int n, wxDC& dc, const wxRect& rect, const wxRect& imageRect, int style) ;

// Adding items

    /// Append a single item
    virtual int Append(wxThumbnailItem* item);

    /// Insert a single item
    virtual int Insert(wxThumbnailItem* item, int pos = 0);

// Deleting items

    /// Clear all items
    virtual void Clear() ;

    /// Delete this item
    virtual void Delete(int n) ;

// Accessing items

    /// Get the number of items in the control
    virtual int GetCount() const { return m_items.GetCount(); }

    /// Is the control empty?
    bool IsEmpty() const { return GetCount() == 0; }

    /// Get the nth item
    wxThumbnailItem* GetItem(int n);

    /// Get the overall rect of the given item
    /// If transform is true, rect is relative to the scroll viewport
    /// (i.e. may be negative)
    bool GetItemRect(int item, wxRect& rect, bool transform = true);

    /// Get the image rect of the given item
    bool GetItemRectImage(int item, wxRect& rect, bool transform = true);

    /// Return the row and column given the client
    /// size and a left-to-right, top-to-bottom layout
    /// assumption
    bool GetRowCol(int item, const wxSize& clientSize, int& row, int& col);

    /// Get the focus item, or -1 if there is none
    int GetFocusItem() const { return m_focusItem; }

    /// Set the focus item
    void SetFocusItem(int item) ;

// Selection

    /// Select or deselect an item
    void Select(int n, bool select = true) ;

    /// Select or deselect a range
    void SelectRange(int from, int to, bool select = true) ;

    /// Tag or untag an item
    void Tag(int n, bool tag = true) ;

    /// Select all
    void SelectAll() ;

    /// Select none
    void SelectNone() ;

	/// Get the index of the single selection, if not multi-select.
    /// Returns -1 if there is no selection.
    int GetSelection() const ;

    /// Get indexes of all selections, if multi-select
    const wxArrayInt& GetSelections() const { return m_selections; }

    /// Get indexes of all tags
    const wxArrayInt& GetTags() const { return m_tags; }

    /// Returns true if the item is selected
    bool IsSelected(int n) const ;

    /// Returns true if the item is tagged
    bool IsTagged(int n) const ;

    /// Clears all selections
    void ClearSelections();

    /// Clears all tags
    void ClearTags();

// Visual properties

    /// The overall size of the thumbnail, including decorations.
    /// DON'T USE THIS from the application, since it will
    /// normally be calculated by SetThumbnailImageSize.
    void SetThumbnailOverallSize(const wxSize& sz) { m_thumbnailOverallSize = sz; }
    const wxSize& GetThumbnailOverallSize() const { return m_thumbnailOverallSize; }

    /// The size of the image part
    void SetThumbnailImageSize(const wxSize& sz);
    const wxSize& GetThumbnailImageSize() const { return m_thumbnailImageSize; }

    /// The inter-item spacing
    void SetSpacing(int spacing) { m_spacing = spacing; }
    int GetSpacing() const { return m_spacing; }

    /// The margin between elements within the thumbnail
    void SetThumbnailMargin(int margin) { m_thumbnailMargin = margin; }
    int GetThumbnailMargin() const { return m_thumbnailMargin; }

	/// The height required for text in the thumbnail
	void SetThumbnailTextHeight(int h) { m_thumbnailTextHeight = h; }
	int GetThumbnailTextHeight() const { return m_thumbnailTextHeight; }

    /// The focussed and unfocussed background colour for a
    /// selected thumbnail
    void SetSelectedThumbnailBackgroundColour(const wxColour& focussedColour, const wxColour& unfocussedColour)
    {
        m_focussedThumbnailBackgroundColour = focussedColour; m_unfocussedThumbnailBackgroundColour = unfocussedColour;
    }
    const wxColour& GetSelectedThumbnailFocussedBackgroundColour() const { return m_focussedThumbnailBackgroundColour; }
    const wxColour& GetSelectedThumbnailUnfocussedBackgroundColour() const { return m_unfocussedThumbnailBackgroundColour; }

    /// The unselected background colour for a thumbnail
    void SetUnselectedThumbnailBackgroundColour(const wxColour& colour) { m_unselectedThumbnailBackgroundColour = colour; }
    const wxColour& GetUnselectedThumbnailBackgroundColour() const { return m_unselectedThumbnailBackgroundColour; }

    /// The colour for the type text (top left of thumbnail)
    void SetTypeColour(const wxColour& colour) { m_typeColour = colour; }
    const wxColour& GetTypeColour() const { return m_typeColour; }

    /// The colour for the tag outline
    void SetTagColour(const wxColour& colour) { m_tagColour = colour; }
    const wxColour& GetTagColour() const { return m_tagColour; }

    /// The focus rectangle pen colour
    void SetFocusRectColour(const wxColour& colour) { m_focusRectColour = colour; }
    const wxColour& GetFocusRectColour() const { return m_focusRectColour; }

// Command handlers

    void OnSelectAll(wxCommandEvent& event);
    void OnUpdateSelectAll(wxUpdateUIEvent& event);

// Event handlers

    /// Painting
    void OnPaint(wxPaintEvent& event);
    void OnEraseBackground(wxEraseEvent& event);

    /// Left-click
    void OnLeftClick(wxMouseEvent& event);

    /// Left-double-click
    void OnLeftDClick(wxMouseEvent& event);

    /// Middle-click
    void OnMiddleClick(wxMouseEvent& event);

    /// Right-click
    void OnRightClick(wxMouseEvent& event);

    /// Key press
    void OnChar(wxKeyEvent& event);

    /// Sizing
    void OnSize(wxSizeEvent& event);

    /// Setting/losing focus
    void OnSetFocus(wxFocusEvent& event);
    void OnKillFocus(wxFocusEvent& event);

// Implementation

    /// Set up scrollbars, e.g. after a resize
    void SetupScrollbars();

    /// Calculate the outer thumbnail size based
    /// on font used for text and inner size
    void CalculateOverallThumbnailSize();

    /// Do (de)selection
    void DoSelection(int n, int flags);

    /// Find the item under the given point
    bool HitTest(const wxPoint& pt, int& n);

    /// Keyboard navigation
    virtual bool Navigate(int keyCode, int flags);

    /// Scroll to see the image
    void ScrollIntoView(int n, int keyCode);

    /// Paint the background
    void PaintBackground(wxDC& dc);

    /// Recreate buffer bitmap if necessary
    bool RecreateBuffer(const wxSize& size = wxDefaultSize);

    /// Get tag bitmap
    const wxBitmap& GetTagBitmap() const { return m_tagBitmap; }

    /// Get/set sort mode
    void SetSortMode(int sortMode) { m_sortMode = sortMode; }
    int GetSortMode() const { return m_sortMode ; }

    static wxThumbnailCtrl* GetThumbnailCtrl() { return sm_currentThumbnailCtrl; }

// Overrides
    wxSize DoGetBestSize() const ;

// Data members
private:

    /// The items
    wxThumbnailItemArray    m_items;

    /// The selections
    wxArrayInt              m_selections;

    /// The tags
    wxArrayInt              m_tags;

    /// Outer size of the thumbnail item
    wxSize                  m_thumbnailOverallSize;

    /// Image size of the thumbnail item
    wxSize                  m_thumbnailImageSize;

    /// The inter-item spacing
    int                     m_spacing;

    /// The margin between the image/text and the edge of the thumbnail
    int                     m_thumbnailMargin;

    /// The height of thumbnail text in the current font
    int                     m_thumbnailTextHeight;

	/// Allows nested Freeze/Thaw
    int                     m_freezeCount;

    /// First selection in a range
    int                     m_firstSelection;

    /// Last selection
    int                     m_lastSelection;

    /// Focus item
    int                     m_focusItem;

    /// Tag marker bitmap
    wxBitmap                m_tagBitmap;

    /// Sort mode
    int                     m_sortMode;

    /// Current control, used in sorting
    static wxThumbnailCtrl* sm_currentThumbnailCtrl;

    /// Focussed/unfocussed selected thumbnail background colours
    wxColour                m_focussedThumbnailBackgroundColour;
    wxColour                m_unfocussedThumbnailBackgroundColour;
    wxColour                m_unselectedThumbnailBackgroundColour;
    wxColour                m_focusRectColour;

    /// Type text colour
    wxColour                m_typeColour;

    /// Tag colour
    wxColour                m_tagColour;

    /// Buffer bitmap
    wxBitmap                m_bufferBitmap;
};

/*!
 * wxThumbnailEvent - the event class for wxThumbnailCtrl notifications
 */

class wxThumbnailEvent : public wxNotifyEvent
{
public:
    wxThumbnailEvent(wxEventType commandType = wxEVT_NULL, int winid = 0)
        : wxNotifyEvent(commandType, winid),
        m_itemIndex(-1), m_flags(0)
        { }

    wxThumbnailEvent(const wxThumbnailEvent& event)
        : wxNotifyEvent(event),
        m_itemIndex(event.m_itemIndex), m_flags(event.m_flags)
        { }

    int GetIndex() const { return m_itemIndex; }
    void SetIndex(int n) { m_itemIndex = n; }

    int GetFlags() const { return m_flags; }
    void SetFlags(int flags) { m_flags = flags; }

    virtual wxEvent *Clone() const { return new wxThumbnailEvent(*this); }

protected:
    int           m_itemIndex;
    int           m_flags;

private:
    DECLARE_DYNAMIC_CLASS_NO_ASSIGN(wxThumbnailEvent)
};

/*!
 * wxThumbnailCtrl event macros
 */

BEGIN_DECLARE_EVENT_TYPES()
    DECLARE_EVENT_TYPE(wxEVT_COMMAND_THUMBNAIL_ITEM_SELECTED, 2600)
    DECLARE_EVENT_TYPE(wxEVT_COMMAND_THUMBNAIL_ITEM_DESELECTED, 2601)
    DECLARE_EVENT_TYPE(wxEVT_COMMAND_THUMBNAIL_LEFT_CLICK, 2602)
    DECLARE_EVENT_TYPE(wxEVT_COMMAND_THUMBNAIL_RIGHT_CLICK, 2603)
    DECLARE_EVENT_TYPE(wxEVT_COMMAND_THUMBNAIL_MIDDLE_CLICK, 2604)
    DECLARE_EVENT_TYPE(wxEVT_COMMAND_THUMBNAIL_LEFT_DCLICK, 2605)
    DECLARE_EVENT_TYPE(wxEVT_COMMAND_THUMBNAIL_RETURN, 2606)
END_DECLARE_EVENT_TYPES()

typedef void (wxEvtHandler::*wxThumbnailEventFunction)(wxThumbnailEvent&);

#define EVT_THUMBNAIL_ITEM_SELECTED(id, fn) DECLARE_EVENT_TABLE_ENTRY( wxEVT_COMMAND_THUMBNAIL_ITEM_SELECTED, id, -1, (wxObjectEventFunction) (wxEventFunction)  wxStaticCastEvent( wxThumbnailEventFunction, & fn ), NULL ),
#define EVT_THUMBNAIL_ITEM_DESELECTED(id, fn) DECLARE_EVENT_TABLE_ENTRY( wxEVT_COMMAND_THUMBNAIL_ITEM_DESELECTED, id, -1, (wxObjectEventFunction) (wxEventFunction)  wxStaticCastEvent( wxThumbnailEventFunction, & fn ), NULL ),
#define EVT_THUMBNAIL_LEFT_CLICK(id, fn) DECLARE_EVENT_TABLE_ENTRY( wxEVT_COMMAND_THUMBNAIL_LEFT_CLICK, id, -1, (wxObjectEventFunction) (wxEventFunction)  wxStaticCastEvent( wxThumbnailEventFunction, & fn ), NULL ),
#define EVT_THUMBNAIL_RIGHT_CLICK(id, fn) DECLARE_EVENT_TABLE_ENTRY( wxEVT_COMMAND_THUMBNAIL_RIGHT_CLICK, id, -1, (wxObjectEventFunction) (wxEventFunction)  wxStaticCastEvent( wxThumbnailEventFunction, & fn ), NULL ),
#define EVT_THUMBNAIL_MIDDLE_CLICK(id, fn) DECLARE_EVENT_TABLE_ENTRY( wxEVT_COMMAND_THUMBNAIL_MIDDLE_CLICK, id, -1, (wxObjectEventFunction) (wxEventFunction)  wxStaticCastEvent( wxThumbnailEventFunction, & fn ), NULL ),
#define EVT_THUMBNAIL_LEFT_DCLICK(id, fn) DECLARE_EVENT_TABLE_ENTRY( wxEVT_COMMAND_THUMBNAIL_LEFT_DCLICK, id, -1, (wxObjectEventFunction) (wxEventFunction)  wxStaticCastEvent( wxThumbnailEventFunction, & fn ), NULL ),
#define EVT_THUMBNAIL_RETURN(id, fn) DECLARE_EVENT_TABLE_ENTRY( wxEVT_COMMAND_THUMBNAIL_RETURN, id, -1, (wxObjectEventFunction) (wxEventFunction)  wxStaticCastEvent( wxThumbnailEventFunction, & fn ), NULL ),

#endif
    // _WX_THUMBNAILCTRL_H_
