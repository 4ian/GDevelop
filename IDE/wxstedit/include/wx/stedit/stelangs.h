///////////////////////////////////////////////////////////////////////////////
// File:        stelangs.h
// Purpose:     wxSTEditor Languages initialization
// Maintainer:
// Created:     2003-04-04
// RCS-ID:      $Id: stelangs.h,v 1.14 2007/02/15 02:20:42 jrl1 Exp $
// Copyright:   (c) John Labenski, Otto Wyss
// Licence:     wxWidgets licence
///////////////////////////////////////////////////////////////////////////////

#ifndef _STELANGS_H_
#define _STELANGS_H_

#include "wx/stedit/stedefs.h"
#include "wx/stedit/steprefs.h"

class WXDLLEXPORT wxConfigBase;

#include "wx/stedit/pairarr.h"
DECLARE_PAIRARRAY_INTKEY(wxString, wxArrayString, wxSTEPairArrayIntString, class WXDLLIMPEXP_STEDIT)

//----------------------------------------------------------------------------
// wxSTEditorLangs - ref counted languages for the wxSTEditor
//                         probably only want/need one of these
//                         the only thing you can set is the filepatterns
//
//   attach to an editor using wxSTEditor::RegisterLanguages
//
// This class is works a little differently than the prefs and styles. Instead
// of copying the values from a set of "Init" values this merely uses the
// init values in place. This is done to save memory.
//
// The default values are stored in an array of struct STE_Language and this
// class just accesses them. This means that if you do this :
//   const char* myCPPFilePatterns = "*.cxx"; // must exist until exit
//   STELangs::GetLanguage(STE_LANG_CPP)->filePattern = myCPPFilePatterns;
// You've changed the filePatterns for the CPP lexer for all instances of the
// wxSTEditorLangs.
//
// In order to change the filepatterns of a specific instance of the langs use
//   SetUserFilePatterns.
//
// It is assumed that there would be very few changes a user would want to make
// to this data except for filepatters, added words, and style mapping.
//
// * There is a lot of data in this class and if any of it is in error please
//   correct it and send me a patch.
//----------------------------------------------------------------------------

struct STE_Language;

class WXDLLIMPEXP_STEDIT wxSTEditorLangs : public wxSTEditorPrefBase
{
public:
    wxSTEditorLangs(bool create = false) { if (create) Create(); }
    wxSTEditorLangs(const wxSTEditorLangs &langs) { Create(langs); }
    virtual ~wxSTEditorLangs() {}
    bool Ok() const { return m_refData != NULL; }
    bool Create();                                // (re)create as new
    bool Create(const wxSTEditorLangs &other);    // make a Refed copy of other
    void Copy(const wxSTEditorLangs &other);      // make a full copy
    void Reset();                                 // reset to default vals
    void Destroy() { UnRef(); }

    // Do these two langs have the same values
    bool IsEqualTo(const wxSTEditorLangs &langs) const;

    // ------------------------------------------------------------------------
    // An instance of the editor languages for many editors to share
    //   Use this in at least one editor to not let it go to waste.
    static wxSTEditorLangs& GetGlobalEditorLangs();

    // ------------------------------------------------------------------------

    // Get the number of different languages = STE_LANG__MAX
    //   NB: Some may be NULL if !STE_USE_LANG_XXX is 0, check HasLanguage
    size_t GetCount() const;

    // Find what language has the extension, returns STE_LANG_NULL if unknown
    int FindLanguageByFilename(const wxString& fileName) const;

    // Is this language set (else it's NULL), lang_n is enum STE_LangTypes
    bool HasLanguage(size_t lang_n) const { return GetLanguage(lang_n) != NULL; }

