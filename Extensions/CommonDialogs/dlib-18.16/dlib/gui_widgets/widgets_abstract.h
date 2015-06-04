// Copyright (C) 2005  Davis E. King (davis@dlib.net), Keita Mochizuki
// License: Boost Software License   See LICENSE.txt for the full license.

#undef DLIB_WIDGETs_ABSTRACT_
#ifdef DLIB_WIDGETs_ABSTRACT_

#include "fonts_abstract.h"
#include "drawable_abstract.h"
#include "base_widgets_abstract.h"

#include "../gui_core.h"
#include <string>
#include <map>
#include "../interfaces/enumerable.h"
#include "style_abstract.h"
#include "../image_processing/full_object_detection_abstract.h"

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
            functions, are executed in the event handling thread.   Additionally,
            the drawable::m mutex will always be locked while these event handlers
            are running.  Also, don't rely on get_thread_id() always returning the 
            same ID from inside event handlers.
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

    void open_file_box (
        const any_function<void(const std::string&)>& event_handler
    );
    /*!
        ensures
            - Displays a window titled "Open File" that will allow the user to select a 
              file.  
            - The displayed window will start out showing the directory get_current_dir()
              (i.e. it starts in the current working directory)
            - The event_handler function is called if the user selects
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

    void open_existing_file_box (
        const any_function<void(const std::string&)>& event_handler
    );
    /*!
        ensures
            - Displays a window titled "Open File" that will allow the user to select 
              a file.  But only a file that already exists.
            - The displayed window will start out showing the directory get_current_dir()
              (i.e. it starts in the current working directory)
            - The event_handler function is called if the user selects
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

    void save_file_box (
        const any_function<void(const std::string&)>& event_handler
    );
    /*!
        ensures
            - Displays a window titled "Save File" that will allow the user to select 
              a file.  
            - The displayed window will start out showing the directory get_current_dir()
              (i.e. it starts in the current working directory)
            - The event_handler function is called if the user selects
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

    void message_box (
        const std::string& title,
        const std::string& message,
        const any_function<void()>& event_handler
    );
    /*!
        ensures
            - Displays a message box with the given title and message.  It will have a 
              single button and when the user clicks it the message box will go away.
            - The event_handler function is called when the user clicks
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

        void set_click_handler (
            const any_function<void()>& event_handler
        );
        /*!
            ensures
                - the event_handler function is called when the toggle_button is 
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

        void set_sourced_click_handler (
            const any_function<void(toggle_button& self)>& event_handler
        );
        /*!
            ensures
                - the event_handler function is called when the toggle_button is 
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

        void give_input_focus (
        );
        /*!
            ensures
                - gives this text field input keyboard focus
        !*/

        void select_all_text (
        );
        /*!
            ensures
                - causes all the text in the text field to become selected.
                  (note that it doesn't give input focus)
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

        void set_text_modified_handler (
            const any_function<void()>& event_handler
        );
        /*!
            ensures
                - the event_handler function is called when the text in this text_field 
                  is modified by the user.
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

        void set_enter_key_handler (
            const any_function<void()>& event_handler
        );
        /*!
            ensures
                - the event_handler function is called when this text field has input 
                  focus and the user hits the enter key on their keyboard.
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

        void set_focus_lost_handler (
            const any_function<void()>& event_handler
        );
        /*!
            ensures
                - the event_handler function is called when this object loses input 
                  focus due to the user clicking outside the text field
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
    // class text_box
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    class text_box : public scrollable_region 
    {
        /*!
            INITIAL VALUE
                - text() == ""
                - The text color will be black.
                - width() == 100
                - height() == 100

            WHAT THIS OBJECT REPRESENTS
                This object represents a simple multi-line text input box.  
        !*/

    public:

        text_box(  
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

        virtual ~text_box(
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
                - style_type == a type that inherits from text_box_style 
            ensures
                - this text_box object will draw itself using the given
                  text box style
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
                - returns the text of this text_box
            throws
                - std::bad_alloc
        !*/

        void set_size (
            unsigned long width,
            unsigned long height 
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
                  in this text_box is modified by the user.
                - any previous calls to this function are overridden by this new call.  
                  (i.e. you can only have one event handler associated with this 
                  event at a time)
            throws
                - std::bad_alloc
        !*/

        void set_text_modified_handler (
            const any_function<void()>& event_handler
        );
        /*!
            ensures
                - the event_handler function is called when the text in this text_box 
                  is modified by the user.
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
                - the event_handler function is called on object when this text box
                  has input focus and the user hits the enter key on their keyboard.
                - any previous calls to this function are overridden by this new call.  
                  (i.e. you can only have one event handler associated with this 
                  event at a time)
            throws
                - std::bad_alloc
        !*/

        void set_enter_key_handler (
            const any_function<void()>& event_handler
        );
        /*!
            ensures
                - the event_handler function is called when this text box has input 
                  focus and the user hits the enter key on their keyboard.
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
                  loses input focus due to the user clicking outside the text box
                - any previous calls to this function are overridden by this new call.  
                  (i.e. you can only have one event handler associated with this 
                  event at a time)
            throws
                - std::bad_alloc
        !*/

        void set_focus_lost_handler (
            const any_function<void()>& event_handler
        );
        /*!
            ensures
                - the event_handler function is called when this object loses input 
                  focus due to the user clicking outside the text box
                - any previous calls to this function are overridden by this new call.  
                  (i.e. you can only have one event handler associated with this 
                  event at a time)
            throws
                - std::bad_alloc
        !*/

    private:

        // restricted functions
        text_box(text_box&);        // copy constructor
        text_box& operator=(text_box&);    // assignment operator
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

        void set_click_handler (
            const any_function<void(unsigned long new_idx, unsigned long old_idx)>& eh
        );
        /*!
            ensures
                - The event_handler function is called when the user clicks on a tab 
                  that isn't already selected.  new_idx will give the index of the 
                  newly selected tab and old_idx will give the index of the tab that 
                  was previously selected. 
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

        void set_double_click_handler (
            const any_function<void(unsigned long index)>& event_handler
        ); 
        /*!
            ensures
                - The event_handler function is called when the user double clicks on 
                  one of the rows in this list box.  index gives the row number for 
                  the item the user clicked.
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

        void set_click_handler (
            const any_function<void(unsigned long index)>& event_handler
        );
        /*!
            ensures
                - The event_handler function is called when the user clicks on one 
                  of the rows in this list box.  index gives the row number for the 
                  item the user clicked.  (Note that the second click in a double 
                  click triggers the double click handler above instead of this event)
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
            void (T::*event_handler)(unsigned long node_index)
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

        void set_node_selected_handler (
            const any_function<void(unsigned long node_index)>& event_handler
        );
        /*!
            ensures
                - the event_handler function is called when the user selects
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
            void (T::*event_handler)(unsigned long node_index)
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

        void set_node_deselected_handler (
            const any_function<void(unsigned long node_index)>& event_handler
        );
        /*!
            ensures
                - the event_handler function is called when the user deselects a node.  
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
            void (T::*event_handler)()
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

        void set_node_deleted_handler (
            const any_function<void()>& event_handler
        );
        /*!
            ensures
                - the event_handler function is called when the user deletes a node.  
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
            void (T::*event_handler)()
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

        void set_graph_modified_handler (
            const any_function<void()>& event_handler
        );
        /*!
            ensures
                - the event_handler function is called when the user modifies 
                  the graph (i.e. adds or removes a node or edge)
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

        void set_text_modified_handler (
            const any_function<void(unsigned long row, unsigned long col)>& event_handler
        ); 
        /*!
            ensures
                - the event_handler function is called when the user selects a node.  
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

    class image_display : public scrollable_region 
    {
        /*!
            INITIAL VALUE
                - This object isn't displaying anything. 
                - get_overlay_rects().size() == 0
                - get_default_overlay_rect_label() == ""
                - get_default_overlay_rect_color() == rgb_alpha_pixel(255,0,0,255) (i.e. RED)
                - This object does not have any user labelable parts defined.
                - overlay_editing_is_enabled() == true

            WHAT THIS OBJECT REPRESENTS
                This object represents an image inside a scrollable region.  
                You give it an image to display by calling set_image().
                This widget also allows you to add rectangle and line overlays that
                will be drawn on top of the image.  
                
                If you hold the Ctrl key you can zoom in and out using the mouse wheel.
                You can also add new overlay rectangles by holding shift, left clicking,
                and dragging the mouse.  Additionally, you can delete an overlay rectangle
                by double clicking on it and hitting delete or backspace.  Finally, you
                can also add part labels (if they have been defined by calling add_labelable_part_name())
                by selecting an overlay rectangle with the mouse and then right clicking
                on the part.  If you want to move any rectangle or an object part then
                shift+right click and drag it.
                
                Finally, if you hold Ctrl and left click an overlay rectangle it will 
                change its label to get_default_overlay_rect_label().

                The image is drawn such that:
                    - the pixel img[0][0] is the upper left corner of the image.
                    - the pixel img[img.nr()-1][0] is the lower left corner of the image.
                    - the pixel img[0][img.nc()-1] is the upper right corner of the image.
                    - the pixel img[img.nr()-1][img.nc()-1] is the lower right corner of the image.
        !*/

    public:

        image_display(  
            drawable_window& w
        );
        /*!
            ensures 
                - #*this is properly initialized 
                - #*this has been added to window w
                - #parent_window() == w
        !*/

        ~image_display(
        );
        /*!
            ensures
                - all resources associated with *this have been released
        !*/

        template <
            typename image_type
            >
        void set_image (
            const image_type& new_img
        );
        /*!
            requires
                - image_type == an implementation of array2d/array2d_kernel_abstract.h or
                  a dlib::matrix or something convertible to a matrix via mat()
                - pixel_traits<typename image_type::type> must be defined 
            ensures
                - #*this widget is now displaying the given image new_img.
        !*/

        struct overlay_rect
        {
            /*!
                WHAT THIS OBJECT REPRESENTS
                    This object represents a rectangle that is drawn on top of the
                    image shown by this object.  Each rectangle is represented by 
                    a rectangle object as well as a color and text label.  The label
                    is drawn below the lower right corner of the rectangle.

                    Moreover, the rectangle can have sub-parts. Each part is listed
                    in the parts member variable.  This variable maps the name of the
                    part to its position.

                    Rectangles with crossed_out == true will be drawn with an X through
                    them.
            !*/

            rectangle rect;
            rgb_alpha_pixel color;
            std::string label;
            std::map<std::string,point> parts;
            bool crossed_out;

            overlay_rect(
            ); 
            /*!
                ensures
                    - #color == rgb_alpha_pixel(0,0,0,0) 
                    - #rect == rectangle()
                    - #label.size() == 0
                    - #crossed_out == false
            !*/

            template <typename pixel_type>
            overlay_rect(
                const rectangle& r, 
                pixel_type p
            );
            /*!
                ensures
                    - #rect == r
                    - performs assign_pixel(color, p) 
                    - #label.size() == 0
                    - #crossed_out == false
            !*/

            template <typename pixel_type>
            overlay_rect(
                const rectangle& r,
                pixel_type p,
                const std::string& l
            );
            /*!
                ensures
                    - #rect == r
                    - performs assign_pixel(color, p)
                    - #label == l
                    - #crossed_out == false
            !*/

            template <typename pixel_type>
            overlay_rect(
                const rectangle& r, 
                pixel_type p, 
                const std::string& l, 
                const std::map<std::string,point>& parts_
            ); 
            /*!
                ensures
                    - #rect == r
                    - performs assign_pixel(color, p)
                    - #label == l
                    - #parts == parts_
                    - #crossed_out == false
            !*/

        };

        struct overlay_line
        {
            /*!
                WHAT THIS OBJECT REPRESENTS
                    This object represents a line that is drawn on top of the
                    image shown by this object.  Each line is represented by 
                    its two end points (p1 and p2) as well as a color.
            !*/

            point p1;
            point p2;
            rgb_alpha_pixel color;

            overlay_line(
            );
            /*!
                ensures
                    - #color == rgb_alpha_pixel(0,0,0,0)
                    - #p1 == point()
                    - #p2 == point()
            !*/

            template <typename pixel_type>
            overlay_line(
                const point& p1_,
                const point& p2_,
                pixel_type p
            ); 
            /*!
                ensures
                    - performs assign_pixel(color, p)
                    - #p1 == p1_
                    - #p2 == p2_
            !*/

        };

        struct overlay_circle
        {
            /*!
                WHAT THIS OBJECT REPRESENTS
                    This object represents a circle that is drawn on top of the
                    image shown by this object.  Each circle is represented by 
                    its center, radius, and color.  It can also have an optional
                    text label which will appear below the circle.
            !*/

            point center;
            int radius;
            rgb_alpha_pixel color;
            std::string label;

            overlay_circle(
            );
            /*!
                ensures
                    - #center == point(0,0)
                    - #radius == 0
                    - #color == rgb_alpha_pixel(0,0,0,0)
                    - #label.size() == 0
            !*/

            template <typename pixel_type>
            overlay_circle(
                const point& center_, 
                const int radius_,
                pixel_type p
            ); 
            /*!
                ensures
                    - performs assign_pixel(color, p)
                    - #center == center_
                    - #radius == radius_
            !*/

            template <typename pixel_type>
            overlay_circle(
                const point& center_, 
                const int radius_,
                pixel_type p,
                const std::string& label_
            ); 
            /*!
                ensures
                    - performs assign_pixel(color, p)
                    - #center == center_
                    - #radius == radius_
                    - #label == label_
            !*/

        };

        void add_overlay (
            const overlay_rect& overlay
        );
        /*!
            ensures
                - adds the given overlay rectangle into this object such
                  that it will be displayed. 
        !*/

        void add_overlay (
            const overlay_line& overlay
        );
        /*!
            ensures
                - adds the given overlay line into this object such
                  that it will be displayed. 
        !*/

        void add_overlay (
            const overlay_circle& overlay
        );
        /*!
            ensures
                - adds the given overlay circle into this object such
                  that it will be displayed. 
        !*/

        void add_overlay (
            const std::vector<overlay_rect>& overlay
        );
        /*!
            ensures
                - adds the given set of overlay rectangles into this object such
                  that they will be displayed. 
        !*/

        void add_overlay (
            const std::vector<overlay_line>& overlay
        );
        /*!
            ensures
                - adds the given set of overlay lines into this object such
                  that they will be displayed. 
        !*/

        void add_overlay (
            const std::vector<overlay_circle>& overlay
        );
        /*!
            ensures
                - adds the given set of overlay circles into this object such
                  that they will be displayed. 
        !*/

        void clear_overlay (
        );
        /*!
            ensures
                - removes all overlays from this object.  
                - #get_overlay_rects().size() == 0
        !*/

        std::vector<overlay_rect> get_overlay_rects (
        ) const;
        /*!
            ensures
                - returns a copy of all the overlay_rect objects currently displayed.
        !*/

        void set_default_overlay_rect_label (
            const std::string& label
        );
        /*!
            ensures
                - #get_default_overlay_rect_label() == label
        !*/

        std::string get_default_overlay_rect_label (
        ) const;
        /*!
            ensures
                - returns the label given to new overlay rectangles created by the user
                  (i.e. when the user holds shift and adds them with the mouse)
        !*/

        void set_default_overlay_rect_color (
            const rgb_alpha_pixel& color
        );
        /*!
            ensures
                - #get_default_overlay_rect_color() == color
        !*/

        rgb_alpha_pixel get_default_overlay_rect_color (
        ) const;
        /*!
            ensures
                - returns the color given to new overlay rectangles created by the user
                  (i.e. when the user holds shift and adds them with the mouse)
        !*/

        void add_labelable_part_name (
            const std::string& name
        );
        /*!
            ensures
                - adds a user labelable part with the given name.  If the name has
                  already been added then this function has no effect.  
                - These parts can be added by the user by selecting an overlay box
                  and then right clicking anywhere in it.  A popup menu will appear
                  listing the parts.  The user can then click a part name and it will
                  add it into the overlay_rect::parts variable and also show it on the
                  screen.
        !*/

        void clear_labelable_part_names (
        );
        /*!
            ensures
                - removes all use labelable parts.  Calling this function undoes 
                  all previous calls to add_labelable_part_name().  Therefore, the 
                  user won't be able to label any parts after clear_labelable_part_names()
                  is called.
        !*/

        rectangle get_image_display_rect (
        ) const;
        /*!
            ensures
                - returns a rectangle R that tells you how big the image inside the
                  display is when it appears on the screen.  Note that it takes the
                  current zoom level into account.
                    - R.width()  == the width of the displayed image
                    - R.height() == the height of the displayed image
                    - R.tl_corner() == (0,0)
        !*/

        void enable_overlay_editing (
        ); 
        /*!
            ensures
                - #overlay_editing_is_enabled() == true
        !*/

        void disable_overlay_editing (
        );
        /*!
            ensures
                - #overlay_editing_is_enabled() == false 
        !*/
        
        bool overlay_editing_is_enabled (
        ) const; 
        /*!
            ensures
                - if this function returns true then it is possible for the user to add or
                  remove overlay objects (e.g. rectangles) using the mouse and keyboard.
                  If it returns false then the overlay is not user editable.
        !*/

        template <
            typename T
            >
        void set_overlay_rects_changed_handler (
            T& object,
            void (T::*event_handler)()
        );
        /*
            requires
                - event_handler is a valid pointer to a member function in T 
            ensures
                - the event_handler function is called on object when the user adds,
                  removes, or modifies an overlay rectangle.
                - any previous calls to this function are overridden by this new call.  
                  (i.e. you can only have one event handler associated with this 
                  event at a time)
            throws
                - std::bad_alloc
        */

        void set_overlay_rects_changed_handler (
            const any_function<void()>& event_handler
        );
        /*
            ensures
                - the event_handler function is called when the user adds or removes 
                  an overlay rectangle.
                - any previous calls to this function are overridden by this new call.  
                  (i.e. you can only have one event handler associated with this 
                  event at a time)
            throws
                - std::bad_alloc
        */

        template <
            typename T
            >
        void set_overlay_rect_selected_handler (
            T& object,
            void (T::*event_handler)(const overlay_rect& orect)
        );
        /*
            requires
                - event_handler is a valid pointer to a member function in T 
            ensures
                - The event_handler function is called on object when the user selects
                  an overlay rectangle by double clicking on it.  The selected rectangle 
                  will be passed to event_handler().
                - any previous calls to this function are overridden by this new call.  
                  (i.e. you can only have one event handler associated with this 
                  event at a time)
            throws
                - std::bad_alloc
        */

        void set_overlay_rect_selected_handler (
            const any_function<void(const overlay_rect& orect)>& event_handler
        );
        /*
            ensures
                - The event_handler function is called when the user selects an overlay 
                  rectangle by double clicking on it.  The selected rectangle will be 
                  passed to event_handler().
                - any previous calls to this function are overridden by this new call.  
                  (i.e. you can only have one event handler associated with this 
                  event at a time)
            throws
                - std::bad_alloc
        */

        template <
            typename T
            >
        void set_image_clicked_handler (
            T& object,
            void (T::*event_handler)(const point& p, bool is_double_click)
        );
        /*
            requires
                - event_handler is a valid pointer to a member function in T 
            ensures
                - The event_handler function is called on object when the user left clicks
                  anywhere on the image.  When they do so this callback is called with the
                  location of the image pixel which was clicked.  The is_double_click bool
                  will also tell you if it was a double click or single click.
                - any previous calls to this function are overridden by this new call.  
                  (i.e. you can only have one event handler associated with this 
                  event at a time)
            throws
                - std::bad_alloc
        */

        void set_image_clicked_handler (
            const any_function<void(const point& p, bool is_double_click)>& event_handler
        );
        /*
            ensures
                - The event_handler function is called when the user left clicks anywhere
                  on the image.  When they do so this callback is called with the location
                  of the image pixel which was clicked.  The is_double_click bool will also
                  tell you if it was a double click or single click.
                - Any previous calls to this function are overridden by this new call.
                  (i.e. you can only have one event handler associated with this event at a
                  time)
            throws
                - std::bad_alloc
        */

    private:

        // restricted functions
        image_display(image_display&);        // copy constructor
        image_display& operator=(image_display&);    // assignment operator
    };

// ----------------------------------------------------------------------------------------

    class image_window : public drawable_window 
    {
        /*!
            INITIAL VALUE
                - initially, this object is visible on the screen
                - events_tied() == false

            WHAT THIS OBJECT REPRESENTS
                This is a simple window that is just a container for an image_display.  
                It exists to make it easy to throw image_displays onto the screen 
                without having to put together your own drawable_window objects.
        !*/
    public:

        typedef image_display::overlay_rect overlay_rect;
        typedef image_display::overlay_line overlay_line;
        typedef image_display::overlay_circle overlay_circle;

        image_window(
        ); 
        /*!
            ensures
                - this object is properly initialized
        !*/

        template <typename image_type>
        image_window(
            const image_type& img
        ); 
        /*!
            requires
                - image_type == an implementation of array2d/array2d_kernel_abstract.h or
                  a dlib::matrix or something convertible to a matrix via mat()
                - pixel_traits<typename image_type::type> must be defined 
            ensures
                - this object is properly initialized 
                - #*this window is now displaying the given image img.
        !*/

        template < typename image_type>
        image_window(
            const image_type& img,
            const std::string& title
        );
        /*!
            requires
                - image_type == an implementation of array2d/array2d_kernel_abstract.h or
                  a dlib::matrix or something convertible to a matrix via mat()
                - pixel_traits<typename image_type::type> must be defined 
            ensures
                - this object is properly initialized 
                - #*this window is now displaying the given image img.
                - The title of the window will be set to the given title string.
        !*/

        ~image_window(
        );
        /*!
            ensures
                - any resources associated with this object have been released
        !*/

        template <typename image_type>
        void set_image (
            const image_type& img
        );
        /*!
            requires
                - image_type == an implementation of array2d/array2d_kernel_abstract.h
                - pixel_traits<typename image_type::type> must be defined 
            ensures
                - #*this window is now displaying the given image img.
        !*/

        void add_overlay (
            const overlay_rect& overlay
        );
        /*!
            ensures
                - adds the given overlay rectangle into this object such
                  that it will be displayed. 
        !*/

        template <typename pixel_type>
        void add_overlay(
            const rectangle& r, 
            pixel_type p = rgb_pixel(255,0,0)
        );
        /*!
            ensures
                - performs: add_overlay(overlay_rect(r,p));
        !*/

        template <typename pixel_type>
        void add_overlay(
            const rectangle& r, 
            pixel_type p, 
            const std::string& l
        );
        /*!
            ensures
                - performs: add_overlay(overlay_rect(r,p,l));
        !*/

        template <typename pixel_type>
        void add_overlay(
            const std::vector<rectangle>& r,
            pixel_type p = rgb_pixel(255,0,0)
        );
        /*!
            ensures
                - adds the given set of rectangles into this object such
                  that they will be displayed with the color specific by p. 
        !*/

        void add_overlay(
            const full_object_detection& object,
            const std::vector<std::string>& part_names
        );
        /*!
            ensures
                - adds the given full_object_detection to the overlays
                  and shows it on the screen.  This includes any of its
                  parts that are not set equal to OBJECT_PART_NOT_PRESENT.
                - for all valid i < part_names.size():
                    - the part object.part(i) will be labeled with the string
                      part_names[i].
        !*/

        void add_overlay(
            const full_object_detection& object
        );
        /*!
            ensures
                - adds the given full_object_detection to the overlays
                  and shows it on the screen.  This includes any of its
                  parts that are not set equal to OBJECT_PART_NOT_PRESENT.
        !*/

        void add_overlay(
            const std::vector<full_object_detection>& objects,
            const std::vector<std::string>& part_names
        ); 
        /*!
            ensures
                - calling this function is equivalent to calling the following
                  sequence of functions, for all valid i:
                    - add_overlay(objects[i], part_names);
        !*/

        void add_overlay(
            const std::vector<full_object_detection>& objects
        );
        /*!
            ensures
                - calling this function is equivalent to calling the following
                  sequence of functions, for all valid i:
                    - add_overlay(objects[i]);
        !*/

        void add_overlay (
            const overlay_line& overlay
        );
        /*!
            ensures
                - adds the given overlay line into this object such
                  that it will be displayed. 
        !*/

        void add_overlay (
            const overlay_circle& overlay
        );
        /*!
            ensures
                - adds the given overlay circle into this object such
                  that it will be displayed. 
        !*/

        template <typename pixel_type>
        void add_overlay(
            const point& p1,
            const point& p2,
            pixel_type p
        );
        /*!
            ensures
                - performs: add_overlay(overlay_line(p1,p2,p));
        !*/

        void add_overlay (
            const std::vector<overlay_rect>& overlay
        );
        /*!
            ensures
                - adds the given set of overlay rectangles into this object such
                  that they will be displayed. 
        !*/

        void add_overlay (
            const std::vector<overlay_line>& overlay
        );
        /*!
            ensures
                - adds the given set of overlay lines into this object such
                  that they will be displayed. 
        !*/

        void add_overlay (
            const std::vector<overlay_circle>& overlay
        );
        /*!
            ensures
                - adds the given set of overlay circles into this object such
                  that they will be displayed. 
        !*/

        void clear_overlay (
        );
        /*!
            ensures
                - removes all overlays from this object.  
        !*/

        void tie_events (
        );
        /*!
            ensures
                - #events_tied() == true
        !*/

        void untie_events (
        );
        /*!
            ensures
                - #events_tied() == false 
        !*/

        bool events_tied (
        ) const;
        /*!
            ensures
                - returns true if and only if the get_next_double_click() and
                  get_next_keypress() events are tied together.  If they are tied it means
                  that you can use a loop of the following form to listen for both events
                  simultaneously:
                    while (mywindow.get_next_double_click(p) || mywindow.get_next_keypress(key,printable))
                    {
                        if (p.x() < 0)
                            // Do something with the keyboard event
                        else
                            // Do something with the mouse event
                    }
        !*/

        bool get_next_double_click (
            point& p
        ); 
        /*!
            ensures
                - This function blocks until the user double clicks on the image or the
                  window is closed by the user.  It will also unblock for a keyboard key
                  press if events_tied() == true.
                - if (this function returns true) then
                    - This means the user double clicked the mouse.
                    - #p == the next image pixel the user clicked.  
                - else
                    - #p == point(-1,1)
        !*/

        bool get_next_double_click (
            point& p,
            unsigned long& mouse_button
        ); 
        /*!
            ensures
                - This function blocks until the user double clicks on the image or the
                  window is closed by the user.  It will also unblock for a keyboard key
                  press if events_tied() == true.
                - if (this function returns true) then
                    - This means the user double clicked the mouse.
                    - #p == the next image pixel the user clicked.  
                    - #mouse_button == the mouse button which was used to double click.
                      This will be either dlib::base_window::LEFT,
                      dlib::base_window::MIDDLE, or dlib::base_window::RIGHT
                - else
                    - #p == point(-1,1)
                      (Note that this point is outside any possible image)
        !*/

        bool get_next_keypress (
            unsigned long& key,
            bool& is_printable,
            unsigned long& state
        );
        /*!
            ensures
                - This function blocks until the user presses a keyboard key or the
                  window is closed by the user.  It will also unblock for a mouse double
                  click if events_tied() == true.
                - if (this function returns true) then
                    - This means the user pressed a keyboard key.
                    - The keyboard button press is recorded into #key, #is_printable, and
                      #state.  In particular, these variables are populated with the three
                      identically named arguments to the base_window::on_keydown(key,is_printable,state) 
                      event.
        !*/

        bool get_next_keypress (
            unsigned long& key,
            bool& is_printable
        );
        /*!
            ensures
                - This function blocks until the user presses a keyboard key or the
                  window is closed by the user.  It will also unblock for a mouse double
                  click if events_tied() == true.
                - This function is the equivalent to calling get_next_keypress(key,is_printable,temp) 
                  and then discarding temp.
        !*/

    private:

        // restricted functions
        image_window(image_window&);
        image_window& operator= (image_window&);
    };

// ----------------------------------------------------------------------------------------

    class perspective_display : public drawable, noncopyable
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object is a tool for displaying 3D point clouds on a screen.  You can
                navigate the display with the mouse.  Left click and drag rotates the
                camera around the displayed data.  Scrolling the mouse wheel zooms and
                shift+left click (or just right click) and drag pans the view around.
        !*/

    public:

        perspective_display(  
            drawable_window& w
        );
        /*!
            ensures 
                - #*this is properly initialized 
                - #*this has been added to window w
                - #parent_window() == w
        !*/

        ~perspective_display(
        );
        /*!
            ensures
                - all resources associated with *this have been released
        !*/

        void set_size (
            unsigned long width,
            unsigned long height 
        );
        /*! 
            ensures
                - #width() == width
                - #height() == height
                - #top() == top()
                - #left() == left()
                - i.e. The location of the upper left corner of this widget stays the
                  same but its width and height are modified.
        !*/

        struct overlay_line
        {
            /*!
                WHAT THIS OBJECT REPRESENTS
                    This object represents a line that is drawn on the screen.  Each line
                    is represented by its two end points (p1 and p2) as well as a color.
            !*/

            overlay_line() { assign_pixel(color, 0);}

            overlay_line(const vector<double>& p1_, const vector<double>& p2_) 
                : p1(p1_), p2(p2_) { assign_pixel(color, 255); }

            template <typename pixel_type>
            overlay_line(const vector<double>& p1_, const vector<double>& p2_, pixel_type p) 
                : p1(p1_), p2(p2_) { assign_pixel(color, p); }

            vector<double> p1;
            vector<double> p2;
            rgb_pixel color;
        };

        struct overlay_dot
        {
            /*!
                WHAT THIS OBJECT REPRESENTS
                    This object represents a dot that is drawn on the screen.  Each dot is
                    represented by one point and a color.
            !*/

            overlay_dot() { assign_pixel(color, 0);}

            overlay_dot(const vector<double>& p_) 
                : p(p_) { assign_pixel(color, 255); }

            template <typename pixel_type>
            overlay_dot(const vector<double>& p_, pixel_type color_) 
                : p(p_) { assign_pixel(color, color_); }

            vector<double> p; // The location of the dot
            rgb_pixel color;
        };

        void add_overlay (
            const std::vector<overlay_line>& overlay
        );
        /*!
            ensures
                - Adds the given overlay lines into this object such that it will be
                  displayed. 
        !*/

        void add_overlay (
            const std::vector<overlay_dot>& overlay
        );
        /*!
            ensures
                - Adds the given overlay dots into this object such that it will be
                  displayed. 
        !*/

        void clear_overlay (
        );
        /*!
            ensures
                - Removes all overlays from this object.  The display will be empty.
        !*/

        template <typename T>
        void set_dot_double_clicked_handler (
            T& object,
            void (T::*event_handler)(const vector<double>&)
        );
        /*
            requires
                - event_handler is a valid pointer to a member function in T 
            ensures
                - The event_handler function is called on object when the user double
                  clicks on one of the overlay dots.  The selected dot will be passed to
                  event_handler().
                - Any previous calls to this function are overridden by this new call.  
                  (i.e. you can only have one event handler associated with this 
                  event at a time)
        */

        void set_dot_double_clicked_handler (
            const any_function<void(const vector<double>&)>& event_handler
        );
        /*
            ensures
                - The event_handler function is called when the user double clicks on one
                  of the overlay dots.  The selected dot will be passed to event_handler().
                - Any previous calls to this function are overridden by this new call.  
                  (i.e. you can only have one event handler associated with this 
                  event at a time)
        */
    };

// ----------------------------------------------------------------------------------------

    class perspective_window : public drawable_window, noncopyable
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This is a simple window that is just a container for a perspective_display.
                It exists to make it easy to throw perspective_displays onto the screen
                without having to put together your own drawable_window objects.
        !*/
    public:

        typedef perspective_display::overlay_line overlay_line;
        typedef perspective_display::overlay_dot overlay_dot;

        perspective_window(
        );
        /*!
            ensures
                - The window is displayed on the screen and is 100x100 pixels in size.
        !*/

        perspective_window(
            const std::vector<dlib::vector<double> >& point_cloud
        );
        /*!
            ensures
                - The window is displayed on the screen and is 100x100 pixels in size.
                - This window will have point_cloud added to it via add_overlay() and the
                  points will all be white.
        !*/
        
        perspective_window(
            const std::vector<dlib::vector<double> >& point_cloud,
            const std::string& title
        );
        /*!
            ensures
                - The window is displayed on the screen and is 100x100 pixels in size.
                - This window will have point_cloud added to it via add_overlay() and the
                  points will all be white.
                - The title of the window will be set to the given title string.
        !*/
        
        ~perspective_window(
        );
        /*!
            ensures
                - any resources associated with this object have been released
        !*/

        void add_overlay (
            const std::vector<overlay_line>& overlay
        );
        /*!
            ensures
                - Adds the given overlay lines into this object such that it will be
                  displayed. 
        !*/

        void add_overlay (
            const std::vector<overlay_dot>& overlay
        );
        /*!
            ensures
                - Adds the given overlay dots into this object such that it will be
                  displayed. 
        !*/

        void clear_overlay (
        );
        /*!
            ensures
                - Removes all overlays from this object.  The display will be empty.
        !*/

        void add_overlay(
            const std::vector<dlib::vector<double> >& d
        ); 
        /*!
            ensures
                - Adds the given dots into this object such that it will be
                  displayed.  They will be colored white.
        !*/

        template <typename pixel_type>
        void add_overlay(
            const std::vector<dlib::vector<double> >& d, 
            pixel_type p
        );
        /*!
            ensures
                - Adds the given dots into this object such that it will be
                  displayed.  They will be colored by pixel color p.
        !*/

        template <typename pixel_type>
        void add_overlay(
            const vector<double>& p1,
            const vector<double>& p2, 
            pixel_type color
        );
        /*!
            ensures
                - Adds an overlay line going from p1 to p2 with the given color.
        !*/

        template < typename T >
        void set_dot_double_clicked_handler (
            T& object,
            void (T::*event_handler)(const vector<double>&)
        );
        /*
            requires
                - event_handler is a valid pointer to a member function in T 
            ensures
                - The event_handler function is called on object when the user double
                  clicks on one of the overlay dots.  The selected dot will be passed to
                  event_handler().
                - Any previous calls to this function are overridden by this new call.  
                  (i.e. you can only have one event handler associated with this 
                  event at a time)
        */

        void set_dot_double_clicked_handler (
            const any_function<void(const vector<double>&)>& event_handler
        );
        /*
            ensures
                - The event_handler function is called when the user double clicks on one
                  of the overlay dots.  The selected dot will be passed to event_handler().
                - Any previous calls to this function are overridden by this new call.  
                  (i.e. you can only have one event handler associated with this 
                  event at a time)
        */

    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_WIDGETs_ABSTRACT_

