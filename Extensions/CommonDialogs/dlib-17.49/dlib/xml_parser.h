// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_XML_PARSEr_
#define DLIB_XML_PARSEr_

#include <string>

#include "xml_parser/xml_parser_kernel_interfaces.h"
#include "xml_parser/xml_parser_kernel_1.h"
#include "xml_parser/xml_parser_kernel_c.h"

#include "map.h"
#include "stack.h"
#include "sequence.h"
#include "memory_manager.h"


namespace dlib
{


    class xml_parser
    {



        
        typedef map<std::string,std::string,memory_manager<char>::kernel_2a>::kernel_1b map1a;
        typedef map<std::string,std::string,memory_manager<char>::kernel_2a>::kernel_1b_c map1a_c;
        typedef stack<std::string,memory_manager<char>::kernel_2a>::kernel_1a stack1a;
        typedef sequence<document_handler*>::kernel_2a seq_dh2a;
        typedef sequence<error_handler*>::kernel_2a seq_eh2a;

    

        // A version that uses the checked map.  This way there is checking on the attribute
        // list that gets passed back to the user.
        typedef     xml_parser_kernel_1<map1a_c,stack1a,seq_dh2a,seq_eh2a>    
                    kernel_1a_c_impl;

        xml_parser() {}
    public:
        
        //----------- kernels ---------------

        // kernel_1a        
        typedef     xml_parser_kernel_1<map1a,stack1a,seq_dh2a,seq_eh2a>    
                    kernel_1a;
        typedef     xml_parser_kernel_c<kernel_1a_c_impl>
                    kernel_1a_c;
   

    };
}

#endif // DLIB_XML_PARSEr_

