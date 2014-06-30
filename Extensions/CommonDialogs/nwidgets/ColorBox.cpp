#include "ColorBox.h"
#include "dlib/gui_widgets.h"
#include <sstream>
#include <string>

using namespace std;
using namespace dlib;

namespace nw
{

////////////////////////////////////////////////////////////
/// Constructor
////////////////////////////////////////////////////////////
ColorBox::ColorBox (drawable_window& w, rectangle area, unsigned char red_, unsigned char green_, unsigned char blue_) :
drawable(w),
red(red_),
green(green_),
blue(blue_)
{
    rect = area;
    enable_events();
}

////////////////////////////////////////////////////////////
/// Destructor
////////////////////////////////////////////////////////////
ColorBox::~ColorBox ()
{
    disable_events();
    parent.invalidate_rectangle(rect);
}

////////////////////////////////////////////////////////////
/// Change the rectangle to draw
////////////////////////////////////////////////////////////
void ColorBox::set_rect(const rectangle & rect_)
{
    rect = rect_;
}

////////////////////////////////////////////////////////////
/// Draw the rectangle
////////////////////////////////////////////////////////////
void ColorBox::draw( const canvas& c ) const
{
    rectangle area = c.intersect(rect);
    if (area.is_empty() == true)
        return;

    fill_rect(c,rect,rgb_pixel(red,green,blue));
}
} //namespace nw







