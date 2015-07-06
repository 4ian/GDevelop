// Copyright (C) 2003  Davis E. King (davis@dlib.net), Miguel Grinberg
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_SOCKETS_KERNEL_1_CPp_
#define DLIB_SOCKETS_KERNEL_1_CPp_
#include "../platform.h"

#ifdef WIN32

#ifndef _WINSOCKAPI_
#define _WINSOCKAPI_   /* Prevent inclusion of winsock.h in windows.h */
#endif

#include "../windows_magic.h"

#include "sockets_kernel_1.h"

#include <windows.h>
#include <winsock2.h>

#ifndef NI_MAXHOST
#define NI_MAXHOST 1025
#endif


// tell visual studio to link to the libraries we need if we are
// in fact using visual studio
#ifdef _MSC_VER
#pragma comment (lib, "ws2_32.lib")
#endif

#include "../assert.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    class SOCKET_container
    {
        /*!
            This object is just a wrapper around the SOCKET type.  It exists
            so that we can #include the windows.h and Winsock2.h header files
            in this cpp file and not at all in the header file.
        !*/
    public:
        SOCKET_container (
            SOCKET s = INVALID_SOCKET
        ) : val(s) {}

        SOCKET val;
        operator SOCKET&() { return val; }

        SOCKET_container& operator= (
            const SOCKET& s
        ) { val = s; return *this; }

        bool operator== (
            const SOCKET& s
        ) const { return s == val; }
    };

// ----------------------------------------------------------------------------------------
// stuff to ensure that WSAStartup() is always called before any sockets stuff is needed

    namespace sockets_kernel_1_mutex
    {
        mutex startup_lock;
    }

    class sockets_startupdown
    {
    public:
        sockets_startupdown();
        ~sockets_startupdown() { WSACleanup( ); }

    };
    sockets_startupdown::sockets_startupdown (
    )
    {
        WSADATA wsaData;
        WSAStartup (MAKEWORD(2,0), &wsaData);
    }

    void sockets_startup()
    {
        // mutex crap to make this function thread-safe
        sockets_kernel_1_mutex::startup_lock.lock();
        static sockets_startupdown a;
        sockets_kernel_1_mutex::startup_lock.unlock();
    }
 
// ----------------------------------------------------------------------------------------

    // lookup functions

    int
    get_local_hostname (
        std::string& hostname
    )
    {
        // ensure that WSAStartup has been called and WSACleanup will eventually
        // be called when program ends
        sockets_startup();

        try 
        {

            char temp[NI_MAXHOST];
            if (gethostname(temp,NI_MAXHOST) == SOCKET_ERROR )
            {
                return OTHER_ERROR;
            }

            hostname = temp;
        }
        catch (...)
        {
            return OTHER_ERROR;
        }

        return 0;
    }

// -----------------

    int 
    hostname_to_ip (
        const std::string& hostname,
        std::string& ip,
        int n
    )
    {
        // ensure that WSAStartup has been called and WSACleanup will eventually 
        // be called when program ends
        sockets_startup();

        try 
        {
            // lock this mutex since gethostbyname isn't really thread safe
            auto_mutex M(sockets_kernel_1_mutex::startup_lock);

            // if no hostname was given then return error
            if ( hostname.empty())
                return OTHER_ERROR;

            hostent* address;
            address = gethostbyname(hostname.c_str());
            
            if (address == 0)
            {
                return OTHER_ERROR;
            }

            // find the nth address
            in_addr* addr = reinterpret_cast<in_addr*>(address->h_addr_list[0]);
            for (int i = 1; i <= n; ++i)
            {
                addr = reinterpret_cast<in_addr*>(address->h_addr_list[i]);

                // if there is no nth address then return error
                if (addr == 0)
                    return OTHER_ERROR;
            }

            char* resolved_ip = inet_ntoa(*addr);

            // check if inet_ntoa returned an error
            if (resolved_ip == NULL)
            {
                return OTHER_ERROR;
            }

            ip.assign(resolved_ip);

        }
        catch(...)
        {
            return OTHER_ERROR;
        }

        return 0;
    }

