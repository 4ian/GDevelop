// Copyright (C) 2005  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_TOKENIZER_KERNEl_1_
#define DLIB_TOKENIZER_KERNEl_1_

#include <string>
#include <iosfwd>
#include <climits>
#include "../algs.h"
#include "tokenizer_kernel_abstract.h"

namespace dlib
{

    class tokenizer_kernel_1 
    {
        /*!
            INITIAL VALUE
                - in == 0
                - streambuf == 0
                - have_peeked == false
                - head == "_" + lowercase_letters() + uppercase_letters()
                - body == "_" + lowercase_letters() + uppercase_letters() + numbers()
                - headset == pointer to an array of UCHAR_MAX bools and set according 
                  to the CONVENTION.
                - bodyset == pointer to an array of UCHAR_MAX bools and set according 
                  to the CONVENTION.

            CONVENTION  
                - if (stream_is_set()) then
                    - get_stream() == *in
                    - streambuf == in->rdbuf()
                - else
                    - in == 0
                    - streambuf == 0

                - body == get_identifier_body()
                - head == get_identifier_head()

                - if (the char x appears in head) then
                    - headset[static_cast<unsigned char>(x)] == true
                - else
                    - headset[static_cast<unsigned char>(x)] == false

                - if (the char x appears in body) then
                    - bodyset[static_cast<unsigned char>(x)] == true
                - else
                    - bodyset[static_cast<unsigned char>(x)] == false

                - if (have_peeked) then
                    - next_token == the next token to be returned from get_token()
                    - next_type == the type of token in peek_token
        !*/

    public:

        // The name of this enum is irrelevant but on some compilers (gcc on MAC OS X) not having it named
        // causes an error for whatever reason
        enum some_random_name
        {
            END_OF_LINE,
            END_OF_FILE,
            IDENTIFIER,
            CHAR,
            NUMBER,
            WHITE_SPACE
        };

        tokenizer_kernel_1 (        
        );

        virtual ~tokenizer_kernel_1 (
        );

        void clear(
        );

        void set_stream (
            std::istream& in
        );

        bool stream_is_set (
        ) const;

        std::istream& get_stream (
        ) const;

        void get_token (
            int& type,
            std::string& token
        );

        void swap (
            tokenizer_kernel_1& item
        );

        void set_identifier_token (
            const std::string& head,
            const std::string& body
        );

        int peek_type (
        ) const;

        const std::string& peek_token (
        ) const;

        const std::string get_identifier_head (
        ) const;

        const std::string get_identifier_body (
        ) const;

        const std::string lowercase_letters (
        ) const;

        const std::string uppercase_letters (
        ) const;

        const std::string numbers (
        ) const;

    private:

        // restricted functions
        tokenizer_kernel_1(const tokenizer_kernel_1&);        // copy constructor
        tokenizer_kernel_1& operator=(const tokenizer_kernel_1&);    // assignment operator


        // data members
        std::istream* in;
        std::streambuf* streambuf;
        std::string head;
        std::string body;
        bool* headset;
        bool* bodyset;

        mutable std::string next_token;
        mutable int next_type;
        mutable bool have_peeked;
    };    

    inline void swap (
        tokenizer_kernel_1& a, 
        tokenizer_kernel_1& b 
    ) { a.swap(b); }   

}

#ifdef NO_MAKEFILE
#include "tokenizer_kernel_1.cpp"
#endif

#endif // DLIB_TOKENIZER_KERNEl_1

