///////////////////////////////////////////////////////////////////////////////
// Name:        steprint.cpp
// Purpose:     wxSTEditorPrintout
// Author:      John Labenski, parts taken from wxGuide by Otto Wyss
// Modified by:
// Created:     11/05/2002
// RCS-ID:
// Copyright:   (c) John Labenski, Otto Wyss
// Licence:     wxWidgets licence
///////////////////////////////////////////////////////////////////////////////

#ifdef __BORLANDC__
    #pragma hdrstop
#endif

// For compilers that support precompilation, includes "wx/wx.h".
#include "wx/wxprec.h"

#ifndef WX_PRECOMP
    #include "wx/wx.h"
#endif // WX_PRECOMP

#include "wx/stedit/steprint.h"
#include "wx/stedit/stedit.h"
#include "stedlgs_wdr.h"

#include "wx/printdlg.h"  // wxPageSetupDialog
#include "wx/progdlg.h"   // wxProgressDialog
#include "wx/module.h"    // wxModule

#if wxUSE_PRINTING_ARCHITECTURE

//-----------------------------------------------------------------------------
// wxSTEditorModule - setup anything after init and delete before closing
//-----------------------------------------------------------------------------
#include "wx/stedit/stemenum.h"

class wxSTEditorModule : public wxModule
{
DECLARE_DYNAMIC_CLASS(wxSTEditorModule)
public:
    wxSTEditorModule() : wxModule() {}
    bool OnInit()
    {
#if wxCHECK_VERSION(2,7,2)
        wxArtProvider::Push(new wxSTEditorArtProvider);
#else
        wxArtProvider::PushProvider(new wxSTEditorArtProvider);
#endif //wxCHECK_VERSION(2,7,2)
        return true;
    }
    void OnExit()
    {
#if wxUSE_PRINTING_ARCHITECTURE
        wxSTEditorPrintout::SetPrintData(NULL, false);
        wxSTEditorPrintout::SetPageSetupData(NULL, false);
#endif // wxUSE_PRINTING_ARCHITECTURE
    }
};

IMPLEMENT_DYNAMIC_CLASS(wxSTEditorModule, wxModule)

//----------------------------------------------------------------------------
// wxSTEditorPrintout
//----------------------------------------------------------------------------

IMPLEMENT_ABSTRACT_CLASS(wxSTEditorPrintout, wxPrintout)

wxPrintData *wxSTEditorPrintout::sm_STE_printData = NULL;
wxPageSetupData *wxSTEditorPrintout::sm_STE_pageSetupData = NULL;
bool wxSTEditorPrintout::sm_STE_printdata_static = false;
bool wxSTEditorPrintout::sm_STE_pagesetupdata_static = false;
bool wxSTEditorPrintout::sm_warn_on_font_scale = true;

wxPrintData *wxSTEditorPrintout::GetPrintData(bool create_on_demand)
{
    if (create_on_demand && (sm_STE_printData == NULL))
    {
        wxPrintData *printData = new wxPrintData;
        printData->SetPaperId(wxPAPER_LETTER);
        SetPrintData(printData, false);
    }

    return sm_STE_printData;
}
wxPageSetupData *wxSTEditorPrintout::GetPageSetupData(bool create_on_demand)
{
    if (create_on_demand && (sm_STE_pageSetupData == NULL))
    {
        wxPageSetupData *pageSetupData = new wxPageSetupData;
        pageSetupData->SetPaperSize(wxPAPER_LETTER);
        pageSetupData->SetMarginTopLeft(wxPoint(20, 20));
        pageSetupData->SetMarginBottomRight(wxPoint(20, 20));
        SetPageSetupData(pageSetupData, false);
    }

    return sm_STE_pageSetupData;
}

bool wxSTEditorPrintout::GetPrintDataStatic()     { return sm_STE_printdata_static; }
bool wxSTEditorPrintout::GetPageSetupDataStatic() { return sm_STE_pagesetupdata_static; }

