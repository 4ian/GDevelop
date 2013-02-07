// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_BIT_STREAM_KERNEl_1_
#define DLIB_BIT_STREAM_KERNEl_1_

#include "bit_stream_kernel_abstract.h"
#include <iosfwd>

namespace dlib
{

    class bit_stream_kernel_1
    {

        /*!
            INITIAL VALUE
                write_mode          == false
                read_mode           == false    

            CONVENTION
                write_mode          == is_in_write_mode()
                read_mode           == is_in_read_mode()

                if (write_mode)
                {
                    osp             == pointer to an ostream object
                    buffer          == the low order bits of buffer are the bits to be 
                                       written
                    buffer_size     == the number of low order bits in buffer that are 
                                       bits that should be written
                    the lowest order bit is the last bit entered by the user
                }

                if (read_mode)
                {
                    isp             == pointer to an istream object
                    buffer          == the high order bits of buffer are the bits 
                                       waiting to be read by the user
                    buffer_size     == the number of high order bits in buffer that 
                                       are bits that are waiting to be read
                    the highest order bit is the next bit to give to the user
                }
        !*/


    public:

        bit_stream_kernel_1 (
        ) :
            write_mode(false),
            read_mode(false)
        {}

        virtual ~bit_stream_kernel_1 (
        )
        {}

        void clear (
        );

        void set_input_stream (
            std::istream& is
        );

        void set_output_stream (
            std::ostream& os
        );

        void close (
        );

        inline bool is_in_write_mode (
        ) const;

        inline bool is_in_read_mode (
        ) const;

        inline void write (
            int bit
        );

        bool read (
            int& bit
        );

        void swap (
            bit_stream_kernel_1& item
        );

        private:

            // member data
            std::istream* isp;
            std::ostream* osp;
            bool write_mode;
            bool read_mode;
            unsigned char buffer;
            unsigned short buffer_size;
            
            // restricted functions
            bit_stream_kernel_1(bit_stream_kernel_1&);        // copy constructor
            bit_stream_kernel_1& operator=(bit_stream_kernel_1&);  // assignment operator

    };

    inline void swap (
        bit_stream_kernel_1& a, 
        bit_stream_kernel_1& b
    );

// ----------------------------------------------------------------------------------------

}

#ifdef NO_MAKEFILE
#include "bit_stream_kernel_1.cpp"
#endif

#endif // DLIB_BIT_STREAM_KERNEl_1_

