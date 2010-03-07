// Copyright (C) 2005  Davis E. King (davisking@users.sourceforge.net), Keita Mochizuki
// License: Boost Software License   See LICENSE.txt for the full license.

#undef DLIB_WIDGETs_ABSTRACT_
#ifdef DLIB_WIDGETs_ABSTRACT_

#include "fonts_abstract.h"
#include "drawable_abstract.h"
#include "base_widgets_abstract.h"

#include "../gui_core.h"
#include <string>
#include "../interfaces/enumerable.h"
#include "style_abstract.h"

namespace dlib
{

    /*!
        GENERAL REMARKS
            This component is a collection of various windowing widgets such as buttons,
            labels, text boxes, and so on.  This component also includes the drawable
            interface, drawable_window, and font handling objects.  The file you are
            currently viewing defines all the high level graphical widgets which are 
            provided by this component that can appear in a drawable_window.  To view 
            the specifications for the other members of this component look at 
            fonts_abstract.h, base_widgets_abstract.h, and drawable_abstract.h

        THREAD SAFETY
            All objects and functions defined in this file are thread safe.  You may
            call them from any thread without serializing access to them.

        EVENT HANDLERS
            Note that all event handlers, including the user registered callback
            functions, are executed in the event handling thread. 
    !*/

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // function open_file_box(), open_existing_file_box(), and save_file_box()
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    void open_file_box (
        T& object,
        void (T::*event_handler)(const std::string&) 
    );
    /*!
        requires
            - event_handler == a valid pointer to a member function of object T.
        ensures
            - Displays a window titled "Open File" that will allow the user to select a 
              file.  
            - The displayed window will start out showing the directory get_current_dir()
              (i.e. it starts in the current working directory)
            - The event_handler function is called on object if the user selects
              a file.  If the user closes the window without selecting a file
              then nothing occurs.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    void open_existing_file_box (
        T& object,
        void (T::*event_handler)(const std::string&) 
    );
    /*!
        requires
            - event_handler == a valid pointer to a member function of object T.
        ensures
            - Displays a window titled "Open File" that will allow the user to select 
              a file.  But only a file that already exists.
            - The displayed window will start out showing the directory get_current_dir()
              (i.e. it starts in the current working directory)
            - The event_handler function is called on object if the user selects
              a file.  If the user closes the window without selecting a file
              then nothing occurs.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    void save_file_box (
        T& object,
        void (T::*event_handler)(const std::string&) 
    );
    /*!
        requires
            - event_handler == a valid pointer to a member function of object T.
        ensures
            - Displays a window titled "Save File" that will allow the user to select 
              a file.  
            - The displayed window will start out showing the directory get_current_dir()
              (i.e. it starts in the current working directory)
            - The event_handler function is called on object if the user selects
              a file.  If the user closes the window without selecting a file
              then nothing occurs.
    !*/

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // function message_box() 
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    void message_box (
        const std::string& title,
        const std::string& message
    );
    /*!
        ensures
            - displays a message box with the given title and message.  It will have a 
              single button and when the user clicks it the message box will go away.
            - this function does not block but instead returns immediately.
    !*/

    void message_box_blocking (
        const std::string& title,
        const std::string& message
    );
    /*!
        ensures
            - displays a message box with the given title and message.  It will have a 
              single button and when the user clicks it the message box will go away.
            - this function blocks until the user clicks on the message box and 
              causes it to go away.
    !*/

