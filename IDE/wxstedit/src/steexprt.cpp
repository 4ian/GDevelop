///////////////////////////////////////////////////////////////////////////////
// Name:        steexprt.cpp
// Purpose:     wxSTEditorExporter
// Author:      John Labenski, and others see below
// Modified by:
// Created:     11/05/2002
// RCS-ID:
// Copyright:   (c) John Labenski, Neil Hodgson, & others see below
// Licence:     wxWidgets licence
///////////////////////////////////////////////////////////////////////////////

/*
Updated to SciTE 1.73, 2/08/06 - see scite/src/Exporters.cxx

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

#ifdef __BORLANDC__
    #pragma hdrstop
#endif

// For compilers that support precompilation, includes "wx/wx.h".
#include "wx/wxprec.h"

#ifndef WX_PRECOMP
    #include "wx/wx.h"
#endif // WX_PRECOMP

#include "wx/stedit/stedit.h"    // for wxSTEEditorPrefs/Styles/Langs
#include "wx/stedit/steexprt.h"
#include "stedlgs_wdr.h"
#include "wx/stc/private.h" //If compilation fails here, you have to copy the file from the wxWidgets source dir to the wxWidgets installation dir.
#include "wx/filesys.h"

// ----------------------------------------------------------------------------
// The code below is copied to avoid having to include the Scintilla headers
// which are not copied when installing the wxWidgets library

// ----------------------------------------------------------------------------
//#include "../../contrib/src/stc/scintilla/include/Platform.h" // for PRectangle & Point

// PRectangle used for pageMargin, see below, only uses the variables as is
//   we just dumb it down to it's simplest form
class PRRectangle
{
public:
    PRRectangle() : left(0), right(0), top(0), bottom(0) {}
    int left, right, top, bottom;
};

// ----------------------------------------------------------------------------
//#include "../../contrib/src/stc/scintilla/include/SString.h"  // for SString

// Turn off warnings generated from MSVC's buggy std:: lib header files.
#if defined(__VISUALC__)
    #include <yvals.h>
    #pragma warning(disable: 4018)  // signed/unsigned mismatch
    #pragma warning(disable: 4100)  // unreferenced formal parameter
    #pragma warning(disable: 4146)  // unary minus operator applied to unsigned type,
                                    // result still unsigned
    #pragma warning(disable: 4244)  // 'conversion' conversion from 'type1' to 'type2',
                                    // possible loss of data
    #pragma warning(disable: 4245)  // conversion from 'type1' to 'type2', signed/unsigned
                                    // mismatch
    #pragma warning(disable: 4511)  // 'class' : copy constructor could not be generated
    #pragma warning(disable: 4512)  // 'class' : assignment operator could not be generated
    #pragma warning(disable: 4663)  // C++ language change: to explicitly specialize class
                                    // template 'vector'
    #pragma warning(disable: 4710)  // 'function' : function not inlined
    #pragma warning(disable: 4786)  // identifier was truncated to 'number' characters
#endif // defined(__VISUALC__)

// We can just typedef SString to std::string
#include <string>
//using namespace std;
typedef std::string SString;


// These functions in wxWidgets/contrib/src/stc/scintilla/src/PropSet.cxx
inline char MakeUpperCase_(char ch) {
        if (ch < 'a' || ch > 'z')
                return ch;
        else
                return static_cast<char>(ch - 'a' + 'A');
}
int CompareCaseInsensitive_(const char *a, const char *b) {
        while (*a && *b) {
                if (*a != *b) {
                        char upperA = MakeUpperCase_(*a);
                        char upperB = MakeUpperCase_(*b);
                        if (upperA != upperB)
                                return upperA - upperB;
                }
                a++;
                b++;
        }
        // Either *a or *b is nul
        return *a - *b;
}
bool EqualCaseInsensitive_(const char *a, const char *b) {
    return 0 == CompareCaseInsensitive_(a, b);
}

// end copied code from Scintilla
// ----------------------------------------------------------------------------

wxSTEditorExporter::wxSTEditorExporter(wxSTEditor* editor)
{
    wxCHECK_RET(editor, wxT("Invalid editor"));
    m_editor    = editor;
    m_stePrefs  = editor->GetEditorPrefs();
    m_steStyles = editor->GetEditorStyles();
    m_steLangs  = editor->GetEditorLangs();

    // we need something... just create them
    if (!m_stePrefs.Ok())  m_stePrefs.Create();
    if (!m_steStyles.Ok()) m_steStyles.Create();
    if (!m_steLangs.Ok())  m_steLangs.Create();
}

bool wxSTEditorExporter::ExportToFile(int file_format, const wxString& fileName,
                                      bool overwrite_prompt, bool msg_on_error)
{
    wxCHECK_MSG(m_editor, false, wxT("Invalid editor"));

    if (overwrite_prompt && wxFileExists(fileName))
    {
        int overw = wxMessageBox(_("Overwrite file : '")+fileName+wxT("'?\n"),
                           _("Export error"),
                           wxOK|wxCANCEL|wxCENTRE|wxICON_QUESTION, m_editor);

        if (overw == wxCANCEL)
            return false;
    }

    bool ret = false;

    switch (file_format)
    {
        case STE_EXPORT_HTML    : ret = SaveToHTML(fileName);    break;
        case STE_EXPORT_HTMLCSS : ret = SaveToHTMLCSS(fileName); break;
        case STE_EXPORT_PDF     : ret = SaveToPDF(fileName);     break;
        case STE_EXPORT_RTF     : ret = SaveToRTF(fileName);     break;
        case STE_EXPORT_TEX     : ret = SaveToTEX(fileName);     break;
        case STE_EXPORT_XML     : ret = SaveToXML(fileName);     break;
        default : break;
    }

    if (!ret && msg_on_error)
    {
        wxMessageBox(_("Unable to export to file : '")+fileName+wxT("'.\n"),
                     _("Export error"),
                     wxOK|wxCENTRE|wxICON_ERROR, m_editor);
    }

    return ret;
}

wxString wxSTEditorExporter::GetExtension(int file_format)
{
    switch (file_format)
    {
        case STE_EXPORT_HTML    :
        case STE_EXPORT_HTMLCSS : return wxT("html");
        case STE_EXPORT_PDF     : return wxT("pdf");
        case STE_EXPORT_RTF     : return wxT("rtf");
        case STE_EXPORT_TEX     : return wxT("tex");
        case STE_EXPORT_XML     : return wxT("xml");
        default : break;
    }

    return wxEmptyString;
}

wxString wxSTEditorExporter::GetWildcards(int file_format)
{
    switch (file_format)
    {
        case STE_EXPORT_HTML    :
        case STE_EXPORT_HTMLCSS : return wxT("HTML (html,htm)|*.html;*.htm");
        case STE_EXPORT_PDF     : return wxT("PDF (pdf)|*.pdf");
        case STE_EXPORT_RTF     : return wxT("RTF (rtf)|*.rtf");
        case STE_EXPORT_TEX     : return wxT("LaTex (tex)|*.tex");
        case STE_EXPORT_XML     : return wxT("XML (xml)|*.xml");
        default : break;
    }

    return wxFileSelectorDefaultWildcardStr;
}

int wxSTEditorExporter::SciToSTEStyle(int sci_style) const
{
    int ste_lang_n = m_editor->GetLanguageId();
    int ste_style  = m_steLangs.SciToSTEStyle(ste_lang_n, sci_style);

    return ste_style >= 0 ? ste_style : STE_STYLE_DEFAULT;
}

// SciTE - Scintilla based Text Editor
/** @file Exporters.cxx
 ** Export the current document to various markup languages.
 **/
// Copyright 1998-2006 by Neil Hodgson <neilh@scintilla.org>
// The License.txt file describes the conditions under which this software may be distributed.

#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include <stdio.h>
#include <fcntl.h>
#include <sys/stat.h>
#include <time.h>

// Some compatibility defines to simplify transition
#define STYLE_DEFAULT           wxSTC_STYLE_DEFAULT
#define STYLE_MAX               wxSTC_STYLE_MAX
#define STYLE_LASTPREDEFINED    wxSTC_STYLE_LASTPREDEFINED
#define SC_FOLDLEVELNUMBERMASK  wxSTC_FOLDLEVELNUMBERMASK
#define SC_FOLDLEVELBASE        wxSTC_FOLDLEVELBASE
#define SC_FOLDLEVELHEADERFLAG  wxSTC_FOLDLEVELHEADERFLAG

// From scite/src/SciTEBase.h/cxx copied here to allow for fewer changes below
class StyleDefinition {
public:
        SString font;
        int size;
        SString fore;
        SString back;
        bool bold;
        bool italics;
        bool eolfilled;
        bool underlined;
        int  caseForce;
        bool visible;
        bool changeable;
        enum flags { sdNone = 0, sdFont = 0x1, sdSize = 0x2, sdFore = 0x4, sdBack = 0x8,
                     sdBold = 0x10, sdItalics = 0x20, sdEOLFilled = 0x40, sdUnderlined = 0x80,
                     sdCaseForce = 0x100, sdVisible = 0x200, sdChangeable = 0x400} specified;
        StyleDefinition() {}
        StyleDefinition(const wxSTEditorStyles& styles, int ste_style)
            { Create(styles, ste_style); }
        void Create(const wxSTEditorStyles& styles, int ste_style);
        //bool ParseStyleDefinition(const char *definition);
        //long ForeAsLong() const;
        //long BackAsLong() const;
};