// -----------------

    int
    ip_to_hostname (
        const std::string& ip,
        std::string& hostname
    )
    {
        // ensure that WSAStartup has been called and WSACleanup will eventually 
        // be called when program ends
        sockets_startup();

        try 
        {
            // lock this mutex since gethostbyaddr isn't really thread safe
            auto_mutex M(sockets_kernel_1_mutex::startup_lock);

            // if no ip was given then return error
            if (ip.empty())
                return OTHER_ERROR;

            hostent* address;
            unsigned long ipnum = inet_addr(ip.c_str());

            // if inet_addr couldn't convert ip then return an error
            if (ipnum == INADDR_NONE)
            {
                return OTHER_ERROR;
            }
            address = gethostbyaddr(reinterpret_cast<char*>(&ipnum),4,AF_INET);

            // check if gethostbyaddr returned an error
            if (address == 0)
            {
                return OTHER_ERROR;
            }
            hostname.assign(address->h_name);

        }
        catch (...)
        {
            return OTHER_ERROR;
        }
        return 0;

    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // connection object
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    connection::
    connection(
        SOCKET_container sock,
        unsigned short foreign_port, 
        const std::string& foreign_ip, 
        unsigned short local_port,
        const std::string& local_ip
    ) :
        user_data(0),
        connection_socket(*(new SOCKET_container())),
        connection_foreign_port(foreign_port),
        connection_foreign_ip(foreign_ip),
        connection_local_port(local_port),
        connection_local_ip(local_ip),
        sd(false),
        sdo(false),
        sdr(0)
    {
       connection_socket = sock;
    }

// ----------------------------------------------------------------------------------------

    connection::
    ~connection (
    )
    {
        if (connection_socket != INVALID_SOCKET)
            closesocket(connection_socket);  
        delete &connection_socket;
    }

// ----------------------------------------------------------------------------------------

    int connection::
    disable_nagle()
    {
        int flag = 1;
        int status = setsockopt( connection_socket, IPPROTO_TCP, TCP_NODELAY, (char *)&flag, sizeof(flag) );

        if (status == SOCKET_ERROR) 
            return OTHER_ERROR;
        else
            return 0;
    }

// ----------------------------------------------------------------------------------------

    long connection::
    write (
        const char* buf, 
        long num
    )
    {
        const long old_num = num;
        long status;
        const long max_send_length = 1024*1024*100;
        while (num > 0)
        {
            // Make sure to cap the max value num can take on so that if it is 
            // really large (it might be big on 64bit platforms) so that the OS
            // can't possibly get upset about it being large.
            const long length = std::min(max_send_length, num);
            if ( (status = send(connection_socket,buf,length,0)) == SOCKET_ERROR)
            {
                if (sdo_called())
                    return SHUTDOWN;
                else
                    return OTHER_ERROR;
            }
            num -= status;
            buf += status;
        } 
        return old_num;
    }

// ----------------------------------------------------------------------------------------

    long connection::
    read (
        char* buf, 
        long num
    )
    {
        const long max_recv_length = 1024*1024*100;
        // Make sure to cap the max value num can take on so that if it is 
        // really large (it might be big on 64bit platforms) so that the OS
        // can't possibly get upset about it being large.
        const long length = std::min(max_recv_length, num);
        long status = recv(connection_socket,buf,length,0);
        if (status == SOCKET_ERROR)
        {
            // if this error is the result of a shutdown call then return SHUTDOWN
            if (sd_called())
                return SHUTDOWN;
            else
                return OTHER_ERROR;
        }
        else if (status == 0 && sd_called())
        {
            return SHUTDOWN;
        }
        return status;
    }

// ----------------------------------------------------------------------------------------

    long connection::
    read (
        char* buf, 
        long num,
        unsigned long timeout
    )
    {
        if (readable(timeout) == false)
            return TIMEOUT;

        const long max_recv_length = 1024*1024*100;
        // Make sure to cap the max value num can take on so that if it is 
        // really large (it might be big on 64bit platforms) so that the OS
        // can't possibly get upset about it being large.
        const long length = std::min(max_recv_length, num);
        long status = recv(connection_socket,buf,length,0);
        if (status == SOCKET_ERROR)
        {
            // if this error is the result of a shutdown call then return SHUTDOWN
            if (sd_called())
                return SHUTDOWN;
            else
                return OTHER_ERROR;
        }
        else if (status == 0 && sd_called())
        {
            return SHUTDOWN;
        }
        return status;
    }

// ----------------------------------------------------------------------------------------

    bool connection::
    readable (
        unsigned long timeout
    ) const
    {
        fd_set read_set;
        // initialize read_set
        FD_ZERO(&read_set);

        // add the listening socket to read_set
        FD_SET(connection_socket, &read_set);

        // setup a timeval structure
        timeval time_to_wait;
        time_to_wait.tv_sec = static_cast<long>(timeout/1000);
        time_to_wait.tv_usec = static_cast<long>((timeout%1000)*1000);

        // wait on select
        int status = select(0,&read_set,0,0,&time_to_wait);

        // if select timed out or there was an error
        if (status <= 0)
            return false;
        
        // data is ready to be read
        return true;
    }

// ----------------------------------------------------------------------------------------

    int connection::
    shutdown_outgoing (
    ) 
    { 
        sd_mutex.lock();
        if (sdo || sd)
        {
            sd_mutex.unlock();
            return sdr;
        }
        sdo = true;
        sdr = ::shutdown(connection_socket,SD_SEND);

        // convert -1 error code into the OTHER_ERROR error code
        if (sdr == -1) 
            sdr = OTHER_ERROR;

        int temp = sdr;

        sd_mutex.unlock();
        return temp;            
    }

// ----------------------------------------------------------------------------------------

    int connection::
    shutdown (
    ) 
    { 
        sd_mutex.lock();
        if (sd)
        {
            sd_mutex.unlock();
            return sdr;
        }
        sd = true;
        SOCKET stemp = connection_socket;
        connection_socket = INVALID_SOCKET;
        sdr = closesocket(stemp);

        // convert SOCKET_ERROR error code into the OTHER_ERROR error code
        if (sdr == SOCKET_ERROR) 
            sdr = OTHER_ERROR;

        int temp = sdr;
       
        sd_mutex.unlock();            
        return temp;
    }

// ----------------------------------------------------------------------------------------

    connection::socket_descriptor_type connection::
    get_socket_descriptor (
    ) const
    {
        return connection_socket.val;
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // listener object
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    listener::
    listener(
        SOCKET_container sock,
        unsigned short port,
        const std::string& ip
    ) :
        listening_socket(*(new SOCKET_container)),
        listening_port(port),
        listening_ip(ip),
        inaddr_any(listening_ip.empty())
    {
        listening_socket = sock;
    }

// ----------------------------------------------------------------------------------------

    listener::
    ~listener (
    )
    {
        closesocket(listening_socket);  
        delete &listening_socket;
    }

// ----------------------------------------------------------------------------------------

    int listener::
    accept (
        scoped_ptr<connection>& new_connection,
        unsigned long timeout
    )
    {
        new_connection.reset(0);
        connection* con;
        int status = this->accept(con, timeout);

        if (status == 0)
            new_connection.reset(con);

        return status;
    }

// ----------------------------------------------------------------------------------------

    int listener::
    accept (
        connection*& new_connection,
        unsigned long timeout
    )
    {
        SOCKET incoming;
        sockaddr_in incomingAddr;
        int length = sizeof(sockaddr_in);

        // implement timeout with select if timeout is > 0
        if (timeout > 0)
        {
            fd_set read_set;
            // initialize read_set
            FD_ZERO(&read_set);

            // add the listening socket to read_set
            FD_SET(listening_socket, &read_set);

            // setup a timeval structure
            timeval time_to_wait;
            time_to_wait.tv_sec = static_cast<long>(timeout/1000);
            time_to_wait.tv_usec = static_cast<long>((timeout%1000)*1000);


            // wait on select
            int status = select(0,&read_set,0,0,&time_to_wait);

            // if select timed out
            if (status == 0)
                return TIMEOUT;
            
            // if select returned an error
            if (status == SOCKET_ERROR)
                return OTHER_ERROR;

        }


        // call accept to get a new connection
        incoming=::accept(listening_socket,reinterpret_cast<sockaddr*>(&incomingAddr),&length);

        // if there was an error return OTHER_ERROR
        if ( incoming == INVALID_SOCKET )
            return OTHER_ERROR;
        

        // get the port of the foreign host into foreign_port
        int foreign_port = ntohs(incomingAddr.sin_port);

        // get the IP of the foreign host into foreign_ip
        std::string foreign_ip;
        {
            char* foreign_ip_temp = inet_ntoa(incomingAddr.sin_addr);

            // check if inet_ntoa() returned an error
            if (foreign_ip_temp == NULL)
            {
                closesocket(incoming);
                return OTHER_ERROR;            
            }

            foreign_ip.assign(foreign_ip_temp);
        }


        // get the local ip
        std::string local_ip;
        if (inaddr_any == true)
        {
            sockaddr_in local_info;
            length = sizeof(sockaddr_in);
            // get the local sockaddr_in structure associated with this new connection
            if ( getsockname (
                    incoming,
                    reinterpret_cast<sockaddr*>(&local_info),
                    &length
                 ) == SOCKET_ERROR 
            )
            {   // an error occurred
                closesocket(incoming);
                return OTHER_ERROR;
            }
            char* temp = inet_ntoa(local_info.sin_addr);
            
            // check if inet_ntoa() returned an error
            if (temp == NULL)
            {
                closesocket(incoming);
                return OTHER_ERROR;            
            }
            local_ip.assign(temp);
        }
        else
        {
            local_ip = listening_ip;
        }


        // set the SO_OOBINLINE option
        int flag_value = 1;
        if (setsockopt(incoming,SOL_SOCKET,SO_OOBINLINE,reinterpret_cast<const char*>(&flag_value),sizeof(int)) == SOCKET_ERROR )
        {
            closesocket(incoming);
            return OTHER_ERROR;  
        }


        // make a new connection object for this new connection
        try 
        { 
            new_connection = new connection (
                                    incoming,
                                    foreign_port,
                                    foreign_ip,
                                    listening_port,
                                    local_ip
                                ); 
        }
        catch (...) { closesocket(incoming); return OTHER_ERROR; }

        return 0;
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // socket creation functions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------    

    int create_listener (
        scoped_ptr<listener>& new_listener,
        unsigned short port,
        const std::string& ip
    )
    {
        new_listener.reset();
        listener* temp;
        int status = create_listener(temp,port,ip);

        if (status == 0)
            new_listener.reset(temp);

        return status;
    }

    int create_listener (
        listener*& new_listener,
        unsigned short port,
        const std::string& ip
    )
    {
        // ensure that WSAStartup has been called and WSACleanup will eventually 
        // be called when program ends
        sockets_startup();

        sockaddr_in sa;  // local socket structure
        ZeroMemory(&sa,sizeof(sockaddr_in)); // initialize sa

        SOCKET sock = socket (AF_INET, SOCK_STREAM, 0);  // get a new socket

        // if socket() returned an error then return OTHER_ERROR
        if (sock == INVALID_SOCKET )
        {
            return OTHER_ERROR;
        }

        // set the local socket structure 
        sa.sin_family = AF_INET;
        sa.sin_port = htons(port);
        if (ip.empty())
        {            
            // if the listener should listen on any IP
            sa.sin_addr.S_un.S_addr = htons(INADDR_ANY);
        }
        else
        {
            // if there is a specific ip to listen on
            sa.sin_addr.S_un.S_addr = inet_addr(ip.c_str());
            // if inet_addr couldn't convert the ip then return an error
            if ( sa.sin_addr.S_un.S_addr == INADDR_NONE )
            {
                closesocket(sock); 
                return OTHER_ERROR;                
            }
        }

        // set the SO_REUSEADDR option
        int flag_value = 1;
        setsockopt(sock,SOL_SOCKET,SO_REUSEADDR,reinterpret_cast<const char*>(&flag_value),sizeof(int));

        // bind the new socket to the requested port and ip
        if (bind(sock,reinterpret_cast<sockaddr*>(&sa),sizeof(sockaddr_in))==SOCKET_ERROR)
        {   
            const int err = WSAGetLastError();
            // if there was an error 
            closesocket(sock); 

            // if the port is already bound then return PORTINUSE
            if (err == WSAEADDRINUSE)
                return PORTINUSE;
            else
                return OTHER_ERROR;            
        }


        // tell the new socket to listen
        if ( listen(sock,SOMAXCONN) == SOCKET_ERROR)
        {
            const int err = WSAGetLastError();
            // if there was an error return OTHER_ERROR
            closesocket(sock); 

            // if the port is already bound then return PORTINUSE
            if (err == WSAEADDRINUSE)
                return PORTINUSE;
            else
                return OTHER_ERROR;  
        }

        // determine the port used if necessary
        if (port == 0)
        {
            sockaddr_in local_info;
            int length = sizeof(sockaddr_in);
            if ( getsockname (
                        sock,
                        reinterpret_cast<sockaddr*>(&local_info),
                        &length
                 ) == SOCKET_ERROR
            )
            {
                closesocket(sock);
                return OTHER_ERROR;
            }
            port = ntohs(local_info.sin_port);            
        }


        // initialize a listener object on the heap with the new socket
        try { new_listener = new listener(sock,port,ip); }
        catch(...) { closesocket(sock); return OTHER_ERROR; }

        return 0;
    }

// ----------------------------------------------------------------------------------------

    int create_connection (
        scoped_ptr<connection>& new_connection,
        unsigned short foreign_port, 
        const std::string& foreign_ip, 
        unsigned short local_port,
        const std::string& local_ip
    )
    {
        new_connection.reset();
        connection* temp;
        int status = create_connection(temp,foreign_port, foreign_ip, local_port, local_ip);

        if (status == 0)
            new_connection.reset(temp);

        return status;
    }

    int create_connection ( 
        connection*& new_connection,
        unsigned short foreign_port, 
        const std::string& foreign_ip, 
        unsigned short local_port,
        const std::string& local_ip
    )
    {
        // ensure that WSAStartup has been called and WSACleanup 
        // will eventually be called when program ends
        sockets_startup();


        sockaddr_in local_sa;  // local socket structure
        sockaddr_in foreign_sa;  // foreign socket structure
        ZeroMemory(&local_sa,sizeof(sockaddr_in)); // initialize local_sa
        ZeroMemory(&foreign_sa,sizeof(sockaddr_in)); // initialize foreign_sa

        int length;

        SOCKET sock = socket (AF_INET, SOCK_STREAM, 0);  // get a new socket

        // if socket() returned an error then return OTHER_ERROR
        if (sock == INVALID_SOCKET )
        {
            return OTHER_ERROR;
        }

        // set the foreign socket structure 
        foreign_sa.sin_family = AF_INET;
        foreign_sa.sin_port = htons(foreign_port);
        foreign_sa.sin_addr.S_un.S_addr = inet_addr(foreign_ip.c_str());

        // if inet_addr couldn't convert the ip then return an error
        if ( foreign_sa.sin_addr.S_un.S_addr == INADDR_NONE )
        {
            closesocket(sock);
            return OTHER_ERROR;
        }


        // set up the local socket structure
        local_sa.sin_family = AF_INET;

        // set the local ip
        if (local_ip.empty())
        {            
            // if the listener should listen on any IP
            local_sa.sin_addr.S_un.S_addr = htons(INADDR_ANY);
        }
        else
        {
            // if there is a specific ip to listen on
            local_sa.sin_addr.S_un.S_addr = inet_addr(local_ip.c_str());   

            // if inet_addr couldn't convert the ip then return an error
            if (local_sa.sin_addr.S_un.S_addr == INADDR_NONE)
            {
                closesocket(sock);
                return OTHER_ERROR;
            }
        }

        // set the local port
        local_sa.sin_port = htons(local_port);

        

        // bind the new socket to the requested local port and local ip
        if ( bind (
                sock,
                reinterpret_cast<sockaddr*>(&local_sa),
                sizeof(sockaddr_in)
            ) == SOCKET_ERROR
        )
        {   
            const int err = WSAGetLastError();
            // if there was an error 
            closesocket(sock); 

            // if the port is already bound then return PORTINUSE
            if (err == WSAEADDRINUSE)
                return PORTINUSE;
            else
                return OTHER_ERROR;            
        }

        // connect the socket        
        if (connect (
                sock,
                reinterpret_cast<sockaddr*>(&foreign_sa),
                sizeof(sockaddr_in)
            ) == SOCKET_ERROR
        )
        {
            const int err = WSAGetLastError();
            closesocket(sock); 
            // if the port is already bound then return PORTINUSE
            if (err == WSAEADDRINUSE)
                return PORTINUSE;
            else
                return OTHER_ERROR;  
        }



        // determine the local port and IP and store them in used_local_ip 
        // and used_local_port
        int used_local_port;
        std::string used_local_ip;
        sockaddr_in local_info;
        if (local_port == 0)
        {
            length = sizeof(sockaddr_in);
            if (getsockname (
                    sock,
                    reinterpret_cast<sockaddr*>(&local_info),
                    &length
                ) == SOCKET_ERROR
            )
            {
                closesocket(sock);
                return OTHER_ERROR;
            }
            used_local_port = ntohs(local_info.sin_port);            
        }
        else
        {
            used_local_port = local_port;
        }

        // determine real local ip
        if (local_ip.empty())
        {
            // if local_port is not 0 then we must fill the local_info structure
            if (local_port != 0)
            {
                length = sizeof(sockaddr_in);
                if ( getsockname (
                        sock,
                        reinterpret_cast<sockaddr*>(&local_info),
                        &length
                    ) == SOCKET_ERROR 
                )
                {
                    closesocket(sock);
                    return OTHER_ERROR;
                }
            }
            char* temp = inet_ntoa(local_info.sin_addr);

            // check if inet_ntoa returned an error
            if (temp == NULL)
            {
                closesocket(sock);
                return OTHER_ERROR;            
            }
            used_local_ip.assign(temp);
        }
        else
        {
            used_local_ip = local_ip;
        }

        // set the SO_OOBINLINE option
        int flag_value = 1;
        if (setsockopt(sock,SOL_SOCKET,SO_OOBINLINE,reinterpret_cast<const char*>(&flag_value),sizeof(int)) == SOCKET_ERROR )
        {
            closesocket(sock);
            return OTHER_ERROR;  
        }

        // initialize a connection object on the heap with the new socket
        try 
        { 
            new_connection = new connection (
                                    sock,
                                    foreign_port,
                                    foreign_ip,
                                    used_local_port,
                                    used_local_ip
                                ); 
        }
        catch(...) {closesocket(sock);  return OTHER_ERROR; }

        return 0;
    }

// ----------------------------------------------------------------------------------------

}

#endif // WIN32

#endif // DLIB_SOCKETS_KERNEL_1_CPp_

