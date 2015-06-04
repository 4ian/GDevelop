

#include "../sockets.h"
#include "../string.h"
#include "../logger.h"
#include "../sockstreambuf.h"
#include "../timeout.h"
#include "http_client.h"
#include <time.h>
#include <stdio.h>
#include <fstream>
#include <sstream>
#include <iostream>

namespace dlib
{

    typedef dlib::shared_ptr<dlib::timeout> timeout_ptr;


#ifdef _MSC_VER
#define BR_CASECMP strnicmp
#else
#define BR_CASECMP strncasecmp
#endif
// Default timeout after 60 seconds
#define DEFAULT_TIMEOUT 60000

// ----------------------------------------------------------------------------------------

    inline bool isXdigit( char c )
    {
        return  (c >= '0' && c <= '9') ||
                (c >= 'A' && c <= 'Z') ||
                (c >= 'a' && c <= 'z');
    }

// ----------------------------------------------------------------------------------------

    std::string http_client::urldecode( const std::string& s )
    {
        std::stringstream ss;

        for ( char const * p_read = s.c_str(), * p_end = (s.c_str() + s.size()); p_read < p_end; p_read++ )
        {
            if ( p_read[0] == '%' && p_read+1 != p_end && p_read+2 != p_end && isXdigit(p_read[1]) && isXdigit(p_read[2]) )
            {
                ss << static_cast<char>((( (p_read[1] & 0xf) + ((p_read[1] >= 'A') ? 9 : 0) ) << 4 ) | ( (p_read[2] & 0xf) + ((p_read[2] >= 'A') ? 9 : 0) ));
                p_read += 2;
            }
            else if ( p_read[0] == '+' )
            {
                // Undo the encoding that replaces spaces with plus signs.
                ss << ' ';
            }
            else
            {
                ss << p_read[0];
            }
        }

        return ss.str();
    }

// ----------------------------------------------------------------------------------------

//! \return modified string ``s'' with spaces trimmed from left
    inline std::string& triml(std::string& s)
    {
        int pos(0);
        for ( ; s[pos] == ' ' || s[pos] == '\t' || s[pos] == '\r' || s[pos] == '\n' ; ++pos );
        s.erase(0, pos);
        return s;
    }

// ----------------------------------------------------------------------------------------

//! \return modified string ``s'' with spaces trimmed from right
    inline std::string& trimr(std::string& s)
    {
        int pos(s.size());
        for ( ; pos && (s[pos-1] == ' ' || s[pos-1] == '\t' || s[pos-1] == '\r' || s[pos-1] == '\n') ; --pos );
        s.erase(pos, s.size()-pos);
        return s;
    }

// ----------------------------------------------------------------------------------------

//! \return modified string ``s'' with spaces trimmed from edges
    inline std::string& trim(std::string& s)
    {
        return triml(trimr(s));
    }

// ----------------------------------------------------------------------------------------

    http_client::
    http_client(
    ) : 
        http_return(0),
        timeout(DEFAULT_TIMEOUT),
        OnDownload(0)
    {
    }

// ----------------------------------------------------------------------------------------

    std::string http_client::get_header(const std::string& header_name) const
    {
        stringmap::const_iterator ci = headers.find(header_name);
        return ci != headers.end() ? ci->second : std::string();
    }

// ----------------------------------------------------------------------------------------

    void http_client::set_header(const std::string& header_name, long header_value)
    {
        char buf[21] = { 0 };
#ifdef __WXMSW__
        ::ltoa(header_value, buf, 10);
#else
        sprintf(buf, "%ld", header_value);
#endif
        set_header(header_name, buf);
    }

// ----------------------------------------------------------------------------------------

    void http_client::set_header(const std::string& header_name, const std::string& header_value)
    {
        headers[header_name] = header_value;
    }

// ----------------------------------------------------------------------------------------

    bool http_client::is_header_set(const std::string& header_name) const
    {
        stringmap::const_iterator ci = headers.find(header_name);
        return ci != headers.end() && !ci->second.empty();
    }

// ----------------------------------------------------------------------------------------