    template <
        typename T
        >
    void message_box (
        const std::string& title,
        const std::string& message,
        T& object,
        void (T::*event_handler)() 
    );
    /*!
        requires
            - event_handler == a valid pointer to a member function of object T.
        ensures
            - Displays a message box with the given title and message.  It will have a 
              single button and when the user clicks it the message box will go away.
            - The event_handler function is called on object when the user clicks
              ok or otherwise closes the message box window. 
            - this function does not block but instead returns immediately.
    !*/

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // class label
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    class label : public drawable
    {
        /*!
            INITIAL VALUE
                text() == ""
                the text color will be black

            WHAT THIS OBJECT REPRESENTS
                This object represents a simple text label.  The size of the label
                is automatically set to be just big enough to contain its text.
        !*/

    public:

        label(  
            drawable_window& w
        );
        /*!
            ensures 
                - #*this is properly initialized 
                - #*this has been added to window w
                - #parent_window() == w
            throws
                - std::bad_alloc
                - dlib::thread_error
        !*/

        virtual ~label(
        );
        /*!
            ensures
                - all resources associated with *this have been released
        !*/

        void set_text (const std::wstring& text);
        void set_text (const dlib::ustring& text);
        void set_text (
            const std::string& text
        );
        /*!
            ensures
                - #text() == text
            throws
                - std::bad_alloc
        !*/

        const std::wstring  wtext () const;
        const dlib::ustring utext () const;
        const std::string   text (
        ) const;
        /*!
            ensures
                - returns the text of this label
            throws
                - std::bad_alloc
        !*/

        void set_text_color (
            const rgb_pixel color
        );
        /*!
            ensures
                - #text_color() == color
        !*/

        const rgb_pixel text_color (
        ) const;
        /*! 
            ensures
                - returns the color used to draw the text in this widget
        !*/

    private:

        // restricted functions
        label(label&);        // copy constructor
        label& operator=(label&);    // assignment operator
    };

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // class toggle_button
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    class toggle_button : public button_action 
    {
        /*!
            INITIAL VALUE
                name() == ""
                is_checked() == false

            WHAT THIS OBJECT REPRESENTS
                This object represents a simple two state toggle button.  Is is either
                in the checked or unchecked state and when a user clicks on it it toggles its
                state.

                When this object is disabled it means it will not respond to user clicks.
        !*/

    public:

        toggle_button(  
            drawable_window& w
        );
        /*!
            ensures 
                - #*this is properly initialized 
                - #*this has been added to window w
                - #parent_window() == w
            throws
                - std::bad_alloc
                - dlib::thread_error
        !*/

        virtual ~toggle_button(
        );
        /*!
            ensures
                - all resources associated with *this have been released
        !*/

        void set_name (const std::wstring& name);
        void set_name (const dlib::ustring& name);
        void set_name (
            const std::string& name
        );
        /*!
            ensures
                - #name() == name
                - this toggle_button has been resized such that it is big enough to contain
                  the new name.
            throws
                - std::bad_alloc
        !*/

        void set_size (
            unsigned long width_,
            unsigned long height_
        );
        /*! 
            ensures
                - if (width and height are big enough to contain the name of this button) then
                    - #width() == width_
                    - #height() == height_
                    - #top() == top()
                    - #left() == left()
                    - i.e. The location of the upper left corner of this button stays the
                      same but its width and height are modified
        !*/

        void set_tooltip_text (const std::wstring& text);
        void set_tooltip_text (const dlib::ustring& text);
        void set_tooltip_text (
            const std::string& text
        );
        /*!
            ensures
                - #tooltip_text() == text
                - enables the tooltip for this toggle_button
        !*/

        const dlib::ustring tooltip_utext () const;
        const std::wstring  tooltip_wtext () const;
        const std::string   tooltip_text (
        ) const;
        /*!
            ensures
                - returns the text that is displayed in the tooltip for this toggle_button
        !*/

        template <
            typename style_type
            >
        void set_style (
            const style_type& style
        );
        /*!
            requires
                - style_type == a type that inherits from toggle_button_style
            ensures
                - this toggle_button object will draw itself using the given
                  button style
        !*/

        bool is_checked (
        ) const;
        /*!
            ensures
                - if (this box is currently checked) then
                    - returns true
                - else
                    - returns false
        !*/

        const std::wstring  wname () const;
        const dlib::ustring uname () const;
        const std::string   name (
        ) const;
        /*!
            ensures
                - returns the name of this toggle_button.  The name is a string
                  that appears to the right of the actual check box.
            throws
                - std::bad_alloc
        !*/

        void set_checked (
        );
        /*!
            ensures
                - #is_checked() == true 
        !*/

        void set_unchecked (
        );
        /*! 
            ensures
                - #is_checked() == false 
        !*/ 

        template <
            typename T
            >
        void set_click_handler (
            T& object,
            void (T::*event_handler)()
        );
        /*!
            requires
                - event_handler is a valid pointer to a member function in T 
            ensures
                - the event_handler function is called on object when the toggle_button is 
                  toggled by the user. 
                - this event is NOT triggered by calling set_checked() or set_unchecked().
                - any previous calls to this function are overridden by this new call.  
                  (i.e. you can only have one event handler associated with this 
                  event at a time)
            throws
                - std::bad_alloc
        !*/

        template <
            typename T
            >
        void set_click_handler (
            T& object,
            void (T::*event_handler)(toggle_button& self)
        );
        /*!
            requires
                - event_handler is a valid pointer to a member function in T.
            ensures
                - the event_handler function is called on object when the toggle_button is 
                  toggled by the user. self will be a reference to the toggle_button object
                  that the user clicked.
                - this event is NOT triggered by calling set_checked() or set_unchecked().
                - any previous calls to this function are overridden by this new call.  
                  (i.e. you can only have one event handler associated with this 
                  event at a time)
            throws
                - std::bad_alloc
        !*/

    private:

        // restricted functions
        toggle_button(toggle_button&);        // copy constructor
        toggle_button& operator=(toggle_button&);    // assignment operator
    };

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // class text_field
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    class text_field : public drawable
    {
        /*!
            INITIAL VALUE
                text() == ""
                width() == 10
                height() == a height appropriate for the font used.
                The text color will be black.

            WHAT THIS OBJECT REPRESENTS
                This object represents a simple one line text input field.  
        !*/

    public:

        text_field(  
            drawable_window& w
        );
        /*!
            ensures 
                - #*this is properly initialized 
                - #*this has been added to window w
                - #parent_window() == w
            throws
                - std::bad_alloc
                - dlib::thread_error
        !*/

        virtual ~text_field(
        );
        /*!
            ensures
                - all resources associated with *this have been released
        !*/

        template <
            typename style_type
            >
        void set_style (
            const style_type& style
        );
        /*!
            requires
                - style_type == a type that inherits from text_field_style 
            ensures
                - this text_field object will draw itself using the given
                  text field style
        !*/

        void set_text (const std::wstring& text);
        void set_text (const dlib::ustring& text);
        void set_text (
            const std::string& text
        );
        /*!
            requires
                - text.find_first_of('\n') == std::string::npos 
                  (i.e. there aren't any new lines in text)
            ensures
                - #text() == text
            throws
                - std::bad_alloc
        !*/

        const std::wstring  wtext () const;
        const dlib::ustring utext () const;
        const std::string   text (
        ) const;
        /*!
            ensures
                - returns the text of this text_field
            throws
                - std::bad_alloc
        !*/

        void set_width (
            unsigned long width_
        );
        /*! 
            ensures
                - if (width >= 10) then
                    - #width()  == width_
                    - #height() == height()
                    - #top()    == top()
                    - #left()   == left()
                    - i.e. The width of this drawable is set to the given width but 
                      nothing else changes.
        !*/

        void set_text_color (
            const rgb_pixel color
        );
        /*!
            ensures
                - #text_color() == color
        !*/

        const rgb_pixel text_color (
        ) const;
        /*! 
            ensures
                - returns the color used to draw the text in this widget
        !*/

        void set_background_color (
            const rgb_pixel color
        );
        /*!
            ensures
                - #background_color() == color
        !*/

        const rgb_pixel background_color (
        ) const;
        /*! 
            ensures
                - returns the color used to fill in the background of this widget
        !*/

        template <
            typename T
            >
        void set_text_modified_handler (
            T& object,
            void (T::*event_handler)()
        );
        /*!
            requires
                - event_handler is a valid pointer to a member function in T 
            ensures
                - the event_handler function is called on object when the text
                  in this text_field is modified by the user.
                - any previous calls to this function are overridden by this new call.  
                  (i.e. you can only have one event handler associated with this 
                  event at a time)
            throws
                - std::bad_alloc
        !*/

        template <
            typename T
            >
        void set_enter_key_handler (
            T& object,
            void (T::*event_handler)()
        );
        /*!
            requires
                - event_handler is a valid pointer to a member function in T 
            ensures
                - the event_handler function is called on object when this text field
                  has input focus and the user hits the enter key on their keyboard.
                - any previous calls to this function are overridden by this new call.  
                  (i.e. you can only have one event handler associated with this 
                  event at a time)
            throws
                - std::bad_alloc
        !*/

        template <
            typename T
            >
        void set_focus_lost_handler (
            T& object,
            void (T::*event_handler)()
        );
        /*!
            requires
                - event_handler is a valid pointer to a member function in T 
            ensures
                - the event_handler function is called on object when this object
                  loses input focus due to the user clicking outside the text field
                - any previous calls to this function are overridden by this new call.  
                  (i.e. you can only have one event handler associated with this 
                  event at a time)
            throws
                - std::bad_alloc
        !*/

    private:

        // restricted functions
        text_field(text_field&);        // copy constructor
        text_field& operator=(text_field&);    // assignment operator
    };

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // class check_box
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    class check_box : public toggle_button 
    {
        /*!
            This is just a toggle button with the style set to 
            toggle_button_style_check_box.
        !*/
    };

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // class radio_button
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    class radio_button : public toggle_button 
    {
        /*!
            This is just a toggle button with the style set to 
            toggle_button_style_radio_button.
        !*/
    };

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // class tabbed_display
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    class tabbed_display : public drawable
    {
        /*!
            INITIAL VALUE
                number_of_tabs() == 1
                selected_tab() == 0

            WHAT THIS OBJECT REPRESENTS
                This object represents a row of tabs that are user selectable.  

                When this object is disabled it means it will not respond to user clicks.
        !*/

    public:

        tabbed_display(  
            drawable_window& w
        );
        /*!
            ensures 
                - #*this is properly initialized 
                - #*this has been added to window w
                - #parent_window() == w
            throws
                - std::bad_alloc
                - dlib::thread_error
        !*/

        virtual ~tabbed_display(
        );
        /*!
            ensures
                - all resources associated with *this have been released
        !*/

        void set_size (
            unsigned long width_,
            unsigned long height_
        );
        /*! 
            ensures
                - if (width and height are big enough to contain the tabs) then
                    - #width() == width_
                    - #height() == height_
                    - #top() == top()
                    - #left() == left()
                    - i.e. The location of the upper left corner of this widget stays the
                      same but its width and height are modified
        !*/

        void set_number_of_tabs (
            unsigned long num
        );
        /*!
            requires
                - num > 0
            ensures
                - #number_of_tabs() == num
                - no tabs have any widget_groups associated with them.
                - for all valid idx:
                    - #tab_name(idx) == ""
            throws
                - std::bad_alloc
        !*/

        unsigned long selected_tab (
        ) const;
        /*!
            ensures
                - returns the index of the currently selected tab
        !*/

        unsigned long number_of_tabs (
        ) const;
        /*!
            ensures
                - returns the number of tabs in this tabbed_display
        !*/

        const std::wstring&  tab_wname (unsigned long idx) const;
        const dlib::ustring& tab_uname (unsigned long idx) const;
        const std::string&   tab_name (
            unsigned long idx
        ) const;
        /*!
            requires
                - idx < number_of_tabs()
            ensures
                - returns a const reference to the name of the tab given by idx
        !*/

        void set_tab_name (unsigned long idx, const std::wstring& new_name);
        void set_tab_name (unsigned long idx, const dlib::ustring& new_name);
        void set_tab_name (
            unsigned long idx,
            const std::string& new_name
        );
        /*!
            requires
                - idx < number_of_tabs()
            ensures
                - #tab_name(idx) == new_name
            throws
                - std::bad_alloc
        !*/

        void set_tab_group (
            unsigned long idx,
            widget_group& group
        );
        /*!
            requires
                - idx < number_of_tabs()
            ensures
                - if (is_hidden()) then
                    - group.is_hidden() == true
                - else
                    - whenever the tab with index idx is selected group.is_hidden() == false 
                    - whenever the tab with index idx is deselected group.is_hidden() == true 
                - whenever the position of *this changes the position of group will be
                  updated so that it is still inside the tabbed_display.  The position of group
                  will also be updated after this call to set_tab_group().
                - any previous calls to set_tab_group() with this index are overridden by this
                  new call.  (i.e. you can only have one widget_group associated with a single
                  tab at a time)
        !*/

        void fit_to_contents (
        );
        /*!
            ensures
                - Adjusts the size this tabbed_display so that it nicely contains 
                  all of its widget_group objects.   
                - does not change the position of this object. 
                  (i.e. the upper left corner of get_rect() remains at the same position)
        !*/

        template <
            typename T
            >
        void set_click_handler (
            T& object,
            void (T::*event_handler)(unsigned long new_idx, unsigned long old_idx)
        );
        /*!
            requires
                - event_handler is a valid pointer to a member function in T 
            ensures
                - The event_handler function is called on object when the user clicks
                  on a tab that isn't already selected.  new_idx will give the index of 
                  the newly selected tab and old_idx will give the index of the tab 
                  that was previously selected. 
                - any previous calls to this function are overridden by this new call.  
                  (i.e. you can only have one event handler associated with this 
                  event at a time)
            throws
                - std::bad_alloc
        !*/

    private:

        // restricted functions
        tabbed_display(tabbed_display&);        // copy constructor
        tabbed_display& operator=(tabbed_display&);    // assignment operator
    };

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // class named_rectangle
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    class named_rectangle : public drawable 
    {
        /*!
            INITIAL VALUE
                name() == ""

            WHAT THIS OBJECT REPRESENTS
                This object represents a simple named rectangle.  
        !*/

    public:

        named_rectangle(  
            drawable_window& w
        );
        /*!
            ensures 
                - #*this is properly initialized 
                - #*this has been added to window w
                - #parent_window() == w
            throws
                - std::bad_alloc
                - dlib::thread_error
        !*/

        virtual ~named_rectangle(
        );
        /*!
            ensures
                - all resources associated with *this have been released
        !*/

        void set_size (
            unsigned long width_,
            unsigned long height_
        );
        /*! 
            ensures
                - #width() == width_
                - #height() == height_
                - #top() == top()
                - #left() == left()
                - i.e. The location of the upper left corner of this widget stays the
                  same but its width and height are modified
        !*/

        void wrap_around (
            const rectangle& rect
        );
        /*!
            ensures
                - This object will be repositioned and sized so that it fits
                  around the given rectangle.
        !*/

        void set_name (const std::wstring& name);
        void set_name (const dlib::ustring& name);
        void set_name (
            const std::string& name
        );
        /*!
            ensures
                - #name() == name
            throws
                - std::bad_alloc
        !*/

        const std::wstring  wname () const;
        const dlib::ustring uname () const;
        const std::string   name (
        ) const;
        /*!
            ensures
                - returns the name of this named_rectangle
            throws
                - std::bad_alloc
        !*/

    private:

        // restricted functions
        named_rectangle(named_rectangle&);        // copy constructor
        named_rectangle& operator=(named_rectangle&);    // assignment operator
    };

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // class mouse_tracker
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    class mouse_tracker : public draggable 
    {
        /*!
            INITIAL VALUE
                draggable_area() == rectangle(0,0,500,500)

            WHAT THIS OBJECT REPRESENTS
                This object represents a simple draggable box that displays the 
                current location of the mouse.  

                Also, if you hold shift and left click on the parent window then the 
                mouse_tracker will place a single red pixel where you clicked and will
                display the mouse position relative to that point.
        !*/

    public:

        mouse_tracker(  
            drawable_window& w
        );
        /*!
            ensures 
                - #*this is properly initialized 
                - #*this has been added to window w
                - #parent_window() == w
            throws
                - std::bad_alloc
                - dlib::thread_error
        !*/

        virtual ~mouse_tracker(
        );
        /*!
            ensures
                - all resources associated with *this have been released
        !*/

    private:

        // restricted functions
        mouse_tracker(mouse_tracker&);        // copy constructor
        mouse_tracker& operator=(mouse_tracker&);    // assignment operator
    };

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // class list_box
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    class list_box : public scrollable_region, 
                     public enumerable<const std::string>
    {
        /*!
            INITIAL VALUE
                multiple_select_enabled() == false 
                size() == 0

            ENUMERATION ORDER
                The enumerator will iterate over the elements in the list_box from
                the 0th element to the (size()-1)th element.  i.e. (*this)[0] to
                (*this)[size()-1].

            WHAT THIS OBJECT REPRESENTS
                This object represents a simple textual list box.  It contains a 
                vertical list of strings which the user may select from.
        !*/

    public:

        list_box(  
            drawable_window& w
        );
        /*!
            ensures 
                - #*this is properly initialized 
                - #*this has been added to window w
                - #parent_window() == w
            throws
                - std::bad_alloc
                - dlib::thread_error
        !*/

        virtual ~list_box(
        );
        /*!
            ensures
                - all resources associated with *this have been released
        !*/

        template <
            typename style_type
            >
        void set_style (
            const style_type& style
        );
        /*!
            requires
                - style_type == a type that inherits from list_box_style 
            ensures
                - this list_box object will draw itself using the given style
        !*/

        void set_size (
            unsigned long width_,
            unsigned long height_
        );
        /*! 
            ensures
                - #width() == width_
                - #height() == height_
                - #top() == top()
                - #left() == left()
                - i.e. The location of the upper left corner of this widget stays the
                  same but its width and height are modified
        !*/

        bool is_selected (
            unsigned long index
        ) const;
        /*!
            requires
                - index < size()
            ensures
                - if (the item given by index is currently selected) then
                    - returns true
                - else
                    - returns false
        !*/

        void select (
            unsigned long index 
        );
        /*!
            requires
                - index < size()
            ensures
                - #is_selected(index) == true
        !*/

        void unselect (
            unsigned long index 
        );
        /*!
            requires
                - index < size()
            ensures
                - #is_selected(index) == false
        !*/

        template <typename T>
        void get_selected (
            T& list
        ) const;
        /*!
            requires
                - T == an implementation of dlib/queue/queue_kernel_abstract.h 
                - T::type == unsigned long
            ensures
                - #list == a list of all the currently selected indices for this list_box.
        !*/

        unsigned long get_selected (
        ) const;
        /*!
            requires
                - multiple_select_enabled() == false
            ensures
                - if (there is currently something selected) then
                    - returns the index of the selected item
                - else
                    - returns size()
        !*/

        template <typename T>
        void load (
            const T& list
        );
        /*!
            requires
                - T == compatible with dlib::enumerable<std::string>
            ensures
                - #size() == list.size()
                - Copies all the strings from list into *this in the order in which they are enumerated.
                  (i.e. The first one goes into (*this)[0], the second into (*this)[1], and so on...)
        !*/

        const std::string& operator[] (
            unsigned long index
        ) const;
        /*!
            requires
                - index < size()
            ensures
                - returns the name of the indexth item/row in this list box.
        !*/

        bool multiple_select_enabled (
        ) const;
        /*!
            ensures
                - if (this object will allow the user to select more than one item at a time) then
                    - returns true
                - else
                    - returns false
        !*/

        void enable_multiple_select (
        ); 
        /*!
            ensures
                - #multiple_select_enabled() == true
        !*/

        void disable_multiple_select (
        );
        /*!
            ensures
                - #multiple_select_enabled() == false
        !*/

        template <
            typename T
            >
        void set_double_click_handler (
            T& object,
            void (T::*event_handler)(unsigned long index)
        );
        /*!
            requires
                - event_handler is a valid pointer to a member function in T.
            ensures
                - The event_handler function is called on object when the user double 
                  clicks on one of the rows in this list box.  index gives the row 
                  number for the item the user clicked.
                - any previous calls to this function are overridden by this new call.  
                  (i.e. you can only have one event handler associated with this 
                  event at a time)
            throws
                - std::bad_alloc
        !*/

        template <
            typename T
            >
        void set_click_handler (
            T& object,
            void (T::*event_handler)(unsigned long index)
        );
        /*!
            requires
                - event_handler is a valid pointer to a member function in T.
            ensures
                - The event_handler function is called on object when the user  
                  clicks on one of the rows in this list box.  index gives the row 
                  number for the item the user clicked.  (Note that the second click
                  in a double click triggers the double click handler above instead
                  of this event)
                - any previous calls to this function are overridden by this new call.  
                  (i.e. you can only have one event handler associated with this 
                  event at a time)
            throws
                - std::bad_alloc
        !*/

    private:

        // restricted functions
        list_box(list_box&);        // copy constructor
        list_box& operator=(list_box&);    // assignment operator
    };

