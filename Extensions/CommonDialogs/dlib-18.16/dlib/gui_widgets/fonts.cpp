// Copyright (C) 2005  Davis E. King (davis@dlib.net), and Nils Labugt, Keita Mochizuki
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_FONTs_CPP_
#define DLIB_FONTs_CPP_

#include "fonts.h"

#include "../serialize.h"
#include <sstream>
#include "../base64.h"
#include "../compress_stream.h"
#include <fstream>
#include "../tokenizer.h"
#include "nativefont.h"
   
namespace dlib
{

// ----------------------------------------------------------------------------------------

    const std::string get_decoded_string_with_default_font_data()
    {
        dlib::base64::kernel_1a base64_coder;
        dlib::compress_stream::kernel_1ea compressor;
        std::ostringstream sout;
        std::istringstream sin;

        /* 
            SOURCE BDF FILE (helvR12.bdf) COMMENTS 
            COMMENT $XConsortium: helvR12.bdf,v 1.15 95/01/26 18:02:58 gildea Exp $
            COMMENT $Id: helvR12.bdf,v 1.26 2004-11-28 20:08:46+00 mgk25 Rel $
            COMMENT 
            COMMENT +
            COMMENT  Copyright 1984-1989, 1994 Adobe Systems Incorporated.
            COMMENT  Copyright 1988, 1994 Digital Equipment Corporation.
            COMMENT 
            COMMENT  Adobe is a trademark of Adobe Systems Incorporated which may be
            COMMENT  registered in certain jurisdictions.
            COMMENT  Permission to use these trademarks is hereby granted only in
            COMMENT  association with the images described in this file.
            COMMENT 
            COMMENT  Permission to use, copy, modify, distribute and sell this software
            COMMENT  and its documentation for any purpose and without fee is hereby
            COMMENT  granted, provided that the above copyright notices appear in all
            COMMENT  copies and that both those copyright notices and this permission
            COMMENT  notice appear in supporting documentation, and that the names of
            COMMENT  Adobe Systems and Digital Equipment Corporation not be used in
            COMMENT  advertising or publicity pertaining to distribution of the software
            COMMENT  without specific, written prior permission.  Adobe Systems and
            COMMENT  Digital Equipment Corporation make no representations about the
            COMMENT  suitability of this software for any purpose.  It is provided "as
            COMMENT  is" without express or implied warranty.
            COMMENT -
        */

        // The base64 encoded data we want to decode and return.
        sout << "AXF+zOQzCgGitrKiOCGEL4hlIv1ZenWJyjMQ4rJ6f/oPMeHqsZn+8XnpehwFQTz3dtUGlZRAUoOa";
        sout << "uVo8UiplcFxuK69A+94rpMCMAyEeeOwZ/tRzkX4eKuU3L4xtsJDknMiYUNKaMrYimb1QJ0E+SRqQ";
        sout << "wATrMTecYNZvJJm02WibiwE4cJ5scvkHNl4KJT5QfdwRdGopTyUVdZvRvtbTLLjsJP0fQEQLqemf";
        sout << "qPE4kDD79ehrBIwLO1Y6TzxtrrIoQR57zlwTUyLenqRtSN3VLtjWYd82cehRIlTLtuxBg2s+zZVq";
        sout << "jNlNnYTSM+Swy06qnQgg+Dt0lhtlB9shR1OAlcfCtTW6HKoBk/FGeDmjTGW4bNCGv7RjgM6TlLDg";
        sout << "ZYSSA6ZCCAKBgE++U32gLHCCiVkPTkkp9P6ioR+e3SSKRNm9p5MHf+ZQ3LJkW8KFJ/K9gKT1yvyv";
        sout << "F99pAvOOq16tHRFvzBs+xZj/mUpH0lGIS7kLWr9oP2KuccVrz25aJn3kDruwTYoD+CYlOqtPO0Mv";
        sout << "dEI0LUR0Ykp1M2rWo76fJ/fpzHjV7737hjkNPJ13nO72RMDr4R5V3uG7Dw7Ng+vGX3WgJZ4wh1JX";
        sout << "pl2VMqC5JXccctzvnQvnuvBvRm7THgwQUgMKKT3WK6afUUVlJy8DHKuU4k1ibfVMxAmrwKdTUX2w";
        sout << "cje3A05Qji3aop65qEdwgI5O17HIVoRQOG/na+XRMowOfUvI4H8Z4+JGACfRrQctgYDAM9eJzm8i";
        sout << "PibyutmJfZBGg0a3oC75S5R9lTxEjPocnEyJRYNnmVnVAmKKbTbTsznuaD+D1XhPdr2t3A4bRTsp";
        sout << "toKKtlFnd9YGwLWwONDwLnoQ/IXwyF7txrRHNSVToh772U0Aih/yn5vnmcMF750eiMzRAgXu5sbR";
        sout << "VXEOVCiLgVevN5umkvjZt1eGTSSzDMrIvnv4nyOfaFsD+I76wQfgLqd71rheozGtjNc0AOTx4Ggc";
        sout << "eUSFHTDAVfTExBzckurtyuIAqF986a0JLHCtsDpBa2wWNuiQYOH3/LX1zkdU2hdamhBW774bpEwr";
        sout << "dguMxxOeDGOBgIlM5gxXGYXSf5IN3fUAEPfOPRxB7T+tpjFnWd7cg+JMabci3zhJ9ANaYT7HGeTX";
        sout << "bulKnGHjYrR1BxdK3YeliogQRU4ytmxlyL5zlNFU/759mA8XSfIPMEZn9Vxkb00q1htF7REiDcr3";
        sout << "kW1rtPAc7VQNEhT54vK/YF6rMvjO7kBZ/vLYo7E8e8hDKEnY8ucrC3KGmeo31Gei74BBcEbvJBd3";
        sout << "/YAaIKgXWwU2wSUw9wLq2RwGwyguvKBx0J/gn27tjcVAHorRBwxzPpk8r+YPyN+SifSzEL7LEy1G";
        sout << "lPHxmXTrcqnH9qraeAqXJUJvU8SJJpf/tmsAE+XSKD/kpVBnT5qXsJ1SRFS7MtfPjE1j/NYbaQBI";
        sout << "bOrh81zaYCEJR0IKHWCIsu/MC3zKXfkxFgQ9XpYAuWjSSK64YpgkxSMe8VG8yYvigOw2ODg/z4FU";
        sout << "+HpnEKF/M/mKfLKK1i/8BV7xcYVHrhEww1QznoFklJs/pEg3Kd5PE1lRii6hvTn6McVAkw+YbH9q";
        sout << "/sg4gFIAvai64hMcZ1oIZYppj3ZN6KMdyhK5s4++ZS/YOV2nNhW73ovivyi2Tjg7lxjJJtsYrLKb";
        sout << "zIN1slOICKYwBq42TFBcFXaZ6rf0Czd09tL+q6A1Ztgr3BNuhCenjhWN5ji0LccGYZo6bLTggRG/";
        sout << "Uz6K3CBBU/byLs79c5qCohrr7rlpDSdbuR+aJgNiWoU6T0i2Tvua6h51LcWEHy5P2n146/Ae2di4";
        sout << "eh20WQvclrsgm1oFTGD0Oe85GKOTA7vvwKmLBc1wwA0foTuxzVgj0TMTFBiYLTLG4ujUyBYy1N6e";
        sout << "H8EKi8H+ZAlqezrjABO3BQr33ewdZL5IeJ4w7gdGUDA6+P+7cODcBW50X9++6YTnKctuEw6aXBpy";
        sout << "GgcMfPE61G8YKBbFGFic3TVvGCLvre1iURv+F+hU4/ee6ILuPnpYnSXX2iCIK/kmkBse8805d4Qe";
        sout << "DG/8rBW9ojvAgc0jX7CatPEMHGkcz+KIZoKMI7XXK4PJpGQUdq6EdIhJC4koXEynjwwXMeC+jJqH";
        sout << "agwrlDNssq/8AA==";



        // Put the data into the istream sin
        sin.str(sout.str());
        sout.str("");

        // Decode the base64 text into its compressed binary form
        base64_coder.decode(sin,sout);
        sin.clear();
        sin.str(sout.str());
        sout.str("");

        // Decompress the data into its original form
        compressor.decompress(sin,sout);

        // Return the decoded and decompressed data
        return sout.str();
    }