    // Get the name of the language
    wxString GetName(size_t lang_n) const;
    // Get the file extensions to use for this language, "*.c;*.cpp;*.h..."
    //   If !get_default then get the set value, else return default
    wxString GetFilePattern(size_t lang_n, bool get_default = false) const;
    // Get the set filepattern, if any, else empty string.
    wxString GetUserFilePattern(size_t lang_n) const;
    // Get a file filter for the language "Python (py,pyw) | *.py;*.pyw"
    wxString GetFileFilter(size_t lang_n) const;
    // Get the lexer to use for Scintilla
    int GetLexer(size_t lang_n) const;
    // Get the number of styles defined for the lexer
    size_t GetStyleCount(size_t lang_n) const;
    // Get the style index the lexer uses for this language, style_n = 0...GetStyleCount()
    //    returns a style for Scintilla's lexer or -1 if not used or error
    //    Typically they're in order 0,1,2 but sometimes not.
    int GetSciStyle(size_t lang_n, size_t style_n) const;
    // Get what STE style to use for this language, style_n = 0...GetStyleCount()
    //    returns a style for wxSTEditorStyles to use or -1 if not used or error
    int GetSTEStyle(size_t lang_n, size_t style_n, bool get_default = false) const;
    // Get a user set STE style to use for this language
    //   returns -1 if none set
    int GetUserSTEStyle(size_t lang_n, size_t style_n) const;
    // Translate the scintilla style to the STE style using the style table
    //   returns -1 on error
    int SciToSTEStyle(size_t lang_n, int sci_style) const;
    // Get a readable description of what the style is used for in Scintilla
    wxString GetStyleDescription(size_t lang_n, size_t style_n) const;
    // Get the number of keywords for the style
    size_t GetKeyWordsCount(size_t lang_n) const;
    // Get the words used for this style or NULL if none
    //   If !get_default then get the words + any set words, else default only
    wxString GetKeyWords(size_t lang_n, size_t word_n, bool get_default = false) const;
    // Get any set keywords added to the defaults, else empty string.
    wxString GetUserKeyWords(size_t lang_n, size_t word_n) const;
    // Get the chararacters used for the start and end of blocks eg, "{}" for c
    bool     HasBlock(size_t lang_n) const;              // are blocks defined?
    wxString GetBlockStart(size_t lang_n) const;         // for cpp "{"
    wxString GetBlockEnd(size_t lang_n) const;           // for cpp "}"
    int      GetBlockStartSTCStyle(size_t lang_n) const; // Scintilla style for block start
    int      GetBlockEndSTCStyle(size_t lang_n) const;   // Scintilla style for block end
    // Get what preprocessor symbols are used
    bool     HasPreprocessor(size_t lang_n) const;       // are comments defined?
    wxString GetPreprocessorSymbol(size_t lang_n) const; // for cpp "#"
    wxString GetPreprocessorStart(size_t lang_n) const;  // for cpp "if ifdef ifndef"
    wxString GetPreprocessorMid(size_t lang_n) const;    // for cpp "else elif"
    wxString GetPreprocessorEnd(size_t lang_n) const;    // for cpp "endif"
    // Get what comment symbols are used
    bool     HasComments(size_t lang_n) const;           // are blocks defined?
    int      GetCommentBlockAtLineStart(size_t lang_n) const; // starts at beginning of line
    wxString GetCommentBlock(size_t lang_n) const;       // for cpp "//"
    wxString GetCommentBoxStart(size_t lang_n) const;    // for cpp "/*"
    wxString GetCommentBoxMiddle(size_t lang_n) const;   // for cpp "*"
    wxString GetCommentBoxEnd(size_t lang_n) const;      // for cpp "*/"
    wxString GetCommentStreamStart(size_t lang_n) const; // for cpp "/*"
    wxString GetCommentStreamEnd(size_t lang_n) const;   // for cpp "*/"
    // Get the Scintilla styled used for the braces
    int GetBracesStyle(size_t lang_n) const;
    // Get the folds used for this language
    int GetFolds(size_t lang_n) const;
    //int GetIndent(int lang_n) const;
    //int GetLongLine(int lang_n) const;
    int GetFlags(size_t lang_n) const;

    // You can turn off the "availability" of languages by setting the
    //   flag STE_LANG_FLAG_DONTUSE
    bool GetUseLanguage(size_t lang_n) const { return HasLanguage(lang_n) && ((GetFlags(lang_n) & STE_LANG_FLAG_DONTUSE) == 0); }

    // ------------------------------------------------------------------------

    // Set the filepatterns to use for the language, this takes
    //  precedence over the default file patterns. see Get(User)FilePattern
    void SetUserFilePattern(size_t lang_n, const wxString &filePattern);
    // Set the STE style to use for the Scintilla style for the language
    //   style_n must be in the range GetStyleCount
    //   ste_style is the ste_style see enum STE_StyleType (or ones you added)
    //   This changes the default style used as well, permanently.
    void SetSTEStyle(size_t lang_n, size_t style_n, int ste_style);
    // Set a user defined style to use, see SetSTEStyle for parameters
    void SetUserSTEStyle(size_t lang_n, size_t style_n, int ste_style);
    // Set additional words to use that are added to the defaults
    void SetUserKeyWords(size_t lang_n, size_t word_n, const wxString& words);

    // Set the flags for the language enum STE_LangFlagsType
    void SetFlags(size_t lang_n, int flags);

    // ------------------------------------------------------------------------
    // Add a new language to this, the language is not deleted when done and
    //  must exist for the life of this wxSTEditorLangs.
    //  The function returns the position in the array where the lang is,
    //     GetCount()-1 or STE_LANG__MAX+(num langs you've already added)
    int AddLanguage(STE_Language* lang);

