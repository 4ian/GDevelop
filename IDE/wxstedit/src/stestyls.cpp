///////////////////////////////////////////////////////////////////////////////
// File:        stestyls.cpp
// Purpose:     wxSTEditor Styles initialization
// Maintainer:
// Created:     2003-04-04
// RCS-ID:      $Id: stestyls.cpp,v 1.30 2007/02/15 02:20:43 jrl1 Exp $
// Copyright:   (c) John Labenski, Otto Wyss
// Licence:     wxWidgets licence
///////////////////////////////////////////////////////////////////////////////

/*
Updated to SciTE 1.71, 7/05/05

Code below marked with this copyright is under this license.
"Copyright 1998-2003 by Neil Hodgson <neilh@scintilla.org>"

License for Scintilla and SciTE

Copyright 1998-2003 by Neil Hodgson <neilh@scintilla.org>

All Rights Reserved

Permission to use, copy, modify, and distribute this software and its
documentation for any purpose and without fee is hereby granted,
provided that the above copyright notice appear in all copies and that
both that copyright notice and this permission notice appear in
supporting documentation.

NEIL HODGSON DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS
SOFTWARE, INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS, IN NO EVENT SHALL NEIL HODGSON BE LIABLE FOR ANY
SPECIAL, INDIRECT OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS,
WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER
TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE
OR PERFORMANCE OF THIS SOFTWARE.
*/

// For compilers that support precompilation, includes <wx/wx.h>.
#include "wx/wxprec.h"

#ifdef __BORLANDC__
    #pragma hdrstop
#endif

// for all others, include the necessary headers
#ifndef WX_PRECOMP
    #include "wx/wx.h"
#endif

#include "wx/stedit/stestyls.h"
#include "wx/stedit/stedit.h"

#include "wx/tokenzr.h"
#include "wx/config.h"
#include "wx/textfile.h"
#include "wx/filename.h"

#include "wx/arrimpl.cpp"
WX_DEFINE_OBJARRAY(wxArraySTEditorStyle);
DEFINE_PAIRARRAY_INTKEY(wxSTEditorStyle, wxSTEPairArrayIntSTEStyle)

extern wxSTEditorStyles s_wxSTEditorStyles;

//----------------------------------------------------------------------------
// wxSTEditorStyles_RefData
//----------------------------------------------------------------------------

wxSTEPairArrayIntSTEStyle s_STE_PairArrayStyles;

class wxSTEditorStyles_RefData : public wxSTEditorPrefBase_RefData
{
public:
    wxSTEditorStyles_RefData()
    {
        m_pairArrayStyles = s_STE_PairArrayStyles;
    }

    wxSTEPairArrayIntSTEStyle m_pairArrayStyles;
};

//----------------------------------------------------------------------------
// wxSTEditorStyles
//----------------------------------------------------------------------------
IMPLEMENT_DYNAMIC_CLASS(wxSTEditorStyles, wxSTEditorPrefBase)

#define M_STYLEDATA ((wxSTEditorStyles_RefData *)m_refData)

wxSTEditorStyles& wxSTEditorStyles::GetGlobalEditorStyles()
{
    return s_wxSTEditorStyles;
}

