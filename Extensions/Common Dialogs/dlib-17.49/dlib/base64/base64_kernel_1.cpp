// Copyright (C) 2006  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_BASE64_KERNEL_1_CPp_
#define DLIB_BASE64_KERNEL_1_CPp_

#include "base64_kernel_1.h"
#include <iostream>
#include <sstream>
#include <climits>

namespace dlib
{

// ----------------------------------------------------------------------------------------

    base64::line_ending_type base64::
    line_ending (
    ) const
    {
        return eol_style;
    }

// ----------------------------------------------------------------------------------------

    void base64::
    set_line_ending (
        line_ending_type eol_style_
    )
    {
        eol_style = eol_style_;
    }

// ----------------------------------------------------------------------------------------

    base64::
    base64 (
    ) : 
        encode_table(0),
        decode_table(0),
        bad_value(100),
        eol_style(LF)
    {
        try
        {
            encode_table = new char[64];
            decode_table = new unsigned char[UCHAR_MAX];
        }
        catch (...)
        {
            if (encode_table) delete [] encode_table;
            if (decode_table) delete [] decode_table;
            throw;
        }

        // now set up the tables with the right stuff
        encode_table[0] = 'A';
        encode_table[17] = 'R';
        encode_table[34] = 'i';
        encode_table[51] = 'z';

        encode_table[1] = 'B';
        encode_table[18] = 'S';
        encode_table[35] = 'j';
        encode_table[52] = '0';

        encode_table[2] = 'C';
        encode_table[19] = 'T';
        encode_table[36] = 'k';
        encode_table[53] = '1';

        encode_table[3] = 'D';
        encode_table[20] = 'U';
        encode_table[37] = 'l';
        encode_table[54] = '2';

        encode_table[4] = 'E';
        encode_table[21] = 'V';
        encode_table[38] = 'm';
        encode_table[55] = '3';

        encode_table[5] = 'F';
        encode_table[22] = 'W';
        encode_table[39] = 'n';
        encode_table[56] = '4';

        encode_table[6] = 'G';
        encode_table[23] = 'X';
        encode_table[40] = 'o';
        encode_table[57] = '5';

        encode_table[7] = 'H';
        encode_table[24] = 'Y';
        encode_table[41] = 'p';
        encode_table[58] = '6';

        encode_table[8] = 'I';
        encode_table[25] = 'Z';
        encode_table[42] = 'q';
        encode_table[59] = '7';

        encode_table[9] = 'J';
        encode_table[26] = 'a';
        encode_table[43] = 'r';
        encode_table[60] = '8';

        encode_table[10] = 'K';
        encode_table[27] = 'b';
        encode_table[44] = 's';
        encode_table[61] = '9';

        encode_table[11] = 'L';
        encode_table[28] = 'c';
        encode_table[45] = 't';
        encode_table[62] = '+';

        encode_table[12] = 'M';
        encode_table[29] = 'd';
        encode_table[46] = 'u';
        encode_table[63] = '/';

        encode_table[13] = 'N';
        encode_table[30] = 'e';
        encode_table[47] = 'v';

        encode_table[14] = 'O';
        encode_table[31] = 'f';
        encode_table[48] = 'w';

        encode_table[15] = 'P';
        encode_table[32] = 'g';
        encode_table[49] = 'x';

        encode_table[16] = 'Q';
        encode_table[33] = 'h';
        encode_table[50] = 'y';



        // we can now fill out the decode_table by using the encode_table
        for (int i = 0; i < UCHAR_MAX; ++i)
        {
            decode_table[i] = bad_value;
        }
        for (unsigned char i = 0; i < 64; ++i)
        {
            decode_table[(unsigned char)encode_table[i]] = i;
        }
    }

// ----------------------------------------------------------------------------------------

    base64::
    ~base64 (
    )
    {
        delete [] encode_table;
        delete [] decode_table;
    }

// ----------------------------------------------------------------------------------------

