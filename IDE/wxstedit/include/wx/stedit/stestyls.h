///////////////////////////////////////////////////////////////////////////////
// File:        stestyls.h
// Purpose:     wxSTEditor Styles initialization
// Maintainer:
// Created:     2003-04-04
// RCS-ID:      $Id: stestyls.h,v 1.22 2007/02/15 02:20:42 jrl1 Exp $
// Copyright:   (c) John Labenski, Otto Wyss
// Licence:     wxWidgets licence
///////////////////////////////////////////////////////////////////////////////

#ifndef _STESTYLS_H_
#define _STESTYLS_H_

#include "wx/stedit/stedefs.h"
#include "wx/stedit/steprefs.h"

// The colours used to be hex BBGGRR as wxColour(int) uses,
//  however HTML, Scintilla and others use RRGGBB so this has been changed.
// Set this to 1 for backwards compatibility with your old styles
#define STE_COLOURS_BBGGRR 0

#define wxCHECK_STEINDIC_RET(indic_n)      wxCHECK_RET(indic_n >= 0 && indic_n < 3, wxT("Invalid indicator index"))
#define wxCHECK_STEINDIC_MSG(indic_n, ret) wxCHECK_MSG(indic_n >= 0 && indic_n < 3, ret, wxT("Invalid indicator index"))

#define wxCHECK_STEMARKER_RET(marker_n)      wxCHECK_RET(marker_n >= 0 && marker_n < 32, wxT("Invalid marker index"))
#define wxCHECK_STEMARKER_MSG(marker_n, ret) wxCHECK_MSG(marker_n >= 0 && marker_n < 32, ret, wxT("Invalid marker index"))

//----------------------------------------------------------------------------
// wxSTEditorStyle - simple class to store all the style info
//----------------------------------------------------------------------------

class WXDLLIMPEXP_STEDIT wxSTEditorStyle
{
public:
    wxSTEditorStyle(const wxSTEditorStyle& steStyle)
        : m_styleName(steStyle.m_styleName), m_fore_colour(steStyle.m_fore_colour),
          m_back_colour(steStyle.m_back_colour), m_faceName(steStyle.m_faceName),
          m_font_size(steStyle.m_font_size), m_font_attr(steStyle.m_font_attr),
          m_use_default(steStyle.m_use_default), m_style_uses(steStyle.m_style_uses) {}

    wxSTEditorStyle(const wxString& name = wxEmptyString,
                    int fore_colour      = 0,
                    int back_colour      = 0xFFFFFF,
                    const wxString& face = STE_DEF_FACENAME,
                    int font_size        = STE_DEF_FONTSIZE,
                    int font_attr        = STE_STYLE_FONT_NONE,
                    int use_default      = STE_STYLE_USEDEFAULT_ALL,
                    int style_uses       = STE_STYLE_USES_ALL)
                     : m_styleName(name), m_fore_colour(fore_colour),
                       m_back_colour(back_colour), m_faceName(face),
                       m_font_size(font_size), m_font_attr(font_attr),
                       m_use_default(use_default), m_style_uses(style_uses) {}

    wxString m_styleName;    // human readable name of the style
    int      m_fore_colour;  // foreground colour, 0xRRGGBB
    int      m_back_colour;  // background colour, 0xRRGGBB
    wxString m_faceName;     // font face name
    int      m_font_size;    // font size in points
    int      m_font_attr;    // enum STE_FontAttrType
    int      m_use_default;  // enum STE_StyleUseDefaultType
    int      m_style_uses;   // enum STE_StyleUsesType

    bool operator == (const wxSTEditorStyle& style) const
    {
        return (m_styleName   == style.m_styleName) &&
               (m_fore_colour == style.m_fore_colour) &&
               (m_back_colour == style.m_back_colour) &&
               (m_faceName    == style.m_faceName) &&
               (m_font_size   == style.m_font_size) &&
               (m_font_attr   == style.m_font_attr) &&
               (m_use_default == style.m_use_default) &&
               (m_style_uses  == style.m_style_uses);
    }
    bool operator != (const wxSTEditorStyle& style) const
        { return !(*this == style); }
};

#include "wx/stedit/pairarr.h"
WX_DECLARE_OBJARRAY_WITH_DECL(wxSTEditorStyle, wxArraySTEditorStyle, class WXDLLIMPEXP_STEDIT);
DECLARE_PAIRARRAY_INTKEY(wxSTEditorStyle, wxArraySTEditorStyle, wxSTEPairArrayIntSTEStyle, class WXDLLIMPEXP_STEDIT)

