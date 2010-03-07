// Copyright (C) 2006  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_SERVER_HTTp_ABSTRACT_
#ifdef DLIB_SERVER_HTTp_ABSTRACT_


#include "server_iostream_abstract.h"
#include <iostream>
#include <sstream>
#include <string>

namespace dlib
{

    template <
        typename server_base,
        typename map_ss_type,
        typename queue_string_type
        >
    class server_http : public server_base 
    {

        /*!
            REQUIREMENTS ON server_base 
                is an implementation of server/server_iostream_abstract.h

            REQUIREMENTS ON map_ss_type
                is an implementation of map/map_kernel_abstract.h with 
                domain set to std::string and range set to std::string

            REQUIREMENTS ON queue_string_type
                is an implementation of queue/queue_kernel_abstract.h with 
                T set to std::string 

            WHAT THIS EXTENSION DOES FOR SERVER IOSTREAM
                This extension turns the server object into a simple HTTP server.
                It only handles HTTP GET and POST requests and each incoming request triggers the
                on_request() callback.  

            COOKIE STRINGS
                The strings returned in the new_cookies queue should be of the following form:
                    cookie_name=cookie contents; expires=Fri, 31-Dec-2010 23:59:59 GMT; path=/; domain=.example.net

                You don't have to supply all the extra cookie arguments.  So if you just want to
                set a cookie that will expire when the client's browser is closed you can 
                use a string such as "cookie_name=cookie contents" 

            HTTP HEADERS
                The HTTP headers in the incoming_headers and response_headers are the name/value pairs
                of HTTP headers.  For example, the HTTP header "Content-Type: text/html" would be
                encoded such that response_headers["Content-Type"] == "text/html". 

                Also note that if you wish to change the content type of your response to the 
                client you may do so by setting the "Content-Type" header to whatever you like. 
                However, setting this field manually is not necessary as it will default to 
                "text/html" if you don't explicitly set it to something.
        !*/

    public:
        typedef map_ss_type map_type;
        typedef queue_string_type queue_type;

    private:

        void on_request (
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
        /*!
            requires
                - on_request() is called when there is an HTTP GET or POST request to be serviced 
                - path == the path being requested by this request
                - queries == a map that contains all the key/value pairs in the query string
                  of this request.  The key and value strings of the query string will
                  have been decoded back into their original form before being sent to this
                  function (i.e. '+' decoded back to ' ' and "%hh" into its corresponding 
                  ascii value)
                - cookies == The set of cookies that came from the client along with this 
                  request.
                - foreign_ip == the foreign ip address for this request 
                - foreign_port == the foreign port number for this request
                - local_ip == the IP of the local interface this request is coming in on 
                - local_port == the local port number this request is coming in on 
                - on_request() is run in its own thread 
                - is_running() == true 
                - the number of current on_request() functions running < get_max_connection() 
                - new_cookies.size() == 0
                - response_headers.size() == 0
                - incoming_headers == a map that contains all the incoming HTTP headers 
                  from the client web browser.  
            ensures
                - #result == the HTML page to be displayed as the response to this request. 
                - this function will not call clear()  
                - #new_cookies == a set of new cookies to pass back to the client along
                  with the result of this request.  
                - #response_headers == a set of additional headers you wish to appear in the
                  HTTP response to this request.  (This may be empty)
            throws
                - does not throw any exceptions
        !*/

    };

}

#endif // DLIB_SERVER_HTTp_ABSTRACT_ 



