// Copyright (C) 2005  Davis E. King (davis@dlib.net), Keita Mochizuki
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_DRAWABLe_CPP_
#define DLIB_DRAWABLe_CPP_

#include "drawable.h"

#include <algorithm>

namespace dlib
{

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// -----------  drawable_window object  ------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    rgb_pixel drawable_window::
    background_color (
    ) const
    {
        auto_mutex M(wm);
        return bg_color;
    }

// ----------------------------------------------------------------------------------------

    void drawable_window::
    set_background_color (
        unsigned long red_,
        unsigned long green_,
        unsigned long blue_
    )
    {
        wm.lock();
        bg_color.red = red_;
        bg_color.green = green_;
        bg_color.blue = blue_;
        wm.unlock();
        // now repaint the window
        unsigned long width,height;
        get_size(width,height);
        rectangle rect(0,0,width-1,height-1);
        invalidate_rectangle(rect);
    }

// ----------------------------------------------------------------------------------------

    void drawable_window::
    paint (
        const canvas& c
    )
    {
        ++event_id;
        c.fill(bg_color.red,bg_color.green,bg_color.blue);

        widgets.reset();
        while (widgets.move_next())
        {
            widgets.element().value().reset();
            while (widgets.element().value().move_next())
            {
                // only dispatch a draw() call if this widget isn't hidden
                if (widgets.element().value().element()->hidden == false &&
                    widgets.element().value().element()->event_id != event_id)
                {
                    widgets.element().value().element()->event_id = event_id;
                    widgets.element().value().element()->draw(c);
                }
            }
        }
    }

// ----------------------------------------------------------------------------------------

    void drawable_window::
    on_user_event (
        void* p,
        int i
    )
    {
        drawable* d = static_cast<drawable*>(p);
        if (widget_set.is_member(d))
        {
            d->on_user_event(i);
        }
    }

// ----------------------------------------------------------------------------------------

    void drawable_window::
    on_window_moved(
    )
    {
        ++event_id;
        window_moved.reset();
        while (window_moved.move_next())
        {
            if (window_moved.element()->event_id != event_id)
            {
                window_moved.element()->event_id = event_id;
                window_moved.element()->on_window_moved();
            }
        }
    }

// ----------------------------------------------------------------------------------------

    void drawable_window::
    on_window_resized(
    )
    {
        ++event_id;
        window_resized.reset();
        while (window_resized.move_next())
        {
            if (window_resized.element()->event_id != event_id)
            {
                window_resized.element()->event_id = event_id;
                window_resized.element()->on_window_resized();
            }
        }
    }

// ----------------------------------------------------------------------------------------

    void drawable_window::
    on_keydown (
        unsigned long key,
        bool is_printable,
        unsigned long state
    )
    {
        ++event_id;
        keyboard.reset();
        while (keyboard.move_next())
        {
            if (keyboard.element()->event_id != event_id)
            {
                keyboard.element()->event_id = event_id;
                keyboard.element()->on_keydown(key,is_printable,state);
            }
        }
    }

// ----------------------------------------------------------------------------------------

    void drawable_window::
    on_focus_gained (
    )
    {
        ++event_id;
        focus.reset();
        while (focus.move_next())
        {
            if (focus.element()->event_id != event_id)
            {
                focus.element()->event_id = event_id;
                focus.element()->on_focus_gained();
            }
        }
    }

// ----------------------------------------------------------------------------------------

    void drawable_window::
    on_focus_lost (
    )
    {
        ++event_id;
        focus.reset();
        while (focus.move_next())
        {
            if (focus.element()->event_id != event_id)
            {
                focus.element()->event_id = event_id;
                focus.element()->on_focus_lost();
            }
        }
    }

// ----------------------------------------------------------------------------------------

    void drawable_window::
    on_mouse_down (
        unsigned long btn,
        unsigned long state,
        long x,
        long y,
        bool is_double_click
    )
    {
        lastx = x;
        lasty = y;

        ++event_id;
        mouse_click.reset();
        while (mouse_click.move_next())
        {
            if (mouse_click.element()->event_id != event_id)
            {
                mouse_click.element()->event_id = event_id;
                mouse_click.element()->on_mouse_down(btn,state,x,y,is_double_click);
            }
        }
    }

// ----------------------------------------------------------------------------------------

    void drawable_window::
    on_mouse_up (
        unsigned long btn,
        unsigned long state,
        long x,
        long y
    )
    {
        lastx = x;
        lasty = y;

        ++event_id;
        mouse_click.reset();
        while (mouse_click.move_next())
        {
            if (mouse_click.element()->event_id != event_id)
            {
                mouse_click.element()->event_id = event_id;
                mouse_click.element()->on_mouse_up(btn,state,x,y);
            }
        }
    }

// ----------------------------------------------------------------------------------------

    void drawable_window::
    on_mouse_move (
        unsigned long state,
        long x,
        long y
    )
    {
        lastx = x;
        lasty = y;

        ++event_id;
        mouse_move.reset();
        while (mouse_move.move_next())
        {
            if (mouse_move.element()->event_id != event_id)
            {
                mouse_move.element()->event_id = event_id;
                mouse_move.element()->on_mouse_move(state,x,y);
            }
        }
    }

// ----------------------------------------------------------------------------------------

    void drawable_window::
    on_mouse_leave (
    )
    {
        lastx = -1;
        lasty = -1;

        ++event_id;
        mouse_move.reset();
        while (mouse_move.move_next())
        {
            if (mouse_move.element()->event_id != event_id)
            {
                mouse_move.element()->event_id = event_id;
                mouse_move.element()->on_mouse_leave();
            }
        }
    }

// ----------------------------------------------------------------------------------------