//----------------------------------------------------------------------------
// wxSTEditorStyles - ref counted styles for the wxSTEditor
//                          wxSTC::StyleSetForeground/Back/Face/Size/Bold...
//                          see STE_StyleType
//
// Requests for unset styles return STE_StyleType::STE_STYLE_DEFAULT use HasStyle()
//
// This class works by mapping a preset list of styles to those used by any
//  one particular lexer.
//
// Also contains styles for other GUI elements starting at STE_STYLE_GUI_FIRST,
//  the 3 indicator styles and colours, and can set the margin marker symbols
//  and colors.
//
// Attach to an editor using wxSTEditor::RegisterStyles
//----------------------------------------------------------------------------

class WXDLLIMPEXP_STEDIT wxSTEditorStyles : public wxSTEditorPrefBase
{
public:
    wxSTEditorStyles(bool create = false) { Init(); if (create) Create(); }
    wxSTEditorStyles(const wxSTEditorStyles &styles) { Init(); Create(styles); }
    virtual ~wxSTEditorStyles() {}
    bool Ok() const { return m_refData != NULL; }
    bool Create();                                  // (re)create as new
    bool Create(const wxSTEditorStyles &other);     // make a Refed copy of other
    //bool Create(wxSTEditor *editor);              // can't get styles from Scintilla
    void Copy(const wxSTEditorStyles &other);       // make a full copy
    void Reset();                                   // reset to default vals
    void Destroy() { UnRef(); }

    // Do these two styles have the same values
    bool IsEqualTo(const wxSTEditorStyles &styles) const;

    // ------------------------------------------------------------------------
    // An instance of the editor styles for many editors to share
    //   Use this in at least one editor to not let it go to waste.
    static wxSTEditorStyles& GetGlobalEditorStyles();

    // ------------------------------------------------------------------------

    // Is this style set
    bool HasStyle(int style_n) const { return FindNthStyle(style_n) != wxNOT_FOUND; }
    // Get style_n (index) from the name of the style or wxNOT_FOUND
    int GetStyleIndex(const wxString &name) const;
    // Get the list of styles in sorted numerical order to iterate through styles
    //  if get_all_styles then get the GUI and indicator styles too.
    //  Use STE_STYLE_SCINTILLA__FIRST, STE_STYLE_GUI__FIRST, etc
    //  usage : wxArrayInt styleArr = steStyles.GetStylesArray();
    //          for (size_t n=0; n<styleArr.GetCount(); n++)
    //            { wxFont f=steStyles.GetFont(styleArr[n]); ... }
    wxArrayInt GetStylesArray(bool get_all_styles = false) const;

    // ------------------------------------------------------------------------
    // Styles - Get/Set style settings - Set different values for each style.
    //   Each style stores its own values, but can also be set to use the
    //     default values from the 0 index (STE_StyleType::STE_STYLE_DEFAULT).
    //     eg. all styles can share the same font
    //   int style_n is in the range of STE_StyleType, unless you have added some.
    //   Getting or setting an unset style gives an error
    //
    // The colours are stored in hex as RRGGBB the same as HTML colours.

    // Get the style as a wxSTEditorStyle, returns NULL if style not set
    wxSTEditorStyle* GetStyle(int style_n) const;
    // Get the style as a wxSTEditorStyle, then check if use_default_type
    //   (enum STE_StyleUseDefaultType) is set for the style, if yes then
    //   return the default style. returns NULL if style not set
    wxSTEditorStyle* GetStyleUseDefault(int style_n, int use_default_type) const;

    // Get a human readable name for the style
    wxString GetStyleName(int style_n) const;

    wxColour GetForegroundColour(int style_n, bool use_default = true) const { return IntTowxColour(GetForegroundColourInt(style_n, use_default)); }
      int GetForegroundColourInt(int style_n, bool use_default = true) const;
    wxColour GetBackgroundColour(int style_n, bool use_default = true) const { return IntTowxColour(GetBackgroundColourInt(style_n, use_default)); }
      int GetBackgroundColourInt(int style_n, bool use_default = true) const;

