///////////////////////////////////////////////////////////////////////////////
// File:        steprefs.cpp
// Purpose:     wxSTEditor Preferences/Styles/Languages initialization
// Maintainer:
// Created:     2003-04-04
// RCS-ID:      $Id: steprefs.cpp,v 1.19 2007/05/14 17:44:26 jrl1 Exp $
// Copyright:   (c) John Labenski, Otto Wyss
// Licence:     wxWidgets licence
///////////////////////////////////////////////////////////////////////////////

// For compilers that support precompilation, includes <wx/wx.h>.
#include "wx/wxprec.h"

#ifdef __BORLANDC__
    #pragma hdrstop
#endif

// for all others, include the necessary headers
#ifndef WX_PRECOMP
    #include "wx/wx.h"
#endif

#include "wx/stedit/steprefs.h"
#include "wx/stedit/stedit.h"

#include "wx/config.h"

extern wxSTEditorPrefs  s_wxSTEditorPrefs;

//----------------------------------------------------------------------------
// wxSTEditorPrefBase
//----------------------------------------------------------------------------
IMPLEMENT_ABSTRACT_CLASS(wxSTEditorPrefBase, wxObject)

#define M_BASEDATA ((wxSTEditorPrefBase_RefData *)m_refData)

size_t wxSTEditorPrefBase::GetEditorCount() const
{
    wxCHECK_MSG(Ok(), 0, wxT("wxSTEditorPrefBase not created"));
    return M_BASEDATA->m_editors.GetCount();
}

int wxSTEditorPrefBase::FindEditor(wxSTEditor* editor) const
{
    wxCHECK_MSG(Ok(), wxNOT_FOUND, wxT("wxSTEditorPrefBase not created"));
    return M_BASEDATA->m_editors.Index(editor);
}

wxSTEditor *wxSTEditorPrefBase::GetEditor(size_t n) const
{
    wxCHECK_MSG(Ok(), NULL, wxT("wxSTEditorPrefBase not created"));
    return (wxSTEditor*)M_BASEDATA->m_editors[n];
}

void wxSTEditorPrefBase::UpdateAllEditors()
{
    wxCHECK_RET(Ok(), wxT("wxSTEditorPrefBase not created"));
    size_t n, count = GetEditorCount();
    for (n = 0; n < count; n++)
    {
        //wxPrintf(wxT("wxSTEditorPrefBase::UpdateAllEditors %ld editor %ld\n"), (long)this, (long)M_BASEDATA->m_editors[n]);
        UpdateEditor((wxSTEditor*)M_BASEDATA->m_editors[n]);
    }
}

void wxSTEditorPrefBase::RegisterEditor(wxSTEditor *editor, bool update_now)
{
    wxCHECK_RET(Ok(), wxT("wxSTEditorPrefBase not created"));
    wxCHECK_RET(editor, wxT("Invalid editor"));

    // not an error, just let them do it to avoid having to check
    if (!HasEditor(editor))
        M_BASEDATA->m_editors.Add(editor);

    if (update_now)
        UpdateEditor(editor);
}
void wxSTEditorPrefBase::RemoveEditor(wxSTEditor *editor)
{
    wxCHECK_RET(Ok(), wxT("wxSTEditorPrefBase not created"));
    wxCHECK_RET(editor, wxT("Invalid editor"));

    // not an error, if not found allows for this to be called in destructor
    int index = FindEditor(editor);
    if (index != wxNOT_FOUND)
        M_BASEDATA->m_editors.RemoveAt(index);
}

//----------------------------------------------------------------------------
// wxSTEditorPref_RefData
//----------------------------------------------------------------------------

static wxArrayString s_STE_PrefNames;
static wxArrayString s_STE_PrefValues;
static wxArrayInt    s_STE_PrefFlags;

class wxSTEditorPref_RefData : public wxSTEditorPrefBase_RefData
{
public:
    wxSTEditorPref_RefData()
    {
        m_prefs = s_STE_PrefValues;
    }

    wxArrayString m_prefs;
};

#define M_PREFDATA ((wxSTEditorPref_RefData *)m_refData)

//----------------------------------------------------------------------------
// wxSTEditorPrefs
//----------------------------------------------------------------------------
IMPLEMENT_DYNAMIC_CLASS(wxSTEditorPrefs, wxSTEditorPrefBase)

wxSTEditorPrefs& wxSTEditorPrefs::GetGlobalEditorPrefs()
{
    return s_wxSTEditorPrefs;
}

