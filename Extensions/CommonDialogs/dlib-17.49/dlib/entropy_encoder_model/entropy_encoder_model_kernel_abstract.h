// Copyright (C) 2004  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_ENTROPY_ENCODER_MODEL_KERNEl_ABSTRACT_
#ifdef DLIB_ENTROPY_ENCODER_MODEL_KERNEl_ABSTRACT_

#include "../algs.h"

namespace dlib
{

    template <
        unsigned long alphabet_size,
        typename entropy_encoder
        >
    class entropy_encoder_model 
    {
        /*!
            REQUIREMENTS ON alphabet_size
                1 < alphabet_size < 65535

            REQUIREMENTS ON entropy_encoder
                is an implementation of entropy_encoder/entropy_encoder_kernel_abstract.h

            INITIAL VALUE
                Initially this object is at some predefined empty or ground state.

            WHAT THIS OBJECT REPRESENTS
                This object represents some kind of statistical model.  You
                can use it to write symbols to an entropy_encoder and it will calculate
                the cumulative counts/probabilities and manage contexts for you.

                Note that all implementations of entropy_encoder_model and 
                entropy_decoder_model are paired. This means that if you use 
                entropy_encoder_model_kernel_n to encode something then you must 
                use the corresponding entropy_decoder_model_kernel_n to decode it.

                Also note that this object does not perform any buffering of symbols.  It
                writes them to its associated entropy_encoder immediately.
                This makes it safe to use multiple entropy_encoder_model objects with
                a single entropy_encoder without them trampling each other.
        !*/

    public:

        typedef entropy_encoder entropy_encoder_type;
    
        entropy_encoder_model (
            entropy_encoder& coder
        );
        /*!
            ensures
                - #*this is properly initialized
                - &#get_entropy_encoder() == &coder
            throws
                - any exception
        !*/

        virtual ~entropy_encoder_model (
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
                - does not modify get_entropy_encoder()
            throws
                - any exception
                    if this exception is thrown then *this is unusable 
                    until clear() is called and succeeds
        !*/

        void encode (
            unsigned long symbol
        );
        /*!
            requires
                - symbol < alphabet_size
            ensures
                - encodes and writes the symbol to get_entropy_encoder().
                  This also means that there is no internal buffering.  symbol is
                  written immediately to the entropy_encoder.
            throws
                - any exception
                    If this exception is thrown then #*this is unusable until 
                    clear() is called and succeeds.
        !*/

        entropy_encoder& get_entropy_encoder (
        );
        /*!
            ensures
                - returns a reference to the entropy_encoder used by *this
        !*/

        static unsigned long get_alphabet_size (
        );
        /*!
            ensures
                - returns alphabet_size
        !*/

    private:

        // restricted functions
        entropy_encoder_model(entropy_encoder_model<alphabet_size,entropy_encoder>&);        // copy constructor
        entropy_encoder_model<alphabet_size,entropy_encoder>& operator=(entropy_encoder_model<alphabet_size,entropy_encoder>&);    // assignment operator

    };   

}

#endif // DLIB_ENTROPY_ENCODER_MODEL_KERNEl_ABSTRACT_