void StyleDefinition::Create(const wxSTEditorStyles& styles, int ste_style)
{
    wxCHECK_RET(styles.Ok(), wxT("Invalid styles"));
    font       = wx2stc(styles.GetFaceName(ste_style));
    size       = styles.GetSize(ste_style);
    fore       = wx2stc(wxString::Format(wxT("#%06X"), styles.GetForegroundColourInt(ste_style)));
    back       = wx2stc(wxString::Format(wxT("#%06X"), styles.GetBackgroundColourInt(ste_style)));
    bold       = styles.GetBold(ste_style);
    italics    = styles.GetItalic(ste_style);
    eolfilled  = styles.GetEOLFilled(ste_style);
    underlined = styles.GetUnderlined(ste_style);
    caseForce  = styles.GetCase(ste_style);
    visible    = !styles.GetHidden(ste_style);
    changeable = true;

    int specified_ = sdNone;
    specified_ |= styles.GetUsesDefault(ste_style, STE_STYLE_USEDEFAULT_FACENAME)   ? 0 : sdFont;
    specified_ |= styles.GetUsesDefault(ste_style, STE_STYLE_USEDEFAULT_FONTSIZE)   ? 0 : sdSize;
    specified_ |= styles.GetUsesDefault(ste_style, STE_STYLE_USEDEFAULT_FORECOLOUR) ? 0 : sdFore;
    specified_ |= styles.GetUsesDefault(ste_style, STE_STYLE_USEDEFAULT_BACKCOLOUR) ? 0 : sdBack;
    specified_ |= styles.GetUsesDefault(ste_style, STE_STYLE_USEDEFAULT_FONTSTYLE)  ? 0 : sdBold|sdItalics|sdEOLFilled|sdUnderlined|sdCaseForce|sdVisible;
    specified = flags(specified_);
}

int IntFromHexDigit(int ch) {
        if ((ch >= '0') && (ch <= '9')) {
                return ch - '0';
        } else if (ch >= 'A' && ch <= 'F') {
                return ch - 'A' + 10;
        } else if (ch >= 'a' && ch <= 'f') {
                return ch - 'a' + 10;
        } else {
                return 0;
        }
}

int IntFromHexByte(const char *hexByte) {
        return IntFromHexDigit(hexByte[0]) * 16 + IntFromHexDigit(hexByte[1]);
}

//---------- Save to RTF ----------

#define RTF_HEADEROPEN "{\\rtf1\\ansi\\deff0\\deftab720"
#define RTF_FONTDEFOPEN "{\\fonttbl"
#define RTF_FONTDEF "{\\f%d\\fnil\\fcharset%u %s;}"
#define RTF_FONTDEFCLOSE "}"
#define RTF_COLORDEFOPEN "{\\colortbl"
#define RTF_COLORDEF "\\red%d\\green%d\\blue%d;"
#define RTF_COLORDEFCLOSE "}"
#define RTF_HEADERCLOSE "\n"
#define RTF_BODYOPEN ""
#define RTF_BODYCLOSE "}"

#define RTF_SETFONTFACE "\\f"
#define RTF_SETFONTSIZE "\\fs"
#define RTF_SETCOLOR "\\cf"
#define RTF_SETBACKGROUND "\\highlight"
#define RTF_BOLD_ON "\\b"
#define RTF_BOLD_OFF "\\b0"
#define RTF_ITALIC_ON "\\i"
#define RTF_ITALIC_OFF "\\i0"
#define RTF_UNDERLINE_ON "\\ul"
#define RTF_UNDERLINE_OFF "\\ulnone"
#define RTF_STRIKE_ON "\\i"
#define RTF_STRIKE_OFF "\\strike0"

#define RTF_EOLN "\\par\n"
#define RTF_TAB "\\tab "

#define MAX_STYLEDEF 128
#define MAX_FONTDEF 64
#define MAX_COLORDEF 8
#define RTF_FONTFACE "Courier New"
#define RTF_COLOR "#000000"

// extract the next RTF control word from *style
void GetRTFNextControl(char **style, char *control) {
    int len;
    char *pos = *style;
    *control = '\0';
    if ('\0' == *pos) return;
    pos++; // implicit skip over leading '\'
    while ('\0' != *pos && '\\' != *pos) { pos++; }
    len = pos - *style;
    memcpy(control, *style, len);
    *(control + len) = '\0';
    *style = pos;
}

// extracts control words that are different between two styles
void GetRTFStyleChange(char *delta, char *last, char *current) { // \f0\fs20\cf0\highlight0\b0\i0
    char lastControl[MAX_STYLEDEF], currentControl[MAX_STYLEDEF];
    char *lastPos = last;
    char *currentPos = current;
    *delta = '\0';
    // font face, size, color, background, bold, italic
    for (int i = 0; i < 6; i++) {
        GetRTFNextControl(&lastPos, lastControl);
        GetRTFNextControl(&currentPos, currentControl);
        if (strcmp(lastControl, currentControl)) {  // changed
            strcat(delta, currentControl);
        }
    }
    if ('\0' != *delta) { strcat(delta, " "); }
    strcpy(last, current);
}

bool wxSTEditorExporter::SaveToRTF(const wxString& saveName, int start, int end) {
    wxCHECK_MSG(m_editor, false, wxT("Invalid editor"));
    wxBusyCursor busy;

    int lengthDoc = m_editor->GetLength(); //LengthDocument();
    if (end < 0)
        end = lengthDoc;

    //RemoveFindMarks();
    m_editor->Colourise(0, -1); // SendEditor(SCI_COLOURISE, 0, -1);

    // Read the default settings
    //char key[200];
    //sprintf(key, "style.*.%0d", STYLE_DEFAULT);
    //char *valdef = StringDup(props.GetExpanded(key).c_str());
    //sprintf(key, "style.%s.%0d", language.c_str(), STYLE_DEFAULT);
    //char *val = StringDup(props.GetExpanded(key).c_str());

    StyleDefinition defaultStyle(m_steStyles, STE_STYLE_DEFAULT);
    //defaultStyle.ParseStyleDefinition(val);

    //if (val) delete []val;
    //if (valdef) delete []valdef;

    int tabSize = m_editor->GetTabWidth(); //props.GetInt("export.rtf.tabsize", props.GetInt("tabsize"));
    int wysiwyg = 1;                       //props.GetInt("export.rtf.wysiwyg", 1);
    SString fontFace = defaultStyle.font;  //props.GetExpanded("export.rtf.font.face");
    if (fontFace.length()) {
        defaultStyle.font = fontFace;
    } else if (defaultStyle.font.length() == 0) {
        defaultStyle.font = RTF_FONTFACE;
    }
    int fontSize = defaultStyle.size;       //props.GetInt("export.rtf.font.size", 0);
    if (fontSize > 0) {
        defaultStyle.size = fontSize << 1;
    } else if (defaultStyle.size == 0) {
        defaultStyle.size = 10 << 1;
    } else {
        defaultStyle.size <<= 1;
    }
    unsigned int characterset = wxSTC_CHARSET_DEFAULT; //props.GetInt("character.set", SC_CHARSET_DEFAULT);
    int tabs = m_editor->GetUseTabs();                 //props.GetInt("export.rtf.tabs", 0);
    if (tabSize == 0)
        tabSize = 4;

    FILE *fp = fopen(wx2stc(saveName), "wt");
    if (fp) {
        char styles[STYLE_DEFAULT + 1][MAX_STYLEDEF];
        char fonts[STYLE_DEFAULT + 1][MAX_FONTDEF];
        char colors[STYLE_DEFAULT + 1][MAX_COLORDEF];
        char lastStyle[MAX_STYLEDEF], deltaStyle[MAX_STYLEDEF];
        int fontCount = 1, colorCount = 2, i;
        fputs(RTF_HEADEROPEN RTF_FONTDEFOPEN, fp);
        strncpy(fonts[0], defaultStyle.font.c_str(), MAX_FONTDEF);
        fprintf(fp, RTF_FONTDEF, 0, characterset, defaultStyle.font.c_str());
        strncpy(colors[0], defaultStyle.fore.c_str(), MAX_COLORDEF);
        strncpy(colors[1], defaultStyle.back.c_str(), MAX_COLORDEF);

        for (int istyle = 0; istyle < STYLE_DEFAULT; istyle++) {
            //sprintf(key, "style.*.%0d", istyle);
            //char *valdef = StringDup(props.GetExpanded(key).c_str());
            //sprintf(key, "style.%s.%0d", language.c_str(), istyle);
            //char *val = StringDup(props.GetExpanded(key).c_str());

            StyleDefinition sd(m_steStyles, SciToSTEStyle(istyle));
            //sd.ParseStyleDefinition(val);

            if (sd.specified != StyleDefinition::sdNone) {
                if (wysiwyg && sd.font.length()) {
                    for (i = 0; i < fontCount; i++)
                        if (EqualCaseInsensitive_(sd.font.c_str(), fonts[i]))
                            break;
                    if (i >= fontCount) {
                        strncpy(fonts[fontCount++], sd.font.c_str(), MAX_FONTDEF);
                        fprintf(fp, RTF_FONTDEF, i, characterset, sd.font.c_str());
                    }
                    sprintf(lastStyle, RTF_SETFONTFACE "%d", i);
                } else {
                    strcpy(lastStyle, RTF_SETFONTFACE "0");
                }

                sprintf(lastStyle + strlen(lastStyle), RTF_SETFONTSIZE "%d",
                        wysiwyg && sd.size ? sd.size << 1 : defaultStyle.size);

                if (sd.specified & StyleDefinition::sdFore) {
                    for (i = 0; i < colorCount; i++)
                        if (EqualCaseInsensitive_(sd.fore.c_str(), colors[i]))
                            break;
                    if (i >= colorCount)
                        strncpy(colors[colorCount++], sd.fore.c_str(), MAX_COLORDEF);
                    sprintf(lastStyle + strlen(lastStyle), RTF_SETCOLOR "%d", i);
                } else {
                    strcat(lastStyle, RTF_SETCOLOR "0");    // Default fore
                }

                // PL: highlights doesn't seems to follow a distinct table, at least with WordPad and Word 97
                // Perhaps it is different for Word 6?
//              sprintf(lastStyle + strlen(lastStyle), RTF_SETBACKGROUND "%d",
//                      sd.back.length() ? GetRTFHighlight(sd.back.c_str()) : 0);
                if (sd.specified & StyleDefinition::sdBack) {
                    for (i = 0; i < colorCount; i++)
                        if (EqualCaseInsensitive_(sd.back.c_str(), colors[i]))
                            break;
                    if (i >= colorCount)
                        strncpy(colors[colorCount++], sd.back.c_str(), MAX_COLORDEF);
                    sprintf(lastStyle + strlen(lastStyle), RTF_SETBACKGROUND "%d", i);
                } else {
                    strcat(lastStyle, RTF_SETBACKGROUND "1");   // Default back
                }
                if (sd.specified & StyleDefinition::sdBold) {
                    strcat(lastStyle, sd.bold ? RTF_BOLD_ON : RTF_BOLD_OFF);
                } else {
                    strcat(lastStyle, defaultStyle.bold ? RTF_BOLD_ON : RTF_BOLD_OFF);
                }
                if (sd.specified & StyleDefinition::sdItalics) {
                    strcat(lastStyle, sd.italics ? RTF_ITALIC_ON : RTF_ITALIC_OFF);
                } else {
                    strcat(lastStyle, defaultStyle.italics ? RTF_ITALIC_ON : RTF_ITALIC_OFF);
                }
                strncpy(styles[istyle], lastStyle, MAX_STYLEDEF);
            } else {
                sprintf(styles[istyle], RTF_SETFONTFACE "0" RTF_SETFONTSIZE "%d"
                        RTF_SETCOLOR "0" RTF_SETBACKGROUND "1"
                        RTF_BOLD_OFF RTF_ITALIC_OFF, defaultStyle.size);
            }
            //if (val)
            //  delete []val;
            //if (valdef)
            //  delete []valdef;
        }
        fputs(RTF_FONTDEFCLOSE RTF_COLORDEFOPEN, fp);
        for (i = 0; i < colorCount; i++) {
            fprintf(fp, RTF_COLORDEF, IntFromHexByte(colors[i] + 1),
                    IntFromHexByte(colors[i] + 3), IntFromHexByte(colors[i] + 5));
        }
        fprintf(fp, RTF_COLORDEFCLOSE RTF_HEADERCLOSE RTF_BODYOPEN RTF_SETFONTFACE "0"
                RTF_SETFONTSIZE "%d" RTF_SETCOLOR "0 ", defaultStyle.size);
        sprintf(lastStyle, RTF_SETFONTFACE "0" RTF_SETFONTSIZE "%d"
                RTF_SETCOLOR "0" RTF_SETBACKGROUND "1"
                RTF_BOLD_OFF RTF_ITALIC_OFF, defaultStyle.size);
        bool prevCR = false;
        int styleCurrent = -1;
        //WindowAccessor acc(wEditor.GetID(), props);
        int column = 0;
        for (i = start; i < end; i++) {
            char ch = (char)m_editor->GetCharAt(i); //acc[i];
            int style = m_editor->GetStyleAt(i);    //acc.StyleAt(i);
            if (style > STYLE_DEFAULT)
                style = 0;
            if (style != styleCurrent) {
                GetRTFStyleChange(deltaStyle, lastStyle, styles[style]);
                if (*deltaStyle)
                    fputs(deltaStyle, fp);
                styleCurrent = style;
            }
            if (ch == '{')
                fputs("\\{", fp);
            else if (ch == '}')
                fputs("\\}", fp);
            else if (ch == '\\')
                fputs("\\\\", fp);
            else if (ch == '\t') {
                if (tabs) {
                    fputs(RTF_TAB, fp);
                } else {
                    int ts = tabSize - (column % tabSize);
                    for (int itab = 0; itab < ts; itab++) {
                        fputc(' ', fp);
                    }
                    column += ts - 1;
                }
            } else if (ch == '\n') {
                if (!prevCR) {
                    fputs(RTF_EOLN, fp);
                    column = -1;
                }
            } else if (ch == '\r') {
                fputs(RTF_EOLN, fp);
                column = -1;
            }
            else
                fputc(ch, fp);
            column++;
            prevCR = ch == '\r';
        }
        fputs(RTF_BODYCLOSE, fp);
        fclose(fp);
    } else {
        return false;
        //FIMXE SString msg = LocaliseMessage("Could not save file '^0'.", filePath.AsFileSystem());
        //WindowMessageBox(wSciTE, msg, MB_OK | MB_ICONWARNING);
    }
    return true;
}


