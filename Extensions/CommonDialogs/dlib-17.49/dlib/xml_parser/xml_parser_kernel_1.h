// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_XML_PARSER_KERNEl_1_
#define DLIB_XML_PARSER_KERNEl_1_

#include <string>
#include <iostream>
#include "xml_parser_kernel_interfaces.h"
#include "xml_parser_kernel_abstract.h"
#include "../algs.h"
#include <cstdio>

namespace dlib
{

    template <
        typename map,
        typename stack,
        typename seq_dh,
        typename seq_eh
        >
    class xml_parser_kernel_1
    {

         /*!                
            REQUIREMENTS ON map
                is an implementation of map/map_kernel_abstract.h or
                is an implementation of hash_map/hash_map_kernel_abstract.h and
                is instantiated to map items of type std::string to std::string

            REQUIREMENTS ON stack
                is an implementation of stack/stack_kernel_abstract.h and
                is instantiated with std::string

            REQUIREMENTS ON seq_dh
                is an implementation of sequence/sequence_kernel_abstract.h and
                is instantiated with document_handler*

            REQUIREMENTS ON seq_eh
                is an implementation of sequence/sequence_kernel_abstract.h and
                is instantiated with error_handler*




            INITIAL VALUE
                dh_list.size() == 0
                eh_list.size() == 0

            CONVENTION
                dh_list == a sequence of pointers to all the document_handlers that
                           have been added to the xml_parser
                eh_list == a sequence of pointers to all the error_handlers that
                           have been added to the xml_parser

                use of template parameters:
                    map is used to implement the attribute_list interface
                    stack is used just inside the parse function
                    seq_dh is used to make the dh_list member variable
                    seq_eh is used to make the eh_list member variable
        !*/


       
        public:


            xml_parser_kernel_1(
            );

            virtual ~xml_parser_kernel_1(
            ); 

            void clear(
            );

            void parse (
                std::istream& in
            );
  
            void add_document_handler (
                document_handler& item
            );

            void add_error_handler (
                error_handler& item
            );


            void swap (
                xml_parser_kernel_1<map,stack,seq_dh,seq_eh>& item
            );
   

        private:
    
            // -----------------------------------

            // attribute_list interface implementation
            class attrib_list : public attribute_list
            {
            public:
                // the list of attribute name/value pairs
                map list;

                bool is_in_list (
                    const std::string& key
                ) const
                {
                    return list.is_in_domain(key);
                }

                const std::string& operator[] (
                    const std::string& key
                ) const
                {
                    return list[key];
                }

                bool at_start (
                ) const { return list.at_start(); }

                void reset (
                ) const { return list.reset(); }

                bool current_element_valid (
                ) const { return list.current_element_valid(); }

                const type& element (
                ) const { return list.element(); }

                type& element (
                ) { return list.element(); }

                bool move_next (
                ) const { return list.move_next(); }

                unsigned long size (
                ) const { return list.size(); }
            };

            
            // -----------------------------------

            enum token_type
            {
                element_start, // the first tag of an element
                element_end,   // the last tag of an element
                empty_element, // the singular tag of an empty element
                pi,            // processing instruction
                chars,         // the non-markup data between tags
                chars_cdata,   // the data from a CDATA section
                eof,           // this token is returned when we reach the end of input
                error,         // this token indicates that the tokenizer couldn't
                               // determine which category the next token fits into
                dtd,           // this token is for an entire dtd 
                comment        // this is a token for comments
            };
            /*
                notes about the tokens:
                    the tokenizer guarantees that the following tokens to not 
                    contain the '<' character except as the first character of the token
                    element_start, element_end, empty_element, and pi.  they also only
                    contain the '>' characer as their last character.

                    it is also guaranteed that pi is at least of the form <??>.  that
                    is to say that it always always begins with <? and ends with ?>.

                    it is also guaranteed that all markup tokens will begin with the '<'
                    character and end with the '>'. there won't be any leading or
                    trailing whitespaces.   this whitespace is considered a chars token.
            */


