// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_TOKENIZER_KERNEl_C_
#define DLIB_TOKENIZER_KERNEl_C_

#include "tokenizer_kernel_abstract.h"
#include "../assert.h"
#include <string>
#include <iostream>

namespace dlib
{

    template <
        typename tokenizer
        >
    class tokenizer_kernel_c : public tokenizer
    {
        
        public:
            std::istream& get_stream (
            ) const;

            void get_token (
                int& type,
                std::string& token
            );

            void set_identifier_token (
                const std::string& head,
                const std::string& body
            );

            int peek_type (
            ) const;

            const std::string& peek_token (
            ) const;
    };

    template <
        typename tokenizer
        >
    inline void swap (
        tokenizer_kernel_c<tokenizer>& a, 
        tokenizer_kernel_c<tokenizer>& b 
    ) { a.swap(b); }  

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename tokenizer
        >
    void tokenizer_kernel_c<tokenizer>::
    set_identifier_token (
        const std::string& head,
        const std::string& body
    ) 
    {
        using namespace std;
        // make sure requires clause is not broken
        DLIB_CASSERT( head.find_first_of(" \r\t\n0123456789") == string::npos &&
                body.find_first_of(" \r\t\n") == string::npos ,
            "\tvoid tokenizer::set_identifier_token()"
            << "\n\tyou can't define the IDENTIFIER token this way."
            << "\n\thead: " << head
            << "\n\tbody: " << body
            << "\n\tthis: " << this
            );

        // call the real function
        tokenizer::set_identifier_token(head,body);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename tokenizer
        >
    std::istream& tokenizer_kernel_c<tokenizer>::
    get_stream (
    ) const
    {
        // make sure requires clause is not broken
        DLIB_CASSERT( this->stream_is_set() == true,
            "\tstd::istream& tokenizer::get_stream()"
            << "\n\tyou must set a stream for this object before you can get it"
            << "\n\tthis: " << this
            );

        // call the real function
        return tokenizer::get_stream();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename tokenizer
        >
    int tokenizer_kernel_c<tokenizer>::
    peek_type (
    ) const
    {
        // make sure requires clause is not broken
        DLIB_CASSERT( this->stream_is_set() == true,
            "\tint tokenizer::peek_type()"
            << "\n\tyou must set a stream for this object before you peek at what it contains"
            << "\n\tthis: " << this
            );

        // call the real function
        return tokenizer::peek_type();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename tokenizer
        >
    const std::string& tokenizer_kernel_c<tokenizer>::
    peek_token (
    ) const
    {
        // make sure requires clause is not broken
        DLIB_CASSERT( this->stream_is_set() == true,
            "\tint tokenizer::peek_token()"
            << "\n\tyou must set a stream for this object before you peek at what it contains"
            << "\n\tthis: " << this
            );

        // call the real function
        return tokenizer::peek_token();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename tokenizer
        >
    void tokenizer_kernel_c<tokenizer>::
    get_token (
        int& type,
        std::string& token
    )
    {
        // make sure requires clause is not broken
        DLIB_CASSERT( this->stream_is_set() == true,
            "\tvoid tokenizer::get_token()"
            << "\n\tyou must set a stream for this object before you can get tokens from it."
            << "\n\tthis: " << this
            );

        // call the real function
        tokenizer::get_token(type,token);
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_TOKENIZER_KERNEl_C_


