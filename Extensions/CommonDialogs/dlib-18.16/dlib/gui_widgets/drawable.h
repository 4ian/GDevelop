// Copyright (C) 2005  Davis E. King (davis@dlib.net), Keita Mochizuki
// License: Boost Software License   See LICENSE.txt for the full license.

#ifndef DLIB_DRAWABLe_
#define DLIB_DRAWABLe_

#include "drawable_abstract.h"
#include "../gui_core.h"
#include "../set.h"
#include "../binary_search_tree.h"
#include "../algs.h"
#include "../pixel.h"
#include "fonts.h"
#include "../matrix.h"
#include "canvas_drawing.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // class drawable_window  
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    class drawable;
    class drawable_window : public base_window
    {
        /*!
            INITIAL VALUE
                - lastx == -1
                - lasty == -1
                - event_id == 1

            CONVENTION
                - bg_color == background_color()

                - widgets == this binary search tree contains every drawable that is in
                  this window.  It is a mapping of each drawable's z-order to a pointer
                  to said drawable.
                - widget_set == a set that contains all the widgets in this window and
                  want to receive events.

                - mouse_move == this is a set of drawables that are in this window and 
                  want to receive the mouse movement events.
                - mouse_wheel == this is a set of drawables that are in this window and 
                  want to receive the mouse wheel events.
                - mouse_click == this is a set of drawables that are in this window and 
                  want to receive the mouse click events.
                - window_resized == this is a set of drawables that are in this window and 
                  want to receive the window_resized event.
                - keyboard == this is a set of drawables that are in this window and 
                  want to receive keyboard events.
                - focus == this is a set of drawables that are in this window and 
                  want to receive focus events.
                - window_moved == this is a set of drawables that are in this window and 
                  want to receive window move events.

                - lastx == the x coordinate that we last saw the mouse at or -1 if the 
                  mouse is outside this window.
                - lasty == the y coordinate that we last saw the mouse at or -1 if the 
                  mouse is outside this window.

                - event_id == a number we use to tag events so we don't end up sending
                  an event to a drawable more than once.  This could happen if one of the
                  event handlers does something to reset the enumerator while we are
                  dispatching events (e.g. creating a new widget).
        !*/
    public:

        drawable_window(
            bool resizable = true,
            bool undecorated = false
        ) : 
            base_window(resizable,undecorated),
            bg_color(rgb_pixel(212,208,200)),
            lastx(-1),
            lasty(-1),
            event_id(1)
        {}

        void set_background_color (
            unsigned long red,
            unsigned long green,
            unsigned long blue
        );

        rgb_pixel background_color (
        ) const;

        virtual inline ~drawable_window()=0;

    private:

        void paint (
            const canvas& c
        );

    protected:

        void on_window_resized(
        );

        void on_window_moved(
        );
               
        void on_mouse_down (
            unsigned long btn,
            unsigned long state,
            long x,
            long y,
            bool is_double_click
        );

        void on_mouse_up (
            unsigned long btn,
            unsigned long state,
            long x,
            long y
        );

        void on_mouse_move (
            unsigned long state,
            long x,
            long y
        );

        void on_mouse_leave (
        );

        void on_mouse_enter (
        );

        void on_wheel_up (
            unsigned long state
        );

        void on_wheel_down (
            unsigned long state
        );
        
        void on_focus_gained (
        );

        void on_focus_lost (
        );

        void on_keydown (
            unsigned long key,
            bool is_printable,
            unsigned long state
        );

        void on_string_put (
            const std::wstring &str
        );

        void on_user_event (
            void* p,
            int i
        );

    private:
        
        friend class drawable;


        rgb_pixel bg_color;

        typedef set<drawable*>::kernel_1a_c set_of_drawables;

        binary_search_tree<long,set_of_drawables>::kernel_1a_c widgets;

        set_of_drawables widget_set;
        set_of_drawables mouse_move;
        set_of_drawables mouse_wheel;
        set_of_drawables mouse_click;
        set_of_drawables window_resized;
        set_of_drawables keyboard;
        set_of_drawables focus;
        set_of_drawables window_moved;
        set_of_drawables string_put;

        long lastx, lasty;
        unsigned long event_id;


        // restricted functions
        drawable_window(drawable_window&);        // copy constructor
        drawable_window& operator=(drawable_window&);    // assignment operator


    };

    drawable_window::~drawable_window(){ close_window();}

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // class drawable  
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    enum 
    {
        MOUSE_MOVE = 1,
        MOUSE_CLICK = 2,
        MOUSE_WHEEL = 4,
        WINDOW_RESIZED = 8,
        KEYBOARD_EVENTS = 16,
        FOCUS_EVENTS = 32,
        WINDOW_MOVED = 64,
        STRING_PUT = 128
    };

    class drawable 
    {

        /*!
            INITIAL VALUE 
                - enabled_events == false
                - event_id == 0

            CONVENTION
                - events == a bitset specifying what events this drawable is to receive.

                - z_order_value == z_order()

                - if (this drawable has been added to the parent window's sets and
                  binary search tree) then
                    - enabled_events == true
                - else
                    - enabled_events == false

                - event_id == the id of the last event we got from our parent window
        !*/

    public:

        friend class drawable_window;

        drawable (
            drawable_window& w,
            unsigned long events_ = 0
        ) :
            m(w.wm),
            parent(w),
            hidden(false),
            enabled(true),
            lastx(w.lastx),
            lasty(w.lasty),
            mfont(default_font::get_font()),
            z_order_value(0),
            events(events_),
            enabled_events(false),
            event_id(0)
        {}

        virtual ~drawable (
        );

        long z_order (
        ) const
        {
            m.lock();
            long temp = z_order_value;
            m.unlock();
            return temp;
        }

        virtual void set_z_order (
            long order
        );

        const rectangle get_rect (
        ) const 
        {
            auto_mutex M(m);
            return rect;
        }

        long bottom (
        ) const 
        { 
            auto_mutex M(m); 
            return rect.bottom(); 
        }

        long top (
        ) const 
        { 
            auto_mutex M(m); 
            return rect.top(); 
        }

        long left (
        ) const 
        { 
            auto_mutex M(m); 
            return rect.left(); 
        }

        long right (
        ) const 
        { 
            auto_mutex M(m); 
            return rect.right(); 
        }

        long width (
        ) const 
        { 
            auto_mutex M(m); 
            return rect.width(); 
        }

        long height (
        ) const 
        { 
            auto_mutex M(m); 
            return rect.height(); 
        }

        bool is_enabled (
        ) const
        {
            auto_mutex M(m);
            return enabled;
        }

        virtual void enable (
        ) 
        {
            auto_mutex M(m);
            enabled = true;
            parent.invalidate_rectangle(rect);
        }

        virtual void disable (
        ) 
        {
            auto_mutex M(m);
            enabled = false;
            parent.invalidate_rectangle(rect);
        }

        virtual void set_main_font (
            const shared_ptr_thread_safe<font>& f
        )
        {
            auto_mutex M(m);
            mfont = f;
            parent.invalidate_rectangle(rect);
        }

        const shared_ptr_thread_safe<font> main_font (
        ) const
        {
            auto_mutex M(m);
            return mfont;
        }

        bool is_hidden (
        ) const
        {
            auto_mutex M(m);
            return hidden;
        }

        virtual void set_pos (
            long x,
            long y
        )
        {
            m.lock();       
            rectangle old(rect);            

            const unsigned long width = rect.width();
            const unsigned long height = rect.height();
            rect.set_top(y);
            rect.set_left(x);
            rect.set_right(static_cast<long>(x+width)-1);
            rect.set_bottom(static_cast<long>(y+height)-1);
            
            parent.invalidate_rectangle(rect+old);
            m.unlock();
        }

        virtual void show (
        )
        {
            m.lock();
            hidden = false;
            parent.invalidate_rectangle(rect);
            m.unlock();
        }

        virtual void hide (
        )
        {
            m.lock();
            hidden = true;
            parent.invalidate_rectangle(rect);
            m.unlock();
        }

        base_window& parent_window (
        ) { return parent; }

        const base_window& parent_window (
        ) const { return parent; }

        virtual int next_free_user_event_number (
        )const { return 0; }

    protected:   
        rectangle rect;
        const rmutex& m;
        drawable_window& parent;
        bool hidden;
        bool enabled;
        const long& lastx;
        const long& lasty;
        shared_ptr_thread_safe<font> mfont;

        
        void enable_events (
        );

        bool events_are_enabled (
        ) const { auto_mutex M(m); return enabled_events; }

        void disable_events (
        );

    private:

        long z_order_value;
        const unsigned long events;
        bool enabled_events;
        unsigned long event_id;


        // restricted functions
        drawable(drawable&);        // copy constructor
        drawable& operator=(drawable&);    // assignment operator


    protected:

        virtual void draw (
            const canvas& c
        ) const=0;

        virtual void on_user_event (
            int 
        ){}

        virtual void on_window_resized(
        ){}

        virtual void on_window_moved(
        ){}
               
        virtual void on_mouse_down (
            unsigned long ,
            unsigned long ,
            long ,
            long ,
            bool 
        ){}

        virtual void on_mouse_up (
            unsigned long ,
            unsigned long ,
            long ,
            long 
        ){}

        virtual void on_mouse_move (
            unsigned long ,
            long ,
            long 
        ){}

        virtual void on_mouse_leave (
        ){}

        virtual void on_mouse_enter (
        ){}

        virtual void on_wheel_up (
            unsigned long 
        ){}

        virtual void on_wheel_down (
            unsigned long 
        ){}

        virtual void on_focus_gained (
        ){}

        virtual void on_focus_lost (
        ){}

        virtual void on_keydown (
            unsigned long ,
            bool ,
            unsigned long 
        ){}

        virtual void on_string_put (
            const std::wstring&
        ){}
    };

// ----------------------------------------------------------------------------------------

}

#ifdef NO_MAKEFILE
#include "drawable.cpp"
#endif

#endif // DLIB_DRAWABLe_

