// Copyright (C) 2012  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_IOSOCKSTrEAM_Hh_
#define DLIB_IOSOCKSTrEAM_Hh_

#include "iosockstream_abstract.h"

#include <iostream>
#include "../sockstreambuf.h"
#include "../smart_pointers_thread_safe.h"
#include "../timeout.h"

#ifdef _MSC_VER
// Disable the warning about inheriting from std::iostream 'via dominance' since this warning is a warning about
// visual studio conforming to the standard and is ignorable.  
// See http://connect.microsoft.com/VisualStudio/feedback/details/733720/inheriting-from-std-fstream-produces-c4250-warning
// for further details if interested.
#pragma warning(disable : 4250)
#endif // _MSC_VER

namespace dlib
{

// ---------------------------------------------------------------------------------------- 

    class iosockstream : public std::iostream
    {
    public:

        iosockstream(
        ) :
            std::iostream(0)
        {
        }

        iosockstream( 
            const network_address& addr
        ) :
            std::iostream(0)
        { 
            open(addr); 
        }

        iosockstream( 
            const network_address& addr,
            unsigned long timeout 
        ) :
            std::iostream(0)
        { 
            open(addr, timeout); 
        }

        ~iosockstream()
        {
            close();
        }

        void open (
            const network_address& addr
        )
        {
            auto_mutex lock(class_mutex);
            close();
            con.reset(connect(addr));
            buf.reset(new sockstreambuf(con.get()));
            // Note that we use the sockstreambuf's ability to autoflush instead of 
            // telling the iostream::tie() function to tie the stream to itself even though
            // that should work fine.  The reason we do it this way is because there is a
            // bug in visual studio 2012 that causes a program to crash when a stream is
            // tied to itself and then used.  See
            // http://connect.microsoft.com/VisualStudio/feedback/details/772293/tying-a-c-iostream-object-to-itself-causes-a-stack-overflow-in-visual-studio-2012
            // for further details.
            buf->flush_output_on_read();
            rdbuf(buf.get());
            clear();
        }

        void open (
            const network_address& addr,
            unsigned long timeout
        )
        {
            auto_mutex lock(class_mutex);
            close(timeout);
            con.reset(connect(addr.host_address, addr.port, timeout));
            buf.reset(new sockstreambuf(con.get()));
            buf->flush_output_on_read();
            rdbuf(buf.get());
            clear();
        }

        void close(
            unsigned long timeout = 10000
        )
        {
            auto_mutex lock(class_mutex);
            rdbuf(0);
            try
            {
                if (buf)
                {
                    dlib::timeout t(*con,&connection::shutdown,timeout);

                    // This will flush the sockstreambuf and also destroy it.
                    buf.reset();

                    if(con->shutdown_outgoing())
                    {
                        // there was an error so just close it now and return
                        con->shutdown();
                    }
                    else
                    {
                        char junk[100];
                        // wait for the other end to close their side
                        while (con->read(junk,sizeof(junk)) > 0);
                    }
                }
            }
            catch (...)
            {
                con.reset();
                throw;
            }
            con.reset();
        }

        void terminate_connection_after_timeout (
            unsigned long timeout
        )
        {
            auto_mutex lock(class_mutex);
            if (con)
            {
                con_timeout.reset(new dlib::timeout(*this,&iosockstream::terminate_connection,timeout,con));
            }
        }

        void shutdown (
        ) 
        {
            auto_mutex lock(class_mutex);
            if (con)
                con->shutdown();
        }

    private:

        void terminate_connection(
            shared_ptr_thread_safe<connection> thecon
        )
        {
            thecon->shutdown();
        }

        scoped_ptr<timeout> con_timeout;
        rmutex class_mutex; 
        shared_ptr_thread_safe<connection> con;
        scoped_ptr<sockstreambuf> buf;

    };

// ---------------------------------------------------------------------------------------- 

}


#endif // DLIB_IOSOCKSTrEAM_Hh_


