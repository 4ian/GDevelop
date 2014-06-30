// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.


#include <sstream>
#include <string>
#include <cstdlib>
#include <ctime>

#include <dlib/hash_set.h>
#include "tester.h"

namespace  
{

    using namespace test;
    using namespace std;
    using namespace dlib;
   
    logger dlog("test.hash_set");

    template <
        typename hash_set
        >
    void hash_set_kernel_test (
    )
    /*!
        requires
            - hash_set is an implementation of hash_set/hash_set_kernel_abstract.h and
              is instantiated with int
        ensures
            - runs tests on hash_set for compliance with the specs 
    !*/
    {        


        srand(static_cast<unsigned int>(time(0)));


        print_spinner();

        hash_set test, test2;


        enumerable<const int>& e = test;
        DLIB_TEST(e.at_start() == true);


        for (int j = 0; j < 4; ++j)
        {
            print_spinner();

            DLIB_TEST(test.at_start() == true);
            DLIB_TEST(test.current_element_valid() == false);
            DLIB_TEST(test.move_next() == false);
            DLIB_TEST(test.move_next() == false);
            DLIB_TEST(test.move_next() == false);
            DLIB_TEST(test.move_next() == false);
            DLIB_TEST(test.move_next() == false);
            DLIB_TEST(test.move_next() == false);
            DLIB_TEST(test.move_next() == false);
            DLIB_TEST(test.at_start() == false);
            DLIB_TEST(test.current_element_valid() == false);


            DLIB_TEST(test.size() == 0);
            DLIB_TEST(test.is_member(5) == false);
            DLIB_TEST(test.is_member(0) == false);
            DLIB_TEST(test.is_member(-999) == false);
            DLIB_TEST(test.is_member(4999) == false);


            int a,b = 0;
            a = 8;
            test.add(a);
            DLIB_TEST(test.size() == 1);
            DLIB_TEST(test.is_member(8) == true);
            DLIB_TEST(test.is_member(5) == false);
            DLIB_TEST(test.is_member(0) == false);
            DLIB_TEST(test.is_member(-999) == false);
            DLIB_TEST(test.is_member(4999) == false);
            a = 53;
            test.add(a);
            DLIB_TEST(test.size() == 2);
            DLIB_TEST(test.is_member(53) == true);
            DLIB_TEST(test.is_member(5) == false);
            DLIB_TEST(test.is_member(0) == false);
            DLIB_TEST(test.is_member(-999) == false);
            DLIB_TEST(test.is_member(4999) == false);


            swap(test,test2);



            DLIB_TEST(test2.is_member(8) == true);
            DLIB_TEST(test2.is_member(5) == false);
            DLIB_TEST(test2.is_member(0) == false);
            DLIB_TEST(test2.is_member(-999) == false);
            DLIB_TEST(test2.is_member(4999) == false);
            DLIB_TEST(test2.size() == 2);
            DLIB_TEST(test2.is_member(53) == true);
            DLIB_TEST(test2.is_member(5) == false);
            DLIB_TEST(test2.is_member(0) == false);
            DLIB_TEST(test2.is_member(-999) == false);
            DLIB_TEST(test2.is_member(4999) == false);


            DLIB_TEST(test.size() == 0);
            DLIB_TEST(test.is_member(8) == false);
            DLIB_TEST(test.is_member(5) == false);
            DLIB_TEST(test.is_member(0) == false);
            DLIB_TEST(test.is_member(-999) == false);
            DLIB_TEST(test.is_member(4999) == false);
            DLIB_TEST(test.size() == 0);
            DLIB_TEST(test.is_member(53) == false);
            DLIB_TEST(test.is_member(5) == false);
            DLIB_TEST(test.is_member(0) == false);
            DLIB_TEST(test.is_member(-999) == false);
            DLIB_TEST(test.is_member(4999) == false);


            test.clear();
            DLIB_TEST(test.at_start() == true);
            DLIB_TEST(test.move_next() == false);
            DLIB_TEST(test.move_next() == false);
            DLIB_TEST(test.move_next() == false);
            DLIB_TEST(test.move_next() == false);
            DLIB_TEST(test.move_next() == false);
            DLIB_TEST(test.at_start() == false);


            DLIB_TEST(test.size() == 0);

            while (test.size() < 10000)
            {
                a = ::rand();
                if (!test.is_member(a))
                    test.add(a);
            }

            DLIB_TEST(test.size() == 10000);
            test.clear();
            DLIB_TEST(test.size() == 0);

            while (test.size() < 10000)
            {
                a = ::rand();
                if (!test.is_member(a))
                    test.add(a);
            }

            DLIB_TEST(test.size() == 10000);

            int count = 0;
            while (test.move_next())
            {
                DLIB_TEST(test.element() == test.element());
                DLIB_TEST(test.element() == test.element());
                DLIB_TEST(test.element() == test.element());


                ++count;
            }
            DLIB_TEST(test.current_element_valid() == false);
            DLIB_TEST(test.at_start() == false);
            DLIB_TEST(test.move_next() == false);
            DLIB_TEST(test.current_element_valid() == false);
            DLIB_TEST(test.at_start() == false);
            DLIB_TEST(test.move_next() == false);

            DLIB_TEST(count == 10000);

            test.swap(test2);

            DLIB_TEST(test.size() == 2);
            DLIB_TEST(test2.size() == 10000);
            count = 0;
            test2.reset();
            while (test2.move_next())
            {
                DLIB_TEST(test2.element() == test2.element());
                DLIB_TEST(test2.element() == test2.element());
                DLIB_TEST(test2.element() == test2.element());

                ++count;
            }
            DLIB_TEST(test2.size() == 10000);
            DLIB_TEST(count == 10000);
            DLIB_TEST(test2.current_element_valid() == false);
            DLIB_TEST(test2.at_start() == false);
            DLIB_TEST(test2.move_next() == false);
            DLIB_TEST(test2.current_element_valid() == false);
            DLIB_TEST(test2.at_start() == false);
            DLIB_TEST(test2.move_next() == false);



            test2.clear();
            DLIB_TEST(test2.size() == 0);
            DLIB_TEST(test2.at_start() == true);

            while (test.size() < 20000)
            {
                a = ::rand();
                if (!test.is_member(a))
                    test.add(a);
            }

            DLIB_TEST(test.at_start() == true);

            {
                int* array = new int[test.size()];
                int* tmp = array;

                // serialize the state of test, then clear test, then
                // load the state back into test.
                ostringstream sout;
                serialize(test,sout);
                DLIB_TEST(test.at_start() == true);
                istringstream sin(sout.str());
                test.clear();
                deserialize(test,sin);



                count = 0;
                while (test.move_next())
                {
                    DLIB_TEST(test.element() == test.element());
                    DLIB_TEST(test.element() == test.element());
                    DLIB_TEST(test.element() == test.element());
                    *tmp = test.element();
                    ++tmp;
                    ++count;
                }
                DLIB_TEST(count == 20000);

                tmp = array;
                for (int i = 0; i < 20000; ++i)
                {
                    DLIB_TEST(test.is_member(*tmp) == true);
                    ++tmp;
                }

                DLIB_TEST(test.size() == 20000);

                tmp = array;
                count = 0;
                while (test.size() > 10000)
                {
                    test.remove(*tmp,a);
                    DLIB_TEST(*tmp == a);
                    ++tmp;
                    ++count;
                }
                DLIB_TEST(count == 10000);
                DLIB_TEST(test.size() == 10000);

                while (test.move_next())
                {
                    ++count;
                }
                DLIB_TEST(count == 20000);
                DLIB_TEST(test.size() == 10000);

                while (test.size() < 20000)
                {
                    a = ::rand();
                    if (!test.is_member(a))
                        test.add(a);
                }

                test2.swap(test);

                count = 0;
                while (test2.move_next())
                {
                    DLIB_TEST(test2.element() == test2.element());
                    DLIB_TEST(test2.element() == test2.element());
                    DLIB_TEST(test2.element() == test2.element());

                    ++count;
                }

                DLIB_TEST(count == 20000);
                DLIB_TEST(test2.size() == 20000);


                while (test2.size()>0)
                {
                    test2.remove_any(b);
                }

                DLIB_TEST(test2.size() == 0);
                delete [] array;
            }

            test.clear();
            test2.clear();
            while (test.size() < 10000)
            {
                a = ::rand();
                if (!test.is_member(a))
                    test.add(a);
            }

            count = 0; 
            while (test.move_next())
            {                    
                ++count;
                if (count == 5000)
                    break;
                DLIB_TEST(test.current_element_valid() == true);
            }

            test.reset();

            count = 0; 
            while (test.move_next())
            {
                ++count;
                DLIB_TEST(test.current_element_valid() == true);
            }

            DLIB_TEST(count == 10000);


            test.clear();
            test2.clear();
        }


        {
            test.clear();
            DLIB_TEST(test.size() == 0);
            int a = 5;
            test.add(a);
            a = 7;
            test.add(a);
            DLIB_TEST(test.size() == 2);
            DLIB_TEST(test.is_member(7));
            DLIB_TEST(test.is_member(5));
            test.destroy(7);
            DLIB_TEST(test.size() == 1);
            DLIB_TEST(!test.is_member(7));
            DLIB_TEST(test.is_member(5));
            test.destroy(5);
            DLIB_TEST(test.size() == 0);
            DLIB_TEST(!test.is_member(7));
            DLIB_TEST(!test.is_member(5));
        }

    }




    class hash_set_tester : public tester
    {
    public:
        hash_set_tester (
        ) :
            tester ("test_hash_set",
                    "Runs tests on the hash_set component.")
        {}

        void perform_test (
        )
        {
            dlog << LINFO << "testing kernel_1a";
            hash_set_kernel_test<hash_set<int,14>::kernel_1a>();
            dlog << LINFO << "testing kernel_1a_c";
            hash_set_kernel_test<hash_set<int,14>::kernel_1a_c>();
            dlog << LINFO << "testing kernel_1b";
            hash_set_kernel_test<hash_set<int,14>::kernel_1b>();
            dlog << LINFO << "testing kernel_1b_c";
            hash_set_kernel_test<hash_set<int,14>::kernel_1b_c>();
            dlog << LINFO << "testing kernel_1c";
            hash_set_kernel_test<hash_set<int,14>::kernel_1c>();
            dlog << LINFO << "testing kernel_1c_c";
            hash_set_kernel_test<hash_set<int,14>::kernel_1c_c>();
        }
    } a;

}

