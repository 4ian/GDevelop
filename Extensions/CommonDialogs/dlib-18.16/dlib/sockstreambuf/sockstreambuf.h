// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_SOCKStREAMBUF_Hh_
#define DLIB_SOCKStREAMBUF_Hh_

#include <iosfwd>
#include <streambuf>
#include "../sockets.h"
#include "sockstreambuf_abstract.h"
#include "sockstreambuf_unbuffered.h"

namespace dlib
{

// ---------------------------------------------------------------------------------------- 

    class sockstreambuf : public std::streambuf
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

        // These typedefs are here for backwards compatibility with previous versions of
        // dlib.
        typedef sockstreambuf_unbuffered kernel_1a;
        typedef sockstreambuf kernel_2a;

        sockstreambuf (
            connection* con_
        ) :
            con(*con_),
            out_buffer(0),
            in_buffer(0),
            autoflush(false)
        {
            init();
        }

        sockstreambuf (
            const scoped_ptr<connection>& con_
        ) :
            con(*con_),
            out_buffer(0),
            in_buffer(0),
            autoflush(false)
        {
            init();
        }

        virtual ~sockstreambuf (
        )
        {
            sync();
            delete [] out_buffer;
            delete [] in_buffer;
        }

        connection* get_connection (
        ) { return &con; }

        void flush_output_on_read()
        {
            autoflush = true;
        }

        bool flushes_output_on_read() const
        {
            return autoflush;
        }

        void do_not_flush_output_on_read()
        {
            autoflush = false;
        }

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
        bool autoflush;
    
    };

// ---------------------------------------------------------------------------------------- 

}

#ifdef NO_MAKEFILE
#include "sockstreambuf.cpp"
#endif

#endif // DLIB_SOCKStREAMBUF_Hh_

