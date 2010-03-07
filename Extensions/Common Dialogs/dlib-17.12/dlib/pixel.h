// Copyright (C) 2006  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_PIXEl_ 
#define DLIB_PIXEl_

#include <iostream>
#include "serialize.h"
#include <cmath>
#include "algs.h"
#include "uintn.h"
#include <limits>
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
            It defines the properties of a pixel (duah).

        This traits class will define the following public static members:
            - bool grayscale
            - bool rgb
            - bool rgb_alpha
            - bool hsi

            - bool has_alpha

            - long num 
            - unsigned long max()

        The above public constants are subject to the following constraints:
            - only one of grayscale, rgb, rgb_alpha, or hsi is true
            - if (rgb == true) then
                - The type T will be a struct with 3 public members of type 
                  unsigned char named "red" "green" and "blue".  
                - This type of pixel represents the RGB color space.
                - num == 3
                - has_alpha == false
                - max() == 255
            - if (rgb_alpha == true) then
                - The type T will be a struct with 4 public members of type 
                  unsigned char named "red" "green" "blue" and "alpha".  
                - This type of pixel represents the RGB color space with
                  an alpha channel where an alpha of 0 represents a pixel
                  that is totally transparent and 255 represents a pixel 
                  with maximum opacity.
                - num == 4
                - has_alpha == true 
                - max() == 255
            - else if (hsi == true) then
                - The type T will be a struct with 3 public members of type
                  unsigned char named "h" "s" and "i".  
                - This type of pixel represents the HSI color space.
                - num == 3
                - has_alpha == false 
                - max() == 255
            - else
                - grayscale == true
                - The type T will be an unsigned integral type.
                - This type of pixel represents a grayscale color space
                - num == 1
                - has_alpha == false 
                - max() == std::numeric_limits<T>::max() 
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
                - simply coppies the value of src into dest.  In other words,
                  dest will be identical to src after this function returns.
            - else if (P1 and P2 are not the same type of pixel) then
                - assigns pixel src to pixel dest and does any necessary color space
                  conversions.   
                - When converting from a grayscale color space with more than 255 values the
                  pixel intensity is saturated at pixel_traits<P1>::max().
                - if (the dest pixel has an alpha channel and the src pixel doesn't) then
                    - #dest.alpha == 255 
                - else if (the src pixel has an alpha channel but the dest pixel doesn't) then
                    - #dest == the original dest value blended with the src value according
                      to the alpha channel in src.  
                      (i.e.  #dest == src*(alpha/255) + dest*(1-alpha/255))
    !*/

    template <
        typename P
        >
    inline void assign_pixel (
        P& dest,
        const int src
    );
    /*!
        requires
            - pixel_traits<P> must be defined
        ensures
            - performs assign_pixel(dest, static_cast<unsigned long>(max(0,src)))
    !*/

    template <
        typename P
        >
    inline void assign_pixel (
        P& dest,
        const long src
    );
    /*!
        requires
            - pixel_traits<P> must be defined
        ensures
            - performs assign_pixel(dest, static_cast<unsigned long>(max(0,src)))
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename P
        >
    inline unsigned long get_pixel_intensity (
        const P& src
    );
    /*!
        requires
            - pixel_traits<P> must be defined
        ensures
            - if (pixel_traits<P>::grayscale == true) then
                - returns src
            - else
                - converts src to the HSI color space and returns the intensity 
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename P
        >
    inline void assign_pixel_intensity (
        P& dest,
        const unsigned long new_intensity
    );
    /*!
        requires
            - pixel_traits<P> must be defined
        ensures
            - let val == min(new_intensity,  pixel_traits<P>::max())
            - #get_pixel_intensity(dest) == val 
            - if (the dest pixel has an alpha channel) then
                - #dest.alpha == dest.alpha
    !*/

// ----------------------------------------------------------------------------------------

    void serialize (
        const rgb_pixel& item, 
        std::ostream& out 
    );   
    /*!
        provides serialization support for the rgb_pixel struct
    !*/

// ----------------------------------------------------------------------------------------

    void deserialize (
        rgb_pixel& item, 
        std::istream& in
    );   
    /*!
        provides deserialization support for the rgb_pixel struct
    !*/

// ----------------------------------------------------------------------------------------

    void serialize (
        const rgb_alpha_pixel& item, 
        std::ostream& out 
    );   
    /*!
        provides serialization support for the rgb_alpha_pixel struct
    !*/

// ----------------------------------------------------------------------------------------

    void deserialize (
        rgb_alpha_pixel& item, 
        std::istream& in
    );   
    /*!
        provides deserialization support for the rgb_alpha_pixel struct
    !*/

// ----------------------------------------------------------------------------------------

    void serialize (
        const hsi_pixel& item, 
        std::ostream& out 
    );   
    /*!
        provides serialization support for the hsi_pixel struct
    !*/

// ----------------------------------------------------------------------------------------

    void deserialize (
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
        static unsigned long max() { return 255;}
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
        static unsigned long max() { return 255; }
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
        static unsigned long max() { return 255;}
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
        static unsigned long max() { return std::numeric_limits<T>::max();}
    };

    template <> struct pixel_traits<unsigned char>  : public grayscale_pixel_traits<unsigned char> {};
    template <> struct pixel_traits<unsigned short> : public grayscale_pixel_traits<unsigned short> {};
    template <> struct pixel_traits<unsigned int> : public grayscale_pixel_traits<unsigned int> {};
    template <> struct pixel_traits<unsigned long> : public grayscale_pixel_traits<unsigned long> {};

// ----------------------------------------------------------------------------------------

    // The following is a bunch of conversion stuff for the assign_pixel function.

    namespace assign_pixel_helpers
    {
        enum
        {
            grayscale = 1,
            rgb,
            hsi,
            rgb_alpha
        };

        template <
            typename P1,
            typename P2,
            int p1_type = static_switch<
                pixel_traits<P1>::grayscale,
                pixel_traits<P1>::rgb,
                pixel_traits<P1>::hsi,  
                pixel_traits<P1>::rgb_alpha >::value,
            int p2_type = static_switch<
                pixel_traits<P2>::grayscale,
                pixel_traits<P2>::rgb,
                pixel_traits<P2>::hsi,
                pixel_traits<P2>::rgb_alpha  >::value
            >
        struct helper;

    // -----------------------------
        // all the same kind 

        template < typename P >
        struct helper<P,P,grayscale,grayscale>
        {
            static void assign(P& dest, const P& src) 
            { 
                dest = src;
            }
        };

        template < typename P1, typename P2 >
        struct helper<P1,P2,grayscale,grayscale>
        {
            static void assign(P1& dest, const P2& src) 
            { 
                if (src <= pixel_traits<P1>::max())
                    dest = static_cast<P1>(src);
                else
                    dest = static_cast<P1>(pixel_traits<P1>::max());
            }
        };

        template < typename P1, typename P2 >
        struct helper<P1,P2,rgb,rgb>
        {
            static void assign(P1& dest, const P2& src) 
            { 
                dest.red = src.red; 
                dest.green = src.green; 
                dest.blue = src.blue; 
            }
        };

        template < typename P1, typename P2 >
        struct helper<P1,P2,rgb_alpha,rgb_alpha>
        {
            static void assign(P1& dest, const P2& src) 
            { 
                dest.red = src.red; 
                dest.green = src.green; 
                dest.blue = src.blue; 
                dest.alpha = src.alpha; 
            }
        };

        template < typename P1, typename P2 >
        struct helper<P1,P2,hsi,hsi>
        {
            static void assign(P1& dest, const P2& src) 
            { 
                dest.h = src.h; 
                dest.s = src.s; 
                dest.i = src.i; 
            }
        };

    // -----------------------------
        // dest is a grayscale

        template < typename P1, typename P2 >
        struct helper<P1,P2,grayscale,rgb>
        {
            static void assign(P1& dest, const P2& src) 
            { 
                dest = static_cast<P1>((static_cast<unsigned int>(src.red) +
                        static_cast<unsigned int>(src.green) +  
                        static_cast<unsigned int>(src.blue))/3); 
            }
        };

        template < typename P1, typename P2 >
        struct helper<P1,P2,grayscale,rgb_alpha>
        {
            static void assign(P1& dest, const P2& src) 
            { 

                const unsigned char avg = static_cast<unsigned char>((static_cast<unsigned int>(src.red) +
                                                           static_cast<unsigned int>(src.green) +  
                                                           static_cast<unsigned int>(src.blue))/3); 

                if (src.alpha == 255)
                {
                    dest = avg;
                }
                else
                {
                    // perform this assignment using fixed point arithmetic: 
                    // dest = src*(alpha/255) + src*(1 - alpha/255);
                    // dest = src*(alpha/255) + dest*1 - dest*(alpha/255);
                    // dest = dest*1 + src*(alpha/255) - dest*(alpha/255);
                    // dest = dest*1 + (src - dest)*(alpha/255);
                    // dest += (src - dest)*(alpha/255);

                    unsigned int temp = avg;

                    temp -= dest;

                    temp *= src.alpha;

                    temp >>= 8;

                    dest += static_cast<unsigned char>(temp&0xFF);
                }
            }
        };

        template < typename P1, typename P2 >
        struct helper<P1,P2,grayscale,hsi>
        {
            static void assign(P1& dest, const P2& src) 
            { 
                dest = static_cast<P1>(src.i);
            }
        };


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
        Calculate HSL from RGB
        Hue is in degrees
        Lightness is between 0 and 1
        Saturation is between 0 and 1
        */
        HSL RGB2HSL(COLOUR c1);

        /*
        Calculate RGB from HSL, reverse of RGB2HSL()
        Hue is in degrees
        Lightness is between 0 and 1
        Saturation is between 0 and 1
        */
        COLOUR HSL2RGB(HSL c1);


    // -----------------------------
        // dest is a color rgb_pixel

        template < typename P1 >
        struct helper<P1,unsigned char,rgb,grayscale>
        {
            static void assign(P1& dest, const unsigned char& src) 
            { 
                dest.red = src; 
                dest.green = src; 
                dest.blue = src; 
            }
        };

        template < typename P1, typename P2 >
        struct helper<P1,P2,rgb,grayscale>
        {
            static void assign(P1& dest, const P2& src) 
            { 
                unsigned char p;
                if (src <= 255)
                    p = static_cast<unsigned char>(src);
                else
                    p = 255;

                dest.red = p; 
                dest.green = p; 
                dest.blue = p; 
            }
        };

        template < typename P1, typename P2 >
        struct helper<P1,P2,rgb,rgb_alpha>
        {
            static void assign(P1& dest, const P2& src) 
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
                    // dest = src*(alpha/255) + src*(1 - alpha/255);
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
        };

        template < typename P1, typename P2 >
        struct helper<P1,P2,rgb,hsi>
        {
            static void assign(P1& dest, const P2& src) 
            { 
                COLOUR c;
                HSL h;
                h.h = src.h;
                h.h = h.h/255.0*360;
                h.s = src.s/255.0;
                h.l = src.i/255.0;
                c = HSL2RGB(h);

                dest.red = static_cast<unsigned char>(c.r*255.0);
                dest.green = static_cast<unsigned char>(c.g*255.0);
                dest.blue = static_cast<unsigned char>(c.b*255.0);
            }
        };

    // -----------------------------
        // dest is a color rgb_alpha_pixel

        template < typename P1 >
        struct helper<P1,unsigned char,rgb_alpha,grayscale>
        {
            static void assign(P1& dest, const unsigned char& src) 
            { 
                dest.red = src; 
                dest.green = src; 
                dest.blue = src; 
                dest.alpha = 255;
            }
        };


        template < typename P1, typename P2 >
        struct helper<P1,P2,rgb_alpha,grayscale>
        {
            static void assign(P1& dest, const P2& src) 
            { 
                unsigned char p;
                if (src <= 255)
                    p = static_cast<unsigned char>(src);
                else
                    p = 255;

                dest.red = p; 
                dest.green = p; 
                dest.blue = p; 
                dest.alpha = 255;
            }
        };

        template < typename P1, typename P2 >
        struct helper<P1,P2,rgb_alpha,rgb>
        {
            static void assign(P1& dest, const P2& src) 
            { 
                dest.red = src.red;
                dest.green = src.green;
                dest.blue = src.blue;
                dest.alpha = 255;
            }
        };

        template < typename P1, typename P2 >
        struct helper<P1,P2,rgb_alpha,hsi>
        {
            static void assign(P1& dest, const P2& src) 
            { 
                COLOUR c;
                HSL h;
                h.h = src.h;
                h.h = h.h/255.0*360;
                h.s = src.s/255.0;
                h.l = src.i/255.0;
                c = HSL2RGB(h);

                dest.red = static_cast<unsigned char>(c.r*255.0);
                dest.green = static_cast<unsigned char>(c.g*255.0);
                dest.blue = static_cast<unsigned char>(c.b*255.0);
                dest.alpha = 255;
            }
        };

    // -----------------------------
        // dest is an hsi pixel

        template < typename P1>
        struct helper<P1,unsigned char,hsi,grayscale>
        {
            static void assign(P1& dest, const unsigned char& src) 
            { 
                dest.h = 0;
                dest.s = 0;
                dest.i = src;
            }
        };


        template < typename P1, typename P2 >
        struct helper<P1,P2,hsi,grayscale>
        {
            static void assign(P1& dest, const P2& src) 
            { 
                dest.h = 0;
                dest.s = 0;
                if (src <= 255)
                    dest.i = static_cast<unsigned char>(src);
                else
                    dest.i = 255;
            }
        };

        template < typename P1, typename P2 >
        struct helper<P1,P2,hsi,rgb_alpha>
        {
            static void assign(P1& dest, const P2& src) 
            { 
                rgb_pixel temp;
                // convert target hsi pixel to rgb
                helper<rgb_pixel,P1>::assign(temp,dest);

                // now assign the rgb_alpha value to our temp rgb pixel
                helper<rgb_pixel,P2>::assign(temp,src);

                // now we can just go assign the new rgb value to the
                // hsi pixel
                helper<P1,rgb_pixel>::assign(dest,temp);
            }
        };

        template < typename P1, typename P2 >
        struct helper<P1,P2,hsi,rgb>
        {
            static void assign(P1& dest, const P2& src) 
            { 
                COLOUR c1;
                HSL c2;
                c1.r = src.red/255.0;
                c1.g = src.green/255.0;
                c1.b = src.blue/255.0;
                c2 = RGB2HSL(c1);
                
                dest.h = static_cast<unsigned char>(c2.h/360.0*255.0);
                dest.s = static_cast<unsigned char>(c2.s*255.0);
                dest.i = static_cast<unsigned char>(c2.l*255.0);
            }
        };
    }

    // -----------------------------

    template < typename P1, typename P2 >
    inline void assign_pixel (
        P1& dest,
        const P2& src
    ) { assign_pixel_helpers::helper<P1,P2>::assign(dest,src); }

    template < typename P1>
    inline void assign_pixel (
        P1& dest,
        const int src
    ) 
    { 
        unsigned long p;
        if (src >= 0)
            p = static_cast<unsigned long>(src);
        else
            p = 0;

        assign_pixel(dest, p);
    }

    template < typename P1>
    inline void assign_pixel (
        P1& dest,
        const long src
    ) 
    { 
        unsigned long p;
        if (src >= 0)
            p = static_cast<unsigned long>(src);
        else
            p = 0;

        assign_pixel(dest, p);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename P
        >
    inline typename enable_if_c<pixel_traits<P>::grayscale>::type assign_pixel_intensity_helper (
        P& dest,
        const unsigned long& new_intensity
    )
    {
        assign_pixel(dest, new_intensity);
    }

    template <
        typename P
        >
    inline typename enable_if_c<pixel_traits<P>::grayscale == false&&
                                pixel_traits<P>::has_alpha>::type assign_pixel_intensity_helper (
        P& dest,
        const unsigned long& new_intensity
    )
    {
        unsigned long alpha = dest.alpha;
        hsi_pixel p;
        assign_pixel(p,dest);
        assign_pixel(p.i, new_intensity);
        assign_pixel(dest,p);
        dest.alpha = alpha;
    }

    template <
        typename P
        >
    inline typename enable_if_c<pixel_traits<P>::grayscale == false&&
                                pixel_traits<P>::has_alpha == false>::type assign_pixel_intensity_helper (
        P& dest,
        const unsigned long& new_intensity
    )
    {
        hsi_pixel p;
        assign_pixel(p,dest);
        assign_pixel(p.i, new_intensity);
        assign_pixel(dest,p);
    }

    template <
        typename P
        >
    inline void assign_pixel_intensity (
        P& dest,
        const unsigned long new_intensity
    )
    {
        assign_pixel_intensity_helper(dest, new_intensity);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename P
        >
    inline typename enable_if_c<pixel_traits<P>::grayscale,unsigned long>::type get_pixel_intensity_helper (
        const P& src 
    )
    {
        return static_cast<unsigned long>(src);
    }

    template <
        typename P
        >
    inline typename enable_if_c<pixel_traits<P>::grayscale == false&&
                                pixel_traits<P>::has_alpha, unsigned long>::type get_pixel_intensity_helper (
        const P& src
    )
    {
        P temp = src;
        temp.alpha = 255;
        hsi_pixel p;
        assign_pixel(p,temp);
        return static_cast<unsigned long>(p.i);
    }

    template <
        typename P
        >
    inline typename enable_if_c<pixel_traits<P>::grayscale == false&&
                                pixel_traits<P>::has_alpha == false, unsigned long>::type get_pixel_intensity_helper (
        const P& src
    )
    {
        hsi_pixel p;
        assign_pixel(p,src);
        return static_cast<unsigned long>(p.i);
    }

    template <
        typename P
        >
    inline unsigned long get_pixel_intensity (
        const P& src
    )
    {
        return get_pixel_intensity_helper(src);
    }

// ----------------------------------------------------------------------------------------

}

#ifdef NO_MAKEFILE
#include "pixel.cpp"
#endif


#endif // DLIB_PIXEl_ 

