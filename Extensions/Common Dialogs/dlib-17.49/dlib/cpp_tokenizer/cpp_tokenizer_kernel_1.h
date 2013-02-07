// Copyright (C) 2005  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_CPP_TOKENIZER_KERNEl_1_
#define DLIB_CPP_TOKENIZER_KERNEl_1_

#include <string>
#include <iostream>
#include "cpp_tokenizer_kernel_abstract.h"
#include "../algs.h"

namespace dlib
{

    namespace cpp_tok_kernel_1_helper
    {
        struct token_text_pair
        {
            std::string token;
            int type;
        };        

    }

    template <
        typename tok,
        typename queue,
        typename set
        >
    class cpp_tokenizer_kernel_1 
    {
        /*!
            REQUIREMENTS ON tok
                tok must be an implementation of tokenizer/tokenizer_kernel_abstract.h

            REQUIREMENTS ON queue
                queue must be an implementation of queue/queue_kernel_abstract.h
                and must have T==cpp_tok_kernel_1_helper::token_text_pair

            REQUIREMENTS ON set
                set must be an implemention of set/set_kernel_abstract.h or
                hash_set/hash_set_kernel_abstract.h and must have T==std::string.

            INITIAL VALUE
                - keywords == a set of all the C++ keywords
                - tokenizer.stream_is_set() == false
                - buffer.size() == 0
                - tokenizer.get_identifier_head() == "$_" + tokenizer.lowercase_letters() + 
                  tokenizer.uppercase_letters()
                - tokenizer.get_identifier_body() == "$_" + tokenizer.lowercase_letters() + 
                  tokenizer.uppercase_letters() + tokenizer.numbers()
                - have_peeked == false


            CONVENTION                  
                - tokenizer.stream_is_set() == stream_is_set()
                - tokenizer.get_stream() == get_stream()
                - keywords == a set of all the C++ keywords

                - tokenizer.get_identifier_head() == "$_" + tokenizer.lowercase_letters() + 
                  tokenizer.uppercase_letters()
                - tokenizer.get_identifier_body() == "$_" + tokenizer.lowercase_letters() + 
                  tokenizer.uppercase_letters() + tokenizer.numbers()

                - buffer == a queue of tokens.  This is where we put tokens 
                  we gathered early due to looking ahead.


                - if (have_peeked) then
                    - next_token == the next token to be returned from get_token()
                    - next_type == the type of token in peek_token
      !*/

        typedef cpp_tok_kernel_1_helper::token_text_pair token_text_pair;

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

        cpp_tokenizer_kernel_1 (        
        );

        virtual ~cpp_tokenizer_kernel_1 (
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

        int peek_type (
        ) const;

        const std::string& peek_token (
        ) const;

        void swap (
            cpp_tokenizer_kernel_1<tok,queue,set>& item
        );

    private:

        void buffer_token(
            int type,
            const std::string& token
        )
        /*!
            ensures
                - stores the token and its type into buffer
        !*/
        {
            token_text_pair temp;
            temp.token = token;
            temp.type = type;
            buffer.enqueue(temp);
        }

        void buffer_token(
            int type,
            char token
        )
        /*!
            ensures
                - stores the token and its type into buffer
        !*/
        {
            token_text_pair temp;
            temp.token = token;
            temp.type = type;
            buffer.enqueue(temp);
        }

        // restricted functions
        cpp_tokenizer_kernel_1(const cpp_tokenizer_kernel_1<tok,queue,set>&);        // copy constructor
        cpp_tokenizer_kernel_1<tok,queue,set>& operator=(const cpp_tokenizer_kernel_1<tok,queue,set>&);    // assignment operator

        // data members
        set keywords;
        queue buffer;
        tok tokenizer;

        mutable std::string next_token;
        mutable int next_type;
        mutable bool have_peeked;


    };    