    void http_client::remove_header(const std::string& header_name)
    {
        headers.erase(header_name);
    }

// ----------------------------------------------------------------------------------------

    void http_client::set_cookie(const std::string& cookie_name, long cookie_value)
    {
        char buf[21] = { 0 };
#ifdef __WXMSW__
        ::ltoa(cookie_value, buf, 10);
#else
        sprintf(buf, "%ld", cookie_value);
#endif
        set_cookie(cookie_name, buf);
    }

// ----------------------------------------------------------------------------------------

    void http_client::set_cookie(const std::string& cookie_name, const std::string& cookie_value)
    {
        cookies[cookie_name] = cookie_value;
    }

// ----------------------------------------------------------------------------------------

    void http_client::remove_cookie(const std::string& cookie_name)
    {
        cookies.erase(cookie_name);
    }

// ----------------------------------------------------------------------------------------

// POST
    const std::string& http_client::post_url (const std::string& url, const string_to_stringmap& postvars, const string_to_stringmap& filenames)
    {
        std::string CT;
        std::string postBody = build_post(CT, postvars, filenames);
        set_header("Content-Type", CT);
        set_header("Content-Length", static_cast<long>(postBody.size()));

        grab_url(url, "POST", postBody);

        return returned_body;
    }

// ----------------------------------------------------------------------------------------

    const std::string& http_client::post_url (const std::string& url, const std::string& postbuffer)
    {
        if ( !is_header_set("Content-Type") ) // Maybe they just forgot it?
            set_header("Content-Type", "application/x-www-form-urlencoded");

        set_header("Content-Length", static_cast<long>(postbuffer.size()));

        grab_url(url, "POST", postbuffer);

        return returned_body;
    }

// ----------------------------------------------------------------------------------------

    std::string http_client::get_random_string( size_t length ) const
    {
        static bool has_seeded(false);
        static std::string allowed_chars("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789");

        if ( !has_seeded )
        {
            has_seeded = true;
            ::srand( static_cast<unsigned int>(::time(NULL)) );
        }

        std::string retVal; retVal.reserve(length);
        while ( retVal.size() < length )
        {
            retVal += allowed_chars[(rand() % allowed_chars.size())];
        }

        return retVal;
    }

// ----------------------------------------------------------------------------------------

// static
    std::string http_client::urlencode(const std::string& in, bool post_encode)
    {
        static std::string allowed_chars("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_");

        std::stringstream ss;
        ss << std::hex;
        for (std::string::const_iterator ci = in.begin(); ci != in.end(); ++ci)
        {
            if ( allowed_chars.find(*ci) != std::string::npos )
            {
                ss << *ci;
            }
            else if ( post_encode && *ci == ' ' )
            {
                ss << '+';
            }
            else
            {
                ss << '%' << std::setfill('0') << std::setw(2) << std::right << static_cast<int>(*ci);
            }
        }

        return ss.str();
    }

// ----------------------------------------------------------------------------------------

    std::string http_client::get_basename( const std::string& filename ) const
    {
        std::string::size_type pos = filename.find_last_of("\\/");
        if ( pos == std::string::npos )
            return filename;
        else
            return filename.substr(pos+1);
    }

// ----------------------------------------------------------------------------------------