void wxSTEditorStyles::Init()
{
    if (s_STE_PairArrayStyles.GetCount() != 0) return;

    wxArrayInt           &keyArr = s_STE_PairArrayStyles.GetKeys();
    wxArraySTEditorStyle &valArr = s_STE_PairArrayStyles.GetValues();
    keyArr.Alloc(52);
    valArr.Alloc(52);

    keyArr.Add(STE_STYLE_DEFAULT);           valArr.Add(wxSTEditorStyle(wxT("Default text"),       0x000000, 0xFFFFFF, STE_DEF_FACENAME, STE_DEF_FONTSIZE, 0, 0,                                 STE_STYLE_USES_ALL));
    keyArr.Add(STE_STYLE_KEYWORD1);          valArr.Add(wxSTEditorStyle(wxT("Keyword 1"),          0x0000FF, 0xFFFFFF, STE_DEF_FACENAME, STE_DEF_FONTSIZE, 0, STE_STYLE_USEDEFAULT_NOFONTSTYLE,  STE_STYLE_USES_ALL));
    keyArr.Add(STE_STYLE_KEYWORD2);          valArr.Add(wxSTEditorStyle(wxT("Keyword 2"),          0x0000AA, 0xFFFFFF, STE_DEF_FACENAME, STE_DEF_FONTSIZE, 0, STE_STYLE_USEDEFAULT_NOFORECOLOUR, STE_STYLE_USES_ALL));
    keyArr.Add(STE_STYLE_KEYWORD3);          valArr.Add(wxSTEditorStyle(wxT("Keyword 3"),          0x42426F, 0xFFFFFF, STE_DEF_FACENAME, STE_DEF_FONTSIZE, 0, STE_STYLE_USEDEFAULT_NOFORECOLOUR, STE_STYLE_USES_ALL));
    keyArr.Add(STE_STYLE_KEYWORD4);          valArr.Add(wxSTEditorStyle(wxT("Keyword 4"),          0xAA00AA, 0xFFFFFF, STE_DEF_FACENAME, STE_DEF_FONTSIZE, 0, STE_STYLE_USEDEFAULT_NOFORECOLOUR, STE_STYLE_USES_ALL));
    keyArr.Add(STE_STYLE_KEYWORD5);          valArr.Add(wxSTEditorStyle(wxT("Keyword 5"),          0x2F2F2F, 0xFFFFFF, STE_DEF_FACENAME, STE_DEF_FONTSIZE, 0, STE_STYLE_USEDEFAULT_NOFORECOLOUR, STE_STYLE_USES_ALL));
    keyArr.Add(STE_STYLE_KEYWORD6);          valArr.Add(wxSTEditorStyle(wxT("Keyword 6"),          0x808080, 0xFFFFFF, STE_DEF_FACENAME, STE_DEF_FONTSIZE, 0, STE_STYLE_USEDEFAULT_NOFORECOLOUR, STE_STYLE_USES_ALL));
    keyArr.Add(STE_STYLE_COMMENT);           valArr.Add(wxSTEditorStyle(wxT("Comment"),            0x238E23, 0xFFFFFF, STE_DEF_FACENAME, STE_DEF_FONTSIZE, 0, STE_STYLE_USEDEFAULT_NOFORECOLOUR, STE_STYLE_USES_ALL));
    keyArr.Add(STE_STYLE_COMMENTDOC);        valArr.Add(wxSTEditorStyle(wxT("Comment doc"),        0x238E23, 0xFFFFFF, STE_DEF_FACENAME, STE_DEF_FONTSIZE, 0, STE_STYLE_USEDEFAULT_NOFORECOLOUR, STE_STYLE_USES_ALL));
    keyArr.Add(STE_STYLE_COMMENTLINE);       valArr.Add(wxSTEditorStyle(wxT("Comment line"),       0x238E23, 0xFFFFFF, STE_DEF_FACENAME, STE_DEF_FONTSIZE, 0, STE_STYLE_USEDEFAULT_NOFORECOLOUR, STE_STYLE_USES_ALL));
    keyArr.Add(STE_STYLE_COMMENTOTHER);      valArr.Add(wxSTEditorStyle(wxT("Comment other"),      0x238E23, 0xFFFFFF, STE_DEF_FACENAME, STE_DEF_FONTSIZE, 0, STE_STYLE_USEDEFAULT_NOFORECOLOUR, STE_STYLE_USES_ALL));
    keyArr.Add(STE_STYLE_CHARACTER);         valArr.Add(wxSTEditorStyle(wxT("Character"),          0x9F9F9F, 0xFFFFFF, STE_DEF_FACENAME, STE_DEF_FONTSIZE, 0, STE_STYLE_USEDEFAULT_NOFORECOLOUR, STE_STYLE_USES_ALL));
    keyArr.Add(STE_STYLE_CHARACTEREOL);      valArr.Add(wxSTEditorStyle(wxT("Character EOL"),      0x9F9F9F, 0xFFFFFF, STE_DEF_FACENAME, STE_DEF_FONTSIZE, 0, STE_STYLE_USEDEFAULT_NOFORECOLOUR, STE_STYLE_USES_ALL));
    keyArr.Add(STE_STYLE_STRING);            valArr.Add(wxSTEditorStyle(wxT("String"),             0x2AA52A, 0xFFFFFF, STE_DEF_FACENAME, STE_DEF_FONTSIZE, 0, STE_STYLE_USEDEFAULT_NOFORECOLOUR, STE_STYLE_USES_ALL));
    keyArr.Add(STE_STYLE_STRINGEOL);         valArr.Add(wxSTEditorStyle(wxT("String EOL"),         0x2AA52A, 0xFFFFFF, STE_DEF_FACENAME, STE_DEF_FONTSIZE, 0, STE_STYLE_USEDEFAULT_NOFORECOLOUR, STE_STYLE_USES_ALL));
    keyArr.Add(STE_STYLE_DELIMITER);         valArr.Add(wxSTEditorStyle(wxT("Delimiter"),          0xCC3232, 0xFFFFFF, STE_DEF_FACENAME, STE_DEF_FONTSIZE, 0, STE_STYLE_USEDEFAULT_NOFORECOLOUR, STE_STYLE_USES_ALL));
    keyArr.Add(STE_STYLE_PUNCTUATION);       valArr.Add(wxSTEditorStyle(wxT("Punctuation"),        0xCC3232, 0xFFFFFF, STE_DEF_FACENAME, STE_DEF_FONTSIZE, 0, STE_STYLE_USEDEFAULT_NOFORECOLOUR, STE_STYLE_USES_ALL));
    keyArr.Add(STE_STYLE_OPERATOR);          valArr.Add(wxSTEditorStyle(wxT("Operator"),           0x000000, 0xFFFFFF, STE_DEF_FACENAME, STE_DEF_FONTSIZE, 0, STE_STYLE_USEDEFAULT_NOFORECOLOUR, STE_STYLE_USES_ALL));
    keyArr.Add(STE_STYLE_BRACE);             valArr.Add(wxSTEditorStyle(wxT("Brace"),              0x4F2F4F, 0xFFFFFF, STE_DEF_FACENAME, STE_DEF_FONTSIZE, 0, STE_STYLE_USEDEFAULT_NOFORECOLOUR, STE_STYLE_USES_ALL));
    keyArr.Add(STE_STYLE_COMMAND);           valArr.Add(wxSTEditorStyle(wxT("Command"),            0x0000FF, 0xFFFFFF, STE_DEF_FACENAME, STE_DEF_FONTSIZE, 0, STE_STYLE_USEDEFAULT_NOFORECOLOUR, STE_STYLE_USES_ALL));
    keyArr.Add(STE_STYLE_IDENTIFIER);        valArr.Add(wxSTEditorStyle(wxT("Identifier"),         0x000000, 0xFFFFFF, STE_DEF_FACENAME, STE_DEF_FONTSIZE, 0, STE_STYLE_USEDEFAULT_NOFORECOLOUR, STE_STYLE_USES_ALL));
    keyArr.Add(STE_STYLE_LABEL);             valArr.Add(wxSTEditorStyle(wxT("Label"),              0x4F2F4F, 0xFFFFFF, STE_DEF_FACENAME, STE_DEF_FONTSIZE, 0, STE_STYLE_USEDEFAULT_NOFORECOLOUR, STE_STYLE_USES_ALL));
    keyArr.Add(STE_STYLE_NUMBER);            valArr.Add(wxSTEditorStyle(wxT("Number"),             0x238E6B, 0xFFFFFF, STE_DEF_FACENAME, STE_DEF_FONTSIZE, 0, STE_STYLE_USEDEFAULT_NOFORECOLOUR, STE_STYLE_USES_ALL));
    keyArr.Add(STE_STYLE_PARAMETER);         valArr.Add(wxSTEditorStyle(wxT("Parameter"),          0x4F2F4F, 0xFFFFFF, STE_DEF_FACENAME, STE_DEF_FONTSIZE, 0, STE_STYLE_USEDEFAULT_NOFORECOLOUR, STE_STYLE_USES_ALL));
    keyArr.Add(STE_STYLE_REGEX);             valArr.Add(wxSTEditorStyle(wxT("Regular expression"), 0xDB70DB, 0xFFFFFF, STE_DEF_FACENAME, STE_DEF_FONTSIZE, 0, STE_STYLE_USEDEFAULT_NOFORECOLOUR, STE_STYLE_USES_ALL));
    keyArr.Add(STE_STYLE_UUID);              valArr.Add(wxSTEditorStyle(wxT("UUID"),               0xDB70DB, 0xFFFFFF, STE_DEF_FACENAME, STE_DEF_FONTSIZE, 0, STE_STYLE_USEDEFAULT_NOFORECOLOUR, STE_STYLE_USES_ALL));
    keyArr.Add(STE_STYLE_VALUE);             valArr.Add(wxSTEditorStyle(wxT("Value"),              0xDB70DB, 0xFFFFFF, STE_DEF_FACENAME, STE_DEF_FONTSIZE, 0, STE_STYLE_USEDEFAULT_NOFORECOLOUR, STE_STYLE_USES_ALL));
    keyArr.Add(STE_STYLE_PREPROCESSOR);      valArr.Add(wxSTEditorStyle(wxT("Preprocessor"),       0x808080, 0xFFFFFF, STE_DEF_FACENAME, STE_DEF_FONTSIZE, 0, STE_STYLE_USEDEFAULT_NOFORECOLOUR, STE_STYLE_USES_ALL));
    keyArr.Add(STE_STYLE_SCRIPT);            valArr.Add(wxSTEditorStyle(wxT("Script"),             0x2F2F2F, 0xFFFFFF, STE_DEF_FACENAME, STE_DEF_FONTSIZE, 0, STE_STYLE_USEDEFAULT_NOFORECOLOUR, STE_STYLE_USES_ALL));
    keyArr.Add(STE_STYLE_ERROR);             valArr.Add(wxSTEditorStyle(wxT("Error"),              0xFF0000, 0xFFFFFF, STE_DEF_FACENAME, STE_DEF_FONTSIZE, 0, STE_STYLE_USEDEFAULT_NOFORECOLOUR, STE_STYLE_USES_ALL));
    keyArr.Add(STE_STYLE_UNDEFINED);         valArr.Add(wxSTEditorStyle(wxT("Undefined"),          0x32CC32, 0xFFFFFF, STE_DEF_FACENAME, STE_DEF_FONTSIZE, 0, STE_STYLE_USEDEFAULT_NOFORECOLOUR, STE_STYLE_USES_ALL));
    //keyArr.Add(STE_STYLE_UNUSED);          valArr.Add(wxSTEditorStyle(wxT("Unused"),             0x000000, 0xFFFFFF, STE_DEF_FACENAME, STE_DEF_FONTSIZE, 0, STE_STYLE_USEDEFAULT_ALL,          STE_STYLE_USES_ALL));
    //keyArr.Add(wxSTC_STYLE_DEFAULT);       valArr.Add(wxSTEditorStyle(wxT("Editor default"),     0x000000, 0xFFFFFF, STE_DEF_FACENAME, STE_DEF_FONTSIZE, 0, STE_STYLE_USEDEFAULT_ALL,          STE_STYLE_USES_ALL));

    keyArr.Add(STE_STYLE_LINENUMBER);        valArr.Add(wxSTEditorStyle(wxT("Line numbers"),       0x000000, 0xC0C0C0, STE_DEF_FACENAME, STE_DEF_FONTSIZE, 0, STE_STYLE_USEDEFAULT_NOCOLOUR,     STE_STYLE_USES_ALL));
    keyArr.Add(STE_STYLE_BRACELIGHT);        valArr.Add(wxSTEditorStyle(wxT("Brace hilight"),      0x0000FF, 0xFFFFFF, STE_DEF_FACENAME, STE_DEF_FONTSIZE, 0, STE_STYLE_USEDEFAULT_NOFORECOLOUR, STE_STYLE_USES_ALL));
    keyArr.Add(STE_STYLE_BRACEBAD);          valArr.Add(wxSTEditorStyle(wxT("Brace mismatch"),     0xFF0000, 0xFFFFFF, STE_DEF_FACENAME, STE_DEF_FONTSIZE, 0, STE_STYLE_USEDEFAULT_NOFORECOLOUR, STE_STYLE_USES_ALL));
    keyArr.Add(STE_STYLE_CONTROLCHAR);       valArr.Add(wxSTEditorStyle(wxT("Control character"),  0x000000, 0xFFFFFF, STE_DEF_FACENAME, STE_DEF_FONTSIZE, 0, STE_STYLE_USEDEFAULT_NOFORECOLOUR, STE_STYLE_USES_ALL));
    keyArr.Add(STE_STYLE_INDENTGUIDE);       valArr.Add(wxSTEditorStyle(wxT("Indent guide"),       0x808080, 0xFFFFFF, STE_DEF_FACENAME, STE_DEF_FONTSIZE, 0, STE_STYLE_USEDEFAULT_NOFORECOLOUR, STE_STYLE_USES_COLOUR));

    keyArr.Add(STE_STYLE_SELECTION_COLOUR);  valArr.Add(wxSTEditorStyle(wxT("Selection colour"),   0xFFFFFF, 0xC0C0C0, wxEmptyString,    0,                0, STE_STYLE_USEDEFAULT_NOCOLOUR,     STE_STYLE_USES_COLOUR));
    keyArr.Add(STE_STYLE_WHITESPACE_COLOUR); valArr.Add(wxSTEditorStyle(wxT("Whitespace colour"),  0x000000, 0xFFFFFF, wxEmptyString,    0,                0, STE_STYLE_USEDEFAULT_ALL,          STE_STYLE_USES_COLOUR));
    keyArr.Add(STE_STYLE_EDGE_COLOUR);       valArr.Add(wxSTEditorStyle(wxT("Edge colour"),        0xC0C0C0, 0xFFFFFF, wxEmptyString,    0,                0, STE_STYLE_USEDEFAULT_NOFORECOLOUR, STE_STYLE_USES_FORECOLOUR));
    keyArr.Add(STE_STYLE_CARET_COLOUR);      valArr.Add(wxSTEditorStyle(wxT("Caret colour"),       0x000000, 0xF9F9F9, wxEmptyString,    0,                0, STE_STYLE_USEDEFAULT_NOCOLOUR,     STE_STYLE_USES_COLOUR));
    keyArr.Add(STE_STYLE_FOLD_COLOUR);       valArr.Add(wxSTEditorStyle(wxT("Fold margin colour"), 0xE0E0E0, 0xFFFFFF, wxEmptyString,    0,                0, STE_STYLE_USEDEFAULT_NOCOLOUR,     STE_STYLE_USES_COLOUR));

    // defaults same as Scintilla's defaults
    keyArr.Add(STE_STYLE_INDIC_0);           valArr.Add(wxSTEditorStyle(wxT("Indicator 0"),        0x007F00, 0xFFFFFF, wxEmptyString, 0, wxSTC_INDIC_SQUIGGLE, STE_STYLE_USEDEFAULT_NOFONTSTYLE, STE_STYLE_USES_FORECOLOUR|STE_STYLE_USES_STYLE));
    keyArr.Add(STE_STYLE_INDIC_1);           valArr.Add(wxSTEditorStyle(wxT("Indicator 1"),        0x0000FF, 0xFFFFFF, wxEmptyString, 0, wxSTC_INDIC_TT,       STE_STYLE_USEDEFAULT_NOFONTSTYLE, STE_STYLE_USES_FORECOLOUR|STE_STYLE_USES_STYLE));
    keyArr.Add(STE_STYLE_INDIC_2);           valArr.Add(wxSTEditorStyle(wxT("Indicator 2"),        0xFF0000, 0xFFFFFF, wxEmptyString, 0, wxSTC_INDIC_PLAIN,    STE_STYLE_USEDEFAULT_NOFONTSTYLE, STE_STYLE_USES_FORECOLOUR|STE_STYLE_USES_STYLE));

    // make sure that these are in order
    keyArr.Add(STE_STYLE_MARKER_BOOKMARK);      valArr.Add(wxSTEditorStyle(wxT("Bookmark marker"),             0x000000, 0x33AA55, wxEmptyString, 0, wxSTC_MARK_ROUNDRECT,         STE_STYLE_USEDEFAULT_NOFONTSTYLE & STE_STYLE_USEDEFAULT_NOCOLOUR, STE_STYLE_USES_COLOUR|STE_STYLE_USES_STYLE));
    keyArr.Add(STE_STYLE_MARKER_FOLDEREND);     valArr.Add(wxSTEditorStyle(wxT("Folder End Marker"),           0xFFFFFF, 0x808080, wxEmptyString, 0, wxSTC_MARK_BOXPLUSCONNECTED,  STE_STYLE_USEDEFAULT_NOFONTSTYLE & STE_STYLE_USEDEFAULT_NOCOLOUR, STE_STYLE_USES_COLOUR|STE_STYLE_USES_STYLE));
    keyArr.Add(STE_STYLE_MARKER_FOLDEROPENMID); valArr.Add(wxSTEditorStyle(wxT("Folder Open Mid Marker"),      0xFFFFFF, 0x808080, wxEmptyString, 0, wxSTC_MARK_BOXMINUSCONNECTED, STE_STYLE_USEDEFAULT_NOFONTSTYLE & STE_STYLE_USEDEFAULT_NOCOLOUR, STE_STYLE_USES_COLOUR|STE_STYLE_USES_STYLE));
    keyArr.Add(STE_STYLE_MARKER_FOLDERMIDTAIL); valArr.Add(wxSTEditorStyle(wxT("Folder Open Mid Tail Marker"), 0xFFFFFF, 0x808080, wxEmptyString, 0, wxSTC_MARK_TCORNER,           STE_STYLE_USEDEFAULT_NOFONTSTYLE & STE_STYLE_USEDEFAULT_NOCOLOUR, STE_STYLE_USES_COLOUR|STE_STYLE_USES_STYLE));
    keyArr.Add(STE_STYLE_MARKER_FOLDERTAIL);    valArr.Add(wxSTEditorStyle(wxT("Folder Tail Marker"),          0xFFFFFF, 0x808080, wxEmptyString, 0, wxSTC_MARK_LCORNER,           STE_STYLE_USEDEFAULT_NOFONTSTYLE & STE_STYLE_USEDEFAULT_NOCOLOUR, STE_STYLE_USES_COLOUR|STE_STYLE_USES_STYLE));
    keyArr.Add(STE_STYLE_MARKER_FOLDERSUB);     valArr.Add(wxSTEditorStyle(wxT("Folder Sub Marker"),           0xFFFFFF, 0x808080, wxEmptyString, 0, wxSTC_MARK_VLINE,             STE_STYLE_USEDEFAULT_NOFONTSTYLE & STE_STYLE_USEDEFAULT_NOCOLOUR, STE_STYLE_USES_COLOUR|STE_STYLE_USES_STYLE));
    keyArr.Add(STE_STYLE_MARKER_FOLDER);        valArr.Add(wxSTEditorStyle(wxT("Folder Marker"),               0xFFFFFF, 0x808080, wxEmptyString, 0, wxSTC_MARK_BOXPLUS,           STE_STYLE_USEDEFAULT_NOFONTSTYLE & STE_STYLE_USEDEFAULT_NOCOLOUR, STE_STYLE_USES_COLOUR|STE_STYLE_USES_STYLE));
    keyArr.Add(STE_STYLE_MARKER_FOLDEROPEN);    valArr.Add(wxSTEditorStyle(wxT("Folder Open Marker"),          0xFFFFFF, 0x808080, wxEmptyString, 0, wxSTC_MARK_BOXMINUS,          STE_STYLE_USEDEFAULT_NOFONTSTYLE & STE_STYLE_USEDEFAULT_NOCOLOUR, STE_STYLE_USES_COLOUR|STE_STYLE_USES_STYLE));

#if defined(__WXDEBUG__)
    for (size_t n = 1; n < keyArr.GetCount(); n++) wxCHECK_RET(keyArr[n-1] < keyArr[n], wxT("styles are initialized out of order"));
#endif // defined(__WXDEBUG__)
}

