/*
 * GDevelop IDE
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU General Public License version 3.
 */
#include <wx/dcclient.h>
#include <wx/dcmemory.h>
#include <wx/dcscreen.h>

#include "SplashScreen.h"
namespace
{
int cbSplashScreen_timer_id = wxNewId();
}

void SplashScreen::DoPaint( wxDC &dc )
{
    static const wxString release = "release";
    static const wxString revision = "revision";

#ifdef __WIN32__
    dc.SetClippingRegion( r );
#endif

    dc.DrawBitmap( m_label, 0, 0, false );
}

void SplashScreen::OnPaint( wxPaintEvent & )
{
    // an obscure statement in the wxWidgets book says to
    // allocate the DC even if you don't paint to avoid
    // a paint loop.    //pecan 2006/04/3
    wxPaintDC paint_dc( this );
    DoPaint( paint_dc );
}

void SplashScreen::OnEraseBackground( wxEraseEvent &event )
{
    wxDC *dc = event.GetDC();

    if ( dc )
    {
        DoPaint( *dc ); // why not? :)
    }
}

void SplashScreen::OnTimer( wxTimerEvent & )
{
    timeUp = true;
}

void SplashScreen::OnCloseWindow( wxCloseEvent & )
{
    m_timer.Stop();
    /* Don't destroy it here. It creates a dangling pointer
       in app.cpp and crashes C::B */
    Hide();
}

void SplashScreen::OnChar( wxKeyEvent & )
{
    Close( true );
}

void SplashScreen::OnMouseEvent( wxMouseEvent &event )
{
    if ( event.LeftDown() || event.RightDown() )
    {
        Close( true );
    }
}

SplashScreen::SplashScreen( wxBitmap &label, long timeout, wxWindow *parent, wxWindowID id, long style )
        : wxFrame( parent, id, wxEmptyString, wxPoint( 0, 0 ), wxSize( 100, 100 ), style ),
        r( 0, 0, 181, 181 ), m_timer( this, cbSplashScreen_timer_id ),
        timeUp(false)
{
    r.Union( label );

    int w = label.GetWidth();
    int h = label.GetHeight();

    SetClientSize( w, h );
    CentreOnScreen();

    wxScreenDC screen_dc;
    wxMemoryDC label_dc;

    int x;
    int y;

    x = GetPosition().x;
    y = GetPosition().y;

    m_label.Create( w, h );

    label_dc.SelectObject( m_label );
    label_dc.Blit( 0, 0, w, h, &screen_dc, x, y );
    label_dc.DrawBitmap( label, 0, 0, true );
    label_dc.SelectObject( wxNullBitmap );

    SetShape( r );

    Show( true );
    SetThemeEnabled( false ); // seems to be useful by description
    SetBackgroundStyle( wxBG_STYLE_CUSTOM ); // the trick for GTK+ (notice it's after Show())

    SetTitle("GDevelop");

    wxIconBundle icons;
    icons.AddIcon("res/icon16.png");
    icons.AddIcon("res/icon24.png");
    #if defined(LINUX) || defined(MACOS)
    icons.AddIcon("res/icon32linux.png");
    icons.AddIcon("res/icon48linux.png");
    icons.AddIcon("res/icon64linux.png");
    icons.AddIcon("res/icon128linux.png");
    #else
    icons.AddIcon("res/icon32.png");
    icons.AddIcon("res/icon48.png");
    icons.AddIcon("res/icon128.png");
    #endif
    SetIcons(icons);

    Centre( wxBOTH | wxCENTRE_ON_SCREEN ); // centre only works when the window is showing

    Update();
    wxYieldIfNeeded();

    if ( timeout != -1 )
    {
        m_timer.Start( timeout, true );
    }
}

SplashScreen::~SplashScreen()
{
    m_timer.Stop();
}

BEGIN_EVENT_TABLE( SplashScreen, wxFrame )
    EVT_PAINT( SplashScreen::OnPaint )
    EVT_TIMER( cbSplashScreen_timer_id, SplashScreen::OnTimer )
    EVT_ERASE_BACKGROUND( SplashScreen::OnEraseBackground )
    EVT_CLOSE( SplashScreen::OnCloseWindow )
    EVT_CHAR( SplashScreen::OnChar )
    EVT_MOUSE_EVENTS( SplashScreen::OnMouseEvent )
END_EVENT_TABLE()