    // Get the language struct itself - remember that the strings in the
    //   struct are const char* so be careful about conversion.
    //   You should really use the above functions instead of accessing
    //     this to avoid problems. However you may replace values.
    STE_Language* GetLanguage(size_t lang_n) const;

    // ------------------------------------------------------------------------
    // update editors
    virtual void UpdateEditor( wxSTEditor *editor );

    // ------------------------------------------------------------------------
    // configuration load & save
    //   See also wxSTEditorOptions for paths and internal saving config.
    void LoadConfig(wxConfigBase &config,
                    const wxString &configRoot  = wxT("/wxSTEditor/Languages/"));
    void SaveConfig(wxConfigBase &config,
                    const wxString &configRoot  = wxT("/wxSTEditor/Languages/"),
                    int flags = 0) const;

    // ------------------------------------------------------------------------
    // operators
    wxSTEditorLangs& operator = (const wxSTEditorLangs& langs)
    {
        if ( (*this) != langs )
            Ref(langs);
        return *this;
    }

    bool operator == (const wxSTEditorLangs& langs) const
        { return m_refData == langs.m_refData; }
    bool operator != (const wxSTEditorLangs& langs) const
        { return m_refData != langs.m_refData; }

private:
    DECLARE_DYNAMIC_CLASS(wxSTEditorLangs)
};


// ---------------------------------------------------------------------------
// STE_Language is a struct that contains the info about a language
//   Please see cpp file for usage, basicly just create permanent values and
//   a permanent STE_Language struct and you can use
//   wxSTEditorLangs::AddLanguage.
//
// This is provided so that you can create your own languages and add them.
//   Please try to use the accessors in wxSTEditorLangs.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Styles used for the language, maps enum STE_StyleType to Scintilla styles
typedef struct STE_LexerStyles
{
    int         ste_style;        // STE style to use
    int         sci_style;        // Scintilla style to map to
    const char* description;      // readable description of it's use in scintilla
} STE_LexerStyles;

// ---------------------------------------------------------------------------
// Word list and it's Scintilla style for the lexer
typedef struct STE_LexerWords
{
    int         sci_style;  // Scintilla style used for the words
    const char* words;      // List of words, for cpp "and and_eq asm auto..."
} STE_LexerWords;

// ---------------------------------------------------------------------------
// Block start and end (ie. {}) and the styles for the start/end blocks
typedef struct STE_LexerBlock
{
    int         sci_start_style;  // Scintilla style to use for block start
    const char* start;            // for cpp "{"
    int         sci_end_style;    // Scintilla style to use for block end
    const char* end;              // for cpp "}"
} STE_LexerBlock;

// ---------------------------------------------------------------------------
// Comments for the lexers or NULL for none
typedef struct STE_LexerComments
{
    int         blockAtLineStart;
    const char* block;            // for cpp "//"
    const char* boxStart;         // for cpp "/*"
    const char* boxMiddle;        // for cpp "*"
    const char* boxEnd;           // for cpp "*/"
    const char* streamStart;      // for cpp "/*"
    const char* streamEnd;        // for cpp "*/"
} STE_LexerComments;

// ---------------------------------------------------------------------------
// Preprocessor symbols used for the lexers or NULL for none
typedef struct STE_LexerPreproc
{
    const char* symbol;           // for cpp "#"
    const char* boxStart;         // for cpp "if ifdef ifndef"
    const char* boxMiddle;        // for cpp "else elif"
    const char* boxEnd;           // for cpp "endif"
} STE_LexerPreproc;

// ---------------------------------------------------------------------------
// A complete description for the lexer languages
typedef struct STE_Language
{
    const char* name;           // readable name of the language
    int lexer;                  // Scintilla lexer number eg. wxSTC_LEX_CPP
    const char* filePattern;    // file extensions, "*.c;*.cc;*.cpp..."
    STE_LexerStyles* styles;    // maps Scintilla styles to STE, always have 1
    size_t  styles_count;       // number of styles mapped
    STE_LexerWords* words;      // may be NULL for no words
    size_t words_count;         // number of words
    STE_LexerComments* comment; // may be NULL for no comments
    STE_LexerBlock*    block;   // may be NULL for no blocks
    STE_LexerPreproc*  preproc; // may be NULL for no preprocessor
    int braces_style;           // Scintilla style used for braces
    int folds;                  // what folds are available STE_FOLD_XXX (FIXME unused)
    int flags;                  // user defined flags
    //int m_indent;
    //int m_longline;
} STE_Language;

#endif // _STELANGS_H_

