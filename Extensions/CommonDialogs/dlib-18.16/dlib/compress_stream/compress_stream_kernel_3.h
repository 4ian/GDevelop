// Copyright (C) 2005  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_COMPRESS_STREAM_KERNEl_3_
#define DLIB_COMPRESS_STREAM_KERNEl_3_

#include "../algs.h"
#include "compress_stream_kernel_abstract.h"
#include "../assert.h"

namespace dlib
{

    template <
        typename lzp_buf,
        typename crc32,
        unsigned long buffer_size
        >
    class compress_stream_kernel_3
    {
        /*!
            REQUIREMENTS ON lzp_buf
                is an implementation of lzp_buffer/lzp_buffer_kernel_abstract.h

            REQUIREMENTS ON buffer_size
                10 < buffer_size < 32

            REQUIREMENTS ON crc32
                is an implementation of crc32/crc32_kernel_abstract.h


            INITIAL VALUE
                this object has no state

            CONVENTION
                this object has no state


                This implementation uses the lzp_buffer and writes out matches
                in a byte aligned format.

        !*/


    public:

        class decompression_error : public dlib::error 
        { 
            public: 
                decompression_error(
                    const char* i
                ) :
                    dlib::error(std::string(i))
                {}

                decompression_error(
                    const std::string& i
                ) :
                    dlib::error(i)
                {}
        };


        compress_stream_kernel_3 (
        )
        {
            COMPILE_TIME_ASSERT(10 < buffer_size && buffer_size < 32);
        }

        ~compress_stream_kernel_3 (
        )
        {}

        void compress (
            std::istream& in,
            std::ostream& out
        ) const;

        void decompress (
            std::istream& in,
            std::ostream& out
        ) const;



    private:

        inline void write (
            unsigned char symbol
        ) const
        { 
            if (out->sputn(reinterpret_cast<char*>(&symbol),1)==0)
                throw std::ios_base::failure("error writing to output stream in compress_stream_kernel_3");        
        }

        inline void decode (
            unsigned char& symbol,
            unsigned char& flag
        ) const
        { 
            if (count == 0)
            {
                if (((size_t)in->sgetn(reinterpret_cast<char*>(buffer),sizeof(buffer)))!=sizeof(buffer))
                    throw decompression_error("Error detected in compressed data stream.");
                count = 8;
            }
            --count;
            symbol = buffer[8-count];
            flag = buffer[0] >> 7; 
            buffer[0] <<= 1;
        }

        inline void encode (
            unsigned char symbol,
            unsigned char flag
        ) const
        /*!
            requires
                - 0 <= flag <= 1
            ensures
                - writes symbol with the given one bit flag
        !*/
        { 
            // add this symbol and flag to the buffer            
            ++count;
            buffer[0] <<= 1;
            buffer[count] = symbol;
            buffer[0] |= flag;

            if (count == 8)
            {
                if (((size_t)out->sputn(reinterpret_cast<char*>(buffer),sizeof(buffer)))!=sizeof(buffer))
                    throw std::ios_base::failure("error writing to output stream in compress_stream_kernel_3");        
                count = 0;
                buffer[0] = 0;
            }
        }

        void clear (
        ) const
        /*!
            ensures
                - resets the buffers
        !*/
        {
            count = 0;
        }

        void flush (
        ) const
        /*!
            ensures
                - flushes any data in the buffers to out
        !*/
        {
            if (count != 0)
            {
                buffer[0] <<= (8-count);
                if (((size_t)out->sputn(reinterpret_cast<char*>(buffer),sizeof(buffer)))!=sizeof(buffer))
                    throw std::ios_base::failure("error writing to output stream in compress_stream_kernel_3");        
            }
        }

        mutable unsigned int count;
        // count tells us how many bytes are buffered in buffer and how many flag
        // bit are currently in buffer[0]
        mutable unsigned char buffer[9];  
        // buffer[0] holds the flag bits to be writen.
        // the rest of the buffer holds the bytes to be writen.

        mutable std::streambuf* in;
        mutable std::streambuf* out;

