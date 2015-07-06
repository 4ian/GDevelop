// Copyright (C) 2005  Davis E. King (davis@dlib.net), Keita Mochizuki
// License: Boost Software License   See LICENSE.txt for the full license.

#ifndef DLIB_WIDGETs_
#define DLIB_WIDGETs_

#include "../algs.h"
#include "widgets_abstract.h"
#include "drawable.h"
#include "../gui_core.h"
#include "fonts.h"
#include <string>
#include <sstream>
#include "../timer.h"
#include "base_widgets.h"
#include "../member_function_pointer.h"
#include "../array.h"
#include "../array2d.h"
#include "../sequence.h"
#include "../dir_nav.h"
#include "../queue.h"
#include "../smart_pointers.h"
#include "style.h"
#include "../string.h"
#include "../misc_api.h"
#include <cctype>
#include <vector>
#include "../any.h"
#include <set>
#include "../image_processing/full_object_detection.h"

#ifdef _MSC_VER
// This #pragma directive is also located in the algs.h file but for whatever
// reason visual studio 9 just ignores it when it is only there. 

// this is to disable the "'this' : used in base member initializer list"
// warning you get from some of the GUI objects since all the objects
// require that their parent class be passed into their constructor. 
// In this case though it is totally safe so it is ok to disable this warning.
#pragma warning(disable : 4355)
#endif