int wxSTEditorStyles::wxColourToInt(const wxColour& c) const
{
    wxCHECK_MSG(c.Ok(), 0, wxT("Invalid colour in wxSTEditorStyles::wxColourToInt"));
#if STE_COLOURS_BBGGRR
    return (int(c.Blue())<<16) | (int(c.Green())<<8) | (int(c.Red()));
#else
    return (int(c.Red())<<16) | (int(c.Green())<<8) | (int(c.Blue()));
#endif
}
wxColour wxSTEditorStyles::IntTowxColour(int c) const
{
#if STE_COLOURS_BBGGRR
    return wxColour((unsigned char)((c    )&0xFF),
                    (unsigned char)((c>> 8)&0xFF),
                    (unsigned char)((c>>16)&0xFF));
#else
    return wxColour((unsigned char)((c>>16)&0xFF),
                    (unsigned char)((c>> 8)&0xFF),
                    (unsigned char)((c    )&0xFF));
#endif
}

bool wxSTEditorStyles::Create()
{
    UnRef();
    m_refData = new wxSTEditorStyles_RefData();
    return true;
}

bool wxSTEditorStyles::Create(const wxSTEditorStyles &styles)
{
    Ref(styles);
    return true;
}

void wxSTEditorStyles::Copy(const wxSTEditorStyles &other)
{
    wxCHECK_RET(other.Ok(), wxT("Styles not created"));
    if (!Ok()) Create();
    if (*this == other) return;
    wxSTEditorStyles_RefData *otherStyleData = (wxSTEditorStyles_RefData *)other.GetRefData();
    M_STYLEDATA->m_pairArrayStyles = otherStyleData->m_pairArrayStyles;
}

