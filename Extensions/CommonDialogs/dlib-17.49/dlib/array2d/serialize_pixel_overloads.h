// Copyright (C) 2006  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_ARRAY2D_SERIALIZE_PIXEL_OvERLOADS_H__
#define DLIB_ARRAY2D_SERIALIZE_PIXEL_OvERLOADS_H__

#include "array2d_kernel.h"
#include "../pixel.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    /*
        This file contains overloads of the serialize functions for array2d object
        for the case where they contain simple 8bit POD pixel types.  In these
        cases we can perform a much faster serialization by writing data in chunks
        instead of one pixel at a time (this avoids a lot of function call overhead
        inside the iostreams).
    */

// ----------------------------------------------------------------------------------------

    template <
        typename mem_manager
        >
    void serialize (
        const array2d<rgb_pixel,mem_manager>& item, 
        std::ostream& out 
    )   
    {
        try
        {
            serialize(item.nc(),out);
            serialize(item.nr(),out);

            COMPILE_TIME_ASSERT(sizeof(rgb_pixel) == 3);

            // write each row 
            for (long r = 0; r < item.nr(); ++r)
                out.write((char*)&item[r][0], sizeof(rgb_pixel)*item.nc());
        }
        catch (serialization_error e)
        { 
            throw serialization_error(e.info + "\n   while serializing object of type array2d"); 
        }
    }

    template <
        typename mem_manager
        >
    void deserialize (
        array2d<rgb_pixel,mem_manager>& item, 
        std::istream& in
    )   
    {
        try
        {
            COMPILE_TIME_ASSERT(sizeof(rgb_pixel) == 3);

            long nc, nr;
            deserialize(nc,in);
            deserialize(nr,in);

            item.set_size(nr,nc);

            // write each row 
            for (long r = 0; r < item.nr(); ++r)
                in.read((char*)&item[r][0], sizeof(rgb_pixel)*item.nc());
        }
        catch (serialization_error e)
        { 
            item.clear();
            throw serialization_error(e.info + "\n   while deserializing object of type array2d"); 
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename mem_manager
        >
    void serialize (
        const array2d<bgr_pixel,mem_manager>& item, 
        std::ostream& out 
    )   
    {
        try
        {
            serialize(item.nc(),out);
            serialize(item.nr(),out);

            COMPILE_TIME_ASSERT(sizeof(bgr_pixel) == 3);

            // write each row 
            for (long r = 0; r < item.nr(); ++r)
                out.write((char*)&item[r][0], sizeof(bgr_pixel)*item.nc());
        }
        catch (serialization_error e)
        { 
            throw serialization_error(e.info + "\n   while serializing object of type array2d"); 
        }
    }

    template <
        typename mem_manager
        >
    void deserialize (
        array2d<bgr_pixel,mem_manager>& item, 
        std::istream& in
    )   
    {
        try
        {
            COMPILE_TIME_ASSERT(sizeof(bgr_pixel) == 3);

            long nc, nr;
            deserialize(nc,in);
            deserialize(nr,in);

            item.set_size(nr,nc);

            // write each row 
            for (long r = 0; r < item.nr(); ++r)
                in.read((char*)&item[r][0], sizeof(bgr_pixel)*item.nc());
        }
        catch (serialization_error e)
        { 
            item.clear();
            throw serialization_error(e.info + "\n   while deserializing object of type array2d"); 
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename mem_manager
        >
    void serialize (
        const array2d<hsi_pixel,mem_manager>& item, 
        std::ostream& out 
    )   
    {
        try
        {
            serialize(item.nc(),out);
            serialize(item.nr(),out);

            COMPILE_TIME_ASSERT(sizeof(hsi_pixel) == 3);

            // write each row 
            for (long r = 0; r < item.nr(); ++r)
                out.write((char*)&item[r][0], sizeof(hsi_pixel)*item.nc());
        }
        catch (serialization_error e)
        { 
            throw serialization_error(e.info + "\n   while serializing object of type array2d"); 
        }
    }

    template <
        typename mem_manager
        >
    void deserialize (
        array2d<hsi_pixel,mem_manager>& item, 
        std::istream& in
    )   
    {
        try
        {
            COMPILE_TIME_ASSERT(sizeof(hsi_pixel) == 3);

            long nc, nr;
            deserialize(nc,in);
            deserialize(nr,in);

            item.set_size(nr,nc);

            // write each row 
            for (long r = 0; r < item.nr(); ++r)
                in.read((char*)&item[r][0], sizeof(hsi_pixel)*item.nc());
        }
        catch (serialization_error e)
        { 
            item.clear();
            throw serialization_error(e.info + "\n   while deserializing object of type array2d"); 
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename mem_manager
        >
    void serialize (
        const array2d<rgb_alpha_pixel,mem_manager>& item, 
        std::ostream& out 
    )   
    {
        try
        {
            serialize(item.nc(),out);
            serialize(item.nr(),out);

            COMPILE_TIME_ASSERT(sizeof(rgb_alpha_pixel) == 4);

            // write each row 
            for (long r = 0; r < item.nr(); ++r)
                out.write((char*)&item[r][0], sizeof(rgb_alpha_pixel)*item.nc());
        }
        catch (serialization_error e)
        { 
            throw serialization_error(e.info + "\n   while serializing object of type array2d"); 
        }
    }

    template <
        typename mem_manager
        >
    void deserialize (
        array2d<rgb_alpha_pixel,mem_manager>& item, 
        std::istream& in
    )   
    {
        try
        {
            COMPILE_TIME_ASSERT(sizeof(rgb_alpha_pixel) == 4);

            long nc, nr;
            deserialize(nc,in);
            deserialize(nr,in);

            item.set_size(nr,nc);

            // write each row 
            for (long r = 0; r < item.nr(); ++r)
                in.read((char*)&item[r][0], sizeof(rgb_alpha_pixel)*item.nc());
        }
        catch (serialization_error e)
        { 
            item.clear();
            throw serialization_error(e.info + "\n   while deserializing object of type array2d"); 
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename mem_manager
        >
    void serialize (
        const array2d<unsigned char,mem_manager>& item, 
        std::ostream& out 
    )   
    {
        try
        {
            serialize(item.nc(),out);
            serialize(item.nr(),out);

            // write each row 
            for (long r = 0; r < item.nr(); ++r)
                out.write((char*)&item[r][0], sizeof(unsigned char)*item.nc());
        }
        catch (serialization_error e)
        { 
            throw serialization_error(e.info + "\n   while serializing object of type array2d"); 
        }
    }

    template <
        typename mem_manager
        >
    void deserialize (
        array2d<unsigned char,mem_manager>& item, 
        std::istream& in
    )   
    {
        try
        {
            long nc, nr;
            deserialize(nc,in);
            deserialize(nr,in);

            item.set_size(nr,nc);

            // write each row 
            for (long r = 0; r < item.nr(); ++r)
                in.read((char*)&item[r][0], sizeof(unsigned char)*item.nc());
        }
        catch (serialization_error e)
        { 
            item.clear();
            throw serialization_error(e.info + "\n   while deserializing object of type array2d"); 
        }
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_ARRAY2D_SERIALIZE_PIXEL_OvERLOADS_H__

