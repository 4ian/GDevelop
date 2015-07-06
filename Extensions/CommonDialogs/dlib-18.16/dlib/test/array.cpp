// Copyright (C) 2005  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.  

#include <sstream>
#include <string>
#include <cstdlib>
#include <ctime>
#include <dlib/interfaces/enumerable.h>
#include <dlib/array.h>
#include <dlib/rand.h>


#include "tester.h"

namespace 
{
    using namespace test;
    using namespace dlib;
    using namespace std;

    using dlib::array;

    logger dlog("test.array");

    template <
        typename array
        >
    void array_expand_test (
    )
    /*!
        requires
            - array is an implementation of array/array_sort_abstract.h 
              array is instantiated with unsigned long
        ensures
            - runs tests on array for compliance with the specs
    !*/
    {        
        dlib::rand rnd;

        DLIB_TEST(dlib::is_array<array>::value == true);

        array a1, a2;

        {
            array a4(4);
            DLIB_TEST(a4.size() == 4);
        }

        {
            array a1, a2;

            for (int k = 1; k < 100000; k += 1000)
            {
                for (int i = 0; i < 10; ++i)
                {
                    a1.clear();
                    a1.set_max_size(500+k);
                    a1.set_size(500+k);
                    for (unsigned long j = 0; j < a1.size(); ++j)
                    {
                        a1[j] = j;
                        DLIB_TEST(a1[j] == j);
                    }
                }
            }
        }

        DLIB_TEST(a1.max_size() == 0);
        DLIB_TEST(a2.max_size() == 0);


        DLIB_TEST(a1.size() == 0);
        DLIB_TEST(a1.at_start());
        DLIB_TEST(a1.current_element_valid() == false);
        DLIB_TEST(a1.move_next() == false);
        DLIB_TEST(a1.size() == 0);
        DLIB_TEST(a1.current_element_valid() == false);
        DLIB_TEST(a1.at_start() == false);
        DLIB_TEST(a1.move_next() == false);
        DLIB_TEST(a1.current_element_valid() == false);
        DLIB_TEST(a1.size() == 0);
        DLIB_TEST(a1.at_start() == false);            
        DLIB_TEST(a1.size() == 0);

        swap(a1,a2);
        DLIB_TEST(a2.size() == 0);
        DLIB_TEST(a2.current_element_valid() == false);
        DLIB_TEST(a2.at_start() == false);
        DLIB_TEST(a2.move_next() == false);
        DLIB_TEST(a2.current_element_valid() == false);
        DLIB_TEST(a2.size() == 0);
        DLIB_TEST(a2.at_start() == false);            
        DLIB_TEST(a2.size() == 0);



        DLIB_TEST(a1.size() == 0);
        DLIB_TEST(a1.at_start());
        DLIB_TEST(a1.current_element_valid() == false);
        DLIB_TEST(a1.move_next() == false);
        DLIB_TEST(a1.size() == 0);
        DLIB_TEST(a1.current_element_valid() == false);
        DLIB_TEST(a1.at_start() == false);
        DLIB_TEST(a1.move_next() == false);
        DLIB_TEST(a1.current_element_valid() == false);
        DLIB_TEST(a1.size() == 0);
        DLIB_TEST(a1.at_start() == false);            
        DLIB_TEST(a1.size() == 0);

        a1.reset();
        a2.reset();

        for (unsigned long k = 0; k < 4; ++k)
        {

            DLIB_TEST(a1.size() == 0);
            DLIB_TEST(a1.at_start());
            DLIB_TEST(a1.current_element_valid() == false);
            DLIB_TEST(a1.move_next() == false);
            DLIB_TEST(a1.size() == 0);
            DLIB_TEST(a1.current_element_valid() == false);
            DLIB_TEST(a1.at_start() == false);
            DLIB_TEST(a1.move_next() == false);
            DLIB_TEST(a1.current_element_valid() == false);
            DLIB_TEST(a1.size() == 0);
            DLIB_TEST(a1.at_start() == false);            
            DLIB_TEST(a1.size() == 0);

            swap(a1,a2);
            DLIB_TEST(a2.size() == 0);
            DLIB_TEST(a2.current_element_valid() == false);
            DLIB_TEST(a2.at_start() == false);
            DLIB_TEST(a2.move_next() == false);
            DLIB_TEST(a2.current_element_valid() == false);
            DLIB_TEST(a2.size() == 0);
            DLIB_TEST(a2.at_start() == false);            
            DLIB_TEST(a2.size() == 0);



            DLIB_TEST(a1.size() == 0);
            DLIB_TEST(a1.at_start());
            DLIB_TEST(a1.current_element_valid() == false);
            DLIB_TEST(a1.move_next() == false);
            DLIB_TEST(a1.size() == 0);
            DLIB_TEST(a1.current_element_valid() == false);
            DLIB_TEST(a1.at_start() == false);
            DLIB_TEST(a1.move_next() == false);
            DLIB_TEST(a1.current_element_valid() == false);
            DLIB_TEST(a1.size() == 0);
            DLIB_TEST(a1.at_start() == false);            
            DLIB_TEST(a1.size() == 0);

            a1.clear();
            a2.clear();


            DLIB_TEST(a1.size() == 0);
            DLIB_TEST(a1.at_start());
            DLIB_TEST(a1.current_element_valid() == false);
            DLIB_TEST(a1.move_next() == false);
            DLIB_TEST(a1.size() == 0);
            DLIB_TEST(a1.current_element_valid() == false);
            DLIB_TEST(a1.at_start() == false);
            DLIB_TEST(a1.move_next() == false);
            DLIB_TEST(a1.current_element_valid() == false);
            DLIB_TEST(a1.size() == 0);
            DLIB_TEST(a1.at_start() == false);            
            DLIB_TEST(a1.size() == 0);

            swap(a1,a2);
            DLIB_TEST(a2.size() == 0);
            DLIB_TEST(a2.current_element_valid() == false);
            DLIB_TEST(a2.at_start() == false);
            DLIB_TEST(a2.move_next() == false);
            DLIB_TEST(a2.current_element_valid() == false);
            DLIB_TEST(a2.size() == 0);
            DLIB_TEST(a2.at_start() == false);            
            DLIB_TEST(a2.size() == 0);



            DLIB_TEST(a1.size() == 0);
            DLIB_TEST(a1.at_start());
            DLIB_TEST(a1.current_element_valid() == false);
            DLIB_TEST(a1.move_next() == false);
            DLIB_TEST(a1.size() == 0);
            DLIB_TEST(a1.current_element_valid() == false);
            DLIB_TEST(a1.at_start() == false);
            DLIB_TEST(a1.move_next() == false);
            DLIB_TEST(a1.current_element_valid() == false);
            DLIB_TEST(a1.size() == 0);
            DLIB_TEST(a1.at_start() == false);            
            DLIB_TEST(a1.size() == 0);

            a1.clear();
            a2.clear();




            a1.set_max_size(100000);
            a2.set_max_size(100000);
            a1.set_size(10000);
            DLIB_TEST(a1.size() == 10000);
            a2.set_size(10000);
            DLIB_TEST(a2.size() == 10000);
            for (unsigned long i = 0; i < a1.size(); ++i)
            {
                unsigned long a = static_cast<unsigned long>(rnd.get_random_32bit_number());
                a1[i] = a;
                a2[i] = i;
                DLIB_TEST(a1[i] == a);
                DLIB_TEST(a2[i] == i);
            }

            DLIB_TEST(a1.at_start());
            DLIB_TEST(a1.current_element_valid() == false);
            DLIB_TEST(a1.move_next());
            DLIB_TEST(a1.current_element_valid());

            DLIB_TEST(a1.at_start() == false);
            a1.sort();
            DLIB_TEST(a1.at_start());
            a2.sort();
            DLIB_TEST(a1.size() == 10000);
            DLIB_TEST(a2.size() == 10000);


            for (unsigned long i = 0; i < a1.size(); ++i)
            {
                if (i+1 < a1.size())
                {
                    DLIB_TEST_MSG(a1[i] <= a1[i+1],
                                 "a1[i]: " << a1[i] << "    a1[i+1]: " << a1[i+1]
                                 << "    i: " << i);
                }
                DLIB_TEST_MSG(a2[i] == i,"i: " << i << "   a2[i]: " << a2[i]);
            }

            unsigned long last = 0;
            unsigned long count = 0;
            while (a1.move_next())
            {
                DLIB_TEST(last <= a1.element());
                last = a1.element();
                ++count;
            }
            DLIB_TEST(count == a1.size());

            last = 0;
            count = 0;
            while (a2.move_next())
            {
                DLIB_TEST(last <= a2.element());
                last = a2.element();
                ++count;
            }
            DLIB_TEST(count == a2.size());

            a2.set_size(15000);

            for (unsigned long i = 0; i < a1.size(); ++i)
            {
                if (i+1 < a1.size())
                {
                    DLIB_TEST(a1[i] <= a1[i+1]);
                }
                DLIB_TEST(a2[i] == i);
            }

            for (unsigned long i = 10000; i < a2.size(); ++i)
            {
                a2[i] = i;
                DLIB_TEST(a2[i] == i);
            }

            for (unsigned long i = 0; i < a2.size(); ++i)
            {
                DLIB_TEST(a2[i] == i);
            }

            a2.reset();
            last = 0;
            while (a2.move_next())
            {
                DLIB_TEST(last <= a2.element());
                last = a2.element();
            }

            a1.reset();
            last = 0;
            while (a1.move_next())
            {
                DLIB_TEST(last <= a1.element());
                last = a1.element();
            }

            a1.sort();
            last = 0;
            while (a1.move_next())
            {
                DLIB_TEST(last <= a1.element());
                last = a1.element();
            }

            swap(a2,a1);

            for (unsigned long i = 0; i < 15000; ++i)
            {
                DLIB_TEST(a1[i] == i);
            }



            a1.clear();
            DLIB_TEST(a1.max_size() == 0);




            a1.clear();
            a2.clear();


            DLIB_TEST(a1.size() == 0);
            DLIB_TEST(a2.size() == 0);
            a1.set_max_size(100000);
            a2.set_max_size(100000);

            a1.set_size(10000);
            DLIB_TEST(a1.size() == 10000);
            a2.set_size(10000);
            DLIB_TEST(a2.size() == 10000);
            for (unsigned long i = 0; i < a1.size(); ++i)
            {
                unsigned long a = static_cast<unsigned long>(rnd.get_random_32bit_number());
                a1[i] = a;
                a2[i] = i;
                DLIB_TEST(a1[i] == a);
                DLIB_TEST(a2[i] == i);
            }

            DLIB_TEST(a1.at_start());
            DLIB_TEST(a1.current_element_valid() == false);
            DLIB_TEST(a1.move_next());
            DLIB_TEST(a1.current_element_valid());

            DLIB_TEST(a1.at_start() == false);
            a1.sort();
            DLIB_TEST(a1.at_start());
            a2.sort();
            DLIB_TEST(a1.size() == 10000);
            DLIB_TEST(a2.size() == 10000);


            for (unsigned long i = 0; i < a1.size(); ++i)
            {
                if (i+1 < a1.size())
                {
                    DLIB_TEST(a1[i] <= a1[i+1]);
                }
                DLIB_TEST(a2[i] == i);
            }

            last = 0;
            while (a1.move_next())
            {
                DLIB_TEST(last <= a1.element());
                last = a1.element();
            }

            last = 0;
            while (a2.move_next())
            {
                DLIB_TEST(last <= a2.element());
                last = a2.element();
            }

            a2.set_size(15000);

            for (unsigned long i = 0; i < a1.size(); ++i)
            {
                if (i+1 < a1.size())
                {
                    DLIB_TEST(a1[i] <= a1[i+1]);
                }
                DLIB_TEST(a2[i] == i);
            }

            for (unsigned long i = 10000; i < a2.size(); ++i)
            {
                a2[i] = i;
                DLIB_TEST(a2[i] == i);
            }

            for (unsigned long i = 0; i < a2.size(); ++i)
            {
                DLIB_TEST(a2[i] == i);
            }

            a2.reset();
            last = 0;
            while (a2.move_next())
            {
                DLIB_TEST(last <= a2.element());
                last = a2.element();
            }

            a1.reset();
            last = 0;
            while (a1.move_next())
            {
                DLIB_TEST(last <= a1.element());
                last = a1.element();
            }

            a1.sort();
            last = 0;
            while (a1.move_next())
            {
                DLIB_TEST(last <= a1.element());
                last = a1.element();
            }

            swap(a2,a1);

            for (unsigned long i = 0; i < 15000; ++i)
            {
                DLIB_TEST(a1[i] == i);
            }



            a1.clear();
            DLIB_TEST(a1.max_size() == 0);

            a2.clear();
            print_spinner();
        }



        a1.set_max_size(2000000);
        DLIB_TEST(a1.max_size() == 2000000);
        DLIB_TEST(a1.size() == 0);
        a1.set_size(2000000);
        DLIB_TEST(a1.max_size() == 2000000);
        DLIB_TEST(a1.size() == 2000000);

        for (unsigned long i = 0; i < a1.size(); ++i)
        {
            a1[i] = rnd.get_random_32bit_number();
        }

        print_spinner();
        a1.sort();

        print_spinner();
        // serialize the state of a1, then clear a1, then
        // load the state back into a1.
        ostringstream sout;
        serialize(a1,sout);
        DLIB_TEST(a1.at_start() == true);
        istringstream sin(sout.str());
        a1.clear();
        DLIB_TEST(a1.max_size() == 0);
        deserialize(a1,sin);

        DLIB_TEST(a1.size() == 2000000);

        for (unsigned long i = 0; i < a1.size()-1; ++i)
        {
            DLIB_TEST(a1[i] <= a1[i+1]);
        }

        DLIB_TEST(a1.max_size() == 2000000);
        DLIB_TEST(a1.size() == 2000000);


        swap(a1,a2);

        print_spinner();

        DLIB_TEST(a2.size() == 2000000);

        for (unsigned long i = 0; i < a2.size()-1; ++i)
        {
            DLIB_TEST(a2[i] <= a2[i+1]);
        }

        DLIB_TEST(a2.max_size() == 2000000);
        DLIB_TEST(a2.size() == 2000000);

        swap(a1,a2);


        a1.clear();
        DLIB_TEST(a1.size() == 0);
        DLIB_TEST(a1.max_size() == 0);

        a1.resize(10);
        DLIB_TEST(a1.size() == 10);
        DLIB_TEST(a1.max_size() == 10);

        for (unsigned long i = 0; i < a1.size(); ++i)
        {
            a1[i] = i;
        }

        print_spinner();
        a1.resize(100);
        DLIB_TEST(a1.size() == 100);
        DLIB_TEST(a1.max_size() == 100);

        for (unsigned long i = 0; i < 10; ++i)
        {
            DLIB_TEST(a1[i] == i);
        }

        a1.resize(50);
        DLIB_TEST(a1.size() == 50);
        DLIB_TEST(a1.max_size() == 100);

        for (unsigned long i = 0; i < 10; ++i)
        {
            DLIB_TEST(a1[i] == i);
        }

        a1.resize(10);
        DLIB_TEST(a1.size() == 10);
        DLIB_TEST(a1.max_size() == 100);

        for (unsigned long i = 0; i < 10; ++i)
        {
            DLIB_TEST(a1[i] == i);
        }

        a1.resize(20);
        DLIB_TEST(a1.size() == 20);
        DLIB_TEST(a1.max_size() == 100);

        for (unsigned long i = 0; i < 10; ++i)
        {
            DLIB_TEST(a1[i] == i);
        }


        a1.resize(100);
        DLIB_TEST(a1.size() == 100);
        DLIB_TEST(a1.max_size() == 100);

        for (unsigned long i = 0; i < 10; ++i)
        {
            DLIB_TEST(a1[i] == i);
        }

        {
            a1.clear();
            DLIB_TEST(a1.size() == 0);
            for (unsigned long i = 0; i < 100; ++i)
            {
                unsigned long a = i;
                a1.push_back(a);
                DLIB_TEST(a1.size() == i+1);
                DLIB_TEST(a1.back() == i);
            }
            for (unsigned long i = 0; i < 100; ++i)
            {
                DLIB_TEST(a1[i] == i);
            }
            for (unsigned long i = 0; i < 100; ++i)
            {
                unsigned long a = 0;
                a1.pop_back(a);
                DLIB_TEST(a == 99-i);
            }
        }

        {
            a1.clear();
            DLIB_TEST(a1.size() == 0);
            for (unsigned long i = 0; i < 100; ++i)
            {
                unsigned long a = i;
                a1.push_back(a);
                DLIB_TEST(a1.size() == i+1);
                DLIB_TEST(a1.back() == i);
            }
            for (unsigned long i = 0; i < 100; ++i)
            {
                DLIB_TEST(a1[i] == i);
            }
            for (unsigned long i = 0; i < 100; ++i)
            {
                a1.pop_back();
            }
            DLIB_TEST(a1.size() == 0);
        }

    }

