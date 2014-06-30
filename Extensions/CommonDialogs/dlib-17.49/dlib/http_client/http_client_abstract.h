#undef DLIB__BROWSER_ABSTRACT_
#ifdef DLIB__BROWSER_ABSTRACT_



namespace dlib
{

    // Function which is called when there is data available.
    //   Return false to stop the download process...
    typedef bool (*fnOnDownload)(long already_downloaded, long total_to_download, void * userInfo);


// ----------------------------------------------------------------------------------------
/*
TODO:
- Timed cookie support
- POSTing files: check it!
- Don't timeout when still downloading!
*/
// ----------------------------------------------------------------------------------------


    class Browser
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object represents a possibility for the end user to download webpages (HTTP/1.0)
                from the internet like a normal webbrowser would do.
        !*/

    public:

        Browser(
        );
        /*!
            Constructor
        !*/

        void set_header(
            const std::string& header_name,
            const std::string& header_value
        );
        /*!
            Set a header to a certain value
            Example: set_header("User-Agent", "Internet Explorer")
        !*/


        void set_header(
            const std::string& header_name,
            long header_value
        );
        /*!
            Set a header to a certain number
            Example: set_header("Content-Length", 1234)
        !*/

        std::string get_header(
            const std::string& header_name
        ) const;
        /*!
            Get the value of the header or an empty string when it's not set.
            Example: get_header("Content-Length") would return "1234"
        !*/

        void remove_header(
            const std::string& header_name
        );
        /*!
            Removes a certain header
        !*/

        bool is_header_set(
            const std::string& header_name
        ) const;
        /*!
            Returns when a header is set and is not empty
        !*/

        void set_user_agent(
            const std::string& new_agent
        ) { set_header("User-Agent", new_agent); }
        /*!
            Convenience function for setting a user agent
        !*/

        void clear(
        );
        /*!
            Clear out all cookies & headers set until now
        !*/

        void prepare_for_next_url(
        );
        /*!
            Clear out any header and/or cookie which would obstruct getting a next page.
            At this moment this is cleared:
                - the Content-Type header
        !*/

        void set_callback_function( 
            fnOnDownload od, 
            void * _user_info 
        );
        /*!
            Set a callback function for one of the following events:
            - OnDownload: this will tell you how much is downloaded and how much will need to be downloaded
        !*/

        void set_cookie(
            const std::string& cookie_name, 
            const std::string& cookie_value
        );
        /*!
            Set a cookie
        !*/

        void set_cookie(
            const std::string& cookie_name, 
            long cookie_value
        );
        /*!
            Set a cookie
        !*/

        void remove_cookie(
            const std::string& cookie_name
        );
        /*!
            Remove a cookie if it's set
        !*/

        void set_timeout( 
            unsigned int milliseconds  
        );
        /*!
            Set the maximum time how long a request can take. Setting this to 0 disables
            this behavior.
        !*/

        string_to_stringvector get_returned_headers(
        ) const; 
        /*!
            Returns all the headers which are returned in the download of the webpage.
        !*/

        short get_http_return (
        ) const;
        /*!
            Retrieves the HTTP return code.
        !*/

        const std::string& get_body (
        ) const; 
        /*!
            Retrieves the HTTP body.
        !*/

        const std::string& post_url (
            const std::string& url, 
            const string_to_stringmap& postvars,
            const string_to_stringmap& filenames = string_to_stringmap()
        );
        /*!
            POST an url to the internet.
            You can pass the post variables as well as a list of filenames
        !*/

        const std::string& post_url (
            const std::string& url, 
            const std::string& postbuffer
        );
        /*!
            POST an url to the internet.
            In this function you have constructed the POST string yourselves
        !*/

        const std::string& get_url (
            const std::string& url
        );
        /*!
            GET an url from the internet.
        !*/

        bool has_error( 
        ) const;
        /*!
            Has there happened an error?
        !*/

        const std::string& get_error( 
        ) const;
        /*!
            Get the error explanation
        !*/

        static std::string urlencode(
            const std::string& in, 
            bool post_encode = false
        );
        /*!
            Convenience function to URLencode a string
        !*/

        static std::string urldecode(
            const std::string& in
        );
        /*!
            Convenience function to URLdecode a string
        !*/

    };

}

#endif // DLIB__BROWSER_ABSTRACT_

