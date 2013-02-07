// Copyright (C) 2005  Davis E. King (davis@dlib.net), and Nils Labugt
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_CANVAS_DRAWINg_CPP_
#define DLIB_CANVAS_DRAWINg_CPP_

#include "canvas_drawing.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    void draw_sunken_rectangle (
        const canvas& c,
        const rectangle& border,
        unsigned char alpha
    )
    {
        rectangle area = border.intersect(c);
        if (area.is_empty() == false)
        {
            const rgb_alpha_pixel dark_gray(64,64,64,alpha);
            const rgb_alpha_pixel gray(128,128,128,alpha);
            const rgb_alpha_pixel white(255,255,255,alpha);
            const rgb_alpha_pixel background(212,208,200,alpha);

            draw_line(c,point(border.left(),border.top()),point(border.right()-1,border.top()),gray);

            draw_line(c,point(border.left(),border.bottom()),point(border.right(),border.bottom()),white);
            draw_line(c,point(border.left()+1,border.bottom()-1),point(border.right()-1,border.bottom()-1),background);

            draw_line(c,point(border.left(),border.top()+1),point(border.left(),border.bottom()-1),gray);

            draw_line(c,point(border.right(),border.top()),point(border.right(),border.bottom()-1),white);
            draw_line(c,point(border.right()-1,border.top()+1),point(border.right()-1,border.bottom()-2),background);

            draw_line(c,point(border.left()+1,border.top()+1),point(border.left()+1,border.bottom()-2),dark_gray);
            draw_line(c,point(border.left()+1,border.top()+1),point(border.right()-2,border.top()+1),dark_gray);
        }
    }

// ----------------------------------------------------------------------------------------

    void draw_button_down (
        const canvas& c,
        const rectangle& btn,
        unsigned char alpha
    )
    {
        rectangle area = btn.intersect(c);
        if (area.is_empty() == false)
        {
            const rgb_alpha_pixel dark_gray(64,64,64,alpha);
            const rgb_alpha_pixel gray(128,128,128,alpha);
            const rgb_alpha_pixel black(0,0,0,alpha);

            draw_line(c,point(btn.left(),btn.top()),point(btn.right(),btn.top()),black);

            draw_line(c,point(btn.left()+1,btn.bottom()),point(btn.right(),btn.bottom()),dark_gray);
            draw_line(c,point(btn.left()+1,btn.top()+1),point(btn.right()-1,btn.top()+1),gray);

            draw_line(c,point(btn.left(),btn.top()+1),point(btn.left(),btn.bottom()),black);

            draw_line(c,point(btn.right(),btn.top()+1),point(btn.right(),btn.bottom()-1),dark_gray);
            draw_line(c,point(btn.left()+1,btn.top()+1),point(btn.left()+1,btn.bottom()-1),gray);
        }
    }

// ----------------------------------------------------------------------------------------

    void draw_button_up (
        const canvas& c,
        const rectangle& btn,
        unsigned char alpha
    )
    {
        rectangle area = btn.intersect(c);
        if (area.is_empty() == false)
        {
            const rgb_alpha_pixel dark_gray(64,64,64,alpha);
            const rgb_alpha_pixel gray(128,128,128,alpha);
            const rgb_alpha_pixel white(255,255,255,alpha);

            draw_line(c,point(btn.left(),btn.top()),point(btn.right()-1,btn.top()),white);

            draw_line(c,point(btn.left(),btn.bottom()),point(btn.right(),btn.bottom()),dark_gray);
            draw_line(c,point(btn.left()+1,btn.bottom()-1),point(btn.right()-1,btn.bottom()-1),gray);

            draw_line(c,point(btn.left(),btn.top()+1),point(btn.left(),btn.bottom()-1),white);

            draw_line(c,point(btn.right(),btn.top()),point(btn.right(),btn.bottom()-1),dark_gray);
            draw_line(c,point(btn.right()-1,btn.top()+1),point(btn.right()-1,btn.bottom()-2),gray);
        }
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_CANVAS_DRAWINg_CPP_