            // private member functions
            void get_next_token(
                std::istream& in,
                std::string& token_text,
                int& token_kind,
                unsigned long& line_number
            );
            /*!
                ensures
                    gets the next token from in and puts it in token_text and
                    token_kind == the kind of the token found and
                    line_number is incremented every time a '\n' is encountered and
                    entity references are translated into the characters they represent
                    only for chars tokens
            !*/

            int parse_element (
                const std::string& token,
                std::string& name,
                attrib_list& atts
            );
            /*!
                requires
                    token is a token of kind start_element or empty_element
                ensures
                    gets the element name and puts it into the string name and
                    parses out the attributes and puts them into the attribute_list atts

                    return 0 upon success or
                    returns -1 if it failed to parse token
            !*/

            int parse_pi (
                const std::string& token,
                std::string& target,
                std::string& data
            );
            /*!
                requires
                    token is a token of kind pi
                ensures
                    the target from the processing instruction is put into target and
                    the data from the processing instruction is put into data

                    return 0 upon success or
                    returns -1 if it failed to parse token
            !*/

            int parse_element_end (
                const std::string& token,
                std::string& name
            );
            /*!
                requires
                    token is a token of kind element_end
                ensures
                    the name from the ending element tag is put into the string name
                    
                    return 0 upon success or
                    returns -1 if it failed to parse token
            !*/

            inline int change_entity (
                std::istream& in
            );
            /*!
                ensures
                    performs the following translations and returns the new character
                                amp;   -> &
                                lt;    -> <
                                gt;    -> >
                                apos;  -> '
                                quot;  -> "

                    or returns -1 if we hit an undefined entity reference or EOF. 
                            (i.e. it was not one of the entities listed above)

            !*/

            // -----------------------------------

            // private member data
            seq_dh dh_list;
            seq_eh eh_list;

            // -----------------------------------

            // restricted functions: assignment and copy construction
            xml_parser_kernel_1(xml_parser_kernel_1<map,stack,seq_dh,seq_eh>&);   
            xml_parser_kernel_1<map,stack,seq_dh,seq_eh>& operator= (
                        xml_parser_kernel_1<map,stack,seq_dh,seq_eh>&
                        );  

    };

    template <
        typename map,
        typename stack,
        typename seq_dh,
        typename seq_eh
        >
    inline void swap (
        xml_parser_kernel_1<map,stack,seq_dh,seq_eh>& a, 
        xml_parser_kernel_1<map,stack,seq_dh,seq_eh>& b 
    ) { a.swap(b); }   


// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
 
    template <
        typename map,
        typename stack,
        typename seq_dh,
        typename seq_eh
        >
    xml_parser_kernel_1<map,stack,seq_dh,seq_eh>::
    xml_parser_kernel_1(
    )
    {
    }

// ----------------------------------------------------------------------------------------
    
    template <
        typename map,
        typename stack,
        typename seq_dh,
        typename seq_eh
        >
    xml_parser_kernel_1<map,stack,seq_dh,seq_eh>::
    ~xml_parser_kernel_1(
    )
    {
    }

// ----------------------------------------------------------------------------------------
    
    template <
        typename map,
        typename stack,
        typename seq_dh,
        typename seq_eh
        >
    void xml_parser_kernel_1<map,stack,seq_dh,seq_eh>::
    clear(
    )
    {
        // unregister all event handlers
        eh_list.clear();
        dh_list.clear();
    }

// ----------------------------------------------------------------------------------------
        
