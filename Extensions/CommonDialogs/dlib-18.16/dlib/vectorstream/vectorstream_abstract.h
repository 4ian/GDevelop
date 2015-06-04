// Copyright (C) 2012  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_VECTORStREAM_ABSTRACT_Hh_
#ifdef DLIB_VECTORStREAM_ABSTRACT_Hh_

#include <iostream>
#include <vector>

namespace dlib
{
    class vectorstream : public std::iostream
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This is an iostream object that reads and writes from an in-memory buffer.
                It functions very much the same way as the std::stringstream object.
                However, while the std::stringstream holds its buffer internally and it can
                only be accessed by copying it out, the vectorstream uses an external
                std::vector<char> as its buffer.  That is, it holds a reference to an
                external vector and does not contain any internal buffers of its own.  

                This object is useful as a slightly more efficient alternative to the
                std::stringstream since you can avoid the overhead of copying buffer
                contents to and from the stream.  This is particularly useful when used as
                a source or target for serialization routines.
        !*/

    public:

        vectorstream (
            std::vector<char>& buffer
        );
        /*!
            ensures
                - This object will use the given vector as its read/write buffer.  That is:
                    - Any data written to this stream will be appended to the given buffer
                    - Any data read from this stream is read from the given buffer,
                      starting with buffer[0], then buffer[1], and so on.  Just like
                      std::stringstream, writes to the stream do not move the position of
                      the next byte that will be read from the buffer.
                - This constructor does not copy the buffer.  Only a reference to it will
                  be used.  Therefore, any time data is written to this stream it will
                  immediately show up in the buffer.
        !*/

        std::istream& seekg (
            std::streampos pos
        );
        /*!
            ensures
                - The next read from this object will read from the position buffer[pos],
                  where buffer is the std::vector given to this object's constructor.  Note
                  that if pos >= buffer.size() then the next read will simply return EOF.
                - returns *this
        !*/

    };
}

#endif // DLIB_VECTORStREAM_ABSTRACT_Hh_