    wxFont GetFont(int style_n, bool use_default = true) const;
    wxString GetFaceName(int style_n, bool use_default = true) const;
    int GetSize(int style_n, bool use_default = true) const;
    // Get the attributes as enum STE_FontAttrType
    int GetFontAttr(int style_n, bool use_default = true) const;
      bool GetBold(int style_n, bool use_default = true) const       { return STE_HASBIT(GetFontAttr(style_n, use_default), STE_STYLE_FONT_BOLD); }
      bool GetItalic(int style_n, bool use_default = true) const     { return STE_HASBIT(GetFontAttr(style_n, use_default), STE_STYLE_FONT_ITALIC); }
      bool GetUnderlined(int style_n, bool use_default = true) const { return STE_HASBIT(GetFontAttr(style_n, use_default), STE_STYLE_FONT_UNDERLINED); }
      bool GetHidden(int style_n, bool use_default = true) const     { return STE_HASBIT(GetFontAttr(style_n, use_default), STE_STYLE_FONT_HIDDEN); }
      bool GetEOLFilled(int style_n, bool use_default = true) const  { return STE_HASBIT(GetFontAttr(style_n, use_default), STE_STYLE_FONT_EOLFILLED); }
      bool GetHotSpot(int style_n, bool use_default = true) const    { return STE_HASBIT(GetFontAttr(style_n, use_default), STE_STYLE_FONT_HOTSPOT); }
      // returns wxSTC_CASE_MIXED/UPPER/LOWER
      int  GetCase(int style_n, bool use_default = true) const;
    // the style may have a value, but if set to use default then override that
    //   using the value from STE_STYLE_DEFAULT, mask is STE_STYLE_USEDEFAULT_XXX
    int GetUseDefault(int style_n) const;
    bool GetUsesDefault(int style_n, int mask) const { return (mask & GetUseDefault(style_n)) != 0; }
    // not all styles use all values, returns ored STE_STYLE_USES_XXX
    //   this is really only used for saving into wxConfig
    //   note: all styles internally store all values regardless of this setting
    int  GetStyleUsage(int style_n) const;
    bool GetStyleUses(int style_n, int mask) const                   { return (GetStyleUsage(style_n) & mask) != 0; }

    // Set the whole style, adding it if it didn't already exist
    bool SetStyle( int style_n, const wxSTEditorStyle& steStyle );

    void SetForegroundColour(int style_n, const wxColour &colour) { SetForegroundColourInt(style_n, wxColourToInt(colour)); }
      void SetForegroundColourInt(int style_n, int colour);
    void SetBackgroundColour(int style_n, const wxColour &colour) { SetBackgroundColourInt(style_n, wxColourToInt(colour)); }
      void SetBackgroundColourInt(int style_n, int colour);

    void SetFont(int style_n, const wxFont &font);
    void SetFaceName(int style_n, const wxString &faceName);
    void SetSize(int style_n, int size);
    // Set the attributes using STE_FontAttrType
    void SetFontAttr(int style_n, int ste_font_attr);
      void SetBold(int style_n, bool bold)                  { SetFontAttr(style_n, STE_SETBIT(GetFontAttr(style_n), STE_STYLE_FONT_BOLD,       bold)); }
      void SetItalic(int style_n, bool ital)                { SetFontAttr(style_n, STE_SETBIT(GetFontAttr(style_n), STE_STYLE_FONT_ITALIC,     ital)); }
      void SetUnderlined(int style_n, bool undl)            { SetFontAttr(style_n, STE_SETBIT(GetFontAttr(style_n), STE_STYLE_FONT_UNDERLINED, undl)); }
      void SetHidden(int style_n, bool hid)                 { SetFontAttr(style_n, STE_SETBIT(GetFontAttr(style_n), STE_STYLE_FONT_HIDDEN,     hid )); }
      void SetEOLFilled(int style_n, bool eolfilled)        { SetFontAttr(style_n, STE_SETBIT(GetFontAttr(style_n), STE_STYLE_FONT_EOLFILLED,  eolfilled)); }
      void SetHotSpot(int style_n, bool hotspot)            { SetFontAttr(style_n, STE_SETBIT(GetFontAttr(style_n), STE_STYLE_FONT_HOTSPOT,    hotspot)); }
      // set case with wxSTC_CASE_MIXED/UPPER/LOWER
      void SetCase(int style_n, int lcase);
    // Set whether style should use style STE_STYLE_DEFAULT's values.
    //   Or together STE_STYLE_USEDEFAULT_XXX together to create a mask
    void SetUseDefault(int style_n, int mask, bool use_default);

