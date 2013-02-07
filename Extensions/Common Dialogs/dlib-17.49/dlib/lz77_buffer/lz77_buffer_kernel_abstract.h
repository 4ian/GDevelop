// Copyright (C) 2004  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_LZ77_BUFFER_KERNEl_ABSTRACT_
#ifdef DLIB_LZ77_BUFFER_KERNEl_ABSTRACT_

#include "../algs.h"

namespace dlib
{

    class lz77_buffer 
    {
        /*!
            INITIAL VALUE
                get_history_buffer_limit() == defined by constructor arguments
                get_lookahead_buffer_limit() == defined by constructor arguments
                get_history_buffer_size() == 0
                get_lookahead_buffer_size() == 0


            WHAT THIS OBJECT REPRESENTS
                This object represents a pair of buffers (history and lookahead buffers) 
                used during lz77 style compression.

                It's main function is to search the history buffer for long strings which
                match the contents (or a part of the contents) of the lookahead buffer.
                

            HISTORY AND LOOKAHEAD BUFFERS
                The buffers have the following structure:
                | history buffer | lookahead buffer |  <-- contents of buffers
                |  ...9876543210 | 0123456789...    |  <-- index numbers

                So this means that history_buffer(0) == 'r', history_buffer(1) == 'e'
                and so on.  And lookahead_buffer(0) == 'l', lookahead_buffer(1) == 'o'
                and so on.


                What shift_buffers() does in english:
                    This function just means that the buffers have their contents shifted
                    left by N elements and that elements shifted out of the lookahead buffer 
                    go into the history buffer.   An example will make it clearer.

                    Suppose that we have the following buffers before we apply shift_buffers()
                        history_buffer() == "hey" and
                        lookahead_buffer() == "lookahead buffer"
                    And in the same format as the above diagram it would be
                        | hey | lookahead buffer |  <-- contents of buffers
                        | 210 | 0123456789...    |  <-- index numbers

                    Applying shift_buffers(4) will give
                        lookahead_buffer() == "ahead buffer"
                        history_buffer() == "heylook" or "eylook" or "ylook" or "look"

                    You might be wondering why the history_buffer can resize itself in 
                    such a nondeterministic way.  It is just to allow a lot of freedom in the 
                    implementations of this object.                                  
        !*/

    public:

        lz77_buffer (
            unsigned long total_limit,
            unsigned long lookahead_limit            
        );
        /*!
            requires
                - 6 < total_limit < 32
                - 15 < lookahead_limit <= 2^(total_limit-2)
            ensures                
                - #*this is properly initialized
                - #get_history_buffer_limit() == 2^total_limit  - lookahead_limit
                - #get_lookahead_buffer_limit() == lookahead_limit
            throws
                - std::bad_alloc
        !*/

        virtual ~lz77_buffer (
        );
        /*!
            ensures
                - any resources associated with *this have been released
        !*/

        void clear(
        );
        /*!
            ensures
                - #*this has its initial value
            throws
                - std::bad_alloc
                    if this exception is thrown then #*this is unusable 
                    until clear() is called and succeeds
        !*/

        void shift_buffers (
            unsigned long N
        );
        /*!
            requires
                - N <= get_lookahead_buffer_size()
            ensures
                - #get_lookahead_buffer_size() == get_lookahead_buffer_size() - N
                - #get_history_buffer_size() >= N
                - #get_history_buffer_size() <= get_history_buffer_size()+N
                - #get_history_buffer_size() <= get_history_buffer_limit()
                - for all i where 0 <= i < N:
                    #history_buffer(N-1-i) == lookahead_buffer(i)
                - for all i where 0 <= i < #get_history_buffer_size()-N:
                    #history_buffer(N+i) == history_buffer(i)
                - for all i where 0 <= i < #get_lookahead_buffer_size()
                    #lookahead_buffer(i) == lookahead_buffer(N+i)            
        !*/

        void add (
            unsigned char symbol
        );
        /*!
            ensures
                - if (get_lookahead_buffer_size() == get_lookahead_buffer_limit()) then
                    - performs shift_buffers(1)
                    - #lookahead_buffer(get_lookahead_buffer_limit()-1) == symbol
                    - #get_lookahead_buffer_size() == get_lookahead_buffer_size()
                - else
                    - #lookahead_buffer(get_lookahead_buffer_size()) == symbol
                    - #get_lookahead_buffer_size() == get_lookahead_buffer_size() + 1                                    
            throws
                - std::bad_alloc
                    if this exception is thrown then #*this is unusable 
                    until clear() is called and succeeds
        !*/

        void find_match (
            unsigned long& index,
            unsigned long& length,
            unsigned long min_match_length
        );
        /*!
            ensures
                - if (#length != 0) then
                    - #length >= min_match_length
                    - for all i where 0 <= i < #length:
                      history_buffer(#index-i) == lookahead_buffer(i)
                    - performs shift_buffers(#length)
            throws
                - std::bad_alloc
                    if this exception is thrown then #*this is unusable 
                    until clear() is called and succeeds
        !*/

        unsigned long get_history_buffer_limit (
        ) const;
        /*!
            ensures
                - returns the max number of symbols that can fit in the history buffer
        !*/

        unsigned long get_lookahead_buffer_limit (
        ) const;
        /*!
            ensures
                - returns the max number of symbols that can fit in the lookahead buffer
        !*/

        unsigned long get_history_buffer_size (
        ) const;
        /*!
            ensures
                - returns the number of symbols currently in the history buffer
        !*/

        unsigned long get_lookahead_buffer_size (
        ) const;
        /*!
            ensures
                - returns the number of symbols currently in the lookahead buffer
        !*/

        unsigned char lookahead_buffer (
            unsigned long index
        ) const;
        /*!
            requires
                - index < get_lookahead_buffer_size()
            ensures
                - returns the symbol in the lookahead buffer at location index
        !*/

        unsigned char history_buffer (
            unsigned long index
        ) const;
        /*!
            requires
                - index < get_history_buffer_size()
            ensures
                - returns the symbol in the history buffer at location index
        !*/


    private:

        // restricted functions
        lz77_buffer(lz77_buffer&);        // copy constructor
        lz77_buffer& operator=(lz77_buffer&);    // assignment operator

    };      
}

#endif // DLIB_LZ77_BUFFER_KERNEl_ABSTRACT_