    class wlist_box : public scrollable_region, 
    public enumerable<const std::wstring>;
    /*!
        same as list_box except for std::wstring instead of std::string
    !*/

    class ulist_box : public scrollable_region, 
    public enumerable<const dlib::ustring>;
    /*!
        same as list_box except for dlib::ustring instead of std::string
    !*/
    
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // class menu_bar 
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    class menu_bar : public drawable
    {
        /*!
            INITIAL VALUE
                - number_of_menus() == 0

            WHAT THIS OBJECT REPRESENTS
                This object represents a menu bar that appears at the top of a
                window.
        !*/

    public:

        menu_bar(
            drawable_window& w
        );
        /*!
            ensures 
                - #*this is properly initialized 
                - #*this has been added to window w
                - #parent_window() == w
            throws
                - std::bad_alloc
                - dlib::thread_error
        !*/

        virtual ~menu_bar(
        );
        /*!
            ensures
                - all resources associated with *this have been released
        !*/

        void set_number_of_menus (
            unsigned long num
        );
        /*!
            ensures
                - #number_of_menus() == num
        !*/

        unsigned long number_of_menus (
        ) const;
        /*!
            ensures
                - returns the number of menus in this menu_bar
        !*/

        void set_menu_name (unsigned long idx, const std::wstring name, char underline_ch = '\0');
        void set_menu_name (unsigned long idx, const dlib::ustring name, char underline_ch = '\0');
        void set_menu_name (
            unsigned long idx,
            const std::string name,
            char underline_ch = '\0'
        );
        /*!
            requires
                - idx < number_of_menus()
            ensures
                - #menu_name(idx) == name
                - if (underline_ch is present in name) then
                    - The menu with index idx will have the first underline_ch character 
                      in its name underlined and users will be able to activate the menu
                      by hitting alt+underline_char
        !*/

        const std::wstring  menu_wname (unsigned long idx) const;
        const dlib::ustring menu_uname (unsigned long idx) const;
        const std::string   menu_name (
            unsigned long idx
        ) const;
        /*!
            requires
                - idx < number_of_menus()
            ensures
                - returns the name of the menu with index idx
        !*/

        popup_menu& menu (
            unsigned long idx
        );
        /*!
            requires
                - idx < number_of_menus()
            ensures
                - returns a non-const reference to the popup_menu for the menu with
                  index idx.
        !*/

        const popup_menu& menu (
            unsigned long idx
        ) const;
        /*!
            requires
                - idx < number_of_menus()
            ensures
                - returns a const reference to the popup_menu for the menu with
                  index idx.
        !*/

    private:

        // restricted functions
        menu_bar(menu_bar&);        // copy constructor
        menu_bar& operator=(menu_bar&);    // assignment operator

    };

// ----------------------------------------------------------------------------------------

