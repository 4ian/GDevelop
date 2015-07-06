// Copyright (C) 2006  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_SOCKETS_EXTENSIONs_CPP
#define DLIB_SOCKETS_EXTENSIONs_CPP

#include <string>
#include <sstream>
#include "../sockets.h"
#include "../error.h"
#include "sockets_extensions.h"
#include "../timer.h"
#include "../algs.h"
#include "../timeout.h"
#include "../misc_api.h"
#include "../serialize.h"
#include "../string.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    network_address::
    network_address(
        const std::string& full_address
    )
    {
        std::istringstream sin(full_address);
        sin >> *this;
        if (!sin || sin.peek() != EOF)
            throw invalid_network_address("invalid network address: " + full_address);
    }

// ----------------------------------------------------------------------------------------

    void serialize(
        const network_address& item,
        std::ostream& out
    )
    {
        serialize(item.host_address, out);
        serialize(item.port, out);
    }

// ----------------------------------------------------------------------------------------

    void deserialize(
        network_address& item,
        std::istream& in 
    )
    {
        deserialize(item.host_address, in);
        deserialize(item.port, in);
    }

// ----------------------------------------------------------------------------------------

    std::ostream& operator<< (
        std::ostream& out,
        const network_address& item
    )
    {
        out << item.host_address << ":" << item.port;
        return out;
    }

// ----------------------------------------------------------------------------------------

    std::istream& operator>> (
        std::istream& in,
        network_address& item
    )
    {
        std::string temp;
        in >> temp;

        std::string::size_type pos = temp.find_last_of(":");
        if (pos == std::string::npos)
        {
            in.setstate(std::ios::badbit);
            return in;
        }

        item.host_address = temp.substr(0, pos);
        try
        {
            item.port = sa = temp.substr(pos+1);
        } catch (std::exception& )
        {
            in.setstate(std::ios::badbit);
            return in;
        }


        return in;
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    connection* connect (
        const std::string& host_or_ip,
        unsigned short port
    )
    {
        std::string ip;
        connection* con;
        if (is_ip_address(host_or_ip))
        {
            ip = host_or_ip;
        }
        else
        {
            if( hostname_to_ip(host_or_ip,ip))
                throw socket_error(ERESOLVE,"unable to resolve '" + host_or_ip + "' in connect()");
        }

        if(create_connection(con,port,ip))
        {
            std::ostringstream sout;
            sout << "unable to connect to '" << host_or_ip << ":" << port << "'";
            throw socket_error(sout.str()); 
        }

        return con;
    }

// ----------------------------------------------------------------------------------------

    connection* connect (
        const network_address& addr
    )
    {
        return connect(addr.host_address, addr.port);
    }

// ----------------------------------------------------------------------------------------

    namespace connect_timeout_helpers
    {
        mutex connect_mutex;
        signaler connect_signaler(connect_mutex);
        timestamper ts;
        long outstanding_connects = 0;

        struct thread_data
        {
            std::string host_or_ip;
            unsigned short port;
            connection* con;
            bool connect_ended;
            bool error_occurred;
        };

        void thread(void* param)
        {
            thread_data p = *static_cast<thread_data*>(param);
            try
            {
                p.con = connect(p.host_or_ip, p.port); 
            }
            catch (...)
            {
                p.error_occurred = true;
            }

            auto_mutex M(connect_mutex);
            // report the results back to the connect() call that spawned this
            // thread.
            static_cast<thread_data*>(param)->con = p.con;
            static_cast<thread_data*>(param)->error_occurred = p.error_occurred;
            connect_signaler.broadcast();

            // wait for the call to connect() that spawned this thread to terminate
            // before we delete the thread_data struct.
            while (static_cast<thread_data*>(param)->connect_ended == false)
                connect_signaler.wait();

            connect_signaler.broadcast();
            --outstanding_connects;
            delete static_cast<thread_data*>(param);
        }
    }

    connection* connect (
        const std::string& host_or_ip,
        unsigned short port,
        unsigned long timeout
    )
    {
        using namespace connect_timeout_helpers;

        auto_mutex M(connect_mutex);

        const uint64 end_time = ts.get_timestamp() + timeout*1000;


        // wait until there are less than 100 outstanding connections
        while (outstanding_connects > 100)
        {
            uint64 cur_time = ts.get_timestamp();
            if (end_time > cur_time)
            {
                timeout = static_cast<unsigned long>((end_time - cur_time)/1000);
            }
            else
            {
                throw socket_error("unable to connect to '" + host_or_ip + "' because connect timed out"); 
            }
            
            connect_signaler.wait_or_timeout(timeout);
        }

        
        thread_data* data = new thread_data;
        data->host_or_ip = host_or_ip.c_str();
        data->port = port;
        data->con = 0;
        data->connect_ended = false;
        data->error_occurred = false;


        if (create_new_thread(thread, data) == false)
        {
            delete data;
            throw socket_error("unable to connect to '" + host_or_ip); 
        }

        ++outstanding_connects;

        // wait until we have a connection object 
        while (data->con == 0)
        {
            uint64 cur_time = ts.get_timestamp();
            if (end_time > cur_time && data->error_occurred == false)
            {
                timeout = static_cast<unsigned long>((end_time - cur_time)/1000);
            }
            else
            {
                // let the thread know that it should terminate
                data->connect_ended = true;
                connect_signaler.broadcast();
                if (data->error_occurred)
                    throw socket_error("unable to connect to '" + host_or_ip); 
                else
                    throw socket_error("unable to connect to '" + host_or_ip + "' because connect timed out"); 
            }

            connect_signaler.wait_or_timeout(timeout);
        }

        // let the thread know that it should terminate
        data->connect_ended = true;
        connect_signaler.broadcast();
        return data->con;
    }

// ----------------------------------------------------------------------------------------

    bool is_ip_address (
        std::string ip
    )
    {
        for (std::string::size_type i = 0; i < ip.size(); ++i)
        {
            if (ip[i] == '.')
                ip[i] = ' ';
        }
        std::istringstream sin(ip);
        
        bool bad = false;
        int num;
        for (int i = 0; i < 4; ++i)
        {
            sin >> num;
            if (!sin || num < 0 || num > 255)
            {
                bad = true;
                break;
            }
        }

        if (sin.get() != EOF)
            bad = true;
        
        return !bad;
    }

// ----------------------------------------------------------------------------------------

    void close_gracefully (
        connection* con,
        unsigned long timeout 
    )
    {
        scoped_ptr<connection> ptr(con);
        close_gracefully(ptr,timeout);
    }

// ----------------------------------------------------------------------------------------

    void close_gracefully (
        scoped_ptr<connection>& con,
        unsigned long timeout 
    )
    {
        if (!con)
            return;

        if(con->shutdown_outgoing())
        {
            // there was an error so just close it now and return
            con.reset();
            return;
        }

        try
        {
            dlib::timeout t(*con,&connection::shutdown,timeout);

            char junk[100];
            // wait for the other end to close their side
            while (con->read(junk,sizeof(junk)) > 0) ;
        }
        catch (...)
        {
            con.reset();
            throw;
        }

        con.reset();
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_SOCKETS_EXTENSIONs_CPP


