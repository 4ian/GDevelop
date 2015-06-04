// Copyright (C) 2005  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_TOKENIZER_KERNEl_ABSTRACT_
#ifdef DLIB_TOKENIZER_KERNEl_ABSTRACT_

#include <string>
#include <ioswfd>

namespace dlib
{

    class tokenizer 
    {
        /*!
            INITIAL VALUE
                stream_is_set() == false
                get_identifier_head() == "_" + lowercase_letters() + uppercase_letters()
                get_identifier_body() == "_" + lowercase_letters() + uppercase_letters() + 
                                         numbers()

            WHAT THIS OBJECT REPRESENTS
                This object represents a simple tokenizer for textual data.

            BUFFERING
                This object is allowed to buffer data from the input stream.
                Thus if you clear it or switch streams (via calling set_stream())
                any buffered data will be lost.

            TOKENS
                When picking out tokens the tokenizer will always extract the 
                longest token it can.  For example, if faced with the string 
                "555" it will consider the three 5s to be a single NUMBER 
                token not three smaller NUMBER tokens.

                Also note that no characters in the input stream are discarded.
                They will all be returned in the text of some token.  
                Additionally, each character will never be returned more than once.  
                This means that if you concatenated all returned tokens it would exactly
                reproduce the contents of the input stream.

                The tokens are defined as follows:

                END_OF_LINE
                    This is a single character token and is always the '\n' 
                    character.

                END_OF_FILE
                    This token represents the end of file.  It doesn't have any
                    actual characters associated with it.  

                IDENTIFIER
                    This is a multi-character token.  It is defined as a string that
                    begins with a character from get_identifier_head() and is 
                    followed by any number of characters from get_identifier_body().
                       
                NUMBER
                    This is a multi-character token.  It is defined as a sequence of
                    numbers. 

                WHITE_SPACE
                    This is a multi character token.  It is defined as a sequence of
                    one or more spaces, carrage returns, and tabs.  I.e. It is
                    composed of characters from the following string " \r\t".

                CHAR
                    This is a single character token.  It matches anything that isn't
                    part of one of the above tokens.                    
        !*/

    public:

        enum 
        {
            END_OF_LINE,
            END_OF_FILE,
            IDENTIFIER,
            CHAR,
            NUMBER,
            WHITE_SPACE
        };

        tokenizer (        
        );
        /*!
            ensures                
                - #*this is properly initialized
            throws
                - std::bad_alloc
        !*/

        virtual ~tokenizer (
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

        void set_identifier_token (
            const std::string& head,
            const std::string& body
        );
        /*!
            requires
                - head.find_first_of(" \r\t\n0123456789") == std::string::npos
                  (i.e. head doesn't contain any characters from the string
                  " \r\t\n0123456789").
                - body.find_frst_of(" \r\t\n") == std::string::npos
                  (i.e. body doesn't contain any characters from the string " \r\t\n").
            ensures
                - #get_identifier_head() == head
                - #get_identifier_body() == body
            throws
                - std::bad_alloc
                    If this exception is thrown then #*this is unusable 
                    until clear() is called and succeeds.
        !*/

        const std::string get_identifier_head (
        ) const;
        /*!
            ensures
                - returns a string containing the characters that can be the start
                  of an IDENTIFIER token.
            throws
                - std::bad_alloc
                    If this exception is thrown then the call to this function
                    has no effect.
        !*/

        const std::string get_identifier_body (
        ) const;
        /*!
            ensures
                - returns a string containing the characters that can appear in the
                  body of an IDENTIFIER token.
            throws
                - std::bad_alloc
                    If this exception is thrown then the call to this function
                    has no effect.
        !*/

        const std::string lowercase_letters (
        ) const;
        /*!
            ensures
                - returns "abcdefghijklmnopqrstuvwxyz"
            throws
                - std::bad_alloc
                    If this exception is thrown then the call to this function
                    has no effect.
        !*/

        const std::string uppercase_letters (
        ) const;
        /*!
            ensures
                - returns "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
            throws
                - std::bad_alloc
                    If this exception is thrown then the call to this function
                    has no effect.
        !*/

        const std::string numbers (
        ) const;
        /*!
            ensures
                - returns "0123456789"
            throws
                - std::bad_alloc
                    If this exception is thrown then the call to this function
                    has no effect.
        !*/

        void swap (
            tokenizer& item
        );
        /*!
            ensures
                - swaps *this and item
        !*/ 

    private:

        // restricted functions
        tokenizer(const tokenizer&);        // copy constructor
        tokenizer& operator=(const tokenizer&);    // assignment operator

    };    

    inline void swap (
        tokenizer& a, 
        tokenizer& b 
    ) { a.swap(b); }   
    /*!
        provides a global swap function
    !*/

}

#endif // DLIB_TOKENIZER_KERNEl_ABSTRACT_

