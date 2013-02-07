// Copyright (C) 2005  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.

#undef DLIB_DRAWABLe_ABSTRACT_
#ifdef DLIB_DRAWABLe_ABSTRACT_

#include "../gui_core.h"
#include "fonts_abstract.h"
#include "canvas_drawing_abstract.h"

namespace dlib
{

    /*!
        GENERAL REMARKS
            This file defines the drawable interface class and the drawable_window which
            is just a window that is capable of displaying drawable objects (i.e. objects
            that implement the drawable interface).  

            The drawable interface is a simple framework for creating more complex 
            graphical widgets.  It provides a default set of functionality and a 
            set of events which a gui widget may use.

        THREAD SAFETY
            All objects and functions defined in this file are thread safe.  You may
            call them from any thread without serializing access to them.
    !*/

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // class drawable_window
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    class drawable_window : public base_window
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object represents a window on the desktop that is capable of 
                containing drawable objects.

            INITIAL STATE
                The initial state of the drawable_window is to be hidden.  This means 
                you need to call show() to make it appear.

            EVENTS
                The drawable_window object uses all the events provided by base_window
                except for the on_window_close() event.  This means that if you
                define handlers for these events yourself you will have to call
                the drawable_window's version of them so that the drawable_window 
                can continue to process and forward these events to its drawable 
                objects.                
        !*/
    public:

        drawable_window (
            bool resizable = true,
            bool undecorated = false
        );
        /*!
            requires
                - if (undecorated == true) then
                    - resizable == false
            ensures
                - #*this has been properly initialized 
                - #background_color() == rgb_pixel(212,208,200)
                - if (resizable == true) then 
                    - this window will be resizable by the user
                - else 
                    - this window will not be resizable by the user
                - if (undecorated == true) then
                    - this window will not have any graphical elements outside
                      of its drawable area or appear in the system task bar.
                      (e.g. a popup menu)
            throws
                - std::bad_alloc
                - dlib::thread_error
                - dlib::gui_error
                    This exception is thrown if there is an error while 
                    creating this window.
        !*/

        virtual ~drawable_window(
        )=0;
        /*!
            ensures
                - if (this window has not already been closed) then
                    - closes the window
                - does NOT trigger the on_window_close() event
                - all resources associated with *this have been released                
        !*/

        void set_background_color (
            unsigned long red,
            unsigned long green,
            unsigned long blue
        );
        /*!
            ensures
                - #background_color().red == red
                - #background_color().green == green 
                - #background_color().blue == blue 
        !*/

        rgb_pixel background_color (
        ) const;
        /*!
            ensures
                - returns the background color this window paints its canvas
                  with before it passes it onto its drawable widgets
        !*/

    private:
        // restricted functions
        drawable_window(drawable_window&);        // copy constructor
        drawable_window& operator=(drawable_window&);    // assignment operator
        
