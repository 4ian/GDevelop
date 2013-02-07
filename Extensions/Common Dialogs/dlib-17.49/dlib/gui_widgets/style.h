// Copyright (C) 2008  Davis E. King (davis@dlib.net), and Nils Labugt
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_WIDGETs_STYLE_
#define DLIB_WIDGETs_STYLE_

#include "../algs.h"
#include "style_abstract.h"
#include "../gui_core.h"
#include "canvas_drawing.h"
#include <string>
#include <sstream>
#include "../unicode.h"
#include "../array2d.h"
#include "../pixel.h"
#include "fonts.h"


namespace dlib
{

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // button styles  
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    class button_style
    {
    public:

        button_style()
        {
        }

        virtual ~button_style() 
        {}

        virtual bool redraw_on_mouse_over (
        ) const { return false; }

        virtual rectangle get_invalidation_rect (
            const rectangle& rect
        ) const { return rect; }

        virtual rectangle get_min_size (
            const ustring& name,
            const font& mfont 
        ) const = 0;

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
    };

// ----------------------------------------------------------------------------------------

    class button_style_default : public button_style
    {
    public:
        button_style_default () : padding(4), name_width(0) {}

        virtual void draw_button (
            const canvas& c,
            const rectangle& rect,
            const bool enabled,
            const font& mfont,
            const long lastx,
            const long lasty,
            const ustring& name,
            const bool is_depressed
        ) const;

        virtual rectangle get_min_size (
            const ustring& name,
            const font& mfont 
        ) const;

    private:

        // this is the minimum amount of padding that can separate the name from the
        // edge of the button
        const unsigned long padding;
        // this is the width of the name string
        mutable unsigned long name_width;

    };

// ----------------------------------------------------------------------------------------

    class button_style_toolbar1 : public button_style
    {
    public:
        button_style_toolbar1 () : padding(4), name_width(0) {}

        virtual void draw_button (
            const canvas& c,
            const rectangle& rect,
            const bool enabled,
            const font& mfont,
            const long lastx,
            const long lasty,
            const ustring& name,
            const bool is_depressed
        ) const;

        virtual rectangle get_invalidation_rect (
            const rectangle& rect
        ) const 
        { 
            rectangle temp(rect);
            temp.left() -= 2;
            temp.top() -= 2;
            temp.right() += 2;
            temp.bottom() += 2;
            return temp; 
        }

        virtual bool redraw_on_mouse_over (
        ) const { return true; }

        virtual rectangle get_min_size (
            const ustring& name,
            const font& mfont 
        ) const;

    private:

        // this is the minimum amount of padding that can separate the name from the
        // edge of the button
        const unsigned long padding;
        // this is the width of the name string
        mutable unsigned long name_width;

    };

// ----------------------------------------------------------------------------------------

    class button_style_toolbar_icon1 : public button_style
    {
    public:
        template <typename image_type>
        button_style_toolbar_icon1 (const image_type& img_, unsigned long pad = 6) : padding(pad) 
        { 
            assign_image(img_mouseover,img_); 
            make_images();  
        }

        button_style_toolbar_icon1( const button_style_toolbar_icon1& item): button_style(item), padding(item.padding) 
        {
            assign_image(img_mouseover, item.img_mouseover);
            assign_image(img_normal, item.img_normal);
            assign_image(img_disabled, item.img_disabled);
        }

        virtual void draw_button (
            const canvas& c,
            const rectangle& rect,
            const bool enabled,
            const font& mfont,
            const long lastx,
            const long lasty,
            const ustring& name,
            const bool is_depressed
        ) const;

        virtual bool redraw_on_mouse_over (
        ) const { return true; }

        virtual rectangle get_min_size (
            const ustring& name,
            const font& mfont 
        ) const;

    private:

        void make_images (
        )
        {
            // make the disabled image grayscale and make both non-mouseover images have weaker alpha channels
            img_disabled.set_size(img_mouseover.nr(), img_mouseover.nc());
            img_normal.set_size(img_mouseover.nr(), img_mouseover.nc());

            for (long r = 0; r < img_mouseover.nr(); ++r)
            {
                for (long c = 0; c < img_mouseover.nc(); ++c)
                {
                    rgb_alpha_pixel p = img_mouseover[r][c];
                    long avg = p.red;
                    avg += p.green;
                    avg += p.blue;
                    avg /= 3;

                    if (p.alpha > 40)
                        p.alpha -= 40;
                    else
                        p.alpha = 0;

                    img_normal[r][c] = p;

                    if (p.alpha > 80)
                        p.alpha -= 80;
                    else
                        p.alpha = 0;

                    p.red = avg;
                    p.green = avg;
                    p.blue = avg;
                    img_disabled[r][c] = p;
                }
            }
        }