    template <
        typename map,
        typename stack,
        typename seq_dh,
        typename seq_eh
        >
    void xml_parser_kernel_1<map,stack,seq_dh,seq_eh>::
    parse (
        std::istream& in
    )
    {

        // save which exceptions in will throw and make it so it won't throw any
        // for the life of this function
        std::ios::iostate old_exceptions = in.exceptions();
        // set it to not throw anything
        in.exceptions(std::ios::goodbit);


        try 
        {
            unsigned long line_number = 1;

            // skip any whitespace before the start of the document
            while (in.peek() == ' ' || in.peek() == '\t' || in.peek() == '\n' || in.peek() == '\r' ) 
            {
                if (in.peek() == '\n')
                    ++line_number;
                in.get();
            }



            stack tags; // this stack contains the last start tag seen
            bool seen_fatal_error = false;
            bool seen_root_tag = false;  // this is true after we have seen the root tag
            


            // notify all the document_handlers that we are about to being parsing
            for (unsigned long i = 0; i < dh_list.size(); ++i)
            {
                dh_list[i]->start_document();
            }


            std::string chars_buf; // used to collect chars data between consecutive
                                // chars and chars_cdata tokens so that 
                                // document_handlers receive all chars data between
                                // tags in one call

            // variables to be used with the parsing functions
            attrib_list atts;
            std::string name;
            std::string target;
            std::string data;

            

            // variables to use with the get_next_token() function
            std::string token_text;
            int token_kind;

            get_next_token(in,token_text,token_kind,line_number);


            while (token_kind != eof)
            {          
                bool is_empty = false;  // this becomes true when this token is an empty_element

                switch (token_kind)
                {


                case empty_element: is_empty = true;
                case element_start:
                    {
                        seen_root_tag = true;

                        int status = parse_element(token_text,name,atts);
                        // if there was no error parsing the element
                        if (status == 0)
                        {
                            // notify all the document_handlers
                            for (unsigned long i = 0; i < dh_list.size(); ++i)
                            {
                                dh_list[i]->start_element(line_number,name,atts);
                                if (is_empty)
                                    dh_list[i]->end_element(line_number,name);
                            }
                        }
                        else
                        {
                            seen_fatal_error = true;
                        }

                        // if this is an element_start token then push the name of
                        // the element on to the stack
                        if (token_kind == element_start)
                        {
                            tags.push(name);
                        }

                    }break;

                // ----------------------------------------

                case element_end:
                    {

                        int status = parse_element_end (token_text,name);

                        // if there was no error parsing the element
                        if (status == 0)
                        {
                            // make sure this ending element tag matches the last start
                            // element tag we saw
                            if ( tags.size() == 0 || name != tags.current())
                            {
                                // they don't match so signal a fatal error
                                seen_fatal_error = true;
                            }
                            else
                            {
                                // notify all the document_handlers
                                for (unsigned long i = 0; i < dh_list.size(); ++i)
                                {
                                    dh_list[i]->end_element(line_number,name);
                                }

                                // they match so throw away this element name
                                tags.pop(name);
                            }
                        }
                        else
                        {
                            seen_fatal_error = true;
                        }


                    }break;

                // ----------------------------------------

                case pi:
                    {

                        int status = parse_pi (token_text,target,data);
                        // if there was no error parsing the element
                        if (status == 0)
                        {
                            // notify all the document_handlers
                            for (unsigned long i = 0; i < dh_list.size(); ++i)
                            {
                                dh_list[i]->processing_instruction(line_number,target,data);
                            }
                        }
                        else
                        {
                            // notify all the error_handlers
                            for (unsigned long i = 0; i < eh_list.size(); ++i)
                            {
                                eh_list[i]->error(line_number);
                            }
                        }
                        while (in.peek() == ' ' || in.peek() == '\t' || in.peek() == '\n' || in.peek() == '\r' ) 
                        {
                            if (in.peek() == '\n')
                                ++line_number;
                            in.get();
                        }


                    }break;

                // ----------------------------------------

                case chars:
                    {
                        if (tags.size() != 0)
                        {
                            chars_buf += token_text;
                        }
                        else if (token_text.find_first_not_of(" \t\r\n") != std::string::npos)
                        {
                            // you can't have non whitespace chars data outside the root element
                            seen_fatal_error = true;                        
                        }
                    }break;

                // ----------------------------------------

                case chars_cdata:
                    {
                        if (tags.size() != 0)
                        {
                            chars_buf += token_text;
                        }
                        else
                        {
                            // you can't have chars_data outside the root element
                            seen_fatal_error = true;
                        }
                    }break;

                // ----------------------------------------

                case eof:
                    break;

                // ----------------------------------------

                case error:
                    {
                        seen_fatal_error = true;
                    }break;

                // ----------------------------------------

                case dtd:       // fall though
                case comment:   // do nothing
                    break;

                // ----------------------------------------


                }

                // if there was a fatal error then quit loop
                if (seen_fatal_error)
                    break;

                // if we have seen the last tag then quit the loop
                if (tags.size() == 0 && seen_root_tag)
                    break;
                

                get_next_token(in,token_text,token_kind,line_number);

                // if the next token is not a chars or chars_cdata token then flush
                // the chars_buf to the document_handlers
                if ( (token_kind != chars) && 
                    (token_kind != chars_cdata) &&
                    (token_kind != dtd) && 
                    (token_kind != comment) &&
                    (chars_buf.size() != 0)
                    )
                {
                    // notify all the document_handlers
                    for (unsigned long i = 0; i < dh_list.size(); ++i)
                    {
                        dh_list[i]->characters(chars_buf);
                    }
                    chars_buf.erase();
                }


            } //while (token_kind != eof)




            // you can't have any unmatched tags or any fatal erros
            if (tags.size() != 0 || seen_fatal_error)
            {
                // notify all the error_handlers
                for (unsigned long i = 0; i < eh_list.size(); ++i)
                {
                    eh_list[i]->fatal_error(line_number);
                }
                
            }


            // notify all the document_handlers that we have ended parsing
            for (unsigned long i = 0; i < dh_list.size(); ++i)
            {
                dh_list[i]->end_document();
            }
        
        }
        catch (...)
        {
            // notify all the document_handlers that we have ended parsing
            for (unsigned long i = 0; i < dh_list.size(); ++i)
            {
                dh_list[i]->end_document();
            }

            // restore the old exception settings to in
            in.exceptions(old_exceptions);

            // don't forget to rethrow the exception
            throw;
        }

        // restore the old exception settings to in
        in.exceptions(old_exceptions);

    }

// ----------------------------------------------------------------------------------------
        
