// Copyright (C) 2006  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_SOCKETS_EXTENSIONs_
#define DLIB_SOCKETS_EXTENSIONs_

#include <string>
#include "../sockets.h"
#include "sockets_extensions_abstract.h"
#include "../smart_pointers.h"
#include <iosfwd>

namespace dlib
{

// ----------------------------------------------------------------------------------------

    class invalid_network_address : public dlib::error 
    { 
    public: 
        invalid_network_address(const std::string& msg) : dlib::error(msg) {};
    };

// ----------------------------------------------------------------------------------------

    struct network_address
    {
        network_address() : port(0){}

        network_address(
            const std::string& full_address
        );

        network_address (
            const char* full_address
        )
        {
            *this = network_address(std::string(full_address));
        }

        network_address(
            const std::string& host_address_,
            const unsigned short port_
        ) : host_address(host_address_), port(port_) {}
            
        std::string host_address;
        unsigned short port;
    };

// ----------------------------------------------------------------------------------------

    inline bool operator < (
        const network_address& a,
        const network_address& b
    ) 
    {
        if (a.host_address < b.host_address)
            return true;
        else if (a.host_address > b.host_address)
            return false;
        else if (a.port < b.port)
            return true;
        else
            return false;
    }

    inline bool operator== (
        const network_address& a,
        const network_address& b
    ) { return a.host_address == b.host_address && a.port == b.port; }

    inline bool operator != (
        const network_address& a,
        const network_address& b
    ) { return !(a == b); }

// ----------------------------------------------------------------------------------------

    void serialize(
        const network_address& item,
        std::ostream& out
    );

    void deserialize(
        network_address& item,
        std::istream& in 
    );

    std::ostream& operator<< (
        std::ostream& out,
        const network_address& item
    );

    std::istream& operator>> (
        std::istream& in,
        network_address& item
    );

// ----------------------------------------------------------------------------------------

    connection* connect (
        const std::string& host_or_ip,
        unsigned short port
    );

// ----------------------------------------------------------------------------------------

    connection* connect (
        const network_address& addr
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

