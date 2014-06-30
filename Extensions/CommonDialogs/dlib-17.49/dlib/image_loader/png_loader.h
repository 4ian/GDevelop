// Copyright (C) 2008  Davis E. King (davis@dlib.net), Nils Labugt
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_PNG_IMPORT
#define DLIB_PNG_IMPORT

#include "png_loader_abstract.h"
#include "../smart_pointers.h"
#include "image_loader.h"
#include "../pixel.h"
#include "../dir_nav.h"

namespace dlib
{

    struct LibpngData;
    class png_loader : noncopyable
    {
    public:

        png_loader( const char* filename );
        png_loader( const std::string& filename );
        png_loader( const dlib::file& f );
        ~png_loader();

        bool is_gray() const;
        bool is_rgb() const;
        bool is_rgba() const;

        unsigned int bit_depth () const { return bit_depth_; }

        template<typename T>
        void get_image( T& t) const
        {
#ifndef DLIB_PNG_SUPPORT
            /* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                You are getting this error because you are trying to use the png_loader
                object but you haven't defined DLIB_PNG_SUPPORT.  You must do so to use
                this object.   You must also make sure you set your build environment
                to link against the libpng library.
            !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!*/
            COMPILE_TIME_ASSERT(sizeof(T) == 0);
#endif

            t.set_size( height_, width_ );


            if (is_gray() && bit_depth_ == 8)
            {
                for ( unsigned n = 0; n < height_;n++ )
                {
                    const unsigned char* v = get_row( n );
                    for ( unsigned m = 0; m < width_;m++ )
                    {
                        unsigned char p = v[m];
                        assign_pixel( t[n][m], p );
                    }
                }
            }
            else if (is_gray() && bit_depth_ == 16)
            {
                for ( unsigned n = 0; n < height_;n++ )
                {
                    const uint16* v = (uint16*)get_row( n );
                    for ( unsigned m = 0; m < width_;m++ )
                    {
                        dlib::uint16 p = v[m];
                        assign_pixel( t[n][m], p );
                    }
                }
            }
            else if (is_rgb() && bit_depth_ == 8)
            {
                for ( unsigned n = 0; n < height_;n++ )
                {
                    const unsigned char* v = get_row( n );
                    for ( unsigned m = 0; m < width_;m++ )
                    {
                        rgb_pixel p;
                        p.red = v[m*3];
                        p.green = v[m*3+1];
                        p.blue = v[m*3+2];
                        assign_pixel( t[n][m], p );
                    }
                }
            }
            else if (is_rgb() && bit_depth_ == 16)
            {
                for ( unsigned n = 0; n < height_;n++ )
                {
                    const uint16* v = (uint16*)get_row( n );
                    for ( unsigned m = 0; m < width_;m++ )
                    {
                        rgb_pixel p;
                        p.red   = static_cast<uint8>(v[m*3]);
                        p.green = static_cast<uint8>(v[m*3+1]);
                        p.blue  = static_cast<uint8>(v[m*3+2]);
                        assign_pixel( t[n][m], p );
                    }
                }
            }
            else if (is_rgba() && bit_depth_ == 8)
            {
                if (!pixel_traits<typename T::type>::has_alpha)
                    assign_all_pixels(t,0);

                for ( unsigned n = 0; n < height_;n++ )
                {
                    const unsigned char* v = get_row( n );
                    for ( unsigned m = 0; m < width_;m++ )
                    {
                        rgb_alpha_pixel p;
                        p.red = v[m*4];
                        p.green = v[m*4+1];
                        p.blue = v[m*4+2];
                        p.alpha = v[m*4+3];
                        assign_pixel( t[n][m], p );
                    }
                }
            }
            else if (is_rgba() && bit_depth_ == 16)
            {
                if (!pixel_traits<typename T::type>::has_alpha)
                    assign_all_pixels(t,0);

                for ( unsigned n = 0; n < height_;n++ )
                {
                    const uint16* v = (uint16*)get_row( n );
                    for ( unsigned m = 0; m < width_;m++ )
                    {
                        rgb_alpha_pixel p;
                        p.red   = static_cast<uint8>(v[m*4]);
                        p.green = static_cast<uint8>(v[m*4+1]);
                        p.blue  = static_cast<uint8>(v[m*4+2]);
                        p.alpha = static_cast<uint8>(v[m*4+3]);
                        assign_pixel( t[n][m], p );
                    }
                }
            }
        }

    private:
        const unsigned char* get_row( unsigned i ) const;
        void read_image( const char* filename );
        unsigned height_, width_;
        unsigned bit_depth_;
        int color_type_;
        scoped_ptr<LibpngData> ld_;
    };

// ----------------------------------------------------------------------------------------

    template <
        typename image_type
        >
    void load_png (
        image_type& image,
        const std::string& file_name
    )
    {
        png_loader(file_name).get_image(image);
    }

// ----------------------------------------------------------------------------------------

}

#ifdef NO_MAKEFILE
#include "png_loader.cpp"
#endif 

#endif // DLIB_PNG_IMPORT 