    template <
        typename map,
        typename stack,
        typename seq_dh,
        typename seq_eh
        >
    void xml_parser_kernel_1<map,stack,seq_dh,seq_eh>::
    add_document_handler (
        document_handler& item
    )
    {
        document_handler* temp = &item;
        dh_list.add(dh_list.size(),temp);
    }

// ----------------------------------------------------------------------------------------
        
    template <
        typename map,
        typename stack,
        typename seq_dh,
        typename seq_eh
        >
    void xml_parser_kernel_1<map,stack,seq_dh,seq_eh>::
    add_error_handler (
        error_handler& item
    )
    {
        error_handler* temp = &item;
        eh_list.add(eh_list.size(),temp);
    }

// ----------------------------------------------------------------------------------------
        
    template <
        typename map,
        typename stack,
        typename seq_dh,
        typename seq_eh
        >
    void xml_parser_kernel_1<map,stack,seq_dh,seq_eh>::
    swap (
        xml_parser_kernel_1<map,stack,seq_dh,seq_eh>& item
    )
    {
        dh_list.swap(item.dh_list);
        eh_list.swap(item.eh_list);
    }
   
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // private member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
        
    template <
        typename map,
        typename stack,
        typename seq_dh,
        typename seq_eh
        >
    void xml_parser_kernel_1<map,stack,seq_dh,seq_eh>::
    get_next_token(
        std::istream& in,
        std::string& token_text,
        int& token_kind,
        unsigned long& line_number
    )
    {

        token_text.erase();

        std::istream::int_type ch1 = in.get();
        std::istream::int_type ch2;


        switch (ch1)
        {

        // -----------------------------------------

            // this is the start of some kind of a tag
        case '<':
            {
                ch2 = in.get();
                switch (ch2)
                {
                
                // ---------------------------------

                    // this is a dtd, comment, or chars_cdata token 
                case '!':
                    {
                        // if this is a CDATA section *******************************
                        if ( in.peek() == '[')
                        {
                            token_kind = chars_cdata;

                            // throw away the '['
                            in.get();

                            // make sure the next chars are CDATA[
                            std::istream::int_type ch = in.get();
                            if (ch != 'C')                                
                                token_kind = error;
                            ch = in.get();
                            if (ch != 'D')
                                token_kind = error;
                            ch = in.get();
                            if (ch != 'A')
                                token_kind = error;
                            ch = in.get();
                            if (ch != 'T')
                                token_kind = error;
                            ch = in.get();
                            if (ch != 'A')
                                token_kind = error;
                            ch = in.get();
                            if (ch != '[')
                                token_kind = error;
                            // if this is an error token then end
                            if (token_kind == error)
                                break;


                            // get the rest of the chars and put them into token_text
                            int brackets_seen = 0; // this is the number of ']' chars
                                                   // we have seen in a row
                            bool seen_closing = false; // true if we have seen ]]>
                            do
                            {
                                ch = in.get();

                                if (ch == '\n')
                                    ++line_number;

                                token_text += ch;

                                // if this is the closing 
                                if (brackets_seen == 2 && ch == '>')
                                    seen_closing = true;
                                // if we are seeing a bracket
                                else if (ch == ']')
                                    ++brackets_seen;
                                // if we didn't see a bracket
                                else
                                    brackets_seen = 0;


                            } while ( (!seen_closing) && (ch != EOF) );

                            // check if this is an error token
                            if (ch == EOF)
                            {
                                token_kind = error;
                            }
                            else
                            {
                                token_text.erase(token_text.size()-3);
                            }

                            

                        }
                        // this is a comment token ****************************
                        else if (in.peek() == '-')
                        {

                            token_text += ch1;
                            token_text += ch2;
                            token_text += '-';

                            token_kind = comment;

                            // throw away the '-' char
                            in.get();

                            // make sure the next char is another '-'
                            std::istream::int_type ch = in.get();
                            if (ch != '-')
                            {
                                token_kind = error;
                                break;
                            }

                            token_text += '-';


                            // get the rest of the chars and put them into token_text
                            int hyphens_seen = 0; // this is the number of '-' chars
                                                   // we have seen in a row
                            bool seen_closing = false; // true if we have seen ]]>
                            do
                            {
                                ch = in.get();

                                if (ch == '\n')
                                    ++line_number;

                                token_text += ch;

                                // if this should be a closing block
                                if (hyphens_seen == 2)
                                {
                                    if (ch == '>')
                                        seen_closing = true;
                                    else // this isn't a closing so make it signal error
                                        ch = EOF;
                                }
                                // if we are seeing a hyphen
                                else if (ch == '-')
                                    ++hyphens_seen;
                                // if we didn't see a hyphen
                                else
                                    hyphens_seen = 0;


                            } while ( (!seen_closing) && (ch != EOF) );

                            // check if this is an error token
                            if (ch == EOF)
                            {
                                token_kind = error;
                            }





                        }
                        else // this is a dtd token *************************
                        {

                            token_text += ch1;
                            token_text += ch2;
                            int bracket_depth = 1;  // this is the number of '<' chars seen 
                                                    // minus the number of '>' chars seen

                            std::istream::int_type ch;
                            do
                            {
                                ch = in.get();
                                if (ch == '>')
                                    --bracket_depth;
                                else if (ch == '<')
                                    ++bracket_depth;
                                else if (ch == '\n')
                                    ++line_number;

                                token_text += ch;
                                
                            } while ( (bracket_depth > 0) && (ch != EOF) );

                            // make sure we didn't just hit EOF
                            if (bracket_depth == 0)
                            {
                                token_kind = dtd;
                            }
                            else
                            {
                                token_kind = error;
                            }
                        }
                    }
                    break;

                // ---------------------------------

                    // this is a pi token 
                case '?':
                    {
                        token_text += ch1;
                        token_text += ch2;
                        std::istream::int_type ch;
                        
                        do
                        {
                            ch = in.get();
                            token_text += ch;
                            if (ch == '\n')
                                ++line_number;
                            // else if we hit a < then thats an error
                            else if (ch == '<')
                                ch = EOF;
                        } while (ch != '>' && ch != EOF);
                        // if we hit the end of the pi
                        if (ch == '>')
                        {
                            // make sure there was a trailing '?'
                            if ( (token_text.size() > 3) && 
                                (token_text[token_text.size()-2] != '?') 
                                )
                            {
                                token_kind = error;
                            }
                            else
                            {
                                token_kind = pi;
                            }
                        }
                        // if we hit EOF unexpectidely then error
                        else
                        {
                            token_kind = error;
                        }
                    }
                    break;

                // ---------------------------------

                    // this is an error token
                case EOF:
                    {
                        token_kind = error;
                    }
                    break;

                // ---------------------------------
                    // this is an element_end token
                case '/':
                    {
                        token_kind = element_end;
                        token_text += ch1;
                        token_text += ch2;
                        std::istream::int_type ch;
                        do
                        {
                            ch = in.get();
                            if (ch == '\n')
                                ++line_number;
                            // else if we hit a < then thats an error
                            else if (ch == '<')
                                ch = EOF;
                            token_text += ch;                                
                        } while ( (ch != '>') && (ch != EOF));

                        // check if this is an error token
                        if (ch == EOF)
                        {
                            token_kind = error;
                        }
                    }
                    break;


                // ---------------------------------

                    // this is an element_start or empty_element token
                default:
                    {

                        token_text += ch1;
                        token_text += ch2;
                        std::istream::int_type ch = '\0';
                        std::istream::int_type last;
                        do
                        {
                            last = ch;
                            ch = in.get();
                            if (ch == '\n')
                                ++line_number;
                            // else if we hit a < then thats an error
                            else if (ch == '<')
                                ch = EOF;
                            token_text += ch;                                
                        } while ( (ch != '>') && (ch != EOF));

                        // check if this is an error token
                        if (ch == EOF)
                        {
                            token_kind = error;
                        }
                        // if this is an empty_element
                        else if (last == '/')
                        {
                            token_kind = empty_element;
                        }
                        else
                        {
                            token_kind = element_start;
                        }
                        
                
                    }
                    break;

                // ---------------------------------

                }

            }
            break;

        // -----------------------------------------

            // this is an eof token
        case EOF:
            {
                token_kind = eof;                
            }
            break;

        // -----------------------------------------

            // this is a chars token
        default:
            {
                if (ch1 == '\n')
                {
                    ++line_number;
                    token_text += ch1;
                }
                // if the first thing in this chars token is an entity reference
                else if (ch1 == '&')
                {
                    
                    int temp = change_entity(in);
                    if (temp == -1)
                    {
                        token_kind = error;
                        break;
                    }
                    else
                    {
                        token_text += temp;
                    }
                }
                else
                {
                    token_text += ch1;
                }
                

                token_kind = chars;
                
                std::istream::int_type ch = 0;
                while (in.peek() != '<' && in.peek() != EOF)
                {
                    ch = in.get();

                    if (ch == '\n')
                        ++line_number;

                    // if this is one of the predefined entity references then change it
                    if (ch == '&')
                    {
                        int temp = change_entity(in);
                        if (temp == -1)
                        {
                            ch = EOF;
                            break;
                        }
                        else
                            token_text += temp;
                    }
                    else
                    {
                        token_text += ch;
                    }
                }

                // if this is an error token
                if (ch == EOF)
                {
                    token_kind = error;
                }

            }
            break;

        // -----------------------------------------

        }
       

    }



// ----------------------------------------------------------------------------------------
        