void wxSTEditorStyles::Reset()
{
    wxCHECK_RET(Ok(), wxT("Styles not created"));
    wxSTEditorStyles defStyles(true);
    Copy(defStyles);
}

bool wxSTEditorStyles::IsEqualTo(const wxSTEditorStyles &styles) const
{
    wxCHECK_MSG(Ok() && styles.Ok(), false, wxT("Styles not created"));
    wxSTEditorStyles_RefData *otherStyleData = (wxSTEditorStyles_RefData *)styles.GetRefData();
    return (M_STYLEDATA->m_pairArrayStyles == otherStyleData->m_pairArrayStyles);
}

int wxSTEditorStyles::GetStyleIndex(const wxString &name) const
{
    wxCHECK_MSG(Ok(), wxNOT_FOUND, wxT("Styles not created"));
    size_t n, count = M_STYLEDATA->m_pairArrayStyles.GetCount();
    for (n = 0; n < count; n++)
    {
        if (M_STYLEDATA->m_pairArrayStyles.ItemValue(n).m_styleName == name)
            return M_STYLEDATA->m_pairArrayStyles.ItemKey(n);
    }

    return wxNOT_FOUND;
}

wxArrayInt wxSTEditorStyles::GetStylesArray(bool get_all_styles) const
{
    wxArrayInt styles;
    wxCHECK_MSG(Ok(), styles, wxT("Styles not created"));

    size_t n, count = M_STYLEDATA->m_pairArrayStyles.GetCount();
    for (n = 0; n < count; n++)
    {
        int style_n = M_STYLEDATA->m_pairArrayStyles.ItemKey(n);
        if ((style_n >= STE_STYLE_LANG__MAX) && !get_all_styles)
            break;

        styles.Add(style_n);
    }

    return styles;
}

int wxSTEditorStyles::FindNthStyle(int style_n) const
{
    wxCHECK_MSG(Ok(), wxNOT_FOUND, wxT("Styles not created"));
    return M_STYLEDATA->m_pairArrayStyles.Index(style_n);
}

wxSTEditorStyle* wxSTEditorStyles::GetStyle(int style_n) const
{
    wxCHECK_MSG(Ok(), NULL, wxT("Styles not created"));
    int n = FindNthStyle(style_n);

    if (n != wxNOT_FOUND)
        return &M_STYLEDATA->m_pairArrayStyles.ItemValue(n);

    wxFAIL_MSG(wxT("Unknown style in wxSTEditorStyles::GetStyle"));

    return NULL;
}

wxSTEditorStyle* wxSTEditorStyles::GetStyleUseDefault(int style_n,
                                                      int use_default_type) const
{
    wxCHECK_MSG(Ok(), NULL, wxT("Styles not created"));
    wxSTEditorStyle *steStyle = GetStyle(style_n);
    if (steStyle == NULL) return NULL;

    if (STE_HASBIT(steStyle->m_use_default, use_default_type))
        return GetStyle(STE_STYLE_DEFAULT);

    return steStyle;
}

wxString wxSTEditorStyles::GetStyleName(int style_n) const
{
    wxSTEditorStyle* steStyle = GetStyle(style_n);
    if (steStyle == NULL) return wxEmptyString;
    return steStyle->m_styleName;
}
int wxSTEditorStyles::GetForegroundColourInt(int style_n, bool use_default) const
{
    wxSTEditorStyle* steStyle = GetStyleUseDefault(style_n,
                        use_default ? STE_STYLE_USEDEFAULT_FORECOLOUR : 0);
    if (steStyle == NULL) return 0;
    return steStyle->m_fore_colour;
}
int wxSTEditorStyles::GetBackgroundColourInt(int style_n, bool use_default) const
{
    wxSTEditorStyle* steStyle = GetStyleUseDefault(style_n,
                        use_default ? STE_STYLE_USEDEFAULT_BACKCOLOUR : 0);
    if (steStyle == NULL) return 0xFFFFFF;
    return steStyle->m_back_colour;
}
wxFont wxSTEditorStyles::GetFont(int style_n, bool use_default) const
{
    wxCHECK_MSG(Ok(), wxFont(STE_DEF_FONTSIZE, wxFONTFAMILY_MODERN, wxFONTSTYLE_NORMAL, wxFONTWEIGHT_NORMAL), wxT("Styles not created"));
/*
    wxFont *f = wxTheFontList->FindOrCreateFont(
                GetSize(style_n, use_default),
                wxFONTFAMILY_MODERN, // unused using facename
                GetItalic(style_n, use_default) ? wxFONTSTYLE_ITALIC : wxFONTSTYLE_NORMAL,
                GetBold(style_n, use_default) ? wxFONTWEIGHT_BOLD : wxFONTWEIGHT_NORMAL,
                GetUnderlined(style_n, use_default),
                GetFaceName(style_n, use_default));

    if (!f || !f->Ok())
        return wxFont(STE_DEF_FONTSIZE, wxFONTFAMILY_MODERN, wxFONTSTYLE_NORMAL, wxFONTWEIGHT_NORMAL);

    return wxFont(*f);
*/

    wxFont font(GetSize(style_n, use_default),
                wxFONTFAMILY_MODERN, // unused using facename
                GetItalic(style_n, use_default) ? wxFONTSTYLE_ITALIC : wxFONTSTYLE_NORMAL,
                GetBold(style_n, use_default) ? wxFONTWEIGHT_BOLD : wxFONTWEIGHT_NORMAL,
                GetUnderlined(style_n, use_default),
                GetFaceName(style_n, use_default));

    if (!font.Ok())  // oops this font works though
        return wxFont(STE_DEF_FONTSIZE, wxFONTFAMILY_MODERN, wxFONTSTYLE_NORMAL, wxFONTWEIGHT_NORMAL);

    return font;
}
wxString wxSTEditorStyles::GetFaceName(int style_n, bool use_default) const
{
    wxSTEditorStyle* steStyle = GetStyleUseDefault(style_n,
                        use_default ? STE_STYLE_USEDEFAULT_FACENAME : 0);
    if (steStyle == NULL) return STE_DEF_FACENAME;
    return steStyle->m_faceName;
}
int wxSTEditorStyles::GetSize(int style_n, bool use_default) const
{
    wxSTEditorStyle* steStyle = GetStyleUseDefault(style_n,
                        use_default ? STE_STYLE_USEDEFAULT_FONTSIZE : 0);
    if (steStyle == NULL) return STE_DEF_FONTSIZE;
    return steStyle->m_font_size;
}
int wxSTEditorStyles::GetFontAttr(int style_n, bool use_default) const
{
    wxSTEditorStyle* steStyle = GetStyleUseDefault(style_n,
                        use_default ? STE_STYLE_USEDEFAULT_FONTSTYLE : 0);
    if (steStyle == NULL) return STE_STYLE_FONT_NONE;
    return steStyle->m_font_attr;
}
int wxSTEditorStyles::GetCase(int style_n, bool use_default) const
{
    int ste_font_attr = GetFontAttr(style_n, use_default);

    if (STE_HASBIT(ste_font_attr, STE_STYLE_FONT_CASEUPPER))
        return wxSTC_CASE_UPPER;
    if (STE_HASBIT(ste_font_attr, STE_STYLE_FONT_CASELOWER))
        return wxSTC_CASE_LOWER;

    return wxSTC_CASE_MIXED;
}
int wxSTEditorStyles::GetUseDefault(int style_n) const
{
    wxSTEditorStyle* steStyle = GetStyle(style_n);
    if (steStyle != NULL)
        return steStyle->m_use_default;

    return STE_STYLE_USEDEFAULT_ALL;
}
int wxSTEditorStyles::GetStyleUsage(int style_n) const
{
    wxSTEditorStyle* steStyle = GetStyle(style_n);
    if (steStyle != NULL)
        return steStyle->m_style_uses;

    return STE_STYLE_USES_ALL;
}

