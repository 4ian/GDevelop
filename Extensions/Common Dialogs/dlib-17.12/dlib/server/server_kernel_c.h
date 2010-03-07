// Copyright (C) 2003  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_SERVER_KERNEl_C_
#define DLIB_SERVER_KERNEl_C_

#include "server_kernel_abstract.h"
#include "../algs.h"
#include "../assert.h"
#include <string>
#include <sstream>

namespace dlib
{


    template <
        typename server_base
        >
    class server_kernel_c : public server_base
    {
        
        public:

            void start (
            );


            void set_listening_port (
                int port
            );

            void set_listening_ip (
                const std::string& ip
            );

            void set_max_connections (
                int max
            );

    private:
        bool is_dotted_quad (
            std::string ip
        ) const;
        /*!
            ensures
                returns true if ip is a valid dotted quad ip address else
                returns false
        !*/
        

    };

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename server_base
        >
    void server_kernel_c<server_base>::
    start (
    )
    {
        // make sure requires clause is not broken
        DLIB_CASSERT( 
              this->is_running() == false,
            "\tvoid server::start"
            << "\n\tis_running() == " << this->is_running() 
            << "\n\tthis: " << this
            );

        // call the real function
        server_base::start();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename server_base
        >
    void server_kernel_c<server_base>::
    set_max_connections (
        int max
    )
    {
        // make sure requires clause is not broken
        DLIB_CASSERT( 
            max >= 0 ,
            "\tvoid server::set_max_connections"
            << "\n\tmax == " << max
            << "\n\tthis: " << this
            );

        // call the real function
        server_base::set_max_connections(max);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename server_base
        >
    void server_kernel_c<server_base>::
    set_listening_port (
        int port
    )
    {
        // make sure requires clause is not broken
        DLIB_CASSERT( 
            ( port >= 0 &&
              this->is_running() == false ),
            "\tvoid server::set_listening_port"
            << "\n\tport         == " << port
            << "\n\tis_running() == " << this->is_running() 
            << "\n\tthis: " << this
            );

        // call the real function
        server_base::set_listening_port(port);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename server_base
        >
    void server_kernel_c<server_base>::
    set_listening_ip (
        const std::string& ip
    ) 
    {
        // make sure requires clause is not broken
        DLIB_CASSERT( 
            ( ( is_dotted_quad(ip) || ip == "" ) &&
              this->is_running() == false ),
            "\tvoid server::set_listening_ip"
            << "\n\tip           == " << ip
            << "\n\tis_running() == " << this->is_running() 
            << "\n\tthis: " << this
            );

        // call the real function
        server_base::set_listening_ip(ip);
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // private member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename server_base
        >
    bool server_kernel_c<server_base>::
    is_dotted_quad (
        std::string ip
    ) const
    {

        int num;
        char dot;
        std::istringstream sin(ip);

        for (int i = 0; i < 3; ++i)
        {
            sin >> num; if (!sin) return false;
            if (num < 0 || num > 255)
                return false;

            sin >> dot; if (!sin) return false;
            if (dot != '.')
                return false;
        }

        sin >> num; if (!sin) return false;
        if (num < 0 || num > 255)
            return false;

        if (sin.get() != EOF)
            return false;

        return true;        
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_SERVER_KERNEl_C_

