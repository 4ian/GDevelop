// Copyright (C) 2006  Davis E. King (davis@dlib.net), Steven Van Ingelgem
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_SERVER_HTTp_ABSTRACT_
#ifdef DLIB_SERVER_HTTp_ABSTRACT_

#include "server_iostream_abstract.h"
#include <iostream>
#include <string>
#include <map>

namespace dlib
{

// -----------------------------------------------------------------------------------------

    template <
        typename Key, 
        typename Value, 
        typename Comparer = std::less<Key> 
        >
    class constmap : public std::map<Key, Value, Comparer>
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This is simply an extension to the std::map that allows you 
                to use the operator[] accessor with a constant map.  
        !*/
    public:

        const Value& operator[](
            const Key& k
        ) const;
        /*!
            ensures
                - if (this->find(k) != this->end()) then
                    - This map contains the given key
                    - return the value associated with the given key
                - else
                    - return a default initialized Value object
        !*/

        Value& operator[](
            const Key& k
        ) { return std::map<Key, Value>::operator [](k); }
        /*!
            ensures
                - This function does the same thing as the normal std::map operator[]
                  function.
                - if (this->find(k) != this->end()) then
                    - This map contains the given key
                    - return the value associated with the given key
                - else
                    - Adds a new entry into the map that is associated with the
                      given key.  The new entry will be default initialized and
                      this function returns a reference to it.
        !*/ 
    };

    typedef constmap<std::string, std::string> key_value_map;
    // This version of key_value_map treats the key string as being case-insensitive.
    // For example, a key string of "Content-Type" would access the same element as a key
    // of "content-type".
    typedef constmap<std::string, std::string, less_case_insensitive> key_value_map_ci;

// -----------------------------------------------------------------------------------------

    struct incoming_things 
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object contains all the various bits of information that describe a
                HTTP request that comes into a web server.

                For a detailed discussion of the fields of this object, see the
                server_http::on_request() method defined later in this file.
        !*/

        incoming_things (
            const std::string& foreign_ip_,
            const std::string& local_ip_,
            unsigned short foreign_port_,
            unsigned short local_port_
        );
        /*!
            ensures
                - #foreign_ip = foreign_ip_
                - #foreign_port = foreign_port_
                - #local_ip = local_ip_
                - #local_port = local_port_
        !*/
            
        std::string path;
        std::string request_type;
        std::string content_type;
        std::string protocol;
        std::string body;

        key_value_map    queries;
        key_value_map    cookies;
        key_value_map_ci headers;

        std::string    foreign_ip;
        unsigned short foreign_port;
        std::string    local_ip;
        unsigned short local_port;
    };

    struct outgoing_things 
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object contains all the various bits of information that describe a
                HTTP response from a web server.

                For a detailed discussion of the fields of this object, see the
                server_http::on_request() method defined later in this file.
        !*/

        outgoing_things(
        );
        /*!
            ensures
                - #http_return == 200
                - #http_return_status == "OK"
        !*/

        key_value_map    cookies;
        key_value_map_ci headers;
        unsigned short   http_return;
        std::string      http_return_status;
    };

// -----------------------------------------------------------------------------------------

    class http_parse_error : public error 
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This is an exception thrown by the parse_http_request() routine if 
                there is a problem.
        !*/
    };

// -----------------------------------------------------------------------------------------

    unsigned long parse_http_request ( 
        std::istream& in,
        incoming_things& incoming,
        unsigned long max_content_length
    );
    /*!
        ensures
            - Attempts to read a HTTP GET, POST, or PUT request from the given input
              stream.
            - Reads all headers of the request and puts them into #incoming.  In particular,
              this function populates the following fields:
                - #incoming.path
                - #incoming.request_type
                - #incoming.content_type
                - #incoming.protocol
                - #incoming.queries
                - #incoming.cookies
                - #incoming.headers
            - This function also populates the #incoming.body field if and only if the
              Content-Type field is equal to "application/x-www-form-urlencoded".
              Otherwise, the content is not read from the stream.
        throws
            - http_parse_error
                This exception is thrown if the Content-Length coming from the web
                browser is greater than max_content_length or if any other problem
                is detected with the request.
    !*/

    void read_body (
        std::istream& in,
        incoming_things& incoming
    );
    /*!
        requires
            - parse_http_request(in,incoming,max_content_length) has already been called
              and therefore populated the fields of incoming.
        ensures
            - if (incoming.body has already been populated with the content of an HTTP
              request) then
                - this function does nothing
            - else
                - reads the body of the HTTP request into #incoming.body.
    !*/

    void write_http_response (
        std::ostream& out,
        outgoing_things outgoing,
        const std::string& result
    );
    /*!
        ensures
            - Writes an HTTP response, defined by the data in outgoing, to the given output
              stream.
            - The result variable is written out as the content of the response.
    !*/

    void write_http_response (
        std::ostream& out,
        const http_parse_error& e 
    );
    /*!
        ensures
            - Writes an HTTP error response based on the information in the exception 
              object e.
    !*/

    void write_http_response (
        std::ostream& out,
        const std::exception& e 
    );
    /*!
        ensures
            - Writes an HTTP error response based on the information in the exception
              object e.
    !*/

