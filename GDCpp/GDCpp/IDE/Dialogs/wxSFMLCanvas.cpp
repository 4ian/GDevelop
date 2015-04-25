#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)

#include "wxSFMLCanvas.hpp"
#include <iostream>
#include <wx/dcclient.h>
// Platform-specific includes
#ifdef __WXGTK__
    #include <gdk/gdkx.h>
    #include <gtk/gtk.h>
    #include "GDCore/IDE/wxTools/win_gtk.h"
#endif

////////////////////////////////////////////////////////////
// Event table
////////////////////////////////////////////////////////////
BEGIN_EVENT_TABLE(wxSFMLCanvas, wxControl)
    EVT_IDLE(wxSFMLCanvas::OnIdle)
    EVT_PAINT(wxSFMLCanvas::OnPaint)
    EVT_ERASE_BACKGROUND(wxSFMLCanvas::OnEraseBackground)
    EVT_LEFT_DOWN( wxSFMLCanvas::OnLeftDown)
    EVT_LEFT_UP( wxSFMLCanvas::OnLeftUp)
    EVT_LEFT_DCLICK( wxSFMLCanvas::OnLeftDClick)
    EVT_RIGHT_DOWN( wxSFMLCanvas::OnRightDown)
    EVT_RIGHT_UP( wxSFMLCanvas::OnRightUp)
    EVT_RIGHT_DCLICK( wxSFMLCanvas::OnRightDClick)
    EVT_MIDDLE_UP( wxSFMLCanvas::OnMiddleUp)
    EVT_MIDDLE_DOWN( wxSFMLCanvas::OnMiddleDown)
    EVT_MOTION( wxSFMLCanvas::OnMotion)
    EVT_MOUSEWHEEL( wxSFMLCanvas::OnMouseWheel)
    EVT_KEY_DOWN( wxSFMLCanvas::OnKey)
    EVT_KEY_UP( wxSFMLCanvas::OnKeyUp)
    EVT_MOUSE_EVENTS( wxSFMLCanvas::OnAnyMouseEvent)
END_EVENT_TABLE()


////////////////////////////////////////////////////////////
/// Construct the wxSFMLCanvas
////////////////////////////////////////////////////////////
wxSFMLCanvas::wxSFMLCanvas(wxWindow* Parent, wxWindowID Id, const wxPoint& Position, const wxSize& Size, long Style) :
wxControl(Parent, Id, Position, Size, Style)
{
    #ifdef __WXGTK__

        // GTK implementation requires to go deeper to find the low-level X11 identifier of the widget
        gtk_widget_realize(m_wxwindow);
        gtk_widget_set_double_buffered(m_wxwindow, false);

        GtkWidget* privHandle = m_wxwindow;
        wxPizza * pizza = WX_PIZZA(privHandle);
        GtkWidget * widget = GTK_WIDGET(pizza);

        //Get the internal gtk window...
        #if GTK_CHECK_VERSION(3, 0, 0)
        GdkWindow* win = gtk_widget_get_window(widget);
        #else
        GdkWindow* win = widget->window;
        #endif
        XFlush(GDK_WINDOW_XDISPLAY(win));

        //...and pass it to the sf::RenderWindow.
        #if GTK_CHECK_VERSION(3, 0, 0)
        sf::RenderWindow::create(GDK_WINDOW_XID(win));
        #else
        sf::RenderWindow::create(GDK_WINDOW_XWINDOW(win));
        #endif

    #else

        // Tested under Windows XP only (should work with X11 and other Windows versions - no idea about MacOS)
        sf::RenderWindow::create(static_cast<sf::WindowHandle>(GetHandle()));

    #endif

}

wxSFMLCanvas::~wxSFMLCanvas()
{
    // Nothing to do...
}

////////////////////////////////////////////////////////////
/// Notification for the derived class that moment is good
/// for doing its update and drawing stuff
////////////////////////////////////////////////////////////
void wxSFMLCanvas::OnUpdate()
{
    // Nothing to do by default...
}


////////////////////////////////////////////////////////////
/// Called when the control is idle - we can refresh our
/// SFML window
////////////////////////////////////////////////////////////
void wxSFMLCanvas::OnIdle(wxIdleEvent&event)
{
    // Send a paint message when the control is idle, to ensure maximum framerate
    Refresh();

    #if defined(__WXGTK__)
    event.RequestMore(); //On GTK, we need to specify that we want continuous idle events.
    #endif
}

////////////////////////////////////////////////////////////
/// Called when the control is repainted - we can display our
/// SFML window
////////////////////////////////////////////////////////////
void wxSFMLCanvas::OnPaint(wxPaintEvent&)
{
    // Make sure the control is able to be repainted
    wxPaintDC Dc(this);

    // Let the derived class do its specific stuff
    OnUpdate();
}

void wxSFMLCanvas::OnEraseBackground(wxEraseEvent&)
{
    // Don't do anything. We intercept this event in order to prevent the
    // parent class to draw the background before repainting the window,
    // which would cause some flickering
}

void wxSFMLCanvas::OnKey(wxKeyEvent& evt)
{
    evt.StopPropagation();
}

void wxSFMLCanvas::OnKeyUp(wxKeyEvent& evt)
{
    evt.StopPropagation();
}

void wxSFMLCanvas::OnLeftDown(wxMouseEvent &event) {}
void wxSFMLCanvas::OnLeftUp(wxMouseEvent &event) {}
void wxSFMLCanvas::OnLeftDClick(wxMouseEvent &event){}
void wxSFMLCanvas::OnMotion(wxMouseEvent &event){}
void wxSFMLCanvas::OnRightDown(wxMouseEvent &event) {}
void wxSFMLCanvas::OnRightUp(wxMouseEvent &event) {}
void wxSFMLCanvas::OnRightDClick(wxMouseEvent &event) {}
void wxSFMLCanvas::OnMiddleDown(wxMouseEvent &event) {}
void wxSFMLCanvas::OnMiddleUp(wxMouseEvent &event) {}
void wxSFMLCanvas::OnAnyMouseEvent(wxMouseEvent & event) {}
void wxSFMLCanvas::OnMouseWheel(wxMouseEvent& event) {}

#endif
