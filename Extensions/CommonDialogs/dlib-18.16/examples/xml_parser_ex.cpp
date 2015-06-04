// The contents of this file are in the public domain. See LICENSE_FOR_EXAMPLE_PROGRAMS.txt
/*

    This is an example illustrating the use of the xml_parser component in 
    the dlib C++ Library.

    This example simply reads in an xml file and prints the parsing events
    to the screen. 
*/




#include <dlib/xml_parser.h>
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

int main(int argc, char** argv)
{
    try
    {
        // Check if the user entered an argument to this application.  
        if (argc != 2)
        {
            cout << "Please enter an xml file to parse on the command line" << endl;
            return 1;
        }

        doc_handler dh;
        // Now run the parser and tell it to call our doc_handler for each of the parsing
        // events.
        parse_xml(argv[1], dh);
    }
    catch (std::exception& e)
    {
        cout << e.what() << endl;
    }
}

