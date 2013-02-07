// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_BINARY_SEARCH_TREE_KERNEl_TEST_H_
#define DLIB_BINARY_SEARCH_TREE_KERNEl_TEST_H_


#include <sstream>
#include <string>
#include <cstdlib>
#include <ctime>

#include <dlib/memory_manager_global.h>
#include <dlib/memory_manager_stateless.h>
#include <dlib/binary_search_tree.h>
#include "tester.h"

namespace  
{

    using namespace test;
    using namespace std;
    using namespace dlib;

    logger dlog("test.binary_search_tree");

    template <
        typename bst
        >
    void binary_search_tree_kernel_test (
    )
    /*!
        requires
            - bst is an implementation of 
              binary_search_tree/binary_search_tree_kernel_abstract.h is instantiated 
              to map int to int
        ensures
            - runs tests on bst for compliance with the specs 
    !*/
    {        

        bst test, test2;

        srand(static_cast<unsigned int>(time(0)));


        DLIB_TEST(test.count(3) == 0);

        enumerable<map_pair<int,int> >& e = test;
        DLIB_TEST(e.at_start() == true);

        DLIB_TEST(test.count(3) == 0);

        for (int i = 0; i < 4; ++i)
        {
            DLIB_TEST(test.size() == 0);
            DLIB_TEST(test.count(3) == 0);
            DLIB_TEST(test.height() == 0);
            DLIB_TEST(test[5] == 0);
            DLIB_TEST(test[0] == 0);
            DLIB_TEST(test.at_start());
            DLIB_TEST(test.current_element_valid() == false);
            DLIB_TEST(test.count(3) == 0);

            DLIB_TEST(test.move_next() == false);
            DLIB_TEST(test.move_next() == false);
            DLIB_TEST(test.move_next() == false);
            DLIB_TEST(test.move_next() == false);
            DLIB_TEST(test.move_next() == false);
            DLIB_TEST(test.count(3) == 0);

            DLIB_TEST(test.at_start() == false);
            DLIB_TEST(test.current_element_valid() == false);

            test.clear();
            test.position_enumerator(5);
            DLIB_TEST(test.current_element_valid() == false);
            DLIB_TEST(test.at_start() == false);
            test.position_enumerator(5);
            DLIB_TEST(test.current_element_valid() == false);
            DLIB_TEST(test.at_start() == false);
            test.position_enumerator(9);
            DLIB_TEST(test.current_element_valid() == false);
            DLIB_TEST(test.at_start() == false);
            test.clear();
            test.position_enumerator(5);
            DLIB_TEST(test.current_element_valid() == false);
            DLIB_TEST(test.at_start() == false);
            test.position_enumerator(5);
            DLIB_TEST(test.current_element_valid() == false);
            DLIB_TEST(test.at_start() == false);
            test.position_enumerator(9);
            DLIB_TEST(test.current_element_valid() == false);
            DLIB_TEST(test.at_start() == false);
            test.clear();
            DLIB_TEST(test.at_start() == true);
            DLIB_TEST(test.current_element_valid() == false);


            DLIB_TEST(test.count(3) == 0);

            DLIB_TEST(test.size() == 0);
            DLIB_TEST(test.height() == 0);
            DLIB_TEST(test[5] == 0);
            DLIB_TEST(test[0] == 0);
            DLIB_TEST(const_cast<const bst&>(test)[5] == 0);
            DLIB_TEST(const_cast<const bst&>(test)[0] == 0);
            DLIB_TEST(test.at_start());
            DLIB_TEST(test.current_element_valid() == false);

            DLIB_TEST(test.move_next() == false);
            DLIB_TEST(test.move_next() == false);
            DLIB_TEST(test.move_next() == false);
            DLIB_TEST(test.move_next() == false);
            DLIB_TEST(test.move_next() == false);

            DLIB_TEST(test.at_start() == false);
            DLIB_TEST(test.current_element_valid() == false);


            DLIB_TEST(test.count(3) == 0);
            test.reset();
            DLIB_TEST(test.count(3) == 0);

            DLIB_TEST(test.at_start());
            DLIB_TEST(test.current_element_valid() == false);






            int a = 0, b = 0;

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
                a = ::rand()&0x7FFF;
                b = 0;
                int temp = a;
                unsigned long count = test.count(a);
                test.add(a,b);
                DLIB_TEST(test.count(temp) == count+1);
            }

            // serialize the state of test, then clear test, then
            // load the state back into test.
            ostringstream sout;
            serialize(test,sout);
            istringstream sin(sout.str());
            test.clear();
            deserialize(test,sin);

            DLIB_TEST(test.size() == 10000);
            DLIB_TEST(test.at_start() == true);
            DLIB_TEST(test.current_element_valid() == false);


            DLIB_TEST_MSG(test.height() > 13 && test.height() <= 26,"this is somewhat of an implementation dependent "
                         << "but really it should be in this range or the implementation is just crap");

            a = 0;
            unsigned long count = 0;
            while (test.move_next())
            {
                DLIB_TEST_MSG(a <= test.element().key(),"the numers are out of order but they should be in order");
                a = test.element().key();
                ++count;


                DLIB_TEST(test.at_start() == false);
                DLIB_TEST(test.current_element_valid() == true);
            }

            DLIB_TEST(test.move_next() == false);
            DLIB_TEST(test.move_next() == false);
            DLIB_TEST(test.move_next() == false);

            DLIB_TEST(count == 10000);




            DLIB_TEST_MSG(test.height() > 13 && test.height() <= 26,"this is somewhat of an implementation dependent "
                         << "but really it should be in this range or the implementation is just crap");

            DLIB_TEST(test.at_start() == false);
            DLIB_TEST(test.current_element_valid() == false);
            DLIB_TEST(test.size() == 10000);


            swap(test,test2);


            test2.reset();
            count = 0;
            a = 0;
            while (test2.move_next())
            {
                DLIB_TEST_MSG(a <= test2.element().key(),"the numers are out of order but they should be in order");
                a = test2.element().key();
                ++count;


                DLIB_TEST(test2.at_start() == false);
                DLIB_TEST(test2.current_element_valid() == true);

                if (count == 5000)
                {
                    break;
                }
            }

            DLIB_TEST(test2.move_next() == true);
            DLIB_TEST(test2.move_next() == true);
            DLIB_TEST(test2.move_next() == true);


            test2.reset();

            count = 0;
            a = 0;
            while (test2.move_next())
            {
                DLIB_TEST_MSG(a <= test2.element().key(),"the numers are out of order but they should be in order");
                a = test2.element().key();
                ++count;


                DLIB_TEST(test2.at_start() == false);
                DLIB_TEST(test2.current_element_valid() == true);
            }

            DLIB_TEST(count == 10000);
            DLIB_TEST(test2.move_next() == false);
            DLIB_TEST(test2.move_next() == false);
            DLIB_TEST(test2.move_next() == false);








            int last = 0;
            asc_pair_remover<int,int,typename bst::compare_type>& asdf = test2;
            DLIB_TEST(asdf.size() > 0);
            while (asdf.size() > 0)
            {
                asdf.remove_any(a,b);
                DLIB_TEST(last <= a);
                last = a;
                --count;
                DLIB_TEST(asdf.size() == count);
            }


            DLIB_TEST(test2.size() == 0);
            DLIB_TEST(test2.height() ==0);
            DLIB_TEST(test2.at_start() == true);
            DLIB_TEST(test2.current_element_valid() == false);
            DLIB_TEST(test2.move_next() == false);
            DLIB_TEST(test2.move_next() == false);
            DLIB_TEST(test2.move_next() == false);




            for (int i = 0; i < 10000; ++i)
            {
                a = i;
                b = i;
                test2.add(a,b);
                DLIB_TEST(test2.size() == (unsigned int)(i +1));
                DLIB_TEST(test2.count(i) == 1);
            }

            a = 0;
            test2.position_enumerator(a);
            DLIB_TEST(test2.at_start() == false);
            DLIB_TEST(test2.element().key() == a);
            DLIB_TEST(test2.element().value() == a);
            a = 0;
            test2.position_enumerator(a);
            DLIB_TEST(test2.element().key() == a);
            DLIB_TEST(test2.element().value() == a);
            a = 8;
            test2.position_enumerator(a);
            DLIB_TEST(test2.at_start() == false);
            DLIB_TEST(test2.element().key() == a);
            DLIB_TEST(test2.element().value() == a);
            a = 1;
            test2.position_enumerator(a);
            DLIB_TEST(test2.element().key() == a);
            DLIB_TEST(test2.element().value() == a);
            a = -29;
            test2.position_enumerator(a);
            DLIB_TEST(test2.element().key() == 0);
            DLIB_TEST(test2.element().value() == 0);
            a = 10000;
            test2.position_enumerator(a);
            DLIB_TEST(test2.at_start() == false);
            DLIB_TEST(test2.current_element_valid() == false);
            a = -29;
            test2.position_enumerator(a);
            DLIB_TEST(test2.element().key() == 0);
            DLIB_TEST(test2.element().value() == 0);
            a = 8;
            test2.position_enumerator(a);
            DLIB_TEST(test2.at_start() == false);
            DLIB_TEST(test2.element().key() == a);
            DLIB_TEST(test2.element().value() == a);
            test2.reset();


            DLIB_TEST_MSG(test2.height() > 13 && test2.height() <= 26,"this is somewhat of an implementation dependent "
                         << "but really it should be in this range or the implementation is just crap");

            DLIB_TEST(test2.at_start() == true);
            DLIB_TEST(test2.current_element_valid() == false);
            DLIB_TEST(test2.size() == 10000);


            for (int i = 0; i < 10000; ++i)
            {
                DLIB_TEST(test2.move_next() == true);
                DLIB_TEST(test2.element().key() == i);
            }



            DLIB_TEST_MSG(test2.height() > 13 && test2.height() <= 26,"this is somewhat of an implementation dependent "
                         << "but really it should be in this range or the implementation is just crap");

            DLIB_TEST(test2.at_start() == false);
            DLIB_TEST(test2.current_element_valid() == true);
            DLIB_TEST(test2.size() == 10000);


            DLIB_TEST(test2.move_next() == false);
            DLIB_TEST(test2.current_element_valid() == false);

            a = 3;
            test2.add(a,b);
            DLIB_TEST(test2.count(3) == 2);


            for (int i = 0; i < 10000; ++i)
            {
                test2.remove(i,a,b);
                DLIB_TEST(i == a);
            }
            test2.remove(3,a,b);


            DLIB_TEST(test2.size() == 0);
            DLIB_TEST(test2.height() == 0);
            DLIB_TEST(test2.at_start() == true);
            DLIB_TEST(test2.current_element_valid() == false);
            DLIB_TEST(test2.move_next() == false);
            DLIB_TEST(test2.at_start() == false);
            DLIB_TEST(test2.current_element_valid() == false);



            test2.clear();


            int m = 0;
            for (int i = 0; i < 10000; ++i)
            {
                a = ::rand()&0x7FFF;
                m = max(a,m);
                test2.add(a,b);
            }

            DLIB_TEST(test2.at_start() == true);
            DLIB_TEST(test2.move_next() == true);
            DLIB_TEST(test2.at_start() == false);
            DLIB_TEST(test2.current_element_valid() == true);
            DLIB_TEST(test2.move_next() == true);
            DLIB_TEST(test2.current_element_valid() == true);
            DLIB_TEST(test2.move_next() == true);
            DLIB_TEST(test2.current_element_valid() == true);
            DLIB_TEST(test2.move_next() == true);
            DLIB_TEST(test2.current_element_valid() == true);
            DLIB_TEST(test2.at_start() == false);

            for (int i = 0; i < 10000; ++i)
            {
                a = ::rand()&0xFFFF;
                test2.position_enumerator(a);
                if (test2[a])
                {
                    DLIB_TEST(test2.element().key() == a);
                }
                else if (a <= m)
                {
                    DLIB_TEST(test2.element().key() > a);
                }
            }

            test2.clear();

            DLIB_TEST(test2.current_element_valid() == false);
            DLIB_TEST(test2.at_start() == true);
            DLIB_TEST(test2.move_next() == false);
            DLIB_TEST(test2.at_start() == false);
            DLIB_TEST(test2.current_element_valid() == false);
            DLIB_TEST(test2.move_next() == false);
            DLIB_TEST(test2.current_element_valid() == false);
            DLIB_TEST(test2.move_next() == false);
            DLIB_TEST(test2.current_element_valid() == false);
            DLIB_TEST(test2.at_start() == false);


            DLIB_TEST(test2.size() == 0);
            DLIB_TEST(test2.height() == 0);


            for (int i = 0; i < 20000; ++i)
            {
                a = ::rand()&0x7FFF;
                b = a;
                test2.add(a,b);
            }


            DLIB_TEST(test2.size() == 20000);



            // remove a bunch of elements randomly
            int c;
            for (int i = 0; i < 50000; ++i)
            {
                a = ::rand()&0x7FFF;
                if (test2[a] != 0)
                {
                    test2.remove(a,b,c);
                    DLIB_TEST(a == b);
                }
            }


            // now add a bunch more
            for (int i = 0; i < 10000; ++i)
            {
                a = ::rand()&0x7FFF;
                b = a;
                test2.add(a,b);
            }


            // now iterate over it all and then remove all elements
            {
                int* array = new int[test2.size()];
                int* tmp = array;
                DLIB_TEST(test2.at_start() == true);
                while (test2.move_next())
                {
                    *tmp = test2.element().key();
                    ++tmp;
                }

                DLIB_TEST(test2.at_start() == false);
                DLIB_TEST(test2.current_element_valid() == false);
                DLIB_TEST(test2.move_next() == false);

                tmp = array;
                for (int i = 0; i < 10000; ++i)
                {
                    DLIB_TEST(*test2[*tmp] == *tmp);
                    DLIB_TEST(*test2[*tmp] == *tmp);
                    DLIB_TEST(*test2[*tmp] == *tmp);
                    DLIB_TEST(*const_cast<const bst&>(test2)[*tmp] == *tmp);
                    ++tmp;
                }

                tmp = array;
                while (test2.size() > 0)
                {
                    unsigned long count = test2.count(*tmp);
                    test2.destroy(*tmp);
                    DLIB_TEST(test2.count(*tmp)+1 == count);
                    ++tmp;
                }

                DLIB_TEST(test2.at_start() == true);
                DLIB_TEST(test2.current_element_valid() == false);
                DLIB_TEST(test2.move_next() == false);
                DLIB_TEST(test2.at_start() == false);
                test.swap(test2);
                test.reset();

                delete [] array;
            }


            DLIB_TEST(test.size() == 0);
            DLIB_TEST(test.height() == 0);

            for (unsigned long i = 1; i < 100; ++i)
            {
                a = 1234;
                test.add(a,b);
                DLIB_TEST(test.count(1234) == i);
            }

            test.clear();






            for (int m = 0; m < 3; ++m)
            {

                test2.clear();

                DLIB_TEST(test2.current_element_valid() == false);
                DLIB_TEST(test2.at_start() == true);
                DLIB_TEST(test2.move_next() == false);
                DLIB_TEST(test2.at_start() == false);
                DLIB_TEST(test2.current_element_valid() == false);
                DLIB_TEST(test2.move_next() == false);
                DLIB_TEST(test2.current_element_valid() == false);
                DLIB_TEST(test2.move_next() == false);
                DLIB_TEST(test2.current_element_valid() == false);
                DLIB_TEST(test2.at_start() == false);


                DLIB_TEST(test2.size() == 0);
                DLIB_TEST(test2.height() == 0);


                int counter = 0;
                while (counter < 10000)
                {
                    a = ::rand()&0x7FFF;
                    b = ::rand()&0x7FFF;
                    if (test2[a] == 0)
                    {
                        test2.add(a,b);
                        ++counter;
                    }

                }



                DLIB_TEST(test2.size() == 10000);



                // remove a bunch of elements randomly                
                for (int i = 0; i < 20000; ++i)
                {
                    a = ::rand()&0x7FFF;
                    if (test2[a] != 0)
                    {
                        test2.remove(a,b,c);
                        DLIB_TEST(a == b);
                    }
                }


                // now add a bunch more
                for (int i = 0; i < 20000; ++i)
                {
                    a = ::rand()&0x7FFF;
                    b = ::rand()&0x7FFF;
                    if (test2[a] == 0)
                        test2.add(a,b);
                }


                // now iterate over it all and then remove all elements
                {
                    int* array = new int[test2.size()];
                    int* array_val = new int[test2.size()];
                    int* tmp = array;
                    int* tmp_val = array_val;
                    DLIB_TEST(test2.at_start() == true);
                    int count = 0;
                    while (test2.move_next())
                    {
                        *tmp = test2.element().key();
                        ++tmp;
                        *tmp_val = test2.element().value();
                        ++tmp_val;

                        DLIB_TEST(*test2[*(tmp-1)] == *(tmp_val-1));
                        ++count;
                    }

                    DLIB_TEST(count == (int)test2.size());
                    DLIB_TEST(test2.at_start() == false);
                    DLIB_TEST(test2.current_element_valid() == false);
                    DLIB_TEST(test2.move_next() == false);

                    tmp = array;
                    tmp_val = array_val;
                    for (unsigned long i = 0; i < test2.size(); ++i)
                    {
                        DLIB_TEST_MSG(*test2[*tmp] == *tmp_val,i);
                        DLIB_TEST(*test2[*tmp] == *tmp_val);
                        DLIB_TEST(*test2[*tmp] == *tmp_val);
                        DLIB_TEST(*const_cast<const bst&>(test2)[*tmp] == *tmp_val);
                        ++tmp;
                        ++tmp_val;
                    }

                    //  out << "\nsize:   " << test2.size() << endl;
                    //  out << "height: " << test2.height() << endl;

                    tmp = array;
                    while (test2.size() > 0)
                    {
                        unsigned long count = test2.count(*tmp);
                        test2.destroy(*tmp);
                        DLIB_TEST(test2.count(*tmp)+1 == count);
                        ++tmp;
                    }

                    DLIB_TEST(test2.at_start() == true);
                    DLIB_TEST(test2.current_element_valid() == false);
                    DLIB_TEST(test2.move_next() == false);
                    DLIB_TEST(test2.at_start() == false);
                    test.swap(test2);
                    test.reset();

                    delete [] array;
                    delete [] array_val;
                }


                DLIB_TEST(test.size() == 0);
                DLIB_TEST(test.height() == 0);

                for (unsigned long i = 1; i < 100; ++i)
                {
                    a = 1234;
                    test.add(a,b);
                    DLIB_TEST(test.count(1234) == i);
                }

                test.clear();

            }



            a = 1;
            b = 2;

            test.add(a,b);

            test.position_enumerator(0);
            a = 0;
            b = 0;
            DLIB_TEST(test.height() == 1);
            test.remove_current_element(a,b);
            DLIB_TEST(a == 1);
            DLIB_TEST(b == 2);
            DLIB_TEST(test.at_start() == false);
            DLIB_TEST(test.current_element_valid() == false);
            DLIB_TEST(test.height() == 0);
            DLIB_TEST(test.size() == 0);


            a = 1;
            b = 2;
            test.add(a,b);
            a = 1;
            b = 2;
            test.add(a,b);

            test.position_enumerator(0);
            a = 0;
            b = 0;
            DLIB_TEST(test.height() == 2);
            test.remove_current_element(a,b);
            DLIB_TEST(a == 1);
            DLIB_TEST(b == 2);
            DLIB_TEST(test.at_start() == false);
            DLIB_TEST(test.current_element_valid() == true);
            DLIB_TEST(test.height() == 1);
            DLIB_TEST(test.size() == 1);

            test.remove_current_element(a,b);
            DLIB_TEST(a == 1);
            DLIB_TEST(b == 2);
            DLIB_TEST(test.at_start() == false);
            DLIB_TEST(test.current_element_valid() == false);
            DLIB_TEST(test.height() == 0);
            DLIB_TEST(test.size() == 0);

            for (int i = 0; i < 100; ++i)
            {
                a = i;
                b = i;
                test.add(a,b);
            }

            DLIB_TEST(test.size() == 100);
            test.remove_last_in_order(a,b);
            DLIB_TEST(a == 99);
            DLIB_TEST(b == 99);
            DLIB_TEST(test.size() == 99);
            test.remove_last_in_order(a,b);
            DLIB_TEST(a == 98);
            DLIB_TEST(b == 98);
            DLIB_TEST(test.size() == 98);

            test.position_enumerator(-10);
            for (int i = 0; i < 97; ++i)
            {
                DLIB_TEST(test.element().key() == i);
                DLIB_TEST(test.element().value() == i);
                DLIB_TEST(test.move_next());
            }
            DLIB_TEST(test.move_next() == false);
            DLIB_TEST(test.current_element_valid() == false);


            test.position_enumerator(10);
            for (int i = 10; i < 97; ++i)
            {
                DLIB_TEST(test.element().key() == i);
                DLIB_TEST(test.element().value() == i);
                DLIB_TEST(test.move_next());
            }
            DLIB_TEST(test.move_next() == false);
            DLIB_TEST(test.current_element_valid() == false);

            test.reset();
            DLIB_TEST(test.at_start());
            DLIB_TEST(test.current_element_valid() == false);
            for (int i = 0; i < 98; ++i)
            {
                DLIB_TEST(test.move_next());
                DLIB_TEST(test.element().key() == i);
                DLIB_TEST(test.element().value() == i);
            }
            DLIB_TEST_MSG(test.size() == 98, test.size());
            DLIB_TEST(test.move_next() == false);

            test.position_enumerator(98);
            DLIB_TEST(test.current_element_valid() == false);
            DLIB_TEST(test.at_start() == false);


            test.position_enumerator(50);
            DLIB_TEST(test.element().key() == 50);
            DLIB_TEST(test.element().value() == 50);
            DLIB_TEST(test[50] != 0);
            test.remove_current_element(a,b);
            DLIB_TEST(test[50] == 0);
            DLIB_TEST_MSG(test.size() == 97, test.size());
            DLIB_TEST(a == 50);
            DLIB_TEST(b == 50);
            DLIB_TEST(test.element().key() == 51);
            DLIB_TEST(test.element().value() == 51);
            DLIB_TEST(test.current_element_valid());
            test.remove_current_element(a,b);
            DLIB_TEST_MSG(test.size() == 96, test.size());
            DLIB_TEST(a == 51);
            DLIB_TEST(b == 51);
            DLIB_TEST_MSG(test.element().key() == 52,test.element().key());
            DLIB_TEST_MSG(test.element().value() == 52,test.element().value());
            DLIB_TEST(test.current_element_valid());
            test.remove_current_element(a,b);
            DLIB_TEST_MSG(test.size() == 95, test.size());
            DLIB_TEST(a == 52);
            DLIB_TEST(b == 52);
            DLIB_TEST_MSG(test.element().key() == 53,test.element().key());
            DLIB_TEST_MSG(test.element().value() == 53,test.element().value());
            DLIB_TEST(test.current_element_valid());
            test.position_enumerator(50);
            DLIB_TEST_MSG(test.element().key() == 53,test.element().key());
            DLIB_TEST_MSG(test.element().value() == 53,test.element().value());
            DLIB_TEST(test.current_element_valid());
            test.position_enumerator(51);
            DLIB_TEST_MSG(test.element().key() == 53,test.element().key());
            DLIB_TEST_MSG(test.element().value() == 53,test.element().value());
            DLIB_TEST(test.current_element_valid());
            test.position_enumerator(52);
            DLIB_TEST_MSG(test.element().key() == 53,test.element().key());
            DLIB_TEST_MSG(test.element().value() == 53,test.element().value());
            DLIB_TEST(test.current_element_valid());
            test.position_enumerator(53);
            DLIB_TEST_MSG(test.element().key() == 53,test.element().key());
            DLIB_TEST_MSG(test.element().value() == 53,test.element().value());
            DLIB_TEST(test.current_element_valid());

            test.reset();
            test.move_next();
            int lasta = -1, lastb = -1;
            count = 0;
            while (test.current_element_valid() )
            {
                ++count;
                int c = test.element().key();
                int d = test.element().value();
                test.remove_current_element(a,b);
                DLIB_TEST(c == a);
                DLIB_TEST(d == a);
                DLIB_TEST(lasta < a);
                DLIB_TEST(lastb < b);
                lasta = a;
                lastb = b;
            }
            DLIB_TEST_MSG(count == 95, count);
            DLIB_TEST(test.size() == 0);
            DLIB_TEST(test.height() == 0);

            test.clear();

            for (int i = 0; i < 1000; ++i)
            {
                a = 1;
                b = 1;
                test.add(a,b);
            }

            for (int i = 0; i < 40; ++i)
            {
                int num = ::rand()%800 + 1;
                test.reset();
                for (int j = 0; j < num; ++j)
                {
                    DLIB_TEST(test.move_next());
                }					             
                DLIB_TEST_MSG(test.current_element_valid(),"size: " << test.size() << "   num: " << num);
                test.remove_current_element(a,b);
                DLIB_TEST_MSG(test.current_element_valid(),"size: " << test.size() << "   num: " << num);
                test.remove_current_element(a,b);
                test.position_enumerator(1);
                if (test.current_element_valid())
                    test.remove_current_element(a,b);
                DLIB_TEST(a == 1);
                DLIB_TEST(b == 1);
            }

            test.clear();

        }


        test.clear();
        test2.clear();

    }

}

#endif // DLIB_BINARY_SEARCH_TREE_KERNEl_TEST_H_