bool wxSTEditorStyles::SetStyle( int style_n, const wxSTEditorStyle& steStyle )
{
    wxCHECK_MSG(Ok(), false, wxT("Styles not created"));
    return s_STE_PairArrayStyles.Add(style_n, steStyle);
}

bool wxSTEditorStyles::SetInitStyle( int ste_style, const wxSTEditorStyle& steStyle ) const
{
    return s_STE_PairArrayStyles.Add(ste_style, steStyle);
}
bool wxSTEditorStyles::SetInitIndicator( int indic_n, const wxString &name,
                                         int fore_colour, int style) const
{
    wxCHECK_STEINDIC_MSG(indic_n, false);
    return SetInitStyle(STE_STYLE_INDIC__FIRST+indic_n,
                 wxSTEditorStyle(name, fore_colour, 0xFFFFFF,
                 STE_DEF_FACENAME, STE_DEF_FONTSIZE, style,
                 STE_STYLE_USEDEFAULT_NOFONTSTYLE, // just fore and style
                 STE_STYLE_USES_FORECOLOUR|STE_STYLE_USES_STYLE));
}
bool wxSTEditorStyles::SetInitMarker( int marker_n, const wxString &name, int style,
                                      int fore_colour, int back_colour ) const
{
    wxCHECK_STEMARKER_MSG(marker_n, false);
    return SetInitStyle(STE_STYLE_MARKER__FIRST+marker_n,
                 wxSTEditorStyle(name, fore_colour, back_colour,
                 STE_DEF_FACENAME, STE_DEF_FONTSIZE, style,
                 STE_STYLE_USEDEFAULT_NOFONTSTYLE & STE_STYLE_USEDEFAULT_NOCOLOUR,
                 STE_STYLE_USES_COLOUR|STE_STYLE_USES_STYLE));
}

bool wxSTEditorStyles::RemoveInitStyle( int style_n ) const
{
    return s_STE_PairArrayStyles.Remove(style_n);
}

void wxSTEditorStyles::SetForegroundColourInt(int style_n, int colour)
{
    wxSTEditorStyle* steStyle = GetStyle(style_n);
    if (steStyle != NULL)
        steStyle->m_fore_colour = colour;
}
void wxSTEditorStyles::SetBackgroundColourInt(int style_n, int colour)
{
    wxSTEditorStyle* steStyle = GetStyle(style_n);
    if (steStyle != NULL)
        steStyle->m_back_colour = colour;
}
void wxSTEditorStyles::SetFont(int style_n, const wxFont &font)
{
    wxCHECK_RET(Ok(), wxT("Styles not created"));
    wxCHECK_RET(font.Ok(), wxT("Invalid font"));

    SetFaceName(style_n, font.GetFaceName());
    SetSize(style_n, font.GetPointSize());

    int ste_font_attr  = font.GetWeight() == wxFONTWEIGHT_BOLD  ? STE_STYLE_FONT_BOLD       : 0;
        ste_font_attr |= font.GetStyle()  != wxFONTSTYLE_NORMAL ? STE_STYLE_FONT_ITALIC     : 0;
        ste_font_attr |= font.GetUnderlined()                   ? STE_STYLE_FONT_UNDERLINED : 0;

    SetFontAttr(style_n, ste_font_attr);
}
void wxSTEditorStyles::SetFaceName(int style_n, const wxString &faceName)
{
    wxSTEditorStyle* steStyle = GetStyle(style_n);
    if (steStyle != NULL)
        steStyle->m_faceName = faceName;
}
void wxSTEditorStyles::SetSize(int style_n, int size)
{
    wxSTEditorStyle* steStyle = GetStyle(style_n);
    if (steStyle != NULL)
        steStyle->m_font_size = size;
}
void wxSTEditorStyles::SetFontAttr(int style_n, int ste_font_attr)
{
    wxSTEditorStyle* steStyle = GetStyle(style_n);
    if (steStyle != NULL)
        steStyle->m_font_attr = ste_font_attr;
}

void wxSTEditorStyles::SetCase(int style_n, int lcase)
{
    wxCHECK_RET(Ok(), wxT("Styles not created"));
    int steCase = -1;

    switch (lcase)
    {
        case wxSTC_CASE_MIXED : steCase = STE_STYLE_FONT_CASEMIXED; break;
        case wxSTC_CASE_UPPER : steCase = STE_STYLE_FONT_CASEUPPER; break;
        case wxSTC_CASE_LOWER : steCase = STE_STYLE_FONT_CASELOWER; break;
    }

    wxCHECK_RET(steCase != -1, wxT("Invalid letter case for style"));
    int fontStyle = GetFontAttr(style_n, true);
    // Already set
    if ((fontStyle & steCase) != 0)
        return;

    // Clear old style
    fontStyle &= ~(STE_STYLE_FONT_CASEMIXED|STE_STYLE_FONT_CASEUPPER|STE_STYLE_FONT_CASELOWER);
    SetFontAttr(style_n, fontStyle|steCase);
}

void wxSTEditorStyles::SetUseDefault(int style_n, int mask, bool use_default)
{
    wxCHECK_RET(Ok(), wxT("Styles not created"));
    int def = GetUseDefault(style_n);
    def = use_default ? (def | mask) : (def & (~mask));
    wxSTEditorStyle* steStyle = GetStyle(style_n);
    if (steStyle != NULL)
        steStyle->m_use_default = def;
}

bool wxSTEditorStyles::RemoveStyle(int style_n)
{
    wxCHECK_MSG(Ok(), false, wxT("Styles not created"));
    return M_STYLEDATA->m_pairArrayStyles.Remove(style_n);
}

