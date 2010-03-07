// Copyright (C) 2008  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_DRAW_IMAGe_
#define DLIB_DRAW_IMAGe_

#include "draw_abstract.h"
#include "../algs.h"
#include <cmath>

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename image_type
        >
    void draw_line (
        long x1,
        long y1,
        long x2,
        long y2,
        image_type& c,
        typename image_type::type val
    ) 
    {
        if (x1 == x2)
        {
            // make sure y1 comes before y2
            if (y1 > y2)
                swap(y1,y2);


            // this is a vertical line
            for (long y = y1; y <= y2; ++y)
            {
                if (y < 0 || y >= c.nr())
                    continue;

                c[y][x1] = val;
            }
        }
        else if (y1 == y2)
        {

            // make sure x1 comes before x2
            if (x1 > x2)
                swap(x1,x2);


            // this is a horizontal line
            for (long x = x1; x <= x2; ++x)
            {
                if (x < 0 || x >= c.nc())
                    continue;

                c[y1][x] = val;
            }
        }
        else
        {
            const long rise = (((long)y2) - ((long)y1));
            const long run = (((long)x2) - ((long)x1));
            if (std::abs(rise) < std::abs(run))
            {
                const double slope = ((double)rise)/run;


                double first, last;


                if (x1 > x2)                
                {
                    first = x2;
                    last = x1;
                }
                else
                {
                    first = x1;
                    last = x2;
                }                             

                long y;
                long x;
                const double x1f = x1;
                const double y1f = y1;
                for (double i = first; i <= last; ++i)
                {   
                    y = static_cast<long>(slope*(i-x1f) + y1f);
                    x = static_cast<long>(i);


                    if (y < 0 || y >= c.nr())
                        continue;

                    if (x < 0 || x >= c.nc())
                        continue;


                    c[y][x] = val;
                }         
            }
            else
            {
                const double slope = ((double)run)/rise;


                double first, last;


                if (y1 > y2)                
                {
                    first = y2;
                    last = y1;
                }
                else
                {
                    first = y1;
                    last = y2;
                }                             


                long x;
                long y;
                const double x1f = x1;
                const double y1f = y1;
                for (double i = first; i <= last; ++i)
                {   
                    x = static_cast<long>(slope*(i-y1f) + x1f);
                    y = static_cast<long>(i);


                    if (x < 0 || x >= c.nc())
                        continue;

                    if (y < 0 || y >= c.nr())
                        continue;

                    c[y][x] = val;
                } 
            }
        }

    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_DRAW_IMAGe_




