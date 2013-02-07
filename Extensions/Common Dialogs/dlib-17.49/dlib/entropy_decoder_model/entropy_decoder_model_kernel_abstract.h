// Copyright (C) 2004  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_ENTROPY_DECODER_MODEL_KERNEl_ABSTRACT_
#ifdef DLIB_ENTROPY_DECODER_MODEL_KERNEl_ABSTRACT_

#include "../algs.h"

namespace dlib
{

    template <
        unsigned long alphabet_size,
        typename entropy_decoder
        >
    class entropy_decoder_model 
    {
        /*!
            REQUIREMENTS ON alphabet_size
                1 < alphabet_size < 65535

            REQUIREMENTS ON entropy_decoder
                is an implementation of entropy_decoder/entropy_decoder_kernel_abstract.h

            INITIAL VALUE
                Initially this object is at some predefined empty or ground state.

            WHAT THIS OBJECT REPRESENTS
                This object represents some kind of statistical model.  You
                can use it to read symbols from an entropy_decoder and it will calculate
                the cumulative counts/probabilities and manage contexts for you.

                Note that all implementations of entropy_encoder_model and 
                entropy_decoder_model are paired. This means that if you use 
                entropy_encoder_model_kernel_n to encode something then you must 
                use the corresponding entropy_decoder_model_kernel_n to decode it.

                Also note that this object does not perform any buffering of symbols.  It
                reads them from its associated entropy_decoder simply as it needs them.
                This makes it safe to use multiple entropy_decoder_model objects with
                a single entropy_decoder without them trampling each other.
        !*/

    public:

        typedef entropy_decoder entropy_decoder_type;

        entropy_decoder_model (
            entropy_decoder& coder
        );
        /*!
            ensures
                - #*this is properly initialized
                - &#get_entropy_decoder() == &coder
            throws
                - any exception
        !*/

        virtual ~entropy_decoder_model (
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
                - does not modify get_entropy_decoder()
            throws
                - any exception
                    if this exception is thrown then *this is unusable 
                    until clear() is called and succeeds
        !*/

        void decode (
            unsigned long& symbol
        );
        /*!
            ensures
                - decodes the next symbol
                - #symbol == the next symbol
                - #symbol < alphabet_size                
            throws
                - any exception
                    If this exception is thrown then #*this is unusable until 
                    clear() is called and succeeds.
        !*/
        
        entropy_decoder& get_entropy_decoder (
        );
        /*!
            ensures
                - returns a reference to the entropy_decoder used by *this
        !*/

        static unsigned long get_alphabet_size (
        );
        /*!
            ensures
                - returns alphabet_size
        !*/

    private:

        // restricted functions
        entropy_decoder_model(entropy_decoder_model<alphabet_size>&);        // copy constructor
        entropy_decoder_model<alphabet_size>& operator=(entropy_decoder_model<alphabet_size>&);    // assignment operator

    };   

}

#endif // DLIB_ENTROPY_DECODER_MODEL_KERNEl_ABSTRACT_