    template <
        typename map,
        typename stack,
        typename seq_dh,
        typename seq_eh
        >
    int xml_parser_kernel_1<map,stack,seq_dh,seq_eh>::
    parse_element (
        const std::string& token,
        std::string& name,
        attrib_list& atts
    )
    {
        name.erase();
        atts.list.clear();
     
        // there must be at least one character between the <>
        if (token[1] == '>')
            return -1;

        std::string::size_type i;
        std::istream::int_type ch = token[1];
        i = 2;

        // fill out name.  the name can not contain any of the following characters
        while ( (ch != '>') && 
                (ch != ' ') && 
                (ch != '=') && 
                (ch != '/') && 
                (ch != '\t') && 
                (ch != '\r') &&
                (ch != '\n')
            )
        {
            name += ch;
            ch = token[i];
            ++i;
        }

        // skip any whitespaces
        while ( ch == ' ' || ch == '\t' || ch == '\n' || ch == '\r' )
        {
             ch = token[i];
             ++i;
        }

        // find any attributes
        while (ch != '>' && ch != '/')
        {
            std::string attribute_name;
            std::string attribute_value;

            // fill out attribute_name
            while ( (ch != '=') && 
                    (ch != ' ') && 
                    (ch != '\t') && 
                    (ch != '\r') &&
                    (ch != '\n') &&
                    (ch != '>')
                    )
            {
                attribute_name += ch;
                ch = token[i];
                ++i;
            }    

            // you can't have empty attribute names
            if (attribute_name.size() == 0)
                return -1;

            // if we hit > too early then return error
            if (ch == '>')
                return -1;

            // skip any whitespaces
            while (ch == ' ' || ch == '\t' || ch =='\n' || ch =='\r')
            {
                ch = token[i];
                ++i;
            }

            // the next char should be a '=', error if it's not
            if (ch != '=')
                return -1;

            // get the next char
            ch = token[i];  
            ++i;  

            // skip any whitespaces
            while (ch == ' ' || ch == '\t' || ch =='\n' || ch =='\r')
            {
                ch = token[i];
                ++i;
            }


            // get the delimiter for the attribute value
            std::istream::int_type delimiter = ch; // this should be either a ' or " character
            ch = token[i];  // get the next char
            ++i;            
            if (delimiter != '\'' && delimiter!='"')
                return -1;


            // fill out attribute_value
            while ( (ch != delimiter) &&
                    (ch != '>')
                    )
            {
                attribute_value += ch;
                ch = token[i];
                ++i;
            }  


            // if there was no delimiter then this is an error
            if (ch == '>')
            {
                return -1;
            }          

            // go to the next char
            ch = token[i];
            ++i;

            // the next char must be either a '>' or '/' (denoting the end of the tag)
            // or a white space character
            if (ch != '>' && ch != ' ' && ch != '/' && ch != '\t' && ch !='\n' && ch !='\r')
                return -1;

            // skip any whitespaces
            while (ch == ' ' || ch == '\t' || ch =='\n' || ch =='\r')
            {
                ch = token[i];
                ++i;
            }


            // add attribute_value and attribute_name to atts
            if (atts.list.is_in_domain(attribute_name))
            {
                // attributes may not be multiply defined
                return -1;
            }
            else
            {
                atts.list.add(attribute_name,attribute_value);
            }


        }

        // you can't have an element with no name
        if (name.size() == 0)
            return -1;

        return 0;

    }

// ----------------------------------------------------------------------------------------
        