void wxSTEditorPrintout::SetPrintData( wxPrintData *printData, bool is_static )
{
    if (sm_STE_printData && !sm_STE_printdata_static)
        delete sm_STE_printData;

    sm_STE_printData        = printData;
    sm_STE_printdata_static = is_static;
}
void wxSTEditorPrintout::SetPageSetupData( wxPageSetupData *pageSetupData, bool is_static )
{
    if (sm_STE_pageSetupData && !sm_STE_pagesetupdata_static)
        delete sm_STE_pageSetupData;

    sm_STE_pageSetupData        = pageSetupData;
    sm_STE_pagesetupdata_static = is_static;
}

wxSTEditorPrintout::wxSTEditorPrintout(wxSTEditor *editor,
                                       const wxString& title)
                   :wxPrintout(title), m_editor(editor),
                    m_margin0_width(-1), m_margin1_width(-1), m_margin2_width(-1),
                    m_edge_mode(-1)
{
    wxCHECK_RET(m_editor, wxT("Invalid editor in wxSTEditorPrintout"));

    // This is a simple check to see if the font can be scaled. Otherwise
    //   the user will be confused and disappointed by the output.

    // You cannot show this dialog later if this is used in a wxPrintPreview.
    //   It leads to a crash in MSW in the paint handler for the preview,
    //   probably something to do with having two modal dialogs.
    if (sm_warn_on_font_scale && m_editor->GetEditorStyles().Ok())
    {
        wxClientDC dc(m_editor);
        wxFont font = m_editor->GetEditorStyles().GetFont(STE_STYLE_DEFAULT);
        int font_width = 0, font_height = 0;
        dc.SetUserScale(1.0, 1.0);
        dc.GetTextExtent(wxT("W"), &font_width, &font_height, NULL, NULL, &font);
        int font_width_2 = 0, font_height_2 = 0;
        dc.SetUserScale(0.5, 0.5);
        dc.GetTextExtent(wxT("W"), &font_width_2, &font_height_2, NULL, NULL, &font);

        if (!(font_height_2 < font_height))
        {
            int ret = wxMessageBox(_("The font cannot be properly scaled for the printout\nand the output may be corrupted.\nPress cancel to not see this warning again."),
                                   _("Unscalable font"),
                                   wxOK|wxCANCEL|wxCENTRE|wxICON_INFORMATION, m_editor);

            if (ret == wxCANCEL)
                sm_warn_on_font_scale = false;
        }
    }
}

bool wxSTEditorPrintout::OnBeginDocument(int startPage, int endPage)
{
    if (!m_editor)
        return false;

    // save the original values for edge mode and margin widths
    m_edge_mode = m_editor->GetEdgeMode();  // nobody wants to see this?
    m_editor->SetEdgeMode(wxSTC_EDGE_NONE);

    wxSTEditorPrefs prefs = m_editor->GetEditorPrefs();

    m_margin0_width = m_editor->GetMarginWidth(STE_MARGIN_0);
    m_margin1_width = m_editor->GetMarginWidth(STE_MARGIN_1);
    m_margin2_width = m_editor->GetMarginWidth(STE_MARGIN_2);

    // this defaults to wysiwyg for linenumbers if no prefs
    bool has_linenums    = (m_margin0_width != 0) && (m_editor->GetMarginType(STE_MARGIN_0) == wxSTC_MARGIN_NUMBER);
    bool linenums_never  = prefs.Ok() && (prefs.GetPrefInt(STE_PREF_PRINT_LINENUMBERS) == STE_PRINT_LINENUMBERS_NEVER);
    bool linenums_always = prefs.Ok() && (prefs.GetPrefInt(STE_PREF_PRINT_LINENUMBERS) == STE_PRINT_LINENUMBERS_ALWAYS);

    if (!linenums_never && (has_linenums || linenums_always))
    {
        // calculate the smallest line number width to save space
        int line_count = m_editor->GetLineCount(); line_count = wxMax(line_count, 1);
        wxString lineStr((int)log10((double)line_count)+1, wxT('5'));

        int line_margin_width = m_editor->TextWidth(wxSTC_STYLE_LINENUMBER, lineStr);
        m_editor->SetMarginWidth(STE_MARGIN_0, line_margin_width);
    }
    else
    {
        m_editor->SetMarginWidth(STE_MARGIN_0, 0);
    }

    // the markers are not drawn by scintilla anyway so set margin widths to 0
    m_editor->SetMarginWidth(STE_MARGIN_1, 0);
    m_editor->SetMarginWidth(STE_MARGIN_2, 0);

    return wxPrintout::OnBeginDocument(startPage, endPage);
}