void wxSTEditorPrefs::Init()
{
    if (s_STE_PrefNames.GetCount() != 0) return;  // only add once

    // sanity check, run in debug mode only
    wxASSERT_MSG(ID_STE_PREF__LAST-ID_STE_PREF__FIRST == STE_PREF__MAX - 1,
                 wxT("The ID_STE_PREF_XXX count != STE_PREF_XXX count"));

    s_STE_PrefNames.Alloc(STE_PREF__MAX);
    s_STE_PrefValues.Alloc(STE_PREF__MAX);
    s_STE_PrefFlags.Alloc(STE_PREF__MAX);

    AddInitPref(wxT("Highlight Syntax"),    1, STE_PREF_FLAG_BOOL);
    AddInitPref(wxT("Highlight Preprocessor"), 1, STE_PREF_FLAG_BOOL);
    AddInitPref(wxT("Highlight Braces"),    1, STE_PREF_FLAG_BOOL);
    AddInitPref(wxT("Load Init Language"),  1, STE_PREF_FLAG_BOOL);
    AddInitPref(wxT("Load Unicode"),        STE_LOAD_DEFAULT, STE_PREF_FLAG_INT);
    AddInitPref(wxT("Wrap Mode"),           wxSTC_WRAP_NONE, STE_PREF_FLAG_INT);
    AddInitPref(wxT("Wrap Visual Flags"),   wxSTC_WRAPVISUALFLAG_END, STE_PREF_FLAG_INT);
    AddInitPref(wxT("Wrap Visual Flags Location"), wxSTC_WRAPVISUALFLAGLOC_DEFAULT, STE_PREF_FLAG_INT);
    AddInitPref(wxT("Wrap Start Indent"),   0, STE_PREF_FLAG_INT);
    AddInitPref(wxT("Zoom"),                0, STE_PREF_FLAG_INT);
    AddInitPref(wxT("View EOL"),            0, STE_PREF_FLAG_BOOL);
    AddInitPref(wxT("View Whitespace"),     wxSTC_WS_INVISIBLE, STE_PREF_FLAG_INT);
    AddInitPref(wxT("Indent Guides"),       1, STE_PREF_FLAG_BOOL);
    AddInitPref(wxT("Edge Mode"),           wxSTC_EDGE_LINE, STE_PREF_FLAG_INT);
    AddInitPref(wxT("Edge Column"),         80, STE_PREF_FLAG_INT);
    AddInitPref(wxT("View Line Margin"),    0, STE_PREF_FLAG_BOOL);
    AddInitPref(wxT("View Marker Margin"),  0, STE_PREF_FLAG_BOOL);
    AddInitPref(wxT("View Fold Margin"),    1, STE_PREF_FLAG_BOOL);
    AddInitPref(wxT("Use Tabs"),            0, STE_PREF_FLAG_BOOL);
    AddInitPref(wxT("Tab Indents"),         1, STE_PREF_FLAG_BOOL);
    AddInitPref(wxT("Tab Width"),           4, STE_PREF_FLAG_INT);
    AddInitPref(wxT("Indent Width"),        4, STE_PREF_FLAG_INT);
    AddInitPref(wxT("BackSpace Unindents"), 1, STE_PREF_FLAG_BOOL);
    AddInitPref(wxT("Auto Indent"),         1, STE_PREF_FLAG_BOOL);
    AddInitPref(wxT("Caret Line Visible"),  1, STE_PREF_FLAG_BOOL);
    AddInitPref(wxT("Caret Width"),         1, STE_PREF_FLAG_INT);
    AddInitPref(wxT("Caret Period"),        500, STE_PREF_FLAG_INT);
    AddInitPref(wxT("Caret Policy X"),      wxSTC_CARET_EVEN|wxSTC_VISIBLE_STRICT|wxSTC_CARET_SLOP, STE_PREF_FLAG_INT);
    AddInitPref(wxT("Caret Policy Y"),      wxSTC_CARET_EVEN|wxSTC_VISIBLE_STRICT|wxSTC_CARET_SLOP, STE_PREF_FLAG_INT);
    AddInitPref(wxT("Caret Slop X"),        1, STE_PREF_FLAG_INT);
    AddInitPref(wxT("Caret Slop Y"),        1, STE_PREF_FLAG_INT);
    AddInitPref(wxT("Visible Policy"),      wxSTC_VISIBLE_STRICT|wxSTC_VISIBLE_SLOP, STE_PREF_FLAG_INT);
    AddInitPref(wxT("Visible Slop"),        1, STE_PREF_FLAG_INT);
    AddInitPref(wxT("EOL Mode"),
#if defined(__WXMSW__) || defined(__WXPM__)
                                            wxSTC_EOL_CRLF, STE_PREF_FLAG_INT);
#elif defined(__WXMAC__) && !defined(__DARWIN__)
                                            wxSTC_EOL_CR, STE_PREF_FLAG_INT);
#else
                                            wxSTC_EOL_LF, STE_PREF_FLAG_INT);
#endif
    AddInitPref(wxT("Selection mode"),      -1, STE_PREF_FLAG_INT);
    AddInitPref(wxT("Print Magnification"), -2, STE_PREF_FLAG_INT);
    AddInitPref(wxT("Print Colour Mode"),   wxSTC_PRINT_COLOURONWHITE, STE_PREF_FLAG_INT);
    AddInitPref(wxT("Print Wrap Mode"),     wxSTC_WRAP_WORD, STE_PREF_FLAG_INT);
    AddInitPref(wxT("Print Linenumbers"),   STE_PRINT_LINENUMBERS_DEFAULT, STE_PREF_FLAG_INT);
    AddInitPref(wxT("Fold Flags"),          wxSTC_FOLDFLAG_LINEBEFORE_CONTRACTED|wxSTC_FOLDFLAG_LINEAFTER_CONTRACTED, STE_PREF_FLAG_INT); //wxSTC_FOLDFLAG_LEVELNUMBERS
    AddInitPref(wxT("Fold Styles"),         STE_FOLD_STYLE_DEFAULT, STE_PREF_FLAG_INT);
    AddInitPref(wxT("Fold Margin Style"),   STE_FOLDMARGIN_STYLE_SQUARES, STE_PREF_FLAG_INT);
    AddInitPref(wxT("Buffered Draw"),       1, STE_PREF_FLAG_BOOL);
    AddInitPref(wxT("Two Phase Draw"),      0, STE_PREF_FLAG_BOOL);
    // DO NOT USE page cache in wxWidgets < 2.5.4, leads to a crash eventually Need Scintilla 1.61
    AddInitPref(wxT("Layout Cache"),
#if wxCHECK_VERSION(2, 5, 4)
                                            wxSTC_CACHE_PAGE, STE_PREF_FLAG_INT);
#else
                                            wxSTC_CACHE_NONE, STE_PREF_FLAG_INT);