namespace dlib
{

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // class label  
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    class label : public drawable
    {
    public:
        label(
            drawable_window& w
        ) : 
            drawable(w),
            text_color_(0,0,0)
        {
            enable_events();
        }

        ~label()
        { disable_events(); parent.invalidate_rectangle(rect); }

        void set_text (
            const std::string& text
        );

        void set_text (
            const std::wstring& text
        );

        void set_text (
            const dlib::ustring& text
        );

        const std::string text (
        ) const;

        const std::wstring wtext (
        ) const;

        const dlib::ustring utext (
        ) const;

        void set_text_color (
            const rgb_pixel color
        );

        const rgb_pixel text_color (
        ) const;

        void set_main_font (
            const shared_ptr_thread_safe<font>& f
        );

    private:
        dlib::ustring text_;
        rgb_pixel text_color_;


        // restricted functions
        label(label&);        // copy constructor
        label& operator=(label&);    // assignment operator

    protected:

        void draw (
            const canvas& c
        ) const;

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
                - checked == false

            CONVENTION
                - is_checked() == checked
        !*/

    public:

        toggle_button(
            drawable_window& w
        ) : 
            button_action(w),
            btn_tooltip(w),
            checked(false)
        {
            style.reset(new toggle_button_style_default());
            enable_events();
        }
        
        ~toggle_button() { disable_events(); parent.invalidate_rectangle(rect); }

        void set_name (
            const std::string& name
        );

        void set_name (
            const std::wstring& name
        );

        void set_name (
            const dlib::ustring& name
        );

        void set_size (
            unsigned long width_,
            unsigned long height_
        );

        void set_tooltip_text (
            const std::string& text
        );

        void set_tooltip_text (
            const std::wstring& text
        );

        void set_tooltip_text (
            const ustring& text
        );

        const std::string tooltip_text (
        ) const;

        const std::wstring tooltip_wtext (
        ) const;

        const dlib::ustring tooltip_utext (
        ) const;

        bool is_checked (
        ) const;

        const std::string name (
        ) const;

        const std::wstring wname (
        ) const;

        const dlib::ustring uname (
        ) const;

        void set_checked (
        );

        void set_unchecked (
        );

        void show (
        );

        void hide (
        );

        void enable (
        );

        void disable (
        );

        void set_main_font (
            const shared_ptr_thread_safe<font>& f
        );

        void set_pos (
            long x,
            long y
        );

        template <
            typename style_type
            >
        void set_style (
            const style_type& style_
        )
        {
            auto_mutex M(m);
            style.reset(new style_type(style_));
            rect = move_rect(style->get_min_size(name_,*mfont), rect.left(), rect.top());
            parent.invalidate_rectangle(rect);
        }

        template <
            typename T
            >
        void set_click_handler (
            T& object,
            void (T::*event_handler_)()
        )
        {
            auto_mutex M(m);
            event_handler = make_mfp(object,event_handler_);
            event_handler_self.clear();
        }

        void set_click_handler (
            const any_function<void()>& event_handler_
        )
        {
            auto_mutex M(m);
            event_handler = event_handler_;
            event_handler_self.clear();
        }

        template <
            typename T
            >
        void set_click_handler (
            T& object,
            void (T::*event_handler_)(toggle_button&)
        )
        {
            auto_mutex M(m);
            event_handler_self = make_mfp(object,event_handler_);
            event_handler.clear();
        }

        void set_sourced_click_handler (
            const any_function<void(toggle_button&)>& event_handler_
        )
        {
            auto_mutex M(m);
            event_handler_self = event_handler_;
            event_handler.clear();
        }

    private:

        // restricted functions
        toggle_button(toggle_button&);        // copy constructor
        toggle_button& operator=(toggle_button&);    // assignment operator

        dlib::ustring name_;
        tooltip btn_tooltip;
        bool checked;

        any_function<void()> event_handler;
        any_function<void(toggle_button&)> event_handler_self;

        scoped_ptr<toggle_button_style> style;

    protected:

        void draw (
            const canvas& c
        ) const { style->draw_toggle_button(c,rect,enabled,*mfont,lastx,lasty,name_,is_depressed(),checked); }

        void on_button_up (
            bool mouse_over
        );

        void on_mouse_over (
        ){ if (style->redraw_on_mouse_over()) parent.invalidate_rectangle(rect); }

        void on_mouse_not_over (
        ){ if (style->redraw_on_mouse_over()) parent.invalidate_rectangle(rect); }
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
                text_color_ == rgb_pixel(0,0,0)
                bg_color_ == rgb_pixel(255,255,255)
                cursor_pos == 0
                text_width == 0
                text_ == ""
                has_focus == false
                cursor_visible == false
                recent_movement == false
                highlight_start == 0
                highlight_end == -1
                shift_pos == -1
                text_pos == 0
    
            CONVENTION
                - cursor_pos == the position of the cursor in the string text_.  The 
                  cursor appears before the letter text_[cursor_pos]
                - cursor_x == the x coordinate of the cursor relative to the left side 
                  of rect.  i.e. the number of pixels that separate the cursor from the
                  left side of the text_field.
                - has_focus == true if this text field has keyboard input focus
                - cursor_visible == true if the cursor should be painted
                - text_ == text()
                - text_pos == the index of the first letter in text_ that appears in 
                  this text field.
                - text_width == the width of text_[text_pos] though text_[text.size()-1]

                - if (has_focus && the user has recently moved the cursor) then
                    - recent_movement == true
                - else
                    - recent_movement == false

                - if (highlight_start <= highlight_end) then
                    - text[highlight_start] though text[highlight_end] should be
                      highlighted

                - if (shift_pos != -1) then
                    - has_focus == true
                    - the shift key is being held down or the left mouse button is
                      being held down.
                    - shift_pos == the position of the cursor when the shift or mouse key
                      was first pressed.

                - text_color() == text_color_
                - background_color() == bg_color_
        !*/

    public:
        text_field(
            drawable_window& w
        ) : 
            drawable(w,MOUSE_CLICK | KEYBOARD_EVENTS | MOUSE_MOVE | STRING_PUT),
            text_color_(0,0,0),
            bg_color_(255,255,255),
            text_width(0),
            text_pos(0),
            recent_movement(false),
            has_focus(false),
            cursor_visible(false),
            cursor_pos(0),
            highlight_start(0),
            highlight_end(-1),
            shift_pos(-1),
            t(*this,&text_field::timer_action),
            right_click_menu(w)
        {
            style.reset(new text_field_style_default());
            rect.set_bottom(mfont->height()+ (style->get_padding(*mfont))*2);
            rect.set_right((style->get_padding(*mfont))*2);
            cursor_x = style->get_padding(*mfont);

            right_click_menu.menu().add_menu_item(menu_item_text("Cut",*this,&text_field::on_cut,'t'));
            right_click_menu.menu().add_menu_item(menu_item_text("Copy",*this,&text_field::on_copy,'C'));
            right_click_menu.menu().add_menu_item(menu_item_text("Paste",*this,&text_field::on_paste,'P'));
            right_click_menu.menu().add_menu_item(menu_item_text("Delete",*this,&text_field::on_delete_selected,'D'));
            right_click_menu.menu().add_menu_item(menu_item_separator());
            right_click_menu.menu().add_menu_item(menu_item_text("Select All",*this,&text_field::on_select_all,'A'));

            right_click_menu.set_rect(get_text_rect());
            enable_events();

            t.set_delay_time(500);
        }

        ~text_field (
        )
        {
            disable_events();
            parent.invalidate_rectangle(rect); 
            t.stop_and_wait();
        }

        template <
            typename style_type
            >
        void set_style (
            const style_type& style_
        )
        {
            auto_mutex M(m);
            style.reset(new style_type(style_));
            // call this just so that this widget redraws itself with the new style
            set_main_font(mfont);
        }

        void set_text (
            const std::string& text_
        );

        void set_text (
            const std::wstring& text_
        );

        void give_input_focus (
        );

        void select_all_text (
        );

        void set_text (
            const dlib::ustring& text_
        );

        const std::string text (
        ) const;

        const std::wstring wtext (
        ) const;

        const dlib::ustring utext (
        ) const;

        void set_text_color (
            const rgb_pixel color
        );

        const rgb_pixel text_color (
        ) const;

        void set_background_color (
            const rgb_pixel color
        );

        const rgb_pixel background_color (
        ) const;

        void set_width (
            unsigned long width
        );

        void set_pos (
            long x,
            long y
        );

        void set_main_font (
            const shared_ptr_thread_safe<font>& f
        );

        int next_free_user_event_number (
        ) const
        {
            return drawable::next_free_user_event_number()+1;
        }

        void disable (
        );

        void enable (
        );

        void hide (
        );

        void show (
        );

        template <
            typename T
            >
        void set_text_modified_handler (
            T& object,
            void (T::*event_handler)()
        )
        {
            auto_mutex M(m);
            text_modified_handler = make_mfp(object,event_handler);
        }

        template <
            typename T
            >
        void set_enter_key_handler (
            T& object,
            void (T::*event_handler)()
        )
        {
            auto_mutex M(m);
            enter_key_handler = make_mfp(object,event_handler);
        }

        void set_text_modified_handler (
            const any_function<void()>& event_handler
        )
        {
            auto_mutex M(m);
            text_modified_handler = event_handler;
        }

        void set_enter_key_handler (
            const any_function<void()>& event_handler
        )
        {
            auto_mutex M(m);
            enter_key_handler = event_handler;
        }

        template <
            typename T
            >
        void set_focus_lost_handler (
            T& object,
            void (T::*event_handler)()
        )
        {
            auto_mutex M(m);
            focus_lost_handler = make_mfp(object,event_handler);
        }

        void set_focus_lost_handler (
            const any_function<void()>& event_handler
        )
        {
            auto_mutex M(m);
            focus_lost_handler = event_handler;
        }

    private:

        void on_cut (
        );
        
        void on_copy (
        );

        void on_paste (
        );

        void on_select_all (
        );

        void on_delete_selected (
        );

        void on_text_is_selected (
        );

        void on_no_text_selected (
        );

        void on_user_event (
            int num
        )
        {
            // ignore this user event if it isn't for us
            if (num != drawable::next_free_user_event_number())
                return;

            if (recent_movement == false)
            {
                cursor_visible = !cursor_visible; 
                parent.invalidate_rectangle(rect); 
            }
            else
            {
                if (cursor_visible == false)
                {
                    cursor_visible = true;
                    parent.invalidate_rectangle(rect); 
                }
                recent_movement = false;
            }
        }

        void timer_action (
        ) { parent.trigger_user_event(this,drawable::next_free_user_event_number()); }
        /*!
            ensures
                - flips the state of cursor_visible
        !*/

        void move_cursor (
            unsigned long pos
        );
        /*!
            requires
                - pos <= text_.size() 
            ensures
                - moves the cursor to the position given by pos and moves the text 
                  in the text box if necessary
                - if the position changes then the parent window will be updated
        !*/

        rectangle get_text_rect (
        ) const;
        /*!
            ensures
                - returns the rectangle that should contain the text in this widget
        !*/

        dlib::ustring text_;
        rgb_pixel text_color_;
        rgb_pixel bg_color_;

        unsigned long text_width;
        unsigned long text_pos;


        bool recent_movement;
        bool has_focus;
        bool cursor_visible;
        long cursor_pos;
        unsigned long cursor_x;

        // this tells you what part of the text is highlighted
        long highlight_start;
        long highlight_end;
        long shift_pos;
        any_function<void()> text_modified_handler;
        any_function<void()> enter_key_handler;
        any_function<void()> focus_lost_handler;

        scoped_ptr<text_field_style> style;

        timer<text_field> t;

        popup_menu_region right_click_menu;

        // restricted functions
        text_field(text_field&);        // copy constructor
        text_field& operator=(text_field&);    // assignment operator


    protected:

        void draw (
            const canvas& c
        ) const;


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

        void on_keydown (
            unsigned long key,
            bool is_printable,
            unsigned long state
        );

        void on_string_put (
            const std::wstring &str
        );
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
                text_color_ == rgb_pixel(0,0,0)
                bg_color_ == rgb_pixel(255,255,255)
                cursor_pos == 0
                text_ == ""
                has_focus == false
                cursor_visible == false
                recent_movement == false
                highlight_start == 0
                highlight_end == -1
                shift_pos == -1
    
            CONVENTION
                - cursor_pos == the position of the cursor in the string text_.  The 
                  cursor appears before the letter text_[cursor_pos]
                - cursor_rect == The rectangle that should be drawn for the cursor. 
                  The position is relative to total_rect().
                - has_focus == true if this text field has keyboard input focus
                - cursor_visible == true if the cursor should be painted
                - text_ == text()

                - if (has_focus && the user has recently moved the cursor) then
                    - recent_movement == true
                - else
                    - recent_movement == false

                - if (highlight_start <= highlight_end) then
                    - text[highlight_start] though text[highlight_end] should be
                      highlighted

                - if (shift_pos != -1) then
                    - has_focus == true
                    - the shift key is being held down or the left mouse button is
                      being held down.
                    - shift_pos == the position of the cursor when the shift or mouse key
                      was first pressed.

                - text_color() == text_color_
                - background_color() == bg_color_
        !*/

    public:
        text_box(
            drawable_window& w
        ) : 
            scrollable_region(w,MOUSE_CLICK | KEYBOARD_EVENTS | MOUSE_MOVE | STRING_PUT),
            text_color_(0,0,0),
            bg_color_(255,255,255),
            recent_movement(false),
            has_focus(false),
            cursor_visible(false),
            cursor_pos(0),
            highlight_start(0),
            highlight_end(-1),
            shift_pos(-1),
            t(*this,&text_box::timer_action),
            right_click_menu(w)
        {
            style.reset(new text_box_style_default());

            const long padding = static_cast<long>(style->get_padding(*mfont));
            cursor_rect = mfont->compute_cursor_rect(rectangle(padding,padding,1000000,1000000), text_, 0);

            adjust_total_rect();

            set_vertical_mouse_wheel_scroll_increment(mfont->height());
            set_horizontal_mouse_wheel_scroll_increment(mfont->height());

            right_click_menu.menu().add_menu_item(menu_item_text("Cut",*this,&text_box::on_cut,'t'));
            right_click_menu.menu().add_menu_item(menu_item_text("Copy",*this,&text_box::on_copy,'C'));
            right_click_menu.menu().add_menu_item(menu_item_text("Paste",*this,&text_box::on_paste,'P'));
            right_click_menu.menu().add_menu_item(menu_item_text("Delete",*this,&text_box::on_delete_selected,'D'));
            right_click_menu.menu().add_menu_item(menu_item_separator());
            right_click_menu.menu().add_menu_item(menu_item_text("Select All",*this,&text_box::on_select_all,'A'));

            right_click_menu.set_rect(get_text_rect());

            set_size(100,100);

            enable_events();

            t.set_delay_time(500);
        }

        ~text_box (
        )
        {
            disable_events();
            parent.invalidate_rectangle(rect); 
            t.stop_and_wait();
        }

        template <
            typename style_type
            >
        void set_style (
            const style_type& style_
        )
        {
            auto_mutex M(m);
            style.reset(new style_type(style_));

            scrollable_region::set_style(style_.get_scrollable_region_style());
            // call this just so that this widget redraws itself with the new style
            set_main_font(mfont);
        }

        void set_text (
            const std::string& text_
        );

        void set_text (
            const std::wstring& text_
        );

        void set_text (
            const dlib::ustring& text_
        );

        const std::string text (
        ) const;

        const std::wstring wtext (
        ) const;

        const dlib::ustring utext (
        ) const;

        void set_text_color (
            const rgb_pixel color
        );

        const rgb_pixel text_color (
        ) const;

        void set_background_color (
            const rgb_pixel color
        );

        const rgb_pixel background_color (
        ) const;

        void set_size (
            unsigned long width,
            unsigned long height 
        );

        void set_pos (
            long x,
            long y
        );

        void set_main_font (
            const shared_ptr_thread_safe<font>& f
        );

        int next_free_user_event_number (
        ) const
        {
            return scrollable_region::next_free_user_event_number()+1;
        }

        void disable (
        );

        void enable (
        );

        void hide (
        );

        void show (
        );

        template <
            typename T
            >
        void set_text_modified_handler (
            T& object,
            void (T::*event_handler)()
        )
        {
            auto_mutex M(m);
            text_modified_handler = make_mfp(object,event_handler);
        }

        void set_text_modified_handler (
            const any_function<void()>& event_handler
        )
        {
            auto_mutex M(m);
            text_modified_handler = event_handler;
        }

        template <
            typename T
            >
        void set_enter_key_handler (
            T& object,
            void (T::*event_handler)()
        )
        {
            auto_mutex M(m);
            enter_key_handler = make_mfp(object,event_handler);
        }

        void set_enter_key_handler (
            const any_function<void()>& event_handler
        )
        {
            auto_mutex M(m);
            enter_key_handler = event_handler;
        }

        template <
            typename T
            >
        void set_focus_lost_handler (
            T& object,
            void (T::*event_handler)()
        )
        {
            auto_mutex M(m);
            focus_lost_handler = make_mfp(object,event_handler);
        }

        void set_focus_lost_handler (
            const any_function<void()>& event_handler
        )
        {
            auto_mutex M(m);
            focus_lost_handler = event_handler;
        }

    private:

        void on_cut (
        );
        
        void on_copy (
        );

        void on_paste (
        );

        void on_select_all (
        );

        void on_delete_selected (
        );

        void on_text_is_selected (
        );

        void on_no_text_selected (
        );

        void on_user_event (
            int num
        )
        {
            // ignore this user event if it isn't for us
            if (num != scrollable_region::next_free_user_event_number())
                return;

            if (recent_movement == false)
            {
                cursor_visible = !cursor_visible; 
                parent.invalidate_rectangle(rect); 
            }
            else
            {
                if (cursor_visible == false)
                {
                    cursor_visible = true;
                    parent.invalidate_rectangle(rect); 
                }
                recent_movement = false;
            }
        }

        // The reason for using user actions here rather than just having the timer just call
        // what it needs directly is to avoid a potential deadlock during destruction of this widget.
        void timer_action (
        ) { parent.trigger_user_event(this,scrollable_region::next_free_user_event_number()); }
        /*!
            ensures
                - flips the state of cursor_visible
        !*/

        void move_cursor (
            unsigned long pos
        );
        /*!
            requires
                - pos <= text_.size() 
            ensures
                - moves the cursor to the position given by pos and moves the text 
                  in the text box if necessary
                - if the position changes then the parent window will be updated
        !*/

        rectangle get_text_rect (
        ) const;
        /*!
            ensures
                - returns the rectangle that should contain the text in this widget
        !*/

        void adjust_total_rect (
        );
        /*!
            ensures
                - adjusts total_rect() so that it is big enough to contain the text
                  currently in this object.
        !*/

        dlib::ustring text_;
        rgb_pixel text_color_;
        rgb_pixel bg_color_;



        bool recent_movement;
        bool has_focus;
        bool cursor_visible;
        long cursor_pos;
        rectangle cursor_rect;

        // this tells you what part of the text is highlighted
        long highlight_start;
        long highlight_end;
        long shift_pos;
        any_function<void()> text_modified_handler;
        any_function<void()> enter_key_handler;
        any_function<void()> focus_lost_handler;

        scoped_ptr<text_box_style> style;

        timer<text_box> t;

        popup_menu_region right_click_menu;

        // restricted functions
        text_box(text_box&);        // copy constructor
        text_box& operator=(text_box&);    // assignment operator


    protected:

        void draw (
            const canvas& c
        ) const;


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

        void on_keydown (
            unsigned long key,
            bool is_printable,
            unsigned long state
        );

        void on_string_put (
            const std::wstring &str
        );
    };

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // class check_box
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    class check_box : public toggle_button 
    {
    public:
        check_box(  
            drawable_window& w
        ) : toggle_button(w)
        {
            set_style(toggle_button_style_check_box());
        }

    };

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // class radio_button
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    class radio_button : public toggle_button 
    {
    public:
        radio_button (  
            drawable_window& w
        ) : toggle_button(w)
        {
            set_style(toggle_button_style_radio_button());
        }

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
                - tabs.size() == 0
                - selected_tab_ == 0

            CONVENTION
                - number_of_tabs() == tabs.size()
                - tab_name(idx) == tabs[idx]
                - if (tabs.size() > 0) then
                    - selected_tab_ == the index of the tab that is currently selected

                - for all valid i:
                    - tabs[i].width == mfont->compute_size(tabs[i].name)
                    - tabs[i].rect == the rectangle that defines where this tab is
                    - if (tabs[i].group != 0) then
                        - tabs[i].group == a pointer to the widget_group for this tab.

                - left_pad == the amount of padding in a tab to the left of the name string.
                - right_pad == the amount of padding in a tab to the right of the name string.
                - top_pad == the amount of padding in a tab to the top of the name string.
                - bottom_pad == the amount of padding in a tab to the bottom of the name string.

                - if (event_handler.is_set()) then
                    - event_handler() is what is called to process click events
                      on this object.
        !*/

    public:

        tabbed_display(  
            drawable_window& w
        );

        virtual ~tabbed_display(
        );

        void set_size (
            unsigned long width,
            unsigned long height
        );

        void set_number_of_tabs (
            unsigned long num
        );

        unsigned long number_of_tabs (
        ) const;

        const std::string tab_name (
            unsigned long idx
        ) const;

        const std::wstring tab_wname (
            unsigned long idx
        ) const;

        const dlib::ustring& tab_uname (
            unsigned long idx
        ) const;

        void set_tab_name (
            unsigned long idx,
            const std::string& new_name
        );

        void set_tab_name (
            unsigned long idx,
            const std::wstring& new_name
        );

        void set_tab_name (
            unsigned long idx,
            const dlib::ustring& new_name
        );

        void set_pos (
            long x,
            long y
        );

        template <
            typename T
            >
        void set_click_handler (
            T& object,
            void (T::*eh)(unsigned long new_idx,unsigned long old_idx)
        )
        {
            auto_mutex M(m);
            event_handler = make_mfp(object,eh);
        }

        void set_click_handler (
            const any_function<void(unsigned long,unsigned long)>& eh
        )
        {
            auto_mutex M(m);
            event_handler = eh;
        }

        void set_tab_group (
            unsigned long idx,
            widget_group& group
        );

        void show (
        );

        void hide (
        );

        void enable (
        );

        void disable (
        );

        void set_main_font (
            const shared_ptr_thread_safe<font>& f
        );

        void fit_to_contents (
        );

    protected:
        void on_mouse_down (
            unsigned long btn,
            unsigned long state,
            long x,
            long y,
            bool is_double_click
        );

        void draw (
            const canvas& c
        ) const;

    private:
        void recompute_tabs (
        );
        /*!
            ensures
                - recomputes the rectangles for all the tabs and makes this object
                  wider if needed
        !*/

        void draw_tab (
            const rectangle& tab,
            const canvas& c
        ) const;
        /*!
            ensures
                - draws the outline of a tab as given by the rectangle onto c
        !*/

        struct tab_data
        {
            tab_data() : width(0), group(0) {}

            dlib::ustring name;
            unsigned long width;
            rectangle rect;
            widget_group* group;
        };

        unsigned long selected_tab_;

        array<tab_data> tabs;

        const long left_pad;
        const long right_pad;
        const long top_pad;
        const long bottom_pad;

        any_function<void(unsigned long,unsigned long)> event_handler;

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
                name == ""

            CONVENTION
                name_ == name()
        !*/

    public:

        named_rectangle(  
            drawable_window& w
        );

        virtual ~named_rectangle(
        );

        void set_size (
            unsigned long width,
            unsigned long height
        );

        void set_name (
            const std::string& name
        );

        void set_name (
            const std::wstring& name
        );

        void set_name (
            const dlib::ustring& name
        );

        const std::string name (
        ) const;

        const std::wstring wname (
        ) const;

        const dlib::ustring uname (
        ) const;

        void wrap_around (
            const rectangle& rect
        );

        void set_main_font (
            const shared_ptr_thread_safe<font>& f
        );

    protected:

        void draw (
            const canvas& c
        ) const;

    private:

        void make_name_fit_in_rect (
        );

        dlib::ustring name_;
        unsigned long name_width;
        unsigned long name_height;

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

    public:

        mouse_tracker(  
            drawable_window& w
        ); 

        ~mouse_tracker(
        );

        void show (
        );

        void hide (
        );

        void enable (
        );

        void disable (
        );

        void set_pos (
            long x,
            long y
        );

        void set_main_font (
            const shared_ptr_thread_safe<font>& f
        );

    protected:

        void on_mouse_move (
            unsigned long state,
            long x,
            long y
        );

        void on_drag (
        );

        void draw (
            const canvas& c
        ) const;

        void on_mouse_down (
            unsigned long btn,
            unsigned long state,
            long x,
            long y,
            bool is_double_click
        );


    private:

        const long offset;
        named_rectangle nr;
        label x_label;
        label y_label; 
        std::ostringstream sout;

        long click_x, click_y;

        // restricted functions
        mouse_tracker(mouse_tracker&);        // copy constructor
        mouse_tracker& operator=(mouse_tracker&);    // assignment operator
    };

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // function message_box()  
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    namespace message_box_helper
    {
        class box_win : public drawable_window
        {
            void initialize (
            );
        public:
            box_win (
                const std::string& title_,
                const std::string& message_
            );

            box_win (
                const std::wstring& title_,
                const std::wstring& message_
            );

            box_win (
                const dlib::ustring& title_,
                const dlib::ustring& message_
            );

            ~box_win (
            );

            void set_click_handler (
                const any_function<void()>& event_handler_
            )
            {
                auto_mutex M(wm);
                event_handler = event_handler_;
            }

        private:

            static void deleter_thread (
                void* param
            );

            void on_click (
            );

            on_close_return_code on_window_close (
            );

            const std::wstring title;
            const std::wstring message;
            label msg;
            button btn_ok;

            any_function<void()> event_handler;
        };

        class blocking_box_win : public drawable_window
        {
            void initialize (
            );

        public:
            blocking_box_win (
                const std::string& title_,
                const std::string& message_
            );

            blocking_box_win (
                const std::wstring& title_,
                const std::wstring& message_
            );

            blocking_box_win (
                const dlib::ustring& title_,
                const dlib::ustring& message_
            );

            ~blocking_box_win (
            );

        private:

            void on_click (
            );

            const std::wstring title;
            const std::wstring message;
            label msg;
            button btn_ok;
        };
    }