    // ------------------------------------------------------------------------
    // Add a new style
    bool AddStyle(int style_n, const wxSTEditorStyle& steStyle) { return SetStyle(style_n, steStyle); }

    // ------------------------------------------------------------------------
    // Remove style
    //   If you remove a style needed by the languages and you
    //   haven't reset the lang's style mappings, an error will be generated.

    bool RemoveStyle(int style_n);

    // ------------------------------------------------------------------------
    // Indicators - Get/Set the style and foreground colour of the 3 indicators
    //    supported by Scintilla.
    //  note: uses only foreground colour and puts it's style in the FontStyle
    //  indic_n = 0,1,2  (not STE_STYLE_INDIC_[0,1,2] which is used internally)
    //  style = wxSTC_INDIC_PLAIN...wxSTC_INDIC_MAX

    bool HasIndicatorStyle(int indic_n) const          { wxCHECK_STEINDIC_MSG(indic_n, false); return HasStyle(STE_STYLE_INDIC__FIRST+indic_n); }
    int GetIndicatorStyle(int indic_n) const           { wxCHECK_STEINDIC_MSG(indic_n, 0); return GetFontAttr(STE_STYLE_INDIC__FIRST+indic_n, false); }
    wxColour GetIndicatorForeground(int indic_n) const { wxCHECK_STEINDIC_MSG(indic_n, *wxBLACK); return GetForegroundColour(STE_STYLE_INDIC__FIRST+indic_n, false); }
    int GetIndicatorMask(int indic_n) const            { wxCHECK_STEINDIC_MSG(indic_n, 0);
                                                          return (indic_n == 0) ? wxSTC_INDIC0_MASK :
                                                                ((indic_n == 1) ? wxSTC_INDIC1_MASK :
                                                                ((indic_n == 2) ? wxSTC_INDIC2_MASK : 0)); }

    void SetIndicator(int indic_n, int style, const wxColour &colour) { wxCHECK_STEINDIC_RET(indic_n); SetIndicatorStyle(indic_n, style); SetIndicatorForeground(indic_n, colour); }
    void SetIndicatorStyle(int indic_n, int style)                    { wxCHECK_STEINDIC_RET(indic_n); SetFontAttr(STE_STYLE_INDIC__FIRST+indic_n, style); }
    void SetIndicatorForeground(int indic_n, const wxColour &colour)  { wxCHECK_STEINDIC_RET(indic_n); SetForegroundColour(STE_STYLE_INDIC__FIRST+indic_n, colour); }

    // remove an indicator style
    bool RemoveIndicatorStyle(int indic_n) { wxCHECK_STEINDIC_MSG(indic_n, false); return RemoveStyle(STE_STYLE_INDIC__FIRST+indic_n); }

    // ------------------------------------------------------------------------
    // Markers - Get/Set the marker symbol, and fore/back colours
    //  these don't have to be defined in order or even at all
    //  marker_n = 0,1,2...31 (not STE_STYLE_MARKERS__FIRST which is used internally)
    //  markerSymbol = wxSTC_MARK_CIRCLE...wxSTC_MARK_MAX

    int HasMarkerSymbol(int marker_n) const { wxCHECK_STEMARKER_MSG(marker_n, false); return HasStyle(STE_STYLE_MARKER__FIRST+marker_n); }

    int GetMarkerSymbol(int marker_n) const          { wxCHECK_STEMARKER_MSG(marker_n, 0); return GetFontAttr(STE_STYLE_MARKER__FIRST+marker_n, false); }
    wxColour GetMarkerForeground(int marker_n) const { wxCHECK_STEMARKER_MSG(marker_n, *wxWHITE); return GetForegroundColour(STE_STYLE_MARKER__FIRST+marker_n, false); }
    wxColour GetMarkerBackground(int marker_n) const { wxCHECK_STEMARKER_MSG(marker_n, *wxBLACK); return GetBackgroundColour(STE_STYLE_MARKER__FIRST+marker_n, false); }

