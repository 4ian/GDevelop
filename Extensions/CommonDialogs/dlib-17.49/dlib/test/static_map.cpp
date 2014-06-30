// Copyright (C) 2005  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.


#include <sstream>
#include <string>
#include <cstdlib>
#include <ctime>

#include <dlib/hash_table.h>
#include <dlib/binary_search_tree.h>

#include <dlib/static_map.h>
#include "tester.h"

namespace  
{

    using namespace test;
    using namespace std;
    using namespace dlib;

    logger dlog("test.static_map");

    template <
        typename map
        >
    void static_map_kernel_test (
    )
    /*!
        requires
            - map is an implementation of static_map/static_map_kernel_abstract.h and
              is instantiated to map int to int
        ensures
            - runs tests on map for compliance with the specs 
    !*/
    {        

        print_spinner();
        srand(static_cast<unsigned int>(time(0)));

        typedef binary_search_tree<int,int>::kernel_2a_c bst;
        typedef hash_table<int,int>::kernel_1a_c ht;

        const unsigned long table_4_max_size = 100;
        const unsigned long tree_max_size = 50000;
        ht table_4(4);
        ht table_8(8);
        bst tree;

        ht table_4b(4);
        ht table_8b(8);
        bst treeb;


        // just do the following to make sure operator[] doesn't hang
        // under some instances
        {
            int g = 1, h = 1;
            treeb.add(g,h);
            map test;
            map test2;

            DLIB_TEST(test.size() == 0);
            DLIB_TEST(test.at_start());
            DLIB_TEST(test.current_element_valid() == false);
            DLIB_TEST(test.move_next() == false);
            DLIB_TEST(test.current_element_valid() == false);
            DLIB_TEST(test.at_start() == false);

            swap(test,test2);
            DLIB_TEST(test2.at_start() == false);
            DLIB_TEST(test.at_start() == true);

            swap(test,test2);
            DLIB_TEST(test.at_start() == false);


            DLIB_TEST(test.size() == 0);
            DLIB_TEST(test[1] == 0);
            DLIB_TEST(test[2] == 0);
            DLIB_TEST(test[3] == 0);
            DLIB_TEST(test[0] == 0);

            test.load(treeb);
            DLIB_TEST(test.at_start());
            DLIB_TEST(test[1] != 0);
            DLIB_TEST(test[2] == 0);
            DLIB_TEST(test[3] == 0);
            DLIB_TEST(test[0] == 0);

            test2.clear();
            swap(test2,test);
            DLIB_TEST(test2[1] != 0);
            DLIB_TEST(test2[2] == 0);
            DLIB_TEST(test2[3] == 0);
            DLIB_TEST(test2[0] == 0);
            DLIB_TEST(test[1] == 0);
            DLIB_TEST(test[2] == 0);
            DLIB_TEST(test[3] == 0);
            DLIB_TEST(test[0] == 0);


            DLIB_TEST(treeb.size() == 0);
            treeb.clear();
        }


        for (unsigned long i = 0; i < table_4_max_size; ++i)
        {
            int a = ::rand()&0xFF;
            int b = a + 1;
            int ab = a;
            int bb = b;
            table_4.add(a,b);
            table_4b.add(ab,bb);
        }

        for (unsigned long i = 0; i < table_4_max_size; ++i)
        {
            int a = ::rand()&0xF;
            int b = a + 1;
            int ab = a;
            int bb = b;
            table_8.add(a,b);
            table_8b.add(ab,bb);
        }

        for (unsigned long i = 0; i < tree_max_size; ++i)
        {
            int a = ::rand()&0xFFF;
            int b = a + 1;
            int ab = a;
            int bb = b;
            tree.add(a,b);
            treeb.add(ab,bb);
        }

        map m_4;
        m_4.load(table_4);
        map m_8;
        m_8.load(table_8);
        map m_t;
        m_t.load(tree);
        map e;
        e.load(table_4);

        DLIB_TEST(e.size() == 0);
        DLIB_TEST(e.at_start() == true);
        DLIB_TEST(e.current_element_valid() == false);     
        DLIB_TEST(e.move_next() == false);
        DLIB_TEST(e.at_start() == false);
        DLIB_TEST(e.current_element_valid() == false);            

        DLIB_TEST(m_4.size() == table_4b.size());
        DLIB_TEST(m_8.size() == table_8b.size());
        DLIB_TEST(m_t.size() == treeb.size());

        DLIB_TEST(m_4.at_start() == true);
        DLIB_TEST(m_8.at_start() == true);
        DLIB_TEST(m_t.at_start() == true);
        DLIB_TEST(m_4.current_element_valid() == false);            
        DLIB_TEST(m_8.current_element_valid() == false);            
        DLIB_TEST(m_t.current_element_valid() == false);     


        DLIB_TEST(m_4.move_next() == true);
        DLIB_TEST(m_4.at_start() == false);
        DLIB_TEST(m_4.current_element_valid() == true);
        DLIB_TEST(m_8.move_next() == true);
        DLIB_TEST(m_8.at_start() == false);
        DLIB_TEST(m_8.current_element_valid() == true);
        DLIB_TEST(m_t.move_next() == true);
        DLIB_TEST(m_t.at_start() == false);
        DLIB_TEST(m_t.current_element_valid() == true);

        m_4.reset();
        m_8.reset();
        m_t.reset();

        while (m_4.move_next())
        {
            DLIB_TEST( table_4b[m_4.element().key()] != 0);
            DLIB_TEST( *table_4b[m_4.element().key()] == m_4.element().value());
        }

        // serialize the state of m_4, then clear m_4, then
        // load the state back into m_4.
        ostringstream sout;
        serialize(m_4,sout);
        DLIB_TEST(m_4.at_start() == true);
        istringstream sin(sout.str());
        m_4.clear();
        deserialize(m_4,sin);
        DLIB_TEST(m_4.at_start() == true);



        while (table_4b.move_next())
        {
            DLIB_TEST( m_4[table_4b.element().key()] != 0);
            DLIB_TEST( *m_4[table_4b.element().key()] == table_4b.element().value());
        }

        // serialize the state of m_8, then clear m_8, then
        // load the state back into m_8.
        sout.str("");
        serialize(m_8,sout);
        DLIB_TEST(m_8.at_start() == true);
        sin.str(sout.str());
        m_8.clear();
        deserialize(m_8,sin);
        DLIB_TEST(m_8.at_start() == true);

        while (m_8.move_next())
        {
            DLIB_TEST( table_8b[m_8.element().key()] != 0);
            DLIB_TEST( *table_8b[m_8.element().key()] == m_8.element().value());
        }

        while (table_8b.move_next())
        {
            DLIB_TEST( m_8[table_8b.element().key()] != 0);
            DLIB_TEST( *m_8[table_8b.element().key()] == table_8b.element().value());
        }


        while (m_t.move_next())
        {
            DLIB_TEST( treeb[m_t.element().key()] != 0);
            DLIB_TEST( *treeb[m_t.element().key()] == m_t.element().value());
        }

        // make sure operator[] doesn't hang
        for (int l = 1; l < 10000; ++l)
        {
            DLIB_TEST(m_t[l+0xFFF] == 0);
        }

        while (treeb.move_next())
        {
            DLIB_TEST( m_t[treeb.element().key()] != 0);
            DLIB_TEST( *m_t[treeb.element().key()] == treeb.element().value());
        }



        m_4.reset();
        m_8.reset();
        m_t.reset();

        int last = 0;
        while (m_4.move_next())
        {
            DLIB_TEST(last <= m_4.element().key());
            DLIB_TEST(m_4.element().key() + 1 == m_4.element().value());
            last = m_4.element().key();
        }

        last = 0;
        while (m_8.move_next())
        {
            DLIB_TEST(last <= m_8.element().key());
            DLIB_TEST(m_8.element().key() + 1 == m_8.element().value());
            last = m_8.element().key();
        }

        last = 0;
        while (m_t.move_next())
        {
            DLIB_TEST(last <= m_t.element().key());
            DLIB_TEST(m_t.element().key() + 1 == m_t.element().value());
            last = m_t.element().key();
        }






        // this is just to test swap
        m_4.swap(m_8);
        m_4.reset();
        table_4b.reset();
        while (m_8.move_next())
        {
            DLIB_TEST( table_4b[m_8.element().key()] != 0);
            DLIB_TEST( *table_4b[m_8.element().key()] == m_8.element().value());
        }

        while (table_4b.move_next())
        {
            DLIB_TEST( m_8[table_4b.element().key()] != 0);
            DLIB_TEST( *m_8[table_4b.element().key()] == table_4b.element().value());
        }

    }





    class static_map_tester : public tester
    {
    public:
        static_map_tester (
        ) :
            tester ("test_static_map",
                    "Runs tests on the static_map component.")
        {}

        void perform_test (
        )
        {
            dlog << LINFO << "testing kernel_1a";
            static_map_kernel_test<static_map<int,int>::kernel_1a>  ();
            dlog << LINFO << "testing kernel_1a_c";
            static_map_kernel_test<static_map<int,int>::kernel_1a_c>();
        }
    } a;

}

