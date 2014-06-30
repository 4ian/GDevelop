// Copyright (C) 2005  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.


#include <sstream>
#include <string>
#include <cstdlib>
#include <ctime>
#include <dlib/stack.h>

#include "tester.h"

namespace  
{

    using namespace test;
    using namespace dlib;
    using namespace std;

    logger dlog("test.stack");

    template <
        typename stack
        >
    void stack_kernel_test (
    )
    /*!
        requires
            - stack is an implementation of stack/stack_sort_abstract.h 
              stack is instantiated with int
        ensures
            - runs tests on stack for compliance with the specs
    !*/
    {        


        srand(static_cast<unsigned int>(time(0)));

        print_spinner();

        stack a1, a2;



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


            for (unsigned long i = 0; i < 100; ++i)
            {
                int a = (int)i;
                a1.push(a);
            }

            DLIB_TEST(a1.size() == 100);

            int count = 99;
            while (a1.move_next())
            {
                DLIB_TEST_MSG(a1.element() == count,a1.element() << " : " << count);
                --count;
            }

            DLIB_TEST(a1.current_element_valid() == false);
            DLIB_TEST(a1.at_start() == false);

            a1.swap(a2);

            count = 99;
            DLIB_TEST(a2.current_element_valid() == false);
            DLIB_TEST(a2.at_start() == false);
            DLIB_TEST(a1.current_element_valid() == false);
            DLIB_TEST(a1.at_start() == true);

            DLIB_TEST(a1.size() == 0);
            DLIB_TEST(a2.size() == 100);
            DLIB_TEST(a2.current() == 99);

            a2.reset();
            while (a2.move_next())
            {
                DLIB_TEST(a2.element() == count--);
            }                

            DLIB_TEST(a2.current_element_valid() == false);
            DLIB_TEST(a2.at_start() == false);
            int b = 4;
            a2.push(b);
            DLIB_TEST(a2.current_element_valid() == false);
            DLIB_TEST(a2.at_start() == true);

            DLIB_TEST(a2.current() == 4);
            int c = 0;
            a2.pop(c);
            DLIB_TEST(c == 4);

            // serialize the state of a2, then clear a2, then
            // load the state back into a2.
            ostringstream sout;
            serialize(a2,sout);
            DLIB_TEST(a2.at_start() == true);
            istringstream sin(sout.str());
            a2.clear();
            deserialize(a2,sin);


            count = 99;
            while (a2.size())
            {
                int a = 0;
                DLIB_TEST(a2.current() == count);
                DLIB_TEST(const_cast<const stack&>(a2).current() == count);
                a2.pop(a);
                DLIB_TEST(a == count--);
            }






            a1.clear();
            a2.clear();
        }


        {
            a1.clear();
            remover<int>& go = a1;
            for (int i = 0; i < 100; ++i)
            {
                int a = 3;
                a1.push(a);
            }
            DLIB_TEST(go.size() == 100);                
            for (int i = 0; i < 100; ++i)
            {
                int a = 9;
                go.remove_any(a);
                DLIB_TEST(a == 3);
            }
            DLIB_TEST(go.size() == 0);
        }

    }




    class stack_tester : public tester
    {
    public:
        stack_tester (
        ) :
            tester ("test_stack",
                    "Runs tests on the stack component.")
        {}

        void perform_test (
        )
        {
            dlog << LINFO << "testing kernel_1a";
            stack_kernel_test<stack<int>::kernel_1a>  ();
            dlog << LINFO << "testing kernel_1a_c";
            stack_kernel_test<stack<int>::kernel_1a_c>();
        }
    } a;

}

