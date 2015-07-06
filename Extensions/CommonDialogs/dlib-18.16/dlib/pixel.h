// Copyright (C) 2006  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_PIXEl_ 
#define DLIB_PIXEl_

#include <iostream>
#include "serialize.h"
#include <cmath>
#include "algs.h"
#include "uintn.h"
#include <limits>
#include <complex>
#include "enable_if.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    /*!
        This file contains definitions of pixel objects and related classes and
        functionality.
    !*/

// ----------------------------------------------------------------------------------------

    template <typename T>
    struct pixel_traits;
    /*!
        WHAT THIS OBJECT REPRESENTS
            As the name implies, this is a traits class for pixel types.
            It defines the properties of a pixel.

        This traits class will define the following public static members:
            - bool grayscale
            - bool rgb
            - bool rgb_alpha
            - bool hsi

            - bool has_alpha

            - long num 

            - basic_pixel_type
            - basic_pixel_type min()
            - basic_pixel_type max()
            - is_unsigned

        The above public constants are subject to the following constraints:
            - only one of grayscale, rgb, rgb_alpha, or hsi is true
            - if (rgb == true) then
                - The type T will be a struct with 3 public members of type 
                  unsigned char named "red" "green" and "blue".  
                - This type of pixel represents the RGB color space.
                - num == 3
                - has_alpha == false
                - basic_pixel_type == unsigned char
                - min() == 0 
                - max() == 255
                - is_unsigned == true
            - if (rgb_alpha == true) then
                - The type T will be a struct with 4 public members of type 
                  unsigned char named "red" "green" "blue" and "alpha".  
                - This type of pixel represents the RGB color space with
                  an alpha channel where an alpha of 0 represents a pixel
                  that is totally transparent and 255 represents a pixel 
                  with maximum opacity.
                - num == 4
                - has_alpha == true 
                - basic_pixel_type == unsigned char
                - min() == 0 
                - max() == 255
                - is_unsigned == true
            - else if (hsi == true) then
                - The type T will be a struct with 3 public members of type
                  unsigned char named "h" "s" and "i".  
                - This type of pixel represents the HSI color space.
                - num == 3
                - has_alpha == false 
                - basic_pixel_type == unsigned char
                - min() == 0 
                - max() == 255
                - is_unsigned == true
            - else
                - grayscale == true
                - This type of pixel represents a grayscale color space.  T 
                  will be some kind of basic scalar type such as unsigned int.
                - num == 1
                - has_alpha == false 
                - basic_pixel_type == T 
                - min() == the minimum obtainable value of objects of type T 
                - max() == the maximum obtainable value of objects of type T 
                - is_unsigned is true if min() == 0 and false otherwise
    !*/

// ----------------------------------------------------------------------------------------

    struct rgb_pixel
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This is a simple struct that represents an RGB colored graphical pixel.
        !*/

        rgb_pixel (
        ) {}

        rgb_pixel (
            unsigned char red_,
            unsigned char green_,
            unsigned char blue_
        ) : red(red_), green(green_), blue(blue_) {}

        unsigned char red;
        unsigned char green;
        unsigned char blue;
    };

// ----------------------------------------------------------------------------------------

    struct bgr_pixel
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This is a simple struct that represents an BGR colored graphical pixel.
                (the reason it exists in addition to the rgb_pixel is so you can lay
                it down on top of a memory region that organizes its color data in the
                BGR format and still be able to read it)
        !*/

        bgr_pixel (
        ) {}

        bgr_pixel (
            unsigned char blue_,
            unsigned char green_,
            unsigned char red_
        ) : blue(blue_), green(green_), red(red_) {}

        unsigned char blue;
        unsigned char green;
        unsigned char red;
    };

