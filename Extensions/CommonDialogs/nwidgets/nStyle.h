/**
 * nWidgets
 *
 *
 *  Par Florian "4ian" Rival
 *
 */
/**
 *
 *
 *  This file contains the style to applie to widgets
 */

#ifndef NSTYLE_H
#define NSTYLE_H

#include "dlib/gui_widgets.h"
#include "ColorBox.h"
#include <sstream>
#include <string>

using namespace std;

namespace nw
{
////////////////////////////////////////////////////////////
/// Button style
////////////////////////////////////////////////////////////
class BtStyle : public dlib::button_style
{
public:
    BtStyle() : padding( 4 ), name_width( 0 ) {}

    virtual void draw_button(
        const dlib::canvas& c,
        const dlib::rectangle& rect,
        const bool enabled,
        const dlib::font& mfont,
        const long lastx,
        const long lasty,
        const dlib::ustring& name,
        const bool is_depressed
    ) const;

    virtual dlib::rectangle get_min_size(
        const dlib::ustring& name,
        const dlib::font& mfont
    ) const;

private:

    // this is the minimum amount of padding that can separate the name from the
    // edge of the button
    const unsigned long padding;
    // this is the width of the name string
    mutable unsigned long name_width;

};


////////////////////////////////////////////////////////////
/// Toogle button style
////////////////////////////////////////////////////////////
class TBtStyle : public dlib::toggle_button_style
{
public:
    TBtStyle() : padding( 4 ), name_width( 0 ) {}

    virtual void draw_toggle_button(
        const dlib::canvas& c,
        const dlib::rectangle& rect,
        const bool enabled,
        const dlib::font& mfont,
        const long lastx,
        const long lasty,
        const dlib::ustring& name,
        const bool is_depressed,
        const bool is_checked
    ) const;

    virtual dlib::rectangle get_min_size(
        const dlib::ustring& name,
        const dlib::font& mfont
    ) const;

private:

    // this is the minimum amount of padding that can separate the name from the
    // edge of the button
    const unsigned long padding;
    // this is the width of the name string
    mutable unsigned long name_width;

};

////////////////////////////////////////////////////////////
/// ButtonArrow style
////////////////////////////////////////////////////////////
class arrowBtStyle : public dlib::button_style
{

public:

    enum arrow_direction
    {
        UP,
        DOWN,
        LEFT,
        RIGHT
    };

    arrowBtStyle (
        arrow_direction dir_
    ) : dir(dir_) {}

    virtual void draw_button (
        const dlib::canvas& c,
        const dlib::rectangle& rect,
        const bool enabled,
        const dlib::font& mfont,
        const long lastx,
        const long lasty,
        const dlib::ustring& name,
        const bool is_depressed
    ) const;

    virtual dlib::rectangle get_min_size (
        const dlib::ustring& name,
        const dlib::font& mfont
    ) const { return dlib::rectangle(); }

private:
    arrow_direction dir;
};

////////////////////////////////////////////////////////////
/// ScrollBar style
////////////////////////////////////////////////////////////
class scrollStyle : public dlib::scroll_bar_style
{
public:
    arrowBtStyle get_up_button_style(
    ) const { return arrowBtStyle( arrowBtStyle::UP ); }

    arrowBtStyle get_down_button_style(
    ) const { return arrowBtStyle( arrowBtStyle::DOWN ); }

    arrowBtStyle get_left_button_style(
    ) const { return arrowBtStyle( arrowBtStyle::LEFT ); }

    arrowBtStyle get_right_button_style(
    ) const { return arrowBtStyle( arrowBtStyle::RIGHT ); }

    virtual long get_width(
    ) const  { return 16; }

    virtual long get_slider_length(
        long total_length,
        long max_pos
    ) const;

    virtual long get_button_length(
        long total_length,
        long max_pos
    ) const;

    virtual void draw_scroll_bar_background(
        const dlib::canvas& c,
        const dlib::rectangle& rect,
        const bool enabled,
        const long lastx,
        const long lasty,
        const bool is_depressed
    ) const;

