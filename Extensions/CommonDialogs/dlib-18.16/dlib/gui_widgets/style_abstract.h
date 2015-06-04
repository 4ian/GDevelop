// Copyright (C) 2008  Davis E. King (davis@dlib.net), and Nils Labugt
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_WIDGETs_STYLE_ABSTRACT_
#ifdef DLIB_WIDGETs_STYLE_ABSTRACT_

#include "../algs.h"
#include "../gui_core.h"
#include "widgets_abstract.h"
#include "../unicode/unicode_abstract.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // button styles  
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    class button_style
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This is an abstract class that defines the interface a
                button style object must implement.

                Note that derived classes must be copyable via
                their copy constructors.
        !*/

    public:

        virtual ~button_style() {}

        virtual bool redraw_on_mouse_over (
        ) const { return false; }
        /*!
            ensures
                - if (this style draws buttons differently when a mouse is over them) then
                    - returns true
                - else
                    - returns false
        !*/

        virtual rectangle get_invalidation_rect (
            const rectangle& rect
        ) const { return rect; }
        /*!
            requires
                - the mutex drawable::m is locked
                - rect == the get_rect() that defines where the button is
            ensures
                - returns a rectangle that should be invalidated whenever a button
                  needs to redraw itself.  (e.g. If you wanted your button style to
                  draw outside the button then you could return a larger rectangle)
        !*/

        virtual rectangle get_min_size (
            const ustring& name,
            const font& mfont 
        ) const = 0;
        /*!
            requires
                - the mutex drawable::m is locked
            ensures
                - returns a rectangle that represents the minimum size of the button
                  given the name and font.
        !*/

        virtual void draw_button (
            const canvas& c,
            const rectangle& rect,
            const bool enabled,
            const font& mfont,
            const long lastx,
            const long lasty,
            const ustring& name,
            const bool is_depressed
        ) const = 0;
        /*!
            requires
                - the mutex drawable::m is locked
                - c == the canvas to draw on
                - rect, enabled, mfont, lastx, and lasty are the variables
                  defined in the protected section of the drawable class.
                - name == the name of the button to be drawn
                - is_depressed == true if the button is to be drawn in a depressed state
            ensures
                - draws the button on the canvas c at the location given by rect.  
        !*/
    };

// ----------------------------------------------------------------------------------------

    class button_style_default : public button_style
    {
        /*!
            This is the default style for button objects.  It will cause
            a button to appear as the simple MS Windows 2000 button style.
        !*/
    };

// ----------------------------------------------------------------------------------------

    class button_style_toolbar1 : public button_style
    {
        /*!
            This draws a simple toolbar style button that displays its name in the
            middle of itself.  When the mouse moves over it it will light up.
        !*/
    };

// ----------------------------------------------------------------------------------------

    class button_style_toolbar_icon1 : public button_style
    {
        /*!
            This draws a simple toolbar style button that displays an image in the 
            middle of itself.  When the mouse moves over it it will light up.
        !*/
        template <typename image_type>
        button_style_toolbar_icon1 (
            const image_type& img, 
            unsigned long border_size = 6
        );
        /*!
            requires
                - image_type == an implementation of array2d/array2d_kernel_abstract.h
                - pixel_traits<typename image_type::type> is defined
            ensures
                - displays image img in the middle of the button
                - the distance between the edge of the button and the image
                  will be border_size pixels
        !*/
    };

// ----------------------------------------------------------------------------------------

    class button_style_arrow : public button_style
    {
    public:
        /*!
            This draws a simple button with an arrow in it 
        !*/

        enum arrow_direction 
        {
            UP,
            DOWN,
            LEFT,
            RIGHT
        };

        button_style_arrow (
            arrow_direction dir
        );
        /*!
            ensures
                - the arrow in the button will point in the given direction
        !*/
    };

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // toggle button styles  
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    class toggle_button_style
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This is an abstract class that defines the interface a
                toggle button style object must implement.

                Note that derived classes must be copyable via
                their copy constructors.
        !*/

    public:

        virtual ~toggle_button_style() {}

        virtual bool redraw_on_mouse_over (
        ) const { return false; }
        /*!
            ensures
                - if (this style draws buttons differently when a mouse is over them) then
                    - returns true
                - else
                    - returns false
        !*/

        virtual rectangle get_min_size (
            const ustring& name,
            const font& mfont 
        ) const = 0;
        /*!
            requires
                - the mutex drawable::m is locked
            ensures
                - returns a rectangle that represents the minimum size of the button
                  given the name and font.
        !*/

        virtual void draw_toggle_button (
            const canvas& c,
            const rectangle& rect,
            const bool enabled,
            const font& mfont,
            const long lastx,
            const long lasty,
            const ustring& name,
            const bool is_depressed,
            const bool is_checked 
        ) const = 0;
        /*!
            requires
                - the mutex drawable::m is locked
                - c == the canvas to draw on
                - rect, enabled, mfont, lastx, and lasty are the variables
                  defined in the protected section of the drawable class.
                - name == the name of the button to be drawn
                - is_depressed == true if the button is to be drawn in a depressed state
                - is_checked == true if the toggle_button is in the checked state 
            ensures
                - draws the button on the canvas c at the location given by rect.  
        !*/
    };