    template <
        typename graph_type
        >
    class directed_graph_drawer : public zoomable_region 
    {
        /*!
            REQUIREMENTS ON graph_type
                - must be an implementation of directed_graph/directed_graph_kernel_abstract.h

            INITIAL VALUE
                - get_graph().size() == 0

            WHAT THIS OBJECT REPRESENTS
                This object represents a graphical widget that allows the user to draw
                a directed graph.  
                
                The user can create nodes by right clicking on the draw area and add 
                edges by selecting a node (via left clicking on it) and then holding 
                shift and clicking on the node that is to be the child node of the 
                selected node.
        !*/

    public:

        directed_graph_drawer (
            drawable_window& w
        );
        /*!
            ensures 
                - #*this is properly initialized 
                - #*this has been added to window w
                - #parent_window() == w
            throws
                - std::bad_alloc
                - dlib::thread_error
        !*/

        virtual ~directed_graph_drawer (
        );
        /*!
            ensures
                - all resources associated with *this have been released
        !*/

        const graph_type& graph (
        ) const;
        /*!
            requires
                - drawable::m is locked
            ensures
                - returns a const reference to the graph that this widget has been drawing
        !*/

        unsigned long number_of_nodes (
        ) const;
        /*!
            ensures
                - returns graph().number_of_nodes()
        !*/

