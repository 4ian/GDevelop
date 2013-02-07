// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.


#include <sstream>
#include <string>
#include <cstdlib>
#include <ctime>

#include <dlib/hash_table.h>
#include "tester.h"

namespace  
{

    using namespace test;
    using namespace std;
    using namespace dlib;

    logger dlog("test.hash_table");

    template <
        typename hash_table
        >
    void hash_table_kernel_test (
    )
    /*!
        requires
            - hash_table is an implementation of hash_table/hash_table_kernel_abstract.h 
              and is instantiated to map ints to ints
        ensures
            - runs tests on hash_table for compliance with the specs 
    !*/
    {        

        srand(static_cast<unsigned int>(time(0)));




        {
            hash_table test(16);

            DLIB_TEST(test.count(3) == 0);

            enumerable<map_pair<int,int> >& e = test;
            DLIB_TEST(e.at_start() == true);

            hash_table test2(16);

            hash_table test3(0);
            hash_table test4(0);


            print_spinner();

            int b;
            for (int j = 0; j < 4; ++j)
            {
                int a = 4;
                b = 5;
                test2.add(a,b);
                DLIB_TEST(test2.size() == 1);
                DLIB_TEST(*test2[4] == 5);
                DLIB_TEST(test2[99] == 0);

                DLIB_TEST(test2.move_next());
                DLIB_TEST(test2.element().key() == 4);
                DLIB_TEST(test2.element().value() == 5);

                swap(test,test2);
                DLIB_TEST(test.size() == 1);
                DLIB_TEST(*test[4] == 5);
                DLIB_TEST(test[99] == 0);

                test.swap(test2);

                a = 99; 
                b = 35;
                test2.add(a,b);
                DLIB_TEST(test2.size() == 2);
                DLIB_TEST(*test2[4] == 5);
                DLIB_TEST(*test2[99] == 35);
                DLIB_TEST(test2[99] != 0);
                DLIB_TEST(test2[949] == 0);

                test2.destroy(4);
                DLIB_TEST(test2.size() == 1);
                DLIB_TEST(test2[4] == 0);
                DLIB_TEST(*test2[99] == 35);
                DLIB_TEST(test2[99] != 0);
                DLIB_TEST(test2[949] == 0);



                test2.destroy(99);
                DLIB_TEST(test2.size() == 0);
                DLIB_TEST(test2[4] == 0);                
                DLIB_TEST(test2[99] == 0);
                DLIB_TEST(test2[949] == 0);



                test2.clear();
            }


            print_spinner();




            for (int j = 0; j < 4; ++j)
            {

                DLIB_TEST(test.count(3) == 0);
                DLIB_TEST(test.size() == 0);
                DLIB_TEST(test.at_start() == true);
                DLIB_TEST(test.current_element_valid() == false);
                DLIB_TEST(test.move_next() == false);
                DLIB_TEST(test.at_start() == false);
                DLIB_TEST(test.current_element_valid() == false);
                DLIB_TEST(test.move_next() == false);
                DLIB_TEST(test.move_next() == false);

                int a;

                for (int i = 0; i < 10000; ++i)
                {
                    a = ::rand()%1000;
                    int temp = a;
                    unsigned long count = test.count(a);
                    test.add(a,b);
                    DLIB_TEST(test.count(temp) == count+1);
                }

                {
                    unsigned long count = test.count(3);

                    a = 3; test.add(a,b); ++count;
                    DLIB_TEST(test.count(3) == count);
                    a = 3; test.add(a,b); ++count;
                    DLIB_TEST(test.count(3) == count);
                    a = 3; test.add(a,b); ++count;
                    DLIB_TEST(test.count(3) == count);
                    a = 3; test.add(a,b); ++count;
                    DLIB_TEST(test.count(3) == count);
                }


                test.clear();


                for (int i = 0; i < 10000; ++i)
                {
                    a = b = i;
                    unsigned long count = test.count(a);
                    test.add(a,b);
                    DLIB_TEST(test.count(i) == count+1);
                }

                DLIB_TEST(test.size() == 10000);
                DLIB_TEST(test.at_start() == true);
                DLIB_TEST(test.current_element_valid() == false);
                DLIB_TEST(test.move_next() == true);
                DLIB_TEST(test.at_start() == false);
                DLIB_TEST(test.current_element_valid() == true);
                DLIB_TEST(test.move_next() == true);
                DLIB_TEST(test.move_next() == true);            
                DLIB_TEST(test.current_element_valid() == true);


                test.reset();

                DLIB_TEST(test.size() == 10000);
                DLIB_TEST(test.at_start() == true);
                DLIB_TEST(test.current_element_valid() == false);


                if (test.size() > 0)
                {
                    int* array = new int[test.size()];
                    int* tmp = array;

                    int count = 0;
                    while (test.move_next())
                    {
                        ++count;
                        *tmp = test.element().key();
                        DLIB_TEST(test[*tmp] != 0);                    
                        DLIB_TEST(*tmp == test.element().key());
                        DLIB_TEST(*tmp == test.element().value());
                        DLIB_TEST(*tmp == test.element().key());
                        DLIB_TEST(test.current_element_valid() == true);
                        ++tmp;
                    }

                    DLIB_TEST(count == 10000);
                    DLIB_TEST(test.at_start() == false);
                    DLIB_TEST(test.current_element_valid() == false);
                    DLIB_TEST(test.move_next() == false);
                    DLIB_TEST(test.current_element_valid() == false);
                    DLIB_TEST(test.at_start() == false);
                    DLIB_TEST(test.current_element_valid() == false);

                    DLIB_TEST(test.size() == 10000);

                    swap(test,test2);




                    // serialize the state of test2, then clear test2, then
                    // load the state back into test2.
                    ostringstream sout;
                    serialize(test2,sout);
                    DLIB_TEST(test2.at_start() == true);
                    istringstream sin(sout.str());
                    test2.clear();
                    deserialize(test2,sin);
                    DLIB_TEST(test2.at_start() == true);




                    tmp = array;
                    for (int i = 0; i < 10000; ++i)
                    {
                        DLIB_TEST(*test2[*tmp] == *tmp);
                        DLIB_TEST(*test2[*tmp] == *tmp);
                        DLIB_TEST(*test2[*tmp] == *tmp);
                        ++tmp;
                    }

                    test2.swap(test);
                    test.reset();

                    DLIB_TEST(test.at_start() == true);
                    count = 0;
                    tmp = array;
                    while (test.size() > 0)
                    {
                        test.remove(*tmp,a,b);

                        ++tmp;
                        ++count;
                    }

                    DLIB_TEST(count == 10000);
                    DLIB_TEST(test.size() == 0);



                    DLIB_TEST(count == 10000);







                    delete [] array;
                }

                test.move_next();

                for (int i = 0; i < 10000; ++i)
                {
                    a = ::rand();
                    test.add(a,b);
                }

                DLIB_TEST(test.at_start() == true);
                DLIB_TEST(test.move_next() == true);

                DLIB_TEST(test.size() == 10000);

                for (int i = 0; i < 10000; ++i)
                {
                    test.remove_any(a,b);
                }

                DLIB_TEST(test.at_start() == true);
                DLIB_TEST(test.move_next() == false);
                DLIB_TEST(test.size() == 0);

                test.clear();









                int* dtmp = new int[10000];
                int* rtmp = new int[10000];

                int* d = dtmp;
                int* r = rtmp;
                for (unsigned long i = 0; i < 10000; ++i)
                {
                    a = ::rand();
                    b = ::rand();
                    *d = a;
                    *r = b;
                    if (test[a] != 0)
                    {
                        --i;
                        continue;
                    }
                    test.add(a,b);
                    ++d;
                    ++r;
                    DLIB_TEST(test.size() == i+1);
                }

                DLIB_TEST(test.size() == 10000);

                for (int i = 0; i < 10000; ++i)
                {
                    DLIB_TEST(*test[dtmp[i]] == rtmp[i]);
                }


                delete [] dtmp;
                delete [] rtmp;

                test.clear();
            }}


            print_spinner();
























            // now do the same thing as above but with a much smaller hash table
            {
                hash_table test(13);

                DLIB_TEST(test.count(3) == 0);

                enumerable<map_pair<int,int> >& e = test;
                DLIB_TEST(e.at_start() == true);

                hash_table test2(16);

                hash_table test3(0);
                hash_table test4(0);


                int b;
                for (int j = 0; j < 4; ++j)
                {
                    int a = 4;
                    b = 5;
                    test2.add(a,b);
                    DLIB_TEST(test2.size() == 1);
                    DLIB_TEST(*test2[4] == 5);
                    DLIB_TEST(test2[99] == 0);


                    DLIB_TEST(test2.move_next());
                    DLIB_TEST(test2.element().key() == 4);
                    DLIB_TEST(test2.element().value() == 5);

                    swap(test,test2);
                    DLIB_TEST(test.size() == 1);
                    DLIB_TEST(*test[4] == 5);
                    DLIB_TEST(test[99] == 0);

                    test.swap(test2);

                    a = 99; 
                    b = 35;
                    test2.add(a,b);
                    DLIB_TEST(test2.size() == 2);
                    DLIB_TEST(*test2[4] == 5);
                    DLIB_TEST(*test2[99] == 35);
                    DLIB_TEST(test2[99] != 0);
                    DLIB_TEST(test2[949] == 0);

                    test2.destroy(4);
                    DLIB_TEST(test2.size() == 1);
                    DLIB_TEST(test2[4] == 0);
                    DLIB_TEST(*test2[99] == 35);
                    DLIB_TEST(test2[99] != 0);
                    DLIB_TEST(test2[949] == 0);



                    test2.destroy(99);
                    DLIB_TEST(test2.size() == 0);
                    DLIB_TEST(test2[4] == 0);                
                    DLIB_TEST(test2[99] == 0);
                    DLIB_TEST(test2[949] == 0);



                    test2.clear();
                }


                print_spinner();




                for (int j = 0; j < 4; ++j)
                {

                    DLIB_TEST(test.count(3) == 0);
                    DLIB_TEST(test.size() == 0);
                    DLIB_TEST(test.at_start() == true);
                    DLIB_TEST(test.current_element_valid() == false);
                    DLIB_TEST(test.move_next() == false);
                    DLIB_TEST(test.at_start() == false);
                    DLIB_TEST(test.current_element_valid() == false);
                    DLIB_TEST(test.move_next() == false);
                    DLIB_TEST(test.move_next() == false);

                    int a;

                    for (int i = 0; i < 10000; ++i)
                    {
                        a = ::rand()%1000;
                        int temp = a;
                        unsigned long count = test.count(a);
                        test.add(a,b);
                        DLIB_TEST(test.count(temp) == count+1);
                    }

                    {
                        unsigned long count = test.count(3);

                        a = 3; test.add(a,b); ++count;
                        DLIB_TEST(test.count(3) == count);
                        a = 3; test.add(a,b); ++count;
                        DLIB_TEST(test.count(3) == count);
                        a = 3; test.add(a,b); ++count;
                        DLIB_TEST(test.count(3) == count);
                        a = 3; test.add(a,b); ++count;
                        DLIB_TEST(test.count(3) == count);
                    }


                    test.clear();


                    for (int i = 0; i < 10000; ++i)
                    {
                        a = b = i;
                        unsigned long count = test.count(a);
                        test.add(a,b);
                        DLIB_TEST(test.count(i) == count+1);
                    }

                    DLIB_TEST(test.size() == 10000);
                    DLIB_TEST(test.at_start() == true);
                    DLIB_TEST(test.current_element_valid() == false);
                    DLIB_TEST(test.move_next() == true);
                    DLIB_TEST(test.at_start() == false);
                    DLIB_TEST(test.current_element_valid() == true);
                    DLIB_TEST(test.move_next() == true);
                    DLIB_TEST(test.move_next() == true);            
                    DLIB_TEST(test.current_element_valid() == true);


                    test.reset();

                    DLIB_TEST(test.size() == 10000);
                    DLIB_TEST(test.at_start() == true);
                    DLIB_TEST(test.current_element_valid() == false);


                    if (test.size() > 0)
                    {
                        int* array = new int[test.size()];
                        int* tmp = array;

                        int count = 0;
                        while (test.move_next())
                        {
                            ++count;
                            *tmp = test.element().key();
                            DLIB_TEST(test[*tmp] != 0);                    
                            DLIB_TEST(*tmp == test.element().key());
                            DLIB_TEST(*tmp == test.element().value());
                            DLIB_TEST(*tmp == test.element().key());
                            DLIB_TEST(test.current_element_valid() == true);
                            ++tmp;
                        }

                        DLIB_TEST(count == 10000);
                        DLIB_TEST(test.at_start() == false);
                        DLIB_TEST(test.current_element_valid() == false);
                        DLIB_TEST(test.move_next() == false);
                        DLIB_TEST(test.current_element_valid() == false);
                        DLIB_TEST(test.at_start() == false);
                        DLIB_TEST(test.current_element_valid() == false);

                        DLIB_TEST(test.size() == 10000);

                        swap(test,test2);

                        tmp = array;
                        for (int i = 0; i < 10000; ++i)
                        {
                            DLIB_TEST(*test2[*tmp] == *tmp);
                            DLIB_TEST(*test2[*tmp] == *tmp);
                            DLIB_TEST(*test2[*tmp] == *tmp);
                            ++tmp;
                        }

                        test2.swap(test);
                        test.reset();

                        DLIB_TEST(test.at_start() == true);
                        count = 0;
                        tmp = array;
                        while (test.size() > 0)
                        {
                            test.remove(*tmp,a,b);

                            ++tmp;
                            ++count;
                        }

                        DLIB_TEST(count == 10000);
                        DLIB_TEST(test.size() == 0);



                        DLIB_TEST(count == 10000);







                        delete [] array;
                    }

                    test.move_next();

                    for (int i = 0; i < 10000; ++i)
                    {
                        a = ::rand();
                        test.add(a,b);
                    }

                    DLIB_TEST(test.at_start() == true);
                    DLIB_TEST(test.move_next() == true);

                    DLIB_TEST(test.size() == 10000);

                    for (int i = 0; i < 10000; ++i)
                    {
                        test.remove_any(a,b);
                    }

                    DLIB_TEST(test.at_start() == true);
                    DLIB_TEST(test.move_next() == false);
                    DLIB_TEST(test.size() == 0);

                    test.clear();








                    int* dtmp = new int[10000];
                    int* rtmp = new int[10000];

                    int* d = dtmp;
                    int* r = rtmp;
                    for (unsigned long i = 0; i < 10000; ++i)
                    {
                        a = ::rand();
                        b = ::rand();
                        *d = a;
                        *r = b;
                        if (test[a] != 0)
                        {
                            --i;
                            continue;
                        }
                        test.add(a,b);
                        ++d;
                        ++r;
                        DLIB_TEST(test.size() == i+1);
                    }

                    DLIB_TEST(test.size() == 10000);

                    for (int i = 0; i < 10000; ++i)
                    {
                        DLIB_TEST(*test[dtmp[i]] == rtmp[i]);
                    }


                    delete [] dtmp;
                    delete [] rtmp;

                    test.clear();
                }}

    }




    class hash_table_tester : public tester
    {
    public:
        hash_table_tester (
        ) :
            tester ("test_hash_table",
                    "Runs tests on the hash_table component.")
        {}

        void perform_test (
        )
        {
            dlog << LINFO << "testing kernel_1a";
            hash_table_kernel_test<hash_table<int,int>::kernel_1a>  ();
            dlog << LINFO << "testing kernel_1a_c";
            hash_table_kernel_test<hash_table<int,int>::kernel_1a_c>();
            dlog << LINFO << "testing kernel_2a";
            hash_table_kernel_test<hash_table<int,int>::kernel_2a>  ();
            dlog << LINFO << "testing kernel_2a_c";
            hash_table_kernel_test<hash_table<int,int>::kernel_2a_c>();
        }
    } a;

}

