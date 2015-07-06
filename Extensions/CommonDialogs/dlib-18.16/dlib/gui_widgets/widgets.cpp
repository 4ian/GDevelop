// Copyright (C) 2005  Davis E. King (davis@dlib.net), Keita Mochizuki
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_WIDGETs_CPP_
#define DLIB_WIDGETs_CPP_

#include "widgets.h"
#include <algorithm>
#include "../string.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // toggle_button object methods  
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    void toggle_button::
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
            parent.invalidate_rectangle(rect+old);
            btn_tooltip.set_size(width,height);
        }
    }

// ----------------------------------------------------------------------------------------

    void toggle_button::
    set_checked (
    )
    {
        auto_mutex M(m);
        checked = true;
        parent.invalidate_rectangle(rect);
    }

// ----------------------------------------------------------------------------------------

    void toggle_button::
    set_unchecked (
    )
    {
        auto_mutex M(m);
        checked = false;
        parent.invalidate_rectangle(rect);
    }

// ----------------------------------------------------------------------------------------

    bool toggle_button::
    is_checked (
    ) const
    {
        auto_mutex M(m);
        return checked;
    }

// ----------------------------------------------------------------------------------------

    void toggle_button::
    show (
    )
    {
        button_action::show();
        btn_tooltip.show();
    }

// ----------------------------------------------------------------------------------------

    void toggle_button::
    hide (
    )
    {
        button_action::hide();
        btn_tooltip.hide();
    }

// ----------------------------------------------------------------------------------------

    void toggle_button::
    enable (
    )
    {
        button_action::enable();
        btn_tooltip.enable();
    }

// ----------------------------------------------------------------------------------------

    void toggle_button::
    disable (
    )
    {
        button_action::disable();
        btn_tooltip.disable();
    }

// ----------------------------------------------------------------------------------------

    void toggle_button::
    set_tooltip_text (
        const std::string& text
    )
    {
        btn_tooltip.set_text(text);
    }

    void toggle_button::
    set_tooltip_text (
        const std::wstring& text
    )
    {
        btn_tooltip.set_text(text);
    }

    void toggle_button::
    set_tooltip_text (
        const dlib::ustring& text
    )
    {
        btn_tooltip.set_text(text);
    }

// ----------------------------------------------------------------------------------------

    const std::string toggle_button::
    tooltip_text (
    ) const
    {
        return btn_tooltip.text();
    }

    const std::wstring toggle_button::
    tooltip_wtext (
    ) const
    {
        return btn_tooltip.wtext();
    }

    const dlib::ustring toggle_button::
    tooltip_utext (
    ) const
    {
        return btn_tooltip.utext();
    }

// ----------------------------------------------------------------------------------------

    void toggle_button::
    set_main_font (
        const shared_ptr_thread_safe<font>& f
    )
    {
        auto_mutex M(m);
        mfont = f;
        set_name(name_);
    }

// ----------------------------------------------------------------------------------------

    void toggle_button::
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

    void toggle_button::
    set_name (
        const std::string& name
    )
    {
        set_name(convert_mbstring_to_wstring(name));
    }

    void toggle_button::
    set_name (
        const std::wstring& name
    )
    {
        set_name(convert_wstring_to_utf32(name));
    }

    void toggle_button::
    set_name (
        const dlib::ustring& name
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
        
        parent.invalidate_rectangle(rect+old);
    }

// ----------------------------------------------------------------------------------------

    const std::string toggle_button::
    name (
    ) const
    {
        return convert_wstring_to_mbstring(wname());
    }

    const std::wstring toggle_button::
    wname (
    ) const
    {
        return convert_utf32_to_wstring(uname());
    }

    const dlib::ustring toggle_button::
    uname (
    ) const
    {
        auto_mutex M(m);
        dlib::ustring temp = name_;
        // do this to get rid of any reference counting that may be present in 
        // the std::string implementation.
        temp[0] = name_[0];
        return temp;
    }