    bool http_client::parse_url(
        const std::string& url,
        std::string& scheme,
        std::string& user,
        std::string& pass,
        std::string& host,
        short& port,
        std::string& path
    ) const
    {
        scheme.clear();
        user.clear();
        pass.clear();
        host.clear();
        path.clear();
        port = 0;

        // Find scheme
        std::string::size_type pos_scheme = url.find("://");
        if ( pos_scheme == std::string::npos )
        {
            pos_scheme = 0;
        }
        else
        {
            scheme = strtolower(url.substr(0, pos_scheme));
            pos_scheme += 3;
        }

        std::string::size_type pos_path = url.find('/', pos_scheme);
        if ( pos_path == std::string::npos )
        {
            host = url.substr(pos_scheme);
        }
        else
        {
            host = url.substr(pos_scheme, pos_path - pos_scheme);
            path = url.substr(pos_path);
        }

        std::string::size_type pos_at = host.find('@');
        if ( pos_at != std::string::npos )
        {
            std::string::size_type pos_dp = host.find(':');
            if ( pos_dp != std::string::npos && pos_dp < pos_at )
            {
                user = host.substr(0, pos_dp);
                pass = host.substr(pos_dp+1, pos_at-pos_dp-1);
            }
            else
            {
                user = host.substr(0, pos_at);
            }
            host = host.substr(pos_at+1);
        }

        std::string::size_type pos_dp = host.find(':');
        if ( pos_dp != std::string::npos )
        {
            port = dlib::string_cast<short>(host.substr(pos_dp+1));
            host = host.substr(0, pos_dp);
        }

        host = strtolower(host);

        if ( port == 0 )
        {
            if ( scheme == "http" )
                port = 80;
            else if ( scheme == "ftp" )
                port = 21;
            else if ( scheme == "https" )
                port = 443;
        }

        return !host.empty();
    }

// ----------------------------------------------------------------------------------------

    std::string http_client::strtolower(const std::string& in) const
    {
        std::string retVal = in;

        for (std::string::iterator ii = retVal.begin(); ii != retVal.end(); ++ii)
        {
            *ii = ::tolower(*ii);
        }

        return retVal;
    }

// ----------------------------------------------------------------------------------------

    std::string http_client::strtoupper(const std::string& in) const
    {
        std::string retVal = in;

        for (std::string::iterator ii = retVal.begin(); ii != retVal.end(); ++ii)
        {
            *ii = ::toupper(*ii);
        }

        return retVal;
    }

// ----------------------------------------------------------------------------------------

// GET
    const std::string& http_client::get_url(const std::string& url)
    {
        std::string CT = get_header("Content-Type");

        // You do a GET with a POST header??
        if ( CT == "application/x-www-form-urlencoded" || CT == "multipart/form-data" )
            remove_header("Content-Type");

        grab_url(url);

        return returned_body;
    }

// ----------------------------------------------------------------------------------------

    std::string http_client::build_post(std::string& content_type, const string_to_stringmap& postvars, const string_to_stringmap& filenames_in) const
    {
        if ( postvars.empty() && filenames_in.empty() )
            return std::string();

        string_to_stringmap filenames = filenames_in;

        // sanitize the files
        if ( !filenames.empty() )
        {
            string_to_stringmap::iterator var_names = filenames.begin();
            while (var_names != filenames.end())
            {
                stringmap::iterator fnames = var_names->second.begin();

                while( fnames != var_names->second.end() )
                {
                    FILE *fp = ::fopen(fnames->second.c_str(), "rb");
                    if ( fp == NULL )
                    {
                        stringmap::iterator old_one = fnames++;
                        var_names->second.erase(old_one);
                    }
                    else
                    {
                        fclose(fp);
                        ++fnames;
                    }
                }

                if ( fnames->second.empty() )
                {
                    string_to_stringmap::iterator old_one = var_names++;
                    filenames.erase(old_one);
                }
                else
                {
                    ++var_names;
                }
            }
        }

        content_type = !filenames.empty() ? "multipart/form-data" : "application/x-www-form-urlencoded";
        std::stringstream postBody;
        if ( !filenames.empty() )
        {
            std::string mime_boundary = get_random_string(32);

            // First add the form vars
            for (string_to_stringmap::const_iterator ci = postvars.begin(); ci != postvars.end(); ++ci)
            {
                for (stringmap::const_iterator si = ci->second.begin(); si != ci->second.end(); ++si)
                {
                    postBody << "--" << mime_boundary << "\r\n"
                        "Content-Disposition: form-data; name=\"" << ci->first << "\"\r\n\r\n"
                        << si->second << "\r\n";
                }
            }

            // Then add the files
            for (string_to_stringmap::const_iterator ci = filenames.begin(); ci != filenames.end(); ++ci)
            {
                for (stringmap::const_iterator si = ci->second.begin(); si != ci->second.end(); ++si)
                {
                    std::ifstream in(si->second.c_str());
                    postBody << "--" << mime_boundary << "\r\n"
                        "Content-Disposition: form-data; name=\"" << ci->first << "\"; filename=\"" << get_basename(si->second) << "\"\r\n\r\n"
                        << in << "\r\n";
                }
            }

            postBody << "--" << mime_boundary << "--\r\n";
        }
        else
        {
            // No files...
            for (string_to_stringmap::const_iterator ci = postvars.begin(); ci != postvars.end(); ++ci)
            {
                for (stringmap::const_iterator si = ci->second.begin(); si != ci->second.end(); ++si)
                {
                    postBody << urlencode(ci->first) << '=' << urlencode(si->second) << '&';
                }
            }

            // read the last '&'
            char c;
            postBody.read(&c, 1);
        }

        return postBody.str();
    }

// ----------------------------------------------------------------------------------------

