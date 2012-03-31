/////////////////////////////////////////////////////////////////////////////
// Name:        statbar.cpp
// Purpose:     wxStatusBar sample
// Author:      Vadim Zeitlin
// Modified by: Florian Rival
// Created:     04.02.00
// RCS-ID:      $Id: statbar.cpp 38638 2006-04-09 11:00:45Z VZ $
// Copyright:   (c) Vadim Zeitlin
// Licence:     wxWindows licence
/////////////////////////////////////////////////////////////////////////////

// ============================================================================
// declarations
// ============================================================================

// ----------------------------------------------------------------------------
// headers
// ----------------------------------------------------------------------------
#ifdef __BORLANDC__
    #pragma hdrstop
#endif

// for all others, include the necessary headers
#include <wx/app.h>
#include <wx/log.h>
#include <wx/frame.h>
#include <wx/statusbr.h>
#include <wx/timer.h>
#include <wx/checkbox.h>
#include <wx/statbmp.h>
#include <wx/menu.h>
#include <wx/msgdlg.h>
#include <wx/textdlg.h>
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/bmpbuttn.h>
#include <wx/dcmemory.h>
#include "MyStatusBar.h"
#include "GDCore/IDE/CommonBitmapManager.h"
#include <wx/config.h>

#include <wx/datetime.h>
#include <wx/numdlg.h>

// define this for the platforms which don't support wxBitmapButton (such as
// Motif), else a wxBitmapButton will be used
#ifdef __WXMOTIF__
//#define USE_MDI_PARENT_FRAME 1

#ifdef USE_MDI_PARENT_FRAME
    #include <wx/mdi.h>
#endif // USE_MDI_PARENT_FRAME
    #define USE_STATIC_BITMAP
#endif

// ----------------------------------------------------------------------------
// resources
// ----------------------------------------------------------------------------

#ifdef USE_STATIC_BITMAP
    #include "green.xpm"
    #include "red.xpm"
#endif // USE_STATIC_BITMAP

// ----------------------------------------------------------------------------
// private classes
// ----------------------------------------------------------------------------

BEGIN_EVENT_TABLE(MyStatusBar, wxStatusBar)
    EVT_SIZE(MyStatusBar::OnSize)
END_EVENT_TABLE()


// ----------------------------------------------------------------------------
// MyStatusBar
// ----------------------------------------------------------------------------

#ifdef __VISUALC__
    // 'this' : used in base member initializer list -- so what??
    #pragma warning(disable: 4355)
#endif

MyStatusBar::MyStatusBar(wxWindow *parent)
           : wxStatusBar(parent, wxID_ANY)
{
    static int widths[Field_Max] = { -1, 175 };
    static int widthsSimple[Field_Max] = { -1, 150, 175 };

    SetFieldsCount(2);
    SetStatusWidths(2, widths);

    CommonBitmapManager * CommonBitmapManager = CommonBitmapManager::GetInstance();

    m_statbmp = new wxBitmapButton(this, wxID_ANY, CommonBitmapManager->modeSimple,
                                         wxDefaultPosition, wxDefaultSize,
                                         wxBU_EXACTFIT);

    SetMinHeight(BITMAP_SIZE_Y);

}

#ifdef __VISUALC__
    #pragma warning(default: 4355)
#endif

MyStatusBar::~MyStatusBar()
{
}

void MyStatusBar::OnSize(wxSizeEvent& event)
{
    //On vérifie si on est pas en mode simple.
    wxConfigBase * pConfig = wxConfigBase::Get();

    wxRect rect;

    m_statbmp->Show(false);

    event.Skip();
}