        void clear_graph (
        );
        /*!
            ensures
                - #number_of_nodes() == 0
        !*/

        const typename graph_type::node_type& graph_node (
            unsigned long i
        ) const;
        /*!
            requires
                - drawable::m is locked
                - i < number_of_nodes()
            ensures
                - returns a const reference to get_graph().node(i)
        !*/

        typename graph_type::node_type& graph_node (
            unsigned long i
        );
        /*!
            requires
                - drawable::m is locked
                - i < number_of_nodes()
            ensures
                - returns a non-const reference to get_graph().node(i)
        !*/

        void save_graph (
            std::ostream& out
        );
        /*!
            ensures
                - saves the state of the graph to the output stream.  Does so in a 
                  way that not only preserves the state of the graph this->graph()
                  but also preserves the graphical layout of the graph in this 
                  GUI widget.
                - Also, the first part of the saved state is a serialized 
                  version of this->graph().  Thus, you can deserialize just the
                  this->graph() object from the serialized data if you like.
        !*/

        void load_graph (
            std::istream& in 
        );
        /*!
            ensures
                - loads a saved graph from the given input stream.  
        !*/

        void set_node_label (unsigned long i, const std::wstring& label);
        void set_node_label (unsigned long i, const dlib::ustring& label);
        void set_node_label (
            unsigned long i,
            const std::string& label
        );
        /*!
            requires
                - i < number_of_nodes()
            ensures
                - #node_label(i) == label
        !*/

