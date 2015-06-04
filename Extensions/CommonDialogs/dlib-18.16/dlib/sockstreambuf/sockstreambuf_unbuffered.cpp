// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_SOCKSTrEAMBUF_UNBUFFERED_CPp_
#define DLIB_SOCKSTrEAMBUF_UNBUFFERED_CPp_

#include "sockstreambuf_unbuffered.h"


namespace dlib
{

// ---------------------------------------------------------------------------------------- 
    // output functions
// ---------------------------------------------------------------------------------------- 

    sockstreambuf_unbuffered::int_type sockstreambuf_unbuffered::
    overflow (
        int_type c
    )
    {
        if (c != EOF)
        {
            char temp = static_cast<char>(c);
            if (con.write(&temp,1) != 1)
            {
                // if the write was not successful
                return EOF;
            }
        }
        return c;
    }

// ---------------------------------------------------------------------------------------- 

    std::streamsize sockstreambuf_unbuffered::
    xsputn (
        const char* s,
        std::streamsize num
    )
    {
        if (con.write(s,static_cast<int>(num)) != num)
        {
            // the write was not successful so return that 0 bytes were written
            return 0;
        } 
        return num;
    }

// ---------------------------------------------------------------------------------------- 
    // input functions
// ---------------------------------------------------------------------------------------- 

    sockstreambuf_unbuffered::int_type sockstreambuf_unbuffered::
    underflow( 
    )
    {
        if (lastread_next)
        {
            return lastread;
        }
        else if (peek != EOF)
        {
            return peek;
        }
        else
        {
            char temp;
            if (con.read(&temp,1) != 1)
            {
                // some error occurred
                return EOF;
            }
            peek = static_cast<unsigned char>(temp);
            return peek;
        }
    }

// ---------------------------------------------------------------------------------------- 

    sockstreambuf_unbuffered::int_type sockstreambuf_unbuffered::
    uflow( 
    )
    {   
        if (lastread_next)
        {
            lastread_next = false;
            return lastread;
        }
        else if (peek != EOF)
        {
            lastread = peek;
            peek = EOF;
            return lastread;
        }
        else
        {
            char temp;
            if (con.read(&temp,1) != 1)
            {
                // some error occurred
                return EOF;
            }      
            lastread = static_cast<unsigned char>(temp);
            return lastread;
        }
    }

// ---------------------------------------------------------------------------------------- 

    sockstreambuf_unbuffered::int_type sockstreambuf_unbuffered::
    pbackfail(
        int_type c
    )
    {  
        // if they are trying to push back a character that they didn't read last
        // that is an error
        if (c != EOF && c != lastread)
            return EOF;

        // if they are trying to push back a second character then thats an error
        if (lastread_next)
            return EOF;

        lastread_next = true;
        return 1;
    }

// ---------------------------------------------------------------------------------------- 

    std::streamsize sockstreambuf_unbuffered::
    xsgetn (
        char_type* s, 
        std::streamsize n
    )
    { 
        std::streamsize temp = n;
        if (lastread_next && n > 0)
        {
            *s = lastread;
            lastread_next = false;
            ++s;
            --n;
        }
        if (peek != EOF && n > 0)
        {
            *s = peek;
            peek = EOF;
            ++s;
            --n;
        }

        while (n>0)
        {
            int status = con.read(s,static_cast<int>(n));
            if (status < 1)
                break;
            n -= status;
            s += status;
        }

        return temp-n;       
    }

// ---------------------------------------------------------------------------------------- 

}
#endif // DLIB_SOCKSTrEAMBUF_UNBUFFERED_CPp_

