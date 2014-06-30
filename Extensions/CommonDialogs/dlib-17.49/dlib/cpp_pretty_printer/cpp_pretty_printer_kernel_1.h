// Copyright (C) 2005  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_CPP_PRETTY_PRINTER_KERNEl_1_
#define DLIB_CPP_PRETTY_PRINTER_KERNEl_1_

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
    class cpp_pretty_printer_kernel_1 
    {
        /*!
            REQUIREMENTS ON stack
                must be an implementation of stack/stack_kernel_abstract.h and
                stack::type == unsigned long

            REQUIREMENTS ON tok
                must be an implementation of tokenizer/tokenizer_kernel_abstract.h

            INFO
                This implementation applies a color scheme, turns include directives 
                such as #include "file.h" into links to file.h.html, and it also puts 
                HTML anchor points on function and class declarations.
        !*/

    public:

        cpp_pretty_printer_kernel_1 (        
        );

        virtual ~cpp_pretty_printer_kernel_1 (
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

        const std::string htmlify (
            const std::string& str
        ) const;
        /*!
            ensures
                - str == str but with any '<' replaced with '&lt;', any '>' replaced
                  with '&gt;', and any '&' replaced with '&amp;'
        !*/

        // data members
        mutable tok t;

        void number (
            std::istream& in,
            std::ostream& out
        ) const;
        /*!
            ensures
                - prints in to out and adds line numbers
        !*/

        // restricted functions
        cpp_pretty_printer_kernel_1(const cpp_pretty_printer_kernel_1&);        // copy constructor
        cpp_pretty_printer_kernel_1& operator=(const cpp_pretty_printer_kernel_1&);    // assignment operator

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
    cpp_pretty_printer_kernel_1<stack,tok>::
    cpp_pretty_printer_kernel_1 (        
    )
    {
    }

// ----------------------------------------------------------------------------------------

    template <
        typename stack,
        typename tok
        >
    cpp_pretty_printer_kernel_1<stack,tok>::
    ~cpp_pretty_printer_kernel_1 (
    )
    {
    }

// ----------------------------------------------------------------------------------------

    template <
        typename stack,
        typename tok
        >
    void cpp_pretty_printer_kernel_1<stack,tok>::
    print (
        std::istream& in,
        std::ostream& out,
        const std::string& title
    ) const
    {
        using namespace std;

        if (!out)
            throw std::ios::failure("error occurred in cpp_pretty_printer_kernel_1::print");

        t.set_stream(in);

        out << "<html><!-- " 
            << "Created using the cpp_pretty_printer from the dlib C++ library.  See http://dlib.net for updates." 
            << " --><head><title>" << title << "</title></head><body bgcolor='white'><pre>\n";
        if (!out)
            throw std::ios::failure("error occurred in cpp_pretty_printer_kernel_1::print");

        unsigned long scope = 0; // counts the number of new scopes we have entered 
                        // since we were at a scope where functions can be declared

        bool recently_seen_class_keyword = false;
            // true if we have seen the keywords class, struct, or enum and
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
            // true if we have seen the #pragma or #if or #define or #elif keywords and have 
            // not seen an end of line.

        bool recently_seen_extern = false;
            // true if we have seen the extern keyword and haven't seen a ; or { yet.

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
                    // ; or identifier or * or & coming up.
                    type = t.peek_type();
                    temp.clear();
                    if (type == tok::WHITE_SPACE)
                    {
                        t.get_token(type,temp);
                        if (temp.find_first_of("\n\r") != string::npos)
                            recently_seen_preprocessor = false;
                    }
                    if (t.peek_token() != ";" && t.peek_type() != tok::IDENTIFIER &&
                        t.peek_token() != "*" && t.peek_token() != "&")
                    {
                        // this is the name of a class or struct in a class or
                        // struct declaration.
                        out << "<b><a name='" << token << "'></a>" << token << "</b>" << temp;
                    }
                    else
                    {
                        out << token << temp;
                    }
                }
                else if ( !in_initialization_list &&
                     !recently_seen_preprocessor )
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
                        if (scope == 0 && paren_count == 0)
                        {
                            // this is a function definition or prototype
                            out << "<b><a name='" << token << "'></a>" << token << "</b>" << temp;
                        }
                        else
                        {
                            // this is a function call (probably) 
                            out << "<font color='#BB00BB'>" << token << "</font>" << temp;
                        }
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
                    out << "<b><a name='" << token << "'></a>" << token << "</b>";
                }
                // this isn't a keyword if it is something like #include <new>
                else if ( token == "true" || token == "false")
                {
                    // color 'true' and 'false' the same way we color numbers
                    out << "<font color='#979000'>" << token << "</font>";
                }
                else if (!recently_seen_include) 
                {
                    // This is a normal keyword
                    if (token == "char" || token == "unsigned" || token == "signed" ||
                        token == "short" || token == "int" || token == "long" || 
                        token == "float" || token == "double" || token == "bool" ||
                        token == "void" || token == "size_t" || token == "wchar_t")
                    {
                        out << "<font color='#0000FF'><u>" << token << "</u></font>";
                    }
                    else
                    {
                        out << "<font color='#0000FF'>" << token << "</font>";
                    }
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
                else if (token == "enum")
                {
                    recently_seen_class_keyword = true;
                }
                else if (token == "struct")
                {
                    recently_seen_new_scope = true;
                    recently_seen_class_keyword = true;
                }
                else if (token == "#pragma" || token == "#if" || token == "#define" || token == "#elif")
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
                    // if this is a special anchor comment
                    if (token.size() > 4 &&
                        token[0] == '/' &&
                        token[1] == '*' &&
                        token[2] == '!' &&
                        token[3] == 'A' &&
                        token[4] == ' '
                    )
                    {
                        temp = token;
                        istringstream sin(token);
                        sin >> temp;
                        sin >> temp;
                        sin.get();
                        // if there was still more stuff in the token then we are ok.
                        if (sin)
                            out << "<a name='" << temp << "'/>";
                    }
                    out << "<font color='#009900'>" << htmlify(token) << "</font>";
                }
                break;

            case tok::SINGLE_QUOTED_TEXT: // ----------------------------------
                {
                    out << "<font color='#FF0000'>" << htmlify(token) << "</font>";
                    recently_seen_paren = false;
                }
                break;

            case tok::NUMBER: // -----------------------------------------
                {
                    out << "<font color='#979000'>" << token << "</font>";
                    recently_seen_include = false;
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
                    if (recently_seen_include)
                    {
                        // this is the name of an included file
                        recently_seen_include = false;
                        out << "<a style='text-decoration:none' href='" << htmlify(token) << ".html'>" << htmlify(token) << "</a>";                
                    }
                    else
                    {
                        // this is just a normal quoted string
                        out << "<font color='#CC0000'>" << htmlify(token) << "</font>";
                    }
                    recently_seen_paren = false;
                }
                break;

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
                    out << "<font face='Lucida Console'>)</font>";
                    recently_seen_paren = true;
                    recently_seen_new_scope = false;
                    --paren_count;
                    break;

                case '(':
                    out << "<font face='Lucida Console'>(</font>";
                    recently_seen_paren = false;
                    ++paren_count;
                    break;

                case '>':
                    recently_seen_include = false;
                    out << "<font color='#5555FF'>&gt;</font>";
                    recently_seen_paren = false;
                    break;

                case '<':
                    out << "<font color='#5555FF'>&lt;</font>";
                    recently_seen_paren = false;
                    break;

                case '&':
                    out << "<font color='#5555FF'>&amp;</font>";
                    recently_seen_paren = false;
                    break;

                case '=':
                case '+':
                case '-':
                case '/':
                case '*':
                case '!':
                case '|':
                case '%':
                    out << "<font color='#5555FF'>" << token << "</font>";
                    recently_seen_paren = false;
                    break;

                default:
                    out << token;
                    recently_seen_paren = false;
                    break;

                } // switch (token[0])
                break;

            } // switch (type)

            t.get_token(type,token);
        } // while (type != tok::END_OF_FILE)


        out << "\n</pre></body></html>";
        if (!out)
            throw std::ios::failure("error occurred in cpp_pretty_printer_kernel_1::print");
    }

// ----------------------------------------------------------------------------------------

    template <
        typename stack,
        typename tok
        >
    void cpp_pretty_printer_kernel_1<stack,tok>::
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
    void cpp_pretty_printer_kernel_1<stack,tok>::
    number (
        std::istream& in,
        std::ostream& out
    ) const
    {
        if (!out)
            throw std::ios::failure("error occurred in cpp_pretty_printer_kernel_1::number");

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
                out << "\n<font color='555555'>" << count << " </font> " + space;
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
            throw std::ios::failure("error occurred in cpp_pretty_printer_kernel_1::number");
    }

// ----------------------------------------------------------------------------------------

    template <
        typename stack,
        typename tok
        >
    const std::string cpp_pretty_printer_kernel_1<stack,tok>::
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

#endif // DLIB_CPP_PRETTY_PRINTER_KERNEl_1_

