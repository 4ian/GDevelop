#ifndef DLIB_HTMLIFY_TO_XmL_H__
#define DLIB_HTMLIFY_TO_XmL_H__

#include "dlib/cmd_line_parser.h"
#include <string>

void generate_xml_markup(
    const dlib::cmd_line_parser<char>::check_1a_c& parser, 
    const std::string& filter, 
    const unsigned long search_depth,
    const unsigned long expand_tabs 
);
/*!
    ensures
        - reads all the files indicated by the parser arguments and converts them
          to XML.  The output will be stored in the output.xml file.
        - if (expand_tabs != 0) then
            - tabs will be replaced with expand_tabs spaces inside comment blocks
!*/

#endif // DLIB_HTMLIFY_TO_XmL_H__