void wxSTEditorPrintout::OnEndDocument()
{
    if (m_editor)
    {
        // restore the original values for edge mode and margin widths
        if (m_edge_mode >= 0)
            m_editor->SetEdgeMode(m_edge_mode);

        if (m_margin0_width >= 0)
            m_editor->SetMarginWidth(STE_MARGIN_0, m_margin0_width);
        if (m_margin1_width >= 0)
            m_editor->SetMarginWidth(STE_MARGIN_1, m_margin1_width);
        if (m_margin2_width >= 0)
            m_editor->SetMarginWidth(STE_MARGIN_2, m_margin2_width);
    }

    wxPrintout::OnEndDocument();
}

bool wxSTEditorPrintout::HasPage(int page)
{
    return (page > 0) && (page-1 < int(m_pages.GetCount())); // pages start at 1
}

bool wxSTEditorPrintout::OnPrintPage(int page)
{
    wxDC *dc = GetDC();
    if (!m_editor || !HasPage(page) || !dc)
        return false;

    PrintScaling(dc);             // scale DC for preview

#if 0 // FIXME test code for visualizing the rectangles
    //dc->SetBrush(*wxTRANSPARENT_BRUSH);
    dc->SetBrush(*wxGREEN_BRUSH);
    dc->SetPen(wxPen(wxColour(255,0,0), 2, wxSOLID));
    dc->DrawRectangle(m_pageRect); dc->DrawRectangle(m_pageRect.Inflate(-20, -20));
    dc->SetPen(wxPen(wxColour(255,0,0), 2, wxSOLID));
    dc->SetBrush(*wxBLUE_BRUSH);
    dc->DrawRectangle(m_printRect);
#endif // test for visualizing printout

    m_editor->FormatRange(true,
                          m_pages[page-1],
                          (int(m_pages.GetCount()) > page) ? m_pages[page] : m_editor->GetLength(),
                          dc, dc,
                          m_printRect, m_pageRect);

    return true;
}

void wxSTEditorPrintout::GetPageInfo(int *minPage, int *maxPage,
                                     int *pageFrom, int *pageTo)
{
    wxCHECK_RET(m_editor && minPage && maxPage && pageFrom && pageTo,
                wxT("Null value in wxSTEditorPrintout::GetPageInfo"));

    // initialize values
    *minPage  = 0;
    *maxPage  = 0;
    *pageFrom = 0;
    *pageTo   = 0;

    // scale DC if possible
    wxDC *dc = GetDC();
    if (!dc) return;
    PrintScaling(dc);

    // count pages
    int pos    = 0;
    int length = m_editor->GetLength();
    int lines  = m_editor->GetLineCount();
    int pages  = 1;
    m_pages.Clear();
    wxProgressDialog progDialog(_("Formatting printout"), _("Page 1 of ?"));

    while (pos < length)
    {
        if (*maxPage >= (int)m_pages.GetCount())
            m_pages.Add(pos);
        else
            m_pages[*maxPage] = pos;

        pos = m_editor->FormatRange(false,
                                    pos,
                                    length,
                                    dc, dc,
                                    m_printRect, m_pageRect);
        *maxPage += 1;

        int current_line = m_editor->LineFromPosition(wxMax(pos-1, 0));
        current_line = wxMax(current_line, 1);
        pages = 1+(*maxPage)*lines/current_line;
        progDialog.Update(int(pos*100.0/length),
                          wxString::Format(_("Page %d of %d"), *maxPage, pages));
    }

    if (*maxPage > 0)
        *minPage = 1;

    *pageFrom = *minPage;
    *pageTo   = *maxPage;
}

