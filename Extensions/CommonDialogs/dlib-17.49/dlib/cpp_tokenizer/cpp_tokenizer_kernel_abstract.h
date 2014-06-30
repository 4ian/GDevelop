// Copyright (C) 2005  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_CPP_TOKENIZER_KERNEl_ABSTRACT_
#ifdef DLIB_CPP_TOKENIZER_KERNEl_ABSTRACT_

#include <string>
#include <ioswfd>

namespace dlib
{

    class cpp_tokenizer 
    {
        /*!
            INITIAL VALUE
                stream_is_set() == false

            WHAT THIS OBJECT REPRESENTS
                This object represents a simple tokenizer for C++ source code. 

            BUFFERING
                This object is allowed to buffer data from the input stream.
                Thus if you clear it or switch streams (via calling set_stream())
                any buffered data will be lost.

            TOKENS
                When picking out tokens the cpp_tokenizer will always extract the 
                longest token it can.  For example, if faced with the string 
                "AAA" it will consider the three As to be a single IDENTIFIER 
                token not three smaller IDENTIFIER tokens.

                Also note that no characters in the input stream are discarded.
                They will all be returned in the text of some token.  
                Additionally, each character will never be returned more than once.  
                This means that if you concatenated all returned tokens it would exactly
                reproduce the contents of the input stream.

                The tokens are defined as follows:

                END_OF_FILE
                    This token represents the end of file.  It doesn't have any
                    actual characters associated with it.

                KEYWORD
                    This token matches a C++ keyword.  (This includes the preprocessor
                    directives).

                COMMENT
                    This token matches a C++ comment.

                SINGLE_QUOTED_TEXT
                    This token matches the text of any single quoted literal.
                    For example, 'a' would be a match and the text of this token
                    would be the single character a.

                DOUBLE_QUOTED_TEXT  
                    This token matches the text of any double quoted string.
                    For example, "C++" would be a match and the text of this token
                    would be the three character string C++.

                WHITE_SPACE
                    This is a multi character token.  It is defined as a sequence of
                    one or more spaces, carrage returns, newlines, and tabs.  I.e. It 
                    is composed of characters from the following string " \r\n\t".

                IDENTIFIER
                    This token matches any C++ identifier that isn't matched by any 
                    of the above tokens.   (A C++ identifier being a string matching
                    the regular expression [_$a-zA-Z][_$a-zA-Z0-9]*).

                NUMBER
                    This token matches any C++ numerical constant.

                OTHER
                    This matches anything that isn't part of one of the above tokens. 
                    It is always a single character. 
        !*/

    public:

        enum 
        {
            END_OF_FILE,
            KEYWORD,
            COMMENT,
            SINGLE_QUOTED_TEXT,
            DOUBLE_QUOTED_TEXT,
            IDENTIFIER,
            OTHER,
            NUMBER,
            WHITE_SPACE
        };

        cpp_tokenizer (        
        );
        /*!
            ensures                
                - #*this is properly initialized
            throws
                - std::bad_alloc
        !*/

        virtual ~cpp_tokenizer (
        );
        /*!
            ensures
                - any resources associated with *this have been released
        !*/

        void clear(
        );
        /*!
            ensures
                - #*this has its initial value
            throws
                - std::bad_alloc
                    If this exception is thrown then #*this is unusable 
                    until clear() is called and succeeds.
        !*/

        void set_stream (
            std::istream& in
        );
        /*!
            ensures
                - #*this will read data from in and tokenize it
                - #stream_is_set() == true
                - #get_stream() == in
        !*/

        bool stream_is_set (
        ) const;
        /*!
            ensures
                - returns true if a stream has been associated with *this by calling
                  set_stream()
        !*/

        std::istream& get_stream (
        ) const;
        /*!
            requires
                - stream_is_set() == true
            ensures
                - returns a reference to the istream object that *this is reading 
                  from.
        !*/

        void get_token (
            int& type,
            std::string& token
        );
        /*!
            requires
                - stream_is_set() == true
            ensures
                - #token == the next token from the input stream get_stream()
                - #type == the type of the token in #token
            throws
                - bad_alloc
                    If this exception is thrown then the call to this function will 
                    have no effect on *this but the values of #type and #token will be 
                    undefined.  Additionally, some characters may have been read
                    from the stream get_stream() and lost.
        !*/

        int peek_type (
        ) const;
        /*!
            requires
                - stream_is_set() == true
            ensures
                - returns the type of the token that will be returned from
                  the next call to get_token()
            throws
                - bad_alloc
                    If this exception is thrown then the call to this function will 
                    have no effect on *this.  However, some characters may have been 
                    read from the stream get_stream() and lost.
        !*/

        const std::string& peek_token (
        ) const;
        /*!
            requires
                - stream_is_set() == true
            ensures
                - returns the text of the token that will be returned from
                  the next call to get_token()
            throws
                - bad_alloc
                    If this exception is thrown then the call to this function will 
                    have no effect on *this.  However, some characters may have been 
                    read from the stream get_stream() and lost.
        !*/

        void swap (
            cpp_tokenizer& item
        );
        /*!
            ensures
                - swaps *this and item
        !*/ 

    private:

        // restricted functions
        cpp_tokenizer(const cpp_tokenizer&);        // copy constructor
        cpp_tokenizer& operator=(const cpp_tokenizer&);    // assignment operator

    };    

    inline void swap (
        cpp_tokenizer& a, 
        cpp_tokenizer& b 
    ) { a.swap(b); }   
    /*!
        provides a global swap function
    !*/

}

#endif // DLIB_CPP_TOKENIZER_KERNEl_ABSTRACT_