        void set_node_color (
            unsigned long i,
            rgb_pixel color
        );
        /*!
            requires
                - i < number_of_nodes()
            ensures
                - #node_color(i) == color 
        !*/

        rgb_pixel node_color (
            unsigned long i
        ) const;
        /*!
            requires
                - i < number_of_nodes()
            ensures
                - returns the color used to draw node graph_node(i)
        !*/

        const std::wstring  node_wlabel (unsigned long i) const;
        const dlib::ustring node_ulabel (unsigned long i) const;
        const std::string   node_label (
            unsigned long i
        ) const;
        /*!
            requires
                - i < number_of_nodes()
            ensures
                - returns the text label for node graph_node(i)
        !*/

        template <
            typename T
            >
        void set_node_selected_handler (
            T& object,
            void (T::*event_handler_)(unsigned long node_index)
        );
        /*!
            requires
                - event_handler is a valid pointer to a member function in T 
            ensures
                - the event_handler function is called on object when the user selects
                  a node.  
                - node_index == the index of the node that was selected
                - any previous calls to this function are overridden by this new call.  
                  (i.e. you can only have one event handler associated with this 
                  event at a time)
            throws
                - std::bad_alloc
        !*/

        template <
            typename T
            >
        void set_node_deselected_handler (
            T& object,
            void (T::*event_handler_)(unsigned long node_index)
        );
        /*!
            requires
                - event_handler is a valid pointer to a member function in T 
            ensures
                - the event_handler function is called on object when the user 
                  deselects a node.  
                - node_index == the index of the node that was deselected
                - any previous calls to this function are overridden by this new call.  
                  (i.e. you can only have one event handler associated with this 
                  event at a time)
            throws
                - std::bad_alloc
        !*/