bool wxSTEditorPrintout::PrintScaling(wxDC *dc)
{
    if (!dc)
        return false;

    // Get the whole size of the page in mm
    wxSize pageMMSize;
    GetPageSizeMM(&pageMMSize.x, &pageMMSize.y);

    // Get the ppi of the screen and printer
    wxSize ppiScr,ppiPrn;
    GetPPIScreen( &ppiScr.x, &ppiScr.y);
    GetPPIPrinter(&ppiPrn.x, &ppiPrn.y);

    float ppi_scale_x = float(ppiPrn.x)/float(ppiScr.x);
    float ppi_scale_y = float(ppiPrn.y)/float(ppiScr.y);

    // Get the size of DC in pixels and the number of pixels in the page
    wxSize dcSize, pagePixSize;
    dc->GetSize(&dcSize.x, &dcSize.y);
    GetPageSizePixels(&pagePixSize.x, &pagePixSize.y);

    float dc_pagepix_scale_x = float(dcSize.x)/float(pagePixSize.x);
    float dc_pagepix_scale_y = float(dcSize.y)/float(pagePixSize.y);

    // the actual ppi using the size of the dc or page in pixels
    //wxSize pixelSize = IsPreview() ? dcSize : pagePixSize;
    //float page_ppi_x = float(pixelSize.x) * (25.4 / float(pageMMSize.x));
    //float page_ppi_y = float(pixelSize.y) * (25.4 / float(pageMMSize.y));

    // If printer pageWidth == current DC width, then this doesn't
    // change. But w might be the preview bitmap width, so scale down.
    float dc_scale_x = ppi_scale_x * dc_pagepix_scale_x;
    float dc_scale_y = ppi_scale_y * dc_pagepix_scale_y;

    // calculate the pixels / mm (25.4 mm = 1 inch)
    float ppmm_x = float(ppiScr.x) / 25.4;
    float ppmm_y = float(ppiScr.y) / 25.4;

    // Adjust the page size for the pixels / mm scaling factor
    //wxSize paperSize = GetPageSetupData(true)->GetPaperSize();
    wxSize page = pageMMSize;
    page.x      = int(page.x * ppmm_x);
    page.y      = int(page.y * ppmm_y);
    m_pageRect  = wxRect(0, 0, page.x, page.y);

    // get margins informations and convert to printer pixels
    wxPoint topLeft     = GetPageSetupData(true)->GetMarginTopLeft();
    wxPoint bottomRight = GetPageSetupData(true)->GetMarginBottomRight();

    int top    = int(topLeft.y     * ppmm_y);
    int bottom = int(bottomRight.y * ppmm_y);
    int left   = int(topLeft.x     * ppmm_x);
    int right  = int(bottomRight.x * ppmm_x);

    m_printRect = wxRect(left, top, page.x-(left+right), page.y-(top+bottom));

    dc->SetUserScale(dc_scale_x, dc_scale_y);

    //wxPrintf(wxT("GetPageInfo ppiScr %d %d, ppiPrn %d %d, paperSize %d %d page %d %d, preview %d\n"), ppiScr.x, ppiScr.y, ppiPrn.x, ppiPrn.y, paperSize.x, paperSize.y, page.x, page.y, IsPreview());
    //wxPrintf(wxT("GetPageInfo m_pageRect x%d y%d w%d h%d m_printRect x%d y%d w%d h%d\n"), m_pageRect.x, m_pageRect.y, m_pageRect.width, m_pageRect.height,
    //                                                                                      m_printRect.x, m_printRect.y, m_printRect.width, m_printRect.height);
    //wxPrintf(wxT("PrintScaling dc size %d %d, page pixels %d %d, dc_scale %g %g ppmm %g %g\n"), dcSize.x, dcSize.y, pagePixSize.x, pagePixSize.y, dc_scale_x, dc_scale_y, ppmm_x, ppmm_y);
    //wxPrintf(wxT("ppi_scale %g %g, dc_pagepix_scale %g %g\n\n"), ppi_scale_x, ppi_scale_y, dc_pagepix_scale_x, dc_pagepix_scale_y);
    //fflush(stdout);

    return true;
}

#endif // wxUSE_PRINTING_ARCHITECTURE