// ----------------------------------------------------------------------------------------

    struct rgb_alpha_pixel
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This is a simple struct that represents an RGB colored graphical pixel
                with an alpha channel.
        !*/

        rgb_alpha_pixel (
        ) {}

        rgb_alpha_pixel (
            unsigned char red_,
            unsigned char green_,
            unsigned char blue_,
            unsigned char alpha_
        ) : red(red_), green(green_), blue(blue_), alpha(alpha_) {}

        unsigned char red;
        unsigned char green;
        unsigned char blue;
        unsigned char alpha;
    };

// ----------------------------------------------------------------------------------------

    struct hsi_pixel
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This is a simple struct that represents an HSI colored graphical pixel.
        !*/

        hsi_pixel (
        ) {}

        hsi_pixel (
            unsigned char h_,
            unsigned char s_,
            unsigned char i_
        ) : h(h_), s(s_), i(i_) {}

        unsigned char h;
        unsigned char s;
        unsigned char i;
    };

// ----------------------------------------------------------------------------------------

    template <
        typename P1,
        typename P2  
        >
    inline void assign_pixel (
        P1& dest,
        const P2& src
    );
    /*!
        requires
            - pixel_traits<P1> must be defined
            - pixel_traits<P2> must be defined
        ensures
            - if (P1 and P2 are the same type of pixel) then
                - simply copies the value of src into dest.  In other words,
                  dest will be identical to src after this function returns.
            - else if (P1 and P2 are not the same type of pixel) then
                - assigns pixel src to pixel dest and does any necessary color space
                  conversions.   
                - When converting from a grayscale color space with more than 255 values the
                  pixel intensity is saturated at pixel_traits<P1>::max() or pixel_traits<P1>::min()
                  as appropriate.
                - if (the dest pixel has an alpha channel and the src pixel doesn't) then
                    - #dest.alpha == 255 
                - else if (the src pixel has an alpha channel but the dest pixel doesn't) then
                    - #dest == the original dest value blended with the src value according
                      to the alpha channel in src.  
                      (i.e.  #dest == src*(alpha/255) + dest*(1-alpha/255))
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename P
        >
    inline typename pixel_traits<P>::basic_pixel_type get_pixel_intensity (
        const P& src
    );
    /*!
        requires
            - pixel_traits<P> must be defined
        ensures
            - if (pixel_traits<P>::grayscale == true) then
                - returns src
            - else
                - converts src to grayscale and returns the resulting value.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename P,
        typename T
        >
    inline void assign_pixel_intensity (
        P& dest,
        const T& new_intensity
    );
    /*!
        requires
            - pixel_traits<P> must be defined
            - pixel_traits<T> must be defined
        ensures
            - This function changes the intensity of the dest pixel. So if the pixel in 
              question is a grayscale pixel then it simply assigns that pixel with the 
              value of get_pixel_intensity(new_intensity).  However, if the pixel is not 
              a grayscale pixel then it converts the pixel to the HSI color space and sets 
              the I channel to the given intensity and then converts this HSI value back to 
              the original pixel's color space.
            - Note that we don't necessarily have #get_pixel_intensity(dest) == get_pixel_intensity(new_intensity) 
              due to vagaries of how converting to and from HSI works out.
            - if (the dest pixel has an alpha channel) then
                - #dest.alpha == dest.alpha
    !*/

// ----------------------------------------------------------------------------------------

    inline void serialize (
        const rgb_pixel& item, 
        std::ostream& out 
    );   
    /*!
        provides serialization support for the rgb_pixel struct
    !*/

// ----------------------------------------------------------------------------------------

    inline void deserialize (
        rgb_pixel& item, 
        std::istream& in
    );   
    /*!
        provides deserialization support for the rgb_pixel struct
    !*/

// ----------------------------------------------------------------------------------------

    inline void serialize (
        const bgr_pixel& item, 
        std::ostream& out 
    );   
    /*!
        provides serialization support for the bgr_pixel struct
    !*/

// ----------------------------------------------------------------------------------------

    inline void deserialize (
        bgr_pixel& item, 
        std::istream& in
    );   
    /*!
        provides deserialization support for the bgr_pixel struct
    !*/

