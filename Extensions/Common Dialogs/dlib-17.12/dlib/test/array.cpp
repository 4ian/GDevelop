// Copyright (C) 2005  Davis E. King (davisking@users.sourceforge.net)
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
        dlib::rand::kernel_1a rnd;


        array a1, a2;

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
                        DLIB_CASSERT(a1[j] == j,"");
                    }
                }
            }
        }

        DLIB_CASSERT(a1.max_size() == 0,"");
        DLIB_CASSERT(a2.max_size() == 0,"");


        DLIB_CASSERT(a1.size() == 0,"");
        DLIB_CASSERT(a1.at_start(),"");
        DLIB_CASSERT(a1.current_element_valid() == false,"");
        DLIB_CASSERT(a1.move_next() == false,"");
        DLIB_CASSERT(a1.size() == 0,"");
        DLIB_CASSERT(a1.current_element_valid() == false,"");
        DLIB_CASSERT(a1.at_start() == false,"");
        DLIB_CASSERT(a1.move_next() == false,"");
        DLIB_CASSERT(a1.current_element_valid() == false,"");
        DLIB_CASSERT(a1.size() == 0,"");
        DLIB_CASSERT(a1.at_start() == false,"");            
        DLIB_CASSERT(a1.size() == 0,"");

        swap(a1,a2);
        DLIB_CASSERT(a2.size() == 0,"");
        DLIB_CASSERT(a2.current_element_valid() == false,"");
        DLIB_CASSERT(a2.at_start() == false,"");
        DLIB_CASSERT(a2.move_next() == false,"");
        DLIB_CASSERT(a2.current_element_valid() == false,"");
        DLIB_CASSERT(a2.size() == 0,"");
        DLIB_CASSERT(a2.at_start() == false,"");            
        DLIB_CASSERT(a2.size() == 0,"");



        DLIB_CASSERT(a1.size() == 0,"");
        DLIB_CASSERT(a1.at_start(),"");
        DLIB_CASSERT(a1.current_element_valid() == false,"");
        DLIB_CASSERT(a1.move_next() == false,"");
        DLIB_CASSERT(a1.size() == 0,"");
        DLIB_CASSERT(a1.current_element_valid() == false,"");
        DLIB_CASSERT(a1.at_start() == false,"");
        DLIB_CASSERT(a1.move_next() == false,"");
        DLIB_CASSERT(a1.current_element_valid() == false,"");
        DLIB_CASSERT(a1.size() == 0,"");
        DLIB_CASSERT(a1.at_start() == false,"");            
        DLIB_CASSERT(a1.size() == 0,"");

        a1.reset();
        a2.reset();

        for (unsigned long k = 0; k < 4; ++k)
        {

            DLIB_CASSERT(a1.size() == 0,"");
            DLIB_CASSERT(a1.at_start(),"");
            DLIB_CASSERT(a1.current_element_valid() == false,"");
            DLIB_CASSERT(a1.move_next() == false,"");
            DLIB_CASSERT(a1.size() == 0,"");
            DLIB_CASSERT(a1.current_element_valid() == false,"");
            DLIB_CASSERT(a1.at_start() == false,"");
            DLIB_CASSERT(a1.move_next() == false,"");
            DLIB_CASSERT(a1.current_element_valid() == false,"");
            DLIB_CASSERT(a1.size() == 0,"");
            DLIB_CASSERT(a1.at_start() == false,"");            
            DLIB_CASSERT(a1.size() == 0,"");

            swap(a1,a2);
            DLIB_CASSERT(a2.size() == 0,"");
            DLIB_CASSERT(a2.current_element_valid() == false,"");
            DLIB_CASSERT(a2.at_start() == false,"");
            DLIB_CASSERT(a2.move_next() == false,"");
            DLIB_CASSERT(a2.current_element_valid() == false,"");
            DLIB_CASSERT(a2.size() == 0,"");
            DLIB_CASSERT(a2.at_start() == false,"");            
            DLIB_CASSERT(a2.size() == 0,"");



            DLIB_CASSERT(a1.size() == 0,"");
            DLIB_CASSERT(a1.at_start(),"");
            DLIB_CASSERT(a1.current_element_valid() == false,"");
            DLIB_CASSERT(a1.move_next() == false,"");
            DLIB_CASSERT(a1.size() == 0,"");
            DLIB_CASSERT(a1.current_element_valid() == false,"");
            DLIB_CASSERT(a1.at_start() == false,"");
            DLIB_CASSERT(a1.move_next() == false,"");
            DLIB_CASSERT(a1.current_element_valid() == false,"");
            DLIB_CASSERT(a1.size() == 0,"");
            DLIB_CASSERT(a1.at_start() == false,"");            
            DLIB_CASSERT(a1.size() == 0,"");

            a1.clear();
            a2.clear();


            DLIB_CASSERT(a1.size() == 0,"");
            DLIB_CASSERT(a1.at_start(),"");
            DLIB_CASSERT(a1.current_element_valid() == false,"");
            DLIB_CASSERT(a1.move_next() == false,"");
            DLIB_CASSERT(a1.size() == 0,"");
            DLIB_CASSERT(a1.current_element_valid() == false,"");
            DLIB_CASSERT(a1.at_start() == false,"");
            DLIB_CASSERT(a1.move_next() == false,"");
            DLIB_CASSERT(a1.current_element_valid() == false,"");
            DLIB_CASSERT(a1.size() == 0,"");
            DLIB_CASSERT(a1.at_start() == false,"");            
            DLIB_CASSERT(a1.size() == 0,"");

            swap(a1,a2);
            DLIB_CASSERT(a2.size() == 0,"");
            DLIB_CASSERT(a2.current_element_valid() == false,"");
            DLIB_CASSERT(a2.at_start() == false,"");
            DLIB_CASSERT(a2.move_next() == false,"");
            DLIB_CASSERT(a2.current_element_valid() == false,"");
            DLIB_CASSERT(a2.size() == 0,"");
            DLIB_CASSERT(a2.at_start() == false,"");            
            DLIB_CASSERT(a2.size() == 0,"");



            DLIB_CASSERT(a1.size() == 0,"");
            DLIB_CASSERT(a1.at_start(),"");
            DLIB_CASSERT(a1.current_element_valid() == false,"");
            DLIB_CASSERT(a1.move_next() == false,"");
            DLIB_CASSERT(a1.size() == 0,"");
            DLIB_CASSERT(a1.current_element_valid() == false,"");
            DLIB_CASSERT(a1.at_start() == false,"");
            DLIB_CASSERT(a1.move_next() == false,"");
            DLIB_CASSERT(a1.current_element_valid() == false,"");
            DLIB_CASSERT(a1.size() == 0,"");
            DLIB_CASSERT(a1.at_start() == false,"");            
            DLIB_CASSERT(a1.size() == 0,"");

            a1.clear();
            a2.clear();




            a1.set_max_size(100000);
            a2.set_max_size(100000);
            a1.set_size(10000);
            DLIB_CASSERT(a1.size() == 10000,"");
            a2.set_size(10000);
            DLIB_CASSERT(a2.size() == 10000,"");
            for (unsigned long i = 0; i < a1.size(); ++i)
            {
                unsigned long a = static_cast<unsigned long>(rnd.get_random_32bit_number());
                a1[i] = a;
                a2[i] = i;
                DLIB_CASSERT(a1[i] == a,"");
                DLIB_CASSERT(a2[i] == i,"");
            }

            DLIB_CASSERT(a1.at_start(),"");
            DLIB_CASSERT(a1.current_element_valid() == false,"");
            DLIB_CASSERT(a1.move_next(),"");
            DLIB_CASSERT(a1.current_element_valid(),"");

            DLIB_CASSERT(a1.at_start() == false,"");
            a1.sort();
            DLIB_CASSERT(a1.at_start(),"");
            a2.sort();
            DLIB_CASSERT(a1.size() == 10000,"");
            DLIB_CASSERT(a2.size() == 10000,"");


            for (unsigned long i = 0; i < a1.size(); ++i)
            {
                if (i+1 < a1.size())
                {
                    DLIB_CASSERT(a1[i] <= a1[i+1],
                                 "a1[i]: " << a1[i] << "    a1[i+1]: " << a1[i+1]
                                 << "    i: " << i);
                }
                DLIB_CASSERT(a2[i] == i,"i: " << i << "   a2[i]: " << a2[i]);
            }

            unsigned long last = 0;
            unsigned long count = 0;
            while (a1.move_next())
            {
                DLIB_CASSERT(last <= a1.element(),"");
                last = a1.element();
                ++count;
            }
            DLIB_CASSERT(count == a1.size(),"");

            last = 0;
            count = 0;
            while (a2.move_next())
            {
                DLIB_CASSERT(last <= a2.element(),"");
                last = a2.element();
                ++count;
            }
            DLIB_CASSERT(count == a2.size(),"");

            a2.set_size(15000);

            for (unsigned long i = 0; i < a1.size(); ++i)
            {
                if (i+1 < a1.size())
                {
                    DLIB_CASSERT(a1[i] <= a1[i+1],"");
                }
                DLIB_CASSERT(a2[i] == i,"");
            }

            for (unsigned long i = 10000; i < a2.size(); ++i)
            {
                a2[i] = i;
                DLIB_CASSERT(a2[i] == i,"");
            }

            for (unsigned long i = 0; i < a2.size(); ++i)
            {
                DLIB_CASSERT(a2[i] == i,"");
            }

            a2.reset();
            last = 0;
            while (a2.move_next())
            {
                DLIB_CASSERT(last <= a2.element(),"");
                last = a2.element();
            }

            a1.reset();
            last = 0;
            while (a1.move_next())
            {
                DLIB_CASSERT(last <= a1.element(),"");
                last = a1.element();
            }

            a1.sort();
            last = 0;
            while (a1.move_next())
            {
                DLIB_CASSERT(last <= a1.element(),"");
                last = a1.element();
            }

            swap(a2,a1);

            for (unsigned long i = 0; i < 15000; ++i)
            {
                DLIB_CASSERT(a1[i] == i,"");
            }



            a1.clear();
            DLIB_CASSERT(a1.max_size() == 0,"");




            a1.clear();
            a2.clear();


            DLIB_CASSERT(a1.size() == 0,"");
            DLIB_CASSERT(a2.size() == 0,"");
            a1.set_max_size(100000);
            a2.set_max_size(100000);

            a1.set_size(10000);
            DLIB_CASSERT(a1.size() == 10000,"");
            a2.set_size(10000);
            DLIB_CASSERT(a2.size() == 10000,"");
            for (unsigned long i = 0; i < a1.size(); ++i)
            {
                unsigned long a = static_cast<unsigned long>(rnd.get_random_32bit_number());
                a1[i] = a;
                a2[i] = i;
                DLIB_CASSERT(a1[i] == a,"");
                DLIB_CASSERT(a2[i] == i,"");
            }

            DLIB_CASSERT(a1.at_start(),"");
            DLIB_CASSERT(a1.current_element_valid() == false,"");
            DLIB_CASSERT(a1.move_next(),"");
            DLIB_CASSERT(a1.current_element_valid(),"");

            DLIB_CASSERT(a1.at_start() == false,"");
            a1.sort();
            DLIB_CASSERT(a1.at_start(),"");
            a2.sort();
            DLIB_CASSERT(a1.size() == 10000,"");
            DLIB_CASSERT(a2.size() == 10000,"");


            for (unsigned long i = 0; i < a1.size(); ++i)
            {
                if (i+1 < a1.size())
                {
                    DLIB_CASSERT(a1[i] <= a1[i+1],"");
                }
                DLIB_CASSERT(a2[i] == i,"");
            }

            last = 0;
            while (a1.move_next())
            {
                DLIB_CASSERT(last <= a1.element(),"");
                last = a1.element();
            }

            last = 0;
            while (a2.move_next())
            {
                DLIB_CASSERT(last <= a2.element(),"");
                last = a2.element();
            }

            a2.set_size(15000);

            for (unsigned long i = 0; i < a1.size(); ++i)
            {
                if (i+1 < a1.size())
                {
                    DLIB_CASSERT(a1[i] <= a1[i+1],"");
                }
                DLIB_CASSERT(a2[i] == i,"");
            }

            for (unsigned long i = 10000; i < a2.size(); ++i)
            {
                a2[i] = i;
                DLIB_CASSERT(a2[i] == i,"");
            }

            for (unsigned long i = 0; i < a2.size(); ++i)
            {
                DLIB_CASSERT(a2[i] == i,"");
            }

            a2.reset();
            last = 0;
            while (a2.move_next())
            {
                DLIB_CASSERT(last <= a2.element(),"");
                last = a2.element();
            }

            a1.reset();
            last = 0;
            while (a1.move_next())
            {
                DLIB_CASSERT(last <= a1.element(),"");
                last = a1.element();
            }

            a1.sort();
            last = 0;
            while (a1.move_next())
            {
                DLIB_CASSERT(last <= a1.element(),"");
                last = a1.element();
            }

            swap(a2,a1);

            for (unsigned long i = 0; i < 15000; ++i)
            {
                DLIB_CASSERT(a1[i] == i,"");
            }



            a1.clear();
            DLIB_CASSERT(a1.max_size() == 0,"");

            a2.clear();
            print_spinner();
        }



        a1.set_max_size(2000000);
        DLIB_CASSERT(a1.max_size() == 2000000,"");
        DLIB_CASSERT(a1.size() == 0,"");
        a1.set_size(2000000);
        DLIB_CASSERT(a1.max_size() == 2000000,"");
        DLIB_CASSERT(a1.size() == 2000000,"");

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
        DLIB_CASSERT(a1.at_start() == true,"");
        istringstream sin(sout.str());
        a1.clear();
        DLIB_CASSERT(a1.max_size() == 0,"");
        deserialize(a1,sin);

        DLIB_CASSERT(a1.size() == 2000000,"");

        for (unsigned long i = 0; i < a1.size()-1; ++i)
        {
            DLIB_CASSERT(a1[i] <= a1[i+1],"");
        }

        DLIB_CASSERT(a1.max_size() == 2000000,"");
        DLIB_CASSERT(a1.size() == 2000000,"");


        swap(a1,a2);

        print_spinner();

        DLIB_CASSERT(a2.size() == 2000000,"");

        for (unsigned long i = 0; i < a2.size()-1; ++i)
        {
            DLIB_CASSERT(a2[i] <= a2[i+1],"");
        }

        DLIB_CASSERT(a2.max_size() == 2000000,"");
        DLIB_CASSERT(a2.size() == 2000000,"");

        swap(a1,a2);


        a1.clear();
        DLIB_CASSERT(a1.size() == 0,"");
        DLIB_CASSERT(a1.max_size() == 0,"");

        a1.expand(10);
        DLIB_CASSERT(a1.size() == 10,"");
        DLIB_CASSERT(a1.max_size() == 10,"");

        for (unsigned long i = 0; i < a1.size(); ++i)
        {
            a1[i] = i;
        }

        print_spinner();
        a1.expand(100);
        DLIB_CASSERT(a1.size() == 100,"");
        DLIB_CASSERT(a1.max_size() == 100,"");

        for (unsigned long i = 0; i < 10; ++i)
        {
            DLIB_CASSERT(a1[i] == i,"");
        }

        a1.expand(50);
        DLIB_CASSERT(a1.size() == 50,"");
        DLIB_CASSERT(a1.max_size() == 100,"");

        for (unsigned long i = 0; i < 10; ++i)
        {
            DLIB_CASSERT(a1[i] == i,"");
        }

        a1.expand(10);
        DLIB_CASSERT(a1.size() == 10,"");
        DLIB_CASSERT(a1.max_size() == 100,"");

        for (unsigned long i = 0; i < 10; ++i)
        {
            DLIB_CASSERT(a1[i] == i,"");
        }

        a1.expand(20);
        DLIB_CASSERT(a1.size() == 20,"");
        DLIB_CASSERT(a1.max_size() == 100,"");

        for (unsigned long i = 0; i < 10; ++i)
        {
            DLIB_CASSERT(a1[i] == i,"");
        }


        a1.expand(100);
        DLIB_CASSERT(a1.size() == 100,"");
        DLIB_CASSERT(a1.max_size() == 100,"");

        for (unsigned long i = 0; i < 10; ++i)
        {
            DLIB_CASSERT(a1[i] == i,"");
        }

        {
            a1.clear();
            DLIB_CASSERT(a1.size() == 0,"");
            for (unsigned long i = 0; i < 100; ++i)
            {
                unsigned long a = i;
                a1.push_back(a);
                DLIB_CASSERT(a1.size() == i+1,"");
                DLIB_CASSERT(a1.back() == i,"");
            }
            for (unsigned long i = 0; i < 100; ++i)
            {
                DLIB_CASSERT(a1[i] == i,"");
            }
            for (unsigned long i = 0; i < 100; ++i)
            {
                unsigned long a = 0;
                a1.pop_back(a);
                DLIB_CASSERT(a == 99-i,"");
            }
        }

        {
            a1.clear();
            DLIB_CASSERT(a1.size() == 0,"");
            for (unsigned long i = 0; i < 100; ++i)
            {
                unsigned long a = i;
                a1.push_back(a);
                DLIB_CASSERT(a1.size() == i+1,"");
                DLIB_CASSERT(a1.back() == i,"");
            }
            for (unsigned long i = 0; i < 100; ++i)
            {
                DLIB_CASSERT(a1[i] == i,"");
            }
            for (unsigned long i = 0; i < 100; ++i)
            {
                a1.pop_back();
            }
            DLIB_CASSERT(a1.size() == 0,"");
        }


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
            // test a checking version first for good measure
            dlog << LINFO << "testing expand_1a_c";
            print_spinner();
            array_expand_test<array<unsigned long>::expand_1a_c>();

            dlog << LINFO << "testing expand_1a";
            print_spinner();
            array_expand_test<array<unsigned long>::expand_1a>();


            dlog << LINFO << "testing expand_1b";
            print_spinner();
            array_expand_test<array<unsigned long>::expand_1b>();

            dlog << LINFO << "testing expand_1b_c";
            print_spinner();
            array_expand_test<array<unsigned long>::expand_1b_c>();

            dlog << LINFO << "testing expand_1c";
            print_spinner();
            array_expand_test<array<unsigned long>::expand_1c>();

            dlog << LINFO << "testing expand_1c_c";
            print_spinner();
            array_expand_test<array<unsigned long>::expand_1c_c>();

            dlog << LINFO << "testing expand_1d";
            print_spinner();
            array_expand_test<array<unsigned long>::expand_1d>();

            dlog << LINFO << "testing expand_1d_c";
            print_spinner();
            array_expand_test<array<unsigned long>::expand_1d_c>();

            print_spinner();
        }
    } a;




}








