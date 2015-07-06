// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_ENTROPY_ENCODER_KERNEl_C_
#define DLIB_ENTROPY_ENCODER_KERNEl_C_

#include "entropy_encoder_kernel_abstract.h"
#include "../algs.h"
#include "../assert.h"
#include <iostream>

namespace dlib
{

    template <
        typename encoder
        >
    class entropy_encoder_kernel_c : public encoder
    {
        
        public:
            std::ostream& get_stream (
            ) const;

            void encode (
                uint32 low_count,
                uint32 high_count,
                uint32 total
            );

            void flush (
            );

    };

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename encoder
        >
    std::ostream& entropy_encoder_kernel_c<encoder>::
    get_stream (
    ) const
    {
        // make sure requires clause is not broken
        DLIB_CASSERT( this->stream_is_set() == true,
            "\tstd::ostream& entropy_encoder::get_stream()"
            << "\n\tyou must set a stream for this object before you can get it"
            << "\n\tthis: " << this
            );

        // call the real function
        return encoder::get_stream();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename encoder
        >
    void entropy_encoder_kernel_c<encoder>::
    encode (
        uint32 low_count,
        uint32 high_count,
        uint32 total
    )
    {
        // make sure requires clause is not broken
        DLIB_CASSERT( (0 < total) && (total < 65536) && (low_count < high_count) && (high_count <= total) &&
                (this->stream_is_set() == true),
            "\tvoid entropy_encoder::encode()"
            << "\n\trefer to the ensures clause for this function for further information"
            << "\n\tthis:            " << this
            << "\n\ttotal:           " << total
            << "\n\tlow_count:       " << low_count
            << "\n\thigh_count:      " << high_count
            << "\n\tis_stream_set(): " << (this->stream_is_set() ? "true" : "false" )
            );

        // call the real function
        encoder::encode(low_count,high_count,total);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename encoder
        >
    void entropy_encoder_kernel_c<encoder>::
    flush (
    )
    {
        // make sure requires clause is not broken
        DLIB_CASSERT( this->stream_is_set() == true,
            "\tvoid entropy_encoder::flush()"
            << "\n\tyou must set a stream for this object before you can flush to it"
            << "\n\tthis: " << this
            );

        // call the real function
        encoder::flush();
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_ENTROPY_ENCODER_KERNEl_C_