#endif // wxCHECK_VERSION(2, 5, 4)
    AddInitPref(wxT("Use Antialiasing"),    1,                STE_PREF_FLAG_BOOL);

    AddInitPref(wxT("Save Remove Trailing Whitespace"), 0,    STE_PREF_FLAG_BOOL);
    AddInitPref(wxT("Save Convert EOL"),                0,    STE_PREF_FLAG_BOOL);


    AddInitPref(wxT("Horizontal Scrollbar"), 1,                 STE_PREF_FLAG_BOOL|STE_PREF_FLAG_NOCONFIG);
    AddInitPref(wxT("Vertical Scrollbar"),   1,                 STE_PREF_FLAG_BOOL|STE_PREF_FLAG_NOCONFIG);
    AddInitPref(wxT("Margin0 Type"),       wxSTC_MARGIN_NUMBER, STE_PREF_FLAG_INT|STE_PREF_FLAG_NOCONFIG);
    AddInitPref(wxT("Margin1 Type"),       wxSTC_MARGIN_SYMBOL, STE_PREF_FLAG_INT|STE_PREF_FLAG_NOCONFIG);
    AddInitPref(wxT("Margin2 Type"),       wxSTC_MARGIN_SYMBOL, STE_PREF_FLAG_INT|STE_PREF_FLAG_NOCONFIG);
    AddInitPref(wxT("Margin0 Width"),      -1,                  STE_PREF_FLAG_INT|STE_PREF_FLAG_NOCONFIG);
    AddInitPref(wxT("Margin1 Width"),      16,                  STE_PREF_FLAG_INT|STE_PREF_FLAG_NOCONFIG);
    AddInitPref(wxT("Margin2 Width"),      16,                  STE_PREF_FLAG_INT|STE_PREF_FLAG_NOCONFIG);
    AddInitPref(wxT("Margin0 Mask"),       0,                   STE_PREF_FLAG_INT|STE_PREF_FLAG_NOCONFIG);
    AddInitPref(wxT("Margin1 Mask"),       ~wxSTC_MASK_FOLDERS, STE_PREF_FLAG_INT|STE_PREF_FLAG_NOCONFIG);
    AddInitPref(wxT("Margin2 Mask"),       wxSTC_MASK_FOLDERS,  STE_PREF_FLAG_INT|STE_PREF_FLAG_NOCONFIG);
    AddInitPref(wxT("Margin0 Sensitive"),  0,                   STE_PREF_FLAG_BOOL|STE_PREF_FLAG_NOCONFIG);
    AddInitPref(wxT("Margin1 Sensitive"),  1,                   STE_PREF_FLAG_BOOL|STE_PREF_FLAG_NOCONFIG);
    AddInitPref(wxT("Margin2 Sensitive"),  1,                   STE_PREF_FLAG_BOOL|STE_PREF_FLAG_NOCONFIG);

    AddInitPref(wxT("Bookmark Margin1 DClick"),  1,             STE_PREF_FLAG_BOOL|STE_PREF_FLAG_NOCONFIG);

    AddInitPref(wxT("Auto Completion Stops"),             wxT(" ()[]{}<>:;.?"), STE_PREF_FLAG_STRING|STE_PREF_FLAG_NOCONFIG);
    AddInitPref(wxT("Auto Completion Separator"),         int(' '),      STE_PREF_FLAG_INT|STE_PREF_FLAG_NOCONFIG);
    AddInitPref(wxT("Auto Completion FillUps"),           wxEmptyString, STE_PREF_FLAG_STRING|STE_PREF_FLAG_NOCONFIG);
    AddInitPref(wxT("Auto Completion Cancel at Start"),   1,             STE_PREF_FLAG_BOOL|STE_PREF_FLAG_NOCONFIG);
    AddInitPref(wxT("Auto Completion Choose Single"),     1,             STE_PREF_FLAG_BOOL|STE_PREF_FLAG_NOCONFIG);
    AddInitPref(wxT("Auto Completion Ignore Case"),       0,             STE_PREF_FLAG_BOOL|STE_PREF_FLAG_NOCONFIG);
    AddInitPref(wxT("Auto Completion Auto Hide"),         1,             STE_PREF_FLAG_BOOL|STE_PREF_FLAG_NOCONFIG);
    AddInitPref(wxT("Auto Completion Drop Rest of Word"), 1,             STE_PREF_FLAG_BOOL|STE_PREF_FLAG_NOCONFIG);
    AddInitPref(wxT("Auto Completion Type Separator"),    int('?'),      STE_PREF_FLAG_INT|STE_PREF_FLAG_NOCONFIG);
}

wxString wxSTEditorPrefs::GetPrefName(size_t pref_n) const
{
    wxCHECK_MSG(pref_n < GetInitPrefCount(), wxEmptyString,
                wxT("Invalid pref id in wxSTEditorPrefs::GetPrefName"));
    return s_STE_PrefNames[pref_n];
}
void wxSTEditorPrefs::SetPrefName(size_t pref_n, const wxString& prefName)
{
    wxCHECK_RET(pref_n < GetInitPrefCount(),
        wxT("Invalid pref id in wxSTEditorPrefs::SetPrefName"));
    s_STE_PrefNames[pref_n] = prefName;
}

int wxSTEditorPrefs::GetPrefFlags(size_t pref_n) const
{
    wxCHECK_MSG(pref_n < GetInitPrefCount(), 0,
                wxT("Invalid pref id in wxSTEditorPrefs::GetPrefFlags"));
    return s_STE_PrefFlags[pref_n];
}
void wxSTEditorPrefs::SetPrefFlags(size_t pref_n, int flags)
{
    wxCHECK_RET(pref_n < GetInitPrefCount(),
                wxT("Invalid pref id in wxSTEditorPrefs::SetPrefFlags"));
    s_STE_PrefFlags[pref_n] = flags;
}

wxString wxSTEditorPrefs::GetInitPrefValue(size_t pref_n) const
{
    wxCHECK_MSG(pref_n < GetInitPrefCount(), wxEmptyString,
                wxT("Invalid pref id in wxSTEditorPrefs::GetInitPrefValue"));
    return s_STE_PrefValues[pref_n];
}
void wxSTEditorPrefs::SetInitPrefValue(size_t pref_n, const wxString& value) const
{
    wxCHECK_RET(pref_n < GetInitPrefCount(),
                wxT("Invalid pref id in wxSTEditorPrefs::SetInitPrefValue"));
    s_STE_PrefValues[pref_n] = value;
}

size_t wxSTEditorPrefs::AddInitPref(const wxString& prefName,
                                          const wxString& value, int flags) const
{
    s_STE_PrefNames.Add(prefName);
    s_STE_PrefValues.Add(value);
    s_STE_PrefFlags.Add(flags);
    return s_STE_PrefValues.GetCount() - 1;
}
size_t wxSTEditorPrefs::AddInitPref(const wxString& prefName, int value, int flags) const
{
    return AddInitPref(prefName, wxString::Format(wxT("%d"), value), flags);
}
size_t wxSTEditorPrefs::GetInitPrefCount() const
{
    return s_STE_PrefValues.GetCount();
}

