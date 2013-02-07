// Copyright (C) 2008  Davis E. King (davis@dlib.net), and Nils Labugt
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_WIDGETs_STYLE_CPP_
#define DLIB_WIDGETs_STYLE_CPP_

#include "style.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // button style stuff 
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    void button_style_default::draw_button (
        const canvas& c,
        const rectangle& rect,
        const bool enabled,
        const font& mfont,
        const long ,
        const long ,
        const ustring& name,
        const bool is_depressed
    ) const
    {
        rectangle area = rect.intersect(c);
        if (area.is_empty())
            return;

        fill_rect(c,rect,rgb_pixel(212,208,200));

        unsigned char red, green, blue;
        if (enabled)
        {
            red = 0;
            green = 0;
            blue = 0;
        }
        else
        {
            red = 128;
            green = 128;
            blue = 128;
        }

        // compute the name length if it hasn't already been computed
        if (name_width == 0)
        {
            unsigned long height;
            mfont.compute_size(name,name_width,height);
        }

        // figure out where the name string should appear
        rectangle name_rect;
        const unsigned long width = name_width;
        const unsigned long height = mfont.height();
        name_rect.set_left((rect.right() + rect.left() - width)/2);
        name_rect.set_top((rect.bottom() + rect.top() - height)/2 + 1);
        name_rect.set_right(name_rect.left()+width-1);
        name_rect.set_bottom(name_rect.top()+height);


        if (is_depressed)
        {
            name_rect.set_left(name_rect.left()+1);
            name_rect.set_right(name_rect.right()+1);
            name_rect.set_top(name_rect.top()+1);
            name_rect.set_bottom(name_rect.bottom()+1);

            mfont.draw_string(c,name_rect,name,rgb_pixel(red,green,blue));

            draw_button_down(c,rect); 
        }
        else
        {
            mfont.draw_string(c,name_rect,name,rgb_pixel(red,green,blue));

            // now draw the edge of the button
            draw_button_up(c,rect);
        }
    }

