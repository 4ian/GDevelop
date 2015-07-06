// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_SERVER_HTTP_CPp_
#define DLIB_SERVER_HTTP_CPp_

#include "server_http.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    namespace http_impl
    {
        inline unsigned char to_hex( unsigned char x )  
        {
            return x + (x > 9 ? ('A'-10) : '0');
        }

        const std::string urlencode( const std::string& s )  
        {
            std::ostringstream os;

            for ( std::string::const_iterator ci = s.begin(); ci != s.end(); ++ci )
            {
                if ( (*ci >= 'a' && *ci <= 'z') ||
                     (*ci >= 'A' && *ci <= 'Z') ||
                     (*ci >= '0' && *ci <= '9') )
                { // allowed
                    os << *ci;
                }
                else if ( *ci == ' ')
                {
                    os << '+';
                }
                else
                {
                    os << '%' << to_hex(*ci >> 4) << to_hex(*ci % 16);
                }
            }

            return os.str();
        }

        inline unsigned char from_hex (
            unsigned char ch
        ) 
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

        const std::string urldecode (
            const std::string& str
        ) 
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
                    const unsigned char ch1 = from_hex(str[i+1]);
                    const unsigned char ch2 = from_hex(str[i+2]);
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

        void parse_url(
            std::string word, 
            key_value_map& queries
        )
        /*!
            Parses the query string of a URL.  word should be the stuff that comes
            after the ? in the query URL.
        !*/
        {
            std::string::size_type pos;

            for (pos = 0; pos < word.size(); ++pos)
            {
                if (word[pos] == '&')
                    word[pos] = ' ';
            }

            std::istringstream sin(word);
            sin >> word;
            while (sin)
            {
                pos = word.find_first_of("=");
                if (pos != std::string::npos)
                {
                    std::string key = urldecode(word.substr(0,pos));
                    std::string value = urldecode(word.substr(pos+1));

                    queries[key] = value;
                }
                sin >> word;
            }
        }
      
        void read_with_limit(
            std::istream& in, 
            std::string& buffer, 
            int delim = '\n'
        ) 
        {
            using namespace std;
            const size_t max = 64*1024;
            buffer.clear();
            buffer.reserve(300);

            while (in.peek() != delim && in.peek() != '\n' && in.peek() != EOF && buffer.size() < max)
            {
                buffer += (char)in.get();
            }

            // if we quit the loop because the data is longer than expected or we hit EOF
            if (in.peek() == EOF)
                throw http_parse_error("HTTP field from client terminated incorrectly", 414);
            if (buffer.size() == max)
                throw http_parse_error("HTTP field from client is too long", 414);

            in.get();
            // eat any remaining whitespace
            if (delim == ' ')
            {
                while (in.peek() == ' ')
                    in.get();
            }
        }
    }

// ----------------------------------------------------------------------------------------

    unsigned long parse_http_request ( 
        std::istream& in,
        incoming_things& incoming,
        unsigned long max_content_length
    )
    {
        using namespace std;
        using namespace http_impl;
        read_with_limit(in, incoming.request_type, ' ');

        // get the path
        read_with_limit(in, incoming.path, ' ');

        // Get the HTTP/1.1 - Ignore for now...
        read_with_limit(in, incoming.protocol);

        key_value_map_ci& incoming_headers = incoming.headers;
        key_value_map& cookies          = incoming.cookies;
        std::string& path               = incoming.path;
        std::string& content_type       = incoming.content_type;
        unsigned long content_length = 0;

        string line;
        read_with_limit(in, line);
        string first_part_of_header;
        string::size_type position_of_double_point;
        // now loop over all the incoming_headers
        while (line != "\r")
        {
            position_of_double_point = line.find_first_of(':');
            if ( position_of_double_point != string::npos )
            {
                first_part_of_header = dlib::trim(line.substr(0, position_of_double_point));

                if ( !incoming_headers[first_part_of_header].empty() )
                    incoming_headers[ first_part_of_header ] += " ";
                incoming_headers[first_part_of_header] += dlib::trim(line.substr(position_of_double_point+1));

                // look for Content-Type:
                if (line.size() > 14 && strings_equal_ignore_case(line, "Content-Type:", 13))
                {
                    content_type = line.substr(14);
                    if (content_type[content_type.size()-1] == '\r')
                        content_type.erase(content_type.size()-1);
                }
                // look for Content-Length:
                else if (line.size() > 16 && strings_equal_ignore_case(line, "Content-Length:", 15))
                {
                    istringstream sin(line.substr(16));
                    sin >> content_length;
                    if (!sin)
                    {
                        throw http_parse_error("Invalid Content-Length of '" + line.substr(16) + "'", 411);
                    }

                    if (content_length > max_content_length)
                    {
                        std::ostringstream sout;
                        sout << "Content-Length of post back is too large.  It must be less than " << max_content_length;
                        throw http_parse_error(sout.str(), 413);
                    }
                }
                // look for any cookies
                else if (line.size() > 6 && strings_equal_ignore_case(line, "Cookie:", 7))
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
                                cookies[urldecode(key)] = urldecode(value);
                                seen_equal_sign = false;
                                seen_key_start = false;
                                key.clear();
                                value.clear();
                            }
                            else
                            {
                                value += line[pos];
                            }
                        }
                    }
                    if (key.size() > 0)
                    {
                        cookies[urldecode(key)] = urldecode(value);
                        key.clear();
                        value.clear();
                    }
                }
            } // no ':' in it!
            read_with_limit(in, line);
        } // while (line != "\r")


        // If there is data being posted back to us as a query string then
        // pick out the queries using parse_url.
        if ((strings_equal_ignore_case(incoming.request_type, "POST") || 
             strings_equal_ignore_case(incoming.request_type, "PUT")) && 
            strings_equal_ignore_case(left_substr(content_type,";"), "application/x-www-form-urlencoded"))
        {
            if (content_length > 0)
            {
                incoming.body.resize(content_length);
                in.read(&incoming.body[0],content_length);
            }
            parse_url(incoming.body, incoming.queries);
        }

        string::size_type pos = path.find_first_of("?");
        if (pos != string::npos)
        {
            parse_url(path.substr(pos+1), incoming.queries);
        }


        if (!in)
            throw http_parse_error("Error parsing HTTP request", 500);

        return content_length;
    }