//---------- Save to HTML ----------

bool wxSTEditorExporter::SaveToHTMLCSS(const wxString& saveName) {
    wxCHECK_MSG(m_editor, false, wxT("Invalid editor"));
    wxBusyCursor busy;

    //RemoveFindMarks();
    m_editor->Colourise(0, -1);             //SendEditor(SCI_COLOURISE, 0, -1);
    int tabSize = m_editor->GetTabWidth();  //props.GetInt("tabsize");
    if (tabSize == 0)
        tabSize = 4;
    int wysiwyg = 1;                        //props.GetInt("export.html.wysiwyg", 1);
    int tabs = m_editor->GetUseTabs();      //props.GetInt("export.html.tabs", 0);
    int folding = 0;                        //props.GetInt("export.html.folding", 0);
    int onlyStylesUsed = 0;                 //props.GetInt("export.html.styleused", 0);
    int titleFullPath = 0;                  //props.GetInt("export.html.title.fullpath", 0);

    int lengthDoc = m_editor->GetLength();  //LengthDocument();
    //WindowAccessor acc(wEditor.GetID(), props);

    bool styleIsUsed[STYLE_MAX + 1];
    if (onlyStylesUsed) {
        int i;
        for (i = 0; i <= STYLE_MAX; i++) {
            styleIsUsed[i] = false;
        }
        // check the used styles
        for (i = 0; i < lengthDoc; i++) {
            styleIsUsed[m_editor->GetStyleAt(i) & 0x7F] = true;
        }
    } else {
        for (int i = 0; i <= STYLE_MAX; i++) {
            styleIsUsed[i] = true;
        }
    }
    styleIsUsed[STYLE_DEFAULT] = true;

    FILE *fp = fopen(wx2stc(saveName), "wt");
    if (fp) {
        fputs("<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Transitional//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\">\n", fp);
        fputs("<html xmlns=\"http://www.w3.org/1999/xhtml\">\n", fp);
        fputs("<head>\n", fp);
        if (titleFullPath)
            fprintf(fp, "<title>%s</title>\n",
                static_cast<const char *>(wx2stc(wxFileSystem::FileNameToURL(saveName)))); //FIXME filePath.AsFileSystem()));
        else
            fprintf(fp, "<title>%s</title>\n",
                static_cast<const char *>(wx2stc(wxFileSystem::FileNameToURL(wxFileName(saveName).GetFullName())))); //FIXME filePath.Name().AsFileSystem()));
        // Probably not used by robots, but making a little advertisement for those looking
        // at the source code doesn't hurt...
		fputs("<meta name=\"Generator\" content=\"SciTE - www.Scintilla.org\" />\n", fp);
        if (m_editor->GetCodePage() == wxSTC_CP_UTF8)
            fputs("<meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\" />\n", fp);

        if (folding) {
			fputs("<script language=\"JavaScript\" type=\"text/javascript\">\n"
			      "<!--\n"
			      "function symbol(id, sym) {\n"
			      " if (id.textContent==undefined) {\n"
			      " id.innerText=sym; } else {\n"
			      " id.textContent=sym; }\n"
			      "}\n"
			      "function toggle(id) {\n"
			      "var thislayer=document.getElementById('ln'+id);\n"
			      "id-=1;\n"
			      "var togline=document.getElementById('hd'+id);\n"
			      "var togsym=document.getElementById('bt'+id);\n"
			      "if (thislayer.style.display == 'none') {\n"
			      " thislayer.style.display='block';\n"
			      " togline.style.textDecoration='none';\n"
			      " symbol(togsym,'- ');\n"
			      "} else {\n"
			      " thislayer.style.display='none';\n"
			      " togline.style.textDecoration='underline';\n"
			      " symbol(togsym,'+ ');\n"
			      "}\n"
			      "}\n"
			      "//-->\n"
			      "</script>\n", fp);
		}

        fputs("<style type=\"text/css\">\n", fp);

        SString bgColour;
        StyleDefinition sddef(m_steStyles, SciToSTEStyle(STE_STYLE_DEFAULT));
/*
        char key[200];
		sprintf(key, "style.*.%0d", STYLE_DEFAULT);
		char *valdef = StringDup(props.GetExpanded(key).c_str());
		sprintf(key, "style.%s.%0d", language.c_str(), STYLE_DEFAULT);
		char *val = StringDup(props.GetExpanded(key).c_str());

		StyleDefinition sddef(valdef);
		sddef.ParseStyleDefinition(val);
		if (sddef.back.length()) {
			bgColour = sddef.back;
		}
		if (val) {
			delete []val;
		}
		if (valdef) {
			delete []valdef;
		}
*/
        for (int istyle = 0; istyle <= STYLE_MAX; istyle++) {
            if ((istyle > STYLE_DEFAULT) && (istyle <= STYLE_LASTPREDEFINED))
                continue;
            if (styleIsUsed[istyle]) {
                //char key[200];
                //sprintf(key, "style.*.%0d", istyle);
                //char *valdef = StringDup(props.GetExpanded(key).c_str());
                //sprintf(key, "style.%s.%0d", language.c_str(), istyle);
                //char *val = StringDup(props.GetExpanded(key).c_str());

                StyleDefinition sd(m_steStyles, SciToSTEStyle(istyle));
                //sd.ParseStyleDefinition(val);

                if (sd.specified != StyleDefinition::sdNone) {
                    if (istyle == STYLE_DEFAULT) {
                        fprintf(fp, "span {\n");
                    } else {
                        fprintf(fp, ".S%0d {\n", istyle);
                    }
                    if (sd.italics) {
                        fprintf(fp, "\tfont-style: italic;\n");
                    }
                    if (sd.bold) {
                        fprintf(fp, "\tfont-weight: bold;\n");
                    }
                    if (wysiwyg && sd.font.length()) {
                        fprintf(fp, "\tfont-family: '%s';\n", sd.font.c_str());
                    }
                    if (sd.fore.length()) {
                        fprintf(fp, "\tcolor: %s;\n", sd.fore.c_str());
                    } else if (istyle == STYLE_DEFAULT) {
                        fprintf(fp, "\tcolor: #000000;\n");
                    }
                    if (sd.back.length()) {
						if (istyle != STYLE_DEFAULT && bgColour != sd.back) {
							fprintf(fp, "\tbackground: %s;\n", sd.back.c_str());
							fprintf(fp, "\ttext-decoration: inherit;\n");
						}
					}
                    if (wysiwyg && sd.size) {
                        fprintf(fp, "\tfont-size: %0dpt;\n", sd.size);
                    }
                    fprintf(fp, "}\n");
                } else {
                    styleIsUsed[istyle] = false;    // No definition, it uses default style (32)
                }

                //if (val) {
                //  delete []val;
                //}
                //if (valdef) {
                //  delete []valdef;
                //}
            }
        }
        fputs("</style>\n", fp);
        fputs("</head>\n", fp);
        if (bgColour.length() > 0)
            fprintf(fp, "<body bgcolor=\"%s\">\n", bgColour.c_str());
        else
            fputs("<body>\n", fp);

        int line = m_editor->LineFromPosition(0); // acc.GetLine(0);
        int level = (m_editor->GetFoldLevel(line) & SC_FOLDLEVELNUMBERMASK) - SC_FOLDLEVELBASE;
        int newLevel;
        int styleCurrent = m_editor->GetStyleAt(0);
        bool inStyleSpan = false;
        bool inFoldSpan = false;
        // Global span for default attributes
        if (wysiwyg) {
            fputs("<span>", fp);
        } else {
            fputs("<pre>", fp);
        }

        if (folding) {
            int lvl = m_editor->GetFoldLevel(0);
            level = (lvl & SC_FOLDLEVELNUMBERMASK) - SC_FOLDLEVELBASE;

			if (lvl & SC_FOLDLEVELHEADERFLAG) {
				fprintf(fp, "<span id=\"hd%d\" onclick=\"toggle('%d')\">", line, line + 1);
				fprintf(fp, "<span id=\"bt%d\">- </span>", line);
				inFoldSpan = true;
			} else {
				fputs("&nbsp; ", fp);
			}
        }

        if (styleIsUsed[styleCurrent]) {
            fprintf(fp, "<span class=\"S%0d\">", styleCurrent);
            inStyleSpan = true;
        }
        // Else, this style has no definition (beside default one):
        // no span for it, except the global one

        int column = 0;
        for (int i = 0; i < lengthDoc; i++) {
            char ch = (char)m_editor->GetCharAt(i); // acc[i];
            int style = m_editor->GetStyleAt(i);

            if (style != styleCurrent) {
                if (inStyleSpan) {
                    fputs("</span>", fp);
                    inStyleSpan = false;
                }
                if (ch != '\r' && ch != '\n') { // No need of a span for the EOL
                    if (styleIsUsed[style]) {
                        fprintf(fp, "<span class=\"S%0d\">", style);
                        inStyleSpan = true;
                    }
                    styleCurrent = style;
                }
            }
            if (ch == ' ') {
                if (wysiwyg) {
                    char prevCh = '\0';
                    if (column == 0) {  // At start of line, must put a &nbsp; because regular space will be collapsed
                        prevCh = ' ';
                    }
                    while (i < lengthDoc && (char)m_editor->GetCharAt(i) == ' ') { //acc[i] == ' ') {
                        if (prevCh != ' ') {
                            fputc(' ', fp);
                        } else {
                            fputs("&nbsp;", fp);
                        }
                        prevCh = (char)m_editor->GetCharAt(i); //acc[i];
                        i++;
                        column++;
                    }
                    i--; // the last incrementation will be done by the for loop
                } else {
                    fputc(' ', fp);
                    column++;
                }
            } else if (ch == '\t') {
                int ts = tabSize - (column % tabSize);
                if (wysiwyg) {
                    for (int itab = 0; itab < ts; itab++) {
                        if (itab % 2) {
                            fputc(' ', fp);
                        } else {
                            fputs("&nbsp;", fp);
                        }
                    }
                    column += ts;
                } else {
                    if (tabs) {
                        fputc(ch, fp);
                        column++;
                    } else {
                        for (int itab = 0; itab < ts; itab++) {
                            fputc(' ', fp);
                        }
                        column += ts;
                    }
                }
            } else if (ch == '\r' || ch == '\n') {
                if (inStyleSpan) {
                    fputs("</span>", fp);
                    inStyleSpan = false;
                }
				if (inFoldSpan) {
					fputs("</span>", fp);
					inFoldSpan = false;
				}
                if (ch == '\r' && (char)m_editor->GetCharAt(i + 1) == '\n') {
                    i++;    // CR+LF line ending, skip the "extra" EOL char
                }
                column = 0;
                if (wysiwyg) {
                    fputs("<br />", fp);
                }

                styleCurrent = m_editor->GetStyleAt(i + 1);
                if (folding) {
                    line = m_editor->LineFromPosition(i + 1);

                    int lvl = m_editor->GetFoldLevel(line);
                    newLevel = (lvl & SC_FOLDLEVELNUMBERMASK) - SC_FOLDLEVELBASE;

                    if (newLevel < level)
                        fprintf(fp, "</span>");
                    fputc('\n', fp); // here to get clean code
                    if (newLevel > level)
                        fprintf(fp, "<span id=\"ln%d\">", line);

					if (lvl & SC_FOLDLEVELHEADERFLAG) {
						fprintf(fp, "<span id=\"hd%d\" onclick=\"toggle('%d')\">", line, line + 1);
						fprintf(fp, "<span id=\"bt%d\">- </span>", line);
						inFoldSpan = true;
					} else
                        fputs("&nbsp; ", fp);
                    level = newLevel;
                } else {
                    fputc('\n', fp);
                }

                if (styleIsUsed[styleCurrent] && (char)m_editor->GetCharAt(i + 1) != '\r' && (char)m_editor->GetCharAt(i + 1) != '\n') {
                    // We know it's the correct next style,
                    // but no (empty) span for an empty line
                    fprintf(fp, "<span class=\"S%0d\">", styleCurrent);
                    inStyleSpan = true;
                }
            } else {
                switch (ch) {
                case '<':
                    fputs("&lt;", fp);
                    break;
                case '>':
                    fputs("&gt;", fp);
                    break;
                case '&':
                    fputs("&amp;", fp);
                    break;
                default:
                    fputc(ch, fp);
                }
                column++;
            }
        }

        if (inStyleSpan) {
            fputs("</span>", fp);
        }

        if (folding) {
            while (level > 0) {
                fprintf(fp, "</span>");
                level--;
            }
        }

        if (!wysiwyg) {
            fputs("</pre>", fp);
        } else {
            fputs("</span>", fp);
        }

        fputs("\n</body>\n</html>\n", fp);
        fclose(fp);
    } else {
        return false;
        //FIXME SString msg = LocaliseMessage(
        //                  "Could not save file \"^0\".", filePath.AsFileSystem());
        //WindowMessageBox(wSciTE, msg, MB_OK | MB_ICONWARNING);
    }
    return true;
}