//-----------------------------------------------------------------------------
// wxSTEditorPrintOptionsDialog - display STC printer options
//-----------------------------------------------------------------------------
IMPLEMENT_ABSTRACT_CLASS(wxSTEditorPrintOptionsDialog, wxDialog);

wxSTEditorPrintOptionsDialog::wxSTEditorPrintOptionsDialog(wxWindow *parent)
                             :wxDialog(parent, wxID_ANY, _("Printout options"),
                                       wxDefaultPosition, wxDefaultSize,
                                       wxDEFAULT_DIALOG_STYLE)
{
    wxSizer *sizer = wxSTEditorPrintPrefsSizer(this, true, true);

    wxSizer* stdButtonSizer = CreateStdDialogButtonSizer(wxOK|wxCANCEL);
    sizer->Add( stdButtonSizer, 0, wxALIGN_CENTER|wxALL, 5 );
    sizer->Layout();
    sizer->SetSizeHints( this );

    if (wxDynamicCast(parent, wxSTEditor))
    {
        wxSTEditor *edit = (wxSTEditor*)parent;
        SetPrintMagnification(edit->GetPrintMagnification());
        SetPrintColourMode(edit->GetPrintColourMode());
        SetPrintWrapMode(edit->GetPrintWrapMode() == wxSTC_WRAP_WORD);
        wxSTEditorPrefs prefs = edit->GetEditorPrefs();
        if (prefs.Ok())
            SetPrintLinenumbers(prefs.GetPrefInt(STE_PREF_PRINT_LINENUMBERS));
        else
            SetPrintLinenumbers(STE_PRINT_LINENUMBERS_DEFAULT);
    }
    else
    {
        SetPrintMagnification(-2);
        SetPrintColourMode(wxSTC_PRINT_COLOURONWHITE);
        SetPrintWrapMode(false);
        SetPrintLinenumbers(STE_PRINT_LINENUMBERS_DEFAULT);
    }

    Centre(wxBOTH);
}

void wxSTEditorPrintOptionsDialog::SetPrintMagnification( int val )
{
    ((wxSpinCtrl*)FindWindow(ID_STEDLG_PRINT_MAGNIFICATION_SPINCTRL))->SetValue(val);
}
void wxSTEditorPrintOptionsDialog::SetPrintColourMode( int val )
{
    wxChoice* choice = (wxChoice*)FindWindow(ID_STEDLG_PRINT_COLOURMODE_CHOICE);
    wxCHECK_RET((val >= 0) && (val < (int)choice->GetCount()),
                wxT("Invalid selection in wxSTEditorPrintOptionsDialog::SetPrintColourMode"));
    choice->SetSelection(val);
}
void wxSTEditorPrintOptionsDialog::SetPrintWrapMode( bool val )
{
    ((wxCheckBox*)FindWindow(ID_STEDLG_PRINT_WRAPMODE_CHECKBOX))->SetValue(val);
}
void wxSTEditorPrintOptionsDialog::SetPrintLinenumbers( int show_linenumbers )
{
    wxCHECK_RET((show_linenumbers >= 0) && (show_linenumbers <= 2), wxT("Invalid value"));
    ((wxChoice*)FindWindow(ID_STEDLG_PRINT_LINENUMBERS_CHOICE))->SetSelection(show_linenumbers);
}

int wxSTEditorPrintOptionsDialog::GetPrintMagnification()
{
    return ((wxSpinCtrl*)FindWindow(ID_STEDLG_PRINT_MAGNIFICATION_SPINCTRL))->GetValue();
}
int wxSTEditorPrintOptionsDialog::GetPrintColourMode()
{
    return ((wxChoice*)FindWindow(ID_STEDLG_PRINT_COLOURMODE_CHOICE))->GetSelection();
}
bool wxSTEditorPrintOptionsDialog::GetPrintWrapMode()
{
    return ((wxCheckBox*)FindWindow(ID_STEDLG_PRINT_WRAPMODE_CHECKBOX))->GetValue();
}
int wxSTEditorPrintOptionsDialog::GetPrintLinenumbers()
{
    return ((wxChoice*)FindWindow(ID_STEDLG_PRINT_LINENUMBERS_CHOICE))->GetSelection();
}