bool wxSTEditorPrefs::Create()
{
    UnRef();
    m_refData = new wxSTEditorPref_RefData();
    return true;
}

bool wxSTEditorPrefs::Create(const wxSTEditorPrefs &prefs)
{
    Ref(prefs);
    return true;
}

bool wxSTEditorPrefs::Create(wxSTEditor *editor)
{
    wxCHECK_MSG(editor, false, wxT("Invalid editor in wxSTEditorPrefs::Create"));

    UnRef();
    m_refData = new wxSTEditorPref_RefData();

    // STE_PREF_HIGHLIGHT_SYNTAX
    // STE_PREF_HIGHLIGHT_PREPROC
    // STE_PREF_HIGHLIGHT_BRACES
    // STE_PREF_LOAD_INIT_LANG
    // STE_PREF_LOAD_UNICODE

    SetPrefInt(STE_PREF_WRAP_MODE,           editor->GetWrapMode(), false);
    SetPrefInt(STE_PREF_WRAP_VISUALFLAGS,    editor->GetWrapVisualFlags(), false);
    SetPrefInt(STE_PREF_WRAP_VISUALFLAGSLOC, editor->GetWrapVisualFlagsLocation(), false);
    SetPrefInt(STE_PREF_WRAP_STARTINDENT,    editor->GetWrapStartIndent(), false);

    SetPrefInt(STE_PREF_ZOOM, editor->GetZoom(), false);

    SetPrefBool(STE_PREF_VIEW_EOL,       editor->GetViewEOL(), false);
    SetPrefInt(STE_PREF_VIEW_WHITESPACE, editor->GetViewWhiteSpace(), false);


    SetPrefBool(STE_PREF_INDENT_GUIDES, editor->GetIndentationGuides(), false);
    SetPrefInt(STE_PREF_EDGE_MODE,      editor->GetEdgeMode(), false);
    SetPrefInt(STE_PREF_EDGE_COLUMN,    editor->GetEdgeColumn(), false);

    bool view;
    view = (editor->GetMarginType(STE_MARGIN_NUMBER) == wxSTC_MARGIN_NUMBER) &&
           (editor->GetMarginWidth(STE_MARGIN_NUMBER) > 0);
    SetPrefBool(STE_PREF_VIEW_LINEMARGIN, view, false);
    view = (editor->GetMarginType(STE_MARGIN_MARKER) == wxSTC_MARGIN_SYMBOL) &&
           (editor->GetMarginWidth(STE_MARGIN_MARKER) > 0);
    SetPrefBool(STE_PREF_VIEW_MARKERMARGIN, view, false);
    view = (editor->GetMarginType(STE_MARGIN_FOLD) == wxSTC_MARGIN_SYMBOL) &&
           (editor->GetMarginMask(STE_MARGIN_FOLD) == (long)wxSTC_MASK_FOLDERS) &&
           (editor->GetMarginWidth(STE_MARGIN_FOLD) > 0);
    SetPrefBool(STE_PREF_VIEW_FOLDMARGIN, view, false);

    SetPrefBool(STE_PREF_USE_TABS,            editor->GetUseTabs(), false);
    SetPrefBool(STE_PREF_TAB_INDENTS,         editor->GetTabIndents(), false);
    SetPrefInt(STE_PREF_TAB_WIDTH,            editor->GetTabWidth(), false);
    SetPrefInt(STE_PREF_INDENT_WIDTH,         editor->GetIndent(), false);
    SetPrefBool(STE_PREF_BACKSPACE_UNINDENTS, editor->GetBackSpaceUnIndents(), false);

    SetPrefBool(STE_PREF_CARET_LINE_VISIBLE,  editor->GetCaretLineVisible(), false);
    SetPrefInt(STE_PREF_CARET_WIDTH,          editor->GetCaretWidth(), false);
    SetPrefInt(STE_PREF_CARET_PERIOD,         editor->GetCaretPeriod(), false);
    //STE_PREF_CARET_POLICY_X - can't get these values from editor
    //STE_PREF_CARET_POLICY_Y
    //STE_PREF_CARET_SLOP_X
    //STE_PREF_CARET_SLOP_Y

    SetPrefInt(STE_PREF_EOL_MODE,            editor->GetEOLMode(), false);

    SetPrefInt(STE_PREF_SELECTION_MODE,      editor->GetSelectionMode(), false);

    SetPrefInt(STE_PREF_PRINT_MAGNIFICATION, editor->GetPrintMagnification(), false);
    SetPrefInt(STE_PREF_PRINT_COLOURMODE,    editor->GetPrintColourMode(), false);
    SetPrefInt(STE_PREF_PRINT_WRAPMODE,      editor->GetPrintWrapMode(), false);

    // STE_PREF_FOLD_FLAGS - can't get these values from editor
    // STE_PREF_FOLD_STYLE
    // STE_PREF_FOLDMARGIN_STYLE

    SetPrefBool(STE_PREF_BUFFERED_DRAW,     editor->GetBufferedDraw(), false);
    SetPrefBool(STE_PREF_TWOPHASE_DRAW,     editor->GetTwoPhaseDraw(), false);
    SetPrefInt(STE_PREF_LAYOUT_CACHE,       editor->GetLayoutCache(),  false);
    SetPrefInt(STE_PREF_USEANTIALIASING,    editor->GetUseAntiAliasing(), false);

    // STE_PREF_SAVE_REMOVE_WHITESP
    // STE_PREF_SAVE_CONVERT_EOL

    SetPrefBool(STE_PREF_HORIZ_SCROLLBAR,   editor->GetUseHorizontalScrollBar(), false);
    SetPrefBool(STE_PREF_VERT_SCROLLBAR,    editor->GetUseVerticalScrollBar(), false);

    SetPrefInt(STE_PREF_MARGIN0_TYPE,       editor->GetMarginType(0),  false);
    SetPrefInt(STE_PREF_MARGIN1_TYPE,       editor->GetMarginType(1),  false);
    SetPrefInt(STE_PREF_MARGIN2_TYPE,       editor->GetMarginType(2),  false);
    SetPrefInt(STE_PREF_MARGIN0_WIDTH,      editor->GetMarginWidth(0), false);
    SetPrefInt(STE_PREF_MARGIN1_WIDTH,      editor->GetMarginWidth(1), false);
    SetPrefInt(STE_PREF_MARGIN2_WIDTH,      editor->GetMarginWidth(2), false);
    SetPrefInt(STE_PREF_MARGIN0_MASK,       editor->GetMarginMask(0),  false);
    SetPrefInt(STE_PREF_MARGIN1_MASK,       editor->GetMarginMask(1),  false);
    SetPrefInt(STE_PREF_MARGIN2_MASK,       editor->GetMarginMask(2),  false);
    SetPrefBool(STE_PREF_MARGIN0_SENSITIVE, editor->GetMarginSensitive(0), false);
    SetPrefBool(STE_PREF_MARGIN1_SENSITIVE, editor->GetMarginSensitive(1), false);
    SetPrefBool(STE_PREF_MARGIN2_SENSITIVE, editor->GetMarginSensitive(2), false);

    //STE_PREF_AUTOC_STOPS - can't get this from the editor
    SetPrefInt(STE_PREF_AUTOC_SEPARATOR,       editor->AutoCompGetSeparator(), false);
    //STE_PREF_AUTOC_FILLUPS - can't get this from the editor
    SetPrefBool(STE_PREF_AUTOC_CANCELATSTART,  editor->AutoCompGetCancelAtStart(), false);
    SetPrefBool(STE_PREF_AUTOC_CHOOSESINGLE,   editor->AutoCompGetChooseSingle(), false);
    SetPrefBool(STE_PREF_AUTOC_IGNORECASE,     editor->AutoCompGetIgnoreCase(), false);
    SetPrefBool(STE_PREF_AUTOC_AUTOHIDE,       editor->AutoCompGetAutoHide(), false);
    SetPrefBool(STE_PREF_AUTOC_DROPRESTOFWORD, editor->AutoCompGetDropRestOfWord(), false);
    SetPrefInt(STE_PREF_AUTOC_TYPESEPARATOR,   editor->AutoCompGetTypeSeparator(), false);

    return true;
}

