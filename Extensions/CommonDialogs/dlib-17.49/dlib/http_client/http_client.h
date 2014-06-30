#ifndef DLIB__BROWSER_H
#define DLIB__BROWSER_H


#include <map>
#include <string>
#include <vector>
#include "http_client_abstract.h"


// Default timeout after 60 seconds
#define DEFAULT_TIMEOUT 60000

namespace dlib
{

    // Function which is called when there is data available.
    //   Return false to stop the download process...
    typedef bool (*fnOnDownload)(long already_downloaded, long total_to_download, void * userInfo);


    class http_client
    {
    public:
        http_client();

        typedef std::map< std::string, std::string > stringmap;
        typedef std::map< std::string, stringmap   > string_to_stringmap;
        typedef std::map< std::string, std::vector<std::string> > string_to_stringvector;

        // Header functions
        void        set_header(const std::string& header_name, const std::string& header_value);
        void        set_header(const std::string& header_name, long header_value);
        std::string get_header(const std::string& header_name) const;
        void        remove_header(const std::string& header_name);
        bool        is_header_set(const std::string& header_name) const;

        // This function will clear out all cookies & headers set until now
        void clear();
        // This function will clear out the Content-Type header
        void prepare_for_next_url();

        void set_callback_function( fnOnDownload od, void * _user_info ) { OnDownload = od; user_info = _user_info; }

        void set_cookie(const std::string& cookie_name, const std::string& cookie_value);
        void set_cookie(const std::string& cookie_name, long cookie_value);
        void remove_cookie(const std::string& cookie_name);

        void set_user_agent(const std::string& new_agent) { set_header("User-Agent", new_agent); }


        void set_timeout( unsigned int milliseconds = DEFAULT_TIMEOUT ) { timeout = milliseconds; }


        string_to_stringvector get_returned_headers() const { return returned_headers; }
        short                  get_http_return     () const { return http_return; }
        const std::string&     get_body            () const { return returned_body; }

        // POST
        const std::string& post_url (const std::string& url, const string_to_stringmap& postvars, const string_to_stringmap& filenames = string_to_stringmap());
        const std::string& post_url (const std::string& url, const std::string& postbuffer);
        // GET
        const std::string& get_url  (const std::string& url);

        bool has_error( ) const { return !error_field.empty(); }
        const std::string& get_error( ) const { return error_field; }

        static std::string urlencode(const std::string& in, bool post_encode = false);
        static std::string urldecode(const std::string& in);
    private:
        bool grab_url(const std::string& url, const std::string& method = "GET", const std::string& post_body = "");
        std::string build_post(std::string& content_type, const string_to_stringmap& postvars, const string_to_stringmap& filenames) const;

        std::string get_random_string( size_t length = 32 ) const;
        std::string get_basename( const std::string& filename ) const;
        std::string strtolower(const std::string& in) const;
        std::string strtoupper(const std::string& in) const;

        bool parse_url(const std::string& url, std::string& scheme, std::string& user, std::string& pass, std::string& host, short& port, std::string& path) const;

        stringmap headers;
        stringmap cookies;

        string_to_stringvector returned_headers;
        short http_return;
        std::string returned_body, error_field;

        unsigned int timeout;

        fnOnDownload OnDownload;
        void *       user_info;
    };

}

#ifdef NO_MAKEFILE
#include "http_client.cpp"
#endif

#endif // DLIB__BROWSER_H