    template <
        typename map,
        typename stack,
        typename seq_dh,
        typename seq_eh
        >
    int xml_parser_kernel_1<map,stack,seq_dh,seq_eh>::
    parse_pi (
        const std::string& token,
        std::string& target,
        std::string& data
    )
    {
        target.erase();
        data.erase();

        std::istream::int_type ch = token[2];
        std::string::size_type i = 3;
        while (ch != ' ' && ch != '?' && ch != '\t' && ch != '\n' && ch!='\r')
        {
            target += ch;
            ch = token[i];
            ++i;
        }
        if (target.size() == 0)
            return -1;

        // if we aren't at a ? character then go to the next character
        if (ch != '?' )
        {
            ch = token[i];
            ++i;
        }

        // if we still aren't at the end of the processing instruction then
        // set this stuff in the data section
        while (ch != '?')
        {
            data += ch;
            ch = token[i];
            ++i;
        }

        return 0;
    }

// ----------------------------------------------------------------------------------------
        
    template <
        typename map,
        typename stack,
        typename seq_dh,
        typename seq_eh
        >
    int xml_parser_kernel_1<map,stack,seq_dh,seq_eh>::
    parse_element_end (
        const std::string& token,
        std::string& name
    )
    {
        name.erase();
        std::string::size_type end = token.size()-1;
        for (std::string::size_type i = 2; i < end; ++i)
        {
            if (token[i] == ' ' || token[i] == '\t' || token[i] == '\n'|| token[i] == '\r')
                break;
            name += token[i];
        }

        if (name.size() == 0)
            return -1;

        return 0;
    }

// ----------------------------------------------------------------------------------------
        