        array2d<rgb_alpha_pixel> img_mouseover;
        array2d<rgb_alpha_pixel> img_normal;
        array2d<rgb_alpha_pixel> img_disabled;

        // this is the minimum amount of padding that can separate the name from the
        // edge of the button
        const unsigned long padding;

    };

// ----------------------------------------------------------------------------------------

    class button_style_arrow : public button_style
    {

    public:

        enum arrow_direction 
        {
            UP,
            DOWN,
            LEFT,
            RIGHT
        };

        button_style_arrow (
            arrow_direction dir_
        ) : dir(dir_) {}

        virtual void draw_button (
            const canvas& c,
            const rectangle& rect,
            const bool enabled,
            const font& mfont,
            const long lastx,
            const long lasty,
            const ustring& name,
            const bool is_depressed
        ) const;

        virtual rectangle get_min_size (
            const ustring& ,
            const font&  
        ) const { return rectangle(); }

    private:
        arrow_direction dir;
    };

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // toggle button styles  
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    class toggle_button_style
    {
    public:

        toggle_button_style()
        {
        }

        virtual ~toggle_button_style() 
        {}

        virtual bool redraw_on_mouse_over (
        ) const { return false; }

        virtual rectangle get_min_size (
            const ustring& name,
            const font& mfont 
        ) const = 0;

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
    };

// ----------------------------------------------------------------------------------------

    class toggle_button_style_default : public toggle_button_style
    {
    public:
        toggle_button_style_default () : padding(4), name_width(0) {}

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
        ) const;

        virtual rectangle get_min_size (
            const ustring& name,
            const font& mfont 
        ) const;

    private:

        // this is the minimum amount of padding that can separate the name from the
        // edge of the button
        const unsigned long padding;
        // this is the width of the name string
        mutable unsigned long name_width;

    };

// ----------------------------------------------------------------------------------------

    class toggle_button_style_check_box : public toggle_button_style
    {
    public:
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
        ) const;

        virtual rectangle get_min_size (
            const ustring& name,
            const font& mfont 
        ) const;

    };

// ----------------------------------------------------------------------------------------

    class toggle_button_style_radio_button : public toggle_button_style
    {
    public:
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
        ) const;

        virtual rectangle get_min_size (
            const ustring& name,
            const font& mfont 
        ) const;

    };

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // scroll_bar styles  
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    class scroll_bar_style
    {
    public:

        virtual ~scroll_bar_style() {}

        virtual bool redraw_on_mouse_over_slider (
        ) const { return false; }

        virtual long get_width (
        ) const = 0;

        virtual long get_slider_length (
            long total_length,
            long max_pos
        ) const = 0;

        virtual long get_button_length (
            long total_length,
            long max_pos
        ) const = 0;

        virtual void draw_scroll_bar_background (
            const canvas& c,
            const rectangle& rect,
            const bool enabled,
            const long lastx,
            const long lasty,
            const bool is_depressed
        ) const = 0;

        virtual void draw_scroll_bar_slider (
            const canvas& c,
            const rectangle& rect,
            const bool enabled,
            const long lastx,
            const long lasty,
            const bool is_being_dragged
        ) const = 0;

    };

// ----------------------------------------------------------------------------------------

    class scroll_bar_style_default : public scroll_bar_style
    {
    public:
        button_style_arrow get_up_button_style (
        ) const { return button_style_arrow(button_style_arrow::UP); }

        button_style_arrow get_down_button_style (
        ) const { return button_style_arrow(button_style_arrow::DOWN); }

        button_style_arrow get_left_button_style (
        ) const { return button_style_arrow(button_style_arrow::LEFT); }

        button_style_arrow get_right_button_style (
        ) const { return button_style_arrow(button_style_arrow::RIGHT); }

        virtual long get_width (
        ) const  { return 16; }

        virtual long get_slider_length (
            long total_length,
            long max_pos
        ) const;

        virtual long get_button_length (
            long total_length,
            long max_pos
        ) const;

        virtual void draw_scroll_bar_background (
            const canvas& c,
            const rectangle& rect,
            const bool enabled,
            const long lastx,
            const long lasty,
            const bool is_depressed
        ) const;

        virtual void draw_scroll_bar_slider (
            const canvas& c,
            const rectangle& rect,
            const bool enabled,
            const long lastx,
            const long lasty,
            const bool is_being_dragged
        ) const;
    };

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // scrollable_region styles  
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    class scrollable_region_style
    {
    public:

        virtual ~scrollable_region_style() {}

        virtual long get_border_size (
        ) const = 0;

        virtual void draw_scrollable_region_border (
            const canvas& c,
            const rectangle& rect,
            const bool enabled
        ) const = 0;

    };