// ----------------------------------------------------------------------------------------

    class toggle_button_style_default : public toggle_button_style
    {
        /*!
            This is the default style for toggle_button objects.  It will cause
            a button to appear as the simple MS Windows 2000 button style.
        !*/
    };

// ----------------------------------------------------------------------------------------

    class toggle_button_style_check_box : public toggle_button_style
    {
        /*!
            This draws a simple check box style toggle button that displays its 
            name to the right of a check box. 
        !*/
    };

// ----------------------------------------------------------------------------------------

    class toggle_button_style_radio_button : public toggle_button_style
    {
        /*!
            This draws a simple radio button style toggle button that displays its 
            name to the right of a circular radio button. 
        !*/
    };

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // scroll_bar styles  
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    class scroll_bar_style
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This is an abstract class that defines the interface a
                scroll_bar style object must implement.

                Note that derived classes must be copyable via
                their copy constructors.

                There are three parts of a scroll bar, the slider, the background,
                and the two buttons on its ends.  The "slider" is the thing that you
                drag around on the scroll bar and the "background" is the part
                in between the slider and the buttons on the ends.
        !*/

    public:

        virtual ~scroll_bar_style() {}

        virtual bool redraw_on_mouse_over_slider (
        ) const { return false; }
        /*!
            ensures
                - if (this style draws a scroll_bar's slider differently when a mouse is over it
                  or it is being dragged) then
                    - returns true
                - else
                    - returns false
        !*/

        virtual long get_width (
        ) const = 0;
        /*!
            requires
                - the mutex drawable::m is locked
            ensures
                - returns the width in pixels of the scroll bar
        !*/

        virtual long get_slider_length (
            long total_length,
            long max_pos
        ) const = 0;
        /*!
            requires
                - the mutex drawable::m is locked
                - total_length == the total length in pixels of the scroll bar
                - max_pos == the value of scroll_bar::max_slider_pos() for this
                  scroll bar
            ensures
                - returns the length in pixels of the scroll bar's slider
        !*/

        virtual long get_button_length (
            long total_length,
            long max_pos
        ) const = 0;
        /*!
            requires
                - the mutex drawable::m is locked
                - total_length == the total length in pixels of the scroll bar
                - max_pos == the value of scroll_bar::max_slider_pos() for this
                  scroll bar
            ensures
                - returns the length in pixels of each of the scroll bar's
                  buttons
        !*/

        virtual void draw_scroll_bar_background (
            const canvas& c,
            const rectangle& rect,
            const bool enabled,
            const long lastx,
            const long lasty,
            const bool is_depressed
        ) const = 0;
        /*!
            requires
                - the mutex drawable::m is locked
                - c == the canvas to draw on
                - rect, enabled, lastx, and lasty are the variables
                  defined in the protected section of the drawable class.
                - is_depressed == true if the background area of the scroll_bar is to 
                  be drawn in a depressed state (because the user is clicking on it)
            ensures
                - draws the background part of the scroll_bar on the canvas c at the 
                  location given by rect.  
        !*/

        virtual void draw_scroll_bar_slider (
            const canvas& c,
            const rectangle& rect,
            const bool enabled,
            const long lastx,
            const long lasty,
            const bool is_being_dragged
        ) const = 0;
        /*!
            requires
                - the mutex drawable::m is locked
                - c == the canvas to draw on
                - rect, enabled, lastx, and lasty are the variables
                  defined in the protected section of the drawable class
                - is_being_dragged == true if the user is dragging the slider
            ensures
                - draws the slider part of the scroll_bar on the canvas c at the 
                  location given by rect.  
        !*/

        button_style_type get_up_button_style (
        ) const;
        /*!
            ensures
                - returns the type of button_style to use for a button on the
                  top side of a vertical scroll bar.
        !*/

        button_style_type get_down_button_style (
        ) const;
        /*!
            ensures
                - returns the type of button_style to use for a button on the
                  bottom side of a vertical scroll bar.
        !*/

        button_style_type get_left_button_style (
        ) const;
        /*!
            ensures
                - returns the type of button_style to use for a button on the
                  left side of a horizontal scroll bar.
        !*/

        button_style_type get_right_button_style (
        ) const;
        /*!
            ensures
                - returns the type of button_style to use for a button on the
                  right side of a horizontal scroll bar.
        !*/
    };