    default_font::
    default_font (
    ) 
    {
        using namespace std;
        l = new letter[256];

        try
        {
            istringstream sin(get_decoded_string_with_default_font_data());

            for (int i = 0; i < 256; ++i)
            {
                deserialize(l[i],sin);
            }

        }
        catch (...)
        {
            delete [] l;
            throw;
        }
    }

// ----------------------------------------------------------------------------------------

    void serialize (
        const letter& item, 
        std::ostream& out 
    )   
    {
        try
        {
            serialize(item.w,out);
            serialize(item.count,out);

            for (unsigned long i = 0; i < item.count; ++i)
            {
                serialize(item.points[i].x,out);
                serialize(item.points[i].y,out);
            }
        }
        catch (serialization_error e)
        { 
            throw serialization_error(e.info + "\n   while serializing object of type letter"); 
        }
    }

    void deserialize (
        letter& item, 
        std::istream& in
    )
    {
        try
        {
            if (item.points)
                delete [] item.points;

            deserialize(item.w,in);
            deserialize(item.count,in);

            if (item.count > 0)
                item.points = new letter::point[item.count];
            else
                item.points = 0;

            for (unsigned long i = 0; i < item.count; ++i)
            {
                deserialize(item.points[i].x,in);
                deserialize(item.points[i].y,in);
            }
        }
        catch (serialization_error e)
        { 
            item.w = 0;
            item.count = 0;
            item.points = 0;
            throw serialization_error(e.info + "\n   while deserializing object of type letter"); 
        }
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    namespace bdf_font_helpers
    {
        class bdf_parser
        {
        public:
            bdf_parser( std::istream& in ) : in_( in )
            {
                std::string str_tmp;
                int int_tmp;

                str_tmp = "STARTFONT";      int_tmp = STARTFONT;        keyword_map.add( str_tmp, int_tmp );
                str_tmp = "FONTBOUNDINGBOX";int_tmp = FONTBOUNDINGBOX;  keyword_map.add( str_tmp, int_tmp );
                str_tmp = "DWIDTH";         int_tmp = DWIDTH;           keyword_map.add( str_tmp, int_tmp );
                str_tmp = "CHARS";          int_tmp = CHARS;            keyword_map.add( str_tmp, int_tmp );
                str_tmp = "STARTCHAR";      int_tmp = STARTCHAR;        keyword_map.add( str_tmp, int_tmp );
                str_tmp = "ENCODING";       int_tmp = ENCODING;         keyword_map.add( str_tmp, int_tmp );
                str_tmp = "BBX";            int_tmp = BBX;              keyword_map.add( str_tmp, int_tmp );
                str_tmp = "BITMAP";         int_tmp = BITMAP;           keyword_map.add( str_tmp, int_tmp );
                str_tmp = "ENDCHAR";        int_tmp = ENDCHAR;          keyword_map.add( str_tmp, int_tmp );
                str_tmp = "ENDFONT";        int_tmp = ENDFONT;          keyword_map.add( str_tmp, int_tmp );
                str_tmp = "DEFAULT_CHAR";   int_tmp = DEFAULT_CHAR;     keyword_map.add( str_tmp, int_tmp );

                tokzr.set_identifier_token( tokzr.uppercase_letters(), tokzr.uppercase_letters() + "_" );
                tokzr.set_stream( in );

            }

            enum bdf_enums
            {
                NO_KEYWORD = 0,
                STARTFONT = 1,
                FONTBOUNDINGBOX = 2,
                DWIDTH = 4,
                DEFAULT_CHAR = 8,
                CHARS = 16,
                STARTCHAR = 32,
                ENCODING = 64,
                BBX = 128,
                BITMAP = 256,
                ENDCHAR = 512,
                ENDFONT = 1024

            };
            struct header_info
            {
                int FBBx, FBBy, Xoff, Yoff;
                int dwx0, dwy0;
                bool has_global_dw;
                long default_char;
            };
            struct char_info
            {
                int dwx0, dwy0;
                int BBw, BBh, BBxoff0x, BByoff0y;
                array2d<char> bitmap;
                bool has_dw;
            };
            bool parse_header( header_info& info )
            {
                if ( required_keyword( STARTFONT ) == false )
                    return false;    // parse_error: required keyword missing
                info.has_global_dw = false;
                int find = FONTBOUNDINGBOX | DWIDTH | DEFAULT_CHAR;
                int stop = CHARS | STARTCHAR | ENCODING | BBX | BITMAP | ENDCHAR | ENDFONT;
                int res;
                while ( 1 )
                {
                    res = find_keywords( find | stop );
                    if ( res & FONTBOUNDINGBOX )
                    {
                        in_ >> info.FBBx >> info.FBBy >> info.Xoff >> info.Yoff;
                        if ( in_.fail() )
                            return false;    // parse_error
                        find &= ~FONTBOUNDINGBOX;
                        continue;
                    }
                    if ( res & DWIDTH )
                    {
                        in_ >> info.dwx0 >> info.dwy0;
                        if ( in_.fail() )
                            return false;    // parse_error
                        find &= ~DWIDTH;
                        info.has_global_dw = true;
                        continue;
                    }
                    if ( res & DEFAULT_CHAR )
                    {
                        in_ >> info.default_char;
                        if ( in_.fail() )
                            return false;    // parse_error
                        find &= ~DEFAULT_CHAR;
                        continue;
                    }
                    if ( res & NO_KEYWORD )
                        return false;    // parse_error: unexpected EOF
                    break;
                }
                if ( res != CHARS || ( find & FONTBOUNDINGBOX ) )
                    return false;    // parse_error: required keyword missing or unexpeced keyword
                return true;
            }
            int parse_glyph( char_info& info, unichar& enc )
            {
                info.has_dw = false;
                int e;
                int res;
                while ( 1 )
                {
                    res = find_keywords( ENCODING );
                    if ( res != ENCODING )
                        return 0; // no more glyphs
                    in_ >> e;
                    if ( in_.fail() )
                        return -1;    // parse_error
                    if ( e >= static_cast<int>(enc) )
                        break;
                }
                int find = BBX | DWIDTH;
                int stop = STARTCHAR | ENCODING | BITMAP | ENDCHAR | ENDFONT;
                while ( 1 )
                {
                    res = find_keywords( find | stop );
                    if ( res & BBX )
                    {
                        in_ >> info.BBw >> info.BBh >> info.BBxoff0x >> info.BByoff0y;
                        if ( in_.fail() )
                            return -1;    // parse_error
                        find &= ~BBX;
                        continue;
                    }
                    if ( res & DWIDTH )
                    {
                        in_ >> info.dwx0 >> info.dwy0;
                        if ( in_.fail() )
                            return -1;    // parse_error
                        find &= ~DWIDTH;
                        info.has_dw = true;
                        continue;
                    }
                    if ( res & NO_KEYWORD )
                        return -1;    // parse_error: unexpected EOF
                    break;
                }
                if ( res != BITMAP || ( find != NO_KEYWORD ) )
                    return -1;     // parse_error: required keyword missing or unexpeced keyword
                unsigned h = info.BBh;
                unsigned w = ( info.BBw + 7 ) / 8 * 2;
                info.bitmap.set_size( h, w );
                for ( unsigned r = 0;r < h;r++ )
                {
                    trim();
                    std::string str = "";
                    extract_hex(str);
                    if(str.size() < w)
                        return -1;    // parse_error
                    for ( unsigned c = 0;c < w;c++ )
                        info.bitmap[r][c] = str[c];
                }
                if ( in_.fail() )
                    return -1;      // parse_error
                if ( required_keyword( ENDCHAR ) == false )
                    return -1;      // parse_error: required keyword missing
                enc = e;
                return 1;
            }
        private:
            map<std::string, int>::kernel_1a_c keyword_map;
            tokenizer::kernel_1a_c tokzr;
            std::istream& in_;
            void extract_hex(std::string& str)
            {
                int type;
                std::string token;
                while ( 1 )
                {
                    type = tokzr.peek_type();
                    if ( type == tokenizer::kernel_1a_c::IDENTIFIER || type == tokenizer::kernel_1a_c::NUMBER )
                    {
                        tokzr.get_token( type, token );
                        str += token;
                        continue;
                    }
                    break;
                }
            }
            void trim()
            {
                int type;
                std::string token;
                while ( 1 )
                {
                    type = tokzr.peek_type();
                    if ( type == tokenizer::kernel_1a_c::WHITE_SPACE || type == tokenizer::kernel_1a_c::END_OF_LINE )
                    {
                        tokzr.get_token( type, token );
                        continue;
                    }
                    break;
                }
            }
            bool required_keyword( int kw )
            {
                int type;
                std::string token;
                while ( 1 )
                {
                    tokzr.get_token( type, token );
                    if ( type == tokenizer::kernel_1a_c::WHITE_SPACE || type == tokenizer::kernel_1a_c::END_OF_LINE )
                        continue;
                    if ( type != tokenizer::kernel_1a_c::IDENTIFIER || keyword_map.is_in_domain( token ) == false || ( keyword_map[token] & kw ) == 0 )
                        return false;
                    break;
                }
                return true;
            }
            int find_keywords( int find )
            {
                int type;
                std::string token;
                while ( 1 )
                {
                    tokzr.get_token( type, token );
                    if ( type == tokenizer::kernel_1a_c::END_OF_FILE )
                        return NO_KEYWORD;
                    if ( type == tokenizer::kernel_1a_c::IDENTIFIER && keyword_map.is_in_domain( token ) == true )
                    {
                        int kw = keyword_map[token];
                        if ( kw & find )
                            return kw;
                    }
                }
                return true;
            }

        };

    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
//                    bdf_font functions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    bdf_font::bdf_font( 
        long default_char_ 
    ) :
        default_char(0),
        is_initialized( false ),
        right_overflow_( 0 ),
        has_global_width( false ),
        specified_default_char( default_char_ )
    {
        // make sure gl contains at least one letter
        gl.resize(1);
    }

// ----------------------------------------------------------------------------------------

    void bdf_font::adjust_metrics(
    )
    {
        if ( is_initialized == false )
            return;
        // set starting values for fbb
        if ( gl[default_char].num_of_points() > 0 )
        {
            letter& g =  gl[default_char];
            fbb.set_top( g[0].y );
            fbb.set_bottom( g[0].y );
            fbb.set_left( g[0].x );
            fbb.set_right( g[0].x );
        }
        else
        {
            // ok, the default char was a space
            // let's just choose some safe arbitrary values then...
            fbb.set_top( 10000 );
            fbb.set_bottom( -10000 );
            fbb.set_left( 10000 );
            fbb.set_right( -10000 );
        }
        right_overflow_ = 0;
        for ( unichar n = 0; n < gl.size(); n++ )
        {
            letter& g = gl[n];
            unsigned short nr_pts = g.num_of_points();
            for ( unsigned short k = 0;k < nr_pts;k++ )
            {
                fbb.set_top( std::min( fbb.top(), (long)g[k].y ) );
                fbb.set_left( std::min( fbb.left(), (long)g[k].x ) );
                fbb.set_bottom( std::max( fbb.bottom(), (long)g[k].y ) );
                fbb.set_right( std::max( fbb.right(), (long)g[k].x ) );
                right_overflow_ = std::max( right_overflow_, (unsigned long)(g[k].x - g.width()) );  // superfluous?
            }
        }
    }

// ----------------------------------------------------------------------------------------

    long bdf_font::
    read_bdf_file( 
        std::istream& in, 
        unichar max_enc, 
        unichar min_enc 
    )
    {
        using namespace bdf_font_helpers;

        bdf_parser parser( in );
        bdf_parser::header_info hinfo;
        bdf_parser::char_info cinfo;

        gl.resize(max_enc+1);
        hinfo.default_char =  - 1;
        if ( is_initialized == false || static_cast<std::streamoff>(in.tellg()) == std::ios::beg )
        {
            if ( parser.parse_header( hinfo ) == false )
                return 0;   // parse_error: invalid or missing header
        }
        else
        {
            // not start of file, so use values from previous read.
            hinfo.has_global_dw = has_global_width;
            hinfo.dwx0 = global_width;
        }
        int res;
        unichar nr_letters_added = 0;
        unsigned width;
        for ( unichar n = min_enc; n <= max_enc; n++ )
        {
            if ( in.eof() )
                break;
            long pos = in.tellg();
            res = parser.parse_glyph( cinfo, n );
            if ( res < 0 )
                return 0;  // parse_error
            if ( res == 0 )
                continue;
            if ( n > max_enc )
            {
                in.seekg( pos );
                break;
            }

            if ( cinfo.has_dw == false )
            {
                if ( hinfo.has_global_dw == false )
                    return 0;    // neither width info for the glyph, nor for the font as a whole (monospace).
                width = hinfo.dwx0;
            }
            else
                width = cinfo.dwx0;


            if ( bitmap_to_letter( cinfo.bitmap, n, width, cinfo.BBxoff0x, cinfo.BByoff0y ) == false )
                return 0;
            nr_letters_added++;

            if ( is_initialized == false )
            {
                // Bonding rectangle for the font.
                fbb.set_top( -( hinfo.Yoff + hinfo.FBBy - 1 ) );
                fbb.set_bottom( -hinfo.Yoff );
                fbb.set_left( hinfo.Xoff );
                fbb.set_right( hinfo.Xoff + hinfo.FBBx - 1 );
                // We need to compute this after all the glyphs are loaded.
                right_overflow_ = 0;
                // set this to something valid now, just in case.
                default_char = n;
                // Save any global width in case we later read from the same file.
                has_global_width = hinfo.has_global_dw;
                if ( has_global_width )
                    global_width = hinfo.dwx0;
                // dont override value specified in the constructor with value specified in the file
                if ( specified_default_char < 0 && hinfo.default_char >= 0 )
                    specified_default_char = hinfo.default_char;

                is_initialized = true;
            }
        }
        if ( is_initialized == false )
            return 0;   // Not a single glyph was found within the specified range.

        if ( specified_default_char >= 0 )
            default_char = specified_default_char;
        // no default char specified, try find something sane.
        else 
            default_char = 0;

        return nr_letters_added;
    }

// ----------------------------------------------------------------------------------------

    bool bdf_font::
    bitmap_to_letter( 
        array2d<char>& bitmap, 
        unichar enc, 
        unsigned long width, 
        int x_offset,
        int y_offset 
    )
    {
        unsigned nr_points = 0;
        bitmap.reset();
        while ( bitmap.move_next() )
        {
            unsigned char ch = bitmap.element();
            if ( ch > '9' )
                ch -= 'A' - '9' - 1;
            ch -= '0';
            if ( ch > 0xF )
                return false;   // parse error: invalid hex digit
            bitmap.element() = ch;
            if ( ch & 8 )
                nr_points++;
            if ( ch & 4 )
                nr_points++;
            if ( ch & 2 )
                nr_points++;
            if ( ch & 1 )
                nr_points++;
        }

        letter( width, nr_points ).swap(gl[enc]);

        unsigned index = 0;
        for ( int r = 0;r < bitmap.nr();r++ )
        {
            for ( int c = 0;c < bitmap.nc();c++ )
            {
                int x = x_offset + c * 4;
                int y = -( y_offset + bitmap.nr() - r - 1 );
                char ch = bitmap[r][c];
                letter& glyph =  gl[enc];
                if ( ch & 8 )
                {
                    glyph[index] = letter::point( x, y );
                    right_overflow_ = std::max( right_overflow_, x - width );
                    index++;
                }
                if ( ch & 4 )
                {
                    glyph[index] = letter::point( x + 1, y );
                    right_overflow_ = std::max( right_overflow_, x + 1 - width );
                    index++;
                }
                if ( ch & 2 )
                {
                    glyph[index] = letter::point( x + 2, y );
                    right_overflow_ = std::max( right_overflow_, x + 2 - width );
                    index++;
                }
                if ( ch & 1 )
                {
                    glyph[index] = letter::point( x + 3, y );
                    right_overflow_ = std::max( right_overflow_, x + 3 - width );
                    index++;
                }
            }
        }
        return true;
    }

// ----------------------------------------------------------------------------------------

    const shared_ptr_thread_safe<font> get_native_font (
    )
    {
        return nativefont::native_font::get_font();
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_FONTs_CPP_

