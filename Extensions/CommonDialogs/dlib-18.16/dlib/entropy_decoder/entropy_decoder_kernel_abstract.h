// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_ENTROPY_DECODER_KERNEl_ABSTRACT_
#ifdef DLIB_ENTROPY_DECODER_KERNEl_ABSTRACT_

#include "../algs.h"
#include <iosfwd>
#include "../uintn.h"

namespace dlib
{

    class entropy_decoder 
    {
        /*!
            INITIAL VALUE
                stream_is_set() == false
                get_target_called() == false


            WHAT THIS OBJECT REPRESENTS
                This object represents an entropy decoder (could be implemented as an 
                arithmetic decoder for example).    
                
                Note that all implementations of entropy_encoder and entropy_decoder 
                are paired. This means that if you use entropy_encoder_kernel_n to 
                encode something then you must use the corresponding 
                entropy_decoder_kernel_n to decode it.


                WHERE IS EOF?
                It is important to note that this object will not give any indication
                that is has hit the end of the input stream when it occurs.  It is
                up to you to use some kind of coding scheme to detect this in the
                compressed data stream.

                Another important thing to know is that decode() must be called
                exactly the same number of times as encode() and with the same values
                supplied for TOTAL, high_count, and low_count.  Doing this ensures
                that the decoder consumes exactly all the bytes from the input 
                stream that were written by the entropy_encoder.

            NOTATION:              
                At any moment each symbol has a certain probability of appearing in 
                the input stream.  These probabilities may change as each symbol is 
                decoded and the probability model is updated accordingly.


                - Before considering current symbol:

                let P(i) be a function which gives the probability of seeing the ith  
                symbol of an N symbol alphabet. Note that P(i) refers to the probability 
                of seeing the ith symbol WITHOUT considering the symbol currently given 
                by get_target(TOTAL).  ( The domain of P(i) is from 0 to N-1. )
                
                for each i: P(i) == COUNT/TOTAL where COUNT and TOTAL are integers
                and TOTAL is the same number for all P(i) but COUNT may vary.
                   
                let LOW_COUNT(i)  be the sum of all P(x)*TOTAL from x == 0 to x == i-1
                  (note that LOW_COUNT(0) == 0)
                let HIGH_COUNT(i) be the sum of all P(x)*TOTAL from x == 0 to x == i


                - After considering current symbol:

                let #P(i) be a function which gives the probability of seeing the ith
                symbol after we have updated our probability model to take the symbol
                given by get_target(TOTAL) into account.

                for each i: #P(i) == #COUNT/#TOTAL where #COUNT and #TOTAL are integers 
                and #TOTAL is the same number for all #P(i) but #COUNT may vary.
        !*/

    public:

        entropy_decoder (
        );
        /*!
            ensures
                - #*this is properly initialized
            throws
                - std::bad_alloc
        !*/

        virtual ~entropy_decoder (
        );
        /*!
            ensures
                - all memory associated with *this has been released
        !*/

        void clear(
        );
        /*!
            ensures
                - #*this has its initial value
                - if (stream_is_set())
                    - clears any state accumulated in *this from decoding data from 
                      the stream get_stream()
            throws
                - any exception
                    if this exception is thrown then #*this is unusable 
                    until clear() is called and succeeds
        !*/

        void set_stream (
            std::istream& in
        );
        /*!
            ensures
                - #*this will read data from in and decode it
                - #stream_is_set() == true
                - #get_target() == a number representing the first symbol from in
                - #get_target_called() == false
                - if (stream_is_set())
                    - clears any state accumulated in *this from decoding data from 
                      the stream get_stream()
            throws
                - any exception
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

        std::istream& get_stream (
        ) const;
        /*!
            requires
                - stream_is_set() == true
            ensures
                - returns a reference to the istream object that *this is reading 
                  encoded data from
        !*/


        void decode (
            uint32 low_count,
            uint32 high_count
        );
        /*!
            requires
                - get_target_called() == true
                - stream_is_set()     == true
                - low_count  == LOW_COUNT(S) where S is the symbol represented 
                  by get_target(TOTAL)
                - high_count == HIGH_COUNT(S) where S is the symbol represented 
                  by get_target(TOTAL)
                - low_count  <= get_target(TOTAL) < high_count <= TOTAL                      
            ensures
                - #get_target(#TOTAL) == a number which represents the next symbol
                - #get_target_called() == false
            throws
                - any exception
                    if this exception is thrown then #*this is unusable 
                    until clear() is called and succeeds
        !*/

        bool get_target_called (
        ) const;
        /*!
            ensures
                - returns true if get_target() has been called and since then decode()
                  and set_stream() have not been called
                - returns false otherwise
        !*/

        uint32 get_target (
            uint32 total
        );
        /*!
            requires 
                - 0 < total < 65536 (2^16)     
                - total == TOTAL
                - stream_is_set() == true
            ensures
                - in the next call to decode() the value of TOTAL will be
                  considered to be total
                - #get_target_called() == true
                - returns a number N such that:
                    - N is in the range 0 to total - 1
                    - N represents a symbol S where
                      LOW_COUNT(S) <= N < HIGH_COUNT(S)
            throws
                - any exception
                    if this exception is thrown then #*this is unusable 
                    until clear() is called and succeeds
        !*/

    private:

        // restricted functions
        entropy_decoder(entropy_decoder&);        // copy constructor
        entropy_decoder& operator=(entropy_decoder&);    // assignment operator

    };   
   
}

#endif // DLIB_ENTROPY_DECODER_KERNEl_ABSTRACT_

