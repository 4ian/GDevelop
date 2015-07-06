// Copyright (C) 2004  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.


#include <sstream>
#include <string>
#include <cstdlib>
#include <ctime>

#include <dlib/sequence.h>
#include "tester.h"

namespace  
{

    using namespace test;
    using namespace std;
    using namespace dlib;

    logger dlog("test.sequence");

    template <
        typename seq
        >
    void sequence_sort_test (
    )
    /*!
        requires
            - seq is an implementation of sequence/sequence_sort_aseqract.h is instantiated 
              with int
        ensures
            - runs tests on seq for compliance with the specs 
    !*/
    {        


        srand(static_cast<unsigned int>(time(0)));


        print_spinner();





        {
            // this test is to make sure that jumping around via
            // operator[] doesn't corrupt the object

            seq a;

            for (int i = 0; i < 100; ++i)
            {
                int x = i;
                a.add(a.size(),x);
            }


            int x = 0;

            for (int i = 0; i < (int)a.size(); ++i)
            {
                DLIB_TEST_MSG(a[i] >= i,"1");
                // cout << a[i] << endl;
            }

            for (unsigned long i = 0; i < a.size(); ++i)
            {
                for (unsigned long j = i+1; j < a.size(); ++j)
                {
                    if ((a[j]+a[i])%3 ==0)
                    {                    
                        a.remove(j,x);
                        --j;
                    }
                }
            }

            //cout << endl;

            for (int i = 0; i < (int)a.size(); ++i)
            {
                //   cout << a[i] << endl;
                DLIB_TEST_MSG(a[i] >= i,"2");               
            }

        }







        seq test, test2;

        DLIB_TEST(test.size() == 0);
        DLIB_TEST(test.at_start() == true);
        DLIB_TEST(test.current_element_valid() == false);

        enumerable<int>& e = test;

        DLIB_TEST(e.at_start() == true);
        DLIB_TEST(e.current_element_valid() == false);


        for (int g = 0; g < 5; ++g)
        {
            test.clear();
            test2.clear();
            DLIB_TEST(test.size() == 0);
            DLIB_TEST(test.at_start() == true);
            DLIB_TEST(test.current_element_valid() == false);
            DLIB_TEST(e.at_start() == true);
            DLIB_TEST(e.current_element_valid() == false);

            DLIB_TEST(e.move_next() == false);
            DLIB_TEST(e.current_element_valid() == false);
            DLIB_TEST(e.at_start() == false);
            DLIB_TEST(test.at_start() == false);
            swap(test,test2);
            DLIB_TEST(test.at_start() == true);
            test.clear();
            test2.clear();

            int a;


            for (int i = 0; i < 100; ++i)
            {
                a = i;
                test.add(i,a);
            }

            DLIB_TEST(test.size() == 100);

            for (int i = 0; i < static_cast<int>(test.size()); ++i)
            {       
                DLIB_TEST(test[i] == i);
            }   

            swap(test,test2);

            a = 0;
            DLIB_TEST(test2.at_start() == true);
            while(test2.move_next())
            {
                DLIB_TEST(test2.at_start() == false);
                DLIB_TEST(test2.current_element_valid() == true);
                DLIB_TEST(test2.element() == a);
                ++a;
            }

            DLIB_TEST(test2.at_start() == false);
            DLIB_TEST(test2.current_element_valid() == false);

            test2.reset();

            DLIB_TEST(test2.at_start() == true);
            DLIB_TEST(test2.current_element_valid() == false);

            a = 0;
            while(test2.move_next())
            {
                DLIB_TEST(test2.at_start() == false);
                DLIB_TEST(test2.current_element_valid() == true);
                DLIB_TEST(test2.element() == a);
                ++a;
            }





            for (int i = 0; i < 1000; ++i)
            {
                a = ::rand();
                test.add(0,a);
            }
            DLIB_TEST(test.size() == 1000);

            test.sort();


            for (unsigned long i = 0; i < test.size()-1; ++i)
            {
                DLIB_TEST(test[i] <= test[i+1]);    
            }

            a = 0;
            while(test.move_next())
            {
                DLIB_TEST(a <= test.element());
                a = test.element();
            }


            test.clear();
            test2.clear();

            DLIB_TEST(test.size() == 0);
            DLIB_TEST(test2.size() == 0);

            for (int i = 0; i < 100; ++i)
            {
                a = i;
                test.add(i,a);
            }

            for (int i = 100; i < 200; ++i)
            {
                a = i;
                test.add(i,a);
            }

            test.cat(test2);
            DLIB_TEST(test.size() == 200);
            DLIB_TEST(test2.size() == 0);


            // serialize the state of test, then clear test, then
            // load the state back into test.
            ostringstream sout;
            serialize(test,sout);
            DLIB_TEST(test.at_start() == true);
            istringstream sin(sout.str());
            test.clear();
            deserialize(test,sin);


            for (int i = 0; i < 200; ++i)
            {
                DLIB_TEST(test[i] == i);
            }

            a = 0;
            while (test.move_next())
            {
                DLIB_TEST(test.element() == a);
                DLIB_TEST(test[0]==0);
                ++a;
            }

            DLIB_TEST(a == 200);

            DLIB_TEST(test[9] == 9);
            test.remove(9,a);
            DLIB_TEST(a == 9);
            DLIB_TEST(test[9] == 10);
            DLIB_TEST(test.size() == 199);

            test.remove(0,a);
            DLIB_TEST(test[0] == 1);
            DLIB_TEST(test.size() == 198);
            DLIB_TEST(a == 0);
            DLIB_TEST(test[9] == 11);
            DLIB_TEST(test[20] == 22);




        }

        {
            test.clear();
            for (int i = 0; i < 100; ++i)
            {
                int a = 3;
                test.add(0,a);
            }
            DLIB_TEST(test.size() == 100);
            remover<int>& go = test;
            for (int i = 0; i < 100; ++i)
            {
                int a = 9;
                go.remove_any(a);
                DLIB_TEST(a == 3);
            }
            DLIB_TEST(go.size() == 0);
        }


    }




    class sequence_tester : public tester
    {
    public:
        sequence_tester (
        ) :
            tester ("test_sequence",
                    "Runs tests on the sequence component.")
        {}

        void perform_test (
        )
        {
            dlog << LINFO << "testing sort_1a";
            sequence_sort_test<sequence<int>::sort_1a>  ();
            dlog << LINFO << "testing sort_1a_c";
            sequence_sort_test<sequence<int>::sort_1a_c>();
            dlog << LINFO << "testing sort_2a";
            sequence_sort_test<sequence<int>::sort_2a>  ();
            dlog << LINFO << "testing sort_2a_c";
            sequence_sort_test<sequence<int>::sort_2a_c>();
        }
    } a;

}