    template <
        typename map,
        typename stack,
        typename seq_dh,
        typename seq_eh
        >
    int xml_parser_kernel_1<map,stack,seq_dh,seq_eh>::
    change_entity (
        std::istream& in
    )
    {
        
        std::istream::int_type buf[6];
   
        
        buf[1] = in.get();

        // if this is an undefined entity reference then return error
        if (buf[1] != 'a' && 
            buf[1] != 'l' &&
            buf[1] != 'g' &&
            buf[1] != 'q'
            )
            return -1;


        buf[2] = in.get();
        // if this is an undefined entity reference then return error
        if (buf[2] != 'm' && 
            buf[2] != 't' &&
            buf[2] != 'p' &&
            buf[2] != 'u'
            )
            return -1;


        buf[3] = in.get();
        // if this is an undefined entity reference then return error
        if (buf[3] != 'p' && 
            buf[3] != ';' &&
            buf[3] != 'o'
            )
            return -1;

        // check if this is &lt; or &gt;
        if  (buf[3] == ';')
        {
            if (buf[2] != 't')
                return -1;

            // if this is &lt; then return '<'
            if (buf[1] == 'l')
                return '<';
            // if this is &gt; then return '>'
            if (buf[1] == 'g')
                return '>';

            // it is neither so it must be an undefined entity reference
            return -1;
        }


        buf[4] = in.get();
        // if this should be &amp;
        if (buf[4] == ';')
        {
            // if this is not &amp; then return error
            if (buf[1] != 'a' ||
                buf[2] != 'm' || 
                buf[3] != 'p'
                )
                return -1;

            return '&';
        }

        buf[5] = in.get();

        // if this should be &apos;
        if (buf[1] == 'a' &&
            buf[2] == 'p' &&
            buf[3] == 'o' &&
            buf[4] == 's' &&
            buf[5] == ';'
            )
            return '\'';


        // if this should be &quot;
        if (buf[1] == 'q' &&
            buf[2] == 'u' &&
            buf[3] == 'o' &&
            buf[4] == 't' &&
            buf[5] == ';'
            )
            return '"';


        // it was an undefined entity reference
        return -1;

    }


// ----------------------------------------------------------------------------------------

}

#endif // DLIB_XML_PARSER_KERNEl_1_

