///////////////////////////////////////////////////////////////////////////////
// Name:        steexprt.h
// Purpose:     wxSTEditorExporter
// Author:      John Labenski, mostly others see src for copyright
// Modified by:
// Created:     11/05/2002
// Copyright:   (c) John Labenski, Neil Hodgson & others see steexprt.cpp
// Licence:     wxWidgets licence
///////////////////////////////////////////////////////////////////////////////

#ifndef _STEEXPORT_H_
#define _STEEXPORT_H_

#include "wx/stedit/stedefs.h"

//-----------------------------------------------------------------------------
// wxSTEditorExporter - simple class to export the contents of a
//  wxSTEditor to a file or create a html string representation for use
//  in wxHtmlEasyPrinting.
//
//  Create this on demand, there is no use keeping it around.
//-----------------------------------------------------------------------------
enum STE_Export_Type
{
    STE_EXPORT_HTML,
    STE_EXPORT_HTMLCSS,
    STE_EXPORT_PDF,
    STE_EXPORT_RTF,
    STE_EXPORT_TEX,
    STE_EXPORT_XML
};

class WXDLLIMPEXP_STEDIT wxSTEditorExporter
{
public:
    wxSTEditorExporter(wxSTEditor* editor);

    // these are taken from SciTE src/Exporters.cxx
    bool SaveToRTF(const wxString& saveName, int start = 0, int end = -1);
    bool SaveToHTMLCSS(const wxString& saveName);
    bool SaveToPDF(const wxString& saveName);
    bool SaveToTEX(const wxString& saveName);
    bool SaveToXML(const wxString& saveName);

    // Get a HTML representation of the text, w/ styles
    //  code originally from wxHatch by Chris Elliott
    wxString RenderAsHTML();
    bool SaveToHTML(const wxString& saveName);

    // Export to the file_format (enum STE_Export_Type) to the given fileName
    //  if !overwrite_prompt don't ask to overwrite
    //  if !msg_on_error don't show an error message on failure (write error)
    bool ExportToFile(int file_format, const wxString& fileName,
                      bool overwrite_prompt, bool msg_on_error);

    static wxString GetExtension(int file_format); // see enum STE_Export_Type
    static wxString GetWildcards(int file_format); // see enum STE_Export_Type

    // -----------------------------------------------------------------------
    // implementation

    // maps the stc style # to the appropriate ste style using the langs
    //  returns STE_STYLE_DEFAULT if the style isn't set
    int SciToSTEStyle(int sci_style) const;

protected:
    wxSTEditor*      m_editor;
    wxSTEditorPrefs  m_stePrefs;
    wxSTEditorStyles m_steStyles;
    wxSTEditorLangs  m_steLangs;
};

//-----------------------------------------------------------------------------
// wxSTEditorExportDialog - Choose format and filename to export text
//
// This does not save the file, see wxSTEditor::ShowExportDialog
//-----------------------------------------------------------------------------

class WXDLLIMPEXP_STEDIT wxSTEditorExportDialog : public wxDialog
{
public:
    wxSTEditorExportDialog(wxWindow* parent,
                           const wxString& title = _("Export file"),
                           long style = wxDEFAULT_DIALOG_STYLE|wxRESIZE_BORDER);

    wxString GetFileName() const;
    void SetFileName(const wxString& fileName);

    int  GetFileFormat() const;                    // see enum STE_Export_Type
    void SetFileFormat(int file_format);

    // -----------------------------------------------------------------------
    // implementation

    void OnChoice(wxCommandEvent& event);
    void OnButton(wxCommandEvent& event);

    wxString FileNameExtChange(const wxString& fileName, int file_format) const;

    wxChoice   *m_fileFormatChoice;
    wxComboBox *m_fileNameCombo;

    static wxArrayString sm_fileNames;     // remember previous settings
    static int           sm_file_format;

private:
    void Init();
    DECLARE_EVENT_TABLE()
    DECLARE_ABSTRACT_CLASS(wxSTEditorExportDialog);
};

#endif  // _STEEXPORT_H_