    virtual void draw_scroll_bar_slider(
        const dlib::canvas& c,
        const dlib::rectangle& rect,
        const bool enabled,
        const long lastx,
        const long lasty,
        const bool is_being_dragged
    ) const;
};

////////////////////////////////////////////////////////////
/// Scrollable Region style
////////////////////////////////////////////////////////////
class scrollRegionStyle : public dlib::scrollable_region_style
{
public:
    scrollStyle get_horizontal_scroll_bar_style (
    ) const { scrollStyle style; return style; }

    scrollStyle get_vertical_scroll_bar_style (
    ) const { scrollStyle style; return style; }

    virtual long get_border_size (
    ) const { return 2; }

    virtual void draw_scrollable_region_border (
        const dlib::canvas& c,
        const dlib::rectangle& rect,
        const bool enabled
    ) const  { draw_sunken_rectangle(c,rect); }

};

////////////////////////////////////////////////////////////
/// ListBox style
////////////////////////////////////////////////////////////
class LbStyle : public dlib::list_box_style
{
public:
    scrollRegionStyle get_scrollable_region_style(
    ) const
    {
        scrollRegionStyle style;
        return style;
    }

    virtual void draw_list_box_item(
        const dlib::canvas& c,
        const dlib::rectangle& rect,
        const dlib::rectangle& display_rect,
        const bool enabled,
        const dlib::font& mfont,
        const std::string& text,
        const bool is_selected
    ) const { draw_list_box_item_template( c, rect, display_rect, enabled, mfont, text, is_selected ); }

    virtual void draw_list_box_item(
        const dlib::canvas& c,
        const dlib::rectangle& rect,
        const dlib::rectangle& display_rect,
        const bool enabled,
        const dlib::font& mfont,
        const std::wstring& text,
        const bool is_selected
    ) const { draw_list_box_item_template( c, rect, display_rect, enabled, mfont, text, is_selected ); }

    virtual void draw_list_box_item(
        const dlib::canvas& c,
        const dlib::rectangle& rect,
        const dlib::rectangle& display_rect,
        const bool enabled,
        const dlib::font& mfont,
        const dlib::ustring& text,
        const bool is_selected
    ) const { draw_list_box_item_template( c, rect, display_rect, enabled, mfont, text, is_selected ); }

    template <typename string_type>
    void draw_list_box_item_template(
        const dlib::canvas& c,
        const dlib::rectangle& rect,
        const dlib::rectangle& display_rect,
        const bool enabled,
        const dlib::font& mfont,
        const string_type& text,
        const bool is_selected
    ) const
    {
        if ( is_selected )
        {
            if ( enabled )
                fill_rect_with_vertical_gradient( c, rect, dlib::rgb_pixel( 227, 243, 252 ),  dlib::rgb_pixel( 197, 232, 250 ), display_rect );
            else
                fill_rect_with_vertical_gradient( c, rect, dlib::rgb_pixel( 140, 190, 255 ),  dlib::rgb_pixel( 130, 160, 250 ), display_rect );
        }

        if ( enabled )
            mfont.draw_string( c, rect, text, dlib::rgb_pixel( 0, 0, 0 ), 0, std::string::npos, display_rect );
        else
            mfont.draw_string( c, rect, text, dlib::rgb_pixel( 128, 128, 128 ), 0, std::string::npos, display_rect );
    }

    virtual void draw_list_box_background(
        const dlib::canvas& c,
        const dlib::rectangle& display_rect,
        const bool enabled
    ) const
    {
        if ( enabled )
        {
            // first fill our area with white
            fill_rect( c, display_rect, dlib::rgb_pixel( 255, 255, 255 ));
        }
        else
        {
            // first fill our area with gray
            fill_rect( c, display_rect, dlib::rgb_pixel( 212, 208, 200 ) );
        }
    }

};

} //namespace nw

#endif // NSTYLE_H







