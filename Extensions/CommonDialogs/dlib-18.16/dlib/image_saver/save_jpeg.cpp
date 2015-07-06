// Copyright (C) 2014  Davis E. King (davis@dlib.net), Nils Labugt
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_JPEG_SAVER_CPp_
#define DLIB_JPEG_SAVER_CPp_

// only do anything with this file if DLIB_JPEG_SUPPORT is defined
#ifdef DLIB_JPEG_SUPPORT

#include "../array2d.h"
#include "../pixel.h"
#include "save_jpeg.h"
#include <stdio.h>
#ifdef DLIB_JPEG_STATIC
#   include "../external/libjpeg/jpeglib.h"
#else
#   include <jpeglib.h>
#endif
#include <sstream>
#include <setjmp.h>
#include "image_saver.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    struct jpeg_saver_error_mgr 
    {
        jpeg_error_mgr pub;    /* "public" fields */
        jmp_buf setjmp_buffer;  /* for return to caller */
    };

    void jpeg_saver_error_exit (j_common_ptr cinfo)
    {
        /* cinfo->err really points to a jpeg_saver_error_mgr struct, so coerce pointer */
        jpeg_saver_error_mgr* myerr = (jpeg_saver_error_mgr*) cinfo->err;

        /* Return control to the setjmp point */
        longjmp(myerr->setjmp_buffer, 1);
    }

// ----------------------------------------------------------------------------------------

    void save_jpeg (
        const array2d<rgb_pixel>& img,
        const std::string& filename,
        int quality
    )
    {
        // make sure requires clause is not broken
        DLIB_CASSERT(img.size() != 0,
            "\t save_jpeg()"
            << "\n\t You can't save an empty image as a JPEG."
            );
        DLIB_CASSERT(0 <= quality && quality <= 100,
            "\t save_jpeg()"
            << "\n\t Invalid quality value."
            << "\n\t quality: " << quality
            );

        FILE* outfile = fopen(filename.c_str(), "wb");
        if (!outfile)
            throw image_save_error("Can't open file " + filename + " for writing.");

        jpeg_compress_struct cinfo;

        jpeg_saver_error_mgr jerr;
        cinfo.err = jpeg_std_error(&jerr.pub);
        jerr.pub.error_exit = jpeg_saver_error_exit;
        /* Establish the setjmp return context for my_error_exit to use. */
        if (setjmp(jerr.setjmp_buffer)) 
        {
            /* If we get here, the JPEG code has signaled an error.
             * We need to clean up the JPEG object, close the input file, and return.
             */
            jpeg_destroy_compress(&cinfo);
            fclose(outfile);
            throw image_save_error("save_jpeg: error while writing " + filename);
        }
         
        jpeg_create_compress(&cinfo);
        jpeg_stdio_dest(&cinfo, outfile);
         
        cinfo.image_width      = img.nc();
        cinfo.image_height     = img.nr();
        cinfo.input_components = 3;
        cinfo.in_color_space   = JCS_RGB;
        jpeg_set_defaults(&cinfo);
        jpeg_set_quality (&cinfo, quality, true);
        jpeg_start_compress(&cinfo, true);
         
        // now write out the rows one at a time
        while (cinfo.next_scanline < cinfo.image_height) {
            JSAMPROW row_pointer = (JSAMPROW) &img[cinfo.next_scanline][0];
            jpeg_write_scanlines(&cinfo, &row_pointer, 1);
        }

        jpeg_finish_compress(&cinfo);
        jpeg_destroy_compress(&cinfo);
        fclose( outfile );
    }

// ----------------------------------------------------------------------------------------

    void save_jpeg (
        const array2d<unsigned char>& img,
        const std::string& filename,
        int quality
    )
    {
        // make sure requires clause is not broken
        DLIB_CASSERT(img.size() != 0,
            "\t save_jpeg()"
            << "\n\t You can't save an empty image as a JPEG."
            );
        DLIB_CASSERT(0 <= quality && quality <= 100,
            "\t save_jpeg()"
            << "\n\t Invalid quality value."
            << "\n\t quality: " << quality
            );


        FILE* outfile = fopen(filename.c_str(), "wb");
        if (!outfile)
            throw image_save_error("Can't open file " + filename + " for writing.");

        jpeg_compress_struct cinfo;

        jpeg_saver_error_mgr jerr;
        cinfo.err = jpeg_std_error(&jerr.pub);
        jerr.pub.error_exit = jpeg_saver_error_exit;
        /* Establish the setjmp return context for my_error_exit to use. */
        if (setjmp(jerr.setjmp_buffer)) 
        {
            /* If we get here, the JPEG code has signaled an error.
             * We need to clean up the JPEG object, close the input file, and return.
             */
            jpeg_destroy_compress(&cinfo);
            fclose(outfile);
            throw image_save_error("save_jpeg: error while writing " + filename);
        }
         
        jpeg_create_compress(&cinfo);
        jpeg_stdio_dest(&cinfo, outfile);
         
        cinfo.image_width      = img.nc();
        cinfo.image_height     = img.nr();
        cinfo.input_components = 1;
        cinfo.in_color_space   = JCS_GRAYSCALE;
        jpeg_set_defaults(&cinfo);
        jpeg_set_quality (&cinfo, quality, true);
        jpeg_start_compress(&cinfo, true);
         
        // now write out the rows one at a time
        while (cinfo.next_scanline < cinfo.image_height) {
            JSAMPROW row_pointer = (JSAMPROW) &img[cinfo.next_scanline][0];
            jpeg_write_scanlines(&cinfo, &row_pointer, 1);
        }

        jpeg_finish_compress(&cinfo);
        jpeg_destroy_compress(&cinfo);
        fclose( outfile );
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_JPEG_SUPPORT

#endif // DLIB_JPEG_SAVER_CPp_



