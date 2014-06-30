// Copyright (C) 2006  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_BASE64_KERNEl_ABSTRACT_
#ifdef DLIB_BASE64_KERNEl_ABSTRACT_

#include "../algs.h"
#include <iosfwd>

namespace dlib
{

    class base64 
    {
        /*!
            INITIAL VALUE
                - line_ending() == LF

            WHAT THIS OBJECT REPRESENTS
                This object consists of the two functions encode and decode.
                These functions allow you to encode and decode data to and from
                the Base64 Content-Transfer-Encoding defined in section 6.8 of
                rfc2045.
        !*/

    public:

        class decode_error : public dlib::error {};

        base64 (
        );
        /*!
            ensures
                - #*this is properly initialized
            throws
                - std::bad_alloc
        !*/

        virtual ~base64 (
        );
        /*!
            ensures
                - all memory associated with *this has been released
        !*/

        enum line_ending_type
        {
            CR,  // i.e. "\r"
            LF,  // i.e. "\n"
            CRLF // i.e. "\r\n"
        };

        line_ending_type line_ending (
        ) const;
        /*!
            ensures
                - returns the type of end of line bytes the encoder
                  will use when encoding data to base64 blocks.  Note that
                  the ostream object you use might apply some sort of transform
                  to line endings as well.  For example, C++ ofstream objects
                  usually convert '\n' into whatever a normal newline is for
                  your platform unless you open a file in binary mode.  But
                  aside from file streams the ostream objects usually don't
                  modify the data you pass to them.
        !*/

        void set_line_ending (
            line_ending_type eol_style
        );
        /*!
            ensures
                - #line_ending() == eol_style
        !*/

        void encode (
            std::istream& in,
            std::ostream& out
        ) const;
        /*!
            ensures
                - reads all data from in (until EOF is reached) and encodes it
                  and writes it to out
            throws
                - std::ios_base::failure
                    if there was a problem writing to out then this exception will 
                    be thrown.                      
                - any other exception
                    this exception may be thrown if there is any other problem                    
        !*/

        void decode (
            std::istream& in,
            std::ostream& out
        ) const;
        /*!
            ensures
                - reads data from in (until EOF is reached) and decodees it 
                  and writes it to out. 
            throws
                - std::ios_base::failure
                    if there was a problem writing to out then this exception will 
                    be thrown.           
                - decode_error
                    if an error was detected in the encoded data that prevented
                    it from being correctly decoded then this exception is 
                    thrown.  
                - any other exception
                    this exception may be thrown if there is any other problem                    
        !*/

    private:

        // restricted functions
        base64(base64&);        // copy constructor
        base64& operator=(base64&);    // assignment operator

    };   
   
}

#endif // DLIB_BASE64_KERNEl_ABSTRACT_