// ----------------------------------------------------------------------------------------

    rectangle button_style_default::
    get_min_size (
        const ustring& name,
        const font& mfont 
    ) const 
    {

        unsigned long width; 
        unsigned long height;
        mfont.compute_size(name,width,height);
        name_width = width;

        return rectangle(width+2*padding, height+2*padding);
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    void button_style_toolbar1::draw_button (
        const canvas& c,
        const rectangle& rect,
        const bool enabled,
        const font& mfont,
        const long lastx,
        const long lasty,
        const ustring& name,
        const bool is_depressed
    ) const
    {
        rectangle area = rect.intersect(c);
        if (area.is_empty())
            return;

        const long radius = 4;

        unsigned char red, green, blue;
        if (enabled)
        {
            red = 0;
            green = 0;
            blue = 0;

            long d = 0;
            if (rect.contains(lastx,lasty))
                d = -70; 

            if (is_depressed)
                d = 20;

            if (d != 0)
            {
                rectangle temp(rect);
                temp.left()--; temp.top()--; temp.right()++; temp.bottom()++;
                draw_rounded_rectangle(c, temp, radius, rgb_alpha_pixel(255,255,0,120)); 
                temp.left()--; temp.top()--; temp.right()++; temp.bottom()++;
                draw_rounded_rectangle(c, temp, radius, rgb_alpha_pixel(255,255,0,40)); 
            }

            fill_gradient_rounded(c,rect,radius,rgb_alpha_pixel(255, 255, 255,120-d), 
                                  rgb_alpha_pixel(255, 255, 255,0));
            draw_rounded_rectangle(c,rect,radius, rgb_alpha_pixel(30,30,30,200));
        }
        else
        {
            red = 128;
            green = 128;
            blue = 128;
            draw_rounded_rectangle(c,rect,radius, rgb_alpha_pixel(red,green,blue,210));
        }


        // compute the name length if it hasn't already been computed
        if (name_width == 0)
        {
            unsigned long height;
            mfont.compute_size(name,name_width,height);
        }

        // figure out where the name string should appear
        rectangle name_rect;
        const unsigned long width = name_width;
        const unsigned long height = mfont.height();
        name_rect.set_left((rect.right() + rect.left() - width)/2);
        name_rect.set_top((rect.bottom() + rect.top() - height)/2 + 1);
        name_rect.set_right(name_rect.left()+width-1);
        name_rect.set_bottom(name_rect.top()+height);


        if (is_depressed)
        {
            name_rect.set_left(name_rect.left()+1);
            name_rect.set_right(name_rect.right()+1);
            name_rect.set_top(name_rect.top()+1);
            name_rect.set_bottom(name_rect.bottom()+1);

            mfont.draw_string(c,name_rect,name,rgb_pixel(red,green,blue));

        }
        else
        {
            mfont.draw_string(c,name_rect,name,rgb_pixel(red,green,blue));
        }
    }

// ----------------------------------------------------------------------------------------

    rectangle button_style_toolbar1::
    get_min_size (
        const ustring& name,
        const font& mfont 
    ) const 
    {

        unsigned long width; 
        unsigned long height;
        mfont.compute_size(name,width,height);
        name_width = width;

        return rectangle(width+2*padding, height+2*padding);
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    void button_style_toolbar_icon1::draw_button (
        const canvas& c,
        const rectangle& rect,
        const bool enabled,
        const font& ,
        const long lastx,
        const long lasty,
        const ustring& ,
        const bool is_depressed
    ) const
    {
        rectangle area = rect.intersect(c);
        if (area.is_empty())
            return;

        const long radius = padding;

        if (enabled)
        {
            if (rect.contains(lastx,lasty))
            {
                if (is_depressed)
                {
                    fill_gradient_rounded(c,rect,radius,rgb_alpha_pixel(100,100,200,150), 
                                                        rgb_alpha_pixel(50,50,100,100));
                    draw_rounded_rectangle(c,rect,radius, rgb_alpha_pixel(150,150,30,200));
                }
                else
                {
                    fill_gradient_rounded(c,rect,radius,rgb_alpha_pixel(150,150,250,130), 
                                                        rgb_alpha_pixel(100,100,150,90));
                    draw_rounded_rectangle(c,rect,radius, rgb_alpha_pixel(150,150,30,200));
                }
            }

            if (is_depressed)
            {
                rectangle img_rect(translate_rect(centered_rect(rect,img_mouseover.nc(),img_mouseover.nr()),1,1));
                point p(img_rect.left(),img_rect.top());
                draw_image(c,p,img_mouseover);
            }
            else
            {
                rectangle img_rect(centered_rect(rect,img_normal.nc(),img_normal.nr()));
                point p(img_rect.left(),img_rect.top());
                if (rect.contains(lastx,lasty))
                    draw_image(c,p,img_mouseover);
                else
                    draw_image(c,p,img_normal);
            }

        }
        else
        {
            rectangle img_rect(centered_rect(rect,img_normal.nc(),img_normal.nr()));
            point p(img_rect.left(),img_rect.top());
            draw_image(c,p,img_disabled);
        }
    }

// ----------------------------------------------------------------------------------------

    rectangle button_style_toolbar_icon1::
    get_min_size (
        const ustring& ,
        const font&  
    ) const 
    {
        return rectangle(img_normal.nc()+2*padding, img_normal.nr()+2*padding);
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    void button_style_arrow::
    draw_button (
        const canvas& c,
        const rectangle& rect,
        const bool enabled,
        const font& ,
        const long ,
        const long ,
        const ustring& ,
        const bool is_depressed
    ) const
    {
        rectangle area = rect.intersect(c);
        if (area.is_empty())
            return;

        fill_rect(c,rect,rgb_pixel(212,208,200));

        const long height = rect.height();
        const long width = rect.width();

        const long smallest = (width < height) ? width : height; 

        const long rows = (smallest+3)/4;
        const long start = rows + rows/2-1;
        long dep;

        long tip_x = 0;
        long tip_y = 0;
        long wy = 0;
        long hy = 0;
        long wx = 0; 
        long hx = 0;

        if (is_depressed)
        {
            dep = 0;

            // draw the button's border
            draw_button_down(c,rect); 
        }
        else
        {
            dep = -1;

            // draw the button's border
            draw_button_up(c,rect);
        }


        switch (dir)
        {
            case UP:
                tip_x = width/2 + rect.left() + dep;
                tip_y = (height - start)/2 + rect.top() + dep + 1;
                wy = 0;
                hy = 1;
                wx = 1;
                hx = 0;
                break;

            case DOWN:
                tip_x = width/2 + rect.left() + dep;
                tip_y = rect.bottom() - (height - start)/2 + dep;
                wy = 0;
                hy = -1;
                wx = 1;
                hx = 0;
                break;

            case LEFT:
                tip_x = rect.left() + (width - start)/2 + dep + 1;
                tip_y = height/2 + rect.top() + dep;
                wy = 1;
                hy = 0;
                wx = 0;
                hx = 1;
                break;

            case RIGHT:
                tip_x = rect.right() - (width - start)/2 + dep;
                tip_y = height/2 + rect.top() + dep;
                wy = 1;
                hy = 0;
                wx = 0;
                hx = -1;
                break;
        }


        rgb_pixel color;
        if (enabled)
        {
            color.red = 0;
            color.green = 0;
            color.blue = 0;
        }
        else
        {
            color.red = 128;
            color.green = 128;
            color.blue = 128;
        }



        for (long i = 0; i < rows; ++i)
        {
            draw_line(c,point(tip_x + wx*i + hx*i, tip_y + wy*i + hy*i), 
                      point(tip_x + wx*i*-1 + hx*i, tip_y + wy*i*-1 + hy*i), 
                      color);
        }

    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // toggle button style stuff 
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    void toggle_button_style_default::draw_toggle_button (
        const canvas& c,
        const rectangle& rect,
        const bool enabled,
        const font& mfont,
        const long ,
        const long ,
        const ustring& name,
        const bool is_depressed,
        const bool is_checked
    ) const
    {
        rectangle area = rect.intersect(c);
        if (area.is_empty())
            return;

        fill_rect(c,rect,rgb_pixel(212,208,200));

        unsigned char red, green, blue;
        if (enabled)
        {
            red = 0;
            green = 0;
            blue = 0;
        }
        else
        {
            red = 128;
            green = 128;
            blue = 128;
        }

        // compute the name length if it hasn't already been computed
        if (name_width == 0)
        {
            unsigned long height;
            mfont.compute_size(name,name_width,height);
        }

        // figure out where the name string should appear
        rectangle name_rect;
        const unsigned long width = name_width;
        const unsigned long height = mfont.height();
        name_rect.set_left((rect.right() + rect.left() - width)/2);
        name_rect.set_top((rect.bottom() + rect.top() - height)/2 + 1);
        name_rect.set_right(name_rect.left()+width-1);
        name_rect.set_bottom(name_rect.top()+height);

        long d = 0;
        if (is_checked)
            d = 1;

        if (is_depressed)
            d = 2;

        name_rect.set_left(name_rect.left()+d);
        name_rect.set_right(name_rect.right()+d);
        name_rect.set_top(name_rect.top()+d);
        name_rect.set_bottom(name_rect.bottom()+d);

        mfont.draw_string(c,name_rect,name,rgb_pixel(red,green,blue));

        // now draw the edge of the button
        if (is_checked || is_depressed)
            draw_button_down(c,rect);
        else
            draw_button_up(c,rect);
    }

// ----------------------------------------------------------------------------------------

    rectangle toggle_button_style_default::
    get_min_size (
        const ustring& name,
        const font& mfont 
    ) const 
    {

        unsigned long width; 
        unsigned long height;
        mfont.compute_size(name,width,height);
        name_width = width;

        return rectangle(width+2*padding, height+2*padding);
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    void toggle_button_style_check_box::draw_toggle_button (
        const canvas& c,
        const rectangle& rect,
        const bool enabled,
        const font& mfont,
        const long ,
        const long ,
        const ustring& name,
        const bool is_depressed,
        const bool is_checked
    ) const
    {
        rectangle area = rect.intersect(c);
        if (area.is_empty())
            return;


        rgb_pixel color;
        if (enabled)
        {
            color.red = 0;
            color.green = 0;
            color.blue = 0;
        }
        else
        {
            color.red = 128;
            color.green = 128;
            color.blue = 128;
        }


        // figure out where the name string should appear
        rectangle name_rect, box_rect;
        unsigned long padding = 0;
        if (mfont.height() < 13)
            padding = (rect.height() - mfont.height())/2;

        name_rect = rect;
        name_rect.set_left(rect.left() + 17-1);
        name_rect.set_top(rect.top() + padding);
        name_rect.set_bottom(rect.bottom() - padding);
            
        box_rect = rect;
        box_rect.set_right(rect.left() + 12);
        box_rect.set_bottom(rect.top() + 12);

        mfont.draw_string(c,name_rect,name,color);

        if (enabled && is_depressed == false)
            fill_rect(c, box_rect,rgb_pixel(255,255,255));
        else
            fill_rect(c, box_rect,rgb_pixel(212,208,200));

        draw_sunken_rectangle(c, box_rect);


        if (is_checked)
        {
            const long x = box_rect.left();
            const long y = box_rect.top();
            draw_line(c,point(3+x,5+y),point(6+x,8+y),color);
            draw_line(c,point(3+x,6+y),point(5+x,8+y),color);
            draw_line(c,point(3+x,7+y),point(5+x,9+y),color);
            draw_line(c,point(6+x,6+y),point(9+x,3+y),color);
            draw_line(c,point(6+x,7+y),point(9+x,4+y),color);
            draw_line(c,point(6+x,8+y),point(9+x,5+y),color);
        }
    }

// ----------------------------------------------------------------------------------------

    rectangle toggle_button_style_check_box::
    get_min_size (
        const ustring& name,
        const font& mfont 
    ) const 
    {
        unsigned long width;
        unsigned long height;
        mfont.compute_size(name,width,height);

        if (height < 13)
            height = 13;

        return rectangle(width + 17 -1, height -1);
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    void toggle_button_style_radio_button::draw_toggle_button (
        const canvas& c,
        const rectangle& rect,
        const bool enabled,
        const font& mfont,
        const long ,
        const long ,
        const ustring& name,
        const bool is_depressed,
        const bool is_checked
    ) const
    {
        rectangle area = rect.intersect(c);
        if (area.is_empty())
            return;
        

        rgb_pixel color;

        // figure out where the name string should appear
        rectangle name_rect, box_rect;
        unsigned long padding = 0;
        if (mfont.height() < 13)
            padding = (rect.height() - mfont.height())/2;

        name_rect = rect;
        name_rect.set_left(rect.left() + 17-1);
        name_rect.set_top(rect.top() + padding);
        name_rect.set_bottom(rect.bottom() - padding);
            
        box_rect = rect;
        box_rect.set_right(rect.left() + 12);
        box_rect.set_bottom(rect.top() + 12);

        
        const long x = box_rect.left();
        const long y = box_rect.top();

        if (enabled && is_depressed == false)
            draw_solid_circle(c,point(rect.left()+5,rect.top()+5),4.5,rgb_pixel(255,255,255));
        else
            draw_solid_circle(c,point(rect.left()+5,rect.top()+5),4.5,rgb_pixel(212,208,200));


        color = rgb_pixel(128,128,128);
        draw_line(c,point(0+x,4+y),point(0+x,7+y),color);
        draw_line(c,point(1+x,2+y),point(1+x,9+y),color);
        draw_line(c,point(2+x,1+y),point(9+x,1+y),color);
        draw_line(c,point(4+x,0+y),point(7+x,0+y),color);

        color = rgb_pixel(255,255,255);
        draw_line(c,point(4+x,11+y),point(7+x,11+y),color);
        draw_line(c,point(2+x,10+y),point(9+x,10+y),color);
        draw_line(c,point(10+x,2+y),point(10+x,9+y),color);
        draw_line(c,point(11+x,4+y),point(11+x,7+y),color);

        color = rgb_pixel(64,64,64);
        draw_line(c,point(1+x,4+y),point(1+x,7+y),color);
        draw_line(c,point(4+x,1+y),point(7+x,1+y),color);
        draw_pixel(c,point(2+x,3+y),color);
        draw_pixel(c,point(3+x,2+y),color);
        draw_pixel(c,point(2+x,2+y),color);
        draw_pixel(c,point(2+x,8+y),color);
        draw_pixel(c,point(8+x,2+y),color);
        draw_pixel(c,point(9+x,2+y),color);

        color = rgb_pixel(212,208,200);
        draw_line(c,point(4+x,10+y),point(7+x,10+y),color);
        draw_line(c,point(10+x,4+y),point(10+x,7+y),color);
        draw_pixel(c,point(3+x,9+y),color);
        draw_pixel(c,point(9+x,3+y),color);

        if (enabled)
        {
            color.red = 0;
            color.green = 0;
            color.blue = 0;
        }
        else
        {
            color.red = 128;
            color.green = 128;
            color.blue = 128;
        }

        mfont.draw_string(c,name_rect,name,color);

        if (is_checked)
        {
            draw_line(c,point(5+x,4+y),point(6+x,4+y),color);
            draw_line(c,point(4+x,5+y),point(7+x,5+y),color);
            draw_line(c,point(4+x,6+y),point(7+x,6+y),color);
            draw_line(c,point(5+x,7+y),point(6+x,7+y),color);
        }

    }

// ----------------------------------------------------------------------------------------

    rectangle toggle_button_style_radio_button::
    get_min_size (
        const ustring& name,
        const font& mfont 
    ) const 
    {
        unsigned long width;
        unsigned long height;
        mfont.compute_size(name,width,height);

        if (height < 13)
            height = 13;

        return rectangle(width + 17 -1, height -1);
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // scroll bar style stuff 
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    long scroll_bar_style_default::
    get_slider_length (
        long total_length,
        long max_pos
    ) const
    {
        // if the length is too small then we have to smash up the arrow buttons
        // and hide the slider.
        if (total_length <= get_width()*2)
        {
            return 0;
        }
        else
        {
            double range = total_length - get_button_length(total_length, max_pos)*2;

            double scale_factor = 30.0/(max_pos + 30.0);

            if (scale_factor < 0.1)
                scale_factor = 0.1;


            double fraction = range/(max_pos + range)*scale_factor;
            double result = fraction * range;
            long res = static_cast<long>(result);
            if (res < 8)
                res = 8;
            return res;
        }
    }

// ----------------------------------------------------------------------------------------

    long scroll_bar_style_default::
    get_button_length (
        long total_length,
        long 
    ) const
    {
        // if the length is too small then we have to smash up the arrow buttons
        // and hide the slider.
        if (total_length <= get_width()*2)
        {
            return total_length/2;
        }
        else
        {
            return get_width();
        }
    }

// ----------------------------------------------------------------------------------------

    void scroll_bar_style_default::
    draw_scroll_bar_background (
        const canvas& c,
        const rectangle& rect,
        const bool ,
        const long ,
        const long ,
        const bool is_depressed
    ) const
    {
        if (is_depressed)
            draw_checkered(c, rect,rgb_pixel(0,0,0),rgb_pixel(43,47,55));
        else
            draw_checkered(c, rect,rgb_pixel(255,255,255),rgb_pixel(212,208,200));
    }

// ----------------------------------------------------------------------------------------

    void scroll_bar_style_default::
    draw_scroll_bar_slider (
        const canvas& c,
        const rectangle& rect,
        const bool ,
        const long ,
        const long ,
        const bool 
    ) const
    {
        fill_rect(c, rect, rgb_pixel(212,208,200));
        draw_button_up(c, rect);
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // text_field styles  
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    unsigned long text_field_style_default::
    get_padding (
        const font& mfont 
    ) const  
    { 
        return mfont.height()-mfont.ascender();
    }

// ----------------------------------------------------------------------------------------

    void text_field_style_default::
    draw_text_field (
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
    ) const 
    {
        rectangle area = rect.intersect(c);

        if (enabled)
        {
            // first fill our area with the bg_color
            fill_rect(c, area,bg_color);
        }
        else
        {
            // first fill our area with gray 
            fill_rect(c, area,rgb_pixel(212,208,200));
        }


        if (enabled)
            mfont.draw_string(c,text_rect,text,text_color,text_pos);
        else
            mfont.draw_string(c,text_rect,text,rgb_pixel(128,128,128),text_pos);

        // now draw the edge of the text_field
        draw_sunken_rectangle(c, rect);

        if (highlight_start <= highlight_end && enabled)
        {
            rectangle highlight_rect = text_rect;
            unsigned long left_pad = 0, right_pad = mfont.left_overflow();

            long i;
            for (i = text_pos; i <= highlight_end; ++i)
            {
                if (i == highlight_start)
                    left_pad = right_pad;

                right_pad += mfont[text[i]].width();
            }

            highlight_rect.set_left(text_rect.left()+left_pad);
            highlight_rect.set_right(text_rect.left()+right_pad);

            // highlight the highlight_rect area
            highlight_rect = highlight_rect.intersect(c);
            for (long row = highlight_rect.top(); row <= highlight_rect.bottom(); ++row)
            {
                for (long col = highlight_rect.left(); col <= highlight_rect.right(); ++col)
                {
                    canvas::pixel& pixel = c[row-c.top()][col-c.left()];
                    if (pixel.red == 255 && pixel.green == 255 && pixel.blue == 255)
                    {
                        // this is a background (and white) pixel so set it to a dark 
                        // blueish color.
                        pixel.red = 10;
                        pixel.green = 36;
                        pixel.blue = 106;
                    }
                    else
                    {
                        // this should be a pixel that is part of a letter so set it to white
                        pixel.red = 255;
                        pixel.green = 255;
                        pixel.blue = 255;
                    }
                }
            }
        }

        // now draw the cursor if we need to
        if (cursor_visible && has_focus && enabled)
        {
            const unsigned long top = rect.top()+3;
            const unsigned long bottom = rect.bottom()-3;
            draw_line(c, point(rect.left()+cursor_x,top),point(rect.left()+cursor_x,bottom));
        }

    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // text_box styles  
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    void text_box_style_default::
    draw_text_box (
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
    ) const 
    {
        rectangle area = display_rect.intersect(c);

        if (enabled)
        {
            // first fill our area with the bg_color
            fill_rect(c, area,bg_color);
        }
        else
        {
            // first fill our area with gray 
            fill_rect(c, area,rgb_pixel(212,208,200));
        }


        if (enabled)
            mfont.draw_string(c,text_rect,text,text_color, 0, ustring::npos, area);
        else
            mfont.draw_string(c,text_rect,text,rgb_pixel(128,128,128), 0, ustring::npos, area);


        // now draw the highlight if there is any
        if (highlight_start <= highlight_end && enabled)
        {
            const rectangle first_pos = mfont.compute_cursor_rect(text_rect, text, highlight_start);
            const rectangle last_pos = mfont.compute_cursor_rect(text_rect, text, highlight_end+1);

            const rgb_alpha_pixel color(10, 30, 106, 90);

            // if the highlighted text is all on one line
            if (first_pos.top() == last_pos.top())
            {
                fill_rect(c, (first_pos + last_pos).intersect(display_rect), color);
            }
            else
            {
                const rectangle min_boundary(display_rect.left()+4, display_rect.top()+4,
                                             display_rect.right()-4, display_rect.bottom()-4);
                const rectangle boundary( display_rect.intersect(text_rect) + min_boundary);

                rectangle first_row, last_row, middle_rows;
                first_row += first_pos;
                first_row += point(boundary.right(), first_pos.top());
                last_row += last_pos;
                last_row += point(boundary.left(), last_pos.bottom());

                middle_rows.left() = boundary.left();
                middle_rows.right() = boundary.right();
                middle_rows.top() = first_row.bottom()+1;
                middle_rows.bottom() = last_row.top()-1;

                fill_rect(c, first_row.intersect(display_rect), color);
                fill_rect(c, middle_rows, color);
                fill_rect(c, last_row.intersect(display_rect), color);
            }
        }

        // now draw the cursor if we need to
        if (cursor_visible && has_focus && enabled)
        {
            draw_line(c, point(cursor_rect.left(), cursor_rect.top()),point(cursor_rect.left(), cursor_rect.bottom()), 0, area);
        }

    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_WIDGETs_STYLE_CPP_

