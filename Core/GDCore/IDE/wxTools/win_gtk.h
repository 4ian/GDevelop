/**
 * \file win_gtk.h
 *
 * This file comes from <wxWidgets directory>/include/wx/gtk/private
 * We need it for integrating SFML inside wxWidgets (see wxSFMLCanvas), but as
 * it is in a private directory, it had to be copied here.
 */

/* ///////////////////////////////////////////////////////////////////////////
// Name:        wx/gtk/private/win_gtk.h
// Purpose:     native GTK+ widget for wxWindow
// Author:      Robert Roebling
// Copyright:   (c) 1998 Robert Roebling
// Licence:     wxWindows licence
/////////////////////////////////////////////////////////////////////////// */

#ifndef _WX_GTK_PIZZA_H_
#define _WX_GTK_PIZZA_H_

#define WX_PIZZA(obj) G_TYPE_CHECK_INSTANCE_CAST(obj, wxPizza::type(), wxPizza)
#define WX_IS_PIZZA(obj) G_TYPE_CHECK_INSTANCE_TYPE(obj, wxPizza::type())

struct WXDLLIMPEXP_CORE wxPizza
{
    // borders styles which can be used with wxPizza
    enum { BORDER_STYLES =
        wxBORDER_SIMPLE | wxBORDER_RAISED | wxBORDER_SUNKEN | wxBORDER_THEME };

    static GtkWidget* New(long windowStyle = 0);
    static GType type();
    void move(GtkWidget* widget, int x, int y, int width, int height);
    void put(GtkWidget* widget, int x, int y, int width, int height);
    void scroll(int dx, int dy);
    void get_border(GtkBorder& border);

    GtkFixed m_fixed;
    GList* m_children;
    int m_scroll_x;
    int m_scroll_y;
    int m_windowStyle;
};

#endif // _WX_GTK_PIZZA_H_