    struct stuff
    {
        int whatever;
    };
    void another_array_test()
    {
        array<stuff> a;
        a.resize(5);
        a[0].whatever = 0;
        stuff temp;
        temp.whatever = 99;
        a.push_back(temp);
        DLIB_TEST(a.size() == 6);
        DLIB_TEST(a[5].whatever == 99);

        DLIB_TEST(dlib::is_array<array<stuff> >::value == true);
    }

    void test_array_split()
    {
        array<int> temp(5);
        
        for (unsigned int i = 0; i < temp.size(); ++i)
            temp[i] = i;

        array<int> b;

        split_array(temp, b, 0.5);
        DLIB_TEST(temp.size() == 2);
        DLIB_TEST(b.size() == 3);

        DLIB_TEST(temp[0] == 0);
        DLIB_TEST(temp[1] == 1);
        DLIB_TEST(b[0] == 2);
        DLIB_TEST(b[1] == 3);
        DLIB_TEST(b[2] == 4);
    }

    class array_tester : public tester
    {
    public:
        array_tester (
        ) :
            tester ("test_array",
                    "Runs tests on the array component.")
        {}

        void perform_test (
        )
        {
            print_spinner();
            another_array_test();

            // test a checking version first for good measure
            print_spinner();
            array_expand_test<array<unsigned long> >();

            DLIB_TEST(dlib::is_array<int>::value == false);
            test_array_split();
        }
    } a;




}