        // restricted functions
        compress_stream_kernel_3(compress_stream_kernel_3<lzp_buf,crc32,buffer_size>&);        // copy constructor
        compress_stream_kernel_3<lzp_buf,crc32,buffer_size>& operator=(compress_stream_kernel_3<lzp_buf,crc32,buffer_size>&);    // assignment operator

    };

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename lzp_buf,
        typename crc32,
        unsigned long buffer_size
        >
    void compress_stream_kernel_3<lzp_buf,crc32,buffer_size>::
    compress (
        std::istream& in_,
        std::ostream& out_
    ) const
    {
        in = in_.rdbuf();
        out = out_.rdbuf();
        clear();

        crc32 crc;
     
        lzp_buf buffer(buffer_size);

        std::streambuf::int_type temp = in->sbumpc();
        unsigned long index;
        unsigned char symbol;
        unsigned char length;

        while (temp != EOF)
        {
            symbol = static_cast<unsigned char>(temp);
            if (buffer.predict_match(index))
            {
                if (buffer[index] == symbol)
                {
                    // this is a match so we must find out how long it is
                    length = 1;
                                        
                    buffer.add(symbol);
                    crc.add(symbol);

                    temp = in->sbumpc();
                    while (length < 255)
                    {
                        if (temp == EOF)
                        {                          
                            break;
                        }
                        else if (static_cast<unsigned long>(length) >= index)
                        {
                            break;
                        }
                        else if (static_cast<unsigned char>(temp) == buffer[index])
                        {
                            ++length;
                            buffer.add(static_cast<unsigned char>(temp));
                            crc.add(static_cast<unsigned char>(temp));
                            temp = in->sbumpc();
                        }
                        else
                        {
                            break;
                        }
                    }                        

                    encode(length,1);
                }
                else
                {
                    // this is also not a match
                    encode(symbol,0);
                    buffer.add(symbol);
                    crc.add(symbol);

                    // get the next symbol
                    temp = in->sbumpc();
                }
            }
            else
            {
                // there wasn't a match so just write this symbol
                encode(symbol,0);
                buffer.add(symbol);
                crc.add(symbol);

                // get the next symbol
                temp = in->sbumpc();
            }
        }

        // use a match of zero length to indicate EOF
        encode(0,1);

        // now write the checksum
        unsigned long checksum = crc.get_checksum();
        unsigned char byte1 = static_cast<unsigned char>((checksum>>24)&0xFF);
        unsigned char byte2 = static_cast<unsigned char>((checksum>>16)&0xFF);
        unsigned char byte3 = static_cast<unsigned char>((checksum>>8)&0xFF);
        unsigned char byte4 = static_cast<unsigned char>((checksum)&0xFF);

        encode(byte1,0);
        encode(byte2,0);
        encode(byte3,0);
        encode(byte4,0);

        flush();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename lzp_buf,
        typename crc32,
        unsigned long buffer_size
        >
    void compress_stream_kernel_3<lzp_buf,crc32,buffer_size>::
    decompress (
        std::istream& in_,
        std::ostream& out_
    ) const
    { 
        in = in_.rdbuf();
        out = out_.rdbuf();
        clear();
     
        crc32 crc;

        lzp_buf buffer(buffer_size);


        unsigned long index = 0;
        unsigned char symbol;
        unsigned char length;
        unsigned char flag;

        decode(symbol,flag);
        while (flag == 0 || symbol != 0)
        {
            buffer.predict_match(index);

            if (flag == 1)
            {
                length = symbol;
                do 
                {
                    --length;
                    symbol = buffer[index];
                    write(symbol);
                    buffer.add(symbol);   
                    crc.add(symbol);                    
                } while (length != 0);
            }
            else
            {
                // this is just a literal
                write(symbol);
                buffer.add(symbol);
                crc.add(symbol);
            }
            decode(symbol,flag);
        }


        // now get the checksum and make sure it matches
        unsigned char byte1;
        unsigned char byte2;
        unsigned char byte3;
        unsigned char byte4;

        decode(byte1,flag);
        if (flag != 0)
            throw decompression_error("Error detected in compressed data stream.");
        decode(byte2,flag);
        if (flag != 0)
            throw decompression_error("Error detected in compressed data stream.");
        decode(byte3,flag);
        if (flag != 0)
            throw decompression_error("Error detected in compressed data stream.");
        decode(byte4,flag);
        if (flag != 0)
            throw decompression_error("Error detected in compressed data stream.");

        unsigned long checksum = byte1;
        checksum <<= 8;
        checksum |= byte2;
        checksum <<= 8;
        checksum |= byte3;
        checksum <<= 8;
        checksum |= byte4;

        if (checksum != crc.get_checksum())
            throw decompression_error("Error detected in compressed data stream.");
 
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_COMPRESS_STREAM_KERNEl_3_