    template <
        typename tok,
        typename queue,
        typename set
        >
    inline void swap (
        cpp_tokenizer_kernel_1<tok,queue,set>& a, 
        cpp_tokenizer_kernel_1<tok,queue,set>& b 
    ) { a.swap(b); }   

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename tok,
        typename queue,
        typename set
        >
    cpp_tokenizer_kernel_1<tok,queue,set>::
    cpp_tokenizer_kernel_1(        
    ) :
        have_peeked(false)
    {
        // add C++ keywords to keywords
        std::string temp;
        temp = "#include";              keywords.add(temp);
        temp = "__asm";                 keywords.add(temp);
        temp = "_asm";                  keywords.add(temp);        
        temp = "if";                    keywords.add(temp);
        temp = "int";                   keywords.add(temp);
        temp = "else";                  keywords.add(temp);
        temp = "template";              keywords.add(temp);
        temp = "void";                  keywords.add(temp);
        temp = "false";                 keywords.add(temp);
        temp = "class";                 keywords.add(temp);
        temp = "public";                keywords.add(temp);
        temp = "while";                 keywords.add(temp);
        temp = "bool";                  keywords.add(temp);
        temp = "new";                   keywords.add(temp);
        temp = "delete";                keywords.add(temp);
        temp = "true";                  keywords.add(temp);
        temp = "typedef";               keywords.add(temp);
        temp = "const";                 keywords.add(temp);
        temp = "virtual";               keywords.add(temp);
        temp = "inline";                keywords.add(temp);
        temp = "for";                   keywords.add(temp);
        temp = "break";                 keywords.add(temp);
        temp = "struct";                keywords.add(temp);
        temp = "float";                 keywords.add(temp);
        temp = "case";                  keywords.add(temp);
        temp = "enum";                  keywords.add(temp);
        temp = "this";                  keywords.add(temp);
        temp = "typeid";                keywords.add(temp);
        temp = "double";                keywords.add(temp);
        temp = "char";                  keywords.add(temp);
        temp = "typename";              keywords.add(temp);
        temp = "signed";                keywords.add(temp);
        temp = "friend";                keywords.add(temp);
        temp = "wint_t";                keywords.add(temp);
        temp = "default";               keywords.add(temp);
        temp = "asm";                   keywords.add(temp);
        temp = "reinterpret_cast";      keywords.add(temp);
        temp = "#define";               keywords.add(temp);
        temp = "do";                    keywords.add(temp);
        temp = "continue";              keywords.add(temp);
        temp = "auto";                  keywords.add(temp);
        temp = "unsigned";              keywords.add(temp);
        temp = "size_t";                keywords.add(temp);
        temp = "#undef";                keywords.add(temp);
        temp = "#pragma";               keywords.add(temp);
        temp = "namespace";             keywords.add(temp);
        temp = "private";               keywords.add(temp);
        temp = "#endif";                keywords.add(temp);
        temp = "catch";                 keywords.add(temp);
        temp = "#else";                 keywords.add(temp);
        temp = "register";              keywords.add(temp);
        temp = "volatile";              keywords.add(temp);
        temp = "const_cast";            keywords.add(temp);
        temp = "#end";                  keywords.add(temp);
        temp = "mutable";               keywords.add(temp);
        temp = "static_cast";           keywords.add(temp);
        temp = "wchar_t";               keywords.add(temp);
        temp = "#if";                   keywords.add(temp);
        temp = "protected";             keywords.add(temp);
        temp = "throw";                 keywords.add(temp);
        temp = "using";                 keywords.add(temp);
        temp = "dynamic_cast";          keywords.add(temp);
        temp = "#ifdef";                keywords.add(temp);
        temp = "return";                keywords.add(temp);
        temp = "short";                 keywords.add(temp);
        temp = "#error";                keywords.add(temp);
        temp = "#line";                 keywords.add(temp);
        temp = "explicit";              keywords.add(temp);
        temp = "union";                 keywords.add(temp);
        temp = "#ifndef";               keywords.add(temp);
        temp = "try";                   keywords.add(temp);
        temp = "sizeof";                keywords.add(temp);
        temp = "goto";                  keywords.add(temp);
        temp = "long";                  keywords.add(temp);
        temp = "#elif";                 keywords.add(temp);
        temp = "static";                keywords.add(temp);
        temp = "operator";              keywords.add(temp);  
        temp = "switch";                keywords.add(temp);
        temp = "extern";                keywords.add(temp);


        // set the tokenizer's IDENTIFIER token for C++ identifiers
        tokenizer.set_identifier_token(
            "$_" + tokenizer.lowercase_letters() + tokenizer.uppercase_letters(),
            "$_" + tokenizer.lowercase_letters() + tokenizer.uppercase_letters() + 
            tokenizer.numbers()
            );
    }

// ----------------------------------------------------------------------------------------

    template <
        typename tok,
        typename queue,
        typename set
        >
    cpp_tokenizer_kernel_1<tok,queue,set>::
    ~cpp_tokenizer_kernel_1 (
    )
    {
    }

// ----------------------------------------------------------------------------------------