    void drawable_window::
    on_mouse_enter (
    )
    {
        ++event_id;
        mouse_move.reset();
        while (mouse_move.move_next())
        {
            if (mouse_move.element()->event_id != event_id)
            {
                mouse_move.element()->event_id = event_id;
                mouse_move.element()->on_mouse_enter();
            }
        }
    }

// ----------------------------------------------------------------------------------------

    void drawable_window::
    on_wheel_up (
        unsigned long state
    )
    {
        ++event_id;
        mouse_wheel.reset();
        while (mouse_wheel.move_next())
        {
            if (mouse_wheel.element()->event_id != event_id)
            {
                mouse_wheel.element()->event_id = event_id;
                mouse_wheel.element()->on_wheel_up(state);
            }
        }
    }

// ----------------------------------------------------------------------------------------

    void drawable_window::
    on_wheel_down (
        unsigned long state
    )
    {
        ++event_id;
        mouse_wheel.reset();
        while (mouse_wheel.move_next())
        {
            if (mouse_wheel.element()->event_id != event_id)
            {
                mouse_wheel.element()->event_id = event_id;
                mouse_wheel.element()->on_wheel_down(state);
            }
        }
    }

// ----------------------------------------------------------------------------------------

    void drawable_window::
    on_string_put (
        const std::wstring &str
    )
    {
        ++event_id;
        string_put.reset();
        while (string_put.move_next())
        {
            if (string_put.element()->event_id != event_id)
            {
                string_put.element()->event_id = event_id;
                string_put.element()->on_string_put(str);
            }
        }
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// -----------  drawable object  ----------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    void drawable::
    enable_events (
    )
    {
        auto_mutex M(m);
        if (enabled_events == false)
        {
            enabled_events = true;
            drawable* temp = this;
            long zo = z_order_value;

            drawable_window::set_of_drawables* sod = parent.widgets[zo];
            if (sod == 0)
            {
                // this drawable is the first widget at this z order so we need
                // to make its containing set
                drawable_window::set_of_drawables s;
                s.add(temp);
                parent.widgets.add(zo,s);
            }
            else
            {
                sod->add(temp);
            }

            temp = this;
            parent.widget_set.add(temp);

            if (events & MOUSE_MOVE)
            {
                temp = this;
                parent.mouse_move.add(temp);
            }
            if (events & MOUSE_CLICK)
            {
                temp = this;
                parent.mouse_click.add(temp);
            }
            if (events & MOUSE_WHEEL)
            {
                temp = this;
                parent.mouse_wheel.add(temp);
            }
            if (events & WINDOW_RESIZED)
            {
                temp = this;
                parent.window_resized.add(temp);
            }
            if (events & KEYBOARD_EVENTS)
            {
                temp = this;
                parent.keyboard.add(temp);
            }
            if (events & FOCUS_EVENTS)
            {
                temp = this;
                parent.focus.add(temp);
            }
            if (events & WINDOW_MOVED)
            {
                temp = this;
                parent.window_moved.add(temp);
            }
            if (events & STRING_PUT)
            {
                temp = this;
                parent.string_put.add(temp);
            }
            parent.invalidate_rectangle(rect);
        }
    }

// ----------------------------------------------------------------------------------------

    void drawable::
    set_z_order (
        long order
    )
    {
        auto_mutex M(m);
        if (order != z_order_value && enabled_events)
        {
            // first remove this drawable from widgets
            drawable_window::set_of_drawables* sod = parent.widgets[z_order_value];
            drawable* junk;
            sod->remove(this,junk);

            // if there are no more drawables at this z order then destroy the
            // set for this order
            if (sod->size() == 0)
                parent.widgets.destroy(z_order_value);

            // now add this drawable to its new z order
            sod = parent.widgets[order];                
            if (sod == 0)
            {
                // this drawable is the first widget at this z order so we need
                // to make its containing set
                drawable_window::set_of_drawables s, x;
                s.add(junk);
                long temp_order = order;
                parent.widgets.add(temp_order,s);
            }
            else
            {
                sod->add(junk);
            }
            parent.invalidate_rectangle(rect);

        }
        z_order_value = order;
    }

// ----------------------------------------------------------------------------------------

    void drawable::
    disable_events (
    )
    {
        auto_mutex M(m);
        if (enabled_events)
        {
            enabled_events = false;
            // first remove this drawable from widgets
            drawable_window::set_of_drawables* sod = parent.widgets[z_order_value];
            drawable* junk;
            sod->remove(this,junk);

            // if there are no more drawables at this z order then destroy the
            // set for this order
            if (sod->size() == 0)
                parent.widgets.destroy(z_order_value);

            parent.widget_set.remove(this,junk);

            // now unregister this drawable from all the events it has registered for.
            if (events & MOUSE_MOVE)
                parent.mouse_move.remove(this,junk);
            if (events & MOUSE_CLICK)
                parent.mouse_click.remove(this,junk);
            if (events & MOUSE_WHEEL)
                parent.mouse_wheel.remove(this,junk);
            if (events & WINDOW_RESIZED)
                parent.window_resized.remove(this,junk);
            if (events & KEYBOARD_EVENTS)
                parent.keyboard.remove(this,junk);
            if (events & FOCUS_EVENTS)
                parent.focus.remove(this,junk);
            if (events & WINDOW_MOVED)
                parent.window_moved.remove(this,junk);
            if (events & STRING_PUT)
                parent.string_put.remove(this,junk);
        }
    }

// ----------------------------------------------------------------------------------------

    drawable::
    ~drawable (
    )
    {
        DLIB_ASSERT(events_are_enabled() == false,
            "\tdrawable::~drawable()"
            << "\n\tYou must disable events for drawable objects in their destructor by calling disable_events()."
            << "\n\tthis:     " << this
            );
        disable_events();
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_DRAWABLe_CPP_