void wxSTEditorPrefs::Copy(const wxSTEditorPrefs &other)
{
    wxCHECK_RET(other.Ok(), wxT("Prefs not created"));
    if (!Ok()) Create();
    if (*this == other) return;
    wxSTEditorPref_RefData *otherPrefData = (wxSTEditorPref_RefData*)other.GetRefData();
    M_PREFDATA->m_prefs = otherPrefData->m_prefs;
}

void wxSTEditorPrefs::Reset()
{
    wxCHECK_RET(Ok(), wxT("Prefs not created"));
    Create();
}

bool wxSTEditorPrefs::IsEqualTo(const wxSTEditorPrefs &prefs) const
{
    wxCHECK_MSG(Ok() && prefs.Ok(), false, wxT("Prefs not created"));
    const wxArrayString& prefArray = M_PREFDATA->m_prefs;
    const wxArrayString& otherPrefArray = ((wxSTEditorPref_RefData*)prefs.GetRefData())->m_prefs;
    if (prefArray.GetCount() != otherPrefArray.GetCount()) return false;
    size_t n, count = prefArray.GetCount();
    for (n = 0; n < count; n++)
    {
        if (prefArray[n] != otherPrefArray[n]) return false;
    }

    return true;
}

size_t wxSTEditorPrefs::GetPrefCount() const
{
    wxCHECK_MSG(Ok(), 0, wxT("Prefs not created"));
    return M_PREFDATA->m_prefs.GetCount();
}

wxString wxSTEditorPrefs::GetPref(size_t pref_n) const
{
    wxCHECK_MSG(Ok(), wxEmptyString, wxT("Prefs not created"));
    wxCHECK_MSG(pref_n < GetPrefCount(), wxEmptyString,
                wxT("Invalid pref id in wxSTEditorPrefs::GetPrefInt"));
    return M_PREFDATA->m_prefs[pref_n];
}
bool wxSTEditorPrefs::SetPref(size_t pref_n, const wxString& value, bool update)
{
    wxCHECK_MSG(Ok(), false, wxT("Prefs not created"));
    wxCHECK_MSG(pref_n < GetPrefCount(), false,
                wxT("Invalid pref id in wxSTEditorPrefs::SetPref"));
    M_PREFDATA->m_prefs[pref_n] = value;

    if (update)
        UpdateAllEditors();

    return true;
}
int wxSTEditorPrefs::GetPrefInt(size_t pref_n) const
{
    return wxAtoi(GetPref(pref_n));
}
bool wxSTEditorPrefs::SetPrefInt(size_t pref_n, int value, bool update)
{
    return SetPref(pref_n, wxString::Format(wxT("%d"), value), update);
}

// Note: The define generates this code
//if (!HasPrefFlag(STE_PREF_WRAP_MODE, STE_PREF_FLAG_IGNORE) &&
//    (editor->GetWrapMode() != GetPrefInt(STE_PREF_WRAP_MODE)))
//    editor->SetWrapMode(GetPrefInt(STE_PREF_WRAP_MODE));

#define UPEDIT(pref_n, editGetFn, editSetFn, getPrefFn) \
    if (!HasPrefFlag(pref_n, STE_PREF_FLAG_IGNORE) &&   \
        (editor->editGetFn() != getPrefFn(pref_n)))     \
        editor->editSetFn(getPrefFn(pref_n));

#define UPEDIT_PARAM(pref_n, param, editGetFn, editSetFn, getPrefFn) \
    if (!HasPrefFlag(pref_n, STE_PREF_FLAG_IGNORE) &&   \
        (editor->editGetFn(param) != getPrefFn(pref_n)))     \
        editor->editSetFn(param, getPrefFn(pref_n));

