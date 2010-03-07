// Copyright (C) 2003  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_SERVEr_
#define DLIB_SERVEr_

#include "server/server_kernel_1.h"
#include "server/server_kernel_c.h"
#include "server/server_iostream_1.h"
#include "server/server_http_1.h"

#include "set.h"
#include "algs.h"
#include "sockstreambuf.h"
#include "map.h"
#include "queue.h"
#include <string>



namespace dlib
{

    class server
    {
        server() {}


        typedef set<connection*>::kernel_1a set_of_cons_1a;

        typedef sockstreambuf::kernel_1a ssbuf1a;
        typedef sockstreambuf::kernel_2a ssbuf2a;

        typedef map<std::string,std::string>::kernel_1a_c map_ss_type;
        typedef queue<std::string>::kernel_1a_c queue_type;

        typedef map<uint64,connection*,memory_manager<char>::kernel_2a>::kernel_1b id_map;

    public:
        
        //----------- kernels ---------------

        // kernel_1a        
        typedef     server_kernel_1<set_of_cons_1a>    
                    kernel_1a;
        typedef     server_kernel_c<kernel_1a>
                    kernel_1a_c;
 
        // iostream_1a
        typedef     server_iostream_1<kernel_1a,ssbuf2a,id_map>
                    iostream_1a;
        typedef     server_iostream_1<kernel_1a_c,ssbuf2a,id_map>
                    iostream_1a_c;

        // http_1a
        typedef     server_http_1<iostream_1a,map_ss_type,queue_type>
                    http_1a;
        typedef     server_http_1<iostream_1a_c,map_ss_type,queue_type>
                    http_1a_c;

    };

}

#endif // DLIB_SERVEr_