    template <
        typename tok,
        typename queue,
        typename set
        >
    void cpp_tokenizer_kernel_1<tok,queue,set>::
    clear(
    )
    {
        tokenizer.clear();
        buffer.clear();
        have_peeked = false;

        // set the tokenizer's IDENTIFIER token for C++ identifiers
        tokenizer.set_identifier_token(
            "$_" + tokenizer.lowercase_letters() + tokenizer.uppercase_letters(),
            "$_" + tokenizer.lowercase_letters() + tokenizer.uppercase_letters() + 
            tokenizer.numbers()
            );
    }

// ----------------------------------------------------------------------------------------

    template <
        typename tok,
        typename queue,
        typename set
        >
    void cpp_tokenizer_kernel_1<tok,queue,set>::
    set_stream (
        std::istream& in
    )
    {
        tokenizer.set_stream(in);
        buffer.clear();
        have_peeked = false;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename tok,
        typename queue,
        typename set
        >
    bool cpp_tokenizer_kernel_1<tok,queue,set>::
    stream_is_set (
    ) const
    {
        return tokenizer.stream_is_set();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename tok,
        typename queue,
        typename set
        >
    std::istream& cpp_tokenizer_kernel_1<tok,queue,set>::
    get_stream (
    ) const
    {
        return tokenizer.get_stream();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename tok,
        typename queue,
        typename set
        >
    void cpp_tokenizer_kernel_1<tok,queue,set>::
    get_token (
        int& type,
        std::string& token
    )
    {
        using namespace std;

        if (!have_peeked)
        {

            if (buffer.size() > 0)
            {
                // just return what is in the buffer
                token_text_pair temp;
                buffer.dequeue(temp);
                type = temp.type;
                token = temp.token;
                return;
            }

            tokenizer.get_token(type,token);

            switch (type)
            {
            case tok::END_OF_FILE:
                {
                    type = END_OF_FILE;
                } break;

            case tok::END_OF_LINE:
            case tok::WHITE_SPACE:
                {
                    type = tokenizer.peek_type();
                    if (type == tok::END_OF_LINE || type == tok::WHITE_SPACE)
                    {
                        std::string temp;
                        do
                        {
                            tokenizer.get_token(type,temp);
                            token += temp;
                            type = tokenizer.peek_type();
                        }while (type == tok::END_OF_LINE || type == tok::WHITE_SPACE);
                    }
                    type = WHITE_SPACE;

                } break;

            case tok::NUMBER:
                {
                    // this could be a hex number such as 0xa33.  we should check for this.
                    if (tokenizer.peek_type() == tok::IDENTIFIER && token == "0" && 
                        (tokenizer.peek_token()[0] == 'x' || tokenizer.peek_token()[0] == 'X'))
                    {
                        // this is a hex number so accumulate all the numbers and identifiers that follow
                        // because they have to be part of the number
                        std::string temp;
                        tokenizer.get_token(type,temp);
                        token = "0" + temp; 

                        // get the rest of the hex number
                        while (tokenizer.peek_type() == tok::IDENTIFIER ||
                               tokenizer.peek_type() == tok::NUMBER
                               )
                        {
                            tokenizer.get_token(type,temp);
                            token += temp;
                        }

                    }
                    // or this could be a floating point value or something with an 'e' or 'E' in it.
                    else if ((tokenizer.peek_type() == tok::CHAR && tokenizer.peek_token()[0] == '.') ||
                             (tokenizer.peek_type() == tok::IDENTIFIER && std::tolower(tokenizer.peek_token()[0]) == 'e'))
                    {
                        std::string temp;
                        tokenizer.get_token(type,temp);
                        token += temp;
                        // now get the rest of the floating point value
                        while (tokenizer.peek_type() == tok::IDENTIFIER ||
                               tokenizer.peek_type() == tok::NUMBER
                               )
                        {
                            tokenizer.get_token(type,temp);
                            token += temp;
                        }
                    }
                    type = NUMBER;

                } break;

            case tok::IDENTIFIER:
                {
                    if (keywords.is_member(token))
                    {
                        type = KEYWORD;
                    }
                    else
                    {
                        type = IDENTIFIER;
                    }
                } break;

            case tok::CHAR:            
                type = OTHER;
                switch (token[0])
                {
                case '#':
                    {
                        // this might be a preprocessor keyword so we should check the
                        // next token
                        if (tokenizer.peek_type() == tok::IDENTIFIER && 
                            keywords.is_member('#'+tokenizer.peek_token()))
                        {
                            tokenizer.get_token(type,token);
                            token = '#' + token;
                            type = KEYWORD;
                        }
                        else
                        {
                            token = '#';
                            type = OTHER;
                        }
                    }
                    break;

                case '"':
                    {
                        string temp;                    
                        tokenizer.get_token(type,token);
                        while (type != tok::END_OF_FILE)
                        {
                            // if this is the end of the quoted string
                            if (type == tok::CHAR && token[0] == '"' &&
                                (temp.size() == 0 || temp[temp.size()-1] != '\\' ||
                                (temp.size() > 1 && temp[temp.size()-2] == '\\') ))
                            {
                                buffer_token(DOUBLE_QUOTED_TEXT,temp);                         
                                buffer_token(OTHER,"\"");
                                break;
                            }
                            else
                            {
                                temp += token;
                            }
                            tokenizer.get_token(type,token);
                        }


                        type = OTHER;
                        token = '"';
                    } break;

                case '\'':
                    {
                        string temp;                    
                        tokenizer.get_token(type,token);
                        if (type == tok::CHAR && token[0] == '\\')
                        {
                            temp += '\\';
                            tokenizer.get_token(type,token);
                        }
                        temp += token;
                        buffer_token(SINGLE_QUOTED_TEXT,temp);

                        // The next character should be a ' so take it out and put it in
                        // the buffer.
                        tokenizer.get_token(type,token);
                        buffer_token(OTHER,token);

                        type = OTHER;
                        token = '\'';
                    } break;

                case '/':
                    {                
                        // look ahead to see if this is the start of a comment
                        if (tokenizer.peek_type() == tok::CHAR)
                        {
                            if (tokenizer.peek_token()[0] == '/')
                            {
                                tokenizer.get_token(type,token);
                                // this is the start of a line comment
                                token = "//";
                                string temp;                    
                                tokenizer.get_token(type,temp);
                                while (type != tok::END_OF_FILE)
                                {
                                    // if this is the end of the comment
                                    if (type == tok::END_OF_LINE && 
                                        token[token.size()-1] != '\\' )
                                    {
                                        token += '\n';
                                        break;
                                    }
                                    else
                                    {
                                        token += temp;
                                    }
                                    tokenizer.get_token(type,temp);
                                }
                                type = COMMENT;

                            }
                            else if (tokenizer.peek_token()[0] == '*')
                            {
                                tokenizer.get_token(type,token);
                                // this is the start of a block comment
                                token = "/*";
                                string temp;                    
                                tokenizer.get_token(type,temp);
                                while (type != tok::END_OF_FILE)
                                {
                                    // if this is the end of the comment
                                    if (type == tok::CHAR && temp[0] == '/' &&
                                        token[token.size()-1] == '*')
                                    {
                                        token += '/';
                                        break;
                                    }
                                    else
                                    {
                                        token += temp;
                                    }
                                    tokenizer.get_token(type,temp);
                                }  
                                type = COMMENT;                       
                            }
                        }
                    } break;

                default:
                    break;
                } // switch (token[0])
            } // switch (type)
        }
        else
        {
            // if we get this far it means we have peeked so we should 
            // return the peek data.
            type = next_type;
            token = next_token;
            have_peeked = false;
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename tok,
        typename queue,
        typename set
        >
    int cpp_tokenizer_kernel_1<tok,queue,set>::
    peek_type (
    ) const
    {
        const_cast<cpp_tokenizer_kernel_1<tok,queue,set>*>(this)->get_token(next_type,next_token);
        have_peeked = true;
        return next_type;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename tok,
        typename queue,
        typename set
        >
    const std::string& cpp_tokenizer_kernel_1<tok,queue,set>::
    peek_token (
    ) const
    {
        const_cast<cpp_tokenizer_kernel_1<tok,queue,set>*>(this)->get_token(next_type,next_token);
        have_peeked = true;
        return next_token;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename tok,
        typename queue,
        typename set
        >
    void cpp_tokenizer_kernel_1<tok,queue,set>::
    swap (
        cpp_tokenizer_kernel_1& item
    )
    {
        tokenizer.swap(item.tokenizer);
        buffer.swap(item.buffer);
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_CPP_TOKENIZER_KERNEl_1_