    void base64::
    encode (
        std::istream& in_,
        std::ostream& out_
    ) const
    {
        using namespace std;
        streambuf& in = *in_.rdbuf();
        streambuf& out = *out_.rdbuf();

        unsigned char inbuf[3];
        unsigned char outbuf[4];
        streamsize status = in.sgetn(reinterpret_cast<char*>(&inbuf),3);

        unsigned char c1, c2, c3, c4, c5, c6;

        int counter = 19;

        // while we haven't hit the end of the input stream
        while (status != 0)
        {
            if (counter == 0)
            {
                counter = 19;
                // write a newline
                char ch;
                switch (eol_style)
                {
                    case CR:
                        ch = '\r';
                        if (out.sputn(&ch,1)!=1)
                            throw std::ios_base::failure("error occured in the base64 object");
                        break;
                    case LF:
                        ch = '\n';
                        if (out.sputn(&ch,1)!=1)
                            throw std::ios_base::failure("error occured in the base64 object");
                        break;
                    case CRLF:
                        ch = '\r';
                        if (out.sputn(&ch,1)!=1)
                            throw std::ios_base::failure("error occured in the base64 object");
                        ch = '\n';
                        if (out.sputn(&ch,1)!=1)
                            throw std::ios_base::failure("error occured in the base64 object");
                        break;
                    default:
                        DLIB_CASSERT(false,"this should never happen");
                }
            }
            --counter;

            if (status == 3)
            {
                // encode the bytes in inbuf to base64 and write them to the output stream
                c1 = inbuf[0]&0xfc;
                c2 = inbuf[0]&0x03;
                c3 = inbuf[1]&0xf0;
                c4 = inbuf[1]&0x0f;
                c5 = inbuf[2]&0xc0;
                c6 = inbuf[2]&0x3f;

                outbuf[0] = c1>>2;
                outbuf[1] = (c2<<4)|(c3>>4);
                outbuf[2] = (c4<<2)|(c5>>6);
                outbuf[3] = c6;


                outbuf[0] = encode_table[outbuf[0]];
                outbuf[1] = encode_table[outbuf[1]];
                outbuf[2] = encode_table[outbuf[2]];
                outbuf[3] = encode_table[outbuf[3]];

                // write the encoded bytes to the output stream
                if (out.sputn(reinterpret_cast<char*>(&outbuf),4)!=4)
                {
                    throw std::ios_base::failure("error occured in the base64 object");
                }

                // get 3 more input bytes
                status = in.sgetn(reinterpret_cast<char*>(&inbuf),3);
                continue;
            }
            else if (status == 2)
            {
                // we are at the end of the input stream and need to add some padding

                // encode the bytes in inbuf to base64 and write them to the output stream
                c1 = inbuf[0]&0xfc;
                c2 = inbuf[0]&0x03;
                c3 = inbuf[1]&0xf0;
                c4 = inbuf[1]&0x0f;
                c5 = 0;

                outbuf[0] = c1>>2;
                outbuf[1] = (c2<<4)|(c3>>4);
                outbuf[2] = (c4<<2)|(c5>>6);
                outbuf[3] = '=';

                outbuf[0] = encode_table[outbuf[0]];
                outbuf[1] = encode_table[outbuf[1]];
                outbuf[2] = encode_table[outbuf[2]];

                // write the encoded bytes to the output stream
                if (out.sputn(reinterpret_cast<char*>(&outbuf),4)!=4)
                {
                    throw std::ios_base::failure("error occured in the base64 object");
                }


                break;
            }
            else // in this case status must be 1 
            {
                // we are at the end of the input stream and need to add some padding

                // encode the bytes in inbuf to base64 and write them to the output stream
                c1 = inbuf[0]&0xfc;
                c2 = inbuf[0]&0x03;
                c3 = 0;

                outbuf[0] = c1>>2;
                outbuf[1] = (c2<<4)|(c3>>4);
                outbuf[2] = '=';
                outbuf[3] = '=';

                outbuf[0] = encode_table[outbuf[0]];
                outbuf[1] = encode_table[outbuf[1]];


                // write the encoded bytes to the output stream
                if (out.sputn(reinterpret_cast<char*>(&outbuf),4)!=4)
                {
                    throw std::ios_base::failure("error occured in the base64 object");
                }

                break;
            }
        } // while (status != 0)
        

        // make sure the stream buffer flushes to its I/O channel
        out.pubsync();
    }

// ----------------------------------------------------------------------------------------

    void base64::
    decode (
        std::istream& in_,
        std::ostream& out_
    ) const
    {
        using namespace std;
        streambuf& in = *in_.rdbuf();
        streambuf& out = *out_.rdbuf();

        unsigned char inbuf[4];
        unsigned char outbuf[3];
        int inbuf_pos = 0;
        streamsize status = in.sgetn(reinterpret_cast<char*>(inbuf),1);

        // only count this character if it isn't some kind of filler
        if (status == 1 && decode_table[inbuf[0]] != bad_value )
            ++inbuf_pos;

        unsigned char c1, c2, c3, c4, c5, c6;
        streamsize outsize;

        // while we haven't hit the end of the input stream
        while (status != 0)
        {
            // if we have 4 valid characters
            if (inbuf_pos == 4)
            {
                inbuf_pos = 0;

                // this might be the end of the encoded data so we need to figure out if 
                // there was any padding applied.
                outsize = 3;
                if (inbuf[3] == '=')
                {
                    if (inbuf[2] == '=')
                        outsize = 1;
                    else
                        outsize = 2;
                }

                // decode the incoming characters
                inbuf[0] = decode_table[inbuf[0]];
                inbuf[1] = decode_table[inbuf[1]];
                inbuf[2] = decode_table[inbuf[2]];
                inbuf[3] = decode_table[inbuf[3]];


                // now pack these guys into bytes rather than 6 bit chunks
                c1 = inbuf[0]<<2;
                c2 = inbuf[1]>>4;
                c3 = inbuf[1]<<4;
                c4 = inbuf[2]>>2;
                c5 = inbuf[2]<<6;
                c6 = inbuf[3];

                outbuf[0] = c1|c2;
                outbuf[1] = c3|c4;
                outbuf[2] = c5|c6;


                // write the encoded bytes to the output stream
                if (out.sputn(reinterpret_cast<char*>(&outbuf),outsize)!=outsize)
                {
                    throw std::ios_base::failure("error occured in the base64 object");
                }
            }

            // get more input characters 
            status = in.sgetn(reinterpret_cast<char*>(inbuf + inbuf_pos),1);
            // only count this character if it isn't some kind of filler 
            if ((decode_table[inbuf[inbuf_pos]] != bad_value || inbuf[inbuf_pos] == '=') && 
                status != 0)
                ++inbuf_pos;
        } // while (status != 0)
        
        if (inbuf_pos != 0)
        {
            ostringstream sout;
            sout << inbuf_pos << " extra characters were found at the end of the encoded data."
                << "  This may indicate that the data stream has been truncated.";
            // this happens if we hit EOF in the middle of decoding a 24bit block.
            throw decode_error(sout.str());
        }

        // make sure the stream buffer flushes to its I/O channel
        out.pubsync();
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_BASE64_KERNEL_1_CPp_