// ----------------------------------------------------------------------------------------

    inline void serialize (
        const rgb_alpha_pixel& item, 
        std::ostream& out 
    );   
    /*!
        provides serialization support for the rgb_alpha_pixel struct
    !*/

// ----------------------------------------------------------------------------------------

    inline void deserialize (
        rgb_alpha_pixel& item, 
        std::istream& in
    );   
    /*!
        provides deserialization support for the rgb_alpha_pixel struct
    !*/

// ----------------------------------------------------------------------------------------

    inline void serialize (
        const hsi_pixel& item, 
        std::ostream& out 
    );   
    /*!
        provides serialization support for the hsi_pixel struct
    !*/

// ----------------------------------------------------------------------------------------

    inline void deserialize (
        hsi_pixel& item, 
        std::istream& in
    );   
    /*!
        provides deserialization support for the hsi_pixel struct
    !*/

// ----------------------------------------------------------------------------------------

    template <>
    struct pixel_traits<rgb_pixel>
    {
        const static bool rgb  = true;
        const static bool rgb_alpha  = false;
        const static bool grayscale = false;
        const static bool hsi = false;
        const static long num = 3;
        typedef unsigned char basic_pixel_type;
        static basic_pixel_type min() { return 0;}
        static basic_pixel_type max() { return 255;}
        const static bool is_unsigned = true;
        const static bool has_alpha = false;
    };

// ----------------------------------------------------------------------------------------

    template <>
    struct pixel_traits<bgr_pixel>
    {
        const static bool rgb  = true;
        const static bool rgb_alpha  = false;
        const static bool grayscale = false;
        const static bool hsi = false;
        const static long num = 3;
        typedef unsigned char basic_pixel_type;
        static basic_pixel_type min() { return 0;}
        static basic_pixel_type max() { return 255;}
        const static bool is_unsigned = true;
        const static bool has_alpha = false;
    };

// ----------------------------------------------------------------------------------------

    template <>
    struct pixel_traits<rgb_alpha_pixel>
    {
        const static bool rgb  = false;
        const static bool rgb_alpha  = true;
        const static bool grayscale = false;
        const static bool hsi = false;
        const static long num = 4;
        typedef unsigned char basic_pixel_type;
        static basic_pixel_type min() { return 0;}
        static basic_pixel_type max() { return 255;}
        const static bool is_unsigned = true;
        const static bool has_alpha = true;
    };

// ----------------------------------------------------------------------------------------


    template <>
    struct pixel_traits<hsi_pixel>
    {
        const static bool rgb  = false;
        const static bool rgb_alpha  = false;
        const static bool grayscale = false;
        const static bool hsi = true;
        const static long num = 3;
        typedef unsigned char basic_pixel_type;
        static basic_pixel_type min() { return 0;}
        static basic_pixel_type max() { return 255;}
        const static bool is_unsigned = true;
        const static bool has_alpha = false;
    };

// ----------------------------------------------------------------------------------------

    template <typename T>
    struct grayscale_pixel_traits
    {
        const static bool rgb  = false;
        const static bool rgb_alpha  = false;
        const static bool grayscale = true;
        const static bool hsi = false;
        const static long num = 1;
        const static bool has_alpha = false;
        typedef T basic_pixel_type;
        static basic_pixel_type min() { return std::numeric_limits<T>::min();}
        static basic_pixel_type max() { return std::numeric_limits<T>::max();}
        const static bool is_unsigned = is_unsigned_type<T>::value;
    };

    template <> struct pixel_traits<unsigned char>  : public grayscale_pixel_traits<unsigned char> {};
    template <> struct pixel_traits<unsigned short> : public grayscale_pixel_traits<unsigned short> {};
    template <> struct pixel_traits<unsigned int>   : public grayscale_pixel_traits<unsigned int> {};
    template <> struct pixel_traits<unsigned long>  : public grayscale_pixel_traits<unsigned long> {};

    template <> struct pixel_traits<char>           : public grayscale_pixel_traits<char> {};
    template <> struct pixel_traits<signed char>    : public grayscale_pixel_traits<signed char> {};
    template <> struct pixel_traits<short>          : public grayscale_pixel_traits<short> {};
    template <> struct pixel_traits<int>            : public grayscale_pixel_traits<int> {};
    template <> struct pixel_traits<long>           : public grayscale_pixel_traits<long> {};

    template <> struct pixel_traits<int64>          : public grayscale_pixel_traits<int64> {};
    template <> struct pixel_traits<uint64>         : public grayscale_pixel_traits<uint64> {};