    template <
        typename T
        >
    void message_box (
        const std::string& title,
        const std::string& message,
        T& object,
        void (T::*event_handler)() 
    )
    {
        using namespace message_box_helper;
        box_win* win = new box_win(title,message);
        win->set_click_handler(make_mfp(object,event_handler));
    }

    inline void message_box (
        const std::string& title,
        const std::string& message,
        const any_function<void()>& event_handler
    )
    {
        using namespace message_box_helper;
        box_win* win = new box_win(title,message);
        win->set_click_handler(event_handler);
    }

    inline void message_box (
        const std::string& title,
        const std::string& message
    )
    {
        using namespace message_box_helper;
        new box_win(title,message);
    }

    inline void message_box_blocking (
        const std::string& title,
        const std::string& message
    )
    {
        using namespace message_box_helper;
        blocking_box_win w(title,message);
        w.wait_until_closed();
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // class list_box
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    namespace list_box_helper{
    template <typename S = std::string>
    class list_box : public scrollable_region, 
                     public enumerable<const S>
    {
        /*!
            INITIAL VALUE
                - ms_enabled == false
                - items.size() == 0
                - last_selected = 0

            CONVENTION
                - size() == items.size()
                - (*this)[i] == items[i].name
                - is_selected(i) == items[i].is_selected
                - ms_enabled == multiple_select_enabled()

                - items[i].width == the width of items[i].name as given by font::compute_size() 
                - items[i].height == the height of items[i].name as given by font::compute_size() 

                - last_selected == the last item the user selected
        !*/

    public:

        list_box(  
            drawable_window& w
        );

        ~list_box(
        );

        bool is_selected (
            unsigned long index
        ) const;

        void select (
            unsigned long index 
        );

        void unselect (
            unsigned long index 
        );

        template <
            typename style_type
            >
        void set_style (
            const style_type& style_
        )
        {
            auto_mutex M(m);
            style.reset(new style_type(style_));
            scrollable_region::set_style(style_.get_scrollable_region_style());
            parent.invalidate_rectangle(rect);
        }

        template <typename T>
        void get_selected (
            T& list
        ) const
        {
            auto_mutex M(m);
            list.clear();
            for (unsigned long i = 0; i < items.size(); ++i)
            {
                if (items[i].is_selected)
                {
                    unsigned long idx = i;
                    list.enqueue(idx);
                }
            }
        }

        template <typename T>
        void load (
            const T& list
        )
        {
            auto_mutex M(m);
            items.clear();
            unsigned long i = 0;
            items.set_max_size(list.size());
            items.set_size(list.size());
            list.reset();
            unsigned long max_width = 0;
            unsigned long total_height = 0;
            while (list.move_next())
            {
                items[i].is_selected = false;
                items[i].name = list.element();
                mfont->compute_size(items[i].name,items[i].width, items[i].height);

                if (items[i].width > max_width)
                    max_width = items[i].width;
                total_height += items[i].height;

                ++i;
            }
            set_total_rect_size(max_width, total_height);

            parent.invalidate_rectangle(rect);
            last_selected = 0;
        }

        const S& operator[] (
            unsigned long index
        ) const;

        bool multiple_select_enabled (
        ) const;

        void enable_multiple_select (
        ); 

        void disable_multiple_select (
        );

        template <
            typename T
            >
        void set_double_click_handler (
            T& object,
            void (T::*eh)(unsigned long index)
        ) { auto_mutex M(m); event_handler = make_mfp(object,eh); }

        void set_double_click_handler (
            const any_function<void(unsigned long)>& eh
        ) { auto_mutex M(m); event_handler = eh; }

        template <
            typename T
            >
        void set_click_handler (
            T& object,
            void (T::*eh)(unsigned long index)
        ) { auto_mutex M(m); single_click_event_handler = make_mfp(object,eh); }

        void set_click_handler (
            const any_function<void(unsigned long)>& eh
        ) { auto_mutex M(m); single_click_event_handler = eh; }

        bool at_start (
        ) const;

        void reset (
        ) const;

        bool current_element_valid (
        ) const;

        const S& element (
        ) const;

        const S& element (
        );

        bool move_next (
        ) const;

        unsigned long size (
        ) const;

        unsigned long get_selected (
        ) const;

        void set_main_font (
            const shared_ptr_thread_safe<font>& f
        );

    private:

        void on_mouse_down (
            unsigned long btn,
            unsigned long state,
            long x,
            long y,
            bool is_double_click
        );

        void draw (
            const canvas& c
        ) const;

        template <typename SS>
        struct data
        {
            SS name;
            bool is_selected;
            unsigned long width;
            unsigned long height;
        };

        bool ms_enabled;
        array<data<S> > items;
        any_function<void(unsigned long)> event_handler;
        any_function<void(unsigned long)> single_click_event_handler;
        unsigned long last_selected;

        scoped_ptr<list_box_style> style;

        // restricted functions
        list_box(list_box&);        // copy constructor
        list_box& operator=(list_box&);    // assignment operator
    };
    }
    typedef list_box_helper::list_box<std::string> list_box;
    typedef list_box_helper::list_box<std::wstring> wlist_box;
    typedef list_box_helper::list_box<dlib::ustring> ulist_box;

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // function open_file_box() 
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    namespace open_file_box_helper
    {
        class box_win : public drawable_window
        {
        public:
            box_win (
                const std::string& title,
                bool has_text_field = false
            );

            ~box_win (
            );

            void set_click_handler (
                const any_function<void(const std::string&)>& event_handler_
            )
            {
                auto_mutex M(wm);
                event_handler = event_handler_;
            }

        private:

            void set_sizes(
            );

            void on_window_resized (
            );

            void deleter_thread (
            );

            void enter_folder (
                const std::string& folder_name
            );

            void on_dirs_click (
                unsigned long idx
            );

            void on_files_click (
                unsigned long idx
            );

            void on_files_double_click (
                unsigned long 
            );

            void on_cancel_click (
            );

            void on_open_click (
            );

            void on_path_button_click (
                toggle_button& btn
            );

            bool set_dir (
                const std::string& dir
            );

            void on_root_click (
            );

            on_close_return_code on_window_close (
            );

            label lbl_dirs;
            label lbl_files;
            label lbl_file_name;
            list_box lb_dirs;
            list_box lb_files;
            button btn_ok;
            button btn_cancel;
            toggle_button btn_root;
            text_field tf_file_name;
            std::string path;
            std::string prefix;
            int cur_dir;

            any_function<void(const std::string&)> event_handler;
            sequence<scoped_ptr<toggle_button> >::kernel_2a_c sob;
        };
    }

    template <
        typename T
        >
    void open_file_box (
        T& object,
        void (T::*event_handler)(const std::string&) 
    )
    {
        using namespace open_file_box_helper;
        box_win* win = new box_win("Open File",true);
        win->set_click_handler(make_mfp(object,event_handler));
    }

    inline void open_file_box (
        const any_function<void(const std::string&)>& event_handler
    )
    {
        using namespace open_file_box_helper;
        box_win* win = new box_win("Open File",true);
        win->set_click_handler(event_handler);
    }

    template <
        typename T
        >
    void open_existing_file_box (
        T& object,
        void (T::*event_handler)(const std::string&) 
    )
    {
        using namespace open_file_box_helper;
        box_win* win = new box_win("Open File");
        win->set_click_handler(make_mfp(object,event_handler));
    }

    inline void open_existing_file_box (
        const any_function<void(const std::string&)>& event_handler
    )
    {
        using namespace open_file_box_helper;
        box_win* win = new box_win("Open File");
        win->set_click_handler(event_handler);
    }

    template <
        typename T
        >
    void save_file_box (
        T& object,
        void (T::*event_handler)(const std::string&) 
    )
    {
        using namespace open_file_box_helper;
        box_win* win = new box_win("Save File",true);
        win->set_click_handler(make_mfp(object,event_handler));
    }

    inline void save_file_box (
        const any_function<void(const std::string&)>& event_handler
    )
    {
        using namespace open_file_box_helper;
        box_win* win = new box_win("Save File",true);
        win->set_click_handler(event_handler);
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // class menu_bar
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    class menu_bar : public drawable
    {
        /*!
            INITIAL VALUE
                - menus.size() == 0
                - open_menu == 0 

            CONVENTION 
                - size() == menus.size() 
                - all menu data is stored in menus
                - menus[x].name == the name of the xth menu
                - if (menus[x].underline_pos != std::string::npos) then
                    - menus[x].underline_pos == the position of the character in the
                      menu name that should be underlined
                    - menus[x].underline_p1 != menus[x].underline_p2
                      and these two points define the underline bar
                - else
                    - menus[x].underline_p1 == menus[x].underline_p2
                - menus[x].menu == menu(x)
                - menus[x].rect == the rectangle in which menus[x].name is drawn
                - menus[x].bgrect == the rectangle for the xth menu button

                - if (there is an open menu on the screen) then
                    - open_menu == the index of the open menu from menus 
                - else
                    - open_menu == menus.size() 
        !*/

    public:
        menu_bar(
            drawable_window& w
        );

        ~menu_bar();

        // this function does nothing
        void set_pos(long,long){}

        void set_main_font (
            const shared_ptr_thread_safe<font>& f
        );

        void set_number_of_menus (
            unsigned long num
        );

        unsigned long number_of_menus (
        ) const;

        void set_menu_name (
            unsigned long idx,
            const std::string name,
            char underline_ch = '\0'
        );

        void set_menu_name (
            unsigned long idx,
            const std::wstring name,
            char underline_ch = '\0'
        );

        void set_menu_name (
            unsigned long idx,
            const dlib::ustring name,
            char underline_ch = '\0'
        );

        const std::string menu_name (
            unsigned long idx
        ) const;

        const std::wstring menu_wname (
            unsigned long idx
        ) const;

        const dlib::ustring menu_uname (
            unsigned long idx
        ) const;

        popup_menu& menu (
            unsigned long idx
        );

        const popup_menu& menu (
            unsigned long idx
        ) const;

    protected:

        void on_window_resized (
        );

        void draw (
            const canvas& c
        ) const;

        void on_window_moved (
        );

        void on_focus_lost (
        );

        void on_mouse_down (
            unsigned long btn,
            unsigned long ,
            long x,
            long y,
            bool 
        );

        void on_mouse_move (
            unsigned long ,
            long x,
            long y
        );

        void on_keydown (
            unsigned long key,
            bool is_printable,
            unsigned long state
        );

    private:

        void show_menu (
            unsigned long i
        );

        void hide_menu (
        );

        void on_popup_hide (
        );

        void compute_menu_geometry (
        );

        void adjust_position (
        );

        struct menu_data
        {
            menu_data():underline_pos(dlib::ustring::npos){}

            dlib::ustring name;
            dlib::ustring::size_type underline_pos;
            popup_menu menu;
            rectangle rect;
            rectangle bgrect;
            point underline_p1;
            point underline_p2;
        };

        array<menu_data> menus;
        unsigned long open_menu;

        // restricted functions
        menu_bar(menu_bar&);        // copy constructor
        menu_bar& operator=(menu_bar&);    // assignment operator

    };

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // class directed_graph_drawer
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <typename graph_type>
    class directed_graph_drawer : public zoomable_region 
    {
        /*!
            INITIAL VALUE
                - edge_selected == false
                - mouse_drag == false
                - selected_node == 0
                - graph_.number_of_nodes() == 0
                - external_graph.number_of_nodes() == 0
                - radius == 25
                - last_mouse_click_in_display == false

            CONVENTION
                - radius == the radius of the nodes when they aren't zoomed
                - external_graph and graph_ have the same graph structure
                - external_graph == graph()
                - external_graph.node(i) == graph_node(i)

                - if (one of the nodes is selected) then
                    - selected_node < graph_.number_of_nodes()
                    - graph_.node(selected_node) == the selected node
                - else
                    - selected_node == graph_.number_of_nodes()

                - if (the user is dragging a node with the mouse) then
                    - mouse_drag == true
                    - drag_offset == the vector from the mouse position to the
                      center of the node
                - else
                    - mouse_drag == false

                - if (the user has selected an edge) then
                    - edge_selected == true
                    - the parent node is graph_.node(selected_edge_parent)
                    - the child node is graph_.node(selected_edge_parent)
                - else
                    - edge_selected == false

                - for all valid i:
                    - graph_.node(i).data.p == the center of the node in graph space
                    - graph_.node(i).data.name == node_label(i) 
                    - graph_.node(i).data.color == node_color(i) 
                    - graph_.node(i).data.str_rect == a rectangle sized to contain graph_.node(i).data.name

                - if (the last mouse click in our parent window as in our display_rect_ ) then
                    - last_mouse_click_in_display == true
                - else
                    - last_mouse_click_in_display == false
        !*/

    public:
        directed_graph_drawer (
            drawable_window& w
        ) :
            zoomable_region(w,MOUSE_CLICK | MOUSE_WHEEL | KEYBOARD_EVENTS),
            radius(25),
            edge_selected(false),
            last_mouse_click_in_display(false)
        {
            mouse_drag = false;
            selected_node = 0;

            // Whenever you make your own drawable (or inherit from draggable or button_action)
            // you have to remember to call this function to enable the events.  The idea
            // here is that you can perform whatever setup you need to do to get your 
            // object into a valid state without needing to worry about event handlers 
            // triggering before you are ready.
            enable_events();
        }

        ~directed_graph_drawer (
        )
        {
            // Disable all further events for this drawable object.  We have to do this 
            // because we don't want draw() events coming to this object while or after 
            // it has been destructed.
            disable_events();

            // Tell the parent window to redraw its area that previously contained this
            // drawable object.
            parent.invalidate_rectangle(rect);
        }

        void clear_graph (
        )
        {
            auto_mutex M(m);
            graph_.clear();
            external_graph.clear();
            parent.invalidate_rectangle(display_rect());
        }

        const typename graph_type::node_type& graph_node (
            unsigned long i
        )  const
        {
            DLIB_ASSERT ( i < number_of_nodes() ,
                    "\tgraph_type::node_type& directed_graph_drawer::graph_node(i)"
                    << "\n\ti:                 " << i 
                    << "\n\tnumber_of_nodes(): " << number_of_nodes() 
                    );
            return external_graph.node(i);
        }

        typename graph_type::node_type& graph_node (
            unsigned long i
        ) 
        {
            DLIB_ASSERT ( i < number_of_nodes() ,
                    "\tgraph_type::node_type& directed_graph_drawer::graph_node(i)"
                    << "\n\ti:                 " << i 
                    << "\n\tnumber_of_nodes(): " << number_of_nodes() 
                    );
            return external_graph.node(i);
        }

        const graph_type& graph (
        ) const
        {
            return external_graph;
        }

        void save_graph (
            std::ostream& out
        )
        {
            auto_mutex M(m);
            serialize(external_graph, out);
            serialize(graph_, out);
            parent.invalidate_rectangle(display_rect());
        }

        void load_graph (
            std::istream& in 
        )
        {
            auto_mutex M(m);
            deserialize(external_graph, in);
            deserialize(graph_, in);
            parent.invalidate_rectangle(display_rect());
        }

        unsigned long number_of_nodes (
        ) const
        {
            auto_mutex M(m);
            return graph_.number_of_nodes();
        }

        void set_node_label (
            unsigned long i,
            const std::string& label
        )
        {
            set_node_label(i, convert_mbstring_to_wstring(label));
        }

        void set_node_label (
            unsigned long i,
            const std::wstring& label
        )
        {
            set_node_label(i, convert_wstring_to_utf32(label));
        }

        void set_node_label (
            unsigned long i,
            const dlib::ustring& label
        )
        {
            auto_mutex M(m);
            DLIB_ASSERT ( i < number_of_nodes() ,
                    "\tvoid directed_graph_drawer::set_node_label(i,label)"
                    << "\n\ti:                 " << i 
                    << "\n\tlabel:             " << narrow(label) 
                    << "\n\tnumber_of_nodes(): " << number_of_nodes() 
                    );
            graph_.node(i).data.name = label.c_str();
            unsigned long width, height;
            mfont->compute_size(label,width,height);
            graph_.node(i).data.str_rect = rectangle(width,height);
            parent.invalidate_rectangle(display_rect());
        }

        void set_node_color (
            unsigned long i,
            rgb_pixel color
        )
        {
            auto_mutex M(m);
            DLIB_ASSERT ( i < number_of_nodes() ,
                    "\tvoid directed_graph_drawer::set_node_color(i,label)"
                    << "\n\ti:                 " << i 
                    << "\n\tnumber_of_nodes(): " << number_of_nodes() 
                    );
            graph_.node(i).data.color = color;
            parent.invalidate_rectangle(display_rect());
        }

        rgb_pixel node_color (
            unsigned long i
        ) const
        {
            auto_mutex M(m);
            DLIB_ASSERT ( i < number_of_nodes() ,
                    "\trgb_pixel directed_graph_drawer::node_color(i)"
                    << "\n\ti:                 " << i 
                    << "\n\tnumber_of_nodes(): " << number_of_nodes() 
                    );
            return graph_.node(i).data.color;
        }

        const std::string node_label (
            unsigned long i
        ) const
        {
            auto_mutex M(m);
            DLIB_ASSERT ( i < number_of_nodes() ,
                    "\tconst std::ustring directed_graph_drawer::node_label(i)"
                    << "\n\ti:                 " << i 
                    << "\n\tnumber_of_nodes(): " << number_of_nodes() 
                    );
            return narrow(graph_.node(i).data.name);
        }

        const std::wstring node_wlabel (
            unsigned long i
        ) const
        {
            return convert_utf32_to_wstring(node_ulabel(i));
        }

        const dlib::ustring node_ulabel (
            unsigned long i
        ) const
        {
            auto_mutex M(m);
            DLIB_ASSERT ( i < number_of_nodes() ,
                    "\tconst std::ustring directed_graph_drawer::node_label(i)"
                    << "\n\ti:                 " << i 
                    << "\n\tnumber_of_nodes(): " << number_of_nodes() 
                    );
            return graph_.node(i).data.name.c_str();
        }

        template <
            typename T
            >
        void set_node_selected_handler (
            T& object,
            void (T::*event_handler_)(unsigned long)
        )
        {
            auto_mutex M(m);
            node_selected_handler = make_mfp(object,event_handler_);
        }

        void set_node_selected_handler (
            const any_function<void(unsigned long)>& event_handler_
        )
        {
            auto_mutex M(m);
            node_selected_handler = event_handler_;
        }

        template <
            typename T
            >
        void set_node_deselected_handler (
            T& object,
            void (T::*event_handler_)(unsigned long)
        )
        {
            auto_mutex M(m);
            node_deselected_handler = make_mfp(object,event_handler_);
        }

        void set_node_deselected_handler (
            const any_function<void(unsigned long)>& event_handler_
        )
        {
            auto_mutex M(m);
            node_deselected_handler = event_handler_;
        }

        template <
            typename T
            >
        void set_node_deleted_handler (
            T& object,
            void (T::*event_handler_)()
        )
        {
            auto_mutex M(m);
            node_deleted_handler = make_mfp(object,event_handler_);
        }

        void set_node_deleted_handler (
            const any_function<void()>& event_handler_
        )
        {
            auto_mutex M(m);
            node_deleted_handler = event_handler_;
        }

        template <
            typename T
            >
        void set_graph_modified_handler (
            T& object,
            void (T::*event_handler_)()
        )
        {
            auto_mutex M(m);
            graph_modified_handler = make_mfp(object,event_handler_);
        }

        void set_graph_modified_handler (
            const any_function<void()>& event_handler_
        )
        {
            auto_mutex M(m);
            graph_modified_handler = event_handler_;
        }

    protected:

        void on_keydown (
            unsigned long key,          
            bool ,
            unsigned long 
        )
        {
            // ignore all keyboard input if the last thing the user clicked on 
            // wasn't the display area
            if (last_mouse_click_in_display == false)
                return;

            // if a node is selected
            if (selected_node != graph_.number_of_nodes())
            {
                // deselect the node if the user hits escape
                if (key == base_window::KEY_ESC)
                {
                    parent.invalidate_rectangle(display_rect());
                    if (node_deselected_handler.is_set())
                        node_deselected_handler(selected_node);
                    selected_node = graph_.number_of_nodes();
                }

                // delete the node if the user hits delete 
                if (key == base_window::KEY_DELETE || key == base_window::KEY_BACKSPACE)
                {
                    parent.invalidate_rectangle(display_rect());
                    graph_.remove_node(selected_node);
                    external_graph.remove_node(selected_node);
                    selected_node = graph_.number_of_nodes();
                    mouse_drag = false;
                    if (graph_modified_handler.is_set())
                        graph_modified_handler();
                    if (node_deleted_handler.is_set())
                        node_deleted_handler();
                }
            }

            // if an edge is selected
            if (edge_selected)
            {
                // deselect the node if the user hits escape
                if (key == base_window::KEY_ESC)
                {
                    parent.invalidate_rectangle(display_rect());
                    edge_selected = false;
                }

                // delete the node if the user hits delete 
                if (key == base_window::KEY_DELETE || key == base_window::KEY_BACKSPACE)
                {
                    parent.invalidate_rectangle(display_rect());
                    graph_.remove_edge(selected_edge_parent, selected_edge_child);
                    external_graph.remove_edge(selected_edge_parent, selected_edge_child);
                    edge_selected = false;

                    if (graph_modified_handler.is_set())
                        graph_modified_handler();
                }
            }
        }


        void on_mouse_move (
            unsigned long state,
            long x,
            long y
        )
        {
            if (mouse_drag)
            {
                const point p(nearest_point(display_rect(),point(x,y)));

                point center = drag_offset + p;
                graph_.node(selected_node).data.p = gui_to_graph_space(center);
                parent.invalidate_rectangle(display_rect());
            }
            else
            {
                zoomable_region::on_mouse_move(state,x,y);
            }

            // check if the mouse isn't being dragged anymore
            if ((state & base_window::LEFT) == 0)
            {
                mouse_drag = false;
            }
        }

        void on_mouse_up (
            unsigned long btn,
            unsigned long state,
            long x,
            long y
        )
        {
            mouse_drag = false;
            zoomable_region::on_mouse_up(btn,state,x,y);
        }

        void on_mouse_down (
            unsigned long btn,
            unsigned long state,
            long x,
            long y,
            bool is_double_click
        )
        {
            bool redraw = false;

            if (display_rect().contains(x,y) && 
                (btn == base_window::RIGHT || btn == base_window::LEFT) && 
                (state & base_window::SHIFT) == 0 )
            {
                // start out saying no edge is selected
                if (edge_selected)
                {
                    edge_selected = false;
                    redraw = true;
                }

                bool click_hit_node = false;
                dlib::vector<double,2> p(gui_to_graph_space(point(x,y)));
                // check if this click is on an existing node
                for (unsigned long i = 0; i < graph_.number_of_nodes(); ++i)
                {
                    dlib::vector<double,2> n(graph_.node(i).data.p);
                    if ((p-n).length() < radius)
                    {
                        click_hit_node = true;
                        point center = graph_to_gui_space(graph_.node(i).data.p);
                        mouse_drag = true;
                        drag_offset = center - point(x,y);

                        // only do something if the click isn't on the currently
                        // selected node
                        if (selected_node != i)
                        {
                            // send out the deselected event if appropriate
                            if (selected_node != graph_.number_of_nodes() && node_deselected_handler.is_set())
                                node_deselected_handler(selected_node);

                            selected_node = i;
                            redraw = true;
                            if (node_selected_handler.is_set())
                                node_selected_handler(selected_node);
                        }
                        break;
                    }
                }

                // if the click didn't hit any node then make sure nothing is selected
                if (click_hit_node == false && selected_node != graph_.number_of_nodes())
                {
                    if (node_deselected_handler.is_set())
                        node_deselected_handler(selected_node);
                    selected_node = graph_.number_of_nodes();
                    redraw = true;
                }


                // check if this click is on an edge if we didn't click on a node
                if (click_hit_node == false)
                {
                    for (unsigned long n = 0; n < graph_.number_of_nodes() && edge_selected == false; ++n)
                    {
                        const dlib::vector<double,2> parent_center(graph_to_gui_space(graph_.node(n).data.p));
                        for (unsigned long e = 0; e < graph_.node(n).number_of_children() && edge_selected == false; ++e)
                        {
                            const dlib::vector<double,2> child_center(graph_to_gui_space(graph_.node(n).child(e).data.p));

                            rectangle area;
                            area += parent_center;
                            area += child_center;
                            // if the point(x,y) is between the two nodes then lets consider it further
                            if (area.contains(point(x,y)))
                            {
                                p = point(x,y);
                                const dlib::vector<double> z(0,0,1);
                                // find the distance from the line between the two nodes
                                const dlib::vector<double,2> perpendicular(z.cross(parent_center-child_center).normalize());
                                double distance = std::abs((child_center-p).dot(perpendicular));
                                if (distance < 8)
                                {
                                    edge_selected = true;
                                    selected_edge_parent = n;
                                    selected_edge_child = graph_.node(n).child(e).index();
                                    redraw = true;
                                }
                            }
                        }
                    }
                }


                // if the click didn't land on any node then add a new one if this was
                // a right mouse button click
                if (click_hit_node == false && btn == base_window::RIGHT)
                {
                    const unsigned long n = graph_.add_node();
                    external_graph.add_node();

                    graph_.node(n).data.p = gui_to_graph_space(point(x,y));

                    redraw = true;
                    selected_node = n;
                    mouse_drag = false;
                    if (graph_modified_handler.is_set())
                        graph_modified_handler();

                    if (node_selected_handler.is_set())
                        node_selected_handler(selected_node);

                }
                else if (selected_node == graph_.number_of_nodes())
                {
                    // in this case the click landed in the white area between nodes
                    zoomable_region::on_mouse_down( btn, state, x, y, is_double_click);
                }
            }

            // If the user is shift clicking with the mouse then see if we
            // should add a new edge.
            if (display_rect().contains(x,y) && 
                btn == base_window::LEFT && 
                (state & base_window::SHIFT) && 
                selected_node != graph_.number_of_nodes() )
            {
                dlib::vector<double,2> p(gui_to_graph_space(point(x,y)));
                // check if this click is on an existing node
                for (unsigned long i = 0; i < graph_.number_of_nodes(); ++i)
                {
                    dlib::vector<double,2> n(graph_.node(i).data.p);
                    if ((p-n).length() < radius)
                    {
                        // add the edge if it doesn't already exist and isn't an edge back to 
                        // the same node
                        if (graph_.has_edge(selected_node,i) == false && selected_node != i &&
                            graph_.has_edge(i, selected_node) == false)
                        {
                            graph_.add_edge(selected_node,i);
                            external_graph.add_edge(selected_node,i);
                            redraw = true;

                            if (graph_modified_handler.is_set())
                                graph_modified_handler();
                        }
                        break;
                    }
                }
            }


            if (redraw)
                parent.invalidate_rectangle(display_rect());


            if (display_rect().contains(x,y) == false)
                last_mouse_click_in_display = false;
            else
                last_mouse_click_in_display = true;
        }

        void draw (
            const canvas& c
        ) const
        {
            zoomable_region::draw(c);

            rectangle area = c.intersect(display_rect());
            if (area.is_empty() == true)
                return;


            if (enabled)
                fill_rect(c,display_rect(),255);
            else
                fill_rect(c,display_rect(),128);


            const unsigned long rad = static_cast<unsigned long>(radius*zoom_scale());
            point center;


            // first draw all the edges
            for (unsigned long i = 0; i < graph_.number_of_nodes(); ++i)
            {
                center = graph_to_gui_space(graph_.node(i).data.p);
                const rectangle circle_area(centered_rect(center,2*(rad+8),2*(rad+8)));

                // draw lines to all this node's parents 
                const dlib::vector<double> z(0,0,1);
                for (unsigned long j = 0; j < graph_.node(i).number_of_parents(); ++j)
                {
                    point p(graph_to_gui_space(graph_.node(i).parent(j).data.p));

                    rgb_pixel color(0,0,0);
                    // if this is the selected edge then draw it with red instead of black
                    if (edge_selected && selected_edge_child == i && selected_edge_parent == graph_.node(i).parent(j).index())
                    {
                        color.red = 255;
                        // we need to be careful when drawing this line to not draw it over the node dots since it 
                        // has a different color from them and would look weird
                        dlib::vector<double,2> v(p-center);
                        v = v.normalize()*rad;
                        draw_line(c,center+v,p-v ,color, area);
                    }
                    else
                    {
                        draw_line(c,center,p ,color, area);
                    }


                    // draw the triangle pointing to this node
                    if (area.intersect(circle_area).is_empty() == false)
                    {
                        dlib::vector<double,2> v(p-center);
                        v = v.normalize();

                        dlib::vector<double,2> cross = z.cross(v).normalize();
                        dlib::vector<double,2> r(center + v*rad);
                        for (double i = 0; i < 8*zoom_scale(); i += 0.1)
                            draw_line(c,(r+v*i)+cross*i, (r+v*i)-cross*i,color,area);
                    }
                }
            }


            // now draw all the node dots
            for (unsigned long i = 0; i < graph_.number_of_nodes(); ++i)
            {
                center = graph_to_gui_space(graph_.node(i).data.p);
                const rectangle circle_area(centered_rect(center,2*(rad+8),2*(rad+8)));

                // draw the actual dot for this node
                if (area.intersect(circle_area).is_empty()==false)
                {
                    rgb_alpha_pixel color;
                    assign_pixel(color, graph_.node(i).data.color);
                    // this node is in area so lets draw it and all of it's edges as well
                    draw_solid_circle(c,center,rad-3,color,area);
                    color.alpha = 240;
                    draw_circle(c,center,rad-3,color,area);
                    color.alpha = 200;
                    draw_circle(c,center,rad-2.5,color,area);
                    color.alpha = 160;
                    draw_circle(c,center,rad-2.0,color,area);
                    color.alpha = 120;
                    draw_circle(c,center,rad-1.5,color,area);
                    color.alpha = 80;
                    draw_circle(c,center,rad-1.0,color,area);
                    color.alpha = 40;
                    draw_circle(c,center,rad-0.5,color,area);

                }


                if (i == selected_node)
                    draw_circle(c,center,rad+5,rgb_pixel(0,0,255),area);
            }


            // now draw all the strings last
            for (unsigned long i = 0; i < graph_.number_of_nodes(); ++i)
            {
                center = graph_to_gui_space(graph_.node(i).data.p);
                rectangle circle_area(centered_rect(center,2*rad+3,2*rad+3));
                if (area.intersect(circle_area).is_empty()==false)
                {
                    rgb_pixel color = graph_.node(i).data.color;
                    // invert this color
                    color.red = 255-color.red;
                    color.green = 255-color.green;
                    color.blue = 255-color.blue;
                    sout << i;
                    unsigned long width, height;
                    mfont->compute_size(sout.str(),width,height);
                    rectangle str_rect(centered_rect(center, width,height));
                    if (circle_area.contains(str_rect))
                    {
                        mfont->draw_string(c,str_rect,sout.str(),color,0,std::string::npos,area);

                        // draw the label for this node if it isn't empty
                        if(graph_.node(i).data.name.size() > 0)
                        {
                            rectangle str_rect(graph_.node(i).data.str_rect);
                            str_rect = centered_rect(center.x(), center.y()-rad-mfont->height(),  str_rect.width(), str_rect.height());
                            mfont->draw_string(c,str_rect,graph_.node(i).data.name,0,0,std::string::npos,area);
                        }
                    }
                    sout.str("");
                }
            }
        }

    private:

        struct data
        {
            data() : color(0,0,0) {}
            vector<double> p;
            dlib::ustring name;
            rectangle str_rect;
            rgb_pixel color;
        };

        friend void serialize(const data& item, std::ostream& out)
        {
            serialize(item.p, out);
            serialize(item.name, out);
            serialize(item.str_rect, out);
            serialize(item.color, out);
        }

        friend void deserialize(data& item, std::istream& in)
        {
            deserialize(item.p, in);
            deserialize(item.name, in);
            deserialize(item.str_rect, in);
            deserialize(item.color, in);
        }

        mutable std::ostringstream sout;

        const double radius;
        unsigned long selected_node;
        bool mouse_drag; // true if the user is dragging a node
        point drag_offset; 

        bool edge_selected;
        unsigned long selected_edge_parent;
        unsigned long selected_edge_child;

        any_function<void(unsigned long)> node_selected_handler;
        any_function<void(unsigned long)> node_deselected_handler;
        any_function<void()> node_deleted_handler;
        any_function<void()> graph_modified_handler;

        graph_type external_graph;
        // rebind the graph_ type to make us a graph_ of data structs
        typename graph_type::template rebind<data,char, typename graph_type::mem_manager_type>::other graph_;

        bool last_mouse_click_in_display;
    };

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // class text_grid
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    class text_grid : public scrollable_region 
    {
        /*!
            INITIAL VALUE
                - has_focus == false
                - vertical_scroll_increment() == 10
                - horizontal_scroll_increment() == 10
                - border_color_ == rgb_pixel(128,128,128)

            CONVENTION
                - grid.nr() == row_height.size()
                - grid.nc() == col_width.size()
                - border_color() == border_color_
                - text(r,c) == grid[r][c].text
                - text_color(r,c) == grid[r][c].text_color
                - background_color(r,c) == grid[r][c].bg_color

                - if (the user has clicked on this widget and caused one of the
                    boxes to have input focus) then
                    - has_focus == true
                    - grid[active_row][active_col] == the active text box
                    - cursor_pos == the position of the cursor in the above box
                    - if (the cursor should be displayed) then
                        - show_cursor == true
                    - else
                        - show_cursor == false
                - else
                    - has_focus == false
        !*/

    public:
        text_grid (
            drawable_window& w
        ); 

        ~text_grid (
        );

        void set_grid_size (
            unsigned long rows,
            unsigned long cols
        );

        unsigned long number_of_columns (
        ) const;

        unsigned long number_of_rows (
        ) const;

        int next_free_user_event_number (
        ) const;

        rgb_pixel border_color (
        ) const;

        void set_border_color (
            rgb_pixel color
        );

        const std::string text (
            unsigned long row,
            unsigned long col
        ) const;

        const std::wstring wtext (
            unsigned long row,
            unsigned long col
        ) const;

        const dlib::ustring utext (
            unsigned long row,
            unsigned long col
        ) const;

        void set_text (
            unsigned long row,
            unsigned long col,
            const std::string& str
        );

        void set_text (
            unsigned long row,
            unsigned long col,
            const std::wstring& str
        );

        void set_text (
            unsigned long row,
            unsigned long col,
            const dlib::ustring& str
        );

        const rgb_pixel text_color (
            unsigned long row,
            unsigned long col
        ) const;

        void set_text_color (
            unsigned long row,
            unsigned long col,
            const rgb_pixel color
        );

        const rgb_pixel background_color (
            unsigned long row,
            unsigned long col
        ) const;

        void set_background_color (
            unsigned long row,
            unsigned long col,
            const rgb_pixel color
        );

        bool is_editable (
            unsigned long row,
            unsigned long col
        ) const;

        void set_editable (
            unsigned long row,
            unsigned long col,
            bool editable
        );

        void set_column_width (
            unsigned long col,
            unsigned long width
        );

        void set_row_height (
            unsigned long row,
            unsigned long height 
        );

        void disable (
        );

        void hide (
        );

        template <
            typename T
            >
        void set_text_modified_handler (
            T& object,
            void (T::*eh)(unsigned long, unsigned long)
        ) { text_modified_handler = make_mfp(object,eh); }

        void set_text_modified_handler (
            const any_function<void(unsigned long, unsigned long)>& eh
        ) { text_modified_handler = eh; }

    private:

        void on_user_event (
            int num
        );

        void timer_action (
        ); 
        /*!
            ensures
                - flips the state of show_cursor 
        !*/

        void compute_bg_rects (
        );

        void compute_total_rect (
        );

        void on_keydown (
            unsigned long key,          
            bool is_printable,
            unsigned long state
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

        void on_focus_lost (
        );

        void draw (
            const canvas& c
        ) const;

        rectangle get_text_rect (
            unsigned long row,
            unsigned long col
        ) const;

        rectangle get_bg_rect (
            unsigned long row,
            unsigned long col
        ) const;

        struct data_type
        {
            data_type(): text_color(0,0,0), bg_color(255,255,255),
            first(0), is_editable(true) 
            {}

            dlib::ustring text;
            rgb_pixel text_color;
            rgb_pixel bg_color;
            rectangle bg_rect;
            dlib::ustring::size_type first;
            bool is_editable;
        };

        void drop_input_focus (
        );

        void move_cursor (
            long row,
            long col,
            long new_cursor_pos
        );

        array2d<data_type> grid;
        array<unsigned long> col_width;
        array<unsigned long> row_height;
        bool has_focus;
        long active_col;
        long active_row;
        long cursor_pos;
        bool show_cursor;
        bool recent_cursor_move;
        timer<text_grid> cursor_timer;
        rgb_pixel border_color_;
        any_function<void(unsigned long, unsigned long)> text_modified_handler;
    };

// ----------------------------------------------------------------------------------------

    class image_display : public scrollable_region 
    {
        /*!
            INITIAL VALUE
                - img.size() == 0
                - overlay_rects.size() == 0
                - overlay_lines.size() == 0
                - drawing_rect == false
                - rect_is_selected == false

            CONVENTION
                - img == the image this object displays
                - overlay_rects == the overlay rectangles this object displays
                - overlay_lines == the overlay lines this object displays

                - if (drawing_rect) then
                    - the user is drawing a rectangle on the screen and is
                      thus holding down CTRL and the left mouse button.
                    - rect_anchor == the point on the screen where the user
                      clicked to begin drawing the rectangle.  
                    - rect_to_draw == the rectangle which should appear on the screen.

                - if (rect_is_selected) then
                    - selected_rect == the index in overlay_rects of the user selected
                      rectangle.
                    - last_right_click_pos == the last place we saw the user right click
                      the mouse.
                    - parts_menu.is_enabled() == true
                    - if (it is actually a part of this rect that is selected) then
                        - selected_part_name == the name of the part in overlay_rects[selected_rect].parts
                          that is selected.
                    - else
                        - selected_part_name.size() == 0
                - else
                    - parts_menu.is_enabled() == false
                    - selected_part_name.size() == 0

                - if (moving_overlay) then
                    - moving_rect == the index in overlay_rects that the move applies to.  
                    - if (moving_what == MOVING_PART) then
                        - moving_part_name == the name of the part in
                          overlay_rects[moving_rect] that is being moved around with the
                          mouse.
                    - else
                        - moving_what will tell us which side of the rectangle in
                          overlay_rects[moving_rect] is being moved by the mouse.
        !*/

    public:

        image_display(  
            drawable_window& w
        );

        ~image_display(
        );

        template <
            typename image_type
            >
        void set_image (
            const image_type& new_img
        )
        {
            auto_mutex M(m);

            // if the new image has a different size when compared to the previous image
            // then we should readjust the total rectangle size.
            if (num_rows(new_img) != img.nr() || num_columns(new_img) != img.nc())
            {
                if (zoom_in_scale != 1)
                    set_total_rect_size(num_columns(new_img)*zoom_in_scale, num_rows(new_img)*zoom_in_scale);
                else
                    set_total_rect_size(num_columns(new_img)/zoom_out_scale, num_rows(new_img)/zoom_out_scale);
            }
            else
            {
                parent.invalidate_rectangle(rect);
            }

            highlighted_rect = std::numeric_limits<unsigned long>::max();
            rect_is_selected = false;
            parts_menu.disable();
            assign_image_scaled(img,new_img);
        }

        virtual void set_pos (
            long x,
            long y
        )
        {
            auto_mutex lock(m);
            scrollable_region::set_pos(x,y);
            parts_menu.set_rect(rect);
        }

        virtual void set_size (
            unsigned long width,
            unsigned long height 
        )
        {
            auto_mutex lock(m);
            scrollable_region::set_size(width,height);
            parts_menu.set_rect(rect);
        }

        struct overlay_rect
        {
            overlay_rect() :crossed_out(false) { assign_pixel(color, 0);}

            template <typename pixel_type>
            overlay_rect(const rectangle& r, pixel_type p) 
                : rect(r),crossed_out(false) { assign_pixel(color, p); }

            template <typename pixel_type>
            overlay_rect(const rectangle& r, pixel_type p, const std::string& l) 
                : rect(r),label(l),crossed_out(false) { assign_pixel(color, p); }

            template <typename pixel_type>
            overlay_rect(const rectangle& r, pixel_type p, const std::string& l, const std::map<std::string,point>& parts_) 
                : rect(r),label(l),parts(parts_),crossed_out(false) { assign_pixel(color, p); }

            rectangle rect;
            rgb_alpha_pixel color;
            std::string label;
            std::map<std::string,point> parts;
            bool crossed_out;
        };

        struct overlay_line
        {
            overlay_line() { assign_pixel(color, 0);}

            template <typename pixel_type>
            overlay_line(const point& p1_, const point& p2_, pixel_type p) 
                : p1(p1_), p2(p2_) { assign_pixel(color, p); }

            point p1;
            point p2;
            rgb_alpha_pixel color;
        };

        struct overlay_circle
        {
            overlay_circle():radius(0) { assign_pixel(color, 0);}

            template <typename pixel_type>
            overlay_circle(const point& center_, const int radius_, pixel_type p) 
                : center(center_), radius(radius_) { assign_pixel(color, p); }

            template <typename pixel_type>
            overlay_circle(const point& center_, const int radius_, pixel_type p, const std::string& l) 
                : center(center_), radius(radius_), label(l) { assign_pixel(color, p); }

            point center;
            int radius;
            rgb_alpha_pixel color;
            std::string label;
        };

        void add_overlay (
            const overlay_rect& overlay
        );

        void add_overlay (
            const overlay_line& overlay
        );

        void add_overlay (
            const overlay_circle& overlay
        );

        void add_overlay (
            const std::vector<overlay_rect>& overlay
        );

        void add_overlay (
            const std::vector<overlay_line>& overlay
        );

        void add_overlay (
            const std::vector<overlay_circle>& overlay
        );

        void clear_overlay (
        );

        rectangle get_image_display_rect (
        ) const;

        std::vector<overlay_rect> get_overlay_rects (
        ) const;

        void set_default_overlay_rect_label (
            const std::string& label
        );

        std::string get_default_overlay_rect_label (
        ) const;

        void set_default_overlay_rect_color (
            const rgb_alpha_pixel& color
        );

        rgb_alpha_pixel get_default_overlay_rect_color (
        ) const;

        template <
            typename T
            >
        void set_overlay_rects_changed_handler (
            T& object,
            void (T::*event_handler_)()
        )
        {
            auto_mutex M(m);
            event_handler = make_mfp(object,event_handler_);
        }

        void set_overlay_rects_changed_handler (
            const any_function<void()>& event_handler_
        )
        {
            auto_mutex M(m);
            event_handler = event_handler_;
        }

        template <
            typename T
            >
        void set_overlay_rect_selected_handler (
            T& object,
            void (T::*event_handler_)(const overlay_rect& orect)
        )
        {
            auto_mutex M(m);
            orect_selected_event_handler = make_mfp(object,event_handler_);
        }

        void set_overlay_rect_selected_handler (
            const any_function<void(const overlay_rect& orect)>& event_handler_
        )
        {
            auto_mutex M(m);
            orect_selected_event_handler = event_handler_;
        }

        template <
            typename T
            >
        void set_image_clicked_handler (
            T& object,
            void (T::*event_handler_)(const point& p, bool is_double_click, unsigned long btn)
        )
        {
            auto_mutex M(m);
            image_clicked_handler = make_mfp(object,event_handler_);
        }

        void set_image_clicked_handler (
            const any_function<void(const point& p, bool is_double_click, unsigned long btn)>& event_handler_
        )
        {
            auto_mutex M(m);
            image_clicked_handler = event_handler_;
        }

        void add_labelable_part_name (
            const std::string& name
        );

        void clear_labelable_part_names (
        );

        void enable_overlay_editing (
        ) { auto_mutex M(m); overlay_editing_enabled = true; }

        void disable_overlay_editing (
        ) 
        { 
            auto_mutex M(m); 
            overlay_editing_enabled = false;  
            rect_is_selected = false;
            drawing_rect = false;
            parent.invalidate_rectangle(rect);
        }
        
        bool overlay_editing_is_enabled (
        ) const { auto_mutex M(m); return overlay_editing_enabled; }

    private:

        void draw (
            const canvas& c
        ) const;

        void on_wheel_up (
            unsigned long state
        );

        void on_wheel_down (
            unsigned long state
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

        void on_keydown (
            unsigned long key,
            bool is_printable,
            unsigned long state
        );

        void on_part_add (
            const std::string& part_name
        );

        rectangle get_rect_on_screen (
            unsigned long idx
        ) const;

        rectangle get_rect_on_screen (
            rectangle orect 
        ) const;

        rgb_alpha_pixel invert_pixel (const rgb_alpha_pixel& p) const
        { return rgb_alpha_pixel(255-p.red, 255-p.green, 255-p.blue, p.alpha); }

        virtual int next_free_user_event_number (
        ) const { return scrollable_region::next_free_user_event_number()+1; }
        // The reason for using user actions here rather than just having the timer just call
        // what it needs directly is to avoid a potential deadlock during destruction of this widget.
        void timer_event_unhighlight_rect()
        { 
            highlight_timer.stop(); 
            parent.trigger_user_event(this,scrollable_region::next_free_user_event_number()); 
        }
        void on_user_event (int num)
        {
            // ignore this user event if it isn't for us
            if (num != scrollable_region::next_free_user_event_number())
                return;
            if (highlighted_rect < overlay_rects.size())
            {
                highlighted_rect = std::numeric_limits<unsigned long>::max();
                parent.invalidate_rectangle(rect);
            }
        }


        array2d<rgb_alpha_pixel> img;


        std::vector<overlay_rect> overlay_rects;
        std::vector<overlay_line> overlay_lines;
        std::vector<overlay_circle> overlay_circles;

        long zoom_in_scale;
        long zoom_out_scale;
        bool drawing_rect;
        point rect_anchor;
        rectangle rect_to_draw;
        bool rect_is_selected;
        std::string selected_part_name;
        unsigned long selected_rect;
        rgb_alpha_pixel default_rect_color;
        std::string default_rect_label;
        any_function<void()> event_handler;
        any_function<void(const overlay_rect& orect)> orect_selected_event_handler;
        any_function<void(const point& p, bool is_double_click, unsigned long btn)> image_clicked_handler;
        popup_menu_region parts_menu;
        point last_right_click_pos;
        const int part_width;
        std::set<std::string> part_names;
        bool overlay_editing_enabled;
        timer<image_display> highlight_timer;
        unsigned long highlighted_rect;

        bool moving_overlay;
        unsigned long moving_rect;
        enum  {
            MOVING_RECT_LEFT,
            MOVING_RECT_TOP,
            MOVING_RECT_RIGHT,
            MOVING_RECT_BOTTOM,
            MOVING_PART
        } moving_what;
        std::string moving_part_name;

        // restricted functions
        image_display(image_display&);        // copy constructor
        image_display& operator=(image_display&);    // assignment operator
    };

// ----------------------------------------------------------------------------------------

    class perspective_display : public drawable, noncopyable
    {
    public:

        perspective_display(  
            drawable_window& w
        );

        ~perspective_display(
        );

        virtual void set_size (
            unsigned long width,
            unsigned long height 
        );

        struct overlay_line
        {
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
            overlay_dot() { assign_pixel(color, 0);}

            overlay_dot(const vector<double>& p_) 
                : p(p_) { assign_pixel(color, 255); }

            template <typename pixel_type>
            overlay_dot(const vector<double>& p_, pixel_type color_) 
                : p(p_) { assign_pixel(color, color_); }

            vector<double> p;
            rgb_pixel color;
        };


        void add_overlay (
            const std::vector<overlay_line>& overlay
        );

        void add_overlay (
            const std::vector<overlay_dot>& overlay
        );

        void clear_overlay (
        );

        template <
            typename T
            >
        void set_dot_double_clicked_handler (
            T& object,
            void (T::*event_handler_)(const vector<double>&)
        )
        {
            auto_mutex M(m);
            dot_clicked_event_handler = make_mfp(object,event_handler_);
        }

        void set_dot_double_clicked_handler (
            const any_function<void(const vector<double>&)>& event_handler_
        );

    private:

        void draw (
            const canvas& c
        ) const;

        void on_wheel_up (
            unsigned long state
        );

        void on_wheel_down (
            unsigned long state
        );

        void on_mouse_down (
            unsigned long btn,
            unsigned long state,
            long x,
            long y,
            bool is_double_click
        );

        void on_mouse_move (
            unsigned long state,
            long x,
            long y
        );

        static bool compare_second (
            const std::pair<overlay_dot,float>& a,
            const std::pair<overlay_dot,float>& b
        ) { return a.second < b.second; }


        point last;
        std::vector<overlay_line> overlay_lines;
        std::vector<overlay_dot> overlay_dots;

        camera_transform tform;
        vector<double> sum_pts;
        vector<double> max_pts;
        any_function<void(const vector<double>&)> dot_clicked_event_handler;
        mutable array2d<float> depth;
    };

// ----------------------------------------------------------------------------------------

    class perspective_window : public drawable_window, noncopyable
    {
    public:

        typedef perspective_display::overlay_line overlay_line;
        typedef perspective_display::overlay_dot overlay_dot;

        perspective_window(
        ) : disp(*this) 
        {
            set_size(100,100);
            on_window_resized();
            show();
        }

        perspective_window(
            const std::vector<dlib::vector<double> >& point_cloud
        ) : 
            disp(*this)
        {  
            set_size(100,100);
            on_window_resized();
            add_overlay(point_cloud); 
            show(); 
        }
        
        perspective_window(
            const std::vector<dlib::vector<double> >& point_cloud,
            const std::string& title
        ) : 
            disp(*this)
        {  
            set_size(100,100);
            on_window_resized();
            add_overlay(point_cloud); 
            set_title(title);
            show(); 
        }
        
        ~perspective_window(
        )
        {
            // You should always call close_window() in the destructor of window
            // objects to ensure that no events will be sent to this window while 
            // it is being destructed.  
            close_window();
        }

        void add_overlay (
            const std::vector<overlay_line>& overlay
        )
        {
            disp.add_overlay(overlay);
        }

        void add_overlay (
            const std::vector<overlay_dot>& overlay
        )
        {
            disp.add_overlay(overlay);
        }

        void clear_overlay (
        )
        {
            disp.clear_overlay();
        }

        template <typename pixel_type>
        void add_overlay(const vector<double>& p1, const vector<double>& p2, pixel_type p)
        {
            add_overlay(std::vector<overlay_line>(1,overlay_line(p1,p2,p)));
        }

        void add_overlay(const std::vector<dlib::vector<double> >& d) 
        { 
            add_overlay(d, 255);
        }

        template <typename pixel_type>
        void add_overlay(const std::vector<dlib::vector<double> >& d, pixel_type p) 
        { 
            std::vector<overlay_dot> temp;
            temp.resize(d.size());
            for (unsigned long i = 0; i < temp.size(); ++i)
                temp[i] = overlay_dot(d[i], p);

            add_overlay(temp);
        }

        template <
            typename T
            >
        void set_dot_double_clicked_handler (
            T& object,
            void (T::*event_handler_)(const vector<double>&)
        )
        {
            disp.set_dot_double_clicked_handler(object,event_handler_);
        }

        void set_dot_double_clicked_handler (
            const any_function<void(const vector<double>&)>& event_handler_
        )
        {
            disp.set_dot_double_clicked_handler(event_handler_);
        }

    private:

        void on_window_resized(
        )
        {
            drawable_window::on_window_resized();
            unsigned long width, height;
            get_size(width,height);
            disp.set_pos(0,0);
            disp.set_size(width, height);
        }
        
        perspective_display disp;
    };

// ----------------------------------------------------------------------------------------

    class image_window : public drawable_window 
    {
    public:

        typedef image_display::overlay_rect overlay_rect;
        typedef image_display::overlay_line overlay_line;
        typedef image_display::overlay_circle overlay_circle;

        image_window(
        ); 

        template < typename image_type >
        image_window(
            const image_type& img
        ) : 
            gui_img(*this), 
            window_has_closed(false),
            have_last_click(false),
            mouse_btn(0),
            clicked_signaler(this->wm),
            have_last_keypress(false),
            tie_input_events(false)
        {  
            gui_img.set_image_clicked_handler(*this, &image_window::on_image_clicked);
            gui_img.disable_overlay_editing();
            set_image(img); 
            show(); 
        }
        
        template < typename image_type >
        image_window(
            const image_type& img,
            const std::string& title
        ) : 
            gui_img(*this), 
            window_has_closed(false),
            have_last_click(false),
            mouse_btn(0),
            clicked_signaler(this->wm),
            have_last_keypress(false),
            tie_input_events(false)
        {  
            gui_img.set_image_clicked_handler(*this, &image_window::on_image_clicked);
            gui_img.disable_overlay_editing();
            set_image(img); 
            set_title(title);
            show(); 
        }
        

        ~image_window(
        );

        template < typename image_type >
        void set_image (
            const image_type& img
        ) 
        { 
            const unsigned long padding = scrollable_region_style_default().get_border_size();
            auto_mutex M(wm);
            gui_img.set_image(img); 

            // Only ever mess with the size of the window if the user is giving us an image
            // that is a different size.  Otherwise we assume that they will have already
            // sized the window to whatever they feel is reasonable for an image of the
            // current size.  
            if (previous_image_size != get_rect(img))
            {
                const rectangle r = gui_img.get_image_display_rect();
                if (image_rect != r)
                {
                    // set the size of this window to match the size of the input image
                    set_size(r.width()+padding*2,r.height()+padding*2);

                    // call this to make sure everything else is setup properly
                    on_window_resized();

                    image_rect = r;
                }
                previous_image_size = get_rect(img);
            }
        }

        void add_overlay (
            const overlay_rect& overlay
        );

        template <typename pixel_type>
        void add_overlay(const rectangle& r, pixel_type p) 
        { add_overlay(image_display::overlay_rect(r,p)); }

        void add_overlay(const rectangle& r) 
        { add_overlay(image_display::overlay_rect(r,rgb_pixel(255,0,0))); }

        template <typename pixel_type>
        void add_overlay(const rectangle& r, pixel_type p, const std::string& l) 
        { add_overlay(image_display::overlay_rect(r,p,l)); }

        template <typename pixel_type>
        void add_overlay(const std::vector<rectangle>& r, pixel_type p) 
        { 
            std::vector<overlay_rect> temp;
            temp.resize(r.size());
            for (unsigned long i = 0; i < temp.size(); ++i)
                temp[i] = overlay_rect(r[i], p);

            add_overlay(temp);
        }

        void add_overlay(const std::vector<rectangle>& r) 
        { add_overlay(r, rgb_pixel(255,0,0)); }

        void add_overlay(
            const full_object_detection& object,
            const std::vector<std::string>& part_names
        ) 
        { 

            add_overlay(overlay_rect(object.get_rect(), rgb_pixel(255,0,0)));

            std::vector<overlay_circle> temp;
            temp.reserve(object.num_parts());
            for (unsigned long i = 0; i < object.num_parts(); ++i)
            {
                if (object.part(i) != OBJECT_PART_NOT_PRESENT)
                {
                    if (i < part_names.size())
                        temp.push_back(overlay_circle(object.part(i), 7, rgb_pixel(0,255,0), part_names[i]));
                    else
                        temp.push_back(overlay_circle(object.part(i), 7, rgb_pixel(0,255,0)));
                }
            }

            add_overlay(temp);
        }

        void add_overlay(
            const full_object_detection& object
        ) 
        { 
            std::vector<std::string> part_names;
            add_overlay(object, part_names);
        }

        void add_overlay(
            const std::vector<full_object_detection>& objects,
            const std::vector<std::string>& part_names
        ) 
        { 
            std::vector<overlay_rect> rtemp;
            rtemp.reserve(objects.size());
            for (unsigned long i = 0; i < objects.size(); ++i)
            {
                rtemp.push_back(overlay_rect(objects[i].get_rect(), rgb_pixel(255,0,0)));
            }

            add_overlay(rtemp);

            std::vector<overlay_circle> temp;

            for (unsigned long i = 0; i < objects.size(); ++i)
            {
                for (unsigned long j = 0; j < objects[i].num_parts(); ++j)
                {
                    if (objects[i].part(j) != OBJECT_PART_NOT_PRESENT)
                    {
                        if (j < part_names.size())
                            temp.push_back(overlay_circle(objects[i].part(j), 7, rgb_pixel(0,255,0),part_names[j]));
                        else
                            temp.push_back(overlay_circle(objects[i].part(j), 7, rgb_pixel(0,255,0)));
                    }
                }
            }

            add_overlay(temp);
        }

        void add_overlay(
            const std::vector<full_object_detection>& objects
        ) 
        { 
            std::vector<std::string> part_names;
            add_overlay(objects, part_names);
        }

        void add_overlay (
            const overlay_line& overlay
        );

        void add_overlay (
            const overlay_circle& overlay
        );

        template <typename pixel_type>
        void add_overlay(const point& p1, const point& p2, pixel_type p) 
        { add_overlay(image_display::overlay_line(p1,p2,p)); }

        void add_overlay (
            const std::vector<overlay_rect>& overlay
        );

        void add_overlay (
            const std::vector<overlay_line>& overlay
        );

        void add_overlay (
            const std::vector<overlay_circle>& overlay
        );

        void clear_overlay (
        );

        bool get_next_double_click (
            point& p,
            unsigned long& mouse_button
        ); 

        void tie_events (
        );

        void untie_events (
        );

        bool events_tied (
        ) const;

        bool get_next_double_click (
            point& p
        ) 
        {
            unsigned long mouse_button;
            return get_next_double_click(p, mouse_button);
        }

        bool get_next_keypress (
            unsigned long& key,
            bool& is_printable,
            unsigned long& state
        );

        bool get_next_keypress (
            unsigned long& key,
            bool& is_printable
        )
        {
            unsigned long state;
            return get_next_keypress(key,is_printable,state);
        }

    private:

        virtual base_window::on_close_return_code on_window_close(
        );

        void on_window_resized(
        );
        
        void on_image_clicked (
            const point& p,
            bool is_double_click,
            unsigned long btn
        );

        virtual void on_keydown (
            unsigned long key,
            bool is_printable,
            unsigned long state
        );

        // restricted functions
        image_window(image_window&);
        image_window& operator= (image_window&);

        image_display gui_img;
        rectangle image_rect;
        rectangle previous_image_size;
        bool window_has_closed;
        bool have_last_click;
        point last_clicked_point;
        unsigned long mouse_btn;
        rsignaler clicked_signaler;

        bool have_last_keypress;
        unsigned long next_key;
        bool next_is_printable;
        unsigned long next_state;
        bool tie_input_events;
    };

// ----------------------------------------------------------------------------------------

}

#ifdef NO_MAKEFILE
#include "widgets.cpp"
#endif

#endif // DLIB_WIDGETs_

