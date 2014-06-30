/**
 * nWidgets
 *
 *  Par Florian "4ian" Rival
 *
 */
/**
 *
 * ColorBox is colored rectangle, which can be displayed
 * in a window.
 */

#ifndef COLORBOX_H
#define COLORBOX_H

#include "dlib/gui_widgets.h"
#include <sstream>
#include <string>

using namespace std;

namespace nw
{

class ColorBox : public dlib::drawable
{
public:

    ColorBox (dlib::drawable_window& w, dlib::rectangle area, unsigned char red_, unsigned char green_, unsigned char blue_);
    ~ColorBox ();

    void set_rect(const dlib::rectangle & rect_);

private:

    void draw( const dlib::canvas& c ) const;

    unsigned char red, green,blue;
};

}//namespace nw

#endif // COLORBOX_H







