// Copyright (C) 2005  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_CPP_PRETTY_PRINTER_KERNEl_2_
#define DLIB_CPP_PRETTY_PRINTER_KERNEl_2_

#include <string>
#include <iostream>
#include <sstream>
#include "cpp_pretty_printer_kernel_abstract.h"
#include "../algs.h"

namespace dlib
{

    template <
        typename stack,
        typename tok
        >
    class cpp_pretty_printer_kernel_2 
    {
        /*!
            REQUIREMENTS ON stack
                must be an implementation of stack/stack_kernel_abstract.h and
                stack::type == unsigned long

            REQUIREMENTS ON tok
                must be an implementation of tokenizer/tokenizer_kernel_abstract.h

            INFO
                This implementation applies a black and white color scheme suitable 
                for printing on a black and white printer.  It also places the document 
                title prominently at the top of the pretty printed source file.
        !*/

    public:

        cpp_pretty_printer_kernel_2 (        
        );

        virtual ~cpp_pretty_printer_kernel_2 (
        );

        void print (
            std::istream& in,
            std::ostream& out,
            const std::string& title
        ) const;

        void print_and_number (
            std::istream& in,
            std::ostream& out,
            const std::string& title
        ) const;

    private:

        // data members
        mutable tok t;

        const std::string htmlify (
            const std::string& str
        ) const;
        /*!
            ensures
                - str == str but with any '<' replaced with '&lt;', any '>' replaced
                  with '&gt;', and any '&' replaced with '&amp;'
        !*/

        void number (
            std::istream& in,
            std::ostream& out
        ) const;
        /*!
            ensures
                - prints in to out and adds line numbers
        !*/

        // restricted functions
        cpp_pretty_printer_kernel_2(const cpp_pretty_printer_kernel_2&);        // copy constructor
        cpp_pretty_printer_kernel_2& operator=(const cpp_pretty_printer_kernel_2&);    // assignment operator

    };    

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename stack,
        typename tok
        >
    cpp_pretty_printer_kernel_2<stack,tok>::
    cpp_pretty_printer_kernel_2 (        
    )
    {
    }

// ----------------------------------------------------------------------------------------

    template <
        typename stack,
        typename tok
        >
    cpp_pretty_printer_kernel_2<stack,tok>::
    ~cpp_pretty_printer_kernel_2 (
    )
    {
    }

// ----------------------------------------------------------------------------------------