bool wxSTEditorStyles::SetFoldMarkerStyle(int fold_style)
{
    // Copyright 1998-2003 by Neil Hodgson <neilh@scintilla.org>
    //  This code originally in SciTE/src/SciTEProps.cxx
    switch (fold_style)
    {
        case STE_FOLDMARGIN_STYLE_ARROWS : // "..." for contracted folders, arrow pointing down for expanded
        {
            SetMarker(wxSTC_MARKNUM_FOLDEROPEN,    wxSTC_MARK_ARROWDOWN, *wxBLACK, *wxBLACK);
            SetMarker(wxSTC_MARKNUM_FOLDER,        wxSTC_MARK_DOTDOTDOT, *wxBLACK, *wxBLACK);
            SetMarker(wxSTC_MARKNUM_FOLDERSUB,     wxSTC_MARK_EMPTY,     *wxBLACK, *wxBLACK);
            SetMarker(wxSTC_MARKNUM_FOLDERTAIL,    wxSTC_MARK_EMPTY,     *wxBLACK, *wxBLACK);
            SetMarker(wxSTC_MARKNUM_FOLDEREND,     wxSTC_MARK_DOTDOTDOT, *wxBLACK, *wxWHITE);
            SetMarker(wxSTC_MARKNUM_FOLDEROPENMID, wxSTC_MARK_ARROWDOWN, *wxBLACK, *wxWHITE);
            SetMarker(wxSTC_MARKNUM_FOLDERMIDTAIL, wxSTC_MARK_EMPTY,     *wxBLACK, *wxBLACK);
/*
            // Arrow pointing right for contracted folders, arrow pointing down for expanded
            editor->MarkerDefine(wxSTC_MARKNUM_FOLDEROPEN,    wxSTC_MARK_ARROWDOWN, *wxBLACK, *wxBLACK);
            editor->MarkerDefine(wxSTC_MARKNUM_FOLDER,        wxSTC_MARK_ARROW, *wxBLACK, *wxBLACK);
            editor->MarkerDefine(wxSTC_MARKNUM_FOLDERSUB,     wxSTC_MARK_EMPTY, *wxBLACK, *wxBLACK);
            editor->MarkerDefine(wxSTC_MARKNUM_FOLDERTAIL,    wxSTC_MARK_EMPTY, *wxBLACK, *wxBLACK);
            editor->MarkerDefine(wxSTC_MARKNUM_FOLDEREND,     wxSTC_MARK_EMPTY, *wxWHITE, *wxBLACK);
            editor->MarkerDefine(wxSTC_MARKNUM_FOLDEROPENMID, wxSTC_MARK_EMPTY, *wxWHITE, *wxBLACK);
            editor->MarkerDefine(wxSTC_MARKNUM_FOLDERMIDTAIL, wxSTC_MARK_EMPTY, *wxWHITE, *wxBLACK);
*/
            break;
        }
        case STE_FOLDMARGIN_STYLE_CIRCLES : // Like a flattened tree control using circular headers and curved joins
        {
            wxColour grey(0x40, 0x40, 0x40);
            SetMarker(wxSTC_MARKNUM_FOLDEROPEN,    wxSTC_MARK_CIRCLEMINUS,  *wxWHITE, grey);
            SetMarker(wxSTC_MARKNUM_FOLDER,        wxSTC_MARK_CIRCLEPLUS,   *wxWHITE, grey);
            SetMarker(wxSTC_MARKNUM_FOLDERSUB,     wxSTC_MARK_VLINE,        *wxWHITE, grey);
            SetMarker(wxSTC_MARKNUM_FOLDERTAIL,    wxSTC_MARK_LCORNERCURVE, *wxWHITE, grey);
            SetMarker(wxSTC_MARKNUM_FOLDEREND,     wxSTC_MARK_CIRCLEPLUSCONNECTED,  *wxWHITE, grey);
            SetMarker(wxSTC_MARKNUM_FOLDEROPENMID, wxSTC_MARK_CIRCLEMINUSCONNECTED, *wxWHITE, grey);
            SetMarker(wxSTC_MARKNUM_FOLDERMIDTAIL, wxSTC_MARK_TCORNERCURVE, *wxWHITE, grey);
            break;
        }
        case STE_FOLDMARGIN_STYLE_SQUARES : // Like a flattened tree control using square headers
        {
            wxColour grey(0x80, 0x80, 0x80);
            SetMarker(wxSTC_MARKNUM_FOLDEROPEN,    wxSTC_MARK_BOXMINUS, *wxWHITE, grey);
            SetMarker(wxSTC_MARKNUM_FOLDER,        wxSTC_MARK_BOXPLUS,  *wxWHITE, grey);
            SetMarker(wxSTC_MARKNUM_FOLDERSUB,     wxSTC_MARK_VLINE,    *wxWHITE, grey);
            SetMarker(wxSTC_MARKNUM_FOLDERTAIL,    wxSTC_MARK_LCORNER,  *wxWHITE, grey);
            SetMarker(wxSTC_MARKNUM_FOLDEREND,     wxSTC_MARK_BOXPLUSCONNECTED,  *wxWHITE, grey);
            SetMarker(wxSTC_MARKNUM_FOLDEROPENMID, wxSTC_MARK_BOXMINUSCONNECTED, *wxWHITE, grey);
            SetMarker(wxSTC_MARKNUM_FOLDERMIDTAIL, wxSTC_MARK_TCORNER,  *wxWHITE, grey);
            break;
        }
        case STE_FOLDMARGIN_STYLE_PLUSMINUS : // Plus for contracted folders, minus for expanded
        {
            SetMarker(wxSTC_MARKNUM_FOLDEROPEN,    wxSTC_MARK_MINUS, *wxWHITE, *wxBLACK);
            SetMarker(wxSTC_MARKNUM_FOLDER,        wxSTC_MARK_PLUS,  *wxWHITE, *wxBLACK);
            SetMarker(wxSTC_MARKNUM_FOLDERSUB,     wxSTC_MARK_EMPTY, *wxWHITE, *wxBLACK);
            SetMarker(wxSTC_MARKNUM_FOLDERTAIL,    wxSTC_MARK_EMPTY, *wxWHITE, *wxBLACK);
            SetMarker(wxSTC_MARKNUM_FOLDEREND,     wxSTC_MARK_EMPTY, *wxWHITE, *wxBLACK);
            SetMarker(wxSTC_MARKNUM_FOLDEROPENMID, wxSTC_MARK_EMPTY, *wxWHITE, *wxBLACK);
            SetMarker(wxSTC_MARKNUM_FOLDERMIDTAIL, wxSTC_MARK_EMPTY, *wxWHITE, *wxBLACK);
            break;
        }
        default : return false; // unknown
    }

    return true;
}

void wxSTEditorStyles::AppendAddedInitStyles()
{
    wxCHECK_RET(Ok(), wxT("Styles not created"));
    size_t n, count = s_STE_PairArrayStyles.GetCount();
    for (n = 0; n < count; n++)
    {
        int ste_style = s_STE_PairArrayStyles.ItemKey(n);
        if (!HasStyle(int(ste_style)))
            AddStyle(ste_style, s_STE_PairArrayStyles.ItemValue(n));
    }
}

void wxSTEditorStyles::SetEditorStyle( int stc_style, int ste_style,
                                       wxSTEditor *editor,
                                       bool force) const
{
    wxCHECK_RET(Ok(), wxT("Styles not created"));
    wxCHECK_RET(HasStyle(ste_style), wxT("Invalid STE style"));
    wxCHECK_RET(editor, wxT("Invalid editor"));

    if (GetStyleUses(ste_style, STE_STYLE_USES_FORECOLOUR) &&
        (force || !GetUsesDefault(ste_style, STE_STYLE_USEDEFAULT_FORECOLOUR)))
        editor->StyleSetForeground(stc_style, GetForegroundColour(ste_style));
    if (GetStyleUses(ste_style, STE_STYLE_USES_BACKCOLOUR) &&
        (force || !GetUsesDefault(ste_style, STE_STYLE_USEDEFAULT_BACKCOLOUR)))
        editor->StyleSetBackground(stc_style, GetBackgroundColour(ste_style));

    if (GetStyleUses(ste_style, STE_STYLE_USES_FACENAME) &&
        (force || !GetUsesDefault(ste_style, STE_STYLE_USEDEFAULT_FACENAME)))
        editor->StyleSetFaceName(stc_style, GetFaceName(ste_style));
    if (GetStyleUses(ste_style, STE_STYLE_USES_FONTSIZE) &&
        (force || !GetUsesDefault(ste_style, STE_STYLE_USEDEFAULT_FONTSIZE)))
        editor->StyleSetSize(stc_style,     GetSize(ste_style));

    if (GetStyleUses(ste_style, STE_STYLE_USES_FONTSTYLE) &&
        (force || !GetUsesDefault(ste_style, STE_STYLE_USEDEFAULT_FONTSTYLE)))
    {
        const int ste_font_attr = GetFontAttr(ste_style);
        editor->StyleSetBold(stc_style,      STE_HASBIT(ste_font_attr, STE_STYLE_FONT_BOLD));
        editor->StyleSetUnderline(stc_style, STE_HASBIT(ste_font_attr, STE_STYLE_FONT_UNDERLINED));
        editor->StyleSetItalic(stc_style,    STE_HASBIT(ste_font_attr, STE_STYLE_FONT_ITALIC));
        editor->StyleSetVisible(stc_style,  !STE_HASBIT(ste_font_attr, STE_STYLE_FONT_HIDDEN));
        editor->StyleSetEOLFilled(stc_style, STE_HASBIT(ste_font_attr, STE_STYLE_FONT_EOLFILLED));
        editor->StyleSetCase(stc_style, GetCase(ste_style));
    }

    //void StyleSetChangeable(int style, bool changeable); // Experimental feature, currently buggy.
    //void StyleSetCharacterSet(int style, int characterSet);
    //void StyleSetFontEncoding(int style, wxFontEncoding encoding);
    //void StyleSetHotSpot(int style, bool hotspot);

/*
    if ((ste_style == STE_STYLE_CHARACTEREOL) || (ste_style == STE_STYLE_STRINGEOL))
        editor->StyleSetEOLFilled(stc_style, true);
    else
        editor->StyleSetEOLFilled(stc_style, false);
*/
}