void wxSTEditorPrefs::UpdateEditor(wxSTEditor *editor)
{
    wxCHECK_RET(Ok(), wxT("Prefs not created"));
    wxCHECK_RET(editor, wxT("Invalid wxSTEditor"));

    // STE_PREF_SYNTAXHILIGHT  done in langs

    if (!HasPrefFlag(STE_PREF_HIGHLIGHT_PREPROC, STE_PREF_FLAG_IGNORE))
        editor->SetProperty(wxT("styling.within.preprocessor"),
                            GetPrefBool(STE_PREF_HIGHLIGHT_PREPROC) ? wxT("1") : wxT("0"));

    // STE_PREF_HIGHLIGHT_BRACES nothing to set, see wxSTEditor::OnSTCUpdateUI
    // STE_PREF_LOAD_INIT_LANG nothing to set, see wxSTEditor::LoadFile
    // STE_PREF_LOAD_UNICODE nothing to set, see wxSTEditor::LoadFile

    UPEDIT(STE_PREF_WRAP_MODE,           GetWrapMode, SetWrapMode, GetPrefInt)
    UPEDIT(STE_PREF_WRAP_VISUALFLAGS,    GetWrapVisualFlags, SetWrapVisualFlags, GetPrefInt)
    UPEDIT(STE_PREF_WRAP_VISUALFLAGSLOC, GetWrapVisualFlagsLocation, SetWrapVisualFlagsLocation, GetPrefInt)
    UPEDIT(STE_PREF_WRAP_STARTINDENT,    GetWrapStartIndent, SetWrapStartIndent, GetPrefInt)

    UPEDIT(STE_PREF_ZOOM, GetZoom, SetZoom, GetPrefInt)

    UPEDIT(STE_PREF_VIEW_EOL,        GetViewEOL, SetViewEOL, GetPrefBool)
    UPEDIT(STE_PREF_VIEW_WHITESPACE, GetViewWhiteSpace, SetViewWhiteSpace, GetPrefInt)

    UPEDIT(STE_PREF_INDENT_GUIDES, GetIndentationGuides, SetIndentationGuides, GetPrefBool)
    UPEDIT(STE_PREF_EDGE_MODE,     GetEdgeMode, SetEdgeMode, GetPrefInt)
    UPEDIT(STE_PREF_EDGE_COLUMN,   GetEdgeColumn, SetEdgeColumn, GetPrefInt)

    // STE_PREF_VIEW_LINEMARGIN   see below
    // STE_PREF_VIEW_MARKERMARGIN see below
    // STE_PREF_VIEW_FOLDMARGIN   see below

    UPEDIT(STE_PREF_USE_TABS,            GetUseTabs, SetUseTabs, GetPrefBool)
    UPEDIT(STE_PREF_TAB_INDENTS,         GetTabIndents, SetTabIndents, GetPrefBool)
    UPEDIT(STE_PREF_TAB_WIDTH,           GetTabWidth, SetTabWidth, GetPrefInt)
    UPEDIT(STE_PREF_INDENT_WIDTH,        GetIndent, SetIndent, GetPrefInt)
    UPEDIT(STE_PREF_BACKSPACE_UNINDENTS, GetBackSpaceUnIndents, SetBackSpaceUnIndents, GetPrefBool)
    // STE_PREF_AUTOINDENT - doesn't require changing the editor

    UPEDIT(STE_PREF_CARET_LINE_VISIBLE, GetCaretLineVisible, SetCaretLineVisible, GetPrefBool)
    UPEDIT(STE_PREF_CARET_WIDTH,        GetCaretWidth, SetCaretWidth, GetPrefInt)
    UPEDIT(STE_PREF_CARET_PERIOD,       GetCaretPeriod, SetCaretPeriod, GetPrefInt)
    if (!HasPrefFlag(STE_PREF_CARET_POLICY_X, STE_PREF_FLAG_IGNORE))
        editor->SetXCaretPolicy(GetPrefInt(STE_PREF_CARET_POLICY_X), GetPrefInt(STE_PREF_CARET_SLOP_X));
    if (!HasPrefFlag(STE_PREF_CARET_POLICY_Y, STE_PREF_FLAG_IGNORE))
        editor->SetYCaretPolicy(GetPrefInt(STE_PREF_CARET_POLICY_Y), GetPrefInt(STE_PREF_CARET_SLOP_Y));
    if (!HasPrefFlag(STE_PREF_VISIBLE_POLICY, STE_PREF_FLAG_IGNORE))
        editor->SetVisiblePolicy(GetPrefInt(STE_PREF_VISIBLE_POLICY), GetPrefInt(STE_PREF_VISIBLE_SLOP));

    UPEDIT(STE_PREF_EOL_MODE, GetEOLMode, SetEOLMode, GetPrefInt)

    UPEDIT(STE_PREF_SELECTION_MODE, GetSelectionMode, SetSelectionMode, GetPrefInt)

    UPEDIT(STE_PREF_PRINT_MAGNIFICATION, GetPrintMagnification, SetPrintMagnification, GetPrefInt)
    UPEDIT(STE_PREF_PRINT_COLOURMODE,    GetPrintColourMode, SetPrintColourMode, GetPrefInt)
    UPEDIT(STE_PREF_PRINT_WRAPMODE,      GetPrintWrapMode, SetPrintWrapMode, GetPrefInt)

    if (!HasPrefFlag(STE_PREF_FOLD_FLAGS, STE_PREF_FLAG_IGNORE))
        editor->SetFoldFlags(GetPrefInt(STE_PREF_FOLD_FLAGS));
    if (!HasPrefFlag(STE_PREF_FOLD_STYLES, STE_PREF_FLAG_IGNORE))
    {
        int fold_style = GetPrefInt(STE_PREF_FOLD_STYLES);
        editor->SetProperty(wxT("fold.compact"),           STE_HASBIT(fold_style, STE_FOLD_COMPACT)   ? wxT("1") : wxT("0"));
        editor->SetProperty(wxT("fold.comment"),           STE_HASBIT(fold_style, STE_FOLD_COMMENT)   ? wxT("1") : wxT("0"));
        editor->SetProperty(wxT("fold.preprocessor"),      STE_HASBIT(fold_style, STE_FOLD_PREPROC)   ? wxT("1") : wxT("0"));
        editor->SetProperty(wxT("fold.at.else"),           STE_HASBIT(fold_style, STE_FOLD_ATELSE)    ? wxT("1") : wxT("0"));
        editor->SetProperty(wxT("fold.html"),              STE_HASBIT(fold_style, STE_FOLD_HTML)      ? wxT("1") : wxT("0"));
        editor->SetProperty(wxT("fold.html.preprocessor"), STE_HASBIT(fold_style, STE_FOLD_HTMLPREP)  ? wxT("1") : wxT("0"));
        editor->SetProperty(wxT("fold.directive"),         STE_HASBIT(fold_style, STE_FOLD_DIRECTIVE) ? wxT("1") : wxT("0"));
        editor->SetProperty(wxT("fold.comment.python"),    STE_HASBIT(fold_style, STE_FOLD_COMMENTPY) ? wxT("1") : wxT("0"));
        editor->SetProperty(wxT("fold.quotes.python"),     STE_HASBIT(fold_style, STE_FOLD_QUOTESPY)  ? wxT("1") : wxT("0"));
        editor->SetProperty(wxT("tab.timmy.whinge.level"), STE_HASBIT(fold_style, STE_FOLD_TABTIMMY)  ? wxT("1") : wxT("0"));
    }

    // try to set fold margin styles, the styles will try as well
    if (!HasPrefFlag(STE_PREF_FOLDMARGIN_STYLE, STE_PREF_FLAG_IGNORE) && editor->GetEditorStyles().Ok())
        editor->GetEditorStyles().SetFoldMarkerStyle(GetPrefInt(STE_PREF_FOLDMARGIN_STYLE));

    UPEDIT(STE_PREF_BUFFERED_DRAW, GetBufferedDraw, SetBufferedDraw, GetPrefBool)
    UPEDIT(STE_PREF_TWOPHASE_DRAW, GetTwoPhaseDraw, SetTwoPhaseDraw, GetPrefBool)
    UPEDIT(STE_PREF_LAYOUT_CACHE,  GetLayoutCache, SetLayoutCache, GetPrefInt)
    UPEDIT(STE_PREF_USEANTIALIASING, GetUseAntiAliasing, SetUseAntiAliasing, GetPrefBool)

    // STE_PREF_SAVE_REMOVE_WHITESP nothing to set
    // STE_PREF_SAVE_CONVERT_EOL    nothing to set

    // -----------------------------------------
    UPEDIT(STE_PREF_HORIZ_SCROLLBAR,  GetUseHorizontalScrollBar, SetUseHorizontalScrollBar, GetPrefBool)
    UPEDIT(STE_PREF_VERT_SCROLLBAR,   GetUseVerticalScrollBar, SetUseVerticalScrollBar, GetPrefBool)

    UPEDIT_PARAM(STE_PREF_MARGIN0_TYPE, STE_MARGIN_0, GetMarginType, SetMarginType, GetPrefInt)
    UPEDIT_PARAM(STE_PREF_MARGIN1_TYPE, STE_MARGIN_1, GetMarginType, SetMarginType, GetPrefInt)
    UPEDIT_PARAM(STE_PREF_MARGIN2_TYPE, STE_MARGIN_2, GetMarginType, SetMarginType, GetPrefInt)

    UPEDIT_PARAM(STE_PREF_MARGIN0_MASK, STE_MARGIN_0, GetMarginMask, SetMarginMask, GetPrefInt)
    UPEDIT_PARAM(STE_PREF_MARGIN1_MASK, STE_MARGIN_1, GetMarginMask, SetMarginMask, GetPrefInt)
    UPEDIT_PARAM(STE_PREF_MARGIN2_MASK, STE_MARGIN_2, GetMarginMask, SetMarginMask, GetPrefInt)

    UPEDIT_PARAM(STE_PREF_MARGIN0_SENSITIVE, STE_MARGIN_0, GetMarginSensitive, SetMarginSensitive, GetPrefBool)
    UPEDIT_PARAM(STE_PREF_MARGIN1_SENSITIVE, STE_MARGIN_1, GetMarginSensitive, SetMarginSensitive, GetPrefBool)
    UPEDIT_PARAM(STE_PREF_MARGIN2_SENSITIVE, STE_MARGIN_2, GetMarginSensitive, SetMarginSensitive, GetPrefBool)

    int automargin_width = editor->TextWidth(wxSTC_STYLE_LINENUMBER, wxT("_999999"));
    int margin0_width = GetPrefBool(STE_PREF_VIEW_LINEMARGIN)   ? GetPrefInt(STE_PREF_MARGIN0_WIDTH) : 0;
    int margin1_width = GetPrefBool(STE_PREF_VIEW_MARKERMARGIN) ? GetPrefInt(STE_PREF_MARGIN1_WIDTH) : 0;
    int margin2_width = GetPrefBool(STE_PREF_VIEW_FOLDMARGIN)   ? GetPrefInt(STE_PREF_MARGIN2_WIDTH) : 0;

    if (margin0_width < 0) margin0_width = automargin_width;
    if (margin1_width < 0) margin1_width = automargin_width;
    if (margin2_width < 0) margin2_width = automargin_width;

    if (!HasPrefFlag(STE_PREF_MARGIN0_WIDTH, STE_PREF_FLAG_IGNORE) &&
        (editor->GetMarginWidth(STE_MARGIN_0) != margin0_width))
        editor->SetMarginWidth(STE_MARGIN_0,    margin0_width);
    if (!HasPrefFlag(STE_PREF_MARGIN1_WIDTH, STE_PREF_FLAG_IGNORE) &&
        (editor->GetMarginWidth(STE_MARGIN_1) != margin1_width))
        editor->SetMarginWidth(STE_MARGIN_1,    margin1_width);
    if (!HasPrefFlag(STE_PREF_MARGIN2_WIDTH, STE_PREF_FLAG_IGNORE) &&
        (editor->GetMarginWidth(STE_MARGIN_2) != margin2_width))
        editor->SetMarginWidth(STE_MARGIN_2,    margin2_width);

    if (!HasPrefFlag(STE_PREF_AUTOC_STOPS, STE_PREF_FLAG_IGNORE))
        editor->AutoCompStops(GetPref(STE_PREF_AUTOC_STOPS));
    UPEDIT(STE_PREF_AUTOC_SEPARATOR,  AutoCompGetSeparator, AutoCompSetSeparator, GetPrefInt)
    if (!HasPrefFlag(STE_PREF_AUTOC_FILLUPS, STE_PREF_FLAG_IGNORE))
        editor->AutoCompSetFillUps(GetPref(STE_PREF_AUTOC_FILLUPS));
    UPEDIT(STE_PREF_AUTOC_CANCELATSTART,  AutoCompGetCancelAtStart, AutoCompSetCancelAtStart, GetPrefBool)
    UPEDIT(STE_PREF_AUTOC_CHOOSESINGLE,   AutoCompGetChooseSingle, AutoCompSetChooseSingle, GetPrefBool)
    UPEDIT(STE_PREF_AUTOC_IGNORECASE,     AutoCompGetIgnoreCase, AutoCompSetIgnoreCase, GetPrefBool)
    UPEDIT(STE_PREF_AUTOC_AUTOHIDE,       AutoCompGetAutoHide, AutoCompSetAutoHide, GetPrefBool)
    UPEDIT(STE_PREF_AUTOC_DROPRESTOFWORD, AutoCompGetDropRestOfWord, AutoCompSetDropRestOfWord, GetPrefBool)
    UPEDIT(STE_PREF_AUTOC_TYPESEPARATOR,  AutoCompGetTypeSeparator, AutoCompSetTypeSeparator, GetPrefInt)
}