//---------- Save to PDF ----------

/*
    PDF Exporter. Status: Beta
    Contributed by Ahmad M. Zawawi <zeus_go64@hotmail.com>
    Modifications by Darren Schroeder Feb 22, 2003; Philippe Lhoste 2003-10
    Overhauled by Kein-Hong Man 2003-11

    This exporter is meant to be small and simple; users are expected to
    use other methods for heavy-duty formatting. PDF elements marked with
    "PDF1.4Ref" states where in the PDF 1.4 Reference Spec (the PDF file of
    which is freely available from Adobe) the particular element can be found.

    Possible TODOs that will probably not be implemented: full styling,
    optimization, font substitution, compression, character set encoding.
*/
#define PDF_TAB_DEFAULT     8
#define PDF_FONT_DEFAULT    1   // Helvetica
#define PDF_FONTSIZE_DEFAULT    10
#define PDF_SPACING_DEFAULT 1.2
#define PDF_HEIGHT_DEFAULT  792 // Letter
#define PDF_WIDTH_DEFAULT   612
#define PDF_MARGIN_DEFAULT  72  // 1.0"
#define PDF_ENCODING        "WinAnsiEncoding"

struct PDFStyle {
    char fore[24];
    int font;
};

static const char *PDFfontNames[] = {
    "Courier", "Courier-Bold", "Courier-Oblique", "Courier-BoldOblique",
    "Helvetica", "Helvetica-Bold", "Helvetica-Oblique", "Helvetica-BoldOblique",
    "Times-Roman", "Times-Bold", "Times-Italic", "Times-BoldItalic"
};

// ascender, descender aligns font origin point with page
static short PDFfontAscenders[] =  { 629, 718, 699 };
static short PDFfontDescenders[] = { 157, 207, 217 };
static short PDFfontWidths[] =     { 600,   0,   0 };

inline void getPDFRGB(char* pdfcolour, const char* stylecolour) {
    // grab colour components (max string length produced = 18)
    for (int i = 1; i < 6; i += 2) {
        char val[20];
        // 3 decimal places for enough dynamic range
        int c = (IntFromHexByte(stylecolour + i) * 1000 + 127) / 255;
        if (c == 0 || c == 1000) {  // optimise
            sprintf(val, "%d ", c / 1000);
        } else {
            sprintf(val, "0.%03d ", c);
        }
        strcat(pdfcolour, val);
    }
}

