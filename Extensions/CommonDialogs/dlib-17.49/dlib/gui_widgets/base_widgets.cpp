// Copyright (C) 2005  Davis E. King (davis@dlib.net), Keita Mochizuki
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_BASE_WIDGETs_CPP_
#define DLIB_BASE_WIDGETs_CPP_

#include "base_widgets.h"
#include "../assert.h"
#include <iostream>


namespace dlib
{

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // button object methods  
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    void button::
    set_size (
        unsigned long width,
        unsigned long height
    )
    {
        auto_mutex M(m);
        rectangle min_rect = style->get_min_size(name_,*mfont);
        // only change the size if it isn't going to be too small to fit the name
        if (height >= min_rect.height() &&
            width >= min_rect.width())
        {
            rectangle old(rect);
            rect = resize_rect(rect,width,height);
            parent.invalidate_rectangle(style->get_invalidation_rect(rect+old));
            btn_tooltip.set_size(width,height);
        }
    }

// ----------------------------------------------------------------------------------------

    void button::
    show (
    )
    {
        button_action::show();
        btn_tooltip.show();
    }

// ----------------------------------------------------------------------------------------

    void button::
    hide (
    )
    {
        button_action::hide();
        btn_tooltip.hide();
    }

// ----------------------------------------------------------------------------------------

    void button::
    enable (
    )
    {
        button_action::enable();
        btn_tooltip.enable();
    }

// ----------------------------------------------------------------------------------------

    void button::
    disable (
    )
    {
        button_action::disable();
        btn_tooltip.disable();
    }

// ----------------------------------------------------------------------------------------

    void button::
    set_tooltip_text (
        const std::string& text
    )
    {
        btn_tooltip.set_text(text);
    }

// ----------------------------------------------------------------------------------------

    void button::
    set_tooltip_text (
        const std::wstring& text
    )
    {
        btn_tooltip.set_text(text);
    }

// ----------------------------------------------------------------------------------------

    void button::
    set_tooltip_text (
        const ustring& text
    )
    {
        btn_tooltip.set_text(text);
    }

// ----------------------------------------------------------------------------------------

    const std::string button::
    tooltip_text (
    ) const
    {
        return btn_tooltip.text();
    }

    const std::wstring button::
    tooltip_wtext (
    ) const
    {
        return btn_tooltip.wtext();
    }

    const dlib::ustring button::
    tooltip_utext (
    ) const
    {
        return btn_tooltip.utext();
    }

// ----------------------------------------------------------------------------------------

    void button::
    set_main_font (
        const shared_ptr_thread_safe<font>& f
    )
    {
        auto_mutex M(m);
        mfont = f;
        set_name(name_);
    }

// ----------------------------------------------------------------------------------------

    void button::
    set_pos (
        long x,
        long y
    )
    {
        auto_mutex M(m);
        button_action::set_pos(x,y);
        btn_tooltip.set_pos(x,y);
    }

// ----------------------------------------------------------------------------------------

    void button::
    set_name (
        const std::string& name
    )
    {
        set_name(convert_mbstring_to_wstring(name));
    }

    void button::
    set_name (
        const std::wstring& name
    )
    {
        set_name(convert_wstring_to_utf32(name));
    }

    void button::
    set_name (
        const ustring& name
    )
    {
        auto_mutex M(m);
        name_ = name;
        // do this to get rid of any reference counting that may be present in 
        // the std::string implementation.
        name_[0] = name_[0];

        rectangle old(rect);
        rect = move_rect(style->get_min_size(name,*mfont),rect.left(),rect.top());
        btn_tooltip.set_size(rect.width(),rect.height());
        
        parent.invalidate_rectangle(style->get_invalidation_rect(rect+old));
    }

// ----------------------------------------------------------------------------------------

    const std::string button::
    name (
    ) const
    {
        auto_mutex M(m);
        std::string temp = convert_wstring_to_mbstring(wname());
        // do this to get rid of any reference counting that may be present in 
        // the std::string implementation.
        char c = temp[0];
        temp[0] = c;
        return temp;
    }

    const std::wstring button::
    wname (
    ) const
    {
        auto_mutex M(m);
        std::wstring temp = convert_utf32_to_wstring(uname());
        // do this to get rid of any reference counting that may be present in 
        // the std::wstring implementation.
        wchar_t w = temp[0];
        temp[0] = w;
        return temp;
    }

    const dlib::ustring button::
    uname (
    ) const
    {
        auto_mutex M(m);
        dlib::ustring temp = name_;
        // do this to get rid of any reference counting that may be present in 
        // the dlib::ustring implementation.
        temp[0] = name_[0];
        return temp;
    }

// ----------------------------------------------------------------------------------------

    void button::
    on_button_up (
        bool mouse_over
    )
    {
        if (mouse_over)                
        {
            // this is a valid button click
            if (event_handler.is_set())
                event_handler();
            if (event_handler_self.is_set())
                event_handler_self(*this);
        }
        if (button_up_handler.is_set())
            button_up_handler(mouse_over);
        if (button_up_handler_self.is_set())
            button_up_handler_self(mouse_over,*this);
    }

// ----------------------------------------------------------------------------------------

