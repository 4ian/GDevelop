///////////////////////////////////////////////////////////////////////////////
// Name:        steprint.h
// Purpose:     wxSTEditorPrintout
// Author:      John Labenski, parts taken from wxGuide by Otto Wyss
// Modified by:
// Created:     11/05/2002
// Copyright:   (c) John Labenski, Otto Wyss
// Licence:     wxWidgets licence
///////////////////////////////////////////////////////////////////////////////

#ifndef _STEPRINT_H_
#define _STEPRINT_H_

#include "wx/print.h"

#include "wx/stedit/stedefs.h"
#include "wx/stedit/stestyls.h"

//-----------------------------------------------------------------------------
// wxSTEditorPrintout : A subclassed wxPrintout for printing the current
// document of a wxSTEditor. See usage in the print functions in stedit.cpp.
//-----------------------------------------------------------------------------
#if wxUSE_PRINTING_ARCHITECTURE

class WXDLLIMPEXP_STEDIT wxSTEditorPrintout : public wxPrintout
{
public:
    wxSTEditorPrintout( wxSTEditor *editor,
                        const wxString& title = wxEmptyString );

    virtual bool OnBeginDocument(int startPage, int endPage);
    virtual void OnEndDocument();

    virtual bool HasPage(int page); // wxWin starts at page 1
    virtual bool OnPrintPage(int page);
    virtual void GetPageInfo(int *minPage, int *maxPage, int *pageFrom, int *pageTo);

    // Get/Set the wxPrintData/wxPageSetupData that will be used
    //   if NULL then one will be created on first use and deleted when the
    //   program exits.
    static wxPrintData *GetPrintData(bool create_on_demand = false);
    static wxPageSetupData *GetPageSetupData(bool create_on_demand = false);
    static bool GetPrintDataStatic();
    static bool GetPageSetupDataStatic();
    // Set the wxPrintData/PageSetupData, if !is_static then it will be deleted
    //   when the program exits
    static void SetPrintData( wxPrintData *printData, bool is_static );
    static void SetPageSetupData( wxPageSetupData *pageSetupData, bool is_static );

protected :
    bool PrintScaling(wxDC *dc);

    wxSTEditor* m_editor;
    int m_margin0_width;  // remember original widths
    int m_margin1_width;
    int m_margin2_width;
    int m_edge_mode;

    wxArrayInt m_pages;     // starting position of each page
    wxRect     m_pageRect;  // the dc rect of the whole page
    wxRect     m_printRect; // the dc rect of the page - margins

    static wxPrintData*     sm_STE_printData;
    static wxPageSetupData* sm_STE_pageSetupData;
    static bool             sm_STE_printdata_static;
    static bool             sm_STE_pagesetupdata_static;
    static bool             sm_warn_on_font_scale;

private:
    DECLARE_ABSTRACT_CLASS(wxSTEditorPrintout)
};

#endif // wxUSE_PRINTING_ARCHITECTURE

//-----------------------------------------------------------------------------
// wxSTEditorPrintOptionsDialog - show all the STC print options.
//   Uses the editor to load the current values if parent is of class
//   wxSTEditor else use SetXXX before calling ShowModal.
//   Doesn't change the values of the input editor on Ok (if parent is wxSTEditor).
//   See wxSTEditor::ShowPrintOptionsDialog() for usage
//-----------------------------------------------------------------------------

class WXDLLIMPEXP_STEDIT wxSTEditorPrintOptionsDialog: public wxDialog
{
public:
    wxSTEditorPrintOptionsDialog(wxWindow *parent);

    void SetPrintMagnification( int magnification );
    void SetPrintColourMode( int colour_mode );        // wxSTC_PRINT_NORMAL...
    void SetPrintWrapMode( bool wrap_lines );
    void SetPrintLinenumbers( int print_linenumbers ); // enum STE_PrintLinenumbersType

    int  GetPrintMagnification();
    int  GetPrintColourMode();
    bool GetPrintWrapMode();
    int  GetPrintLinenumbers();

private:
    DECLARE_ABSTRACT_CLASS(wxSTEditorPrintOptionsDialog)
};

#endif  // _STEPRINT_H_

