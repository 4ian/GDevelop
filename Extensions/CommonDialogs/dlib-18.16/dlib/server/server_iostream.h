// Copyright (C) 2006  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_SERVER_IOSTREAm_1_
#define DLIB_SERVER_IOSTREAm_1_

#include <iostream>
#include "server_iostream_abstract.h"
#include "../logger.h"
#include "../uintn.h"
#include "server_kernel.h"
#include "../sockstreambuf.h"
#include "../map.h"


namespace dlib
{

    class server_iostream : public server 
    {

        /*!
            INITIAL VALUE
                - next_id == 0
                - con_map.size() == 0

            CONVENTION
                - next_id == the id of the next connection 
                - for all current connections
                    - con_map[id] == the connection object with the given id
                - m == the mutex that protects the members of this object
        !*/

        typedef map<uint64,connection*,memory_manager<char>::kernel_2a>::kernel_1b id_map;

    public:
        server_iostream(
        ) :
            next_id(0)
        {}

        ~server_iostream(
        )
        {
            server::clear();
        }

    protected:

        void shutdown_connection (
            uint64 id
        )
        {
            auto_mutex M(m);
            if (con_map.is_in_domain(id))
            {
                con_map[id]->shutdown();
            }
        }

    private:

        virtual void on_connect (
            std::istream& in,
            std::ostream& out,
            const std::string& foreign_ip,
            const std::string& local_ip,
            unsigned short foreign_port,
            unsigned short local_port,
            uint64 connection_id
        )=0;

        void on_connect (
            connection& con
        )
        {
            bool my_fault = true;
            uint64 this_con_id;
            try
            {
                sockstreambuf buf(&con);
                std::istream in(&buf);
                std::ostream out(&buf);
                in.tie(&out);

                // add this connection to the con_map
                {
                    auto_mutex M(m);
                    this_con_id = next_id;
                    connection* this_con = &con;
                    con_map.add(this_con_id,this_con);
                    this_con_id = next_id;
                    ++next_id;
                }

                my_fault = false;
                on_connect(
                    in,
                    out,
                    con.get_foreign_ip(),
                    con.get_local_ip(),
                    con.get_foreign_port(),
                    con.get_local_port(),
                    this_con_id
                );

                // remove this connection from the con_map
                {
                    auto_mutex M(m);
                    connection* this_con;
                    uint64 junk;
                    con_map.remove(this_con_id,junk,this_con);
                }

            }
            catch (std::bad_alloc&)
            {
                // make sure we remove this connection from the con_map
                {
                    auto_mutex M(m);
                    if (con_map.is_in_domain(this_con_id))
                    {
                        connection* this_con;
                        uint64 junk;
                        con_map.remove(this_con_id,junk,this_con);
                    }
                }

                _dLog << LERROR << "We ran out of memory in server_iostream::on_connect()";
                // if this is an escaped exception from on_connect then let it fly! 
                // Seriously though, this way it is obvious to the user that something bad happened
                // since they probably won't have the dlib logger enabled.
                if (!my_fault)
                    throw;
            }
        }

        uint64 next_id;
        id_map con_map;
        const static logger _dLog;
        mutex m;
        

    };


}

#ifdef NO_MAKEFILE
#include "server_iostream.cpp"
#endif

#endif // DLIB_SERVER_IOSTREAm_1_



