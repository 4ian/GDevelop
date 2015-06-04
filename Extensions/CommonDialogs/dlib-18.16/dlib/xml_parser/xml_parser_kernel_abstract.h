// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_XML_PARSER_KERNEl_ABSTRACT_
#ifdef DLIB_XML_PARSER_KERNEl_ABSTRACT_

#include <string>
#include <iosfwd>
#include "xml_parser_kernel_interfaces.h"

namespace dlib
{

    class xml_parser
    {

        /*!                
            INITIAL VALUE
                no objects are registered to receive events 


            WHAT THIS OBJECT REPRESENTS
                This object represents a simple SAX style event driven XML parser.  
                It takes its input from an input stream object and sends events to all 
                registered document_handler and error_handler objects.

                note that this xml parser ignores all DTD related XML markup.  It will 
                parse XML documents with DTD's but it just won't check if the document
                is valid.  This also means that entity references may not be used except
                for the predefined ones which are as follows:
                    &amp;
                    &lt;
                    &gt;
                    &apos;
                    &quot;

                also note that there is no interpreting of entity references inside
                a CDATA section or inside of tags, they are only interpreted inside 
                normal non-markup data.

                This parser considers the end of the xml document to be the closing 
                tag of the root tag (as opposed to using EOF as the end of the
                document).  This is a deviation from the xml standard.

                Aside from ignoring DTD stuff and entity references everywhere but
                data, and the above comment regarding EOF, this parser should conform 
                to the rest of the XML standard.
        !*/
        
        public:


            xml_parser(
            );
            /*!
                ensures 
                    - #*this is properly initialized
                throws
                    - std::bad_alloc
            !*/

            virtual ~xml_parser(
            ); 
            /*!
                ensures
                    - all memory associated with *this has been released
            !*/

            void clear(
            );
            /*!
                ensures
                    - #*this has its initial value
                throws
                    - std::bad_alloc
                        if this exception is thrown then *this is unusable 
                        until clear() is called and succeeds
            !*/

            void parse (
                std::istream& in
            );
            /*!
                requires
                    - in.fail() == false
                ensures
                    - the data from the input stream in will be parsed and the appropriate
                      events will be generated 
                    - parsing will stop when the parser has reached the closing tag
                      for the xml document or EOF (which ever comes first). Note that
                      hitting EOF first is a fatal error.
                throws
                    - std::bad_alloc
                        if parse() throws then it will be unusable until clear() is 
                        called and succeeds
                    - other exceptions
                        document_handlers and error_handlers my throw any exception.  If 
                        they throw while parse() is running then parse() will let the 
                        exception propagate out and the xml_parser object will be unusable 
                        until clear() is called and succeeds.    note that end_document()
                        is still called.
            !*/
  
            void add_document_handler (
                document_handler& item
            );
            /*!
                ensures
                    - item will now receive document events from the parser
                throws
                    - std::bad_alloc
                        if add_document_handler() throws then it has no effect
            !*/

            void add_error_handler (
                error_handler& item
            );
            /*!
                ensures
                    - item will now receive error events from the parser
                throws
                    - std::bad_alloc
                        if add_error_handler() throws then it has no effect
            !*/


            void swap (
                xml_parser& item
            );
            /*!
                ensures
                    - swaps *this and item
            !*/ 
    

        private:

            // restricted functions
            xml_parser(xml_parser&);        // copy constructor
            xml_parser& operator=(xml_parser&);    // assignment operator

    };


    inline void swap (
        xml_parser& a, 
        xml_parser& b 
    ) { a.swap(b); }   
    /*!
        provides a global swap function
    !*/

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    class xml_parse_error : public error
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This is the exception object thrown by the parse_xml() routines defined
                below.
        !*/
    };

// ----------------------------------------------------------------------------------------

    void parse_xml (
        std::istream& in,
        document_handler& dh,
        error_handler& eh
    );
    /*!
        ensures
            - makes an xml_parser and tells it to parse the given input stream using the
              supplied document_handler and error_handler.
    !*/

    void parse_xml (
        std::istream& in,
        error_handler& eh,
        document_handler& dh
    )
    /*!
        ensures
            - makes an xml_parser and tells it to parse the given input stream using the
              supplied document_handler and error_handler.
    !*/

    void parse_xml (
        std::istream& in,
        error_handler& eh
    );
    /*!
        ensures
            - makes an xml_parser and tells it to parse the given input stream using the
              supplied error_handler.
    !*/

    void parse_xml (
        std::istream& in,
        document_handler& dh
    );
    /*!
        ensures
            - makes an xml_parser and tells it to parse the given input stream using the
              supplied document_handler.
            - Uses a default error handler that will throw an xml_parse_error exception
              if a fatal parsing error is encountered.
        throws
            - xml_parse_error
                Thrown if a fatal parsing error is encountered.
    !*/

// ----------------------------------------------------------------------------------------

    void parse_xml (
        const std::string& filename,
        document_handler& dh,
        error_handler& eh
    );
    /*!
        ensures
            - makes an xml_parser and tells it to parse the given input file using the
              supplied error_handler and document_handler.
        throws
            - xml_parse_error
                Thrown if there is a problem opening the input file.
    !*/

    void parse_xml (
        const std::string& filename,
        error_handler& eh,
        document_handler& dh
    );
    /*!
        ensures
            - makes an xml_parser and tells it to parse the given input file using the
              supplied error_handler and document_handler.
        throws
            - xml_parse_error
                Thrown if there is a problem opening the input file.
    !*/

    void parse_xml (
        const std::string& filename,
        error_handler& eh
    );
    /*!
        ensures
            - makes an xml_parser and tells it to parse the given input file using the
              supplied error_handler.
        throws
            - xml_parse_error
                Thrown if there is a problem opening the input file.
    !*/

    void parse_xml (
        const std::string& filename,
        document_handler& dh
    );
    /*!
        ensures
            - makes an xml_parser and tells it to parse the given input file using the
              supplied document_handler.
            - Uses a default error handler that will throw an xml_parse_error exception
              if a fatal parsing error is encountered.
        throws
            - xml_parse_error
                Thrown if a fatal parsing error is encountered or if there is a problem
                opening the input file.
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_XML_PARSER_KERNEl_ABSTRACT_