#define MENU_IDVAL(menu_id) menu_id, GetPrefBoolByID(menu_id)
#define MENU_FIND_CHECK_ENABLE(menu_id, enabled) \
                { wxMenuItem *item = menu->FindItem(menu_id); \
                  if (item) { item->Check(GetPrefBoolByID(menu_id)); item->Enable(enabled); } }

void wxSTEditorPrefs::UpdateMenuToolItems(wxMenu *menu, wxMenuBar *menuBar,
                                          wxToolBar *toolBar)
{
    wxCHECK_RET(Ok(), wxT("Prefs not created"));
    if (!menu && !menuBar && !toolBar) return;

    STE_MM::DoCheckItem(menu, menuBar, toolBar, MENU_IDVAL(ID_STE_PREF_VIEW_EOL));
    STE_MM::DoCheckItem(menu, menuBar, toolBar, MENU_IDVAL(ID_STE_PREF_EDGE_MODE));
    STE_MM::DoCheckItem(menu, menuBar, toolBar, MENU_IDVAL(ID_STE_PREF_VIEW_LINEMARGIN));
    STE_MM::DoCheckItem(menu, menuBar, toolBar, MENU_IDVAL(ID_STE_PREF_VIEW_FOLDMARGIN));
    STE_MM::DoCheckItem(menu, menuBar, toolBar, MENU_IDVAL(ID_STE_PREF_VIEW_MARKERMARGIN));
    STE_MM::DoCheckItem(menu, menuBar, toolBar, MENU_IDVAL(ID_STE_PREF_VIEW_WHITESPACE));
    STE_MM::DoCheckItem(menu, menuBar, toolBar, MENU_IDVAL(ID_STE_PREF_WRAP_MODE));
    STE_MM::DoCheckItem(menu, menuBar, toolBar, MENU_IDVAL(ID_STE_PREF_USE_TABS));
    STE_MM::DoCheckItem(menu, menuBar, toolBar, MENU_IDVAL(ID_STE_PREF_TAB_INDENTS));
    STE_MM::DoCheckItem(menu, menuBar, toolBar, MENU_IDVAL(ID_STE_PREF_BACKSPACE_UNINDENTS));
    STE_MM::DoCheckItem(menu, menuBar, toolBar, MENU_IDVAL(ID_STE_PREF_AUTOINDENT));
    STE_MM::DoCheckItem(menu, menuBar, toolBar, MENU_IDVAL(ID_STE_PREF_INDENT_GUIDES));
}