    void SetMarker(int marker_n, int markerSymbol,
                   const wxColour& foreground, const wxColour& background)
        { wxCHECK_STEMARKER_RET(marker_n); SetMarkerSymbol(marker_n, markerSymbol);
          SetMarkerForeground(marker_n, foreground); SetMarkerBackground(marker_n, background); }
    void SetMarkerSymbol(int marker_n, int markerSymbol)            { wxCHECK_STEMARKER_RET(marker_n); SetFontAttr(STE_STYLE_MARKER__FIRST+marker_n, markerSymbol); }
    void SetMarkerForeground(int marker_n, const wxColour &colour)  { wxCHECK_STEMARKER_RET(marker_n); SetForegroundColour(STE_STYLE_MARKER__FIRST+marker_n, colour); }
    void SetMarkerBackground(int marker_n, const wxColour &colour)  { wxCHECK_STEMARKER_RET(marker_n); SetBackgroundColour(STE_STYLE_MARKER__FIRST+marker_n, colour); }

    // remove a marker style
    bool RemoveMarkerStyle(int marker_n) { wxCHECK_STEMARKER_MSG(marker_n, false); return RemoveStyle(STE_STYLE_MARKER__FIRST+marker_n); }

    // Set markers for the fold style of the editor STE_FOLDSTYLE_XXX
    //   returns sucess (known fold style)
    bool SetFoldMarkerStyle(int fold_style);

    //-------------------------------------------------------------------------
    // Set or add new initial styles that this class is initialized with

    // add/set an initial style, doesn't update already created wxSTEditorStyles
    bool SetInitStyle( int ste_style, const wxSTEditorStyle& steStyle ) const;

    // set the initial indicators used to initialize this class (indic_n = 0,1,2)
    bool SetInitIndicator( int indic_n, const wxString &name,
                           int fore_colour, int style ) const;
    // set the initial indicators used to initialize this class (marker_n = 0,1,2..31)
    bool SetInitMarker( int marker_n, const wxString &name, int style,
                        int fore_colour, int back_colour ) const;

    // append initial styles that may have been added using AddInitStyle
    //   after this instance was created
    void AppendAddedInitStyles();

    // Remove an initial style, all wxSTEditorStyles created onwards will
    //  not have this style.
    bool RemoveInitStyle( int style_n ) const;
    bool RemoveInitIndicator( int indic_n ) const { return RemoveInitStyle(STE_STYLE_INDIC__FIRST+indic_n); }
    bool RemoveInitMarker( int marker_n ) const   { return RemoveInitStyle(STE_STYLE_MARKER__FIRST+marker_n); }

    // ------------------------------------------------------------------------
    // Setup the colours for a style, setting all the values of the ste style
    //   usage: stc_style is style for Scintilla 0...wxSTC_STYLE_MAX
    //          ste_style is style STE_StyleType (or one you added)
    //          force writes all the values even if they're "default"
    //  (see this function to get a good understanding of this class)
    void SetEditorStyle( int stc_style, int ste_style,
                         wxSTEditor *editor, bool force = false ) const;

    // ------------------------------------------------------------------------
    // update editors
    virtual void UpdateEditor(wxSTEditor *editor);

    // ------------------------------------------------------------------------
    // configuration load & save, returns a string filled with error messages (if any)
    //   See also wxSTEditorOptions for paths and internal saving config.
    wxString LoadConfig(wxConfigBase &config,
                        const wxString &configPath = wxT("/wxSTEditor/Styles/"));
    void SaveConfig(wxConfigBase &config,
                    const wxString &configPath = wxT("/wxSTEditor/Styles/"),
                    int flags = 0) const;

    // creates a human readable config line, used for SaveConfig
    wxString CreateConfigLine(int style_n) const;
    // reads back config line setting values, returns error message or ""
    //    key is the style name with spaces replaced with '_' and the value is
    //    of the form CreateConfigLine
    wxString ParseConfigLine(const wxString &key, const wxString &value);

    // ------------------------------------------------------------------------
    // operators
    wxSTEditorStyles& operator = (const wxSTEditorStyles& styles)
    {
        if ( (*this) != styles )
            Ref(styles);
        return *this;
    }

    bool operator == (const wxSTEditorStyles& styles) const
        { return m_refData == styles.m_refData; }
    bool operator != (const wxSTEditorStyles& styles) const
        { return m_refData != styles.m_refData; }

    // implementation
    int wxColourToInt(const wxColour& colour) const;
    wxColour IntTowxColour(int colour) const;

protected:
    void Init();

    // functions to get/set styles as generic types
    int FindNthStyle(int style_n) const;

private:
    DECLARE_DYNAMIC_CLASS(wxSTEditorStyles)
};

#endif // _STESTYLS_H_