// ----------------------------------------------------------------------------------------

    void read_body (
        std::istream& in,
        incoming_things& incoming
    )
    {
        // if the body hasn't already been loaded and there is data to load
        if (incoming.body.size() == 0 &&
            incoming.headers.count("Content-Length") != 0)
        {
            const unsigned long content_length = string_cast<unsigned long>(incoming.headers["Content-Length"]);

            incoming.body.resize(content_length);
            if (content_length > 0)
            {
                in.read(&incoming.body[0],content_length);
            }
        }
    }

// ----------------------------------------------------------------------------------------

    void write_http_response (
        std::ostream& out,
        outgoing_things outgoing,
        const std::string& result
    )
    {
        using namespace http_impl;
        key_value_map& new_cookies      = outgoing.cookies;
        key_value_map_ci& response_headers = outgoing.headers;

        // only send this header if the user hasn't told us to send another kind
        bool has_content_type = false, has_location = false;
        for(key_value_map_ci::const_iterator ci = response_headers.begin(); ci != response_headers.end(); ++ci )
        {
            if ( !has_content_type && strings_equal_ignore_case(ci->first , "content-type") )
            {
                has_content_type = true;
            }
            else if ( !has_location && strings_equal_ignore_case(ci->first , "location") )
            {
                has_location = true;
            }
        }

        if ( has_location )
        {
            outgoing.http_return = 302;
        }

        if ( !has_content_type )
        {
            response_headers["Content-Type"] = "text/html";
        }

        response_headers["Content-Length"] = cast_to_string(result.size());

        out << "HTTP/1.0 " << outgoing.http_return << " " << outgoing.http_return_status << "\r\n";

        // Set any new headers
        for(key_value_map_ci::const_iterator ci = response_headers.begin(); ci != response_headers.end(); ++ci )
        {
            out << ci->first << ": " << ci->second << "\r\n";
        }

        // set any cookies 
        for(key_value_map::const_iterator ci = new_cookies.begin(); ci != new_cookies.end(); ++ci )
        {
            out << "Set-Cookie: " << urlencode(ci->first) << '=' << urlencode(ci->second) << "\r\n";
        }
        out << "\r\n" << result;
    }

// ----------------------------------------------------------------------------------------

    void write_http_response (
        std::ostream& out,
        const http_parse_error& e 
    )
    {
        outgoing_things outgoing;
        outgoing.http_return = e.http_error_code;
        outgoing.http_return_status = e.what();
        write_http_response(out, outgoing, std::string("Error processing request: ") + e.what());
    }

// ----------------------------------------------------------------------------------------

    void write_http_response (
        std::ostream& out,
        const std::exception& e 
    )
    {
        outgoing_things outgoing;
        outgoing.http_return = 500;
        outgoing.http_return_status = e.what();
        write_http_response(out, outgoing, std::string("Error processing request: ") + e.what());
    }

// ----------------------------------------------------------------------------------------

    const logger server_http::dlog("dlib.server_http");

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_SERVER_HTTP_CPp_

