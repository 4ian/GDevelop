// Copyright (C) 2005  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_LZP_BUFFER_KERNEl_ABSTRACT_
#ifdef DLIB_LZP_BUFFER_KERNEl_ABSTRACT_

#include "../algs.h"

namespace dlib
{

    class lzp_buffer 
    {
        /*!
            INITIAL VALUE
                size() == some value defined by the constructor argument
                Initially this object is at some predefined empty or ground state.
                for all i: (*this)[i] == 0

            WHAT THIS OBJECT REPRESENTS
                This object represents some varation on the LZP algorithm
                described by Charles Bloom in his paper "LZP: a new data
                compression algorithm"

                The LZP algorithm is a lot like lz77 except there is no need to pass
                the location of matches in the history buffer to the decoder because
                LZP uses the data it has already seen to predict the location of the
                next match.  

            NOTE
                The add() and predict_match() functions must be called in the same
                order by the coder and decoder.  If they aren't the state of the 
                lzp_buffer objects in the coder and decoder may differ and the decoder 
                won't be able to correctly decode the data stream.
        !*/

    public:

        explicit lzp_buffer (
            unsigned long buffer_size           
        );
        /*!
            requires
                - 10 < buffer_size < 32
            ensures                
                - #*this is properly initialized
                - #size() == 2^buffer_size
            throws
                - std::bad_alloc
        !*/

        virtual ~lzp_buffer (
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

        void add (
            unsigned char symbol
        );
        /*!
            ensures
                - shifts everything in the history buffer left 1.
                  (i.e. #(*this)[i+1] == (*this)[i])
                - #(*this)[0] == symbol
            throws
                - std::bad_alloc
                    if this exception is thrown then #*this is unusable 
                    until clear() is called and succeeds  
        !*/

        unsigned long predict_match (
            unsigned long& index
        );
        /*!
            ensures
                - updates the prediction for the current context.
                  (the current context is the last few symbols seen. i.e. (*this)[0], 
                   (*this)[1], etc.)
                - if (*this can generate a prediction) then
                    - #index == the predicted location of a match in the history buffer.
                      (i.e. (*this)[#index] is the first symbol of the predicted match)
                    - returns the order this prediction came from
                - else
                    - returns 0
            throws
                - std::bad_alloc
                    if this exception is thrown then #*this is unusable 
                    until clear() is called and succeeds            
        !*/

        unsigned long size (
        ) const;
        /*!
            ensures
                - returns the size of the history buffer
        !*/

        unsigned char operator[] (
            unsigned long index
        ) const;
        /*!
            requires
                - index < size()
            ensures
                - returns the symbol at the given index in the history buffer
        !*/

    private:

        // restricted functions
        lzp_buffer(const lzp_buffer&);        // copy constructor
        lzp_buffer& operator=(const lzp_buffer&);    // assignment operator

    };      
}

#endif // DLIB_LZP_BUFFER_KERNEl_ABSTRACT_

