// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_ENTROPY_ENCODER_KERNEl_ABSTRACT_
#ifdef DLIB_ENTROPY_ENCODER_KERNEl_ABSTRACT_

#include "../algs.h"
#include <iosfwd>
#include "../uintn.h"

namespace dlib
{

    class entropy_encoder 
    {
        /*!
            INITIAL VALUE
                stream_is_set() == false


            WHAT THIS OBJECT REPRESENTS
                This object represents an entropy encoder (could be implemented as an 
                arithmetic encoder for example).      
                
                Note that all implementations of entropy_encoder and entropy_decoder 
                are paired. This means that if you use entropy_encoder_kernel_n to 
                encode something then you must use the corresponding 
                entropy_decoder_kernel_n to decode it.

            NOTATION:              
                At any moment each symbol has a certain probability of appearing in 
                the input stream.  These probabilities may change as each symbol is 
                encountered and the probability model is updated accordingly.


                let P(i) be a function which gives the probability of seeing the ith 
                symbol of an N symbol alphabet BEFORE the probability model is updated
                to account for the current symbol.  ( The domain of P(i) is from 0 to N-1. )

                for each i: P(i) == COUNT/TOTAL where COUNT and TOTAL are integers.
                and TOTAL is the same number for all P(i) but COUNT may vary.
                   
                let LOW_COUNT(i)  be the sum of all P(x)*TOTAL from x == 0 to x == i-1
                  (note that LOW_COUNT(0) == 0)
                let HIGH_COUNT(i) be the sum of all P(x)*TOTAL from x == 0 to x == i
        !*/

    public:

        entropy_encoder (
        );
        /*!
            ensures
                - #*this is properly initialized
            throws
                - std::bad_alloc
        !*/

        virtual ~entropy_encoder (
        );
        /*!
            ensures
                - all memory associated with *this has been released
                - if (stream_is_set()) then
                    - any buffered data in *this will be written to get_stream() 
        !*/

        void clear(
        );
        /*!
            ensures
                - #*this has its initial value
                - if (stream_is_set()) then
                    - any buffered data in *this will be written to get_stream() 
                    - clears any memory of all previous calls to encode() from #*this
            throws
                - std::ios_base::failure
                    if (stream_is_set() && there was a problem writing to get_stream())
                    then this exception will be thrown.  #*this will be unusable until
                    clear() is called and succeeds
                - any other exception
                    if this exception is thrown then #*this is unusable 
                    until clear() is called and succeeds
        !*/


        void set_stream (
            std::ostream& out
        );
        /*!
            ensures
                - #get_stream()    == out
                - #stream_is_set() == true
                - if (stream_is_set()) then
                    - any buffered data in *this will be written to get_stream() 
                    - clears any memory of all previous calls to encode() from #*this
            throws
                - std::ios_base::failure
                    if (stream_is_set() && there was a problem writing to get_stream())
                    then this exception will be thrown.  #*this will be unusable until
                    clear() is called and succeeds
                - any other exception
                    if this exception is thrown then #*this is unusable 
                    until clear() is called and succeeds
        !*/

        bool stream_is_set (
        ) const;
        /*!
            ensures
                - returns true if a stream has been associated with *this by calling
                  set_stream()
        !*/

        std::ostream& get_stream (
        ) const;
        /*!
            requires
                - stream_is_set() == true
            ensures
                - returns a reference to the ostream object that *this writes its 
                  encoded data to
        !*/

        void encode (
            uint32 low_count,
            uint32 high_count,
            uint32 total
        );
        /*!
            requires
                - 0 < total <  65536 (2^16)
                - total == TOTAL
                - low_count < high_count <= total    
                - stream_is_set() == true
            ensures
                - encodes the symbol S where: 
                    - LOW_COUNT(S)  == low_count
                    - HIGH_COUNT(S) == high_count
            throws
                - std::ios_base::failure
                    if (there was a problem writing to get_stream()) then
                    this exception will be thrown.  #*this will be unusable until
                    clear() is called and succeeds
                - any other exception
                    if this exception is thrown then #*this is unusable 
                    until clear() is called and succeeds
        !*/


    private:

        // restricted functions
        entropy_encoder(entropy_encoder&);        // copy constructor
        entropy_encoder& operator=(entropy_encoder&);    // assignment operator

    };   
   
}

#endif // DLIB_ENTROPY_ENCODER_KERNEl_ABSTRACT_