// ----------------------------------------------------------------------------------------

    void toggle_button::
    on_button_up (
        bool mouse_over
    )
    {
        if (mouse_over)                
        {
            checked = !checked;
            // this is a valid toggle_button click
            if (event_handler.is_set())
                event_handler();
            else if (event_handler_self.is_set())
                event_handler_self(*this);
        }
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // label object methods  
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    void label::
    draw (
        const canvas& c
    ) const
    {
        rectangle area = rect.intersect(c);
        if (area.is_empty() || text_.size() == 0)
            return;

        using namespace std;
        unsigned char r = text_color_.red;
        unsigned char g = text_color_.green;
        unsigned char b = text_color_.blue;
        if (!enabled)
        {
            r = 128;
            g = 128;
            b = 128;
        }

        rectangle text_rect(rect);

        string::size_type first, last;
        first = 0;
        last = text_.find_first_of('\n');
        mfont->draw_string(c,text_rect,text_,rgb_pixel(r,g,b),first,last);

        while (last != string::npos)
        {
            first = last+1;
            last = text_.find_first_of('\n',first);
            text_rect.set_top(text_rect.top()+mfont->height());
            mfont->draw_string(c,text_rect,text_,rgb_pixel(r,g,b),first,last);
        }
    }

// ----------------------------------------------------------------------------------------

    void label::
    set_main_font (
        const shared_ptr_thread_safe<font>& f
    )
    {
        auto_mutex M(m);
        mfont = f;
        set_text(text_);
    }

// ----------------------------------------------------------------------------------------


    void label::
    set_text (
        const std::string& text
    )
    {
        set_text(convert_mbstring_to_wstring(text));
    }

    void label::
    set_text (
        const std::wstring& text
    )
    {
        set_text(convert_wstring_to_utf32(text));
    }

    void label::
    set_text (
        const dlib::ustring& text
    )
    {
        using namespace std;
        auto_mutex M(m);
        text_ = text;
        // do this to get rid of any reference counting that may be present in 
        // the std::string implementation.
        text_[0] = text[0];

        rectangle old(rect);

        unsigned long width; 
        unsigned long height;
        mfont->compute_size(text,width,height);

        rect.set_right(rect.left() + width - 1); 
        rect.set_bottom(rect.top() + height - 1);

        parent.invalidate_rectangle(rect+old);
    }

// ----------------------------------------------------------------------------------------

    const std::string label::
    text (
    ) const
    {
        return convert_wstring_to_mbstring(wtext());
    }

    const std::wstring label::
    wtext (
    ) const
    {
        return convert_utf32_to_wstring(utext());
    }

    const dlib::ustring label::
    utext (
    ) const
    {
        auto_mutex M(m);
        dlib::ustring temp = text_;
        // do this to get rid of any reference counting that may be present in 
        // the std::string implementation.
        temp[0] = text_[0];
        return temp;
    }

// ----------------------------------------------------------------------------------------

    void label::
    set_text_color (
        const rgb_pixel color
    )
    {
        m.lock();
        text_color_ = color;
        parent.invalidate_rectangle(rect);
        m.unlock();
    }

// ----------------------------------------------------------------------------------------

    const rgb_pixel label::
    text_color (
    ) const
    {
        auto_mutex M(m);
        return text_color_;
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // text_field object methods  
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    rectangle text_field::
    get_text_rect (
    ) const
    {
        // figure out where the text string should appear        
        unsigned long vertical_pad = (rect.height() - mfont->height())/2+1;

        rectangle text_rect;
        text_rect.set_left(rect.left()+style->get_padding(*mfont));
        text_rect.set_top(rect.top()+vertical_pad);
        text_rect.set_right(rect.right()-style->get_padding(*mfont));
        text_rect.set_bottom(text_rect.top()+mfont->height()-1);
        return text_rect;
    }

// ----------------------------------------------------------------------------------------

    void text_field::
    enable (
    )
    {
        drawable::enable();
        right_click_menu.enable();
    }

// ----------------------------------------------------------------------------------------

    void text_field::
    give_input_focus (
    )
    {
        auto_mutex M(m);
        has_focus = true;
        cursor_visible = true;
        parent.invalidate_rectangle(rect);
        t.start();
    }

// ----------------------------------------------------------------------------------------

    void text_field::
    select_all_text (
    )
    {
        auto_mutex M(m);
        on_select_all();
    }

// ----------------------------------------------------------------------------------------

    void text_field::
    on_cut (
    )
    {
        on_copy();
        on_delete_selected();
    }

// ----------------------------------------------------------------------------------------

    void text_field::
    on_copy (
    )
    {
        if (highlight_start <= highlight_end)
        {
            put_on_clipboard(text_.substr(highlight_start, highlight_end-highlight_start+1));
        }
    }

// ----------------------------------------------------------------------------------------

    void text_field::
    on_paste (
    )
    {
        ustring temp_str;
        get_from_clipboard(temp_str);

        // If this is a multi line string then just take the first line.
        ustring::size_type pos = temp_str.find_first_of('\n');
        if (pos != ustring::npos)
        {
            temp_str = temp_str.substr(0,pos);
        }

        if (highlight_start <= highlight_end)
        {
            text_ = text_.substr(0,highlight_start) + temp_str +
                text_.substr(highlight_end+1,text_.size()-highlight_end-1);
            move_cursor(highlight_start+temp_str.size());
            highlight_start = 0;
            highlight_end = -1;
            parent.invalidate_rectangle(rect);
            on_no_text_selected();

            // send out the text modified event
            if (text_modified_handler.is_set())
                text_modified_handler();
        }
        else
        {
            text_ = text_.substr(0,cursor_pos) + temp_str +
                text_.substr(cursor_pos,text_.size()-cursor_pos);
            move_cursor(cursor_pos+temp_str.size());

            // send out the text modified event
            if (temp_str.size() != 0 && text_modified_handler.is_set())
                text_modified_handler();
        }
    }

// ----------------------------------------------------------------------------------------

    void text_field::
    on_select_all (
    )
    {
        move_cursor(static_cast<long>(text_.size()));
        highlight_start = 0;
        highlight_end = static_cast<long>(text_.size()-1);
        if (highlight_start <= highlight_end)
            on_text_is_selected();
        parent.invalidate_rectangle(rect);
    }

// ----------------------------------------------------------------------------------------

    void text_field::
    on_delete_selected (
    )
    {
        if (highlight_start <= highlight_end)
        {
            text_ = text_.erase(highlight_start,highlight_end-highlight_start+1);
            move_cursor(highlight_start);
            highlight_start = 0;
            highlight_end = -1;

            on_no_text_selected();
            // send out the text modified event
            if (text_modified_handler.is_set())
                text_modified_handler();

            parent.invalidate_rectangle(rect);
        }
    }

// ----------------------------------------------------------------------------------------

    void text_field::
    on_text_is_selected (
    )
    {
        right_click_menu.menu().enable_menu_item(0);
        right_click_menu.menu().enable_menu_item(1);
        right_click_menu.menu().enable_menu_item(3);
    }

// ----------------------------------------------------------------------------------------

    void text_field::
    on_no_text_selected (
    )
    {
        right_click_menu.menu().disable_menu_item(0);
        right_click_menu.menu().disable_menu_item(1);
        right_click_menu.menu().disable_menu_item(3);
    }

// ----------------------------------------------------------------------------------------

    void text_field::
    show (
    )
    {
        drawable::show();
        right_click_menu.show();
    }

// ----------------------------------------------------------------------------------------

    void text_field::
    disable (
    )
    {
        auto_mutex M(m);
        drawable::disable();
        t.stop();
        has_focus = false;
        cursor_visible = false;
        right_click_menu.disable();
    }

// ----------------------------------------------------------------------------------------

    void text_field::
    hide (
    )
    {
        auto_mutex M(m);
        drawable::hide();
        t.stop();
        has_focus = false;
        cursor_visible = false;
    }

// ----------------------------------------------------------------------------------------

    void text_field::
    set_main_font (
        const shared_ptr_thread_safe<font>& f
    )
    {
        auto_mutex M(m);
        mfont = f;
        // adjust the height of this text field so that it is appropriate for the current
        // font size
        rect.set_bottom(rect.top() + mfont->height()+ (style->get_padding(*mfont))*2);
        set_text(text_);
        right_click_menu.set_rect(get_text_rect());
    }

// ----------------------------------------------------------------------------------------

    void text_field::
    draw (
        const canvas& c
    ) const
    {
        rectangle area = rect.intersect(c);
        if (area.is_empty())
            return;
       
        style->draw_text_field(c,rect,get_text_rect(), enabled, *mfont, text_, cursor_x, text_pos,
                               text_color_, bg_color_, has_focus, cursor_visible, highlight_start,
                               highlight_end);
    }

// ----------------------------------------------------------------------------------------

    void text_field::
    set_text (
        const std::string& text
    )
    {
        set_text(convert_mbstring_to_wstring(text));
    }

    void text_field::
    set_text (
        const std::wstring& text
    )
    {
        set_text(convert_wstring_to_utf32(text));
    }

    void text_field::
    set_text (
        const dlib::ustring& text
    )
    {
        DLIB_ASSERT ( text.find_first_of('\n') == std::string::npos ,
                "\tvoid text_field::set_text()"
                << "\n\ttext:  " << narrow(text) );
        auto_mutex M(m);
        // do this to get rid of any reference counting that may be present in 
        // the std::string implementation.
        text_ = text.c_str();
                
        move_cursor(0);

        highlight_start = 0;
        highlight_end = -1;
        
        parent.invalidate_rectangle(rect);
    }

// ----------------------------------------------------------------------------------------

    const std::string text_field::
    text (
    ) const
    {
        std::string temp = convert_wstring_to_mbstring(wtext());
        return temp;
    }

    const std::wstring text_field::
    wtext (
    ) const
    {
        std::wstring temp = convert_utf32_to_wstring(utext());
        return temp;
    }
    
    const dlib::ustring text_field::
    utext (
    ) const
    {
        auto_mutex M(m);
        // do this to get rid of any reference counting that may be present in 
        // the dlib::ustring implementation.
        dlib::ustring temp = text_.c_str();
        return temp;
    }

// ----------------------------------------------------------------------------------------

    void text_field::
    set_width (
        unsigned long width
    )
    {        
        auto_mutex M(m);
        if (width < style->get_padding(*mfont)*2)
            return;

        rectangle old(rect);

        rect.set_right(rect.left() + width - 1); 

        right_click_menu.set_rect(get_text_rect());
        parent.invalidate_rectangle(rect+old);
    }

// ----------------------------------------------------------------------------------------

    void text_field::
    set_pos (
        long x,
        long y
    )
    {
        drawable::set_pos(x,y);
        right_click_menu.set_rect(get_text_rect());
    }

// ----------------------------------------------------------------------------------------

    void text_field::
    set_background_color (
        const rgb_pixel color
    )
    {
        auto_mutex M(m);
        bg_color_ = color;
        parent.invalidate_rectangle(rect);
    }

// ----------------------------------------------------------------------------------------

    const rgb_pixel text_field::
    background_color (
    ) const
    {
        auto_mutex M(m);
        return bg_color_;
    }

// ----------------------------------------------------------------------------------------

    void text_field::
    set_text_color (
        const rgb_pixel color
    )
    {
        auto_mutex M(m);
        text_color_ = color;
        parent.invalidate_rectangle(rect);
    }

// ----------------------------------------------------------------------------------------

    const rgb_pixel text_field::
    text_color (
    ) const
    {
        auto_mutex M(m);
        return text_color_;
    }

// ----------------------------------------------------------------------------------------

    void text_field::
    on_mouse_move (
        unsigned long state,
        long x,
        long y
    )
    {
        if (!enabled || hidden || !has_focus)
        {
            return;
        }

        if (state & base_window::LEFT)
        {
            if (highlight_start <= highlight_end)
            {
                if (highlight_start == cursor_pos)
                    shift_pos = highlight_end + 1;
                else
                    shift_pos = highlight_start;
            }

            unsigned long new_pos = mfont->compute_cursor_pos(get_text_rect(),text_,x,y,text_pos);
            if (static_cast<long>(new_pos) != cursor_pos)
            {
                move_cursor(new_pos);
                parent.invalidate_rectangle(rect);
            }
        }
        else if (shift_pos != -1)
        {
            shift_pos = -1;
        }

    }

// ----------------------------------------------------------------------------------------

    void text_field::
    on_mouse_up (
        unsigned long btn,
        unsigned long,
        long ,
        long 
    )
    {
        if (!enabled || hidden)
            return;

        if (btn == base_window::LEFT)
            shift_pos = -1;
    }

// ----------------------------------------------------------------------------------------

    void text_field::
    on_mouse_down (
        unsigned long btn,
        unsigned long state,
        long x,
        long y,
        bool double_clicked 
    )
    {
        using namespace std;
        if (!enabled || hidden || btn != (unsigned long)base_window::LEFT)
            return;

        if (rect.contains(x,y))
        {
            has_focus = true;
            cursor_visible = true;
            parent.invalidate_rectangle(rect);
            t.start();

            if (double_clicked)
            {
                // highlight the double clicked word
                string::size_type first, last;
                const ustring ustr = convert_utf8_to_utf32(std::string(" \t\n"));
                first = text_.substr(0,cursor_pos).find_last_of(ustr.c_str());
                last = text_.find_first_of(ustr.c_str(),cursor_pos);
                long f = static_cast<long>(first);
                long l = static_cast<long>(last);
                if (first == string::npos)
                    f = -1;
                if (last == string::npos)
                    l = static_cast<long>(text_.size());

                ++f;
                --l;

                move_cursor(l+1);
                highlight_start = f;
                highlight_end = l;
                on_text_is_selected();
            }
            else
            {
                if (state & base_window::SHIFT)
                {
                    if (highlight_start <= highlight_end)
                    {
                        if (highlight_start == cursor_pos)
                            shift_pos = highlight_end + 1;
                        else
                            shift_pos = highlight_start;
                    }
                    else
                    {
                        shift_pos = cursor_pos;
                    }
                }

                bool at_end = false;
                if (cursor_pos == 0 || cursor_pos == static_cast<long>(text_.size()))
                    at_end = true;
                const long old_pos = cursor_pos;

                unsigned long new_pos = mfont->compute_cursor_pos(get_text_rect(),text_,x,y,text_pos);
                if (static_cast<long>(new_pos) != cursor_pos)
                {
                    move_cursor(new_pos);
                    parent.invalidate_rectangle(rect);
                }
                shift_pos = cursor_pos;

                if (at_end && cursor_pos == old_pos)
                {
                    highlight_start = 0;
                    highlight_end = -1;
                    on_no_text_selected();
                    parent.invalidate_rectangle(rect);
                }
            }

        }
        else if (has_focus)
        {
            t.stop();
            has_focus = false;
            cursor_visible = false;
            shift_pos = -1;
            highlight_start = 0;
            highlight_end = -1;
            on_no_text_selected();

            if (focus_lost_handler.is_set())
                focus_lost_handler();
            parent.invalidate_rectangle(rect);
        }
    }

// ----------------------------------------------------------------------------------------

    void text_field::
    on_keydown (
        unsigned long key,
        bool is_printable,
        unsigned long state
    )
    {
        // If the right click menu is up then we don't want to do anything with
        // the keyboard ourselves.  Let the popup menu use the keyboard for now.
        if (right_click_menu.popup_menu_visible())
            return;

        const ustring space_str = convert_utf8_to_utf32(std::string(" \t\n"));
        const bool shift = (state&base_window::KBD_MOD_SHIFT) != 0;
        const bool ctrl = (state&base_window::KBD_MOD_CONTROL) != 0;
        if (has_focus && enabled && !hidden)
        {
            if (shift && is_printable == false)
            {
                if (shift_pos == -1)
                {
                    if (highlight_start <= highlight_end)
                    {
                        if (highlight_start == cursor_pos)
                            shift_pos = highlight_end + 1;
                        else
                            shift_pos = highlight_start;
                    }
                    else
                    {
                        shift_pos = cursor_pos;
                    }
                }
            }
            else
            {
                shift_pos = -1;
            }

            if (key == base_window::KEY_LEFT ||
                key == base_window::KEY_UP)
            {
                if (cursor_pos != 0)
                {
                    unsigned long new_pos;
                    if (ctrl)
                    {
                        // find the first non-whitespace to our left
                        std::string::size_type pos = text_.find_last_not_of(space_str.c_str(),cursor_pos);
                        if (pos != std::string::npos)
                        {
                            pos = text_.find_last_of(space_str.c_str(),pos);
                            if (pos != std::string::npos)
                                new_pos = static_cast<unsigned long>(pos);
                            else
                                new_pos = 0;
                        }
                        else
                        {
                            new_pos = 0;
                        }
                    }
                    else
                    {
                        new_pos = cursor_pos-1;
                    }

                    move_cursor(new_pos);
                }
                else if (shift_pos == -1)
                {
                    highlight_start = 0;
                    highlight_end = -1;
                    on_no_text_selected();
                    parent.invalidate_rectangle(rect);
                }

            }
            else if (key == base_window::KEY_RIGHT ||
                key == base_window::KEY_DOWN)
            {
                if (cursor_pos != static_cast<long>(text_.size()))
                {
                    unsigned long new_pos;
                    if (ctrl)
                    {
                        // find the first non-whitespace to our left
                        std::string::size_type pos = text_.find_first_not_of(space_str.c_str(),cursor_pos);
                        if (pos != std::string::npos)
                        {
                            pos = text_.find_first_of(space_str.c_str(),pos);
                            if (pos != std::string::npos)
                                new_pos = static_cast<unsigned long>(pos+1);
                            else
                                new_pos = static_cast<unsigned long>(text_.size());
                        }
                        else
                        {
                            new_pos = static_cast<unsigned long>(text_.size());
                        }
                    }
                    else
                    {
                        new_pos = cursor_pos+1;
                    }

                    move_cursor(new_pos);
                }
                else if (shift_pos == -1)
                {
                    highlight_start = 0;
                    highlight_end = -1;
                    on_no_text_selected();
                    parent.invalidate_rectangle(rect);
                }
            }
            else if (is_printable)
            {
                if (ctrl)
                {
                    if (key == 'a')
                    {
                        on_select_all();
                    }
                    else if (key == 'c')
                    {
                        on_copy();
                    }
                    else if (key == 'v')
                    {
                        on_paste();
                    }
                    else if (key == 'x')
                    {
                        on_cut();
                    }
                }
                else if (key != '\n')
                {
                    if (highlight_start <= highlight_end)
                    {
                        text_ = text_.substr(0,highlight_start) + static_cast<unichar>(key) +
                            text_.substr(highlight_end+1,text_.size()-highlight_end-1);
                        move_cursor(highlight_start+1);
                        highlight_start = 0;
                        highlight_end = -1;
                        on_no_text_selected();
                        parent.invalidate_rectangle(rect);
                    }
                    else
                    {
                        text_ = text_.substr(0,cursor_pos) + static_cast<unichar>(key) +
                            text_.substr(cursor_pos,text_.size()-cursor_pos);
                        move_cursor(cursor_pos+1);
                    }
                    unsigned long height;
                    mfont->compute_size(text_,text_width,height,text_pos);

                    // send out the text modified event
                    if (text_modified_handler.is_set())
                        text_modified_handler();
                }
                else if (key == '\n')
                {
                    if (enter_key_handler.is_set())
                        enter_key_handler();
                }
            }
            else if (key == base_window::KEY_BACKSPACE)
            {                
                // if something is highlighted then delete that
                if (highlight_start <= highlight_end)
                {
                    on_delete_selected();
                }
                else if (cursor_pos != 0)
                {
                    text_ = text_.erase(cursor_pos-1,1);
                    move_cursor(cursor_pos-1);

                    // send out the text modified event
                    if (text_modified_handler.is_set())
                        text_modified_handler();
                }
                else
                {
                    // do this just so it repaints itself right
                    move_cursor(cursor_pos);
                }
                unsigned long height;
                mfont->compute_size(text_,text_width,height,text_pos);
                parent.invalidate_rectangle(rect);
            }
            else if (key == base_window::KEY_DELETE)
            {
                // if something is highlighted then delete that
                if (highlight_start <= highlight_end)
                {
                    on_delete_selected();
                }
                else if (cursor_pos != static_cast<long>(text_.size()))
                {
                    text_ = text_.erase(cursor_pos,1);

                    // send out the text modified event
                    if (text_modified_handler.is_set())
                        text_modified_handler();
                }
                else
                {
                    // do this just so it repaints itself right
                    move_cursor(cursor_pos);
                }
                parent.invalidate_rectangle(rect);

                unsigned long height;
                mfont->compute_size(text_,text_width,height,text_pos);
            }
            else if (key == base_window::KEY_HOME)
            {
                move_cursor(0);
                if (shift_pos == -1)
                {
                    highlight_start = 0;
                    highlight_end = -1;
                    on_no_text_selected();
                    parent.invalidate_rectangle(rect);
                }
            }
            else if (key == base_window::KEY_END)
            {
                move_cursor(static_cast<unsigned long>(text_.size()));
                if (shift_pos == -1)
                {
                    highlight_start = 0;
                    highlight_end = -1;
                    on_no_text_selected();
                    parent.invalidate_rectangle(rect);
                }
            }
            cursor_visible = true;
            recent_movement = true;

        }
    }

// ---------------------------------------------------------------------------------------- 

    void text_field::
    on_string_put(
        const std::wstring &str
    )
    {
        if (has_focus && enabled && !hidden){
            ustring ustr = convert_wstring_to_utf32(str);
            if (highlight_start <= highlight_end)
            {
                text_ = text_.substr(0,highlight_start) + ustr +
                    text_.substr(highlight_end+1,text_.size()-highlight_end-1);
                move_cursor(highlight_start+ustr.size());
                highlight_start = 0;
                highlight_end = -1;
                on_no_text_selected();
                parent.invalidate_rectangle(rect);
            }
            else
            {
                text_ = text_.substr(0,cursor_pos) + ustr +
                    text_.substr(cursor_pos,text_.size()-cursor_pos);
                move_cursor(cursor_pos+ustr.size());
            }
            unsigned long height;
            mfont->compute_size(text_,text_width,height,text_pos);

            // send out the text modified event
            if (text_modified_handler.is_set())
                text_modified_handler();
        }
    }
    
// ----------------------------------------------------------------------------------------

    void text_field::
    move_cursor (
        unsigned long pos
    )
    {
        using namespace std;
        const long old_cursor_pos = cursor_pos;

        if (text_pos >= pos)
        {
            // the cursor should go all the way to the left side of the text
            if (pos >= 6)
                text_pos = pos-6;
            else
                text_pos = 0;

            cursor_pos = pos;    
            unsigned long height;
            mfont->compute_size(text_,text_width,height,text_pos);

            unsigned long width;
            unsigned long new_x = style->get_padding(*mfont);
            if (static_cast<long>(cursor_pos)-1 >= static_cast<long>(text_pos))
            {
                mfont->compute_size(text_,width,height,text_pos,cursor_pos-1);
                if (cursor_pos != 0)
                    new_x += width - mfont->right_overflow();
            }

            cursor_x = new_x;
        }
        else
        {
            unsigned long height;
            unsigned long width;
            mfont->compute_size(text_,width,height,text_pos,pos-1);

            unsigned long new_x = style->get_padding(*mfont) + 
                width - mfont->right_overflow();

            // move the text to the left if necessary
            if (new_x + 4 > rect.width())
            {
                while (new_x > rect.width() - rect.width()/5)
                {
                    new_x -= (*mfont)[text_[text_pos]].width();
                    ++text_pos;
                }
            }

            cursor_x = new_x;
            cursor_pos = pos;     
            mfont->compute_size(text_,text_width,height,text_pos);
        }

        parent.set_im_pos(rect.left()+cursor_x, rect.top());

        if (old_cursor_pos != cursor_pos)
        {
            if (shift_pos != -1)
            {
                highlight_start = std::min(shift_pos,cursor_pos);
                highlight_end = std::max(shift_pos,cursor_pos)-1;
            }
            else
            {
                highlight_start = 0;
                highlight_end = -1;
            }

            if (highlight_start > highlight_end)
                on_no_text_selected();
            else
                on_text_is_selected();

            recent_movement = true;
            cursor_visible = true;
            parent.invalidate_rectangle(rect);
        }
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
//             tabbed_display object methods  
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    tabbed_display::
    tabbed_display(  
        drawable_window& w
    ) : 
        drawable(w,MOUSE_CLICK),
        selected_tab_(0),
        left_pad(6),
        right_pad(4),
        top_pad(3),
        bottom_pad(3)
    {
        rect = rectangle(0,0,40,mfont->height()+top_pad+bottom_pad);
        enable_events();
        tabs.set_max_size(1);
        tabs.set_size(1);
    }

// ----------------------------------------------------------------------------------------

    tabbed_display::
    ~tabbed_display(
    )
    {
        disable_events();
        parent.invalidate_rectangle(rect); 
    }

// ----------------------------------------------------------------------------------------

    void tabbed_display::
    set_pos (
        long x,
        long y
    )
    {
        auto_mutex M(m);
        // we have to adjust the positions of all the tab rectangles
        const long xdelta = rect.left() - x;
        const long ydelta = rect.top() - y;
        for (unsigned long i = 0; i < tabs.size(); ++i)
        {
            tabs[i].rect.set_left(tabs[i].rect.left()+xdelta);
            tabs[i].rect.set_right(tabs[i].rect.right()+xdelta);

            tabs[i].rect.set_top(tabs[i].rect.top()+ydelta);
            tabs[i].rect.set_bottom(tabs[i].rect.bottom()+ydelta);


            // adjust the position of the group associated with this tab if it exists
            if (tabs[i].group)
                tabs[i].group->set_pos(x+3, y+mfont->height()+top_pad+bottom_pad+3);
        }
        drawable::set_pos(x,y);
        recompute_tabs();
    }

// ----------------------------------------------------------------------------------------

    void tabbed_display::
    fit_to_contents (
    )
    {
        auto_mutex M(m);
        rectangle new_rect;
        point p(rect.left(),rect.top());
        new_rect += p;

        for (unsigned long i = 0; i < tabs.size(); ++i)
        {
            if (tabs[i].group)
            {
                tabs[i].group->fit_to_contents();
                new_rect += tabs[i].group->get_rect();
            }
        }

        // and give the new rect an additional 4 pixels on the bottom and right sides
        // so that the contents to hit the edge of the tabbed display
        new_rect = resize_rect(new_rect, new_rect.width()+4, new_rect.height()+4);

        parent.invalidate_rectangle(new_rect+rect);
        rect = new_rect;
    }

// ----------------------------------------------------------------------------------------

    void tabbed_display::
    set_size (
        unsigned long width,
        unsigned long height
    )
    {
        auto_mutex M(m);
        rectangle old(rect);
        const long x = rect.left();
        const long y = rect.top();
        rect.set_right(x+width-1);
        rect.set_bottom(y+height-1);

        recompute_tabs();

        parent.invalidate_rectangle(rect+old);
    }

// ----------------------------------------------------------------------------------------

    void tabbed_display::
    set_number_of_tabs (
        unsigned long num
    )
    {
        auto_mutex M(m);

        DLIB_ASSERT ( num > 0 ,
                "\tvoid tabbed_display::set_number_of_tabs()"
                << "\n\tnum:  " << num );

        tabs.set_max_size(num);
        tabs.set_size(num);

        selected_tab_ = 0;

        recompute_tabs();
        parent.invalidate_rectangle(rect);
    }

// ----------------------------------------------------------------------------------------

    unsigned long tabbed_display::
    number_of_tabs (
    ) const
    {
        auto_mutex M(m);
        return tabs.size();
    }

// ----------------------------------------------------------------------------------------

    const std::string tabbed_display::
    tab_name (
        unsigned long idx
    ) const
    {
        return convert_wstring_to_mbstring(tab_wname(idx));
    }
    
    const std::wstring tabbed_display::
    tab_wname (
        unsigned long idx
    ) const
    {
        return convert_utf32_to_wstring(tab_uname(idx));
    }
    
    const dlib::ustring& tabbed_display::
    tab_uname (
        unsigned long idx
    ) const
    {
        auto_mutex M(m);

        DLIB_ASSERT ( idx < number_of_tabs() ,
                "\tvoid tabbed_display::tab_name()"
                << "\n\tidx:              " << idx 
                << "\n\tnumber_of_tabs(): " << number_of_tabs() );

        return tabs[idx].name;
    }

// ----------------------------------------------------------------------------------------

    void tabbed_display::
    set_tab_name (
        unsigned long idx,
        const std::string& new_name
    )
    {
        set_tab_name(idx, convert_mbstring_to_wstring(new_name));
    }

    void tabbed_display::
    set_tab_name (
        unsigned long idx,
        const std::wstring& new_name
    )
    {
        set_tab_name(idx, convert_wstring_to_utf32(new_name));
    }

    void tabbed_display::
    set_tab_name (
        unsigned long idx,
        const dlib::ustring& new_name
    )
    {
        auto_mutex M(m);


        DLIB_ASSERT ( idx < number_of_tabs() ,
                "\tvoid tabbed_display::set_tab_name()"
                << "\n\tidx:              " << idx 
                << "\n\tnumber_of_tabs(): " << number_of_tabs() );


        tabs[idx].name = new_name;
        // do this so that there isn't any reference counting going on
        tabs[idx].name[0] = tabs[idx].name[0];
        unsigned long height;
        mfont->compute_size(new_name,tabs[idx].width,height);


        recompute_tabs();

        parent.invalidate_rectangle(rect);
    }

// ----------------------------------------------------------------------------------------

    void tabbed_display::
    on_mouse_down (
        unsigned long btn,
        unsigned long,
        long x,
        long y,
        bool 
    )
    {
        if (rect.contains(x,y) && btn == base_window::LEFT && enabled && !hidden)
        {
            rectangle temp = rect;
            const long offset = mfont->height() + bottom_pad + top_pad;
            temp.set_bottom(rect.top()+offset);
            if (temp.contains(x,y))
            {
                // now we have to figure out which tab was clicked
                for (unsigned long i = 0; i < tabs.size(); ++i)
                {
                    if (selected_tab_ != i && tabs[i].rect.contains(x,y) &&
                        tabs[selected_tab_].rect.contains(x,y) == false)
                    {
                        unsigned long old_idx = selected_tab_;
                        selected_tab_ = i;
                        recompute_tabs();
                        parent.invalidate_rectangle(temp);

                        // adjust the widget_group objects for these tabs if they exist
                        if (tabs[i].group)
                            tabs[i].group->show();
                        if (tabs[old_idx].group)
                            tabs[old_idx].group->hide();

                        if (event_handler.is_set())
                            event_handler(i,old_idx);
                        break;
                    }
                }
            }
        }
    }

// ----------------------------------------------------------------------------------------

    void tabbed_display::
    set_tab_group (
        unsigned long idx,
        widget_group& group
    )
    {
        auto_mutex M(m);

        DLIB_ASSERT ( idx < number_of_tabs() ,
                "\tvoid tabbed_display::set_tab_group()"
                << "\n\tidx:              " << idx 
                << "\n\tnumber_of_tabs(): " << number_of_tabs() );


        tabs[idx].group = &group;
        group.set_pos(rect.left()+3,rect.top()+mfont->height()+top_pad+bottom_pad+2);
        if (idx == selected_tab_)
            group.show();
        else
            group.hide();
    }

// ----------------------------------------------------------------------------------------

    void tabbed_display::
    disable (
    )
    {
        auto_mutex M(m);
        if (tabs[selected_tab_].group)
            tabs[selected_tab_].group->disable();
        drawable::disable();
    }

// ----------------------------------------------------------------------------------------

    void tabbed_display::
    enable (
    )
    {
        auto_mutex M(m);
        if (tabs[selected_tab_].group)
            tabs[selected_tab_].group->enable();
        drawable::enable();
    }

// ----------------------------------------------------------------------------------------

    void tabbed_display::
    hide (
    )
    {
        auto_mutex M(m);
        if (tabs[selected_tab_].group)
            tabs[selected_tab_].group->hide();
        drawable::hide();
    }

// ----------------------------------------------------------------------------------------

    void tabbed_display::
    show (
    )
    {
        auto_mutex M(m);
        if (tabs[selected_tab_].group)
            tabs[selected_tab_].group->show();
        drawable::show();
    }

// ----------------------------------------------------------------------------------------

    void tabbed_display::
    draw (
        const canvas& c
    ) const
    {
        rectangle area = rect.intersect(c);
        if (area.is_empty())
            return;

        // draw the main border first
        rectangle main_box(rect.left(),rect.top()+mfont->height()+top_pad+bottom_pad,rect.right(),rect.bottom());
        draw_button_up(c,main_box);
        draw_pixel(c,point(main_box.right()-1,main_box.top()),rgb_pixel(128,128,128));

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

        // draw the tabs
        for (unsigned long i = 0; i < tabs.size(); ++i)
        {
            if (selected_tab_ != i)
                draw_tab(tabs[i].rect,c);

            // draw the name string
            rectangle temp = tabs[i].rect;
            temp.set_top(temp.top()+top_pad);
            temp.set_bottom(temp.bottom()+bottom_pad);
            temp.set_left(temp.left()+left_pad);
            temp.set_right(temp.right()+right_pad);
            mfont->draw_string(c,temp,tabs[i].name,color);
        }
        draw_tab(tabs[selected_tab_].rect,c);
        draw_line(c,
            point(tabs[selected_tab_].rect.left()+1,
            tabs[selected_tab_].rect.bottom()),
            point(tabs[selected_tab_].rect.right()-2,
            tabs[selected_tab_].rect.bottom()),
            rgb_pixel(212,208,200));
    }

// ----------------------------------------------------------------------------------------

    void tabbed_display::
    draw_tab (
        const rectangle& tab,
        const canvas& c
    ) const
    {
        const rgb_pixel white(255,255,255);
        const rgb_pixel background(212,208,200);
        const rgb_pixel dark_gray(64,64,64);
        const rgb_pixel gray(128,128,128);
        draw_line(c,point(tab.left(),tab.top()+2),point(tab.left(),tab.bottom()),white);
        draw_line(c,point(tab.left()+1,tab.top()+2),point(tab.left()+1,tab.bottom()),background);
        draw_line(c,point(tab.right(),tab.top()+2),point(tab.right(),tab.bottom()),dark_gray);
        draw_line(c,point(tab.right()-1,tab.top()+2),point(tab.right()-1,tab.bottom()),gray);
        draw_line(c,point(tab.left()+2,tab.top()),point(tab.right()-2,tab.top()),white);
        draw_pixel(c,point(tab.left()+1,tab.top()+1),white);
        draw_pixel(c,point(tab.right()-1,tab.top()+1),dark_gray);
    }

// ----------------------------------------------------------------------------------------

    void tabbed_display::
    set_main_font (
        const shared_ptr_thread_safe<font>& f
    )
    {
        auto_mutex M(m);
        mfont = f;

        for (unsigned long i = 0; i < tabs.size(); ++i)
        {
            unsigned long height;
            mfont->compute_size(tabs[i].name,tabs[i].width,height);
        }

        recompute_tabs();
        set_pos(rect.left(), rect.top());

        parent.invalidate_rectangle(rect);
    }

// ----------------------------------------------------------------------------------------

    void tabbed_display::
    recompute_tabs (
    )
    {
        const long offset = mfont->height() + bottom_pad + top_pad;


        // figure out the size and position of all the tabs
        rectangle sel_tab_rect, other_tab;
        sel_tab_rect.set_top(rect.top());
        sel_tab_rect.set_bottom(rect.top()+offset);

        other_tab.set_top(rect.top()+2);
        other_tab.set_bottom(rect.top()+offset-1);

        long cur_x = rect.left();
        for (unsigned long i = 0; i < tabs.size(); ++i)
        {
            const unsigned long str_width = tabs[i].width;
            if (selected_tab_ != i)
            {
                other_tab.set_left(cur_x);
                cur_x += left_pad + str_width + right_pad;
                other_tab.set_right(cur_x);
                tabs[i].rect = other_tab;
                ++cur_x;

            }
            else
            {
                if (i != 0)
                    sel_tab_rect.set_left(cur_x-2);
                else
                    sel_tab_rect.set_left(cur_x);

                cur_x += left_pad + str_width + right_pad;

                if (i != tabs.size()-1)
                    sel_tab_rect.set_right(cur_x+2);
                else
                    sel_tab_rect.set_right(cur_x);
                ++cur_x;

                tabs[i].rect = sel_tab_rect;
            }
        }

        // make sure this object is wide enough
        const rectangle& last = tabs[tabs.size()-1].rect;
        const rectangle& first = tabs[0].rect;
        rect = last + rect + first;

    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
//             named_rectangle object methods  
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    named_rectangle::
    named_rectangle(  
        drawable_window& w
    ) :
        drawable(w),
        name_width(0),
        name_height(0)
    {
        make_name_fit_in_rect();
        enable_events();
    }

// ----------------------------------------------------------------------------------------

    named_rectangle::
    ~named_rectangle(
    )
    {
        disable_events();
        parent.invalidate_rectangle(rect); 
    }

// ----------------------------------------------------------------------------------------

    void named_rectangle::
    set_size (
        unsigned long width,
        unsigned long height
    )
    {
        auto_mutex M(m);
        rectangle old(rect);
        const long x = rect.left();
        const long y = rect.top();
        rect.set_right(x+width-1);
        rect.set_bottom(y+height-1);

        make_name_fit_in_rect();
        parent.invalidate_rectangle(rect+old);
    }

// ----------------------------------------------------------------------------------------

    void named_rectangle::
    wrap_around (
        const rectangle& r
    )
    {
        auto_mutex M(m);
        rectangle old(rect);
        const unsigned long pad = name_height/2;

        rect = rectangle(r.left()-pad, r.top()-name_height*4/3, r.right()+pad, r.bottom()+pad);

        make_name_fit_in_rect();
        parent.invalidate_rectangle(rect+old);
    }

// ----------------------------------------------------------------------------------------

    void named_rectangle::
    set_main_font (
        const shared_ptr_thread_safe<font>& f
    )
    {
        auto_mutex M(m);
        mfont = f;
        mfont->compute_size(name_,name_width,name_height);
        make_name_fit_in_rect();
        parent.invalidate_rectangle(rect);
    }

// ----------------------------------------------------------------------------------------

    void named_rectangle::
    make_name_fit_in_rect (
    )
    {
        // make sure the named rectangle is big enough to contain the name
        const unsigned long wtemp = mfont->height() + name_width;
        const unsigned long htemp = mfont->height() + name_height;
        if (rect.width() < wtemp)
            rect.set_right(rect.left() + wtemp - 1 );
        if (rect.height() < htemp)
            rect.set_bottom(rect.bottom() + htemp - 1 );
    }

// ----------------------------------------------------------------------------------------

    void named_rectangle::
    set_name (
        const std::string& name
    )
    {
        set_name(convert_mbstring_to_wstring(name));
    }

    void named_rectangle::
    set_name (
        const std::wstring& name
    )
    {
        set_name(convert_wstring_to_utf32(name));
    }

    void named_rectangle::
    set_name (
        const dlib::ustring& name
    )
    {
        auto_mutex M(m);
        name_ = name.c_str();
        mfont->compute_size(name_,name_width,name_height);

        make_name_fit_in_rect();
        parent.invalidate_rectangle(rect);
    }

// ----------------------------------------------------------------------------------------

    const std::string named_rectangle::
    name (
    ) const
    {
        return convert_wstring_to_mbstring(wname());
    }

    const std::wstring named_rectangle::
    wname (
    ) const
    {
        return convert_utf32_to_wstring(uname());
    }

    const dlib::ustring named_rectangle::
    uname (
    ) const
    {
        auto_mutex M(m);
        return dlib::ustring(name_.c_str());
    }

// ----------------------------------------------------------------------------------------

    void named_rectangle::
    draw (
        const canvas& c
    ) const
    {
        rectangle area = rect.intersect(c);
        if (area.is_empty())
            return;
        
        const unsigned long gap = mfont->height()/2;
        rectangle strrect = rect;
        strrect.set_left(rect.left() + gap);

        const unsigned long rtop = rect.top() + name_height/2;

        const rgb_pixel white(255,255,255);
        const rgb_pixel gray(128,128,128);

        mfont->draw_string(c,strrect,name_);
        draw_line(c,point(rect.left(), rtop),             
                  point(rect.left()+gap/2, rtop), gray);
        draw_line(c,point(rect.left(), rtop),             
                  point(rect.left(), rect.bottom()-1), gray);
        draw_line(c,point(rect.left(), rect.bottom()-1),  
                  point(rect.right()-1, rect.bottom()-1), gray);
        draw_line(c,point(rect.right()-1, rtop),          
                  point(rect.right()-1, rect.bottom()-2), gray);
        draw_line(c,point(strrect.left() + name_width + 2, rtop), 
                  point(rect.right()-1, rtop), gray);

        draw_line(c,point(strrect.left() + name_width + 2, rtop+1),   
                  point( rect.right()-2, rtop+1), white);
        draw_line(c,point(rect.right(), rtop), 
                  point(rect.right(), rect.bottom()), white);
        draw_line(c,point(rect.left(), rect.bottom()),                
                  point(rect.right(), rect.bottom()), white);
        draw_line(c,point(rect.left()+1, rtop+1), 
                  point(rect.left()+1, rect.bottom()-2), white);
        draw_line(c,point(rect.left()+1, rtop+1), 
                  point(rect.left()+gap/2, rtop+1), white);
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // class mouse_tracker
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    mouse_tracker::
    mouse_tracker(  
        drawable_window& w
    ) :
        draggable(w),
        offset(18),
        nr(w),
        x_label(w),
        y_label(w),
        click_x(-1),
        click_y(-1)
    {
        set_draggable_area(rectangle(0,0,500,500));


        x_label.set_text("x: ");
        y_label.set_text("y: ");
        nr.set_name("mouse position");


        x_label.set_pos(offset,offset);
        y_label.set_pos(x_label.get_rect().left(), x_label.get_rect().bottom()+3);

        nr.wrap_around(x_label.get_rect() + y_label.get_rect());
        rect = nr.get_rect();

        set_z_order(2000000000);
        x_label.set_z_order(2000000001);
        y_label.set_z_order(2000000001);
        nr.set_z_order(2000000001);

        enable_events();
    }

// ----------------------------------------------------------------------------------------

    mouse_tracker::
    ~mouse_tracker(
    )
    { 
        disable_events(); 
        parent.invalidate_rectangle(rect); 
    }

// ----------------------------------------------------------------------------------------

    void mouse_tracker::
    set_main_font (
        const shared_ptr_thread_safe<font>& f
    )
    {
        auto_mutex M(m);
        nr.set_main_font(f);
        x_label.set_main_font(f);
        y_label.set_main_font(f);
        mfont = f;
        nr.wrap_around(x_label.get_rect() + y_label.get_rect());
        rect = nr.get_rect();
    }

// ----------------------------------------------------------------------------------------

    void mouse_tracker::
    set_pos (
        long x,
        long y
    )
    {
        draggable::set_pos(x,y);
        nr.set_pos(x,y);
        x_label.set_pos(rect.left()+offset,rect.top()+offset);
        y_label.set_pos(x_label.get_rect().left(), x_label.get_rect().bottom()+3);
    }

// ----------------------------------------------------------------------------------------

    void mouse_tracker::
    show (
    )
    {
        draggable::show();
        nr.show();
        x_label.show();
        y_label.show();
    }

// ----------------------------------------------------------------------------------------

    void mouse_tracker::
    hide (
    )
    {
        draggable::hide();
        nr.hide();
        x_label.hide();
        y_label.hide();
    }

// ----------------------------------------------------------------------------------------

    void mouse_tracker::
    enable (
    )
    {
        draggable::enable();
        nr.enable();
        x_label.enable();
        y_label.enable();
    }

// ----------------------------------------------------------------------------------------

    void mouse_tracker::
    disable (
    )
    {
        draggable::disable();
        nr.disable();
        x_label.disable();
        y_label.disable();
    }

// ----------------------------------------------------------------------------------------

    void mouse_tracker::
    on_mouse_down (
        unsigned long btn,
        unsigned long state,
        long x,
        long y,
        bool double_clicked 
    )
    {
        draggable::on_mouse_down(btn,state,x,y,double_clicked);
        if ((state & base_window::SHIFT) && (btn == base_window::LEFT) && enabled && !hidden)
        {
            parent.invalidate_rectangle(rectangle(x,y,x,y));
            parent.invalidate_rectangle(rectangle(click_x,click_y,click_x,click_y));
            click_x = x;
            click_y = y;

            y_label.set_text("y: 0");
            x_label.set_text("x: 0");
        }
    }

// ----------------------------------------------------------------------------------------

    void mouse_tracker::
    on_mouse_move (
        unsigned long state,
        long x,
        long y
    )
    {
        if (!hidden && enabled)
        {
            parent.invalidate_rectangle(rect);
            draggable::on_mouse_move(state,x,y);

            long dx = 0;
            long dy = 0;
            if (click_x != -1)
                dx = click_x;
            if (click_y != -1)
                dy = click_y;

            sout.str("");
            sout << "y: " << y - dy;
            y_label.set_text(sout.str());

            sout.str("");
            sout << "x: " << x - dx;
            x_label.set_text(sout.str());
        }
    }

// ----------------------------------------------------------------------------------------

    void mouse_tracker::
    on_drag (
    )
    {
        nr.set_pos(rect.left(),rect.top());
        x_label.set_pos(rect.left()+offset,rect.top()+offset);
        y_label.set_pos(x_label.get_rect().left(), x_label.get_rect().bottom()+3);

        long x = 0;
        long y = 0;
        if (click_x != -1)
            x = click_x;
        if (click_y != -1)
            y = click_y;

        sout.str("");
        sout << "y: " << lasty - y;
        y_label.set_text(sout.str());

        sout.str("");
        sout << "x: " << lastx - x;
        x_label.set_text(sout.str());
    }

// ----------------------------------------------------------------------------------------

    void mouse_tracker::
    draw (
        const canvas& c
    ) const 
    { 
        fill_rect(c, rect,rgb_pixel(212,208,200));
        draw_pixel(c, point(click_x,click_y),rgb_pixel(255,0,0));
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // class list_box
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    namespace list_box_helper{
    template <typename S>
    list_box<S>::
    list_box(  
        drawable_window& w
    ) : 
        scrollable_region(w,MOUSE_WHEEL|MOUSE_CLICK),
        ms_enabled(false),
        last_selected(0)
    {
        set_vertical_scroll_increment(mfont->height());
        set_horizontal_scroll_increment(mfont->height());

        style.reset(new list_box_style_default());
        enable_events();
    }

// ----------------------------------------------------------------------------------------

    template <typename S>
    list_box<S>::
    ~list_box(
    )
    {
        disable_events();
        parent.invalidate_rectangle(rect); 
    }

// ----------------------------------------------------------------------------------------

    template <typename S>
    void list_box<S>::
    set_main_font (
        const shared_ptr_thread_safe<font>& f
    )
    {
        auto_mutex M(m);
        mfont = f;
        // recompute the sizes of all the items
        for (unsigned long i = 0; i < items.size(); ++i)
        {
            mfont->compute_size(items[i].name,items[i].width, items[i].height);
        }
        set_vertical_scroll_increment(mfont->height());
        parent.invalidate_rectangle(rect);
    }

// ----------------------------------------------------------------------------------------

    template <typename S>
    bool list_box<S>::
    is_selected (
        unsigned long index
    ) const
    {
        auto_mutex M(m);
        DLIB_ASSERT ( index < size() ,
                "\tbool list_box::is_selected(index)"
                << "\n\tindex:  " << index 
                << "\n\tsize(): " << size() );

        return items[index].is_selected;
    }

// ----------------------------------------------------------------------------------------

    template <typename S>
    void list_box<S>::
    select (
        unsigned long index 
    )
    {
        auto_mutex M(m);
        DLIB_ASSERT ( index < size() ,
                "\tvoid list_box::select(index)"
                << "\n\tindex:  " << index 
                << "\n\tsize(): " << size() );

        last_selected = index;
        items[index].is_selected = true;
        parent.invalidate_rectangle(rect);
    }

// ----------------------------------------------------------------------------------------

    template <typename S>
    void list_box<S>::
    unselect (
        unsigned long index 
    )
    {
        auto_mutex M(m);
        DLIB_ASSERT ( index < size() ,
                "\tvoid list_box::unselect(index)"
                << "\n\tindex:  " << index 
                << "\n\tsize(): " << size() );
        items[index].is_selected = false;
        parent.invalidate_rectangle(rect);
    }

// ----------------------------------------------------------------------------------------

    template <typename S>
    const S& list_box<S>::operator [] (
        unsigned long index
    ) const
    {
        auto_mutex M(m);
        DLIB_ASSERT ( index < size() ,
                "\tconst std::string& list_box::operator[](index)"
                << "\n\tindex:  " << index 
                << "\n\tsize(): " << size() );
        return items[index].name;
    }

// ----------------------------------------------------------------------------------------

    template <typename S>
    bool list_box<S>::
    multiple_select_enabled (
    ) const
    {
        auto_mutex M(m);
        return ms_enabled;
    }

// ----------------------------------------------------------------------------------------

    template <typename S>
    void list_box<S>::
    enable_multiple_select (
    ) 
    {
        auto_mutex M(m);
        ms_enabled = true;
    }

// ----------------------------------------------------------------------------------------

    template <typename S>
    void list_box<S>::
    disable_multiple_select (
    )
    {
        auto_mutex M(m);
        ms_enabled = false;
    }

// ----------------------------------------------------------------------------------------

    template <typename S>
    bool list_box<S>::
    at_start (
    ) const
    {
        auto_mutex M(m);
        return items.at_start();
    }

// ----------------------------------------------------------------------------------------

    template <typename S>
    void list_box<S>::
    reset (
    ) const
    {
        auto_mutex M(m);
        items.reset();
    }

// ----------------------------------------------------------------------------------------

    template <typename S>
    bool list_box<S>::
    current_element_valid (
    ) const
    {
        auto_mutex M(m);
        return items.current_element_valid();
    }

// ----------------------------------------------------------------------------------------

    template <typename S>
    const S &list_box<S>::
    element (
    ) const
    {
        auto_mutex M(m);
        DLIB_ASSERT ( current_element_valid() ,
                "\tconst std::string& list_box::element()"
                 );
        return items.element().name;
    }

// ----------------------------------------------------------------------------------------

    template <typename S>
    const S &list_box<S>::
    element (
    )
    {
        auto_mutex M(m);
        DLIB_ASSERT ( current_element_valid() ,
                "\tconst std::string& list_box::element()"
                 );
        return items.element().name;
    }

// ----------------------------------------------------------------------------------------

    template <typename S>
    bool list_box<S>::
    move_next (
    ) const
    {
        auto_mutex M(m);
        return items.move_next();
    }

// ----------------------------------------------------------------------------------------

    template <typename S>
    unsigned long list_box<S>::
    size (
    ) const
    {
        auto_mutex M(m);
        return items.size();
    }

// ----------------------------------------------------------------------------------------

    template <typename S>
    void list_box<S>::
    draw (
        const canvas& c
    ) const
    {
        scrollable_region::draw(c);

        rectangle area = display_rect().intersect(c);
        if (area.is_empty())
            return;

        style->draw_list_box_background(c, display_rect(), enabled);

        long y = total_rect().top();
        for (unsigned long i = 0; i < items.size(); ++i)
        {
            if (y+(long)items[i].height <= area.top())
            {
                y += items[i].height;
                continue;
            }

            rectangle r(total_rect().left(), y, display_rect().right(), y+items[i].height-1);

            style->draw_list_box_item(c,r, display_rect(), enabled, *mfont, items[i].name, items[i].is_selected);


            y += items[i].height;

            if (y > area.bottom())
                break;
        }
    }

// ----------------------------------------------------------------------------------------

    template <typename S>
    void list_box<S>::
    on_mouse_down (
        unsigned long btn,
        unsigned long state,
        long x,
        long y,
        bool is_double_click
    )
    {
        if (display_rect().contains(x,y) && btn == base_window::LEFT && enabled && !hidden )
        {
            if ( ms_enabled == false || 
                 ((!(state&base_window::CONTROL)) && !(state&base_window::SHIFT)))
            {
                items.reset();
                while (items.move_next())
                {
                    items.element().is_selected = false;
                }
            }

            y -= total_rect().top();
            long h = 0;
            for (unsigned long i = 0; i < items.size(); ++i)
            {
                h += items[i].height;
                if (h >= y)
                {
                    if (ms_enabled)
                    {
                        if (state&base_window::CONTROL)
                        {
                            items[i].is_selected = !items[i].is_selected;
                            if (items[i].is_selected)
                                last_selected = i;
                        }
                        else if (state&base_window::SHIFT)
                        {
                            // we want to select everything between (and including) the
                            // current thing clicked and last_selected.
                            const unsigned long first = std::min(i,last_selected);
                            const unsigned long last = std::max(i,last_selected);
                            for (unsigned long j = first; j <= last; ++j)
                                items[j].is_selected = true;
                        }
                        else
                        {
                            items[i].is_selected = true;
                            last_selected = i;
                            if (is_double_click && event_handler.is_set())
                                event_handler(i);
                            else if (single_click_event_handler.is_set())
                                single_click_event_handler(i);
                        }
                    }
                    else
                    {
                        items[i].is_selected = true;
                        last_selected = i;
                        if (is_double_click && event_handler.is_set())
                            event_handler(i);
                        else if (single_click_event_handler.is_set())
                            single_click_event_handler(i);
                    }

                    break;
                }
            }

            parent.invalidate_rectangle(rect);
        }
    }

// ----------------------------------------------------------------------------------------

    template <typename S>
    unsigned long list_box<S>::
    get_selected (
    ) const
    {
        auto_mutex M(m);
        DLIB_ASSERT ( multiple_select_enabled() == false,
                "\tunsigned long list_box::get_selected()"
                 );
        for (unsigned long i = 0; i < items.size(); ++i)
        {
            if (items[i].is_selected)
                return i;
        }
        return items.size();
    }
// ----------------------------------------------------------------------------------------

   // making instance of template
   template class list_box<std::string>;
   template class list_box<std::wstring>;
   template class list_box<dlib::ustring>;
   }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // function message_box()  
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    namespace message_box_helper
    {
        void box_win::
        initialize (
        )
        {
            msg.set_pos(20,20);
            msg.set_text(message);
            rectangle msg_rect = msg.get_rect();
            btn_ok.set_name("OK");
            btn_ok.set_size(60,btn_ok.height());
            if (msg_rect.width() >= 60)
                btn_ok.set_pos(msg_rect.width()/2+msg_rect.left()-btn_ok.width()/2,msg_rect.bottom()+15);
            else
                btn_ok.set_pos(20,msg_rect.bottom()+15);
            btn_ok.set_click_handler(*this,&box_win::on_click);

            rectangle size = btn_ok.get_rect() + msg_rect;
            set_size(size.right()+20,size.bottom()+20);


            show();
            set_title(title);
        }

    // ------------------------------------------------------------------------------------

        box_win::
        box_win (
            const std::string& title_,
            const std::string& message_
        ) : 
            drawable_window(false),
            title(convert_mbstring_to_wstring(title_)),
            message(convert_mbstring_to_wstring(message_)),
            msg(*this),
            btn_ok(*this)
        {
            initialize();
        }

    // ------------------------------------------------------------------------------------

        box_win::
        box_win (
            const std::wstring& title_,
            const std::wstring& message_
        ) : 
            drawable_window(false),
            title(title_),
            message(message_),
            msg(*this),
            btn_ok(*this)
        {
            initialize();
        }

    // ------------------------------------------------------------------------------------

        box_win::
        box_win (
            const dlib::ustring& title_,
            const dlib::ustring& message_
        ) : 
            drawable_window(false),
            title(convert_utf32_to_wstring(title_)),
            message(convert_utf32_to_wstring(message_)),
            msg(*this),
            btn_ok(*this)
        {
            initialize();
        }

    // ------------------------------------------------------------------------------------

        box_win::
        ~box_win (
        )
        {
            close_window();
        }

    // ------------------------------------------------------------------------------------

        void box_win::
        deleter_thread (
            void* param
        )
        {
            // The point of this extra event_handler stuff is to allow the user
            // to end the program from within the callback.  So we want to destroy the 
            // window *before* we call their callback.
            box_win& w = *static_cast<box_win*>(param);
            w.close_window();
            any_function<void()> event_handler(w.event_handler);
            delete &w;
            if (event_handler.is_set())
                event_handler(); 
        }

    // ------------------------------------------------------------------------------------

        void box_win::
        on_click (
        )
        {
            hide();
            create_new_thread(&deleter_thread,this);
        }

    // ------------------------------------------------------------------------------------

        base_window::on_close_return_code box_win::
        on_window_close (
        )
        {
            // The point of this extra event_handler stuff is to allow the user
            // to end the program within the callback.  So we want to destroy the 
            // window *before* we call their callback. 
            any_function<void()> event_handler_copy(event_handler);
            delete this;
            if (event_handler_copy.is_set())
                event_handler_copy();
            return CLOSE_WINDOW;
        }

    // ------------------------------------------------------------------------------------
    // ------------------------------------------------------------------------------------
    // ------------------------------------------------------------------------------------

        void blocking_box_win::
        initialize (
        )
        {
            msg.set_pos(20,20);
            msg.set_text(message);
            rectangle msg_rect = msg.get_rect();
            btn_ok.set_name("OK");
            btn_ok.set_size(60,btn_ok.height());
            if (msg_rect.width() >= 60)
                btn_ok.set_pos(msg_rect.width()/2+msg_rect.left()-btn_ok.width()/2,msg_rect.bottom()+15);
            else
                btn_ok.set_pos(20,msg_rect.bottom()+15);
            btn_ok.set_click_handler(*this,&blocking_box_win::on_click);

            rectangle size = btn_ok.get_rect() + msg_rect;
            set_size(size.right()+20,size.bottom()+20);


            set_title(title);
            show();
        }

    // ------------------------------------------------------------------------------------

        blocking_box_win::
        blocking_box_win (
            const std::string& title_,
            const std::string& message_
        ) : 
            drawable_window(false),
            title(convert_mbstring_to_wstring(title_)),
            message(convert_mbstring_to_wstring(message_)),
            msg(*this),
            btn_ok(*this)
        {
            initialize();
        }

    // ------------------------------------------------------------------------------------

        blocking_box_win::
        blocking_box_win (
            const std::wstring& title_,
            const std::wstring& message_
        ) : 
            drawable_window(false),
            title(title_),
            message(message_),
            msg(*this),
            btn_ok(*this)
        {
            initialize();
        }

    // ------------------------------------------------------------------------------------

        blocking_box_win::
        blocking_box_win (
            const dlib::ustring& title_,
            const dlib::ustring& message_
        ) : 
            drawable_window(false),
            title(convert_utf32_to_wstring(title_)),
            message(convert_utf32_to_wstring(message_)),
            msg(*this),
            btn_ok(*this)
        {
            initialize();
        }

    // ------------------------------------------------------------------------------------

        blocking_box_win::
        ~blocking_box_win (
        )
        { 
            close_window(); 
        }

    // ------------------------------------------------------------------------------------

        void blocking_box_win::
        on_click (
        )
        {
            close_window();
        }

    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // function open_file_box() 
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    namespace open_file_box_helper
    {
        box_win::
        box_win (
            const std::string& title,
            bool has_text_field 
        ) : 
            lbl_dirs(*this),
            lbl_files(*this),
            lbl_file_name(*this),
            lb_dirs(*this),
            lb_files(*this),
            btn_ok(*this),
            btn_cancel(*this),
            btn_root(*this),
            tf_file_name(*this)
        {
            if (has_text_field == false)
            {
                tf_file_name.hide();
                lbl_file_name.hide();
            }
            else
            {
                lbl_file_name.set_text("File: ");
            }

            cur_dir = -1;
            set_size(500,300);

            lbl_dirs.set_text("Directories:");
            lbl_files.set_text("Files:");
            btn_ok.set_name("Ok");
            btn_cancel.set_name("Cancel");
            btn_root.set_name("/");

            btn_root.set_click_handler(*this,&box_win::on_root_click);
            btn_cancel.set_click_handler(*this,&box_win::on_cancel_click);
            btn_ok.set_click_handler(*this,&box_win::on_open_click);
            lb_dirs.set_double_click_handler(*this,&box_win::on_dirs_click);
            lb_files.set_click_handler(*this,&box_win::on_files_click);
            lb_files.set_double_click_handler(*this,&box_win::on_files_double_click);


            btn_root.set_pos(5,5);

            set_sizes();
            set_title(title);

            on_root_click();

            // make it so that the file box starts out in our current working
            // directory
            std::string full_name(get_current_dir());

            while (full_name.size() > 0)
            {
                std::string::size_type pos = full_name.find_first_of("\\/");
                std::string left(full_name.substr(0,pos));
                if (pos != std::string::npos)
                    full_name = full_name.substr(pos+1);
                else
                    full_name.clear();

                if (left.size() > 0)
                    enter_folder(left); 
            }


            show();
        }

    // ------------------------------------------------------------------------------------

        box_win::
        ~box_win (
        )
        {
            close_window();
        }

    // ------------------------------------------------------------------------------------

        void box_win::
        set_sizes(
        )
        {
            unsigned long width, height;
            get_size(width,height);


            if (lbl_file_name.is_hidden())
            {
                lbl_dirs.set_pos(0,btn_root.bottom()+5);
                lb_dirs.set_pos(0,lbl_dirs.bottom());
                lb_dirs.set_size(width/2,height-lb_dirs.top()-btn_cancel.height()-10);

                lbl_files.set_pos(lb_dirs.right(),btn_root.bottom()+5);
                lb_files.set_pos(lb_dirs.right(),lbl_files.bottom());
                lb_files.set_size(width-lb_files.left(),height-lb_files.top()-btn_cancel.height()-10);

                btn_ok.set_pos(width - btn_ok.width()-25,lb_files.bottom()+5);
                btn_cancel.set_pos(btn_ok.left() - btn_cancel.width()-5,lb_files.bottom()+5);
            }
            else
            {

                lbl_dirs.set_pos(0,btn_root.bottom()+5);
                lb_dirs.set_pos(0,lbl_dirs.bottom());
                lb_dirs.set_size(width/2,height-lb_dirs.top()-btn_cancel.height()-10-tf_file_name.height());

                lbl_files.set_pos(lb_dirs.right(),btn_root.bottom()+5);
                lb_files.set_pos(lb_dirs.right(),lbl_files.bottom());
                lb_files.set_size(width-lb_files.left(),height-lb_files.top()-btn_cancel.height()-10-tf_file_name.height());

                lbl_file_name.set_pos(lb_files.left(), lb_files.bottom()+8);
                tf_file_name.set_pos(lbl_file_name.right(), lb_files.bottom()+5);
                tf_file_name.set_width(width-tf_file_name.left()-5);

                btn_ok.set_pos(width - btn_ok.width()-25,tf_file_name.bottom()+5);
                btn_cancel.set_pos(btn_ok.left() - btn_cancel.width()-5,tf_file_name.bottom()+5);
            }

        }

    // ------------------------------------------------------------------------------------

        void box_win::
        on_window_resized (
        )
        {
            set_sizes();
        }

    // ------------------------------------------------------------------------------------

        void box_win::
        deleter_thread (
        ) 
        {  
            close_window();
            delete this; 
        }

    // ------------------------------------------------------------------------------------

        void box_win::
        enter_folder (
            const std::string& folder_name
        )
        {
            if (btn_root.is_checked())
                btn_root.set_unchecked();
            if (cur_dir != -1)
                sob[cur_dir]->set_unchecked();


            const std::string old_path = path;
            const long old_cur_dir = cur_dir;

            scoped_ptr<toggle_button> new_btn(new toggle_button(*this));
            new_btn->set_name(folder_name);
            new_btn->set_click_handler(*this,&box_win::on_path_button_click);

            // remove any path buttons that won't be part of the path anymore
            if (sob.size())
            {
                while (sob.size() > (unsigned long)(cur_dir+1))
                {
                    scoped_ptr<toggle_button> junk;
                    sob.remove(cur_dir+1,junk);
                }
            }

            if (sob.size())
                new_btn->set_pos(sob[sob.size()-1]->right()+5,sob[sob.size()-1]->top());
            else
                new_btn->set_pos(btn_root.right()+5,btn_root.top());

            cur_dir = sob.size();
            sob.add(sob.size(),new_btn);

            path += folder_name + directory::get_separator();
            if (set_dir(prefix + path) == false)
            {
                sob.remove(sob.size()-1,new_btn);
                path = old_path;
                cur_dir = old_cur_dir;
            }
            else
            {

                sob[cur_dir]->set_checked();
            }
        }

    // ------------------------------------------------------------------------------------

        void box_win::
        on_dirs_click (
            unsigned long idx
        )
        {
            enter_folder(lb_dirs[idx]);
        }

    // ------------------------------------------------------------------------------------

        void box_win::
        on_files_click (
            unsigned long idx
        )
        {
            if (tf_file_name.is_hidden() == false)
            {
                tf_file_name.set_text(lb_files[idx]);
            }
        }

    // ------------------------------------------------------------------------------------

        void box_win::
        on_files_double_click (
            unsigned long 
        )
        {
            on_open_click();
        }

    // ------------------------------------------------------------------------------------

        void box_win::
        on_cancel_click (
        )
        {
            hide();
            create_new_thread<box_win,&box_win::deleter_thread>(*this);
        }

    // ------------------------------------------------------------------------------------

        void box_win::
        on_open_click (
        )
        {
            if (lb_files.get_selected() != lb_files.size() || tf_file_name.text().size() > 0)
            {
                if (event_handler.is_set())
                {
                    if (tf_file_name.is_hidden())
                        event_handler(prefix + path + lb_files[lb_files.get_selected()]);
                    else if (tf_file_name.text().size() > 0)
                        event_handler(prefix + path + tf_file_name.text());
                }
                hide();
                create_new_thread<box_win,&box_win::deleter_thread>(*this);
            }
        }

    // ------------------------------------------------------------------------------------

        void box_win::
        on_path_button_click (
            toggle_button& btn
        )
        {
            if (btn_root.is_checked())
                btn_root.set_unchecked();
            if (cur_dir != -1)
                sob[cur_dir]->set_unchecked();
            std::string new_path;

            for (unsigned long i = 0; i < sob.size(); ++i)
            {
                new_path += sob[i]->name() + directory::get_separator();
                if (sob[i].get() == &btn)
                {
                    cur_dir = i;
                    sob[i]->set_checked();
                    break;
                }
            }
            if (path != new_path)
            {
                path = new_path;
                set_dir(prefix+path);
            }
        }

    // ------------------------------------------------------------------------------------

        struct case_insensitive_compare
        {
            bool operator() (
                const std::string& a,
                const std::string& b
            ) const
            {
                std::string::size_type i, size;
                size = std::min(a.size(),b.size());
                for (i = 0; i < size; ++i)
                {
                    if (std::tolower(a[i]) < std::tolower(b[i]))
                        return true;
                    else if (std::tolower(a[i]) > std::tolower(b[i]))
                        return false;
                }
                if (a.size() < b.size())
                    return true;
                else
                    return false;
            }
        };

    // ------------------------------------------------------------------------------------

        bool box_win::
        set_dir (
            const std::string& dir
        )
        {
            try
            {
                directory d(dir);
                queue<directory>::kernel_1a_c qod;
                queue<file>::kernel_1a_c qof;
                queue<std::string>::sort_1a_c qos;
                d.get_dirs(qod);
                d.get_files(qof);

                qod.reset();
                while (qod.move_next())
                {
                    std::string temp = qod.element().name();
                    qos.enqueue(temp);
                }
                qos.sort(case_insensitive_compare());
                lb_dirs.load(qos);
                qos.clear();

                qof.reset();
                while (qof.move_next())
                {
                    std::string temp = qof.element().name();
                    qos.enqueue(temp);
                }
                qos.sort(case_insensitive_compare());
                lb_files.load(qos);
                return true;
            }
            catch (directory::listing_error& )
            {
                return false;
            }
            catch (directory::dir_not_found&)
            {
                return false;
            }
        }

    // ------------------------------------------------------------------------------------

        void box_win::
        on_root_click (
        )
        {
            btn_root.set_checked();
            if (cur_dir != -1)
                sob[cur_dir]->set_unchecked();

            queue<directory>::kernel_1a_c qod, qod2;
            queue<file>::kernel_1a_c qof;
            queue<std::string>::sort_1a_c qos;
            get_filesystem_roots(qod);
            path.clear();
            cur_dir = -1;
            if (qod.size() == 1)
            {
                qod.current().get_files(qof);
                qod.current().get_dirs(qod2);
                prefix = qod.current().full_name();

                qod2.reset();
                while (qod2.move_next())
                {
                    std::string temp = qod2.element().name();
                    qos.enqueue(temp);
                }
                qos.sort(case_insensitive_compare());
                lb_dirs.load(qos);
                qos.clear();

                qof.reset();
                while (qof.move_next())
                {
                    std::string temp = qof.element().name();
                    qos.enqueue(temp);
                }
                qos.sort(case_insensitive_compare());
                lb_files.load(qos);
            }
            else
            {
                prefix.clear();
                qod.reset();
                while (qod.move_next())
                {
                    std::string temp = qod.element().full_name();
                    temp = temp.substr(0,temp.size()-1);
                    qos.enqueue(temp);
                }
                qos.sort(case_insensitive_compare());
                lb_dirs.load(qos);
                qos.clear();
                lb_files.load(qos);
            }
        }

    // ------------------------------------------------------------------------------------

        base_window::on_close_return_code box_win::
        on_window_close (
        )
        {
            delete this;
            return CLOSE_WINDOW;
        }

    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // class menu_bar
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    menu_bar::
    menu_bar(
        drawable_window& w
    ) : 
        drawable(w, 0xFFFF), // listen for all events
        open_menu(0)
    {
        adjust_position();
        enable_events();
    }

// ----------------------------------------------------------------------------------------

    menu_bar::
    ~menu_bar()
    { 
        disable_events(); 
        parent.invalidate_rectangle(rect); 
    }

// ----------------------------------------------------------------------------------------

    void menu_bar::
    set_main_font (
        const shared_ptr_thread_safe<font>& f
    )
    {
        auto_mutex M(m);
        mfont = f;
        adjust_position();
        compute_menu_geometry();
        parent.invalidate_rectangle(rect);
    }

// ----------------------------------------------------------------------------------------

    void menu_bar::
    set_number_of_menus (
        unsigned long num
    )
    {
        auto_mutex M(m);
        menus.set_max_size(num);
        menus.set_size(num);
        open_menu = menus.size();
        compute_menu_geometry();

        for (unsigned long i = 0; i < menus.size(); ++i)
        {
            menus[i].menu.set_on_hide_handler(*this,&menu_bar::on_popup_hide);
        }

        parent.invalidate_rectangle(rect);
    }

// ----------------------------------------------------------------------------------------

    unsigned long menu_bar::
    number_of_menus (
    ) const
    {
        auto_mutex M(m);
        return menus.size();
    }

// ----------------------------------------------------------------------------------------

    void menu_bar::
    set_menu_name (
        unsigned long idx,
        const std::string name,
        char underline_ch 
    )
    {
        set_menu_name(idx, convert_mbstring_to_wstring(name), underline_ch);
    }

// ----------------------------------------------------------------------------------------

    void menu_bar::
    set_menu_name (
        unsigned long idx,
        const std::wstring name,
        char underline_ch 
    )
    {
        set_menu_name(idx, convert_wstring_to_utf32(name), underline_ch);
    }

// ----------------------------------------------------------------------------------------

    void menu_bar::
    set_menu_name (
        unsigned long idx,
        const dlib::ustring name,
        char underline_ch 
    )
    {
        DLIB_ASSERT ( idx < number_of_menus() ,
                      "\tvoid menu_bar::set_menu_name()"
                      << "\n\tidx:               " << idx
                      << "\n\tnumber_of_menus(): " << number_of_menus() 
        );
        auto_mutex M(m);
        menus[idx].name = name.c_str();
        menus[idx].underline_pos = name.find_first_of(underline_ch);
        compute_menu_geometry();
        parent.invalidate_rectangle(rect);
    }

// ----------------------------------------------------------------------------------------

    const std::string menu_bar::
    menu_name (
        unsigned long idx
    ) const
    {
        return convert_wstring_to_mbstring(menu_wname(idx));
    }

// ----------------------------------------------------------------------------------------

    const std::wstring menu_bar::
    menu_wname (
        unsigned long idx
    ) const
    {
        return convert_utf32_to_wstring(menu_uname(idx));
    }

// ----------------------------------------------------------------------------------------

    const dlib::ustring menu_bar::
    menu_uname (
        unsigned long idx
    ) const
    {
        DLIB_ASSERT ( idx < number_of_menus() ,
                      "\tstd::string menu_bar::menu_name()"
                      << "\n\tidx:               " << idx
                      << "\n\tnumber_of_menus(): " << number_of_menus() 
        );
        auto_mutex M(m);
        return menus[idx].name.c_str();
    }

// ----------------------------------------------------------------------------------------

    popup_menu& menu_bar::
    menu (
        unsigned long idx
    )
    {
        DLIB_ASSERT ( idx < number_of_menus() ,
                      "\tpopup_menu& menu_bar::menu()"
                      << "\n\tidx:               " << idx
                      << "\n\tnumber_of_menus(): " << number_of_menus() 
        );
        auto_mutex M(m);
        return menus[idx].menu;
    }

// ----------------------------------------------------------------------------------------

    const popup_menu& menu_bar::
    menu (
        unsigned long idx
    ) const
    {
        DLIB_ASSERT ( idx < number_of_menus() ,
                      "\tconst popup_menu& menu_bar::menu()"
                      << "\n\tidx:               " << idx
                      << "\n\tnumber_of_menus(): " << number_of_menus() 
        );
        auto_mutex M(m);
        return menus[idx].menu;
    }

// ----------------------------------------------------------------------------------------

    void menu_bar::
    on_window_resized (
    )
    {
        adjust_position();
        hide_menu();
    }

// ----------------------------------------------------------------------------------------

    void menu_bar::
    draw (
        const canvas& c
    ) const
    {
        rectangle area(rect.intersect(c));
        if (area.is_empty())
            return;

        const unsigned char opacity = 40;
        fill_rect_with_vertical_gradient(c, rect,rgb_alpha_pixel(255,255,255,opacity),
                                         rgb_alpha_pixel(0,0,0,opacity));

        // first draw the border between the menu and the rest of the window
        draw_line(c, point(rect.left(),rect.bottom()-1), 
                  point(rect.right(),rect.bottom()-1), 100);
        draw_line(c, point(rect.left(),rect.bottom()), 
                  point(rect.right(),rect.bottom()), 255);

        // now draw all the menu buttons
        for (unsigned long i = 0; i < menus.size(); ++i)
        {
            mfont->draw_string(c,menus[i].rect, menus[i].name );
            if (menus[i].underline_p1 != menus[i].underline_p2)
                draw_line(c, menus[i].underline_p1, menus[i].underline_p2);

            if (open_menu == i)
            {
                fill_rect_with_vertical_gradient(c, menus[i].bgrect,rgb_alpha_pixel(255,255,0,40),  rgb_alpha_pixel(0,0,0,40));
            }
        }
    }

// ----------------------------------------------------------------------------------------

    void menu_bar::
    on_window_moved (
    )
    {
        hide_menu();
    }

// ----------------------------------------------------------------------------------------

    void menu_bar::
    on_focus_lost (
    )
    {
        hide_menu();
    }

// ----------------------------------------------------------------------------------------

    void menu_bar::
    on_mouse_down (
        unsigned long btn,
        unsigned long ,
        long x,
        long y,
        bool 
    )
    {

        if (rect.contains(x,y) == false || btn != (unsigned long)base_window::LEFT)
        {
            hide_menu();
            return;
        }

        unsigned long old_menu = menus.size();

        // if a menu is currently open then save its index
        if (open_menu != menus.size())
        {
            old_menu = open_menu;
            hide_menu();
        }

        // figure out which menu should be open if any
        for (unsigned long i = 0; i < menus.size(); ++i)
        {
            if (menus[i].bgrect.contains(x,y))
            {
                if (old_menu != i)
                    show_menu(i);

                break;
            }
        }

    }

// ----------------------------------------------------------------------------------------

    void menu_bar::
    on_mouse_move (
        unsigned long ,
        long x,
        long y
    )
    {
        // if the mouse is over the menu_bar and some menu is currently open
        if (rect.contains(x,y) && open_menu != menus.size())
        {
            // if the mouse is still in the same rectangle then don't do anything
            if (menus[open_menu].bgrect.contains(x,y) == false)
            {
                // figure out which menu should be instead   
                for (unsigned long i = 0; i < menus.size(); ++i)
                {
                    if (menus[i].bgrect.contains(x,y))
                    {
                        show_menu(i);
                        break;
                    }
                }

            }
        }
    }

// ----------------------------------------------------------------------------------------

    void menu_bar::
    on_keydown (
        unsigned long key,
        bool is_printable,
        unsigned long state
    )
    {
        if (state&base_window::KBD_MOD_ALT)
        {
            // check if the key matches any of our underlined keys
            for (unsigned long i = 0; i < menus.size(); ++i)
            {
                // if we have found a matching key
                if (is_printable && 
                    menus[i].underline_pos != std::string::npos &&
                    std::tolower(menus[i].name[menus[i].underline_pos]) == std::tolower(key))
                {
                    show_menu(i);
                    menus[open_menu].menu.select_first_item();
                    return;
                }
            }
        }

        if (open_menu != menus.size())
        {
            unsigned long i = open_menu;
            // if the submenu doesn't use this key for something then we will
            if (menus[open_menu].menu.forwarded_on_keydown(key,is_printable,state) == false)
            {
                if (key == base_window::KEY_LEFT)
                {
                    i = (i+menus.size()-1)%menus.size();
                    show_menu(i);
                    menus[open_menu].menu.select_first_item();
                }
                else if (key == base_window::KEY_RIGHT)
                {
                    i = (i+1)%menus.size();
                    show_menu(i);
                    menus[open_menu].menu.select_first_item();
                }
                else if (key == base_window::KEY_ESC)
                {
                    hide_menu();
                }
            }
        }
    }

// ----------------------------------------------------------------------------------------

    void menu_bar::
    show_menu (
        unsigned long i
    )
    {
        rectangle temp;

        // menu already open so do nothing
        if (i == open_menu)
            return;

        // if a menu is currently open
        if (open_menu != menus.size())
        {
            menus[open_menu].menu.hide();
            temp = menus[open_menu].bgrect;
        }

        // display the new menu
        open_menu = i;
        long wx, wy;
        parent.get_pos(wx,wy);
        wx += menus[i].bgrect.left();
        wy += menus[i].bgrect.bottom()+1;
        menus[i].menu.set_pos(wx,wy);
        menus[i].menu.show();
        parent.invalidate_rectangle(menus[i].bgrect+temp);
    }

// ----------------------------------------------------------------------------------------

    void menu_bar::
    hide_menu (
    )
    {
        // if a menu is currently open
        if (open_menu != menus.size())
        {
            menus[open_menu].menu.hide();
            parent.invalidate_rectangle(menus[open_menu].bgrect);
            open_menu = menus.size();
        }
    }

// ----------------------------------------------------------------------------------------

    void menu_bar::
    on_popup_hide (
    )
    {
        // if a menu is currently open
        if (open_menu != menus.size())
        {
            parent.invalidate_rectangle(menus[open_menu].bgrect);
            open_menu = menus.size();
        }
    }

// ----------------------------------------------------------------------------------------

    void menu_bar::
    compute_menu_geometry (
    )
    {
        long x = 7;
        long bg_x = 0;
        for (unsigned long i = 0; i < menus.size(); ++i)
        {
            // compute the locations of the text rectangles
            menus[i].rect.set_top(5);
            menus[i].rect.set_left(x);
            menus[i].rect.set_bottom(rect.bottom()-2);

            unsigned long width, height;
            mfont->compute_size(menus[i].name,width,height);
            menus[i].rect = resize_rect_width(menus[i].rect, width);
            x = menus[i].rect.right()+10;

            menus[i].bgrect.set_top(0);
            menus[i].bgrect.set_left(bg_x);
            menus[i].bgrect.set_bottom(rect.bottom()-2);
            menus[i].bgrect.set_right(x-5);
            bg_x = menus[i].bgrect.right()+1;

            if (menus[i].underline_pos != std::string::npos)
            {
                // now compute the location of the underline bar
                rectangle r1 = mfont->compute_cursor_rect(
                    menus[i].rect, 
                    menus[i].name,
                    menus[i].underline_pos);

                rectangle r2 = mfont->compute_cursor_rect(
                    menus[i].rect, 
                    menus[i].name,
                    menus[i].underline_pos+1);

                menus[i].underline_p1.x() = r1.left()+1;
                menus[i].underline_p2.x() = r2.left()-1;
                menus[i].underline_p1.y() = r1.bottom()-mfont->height()+mfont->ascender()+2;
                menus[i].underline_p2.y() = r2.bottom()-mfont->height()+mfont->ascender()+2;
            }
            else
            {
                // there is no underline in this case
                menus[i].underline_p1 = menus[i].underline_p2;
            }

        }
    }

// ----------------------------------------------------------------------------------------

    void menu_bar::
    adjust_position (
    )
    {
        unsigned long width, height;
        rectangle old(rect);
        parent.get_size(width,height);
        rect.set_left(0);
        rect.set_top(0);
        rect = resize_rect(rect,width,mfont->height()+10);
        parent.invalidate_rectangle(old+rect);
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// class text_grid
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    text_grid::
    text_grid (
        drawable_window& w
    ) :
        scrollable_region(w, KEYBOARD_EVENTS | MOUSE_CLICK | FOCUS_EVENTS ),
        has_focus(false),
        cursor_timer(*this,&text_grid::timer_action),
        border_color_(128,128,128)
    {

        cursor_timer.set_delay_time(500);
        set_vertical_scroll_increment(10);
        set_horizontal_scroll_increment(10);
        enable_events();
    }

// ----------------------------------------------------------------------------------------

    text_grid::
    ~text_grid (
    )
    {
        // Disable all further events for this drawable object.  We have to do this 
        // because we don't want draw() events coming to this object while or after 
        // it has been destructed.
        disable_events();

        // wait for the timer to stop doing its thing
        cursor_timer.stop_and_wait();
        // Tell the parent window to redraw its area that previously contained this
        // drawable object.
        parent.invalidate_rectangle(rect);
    }

// ----------------------------------------------------------------------------------------

    void text_grid::
    set_grid_size (
        unsigned long rows,
        unsigned long cols
    )
    {
        auto_mutex M(m);
        row_height.set_max_size(rows);
        row_height.set_size(rows);

        col_width.set_max_size(cols);
        col_width.set_size(cols);

        grid.set_size(rows,cols);

        for (unsigned long i = 0; i < row_height.size(); ++i)
            row_height[i] = (mfont->height()*3)/2;
        for (unsigned long i = 0; i < col_width.size(); ++i)
            col_width[i] = mfont->height()*5;

        compute_total_rect();
        compute_bg_rects();
    }

// ----------------------------------------------------------------------------------------

    unsigned long text_grid::
    number_of_columns (
    ) const
    {
        auto_mutex M(m);
        return grid.nc();
    }

// ----------------------------------------------------------------------------------------

    unsigned long text_grid::
    number_of_rows (
    ) const
    {
        auto_mutex M(m);
        return grid.nr();
    }

// ----------------------------------------------------------------------------------------

    int text_grid::
    next_free_user_event_number (
    ) const
    {
        return scrollable_region::next_free_user_event_number()+1;
    }

// ----------------------------------------------------------------------------------------

    rgb_pixel text_grid::
    border_color (
    ) const
    {
        auto_mutex M(m);
        return border_color_;
    }

// ----------------------------------------------------------------------------------------

    void text_grid::
    set_border_color (
        rgb_pixel color
    )
    {
        auto_mutex M(m);
        border_color_ = color;
        parent.invalidate_rectangle(rect);
    }

// ----------------------------------------------------------------------------------------

    const std::string text_grid::
    text (
        unsigned long row,
        unsigned long col
    ) const
    {
        return convert_wstring_to_mbstring(wtext(row, col));
    }

// ----------------------------------------------------------------------------------------

    const std::wstring text_grid::
    wtext (
        unsigned long row,
        unsigned long col
    ) const
    {
        return convert_utf32_to_wstring(utext(row, col));
    }

// ----------------------------------------------------------------------------------------

    const dlib::ustring text_grid::
    utext (
        unsigned long row,
        unsigned long col
    ) const
    {
        auto_mutex M(m);
        DLIB_ASSERT ( row < number_of_rows()  && col < number_of_columns(),
                      "\tconst std::string text_grid::text(row,col)"
                      << "\n\trow:              " << row 
                      << "\n\tcol:              " << col 
                      << "\n\tnumber_of_rows(): " << number_of_rows() 
                      << "\n\tnumber_of_columns(): " << number_of_columns() 
                      << "\n\tthis:             " << this
        );
        return grid[row][col].text.c_str();
    }

// ----------------------------------------------------------------------------------------

    void text_grid::
    set_text (
        unsigned long row,
        unsigned long col,
        const std::string& str
    ) 
    {
        set_text(row, col, convert_mbstring_to_wstring(str));
    }

// ----------------------------------------------------------------------------------------

    void text_grid::
    set_text (
        unsigned long row,
        unsigned long col,
        const std::wstring& str
    ) 
    {
        set_text(row, col, convert_wstring_to_utf32(str));
    }

// ----------------------------------------------------------------------------------------

    void text_grid::
    set_text (
        unsigned long row,
        unsigned long col,
        const dlib::ustring& str
    ) 
    {
        auto_mutex M(m);
        DLIB_ASSERT ( row < number_of_rows()  && col < number_of_columns(),
                      "\tvoid text_grid::set_text(row,col)"
                      << "\n\trow:              " << row 
                      << "\n\tcol:              " << col 
                      << "\n\tnumber_of_rows(): " << number_of_rows() 
                      << "\n\tnumber_of_columns(): " << number_of_columns() 
                      << "\n\tthis:             " << this
        );
        grid[row][col].text = str.c_str();
        parent.invalidate_rectangle(get_text_rect(row,col));
    }

// ----------------------------------------------------------------------------------------

    const rgb_pixel text_grid::
    text_color (
        unsigned long row,
        unsigned long col
    ) const
    {
        auto_mutex M(m);
        DLIB_ASSERT ( row < number_of_rows()  && col < number_of_columns(),
                      "\tconst rgb_pixel text_grid::text_color(row,col)"
                      << "\n\trow:              " << row 
                      << "\n\tcol:              " << col 
                      << "\n\tnumber_of_rows(): " << number_of_rows() 
                      << "\n\tnumber_of_columns(): " << number_of_columns() 
                      << "\n\tthis:             " << this
        );
        return grid[row][col].text_color;
    }

// ----------------------------------------------------------------------------------------

    void text_grid::
    set_text_color (
        unsigned long row,
        unsigned long col,
        const rgb_pixel color
    ) 
    {
        auto_mutex M(m);
        DLIB_ASSERT ( row < number_of_rows()  && col < number_of_columns(),
                      "\tvoid text_grid::set_text_color(row,col,color)"
                      << "\n\trow:              " << row 
                      << "\n\tcol:              " << col 
                      << "\n\tnumber_of_rows(): " << number_of_rows() 
                      << "\n\tnumber_of_columns(): " << number_of_columns() 
                      << "\n\tthis:             " << this
        );
        grid[row][col].text_color = color;
        parent.invalidate_rectangle(get_text_rect(row,col));
    }

// ----------------------------------------------------------------------------------------

    const rgb_pixel text_grid::
    background_color (
        unsigned long row,
        unsigned long col
    ) const
    {
        auto_mutex M(m);
        DLIB_ASSERT ( row < number_of_rows()  && col < number_of_columns(),
                      "\tconst rgb_pixel text_grid::background_color(row,col,color)"
                      << "\n\trow:              " << row 
                      << "\n\tcol:              " << col 
                      << "\n\tnumber_of_rows(): " << number_of_rows() 
                      << "\n\tnumber_of_columns(): " << number_of_columns() 
                      << "\n\tthis:             " << this
        );
        return grid[row][col].bg_color;
    }

// ----------------------------------------------------------------------------------------

    void text_grid::
    set_background_color (
        unsigned long row,
        unsigned long col,
        const rgb_pixel color
    ) 
    {
        auto_mutex M(m);
        DLIB_ASSERT ( row < number_of_rows()  && col < number_of_columns(),
                      "\tvoid text_grid::set_background_color(row,col,color)"
                      << "\n\trow:              " << row 
                      << "\n\tcol:              " << col 
                      << "\n\tnumber_of_rows(): " << number_of_rows() 
                      << "\n\tnumber_of_columns(): " << number_of_columns() 
                      << "\n\tthis:             " << this
        );
        grid[row][col].bg_color = color;
        parent.invalidate_rectangle(get_bg_rect(row,col));
    }

// ----------------------------------------------------------------------------------------

    bool text_grid::
    is_editable (
        unsigned long row,
        unsigned long col
    ) const
    {
        auto_mutex M(m);
        DLIB_ASSERT ( row < number_of_rows()  && col < number_of_columns(),
                      "\tbool text_grid::is_editable(row,col)"
                      << "\n\trow:              " << row 
                      << "\n\tcol:              " << col 
                      << "\n\tnumber_of_rows(): " << number_of_rows() 
                      << "\n\tnumber_of_columns(): " << number_of_columns() 
                      << "\n\tthis:             " << this
        );
        return grid[row][col].is_editable;
    }

// ----------------------------------------------------------------------------------------

    void text_grid::
    set_editable (
        unsigned long row,
        unsigned long col,
        bool editable
    ) 
    {
        auto_mutex M(m);
        DLIB_ASSERT ( row < number_of_rows()  && col < number_of_columns(),
                      "\tvoid text_grid::set_editable(row,col,editable)"
                      << "\n\trow:              " << row 
                      << "\n\tcol:              " << col 
                      << "\n\tnumber_of_rows(): " << number_of_rows() 
                      << "\n\tnumber_of_columns(): " << number_of_columns() 
                      << "\n\teditable:         " << editable 
                      << "\n\tthis:             " << this
        );
        grid[row][col].is_editable = editable;
        if (has_focus && active_row == static_cast<long>(row) && active_col == static_cast<long>(col))
        {
            drop_input_focus();
        }
    }

// ----------------------------------------------------------------------------------------

    void text_grid::
    set_column_width (
        unsigned long col,
        unsigned long width
    )
    {
        auto_mutex M(m);
        DLIB_ASSERT ( col < number_of_columns(),
                      "\tvoid text_grid::set_column_width(col,width)"
                      << "\n\tcol:              " << col 
                      << "\n\tnumber_of_columns(): " << number_of_columns() 
                      << "\n\twidth:            " << width 
                      << "\n\tthis:             " << this
        );
        col_width[col] = width;
        compute_total_rect();
        compute_bg_rects();
    }

// ----------------------------------------------------------------------------------------

    void text_grid::
    set_row_height (
        unsigned long row,
        unsigned long height 
    )
    {
        auto_mutex M(m);
        DLIB_ASSERT ( row < number_of_rows() ,
                      "\tvoid text_grid::set_row_height(row,height)"
                      << "\n\trow:              " << row 
                      << "\n\tnumber_of_rows(): " << number_of_rows() 
                      << "\n\theight:           " << height 
                      << "\n\tthis:             " << this
        );
        row_height[row] = height;
        compute_total_rect();
        compute_bg_rects();
    }

// ----------------------------------------------------------------------------------------

    void text_grid::
    disable (
    ) 
    {
        auto_mutex M(m);
        scrollable_region::disable();
        drop_input_focus();
    }

// ----------------------------------------------------------------------------------------

    void text_grid::
    hide (
    ) 
    {
        auto_mutex M(m);
        scrollable_region::hide();
        drop_input_focus();
    }

// ----------------------------------------------------------------------------------------

    void text_grid::
    on_user_event (
        int num
    )
    {
        // ignore this user event if it isn't for us
        if (num != scrollable_region::next_free_user_event_number())
            return;

        if (has_focus && !recent_cursor_move && enabled && !hidden)
        {
            show_cursor = !show_cursor;
            parent.invalidate_rectangle(get_text_rect(active_row,active_col));
        }
        recent_cursor_move = false;
    }

// ----------------------------------------------------------------------------------------

    void text_grid::
    timer_action (
    ) 
    { 
        parent.trigger_user_event(this,scrollable_region::next_free_user_event_number()); 
    }

// ----------------------------------------------------------------------------------------

    void text_grid::
    compute_bg_rects (
    )
    {
        // loop over each element in the grid and figure out what its rectangle should be
        // with respect to the total_rect()
        point p1, p2;
        p1.y() = total_rect().top();
        for (long row = 0; row < grid.nr(); ++row)
        {
            p1.x() = total_rect().left();
            p2.y() = p1.y() + row_height[row]-1;
            for (long col = 0; col < grid.nc(); ++col)
            {
                // if this is the last box in this row make it super wide so that it always
                // goes to the end of the widget
                if (col+1 == grid.nc())
                    p2.x() = 1000000;
                else
                    p2.x() = p1.x() + col_width[col]-1;

                // at this point p1 is the upper left corner of this box and p2 is the 
                // lower right corner of the box;
                rectangle bg_rect(p1);
                bg_rect += p2;

                grid[row][col].bg_rect = translate_rect(bg_rect, -total_rect().left(), -total_rect().top());


                p1.x() += 1 + col_width[col];
            }
            p1.y() += 1 + row_height[row];
        }
    }

// ----------------------------------------------------------------------------------------

    void text_grid::
    compute_total_rect (
    )
    {
        if (grid.size() == 0)
        {
            set_total_rect_size(0,0);
        }
        else
        {
            unsigned long width = col_width.size()-1;
            unsigned long height = row_height.size()-1;

            for (unsigned long i = 0; i < col_width.size(); ++i)
                width += col_width[i];
            for (unsigned long i = 0; i < row_height.size(); ++i)
                height += row_height[i];

            set_total_rect_size(width,height);
        }
    }

// ----------------------------------------------------------------------------------------

    void text_grid::
    on_keydown (
        unsigned long key,          
        bool is_printable,
        unsigned long state
    )
    {
        // ignore this event if we are disabled or hidden
        if (!enabled || hidden)
            return;

        if (has_focus)
        {
            if (is_printable)
            {
                // if the user hit the tab key then jump to the next box
                if (key == '\t')
                {
                    if (active_col+1 == grid.nc())
                    {
                        if (active_row+1 == grid.nr())
                            move_cursor(0,0,0);
                        else
                            move_cursor(active_row+1,0,0);
                    }
                    else
                    {
                        move_cursor(active_row,active_col+1,0);
                    }
                }
                if (key == '\n')
                {
                    // ignore the enter key
                }
                else if (grid[active_row][active_col].is_editable)
                {
                    // insert the key the user pressed into the string
                    grid[active_row][active_col].text.insert(cursor_pos,1,static_cast<char>(key));
                    move_cursor(active_row,active_col,cursor_pos+1);

                    if (text_modified_handler.is_set())
                        text_modified_handler(active_row,active_col);
                }
            }
            else if ((state & base_window::KBD_MOD_CONTROL))
            {
                if (key == base_window::KEY_LEFT)
                    move_cursor(active_row,active_col-1,0);
                else if (key == base_window::KEY_RIGHT)
                    move_cursor(active_row,active_col+1,0);
                else if (key == base_window::KEY_UP)
                    move_cursor(active_row-1,active_col,0);
                else if (key == base_window::KEY_DOWN)
                    move_cursor(active_row+1,active_col,0);
                else if (key == base_window::KEY_END)
                    move_cursor(active_row,active_col,grid[active_row][active_col].text.size());
                else if (key == base_window::KEY_HOME)
                    move_cursor(active_row,active_col,0);
            }
            else
            {
                if (key == base_window::KEY_LEFT)
                    move_cursor(active_row,active_col,cursor_pos-1);
                else if (key == base_window::KEY_RIGHT)
                    move_cursor(active_row,active_col,cursor_pos+1);
                else if (key == base_window::KEY_UP)
                    move_cursor(active_row-1,active_col,0);
                else if (key == base_window::KEY_DOWN)
                    move_cursor(active_row+1,active_col,0);
                else if (key == base_window::KEY_END)
                    move_cursor(active_row,active_col,grid[active_row][active_col].text.size());
                else if (key == base_window::KEY_HOME)
                    move_cursor(active_row,active_col,0);
                else if (key == base_window::KEY_BACKSPACE)
                {
                    if (cursor_pos > 0 && grid[active_row][active_col].is_editable)
                    {
                        grid[active_row][active_col].text.erase(
                            grid[active_row][active_col].text.begin()+cursor_pos-1,
                            grid[active_row][active_col].text.begin()+cursor_pos);
                        move_cursor(active_row,active_col,cursor_pos-1);

                        if (text_modified_handler.is_set())
                            text_modified_handler(active_row,active_col);
                    }
                }
                else if (key == base_window::KEY_DELETE)
                {
                    if (cursor_pos < static_cast<long>(grid[active_row][active_col].text.size()) &&
                        grid[active_row][active_col].is_editable)
                    {
                        grid[active_row][active_col].text.erase(
                            grid[active_row][active_col].text.begin()+cursor_pos);
                        move_cursor(active_row,active_col,cursor_pos);

                        if (text_modified_handler.is_set())
                            text_modified_handler(active_row,active_col);
                    }
                }
            }
        } // if (has_focus)
    }

// ----------------------------------------------------------------------------------------

    void text_grid::
    on_mouse_down (
        unsigned long btn,
        unsigned long state,
        long x,
        long y,
        bool is_double_click
    )
    {
        scrollable_region::on_mouse_down(btn, state, x, y, is_double_click);
        if (display_rect().contains(x,y) && enabled && !hidden)
        {
            // figure out which box this click landed in
            rectangle hit;

            // find which column we hit
            unsigned long col = 0;
            long box_x = total_rect().left();
            for (unsigned long i = 0; i < col_width.size(); ++i)
            {
                if (box_x <= x && (x < box_x+static_cast<long>(col_width[i]) || (i+1 == col_width.size())))
                {
                    col = i;
                    hit.set_left(box_x);
                    hit.set_right(box_x+col_width[i]-1);
                    break;
                }
                else
                {
                    box_x += col_width[i]+1;
                }
            }

            // find which row we hit
            unsigned long row = 0;
            long box_y = total_rect().top();
            for (unsigned long i = 0; i < row_height.size(); ++i)
            {
                if (box_y <= y && y < box_y+static_cast<long>(row_height[i]))
                {
                    row = i;
                    hit.set_top(box_y);
                    hit.set_bottom(box_y+row_height[i]-1);
                    break;
                }
                else
                {
                    box_y += row_height[i]+1;
                }
            }

            // if we hit a box
            if (hit.is_empty() == false)
            {
                move_cursor(row, 
                            col,
                            mfont->compute_cursor_pos(get_text_rect(row,col), grid[row][col].text, x, y, grid[row][col].first)
                );
            }
            else
            {
                drop_input_focus();
            }
        }
        else
        {
            drop_input_focus();
        }
    }

// ----------------------------------------------------------------------------------------

    void text_grid::
    on_mouse_up (
        unsigned long btn,
        unsigned long state,
        long x,
        long y
    ) 
    {
        scrollable_region::on_mouse_up(btn, state, x, y);
    }

// ----------------------------------------------------------------------------------------

    void text_grid::
    on_focus_lost (
    )
    {
        drop_input_focus();
    }

// ----------------------------------------------------------------------------------------

    void text_grid::
    draw (
        const canvas& c
    ) const
    {
        scrollable_region::draw(c);
        rectangle area = c.intersect(display_rect());
        if (area.is_empty() == true)
            return;

        if (enabled)
            fill_rect(c, area, 255); 

        // don't do anything if the grid is empty
        if (grid.size() == 0)
            return;

        // draw all the vertical lines
        point p1, p2;
        p1.x() = p2.x() = total_rect().left();
        p1.y() = total_rect().top();
        p2.y() = total_rect().bottom();
        for (unsigned long i = 0; i < col_width.size()-1; ++i)
        {
            p1.x() += col_width[i];
            p2.x() += col_width[i];
            if (enabled)
                draw_line(c,p1,p2,border_color_,area);
            else
                draw_line(c,p1,p2,128,area);
            p1.x() += 1;
            p2.x() += 1;
        }

        // draw all the horizontal lines
        p1.y() = p2.y() = total_rect().top();
        p1.x() = display_rect().left();
        p2.x() = display_rect().right();
        for (unsigned long i = 0; i < row_height.size(); ++i)
        {
            p1.y() += row_height[i];
            p2.y() += row_height[i];
            if (enabled)
                draw_line(c,p1,p2,border_color_,area);
            else
                draw_line(c,p1,p2,128,area);
            p1.y() += 1;
            p2.y() += 1;
        }

        // draw the backgrounds and text for each box
        for (long row = 0; row < grid.nr(); ++row)
        {
            for (long col = 0; col < grid.nc(); ++col)
            {
                rectangle bg_rect(get_bg_rect(row,col));

                rectangle text_rect(get_text_rect(row,col));

                if (enabled)
                {
                    fill_rect(c,bg_rect.intersect(area),grid[row][col].bg_color);

                    mfont->draw_string(c,
                                       text_rect, 
                                       grid[row][col].text, 
                                       grid[row][col].text_color, 
                                       grid[row][col].first, 
                                       std::string::npos, 
                                       area);
                }
                else
                {
                    mfont->draw_string(c,
                                       text_rect, 
                                       grid[row][col].text, 
                                       128, 
                                       grid[row][col].first, 
                                       std::string::npos, 
                                       area);
                }

                // if this box has input focus then draw it with a cursor
                if (has_focus && active_col == col && active_row == row && show_cursor)
                {
                    rectangle cursor_rect = mfont->compute_cursor_rect(text_rect,
                                                                       grid[row][col].text,
                                                                       cursor_pos,
                                                                       grid[row][col].first);
                    draw_rectangle(c,cursor_rect,0,area);
                }

            }
        }


    }

// ----------------------------------------------------------------------------------------

    rectangle text_grid::
    get_text_rect (
        unsigned long row,
        unsigned long col
    ) const
    {
        rectangle bg_rect(get_bg_rect(row,col));
        long padding = (bg_rect.height() - mfont->height())/2 + (bg_rect.height() - mfont->height())%2;
        if (padding < 0)
            padding = 0;
        bg_rect.set_left(bg_rect.left()+padding);
        bg_rect.set_top(bg_rect.top()+padding);
        bg_rect.set_right(bg_rect.right()-padding);
        bg_rect.set_bottom(bg_rect.bottom()-padding);
        return bg_rect;
    }

// ----------------------------------------------------------------------------------------

    rectangle text_grid::
    get_bg_rect (
        unsigned long row,
        unsigned long col
    ) const
    {
        return translate_rect(grid[row][col].bg_rect, total_rect().left(), total_rect().top());
    }

// ----------------------------------------------------------------------------------------

    void text_grid::
    drop_input_focus (
    )
    {
        if (has_focus)
        {
            parent.invalidate_rectangle(get_text_rect(active_row,active_col));
            has_focus = false;
            show_cursor = false;
            cursor_timer.stop();
        }
    }

// ----------------------------------------------------------------------------------------

    void text_grid::
    move_cursor (
        long row,
        long col,
        long new_cursor_pos
    )
    {
        // don't do anything if the grid is empty
        if (grid.size() == 0)
        {
            return;
        }

        if (row < 0)
            row = 0;
        if (row >= grid.nr())
            row = grid.nr()-1;
        if (col < 0)
            col = 0;
        if (col >= grid.nc())
            col = grid.nc()-1;

        if (new_cursor_pos < 0)
        {
            if (col == 0)
            {
                new_cursor_pos = 0;
            }
            else 
            {
                --col;
                new_cursor_pos = grid[row][col].text.size();
            }
        }

        if (new_cursor_pos > static_cast<long>(grid[row][col].text.size()))
        {
            if (col+1 == grid.nc())
            {
                new_cursor_pos = grid[row][col].text.size();
            }
            else 
            {
                ++col;
                new_cursor_pos = 0;
            }
        }

        // if some other box had the input focus then redraw it
        if (has_focus && (active_row != row || active_col != col ))
        {
            parent.invalidate_rectangle(get_text_rect(active_row,active_col));
        }

        if (has_focus == false)
        {
            cursor_timer.start();
        }

        has_focus = true;
        recent_cursor_move = true;
        show_cursor = true;
        active_row = row;
        active_col = col;
        cursor_pos = new_cursor_pos;

        // adjust the first character to draw so that the string is displayed well
        rectangle text_rect(get_text_rect(active_row,active_col));
        rectangle cursor_rect = mfont->compute_cursor_rect(text_rect,
                                                           grid[row][col].text,
                                                           cursor_pos,
                                                           grid[row][col].first);

        // if the cursor rect is too far to the left of the string
        if (cursor_pos < static_cast<long>(grid[row][col].first))
        {
            if (cursor_pos > 5)
            {
                grid[row][col].first = cursor_pos - 5;
            }
            else
            {
                grid[row][col].first = 0;
            }
        }
        // if the cursor rect is too far to the right of the string
        else if (cursor_rect.left() > text_rect.right())
        {
            long distance = (cursor_rect.left() - text_rect.right()) + text_rect.width()/3;
            // find the letter that is distance pixels from the start of the string
            long sum = 0;
            for (unsigned long i = grid[row][col].first; i < grid[row][col].text.size(); ++i)
            {
                sum += (*mfont)[grid[row][col].text[i]].width();
                if (sum >= distance)
                {
                    grid[row][col].first = i;
                    break;
                }
            }
        }

        scroll_to_rect(get_bg_rect(row,col));

        // redraw our box
        parent.invalidate_rectangle(text_rect);

    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // text_field object methods  
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    rectangle text_box::
    get_text_rect (
    ) const
    {
        const unsigned long padding = style->get_padding(*mfont);

        rectangle text_rect;
        text_rect.set_left(total_rect().left()+padding);
        text_rect.set_top(total_rect().top()+padding);
        text_rect.set_right(total_rect().right()-padding);
        text_rect.set_bottom(total_rect().bottom()-padding);
        return text_rect;
    }

// ----------------------------------------------------------------------------------------

    void text_box::
    enable (
    )
    {
        scrollable_region::enable();
        right_click_menu.enable();
    }

// ----------------------------------------------------------------------------------------

    void text_box::
    on_cut (
    )
    {
        on_copy();
        on_delete_selected();
    }

// ----------------------------------------------------------------------------------------

    void text_box::
    on_copy (
    )
    {
        if (highlight_start <= highlight_end)
        {
            put_on_clipboard(text_.substr(highlight_start, highlight_end-highlight_start+1));
        }
    }

// ----------------------------------------------------------------------------------------

    void text_box::
    on_paste (
    )
    {
        ustring temp_str;
        get_from_clipboard(temp_str);


        if (highlight_start <= highlight_end)
        {
            text_ = text_.substr(0,highlight_start) + temp_str +
                text_.substr(highlight_end+1,text_.size()-highlight_end-1);
            move_cursor(highlight_start+temp_str.size());
            highlight_start = 0;
            highlight_end = -1;
            parent.invalidate_rectangle(rect);
            on_no_text_selected();

            // send out the text modified event
            if (text_modified_handler.is_set())
                text_modified_handler();
        }
        else
        {
            text_ = text_.substr(0,cursor_pos) + temp_str +
                text_.substr(cursor_pos,text_.size()-cursor_pos);
            move_cursor(cursor_pos+temp_str.size());

            // send out the text modified event
            if (temp_str.size() != 0 && text_modified_handler.is_set())
                text_modified_handler();
        }

        adjust_total_rect();
    }

// ----------------------------------------------------------------------------------------

    void text_box::
    on_select_all (
    )
    {
        move_cursor(static_cast<long>(text_.size()));
        highlight_start = 0;
        highlight_end = static_cast<long>(text_.size()-1);
        if (highlight_start <= highlight_end)
            on_text_is_selected();
        parent.invalidate_rectangle(rect);
    }

// ----------------------------------------------------------------------------------------

    void text_box::
    on_delete_selected (
    )
    {
        if (highlight_start <= highlight_end)
        {
            text_ = text_.erase(highlight_start,highlight_end-highlight_start+1);
            move_cursor(highlight_start);
            highlight_start = 0;
            highlight_end = -1;

            on_no_text_selected();
            // send out the text modified event
            if (text_modified_handler.is_set())
                text_modified_handler();

            adjust_total_rect();

            parent.invalidate_rectangle(rect);
        }
    }

// ----------------------------------------------------------------------------------------

    void text_box::
    on_text_is_selected (
    )
    {
        right_click_menu.menu().enable_menu_item(0);
        right_click_menu.menu().enable_menu_item(1);
        right_click_menu.menu().enable_menu_item(3);
    }

// ----------------------------------------------------------------------------------------

    void text_box::
    on_no_text_selected (
    )
    {
        right_click_menu.menu().disable_menu_item(0);
        right_click_menu.menu().disable_menu_item(1);
        right_click_menu.menu().disable_menu_item(3);
    }

// ----------------------------------------------------------------------------------------

    void text_box::
    show (
    )
    {
        scrollable_region::show();
        right_click_menu.show();
    }

// ----------------------------------------------------------------------------------------

    void text_box::
    disable (
    )
    {
        auto_mutex M(m);
        scrollable_region::disable();
        t.stop();
        has_focus = false;
        cursor_visible = false;
        right_click_menu.disable();
    }

// ----------------------------------------------------------------------------------------

    void text_box::
    hide (
    )
    {
        auto_mutex M(m);
        scrollable_region::hide();
        t.stop();
        has_focus = false;
        cursor_visible = false;
    }

// ----------------------------------------------------------------------------------------

    void text_box::
    adjust_total_rect (
    )
    {
        const unsigned long padding = style->get_padding(*mfont);
        unsigned long text_width;
        unsigned long text_height;

        mfont->compute_size(text_, text_width, text_height);

        set_total_rect_size(text_width + padding*2, text_height + padding*2);
    }

// ----------------------------------------------------------------------------------------

    void text_box::
    set_main_font (
        const shared_ptr_thread_safe<font>& f
    )
    {
        auto_mutex M(m);
        mfont = f;
        adjust_total_rect();
        right_click_menu.set_rect(display_rect());
    }

// ----------------------------------------------------------------------------------------

    void text_box::
    draw (
        const canvas& c
    ) const
    {
        scrollable_region::draw(c);
        rectangle area = rect.intersect(c);
        if (area.is_empty())
            return;
       
        const point origin(total_rect().left(), total_rect().top());

        style->draw_text_box(c,display_rect(),get_text_rect(), enabled, *mfont, text_, 
                             translate_rect(cursor_rect, origin), 
                               text_color_, bg_color_, has_focus, cursor_visible, highlight_start,
                               highlight_end);
    }

// ----------------------------------------------------------------------------------------

    void text_box::
    set_text (
        const std::string& text
    )
    {
        set_text(convert_mbstring_to_wstring(text));
    }

    void text_box::
    set_text (
        const std::wstring& text
    )
    {
        set_text(convert_wstring_to_utf32(text));
    }

    void text_box::
    set_text (
        const dlib::ustring& text
    )
    {
        auto_mutex M(m);
        // do this to get rid of any reference counting that may be present in 
        // the std::string implementation.
        text_ = text.c_str();
                
        adjust_total_rect();
        move_cursor(0);

        highlight_start = 0;
        highlight_end = -1;
    }

// ----------------------------------------------------------------------------------------

    const std::string text_box::
    text (
    ) const
    {
        std::string temp = convert_wstring_to_mbstring(wtext());
        return temp;
    }

    const std::wstring text_box::
    wtext (
    ) const
    {
        std::wstring temp = convert_utf32_to_wstring(utext());
        return temp;
    }
    
    const dlib::ustring text_box::
    utext (
    ) const
    {
        auto_mutex M(m);
        // do this to get rid of any reference counting that may be present in 
        // the dlib::ustring implementation.
        dlib::ustring temp = text_.c_str();
        return temp;
    }

// ----------------------------------------------------------------------------------------

    void text_box::
    set_size (
        unsigned long width,
        unsigned long height 
    )
    {        
        auto_mutex M(m);
        scrollable_region::set_size(width,height);
        right_click_menu.set_rect(display_rect());
    }

// ----------------------------------------------------------------------------------------

    void text_box::
    set_pos (
        long x,
        long y
    )
    {
        scrollable_region::set_pos(x,y);
        right_click_menu.set_rect(get_text_rect());
    }

// ----------------------------------------------------------------------------------------

    void text_box::
    set_background_color (
        const rgb_pixel color
    )
    {
        auto_mutex M(m);
        bg_color_ = color;
        parent.invalidate_rectangle(rect);
    }

// ----------------------------------------------------------------------------------------

    const rgb_pixel text_box::
    background_color (
    ) const
    {
        auto_mutex M(m);
        return bg_color_;
    }

// ----------------------------------------------------------------------------------------

    void text_box::
    set_text_color (
        const rgb_pixel color
    )
    {
        auto_mutex M(m);
        text_color_ = color;
        parent.invalidate_rectangle(rect);
    }

// ----------------------------------------------------------------------------------------

    const rgb_pixel text_box::
    text_color (
    ) const
    {
        auto_mutex M(m);
        return text_color_;
    }

// ----------------------------------------------------------------------------------------

    void text_box::
    on_mouse_move (
        unsigned long state,
        long x,
        long y
    )
    {
        if (!enabled || hidden || !has_focus)
        {
            return;
        }

        if (state & base_window::LEFT)
        {
            if (highlight_start <= highlight_end)
            {
                if (highlight_start == cursor_pos)
                    shift_pos = highlight_end + 1;
                else
                    shift_pos = highlight_start;
            }

            unsigned long new_pos = mfont->compute_cursor_pos(get_text_rect(),text_,x,y);
            if (static_cast<long>(new_pos) != cursor_pos)
            {
                move_cursor(new_pos);
                parent.invalidate_rectangle(rect);
            }
        }
        else if (shift_pos != -1)
        {
            shift_pos = -1;
        }

    }

// ----------------------------------------------------------------------------------------

    void text_box::
    on_mouse_up (
        unsigned long btn,
        unsigned long,
        long ,
        long 
    )
    {
        if (!enabled || hidden)
            return;

        if (btn == base_window::LEFT)
            shift_pos = -1;
    }

// ----------------------------------------------------------------------------------------

    void text_box::
    on_mouse_down (
        unsigned long btn,
        unsigned long state,
        long x,
        long y,
        bool double_clicked 
    )
    {
        using namespace std;
        if (!enabled || hidden || btn != (unsigned long)base_window::LEFT)
            return;

        if (display_rect().contains(x,y))
        {
            has_focus = true;
            cursor_visible = true;
            parent.invalidate_rectangle(rect);
            t.start();

            
            if (double_clicked)
            {
                // highlight the double clicked word
                string::size_type first, last;
                const ustring ustr = convert_utf8_to_utf32(std::string(" \t\n"));
                first = text_.substr(0,cursor_pos).find_last_of(ustr.c_str());
                last = text_.find_first_of(ustr.c_str(),cursor_pos);
                long f = static_cast<long>(first);
                long l = static_cast<long>(last);
                if (first == string::npos)
                    f = -1;
                if (last == string::npos)
                    l = static_cast<long>(text_.size());

                ++f;
                --l;

                move_cursor(l+1);
                highlight_start = f;
                highlight_end = l;
                on_text_is_selected();
            }
            else
            {
                if (state & base_window::SHIFT)
                {
                    if (highlight_start <= highlight_end)
                    {
                        if (highlight_start == cursor_pos)
                            shift_pos = highlight_end + 1;
                        else
                            shift_pos = highlight_start;
                    }
                    else
                    {
                        shift_pos = cursor_pos;
                    }
                }

                bool at_end = false;
                if (cursor_pos == 0 || cursor_pos == static_cast<long>(text_.size()))
                    at_end = true;
                const long old_pos = cursor_pos;

                unsigned long new_pos = mfont->compute_cursor_pos(get_text_rect(),text_,x,y);
                move_cursor(new_pos);

                shift_pos = cursor_pos;

                if (at_end && cursor_pos == old_pos)
                {
                    highlight_start = 0;
                    highlight_end = -1;
                    on_no_text_selected();
                }
            }

        }
        else if (has_focus && rect.contains(x,y) == false)
        {
            t.stop();
            has_focus = false;
            cursor_visible = false;
            shift_pos = -1;
            highlight_start = 0;
            highlight_end = -1;
            on_no_text_selected();

            if (focus_lost_handler.is_set())
                focus_lost_handler();
            parent.invalidate_rectangle(rect);
        }
        else
        {
            has_focus = false;
        }
    }

// ----------------------------------------------------------------------------------------

    void text_box::
    on_keydown (
        unsigned long key,
        bool is_printable,
        unsigned long state
    )
    {
        // If the right click menu is up then we don't want to do anything with
        // the keyboard ourselves.  Let the popup menu use the keyboard for now.
        if (right_click_menu.popup_menu_visible())
            return;

        if (has_focus && enabled && !hidden)
        {
            const ustring space_str = convert_utf8_to_utf32(std::string(" \t\n"));
            const bool shift = (state&base_window::KBD_MOD_SHIFT) != 0;
            const bool ctrl = (state&base_window::KBD_MOD_CONTROL) != 0;

            if (shift && is_printable == false)
            {
                if (shift_pos == -1)
                {
                    if (highlight_start <= highlight_end)
                    {
                        if (highlight_start == cursor_pos)
                            shift_pos = highlight_end + 1;
                        else
                            shift_pos = highlight_start;
                    }
                    else
                    {
                        shift_pos = cursor_pos;
                    }
                }
            }
            else
            {
                shift_pos = -1;
            }

            if (key == base_window::KEY_LEFT)
            {
                if (cursor_pos != 0)
                {
                    unsigned long new_pos;
                    if (ctrl)
                    {
                        // find the first non-whitespace to our left
                        std::string::size_type pos = text_.find_last_not_of(space_str.c_str(),cursor_pos);
                        if (pos != std::string::npos)
                        {
                            pos = text_.find_last_of(space_str.c_str(),pos);
                            if (pos != std::string::npos)
                                new_pos = static_cast<unsigned long>(pos);
                            else
                                new_pos = 0;
                        }
                        else
                        {
                            new_pos = 0;
                        }
                    }
                    else
                    {
                        new_pos = cursor_pos-1;
                    }

                    move_cursor(new_pos);
                }
                else if (shift_pos == -1)
                {
                    highlight_start = 0;
                    highlight_end = -1;
                    on_no_text_selected();
                    parent.invalidate_rectangle(rect);
                }

            }
            else if (key == base_window::KEY_RIGHT)
            {
                if (cursor_pos != static_cast<long>(text_.size()))
                {
                    unsigned long new_pos;
                    if (ctrl)
                    {
                        // find the first non-whitespace to our left
                        std::string::size_type pos = text_.find_first_not_of(space_str.c_str(),cursor_pos);
                        if (pos != std::string::npos)
                        {
                            pos = text_.find_first_of(space_str.c_str(),pos);
                            if (pos != std::string::npos)
                                new_pos = static_cast<unsigned long>(pos+1);
                            else
                                new_pos = static_cast<unsigned long>(text_.size());
                        }
                        else
                        {
                            new_pos = static_cast<unsigned long>(text_.size());
                        }
                    }
                    else
                    {
                        new_pos = cursor_pos+1;
                    }

                    move_cursor(new_pos);
                }
                else if (shift_pos == -1)
                {
                    highlight_start = 0;
                    highlight_end = -1;
                    on_no_text_selected();
                    parent.invalidate_rectangle(rect);
                }
            }
            else if (key == base_window::KEY_UP)
            {
                if (ctrl)
                {
                    move_cursor(0);
                }
                else
                {
                    const point origin(total_rect().left(), total_rect().top());
                    // move the cursor so the position that is just a few pixels above 
                    // the current cursor_rect
                    move_cursor(mfont->compute_cursor_pos(
                            get_text_rect(), text_, cursor_rect.left()+origin.x(), 
                            cursor_rect.top()+origin.y()-mfont->height()/2));

                }

                if (shift_pos == -1)
                {
                    highlight_start = 0;
                    highlight_end = -1;
                    on_no_text_selected();
                    parent.invalidate_rectangle(rect);
                }
            }
            else if (key == base_window::KEY_DOWN)
            {
                if (ctrl)
                {
                    move_cursor(static_cast<unsigned long>(text_.size()));
                }
                else
                {
                    const point origin(total_rect().left(), total_rect().top());
                    // move the cursor so the position that is just a few pixels above 
                    // the current cursor_rect
                    move_cursor(mfont->compute_cursor_pos(
                            get_text_rect(), text_, cursor_rect.left()+origin.x(), 
                            cursor_rect.bottom()+origin.y()+mfont->height()/2));
                }

                if (shift_pos == -1)
                {
                    highlight_start = 0;
                    highlight_end = -1;
                    on_no_text_selected();
                    parent.invalidate_rectangle(rect);
                }
            }
            else if (is_printable)
            {
                if (ctrl)
                {
                    if (key == 'a')
                    {
                        on_select_all();
                    }
                    else if (key == 'c')
                    {
                        on_copy();
                    }
                    else if (key == 'v')
                    {
                        on_paste();
                    }
                    else if (key == 'x')
                    {
                        on_cut();
                    }
                }
                else 
                {
                    if (highlight_start <= highlight_end)
                    {
                        text_ = text_.substr(0,highlight_start) + static_cast<unichar>(key) +
                            text_.substr(highlight_end+1,text_.size()-highlight_end-1);

                        adjust_total_rect();
                        move_cursor(highlight_start+1);
                        highlight_start = 0;
                        highlight_end = -1;
                        on_no_text_selected();
                    }
                    else
                    {
                        text_ = text_.substr(0,cursor_pos) + static_cast<unichar>(key) +
                            text_.substr(cursor_pos,text_.size()-cursor_pos);
                        adjust_total_rect();
                        move_cursor(cursor_pos+1);
                    }

                    // send out the text modified event
                    if (text_modified_handler.is_set())
                        text_modified_handler();

                }

                if (key == '\n')
                {
                    if (enter_key_handler.is_set())
                        enter_key_handler();
                }
            }
            else if (key == base_window::KEY_BACKSPACE)
            {                
                // if something is highlighted then delete that
                if (highlight_start <= highlight_end)
                {
                    on_delete_selected();
                }
                else if (cursor_pos != 0)
                {
                    text_ = text_.erase(cursor_pos-1,1);
                    adjust_total_rect();
                    move_cursor(cursor_pos-1);

                    // send out the text modified event
                    if (text_modified_handler.is_set())
                        text_modified_handler();
                }
                else
                {
                    // do this just so it repaints itself right
                    move_cursor(cursor_pos);
                }

            }
            else if (key == base_window::KEY_DELETE)
            {
                // if something is highlighted then delete that
                if (highlight_start <= highlight_end)
                {
                    on_delete_selected();
                }
                else if (cursor_pos != static_cast<long>(text_.size()))
                {
                    text_ = text_.erase(cursor_pos,1);

                    adjust_total_rect();
                    // send out the text modified event
                    if (text_modified_handler.is_set())
                        text_modified_handler();
                }
                else
                {
                    // do this just so it repaints itself right
                    move_cursor(cursor_pos);
                }

            }
            else if (key == base_window::KEY_HOME)
            {
                if (ctrl)
                {
                    move_cursor(0);
                }
                else if (cursor_pos != 0)
                {
                    // find the start of the current line
                    ustring::size_type pos = text_.find_last_of('\n',cursor_pos-1);
                    if (pos == ustring::npos)
                        pos = 0;
                    else
                        pos += 1;
                    move_cursor(static_cast<unsigned long>(pos));

                }

                if (shift_pos == -1)
                {
                    highlight_start = 0;
                    highlight_end = -1;
                    on_no_text_selected();
                    parent.invalidate_rectangle(rect);
                }
            }
            else if (key == base_window::KEY_END)
            {
                if (ctrl)
                {
                    move_cursor(static_cast<unsigned long>(text_.size()));
                }
                {
                    ustring::size_type pos = text_.find_first_of('\n',cursor_pos);
                    if (pos == ustring::npos)
                        pos = text_.size();

                    move_cursor(static_cast<unsigned long>(pos));
                }

                if (shift_pos == -1)
                {
                    highlight_start = 0;
                    highlight_end = -1;
                    on_no_text_selected();
                    parent.invalidate_rectangle(rect);
                }
            }
            else if (key == base_window::KEY_PAGE_DOWN || key == base_window::KEY_PAGE_UP)
            {
                long jump_size = display_rect().height() - 
                    std::min(mfont->height()*3, display_rect().height()/5);

                // if we are supposed to page up then just jump in the other direction
                if (key == base_window::KEY_PAGE_UP)
                    jump_size = -jump_size;

                scroll_to_rect(translate_rect(display_rect(), point(0, jump_size ))); 
            }

            cursor_visible = true;
            recent_movement = true;

        }
    }

// ---------------------------------------------------------------------------------------- 

    void text_box::
    on_string_put(
        const std::wstring &str
    )
    {
        if (has_focus && enabled && !hidden)
        {
            ustring ustr = convert_wstring_to_utf32(str);
            if (highlight_start <= highlight_end)
            {
                text_ = text_.substr(0,highlight_start) + ustr +
                    text_.substr(highlight_end+1,text_.size()-highlight_end-1);

                adjust_total_rect();
                move_cursor(highlight_start+ustr.size());
                highlight_start = 0;
                highlight_end = -1;
                on_no_text_selected();
            }
            else
            {
                text_ = text_.substr(0,cursor_pos) + ustr +
                    text_.substr(cursor_pos,text_.size()-cursor_pos);

                adjust_total_rect();
                move_cursor(cursor_pos+ustr.size());
            }


            // send out the text modified event
            if (text_modified_handler.is_set())
                text_modified_handler();
        }
    }
    
// ----------------------------------------------------------------------------------------

    void text_box::
    move_cursor (
        unsigned long pos
    )
    {
        using namespace std;
        const long old_cursor_pos = cursor_pos;



        // figure out where the cursor is supposed to be
        cursor_rect = mfont->compute_cursor_rect(get_text_rect(), text_, pos);
        const point origin(total_rect().left(), total_rect().top());


        cursor_pos = pos;     


        const unsigned long padding = style->get_padding(*mfont);

        // find the delta between the cursor rect and the corner of the total rect 
        point delta = point(cursor_rect.left(), cursor_rect.top()) - point(total_rect().left(), total_rect().top());

        // now scroll us so that we can see the current cursor 
        scroll_to_rect(centered_rect(cursor_rect, cursor_rect.width() + padding + 6, cursor_rect.height() + 1));

        // adjust the cursor_rect so that it is relative to the total_rect
        cursor_rect = translate_rect(cursor_rect, -origin);

        parent.set_im_pos(cursor_rect.left(), cursor_rect.top());

        if (old_cursor_pos != cursor_pos)
        {
            if (shift_pos != -1)
            {
                highlight_start = std::min(shift_pos,cursor_pos);
                highlight_end = std::max(shift_pos,cursor_pos)-1;
            }

            if (highlight_start > highlight_end)
                on_no_text_selected();
            else
                on_text_is_selected();

            recent_movement = true;
            cursor_visible = true;
            parent.invalidate_rectangle(display_rect());
        }

        if (shift_pos == -1)
        {
            highlight_start = 0;
            highlight_end = -1;
        }
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
//       perspective_display member functions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    perspective_display::
    perspective_display(  
        drawable_window& w
    ) : 
        drawable(w,MOUSE_MOVE|MOUSE_CLICK|MOUSE_WHEEL)
    {
        clear_overlay();
        enable_events(); 
    }

// ----------------------------------------------------------------------------------------

    perspective_display::
    ~perspective_display(
    )
    {
        disable_events();
        parent.invalidate_rectangle(rect); 
    }

// ----------------------------------------------------------------------------------------

    void perspective_display::
    set_size (
        unsigned long width,
        unsigned long height 
    )
    {
        auto_mutex lock(m);
        rectangle old(rect);
        rect = resize_rect(rect,width,height);
        tform = camera_transform(tform.get_camera_pos(),
            tform.get_camera_looking_at(),
            tform.get_camera_up_direction(),
            tform.get_camera_field_of_view(),
            std::min(rect.width(),rect.height()));
        parent.invalidate_rectangle(old+rect);
    }

// ----------------------------------------------------------------------------------------

    void perspective_display::
    add_overlay (
        const std::vector<overlay_line>& overlay
    )
    {
        auto_mutex M(m);
        if (overlay.size() == 0)
            return;
        // push this new overlay into our overlay vector
        overlay_lines.insert(overlay_lines.end(), overlay.begin(), overlay.end());

        for (unsigned long i = 0; i < overlay.size(); ++i)
        {
            sum_pts += overlay[i].p1;
            sum_pts += overlay[i].p2;
            max_pts.x() = std::max(overlay[i].p1.x(), max_pts.x());
            max_pts.x() = std::max(overlay[i].p2.x(), max_pts.x());
            max_pts.y() = std::max(overlay[i].p1.y(), max_pts.y());
            max_pts.y() = std::max(overlay[i].p2.y(), max_pts.y());
            max_pts.z() = std::max(overlay[i].p1.z(), max_pts.z());
            max_pts.z() = std::max(overlay[i].p2.z(), max_pts.z());
        }

        tform = camera_transform(max_pts,
            sum_pts/(overlay_lines.size()*2+overlay_dots.size()),
            vector<double>(0,0,1),
            tform.get_camera_field_of_view(),
            std::min(rect.width(),rect.height()));


        // make the parent window redraw us now that we changed the overlay
        parent.invalidate_rectangle(rect);
    }

// ----------------------------------------------------------------------------------------

    void perspective_display::
    add_overlay (
        const std::vector<overlay_dot>& overlay
    )
    {
        auto_mutex M(m);
        if (overlay.size() == 0)
            return;

        for (unsigned long i = 0; i < overlay.size(); ++i)
        {
            overlay_dots.push_back(overlay[i]);

            sum_pts += overlay[i].p;
            max_pts.x() = std::max(overlay[i].p.x(), max_pts.x());
            max_pts.y() = std::max(overlay[i].p.y(), max_pts.y());
            max_pts.z() = std::max(overlay[i].p.z(), max_pts.z());
        }

        tform = camera_transform(max_pts,
            sum_pts/(overlay_lines.size()*2+overlay_dots.size()),
            vector<double>(0,0,1),
            tform.get_camera_field_of_view(),
            std::min(rect.width(),rect.height()));


        // make the parent window redraw us now that we changed the overlay
        parent.invalidate_rectangle(rect);
    }

// ----------------------------------------------------------------------------------------

    void perspective_display::
    clear_overlay (
    )
    {
        auto_mutex lock(m);
        overlay_dots.clear();
        overlay_lines.clear();
        sum_pts = vector<double>();
        max_pts = vector<double>(-std::numeric_limits<double>::infinity(),
            -std::numeric_limits<double>::infinity(),
            -std::numeric_limits<double>::infinity());

        parent.invalidate_rectangle(rect);
    }

// ----------------------------------------------------------------------------------------

    void perspective_display::
    set_dot_double_clicked_handler (
        const any_function<void(const vector<double>&)>& event_handler_
    )
    {
        auto_mutex M(m);
        dot_clicked_event_handler = event_handler_;
    }

// ----------------------------------------------------------------------------------------

    void perspective_display::
    draw (
        const canvas& c
    ) const
    {
        if (depth.nr() < (long)c.height() || depth.nc() < (long)c.width())
            depth.set_size(c.height(), c.width());
        assign_all_pixels(depth, std::numeric_limits<float>::infinity());

        rectangle area = rect.intersect(c);
        fill_rect(c, area, 0);
        for (unsigned long i = 0; i < overlay_lines.size(); ++i)
        {
            draw_line(c, tform(overlay_lines[i].p1)+rect.tl_corner(),
                         tform(overlay_lines[i].p2)+rect.tl_corner(), 
                         overlay_lines[i].color, 
                         area);
        }
        for (unsigned long i = 0; i < overlay_dots.size(); ++i)
        {
            double scale, distance;
            point p = tform(overlay_dots[i].p, scale, distance) + rect.tl_corner();
            if (area.contains(p) && depth[p.y()-c.top()][p.x()-c.left()] > distance)
            {
                depth[p.y()-c.top()][p.x()-c.left()] = distance;
                assign_pixel(c[p.y()-c.top()][p.x()-c.left()], overlay_dots[i].color);
            }
        }

    }

// ----------------------------------------------------------------------------------------

    void perspective_display::
    on_wheel_up (
        unsigned long //state
    )
    {
        if (rect.contains(lastx,lasty) == false || hidden || !enabled)
            return;

        const double alpha = 0.10;
        const vector<double> delta = alpha*(tform.get_camera_pos() - tform.get_camera_looking_at());
        tform = camera_transform(
            tform.get_camera_pos() - delta,
            tform.get_camera_looking_at(),
            tform.get_camera_up_direction(),
            tform.get_camera_field_of_view(),
            std::min(rect.width(),rect.height()));
        parent.invalidate_rectangle(rect);
    }

// ----------------------------------------------------------------------------------------

    void perspective_display::
    on_wheel_down (
        unsigned long //state
    )
    {
        if (rect.contains(lastx,lasty) == false || hidden || !enabled)
            return;

        const double alpha = 0.10;
        const vector<double> delta = alpha*(tform.get_camera_pos() - tform.get_camera_looking_at());
        tform = camera_transform(
            tform.get_camera_pos() + delta,
            tform.get_camera_looking_at(),
            tform.get_camera_up_direction(),
            tform.get_camera_field_of_view(),
            std::min(rect.width(),rect.height()));
        parent.invalidate_rectangle(rect);
    }

// ----------------------------------------------------------------------------------------

    void perspective_display::
    on_mouse_down (
        unsigned long btn,
        unsigned long, //state
        long x,
        long y,
        bool is_double_click
    )
    {
        if (btn == base_window::LEFT || btn == base_window::RIGHT)
        {
            last = point(x,y);
        }
        if (is_double_click && btn == base_window::LEFT && enabled && !hidden && overlay_dots.size() != 0)
        {
            double best_dist = std::numeric_limits<double>::infinity();
            unsigned long best_idx = 0;
            const dpoint pp(x,y);
            for (unsigned long i = 0; i < overlay_dots.size(); ++i)
            {
                dpoint p = tform(overlay_dots[i].p) + rect.tl_corner();
                double dist = length_squared(p-pp);
                if (dist < best_dist)
                {
                    best_dist = dist;
                    best_idx = i;
                }
            }
            if (dot_clicked_event_handler.is_set())
                dot_clicked_event_handler(overlay_dots[best_idx].p);
        }
    }

// ----------------------------------------------------------------------------------------

    void perspective_display::
    on_mouse_move (
        unsigned long state,
        long x,
        long y
    )
    {
        if (!enabled || hidden)
            return;

        if (state == base_window::LEFT)
        {
            const point cur(x, y);
            dpoint delta = last-cur;
            last = cur;

            const vector<double> radius = tform.get_camera_pos()-tform.get_camera_looking_at();
            delta *= 2*pi*length(radius)/600.0;
            vector<double> tangent_x = tform.get_camera_up_direction().cross(radius).normalize();
            vector<double> tangent_y = radius.cross(tangent_x).normalize();
            vector<double> new_pos = tform.get_camera_pos() + tangent_x*delta.x() + tangent_y*-delta.y(); 

            // now make it have the correct radius relative to the looking at point.
            new_pos = (new_pos-tform.get_camera_looking_at()).normalize()*length(radius) + tform.get_camera_looking_at();

            tform = camera_transform(new_pos,
                tform.get_camera_looking_at(),
                tangent_y,
                tform.get_camera_field_of_view(),
                std::min(rect.width(),rect.height()));
            parent.invalidate_rectangle(rect);
        }
        else if (state == (base_window::LEFT|base_window::SHIFT) ||
            state == base_window::RIGHT)
        {
            const point cur(x, y);
            dpoint delta = last-cur;
            last = cur;

            const vector<double> radius = tform.get_camera_pos()-tform.get_camera_looking_at();
            delta *= 2*pi*length(radius)/600.0;
            vector<double> tangent_x = tform.get_camera_up_direction().cross(radius).normalize();
            vector<double> tangent_y = radius.cross(tangent_x).normalize();

            vector<double> offset = tangent_x*delta.x() + tangent_y*-delta.y(); 


            tform = camera_transform(
                tform.get_camera_pos()+offset,
                tform.get_camera_looking_at()+offset,
                tform.get_camera_up_direction(),
                tform.get_camera_field_of_view(),
                std::min(rect.width(),rect.height()));
            parent.invalidate_rectangle(rect);
        }
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
//       image_display member functions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    namespace impl
    {
        class image_display_functor
        {
            const std::string str;
            const member_function_pointer<const std::string&> mfp;
        public:
            image_display_functor (
                const std::string& str_,
                const member_function_pointer<const std::string&>& mfp_
            ) : str(str_),
                mfp(mfp_)
            {}

            void operator() (
            ) const { mfp(str); }
        };
    }

    image_display::
    image_display(  
        drawable_window& w
    ): 
        scrollable_region(w,KEYBOARD_EVENTS),
        zoom_in_scale(1),
        zoom_out_scale(1),
        drawing_rect(true),
        rect_is_selected(false),
        selected_rect(0),
        default_rect_color(255,0,0,255),
        parts_menu(w),
        part_width(15), // width part circles are drawn on the screen
        overlay_editing_enabled(true),
        highlight_timer(*this, &image_display::timer_event_unhighlight_rect),
        highlighted_rect(std::numeric_limits<unsigned long>::max())
    { 
        enable_mouse_drag();

        highlight_timer.set_delay_time(250);
        set_horizontal_scroll_increment(1);
        set_vertical_scroll_increment(1);
        set_horizontal_mouse_wheel_scroll_increment(30);
        set_vertical_mouse_wheel_scroll_increment(30);

        parts_menu.disable();


        enable_events(); 
    }

// ----------------------------------------------------------------------------------------

    void image_display::
    on_part_add (
        const std::string& part_name
    )
    {
        if (!rect_is_selected)
            return;

        const rectangle valid_area = get_rect_on_screen(selected_rect);
        const point loc = nearest_point(valid_area,last_right_click_pos);
        
        // Transform loc from gui window space into the space used by the overlay
        // rectangles (i.e. relative to the raw image)
        const point origin(total_rect().tl_corner());
        point c1 = loc - origin;
        if (zoom_in_scale != 1)
        {
            c1 = c1/(double)zoom_in_scale;
        }
        else if (zoom_out_scale != 1)
        {
            c1 = c1*(double)zoom_out_scale;
        }

        overlay_rects[selected_rect].parts[part_name] = c1;
        parent.invalidate_rectangle(rect); 

        if (event_handler.is_set())
            event_handler();
    }

// ----------------------------------------------------------------------------------------

    image_display::
    ~image_display(
    )
    {
        highlight_timer.stop_and_wait();
        disable_events();
        parent.invalidate_rectangle(rect); 
    }

// ----------------------------------------------------------------------------------------

    rectangle image_display::
    get_image_display_rect (
    ) const
    {
        if (zoom_in_scale != 1)
        {
            return rectangle(0,0, img.nc()*zoom_in_scale-1, img.nr()*zoom_in_scale-1);
        }
        else if (zoom_out_scale != 1)
        {
            return rectangle(0,0, img.nc()/zoom_out_scale-1, img.nr()/zoom_out_scale-1);
        }
        else
        {
            return dlib::get_rect(img);
        }
    }

// ----------------------------------------------------------------------------------------

    void image_display::
    add_overlay (
        const overlay_rect& overlay
    )
    {
        auto_mutex M(m);
        // push this new overlay into our overlay vector
        overlay_rects.push_back(overlay);

        // make the parent window redraw us now that we changed the overlay
        parent.invalidate_rectangle(rect);
    }

// ----------------------------------------------------------------------------------------

    void image_display::
    add_overlay (
        const overlay_line& overlay
    )
    {
        auto_mutex M(m);

        // push this new overlay into our overlay vector
        overlay_lines.push_back(overlay);

        // make the parent window redraw us now that we changed the overlay
        parent.invalidate_rectangle(get_rect_on_screen(rectangle(overlay.p1, overlay.p2)));
    }

// ----------------------------------------------------------------------------------------

    void image_display::
    add_overlay (
        const overlay_circle& overlay
    )
    {
        auto_mutex M(m);

        // push this new overlay into our overlay vector
        overlay_circles.push_back(overlay);

        // make the parent window redraw us now that we changed the overlay
        parent.invalidate_rectangle(rect);
    }

// ----------------------------------------------------------------------------------------

    void image_display::
    add_overlay (
        const std::vector<overlay_rect>& overlay
    )
    {
        auto_mutex M(m);

        // push this new overlay into our overlay vector
        overlay_rects.insert(overlay_rects.end(), overlay.begin(), overlay.end());

        // make the parent window redraw us now that we changed the overlay
        parent.invalidate_rectangle(rect);
    }

// ----------------------------------------------------------------------------------------

    void image_display::
    add_overlay (
        const std::vector<overlay_line>& overlay
    )
    {
        auto_mutex M(m);

        // push this new overlay into our overlay vector
        overlay_lines.insert(overlay_lines.end(), overlay.begin(), overlay.end());

        // make the parent window redraw us now that we changed the overlay
        parent.invalidate_rectangle(rect);
    }

// ----------------------------------------------------------------------------------------

    void image_display::
    add_overlay (
        const std::vector<overlay_circle>& overlay
    )
    {
        auto_mutex M(m);

        // push this new overlay into our overlay vector
        overlay_circles.insert(overlay_circles.end(), overlay.begin(), overlay.end());

        // make the parent window redraw us now that we changed the overlay
        parent.invalidate_rectangle(rect);
    }

// ----------------------------------------------------------------------------------------

    void image_display::
    clear_overlay (
    )
    {
        auto_mutex M(m);
        overlay_rects.clear();
        overlay_lines.clear();
        overlay_circles.clear();
        parent.invalidate_rectangle(rect);
    }

// ----------------------------------------------------------------------------------------

    rectangle image_display::
    get_rect_on_screen (
        rectangle orect 
    ) const
    {
        const point origin(total_rect().tl_corner());
        orect.left()   = orect.left()*zoom_in_scale/zoom_out_scale;
        orect.top()    = orect.top()*zoom_in_scale/zoom_out_scale;
        if (zoom_in_scale != 1)
        {
            // make it so the box surrounds the pixels when we zoom in.
            orect.right()  = (orect.right()+1)*zoom_in_scale/zoom_out_scale;
            orect.bottom() = (orect.bottom()+1)*zoom_in_scale/zoom_out_scale;
        }
        else
        {
            orect.right()  = orect.right()*zoom_in_scale/zoom_out_scale;
            orect.bottom() = orect.bottom()*zoom_in_scale/zoom_out_scale;
        }

        return translate_rect(orect, origin);
    }

// ----------------------------------------------------------------------------------------

    rectangle image_display::
    get_rect_on_screen (
        unsigned long idx
    ) const
    {
        return get_rect_on_screen(overlay_rects[idx].rect);
    }

// ----------------------------------------------------------------------------------------

    void image_display::
    draw (
        const canvas& c
    ) const
    {
        scrollable_region::draw(c);

        rectangle area = display_rect().intersect(c);
        if (area.is_empty())
            return;

        const point origin(total_rect().tl_corner());
        
        // draw the image on the screen
        const rectangle img_area = total_rect().intersect(area);
        for (long row = img_area.top(); row <= img_area.bottom(); ++row)
        {
            for (long col = img_area.left(); col <= img_area.right(); ++col)
            {
                assign_pixel(c[row-c.top()][col-c.left()], 
                             img[(row-origin.y())*zoom_out_scale/zoom_in_scale][(col-origin.x())*zoom_out_scale/zoom_in_scale]);
            }
        }

        // now draw all the overlay rectangles
        for (unsigned long i = 0; i < overlay_rects.size(); ++i)
        {
            const rectangle orect = get_rect_on_screen(i);

            if (rect_is_selected && selected_rect == i)
            {
                draw_rectangle(c, orect, invert_pixel(overlay_rects[i].color), area);
            }
            else if (highlighted_rect < overlay_rects.size() && highlighted_rect == i)
            {
                // Draw the rectangle wider and with a slightly different color that tapers
                // out at the edges of the line.
                hsi_pixel temp;
                assign_pixel(temp, 0);
                assign_pixel(temp, overlay_rects[i].color);
                temp.s = 255;
                temp.h = temp.h + 20;
                if (temp.i < 245)
                    temp.i += 10;
                rgb_pixel p;
                assign_pixel(p, temp);
                rgb_alpha_pixel po, po2;
                assign_pixel(po, p);
                po.alpha = 160;
                po2 = po;
                po2.alpha = 90;
                draw_rectangle(c, grow_rect(orect,2), po2, area);
                draw_rectangle(c, grow_rect(orect,1), po, area);
                draw_rectangle(c, orect, p, area);
                draw_rectangle(c, shrink_rect(orect,1), po, area);
                draw_rectangle(c, shrink_rect(orect,2), po2, area);
            }
            else
            {
                draw_rectangle(c, orect, overlay_rects[i].color, area);
            }

            if (overlay_rects[i].label.size() != 0)
            {
                // make a rectangle that is at the spot we want to draw our string
                rectangle r(orect.br_corner(),  c.br_corner());
                mfont->draw_string(c, r, overlay_rects[i].label, overlay_rects[i].color, 0, 
                                   std::string::npos, area);
            }


            // draw circles for each "part" in this overlay rectangle.
            std::map<std::string,point>::const_iterator itr;
            for (itr = overlay_rects[i].parts.begin(); itr != overlay_rects[i].parts.end(); ++itr)
            {
                rectangle temp = centered_rect(get_rect_on_screen(centered_rect(itr->second,1,1)), part_width, part_width);

                if (rect_is_selected && selected_rect == i && 
                    selected_part_name.size() != 0 && selected_part_name == itr->first)
                {
                    draw_circle(c, center(temp), temp.width()/2, invert_pixel(overlay_rects[i].color), area);
                }
                else
                {
                    draw_circle(c, center(temp), temp.width()/2, overlay_rects[i].color, area);
                }

                // make a rectangle that is at the spot we want to draw our string
                rectangle r((temp.br_corner() + temp.bl_corner())/2,  
                            c.br_corner());
                mfont->draw_string(c, r, itr->first, overlay_rects[i].color, 0, 
                                   std::string::npos, area);
            }

            if (overlay_rects[i].crossed_out)
            {
                if (rect_is_selected && selected_rect == i)
                {
                    draw_line(c, orect.tl_corner(), orect.br_corner(),invert_pixel(overlay_rects[i].color), area);
                    draw_line(c, orect.bl_corner(), orect.tr_corner(),invert_pixel(overlay_rects[i].color), area);
                }
                else
                {
                    draw_line(c, orect.tl_corner(), orect.br_corner(),overlay_rects[i].color, area);
                    draw_line(c, orect.bl_corner(), orect.tr_corner(),overlay_rects[i].color, area);
                }
            }
        }

        // now draw all the overlay lines 
        for (unsigned long i = 0; i < overlay_lines.size(); ++i)
        {
            draw_line(c, 
                      zoom_in_scale*overlay_lines[i].p1/zoom_out_scale + origin, 
                      zoom_in_scale*overlay_lines[i].p2/zoom_out_scale + origin, 
                      overlay_lines[i].color, area);
        }

        // now draw all the overlay circles 
        for (unsigned long i = 0; i < overlay_circles.size(); ++i)
        {
            const point center = zoom_in_scale*overlay_circles[i].center/zoom_out_scale + origin;
            const int radius = zoom_in_scale*overlay_circles[i].radius/zoom_out_scale;
            draw_circle(c, 
                      center, 
                      radius, 
                      overlay_circles[i].color, area);

            if (overlay_circles[i].label.size() != 0)
            {
                const point temp = center + point(0,radius);

                // make a rectangle that is at the spot we want to draw our string
                rectangle r(temp,  c.br_corner());
                mfont->draw_string(c, r, overlay_circles[i].label, overlay_circles[i].color, 0, 
                                   std::string::npos, area);
            }
        }

        if (drawing_rect)
            draw_rectangle(c, rect_to_draw, invert_pixel(default_rect_color), area);
    }

// ----------------------------------------------------------------------------------------

    void image_display::
    on_keydown (
        unsigned long key,
        bool is_printable,
        unsigned long state
    )
    {
        scrollable_region::on_keydown(key,is_printable, state);

        if (!is_printable && !hidden && enabled && rect_is_selected && 
            (key == base_window::KEY_BACKSPACE || key == base_window::KEY_DELETE))
        {
            moving_overlay = false;
            rect_is_selected = false;
            parts_menu.disable();
            if (selected_part_name.size() == 0)
                overlay_rects.erase(overlay_rects.begin() + selected_rect);
            else
                overlay_rects[selected_rect].parts.erase(selected_part_name);
            parent.invalidate_rectangle(rect);

            if (event_handler.is_set())
                event_handler();
        }

        if (is_printable && !hidden && enabled && rect_is_selected && (key == 'i'))
        {
            overlay_rects[selected_rect].crossed_out = !overlay_rects[selected_rect].crossed_out;
            parent.invalidate_rectangle(rect);

            if (event_handler.is_set())
                event_handler();
        }
    }

// ----------------------------------------------------------------------------------------

    void image_display::
    add_labelable_part_name (
        const std::string& name
    )
    {
        auto_mutex lock(m);
        if (part_names.insert(name).second)
        {
            member_function_pointer<const std::string&> mfp;
            mfp.set(*this,&image_display::on_part_add);
            parts_menu.menu().add_menu_item(menu_item_text("Add " + name,impl::image_display_functor(name,mfp)));
        }
    }

// ----------------------------------------------------------------------------------------

    void image_display::
    clear_labelable_part_names (
    )
    {
        auto_mutex lock(m);
        part_names.clear();
        parts_menu.menu().clear();
    }

// ----------------------------------------------------------------------------------------

    void image_display::
    on_mouse_down (
        unsigned long btn,
        unsigned long state,
        long x,
        long y,
        bool is_double_click
    )
    {
        scrollable_region::on_mouse_down(btn, state, x, y, is_double_click);

        if (rect.contains(x,y) == false || hidden || !enabled)
            return;

        if (image_clicked_handler.is_set())
        {
            const point origin(total_rect().tl_corner());
            point p(x,y);
            p -= origin;
            if (zoom_in_scale != 1)
                p = p/zoom_in_scale;
            else if (zoom_out_scale != 1)
                p = p*zoom_out_scale;

            if (dlib::get_rect(img).contains(p))
                image_clicked_handler(p, is_double_click, btn);
        }

        if (!overlay_editing_enabled)
            return;

        if (btn == base_window::RIGHT && (state&base_window::SHIFT))
        {
            const bool rect_was_selected = rect_is_selected;
            rect_is_selected = false;
            parts_menu.disable();

            long best_dist = std::numeric_limits<long>::max();
            long best_idx = 0;
            std::string best_part;

            // check if this click landed on any of the overlay rectangles
            for (unsigned long i = 0; i < overlay_rects.size(); ++i)
            {
                const rectangle orect = get_rect_on_screen(i);

                const long dist = distance_to_rect_edge(orect, point(x,y));

                if (dist < best_dist)
                {
                    best_dist = dist;
                    best_idx = i;
                    best_part.clear();
                }

                std::map<std::string,point>::const_iterator itr;
                for (itr = overlay_rects[i].parts.begin(); itr != overlay_rects[i].parts.end(); ++itr)
                {
                    rectangle temp = centered_rect(get_rect_on_screen(centered_rect(itr->second,1,1)), part_width, part_width);
                    point c = center(temp);

                    // distance from edge of part circle
                    const long dist = static_cast<long>(std::abs(length(c - point(x,y)) + 0.5 - temp.width()/2));
                    if (dist < best_dist)
                    {
                        best_idx = i;
                        best_dist = dist;
                        best_part = itr->first;
                    }
                }
            }


            if (best_dist < 13)
            {
                moving_overlay = true;
                moving_rect = best_idx;
                moving_part_name = best_part;
                // If we are moving one of the sides  of the rectangle rather than one of
                // the parts circles then we need to figure out which side of the rectangle
                // we are moving.
                if (best_part.size() == 0)
                {
                    // which side is the click closest to?
                    const rectangle orect = get_rect_on_screen(best_idx);
                    const point p = nearest_point(orect,point(x,y));
                    long dist_left   = std::abs(p.x()-orect.left());
                    long dist_top    = std::abs(p.y()-orect.top());
                    long dist_right  = std::abs(p.x()-orect.right());
                    long dist_bottom = std::abs(p.y()-orect.bottom());
                    long min_val = std::min(std::min(dist_left,dist_right),std::min(dist_top,dist_bottom));
                    if (dist_left == min_val)
                        moving_what = MOVING_RECT_LEFT;
                    else if (dist_top == min_val)
                        moving_what = MOVING_RECT_TOP;
                    else if (dist_right == min_val)
                        moving_what = MOVING_RECT_RIGHT;
                    else 
                        moving_what = MOVING_RECT_BOTTOM;
                }
                else
                {
                    moving_what = MOVING_PART;
                }
                // Do this to make the moving stuff snap to the mouse immediately.
                on_mouse_move(state|btn,x,y);
            }

            if (rect_was_selected)
                parent.invalidate_rectangle(rect);

            return;
        }

        if (btn == base_window::RIGHT && rect_is_selected)
        {
            last_right_click_pos = point(x,y);
            parts_menu.set_rect(get_rect_on_screen(selected_rect));
            return;
        }

        if (btn == base_window::LEFT && (state&base_window::CONTROL) && !drawing_rect)
        {
            long best_dist = std::numeric_limits<long>::max();
            long best_idx = 0;
            // check if this click landed on any of the overlay rectangles
            for (unsigned long i = 0; i < overlay_rects.size(); ++i)
            {
                const rectangle orect = get_rect_on_screen(i);
                const long dist = distance_to_rect_edge(orect, point(x,y));

                if (dist < best_dist)
                {
                    best_dist = dist;
                    best_idx = i;
                }
            }
            if (best_dist < 13)
            {
                overlay_rects[best_idx].label = default_rect_label;
                highlighted_rect = best_idx;
                highlight_timer.stop();
                highlight_timer.start();
                if (event_handler.is_set())
                    event_handler();
                parent.invalidate_rectangle(rect);
            }
            return;
        }


        if (!is_double_click && btn == base_window::LEFT && (state&base_window::SHIFT))
        {
            drawing_rect = true;
            rect_anchor = point(x,y);

            if (rect_is_selected)
            {
                rect_is_selected = false;
                parts_menu.disable();
                parent.invalidate_rectangle(rect);
            }
        }
        else if (drawing_rect)
        {
            if (rect_is_selected)
            {
                rect_is_selected = false;
                parts_menu.disable();
            }

            drawing_rect = false;
            parent.invalidate_rectangle(rect);
        }
        else if (is_double_click)
        {
            const bool rect_was_selected = rect_is_selected;
            rect_is_selected = false;
            parts_menu.disable();

            long best_dist = std::numeric_limits<long>::max();
            long best_idx = 0;
            std::string best_part;

            // check if this click landed on any of the overlay rectangles
            for (unsigned long i = 0; i < overlay_rects.size(); ++i)
            {
                const rectangle orect = get_rect_on_screen(i);

                const long dist = distance_to_rect_edge(orect, point(x,y));

                if (dist < best_dist)
                {
                    best_dist = dist;
                    best_idx = i;
                    best_part.clear();
                }

                std::map<std::string,point>::const_iterator itr;
                for (itr = overlay_rects[i].parts.begin(); itr != overlay_rects[i].parts.end(); ++itr)
                {
                    rectangle temp = centered_rect(get_rect_on_screen(centered_rect(itr->second,1,1)), part_width, part_width);
                    point c = center(temp);

                    // distance from edge of part circle
                    const long dist = static_cast<long>(std::abs(length(c - point(x,y)) + 0.5 - temp.width()/2));
                    if (dist < best_dist)
                    {
                        best_idx = i;
                        best_dist = dist;
                        best_part = itr->first;
                    }
                }
            }


            if (best_dist < 13)
            {
                rect_is_selected = true;
                if (part_names.size() != 0)
                    parts_menu.enable();
                selected_rect = best_idx;
                selected_part_name = best_part;
                if (orect_selected_event_handler.is_set())
                    orect_selected_event_handler(overlay_rects[best_idx]);
            }

            if (rect_is_selected || rect_was_selected)
                parent.invalidate_rectangle(rect);
        }
        else if (rect_is_selected)
        {
            rect_is_selected = false;
            parts_menu.disable();
            parent.invalidate_rectangle(rect);
        }
    }

// ----------------------------------------------------------------------------------------

    std::vector<image_display::overlay_rect> image_display::
    get_overlay_rects (
    ) const
    {
        auto_mutex lock(m);
        return overlay_rects;
    }

// ----------------------------------------------------------------------------------------

    void image_display::
    set_default_overlay_rect_label (
        const std::string& label
    )
    {
        auto_mutex lock(m);
        default_rect_label = label;
    }

// ----------------------------------------------------------------------------------------

    std::string image_display::
    get_default_overlay_rect_label (
    ) const
    {
        auto_mutex lock(m);
        return default_rect_label;
    }

// ----------------------------------------------------------------------------------------

    void image_display::
    set_default_overlay_rect_color (
        const rgb_alpha_pixel& color
    )
    {
        auto_mutex lock(m);
        default_rect_color = color;
    }

// ----------------------------------------------------------------------------------------

    rgb_alpha_pixel image_display::
    get_default_overlay_rect_color (
    ) const
    {
        auto_mutex lock(m);
        return default_rect_color;
    }

// ----------------------------------------------------------------------------------------

    void image_display::
    on_mouse_up (
        unsigned long btn,
        unsigned long state,
        long x,
        long y
    )
    {
        scrollable_region::on_mouse_up(btn,state,x,y);

        if (drawing_rect && btn == base_window::LEFT && (state&base_window::SHIFT) &&
            !hidden && enabled)
        {
            const point origin(total_rect().tl_corner());
            point c1 = point(x,y) - origin;
            point c2 = rect_anchor - origin;

            if (zoom_in_scale != 1)
            {
                c1 = c1/(double)zoom_in_scale;
                c2 = c2/(double)zoom_in_scale;
            }
            else if (zoom_out_scale != 1)
            {
                c1 = c1*(double)zoom_out_scale;
                c2 = c2*(double)zoom_out_scale;
            }

            rectangle new_rect(c1,c2);
            if (zoom_in_scale != 1)
            {
                // When we are zoomed in we adjust the rectangles a little so they
                // are drown surrounding the pixels inside the rect.  This adjustment
                // is necessary to make this code consistent with this goal.
                new_rect.right() -= 1;
                new_rect.bottom() -= 1;
            }


            if (new_rect.width() > 0 && new_rect.height() > 0)
            {
                add_overlay(overlay_rect(new_rect, default_rect_color, default_rect_label));

                if (event_handler.is_set())
                    event_handler();
            }
        }

        if (drawing_rect)
        {
            drawing_rect = false;
            parent.invalidate_rectangle(rect);
        }
        if (moving_overlay)
        {
            moving_overlay = false;
        }
    }

// ----------------------------------------------------------------------------------------

    void image_display::
    on_mouse_move (
        unsigned long state,
        long x,
        long y
    )
    {
        scrollable_region::on_mouse_move(state,x,y);

        if (drawing_rect)
        {
            if ((state&base_window::LEFT) && (state&base_window::SHIFT) && !hidden && enabled)
            {
                rectangle new_rect(point(x,y), rect_anchor);
                parent.invalidate_rectangle(new_rect + rect_to_draw);
                rect_to_draw = new_rect;
            }
            else
            {
                drawing_rect = false;
                parent.invalidate_rectangle(rect);
            }
            moving_overlay = false;
        }
        else if (moving_overlay)
        {
            if ((state&base_window::RIGHT) && (state&base_window::SHIFT) && !hidden && enabled)
            {
                // map point(x,y) into the image coordinate space.
                point p = point(x,y) - total_rect().tl_corner();
                if (zoom_in_scale != 1)
                {
                    if (moving_what == MOVING_PART)
                        p = p/(double)zoom_in_scale-dpoint(0.5,0.5);
                    else
                        p = p/(double)zoom_in_scale;
                }
                else if (zoom_out_scale != 1)
                {
                    p = p*(double)zoom_out_scale;
                }


                if (moving_what == MOVING_PART)
                {
                    if (overlay_rects[moving_rect].parts[moving_part_name] != p)
                    {
                        overlay_rects[moving_rect].parts[moving_part_name] = p;
                        parent.invalidate_rectangle(rect);
                        if (event_handler.is_set())
                            event_handler();
                    }
                }
                else 
                {
                    rectangle original = overlay_rects[moving_rect].rect;
                    if (moving_what == MOVING_RECT_LEFT)
                        overlay_rects[moving_rect].rect.left() = std::min(p.x(), overlay_rects[moving_rect].rect.right());
                    else if (moving_what == MOVING_RECT_RIGHT)
                        overlay_rects[moving_rect].rect.right() = std::max(p.x()-1, overlay_rects[moving_rect].rect.left());
                    else if (moving_what == MOVING_RECT_TOP)
                        overlay_rects[moving_rect].rect.top() = std::min(p.y(), overlay_rects[moving_rect].rect.bottom());
                    else 
                        overlay_rects[moving_rect].rect.bottom() = std::max(p.y()-1, overlay_rects[moving_rect].rect.top());

                    if (original != overlay_rects[moving_rect].rect)
                    {
                        parent.invalidate_rectangle(rect);
                        if (event_handler.is_set())
                            event_handler();
                    }
                }
            }
            else
            {
                moving_overlay = false;
            }
        }
    }

// ----------------------------------------------------------------------------------------

    void image_display::
    on_wheel_up (
        unsigned long state
    )
    {
        // disable mouse wheel if the user is drawing a rectangle
        if (drawing_rect)
            return;

        // if CONTROL is not being held down
        if ((state & base_window::CONTROL) == 0)
        {
            scrollable_region::on_wheel_up(state);
            return;
        }

        if (rect.contains(lastx,lasty) == false || hidden || !enabled)
            return;


        if (zoom_in_scale < 100 && zoom_out_scale == 1)
        {
            const point mouse_loc(lastx, lasty);
            // the pixel in img that the mouse is over
            const point pix_loc = (mouse_loc - total_rect().tl_corner())/zoom_in_scale;

            zoom_in_scale = zoom_in_scale*10/9 + 1;

            set_total_rect_size(img.nc()*zoom_in_scale, img.nr()*zoom_in_scale);

            // make is to the pixel under the mouse doesn't move while we zoom
            const point delta = total_rect().tl_corner() - (mouse_loc - pix_loc*zoom_in_scale);
            scroll_to_rect(translate_rect(display_rect(), delta)); 
        }
        else if (zoom_out_scale != 1)
        {
            const point mouse_loc(lastx, lasty);
            // the pixel in img that the mouse is over
            const point pix_loc = (mouse_loc - total_rect().tl_corner())*zoom_out_scale;

            zoom_out_scale = zoom_out_scale*9/10;
            if (zoom_out_scale == 0)
                zoom_out_scale = 1;

            set_total_rect_size(img.nc()/zoom_out_scale, img.nr()/zoom_out_scale);

            // make is to the pixel under the mouse doesn't move while we zoom
            const point delta = total_rect().tl_corner() - (mouse_loc - pix_loc/zoom_out_scale);
            scroll_to_rect(translate_rect(display_rect(), delta)); 
        }
    }

// ----------------------------------------------------------------------------------------

    void image_display::
    on_wheel_down (
        unsigned long state
    )
    {
        // disable mouse wheel if the user is drawing a rectangle
        if (drawing_rect)
            return;

        // if CONTROL is not being held down
        if ((state & base_window::CONTROL) == 0)
        {
            scrollable_region::on_wheel_down(state);
            return;
        }

        if (rect.contains(lastx,lasty) == false || hidden || !enabled)
            return;


        if (zoom_in_scale != 1)
        {
            const point mouse_loc(lastx, lasty);
            // the pixel in img that the mouse is over
            const point pix_loc = (mouse_loc - total_rect().tl_corner())/zoom_in_scale;

            zoom_in_scale = zoom_in_scale*9/10;
            if (zoom_in_scale == 0)
                zoom_in_scale = 1;

            set_total_rect_size(img.nc()*zoom_in_scale, img.nr()*zoom_in_scale);

            // make is to the pixel under the mouse doesn't move while we zoom
            const point delta = total_rect().tl_corner() - (mouse_loc - pix_loc*zoom_in_scale);
            scroll_to_rect(translate_rect(display_rect(), delta)); 
        }
        else if (std::max(img.nr(), img.nc())/zoom_out_scale > 10)
        {
            const point mouse_loc(lastx, lasty);
            // the pixel in img that the mouse is over
            const point pix_loc = (mouse_loc - total_rect().tl_corner())*zoom_out_scale;

            zoom_out_scale = zoom_out_scale*10/9 + 1;

            set_total_rect_size(img.nc()/zoom_out_scale, img.nr()/zoom_out_scale);

            // make is to the pixel under the mouse doesn't move while we zoom
            const point delta = total_rect().tl_corner() - (mouse_loc - pix_loc/zoom_out_scale);
            scroll_to_rect(translate_rect(display_rect(), delta)); 
        }
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
//         image_window member functions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    image_window::
    image_window(
    ) :
        gui_img(*this),
        window_has_closed(false),
        have_last_click(false),
        mouse_btn(0),
        clicked_signaler(this->wm),
        tie_input_events(false)
    {

        gui_img.set_image_clicked_handler(*this, &image_window::on_image_clicked);
        gui_img.disable_overlay_editing();
        // show this window on the screen
        show();
    } 

// ----------------------------------------------------------------------------------------

    image_window::
    ~image_window(
    )
    {
        // You should always call close_window() in the destructor of window
        // objects to ensure that no events will be sent to this window while 
        // it is being destructed.  
        close_window();
    }

// ----------------------------------------------------------------------------------------

    base_window::on_close_return_code image_window::
    on_window_close(
    )
    {
        window_has_closed = true;
        clicked_signaler.broadcast();
        return base_window::CLOSE_WINDOW;
    }

// ----------------------------------------------------------------------------------------

    bool image_window::
    get_next_keypress (
        unsigned long& key,
        bool& is_printable,
        unsigned long& state
    ) 
    {
        auto_mutex lock(wm);
        while (have_last_keypress == false && !window_has_closed &&
            (have_last_click == false || !tie_input_events))
        {
            clicked_signaler.wait();
        }

        if (window_has_closed)
            return false;

        if (have_last_keypress)
        {
            // Mark that we are taking the key click so the next call to get_next_keypress()
            // will have to wait for another click.
            have_last_keypress = false;
            key = next_key;
            is_printable = next_is_printable;
            state = next_state;
            return true;
        }
        else
        {
            key = 0;
            is_printable = true;
            return false;
        }
    }

// ----------------------------------------------------------------------------------------

    void image_window::
    on_keydown (
        unsigned long key,
        bool is_printable,
        unsigned long state
    )
    {
        dlib::drawable_window::on_keydown(key,is_printable,state);

        have_last_keypress = true;
        next_key = key;
        next_is_printable = is_printable;
        next_state = state;
        clicked_signaler.signal();
    }

// ----------------------------------------------------------------------------------------

    void image_window::
    tie_events (
    )
    {
        auto_mutex lock(wm);
        tie_input_events = true;
    }

// ----------------------------------------------------------------------------------------

    void image_window::
    untie_events (
    )
    {
        auto_mutex lock(wm);
        tie_input_events = false;
    }

// ----------------------------------------------------------------------------------------

    bool image_window::
    events_tied (
    ) const
    {
        auto_mutex lock(wm);
        return tie_input_events;
    }

// ----------------------------------------------------------------------------------------

    bool image_window::
    get_next_double_click (
        point& p,
        unsigned long& mouse_button 
    ) 
    {
        p = point(-1,-1);

        auto_mutex lock(wm);
        while (have_last_click == false && !window_has_closed &&
            (have_last_keypress==false || !tie_input_events))
        {
            clicked_signaler.wait();
        }

        if (window_has_closed)
            return false;

        if (have_last_click)
        {
            // Mark that we are taking the point click so the next call to
            // get_next_double_click() will have to wait for another click.
            have_last_click = false;
            mouse_button = mouse_btn;
            p = last_clicked_point;
            return true;
        }
        else
        {
            return false;
        }
    }

// ----------------------------------------------------------------------------------------

    void image_window::
    on_image_clicked (
        const point& p,
        bool is_double_click,
        unsigned long btn
    )
    {
        if (is_double_click)
        {
            have_last_click = true;
            last_clicked_point = p;
            mouse_btn = btn;
            clicked_signaler.signal();
        }
    }

// ----------------------------------------------------------------------------------------

    void image_window::
    add_overlay (
        const overlay_rect& overlay
    ) 
    { 
        gui_img.add_overlay(overlay); 
    }

// ----------------------------------------------------------------------------------------

    void image_window::
    add_overlay (
        const overlay_line& overlay
    ) 
    { 
        gui_img.add_overlay(overlay); 
    }

// ----------------------------------------------------------------------------------------

    void image_window::
    add_overlay (
        const overlay_circle& overlay
    ) 
    { 
        gui_img.add_overlay(overlay); 
    }

// ----------------------------------------------------------------------------------------

    void image_window::
    add_overlay (
        const std::vector<overlay_rect>& overlay
    ) 
    { 
        gui_img.add_overlay(overlay); 
    }

// ----------------------------------------------------------------------------------------

    void image_window::
    add_overlay (
        const std::vector<overlay_line>& overlay
    ) 
    { 
        gui_img.add_overlay(overlay); 
    }

// ----------------------------------------------------------------------------------------

    void image_window::
    add_overlay (
        const std::vector<overlay_circle>& overlay
    ) 
    { 
        gui_img.add_overlay(overlay); 
    }

// ----------------------------------------------------------------------------------------

    void image_window::
    clear_overlay (
    ) 
    { 
        gui_img.clear_overlay(); 
    }

// ----------------------------------------------------------------------------------------

    void image_window::
    on_window_resized(
    )
    {
        drawable_window::on_window_resized();
        unsigned long width, height;
        get_size(width,height);
        gui_img.set_size(width, height);

    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_WIDGETs_CPP_