// ----------------------------------------------------------------------------------------

    template <typename T>
    struct float_grayscale_pixel_traits
    {
        const static bool rgb  = false;
        const static bool rgb_alpha  = false;
        const static bool grayscale = true;
        const static bool hsi = false;
        const static long num = 1;
        const static bool has_alpha = false;
        typedef T basic_pixel_type;
        static basic_pixel_type min() { return -std::numeric_limits<T>::max();}
        static basic_pixel_type max() { return std::numeric_limits<T>::max();}
        const static bool is_unsigned = false;
    };

    template <> struct pixel_traits<float>          : public float_grayscale_pixel_traits<float> {};
    template <> struct pixel_traits<double>         : public float_grayscale_pixel_traits<double> {};
    template <> struct pixel_traits<long double>    : public float_grayscale_pixel_traits<long double> {};

    // These are here mainly so you can easily copy images into complex arrays.  This is
    // useful when you want to do a FFT on an image or some similar operation.
    template <> struct pixel_traits<std::complex<float> > :       public float_grayscale_pixel_traits<float> {};
    template <> struct pixel_traits<std::complex<double> > :      public float_grayscale_pixel_traits<double> {};
    template <> struct pixel_traits<std::complex<long double> > : public float_grayscale_pixel_traits<long double> {};