void wxSTEditorStyles::UpdateEditor( wxSTEditor *editor )
{
    wxCHECK_RET(Ok(), wxT("Styles not created"));
    wxCHECK_RET(editor, wxT("Invalid editor"));

    // Start with default and then the fixed Scintilla styles, 32-37
    if (HasStyle(STE_STYLE_DEFAULT))
        SetEditorStyle(wxSTC_STYLE_DEFAULT,     STE_STYLE_DEFAULT,     editor, true);

    editor->StyleClearAll(); // do this to update defaults for all styles

    if (HasStyle(STE_STYLE_LINENUMBER))
        SetEditorStyle(wxSTC_STYLE_LINENUMBER,  STE_STYLE_LINENUMBER,  editor, true);
    if (HasStyle(STE_STYLE_BRACELIGHT))
        SetEditorStyle(wxSTC_STYLE_BRACELIGHT,  STE_STYLE_BRACELIGHT,  editor);
    if (HasStyle(STE_STYLE_BRACEBAD))
        SetEditorStyle(wxSTC_STYLE_BRACEBAD,    STE_STYLE_BRACEBAD,    editor);
    if (HasStyle(STE_STYLE_CONTROLCHAR))
        SetEditorStyle(wxSTC_STYLE_CONTROLCHAR, STE_STYLE_CONTROLCHAR, editor);
    if (HasStyle(STE_STYLE_INDENTGUIDE))
        SetEditorStyle(wxSTC_STYLE_INDENTGUIDE, STE_STYLE_INDENTGUIDE, editor, true);

    if (HasStyle(STE_STYLE_SELECTION_COLOUR))
    {
        editor->SetSelForeground(true, GetForegroundColour(STE_STYLE_SELECTION_COLOUR, true));
        editor->SetSelBackground(true, GetBackgroundColour(STE_STYLE_SELECTION_COLOUR, true));
    }

    if (HasStyle(STE_STYLE_EDGE_COLOUR))
        editor->SetEdgeColour(GetForegroundColour(STE_STYLE_EDGE_COLOUR, true));

    if (HasStyle(STE_STYLE_CARET_COLOUR))
    {
        editor->SetCaretForeground(GetForegroundColour(STE_STYLE_CARET_COLOUR, true));
#if wxCHECK_VERSION(2, 7, 1)
        editor->SetCaretLineBackground(GetBackgroundColour(STE_STYLE_CARET_COLOUR, true));
#else
        editor->SetCaretLineBack(GetBackgroundColour(STE_STYLE_CARET_COLOUR, true));
#endif // wxCHECK_VERSION(2, 7, 1)
    }

    if (HasStyle(STE_STYLE_FOLD_COLOUR))
    {
        editor->SetFoldMarginColour(true,   GetForegroundColour(STE_STYLE_FOLD_COLOUR, true));
        editor->SetFoldMarginHiColour(true, GetBackgroundColour(STE_STYLE_FOLD_COLOUR, true));
    }

    if (HasStyle(STE_STYLE_WHITESPACE_COLOUR))
    {
        editor->SetWhitespaceForeground(true, GetForegroundColour(STE_STYLE_WHITESPACE_COLOUR, true));
        editor->SetWhitespaceBackground(true, GetBackgroundColour(STE_STYLE_WHITESPACE_COLOUR, true));
    }

    if (HasIndicatorStyle(0))
    {
        editor->IndicatorSetStyle(wxSTC_INDIC0_MASK, GetIndicatorStyle(0));
        editor->IndicatorSetForeground(wxSTC_INDIC0_MASK, GetIndicatorForeground(0));
    }
    if (HasIndicatorStyle(1))
    {
        editor->IndicatorSetStyle(wxSTC_INDIC1_MASK, GetIndicatorStyle(1));
        editor->IndicatorSetForeground(wxSTC_INDIC1_MASK, GetIndicatorForeground(1));
    }
    if (HasIndicatorStyle(2))
    {
        editor->IndicatorSetStyle(wxSTC_INDIC2_MASK, GetIndicatorStyle(2));
        editor->IndicatorSetForeground(wxSTC_INDIC2_MASK, GetIndicatorForeground(2));
    }

    // try to set fold flags, if the fold style is invalid, this does nothing
    if (editor->GetEditorPrefs().Ok())
        SetFoldMarkerStyle(editor->GetEditorPrefs().GetPrefInt(STE_PREF_FOLDMARGIN_STYLE));

    // now set all the marker styles, if any
    wxArrayInt styleArray = GetStylesArray(true);
    size_t n, count = styleArray.GetCount();
    for (n = 0; n < count; n++)
    {
        if ((styleArray[n] >= STE_STYLE_MARKER__FIRST) &&
            (styleArray[n] <= STE_STYLE_MARKER__LAST))
        {
            int marker_n = styleArray[n] - STE_STYLE_MARKER__FIRST;
            editor->MarkerDefine(marker_n, GetMarkerSymbol(marker_n),
                                 GetMarkerForeground(marker_n),
                                 GetMarkerBackground(marker_n));
        }
    }
}

wxString wxSTEditorStyles::LoadConfig( wxConfigBase &config,
                                       const wxString &configPath )
{
    wxCHECK_MSG(Ok(), wxEmptyString, wxT("Styles not created"));
    wxString oldConfigPath = config.GetPath();
    wxString group = wxSTEditorOptions::FixConfigPath(configPath, false);
    config.SetPath(group);

    wxString errorMsg;
    long index = -1;
    wxString key, value;

    if (config.GetFirstEntry(key, index))
    {
        if (config.Read(key, &value))
            errorMsg += ParseConfigLine(key, value);

        while (config.GetNextEntry(key, index))
        {
            if (config.Read(key, &value))
                errorMsg += ParseConfigLine(key, value);
        }
    }

    if (!errorMsg.IsEmpty())
    {
        wxString msg = _("Error loading editor config data, would you like to repair it\?\n\n") + errorMsg;

        int ret = wxMessageBox( msg,
                                _("Config load error"),
                                wxYES_NO );

        if (ret == wxYES)
        {
            // recreate group
            config.SetPath(oldConfigPath);
            if (config.HasGroup(group))
                config.DeleteGroup(group);

            SaveConfig(config, configPath);
        }
    }

    config.SetPath(oldConfigPath);

    return errorMsg;
}

