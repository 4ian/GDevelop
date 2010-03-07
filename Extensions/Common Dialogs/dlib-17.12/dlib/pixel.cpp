// Copyright (C) 2006  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_PIXEL_CPp_
#define DLIB_PIXEL_CPp_

#include "pixel.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    void serialize (
        const rgb_alpha_pixel& item, 
        std::ostream& out 
    )   
    {
        try
        {
            serialize(item.red,out);
            serialize(item.green,out);
            serialize(item.blue,out);
            serialize(item.alpha,out);
        }
        catch (serialization_error& e)
        {
            throw serialization_error(e.info + "\n   while serializing object of type rgb_alpha_pixel"); 
        }
    }

// ----------------------------------------------------------------------------------------

    void deserialize (
        rgb_alpha_pixel& item, 
        std::istream& in
    )   
    {
        try
        {
            deserialize(item.red,in);
            deserialize(item.green,in);
            deserialize(item.blue,in);
            deserialize(item.alpha,in);
        }
        catch (serialization_error& e)
        {
            throw serialization_error(e.info + "\n   while deserializing object of type rgb_alpha_pixel"); 
        }
    }

// ----------------------------------------------------------------------------------------

    void serialize (
        const rgb_pixel& item, 
        std::ostream& out 
    )   
    {
        try
        {
            serialize(item.red,out);
            serialize(item.green,out);
            serialize(item.blue,out);
        }
        catch (serialization_error& e)
        {
            throw serialization_error(e.info + "\n   while serializing object of type rgb_pixel"); 
        }
    }

// ----------------------------------------------------------------------------------------

    void deserialize (
        rgb_pixel& item, 
        std::istream& in
    )   
    {
        try
        {
            deserialize(item.red,in);
            deserialize(item.green,in);
            deserialize(item.blue,in);
        }
        catch (serialization_error& e)
        {
            throw serialization_error(e.info + "\n   while deserializing object of type rgb_pixel"); 
        }
    }

// ----------------------------------------------------------------------------------------

    void serialize (
        const hsi_pixel& item, 
        std::ostream& out 
    )   
    {
        try
        {
            serialize(item.h,out);
            serialize(item.s,out);
            serialize(item.i,out);
        }
        catch (serialization_error& e)
        {
            throw serialization_error(e.info + "\n   while serializing object of type hsi_pixel"); 
        }
    }

// ----------------------------------------------------------------------------------------

    void deserialize (
        hsi_pixel& item, 
        std::istream& in
    )   
    {
        try
        {
            deserialize(item.h,in);
            deserialize(item.s,in);
            deserialize(item.i,in);
        }
        catch (serialization_error& e)
        {
            throw serialization_error(e.info + "\n   while deserializing object of type hsi_pixel"); 
        }
    }

// ----------------------------------------------------------------------------------------

    namespace assign_pixel_helpers
    {
        /*
            I found this excellent bit of code at 
            http://local.wasp.uwa.edu.au/~pbourke/colour/hsl/
        */

        /*
            Calculate HSL from RGB
            Hue is in degrees
            Lightness is between 0 and 1
            Saturation is between 0 and 1
        */
        HSL RGB2HSL(COLOUR c1)
        {
            double themin,themax,delta;
            HSL c2;
            using namespace std;

            themin = min(c1.r,min(c1.g,c1.b));
            themax = max(c1.r,max(c1.g,c1.b));
            delta = themax - themin;
            c2.l = (themin + themax) / 2;
            c2.s = 0;
            if (c2.l > 0 && c2.l < 1)
                c2.s = delta / (c2.l < 0.5 ? (2*c2.l) : (2-2*c2.l));
            c2.h = 0;
            if (delta > 0) {
                if (themax == c1.r && themax != c1.g)
                    c2.h += (c1.g - c1.b) / delta;
                if (themax == c1.g && themax != c1.b)
                    c2.h += (2 + (c1.b - c1.r) / delta);
                if (themax == c1.b && themax != c1.r)
                    c2.h += (4 + (c1.r - c1.g) / delta);
                c2.h *= 60;
            }
            return(c2);
        }

        /*
            Calculate RGB from HSL, reverse of RGB2HSL()
            Hue is in degrees
            Lightness is between 0 and 1
            Saturation is between 0 and 1
        */
        COLOUR HSL2RGB(HSL c1)
        {
            COLOUR c2,sat,ctmp;
            using namespace std;

            if (c1.h < 120) {
                sat.r = (120 - c1.h) / 60.0;
                sat.g = c1.h / 60.0;
                sat.b = 0;
            } else if (c1.h < 240) {
                sat.r = 0;
                sat.g = (240 - c1.h) / 60.0;
                sat.b = (c1.h - 120) / 60.0;
            } else {
                sat.r = (c1.h - 240) / 60.0;
                sat.g = 0;
                sat.b = (360 - c1.h) / 60.0;
            }
            sat.r = min(sat.r,1.0);
            sat.g = min(sat.g,1.0);
            sat.b = min(sat.b,1.0);

            ctmp.r = 2 * c1.s * sat.r + (1 - c1.s);
            ctmp.g = 2 * c1.s * sat.g + (1 - c1.s);
            ctmp.b = 2 * c1.s * sat.b + (1 - c1.s);

            if (c1.l < 0.5) {
                c2.r = c1.l * ctmp.r;
                c2.g = c1.l * ctmp.g;
                c2.b = c1.l * ctmp.b;
            } else {
                c2.r = (1 - c1.l) * ctmp.r + 2 * c1.l - 1;
                c2.g = (1 - c1.l) * ctmp.g + 2 * c1.l - 1;
                c2.b = (1 - c1.l) * ctmp.b + 2 * c1.l - 1;
            }

            return(c2);
        }
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_PIXEL_CPp_