// -----------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------

    class server_http : public server_iostream 
    {

        /*!
            WHAT THIS EXTENSION DOES FOR server_iostream
                This extension turns the server object into a simple HTTP server.  It only
                handles HTTP GET, PUT and POST requests and each incoming request triggers
                the on_request() callback.  

            COOKIE STRINGS
                The strings returned in the cookies key_value_map should be of the following form:
                    key:   cookie_name
                    value: cookie contents; expires=Fri, 31-Dec-2010 23:59:59 GMT; path=/; domain=.example.net

                You don't have to supply all the extra cookie arguments.  So if you just want to
                set a cookie that will expire when the client's browser is closed you can 
                just say something like incoming.cookies["cookie_name"] = "cookie contents";

            HTTP HEADERS
                The HTTP headers in the incoming.headers and outgoing.headers are the name/value pairs
                of HTTP headers.  For example, the HTTP header "Content-Type: text/html" would be
                encoded such that outgoing.headers["Content-Type"] == "text/html". 

                Also note that if you wish to change the content type of your response to the 
                client you may do so by setting the "Content-Type" header to whatever you like. 
                However, setting this field manually is not necessary as it will default to 
                "text/html" if you don't explicitly set it to something.
        !*/

    public:

        server_http (
        );
        /*!
            ensures
                - #get_max_content_length() == 10*1024*1024
        !*/

        unsigned long get_max_content_length (
        ) const;
        /*!
            ensures
                - returns the max allowable content length, in bytes, of the post back to
                  the web server.  If a client attempts to send more data than this then an
                  error number 413 is returned back to the client and the request is not
                  processed by the web server.
        !*/

        void set_max_content_length (
            unsigned long max_length
        );
        /*!
            ensures
                - #get_max_content_length() == max_length
        !*/

    private:

        virtual const std::string on_request (
            const incoming_things& incoming,
            outgoing_things& outgoing
        ) = 0;
        /*!
            requires
                - on_request() is called when there is an HTTP GET or POST request to be serviced 
                - on_request() is run in its own thread 
                - is_running() == true 
                - the number of current on_request() functions running < get_max_connection() 
                - in incoming: 
                    - incoming.path == the path being requested by this request
                    - incoming.request_type == the type of request, GET or POST
                    - incoming.content_type == the content type associated with this request
                    - incoming.protocol == The protocol being used by the web browser (e.g. HTTP/1.1) 
                    - incoming.body == a string that contains the data that was posted back to the
                      web server by the client (e.g. The string has the length specified by the
                      Content-Length header).
                    - incoming.body.size() < get_max_content_length()
                    - incoming.queries == a map that contains all the key/value pairs in the query 
                      string of this request.  The key and value strings of the query string will
                      have been decoded back into their original form before being sent to this
                      function (i.e. '+' decoded back to ' ' and "%hh" into its corresponding 
                      ascii value.  So the URL-encoding is decoded automatically)
                    - incoming.cookies == The set of cookies that came from the client along with 
                      this request.  The cookies will have been decoded back to normal form
                      from the URL-encoding.
                    - incoming.headers == a map that contains all the incoming HTTP headers 
                      from the client web browser.  
                    - incoming.foreign_ip == the foreign ip address for this request 
                    - incoming.foreign_port == the foreign port number for this request
                    - incoming.local_ip == the IP of the local interface this request is coming in on 
                    - incoming.local_port == the local port number this request is coming in on 
                - in outgoing:
                    - outgoing.cookies.size() == 0
                    - outgoing.headers.size() == 0
                    - outgoing.http_return == 200
                    - outgoing.http_return_status == "OK"
            ensures
                - This function returns the HTML page to be displayed as the response to this request. 
                - this function will not call clear()  
                - #outgoing.cookies == a set of new cookies to pass back to the client along
                  with the result of this request.  (Note that URL-encoding is automatically applied 
                  so you don't have to do it yourself)
                - #outgoing.headers == a set of additional headers you wish to appear in the
                  HTTP response to this request.  (This may be empty, the minimum needed headers
                  will be added automatically if you don't set them)
                - outgoing.http_return and outgoing.http_return_status may be set to override the 
                  default HTTP return code of 200 OK
            throws
                - throws only exceptions derived from std::exception.  If an exception is thrown
                  then the error string from the exception is returned to the web browser.
        !*/


    // -----------------------------------------------------------------------
    //                        Implementation Notes
    // -----------------------------------------------------------------------

        virtual void on_connect (
            std::istream& in,
            std::ostream& out,
            const std::string& foreign_ip,
            const std::string& local_ip,
            unsigned short foreign_port,
            unsigned short local_port,
            uint64
        )
        /*!
            on_connect() is the function defined by server_iostream which is overloaded by
            server_http.  In particular, the server_http's implementation is shown below.
            In it you can see how the server_http parses the incoming http request, gets a
            response by calling on_request(), and sends it back using the helper routines
            defined at the top of this file.

            Therefore, if you want to modify the behavior of the HTTP server, for example,
            to do some more complex data streaming requiring direct access to the
            iostreams, then you can do so by defining your own on_connect() routine.  In
            particular, the default implementation shown below is a good starting point.
        !*/
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
                write_http_response(out, e);
            }
            catch (std::exception& e)
            {
                write_http_response(out, e);
            }
        }
    };

}

#endif // DLIB_SERVER_HTTp_ABSTRACT_ 