bool wxSTEditorExporter::SaveToPDF(const wxString& saveName) {
    wxCHECK_MSG(m_editor, false, wxT("Invalid editor"));
    wxBusyCursor busy;

    // This class conveniently handles the tracking of PDF objects
    // so that the cross-reference table can be built (PDF1.4Ref(p39))
    // All writes to fp passes through a PDFObjectTracker object.
    class PDFObjectTracker {
    private:
        FILE *fp;
        int *offsetList, tableSize;
    public:
        int index;
        PDFObjectTracker(FILE *fp_) {
            fp = fp_;
            tableSize = 100;
            offsetList = new int[tableSize];
            index = 1;
        }
        ~PDFObjectTracker() {
            delete []offsetList;
        }
        void write(const char *objectData) {
            unsigned int length = strlen(objectData);
            // note binary write used, open with "wb"
            fwrite(objectData, sizeof(char), length, fp);
        }
        void write(int objectData) {
            char val[20];
            sprintf(val, "%d", objectData);
            write(val);
        }
        // returns object number assigned to the supplied data
        int add(const char *objectData) {
            // resize xref offset table if too small
            if (index > tableSize) {
                int newSize = tableSize * 2;
                int *newList = new int[newSize];
                for (int i = 0; i < tableSize; i++) {
                    newList[i] = offsetList[i];
                }
                delete []offsetList;
                offsetList = newList;
                tableSize = newSize;
            }
            // save offset, then format and write object
            offsetList[index - 1] = ftell(fp);
            write(index);
            write(" 0 obj\n");
            write(objectData);
            write("endobj\n");
            return index++;
        }
        // builds xref table, returns file offset of xref table
        int xref() {
            char val[32];
            // xref start index and number of entries
            int xrefStart = ftell(fp);
            write("xref\n0 ");
            write(index);
            // a xref entry *must* be 20 bytes long (PDF1.4Ref(p64))
            // so extra space added; also the first entry is special
            write("\n0000000000 65535 f \n");
            for (int i = 0; i < index - 1; i++) {
                sprintf(val, "%010d 00000 n \n", offsetList[i]);
                write(val);
            }
            return xrefStart;
        }
    };

    // Object to manage line and page rendering. Apart from startPDF, endPDF
    // everything goes in via add() and nextLine() so that line formatting
    // and pagination can be done properly.
    class PDFRender {
    private:
        bool pageStarted;
        bool firstLine;
        int pageCount;
        int pageContentStart;
        double xPos, yPos;  // position tracking for line wrapping
        SString pageData;   // holds PDF stream contents
        SString segment;    // character data
        char *segStyle;     // style of segment
        bool justWhiteSpace;
        int styleCurrent, stylePrev;
        double leading;
        char *buffer;
    public:
        PDFObjectTracker *oT;
        PDFStyle *style;
        int fontSize;       // properties supplied by user
        int fontSet;
        int pageWidth, pageHeight;
        PRRectangle pageMargin;  // see PRRectangle above for compatibility w/ Scintilla's PRectangle
        //
        PDFRender() {
            pageStarted = false;
            pageCount = 0;
            style = NULL;
            buffer = new char[250];
            segStyle = new char[100];
        }
        ~PDFRender() {
            if (style) { delete []style; }
            delete []buffer;
            delete []segStyle;
        }
        //
        double fontToPoints(int thousandths) {
            return (double)fontSize * thousandths / 1000.0;
        }
        void setStyle(char *buff, int style_) {
            int styleNext = style_;
            if (style_ == -1) { styleNext = styleCurrent; }
            *buff = '\0';
            if (styleNext != styleCurrent || style_ == -1) {
                if (style[styleCurrent].font != style[styleNext].font
                    || style_ == -1) {
                    sprintf(buff, "/F%d %d Tf ",
                        style[styleNext].font + 1, fontSize);
                }
                if (strcmp(style[styleCurrent].fore, style[styleNext].fore) != 0
                    || style_ == -1) {
                    strcat(buff, style[styleNext].fore);
                    strcat(buff, "rg ");
                }
            }
        }
        //
        void startPDF() {
            if (fontSize <= 0) {
                fontSize = PDF_FONTSIZE_DEFAULT;
            }
            // leading is the term for distance between lines
            leading = fontSize * PDF_SPACING_DEFAULT;
            // sanity check for page size and margins
            int pageWidthMin = (int)leading + pageMargin.left + pageMargin.right;
            if (pageWidth < pageWidthMin) {
                pageWidth = pageWidthMin;
            }
            int pageHeightMin = (int)leading + pageMargin.top + pageMargin.bottom;
            if (pageHeight < pageHeightMin) {
                pageHeight = pageHeightMin;
            }
            // start to write PDF file here (PDF1.4Ref(p63))
            // ASCII>127 characters to indicate binary-possible stream
            oT->write("%PDF-1.3\n%ȬϢ\n");
            styleCurrent = STYLE_DEFAULT;

            // build objects for font resources; note that font objects are
            // *expected* to start from index 1 since they are the first objects
            // to be inserted (PDF1.4Ref(p317))
            for (int i = 0; i < 4; i++) {
                sprintf(buffer, "<</Type/Font/Subtype/Type1"
                        "/Name/F%d/BaseFont/%s/Encoding/"
                        PDF_ENCODING
                        ">>\n", i + 1,
                        PDFfontNames[fontSet * 4 + i]);
                oT->add(buffer);
            }
            pageContentStart = oT->index;
        }
        void endPDF() {
            if (pageStarted) {  // flush buffers
                endPage();
            }
            // refer to all used or unused fonts for simplicity
            int resourceRef = oT->add(
                "<</ProcSet[/PDF/Text]\n"
                "/Font<</F1 1 0 R/F2 2 0 R/F3 3 0 R"
                "/F4 4 0 R>> >>\n");
            // create all the page objects (PDF1.4Ref(p88))
            // forward reference pages object; calculate its object number
            int pageObjectStart = oT->index;
            int pagesRef = pageObjectStart + pageCount;
            for (int i = 0; i < pageCount; i++) {
                sprintf(buffer, "<</Type/Page/Parent %d 0 R\n"
                        "/MediaBox[ 0 0 %d %d"
                        "]\n/Contents %d 0 R\n"
                        "/Resources %d 0 R\n>>\n",
                        pagesRef, pageWidth, pageHeight,
                        pageContentStart + i, resourceRef);
                oT->add(buffer);
            }
            // create page tree object (PDF1.4Ref(p86))
            pageData = "<</Type/Pages/Kids[\n";
            for (int j = 0; j < pageCount; j++) {
                sprintf(buffer, "%d 0 R\n", pageObjectStart + j);
                pageData += buffer;
            }
            sprintf(buffer, "]/Count %d\n>>\n", pageCount);
            pageData += buffer;
            oT->add(pageData.c_str());
            // create catalog object (PDF1.4Ref(p83))
            sprintf(buffer, "<</Type/Catalog/Pages %d 0 R >>\n", pagesRef);
            int catalogRef = oT->add(buffer);
            // append the cross reference table (PDF1.4Ref(p64))
            int xref = oT->xref();
            // end the file with the trailer (PDF1.4Ref(p67))
            sprintf(buffer, "trailer\n<< /Size %d /Root %d 0 R\n>>"
                    "\nstartxref\n%d\n%%%%EOF\n",
                    oT->index, catalogRef, xref);
            oT->write(buffer);
        }
        void add(char ch, int style_) {
            if (!pageStarted) {
                startPage();
            }
            // get glyph width (TODO future non-monospace handling)
            double glyphWidth = fontToPoints(PDFfontWidths[fontSet]);
            xPos += glyphWidth;
            // if cannot fit into a line, flush, wrap to next line
            if (xPos > pageWidth - pageMargin.right) {
                nextLine();
                xPos += glyphWidth;
            }
            // if different style, then change to style
            if (style_ != styleCurrent) {
                flushSegment();
                // output code (if needed) for new style
                setStyle(segStyle, style_);
                stylePrev = styleCurrent;
                styleCurrent = style_;
            }
            // escape these characters
            if (ch == ')' || ch == '(' || ch == '\\') {
                segment += '\\';
            }
            if (ch != ' ') { justWhiteSpace = false; }
            segment += ch;  // add to segment data
        }
        void flushSegment() {
            if (segment.length() > 0) {
                if (justWhiteSpace) {   // optimise
                    styleCurrent = stylePrev;
                } else {
                    pageData += segStyle;
                }
                pageData += "(";
                pageData += segment;
                pageData += ")Tj\n";
            }
            segment.erase(); //clear(); MSVC6 doesn't have clear in their std::string
            *segStyle = '\0';
            justWhiteSpace = true;
        }
        void startPage() {
            pageStarted = true;
            firstLine = true;
            pageCount++;
            double fontAscender = fontToPoints(PDFfontAscenders[fontSet]);
            yPos = pageHeight - pageMargin.top - fontAscender;
            // start a new page
            sprintf(buffer, "BT 1 0 0 1 %d %d Tm\n",
                pageMargin.left, (int)yPos);
            // force setting of initial font, colour
            setStyle(segStyle, -1);
            strcat(buffer, segStyle);
            pageData = buffer;
            xPos = pageMargin.left;
            segment.erase(); //clear(); MSVC6 doesn't have clear in their std::string
            flushSegment();
        }
        void endPage() {
            pageStarted = false;
            flushSegment();
            // build actual text object; +3 is for "ET\n"
            // PDF1.4Ref(p38) EOL marker preceding endstream not counted
            char *textObj = new char[pageData.length() + 100];
            // concatenate stream within the text object
            sprintf(textObj, "<</Length %d>>\nstream\n%s"
                     "ET\nendstream\n",
                     static_cast<int>(pageData.length() - 1 + 3),
                     pageData.c_str());
            oT->add(textObj);
            delete []textObj;
        }
        void nextLine() {
            if (!pageStarted) {
                startPage();
            }
            xPos = pageMargin.left;
            flushSegment();
            // PDF follows cartesian coords, subtract -> down
            yPos -= leading;
            double fontDescender = fontToPoints(PDFfontDescenders[fontSet]);
            if (yPos < pageMargin.bottom + fontDescender) {
                endPage();
                startPage();
                return;
            }
            if (firstLine) {
				// avoid breakage due to locale setting
				int f = (int)(leading * 10 + 0.5);
				sprintf(buffer, "0 -%d.%d TD\n", f / 10, f % 10);
                firstLine = false;
            } else {
                sprintf(buffer, "T*\n");
            }
            pageData += buffer;
        }
    };
    PDFRender pr;

    //RemoveFindMarks();
    m_editor->Colourise(0, -1); //SendEditor(SCI_COLOURISE, 0, -1);
    // read exporter flags
    int tabSize = m_editor->GetTabWidth(); //props.GetInt("tabsize", PDF_TAB_DEFAULT);
    if (tabSize < 0) {
        tabSize = PDF_TAB_DEFAULT;
    }
    // read magnification value to add to default screen font size
    pr.fontSize = 0; // FIXME props.GetInt("export.pdf.magnification");
    // set font family according to face name
    SString propItem = ""; // FIXME props.GetExpanded("export.pdf.font");
    pr.fontSet = PDF_FONT_DEFAULT;
    if (propItem.length()) {
        if (propItem == "Courier")
            pr.fontSet = 0;
        else if (propItem == "Helvetica")
            pr.fontSet = 1;
        else if (propItem == "Times")
            pr.fontSet = 2;
    }
    // page size: width, height
    propItem = "595,842"; // FIXME props.GetExpanded("export.pdf.pagesize");
    char *buffer = new char[200];
    //char *ps = StringDup(propItem.c_str());
    //const char *next = GetNextPropItem(ps, buffer, 32);
    if (0 >= (pr.pageWidth = 595)) {
        pr.pageWidth = PDF_WIDTH_DEFAULT;
    }
    //next = GetNextPropItem(next, buffer, 32);
    if (0 >= (pr.pageHeight = 842)) {
        pr.pageHeight = PDF_HEIGHT_DEFAULT;
    }
    //delete []ps;
    // page margins: left, right, top, bottom
    //propItem = props.GetExpanded("export.pdf.margins");
    //ps = StringDup(propItem.c_str());
    //next = GetNextPropItem(ps, buffer, 32);
    if (0 >= (pr.pageMargin.left = 72)) {
        pr.pageMargin.left = PDF_MARGIN_DEFAULT;
    }
    //next = GetNextPropItem(next, buffer, 32);
    if (0 >= (pr.pageMargin.right = 72)) {
        pr.pageMargin.right = PDF_MARGIN_DEFAULT;
    }
    //next = GetNextPropItem(next, buffer, 32);
    if (0 >= (pr.pageMargin.top = 72)) {
        pr.pageMargin.top = PDF_MARGIN_DEFAULT;
    }
    //GetNextPropItem(next, buffer, 32);
    if (0 >= (pr.pageMargin.bottom = 72)) {
        pr.pageMargin.bottom = PDF_MARGIN_DEFAULT;
    }
    //delete []ps;

    // collect all styles available for that 'language'
    // or the default style if no language is available...
    pr.style = new PDFStyle[STYLE_MAX + 1];
    for (int i = 0; i <= STYLE_MAX; i++) {  // get keys
        pr.style[i].font = 0;
        pr.style[i].fore[0] = '\0';

        //sprintf(buffer, "style.*.%0d", i);
        //char *valdef = StringDup(props.GetExpanded(buffer).c_str());
        //sprintf(buffer, "style.%s.%0d", language.c_str(), i);
        //char *val = StringDup(props.GetExpanded(buffer).c_str());

        StyleDefinition sd(m_steStyles, SciToSTEStyle(i));
        //sd.ParseStyleDefinition(val);

        if (sd.specified != StyleDefinition::sdNone) {
            if (sd.italics) { pr.style[i].font |= 2; }
            if (sd.bold) { pr.style[i].font |= 1; }
            if (sd.fore.length()) {
                getPDFRGB(pr.style[i].fore, sd.fore.c_str());
            } else if (i == STYLE_DEFAULT) {
                strcpy(pr.style[i].fore, "0 0 0 ");
            }
            // grab font size from default style
            if (i == STYLE_DEFAULT) {
                if (sd.size > 0)
                    pr.fontSize += sd.size;
                else
                    pr.fontSize = PDF_FONTSIZE_DEFAULT;
            }
        }
        //if (val) delete []val;
        //if (valdef) delete []valdef;
    }
    // patch in default foregrounds
    for (int j = 0; j <= STYLE_MAX; j++) {
        if (pr.style[j].fore[0] == '\0') {
            strcpy(pr.style[j].fore, pr.style[STYLE_DEFAULT].fore);
        }
    }
    delete []buffer;

    FILE *fp = fopen(wx2stc(saveName), "wb");
    if (!fp) {
        // couldn't open the file for saving, issue an error message
        //FIXME SString msg = LocaliseMessage("Could not save file '^0'.", filePath.AsFileSystem());
        //WindowMessageBox(wSciTE, msg, MB_OK | MB_ICONWARNING);
        return false;
    }
    // initialise PDF rendering
    PDFObjectTracker ot(fp);
    pr.oT = &ot;
    pr.startPDF();

    // do here all the writing
    int lengthDoc = m_editor->GetLength(); //LengthDocument();
    //WindowAccessor acc(wEditor.GetID(), props);
    int lineIndex = 0;

    if (!lengthDoc) {   // enable zero length docs
        pr.nextLine();
    } else {
        for (int i = 0; i < lengthDoc; i++) {
            char ch = (char)m_editor->GetCharAt(i); //acc[i];
            int style = m_editor->GetStyleAt(i);

            if (ch == '\t') {
                // expand tabs
                int ts = tabSize - (lineIndex % tabSize);
                lineIndex += ts;
                for (; ts; ts--) {  // add ts count of spaces
                    pr.add(' ', style); // add spaces
                }
            } else if (ch == '\r' || ch == '\n') {
                if (ch == '\r' && (char)m_editor->GetCharAt(i + 1) == '\n') {
                    i++;
                }
                // close and begin a newline...
                    pr.nextLine();
                    lineIndex = 0;
            } else {
                // write the character normally...
                    pr.add(ch, style);
                    lineIndex++;
            }
        }
    }
    // write required stuff and close the PDF file
    pr.endPDF();
    fclose(fp);
    return true;
}


