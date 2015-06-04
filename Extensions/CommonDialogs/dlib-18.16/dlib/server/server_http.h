// Copyright (C) 2006  Davis E. King (davis@dlib.net), Steven Van Ingelgem
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_SERVER_HTTp_1_
#define DLIB_SERVER_HTTp_1_


#include "server_http_abstract.h"
#include <iostream>
#include <sstream>
#include <string>
#include <cctype>
#include <map>
#include "../logger.h"
#include "../string.h"
#include "server_iostream.h"

#ifdef  __INTEL_COMPILER
// ignore the bogus warning about hiding on_connect()
#pragma warning (disable: 1125)
#endif

#if _MSC_VER
#  pragma warning( disable: 4503 )
#endif // _MSC_VER


namespace dlib
{

// ----------------------------------------------------------------------------------------

    class http_parse_error : public error
    {
    public:
        http_parse_error(const std::string& str, int http_error_code_):
            error(str),http_error_code(http_error_code_) {}

        const int http_error_code;
    };

// ----------------------------------------------------------------------------------------

    template <typename Key, typename Value, typename Comparer = std::less<Key> >
    class constmap : public std::map<Key, Value, Comparer>
    {
    public:
        const Value& operator[](const Key& k) const
        {
            static const Value dummy = Value();

            typename std::map<Key, Value, Comparer>::const_iterator ci = std::map<Key, Value, Comparer>::find(k);

            if ( ci == this->end() )
                return dummy;
            else
                return ci->second;
        }

        Value& operator[](const Key& k)
        {
            return std::map<Key, Value, Comparer>::operator [](k);
        }
    };


    class less_case_insensitive 
    {
    public:
        bool operator()(const std::string& a, const std::string& b) const 
        {
            unsigned long i = 0;
            while (i < a.size() && i < b.size())
            {
                const int cha = std::tolower(a[i]);
                const int chb = std::tolower(b[i]);
                if (cha < chb)
                    return true;
                else if (cha > chb)
                    return false;
                ++i;
            }
            if (a.size() < b.size())
                return true;
            else
                return false;
        }
    };
    typedef constmap< std::string, std::string, less_case_insensitive > key_value_map_ci;
    typedef constmap< std::string, std::string > key_value_map;

    struct incoming_things 
    {
        incoming_things (
            const std::string& foreign_ip_,
            const std::string& local_ip_,
            unsigned short foreign_port_,
            unsigned short local_port_
        ): 
            foreign_ip(foreign_ip_),
            foreign_port(foreign_port_),
            local_ip(local_ip_),
            local_port(local_port_)
        {}
            

        std::string path;
        std::string request_type;
        std::string content_type;
        std::string protocol;
        std::string body;

        key_value_map queries;
        key_value_map cookies;
        key_value_map_ci headers;

        std::string foreign_ip;
        unsigned short foreign_port;
        std::string local_ip;
        unsigned short local_port;
    };

    struct outgoing_things 
    {
        outgoing_things() : http_return(200), http_return_status("OK") { }

        key_value_map  cookies;
        key_value_map_ci  headers;
        unsigned short http_return;
        std::string    http_return_status;
    };

// ----------------------------------------------------------------------------------------

    unsigned long parse_http_request ( 
        std::istream& in,
        incoming_things& incoming,
        unsigned long max_content_length
    );

    void read_body (
        std::istream& in,
        incoming_things& incoming
    );

    void write_http_response (
        std::ostream& out,
        outgoing_things outgoing,
        const std::string& result
    );

    void write_http_response (
        std::ostream& out,
        const http_parse_error& e 
    );

    void write_http_response (
        std::ostream& out,
        const std::exception& e 
    );

// ----------------------------------------------------------------------------------------

    class server_http : public server_iostream 
    {

    public:

        server_http()
        {
            max_content_length = 10*1024*1024; // 10MB
        }

        unsigned long get_max_content_length (
        ) const 
        { 
            auto_mutex lock(http_class_mutex);
            return max_content_length; 
        }

        void set_max_content_length (
            unsigned long max_length
        )
        {
            auto_mutex lock(http_class_mutex);
            max_content_length = max_length;
        }


    private:
        virtual const std::string on_request (
            const incoming_things& incoming,
            outgoing_things& outgoing
        ) = 0;

      
        virtual void on_connect (
            std::istream& in,
            std::ostream& out,
            const std::string& foreign_ip,
            const std::string& local_ip,
            unsigned short foreign_port,
            unsigned short local_port,
            uint64
        )
        {
            try
            {
                incoming_things incoming(foreign_ip, local_ip, foreign_port, local_port);
                outgoing_things outgoing;

                parse_http_request(in, incoming, get_max_content_length());
                read_body(in, incoming);
                const std::string& result = on_request(incoming, outgoing);
                write_http_response(out, outgoing, result);
            }
            catch (http_parse_error& e)
            {
                dlog << LERROR << "Error processing request from: " << foreign_ip << " - " << e.what();
                write_http_response(out, e);
            }
            catch (std::exception& e)
            {
                dlog << LERROR << "Error processing request from: " << foreign_ip << " - " << e.what();
                write_http_response(out, e);
            }
        }

        mutex http_class_mutex;
        unsigned long max_content_length;
        const static logger dlog;
    };

// ----------------------------------------------------------------------------------------

}

#ifdef NO_MAKEFILE
#include "server_http.cpp"
#endif

#endif // DLIB_SERVER_HTTp_1_

