// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_CPP_TOKENIZER_KERNEl_C_
#define DLIB_CPP_TOKENIZER_KERNEl_C_

#include "cpp_tokenizer_kernel_abstract.h"
#include "../assert.h"
#include <string>
#include <iostream>

namespace dlib
{

    template <
        typename tokenizer
        >
    class cpp_tokenizer_kernel_c : public tokenizer
    {
        
        public:
            std::istream& get_stream (
            ) const;

            void get_token (
                int& type,
                std::string& token
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
        cpp_tokenizer_kernel_c<tokenizer>& a, 
        cpp_tokenizer_kernel_c<tokenizer>& b 
    ) { a.swap(b); }  

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename tokenizer
        >
    std::istream& cpp_tokenizer_kernel_c<tokenizer>::
    get_stream (
    ) const
    {
        // make sure requires clause is not broken
        DLIB_CASSERT( this->stream_is_set() == true,
            "\tstd::istream& cpp_tokenizer::get_stream()"
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
    const std::string& cpp_tokenizer_kernel_c<tokenizer>::
    peek_token (
    ) const
    {
        // make sure requires clause is not broken
        DLIB_CASSERT( this->stream_is_set() == true,
            "\tconst std::string& cpp_tokenizer::peek_token()"
            << "\n\tyou must set a stream for this object before you can peek at what it contains"
            << "\n\tthis: " << this
            );

        // call the real function
        return tokenizer::peek_token();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename tokenizer
        >
    int cpp_tokenizer_kernel_c<tokenizer>::
    peek_type (
    ) const
    {
        // make sure requires clause is not broken
        DLIB_CASSERT( this->stream_is_set() == true,
            "\tint cpp_tokenizer::peek_type()"
            << "\n\tyou must set a stream for this object before you can peek at what it contains"
            << "\n\tthis: " << this
            );

        // call the real function
        return tokenizer::peek_type();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename tokenizer
        >
    void cpp_tokenizer_kernel_c<tokenizer>::
    get_token (
        int& type,
        std::string& token
    )
    {
        // make sure requires clause is not broken
        DLIB_CASSERT( this->stream_is_set() == true,
            "\tvoid cpp_tokenizer::get_token()"
            << "\n\tyou must set a stream for this object before you can get tokens from it."
            << "\n\tthis: " << this
            );

        // call the real function
        tokenizer::get_token(type,token);
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_TOKENIZER_KERNEl_C_