//---------- Save to TeX ----------

static char* getTexRGB(char* texcolor, const char* stylecolor) {
	//texcolor[rgb]{0,0.5,0}{....}
	float rf = IntFromHexByte(stylecolor + 1) / 256.0;
	float gf = IntFromHexByte(stylecolor + 3) / 256.0;
	float bf = IntFromHexByte(stylecolor + 5) / 256.0;
	// avoid breakage due to locale setting
	int r = (int)(rf * 10 + 0.5);
	int g = (int)(gf * 10 + 0.5);
	int b = (int)(bf * 10 + 0.5);
	sprintf(texcolor, "%d.%d, %d.%d, %d.%d", r / 10, r % 10, g / 10, g % 10, b / 10, b % 10);
	return texcolor;
}

#define CHARZ ('z' - 'b')
static char* texStyle(int style) {
    static char buf[10];
    int i = 0;
    do {
        buf[i++] = static_cast<char>('a' + (style % CHARZ));
        style /= CHARZ;
    } while ( style > 0 );
    buf[i] = 0;
    return buf;
}

static void defineTexStyle(StyleDefinition &style, FILE* fp, int istyle) {
    int closing_brackets = 2;
    char rgb[200];
    fprintf(fp, "\newcommand{\\scite%s}[1]{\noindent{\\ttfamily{", texStyle(istyle));
    if (style.italics) {
        fputs("\\textit{", fp);
        closing_brackets++;
    }
    if (style.bold) {
        fputs("\\textbf{", fp);
        closing_brackets++;
    }
    if (style.fore.length()) {
        fprintf(fp, "\\textcolor[rgb]{%s}{", getTexRGB(rgb, style.fore.c_str()) );
        closing_brackets++;
    }
    if (style.back.length()) {
        fprintf(fp, "\\colorbox[rgb]{%s}{", getTexRGB( rgb, style.back.c_str()) );
        closing_brackets++;
    }
    fputs("#1", fp);
    for (int i = 0; i <= closing_brackets; i++) {
        fputc( '}', fp );
    }
    fputc('\n', fp);
}