// ----------------------------------------------------------------------------------------

    class scroll_bar_style_default : public scroll_bar_style
    {
        /*!
            This is the default style for scroll_bar objects.  It will cause
            a scroll_bar to appear as the simple MS Windows 2000 scroll_bar style.
        !*/
    };

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // scrollable_region (and zoomable_region) styles  
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    class scrollable_region_style
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This is an abstract class that defines the interface a
                scrollable_region and zoomable_region style object must implement.

                Note that derived classes must be copyable via
                their copy constructors.
        !*/
    public:

        virtual ~scrollable_region_style() {}

        virtual long get_border_size (
        ) const = 0;
        /*!
            requires
                - the mutex drawable::m is locked
            ensures
                - returns the size of the border region in pixels 
        !*/

        virtual void draw_scrollable_region_border (
            const canvas& c,
            const rectangle& rect,
            const bool enabled
        ) const = 0;
        /*!
            requires
                - the mutex drawable::m is locked
                - c == the canvas to draw on
                - rect and enabled are the variables defined in the protected section 
                  of the drawable class.
            ensures
                - draws the border part of a scrollable_region on the canvas c at the 
                  location given by rect.  
        !*/

        scroll_bar_style_type get_horizontal_scroll_bar_style (
        ) const;
        /*!
            ensures
                - returns the style of scroll_bar to use for the 
                  horizontal scroll_bar in this widget.
        !*/

        scroll_bar_style_type get_vertical_scroll_bar_style (
        ) const;
        /*!
            ensures
                - returns the style of scroll_bar to use for the 
                  vertical scroll_bar in this widget.
        !*/
    };

// ----------------------------------------------------------------------------------------

    class scrollable_region_style_default : public scrollable_region_style
    {
    public:
        /*!
            This is the default style for scrollable_region and zoomable_region objects.  
        !*/
    };

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // text_box styles  
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    class text_box_style
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This is an abstract class that defines the interface a
                text_box style object must implement.

                Note that derived classes must be copyable via
                their copy constructors.
        !*/
    public:

        virtual ~text_field_style() {}

        scrollable_region_style_type get_scrollable_region_style (
        ) const;
        /*!
            ensures
                - returns the style of scrollable_region to use for the 
                  text_box.
        !*/

        virtual unsigned long get_padding (
            const font& mfont 
        ) const = 0;
        /*!
            requires
                - the mutex drawable::m is locked
            ensures
                - returns the number of pixels that separate the text in the text_box 
                  from the edge of the text_box widget itself.
        !*/

        virtual void draw_text_box (
            const canvas& c,
            const rectangle& display_rect,
            const rectangle& text_rect,
            const bool enabled,
            const font& mfont,
            const ustring& text,
            const rectangle& cursor_rect,
            const rgb_pixel& text_color,
            const rgb_pixel& bg_color,
            const bool has_focus,
            const bool cursor_visible,
            const long highlight_start,
            const long highlight_end
        ) const = 0;
        /*!
            requires
                - the mutex drawable::m is locked
                - c == the canvas to draw on
                - enabled and mfont are the variables defined in the protected section 
                - text_rect == the rectangle in which we should draw the given text
                  of the drawable class.
                - display_rect == the rectangle returned by scrollable_region::display_rect()
                - text == the current text in the text_box 
                - cursor_rect == A rectangle of width 1 that represents the current
                  position of the cursor on the screen.
                - text_color == the color of the text to be drawn
                - bg_color == the background color of the text field
                - has_focus == true if this text field has keyboard input focus
                - cursor_visible == true if the cursor should be drawn 
                - if (highlight_start <= highlight_end) then
                    - text[highlight_start] though text[highlight_end] should be
                      highlighted
            ensures
                - draws the text_box on the canvas c at the location given by text_rect.
                  (Note that the scroll bars and borders are drawn by the scrollable_region
                  and therefore the style returned by get_scrollable_region_style() 
                  controls how those appear)
                - doesn't draw anything outside display_rect
        !*/
    };

