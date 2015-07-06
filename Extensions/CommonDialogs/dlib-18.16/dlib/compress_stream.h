// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_COMPRESS_STREAm_
#define DLIB_COMPRESS_STREAm_

#include "compress_stream/compress_stream_kernel_1.h"
#include "compress_stream/compress_stream_kernel_2.h"
#include "compress_stream/compress_stream_kernel_3.h"

#include "conditioning_class.h"
#include "entropy_encoder.h"
#include "entropy_decoder.h"

#include "entropy_encoder_model.h"
#include "entropy_decoder_model.h"
#include "lz77_buffer.h"
#include "sliding_buffer.h"
#include "lzp_buffer.h"
#include "crc32.h"


namespace dlib
{

    class compress_stream
    {
        compress_stream() {}

        typedef entropy_encoder_model<257,entropy_encoder::kernel_2a>::kernel_1b fce1;
        typedef entropy_decoder_model<257,entropy_decoder::kernel_2a>::kernel_1b fcd1;

        typedef entropy_encoder_model<257,entropy_encoder::kernel_2a>::kernel_2b fce2;
        typedef entropy_decoder_model<257,entropy_decoder::kernel_2a>::kernel_2b fcd2;

        typedef entropy_encoder_model<257,entropy_encoder::kernel_2a>::kernel_3b fce3;
        typedef entropy_decoder_model<257,entropy_decoder::kernel_2a>::kernel_3b fcd3;

        typedef entropy_encoder_model<257,entropy_encoder::kernel_2a>::kernel_4a fce4a;
        typedef entropy_decoder_model<257,entropy_decoder::kernel_2a>::kernel_4a fcd4a;
        typedef entropy_encoder_model<257,entropy_encoder::kernel_2a>::kernel_4b fce4b;
        typedef entropy_decoder_model<257,entropy_decoder::kernel_2a>::kernel_4b fcd4b;

        typedef entropy_encoder_model<257,entropy_encoder::kernel_2a>::kernel_5a fce5a;
        typedef entropy_decoder_model<257,entropy_decoder::kernel_2a>::kernel_5a fcd5a;
        typedef entropy_encoder_model<257,entropy_encoder::kernel_2a>::kernel_5b fce5b;
        typedef entropy_decoder_model<257,entropy_decoder::kernel_2a>::kernel_5b fcd5b;
        typedef entropy_encoder_model<257,entropy_encoder::kernel_2a>::kernel_5c fce5c;
        typedef entropy_decoder_model<257,entropy_decoder::kernel_2a>::kernel_5c fcd5c;

        typedef entropy_encoder_model<257,entropy_encoder::kernel_2a>::kernel_6a fce6;
        typedef entropy_decoder_model<257,entropy_decoder::kernel_2a>::kernel_6a fcd6;


        typedef entropy_encoder_model<257,entropy_encoder::kernel_2a>::kernel_2d fce2d;
        typedef entropy_decoder_model<257,entropy_decoder::kernel_2a>::kernel_2d fcd2d;

        typedef sliding_buffer<unsigned char>::kernel_1a sliding_buffer1;
        typedef lz77_buffer::kernel_2a lz77_buffer2a;


        typedef lzp_buffer::kernel_1a lzp_buf_1;
        typedef lzp_buffer::kernel_2a lzp_buf_2;


        typedef entropy_encoder_model<513,entropy_encoder::kernel_2a>::kernel_1b fce_length;
        typedef entropy_decoder_model<513,entropy_decoder::kernel_2a>::kernel_1b fcd_length;

        typedef entropy_encoder_model<65534,entropy_encoder::kernel_2a>::kernel_1b fce_length_2;
        typedef entropy_decoder_model<65534,entropy_decoder::kernel_2a>::kernel_1b fcd_length_2;


        typedef entropy_encoder_model<32257,entropy_encoder::kernel_2a>::kernel_1b fce_index;
        typedef entropy_decoder_model<32257,entropy_decoder::kernel_2a>::kernel_1b fcd_index;

    public:
        
        //----------- kernels ---------------

        // kernel_1a        
        typedef      compress_stream_kernel_1 <fce1,fcd1,crc32::kernel_1a>
                     kernel_1a;
   
        // kernel_1b        
        typedef      compress_stream_kernel_1 <fce2,fcd2,crc32::kernel_1a>
                     kernel_1b;

        // kernel_1c        
        typedef      compress_stream_kernel_1 <fce3,fcd3,crc32::kernel_1a>
                     kernel_1c;

        // kernel_1da        
        typedef      compress_stream_kernel_1 <fce4a,fcd4a,crc32::kernel_1a>
                     kernel_1da;

        // kernel_1ea        
        typedef      compress_stream_kernel_1 <fce5a,fcd5a,crc32::kernel_1a>
                     kernel_1ea;

        // kernel_1db        
        typedef      compress_stream_kernel_1 <fce4b,fcd4b,crc32::kernel_1a>
                     kernel_1db;

        // kernel_1eb        
        typedef      compress_stream_kernel_1 <fce5b,fcd5b,crc32::kernel_1a>
                     kernel_1eb;

        // kernel_1ec        
        typedef      compress_stream_kernel_1 <fce5c,fcd5c,crc32::kernel_1a>
                     kernel_1ec;




        // kernel_2a        
        typedef      compress_stream_kernel_2 <fce2,fcd2,lz77_buffer2a,sliding_buffer1,fce_length,fcd_length,fce_index,fcd_index,crc32::kernel_1a>
                     kernel_2a;




        // kernel_3a        
        typedef      compress_stream_kernel_3 <lzp_buf_1,crc32::kernel_1a,16>
                     kernel_3a;
        // kernel_3b        
        typedef      compress_stream_kernel_3 <lzp_buf_2,crc32::kernel_1a,16>
                     kernel_3b;
   

    };
}

#endif // DLIB_COMPRESS_STREAm_

