// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_ENTROPY_DECODER_KERNEl_C_
#define DLIB_ENTROPY_DECODER_KERNEl_C_

#include "entropy_decoder_kernel_abstract.h"
#include "../algs.h"
#include "../assert.h"
#include <iostream>

namespace dlib
{

    template <
        typename decoder
        >
    class entropy_decoder_kernel_c : public decoder
    {
        
        public:
            std::istream& get_stream (
            ) const;

            void decode (
                uint32 low_count,
                uint32 high_count
            );

            uint32 get_target (
                uint32 total
            );

    private:
        uint32 _get_target;
        uint32 TOTAL;
    };

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename decoder
        >
    std::istream& entropy_decoder_kernel_c<decoder>::
    get_stream (
    ) const
    {
        // make sure requires clause is not broken
        DLIB_CASSERT( this->stream_is_set() == true,
            "\tstd::istream& entropy_decoder::get_stream()"
            << "\n\tyou must set a stream for this object before you can get it"
            << "\n\tthis: " << this
            );

        // call the real function
        return decoder::get_stream();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename decoder
        >
    void entropy_decoder_kernel_c<decoder>::
    decode (
        uint32 low_count,
        uint32 high_count
    )
    {
        // make sure requires clause is not broken
        DLIB_CASSERT( (low_count <= _get_target) && (_get_target < high_count) && 
                (high_count <= TOTAL) &&
                (this->stream_is_set() == true) && (this->get_target_called() == true),
            "\tvoid entropy_decoder::decode()"
            << "\n\tRefer to the ensures clause for this function for further information."
            << "\n\tNote that _get_target refers to get_target(TOTAL)" 
            << "\n\tthis:                " << this
            << "\n\tlow_count:           " << low_count
            << "\n\thigh_count:          " << high_count
            << "\n\tTOTAL:               " << TOTAL
            << "\n\tget_target(TOTAL):   " << _get_target
            << "\n\tis_stream_set():     " << (this->stream_is_set() ? "true" : "false" )
            << "\n\tget_target_called(): " << (this->get_target_called() ? "true" : "false" )
            );

        // call the real function
        decoder::decode(low_count,high_count);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename decoder
        >
    uint32 entropy_decoder_kernel_c<decoder>::
    get_target (
        uint32 total
    )
    {
        // make sure requires clause is not broken
        DLIB_CASSERT( (total > 0) && (total < 65536) && (this->stream_is_set() == true),
            "\tvoid entropy_decoder::get_target()"
            << "\n\tyou must set a stream for this object before you can get the "
            << "\n\rnext target."
            << "\n\tthis: " << this
            << "\n\ttotal: " << total
            );

        // call the real function
        _get_target = decoder::get_target(total);
        TOTAL = total;
        return _get_target;
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_ENTROPY_ENCODER_KERNEl_C_

