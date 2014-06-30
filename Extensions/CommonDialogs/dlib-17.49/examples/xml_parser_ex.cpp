// The contents of this file are in the public domain. See LICENSE_FOR_EXAMPLE_PROGRAMS.txt
/*

    This is an example illustrating the use of the xml_parser component in 
    the dlib C++ Library.

    This example simply reads in an xml file and prints the parsing events
    to the screen. 
*/




#include "dlib/xml_parser.h"
#include <iostream>
#include <fstream>


using namespace std;
using namespace dlib;

// ----------------------------------------------------------------------------------------

class doc_handler : public document_handler
{
    /*
        As the parser runs it generates events when it encounters tags and
        data in an XML file.  To be able to receive these events all you have to 
        do is make a class that inherits from dlib::document_handler and
        implements its virtual methods.   Then you simply associate an
        instance of your class with the xml_parser.

        So this class is a simple example document handler that just prints
        all the events to the screen.
    */
public:

    virtual void start_document (
    )
    {
        cout << "parsing begins" << endl;
    }

    virtual void end_document (
    )
    {
        cout << "Parsing done" << endl;
    }

    virtual void start_element ( 
        const unsigned long line_number,
        const std::string& name,
        const dlib::attribute_list& atts
    )
    {
        cout << "on line " << line_number << " we hit the <" << name << "> tag" << endl;

        // print all the tag's attributes
        atts.reset();
        while (atts.move_next())
        {
            cout << "\tattribute: " << atts.element().key() << " = " << atts.element().value() << endl;
        }
    }

    virtual void end_element ( 
        const unsigned long line_number,
        const std::string& name
    )
    {
        cout << "on line " << line_number << " we hit the closing tag </" << name << ">" << endl;
    }

    virtual void characters ( 
        const std::string& data
    )
    {
        cout << "Got some data between tags and it is:\n" << data << endl;
    }

    virtual void processing_instruction (
        const unsigned long line_number,
        const std::string& target,
        const std::string& data
    )
    {
        cout << "on line " << line_number << " we hit a processing instruction with a target of '" 
            << target << "' and data '" << data << "'" << endl;
    }
};

// ----------------------------------------------------------------------------------------

class xml_error_handler : public error_handler
{
    /*
        This class handles error events that occur during parsing.  

        Just like the document_handler class above it just prints the events to the screen.
    */

public:
    virtual void error (
        const unsigned long line_number
    )
    {
        cout << "There is a non-fatal error on line " << line_number << " in the file we are parsing." << endl;
    }

    virtual void fatal_error (
        const unsigned long line_number
    )
    {
        cout << "There is a fatal error on line " << line_number << " so parsing will now halt" << endl;
    }
};

// ----------------------------------------------------------------------------------------

int main(int argc, char** argv)
{
    // Check if the user entered an argument to this application.  
    if (argc != 2)
    {
        cout << "Please enter an xml file to parse on the command line" << endl;
        return 1;
    }

    // Try to open the file given on the command line
    ifstream fin(argv[1]);
    if (!fin)
    {
        cout << "unable to open file: " << argv[1] << endl;
        return 1;
    }

    // now make the xml parser and our document and error handlers
    xml_parser::kernel_1a_c parser;
    doc_handler dh;
    xml_error_handler eh;

    // now associate the handlers with the parser and tell it to parse
    parser.add_document_handler(dh);
    parser.add_error_handler(eh);
    parser.parse(fin);
}

