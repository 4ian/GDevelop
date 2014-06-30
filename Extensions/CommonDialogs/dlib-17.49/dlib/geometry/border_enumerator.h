// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_BORDER_EnUMERATOR_H_
#define DLIB_BORDER_EnUMERATOR_H_

#include "border_enumerator_abstract.h"
#include "rectangle.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    class border_enumerator
    {
    public:
        border_enumerator(
        ) 
        {
            reset();
        }

        border_enumerator(
            const rectangle& rect_,
            unsigned long border_size
        ) : 
            rect(rect_),
            inner_rect(shrink_rect(rect_, border_size))
        {
            reset();
        }

        border_enumerator(
            const rectangle& rect_,
            const rectangle& non_border_region
        ) : 
            rect(rect_),
            inner_rect(non_border_region.intersect(rect))
        {
            reset();
        }

        void reset (
        ) 
        {
            // make the four rectangles that surround inner_rect and intersect them
            // with rect.
            bleft   = rect.intersect(rectangle(std::numeric_limits<long>::min(),
                                               std::numeric_limits<long>::min(),
                                               inner_rect.left()-1,
                                               std::numeric_limits<long>::max()));

            bright  = rect.intersect(rectangle(inner_rect.right()+1,
                                               std::numeric_limits<long>::min(),
                                               std::numeric_limits<long>::max(),
                                               std::numeric_limits<long>::max()));

            btop    = rect.intersect(rectangle(inner_rect.left(),
                                               std::numeric_limits<long>::min(),
                                               inner_rect.right(),
                                               inner_rect.top()-1));

            bbottom = rect.intersect(rectangle(inner_rect.left(),
                                               inner_rect.bottom()+1,
                                               inner_rect.right(),
                                               std::numeric_limits<long>::max()));

            p = bleft.tl_corner();
            p.x() -= 1;

            mode = atleft;
        }

        bool at_start (
        ) const
        {
            point temp = bleft.tl_corner();
            temp.x() -=1;
            return temp == p;
        }

        bool current_element_valid(
        ) const
        {
            return rect.contains(p);
        }

        bool move_next()
        {
            if (mode == atleft)
            {
                if (advance_point(bleft, p))
                    return true;
                    
                mode = attop;
                p = btop.tl_corner();
                p.x() -= 1;
            }
            if (mode == attop)
            {
                if (advance_point(btop, p))
                    return true;
                    
                mode = atright;
                p = bright.tl_corner();
                p.x() -= 1;
            }
            if (mode == atright)
            {
                if (advance_point(bright, p))
                    return true;
                    
                mode = atbottom;
                p = bbottom.tl_corner();
                p.x() -= 1;
            }

            if (advance_point(bbottom, p))
                return true;

            // put p outside rect since there are no more points to enumerate
            p = rect.br_corner();
            p.x() += 1;
                    
            return false;
        }

        unsigned long size (
        ) const
        {
            return rect.area() - inner_rect.area();
        }

        const point& element (
        ) const
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(current_element_valid(),
                "\t point border_enumerator::element()"
                << "\n\t This function can't be called unless the element is valid."
                << "\n\t this: " << this
                );

            return p;
        }

    private:

        bool advance_point (
            const rectangle& r,
            point& p
        ) const
        {
            p.x() += 1;
            if (p.x() > r.right())
            {
                p.x() = r.left();
                p.y() += 1;
            }

            return r.contains(p);
        }

        point p;
        rectangle rect;
        rectangle inner_rect;  // the non-border regions of rect

        enum emode
        {
            atleft,
            atright,
            atbottom,
            attop
        };

        emode mode;

        rectangle btop, bleft, bright, bbottom;
    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_BORDER_EnUMERATOR_H_