bool wxSTEditorExporter::SaveToTEX(const wxString& saveName) {
    wxCHECK_MSG(m_editor, false, wxT("Invalid editor"));
    wxBusyCursor busy;

    //RemoveFindMarks();
    m_editor->Colourise(0, -1);             //SendEditor(SCI_COLOURISE, 0, -1);
    int tabSize = m_editor->GetTabWidth();  //props.GetInt("tabsize");
    if (tabSize == 0)
        tabSize = 4;

    //char key[200];
    int lengthDoc = m_editor->GetLength();  //LengthDocument();
    //WindowAccessor acc(wEditor.GetID(), props);
    bool styleIsUsed[STYLE_MAX + 1];

    int titleFullPath = 0;                  //props.GetInt("export.tex.title.fullpath", 0);

    int i;
    for (i = 0; i <= STYLE_MAX; i++) {
        styleIsUsed[i] = false;
    }
    for (i = 0; i < lengthDoc; i++) {   // check the used styles
        styleIsUsed[m_editor->GetStyleAt(i) & 0X7f] = true;
    }
    styleIsUsed[STYLE_DEFAULT] = true;

    FILE *fp = fopen(wx2stc(saveName), "wt");
    if (fp) {
        fputs("\\documentclass[a4paper]{article}\n"
              "\\usepackage[a4paper,margin=2cm]{geometry}\n"
              "\\usepackage[T1]{fontenc}\n"
              "\\usepackage{color}\n"
              "\\usepackage{alltt}\n"
              "\\usepackage{times}\n", fp);

        for (i = 0; i < STYLE_MAX; i++) {      // get keys
            if (styleIsUsed[i]) {
                //sprintf(key, "style.*.%0d", i);
                //char *valdef = StringDup(props.GetExpanded(key).c_str());
                //sprintf(key, "style.%s.%0d", language.c_str(), i);
                //char *val = StringDup(props.GetExpanded(key).c_str());

                StyleDefinition sd(m_steStyles, SciToSTEStyle(i)); //check default properties
                //sd.ParseStyleDefinition(val); //check language properties

                if (sd.specified != StyleDefinition::sdNone) {
                    defineTexStyle(sd, fp, i); // writeout style macroses
                } // Else we should use STYLE_DEFAULT
                //if (val)
                //  delete []val;
                //if (valdef)
                //  delete []valdef;
            }
        }

        fputs("\\begin{document}\n\n", fp);
        fprintf(fp, "Source File: %s\n\n\noindent\n\\tiny{\n",
            static_cast<const char *>(wx2stc(saveName))); //FIXME titleFullPath ? filePath.AsFileSystem() : filePath.Name().AsFileSystem()));

        int styleCurrent = m_editor->GetStyleAt(0);

        fprintf(fp, "\\scite%s{", texStyle(styleCurrent));

        int lineIdx = 0;

        for (i = 0; i < lengthDoc; i++) { //here process each character of the document
            char ch = (char)m_editor->GetCharAt(i); //acc[i];
            int style = m_editor->GetStyleAt(i);

            if (style != styleCurrent) { //new style?
                fprintf(fp, "}\n\\scite%s{", texStyle(style) );
                styleCurrent = style;
            }

            switch ( ch ) { //write out current character.
            case '\t': {
                    int ts = tabSize - (lineIdx % tabSize);
                    lineIdx += ts - 1;
                    fprintf(fp, "\\hspace*{%dem}", ts);
                    break;
                }
            case '\\':
                fputs("{\\textbackslash}", fp);
                break;
            case '>':
            case '<':
            case '@':
                fprintf(fp, "$%c$", ch);
                break;
            case '{':
            case '}':
            case '^':
            case '_':
            case '&':
            case '$':
            case '#':
            case '%':
            case '~':
                fprintf(fp, "\\%c", ch);
                break;
            case '\r':
            case '\n':
                lineIdx = -1;   // Because incremented below
                if (ch == '\r' && (char)m_editor->GetCharAt(i + 1) == '\n')
                    i++;    // Skip the LF
                styleCurrent = m_editor->GetStyleAt(i + 1);
                fprintf(fp, "} \\\\n\\scite%s{", texStyle(styleCurrent) );
                break;
            case ' ':
                if ((char)m_editor->GetCharAt(i + 1) == ' ') {
                    fputs("{\\hspace*{1em}}", fp);
                } else {
                    fputc(' ', fp);
                }
                break;
            default:
                fputc(ch, fp);
            }
            lineIdx++;
        }
        fputs("}\n} %end tiny\n\n\\end{document}\n", fp); //close last empty style macros and document too
        fclose(fp);
    } else {
        return false;
        //FIXME SString msg = LocaliseMessage(
        //                  "Could not save file \"^0\".", filePath.AsFileSystem());
        //WindowMessageBox(wSciTE, msg, MB_OK | MB_ICONWARNING);
    }
    return true;
}


//---------- Save to XML ----------

bool wxSTEditorExporter::SaveToXML(const wxString& saveName) {
    wxCHECK_MSG(m_editor, false, wxT("Invalid editor"));
    wxBusyCursor busy;

    // Author: Hans Hagen / PRAGMA ADE / www.pragma-ade.com
    // Version: 1.0 / august 18, 2003
    // Remark: for a suitable style, see ConTeXt (future) distributions

    // The idea is that one can use whole files, or ranges of lines in manuals
    // and alike. Since ConTeXt can handle XML files, it's quite convenient to
    // use this format instead of raw TeX, although the output would not look
    // much different in structure.

    // We don't put style definitions in here since the main document will in
    // most cases determine the look and feel. This way we have full control over
    // the layout. The type attribute will hold the current lexer value.

    // <document>            : the whole thing
    // <data>                : reserved for metadata
    // <text>                : the main bodyof text
    // <line n-'number'>     : a line of text

    // <t n='number'>...<t/> : tag
    // <s n='number'/>       : space
    // <g/>                  : >
    // <l/>                  : <
    // <a/>                  : &
    // <h/>                  : #

    // We don't use entities, but empty elements for special characters
    // but will eventually use utf-8 (once i know how to get them out).

    //RemoveFindMarks();
    m_editor->Colourise(0, -1);             //SendEditor(SCI_COLOURISE, 0, -1) ;

    int tabSize = m_editor->GetTabWidth();  //props.GetInt("tabsize") ;
    if (tabSize == 0) {
        tabSize = 4 ;
    }

    int lengthDoc = m_editor->GetLength();  //LengthDocument() ;

    //WindowAccessor acc(wEditor.GetID(), props) ;

    FILE *fp = fopen(wx2stc(saveName), "wt");

    if (fp) {

        bool collapseSpaces = 1; //(props.GetInt("export.xml.collapse.spaces", 1) == 1) ;
        bool collapseLines  = 1; //(props.GetInt("export.xml.collapse.lines", 1) == 1) ;

        fputs("<?xml version='1.0' encoding='ascii'?>\n", fp) ;

        fputs("<document xmlns='http://www.scintila.org/scite.rng'", fp) ;
        fprintf(fp, " filename='%s'",
            static_cast<const char *>(wx2stc(saveName))); //FIXME filePath.Name().AsFileSystem())) ;
        fprintf(fp, " type='%s'", "unknown") ;
        fprintf(fp, " version='%s'", "1.0") ;
        fputs(">\n", fp) ;

        fputs("<data comment='This element is reserved for future usage.'/>\n", fp) ;

        fputs("<text>\n", fp) ;

        int styleCurrent = -1 ; // acc.StyleAt(0) ;
        int lineNumber = 1 ;
        int lineIndex = 0 ;
        bool styleDone = false ;
        bool lineDone = false ;
        bool charDone = false ;
        int styleNew = -1 ;
        int spaceLen = 0 ;
        int emptyLines = 0 ;

        for (int i = 0; i < lengthDoc; i++) {
            char ch = (char)m_editor->GetCharAt(i); //acc[i] ;
            int style = m_editor->GetStyleAt(i) ;
            if (style != styleCurrent) {
                styleCurrent = style ;
                styleNew = style ;
            }
            if (ch == ' ') {
                spaceLen++ ;
            } else if (ch == '\t') {
                int ts = tabSize - (lineIndex % tabSize) ;
                lineIndex += ts - 1 ;
                spaceLen += ts ;
            } else if (ch == '\f') {
                // ignore this animal
            } else if (ch == '\r' || ch == '\n') {
                if (ch == '\r' && (char)m_editor->GetCharAt(i + 1) == '\n') {
                    i++;
                }
                if (styleDone) {
                    fputs("</t>", fp) ;
                    styleDone = false ;
                }
                lineIndex = -1 ;
                if (lineDone) {
                    fputs("</line>\n", fp) ;
                    lineDone = false ;
                } else if (collapseLines) {
                    emptyLines++ ;
                } else {
                    fprintf(fp, "<line n='%d'/>\n", lineNumber) ;
                }
                charDone = false ;
                lineNumber++ ;
                styleCurrent = -1 ; // acc.StyleAt(i + 1) ;
            } else {
                if (collapseLines && (emptyLines > 0)) {
                    fputs("<line/>\n", fp) ;
                }
                emptyLines = 0 ;
                if (! lineDone) {
                    fprintf(fp, "<line n='%d'>", lineNumber) ;
                    lineDone = true ;
                }
                if (styleNew >= 0) {
                    if (styleDone) { fputs("</t>", fp) ; }
                }
                if (! collapseSpaces) {
                    while (spaceLen > 0) {
                        fputs("<s/>", fp) ;
                        spaceLen-- ;
                    }
                } else if (spaceLen == 1) {
                    fputs("<s/>", fp) ;
                    spaceLen = 0 ;
                } else if (spaceLen > 1) {
                    fprintf(fp, "<s n='%d'/>", spaceLen) ;
                    spaceLen = 0 ;
                }
                if (styleNew >= 0) {
                    fprintf(fp, "<t n='%d'>", style) ;
                    styleNew = -1 ;
                    styleDone = true ;
                }
                switch (ch) {
                case '>' :
                    fputs("<g/>", fp) ;
                    break ;
                case '<' :
                    fputs("<l/>", fp) ;
                    break ;
                case '&' :
                    fputs("<a/>", fp) ;
                    break ;
                case '#' :
                    fputs("<h/>", fp) ;
                    break ;
                default  :
                    fputc(ch, fp) ;
                }
                charDone = true ;
            }
            lineIndex++ ;
        }
        if (styleDone) {
            fputs("</t>", fp) ;
        }
        if (lineDone) {
            fputs("</line>\n", fp) ;
        }
        if (charDone) {
            // no last empty line: fprintf(fp, "<line n='%d'/>", lineNumber) ;
        }

        fputs("</text>\n", fp) ;
        fputs("</document>\n", fp) ;

        fclose(fp) ;
    } else {
        return false;
        //FIXME SString msg = LocaliseMessage("Could not save file \"^0\".", filePath.AsFileSystem()) ;
        //WindowMessageBox(wSciTE, msg, MB_OK | MB_ICONWARNING) ;
    }
    return true;
}