wxString wxSTEditorStyles::ParseConfigLine(const wxString &key, const wxString &value)
{
    wxCHECK_MSG(Ok(), wxEmptyString, wxT("Styles not created"));
    wxString errorMsg;

    wxString name = key;
    name.Replace(wxT("_"), wxT(" "), true);

    long long_val = 0;
    wxString option, val;
    int style_n = GetStyleIndex(name);

    // FIXME oops - no style number
    if (style_n == -1)
        return _("Unknown style name in '")+name+wxT("'\n");

    wxStringTokenizer tkz(value, wxT(","));
    while (tkz.HasMoreTokens())
    {
        wxString token = tkz.GetNextToken();
        option = token.BeforeFirst(wxT(':')).Strip(wxString::both);
        val = token.AfterFirst(wxT(':')).Strip(wxString::both);

        if (val.IsEmpty())
        {
            errorMsg += _("Empty style option '") + option + _("' in style '")+name+wxT("'\n");
            continue;
        }
        bool def = (val.GetChar(0) == wxT('*'));
        if (def)
            val = val.AfterFirst(wxT('*')).Strip(wxString::leading);

        if (option == wxT("fore"))
        {
            if (val.ToLong(&long_val, 16))
            {
                SetUseDefault(style_n, STE_STYLE_USEDEFAULT_FORECOLOUR, def);
                SetForegroundColourInt(style_n, (int)long_val);
            }
            else
                errorMsg += _("Invalid foreground colour in style '")+name+wxT("'\n");
        }
        else if (option == wxT("back"))
        {
            if (val.ToLong(&long_val, 16))
            {
                SetUseDefault(style_n, STE_STYLE_USEDEFAULT_BACKCOLOUR, def);
                SetBackgroundColourInt(style_n, (int)long_val);
            }
            else
                errorMsg += _("Invalid background colour in style '")+name+wxT("'\n");
        }
        else if (option == wxT("face"))
        {
            SetUseDefault(style_n, STE_STYLE_USEDEFAULT_FACENAME, def);
            SetFaceName(style_n, val);
        }
        else if (option == wxT("size"))
        {
            if (val.ToLong(&long_val))
            {
                SetUseDefault(style_n, STE_STYLE_USEDEFAULT_FONTSIZE, def);
                SetSize(style_n, long_val);
            }
            else
                errorMsg += _("Invalid font size in style '")+name+wxT("'\n");
        }
        else if (option == wxT("bold"))
        {
            SetUseDefault(style_n, STE_STYLE_USEDEFAULT_FONTSTYLE, def);
            SetBold(style_n, val != wxT("0"));
        }
        else if (option == wxT("italic"))
        {
            //SetUseDefault(style_n, STE_STYLE_USEDEFAULT_FONTSTYLE, def);
            SetItalic(style_n, val != wxT("0"));
        }
        else if (option == wxT("underline"))
        {
            //SetUseDefault(style_n, STE_STYLE_USEDEFAULT_FONTSTYLE, def);
            SetUnderlined(style_n, val != wxT("0"));
        }
        else if (option == wxT("hidden"))
        {
            //SetUseDefault(style_n, STE_STYLE_USEDEFAULT_FONTSTYLE, def);
            SetUnderlined(style_n, val != wxT("0"));
        }
        else if (option == wxT("eol"))
        {
            //SetUseDefault(style_n, STE_STYLE_USEDEFAULT_FONTSTYLE, def);
            SetEOLFilled(style_n, val != wxT("0"));
        }
        else if (option == wxT("hotspot"))
        {
            //SetUseDefault(style_n, STE_STYLE_USEDEFAULT_FONTSTYLE, def);
            SetHotSpot(style_n, val != wxT("0"));
        }
        else if (option == wxT("case"))
        {
            if (val.ToLong(&long_val) &&
                ((long_val == wxSTC_CASE_MIXED)||(long_val == wxSTC_CASE_UPPER)||(long_val == wxSTC_CASE_LOWER)))
            {
                //SetUseDefault(style_n, STE_STYLE_USEDEFAULT_FONTSTYLE, def);
                SetCase(style_n, int(long_val));
            }
            else
                errorMsg += _("Invalid letter case for style '")+name+wxT("'.\n");
        }
        else if (option == wxT("style")) // only for indicators & markers
        {
            if ((style_n >= STE_STYLE_INDIC__FIRST) && (style_n <= STE_STYLE_INDIC__LAST))
            {
                if (val.ToLong(&long_val) && (long_val >= 0) && (long_val < wxSTC_INDIC_MAX))
                {
                    //SetUseDefault(style_n, STE_STYLE_USEDEFAULT_FONTSTYLE, def);
                    SetIndicatorStyle(style_n - STE_STYLE_INDIC__FIRST, (int)long_val);
                }
                else
                    errorMsg += _("Invalid indicator style in '")+name+wxT("'\n");
            }
            else if ((style_n >= STE_STYLE_MARKER__FIRST) && (style_n <= STE_STYLE_MARKER__LAST))
            {
                if (val.ToLong(&long_val) && (long_val >= 0)) // && (long_val < wxSTC_MARKER_MAX))
                {
                    //SetUseDefault(style_n, STE_STYLE_USEDEFAULT_FONTSTYLE, def);
                    SetMarkerSymbol(style_n - STE_STYLE_MARKER__FIRST, (int)long_val);
                }
                else
                    errorMsg += _("Invalid marker style in '")+name+wxT("'\n");
            }
            else
            {
                errorMsg += _("Style set for non indicator or marker in '")+name+wxT("'\n");
            }
        }
    }

    // maybe they really want this style separate, though identical?
    //if (style_n > 0)
    //    SetUseDefault(style_n, STE_STYLE_USEDEFAULT_FONTSTYLE, (GetFontAttr(style_n) == GetFontAttr(0)));

    return errorMsg;
}

//Default_text=fore:0x000000,back:0xFFFFFF,face:courier,size:12,bold:0,italic:0,underline:0,eol:0,hotspot:0,case:0 [style:0 only for indicators]

#define BOOL_CFG(val) ((val) ? wxString(wxT("1")) : wxString(wxT("0")))
#define DEF_CFG(mask) (GetUsesDefault(n, mask) ? wxString(wxT("*")) : wxString(wxT("")))

wxString wxSTEditorStyles::CreateConfigLine(int n) const
{
    wxCHECK_MSG(Ok(), wxEmptyString, wxT("Styles not created"));
    wxString line; // = wxString::Format(wxT("type:%d,"), n);

    if (GetStyleUses(n, STE_STYLE_USES_FORECOLOUR))
        line += wxT("fore:") + DEF_CFG(STE_STYLE_USEDEFAULT_FORECOLOUR) + wxString::Format(wxT("0x%06X"), GetForegroundColourInt(n)) + wxT(",");
    if (GetStyleUses(n, STE_STYLE_USES_BACKCOLOUR))
        line += wxT("back:") + DEF_CFG(STE_STYLE_USEDEFAULT_BACKCOLOUR) + wxString::Format(wxT("0x%06X"), GetBackgroundColourInt(n)) + wxT(",");

    if (GetStyleUses(n, STE_STYLE_USES_FACENAME))
        line += wxT("face:")      + DEF_CFG(STE_STYLE_USEDEFAULT_FACENAME)  + GetFaceName(n) + wxT(",");
    if (GetStyleUses(n, STE_STYLE_USES_FONTSIZE))
        line += wxT("size:")      + DEF_CFG(STE_STYLE_USEDEFAULT_FONTSIZE)  + wxString::Format(wxT("%d,"), GetSize(n));
    if (GetStyleUses(n, STE_STYLE_USES_FONTSTYLE))
    {
        line += wxT("bold:")      + DEF_CFG(STE_STYLE_USEDEFAULT_FONTSTYLE) + BOOL_CFG(GetBold(n)) + wxT(",");
        line += wxT("italic:")    + DEF_CFG(STE_STYLE_USEDEFAULT_FONTSTYLE) + BOOL_CFG(GetItalic(n)) + wxT(",");
        line += wxT("underline:") + DEF_CFG(STE_STYLE_USEDEFAULT_FONTSTYLE) + BOOL_CFG(GetUnderlined(n)) + wxT(",");
        line += wxT("eol:")       + DEF_CFG(STE_STYLE_USEDEFAULT_FONTSTYLE) + BOOL_CFG(GetEOLFilled(n)) + wxT(",");
        line += wxT("hotspot:")   + DEF_CFG(STE_STYLE_USEDEFAULT_FONTSTYLE) + BOOL_CFG(GetHotSpot(n)) + wxT(",");
        line += wxT("case:")      + wxString::Format(wxT("%d"), GetCase(n));
    }
    else if (GetStyleUses(n, STE_STYLE_USES_STYLE))
    {
        line += wxT("style:") + wxString::Format(wxT("%d"), GetFontAttr(n)); // style stored here
    }

    if ((line.Length() > 0u) && (line.Last() == wxT(',')))
        line = line.BeforeLast(wxT(','));

    return line;
}

void wxSTEditorStyles::SaveConfig( wxConfigBase &config,
                                   const wxString &configPath,
                                   int flags ) const
{
    wxCHECK_RET(Ok(), wxT("Styles not created"));
    wxString key = wxSTEditorOptions::FixConfigPath(configPath, true);

    wxArrayInt stylesArray = GetStylesArray(true);

    wxSTEditorStyles defaultStyles(true);

    for (size_t n = 0; n < stylesArray.GetCount(); n++)
    {
        int style_n = stylesArray[n];
        wxString name = GetStyleName(style_n);
        name.Replace(wxT(" "), wxT("_"), true);

        wxString value = CreateConfigLine(style_n);
        wxString defValue = defaultStyles.CreateConfigLine(style_n);

        if (((flags && STE_CONFIG_SAVE_DIFFS) == 0) || (value != defValue))
            config.Write(key + name, value);
    }
}

// global precreated wxSTEditorStyles
wxSTEditorStyles s_wxSTEditorStyles(true);