// ----------------------------------------------------------------------------------------

    class text_box_style_default : public text_box_style
    {
    public:
        /*!
            This is the default style for text_box objects.  
        !*/
    };

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // list_box styles  
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    class list_box_style
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This is an abstract class that defines the interface a
                list_box style object must implement.

                Note that derived classes must be copyable via
                their copy constructors.
        !*/
    public:

        virtual ~list_box_style() {}

        virtual void draw_list_box_background (
            const canvas& c,
            const rectangle& display_rect,
            const bool enabled
        ) const = 0;
        /*!
            requires
                - the mutex drawable::m is locked
                - c == the canvas to draw on
                - display_rect == the display_rect for the list_box.  This is the area
                  in which list box items are drawn (see display_rect in the scrollable_region
                  widget for more info)
                - enabled == true if the list box is enabled
            ensures
                - draws the background of a list box on the canvas c at the location given 
                  by display_rect.  
        !*/

        scrollable_region_style_type get_scrollable_region_style (
        ) const;
        /*!
            ensures
                - returns the style of scrollable_region to use for the 
                  list_box.
        !*/

        virtual void draw_list_box_item (
            const canvas& c,
            const rectangle& rect,
            const rectangle& display_rect,
            const bool enabled,
            const font& mfont,
            const std::string& text,
            const bool is_selected
        ) const = 0;
        /*!
            requires
                - the mutex drawable::m is locked
                - c == the canvas to draw on
                - rect == the rectangle that defines where on the screen this list box item is.
                - display_rect == the display_rect for the list_box.  This is the area
                  in which list box items are drawn (see display_rect in the scrollable_region
                  widget for more info)
                - mfont == the font to use to draw the list box item
                - text == the text of the list box item to be drawn
                - enabled == true if the list box is enabled
                - is_selected == true if the item is to be drawn in a selected state
            ensures
                - draws the list box item on the canvas c at the location given by rect.  
        !*/

        // wide character overloads
        virtual void draw_list_box_item (
            const canvas& c,
            const rectangle& rect,
            const rectangle& display_rect,
            const bool enabled,
            const font& mfont,
            const std::wstring& text,
            const bool is_selected
        ) const = 0;

        virtual void draw_list_box_item (
            const canvas& c,
            const rectangle& rect,
            const rectangle& display_rect,
            const bool enabled,
            const font& mfont,
            const ustring& text,
            const bool is_selected
        ) const = 0;

    };

// ----------------------------------------------------------------------------------------

    class list_box_style_default : public list_box_style
    {
    public:
        /*!
            This is the default style for list_box objects.  
        !*/
    };

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // text_field styles  
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    class text_field_style
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This is an abstract class that defines the interface a
                text_field style object must implement.

                Note that derived classes must be copyable via
                their copy constructors.
        !*/
    public:

        virtual ~text_field_style() {}

        virtual unsigned long get_padding (
            const font& mfont 
        ) const = 0;
        /*!
            requires
                - the mutex drawable::m is locked
            ensures
                - returns the number of pixels that separate the text in the text_field
                  from the edge of the text_field widget itself.
        !*/

        virtual void draw_text_field (
            const canvas& c,
            const rectangle& rect,
            const rectangle& text_rect,
            const bool enabled,
            const font& mfont,
            const ustring& text,
            const unsigned long cursor_x,
            const unsigned long text_pos,
            const rgb_pixel& text_color,
            const rgb_pixel& bg_color,
            const bool has_focus,
            const bool cursor_visible,
            const long highlight_start,
            const long highlight_end
        ) const = 0;
        /*!
            requires
                - the mutex drawable::m is locked
                - c == the canvas to draw on
                - rect, enabled, and mfont are the variables defined in the protected section 
                  of the drawable class.
                - text == the current text in the text_field 
                - text_rect == the rectangle in which we should draw the given text
                - cursor_x == the x coordinate of the cursor relative to the left side 
                  of rect.  i.e. the number of pixels that separate the cursor from the
                  left side of the text_field.
                - text_pos == the index of the first letter in text that appears in 
                  this text field.
                - text_color == the color of the text to be drawn
                - bg_color == the background color of the text field
                - has_focus == true if this text field has keyboard input focus
                - cursor_visible == true if the cursor should be drawn 
                - if (highlight_start <= highlight_end) then
                    - text[highlight_start] though text[highlight_end] should be
                      highlighted
            ensures
                - draws the text_field on the canvas c at the location given by rect.  
        !*/

    };

// ----------------------------------------------------------------------------------------

    class text_field_style_default : public text_field_style
    {
    public:
        /*!
            This is the default style for text_field objects.  
        !*/
    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_WIDGETs_STYLE_ABSTRACT_



