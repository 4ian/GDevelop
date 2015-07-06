// Copyright (C) 2005  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_TOKENIZER_KERNEL_1_CPp_
#define DLIB_TOKENIZER_KERNEL_1_CPp_
#include "tokenizer_kernel_1.h"

#include <iostream>
#include <cstdio>

namespace dlib
{

// ----------------------------------------------------------------------------------------

    tokenizer_kernel_1::
    tokenizer_kernel_1 (        
    ) :
        headset(0),
        bodyset(0),
        have_peeked(false)
    {
        try
        {
            headset = new bool[UCHAR_MAX];
            bodyset = new bool[UCHAR_MAX];

            clear();
        }
        catch (...)
        {
            if (headset) delete [] headset;
            if (bodyset) delete [] headset;
            throw;
        }
    }

// ----------------------------------------------------------------------------------------

    tokenizer_kernel_1::
    ~tokenizer_kernel_1 (
    )
    {
        delete [] bodyset;
        delete [] headset;
    }

// ----------------------------------------------------------------------------------------

    void tokenizer_kernel_1::
    clear(
    )
    {
        using namespace std;

        in = 0;
        streambuf = 0;
        have_peeked = false;

        head = "_" + lowercase_letters() + uppercase_letters();
        body = "_" + lowercase_letters() + uppercase_letters() + numbers();

        for (unsigned long i = 0; i < UCHAR_MAX; ++i)
        {
            headset[i] = false;
            bodyset[i] = false;
        }

        for (string::size_type i = 0; i < head.size(); ++i)
            headset[static_cast<unsigned char>(head[i])] = true;
        for (string::size_type i = 0; i < body.size(); ++i)
            bodyset[static_cast<unsigned char>(body[i])] = true;
    }

// ----------------------------------------------------------------------------------------

    void tokenizer_kernel_1::
    set_stream (
        std::istream& in_
    )
    {
        in = &in_;
        streambuf = in_.rdbuf();
        have_peeked = false;
    }

// ----------------------------------------------------------------------------------------

    bool tokenizer_kernel_1::
    stream_is_set (
    ) const
    {
        return (in != 0);
    }

// ----------------------------------------------------------------------------------------

    std::istream& tokenizer_kernel_1::
    get_stream (
    ) const
    {
        return *in;
    }

// ----------------------------------------------------------------------------------------

    void tokenizer_kernel_1::
    get_token (
        int& type,
        std::string& token
    )
    {
        if (!have_peeked)
        {
            std::streambuf::int_type ch;
            ch = streambuf->sbumpc();

            switch (ch)
            {
            case EOF:
                type = END_OF_FILE;
                token.clear();
                return;

            case '\n':
                type = END_OF_LINE;
                token = "\n";
                return;

            case '\r':
            case ' ':
            case '\t':
                type = WHITE_SPACE;
                token = static_cast<char>(ch);
                ch = streambuf->sgetc();
                while ((ch == ' ' || ch == '\t' || ch == '\r') && ch != EOF)
                {
                    token += static_cast<char>(ch);
                    ch = streambuf->snextc();
                }
                return;

            default:
                if (headset[static_cast<unsigned char>(ch)])
                {
                    type = IDENTIFIER;
                    token = static_cast<char>(ch);
                    ch = streambuf->sgetc();
                    while ( bodyset[static_cast<unsigned char>(ch)] && ch != EOF )
                    {
                        token += static_cast<char>(ch);
                        ch = streambuf->snextc();
                    }
                }
                else if ('0' <= ch && ch <= '9')
                {
                    type = NUMBER;
                    token = static_cast<char>(ch);
                    ch = streambuf->sgetc();
                    while (('0' <= ch && ch <= '9') && ch != EOF)
                    {
                        token += static_cast<char>(ch);
                        ch = streambuf->snextc();
                    }
                }
                else
                {
                    type = CHAR;
                    token = static_cast<char>(ch);
                }
                return;
            } // switch (ch)
        }
        
        // if we get this far it means we have peeked so we should 
        // return the peek data.
        type = next_type;
        token = next_token;
        have_peeked = false;
    }

// ----------------------------------------------------------------------------------------

    int tokenizer_kernel_1::
    peek_type (
    ) const
    {
        const_cast<tokenizer_kernel_1*>(this)->get_token(next_type,next_token);
        have_peeked = true;
        return next_type;
    }

// ----------------------------------------------------------------------------------------

    const std::string& tokenizer_kernel_1::
    peek_token (
    ) const
    {
        const_cast<tokenizer_kernel_1*>(this)->get_token(next_type,next_token);
        have_peeked = true;
        return next_token;
    }

// ----------------------------------------------------------------------------------------

    void tokenizer_kernel_1::
    swap (
        tokenizer_kernel_1& item
    )
    {
        exchange(in,item.in);
        exchange(streambuf,item.streambuf);
        exchange(head,item.head);
        exchange(body,item.body);
        exchange(bodyset,item.bodyset);
        exchange(headset,item.headset);
        exchange(have_peeked,item.have_peeked);
        exchange(next_type,item.next_type);
        exchange(next_token,item.next_token);
    }

// ----------------------------------------------------------------------------------------
    
    void tokenizer_kernel_1::
    set_identifier_token (
        const std::string& head_,
        const std::string& body_
    )
    {
        using namespace std;

        head = head_;
        body = body_;

        for (unsigned long i = 0; i < UCHAR_MAX; ++i)
        {
            headset[i] = false;
            bodyset[i] = false;
        }

        for (string::size_type i = 0; i < head.size(); ++i)
            headset[static_cast<unsigned char>(head[i])] = true;
        for (string::size_type i = 0; i < body.size(); ++i)
            bodyset[static_cast<unsigned char>(body[i])] = true;
    }

// ----------------------------------------------------------------------------------------
    
    const std::string tokenizer_kernel_1::
    get_identifier_head (
    ) const
    {
        return head;
    }

// ----------------------------------------------------------------------------------------
    
    const std::string tokenizer_kernel_1::
    get_identifier_body (
    ) const
    {
        return body;
    }

// ----------------------------------------------------------------------------------------
    
    const std::string tokenizer_kernel_1::
    lowercase_letters (
    ) const
    {
        return std::string("abcdefghijklmnopqrstuvwxyz");
    }

// ----------------------------------------------------------------------------------------
    
    const std::string tokenizer_kernel_1::
    uppercase_letters (
    ) const
    {
        return std::string("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
    }

// ----------------------------------------------------------------------------------------
    
    const std::string tokenizer_kernel_1::
    numbers (
    ) const
    {
        return std::string("0123456789");
    }
    
// ----------------------------------------------------------------------------------------
    
}
#endif // DLIB_TOKENIZER_KERNEL_1_CPp_

