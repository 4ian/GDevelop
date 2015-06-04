// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_COMPRESS_STREAM_KERNEl_ABSTRACT_
#ifdef DLIB_COMPRESS_STREAM_KERNEl_ABSTRACT_

#include "../algs.h"
#include <iosfwd>

namespace dlib
{

    class compress_stream 
    {
        /*!
            INITIAL VALUE
                This object does not have any state associated with it.

            WHAT THIS OBJECT REPRESENTS
                This object consists of the two functions compress and decompress.
                These functions allow you to compress and decompress data.
        !*/

    public:

        class decompression_error : public dlib::error {};

        compress_stream (
        );
        /*!
            ensures
                - #*this is properly initialized
            throws
                - std::bad_alloc
        !*/

        virtual ~compress_stream (
        );
        /*!
            ensures
                - all memory associated with *this has been released
        !*/


        void compress (
            std::istream& in,
            std::ostream& out
        ) const;
        /*!
            ensures
                - reads all data from in (until EOF is reached) and compresses it
                  and writes it to out
            throws
                - std::ios_base::failure
                    if there was a problem writing to out then this exception will 
                    be thrown.                      
                - any other exception
                    this exception may be thrown if there is any other problem                    
        !*/


        void decompress (
            std::istream& in,
            std::ostream& out
        ) const;
        /*!
            ensures
                - reads data from in, decompresses it and writes it to out.  note that
                  it stops reading data from in when it encounters the end of the 
                  compressed data, not when it encounters EOF. 
            throws
                - std::ios_base::failure
                    if there was a problem writing to out then this exception will 
                    be thrown.           
                - decompression_error
                    if an error was detected in the compressed data that prevented
                    it from being correctly decompressed then this exception is 
                    thrown.  
                - any other exception
                    this exception may be thrown if there is any other problem                    
        !*/


    private:

        // restricted functions
        compress_stream(compress_stream&);        // copy constructor
        compress_stream& operator=(compress_stream&);    // assignment operator

    };   
   
}

#endif // DLIB_COMPRESS_STREAM_KERNEl_ABSTRACT_