        template <
            typename T
            >
        void set_node_deleted_handler (
            T& object,
            void (T::*event_handler_)()
        );
        /*!
            requires
                - event_handler is a valid pointer to a member function in T 
            ensures
                - the event_handler function is called on object when the user 
                  deletes a node.  
                - any previous calls to this function are overridden by this new call.  
                  (i.e. you can only have one event handler associated with this 
                  event at a time)
            throws
                - std::bad_alloc
        !*/

        template <
            typename T
            >
        void set_graph_modified_handler (
            T& object,
            void (T::*event_handler_)()
        );
        /*!
            requires
                - event_handler is a valid pointer to a member function in T 
            ensures
                - the event_handler function is called on object when the user 
                  modifies the graph (i.e. adds or removes a node or edge)
                - the event_handler function is not called when the user just
                  moves nodes around on the screen.
                - This event is always dispatched before any more specific event
                  that results from the user modifying the graph.
                - any previous calls to this function are overridden by this new call.  
                  (i.e. you can only have one event handler associated with this 
                  event at a time)
            throws
                - std::bad_alloc
        !*/

    private:

        // restricted functions
        directed_graph_drawer(directed_graph_drawer&);        // copy constructor
        directed_graph_drawer& operator=(directed_graph_drawer&);    // assignment operator
    };

// ----------------------------------------------------------------------------------------

    class text_grid : public scrollable_region 
    {
        /*!
            INITIAL VALUE
                - vertical_scroll_increment() == 10
                - horizontal_scroll_increment() == 10
                - border_color() == rgb_pixel(128,128,128)
                - number_of_columns() == 0
                - number_of_rows() == 0

            WHAT THIS OBJECT REPRESENTS 
                This object represents a simple grid of square text fields that 
                looks more or less like a spreadsheet grid.
        !*/