    template <
        typename stack,
        typename tok
        >
    void cpp_pretty_printer_kernel_2<stack,tok>::
    print (
        std::istream& in,
        std::ostream& out,
        const std::string& title
    ) const
    {
        using namespace std;

        if (!out)
            throw std::ios::failure("error occurred in cpp_pretty_printer_kernel_2::print");

        t.set_stream(in);

        out << "<html><!-- "
            << "Created using the cpp_pretty_printer from the dlib C++ library.  See http://dlib.net for updates." 
            << " --><head>"
            << "<title>" << title << "</title></head><body bgcolor='white'>"
            << "<h1><center>" << title << "</center></h1><pre>\n"
            << "<font style='font-size:9pt' face='Lucida Console'>\n";
        if (!out)
            throw std::ios::failure("error occurred in cpp_pretty_printer_kernel_2::print");

        unsigned long scope = 0; // counts the number of new scopes we have entered 
                        // since we were at a scope where functions can be declared

        bool recently_seen_class_keyword = false;
            // true if we have seen the keywords class or struct and
            // we have not seen any identifiers or { characters

        bool recently_seen_include = false;
            // true if we have seen the #include keyword and have not seen double
            // quoted text or >

        bool recently_seen_new_scope = false;  
            // true if we have seen the keywords class, namespace, or struct and
            // we have not seen the characters {, ), or ; since then

        bool recently_seen_paren = false;
            // true if we have seen a ) and we have only seen white_space or comments since

        bool in_initialization_list = false;
            // true if we have seen a ) followed by any white space or comments and then
            // followed by a : (in scope==0 with recently_seen_preprocessor==false) and we 
            // have not yet seen the character { or ;

        bool recently_seen_preprocessor = false;
            // true if we have seen the #pragma or #if or #define or #elif keyword and 
            // have not seen an identifier.


        bool recently_seen_extern = false;
            // true if we have seen the extern keyword and haven't yet seen a 
            // { or ; character.

        unsigned long paren_count = 0; 
            // this is the number of ( we have seen minus the number of ) we have
            // seen.
            

        int type;
        stack scopes; // a stack to hold old scopes
        string token, temp;
        t.get_token(type,token);
        while (type != tok::END_OF_FILE)
        {
            switch (type)
            {
            case tok::IDENTIFIER: // ------------------------------------------
                if ( recently_seen_class_keyword)
                {
                    // this might be a class name so check if there is a 
                    // ; or identifier or * or &amp; coming up.
                    type = t.peek_type();
                    temp.clear();
                    if (type == tok::WHITE_SPACE)
                    {
                        t.get_token(type,temp);
                        if (temp.find_first_of("\n\r") != string::npos)
                            recently_seen_preprocessor = false;
                    }
                    if (t.peek_token() != ";" && t.peek_type() != tok::IDENTIFIER &&
                        t.peek_token() != "*" && t.peek_token() != "&amp;")
                    {
                        // this is the name of a class or struct in a class or
                        // struct declaration.
                        out << "<b><i>" << token << "</i></b>" << temp;
                    }
                    else
                    {
                        out << token << temp;
                    }
                }
                else if ( !in_initialization_list &&
                     !recently_seen_preprocessor &&
                     scope == 0 &&
                     paren_count == 0)
                {
                    // this might be a function name so check if there is a 
                    // ( coming up.
                    type = t.peek_type();
                    temp.clear();
                    if (type == tok::WHITE_SPACE)
                    {
                        t.get_token(type,temp);
                        type = t.peek_type();
                    }
                    if (type == tok::OTHER && t.peek_token() == "(")
                    {
                        // this is a function definition or prototype
                        out << "<b><i>" << token << "</i></b>" << temp;
                    }
                    else
                    {
                        out << token << temp;
                    }
                }
                else
                {
                    out << token;
                }
                


                recently_seen_class_keyword = false;
                recently_seen_paren = false;
                break;

            case tok::KEYWORD: // ---------------------------------------------
                if (scope == 0 && token == "operator")
                {
                    // Doing this is sort of weird since operator is really a keyword
                    // but I just like how this looks.
                    out << "<b><i>" << token << "</i></b>";
                }
                // this isn't a keyword if it is something like #include <new>
                else if (!recently_seen_include) 
                {
                    // This is a normal keyword
                    out << "<u><font face='Fixedsys'>" << token << "</font></u>";
                }
                else
                {
                    out << token;
                }

                if (token == "#include") 
                {
                    recently_seen_include = true;
                }
                else if (token == "class")
                {
                    recently_seen_new_scope = true;
                    recently_seen_class_keyword = true;
                }
                else if (token == "namespace")
                {
                    recently_seen_new_scope = true;
                }
                else if (token == "struct")
                {
                    recently_seen_new_scope = true;
                    recently_seen_class_keyword = true;
                }
                else if (token == "#pragma" || token == "#define" || token == "#elif" || token == "#if")
                {
                    recently_seen_preprocessor = true;
                }
                else if (token == "extern")
                {
                    recently_seen_extern = true;
                }
                recently_seen_paren = false;
                break;

            case tok::COMMENT: // ---------------------------------------------
                {
                    out << "<font face='Courier New'>" << htmlify(token) << "</font>";
                }
                break;

            case tok::SINGLE_QUOTED_TEXT: // ----------------------------------
                {
                    out << htmlify(token);
                    recently_seen_paren = false;
                }
                break;

            case tok::WHITE_SPACE: // -----------------------------------------
                {
                    out << token;
                    if (token.find_first_of("\n\r") != string::npos)
                        recently_seen_preprocessor = false;
                }
                break;

            case tok::DOUBLE_QUOTED_TEXT: // ----------------------------------
                {                    
                    out << htmlify(token);
                    recently_seen_paren = false;
                    recently_seen_include = false;
                }
                break;

            case tok::NUMBER:
            case tok::OTHER: // -----------------------------------------------               
                switch (token[0])
                {
                case '{':
                    out << "<b>{</b>";  
                    // if we are entering a new scope
                    if (recently_seen_new_scope || recently_seen_extern)
                    {
                        recently_seen_new_scope = false;
                        scopes.push(scope);
                        scope = 0;
                    }
                    else
                    {
                        ++scope;
                    }
                    in_initialization_list = false;
                    recently_seen_paren = false;
                    recently_seen_class_keyword = false;
                    recently_seen_extern = false;
                    break;
                case '}':
                    out << "<b>}</b>";
                    if (scope > 0)
                    {
                        --scope;
                    }
                    else if (scopes.size())
                    {
                        scopes.pop(scope);
                    }
                    recently_seen_paren = false;
                    break;

                case ':':
                    out << ':';
                    if (recently_seen_paren && scope == 0 &&
                        recently_seen_preprocessor == false)
                    {
                        in_initialization_list = true;
                    }
                    recently_seen_paren = false;
                    break;

                case ';': 
                    out << ';';
                    recently_seen_new_scope = false;
                    recently_seen_paren = false;
                    recently_seen_extern = false;
                    break;

                case ')':
                    out << ')';
                    recently_seen_paren = true;
                    recently_seen_new_scope = false;
                    --paren_count;
                    break;

                case '(':
                    out << '(';
                    recently_seen_paren = false;
                    ++paren_count;
                    break;

                case '>':
                    recently_seen_include = false;
                    out << "&gt;";
                    recently_seen_paren = true;
                    break;

                case '<':
                    out << "&lt;";
                    recently_seen_paren = true;
                    break;

                case '&':
                    out << "&amp;";
                    recently_seen_paren = true;
                    break;

                default:
                    out << token;
                    recently_seen_paren = false;
                    if (token == "&gt;")
                        recently_seen_include = false;
                    break;

                } // switch (token[0])
                break;

            } // switch (type)

            t.get_token(type,token);
        } // while (type != tok::END_OF_FILE)


        out << "</font></pre></body></html>";
        if (!out)
            throw std::ios::failure("error occurred in cpp_pretty_printer_kernel_2::print");
    }

// ----------------------------------------------------------------------------------------

