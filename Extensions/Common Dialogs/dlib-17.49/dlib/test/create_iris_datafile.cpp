// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.

#include <sstream>
#include <fstream>
#include <dlib/compress_stream.h>
#include <dlib/base64.h>

namespace 
{
    // This function returns the contents of the file 'iris.scale'
    const std::string get_decoded_string()
    {
        dlib::base64::kernel_1a base64_coder;
        dlib::compress_stream::kernel_1ea compressor;
        std::ostringstream sout;
        std::istringstream sin;

        // The base64 encoded data from the file 'iris.scale' we want to decode and return.
        sout << "MU66cCmT9lCXWJXwhdfOGELwlyExClbHEF1s9XoqxNDV7o8AdVVHws/C9oIKO5EShH1lI/QFTWk3";
        sout << "8EUdVpSw/NpZCUa7O9nq5uO6SE0gfRAyryH+pfIVL9jPiQi8rBdagDf4kUd4eggz9glwYnKEE+US";
        sout << "K4GUBnW33YDf/jMF2GIBLNvz69yGJj8RC5rOUeJxR4mlHrDmnEfgRSdFIfXk4OQ4V/XbOsE1bnhG";
        sout << "fmACcu7nYv6M/043Z6o8oaBeoJ2XK/9UqOWGFOwfVpQ46fz1a0oTlOzyDbbzMiniLr8z5P/VYwYd";
        sout << "iAE70MwxHXs6Ga3zMmD/h1WxB/uRRph39B1lPN1UXC7U6SIatmtGWY+JYpwBk6raAnR3sblTFBNs";
        sout << "UdPW+1a7AxinR0NZO6YEiCFy8lbpfPRZNAr5ENqPbD2DZtkHk3L8ARxSoFBgqPa8aO3fFow7rVxF";
        sout << "xIJ2TxcHS84+BtH7KvtWfH7kUPOZLQ+Ohqghn9I57IeMl7E3aoTRTiVv3P2twAbP5Y+ZaAUoU7CK";
        sout << "c9FptjKgMClUkuWxA7tGUEp069PqGT8NbI+yxorh/iVhkVhuGAzgjjXYS/D26OGj4bzF6mtRbnms";
        sout << "Y2OYlF7QqhawZaHLtmZ6xLhR2F8p/0nrbpAz2brQLNKgQAMvU9rTZ0XYpuJNbRSsARkRDorPopDO";
        sout << "kKNUORfkh2zfIytVToQ9tZ9W2LkfGZdWjJu/wEKjPDAU55q3bCfKOUk12tjq0sq/7qjUWJRcLSCu";
        sout << "bqo8EzaKJj3cTXVgXXLHP6WEOPZ9vShuxQUu1JWkh8YEinjwFSyA6UnAKqPtN/HsBgv8YbnfnY/q";
        sout << "e5JvUYWbs3Lk9enlhcI0vEVTV5f0GMjdkW87l3cWgmXJqiljJDREWEdKZJQ0rGBU/gW5kO3SAS1W";
        sout << "OETVJG2kJD8Ib7hT15Mu2lOVNQYFri6O3yWtp5/NLHsYXoDKIYrxoJtM9+GkprVwRuhDcwxE+eQa";
        sout << "pp5nC8qj38ameQHaJR2hJCuW2nvr4Wwm0ploF00ZP9cS9YznCO52cueUQX0+zil7bU++jghqSGP5";
        sout << "+JyRzWUWWbDhnCyanej2Y3sqfZ3o2kuUjaAgZFz5pLqK64uACjztp4bQFsaMRdc+OCV2uItqoaRg";
        sout << "a6u7/VrvS+ZigwcGWDjXSKev334f8ZqQQIR5hljdeseGuw7/5XySzUrgc8lCOvMa0pKNn9Nl8W/W";
        sout << "vbKz1VwA";

        // Put the data into the istream sin
        sin.str(sout.str());
        sout.str("");

        // Decode the base64 text into its compressed binary form
        base64_coder.decode(sin,sout);
        sin.clear();
        sin.str(sout.str());
        sout.str("");

        // Decompress the data into its original form
        compressor.decompress(sin,sout);

        // Return the decoded and decompressed data
        return sout.str();
    }
}

namespace dlib
{
    void create_iris_datafile (
    )
    {
        std::ofstream fout("iris.scale");
        fout << get_decoded_string();
    }
}