// ----------------------------------------------------------------------------------------

    // The following is a bunch of conversion stuff for the assign_pixel function.

    namespace assign_pixel_helpers
    {

    // -----------------------------
        // all the same kind 

        template < typename P >
        typename enable_if_c<pixel_traits<P>::grayscale>::type
        assign(P& dest, const P& src) 
        { 
            dest = src;
        }

    // -----------------------------

        template <typename T>
        typename unsigned_type<T>::type make_unsigned (
            const T& val
        ) { return static_cast<typename unsigned_type<T>::type>(val); }

        inline float make_unsigned(const float& val) { return val; }
        inline double make_unsigned(const double& val) { return val; }
        inline long double make_unsigned(const long double& val) { return val; }


        template <typename T, typename P>
        typename enable_if_c<pixel_traits<T>::is_unsigned == pixel_traits<P>::is_unsigned, bool>::type less_or_equal_to_max (
            const P& p
        ) 
        /*!
            ensures
                - returns true if p is <= max value of T
        !*/
        { 
            return p <= pixel_traits<T>::max();         
        }

        template <typename T, typename P>
        typename enable_if_c<pixel_traits<T>::is_unsigned && !pixel_traits<P>::is_unsigned, bool>::type less_or_equal_to_max (
            const P& p
        ) 
        { 
            if (p <= 0)
                return true;
            else if (make_unsigned(p) <= pixel_traits<T>::max())
                return true;
            else
                return false;
        }

        template <typename T, typename P>
        typename enable_if_c<!pixel_traits<T>::is_unsigned && pixel_traits<P>::is_unsigned, bool>::type less_or_equal_to_max (
            const P& p
        ) 
        { 
            return p <= make_unsigned(pixel_traits<T>::max());
        }

    // -----------------------------

        template <typename T, typename P>
        typename enable_if_c<pixel_traits<P>::is_unsigned, bool >::type greater_or_equal_to_min (
            const P& 
        ) { return true; }
        /*!
            ensures
                - returns true if p is >= min value of T
        !*/

        template <typename T, typename P>
        typename enable_if_c<!pixel_traits<P>::is_unsigned && pixel_traits<T>::is_unsigned, bool >::type greater_or_equal_to_min (
            const P& p
        ) 
        { 
            return p >= 0;
        }

        template <typename T, typename P>
        typename enable_if_c<!pixel_traits<P>::is_unsigned && !pixel_traits<T>::is_unsigned, bool >::type greater_or_equal_to_min (
            const P& p
        ) 
        { 
            return p >= pixel_traits<T>::min();
        }
    // -----------------------------

        template < typename P1, typename P2 >
        typename enable_if_c<pixel_traits<P1>::grayscale && pixel_traits<P2>::grayscale>::type
        assign(P1& dest, const P2& src) 
        { 
            /*
                The reason for these weird comparison functions is to avoid getting compiler
                warnings about comparing signed types to unsigned and stuff like that.  
            */

            if (less_or_equal_to_max<P1>(src))
                if (greater_or_equal_to_min<P1>(src))
                    dest = static_cast<P1>(src);
                else
                    dest = pixel_traits<P1>::min();
            else
                dest = pixel_traits<P1>::max();
        }

    // -----------------------------
    // -----------------------------
    // -----------------------------

        template < typename P1, typename P2 >
        typename enable_if_c<pixel_traits<P1>::rgb && pixel_traits<P2>::rgb>::type
        assign(P1& dest, const P2& src) 
        { 
            dest.red = src.red; 
            dest.green = src.green; 
            dest.blue = src.blue; 
        }

        template < typename P1, typename P2 >
        typename enable_if_c<pixel_traits<P1>::rgb_alpha && pixel_traits<P2>::rgb_alpha>::type
        assign(P1& dest, const P2& src) 
        { 
            dest.red = src.red; 
            dest.green = src.green; 
            dest.blue = src.blue; 
            dest.alpha = src.alpha; 
        }

        template < typename P1, typename P2 >
        typename enable_if_c<pixel_traits<P1>::hsi && pixel_traits<P2>::hsi>::type
        assign(P1& dest, const P2& src) 
        { 
            dest.h = src.h; 
            dest.s = src.s; 
            dest.i = src.i; 
        }

    // -----------------------------
        // dest is a grayscale

        template < typename P1, typename P2 >
        typename enable_if_c<pixel_traits<P1>::grayscale && pixel_traits<P2>::rgb>::type
        assign(P1& dest, const P2& src) 
        { 
            const unsigned int temp = ((static_cast<unsigned int>(src.red) +
                                        static_cast<unsigned int>(src.green) +  
                                        static_cast<unsigned int>(src.blue))/3);
            assign_pixel(dest, temp);
        }

        template < typename P1, typename P2 >
        typename enable_if_c<pixel_traits<P1>::grayscale && pixel_traits<P2>::rgb_alpha>::type
        assign(P1& dest, const P2& src) 
        { 

            const unsigned char avg = static_cast<unsigned char>((static_cast<unsigned int>(src.red) +
                                                                  static_cast<unsigned int>(src.green) +  
                                                                  static_cast<unsigned int>(src.blue))/3); 

            if (src.alpha == 255)
            {
                assign_pixel(dest, avg);
            }
            else
            {
                // perform this assignment using fixed point arithmetic: 
                // dest = src*(alpha/255) + dest*(1 - alpha/255);
                // dest = src*(alpha/255) + dest*1 - dest*(alpha/255);
                // dest = dest*1 + src*(alpha/255) - dest*(alpha/255);
                // dest = dest*1 + (src - dest)*(alpha/255);
                // dest += (src - dest)*(alpha/255);

                int temp = avg;
                // copy dest into dest_copy using assign_pixel to avoid potential
                // warnings about implicit float to int warnings.
                int dest_copy;
                assign_pixel(dest_copy, dest);

                temp -= dest_copy;

                temp *= src.alpha;

                temp /= 255;

                assign_pixel(dest, temp+dest_copy);
            }
        }

        template < typename P1, typename P2 >
        typename enable_if_c<pixel_traits<P1>::grayscale && pixel_traits<P2>::hsi>::type
        assign(P1& dest, const P2& src) 
        { 
            assign_pixel(dest, src.i);
        }


    // -----------------------------

        struct HSL
        {
            double h;
            double s;
            double l;
        };

        struct COLOUR
        {
            double r;
            double g;
            double b;
        };

        /*
            I found this excellent bit of code for dealing with HSL spaces at 
            http://local.wasp.uwa.edu.au/~pbourke/colour/hsl/
        */
        /*
            Calculate HSL from RGB
            Hue is in degrees
            Lightness is between 0 and 1
            Saturation is between 0 and 1
        */
        inline HSL RGB2HSL(COLOUR c1)
        {
            double themin,themax,delta;
            HSL c2;
            using namespace std;

            themin = std::min(c1.r,std::min(c1.g,c1.b));
            themax = std::max(c1.r,std::max(c1.g,c1.b));
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
        inline COLOUR HSL2RGB(HSL c1)
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
            sat.r = std::min(sat.r,1.0);
            sat.g = std::min(sat.g,1.0);
            sat.b = std::min(sat.b,1.0);

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


    // -----------------------------
        // dest is a color rgb_pixel

        template < typename P1 >
        typename enable_if_c<pixel_traits<P1>::rgb>::type
        assign(P1& dest, const unsigned char& src) 
        { 
            dest.red = src; 
            dest.green = src; 
            dest.blue = src; 
        }

        template < typename P1, typename P2 >
        typename enable_if_c<pixel_traits<P1>::rgb && pixel_traits<P2>::grayscale>::type
        assign(P1& dest, const P2& src) 
        { 
            unsigned char p;
            assign_pixel(p, src);
            dest.red = p; 
            dest.green = p; 
            dest.blue = p; 
        }

        template < typename P1, typename P2 >
        typename enable_if_c<pixel_traits<P1>::rgb && pixel_traits<P2>::rgb_alpha>::type
        assign(P1& dest, const P2& src) 
        { 
            if (src.alpha == 255)
            {
                dest.red = src.red;
                dest.green = src.green;
                dest.blue = src.blue;
            }
            else
            {
                // perform this assignment using fixed point arithmetic: 
                // dest = src*(alpha/255) + dest*(1 - alpha/255);
                // dest = src*(alpha/255) + dest*1 - dest*(alpha/255);
                // dest = dest*1 + src*(alpha/255) - dest*(alpha/255);
                // dest = dest*1 + (src - dest)*(alpha/255);
                // dest += (src - dest)*(alpha/255);

                unsigned int temp_r = src.red;
                unsigned int temp_g = src.green;
                unsigned int temp_b = src.blue;

                temp_r -= dest.red;
                temp_g -= dest.green;
                temp_b -= dest.blue;

                temp_r *= src.alpha;
                temp_g *= src.alpha;
                temp_b *= src.alpha;

                temp_r >>= 8;
                temp_g >>= 8;
                temp_b >>= 8;

                dest.red += static_cast<unsigned char>(temp_r&0xFF);
                dest.green += static_cast<unsigned char>(temp_g&0xFF);
                dest.blue += static_cast<unsigned char>(temp_b&0xFF);
            }
        }

        template < typename P1, typename P2 >
        typename enable_if_c<pixel_traits<P1>::rgb && pixel_traits<P2>::hsi>::type
        assign(P1& dest, const P2& src) 
        { 
            COLOUR c;
            HSL h;
            h.h = src.h;
            h.h = h.h/255.0*360;
            h.s = src.s/255.0;
            h.l = src.i/255.0;
            c = HSL2RGB(h);

            dest.red = static_cast<unsigned char>(c.r*255.0 + 0.5);
            dest.green = static_cast<unsigned char>(c.g*255.0 + 0.5);
            dest.blue = static_cast<unsigned char>(c.b*255.0 + 0.5);
        }

    // -----------------------------
    // dest is a color rgb_alpha_pixel

        template < typename P1 >
        typename enable_if_c<pixel_traits<P1>::rgb_alpha>::type
        assign(P1& dest, const unsigned char& src) 
        { 
            dest.red = src; 
            dest.green = src; 
            dest.blue = src; 
            dest.alpha = 255;
        }


        template < typename P1, typename P2 >
        typename enable_if_c<pixel_traits<P1>::rgb_alpha && pixel_traits<P2>::grayscale>::type
        assign(P1& dest, const P2& src) 
        { 
            unsigned char p;
            assign_pixel(p, src);

            dest.red = p; 
            dest.green = p; 
            dest.blue = p; 
            dest.alpha = 255;
        }

        template < typename P1, typename P2 >
        typename enable_if_c<pixel_traits<P1>::rgb_alpha && pixel_traits<P2>::rgb>::type
        assign(P1& dest, const P2& src) 
        { 
            dest.red = src.red;
            dest.green = src.green;
            dest.blue = src.blue;
            dest.alpha = 255;
        }

        template < typename P1, typename P2 >
        typename enable_if_c<pixel_traits<P1>::rgb_alpha && pixel_traits<P2>::hsi>::type
        assign(P1& dest, const P2& src) 
        { 
            COLOUR c;
            HSL h;
            h.h = src.h;
            h.h = h.h/255.0*360;
            h.s = src.s/255.0;
            h.l = src.i/255.0;
            c = HSL2RGB(h);

            dest.red = static_cast<unsigned char>(c.r*255.0 + 0.5);
            dest.green = static_cast<unsigned char>(c.g*255.0 + 0.5);
            dest.blue = static_cast<unsigned char>(c.b*255.0 + 0.5);
            dest.alpha = 255;
        }

    // -----------------------------
        // dest is an hsi pixel

        template < typename P1>
        typename enable_if_c<pixel_traits<P1>::hsi>::type
        assign(P1& dest, const unsigned char& src) 
        { 
            dest.h = 0;
            dest.s = 0;
            dest.i = src;
        }


        template < typename P1, typename P2 >
        typename enable_if_c<pixel_traits<P1>::hsi && pixel_traits<P2>::grayscale>::type
        assign(P1& dest, const P2& src) 
        { 
            dest.h = 0;
            dest.s = 0;
            assign_pixel(dest.i, src);
        }

        template < typename P1, typename P2 >
        typename enable_if_c<pixel_traits<P1>::hsi && pixel_traits<P2>::rgb>::type
        assign(P1& dest, const P2& src) 
        { 
            COLOUR c1;
            HSL c2;
            c1.r = src.red/255.0;
            c1.g = src.green/255.0;
            c1.b = src.blue/255.0;
            c2 = RGB2HSL(c1);

            dest.h = static_cast<unsigned char>(c2.h/360.0*255.0 + 0.5);
            dest.s = static_cast<unsigned char>(c2.s*255.0 + 0.5);
            dest.i = static_cast<unsigned char>(c2.l*255.0 + 0.5);
        }

        template < typename P1, typename P2 >
        typename enable_if_c<pixel_traits<P1>::hsi && pixel_traits<P2>::rgb_alpha>::type
        assign(P1& dest, const P2& src) 
        { 
            rgb_pixel temp;
            // convert target hsi pixel to rgb
            assign_pixel_helpers::assign(temp,dest);

            // now assign the rgb_alpha value to our temp rgb pixel
            assign_pixel_helpers::assign(temp,src);

            // now we can just go assign the new rgb value to the
            // hsi pixel
            assign_pixel_helpers::assign(dest,temp);
        }

    }

    // -----------------------------

    template < typename P1, typename P2 >
    inline void assign_pixel (
        P1& dest,
        const P2& src
    ) { assign_pixel_helpers::assign(dest,src); }

// ----------------------------------------------------------------------------------------

    template <
        typename P,
        typename T
        >
    inline typename enable_if_c<pixel_traits<P>::grayscale>::type assign_pixel_intensity_helper (
        P& dest,
        const T& new_intensity
    )
    {
        assign_pixel(dest, new_intensity);
    }

    template <
        typename P,
        typename T
        >
    inline typename enable_if_c<pixel_traits<P>::grayscale == false&&
                                pixel_traits<P>::has_alpha>::type assign_pixel_intensity_helper (
        P& dest,
        const T& new_intensity
    )
    {
        hsi_pixel p;
        const unsigned long old_alpha = dest.alpha;
        dest.alpha = 255;
        rgb_pixel temp;
        assign_pixel(temp, dest); // put dest into an rgb_pixel to avoid the somewhat complicated assign_pixel(hsi,rgb_alpha).
        assign_pixel(p,temp);
        assign_pixel(p.i, new_intensity);
        assign_pixel(dest,p);
        dest.alpha = old_alpha;
    }

    template <
        typename P,
        typename T
        >
    inline typename enable_if_c<pixel_traits<P>::grayscale == false&&
                                pixel_traits<P>::has_alpha == false>::type assign_pixel_intensity_helper (
        P& dest,
        const T& new_intensity
    )
    {
        hsi_pixel p;
        assign_pixel(p,dest);
        assign_pixel(p.i, new_intensity);
        assign_pixel(dest,p);
    }

    template <
        typename P,
        typename T
        >
    inline void assign_pixel_intensity (
        P& dest,
        const T& new_intensity
    )
    {
        assign_pixel_intensity_helper(dest, new_intensity);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename P
        >
    inline typename enable_if_c<pixel_traits<P>::grayscale, P>::type get_pixel_intensity_helper (
        const P& src 
    )
    {
        return src;
    }

    template <
        typename P
        >
    inline typename enable_if_c<pixel_traits<P>::grayscale == false&&
                                pixel_traits<P>::has_alpha, 
                                typename pixel_traits<P>::basic_pixel_type>::type get_pixel_intensity_helper (
        const P& src
    )
    {
        P temp = src;
        temp.alpha = 255;
        typename pixel_traits<P>::basic_pixel_type p;
        assign_pixel(p,temp);
        return p;
    }

    template <
        typename P
        >
    inline typename enable_if_c<pixel_traits<P>::grayscale == false&&
                                pixel_traits<P>::has_alpha == false, 
                                typename pixel_traits<P>::basic_pixel_type>::type get_pixel_intensity_helper (
        const P& src
    )
    {
        typename pixel_traits<P>::basic_pixel_type p;
        assign_pixel(p,src);
        return p;
    }

    template <
        typename P
        >
    inline typename pixel_traits<P>::basic_pixel_type get_pixel_intensity (
        const P& src
    )
    {
        return get_pixel_intensity_helper(src);
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    inline void serialize (
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

    inline void deserialize (
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

    inline void serialize (
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

    inline void deserialize (
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

    inline void serialize (
        const bgr_pixel& item, 
        std::ostream& out 
    )   
    {
        try
        {
            serialize(item.blue,out);
            serialize(item.green,out);
            serialize(item.red,out);
        }
        catch (serialization_error& e)
        {
            throw serialization_error(e.info + "\n   while serializing object of type bgr_pixel"); 
        }
    }

// ----------------------------------------------------------------------------------------

    inline void deserialize (
        bgr_pixel& item, 
        std::istream& in
    )   
    {
        try
        {
            deserialize(item.blue,in);
            deserialize(item.green,in);
            deserialize(item.red,in);
        }
        catch (serialization_error& e)
        {
            throw serialization_error(e.info + "\n   while deserializing object of type bgr_pixel"); 
        }
    }

// ----------------------------------------------------------------------------------------

    inline void serialize (
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

    inline void deserialize (
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

}

#endif // DLIB_PIXEl_ 