    bool http_client::grab_url(const std::string& url, const std::string& method, const std::string& post_body)
    {
        error_field.clear();
        returned_headers.clear();
        http_return = 0;
        returned_body.clear();

        std::string to_use_method = strtoupper(method);

        std::string scheme, user, pass, host, path;
        short port;
        if ( !parse_url(url, scheme, user, pass, host, port, path) )
        {
            error_field = "Couldn't parse the URL!";
            return false;
        }

        // Build request
        std::stringstream ret;
        ret << to_use_method << ' ' << path << " HTTP/1.0\r\n"
            << "Host: " << host;
        if (port != 80 && port != 443) ret << ':' << port;
        ret << "\r\n";

        bool content_length_said = false;

        set_header("Connection", "Close");
        for (stringmap::iterator ci = headers.begin(); ci != headers.end(); ++ci)
        {
            std::string head = strtolower(ci->first);

            if ( head == "content-length" )
            {
                content_length_said = true;
            }

            ret << ci->first << ':' << ' ' << ci->second << "\r\n";
        }

        if ( !content_length_said && to_use_method != "GET" )
            ret << "Content-Length: " << static_cast<unsigned int>(post_body.size()) << "\r\n";

        std::stringstream cookie_ss;
        for (stringmap::iterator ci = cookies.begin(); ci != cookies.end(); ++ci)
        {
            std::string var = ci->first ; trim(var);
            std::string val = ci->second; trim(val);

            if ( val.empty() || var.empty() )
                continue;

            if ( !cookie_ss.str().empty() )
                cookie_ss << ';' << ' ';

            cookie_ss << urlencode(var) << '=' << urlencode(val);
        }

        if ( !cookie_ss.str().empty() )
            ret << "Cookie: " << cookie_ss.str() << "\r\n";

        ret << "\r\n";
        ret << post_body;

        std::string request_build = ret.str();

        std::stringstream ss;
        {
            dlib::connection * conn(0);
            try
            {
                if (timeout > 0)
                    conn = dlib::connect(host, port, timeout);
                else
                    conn = dlib::connect(host, port);
            }
            catch (const dlib::socket_error& e)
            {
                error_field = e.what();
                return false;
            }

            // Implement a timeout
            timeout_ptr t;
            if ( timeout > 0 )
                t.reset( new dlib::timeout(*conn, &dlib::connection::shutdown, timeout) );

            // Write our request
            conn->write(request_build.c_str(), static_cast<long>(request_build.size()));

            t.reset();

            // And read the response
            char buf[512];
            long bytes_read(0), bytes_total(0);
            bool read_headers(true);

            if ( timeout > 0 )
                t.reset( new dlib::timeout(*conn, &dlib::connection::shutdown, timeout) );

            while ( (bytes_read = conn->read(buf, 512)) > 0 )
            {
                ss.write(buf, bytes_read);

                // Incremental read headers
                if ( read_headers )
                {
                    std::string body_with_headers = ss.str();
                    std::string::size_type ctr(0);

                    while ( true )
                    {
                        std::string::size_type pos = body_with_headers.find("\r\n", ctr);
                        if ( pos == std::string::npos )
                        {
                            // This is our last position of "\r\n"
                            ss.str("");
                            ss.write( body_with_headers.substr(ctr).c_str(), body_with_headers.size() - ctr );
                            break;
                        }

                        std::string header = body_with_headers.substr(ctr, pos-ctr);
                        if ( header.empty() )
                        {
                            // Ok, we're done reading the headers
                            read_headers = false;
                            // What follows now is the body
                            ss.str("");
                            ss.write( body_with_headers.substr(pos + 2).c_str(), body_with_headers.size() - pos - 2 );
                            break;
                        }
                        ctr = pos + 2;

                        if ( returned_headers.empty() )
                        {
                            if (
                                header[0] == 'H' &&
                                header[1] == 'T' &&
                                header[2] == 'T' &&
                                header[3] == 'P' &&
                                header[4] == '/' &&
                                (header[5] >= '0' && header[5] <= '9') &&
                                header[6] == '.' &&
                                (header[7] >= '0' && header[7] <= '9') &&
                                header[8] == ' '
                            )
                            {
                                http_return = (header[9 ] - '0') * 100 +
                                    (header[10] - '0') * 10 +
                                    (header[11] - '0');
                                continue;
                            }
                        }

                        std::string::size_type pos_dp = header.find_first_of(':');
                        std::string header_name, header_value;
                        if ( pos_dp == std::string::npos )
                        {
                            // **TODO** what should I do here??
                            header_name = header;
                        }
                        else
                        {
                            header_name  = trim(header.substr(0, pos_dp));
                            header_value = trim(header.substr(pos_dp+1));
                        }

                        returned_headers[ header_name ].push_back(header_value);

                        if ( BR_CASECMP(header_name.c_str(), "Content-Length", 14) == 0 )
                        {
                            bytes_total = atol( header_value.c_str() );
                        }
                        else if ( BR_CASECMP(header_name.c_str(), "Set-Cookie", 10) == 0 )
                        {
                            std::string::size_type cur_pos(0), pos_pk, pos_is;
                            std::string work, var, val;
                            for ( cur_pos = 0; cur_pos < header_value.size(); cur_pos++ )
                            {
                                pos_pk = header_value.find(';', cur_pos);
                                work   = trim( header_value.substr(cur_pos, pos_pk - cur_pos) );

                                pos_is = work.find('=');
                                if ( pos_is != std::string::npos )
                                { // Hmmm? what in the else case?
                                    var = trim( http_client::urldecode( work.substr(0, pos_is) ) );
                                    val = trim( http_client::urldecode( work.substr(pos_is + 1) ) );

                                    if ( var != "expires" && var != "domain" && var != "path" )
                                        set_cookie( var, val );
                                }
                                cur_pos = pos_pk == std::string::npos ? pos_pk - 1 : pos_pk;
                            }
                        } // Set-Cookie?

                    } // while (true)
                } // read_headers?

                // Call the OnDownload function if it's set
                if ( OnDownload && !read_headers )
                {
                    if ( (*OnDownload)(static_cast<long>(ss.tellp()), bytes_total, user_info) == false )
                    {
                        t.reset();
                        break;
                    }
                }

                if ( bytes_total != 0 && static_cast<long>(ss.tellp()) == bytes_total )
                {
                    t.reset();
                    break;
                }

                if ( timeout > 0 )
                    t.reset( new dlib::timeout(*conn, &dlib::connection::shutdown, timeout) );
            } // while still data to read

            t.reset();

            delete conn;


            switch ( bytes_read )
            {
                case dlib::TIMEOUT:      error_field = "Timeout";     return false; break;
                case dlib::WOULDBLOCK:   error_field = "Would block"; return false; break;
                case dlib::OTHER_ERROR:  error_field = "Other error"; return false; break;
                case dlib::SHUTDOWN:     error_field = "Timeout";     return false; break;
                case dlib::PORTINUSE:    error_field = "Port in use"; return false; break;
            }
        }

        returned_body = ss.str();

        return true;
    }

// ----------------------------------------------------------------------------------------

    void http_client::clear()
    {
        headers.clear();
        cookies.clear();
    }

// ----------------------------------------------------------------------------------------

    void http_client::prepare_for_next_url( )
    {
        remove_header("Content-Type");
        remove_header("Content-Length");
    }

// ----------------------------------------------------------------------------------------

}