        friend class drawable;
    };

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
                top() == 0
                left() == 0
                right() == -1 
                bottom() == -1 
                get_rect().is_empty() == true
                is_hidden() == false 
                is_enabled() == true
                z_order() == 0
                main_font() == default_font::get_font()
            
            WHAT THIS OBJECT REPRESENTS
                This is an interface that all drawable widgets implement.  It 
                provides a standard method (draw()) to draw a widget onto a canvas 
                and many other convenient functions for drawable objects.

            EVENT FORWARDING
                All the events that come to a drawable object are forwarded from its
                parent window.  Additionally, there is no filtering.  This means that
                if a drawable registers to receive a certain kind of event then whenever
                its parent window receives that event the drawable object will get a 
                forwarded copy of it as well even if the event occurred outside the
                drawable's rectangle. 

                The only events that have anything in the way of filtering are the 
                draw() and on_user_event() events.  draw() is only called on a drawable 
                object when that object is not hidden.  on_user_event() is only called
                for drawables that the on_user_event()'s first argument specifically 
                references.  All other events are not filtered at all though.

            Z ORDER
                Z order defines the order in which drawable objects are drawn.  The
                lower numbered drawables are drawn first and then the higher numbered
                ones.  So a drawable with a z order of 0 is drawn before one with a
                z order of 1 and so on.  
        !*/

    public:

        friend class drawable_window;

        drawable (
            drawable_window& w,
            unsigned long events = 0
        ) : 
            m(w.wm),
            parent(w),
            hidden(false),
            enabled(true)
        {}
        /*!
            ensures 
                - #*this is properly initialized 
                - #parent_window() == w
                - #*this will not receive any events or draw() requests until 
                  enable_events() is called
                - once events_are_enabled() == true this drawable will receive
                  the on_user_event() event. (i.e. you always get this event, you don't
                  have to enable it by setting something in the events bitset).
                - if (events & MOUSE_MOVE) then
                    - once events_are_enabled() == true this drawable will receive 
                      the following events related to mouse movement: on_mouse_move, 
                      on_mouse_leave, and on_mouse_enter.
                - if (events & MOUSE_CLICK) then
                    - once events_are_enabled() == true this drawable will receive 
                      the following events related to mouse clicks: on_mouse_down and 
                      on_mouse_up.
                - if (events & MOUSE_WHEEL) then
                    - once events_are_enabled() == true this drawable will receive 
                      the following events related to mouse wheel scrolling: 
                      on_wheel_up and on_wheel_down.
                - if (events & WINDOW_RESIZED) then
                    - once events_are_enabled() == true this drawable will receive 
                      the following event related to its parent window resizing:  
                      on_window_resized.    
                - if (events & KEYBOARD_EVENTS) then
                    - once events_are_enabled() == true this drawable will receive 
                      the following keyboard event: on_keydown.                
                - if (events & FOCUS_EVENTS) then
                    - once events_are_enabled() == true this drawable will receive 
                      the following focus events: on_focus_gained and on_focus_lost.                
                - if (events & WINDOW_MOVED) then
                    - once events_are_enabled() == true this drawable will receive 
                      the following event related to its parent window moving:  
                      on_window_moved.    
                - if (events & STRING_PUT) then
                    - once events_are_enabled() == true this drawable will receive 
                      the following event related to wide character string input:  
                      on_string_put.    
            throws
                - std::bad_alloc
                - dlib::thread_error
        !*/

        virtual ~drawable (
        );
        /*!
            requires
                - events_are_enabled() == false
            ensures
                - any resources associated with *this have been released
                - *this has been removed from its containing window parent_window() and
                  its parent window will no longer try to dispatch events to it.
                  Note that this does not trigger a redraw of the parent window.  If you 
                  want to do that you must do it yourself.
        !*/

        long z_order (
        ) const;
        /*!
            ensures
                - returns the z order for this drawable.  
        !*/

        virtual void set_z_order (
            long order
        );
        /*!
            ensures
                - #z_order() == order
                - if (events_are_enabled() == true) then
                    - parent_window() is updated to reflect the new state of #*this 
            throws
                - std::bad_alloc
        !*/

        const rectangle get_rect (
        ) const;
        /*!
            ensures
                - returns the rectangle that defines the area and position of this 
                  drawable inside its containing window parent_window().
        !*/

        long bottom (
        ) const;
        /*!
            ensures
                - returns get_rect().bottom()
        !*/

        long top (
        ) const;
        /*!
            ensures
                - returns get_rect().top()
        !*/

        long left (
        ) const;
        /*!
            ensures
                - returns get_rect().left()
        !*/

        long right (
        ) const;
        /*!
            ensures
                - returns get_rect().right()
        !*/

        unsigned long width (
        ) const;
        /*!
            ensures
                - returns get_rect().width()
        !*/

        unsigned long height (
        ) const;
        /*!
            ensures
                - returns get_rect().height()
        !*/

        virtual void set_pos (
            long x,
            long y
        );
        /*! 
            ensures
                - #top() == y
                - #left() == x
                - #width() == width()
                - #height() == height()
                - if (events_are_enabled() == true) then
                    - parent_window() is updated to reflect the new state of #*this 
                - i.e. This just sets the upper left corner of this drawable to the
                  location (x,y)
        !*/

        bool is_enabled (
        ) const;
        /*!
            ensures
                - returns true if this object is enabled and false otherwise.
                  (it is up to derived classes to define exactly what it means to be
                  "enabled")
        !*/

        virtual void enable (
        );
        /*!
            ensures
                - #is_enabled() == true
                - if (events_are_enabled() == true) then
                    - parent_window() is updated to reflect the new state of #*this 
        !*/

        virtual void disable (
        );
        /*!
            ensures
                - #is_enabled() == false
                - if (events_are_enabled() == true) then
                    - parent_window() is updated to reflect the new state of #*this 
        !*/

        virtual void set_main_font (
            const shared_ptr_thread_safe<font>& f
        );
        /*!
            ensures
                - #main_font() == f
                - if (events_are_enabled() == true) then
                    - parent_window() is updated to reflect the new state of #*this 
        !*/

        const shared_ptr_thread_safe<font> main_font (
        ) const;
        /*!
            ensures
                - returns the current main font being used by this widget
        !*/

        bool is_hidden (
        ) const;
        /*!
            ensures
                - returns true if this object is NOT currently displayed on parent_window()
                  and false otherwise.
        !*/

        virtual void show (
        );
        /*!
            ensures
                - #is_hidden() == false
                - if (events_are_enabled() == true) then
                    - parent_window() is updated to reflect the new state of #*this 
        !*/

        virtual void hide (
        );
        /*!
            ensures
                - #is_hidden() == true
                - if (events_are_enabled() == true) then
                    - parent_window() is updated to reflect the new state of #*this 
        !*/

        drawable_window& parent_window (
        );
        /*! 
            ensures
                - returns a reference to the drawable_window that this drawable is 
                  being drawn on and receiving events from.
        !*/

        const drawable_window& parent_window (
        ) const;
        /*! 
            ensures
                - returns a const reference to the drawable_window that this drawable 
                  is being drawn on and receiving events from.
        !*/

        virtual int next_free_user_event_number (
        )const { return 0; }
        /*!
            ensures
                - returns the smallest number, i, that is the next user event number you 
                  can use in calls to parent.trigger_user_event((void*)this,i).
                - This function exists because of the following scenario.  Suppose
                  you make a class called derived1 that inherits from drawable and 
                  in derived1 you use a user event to do something.  Then suppose 
                  you inherit from derived1 to make derived2.  Now in derived2 you 
                  may want to use a user event to do something as well.  How are you
                  to know which user event numbers are in use already?  This function
                  solves that problem.  You would define derived1::next_free_user_event_number()
                  so that it returned a number bigger than any user event numbers used by
                  derived1 or its ancestors.  Then derived2 could just call 
                  derived1::next_free_user_event_number() to find out what numbers it could use.
        !*/

    protected:   
        /*!A drawable_protected_variables 
            
            These protected members are provided because they are needed to 
            implement drawable widgets.
        !*/

        // This is the rectangle that is returned by get_rect()
        rectangle rect;

        // This is the mutex used to serialize access to this class. 
        const rmutex& m;

        // This is the parent window of this drawable
        drawable_window& parent;

        // This is the bool returned by is_hidden()
        bool hidden;

        // This is the bool returned by is_enabled()
        bool enabled;

        // This is the font pointer returned by main_font()
        shared_ptr_thread_safe<font> mfont;

        // This is the x coordinate that we last saw the mouse at or -1 if the mouse
        // is outside the parent window.
        const long& lastx;

        // This is the y coordinate that we last saw the mouse at or -1 if the mouse
        // is outside the parent window.
        const long& lasty;


        void enable_events (
        );
        /*!
            ensures
                - #events_are_enabled() == true
        !*/

        void disable_events (
        );
        /*!
            ensures
                - #events_are_enabled() == false
        !*/

        bool events_are_enabled (
        ) const;
        /*!
            ensures
                - returns true if this object is receiving events and draw()
                  requests from its parent window.
                - returns false otherwise
        !*/

        // ---------------- EVENT HANDLERS ------------------

        virtual void on_user_event (
            int i
        ){}
        /*!
            requires
                - events_are_enabled() == true
                - mutex m is locked
                - is called whenever the parent window receives an on_user_event(p,i) event
                  where p == this.  (i.e. this is just a redirect of on_user_event for
                  cases where the first argument of on_user_event is equal to the 
                  this pointer).
            ensures
                - does not change the state of mutex m. 
        !*/

        virtual void on_window_resized(
        ){}
        /*!
            requires
                - events_are_enabled() == true
                - mutex m is locked
                - this is just the base_window::on_window_resized() event forwarded to 
                  this object.  See the gui_core specs for the details about this event.
            ensures
                - does not change the state of mutex m. 
        !*/
               
        virtual void on_window_moved(
        ){}
        /*!
            requires
                - events_are_enabled() == true
                - mutex m is locked
                - this is just the base_window::on_window_moved() event forwarded to 
                  this object.  See the gui_core specs for the details about this event.
            ensures
                - does not change the state of mutex m. 
        !*/
               
        virtual void on_mouse_down (
            unsigned long btn,
            unsigned long state,
            long x,
            long y,
            bool is_double_click
        ){}
        /*!
            requires
                - events_are_enabled() == true
                - mutex m is locked
                - this is just the base_window::on_mouse_down() event forwarded to 
                  this object.  See the gui_core specs for the details about this event.
            ensures
                - does not change the state of mutex m. 
        !*/

        virtual void on_mouse_up (
            unsigned long btn,
            unsigned long state,
            long x,
            long y
        ){}
        /*!
            requires
                - events_are_enabled() == true
                - mutex m is locked
                - this is just the base_window::on_mouse_up() event forwarded to 
                  this object.  See the gui_core specs for the details about this event.
            ensures
                - does not change the state of mutex m. 
        !*/

        virtual void on_mouse_move (
            unsigned long state,
            long x,
            long y
        ){}
        /*!
            requires
                - events_are_enabled() == true
                - mutex m is locked
                - x == lastx
                - y == lasty
                - this is just the base_window::on_mouse_move() event forwarded to 
                  this object.  See the gui_core specs for the details about this event.
            ensures
                - does not change the state of mutex m. 
        !*/

        virtual void on_mouse_leave (
        ){}
        /*!
            requires
                - events_are_enabled() == true
                - mutex m is locked
                - this is just the base_window::on_mouse_leave() event forwarded to 
                  this object.  See the gui_core specs for the details about this event.
            ensures
                - does not change the state of mutex m. 
        !*/

        virtual void on_mouse_enter (
        ){}
        /*!
            requires
                - events_are_enabled() == true
                - mutex m is locked
                - this is just the base_window::on_mouse_enter() event forwarded to 
                  this object.  See the gui_core specs for the details about this event.
            ensures
                - does not change the state of mutex m. 
        !*/

        virtual void on_wheel_up (
            unsigned long state
        ){}
        /*!
            requires
                - events_are_enabled() == true
                - mutex m is locked
                - this is just the base_window::on_wheel_up() event forwarded to 
                  this object.  See the gui_core specs for the details about this event.
            ensures
                - does not change the state of mutex m. 
        !*/

        virtual void on_wheel_down (
            unsigned long state
        ){}
        /*!
            requires
                - events_are_enabled() == true
                - mutex m is locked
                - this is just the base_window::on_wheel_down() event forwarded to 
                  this object.  See the gui_core specs for the details about this event.
            ensures
                - does not change the state of mutex m. 
        !*/

        virtual void on_focus_gained (
        ){}
        /*!
            requires
                - events_are_enabled() == true
                - mutex m is locked
                - this is just the base_window::on_focus_gained() event forwarded to 
                  this object.  See the gui_core specs for the details about this event.
            ensures
                - does not change the state of mutex m. 
        !*/

        virtual void on_focus_lost (
        ){}
        /*!
            requires
                - events_are_enabled() == true
                - mutex m is locked
                - this is just the base_window::on_focus_lost() event forwarded to 
                  this object.  See the gui_core specs for the details about this event.
            ensures
                - does not change the state of mutex m. 
        !*/

        virtual void on_keydown (
            unsigned long key,
            bool is_printable,
            unsigned long state
        ){}
        /*!
            requires
                - events_are_enabled() == true
                - mutex m is locked
                - this is just the base_window::on_keydown() event forwarded to 
                  this object.  See the gui_core specs for the details about this event.
            ensures
                - does not change the state of mutex m. 
        !*/

        virtual void on_string_put (
            const std::wstring &str
        ){}
        /*!
            requires
                - events_are_enabled() == true
                - mutex m is locked
                - this is just the base_window::on_put_string() event forwarded to 
                  this object.  See the gui_core specs for the details about this event.
            ensures
                - does not change the state of mutex m. 
        !*/

        virtual void draw (
            const canvas& c
        ) const=0;
        /*!
            requires
                - events_are_enabled() == true
                - mutex m is locked
                - is_hidden() == false
                - is called by parent_window() when it needs to repaint itself.
                - c == the canvas object for the area of parent_window() that needs
                  to be repainted.
            ensures
                - does not change the state of mutex m. 
                - draws the area of *this that intersects with the canvas onto
                  the canvas object c.
        !*/

    private:

        // restricted functions
        drawable(drawable&);        // copy constructor
        drawable& operator=(drawable&);    // assignment operator
    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_DRAWABLe_ABSTRACT_

