// Copyright (C) 2008  Davis E. King (davis@dlib.net), Nils Labugt
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_PNG_LOADER_CPp_
#define DLIB_PNG_LOADER_CPp_

// only do anything with this file if DLIB_PNG_SUPPORT is defined
#ifdef DLIB_PNG_SUPPORT

#include "../array2d.h"
#include "../pixel.h"
#include "../dir_nav.h"
#include "png_loader.h"
#include <png.h>
#include "../string.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    struct LibpngData
    {
        png_bytep* row_pointers_;
        png_structp png_ptr_;
        png_infop info_ptr_;
        png_infop end_info_;
    };

// ----------------------------------------------------------------------------------------

    png_loader::
    png_loader( const char* filename ) : height_( 0 ), width_( 0 )
    {
        read_image( filename );
    }

// ----------------------------------------------------------------------------------------

    png_loader::
    png_loader( const std::string& filename ) : height_( 0 ), width_( 0 )
    {
        read_image( filename.c_str() );
    }

// ----------------------------------------------------------------------------------------

    png_loader::
    png_loader( const dlib::file& f ) : height_( 0 ), width_( 0 )
    {
        read_image( f.full_name().c_str() );
    }

// ----------------------------------------------------------------------------------------

    const unsigned char* png_loader::get_row( unsigned i ) const
    {
        return ld_->row_pointers_[i];
    }

// ----------------------------------------------------------------------------------------

    png_loader::~png_loader()
    {
        if ( ld_ && ld_->row_pointers_ != NULL )
            png_destroy_read_struct( &( ld_->png_ptr_ ), &( ld_->info_ptr_ ), &( ld_->end_info_ ) );
    }

// ----------------------------------------------------------------------------------------

    bool png_loader::is_gray() const
    {
        return ( color_type_ == PNG_COLOR_TYPE_GRAY );
    }

// ----------------------------------------------------------------------------------------

    bool png_loader::is_rgb() const
    {
        return ( color_type_ == PNG_COLOR_TYPE_RGB );
    }

// ----------------------------------------------------------------------------------------

    bool png_loader::is_rgba() const
    {
        return ( color_type_ == PNG_COLOR_TYPE_RGB_ALPHA );
    }

// ----------------------------------------------------------------------------------------

    // Don't do anything when libpng calls us to tell us about an error.  Just return to 
    // our own code and throw an exception (at the long jump target).
    void png_loader_user_error_fn_silent(png_structp  png_struct, png_const_charp ) 
    {
        longjmp(png_jmpbuf(png_struct),1);
    }
    void png_loader_user_warning_fn_silent(png_structp , png_const_charp ) 
    {
    }

    void png_loader::read_image( const char* filename )
    {
        ld_.reset(new LibpngData);
        if ( filename == NULL )
        {
            throw image_load_error("png_loader: invalid filename, it is NULL");
        }
        FILE *fp = fopen( filename, "rb" );
        if ( !fp )
        {
            throw image_load_error(std::string("png_loader: unable to open file ") + filename);
        }
        png_byte sig[8];
        if (fread( sig, 1, 8, fp ) != 8)
        {
            fclose( fp );
            throw image_load_error(std::string("png_loader: error reading file ") + filename);
        }
        if ( png_sig_cmp( sig, 0, 8 ) != 0 )
        {
            fclose( fp );
            throw image_load_error(std::string("png_loader: format error in file ") + filename);
        }
        ld_->png_ptr_ = png_create_read_struct( PNG_LIBPNG_VER_STRING, NULL, &png_loader_user_error_fn_silent, &png_loader_user_warning_fn_silent );
        if ( ld_->png_ptr_ == NULL )
        {
            fclose( fp );
            throw image_load_error(std::string("png_loader: parse error in file ") + filename);
        }
        ld_->info_ptr_ = png_create_info_struct( ld_->png_ptr_ );
        if ( ld_->info_ptr_ == NULL )
        {
            fclose( fp );
            png_destroy_read_struct( &( ld_->png_ptr_ ), ( png_infopp )NULL, ( png_infopp )NULL );
            throw image_load_error(std::string("png_loader: parse error in file ") + filename);
        }
        ld_->end_info_ = png_create_info_struct( ld_->png_ptr_ );
        if ( ld_->end_info_ == NULL )
        {
            fclose( fp );
            png_destroy_read_struct( &( ld_->png_ptr_ ), &( ld_->info_ptr_ ), ( png_infopp )NULL );
            throw image_load_error(std::string("png_loader: parse error in file ") + filename);
        }

        if (setjmp(png_jmpbuf(ld_->png_ptr_)))
        {
            // If we get here, we had a problem writing the file 
            fclose(fp);
            png_destroy_read_struct( &( ld_->png_ptr_ ), &( ld_->info_ptr_ ), &( ld_->end_info_ ) );
            throw image_load_error(std::string("png_loader: parse error in file ") + filename);
        }

        png_set_palette_to_rgb(ld_->png_ptr_);

        png_init_io( ld_->png_ptr_, fp );
        png_set_sig_bytes( ld_->png_ptr_, 8 );
        // flags force one byte per channel output
        png_read_png( ld_->png_ptr_, ld_->info_ptr_, PNG_TRANSFORM_PACKING, NULL );
        height_ = png_get_image_height( ld_->png_ptr_, ld_->info_ptr_ );
        width_ = png_get_image_width( ld_->png_ptr_, ld_->info_ptr_ );
        bit_depth_ = png_get_bit_depth( ld_->png_ptr_, ld_->info_ptr_ );
        color_type_ = png_get_color_type( ld_->png_ptr_, ld_-> info_ptr_ );


        if (color_type_ != PNG_COLOR_TYPE_GRAY && 
            color_type_ != PNG_COLOR_TYPE_RGB && 
            color_type_ != PNG_COLOR_TYPE_RGB_ALPHA )
        {
            fclose( fp );
            png_destroy_read_struct( &( ld_->png_ptr_ ), &( ld_->info_ptr_ ), &( ld_->end_info_ ) );
            throw image_load_error(std::string("png_loader: unsupported color type in file ") + filename);
        }

        if (bit_depth_ != 8 && bit_depth_ != 16)
        {
            fclose( fp );
            png_destroy_read_struct( &( ld_->png_ptr_ ), &( ld_->info_ptr_ ), &( ld_->end_info_ ) );
            throw image_load_error("png_loader: unsupported bit depth of " + cast_to_string(bit_depth_) + " in file " + std::string(filename));
        }

        ld_->row_pointers_ = png_get_rows( ld_->png_ptr_, ld_->info_ptr_ );

        fclose( fp );
        if ( ld_->row_pointers_ == NULL )
        {
            png_destroy_read_struct( &( ld_->png_ptr_ ), &( ld_->info_ptr_ ), &( ld_->end_info_ ) );
            throw image_load_error(std::string("png_loader: parse error in file ") + filename);
        }
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_PNG_SUPPORT

#endif // DLIB_PNG_LOADER_CPp_

