// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.


#include <sstream>
#include <string>
#include <cstdlib>
#include <ctime>
#include <dlib/set.h>

#include "tester.h"

namespace  
{
    using namespace test;
    using namespace std;
    using namespace dlib;

    logger dlog("test.set");

    template <
        typename set
        >
    void set_compare_test (
    )
    /*!
        requires
            - set is an implementation of set/set_compare_abstract.h and
              is instantiated with int
        ensures
            - runs tests on set for compliance with the specs 
    !*/
    {        


        srand(static_cast<unsigned int>(time(0)));



        set test, test2;

        enumerable<const int>& e = test;
        DLIB_TEST(e.at_start() == true);

        for (int j = 0; j < 4; ++j)
        {

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
            a = 0;
            while (test.move_next())
            {
                enumerable<const int>& gogo = test;
                gogo.element();

                DLIB_TEST(test.element() == test.element());
                DLIB_TEST(test.element() == test.element());
                DLIB_TEST(test.element() == test.element());

                DLIB_TEST(a <= test.element());
                a = test.element();
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
            a = -1;
            test2.reset();
            while (test2.move_next())
            {
                DLIB_TEST(test2.element() == test2.element());
                DLIB_TEST(test2.element() == test2.element());
                DLIB_TEST(test2.element() == test2.element());
                DLIB_TEST(a < test2.element());
                a = test2.element();                
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

                // serialize the state of test, then clear test, then
                // load the state back into test.
                ostringstream sout;
                serialize(test,sout);
                DLIB_TEST(test.at_start() == true);
                istringstream sin(sout.str());
                test.clear();
                deserialize(test,sin);



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
                    DLIB_TEST(test.element() == *tmp);
                    DLIB_TEST(test.element() == *tmp);
                    DLIB_TEST(test.element() == *tmp);
                    ++tmp;
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
                a = 0;
                while (test2.move_next())
                {
                    DLIB_TEST(test2.element() == test2.element());
                    DLIB_TEST(test2.element() == test2.element());
                    DLIB_TEST(test2.element() == test2.element());
                    DLIB_TEST(a <= test2.element());
                    a = test2.element();                
                    ++count;
                }

                DLIB_TEST(count == 20000);
                DLIB_TEST(test2.size() == 20000);

                a = -1;
                while (test2.size()>0)
                {
                    test2.remove_any(b);
                    DLIB_TEST( a < b);
                    a = b;
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
            a = -1;
            while (test.move_next())
            {
                DLIB_TEST(a < test.element());
                a = test.element();
                ++count;
                if (count == 5000)
                    break;
                DLIB_TEST(test.current_element_valid() == true);
            }

            test.reset();

            count = 0; 
            a = -1;
            while (test.move_next())
            {
                DLIB_TEST(a < test.element());
                a = test.element();
                ++count;
                DLIB_TEST(test.current_element_valid() == true);
            }

            DLIB_TEST(count == 10000);


            test.clear();
            test2.clear();
        }



        {
            DLIB_TEST(test == test2);
            DLIB_TEST((test < test2) == false);
            DLIB_TEST((test2 < test) == false);

            int a = 3, b = 3;
            test.add(a);
            test2.add(b);
            test.move_next();                
            DLIB_TEST(test == test2);
            DLIB_TEST(test.at_start() && test2.at_start());
            test.move_next();
            DLIB_TEST((test < test2) == false);
            DLIB_TEST(test.at_start() && test2.at_start());
            test.move_next();
            DLIB_TEST((test2 < test) == false);
            DLIB_TEST(test.at_start() && test2.at_start());

            a = 2; b = 5;
            test.add(a);
            test2.add(b);
            DLIB_TEST(test.at_start() && test2.at_start());
            test2.move_next();
            DLIB_TEST((test == test2) == false);
            DLIB_TEST(test.at_start() && test2.at_start());
            test2.move_next();                
            DLIB_TEST((test < test2) == true);
            DLIB_TEST(test.at_start() && test2.at_start());
            test2.move_next();                
            DLIB_TEST((test2 < test) == false);
            DLIB_TEST(test.at_start() && test2.at_start());


            a = 8;
            test.add(a);
            DLIB_TEST(test.at_start() && test2.at_start());
            test2.move_next();
            DLIB_TEST((test == test2) == false);
            DLIB_TEST(test.at_start() && test2.at_start());
            test2.move_next();                
            DLIB_TEST((test < test2) == false);
            DLIB_TEST(test.at_start() && test2.at_start());
            test2.move_next();                
            DLIB_TEST((test2 < test) == true);
            DLIB_TEST(test.at_start() && test2.at_start());

            test.clear();

            DLIB_TEST(test.at_start() && test2.at_start());
            test2.move_next();
            DLIB_TEST((test == test2) == false);
            DLIB_TEST(test.at_start() && test2.at_start());
            test2.move_next();                
            DLIB_TEST((test < test2) == true);
            DLIB_TEST(test.at_start() && test2.at_start());
            test2.move_next();                
            DLIB_TEST((test2 < test) == false);
            DLIB_TEST(test.at_start() && test2.at_start());


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




    class set_tester : public tester
    {
    public:
        set_tester (
        ) :
            tester ("test_set",
                    "Runs tests on the set component.")
        {}

        void perform_test (
        )
        {
            dlog << LINFO << "testing compare_1a";
            set_compare_test<dlib::set<int>::compare_1a>  ();
            dlog << LINFO << "testing compare_1a_c";
            set_compare_test<dlib::set<int>::compare_1a_c>();
            dlog << LINFO << "testing compare_1b";
            set_compare_test<dlib::set<int>::compare_1b>  ();
            dlog << LINFO << "testing compare_1b_c";
            set_compare_test<dlib::set<int>::compare_1b_c>();
        }
    } a;

}