// ----------------------------------------------------------------------------------------

    class scrollable_region_style_default : public scrollable_region_style
    {
    public:
        scroll_bar_style_default get_horizontal_scroll_bar_style (
        ) const { return scroll_bar_style_default(); }

        scroll_bar_style_default get_vertical_scroll_bar_style (
        ) const { return scroll_bar_style_default(); }

        virtual long get_border_size (
        ) const { return 2; }

        virtual void draw_scrollable_region_border (
            const canvas& c,
            const rectangle& rect,
            const bool 
        ) const  { draw_sunken_rectangle(c,rect); }

    };

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // list_box styles  
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    class list_box_style
    {
    public:

        virtual ~list_box_style() {}

        virtual void draw_list_box_background (
            const canvas& c,
            const rectangle& display_rect,
            const bool enabled
        ) const = 0;

        virtual void draw_list_box_item (
            const canvas& c,
            const rectangle& rect,
            const rectangle& display_rect,
            const bool enabled,
            const font& mfont,
            const std::string& text,
            const bool is_selected
        ) const = 0;

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
        scrollable_region_style_default get_scrollable_region_style (
        ) const { return scrollable_region_style_default(); }

        virtual void draw_list_box_item (
            const canvas& c,
            const rectangle& rect,
            const rectangle& display_rect,
            const bool enabled,
            const font& mfont,
            const std::string& text,
            const bool is_selected
        ) const { draw_list_box_item_template(c,rect,display_rect, enabled, mfont, text, is_selected); }

        virtual void draw_list_box_item (
            const canvas& c,
            const rectangle& rect,
            const rectangle& display_rect,
            const bool enabled,
            const font& mfont,
            const std::wstring& text,
            const bool is_selected
        ) const { draw_list_box_item_template(c,rect,display_rect, enabled, mfont, text, is_selected); }

        virtual void draw_list_box_item (
            const canvas& c,
            const rectangle& rect,
            const rectangle& display_rect,
            const bool enabled,
            const font& mfont,
            const ustring& text,
            const bool is_selected
        ) const { draw_list_box_item_template(c,rect,display_rect, enabled, mfont, text, is_selected); }

        template <typename string_type>
        void draw_list_box_item_template (
            const canvas& c,
            const rectangle& rect,
            const rectangle& display_rect,
            const bool enabled,
            const font& mfont,
            const string_type& text,
            const bool is_selected
        ) const
        {
            if (is_selected)
            {
                if (enabled)
                    fill_rect_with_vertical_gradient(c,rect,rgb_pixel(110,160,255),  rgb_pixel(100,130,250),display_rect);
                else
                    fill_rect_with_vertical_gradient(c,rect,rgb_pixel(140,190,255),  rgb_pixel(130,160,250),display_rect);
            }

            if (enabled)
                mfont.draw_string(c,rect,text,rgb_pixel(0,0,0),0,std::string::npos,display_rect);
            else
                mfont.draw_string(c,rect,text,rgb_pixel(128,128,128),0,std::string::npos,display_rect);
        }

        virtual void draw_list_box_background (
            const canvas& c,
            const rectangle& display_rect,
            const bool enabled
        ) const
        {
            if (enabled)
            {
                // first fill our area with white
                fill_rect(c, display_rect,rgb_pixel(255,255,255));
            }
            else
            {
                // first fill our area with gray 
                fill_rect(c, display_rect,rgb_pixel(212,208,200));
            }
        }

    };

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // text_box styles  
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    class text_box_style
    {
    public:

        text_box_style()
        {
        }

        virtual ~text_box_style() 
        {}

        virtual unsigned long get_padding (
            const font& mfont 
        ) const = 0;

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
    };

// ----------------------------------------------------------------------------------------

    class text_box_style_default : public text_box_style
    {
    public:

        text_box_style_default()
        {
        }

        scrollable_region_style_default get_scrollable_region_style (
        ) const { return scrollable_region_style_default(); }

        virtual ~text_box_style_default() 
        {}

        virtual unsigned long get_padding (
            const font&  
        ) const { return 1; }

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
        ) const;

    };

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // text_field styles  
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    class text_field_style
    {
    public:

        text_field_style()
        {
        }

        virtual ~text_field_style() 
        {}

        virtual unsigned long get_padding (
            const font& mfont 
        ) const = 0;

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
    };

// ----------------------------------------------------------------------------------------

    class text_field_style_default : public text_field_style
    {
    public:

        text_field_style_default()
        {
        }

        virtual ~text_field_style_default() 
        {}

        virtual unsigned long get_padding (
            const font& mfont 
        ) const;

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
        ) const;

    };

// ----------------------------------------------------------------------------------------

}

#ifdef NO_MAKEFILE
#include "style.cpp"
#endif

#endif // DLIB_WIDGETs_STYLE_