    template <
        typename stack,
        typename tok
        >
    void cpp_pretty_printer_kernel_2<stack,tok>::
    print_and_number (
        std::istream& in,
        std::ostream& out,
        const std::string& title
    ) const
    {
        using namespace std;
        ostringstream sout;
        print(in,sout,title);
        istringstream sin(sout.str());
        number(sin,out);
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // private member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename stack,
        typename tok
        >
    void cpp_pretty_printer_kernel_2<stack,tok>::
    number (
        std::istream& in,
        std::ostream& out
    ) const
    {
        if (!out)
            throw std::ios::failure("error occurred in cpp_pretty_printer_kernel_2::number");

        std::string space = "&nbsp;&nbsp;&nbsp;";
        std::ios::int_type ch;
        unsigned long count = 1;
        while ((ch=in.get()) != EOF)
        {
            if (ch != '\n')
            {
                out << (char)ch;    
            }
            else
            {
                out << "\n<i><font face='Courier New'>" << count << " </font></i> " + space;
                ++count;
                if (count == 10)
                    space = "&nbsp;&nbsp;";
                if (count == 100)
                    space = "&nbsp;";
                if (count == 1000)
                    space = "";            
            }
        }
        if (!out)
            throw std::ios::failure("error occurred in cpp_pretty_printer_kernel_2::number");
    }

// ----------------------------------------------------------------------------------------

    template <
        typename stack,
        typename tok
        >
    const std::string cpp_pretty_printer_kernel_2<stack,tok>::
    htmlify (
        const std::string& str
    ) const
    {
        std::string::size_type i;
        std::string temp;
        for (i = 0; i < str.size(); ++i)
        {
            if (str[i] == '<')
                temp += "&lt;";
            else if (str[i] == '>')
                temp += "&gt;";
            else if (str[i] == '&')
                temp += "&amp;";
            else
                temp += str[i];
        }
        return temp;
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_CPP_PRETTY_PRINTER_KERNEl_2_