    public:

        text_grid (
            drawable_window& w
        ); 
        /*!
            ensures 
                - #*this is properly initialized 
                - #*this has been added to window w
                - #parent_window() == w
            throws
                - std::bad_alloc
                - dlib::thread_error
        !*/

        virtual ~text_grid (
        );
        /*!
            ensures
                - all resources associated with *this have been released
        !*/

        void set_grid_size (
            unsigned long rows,
            unsigned long cols
        );
        /*!
            ensures
                - #number_of_rows() == rows
                - #number_of_columns() == cols
                - for all valid r and c:
                    - #text(r,c) == ""
                    - #text_color(r,c) == rgb_pixel(0,0,0)
                    - #background_color(r,c) == rgb_pixel(255,255,255)
                    - #is_editable(r,c) == true
        !*/

        unsigned long number_of_columns (
        ) const;
        /*!
            ensures
                - returns the number of columns contained in this grid
        !*/

        unsigned long number_of_rows (
        ) const;
        /*!
            ensures
                - returns the number of rows contained in this grid
        !*/

        rgb_pixel border_color (
        ) const;
        /*!
            ensures
                - returns the color of the lines drawn between the grid elements
        !*/

        void set_border_color (
            rgb_pixel color
        );
        /*!
            ensures
                - #border_color() == color
        !*/

        const std::wstring  wtext (unsigned long row, unsigned long col) const;
        const dlib::ustring utext (unsigned long row, unsigned long col) const;
        const std::string   text (
            unsigned long row,
            unsigned long col
        ) const;
        /*!
            requires
                - row < number_of_rows()
                - col < number_of_columns()
            ensures
                - returns the text in the given grid location
        !*/

        void set_text (unsigned long row, unsigned long col, const std::wstring& str);
        void set_text (unsigned long row, unsigned long col, const dlib::ustring& str);
        void set_text (
            unsigned long row,
            unsigned long col,
            const std::string& str
        );
        /*!
            requires
                - row < number_of_rows()
                - col < number_of_columns()
            ensures
                - #text(row,col) == str
        !*/

        const rgb_pixel text_color (
            unsigned long row,
            unsigned long col
        ) const;
        /*!
            requires
                - row < number_of_rows()
                - col < number_of_columns()
            ensures
                - returns the color of the text in the given grid location
        !*/

        void set_text_color (
            unsigned long row,
            unsigned long col,
            const rgb_pixel color
        );
        /*!
            requires
                - row < number_of_rows()
                - col < number_of_columns()
            ensures
                - #text_color(row,col) == color 
        !*/

        const rgb_pixel background_color (
            unsigned long row,
            unsigned long col
        ) const;
        /*!
            requires
                - row < number_of_rows()
                - col < number_of_columns()
            ensures
                - returns the background color of the given grid location
        !*/

        void set_background_color (
            unsigned long row,
            unsigned long col,
            const rgb_pixel color
        ); 
        /*!
            requires
                - row < number_of_rows()
                - col < number_of_columns()
            ensures
                - #background_color(row,col) == color 
        !*/

        bool is_editable (
            unsigned long row,
            unsigned long col
        ) const;
        /*!
            requires
                - row < number_of_rows()
                - col < number_of_columns()
            ensures
                - if (the given grid location is editable by the user) then
                    - returns true
                - else
                    - returns false
        !*/

        void set_editable (
            unsigned long row,
            unsigned long col,
            bool editable
        );
        /*!
            requires
                - row < number_of_rows()
                - col < number_of_columns()
            ensures
                - #is_editable(row,col) == editable 
        !*/

        void set_column_width (
            unsigned long col,
            unsigned long width
        );
        /*!
            requires
                - col < number_of_columns()
            ensures
                - the given column will be displayed such that it is width pixels wide
        !*/

        void set_row_height (
            unsigned long row,
            unsigned long height 
        );
        /*!
            requires
                - row < number_of_rows()
            ensures
                - the given row will be displayed such that it is height pixels wide
        !*/

        template <
            typename T
            >
        void set_text_modified_handler (
            T& object,
            void (T::*event_handler)(unsigned long row, unsigned long col)
        );
        /*!
            requires
                - event_handler is a valid pointer to a member function in T 
            ensures
                - the event_handler function is called on object when the user selects
                  a node.  
                - row == row will give the row of the grid item that was modified
                - col == col will give the column of the grid item that was modified
                - any previous calls to this function are overridden by this new call.  
                  (i.e. you can only have one event handler associated with this 
                  event at a time)
            throws
                - std::bad_alloc
        !*/

    private:

        // restricted functions
        text_grid(text_grid&);        // copy constructor
        text_grid& operator=(text_grid&);    // assignment operator
    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_WIDGETs_ABSTRACT_

