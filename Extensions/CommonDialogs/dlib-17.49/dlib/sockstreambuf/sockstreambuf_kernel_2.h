// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_SOCKSTREAMBUF_KERNEl_2_
#define DLIB_SOCKSTREAMBUF_KERNEl_2_

#include <iosfwd>
#include <streambuf>
#include "../sockets.h"
#include "sockstreambuf_kernel_abstract.h"

namespace dlib
{

// ---------------------------------------------------------------------------------------- 

    class sockstreambuf_kernel_2 : public std::streambuf
    {
        /*!
            INITIAL VALUE
                - con == a connection
                - in_buffer == an array of in_buffer_size bytes
                - out_buffer == an array of out_buffer_size bytes

            CONVENTION
                - in_buffer == the input buffer used by this streambuf
                - out_buffer == the output buffer used by this streambuf
                - max_putback == the maximum number of chars to have in the put back buffer.
        !*/

    public:
        sockstreambuf_kernel_2 (
            connection* con_
        ) :
            con(*con_),
            out_buffer(0),
            in_buffer(0)
        {
            init();
        }

        sockstreambuf_kernel_2 (
            const scoped_ptr<connection>& con_
        ) :
            con(*con_),
            out_buffer(0),
            in_buffer(0)
        {
            init();
        }

        virtual ~sockstreambuf_kernel_2 (
        )
        {
            sync();
            delete [] out_buffer;
            delete [] in_buffer;
        }

        connection* get_connection (
        ) { return &con; }


    protected:

        void init (
        )
        {
            try
            {
                out_buffer = new char[out_buffer_size];
                in_buffer = new char[in_buffer_size];
            }
            catch (...)
            {
                if (out_buffer) delete [] out_buffer;
                throw;
            }
            setp(out_buffer, out_buffer + (out_buffer_size-1));
            setg(in_buffer+max_putback, 
                 in_buffer+max_putback, 
                 in_buffer+max_putback);
        }

        int flush_out_buffer (
        )
        {
            int num = static_cast<int>(pptr()-pbase());
            if (con.write(out_buffer,num) != num)
            {
                // the write was not successful so return EOF 
                return EOF;
            } 
            pbump(-num);
            return num;
        }

        // output functions
        int_type overflow (
            int_type c
        );

        int sync (
        )
        {
            if (flush_out_buffer() == EOF)
            {
                // an error occurred
                return -1;
            }
            return 0;
        }

        std::streamsize xsputn (
            const char* s,
            std::streamsize num
        );

        // input functions
        int_type underflow( 
        );

        std::streamsize xsgetn (
            char_type* s, 
            std::streamsize n
        );

    private:

        // member data
        connection&  con;
        static const std::streamsize max_putback = 4;
        static const std::streamsize out_buffer_size = 10000;
        static const std::streamsize in_buffer_size = 10000;
        char* out_buffer;
        char* in_buffer;
    
    };

// ---------------------------------------------------------------------------------------- 

}

#ifdef NO_MAKEFILE
#include "sockstreambuf_kernel_2.cpp"
#endif

#endif // DLIB_SOCKSTREAMBUF_KERNEl_2_

