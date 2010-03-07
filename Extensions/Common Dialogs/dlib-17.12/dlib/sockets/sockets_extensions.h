// Copyright (C) 2006  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_SOCKETS_EXTENSIONs_
#define DLIB_SOCKETS_EXTENSIONs_

#include <string>
#include "../sockets.h"
#include "sockets_extensions_abstract.h"
#include "../smart_pointers.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    connection* connect (
        const std::string& host_or_ip,
        unsigned short port
    );

// ----------------------------------------------------------------------------------------

    connection* connect (
        const std::string& host_or_ip,
        unsigned short port,
        unsigned long timeout
    );

// ----------------------------------------------------------------------------------------

    bool is_ip_address (
        std::string ip
    );

// ----------------------------------------------------------------------------------------

    void close_gracefully (
        connection* con,
        unsigned long timeout = 500
    );

// ----------------------------------------------------------------------------------------

    void close_gracefully (
        scoped_ptr<connection>& con,
        unsigned long timeout = 500
    );

// ----------------------------------------------------------------------------------------

}

#ifdef NO_MAKEFILE
#include "sockets_extensions.cpp"
#endif

#endif // DLIB_SOCKETS_EXTENSIONs_

