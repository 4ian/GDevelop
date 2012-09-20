// Copyright (C) 2006  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_SERVER_HTTp_1_
#define DLIB_SERVER_HTTp_1_


#include "server_iostream_abstract.h"
#include "server_http_abstract.h"
#include <iostream>
#include <sstream>
#include <string>
#include "../logger.h"

#ifdef  __INTEL_COMPILER
// ignore the bogus warning about hiding on_connect()
#pragma warning (disable: 1125)
#endif

namespace dlib
{

    template <
        typename server_base,
        typename map_ss_type,
        typename queue_string_type
        >
    class server_http_1 : public server_base 
    {

        /*!
            CONVENTION
                this extension doesn't add any new state to this object.
        !*/


    public:
        typedef map_ss_type map_type;
        typedef queue_string_type queue_type;

    private:

        virtual void on_request (
            const std::string& path,
            std::string& result,
            const map_type& queries,
            const map_type& cookies,
            queue_type& new_cookies,
            const map_type& incoming_headers,
            map_type& response_headers,
            const std::string& foreign_ip,
            const std::string& local_ip,
            unsigned short foreign_port,
            unsigned short local_port
        ) = 0;

        unsigned char to_hex (
            unsigned char ch
        ) const
        {
            if (ch <= '9' && ch >= '0')
                ch -= '0';
            else if (ch <= 'f' && ch >= 'a')
                ch -= 'a' - 10;
            else if (ch <= 'F' && ch >= 'A')
                ch -= 'A' - 10;
            else 
                ch = 0;
            return ch;
        }

        const std::string decode_query_string (
            const std::string& str
        ) const
        {
            using namespace std;
            string result;
            string::size_type i;
            for (i = 0; i < str.size(); ++i)
            {
                if (str[i] == '+')
                {
                    result += ' ';
                }
                else if (str[i] == '%' && str.size() > i+2)
                {
                    const unsigned char ch1 = to_hex(str[i+1]);
                    const unsigned char ch2 = to_hex(str[i+2]);
                    const unsigned char ch = (ch1 << 4) | ch2;
                    result += ch;
                    i += 2;
                }
                else
                {
                    result += str[i];
                }
            }
            return result;
        }

