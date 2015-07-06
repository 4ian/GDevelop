// Copyright (C) 2005  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_CPP_PRETTY_PRINTER_KERNEl_ABSTRACT_
#ifdef DLIB_CPP_PRETTY_PRINTER_KERNEl_ABSTRACT_

#include <string>
#include <ioswfd>

namespace dlib
{

    class cpp_pretty_printer 
    {
        /*!
            INITIAL VALUE
                This object does not have any state associated with it.

            WHAT THIS OBJECT REPRESENTS
                This object represents an HTML pretty printer for C++ source code. 

        !*/

    public:

        cpp_pretty_printer (        
        );
        /*!
            ensures                
                - #*this is properly initialized
            throws
                - std::bad_alloc
        !*/

        virtual ~cpp_pretty_printer (
        );
        /*!
            ensures
                - any resources associated with *this have been released
        !*/

        void print (
            std::istream& in,
            std::ostream& out,
            const std::string& title
        ) const;
        /*!
            ensures
                - treats data from in as C++ source code and pretty prints it in
                  HTML and writes it to out.
                - The title of the HTML document writen to out will be title
            throws
                - std::ios_base::failure
                    If there was a problem writing to out then this exception will 
                    be thrown.                      
                - any other exception
                    This exception may be thrown if there is any other problem. 
        !*/

        void print_and_number (
            std::istream& in,
            std::ostream& out,
            const std::string& title
        ) const;
        /*!
            ensures
                - treats data from in as C++ source code and pretty prints it in
                  HTML with line numbers and writes it to out.
                - The title of the HTML document writen to out will be title
            throws
                - std::ios_base::failure
                    If there was a problem writing to out then this exception will 
                    be thrown.                      
                - any other exception
                    This exception may be thrown if there is any other problem. 
        !*/

    private:

        // restricted functions
        cpp_pretty_printer(const cpp_pretty_printer&);        // copy constructor
        cpp_pretty_printer& operator=(const cpp_pretty_printer&);    // assignment operator

    };    

}

#endif // DLIB_CPP_PRETTY_PRINTER_KERNEl_ABSTRACT_