void wxSTEditorPrefs::LoadConfig( wxConfigBase &config,
                                  const wxString &configPath )
{
    wxCHECK_RET(Ok(), wxT("Prefs not created"));
    wxString key = wxSTEditorOptions::FixConfigPath(configPath, true);

    long val = 0;
    wxString strVal;
    size_t pref_n, pref_count = GetPrefCount();
    for (pref_n = 0; pref_n < pref_count; pref_n++)
    {
        wxString name = GetPrefName(pref_n);
        name.Replace(wxT(" "), wxT("_"), true);

        if (HasPrefFlag(pref_n, STE_PREF_FLAG_INT|STE_PREF_FLAG_BOOL))
        {
            if (config.Read(key + name, &val))
                SetPrefInt(pref_n, val, false);
        }
        else if (config.Read(key + name, &strVal))
            SetPref(pref_n, strVal, false);
    }

    UpdateAllEditors();
}

void wxSTEditorPrefs::SaveConfig( wxConfigBase &config,
                                  const wxString &configPath,
                                  int flags ) const
{
    wxCHECK_RET(Ok(), wxT("Prefs not created"));
    wxString key = wxSTEditorOptions::FixConfigPath(configPath, true);

    size_t pref_n, pref_count = GetPrefCount();
    for (pref_n = 0; pref_n < pref_count; pref_n++)
    {
        wxString name = GetPrefName(pref_n);
        name.Replace(wxT(" "), wxT("_"), true);

        if (!HasPrefFlag(pref_n, STE_PREF_FLAG_NOCONFIG))
        {
            if (((flags && STE_CONFIG_SAVE_DIFFS) == 0) ||
                (M_PREFDATA->m_prefs[pref_n] != GetInitPrefValue(pref_n)))
            {
                if (HasPrefFlag(pref_n, STE_PREF_FLAG_INT|STE_PREF_FLAG_BOOL))
                    config.Write(key + name, GetPrefInt(pref_n));
                else
                    config.Write(key + name, M_PREFDATA->m_prefs[pref_n]);
            }
        }
    }
}

// global precreated wxSTEditorPrefs
wxSTEditorPrefs  s_wxSTEditorPrefs(true);