        void on_connect (
            std::istream& in,
            std::ostream& out,
            const std::string& foreign_ip,
            const std::string& local_ip,
            unsigned short foreign_port,
            unsigned short local_port,
            uint64
        )
        {
            bool my_fault = true;
            try
            {
                enum req_type {get, post} rtype;

                using namespace std;
                map_type cookies;
                string word;
                string path;
                in >> word;
                if (word == "GET" || word == "get")
                {
                    rtype = get;
                }
                else if ( word == "POST" || word == "post")
                {
                    rtype = post;
                }
                else
                {
                    // this isn't a GET or POST request so just drop the connection
                    return;
                }

                // get the path
                in >> path;

                // now loop over all the incoming_headers
                string line;
                getline(in,line);
                unsigned long content_length = 0;
                string content_type;
                map_type incoming_headers;
                string first_part_of_header;
                string::size_type position_of_double_point;
                while (line.size() > 2)
                {
                    position_of_double_point = line.find_first_of(':');
                    if ( position_of_double_point != string::npos )
                    {
                        first_part_of_header = line.substr(0, position_of_double_point);
                        if ( incoming_headers.is_in_domain(first_part_of_header) )
                        {
                            incoming_headers[ first_part_of_header ] += " " + line.substr(position_of_double_point+1);
                        }
                        else
                        {
                            string second_part_of_header(line.substr(position_of_double_point+1));
                            incoming_headers.add( first_part_of_header, second_part_of_header );
                        }

                        // look for Content-Type:
                        if (line.size() > 14 &&
                            line[0] == 'C' &&
                            line[1] == 'o' &&
                            line[2] == 'n' &&
                            line[3] == 't' &&
                            line[4] == 'e' &&
                            line[5] == 'n' &&
                            line[6] == 't' &&
                            line[7] == '-' &&
                            (line[8] == 'T' || line[8] == 't') &&
                            line[9] == 'y' &&
                            line[10] == 'p' &&
                            line[11] == 'e' &&
                            line[12] == ':' 
                        )
                        {
                            content_type = line.substr(14);
                            if (content_type[content_type.size()-1] == '\r')
                                content_type.erase(content_type.size()-1);
                        }
                        // look for Content-Length:
                        else if (line.size() > 16 &&
                                 line[0] == 'C' &&
                                 line[1] == 'o' &&
                                 line[2] == 'n' &&
                                 line[3] == 't' &&
                                 line[4] == 'e' &&
                                 line[5] == 'n' &&
                                 line[6] == 't' &&
                                 line[7] == '-' &&
                                 (line[8] == 'L' || line[8] == 'l') &&
                                 line[9] == 'e' &&
                                 line[10] == 'n' &&
                                 line[11] == 'g' &&
                                 line[12] == 't' &&
                                 line[13] == 'h' &&
                                 line[14] == ':' 
                        )
                        {
                            istringstream sin(line.substr(16));
                            sin >> content_length;
                            if (!sin)
                                content_length = 0;
                        }
                        // look for any cookies
                        else if (line.size() > 6 &&
                                 line[0] == 'C' &&
                                 line[1] == 'o' &&
                                 line[2] == 'o' &&
                                 line[3] == 'k' &&
                                 line[4] == 'i' &&
                                 line[5] == 'e' &&
                                 line[6] == ':' 
                        )
                        {
                            string::size_type pos = 6;
                            string key, value;
                            bool seen_key_start = false;
                            bool seen_equal_sign = false;
                            while (pos + 1 < line.size())
                            {
                                ++pos;
                                // ignore whitespace between cookies
                                if (!seen_key_start && line[pos] == ' ')
                                    continue;

                                seen_key_start = true;
                                if (!seen_equal_sign) 
                                {
                                    if (line[pos] == '=')
                                    {
                                        seen_equal_sign = true;
                                    }
                                    else
                                    {
                                        key += line[pos];
                                    }
                                }
                                else
                                {
                                    if (line[pos] == ';')
                                    {
                                        if (cookies.is_in_domain(key) == false)
                                            cookies.add(key,value);
                                        seen_equal_sign = false;
                                        seen_key_start = false;
                                    }
                                    else
                                    {
                                        value += line[pos];
                                    }
                                }
                            }
                            if (key.size() > 0 && cookies.is_in_domain(key) == false)
                                cookies.add(key,value);
                        }
                    } // no ':' in it!
                    getline(in,line);
                } // while (line.size() > 2 )

                // If there is data being posted back to us as a query string then
                // just stick it onto the end of the path so the following code can
                // then just pick it out like we do for GET requests.
                if (rtype == post && content_type == "application/x-www-form-urlencoded" 
                    && content_length > 0)
                {
                    line.resize(content_length);
                    in.read(&line[0],content_length);
                    path += "?" + line;
                }

                string result;
                map_type queries;
                string::size_type pos = path.find_first_of("?");
                if (pos != string::npos)
                {
                    word = path.substr(pos+1);
                    path = path.substr(0,pos);
                    for (pos = 0; pos < word.size(); ++pos)
                    {
                        if (word[pos] == '&')
                            word[pos] = ' ';
                    }

                    istringstream sin(word);
                    sin >> word;
                    while (sin)
                    {
                        pos = word.find_first_of("=");
                        if (pos != string::npos)
                        {
                            string key = decode_query_string(word.substr(0,pos));
                            string value = decode_query_string(word.substr(pos+1));
                            if (queries.is_in_domain(key) == false)
                                queries.add(key,value);
                        }
                        sin >> word;
                    }
                }


                my_fault = false;
                queue_type new_cookies;
                map_type response_headers;
                // if there wasn't a problem with the input stream at some point
                // then lets trigger this request callback.
                if (in)
                    on_request(path,result,queries,cookies,new_cookies,incoming_headers, response_headers, foreign_ip,local_ip,foreign_port,local_port);
                my_fault = true;

                out << "HTTP/1.0 200 OK\r\n";
                // only send this header if the user hasn't told us to send another kind
                if (response_headers.is_in_domain("Content-Type") == false && 
                    response_headers.is_in_domain("content-type") == false)
                {
                    out << "Content-Type: text/html\r\n";
                }
                out << "Content-Length: " << result.size() << "\r\n";

                // Set any new headers
                response_headers.reset();
                while (response_headers.move_next())
                    out << response_headers.element().key() << ':' << response_headers.element().value() << "\r\n";

                // set any cookies 
                new_cookies.reset();
                while (new_cookies.move_next())
                {
                    out << "Set-Cookie: " << new_cookies.element() << "\r\n";
                }
                out << "\r\n" << result;
            }
            catch (std::bad_alloc&)
            {
                dlog << LERROR << "We ran out of memory in server_http::on_connect()";
                // If this is an escaped exception from on_request then let it fly! 
                // Seriously though, this way it is obvious to the user that something bad happened
                // since they probably won't have the dlib logger enabled.
                if (!my_fault)
                    throw;
            }

        }

        const static logger dlog;
    };

    template <
        typename server_base,
        typename map_ss_type,
        typename queue_string_type
        >
    const logger server_http_1<server_base,map_ss_type,queue_string_type>::dlog("dlib.server");
}

#endif // DLIB_SERVER_HTTp_1_











