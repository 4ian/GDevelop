/**

Game Develop - Common Dialogs Extension
Copyright (c) 2008-2014 Florian Rival (Florian.Rival@gmail.com)

This software is provided 'as-is', without any express or implied
warranty. In no event will the authors be held liable for any damages
arising from the use of this software.

Permission is granted to anyone to use this software for any purpose,
including commercial applications, and to alter it and redistribute it
freely, subject to the following restrictions:

    1. The origin of this software must not be misrepresented; you must not
    claim that you wrote the original software. If you use this software
    in a product, an acknowledgment in the product documentation would be
    appreciated but is not required.

    2. Altered source versions must be plainly marked as such, and must not be
    misrepresented as being the original software.

    3. This notice may not be removed or altered from any source
    distribution.

*/
#include "nStyle.h"
#include "dlib/gui_widgets.h"
#include "ColorBox.h"
#include <sstream>
#include <string>

using namespace std;
using namespace dlib;

namespace nw
{


////////////////////////////////////////////////////////////
/// Button style
////////////////////////////////////////////////////////////
void BtStyle::draw_button( const canvas& c, const rectangle& rect, const bool enabled,
                           const font& mfont, const long lastx, const long lasty, const ustring& name,
                           const bool is_depressed ) const
{
    rectangle area = rect.intersect( c );
    if ( area.is_empty() )
        return;


    unsigned char red, green, blue;
    if ( enabled )
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
    if ( name_width == 0 )
    {
        unsigned long height;
        mfont.compute_size( name, name_width, height );
    }

    // figure out where the name string should appear
    rectangle name_rect;
    const unsigned long width = name_width;
    const unsigned long height = mfont.height();
    name_rect.set_left(( rect.right() + rect.left() - width ) / 2 );
    name_rect.set_top(( rect.bottom() + rect.top() - height ) / 2 + 1 );
    name_rect.set_right( name_rect.left() + width - 1 );
    name_rect.set_bottom( name_rect.top() + height );


    if ( is_depressed )
    {
        fill_rect_with_vertical_gradient( c, rect, rgb_pixel( 233, 241, 246 ), rgb_pixel( 197, 220, 232 ) );
        name_rect.set_left( name_rect.left() + 1 );
        name_rect.set_right( name_rect.right() + 1 );
        name_rect.set_top( name_rect.top() + 1 );
        name_rect.set_bottom( name_rect.bottom() + 1 );

        mfont.draw_string( c, name_rect, name, rgb_pixel( red, green, blue ) );

        draw_button_down( c, rect );
    }
    else
    {
        fill_rect_with_vertical_gradient( c, rect, rgb_pixel( 241, 241, 241 ), rgb_pixel( 210, 210, 210 ) );
        mfont.draw_string( c, name_rect, name, rgb_pixel( red, green, blue ) );

        // now draw the edge of the button
        draw_button_up( c, rect );
    }
}

rectangle BtStyle::get_min_size( const ustring& name, const font& mfont ) const
{
    unsigned long width;
    unsigned long height;
    mfont.compute_size( name, width, height );
    name_width = width;

    return rectangle( width + 2*padding, height + 2*padding );
}


////////////////////////////////////////////////////////////
/// Toogle button style
////////////////////////////////////////////////////////////
void TBtStyle::draw_toggle_button( const canvas& c, const rectangle& rect, const bool enabled,
                                   const font& mfont, const long lastx, const long lasty,
                                   const ustring& name, const bool is_depressed, const bool is_checked ) const
{
    rectangle area = rect.intersect( c );
    if ( area.is_empty() )
        return;

    unsigned char red, green, blue;
    if ( enabled )
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
    if ( name_width == 0 )
    {
        unsigned long height;
        mfont.compute_size( name, name_width, height );
    }

    // figure out where the name string should appear
    rectangle name_rect;
    const unsigned long width = name_width;
    const unsigned long height = mfont.height();
    name_rect.set_left(( rect.right() + rect.left() - width ) / 2 );
    name_rect.set_top(( rect.bottom() + rect.top() - height ) / 2 + 1 );
    name_rect.set_right( name_rect.left() + width - 1 );
    name_rect.set_bottom( name_rect.top() + height );

    long d = 0;
    if ( is_checked )
        d = 1;

    if ( is_depressed )
        d = 2;

    name_rect.set_left( name_rect.left() + d );
    name_rect.set_right( name_rect.right() + d );
    name_rect.set_top( name_rect.top() + d );
    name_rect.set_bottom( name_rect.bottom() + d );


    // now draw the edge of the button
    if ( is_checked || is_depressed )
    {
        fill_rect_with_vertical_gradient( c, rect, rgb_pixel( 233, 241, 246 ), rgb_pixel( 197, 220, 232 ) );
        mfont.draw_string( c, name_rect, name, rgb_pixel( red, green, blue ) );
        draw_button_down( c, rect );
    }
    else
    {
        fill_rect_with_vertical_gradient( c, rect, rgb_pixel( 241, 241, 241 ), rgb_pixel( 210, 210, 210 ) );
        mfont.draw_string( c, name_rect, name, rgb_pixel( red, green, blue ) );
        draw_button_up( c, rect );
    }
}

rectangle TBtStyle::get_min_size( const ustring& name, const font& mfont ) const
{

    unsigned long width;
    unsigned long height;
    mfont.compute_size( name, width, height );
    name_width = width;

    return rectangle( width + 2*padding, height + 2*padding );
}


////////////////////////////////////////////////////////////
/// ButtonArrow style
////////////////////////////////////////////////////////////
void arrowBtStyle::draw_button(
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
    rectangle area = rect.intersect( c );
    if ( area.is_empty() )
        return;


    const long height = rect.height();
    const long width = rect.width();

    const long smallest = ( width < height ) ? width : height;

    const long rows = ( smallest + 3 ) / 4;
    const long start = rows + rows / 2 - 1;
    long dep;

    long tip_x = 0;
    long tip_y = 0;
    long wy = 0;
    long hy = 0;
    long wx = 0;
    long hx = 0;

    if ( is_depressed )
    {
        dep = 0;
        fill_rect_with_vertical_gradient( c, rect, rgb_pixel( 164, 213, 239 ), rgb_pixel( 232, 246, 253 ) );

        // draw the button's border
        draw_button_down( c, rect );
    }
    else
    {
        dep = -1;
        fill_rect_with_vertical_gradient( c, rect, rgb_pixel( 199, 199, 203 ), rgb_pixel( 242, 242, 242 ) );
        // draw the button's border
        draw_button_up( c, rect );
    }


    switch ( dir )
    {
    case UP:
        tip_x = width / 2 + rect.left() + dep;
        tip_y = ( height - start ) / 2 + rect.top() + dep + 1;
        wy = 0;
        hy = 1;
        wx = 1;
        hx = 0;
        break;

    case DOWN:
        tip_x = width / 2 + rect.left() + dep;
        tip_y = rect.bottom() - ( height - start ) / 2 + dep;
        wy = 0;
        hy = -1;
        wx = 1;
        hx = 0;
        break;

    case LEFT:
        tip_x = rect.left() + ( width - start ) / 2 + dep + 1;
        tip_y = height / 2 + rect.top() + dep;
        wy = 1;
        hy = 0;
        wx = 0;
        hx = 1;
        break;

    case RIGHT:
        tip_x = rect.right() - ( width - start ) / 2 + dep;
        tip_y = height / 2 + rect.top() + dep;
        wy = 1;
        hy = 0;
        wx = 0;
        hx = -1;
        break;
    }


    rgb_pixel color;
    if ( enabled )
    {
        color.red = 60;
        color.green = 60;
        color.blue = 60;
    }
    else
    {
        color.red = 128;
        color.green = 128;
        color.blue = 128;
    }



    for ( long i = 0; i < rows; ++i )
    {
        draw_line( c, point( tip_x + wx*i + hx*i, tip_y + wy*i + hy*i ),
                   point( tip_x + wx*i* -1 + hx*i, tip_y + wy*i* -1 + hy*i ),
                   color );
    }

}


////////////////////////////////////////////////////////////
/// ScrollBar style
////////////////////////////////////////////////////////////
long scrollStyle::get_slider_length( long total_length, long max_pos ) const
{
    // if the length is too small then we have to smash up the arrow buttons
    // and hide the slider.
    if ( total_length <= get_width()*2 )
    {
        return 0;
    }
    else
    {
        double range = total_length - get_button_length( total_length, max_pos ) * 2;

        double scale_factor = 30.0 / ( max_pos + 30.0 );

        if ( scale_factor < 0.1 )
            scale_factor = 0.1;


        double fraction = range / ( max_pos + range ) * scale_factor;
        double result = fraction * range;
        long res = static_cast<long>( result );
        if ( res < 8 )
            res = 8;
        return res;
    }
}

// ----------------------------------------------------------------------------------------

long scrollStyle::get_button_length( long total_length, long max_pos ) const
{
    // if the length is too small then we have to smash up the arrow buttons
    // and hide the slider.
    if ( total_length <= get_width()*2 )
    {
        return total_length / 2;
    }
    else
    {
        return get_width();
    }
}

// ----------------------------------------------------------------------------------------

void scrollStyle::draw_scroll_bar_background( const canvas& c, const rectangle& rect, const bool enabled,
        const long lastx, const long lasty, const bool is_depressed ) const
{
    if ( is_depressed )
        draw_checkered( c, rect, rgb_pixel( 0, 0, 0 ), rgb_pixel( 43, 47, 55 ) );
    else
        fill_rect( c, rect, rgb_pixel( 240, 240, 240 ) );
}

// ----------------------------------------------------------------------------------------

void scrollStyle::draw_scroll_bar_slider( const canvas& c, const rectangle& rect, const bool enabled,
        const long lastx, const long lasty, const bool is_being_dragged ) const
{
    fill_rect_with_vertical_gradient( c, rect, rgb_pixel( 210, 210, 210 ), rgb_pixel( 241, 241, 241 ) );
    draw_button_up( c, rect );
}

} //namespace nw







