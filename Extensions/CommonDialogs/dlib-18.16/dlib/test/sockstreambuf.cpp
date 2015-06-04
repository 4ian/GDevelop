// Copyright (C) 2006  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.


#include <sstream>
#include <string>
#include <cstdlib>
#include <ctime>
#include <dlib/sockets.h>
#include <dlib/misc_api.h>
#include <dlib/sockstreambuf.h>
#include <vector>
#include <dlib/smart_pointers.h>

#include "tester.h"

namespace  
{

    using namespace test;
    using namespace dlib;
    using namespace std;

    dlib::mutex m;
    dlib::signaler s(m);
    bool thread_running;

    logger dlog("test.sockstreambuf");

// ----------------------------------------------------------------------------------------

    template <typename ssb>
    struct thread_proc_struct
    {
    static void thread_proc (
        void* param
    )
    {
        
        listener& list = *static_cast<listener*>(param);
        connection* con;
        list.accept(con);

        ssb buf(con);
        ostream out(&buf);


        char ch;
        char* bigbuf = new char[1000000];


        for (int i = 'a'; i < 'z'; ++i)
        {
            ch = i;
            out << ch << " ";
        }

        out.put('A');

        for (int i = 0; i < 256; ++i)
        {
            ch = i;
            out.write(&ch,1);
        }

        for (int i = -100; i < 25600; ++i)
        {
            out << i << " ";
        }

        out.put('A');

        for (int i = -100; i < 25600; ++i)
        {
            out.write((char*)&i,sizeof(i));
        }

        for (int i = 0; i < 1000000; ++i)
        {
            bigbuf[i] = (i&0xFF);
        }
        out.write(bigbuf,1000000);

        out.put('d');
        out.put('a');
        out.put('v');
        out.put('i');
        out.put('s');


        string tstring = "this is a test";
        int tint = -853;
        unsigned int tuint = 89;
        serialize(tstring,out);
        serialize(tint,out);
        serialize(tuint,out);


        out.flush();


        auto_mutex M(m);
        thread_running = false;
        s.signal();

        dlib::sleep(300);
        delete con;
        delete &list;

        delete [] bigbuf;
    }
    };

    template <typename ssb>
    void sockstreambuf_test (
    )
    /*!
        requires
            - ssb is an implementation of sockstreambuf/sockstreambuf_kernel_abstract.h 
        ensures
            - runs tests on ssb for compliance with the specs
    !*/
    {        
        char ch;
        vector<char> vbuf;
        vbuf.resize(1000000);
        char* bigbuf = &vbuf[0];
        connection* con;

        print_spinner();
        thread_running = true;
        listener* list;
        if (create_listener(list,0))
        {
            DLIB_TEST_MSG(false, "Unable to create a listener");
        }

        create_new_thread(&thread_proc_struct<ssb>::thread_proc,list);

        if (create_connection(con,list->get_listening_port(),"127.0.0.1"))
        {
            DLIB_TEST_MSG(false, "Unable to create a connection");
        }

        // make sure con gets deleted
        scoped_ptr<connection> del_con(con);

        ssb buf(con);
        istream in(&buf);



        for (int i = 'a'; i < 'z'; ++i)
        {
            in >> ch;
            char c = i;
            DLIB_TEST_MSG(ch == c,"ch: " << (int)ch << "  c: " << (int)c);
        }

        in.get();
        DLIB_TEST_MSG(in.peek() == 'A', "*" << in.peek() << "*");
        in.get();

        for (int i = 0; i < 256; ++i)
        {
            in.read(&ch,1);
            char c = i;
            DLIB_TEST_MSG(ch == c,"ch: " << (int)ch << "  c: " << (int)c );
        }

        for (int i = -100; i < 25600; ++i)
        {
            int n = 0;
            in >> n;
            DLIB_TEST_MSG(n == i,"n: " << n << "   i:" << i);
        }

        in.get();
        DLIB_TEST_MSG(in.peek() == 'A', "*" << in.peek() << "*");
        in.get();

        for (int i = -100; i < 25600; ++i)
        {
            int n;
            in.read((char*)&n,sizeof(n));
            DLIB_TEST_MSG(n == i,"n: " << n << "   i:" << i);
        }

        in.read(bigbuf,1000000);
        for (int i = 0; i < 1000000; ++i)
        {
            DLIB_TEST(bigbuf[i] == (char)(i&0xFF));
        }

        DLIB_TEST(in.get() == 'd');
        DLIB_TEST(in.get() == 'a');
        DLIB_TEST(in.get() == 'v');
        DLIB_TEST(in.get() == 'i');

        DLIB_TEST(in.peek() == 's');

        DLIB_TEST(in.get() == 's');

        in.putback('s');
        DLIB_TEST(in.peek() == 's');

        DLIB_TEST(in.get() == 's');


        string tstring;
        int tint;
        unsigned int tuint;
        deserialize(tstring,in);
        deserialize(tint,in);
        deserialize(tuint,in);

        DLIB_TEST(tstring == "this is a test");
        DLIB_TEST(tint == -853);
        DLIB_TEST(tuint == 89);



        auto_mutex M(m);
        while (thread_running)
            s.wait();

    }

// ----------------------------------------------------------------------------------------


    class sockstreambuf_tester : public tester
    {
    public:
        sockstreambuf_tester (
        ) :
            tester ("test_sockstreambuf",
                    "Runs tests on the sockstreambuf component.")
        {}

        void perform_test (
        )
        {
            dlog << LINFO << "testing sockstreambuf";
            sockstreambuf_test<sockstreambuf>();
            dlog << LINFO << "testing sockstreambuf_unbuffered";
            sockstreambuf_test<sockstreambuf_unbuffered>();
        }
    } a;

}