bool wxSTEditorExporter::SaveToHTML(const wxString& saveName) {
    wxCHECK_MSG(m_editor, false, wxT("Invalid editor"));

    FILE *fp = fopen(wx2stc(saveName), "wt");
    if (fp) {
        fputs(wx2stc(RenderAsHTML()), fp);
        fclose(fp);
    } else {
        return false;
        //FIMXE SString msg = LocaliseMessage("Could not save file '^0'.", filePath.AsFileSystem());
        //WindowMessageBox(wSciTE, msg, MB_OK | MB_ICONWARNING);
    }
    return true;
}

// helper function to switch styles
void STEExporterHTML_Font(int style_n, int old_style_n,
                          StyleDefinition* sd, wxString &htmlString)
{
    // turn off old styles if style_n < 0 or styles differ
    if  (old_style_n >= 0)
    {
        if ((style_n < 0) || (sd[old_style_n].fore != sd[style_n].fore))
            htmlString << wxT("</FONT>");

        if (sd[old_style_n].bold       && ((style_n < 0) || !sd[style_n].bold))
            htmlString << wxT("</B>");
        if (sd[old_style_n].italics    && ((style_n < 0) || !sd[style_n].italics))
            htmlString << wxT("</I>");
        if (sd[old_style_n].underlined && ((style_n < 0) || !sd[style_n].underlined))
            htmlString << wxT("</U>");
    }
    // turn on new styles, only if changed or set from invalid old style
    if (style_n >= 0)
    {
        // always set new colour
        if ((old_style_n < 0) || (sd[old_style_n].fore != sd[style_n].fore))
            htmlString += wxString::Format(wxT("<FONT COLOR = \"%s\">"), stc2wx(sd[style_n].fore.c_str()).c_str());

        if (sd[style_n].bold       && ((old_style_n < 0) || !sd[old_style_n].bold))
            htmlString << wxT("<B>");
        if (sd[style_n].italics    && ((old_style_n < 0) || !sd[old_style_n].italics))
            htmlString << wxT("<I>");
        if (sd[style_n].underlined && ((old_style_n < 0) || !sd[old_style_n].underlined))
            htmlString << wxT("<U>");
    }
}

// This modified code is from wxHatch, Copyright Chris Elliott
wxString wxSTEditorExporter::RenderAsHTML()
{
    wxCHECK_MSG(m_editor, wxEmptyString, wxT("Invalid editor"));
    wxBusyCursor busy;

    bool wysiwyg = false; // FIXME
    wxString fileName = m_editor->GetFileName();

    m_editor->Colourise(0, -1);

    StyleDefinition sd[STYLE_MAX + 1]; // index is scintilla styles

    for (int s = 0; s <= STYLE_MAX; s++)
        sd[s].Create(m_steStyles, SciToSTEStyle(s));

    const wxString sOO = wxT("00");
    const wxString s8O = wxT("80");
    const wxString sFF = wxT("FF");

    wxString htmlString(wxT("<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.0 Transitional//EN\">\n"));
    htmlString << wxT("<HTML>\n");

    // write the header
    htmlString << wxT("<HEAD>\n");
    htmlString << wxT("  <meta http-equiv=\"Content-Type\" content=\"text/html;charset=iso-8859-1\">\n");
    htmlString << wxT("  <TITLE>") + fileName + wxT("</TITLE>\n");
    htmlString << wxT("</HEAD>\n");

    // write the body
    // FIXME: could also use <PRE WIDTH=80> for 80 column line widths
    htmlString << wxT("<BODY><TT><PRE>\n");

    int style_n = 0, old_style_n = -1;  // start with invalid style
    int n, len = m_editor->GetLength();

    // read document letter by letter
    for (n = 0; n < len; n++)
    {
        style_n = m_editor->GetStyleAt(n); // | 31;
        if (style_n > STYLE_MAX) style_n = 0;  // should never happen
        if (style_n < 0        ) style_n = 0;  // should never happen

        // turn off old style attributes and set new
        if (style_n != old_style_n)
            STEExporterHTML_Font(style_n, old_style_n, sd, htmlString);

        old_style_n = style_n;

        const wxChar c = m_editor->GetCharAt(n);
        //translate < > & \n etc
        switch (c)
        {
            case wxT('\r') :
            {
                // if CRLF just skip this, it'll get added by our \n
                if ((n < len - 1) && (m_editor->GetCharAt(n+1) == wxT('\n')))
                    break;
            }
            //case wxT('\n') : htmlString << wxT("\n<BR>"); break; // not if using PRE
            case wxT('<')  : htmlString << wxT("&lt;");   break;
            case wxT('>')  : htmlString << wxT("&gt;");   break;
            case wxT('&')  : htmlString << wxT("&amp;");  break;
            case wxT(' ')  :
            {
                // allow for line breaking by making the first space in a
                //   series of spaces or a single space a regular breakable space
                if (wysiwyg || (n == 0) || (m_editor->GetCharAt(n-1) == wxT(' ')))
                    htmlString << wxT("&nbsp;");
                else
                    htmlString << c;

                break;
            }
            default :        htmlString << c;             break;
        }
    }

    // turn off last set styles (if any)
    STEExporterHTML_Font(-1, old_style_n, sd, htmlString);

    htmlString << wxT("\n</PRE></TT></BODY></HTML>");
    return htmlString;
}

//-----------------------------------------------------------------------------
// wxSTEditorExportDialog
//-----------------------------------------------------------------------------
IMPLEMENT_ABSTRACT_CLASS(wxSTEditorExportDialog, wxDialog);

wxArrayString wxSTEditorExportDialog::sm_fileNames;
int           wxSTEditorExportDialog::sm_file_format = 0;

BEGIN_EVENT_TABLE(wxSTEditorExportDialog, wxDialog)
    EVT_CHOICE     (wxID_ANY, wxSTEditorExportDialog::OnChoice)
    EVT_BUTTON     (wxID_ANY, wxSTEditorExportDialog::OnButton)
END_EVENT_TABLE()

void wxSTEditorExportDialog::Init()
{
    m_fileFormatChoice = NULL;
    m_fileNameCombo    = NULL;
}

wxSTEditorExportDialog::wxSTEditorExportDialog(wxWindow* parent,
                                               const wxString& title,
                                               long style)
                       :wxDialog()
{
    Init();
    wxDialog::Create(parent, wxID_ANY, title, wxDefaultPosition, wxDefaultSize, style);

    wxSTEditorExportSizer(this, true, true);

    m_fileFormatChoice = (wxChoice*)FindWindow(ID_STEDLG_EXPORT_FORMAT_CHOICE);
    m_fileNameCombo    = (wxComboBox*)FindWindow(ID_STEDLG_EXPORT_FILENAME_COMBO);
    m_fileNameCombo->Clear();
    wxSTEInitComboBoxStrings(sm_fileNames, m_fileNameCombo);

    m_fileFormatChoice->SetSelection(sm_file_format);

    wxBitmapButton *bmpButton = (wxBitmapButton*)FindWindow(ID_STEDLG_EXPORT_FILENAME_BITMAPBUTTON);
    bmpButton->SetBitmapLabel(STE_ARTBMP(wxART_STEDIT_OPEN));
}

wxString wxSTEditorExportDialog::GetFileName() const
{
    return m_fileNameCombo->GetValue();
}
void wxSTEditorExportDialog::SetFileName(const wxString& fileName)
{
    wxSTEPrependComboBoxString(fileName, 10, m_fileNameCombo);
    m_fileNameCombo->SetValue(fileName);
    m_fileNameCombo->SetInsertionPointEnd();
    m_fileNameCombo->SetSelection(-1, -1);   // select all
}
int wxSTEditorExportDialog::GetFileFormat() const
{
    return m_fileFormatChoice->GetSelection();
}
void wxSTEditorExportDialog::SetFileFormat(int file_format)
{
    m_fileFormatChoice->SetSelection(file_format);
}

wxString wxSTEditorExportDialog::FileNameExtChange(const wxString& fileName, int file_format) const
{
    wxFileName fName(fileName);
    wxString path = fName.GetPath(wxPATH_GET_VOLUME|wxPATH_GET_SEPARATOR);
    wxString name = fName.GetName();
    return path + name + wxT(".") + wxSTEditorExporter::GetExtension(file_format);
}

void wxSTEditorExportDialog::OnChoice(wxCommandEvent& event)
{
    switch (event.GetId())
    {
        case ID_STEDLG_EXPORT_FORMAT_CHOICE :
        {
            if (((wxCheckBox*)FindWindow(ID_STEDLG_EXPORT_EXTENSION_CHECKBOX))->IsChecked())
            {
                SetFileName(FileNameExtChange(GetFileName(), GetFileFormat()));
            }

            break;
        }
    }
}

void wxSTEditorExportDialog::OnButton(wxCommandEvent& event)
{
    switch (event.GetId())
    {
        case ID_STEDLG_EXPORT_FILENAME_BITMAPBUTTON :
        {
            int file_format    = GetFileFormat();
            wxString fileName  = GetFileName();
            wxString path      = wxGetCwd();
            wxString extension = wxSTEditorExporter::GetExtension(file_format);
            wxString wildcards = wxSTEditorExporter::GetWildcards(file_format) + wxT("|All files (*)|*");

            if (!fileName.IsEmpty())
            {
                wxFileName fn(fileName);
                fileName = fn.GetFullName();
                wxString fileNamePath = fn.GetPath();
                if (!fileNamePath.IsEmpty())
                    path = fileNamePath;
            }

            fileName = wxFileSelector( _("Export to file"), path, fileName,
                                       extension, wildcards,
                                       wxFD_SAVE, this );

            if (!fileName.IsEmpty())
            {
                if (((wxCheckBox*)FindWindow(ID_STEDLG_EXPORT_EXTENSION_CHECKBOX))->IsChecked())
                    fileName = wxFileDialogBase::AppendExtension(fileName,
                                                                 extension);
                SetFileName(fileName);
            }

            break;
        }
        case wxID_OK :
        {
            wxSTEPrependArrayString(GetFileName(), sm_fileNames, 10);
            sm_file_format = GetFileFormat();
            break;
        }
        default : break;
    }

    event.Skip();
}