    void button::
    on_button_down (
    )
    {
        if (button_down_handler.is_set())
            button_down_handler();
        if (button_down_handler_self.is_set())
            button_down_handler_self(*this);
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // draggable object methods  
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    draggable::~draggable() {}

// ----------------------------------------------------------------------------------------

    void draggable::
    on_mouse_move (
        unsigned long state,
        long x,
        long y
    )
    {
        if (drag && (state & base_window::LEFT) && enabled && !hidden)
        {
            // the user is trying to drag this object.  we should calculate the new
            // x and y positions for the upper left corner of this object's rectangle

            long new_x = x - this->x;
            long new_y = y - this->y;

            // make sure these points are inside the draggable area.  
            if (new_x < area.left())
                new_x = area.left();
            if (new_x + static_cast<long>(rect.width()) - 1 > area.right())
                new_x = area.right() - rect.width() + 1;

            if (new_y + static_cast<long>(rect.height()) - 1 > area.bottom())
                new_y = area.bottom() - rect.height() + 1;
            if (new_y < area.top())
                new_y = area.top();

            // now make the new rectangle for this object
            rectangle new_rect(
                new_x,
                new_y,
                new_x + rect.width() - 1,
                new_y + rect.height() - 1
            );

            // only do anything if this is a new rectangle and it is inside area
            if (new_rect != rect && area.intersect(new_rect) == new_rect)
            {
                parent.invalidate_rectangle(new_rect + rect);
                rect = new_rect;

                // call the on_drag() event handler
                on_drag();
            }
        }
        else
        {
            drag = false;
            on_drag_stop();
        }
    }

// ----------------------------------------------------------------------------------------

    void draggable::
    on_mouse_up (
        unsigned long ,
        unsigned long state,
        long ,
        long 
    )
    {
        if (drag && (state & base_window::LEFT) == 0)
        {
            drag = false;
            on_drag_stop();
        }
    }

// ----------------------------------------------------------------------------------------

    void draggable::
    on_mouse_down (
        unsigned long btn,
        unsigned long ,
        long x,
        long y,
        bool 
    )
    {
        if (enabled && !hidden && rect.contains(x,y) && btn == base_window::LEFT)
        {
            drag = true;
            this->x = x - rect.left();
            this->y = y - rect.top();
        }
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // mouse_over_event object methods  
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    mouse_over_event::~mouse_over_event() {}

// ----------------------------------------------------------------------------------------

    void mouse_over_event::
    on_mouse_leave (
    )
    {
        if (is_mouse_over_)
        {
            is_mouse_over_ = false;
            on_mouse_not_over();
        }
    }

// ----------------------------------------------------------------------------------------

    void mouse_over_event::
    on_mouse_move (
        unsigned long ,
        long x,
        long y
    )
    {
        if (rect.contains(x,y) == false)
        {
            if (is_mouse_over_)
            {
                is_mouse_over_ = false;
                on_mouse_not_over();
            }
        }
        else if (is_mouse_over_ == false)
        {
            is_mouse_over_ = true;
            if (enabled && !hidden)
                on_mouse_over();
        }
    }

// ----------------------------------------------------------------------------------------

    bool mouse_over_event::
    is_mouse_over (
    ) const
    {
        // check if the mouse is still really over this button
        if (is_mouse_over_ && rect.contains(lastx,lasty) == false)
        {
            // trigger a user event to call on_mouse_not_over() and repaint this object.
            // we must do this in another event because someone might call is_mouse_over()
            // from draw() and you don't want this function to end up calling 
            // parent.invalidate_rectangle().  It would lead to draw() being called over
            // and over.
            parent.trigger_user_event((void*)this,drawable::next_free_user_event_number());
            return false;
        }

        return is_mouse_over_;
    }

// ----------------------------------------------------------------------------------------

    void mouse_over_event::
    on_user_event (
        int num 
    )
    {
        if (is_mouse_over_ && num == drawable::next_free_user_event_number())
        {
            is_mouse_over_ = false;
            on_mouse_not_over();
        }
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // button_action object methods  
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    button_action::~button_action() {}

// ----------------------------------------------------------------------------------------

    void button_action::
    on_mouse_down (
        unsigned long btn,
        unsigned long ,
        long x,
        long y,
        bool
    )
    {
        if (enabled && !hidden && btn == base_window::LEFT && rect.contains(x,y))
        {
            is_depressed_ = true;
            seen_click = true;
            parent.invalidate_rectangle(rect);
            on_button_down();
        }
    }

// ----------------------------------------------------------------------------------------

    void button_action::
    on_mouse_not_over (
    )
    {
        if (is_depressed_)
        {
            is_depressed_ = false;
            parent.invalidate_rectangle(rect);
            on_button_up(false);
        }
    }

// ----------------------------------------------------------------------------------------

    void button_action::
    on_mouse_move (
        unsigned long state,
        long x,
        long y
    )
    {
        // forward event to the parent class so it can do it's thing as well as us
        mouse_over_event::on_mouse_move(state,x,y);

        if (enabled == false || hidden == true)
            return;


        if ((state & base_window::LEFT) == 0)
        {
            seen_click = false;
            if (is_depressed_)
            {
                is_depressed_ = false;
                parent.invalidate_rectangle(rect);
                on_button_up(false);
            }

            // the left button isn't down so we don't care about anything else
            return;
        }

        if (rect.contains(x,y) == false)
        {
            if (is_depressed_)
            {
                is_depressed_ = false;
                parent.invalidate_rectangle(rect);
                on_button_up(false);
            }
        }
        else if (is_depressed_ == false && seen_click)
        {
            is_depressed_ = true;
            parent.invalidate_rectangle(rect);
            on_button_down();
        }
    }

// ----------------------------------------------------------------------------------------

    void button_action::
    on_mouse_up (
        unsigned long btn,
        unsigned long,
        long x,
        long y
    )
    {
        if (enabled && !hidden && btn == base_window::LEFT)
        {
            if (is_depressed_)
            {
                is_depressed_ = false;
                parent.invalidate_rectangle(rect);

                if (rect.contains(x,y))                
                {
                    on_button_up(true);
                }
                else
                {
                    on_button_up(false);
                }
            }
            else if (seen_click && rect.contains(x,y))
            {
                // this case here covers the unlikly event that you click on a button,
                // move the mouse off the button and then move it back very quickly and
                // release the mouse button.   It is possible that this mouse up event
                // will occurr before any mouse move event so you might not have set
                // that the button is depressed yet.
                
                // So we should say that this triggers an on_button_down() event and
                // then an on_button_up(true) event.

                parent.invalidate_rectangle(rect);

                on_button_down();
                on_button_up(true);
            }

            seen_click = false;
        }
    }

// ----------------------------------------------------------------------------------------

    bool button_action::
    is_depressed (
    ) const
    {
        // check if the mouse is still really over this button
        if (enabled && !hidden && is_depressed_ && rect.contains(lastx,lasty) == false)
        {
            // trigger a user event to call on_button_up() and repaint this object.
            // we must do this in another event because someone might call is_depressed()
            // from draw() and you don't want this function to end up calling 
            // parent.invalidate_rectangle().  It would lead to draw() being called over
            // and over.
            parent.trigger_user_event((void*)this,mouse_over_event::next_free_user_event_number());
            return false;
        }

        return is_depressed_;
    }

// ----------------------------------------------------------------------------------------

    void button_action::
    on_user_event (
        int num
    )
    {
        // forward event to the parent class so it can do it's thing as well as us
        mouse_over_event::on_user_event(num);

        if (is_depressed_ && num == mouse_over_event::next_free_user_event_number())
        {
            is_depressed_ = false;
            parent.invalidate_rectangle(rect);
            on_button_up(false);
        }
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // scroll_bar object methods  
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    scroll_bar::
    scroll_bar(  
        drawable_window& w,
        bar_orientation orientation 
    ) :
        drawable(w),
        b1(w),
        b2(w),
        slider(w,*this,&scroll_bar::on_slider_drag),
        ori(orientation),
        top_filler(w,*this,&scroll_bar::top_filler_down,&scroll_bar::top_filler_up),
        bottom_filler(w,*this,&scroll_bar::bottom_filler_down,&scroll_bar::bottom_filler_up),
        pos(0),
        max_pos(0),
        js(10),
        b1_timer(*this,&scroll_bar::b1_down_t),
        b2_timer(*this,&scroll_bar::b2_down_t),
        top_filler_timer(*this,&scroll_bar::top_filler_down_t),
        bottom_filler_timer(*this,&scroll_bar::bottom_filler_down_t)
    {
        set_style(scroll_bar_style_default());

        // don't show the slider when there is no place it can move.
        slider.hide();

        set_length(100);

        b1.set_button_down_handler(*this,&scroll_bar::b1_down);
        b2.set_button_down_handler(*this,&scroll_bar::b2_down);

        b1.set_button_up_handler(*this,&scroll_bar::b1_up);
        b2.set_button_up_handler(*this,&scroll_bar::b2_up);
        b1.disable();
        b2.disable();
        enable_events();
    }

// ----------------------------------------------------------------------------------------

    scroll_bar::
    ~scroll_bar(
    )
    {
        disable_events();
        parent.invalidate_rectangle(rect); 
        // wait for all the timers to be stopped
        b1_timer.stop_and_wait();
        b2_timer.stop_and_wait();
        top_filler_timer.stop_and_wait();
        bottom_filler_timer.stop_and_wait();
    }

// ----------------------------------------------------------------------------------------

    scroll_bar::bar_orientation scroll_bar::
    orientation (
    ) const
    {
        auto_mutex M(m);
        return ori;
    }

// ----------------------------------------------------------------------------------------
    
    void scroll_bar::
    set_length (
        unsigned long length
    )
    {
        auto_mutex M(m);
        // make the min length be at least 1
        if (length == 0)
        {
            length = 1;
        }


        parent.invalidate_rectangle(rect);

        if (ori == HORIZONTAL)
        {
            rect.set_right(rect.left() + length - 1);
            rect.set_bottom(rect.top() + style->get_width() - 1);

            const long btn_size = style->get_button_length(rect.width(), max_pos);

            b1.set_size(btn_size,style->get_width());
            b2.set_size(btn_size,style->get_width());

            slider.set_size(get_slider_size(),style->get_width());
        }
        else
        {
            rect.set_right(rect.left() + style->get_width() - 1);
            rect.set_bottom(rect.top() + length - 1);

            const long btn_size = style->get_button_length(rect.height(), max_pos);

            b1.set_size(style->get_width(),btn_size);
            b2.set_size(style->get_width(),btn_size);

            slider.set_size(style->get_width(),get_slider_size());
        }

        // call this to put everything is in the right spot.
        set_pos (rect.left(),rect.top());

        if ((b2.get_rect().top() - b1.get_rect().bottom() - 1 <= 8 && ori == VERTICAL) || 
            (b2.get_rect().left() - b1.get_rect().right() - 1 <= 8 && ori == HORIZONTAL) || 
            max_pos == 0)
        {
            hide_slider();
        }
        else if (enabled && !hidden)
        {
            show_slider();
        }
    }

// ----------------------------------------------------------------------------------------

    void scroll_bar::
    set_pos (
        long x,
        long y
    )
    {
        auto_mutex M(m);
        drawable::set_pos(x,y);

        b1.set_pos(rect.left(),rect.top());
        if (ori == HORIZONTAL)
        {
            // make the b2 button appear at the end of the scroll_bar
            b2.set_pos(rect.right()-b2.get_rect().width() + 1,rect.top());

            if (max_pos != 0)
            {
                double range = b2.get_rect().left() - b1.get_rect().right() - slider.get_rect().width() - 1;
                double slider_pos = pos;
                slider_pos /= max_pos;
                slider_pos *= range;
                slider.set_pos(
                    static_cast<long>(slider_pos)+rect.left() + b1.get_rect().width(),
                    rect.top()
                    );

                // move the draggable area for the slider to the new location
                rectangle area = rect;
                area.set_left(area.left() + style->get_width());
                area.set_right(area.right() - style->get_width());
                slider.set_draggable_area(area);

            }

            
        }
        else
        {
            // make the b2 button appear at the end of the scroll_bar
            b2.set_pos(rect.left(), rect.bottom() - b2.get_rect().height() + 1);

            if (max_pos != 0)
            {
                double range = b2.get_rect().top() - b1.get_rect().bottom() - slider.get_rect().height() - 1;
                double slider_pos = pos;
                slider_pos /= max_pos;
                slider_pos *= range;
                slider.set_pos(
                    rect.left(), 
                    static_cast<long>(slider_pos) + rect.top() + b1.get_rect().height()
                    );

                // move the draggable area for the slider to the new location
                rectangle area = rect;
                area.set_top(area.top() + style->get_width());
                area.set_bottom(area.bottom() - style->get_width());
                slider.set_draggable_area(area);
            }
        }

        adjust_fillers();
    }

// ----------------------------------------------------------------------------------------

    unsigned long scroll_bar::
    get_slider_size (
    ) const
    {
        if (ori == HORIZONTAL)
            return style->get_slider_length(rect.width(),max_pos);
        else
            return style->get_slider_length(rect.height(),max_pos);
    }

// ----------------------------------------------------------------------------------------

    void scroll_bar::
    adjust_fillers (
    )
    {
        rectangle top(rect), bottom(rect);

        if (ori == HORIZONTAL)
        {
            if (slider.is_hidden())
            {
                top.set_left(b1.get_rect().right()+1);
                top.set_right(b2.get_rect().left()-1);
                bottom.set_left(1);
                bottom.set_right(-1);
            }
            else
            {
                top.set_left(b1.get_rect().right()+1);
                top.set_right(slider.get_rect().left()-1);
                bottom.set_left(slider.get_rect().right()+1);
                bottom.set_right(b2.get_rect().left()-1);
            }
        }
        else
        {
            if (slider.is_hidden())
            {
                top.set_top(b1.get_rect().bottom()+1);
                top.set_bottom(b2.get_rect().top()-1);
                bottom.set_top(1);
                bottom.set_bottom(-1);
            }
            else
            {
                top.set_top(b1.get_rect().bottom()+1);
                top.set_bottom(slider.get_rect().top()-1);
                bottom.set_top(slider.get_rect().bottom()+1);
                bottom.set_bottom(b2.get_rect().top()-1);
            }
        }

        top_filler.rect = top;
        bottom_filler.rect = bottom;
    }

// ----------------------------------------------------------------------------------------

    void scroll_bar::
    hide_slider (
    )
    {
        rectangle top(rect), bottom(rect);
        slider.hide();
        top_filler.disable();
        bottom_filler.disable();
        bottom_filler.hide();
        if (ori == HORIZONTAL)
        {
            top.set_left(b1.get_rect().right()+1);
            top.set_right(b2.get_rect().left()-1);
        }
        else
        {
            top.set_top(b1.get_rect().bottom()+1);
            top.set_bottom(b2.get_rect().top()-1);
        }
        top_filler.rect = top;
        bottom_filler.rect = bottom;
    }

// ----------------------------------------------------------------------------------------

    void scroll_bar::
    show_slider (
    )
    {
        if ((b2.get_rect().top() - b1.get_rect().bottom() - 1 <= 8 && ori == VERTICAL) || 
            (b2.get_rect().left() - b1.get_rect().right() - 1 <= 8 && ori == HORIZONTAL) || 
            max_pos == 0)
            return;

        rectangle top(rect), bottom(rect);
        slider.show();
        top_filler.enable();
        bottom_filler.enable();
        bottom_filler.show();
        if (ori == HORIZONTAL)
        {
            top.set_left(b1.get_rect().right()+1);
            top.set_right(slider.get_rect().left()-1);
            bottom.set_left(slider.get_rect().right()+1);
            bottom.set_right(b2.get_rect().left()-1);
        }
        else
        {
            top.set_top(b1.get_rect().bottom()+1);
            top.set_bottom(slider.get_rect().top()-1);
            bottom.set_top(slider.get_rect().bottom()+1);
            bottom.set_bottom(b2.get_rect().top()-1);
        }
        top_filler.rect = top;
        bottom_filler.rect = bottom;
    }

// ----------------------------------------------------------------------------------------

    long scroll_bar::
    max_slider_pos (
    ) const
    {
        auto_mutex M(m);
        return max_pos;
    }

// ----------------------------------------------------------------------------------------

    void scroll_bar::
    set_max_slider_pos (
        long mpos
    )
    {
        auto_mutex M(m);
        max_pos = mpos;
        if (pos > mpos)
            pos = mpos;

        if (ori == HORIZONTAL)
            set_length(rect.width());
        else
            set_length(rect.height());

        if (mpos != 0 && enabled)
        {
            b1.enable();
            b2.enable();
        }
        else
        {
            b1.disable();
            b2.disable();
        }
             
    }

// ----------------------------------------------------------------------------------------

    void scroll_bar::
    set_slider_pos (
        long pos
    )
    {
        auto_mutex M(m);
        if (pos < 0)
            pos = 0;
        if (pos > max_pos)
            pos = max_pos;

        this->pos = pos;

        // move the slider object to its new position
        set_pos(rect.left(),rect.top());
    }

// ----------------------------------------------------------------------------------------

    long scroll_bar::
    slider_pos (
    ) const
    {
        auto_mutex M(m);
        return pos;
    }

// ----------------------------------------------------------------------------------------

    void scroll_bar::
    on_slider_drag (
    )
    {
        if (ori == HORIZONTAL)
        {
            double slider_pos = slider.get_rect().left() - b1.get_rect().right() - 1;
            double range = b2.get_rect().left() - b1.get_rect().right() - slider.get_rect().width() - 1;
            slider_pos /= range;
            slider_pos *= max_pos;
            pos = static_cast<unsigned long>(slider_pos);
        }
        else
        {
            double slider_pos = slider.get_rect().top() - b1.get_rect().bottom() - 1;
            double range = b2.get_rect().top() - b1.get_rect().bottom() - slider.get_rect().height() - 1;
            slider_pos /= range;
            slider_pos *= max_pos;
            pos = static_cast<unsigned long>(slider_pos);
        }

        adjust_fillers();
        
        if (scroll_handler.is_set())
            scroll_handler();
    }

// ----------------------------------------------------------------------------------------

    void scroll_bar::
    draw (
        const canvas& 
    ) const
    {
    }

// ----------------------------------------------------------------------------------------

    void scroll_bar::
    b1_down (
    )
    {
        if (pos != 0)
        {
            set_slider_pos(pos-1);
            if (scroll_handler.is_set())
                scroll_handler();

            if (b1_timer.delay_time() == 1000)
                b1_timer.set_delay_time(500);
            else
                b1_timer.set_delay_time(50);
            b1_timer.start();
        }
    }

// ----------------------------------------------------------------------------------------

    void scroll_bar::
    b1_up (
        bool 
    )
    {
        b1_timer.stop();
        b1_timer.set_delay_time(1000);
    }

// ----------------------------------------------------------------------------------------

    void scroll_bar::
    b2_down (
    )
    {
        if (pos != max_pos)
        {
            set_slider_pos(pos+1);
            if (scroll_handler.is_set())
                scroll_handler();

            if (b2_timer.delay_time() == 1000)
                b2_timer.set_delay_time(500);
            else
                b2_timer.set_delay_time(50);
            b2_timer.start();
        }
    }

// ----------------------------------------------------------------------------------------

    void scroll_bar::
    b2_up (
        bool 
    )
    {
        b2_timer.stop();
        b2_timer.set_delay_time(1000);
    }
        
// ----------------------------------------------------------------------------------------

    void scroll_bar::
    top_filler_down (
    )
    {
        // ignore this if the mouse is now outside this object.  This could happen
        // since the timers are also calling this function.
        if (top_filler.rect.contains(lastx,lasty) == false)
        {
            top_filler_up(false);
            return;
        }

        if (pos != 0)
        {
            if (pos < js)
            {
                // if there is less than jump_size() space left then jump the remaining
                // amount.
                delayed_set_slider_pos(0);
            }
            else
            {
                delayed_set_slider_pos(pos-js);
            }

            if (top_filler_timer.delay_time() == 1000)
                top_filler_timer.set_delay_time(500);
            else
                top_filler_timer.set_delay_time(50);
            top_filler_timer.start();
        }
    }

// ----------------------------------------------------------------------------------------

    void scroll_bar::
    top_filler_up (
        bool 
    )
    {
        top_filler_timer.stop();
        top_filler_timer.set_delay_time(1000);
    }

// ----------------------------------------------------------------------------------------

    void scroll_bar::
    bottom_filler_down (
    )
    {
        // ignore this if the mouse is now outside this object.  This could happen
        // since the timers are also calling this function.
        if (bottom_filler.rect.contains(lastx,lasty) == false)
        {
            bottom_filler_up(false);
            return;
        }

        if (pos != max_pos)
        {
            if (max_pos - pos < js)
            {
                // if there is less than jump_size() space left then jump the remaining
                // amount.
                delayed_set_slider_pos(max_pos);
            }
            else
            {
                delayed_set_slider_pos(pos+js);
            }

            if (bottom_filler_timer.delay_time() == 1000)
                bottom_filler_timer.set_delay_time(500);
            else
                bottom_filler_timer.set_delay_time(50);
            bottom_filler_timer.start();
        }
    }

// ----------------------------------------------------------------------------------------

    void scroll_bar::
    bottom_filler_up (
        bool 
    )
    {
        bottom_filler_timer.stop();
        bottom_filler_timer.set_delay_time(1000);
    }

// ----------------------------------------------------------------------------------------

    void scroll_bar::
    set_jump_size (
        long js_
    )
    {
        auto_mutex M(m);
        if (js_ < 1)
            js = 1;
        else
            js = js_;
    }

// ----------------------------------------------------------------------------------------

    long scroll_bar::
    jump_size (
    ) const
    {
        auto_mutex M(m);
        return js;
    }

// ----------------------------------------------------------------------------------------

    void scroll_bar::
    on_user_event (
        int i
    )
    {
        switch (i)
        {
            case 0:
                b1_down();
                break;
            case 1:
                b2_down();
                break;
            case 2:
                top_filler_down();
                break;
            case 3:
                bottom_filler_down();
                break;
            case 4:
                // if the position we are supposed to switch the slider too isn't 
                // already set
                if (delayed_pos != pos)
                {
                    set_slider_pos(delayed_pos);
                    if (scroll_handler.is_set())
                        scroll_handler();
                }
                break;
            default:
                break;
        }
    }

// ----------------------------------------------------------------------------------------

    void scroll_bar::
    delayed_set_slider_pos (
        unsigned long dpos
    ) 
    {
        delayed_pos = dpos;
        parent.trigger_user_event(this,4); 
    }

// ----------------------------------------------------------------------------------------

    void scroll_bar::
    b1_down_t (
    ) 
    { 
        parent.trigger_user_event(this,0); 
    }

// ----------------------------------------------------------------------------------------

    void scroll_bar::
    b2_down_t (
    ) 
    { 
        parent.trigger_user_event(this,1); 
    }

// ----------------------------------------------------------------------------------------

    void scroll_bar::
    top_filler_down_t (
    ) 
    { 
        parent.trigger_user_event(this,2); 
    }

// ----------------------------------------------------------------------------------------

    void scroll_bar::
    bottom_filler_down_t (
    ) 
    { 
        parent.trigger_user_event(this,3); 
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
//                  widget_group object methods  
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    void widget_group::
    empty (
    ) 
    {  
        auto_mutex M(m); 
        widgets.clear(); 
        wg_widgets.clear();
    }

// ----------------------------------------------------------------------------------------

    void widget_group::
    add (
        drawable& widget,
        unsigned long x,
        unsigned long y
    )
    {
        auto_mutex M(m); 
        drawable* w = &widget;
        relpos rp;
        rp.x = x;
        rp.y = y;
        if (widgets.is_in_domain(w))
        {
            widgets[w].x = x;
            widgets[w].y = y;
        }
        else
        {
            widgets.add(w,rp);
        }
        if (is_hidden())
            widget.hide();
        else
            widget.show();

        if (is_enabled())
            widget.enable();
        else
            widget.disable();

        widget.set_z_order(z_order());
        widget.set_pos(x+rect.left(),y+rect.top());
    }

// ----------------------------------------------------------------------------------------

    void widget_group::
    add (
        widget_group& widget,
        unsigned long x,
        unsigned long y
    )
    {
        auto_mutex M(m); 
        drawable& w = widget;
        add(w, x, y);

        widget_group* wg = &widget;
        wg_widgets.add(wg);
    }

// ----------------------------------------------------------------------------------------

    bool widget_group::
    is_member (
        const drawable& widget
    ) const 
    { 
        auto_mutex M(m); 
        drawable* w = const_cast<drawable*>(&widget);
        return widgets.is_in_domain(w); 
    }

// ----------------------------------------------------------------------------------------

    void widget_group::
    remove (
        const drawable& widget
    )
    {
        auto_mutex M(m); 
        drawable* w = const_cast<drawable*>(&widget);
        if (widgets.is_in_domain(w))
        {
            widgets.destroy(w);

            // check if we also have an entry in the wg_widgets set and if
            // so then remove that too
            widget_group* wg = reinterpret_cast<widget_group*>(w);
            if (wg_widgets.is_member(wg))
            {
                wg_widgets.destroy(wg);
            }
        }
    }

// ----------------------------------------------------------------------------------------

    unsigned long widget_group::
    size (
    ) const 
    {  
        auto_mutex M(m); 
        return widgets.size(); 
    }

// ----------------------------------------------------------------------------------------

    void widget_group::
    set_pos (
        long x,
        long y
    )
    {
        auto_mutex M(m);
        widgets.reset();
        while (widgets.move_next())
        {
            const unsigned long rx = widgets.element().value().x;
            const unsigned long ry = widgets.element().value().y;
            widgets.element().key()->set_pos(x+rx,y+ry);
        }
        drawable::set_pos(x,y);
    }

// ----------------------------------------------------------------------------------------

    void widget_group::
    set_z_order (
        long order
    )
    {
        auto_mutex M(m);
        widgets.reset();
        while (widgets.move_next())
            widgets.element().key()->set_z_order(order);
        drawable::set_z_order(order);
    }

// ----------------------------------------------------------------------------------------

    void widget_group::
    show (
    )
    {
        auto_mutex M(m);
        widgets.reset();
        while (widgets.move_next())
            widgets.element().key()->show();
        drawable::show();
    }

// ----------------------------------------------------------------------------------------

    void widget_group::
    hide (
    )
    {
        auto_mutex M(m);
        widgets.reset();
        while (widgets.move_next())
            widgets.element().key()->hide();
        drawable::hide();
    }

// ----------------------------------------------------------------------------------------

    void widget_group::
    enable (
    )
    {
        auto_mutex M(m);
        widgets.reset();
        while (widgets.move_next())
            widgets.element().key()->enable();
        drawable::enable();
    }

// ----------------------------------------------------------------------------------------

    void widget_group::
    disable ()
    {
        auto_mutex M(m);
        widgets.reset();
        while (widgets.move_next())
            widgets.element().key()->disable();
        drawable::disable();
    }

// ----------------------------------------------------------------------------------------

    void widget_group::
    fit_to_contents (
    )
    {
        auto_mutex M(m);

        // call fit_to_contents on all the widget_groups we contain
        wg_widgets.reset();
        while (wg_widgets.move_next())
            wg_widgets.element()->fit_to_contents();

        // now accumulate a rectangle that contains everything in this widget_group
        rectangle r;
        widgets.reset();
        while (widgets.move_next())
            r = r + widgets.element().key()->get_rect();

        if (r.is_empty())
        {
            // make sure it is still empty after we set it at the correct position 
            r.set_right(rect.left()-1);
            r.set_bottom(rect.top()-1);
        }

        r.set_left(rect.left());
        r.set_top(rect.top());
        rect = r;
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
//                class popup_menu
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    popup_menu::
    popup_menu (
    ) :
        base_window(false,true),
        pad(2),
        item_pad(3),
        cur_rect(pad,pad,pad-1,pad-1),
        left_width(0),
        middle_width(0),
        selected_item(0),
        submenu_open(false)
    {
    }

// ----------------------------------------------------------------------------------------

    void popup_menu::
    enable_menu_item (
        unsigned long idx
    )
    {
        DLIB_ASSERT ( idx < size() ,
                      "\tvoid popup_menu::enable_menu_item()"
                      << "\n\tidx:    " << idx
                      << "\n\tsize(): " << size() 
        );
        auto_mutex M(wm);
        item_enabled[idx] = true;
        invalidate_rectangle(cur_rect);
    }

// ----------------------------------------------------------------------------------------

    void popup_menu::
    disable_menu_item (
        unsigned long idx
    )
    {
        DLIB_ASSERT ( idx < size() ,
                      "\tvoid popup_menu::enable_menu_item()"
                      << "\n\tidx:    " << idx
                      << "\n\tsize(): " << size() 
        );
        auto_mutex M(wm);
        item_enabled[idx] = false;
        invalidate_rectangle(cur_rect);
    }

// ----------------------------------------------------------------------------------------

    unsigned long popup_menu::
    size (
    ) const
    { 
        auto_mutex M(wm);
        return items.size();
    }

// ----------------------------------------------------------------------------------------

    void popup_menu::
    clear (
    )
    {
        auto_mutex M(wm);
        hide();
        cur_rect = rectangle(pad,pad,pad-1,pad-1);
        win_rect = rectangle();
        left_width = 0;
        middle_width = 0;
        items.clear();
        item_enabled.clear();
        left_rects.clear();
        middle_rects.clear();
        right_rects.clear();
        line_rects.clear();
        submenus.clear();
        selected_item = 0;
        submenu_open = false;
    }

// ----------------------------------------------------------------------------------------

    void popup_menu::
    show (
    )
    {
        auto_mutex M(wm);
        selected_item = submenus.size();
        base_window::show();
    }

// ----------------------------------------------------------------------------------------

    void popup_menu::
    hide (
    )
    {
        auto_mutex M(wm);
        // hide ourselves
        close_submenu();
        selected_item = submenus.size();
        base_window::hide();
    }

// ----------------------------------------------------------------------------------------

    void popup_menu::
    select_first_item (
    )
    {
        auto_mutex M(wm);
        close_submenu();
        selected_item = items.size();
        for (unsigned long i = 0; i < items.size(); ++i)
        {
            if ((items[i]->has_click_event() || submenus[i]) && item_enabled[i])
            {
                selected_item = i;
                break;
            }
        }
        invalidate_rectangle(cur_rect);
    }

// ----------------------------------------------------------------------------------------

    bool popup_menu::
    forwarded_on_keydown (
        unsigned long key,
        bool is_printable,
        unsigned long state
    )
    {
        auto_mutex M(wm);
        // do nothing if this popup menu is empty
        if (items.size() == 0)
            return false;


        // check if the selected item is a submenu
        if (selected_item != submenus.size() && submenus[selected_item] != 0 && submenu_open)
        {
            // send the key to the submenu and return if that menu used the key
            if (submenus[selected_item]->forwarded_on_keydown(key,is_printable,state) == true)
                return true;
        }

        if (key == KEY_UP)
        {
            for (unsigned long i = 0; i < items.size(); ++i)
            {
                selected_item = (selected_item + items.size() - 1)%items.size();
                // only stop looking if this one is enabled and has a click event or is a submenu
                if (item_enabled[selected_item] && (items[selected_item]->has_click_event() || submenus[selected_item]) )
                    break;
            }
            invalidate_rectangle(cur_rect);
            return true;
        }
        else if (key == KEY_DOWN)
        {
            for (unsigned long i = 0; i < items.size(); ++i)
            {
                selected_item = (selected_item + 1)%items.size();
                // only stop looking if this one is enabled and has a click event or is a submenu
                if (item_enabled[selected_item] && (items[selected_item]->has_click_event() || submenus[selected_item]))
                    break;
            }
            invalidate_rectangle(cur_rect);
            return true;
        }
        else if (key == KEY_RIGHT && submenu_open == false && display_selected_submenu())
        {
            submenus[selected_item]->select_first_item();
            return true;
        }
        else if (key == KEY_LEFT && selected_item != submenus.size() && 
                 submenus[selected_item] != 0 && submenu_open)
        {
            close_submenu();
            return true;
        }
        else if (key == '\n')
        {
            if (selected_item != submenus.size() && (items[selected_item]->has_click_event() || submenus[selected_item]))
            {
                const long idx = selected_item;
                // only hide this popup window if this isn't a submenu
                if (submenus[idx] == 0)
                {
                    hide();
                    hide_handlers.reset();
                    while (hide_handlers.move_next())
                        hide_handlers.element()();
                }
                else
                {
                    display_selected_submenu();
                    submenus[idx]->select_first_item();
                }
                items[idx]->on_click();
                return true;
            }
        }
        else if (is_printable)
        {
            // check if there is a hotkey for this key
            for (unsigned long i = 0; i < items.size(); ++i)
            {
                if (std::tolower(key) == std::tolower(items[i]->get_hot_key()) && 
                    (items[i]->has_click_event() || submenus[i]) && item_enabled[i] )
                {
                    // only hide this popup window if this isn't a submenu
                    if (submenus[i] == 0)
                    {
                        hide();
                        hide_handlers.reset();
                        while (hide_handlers.move_next())
                            hide_handlers.element()();
                    }
                    else
                    {
                        if (selected_item != items.size())
                            invalidate_rectangle(line_rects[selected_item]);

                        selected_item = i;
                        display_selected_submenu();
                        invalidate_rectangle(line_rects[i]);
                        submenus[i]->select_first_item();
                    }
                    items[i]->on_click();
                }
            }

            // always say we use a printable key for hotkeys
            return true;
        }

        return false;
    }

// ----------------------------------------------------------------------------------------

    void popup_menu::
    on_submenu_hide (
    )
    {
        hide();
        hide_handlers.reset();
        while (hide_handlers.move_next())
            hide_handlers.element()();
    }

// ----------------------------------------------------------------------------------------

    void popup_menu::
    on_window_resized(
    )
    {
        invalidate_rectangle(win_rect);
    }

// ----------------------------------------------------------------------------------------

    void popup_menu::
    on_mouse_up (
        unsigned long btn,
        unsigned long,
        long x,
        long y
    )
    {
        if (cur_rect.contains(x,y) && btn == LEFT)
        {
            // figure out which item this was on 
            for (unsigned long i = 0; i < items.size(); ++i)
            {
                if (line_rects[i].contains(x,y) && item_enabled[i] && items[i]->has_click_event())
                {
                    // only hide this popup window if this isn't a submenu
                    if (submenus[i] == 0)
                    {
                        hide();
                        hide_handlers.reset();
                        while (hide_handlers.move_next())
                            hide_handlers.element()();
                    }
                    items[i]->on_click();
                    break;
                }
            }
        }
    }

// ----------------------------------------------------------------------------------------

    void popup_menu::
    on_mouse_move (
        unsigned long ,
        long x,
        long y
    )
    {
        if (cur_rect.contains(x,y))
        {
            // check if the mouse is still in the same rect it was in last time
            rectangle last_rect;
            if (selected_item != submenus.size())
            {
                last_rect = line_rects[selected_item];
            }

            // if the mouse isn't in the same rectangle any more
            if (last_rect.contains(x,y) == false)
            {
                if (selected_item != submenus.size())
                {
                    invalidate_rectangle(last_rect);
                    close_submenu();
                    selected_item = submenus.size();
                }


                // figure out if we should redraw any menu items 
                for (unsigned long i = 0; i < items.size(); ++i)
                {
                    if (items[i]->has_click_event() || submenus[i])
                    {
                        if (line_rects[i].contains(x,y))
                        {
                            selected_item = i;
                            break;
                        }
                    }
                }

                // if we found a rectangle that contains the mouse then
                // tell it to redraw itself
                if (selected_item != submenus.size())
                {
                    display_selected_submenu();
                    invalidate_rectangle(line_rects[selected_item]);
                }
            }
        }
    }

// ----------------------------------------------------------------------------------------

    void popup_menu::
    close_submenu (
    )
    {
        if (selected_item != submenus.size() && submenus[selected_item] && submenu_open)
        {
            submenus[selected_item]->hide();
            submenu_open = false;
        }
    }

// ----------------------------------------------------------------------------------------

    bool popup_menu::
    display_selected_submenu (
    )
    {
        // show the submenu if one exists
        if (selected_item != submenus.size() && submenus[selected_item])
        {
            long wx, wy;
            get_pos(wx,wy);
            wx += line_rects[selected_item].right();
            wy += line_rects[selected_item].top();
            submenus[selected_item]->set_pos(wx+1,wy-2);
            submenus[selected_item]->show();
            submenu_open = true;
            return true;
        }
        return false;
    }

// ----------------------------------------------------------------------------------------

    void popup_menu::
    on_mouse_leave (
    )
    {
        if (selected_item != submenus.size())
        {
            // only unhighlight a menu item if it isn't a submenu item
            if (submenus[selected_item] == 0)
            {
                invalidate_rectangle(line_rects[selected_item]);
                selected_item = submenus.size();
            }
        }
    }

// ----------------------------------------------------------------------------------------

    void popup_menu::
    paint (
        const canvas& c
    )
    {
        c.fill(200,200,200);
        draw_rectangle(c, win_rect);
        for (unsigned long i = 0; i < items.size(); ++i)
        {
            bool is_selected = false;
            if (selected_item != submenus.size() && i == selected_item && 
                item_enabled[i])
                is_selected = true;

            items[i]->draw_background(c,line_rects[i], item_enabled[i], is_selected);
            items[i]->draw_left(c,left_rects[i], item_enabled[i], is_selected);
            items[i]->draw_middle(c,middle_rects[i], item_enabled[i], is_selected);
            items[i]->draw_right(c,right_rects[i], item_enabled[i], is_selected);
        }
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
//              class zoomable_region
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    zoomable_region::
    zoomable_region (
        drawable_window& w,
        unsigned long events 
    ) :
        drawable(w,MOUSE_CLICK | MOUSE_WHEEL | MOUSE_MOVE | events),
        min_scale(0.15),
        max_scale(1.0),
        zoom_increment_(0.90),
        vsb(w, scroll_bar::VERTICAL),
        hsb(w, scroll_bar::HORIZONTAL)
    {
        scale = 1;
        mouse_drag_screen = false;
        style.reset(new scrollable_region_style_default());

        hsb.set_scroll_handler(*this,&zoomable_region::on_h_scroll);
        vsb.set_scroll_handler(*this,&zoomable_region::on_v_scroll);
    }

// ----------------------------------------------------------------------------------------

    zoomable_region::
    ~zoomable_region() 
    {
    }

// ----------------------------------------------------------------------------------------

    void zoomable_region::
    set_pos (
        long x,
        long y
    )
    {
        auto_mutex M(m);
        drawable::set_pos(x,y);
        const long border_size = style->get_border_size();
        vsb.set_pos(rect.right()-border_size+1-vsb.width(),rect.top()+border_size);
        hsb.set_pos(rect.left()+border_size,rect.bottom()-border_size+1-hsb.height());

        display_rect_ = rectangle(rect.left()+border_size,
                                  rect.top()+border_size,
                                  rect.right()-border_size-vsb.width(),
                                  rect.bottom()-border_size-hsb.height());

    }

// ----------------------------------------------------------------------------------------

    void zoomable_region::
    set_zoom_increment (
        double zi
    )
    {
        DLIB_ASSERT(0.0 < zi && zi < 1.0,
                    "\tvoid zoomable_region::set_zoom_increment(zi)"
                    << "\n\t the zoom increment must be between 0 and 1"
                    << "\n\t zi:   " << zi
                    << "\n\t this: " << this
        );

        auto_mutex M(m);
        zoom_increment_ = zi;
    }

// ----------------------------------------------------------------------------------------

    double zoomable_region::
    zoom_increment (
    ) const
    {
        auto_mutex M(m);
        return zoom_increment_;
    }

// ----------------------------------------------------------------------------------------

    void zoomable_region::
    set_max_zoom_scale (
        double ms 
    )
    {
        DLIB_ASSERT(ms > 0,
                    "\tvoid zoomable_region::set_max_zoom_scale(ms)"
                    << "\n\t the max zoom scale must be greater than 0"
                    << "\n\t ms:   " << ms 
                    << "\n\t this: " << this
        );

        auto_mutex M(m);
        max_scale = ms;
        if (scale > ms)
        {
            scale = max_scale;
            lr_point = gui_to_graph_space(point(display_rect_.right(),display_rect_.bottom()));
            redraw_graph();
        }
    }

// ----------------------------------------------------------------------------------------

    void zoomable_region::
    set_min_zoom_scale (
        double ms 
    )
    {
        DLIB_ASSERT(ms > 0,
                    "\tvoid zoomable_region::set_min_zoom_scale(ms)"
                    << "\n\t the min zoom scale must be greater than 0"
                    << "\n\t ms:   " << ms 
                    << "\n\t this: " << this
        );

        auto_mutex M(m);
        min_scale = ms;

        if (scale < ms)
        {
            scale = min_scale;
        }

        // just call set_size so that everything gets redrawn right
        set_size(rect.width(), rect.height());
    }

// ----------------------------------------------------------------------------------------

    double zoomable_region::
    min_zoom_scale (
    ) const
    {
        auto_mutex M(m);
        return min_scale;
    }

// ----------------------------------------------------------------------------------------

    double zoomable_region::
    max_zoom_scale (
    ) const
    {
        auto_mutex M(m);
        return max_scale;
    }

// ----------------------------------------------------------------------------------------

    void zoomable_region::
    set_size (
        unsigned long width,
        unsigned long height
    )
    {
        auto_mutex M(m);
        rectangle old(rect);
        const long border_size = style->get_border_size();
        rect = resize_rect(rect,width,height);
        vsb.set_pos(rect.right()-border_size+1-vsb.width(),  rect.top()+border_size);
        hsb.set_pos(rect.left()+border_size,  rect.bottom()-border_size+1-hsb.height());

        display_rect_ = rectangle(rect.left()+border_size,
                                  rect.top()+border_size,
                                  rect.right()-border_size-vsb.width(),
                                  rect.bottom()-border_size-hsb.height());
        vsb.set_length(display_rect_.height());
        hsb.set_length(display_rect_.width());
        parent.invalidate_rectangle(rect+old);

        const double old_scale = scale;
        const vector<double,2> old_gr_orig(gr_orig);
        scale = min_scale;
        gr_orig = vector<double,2>(0,0);
        lr_point = gui_to_graph_space(point(display_rect_.right(),display_rect_.bottom()));
        scale = old_scale;

        // call adjust_origin() so that the scroll bars get their max slider positions
        // setup right
        const point rect_corner(display_rect_.left(), display_rect_.top());
        adjust_origin(rect_corner, old_gr_orig);
    }

// ----------------------------------------------------------------------------------------

    void zoomable_region::
    show (
    )
    {
        auto_mutex M(m);
        drawable::show();
        hsb.show();
        vsb.show();
    }

// ----------------------------------------------------------------------------------------

    void zoomable_region::
    hide (
    )
    {
        auto_mutex M(m);
        drawable::hide();
        hsb.hide();
        vsb.hide();
    }

// ----------------------------------------------------------------------------------------

    void zoomable_region::
    enable (
    )
    {
        auto_mutex M(m);
        drawable::enable();
        hsb.enable();
        vsb.enable();
    }

// ----------------------------------------------------------------------------------------

    void zoomable_region::
    disable (
    )
    {
        auto_mutex M(m);
        drawable::disable();
        hsb.disable();
        vsb.disable();
    }

// ----------------------------------------------------------------------------------------

    void zoomable_region::
    set_z_order (
        long order
    )
    {
        auto_mutex M(m);
        drawable::set_z_order(order);
        hsb.set_z_order(order);
        vsb.set_z_order(order);
    }

// ----------------------------------------------------------------------------------------

    point zoomable_region::
    graph_to_gui_space (
        const vector<double,2>& p
    ) const
    {
        const point rect_corner(display_rect_.left(), display_rect_.top());
        return (p - gr_orig)*scale + rect_corner;
    }

// ----------------------------------------------------------------------------------------

    vector<double,2> zoomable_region::
    gui_to_graph_space (
        const point& p
    ) const
    {
        const point rect_corner(display_rect_.left(), display_rect_.top());
        return (p - rect_corner)/scale + gr_orig;
    }

// ----------------------------------------------------------------------------------------

    point zoomable_region::
    max_graph_point (
    ) const
    {
        return lr_point;
    }

// ----------------------------------------------------------------------------------------

    rectangle zoomable_region::
    display_rect (
    ) const 
    {
        return display_rect_;
    }

// ----------------------------------------------------------------------------------------

    double zoomable_region::
    zoom_scale (
    ) const
    {
        return scale;
    }

// ----------------------------------------------------------------------------------------

    void zoomable_region::
    set_zoom_scale (
        double new_scale
    )
    {
        // if new_scale isn't in the right range then put it back in range before we do the 
        // rest of this function
        if (!(min_scale <= new_scale && new_scale <= max_scale))
        {
            if (new_scale > max_scale)
                new_scale = max_scale;
            else
                new_scale = min_scale;
        }

        // find the point in the center of the graph area
        point center((display_rect_.left()+display_rect_.right())/2,  (display_rect_.top()+display_rect_.bottom())/2);
        point graph_p(gui_to_graph_space(center));
        scale = new_scale;
        adjust_origin(center, graph_p);
        redraw_graph();
    }

// ----------------------------------------------------------------------------------------

    void zoomable_region::
    center_display_at_graph_point (
        const vector<double,2>& p
    )
    {
        // find the point in the center of the graph area
        point center((display_rect_.left()+display_rect_.right())/2,  (display_rect_.top()+display_rect_.bottom())/2);
        adjust_origin(center, p);
        redraw_graph();
    }

// ----------------------------------------------------------------------------------------

    void zoomable_region::
    on_wheel_down (
        unsigned long 
    )
    {
        // zoom out
        if (enabled && !hidden && scale > min_scale && display_rect_.contains(lastx,lasty))
        {
            point gui_p(lastx,lasty);
            point graph_p(gui_to_graph_space(gui_p));
            scale *= zoom_increment_;
            if (scale < min_scale)
                scale = min_scale;
            redraw_graph(); 
            adjust_origin(gui_p, graph_p);
        }
    }

// ----------------------------------------------------------------------------------------

    void zoomable_region::
    on_wheel_up (
        unsigned long 
    )
    {
        // zoom in 
        if (enabled && !hidden && scale < max_scale  && display_rect_.contains(lastx,lasty))
        {
            point gui_p(lastx,lasty);
            point graph_p(gui_to_graph_space(gui_p));
            scale /= zoom_increment_;
            if (scale > max_scale)
                scale = max_scale;
            redraw_graph(); 
            adjust_origin(gui_p, graph_p);
        }
    }

// ----------------------------------------------------------------------------------------

    void zoomable_region::
    on_mouse_move (
        unsigned long state,
        long x,
        long y
    )
    {
        if (enabled && !hidden && mouse_drag_screen)
        {
            adjust_origin(point(x,y), drag_screen_point);
            redraw_graph();
        }

        // check if the mouse isn't being dragged anymore
        if ((state & base_window::LEFT) == 0)
        {
            mouse_drag_screen = false;
        }
    }

// ----------------------------------------------------------------------------------------

    void zoomable_region::
    on_mouse_up (
        unsigned long ,
        unsigned long ,
        long ,
        long 
    )
    {
        mouse_drag_screen = false;
    }

// ----------------------------------------------------------------------------------------

    void zoomable_region::
    on_mouse_down (
        unsigned long btn,
        unsigned long ,
        long x,
        long y,
        bool 
    )
    {
        if (enabled && !hidden && display_rect_.contains(x,y) && btn == base_window::LEFT)
        {
            mouse_drag_screen = true;
            drag_screen_point = gui_to_graph_space(point(x,y));
        }
    }

// ----------------------------------------------------------------------------------------

    void zoomable_region::
    draw (
        const canvas& c
    ) const
    {
        style->draw_scrollable_region_border(c, rect, enabled);
    }

// ----------------------------------------------------------------------------------------

    void zoomable_region::
    on_h_scroll (
    )
    {
        gr_orig.x() = hsb.slider_pos();
        redraw_graph();
    }

// ----------------------------------------------------------------------------------------

    void zoomable_region::
    on_v_scroll (
    )
    {
        gr_orig.y() = vsb.slider_pos();
        redraw_graph();
    }

// ----------------------------------------------------------------------------------------

    void zoomable_region::
    redraw_graph (
    )
    {
        parent.invalidate_rectangle(display_rect_);
    }

// ----------------------------------------------------------------------------------------

    void zoomable_region::
    adjust_origin (
        const point& gui_p,
        const vector<double,2>& graph_p
    )
    {
        const point rect_corner(display_rect_.left(), display_rect_.top());
        const dlib::vector<double,2> v(gui_p - rect_corner);
        gr_orig = graph_p - v/scale;


        // make sure the origin isn't outside the point (0,0)
        if (gr_orig.x() < 0)
            gr_orig.x() = 0;
        if (gr_orig.y() < 0)
            gr_orig.y() = 0;

        // make sure the lower right corner of the display_rect_ doesn't map to a point beyond lr_point
        point lr_rect_corner(display_rect_.right(), display_rect_.bottom());
        point p = graph_to_gui_space(lr_point);
        vector<double,2> lr_rect_corner_graph_space(gui_to_graph_space(lr_rect_corner));
        vector<double,2> delta(lr_point - lr_rect_corner_graph_space);
        if (lr_rect_corner.x() > p.x())
        {
            gr_orig.x() += delta.x();
        }

        if (lr_rect_corner.y() > p.y())
        {
            gr_orig.y() += delta.y();
        }


        const vector<double,2> ul_rect_corner_graph_space(gui_to_graph_space(rect_corner));
        lr_rect_corner_graph_space = gui_to_graph_space(lr_rect_corner);
        // now adjust the scroll bars

        hsb.set_max_slider_pos((unsigned long)std::max(lr_point.x()-(lr_rect_corner_graph_space.x()-ul_rect_corner_graph_space.x()),0.0));
        vsb.set_max_slider_pos((unsigned long)std::max(lr_point.y()-(lr_rect_corner_graph_space.y()-ul_rect_corner_graph_space.y()),0.0));
        // adjust slider position now.  
        hsb.set_slider_pos(static_cast<long>(ul_rect_corner_graph_space.x()));
        vsb.set_slider_pos(static_cast<long>(ul_rect_corner_graph_space.y()));

    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
//              class scrollable_region
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    scrollable_region::
    scrollable_region (
        drawable_window& w,
        unsigned long events 
    ) :
        drawable(w, MOUSE_WHEEL|events|MOUSE_CLICK|MOUSE_MOVE),
        hsb(w,scroll_bar::HORIZONTAL),
        vsb(w,scroll_bar::VERTICAL),
        hscroll_bar_inc(1),
        vscroll_bar_inc(1),
        h_wheel_scroll_bar_inc(1),
        v_wheel_scroll_bar_inc(1),
        mouse_drag_enabled_(false),
        user_is_dragging_mouse(false)
    {
        style.reset(new scrollable_region_style_default());

        hsb.set_scroll_handler(*this,&scrollable_region::on_h_scroll);
        vsb.set_scroll_handler(*this,&scrollable_region::on_v_scroll);
    }

// ----------------------------------------------------------------------------------------

    scrollable_region::
    ~scrollable_region (
    )
    {
    }

// ----------------------------------------------------------------------------------------

    void scrollable_region::
    show (
    )
    {
        auto_mutex M(m);
        drawable::show();
        if (need_h_scroll())
            hsb.show();
        if (need_v_scroll())
            vsb.show();
    }

// ----------------------------------------------------------------------------------------

    void scrollable_region::
    hide (
    )
    {
        auto_mutex M(m);
        drawable::hide();
        hsb.hide();
        vsb.hide();
    }

// ----------------------------------------------------------------------------------------

    void scrollable_region::
    enable (
    )
    {
        auto_mutex M(m);
        drawable::enable();
        hsb.enable();
        vsb.enable();
    }

// ----------------------------------------------------------------------------------------

    void scrollable_region::
    disable (
    )
    {
        auto_mutex M(m);
        drawable::disable();
        hsb.disable();
        vsb.disable();
    }

// ----------------------------------------------------------------------------------------

    void scrollable_region::
    set_z_order (
        long order
    )
    {
        auto_mutex M(m);
        drawable::set_z_order(order);
        hsb.set_z_order(order);
        vsb.set_z_order(order);
    }

// ----------------------------------------------------------------------------------------

    void scrollable_region::
    set_size (
        unsigned long width,
        unsigned long height
    )
    {
        auto_mutex M(m);
        rectangle old(rect);
        rect = resize_rect(rect,width,height);
        vsb.set_pos(rect.right()-style->get_border_size()-vsb.width()+1, rect.top()+style->get_border_size());
        hsb.set_pos(rect.left()+style->get_border_size(), rect.bottom()-style->get_border_size()-hsb.height()+1);

        // adjust the display_rect_
        if (need_h_scroll() && need_v_scroll())
        {
            // both scroll bars aren't hidden
            if (!hidden)
            {
                vsb.show();
                hsb.show();
            }
            display_rect_ = rectangle( rect.left()+style->get_border_size(),
                                       rect.top()+style->get_border_size(),
                                       rect.right()-style->get_border_size()-vsb.width(),
                                       rect.bottom()-style->get_border_size()-hsb.height());

            // figure out how many scroll bar positions there should be
            unsigned long hdelta = total_rect_.width()-display_rect_.width();
            unsigned long vdelta = total_rect_.height()-display_rect_.height();
            hdelta = (hdelta+hscroll_bar_inc-1)/hscroll_bar_inc;
            vdelta = (vdelta+vscroll_bar_inc-1)/vscroll_bar_inc;

            hsb.set_max_slider_pos(hdelta);
            vsb.set_max_slider_pos(vdelta);

            vsb.set_jump_size((display_rect_.height()+vscroll_bar_inc-1)/vscroll_bar_inc/2+1);
            hsb.set_jump_size((display_rect_.width()+hscroll_bar_inc-1)/hscroll_bar_inc/2+1);
        }
        else if (need_h_scroll())
        {
            // only hsb is hidden 
            if (!hidden)
            {
                hsb.show();
                vsb.hide();
            }
            display_rect_ = rectangle( rect.left()+style->get_border_size(),
                                       rect.top()+style->get_border_size(),
                                       rect.right()-style->get_border_size(),
                                       rect.bottom()-style->get_border_size()-hsb.height());

            // figure out how many scroll bar positions there should be
            unsigned long hdelta = total_rect_.width()-display_rect_.width();
            hdelta = (hdelta+hscroll_bar_inc-1)/hscroll_bar_inc;

            hsb.set_max_slider_pos(hdelta);
            vsb.set_max_slider_pos(0);

            hsb.set_jump_size((display_rect_.width()+hscroll_bar_inc-1)/hscroll_bar_inc/2+1);
        }
        else if (need_v_scroll())
        {
            // only vsb is hidden 
            if (!hidden)
            {
                hsb.hide();
                vsb.show();
            }
            display_rect_ = rectangle( rect.left()+style->get_border_size(),
                                       rect.top()+style->get_border_size(),
                                       rect.right()-style->get_border_size()-vsb.width(),
                                       rect.bottom()-style->get_border_size());

            unsigned long vdelta = total_rect_.height()-display_rect_.height();
            vdelta = (vdelta+vscroll_bar_inc-1)/vscroll_bar_inc;

            hsb.set_max_slider_pos(0);
            vsb.set_max_slider_pos(vdelta);

            vsb.set_jump_size((display_rect_.height()+vscroll_bar_inc-1)/vscroll_bar_inc/2+1);
        }
        else
        {
            // both are hidden 
            if (!hidden)
            {
                hsb.hide();
                vsb.hide();
            }
            display_rect_ = rectangle( rect.left()+style->get_border_size(),
                                       rect.top()+style->get_border_size(),
                                       rect.right()-style->get_border_size(),
                                       rect.bottom()-style->get_border_size());

            hsb.set_max_slider_pos(0);
            vsb.set_max_slider_pos(0);
        }

        vsb.set_length(display_rect_.height());
        hsb.set_length(display_rect_.width());

        // adjust the total_rect_ position by trigging the scroll events
        on_h_scroll();
        on_v_scroll();

        parent.invalidate_rectangle(rect+old);
    }

// ----------------------------------------------------------------------------------------

    unsigned long scrollable_region::
    horizontal_mouse_wheel_scroll_increment (
    ) const
    {
        auto_mutex M(m);
        return h_wheel_scroll_bar_inc;
    }

// ----------------------------------------------------------------------------------------

    unsigned long scrollable_region::
    vertical_mouse_wheel_scroll_increment (
    ) const
    {
        auto_mutex M(m);
        return v_wheel_scroll_bar_inc;
    }

// ----------------------------------------------------------------------------------------

    void scrollable_region::
    set_horizontal_mouse_wheel_scroll_increment (
        unsigned long inc
    )
    {
        auto_mutex M(m);
        h_wheel_scroll_bar_inc = inc;
    }

// ----------------------------------------------------------------------------------------

    void scrollable_region::
    set_vertical_mouse_wheel_scroll_increment (
        unsigned long inc
    )
    {
        auto_mutex M(m);
        v_wheel_scroll_bar_inc = inc;
    }

// ----------------------------------------------------------------------------------------

    unsigned long scrollable_region::
    horizontal_scroll_increment (
    ) const
    {
        auto_mutex M(m);
        return hscroll_bar_inc;
    }

// ----------------------------------------------------------------------------------------

    unsigned long scrollable_region::
    vertical_scroll_increment (
    ) const
    {
        auto_mutex M(m);
        return vscroll_bar_inc;
    }

// ----------------------------------------------------------------------------------------

    void scrollable_region::
    set_horizontal_scroll_increment (
        unsigned long inc
    )
    {
        auto_mutex M(m);
        hscroll_bar_inc = inc;
        // call set_size to reset the scroll bars
        set_size(rect.width(),rect.height());
    }

// ----------------------------------------------------------------------------------------

    void scrollable_region::
    set_vertical_scroll_increment (
        unsigned long inc
    )
    {
        auto_mutex M(m);
        vscroll_bar_inc = inc;
        // call set_size to reset the scroll bars
        set_size(rect.width(),rect.height());
    }

// ----------------------------------------------------------------------------------------

    long scrollable_region::
    horizontal_scroll_pos (
    ) const
    {
        auto_mutex M(m);
        return hsb.slider_pos();
    }

// ----------------------------------------------------------------------------------------

    long scrollable_region::
    vertical_scroll_pos (
    ) const
    {
        auto_mutex M(m);
        return vsb.slider_pos();
    }

// ----------------------------------------------------------------------------------------

    void scrollable_region::
    set_horizontal_scroll_pos (
        long pos
    )
    {
        auto_mutex M(m);

        hsb.set_slider_pos(pos);
        on_h_scroll();
    }

// ----------------------------------------------------------------------------------------

    void scrollable_region::
    set_vertical_scroll_pos (
        long pos
    )
    {
        auto_mutex M(m);

        vsb.set_slider_pos(pos);
        on_v_scroll();
    }

// ----------------------------------------------------------------------------------------

    void scrollable_region::
    set_pos (
        long x,
        long y
    )
    {
        auto_mutex M(m);
        drawable::set_pos(x,y);
        vsb.set_pos(rect.right()-style->get_border_size()-vsb.width()+1, rect.top()+style->get_border_size());
        hsb.set_pos(rect.left()+style->get_border_size(), rect.bottom()-style->get_border_size()-hsb.height()+1);

        const long delta_x = total_rect_.left() - display_rect_.left();
        const long delta_y = total_rect_.top() - display_rect_.top();

        display_rect_ = move_rect(display_rect_, rect.left()+style->get_border_size(), rect.top()+style->get_border_size());

        total_rect_ = move_rect(total_rect_, display_rect_.left()+delta_x, display_rect_.top()+delta_y);
    }

// ----------------------------------------------------------------------------------------

    bool scrollable_region::
    mouse_drag_enabled (
    ) const
    {
        auto_mutex M(m);
        return mouse_drag_enabled_;
    }

// ----------------------------------------------------------------------------------------

    void scrollable_region::
    enable_mouse_drag (
    )
    {
        auto_mutex M(m);
        mouse_drag_enabled_ = true;
    }

// ----------------------------------------------------------------------------------------

    void scrollable_region::
    disable_mouse_drag (
    )
    {
        auto_mutex M(m);
        mouse_drag_enabled_ = false;
    }

// ----------------------------------------------------------------------------------------

    const rectangle& scrollable_region::
    display_rect (
    ) const
    {
        return display_rect_;
    }

// ----------------------------------------------------------------------------------------

    void scrollable_region::
    set_total_rect_size (
        unsigned long width,
        unsigned long height
    )
    {
        DLIB_ASSERT((width > 0 && height > 0) || (width == 0 && height == 0),
                    "\tvoid scrollable_region::set_total_rect_size(width,height)"
                    << "\n\twidth and height must be > 0 or both == 0"
                    << "\n\twidth:  " << width 
                    << "\n\theight: " << height 
                    << "\n\tthis: " << this
        );

        total_rect_ = move_rect(rectangle(width,height), 
                                display_rect_.left()-static_cast<long>(hsb.slider_pos()),
                                display_rect_.top()-static_cast<long>(vsb.slider_pos()));

        // call this just to reconfigure the scroll bars
        set_size(rect.width(),rect.height());
    }

// ----------------------------------------------------------------------------------------

    const rectangle& scrollable_region::
    total_rect (
    ) const
    {
        return total_rect_;
    }

// ----------------------------------------------------------------------------------------

    void scrollable_region::
    scroll_to_rect (
        const rectangle& r_
    )
    {
        const rectangle r(total_rect_.intersect(r_));
        const rectangle old(total_rect_);
        // adjust the horizontal scroll bar so that r fits as best as possible
        if (r.left() < display_rect_.left())
        {
            long distance = (r.left()-total_rect_.left())/hscroll_bar_inc;
            hsb.set_slider_pos(distance);
        }
        else if (r.right() > display_rect_.right())
        {
            long distance = (r.right()-total_rect_.left()-display_rect_.width()+hscroll_bar_inc)/hscroll_bar_inc;
            hsb.set_slider_pos(distance);
        }

        // adjust the vertical scroll bar so that r fits as best as possible
        if (r.top() < display_rect_.top())
        {
            long distance = (r.top()-total_rect_.top())/vscroll_bar_inc;
            vsb.set_slider_pos(distance);
        }
        else if (r.bottom() > display_rect_.bottom())
        {
            long distance = (r.bottom()-total_rect_.top()-display_rect_.height()+vscroll_bar_inc)/vscroll_bar_inc;
            vsb.set_slider_pos(distance);
        }


        // adjust total_rect_ so that it matches where the scroll bars are now
        total_rect_ = move_rect(total_rect_, 
                                display_rect_.left()-hscroll_bar_inc*hsb.slider_pos(), 
                                display_rect_.top()-vscroll_bar_inc*vsb.slider_pos());

        // only redraw if we actually changed something
        if (total_rect_ != old)
        {
            parent.invalidate_rectangle(display_rect_);
        }
    }

// ----------------------------------------------------------------------------------------

    void scrollable_region::
    on_wheel_down (
        unsigned long 
    )
    {
        if (rect.contains(lastx,lasty) && enabled && !hidden)
        {
            if (need_v_scroll())
            {
                long pos = vsb.slider_pos();
                vsb.set_slider_pos(pos+(long)v_wheel_scroll_bar_inc);
                on_v_scroll();
            }
            else if (need_h_scroll())
            {
                long pos = hsb.slider_pos();
                hsb.set_slider_pos(pos+(long)h_wheel_scroll_bar_inc);
                on_h_scroll();
            }
        }
    }

// ----------------------------------------------------------------------------------------

    void scrollable_region::
    on_mouse_move (
        unsigned long state,
        long x,
        long y
    )
    {
        if (enabled && !hidden && user_is_dragging_mouse && state==base_window::LEFT)
        {
            point current_delta = point(x,y) - point(total_rect().left(), total_rect().top());
            rectangle new_rect(translate_rect(display_rect(), drag_origin - current_delta));
            new_rect = centered_rect(new_rect, new_rect.width()-hscroll_bar_inc, new_rect.height()-vscroll_bar_inc);
            scroll_to_rect(new_rect);
        }
        else
        {
            user_is_dragging_mouse = false;
        }
    }

// ----------------------------------------------------------------------------------------

    void scrollable_region::
    on_mouse_down (
        unsigned long btn,
        unsigned long ,
        long x,
        long y,
        bool 
    )
    {
        if (mouse_drag_enabled_ && enabled && !hidden && display_rect().contains(x,y) && (btn==base_window::LEFT))
        {
            drag_origin = point(x,y) - point(total_rect().left(), total_rect().top());
            user_is_dragging_mouse = true;
        }
        else
        {
            user_is_dragging_mouse = false;
        }
    }

// ----------------------------------------------------------------------------------------

    void scrollable_region::
    on_mouse_up   (
        unsigned long ,
        unsigned long ,
        long ,
        long 
    )
    {
        user_is_dragging_mouse = false;
    }

// ----------------------------------------------------------------------------------------

    void scrollable_region::
    on_wheel_up (
        unsigned long 
    )
    {
        if (rect.contains(lastx,lasty) && enabled && !hidden)
        {
            if (need_v_scroll())
            {
                long pos = vsb.slider_pos();
                vsb.set_slider_pos(pos-(long)v_wheel_scroll_bar_inc);
                on_v_scroll();
            }
            else if (need_h_scroll())
            {
                long pos = hsb.slider_pos();
                hsb.set_slider_pos(pos-(long)h_wheel_scroll_bar_inc);
                on_h_scroll();
            }
        }
    }

// ----------------------------------------------------------------------------------------

    void scrollable_region::
    draw (
        const canvas& c
    ) const
    {
        style->draw_scrollable_region_border(c, rect, enabled);
    }

// ----------------------------------------------------------------------------------------

    bool scrollable_region::
    need_h_scroll (
    ) const
    {
        if (total_rect_.width() > rect.width()-style->get_border_size()*2)
        {
            return true;
        }
        else
        {
            // check if we would need a vertical scroll bar and if adding one would make us need
            // a horizontal one
            if (total_rect_.height() > rect.height()-style->get_border_size()*2 && 
                total_rect_.width() > rect.width()-style->get_border_size()*2-vsb.width())
                return true;
            else
                return false;
        }
    }

// ----------------------------------------------------------------------------------------

    bool scrollable_region::
    need_v_scroll (
    ) const
    {
        if (total_rect_.height() > rect.height()-style->get_border_size()*2)
        {
            return true;
        }
        else
        {
            // check if we would need a horizontal scroll bar and if adding one would make us need
            // a vertical_scroll_pos one
            if (total_rect_.width() > rect.width()-style->get_border_size()*2 && 
                total_rect_.height() > rect.height()-style->get_border_size()*2-hsb.height())
                return true;
            else
                return false;
        }
    }

// ----------------------------------------------------------------------------------------

    void scrollable_region::
    on_h_scroll (
    )
    {
        total_rect_ = move_rect(total_rect_, display_rect_.left()-hscroll_bar_inc*hsb.slider_pos(), total_rect_.top());
        parent.invalidate_rectangle(display_rect_);
    }

// ----------------------------------------------------------------------------------------

    void scrollable_region::
    on_v_scroll (
    )
    {
        total_rect_ = move_rect(total_rect_, total_rect_.left(), display_rect_.top()-vscroll_bar_inc*vsb.slider_pos());
        parent.invalidate_rectangle(display_rect_);
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// class popup_menu_region 
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    popup_menu_region::
    popup_menu_region(  
        drawable_window& w
    ) :
        drawable(w,MOUSE_CLICK | KEYBOARD_EVENTS | FOCUS_EVENTS | WINDOW_MOVED),
        popup_menu_shown(false)
    {

        menu_.set_on_hide_handler(*this,&popup_menu_region::on_menu_becomes_hidden);
        enable_events();
    }

// ----------------------------------------------------------------------------------------

    popup_menu_region::
    ~popup_menu_region(
    )
    { 
        disable_events();
    }

// ----------------------------------------------------------------------------------------

    void popup_menu_region::
    set_size (
        unsigned long width, 
        unsigned long height
    )
    {
        auto_mutex M(m);
        rect = resize_rect(rect,width,height);
    }

// ----------------------------------------------------------------------------------------

    void popup_menu_region::
    set_rect (
        const rectangle& new_rect
    )
    {
        auto_mutex M(m);
        rect = new_rect;
    }

// ----------------------------------------------------------------------------------------

    popup_menu& popup_menu_region::
    menu (
    )
    {
        return menu_;
    }

// ----------------------------------------------------------------------------------------

    void popup_menu_region::
    hide (
    )
    {
        auto_mutex M(m);
        drawable::hide();
        menu_.hide();
        popup_menu_shown = false;
    }

// ----------------------------------------------------------------------------------------

    void popup_menu_region::
    disable (
    )
    {
        auto_mutex M(m);
        drawable::disable();
        menu_.hide();
        popup_menu_shown = false;
    }

// ----------------------------------------------------------------------------------------

    void popup_menu_region::
    on_keydown (
        unsigned long key,
        bool is_printable,
        unsigned long state
    )
    {
        if (enabled && !hidden && popup_menu_shown)
        {
            menu_.forwarded_on_keydown(key, is_printable, state);
        }
        else if (popup_menu_shown)
        {
            menu_.hide();
            popup_menu_shown = false;
        }

        if (key == (unsigned long)base_window::KEY_ESC)
        {
            menu_.hide();
            popup_menu_shown = false;
        }
    }

// ----------------------------------------------------------------------------------------

    void popup_menu_region::
    on_menu_becomes_hidden (
    )
    {
        popup_menu_shown = false;
    }

// ----------------------------------------------------------------------------------------

    void popup_menu_region::
    on_focus_lost (
    )
    {
        if (popup_menu_shown)
        {
            menu_.hide();
            popup_menu_shown = false;
        }
    }

// ----------------------------------------------------------------------------------------

    void popup_menu_region::
    on_focus_gained (
    )
    {
        if (popup_menu_shown)
        {
            menu_.hide();
            popup_menu_shown = false;
        }
    }

// ----------------------------------------------------------------------------------------

    void popup_menu_region::
    on_window_moved(
    )
    {
        if (popup_menu_shown)
        {
            menu_.hide();
            popup_menu_shown = false;
        }
    }

// ----------------------------------------------------------------------------------------

    void popup_menu_region::
    on_mouse_down (
        unsigned long btn,
        unsigned long ,
        long x,
        long y,
        bool 
    )
    {
        if (enabled && !hidden && rect.contains(x,y) && btn == base_window::RIGHT)
        {
            long orig_x, orig_y;
            parent.get_pos(orig_x, orig_y);
            menu_.set_pos(orig_x+x, orig_y+y);
            menu_.show();
            popup_menu_shown = true;
        }
        else if (popup_menu_shown)
        {
            menu_.hide();
            popup_menu_shown = false;
        }
    }

// ----------------------------------------------------------------------------------------

    void popup_menu_region::
    draw (
        const canvas& 
    ) const
    {
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_BASE_WIDGETs_CPP_ 

