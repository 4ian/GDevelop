// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.


#include <sstream>
#include <string>

#include <dlib/bigint.h>

#include "tester.h"

namespace  
{
    using namespace test;
    using namespace dlib;
    using namespace std;

    logger dlog("test.bigint");

    namespace bigint_kernel_test_helpers 
    {
        template <
            typename bint
            >
        bint short_fact (unsigned short value)
        /*!
            ensures
                - returns the factorial of value
        !*/
        {
            using namespace relational_operators;

            bint a = 1;
            for (unsigned short i = 2; i <= value; ++i)
                a *= i;

            return a;
        }

        template <
            typename bint
            >
        bint short_fact_squared (unsigned short value)
        /*!
            ensures
                - returns the square of the factorial of value
        !*/
        {
            using namespace relational_operators;

            bint a = 1;
            for (unsigned short i = 2; i <= value; ++i)
            {
                a *= i;
                a *= i;
            }

            return a;
        }


        template <
            typename bint
            >
        bint big_fact (unsigned short value)
        /*!
            ensures
                - returns the factorial of value
        !*/
        {
            using namespace relational_operators;

            bint a = 1;
            int k = 0; 
            for (bint i = 2; i <= value; ++i)
            {
                ++k;
                if (k%10 == 0)
                    print_spinner();
                a *= i;
            }

            return a;
        }        
    }

    template <
        typename bint
        >
    void bigint_kernel_test (
    )
    /*!
        requires
            - bint is an implementation of bigint/bigint_kernel_abstract.h
        ensures
            - runs tests on bint for compliance with the specs 
    !*/
    {        
        using namespace bigint_kernel_test_helpers;
        using namespace relational_operators;
        istringstream sin;
        ostringstream sout;

        bint i = 0;
        bint a(5), b, c(0);

        DLIB_TEST(5 - a == 0);
        DLIB_TEST(a - 5 == 0);

        DLIB_TEST(0 - c == 0);
        DLIB_TEST(c - 0 == 0);

        DLIB_TEST(0 + c == 0);
        DLIB_TEST(c + 0 == 0);

        DLIB_TEST(0 + a == 5);
        DLIB_TEST(a + 0 == 5);

        DLIB_TEST(0 - b == 0);
        DLIB_TEST(b - 0 == 0);

        DLIB_TEST(0 + b == 0);
        DLIB_TEST(b + 0 == 0);

        DLIB_TEST(i == 0);
        DLIB_TEST(a == 5);
        DLIB_TEST(b == 0);
        DLIB_TEST(c == 0);



        a -= 5;
        DLIB_TEST(a == 0);



        for (int k = 0; k < 100; ++k)
        {
            // compute the factorial of k using the O(n) multiplication algorithm
            a = short_fact<bint>(k);
            // compute the factorial of k using the full blown big int 
            // multiplication algorithm.
            b = big_fact<bint>(k);
            // compute the square of the factorial of k using the full blown
            // big int multiplication algorithm.
            c = a*b;
            // make sure a and b ended up being the same number
            DLIB_TEST_MSG(a == b,
                         "k: " << k << "\n"
                         "short_fact: " << a << "\n"
                         "big_fact: " << b 
            );
            // make sure c really is the square of the factorial of k
            DLIB_TEST_MSG(short_fact_squared<bint>(k) == c,"k: " << k);
            print_spinner();
        }

        // do the same thing as the last loop but do it with way bigger numbers
        for (int k = 1000; k < 10000; k += 2000)
        {
            bint a = short_fact<bint>(k);
            bint b = big_fact<bint>(k);
            bint c = a*b;
            DLIB_TEST_MSG(a == b,
                         "k: " << k << "\n"
                         "short_fact: " << a << "\n"
                         "big_fact: " << b 
            );
            DLIB_TEST_MSG(short_fact_squared<bint>(k) == c,"k: " << k);
            print_spinner();
        }



        // test the << and >> operators a little
        a = big_fact<bint>(20);
        sout << a;
        DLIB_TEST_MSG( sout.str() == "2432902008176640000","was: " << a);

        sin.str("684626312793279327952039475203945");
        sin >> a;
        sout.str("");
        sout << a;
        DLIB_TEST(sout.str() == "684626312793279327952039475203945");

        print_spinner();

        DLIB_TEST(a > 0);


        // make sure that when you try to read something that isn't a number
        // into a bigint you get an error
        DLIB_TEST(sin.fail() == false);
        sin.str("the cat ate some cheese");
        sin >> a;
        DLIB_TEST(sin.fail() == true);
        sin.clear();
        sin.str("");



        sin.str("3628913");
        sin >> i;
        DLIB_TEST(short_fact<bint>(10) + short_fact<bint>(5) - 7 == i);

        sin.str("2432902008173011193");
        sin >> i;
        DLIB_TEST(short_fact<bint>(20) - short_fact<bint>(10) - 7 == i);

        // test the serialization stuff
        sout.str("");
        serialize(i,sout);
        i = 0;
        sin.str(sout.str());
        deserialize(i,sin);

        DLIB_TEST(short_fact<bint>(20) - short_fact<bint>(10) - 7 == i);




        print_spinner();




        sin.str("100000");
        sin >> b;
        a = b;
        ++b;
        DLIB_TEST_MSG ( a + 1 == b,"a==" << a << endl << "b==" << b << endl);





        // compute some stuff and see if you get the right value
        a = 0;
        b = 0;
        sin.str("1000000");
        sin >> b;
        int mel = 0;
        for (i = a; i <= b; ++i)
        {
            // switch it up on em
            if (i%2 == 0)
                a = a + i;
            else
                a += i;          
            ++mel;
            if ((mel&0xFFF) == 0)
                print_spinner();
        }
        DLIB_TEST_MSG(a == b*(b+1)/2, "a==" << a << endl << "b*(b+1)/2==" << b*(b+1)/2 << endl);






        print_spinner();


        // compute some stuff and see if you get the right value
        // this time going the other way using operator--
        a = 0;
        b = 0;
        sin.str("100000");
        sin >> b;
        i = b;
        DLIB_TEST(i == b);
        DLIB_TEST_MSG(i > 0,"i==" << i);
        mel = 0;
        for (i = b; i > 0; --i)
        {
            // switch it up on em
            if (i%2 == 0)
                a = a + i;
            else
                a += i;  
            ++mel;
            if ((mel&0xFF) == 0)
                print_spinner();
        }
        DLIB_TEST_MSG(a == b*(b+1)/2, "a==" << a << endl << "b*(b+1)/2==" << b*(b+1)/2 << endl);











        DLIB_TEST(short_fact<bint>(10)/short_fact<bint>(5) == 30240);
        DLIB_TEST(short_fact<bint>(10)/(short_fact<bint>(5)+1) == 29990);

        sin.str("221172909834240000");
        sin >> a;
        DLIB_TEST(short_fact<bint>(20)/(short_fact<bint>(5)+1) == a/11);

        sin.str("670442388044");
        sin >> b;
        DLIB_TEST(short_fact<bint>(20)/(short_fact<bint>(10)+1) == b);

        print_spinner();

        sin.str("1860479");
        sin >> i;
        DLIB_TEST_MSG(short_fact<bint>(20)/(short_fact<bint>(15)+1) == i,short_fact<bint>(20)/(short_fact<bint>(15)+1));

        // test the serialization stuff
        sout.str("");
        serialize(i,sout);
        i = 0;
        sin.str(sout.str());
        deserialize(i,sin);

        DLIB_TEST_MSG(short_fact<bint>(20)/(short_fact<bint>(15)+1) == i,short_fact<bint>(20)/(short_fact<bint>(15)+1));


        print_spinner();

        // test the serialization stuff
        sout.str("");
        i = 0;
        serialize(i,sout);
        i = 1234;
        sin.str(sout.str());
        deserialize(i,sin);
        DLIB_TEST(i == 0);


        DLIB_TEST(short_fact<bint>(10000)/short_fact<bint>(9999) == 10000);


        DLIB_TEST(bint(5)%bint(1) == 0);
        DLIB_TEST(bint(5)%bint(6) == 5);
        DLIB_TEST(bint(25)%bint(6) == 1);
        print_spinner();
        DLIB_TEST(bint(354)%bint(123) == 108);
        DLIB_TEST(bint(20)%(bint(10)) == 0);
        DLIB_TEST(bint(20)%(bint(10)+1) == 9);

        DLIB_TEST(bint(20)%(bint(15)+1) == 4);


        DLIB_TEST(short_fact<bint>(10)%(short_fact<bint>(5)+2) == 32);

        sin.str("2908082");
        sin >> i;
        DLIB_TEST(short_fact<bint>(15)%(short_fact<bint>(10)+2) == i);






        // same as some of the above stuff but using big_fact

        DLIB_TEST(big_fact<bint>(10)%(big_fact<bint>(5)+2) == 32);

        sin.str("2908082");
        sin >> i;
        DLIB_TEST(big_fact<bint>(15)%(big_fact<bint>(10)+2) == i);


        print_spinner();


        DLIB_TEST(big_fact<bint>(10)/big_fact<bint>(5) == 30240);
        DLIB_TEST(big_fact<bint>(10)/(big_fact<bint>(5)+1) == 29990);

        sin.str("221172909834240000");
        sin >> a;
        DLIB_TEST(big_fact<bint>(20)/(big_fact<bint>(5)+1) == a/11);


        sin.str("670442388044");
        sin >> b;
        DLIB_TEST(big_fact<bint>(20)/(big_fact<bint>(10)+1) == b);


        sin.str("1860479");
        sin >> i;
        DLIB_TEST_MSG(big_fact<bint>(20)/(big_fact<bint>(15)+1) == i,big_fact<bint>(20)/(big_fact<bint>(15)+1));

        DLIB_TEST(big_fact<bint>(100)/big_fact<bint>(99) == 100);




        sout.str("");
        sout << "148571596448176149730952273362082573788556996128468876694221686370498539309";
        sout << "4065876545992131370884059645617234469978112000000000000000000000";
        sin.str(sout.str());
        sin >> a;

        sout.str("");
        sout << "933262154439441526816992388562667004907159682643816214685929638952175999932";
        sout << "299156089414639761565182862536979208272237582511852109168640000000000000000";
        sout << "000000";
        sin.str(sout.str());
        sin >> b;


        sout.str("");
        sout << "138656248189732152054159609718432247180282092567575172939636909224427929240";
        sout << "834642263988043338170905744175653189424779336521852536242160190545537133916";
        sout << "649622615351174407746524657461692702500613722228638559932561661493048332720";
        sout << "6050692647868232055316807680000000000000000000000000000000000000000000";
        sin.str(sout.str());
        sin >> c;

        DLIB_TEST_MSG(a*b == c,
                     "a*b: " << a*b <<
                     "\nc:   " << c);


        print_spinner();

        i = 0;
        mel = 0;
        unsigned long j;
        for (j = 0; i < bint(100000); ++j)
        {
            DLIB_TEST(i++ == bint(j));
            ++mel;
            if((mel&0xFF) == 0)
                print_spinner();
        }
        DLIB_TEST(j == 100000);

        i = 1234;

        DLIB_TEST(i == 1234);
        DLIB_TEST(i < 2345 );
        DLIB_TEST(i > 0    );
        DLIB_TEST(i > 123  );

        DLIB_TEST(i != 1334);
        DLIB_TEST(i <= 2345);
        DLIB_TEST(i >= 0   );
        DLIB_TEST(i >= 123 );
        DLIB_TEST(i >= 1234);
        DLIB_TEST(i <= 1234);


        DLIB_TEST(1234 == i);
        DLIB_TEST(2345 > i);
        DLIB_TEST(0    < i);
        DLIB_TEST(123  < i);

        DLIB_TEST(1334 != i);
        DLIB_TEST(2345 >= i);
        DLIB_TEST(0    <= i);
        DLIB_TEST(123  <= i);
        DLIB_TEST(1234 <= i);
        DLIB_TEST(1234 >= i);


        a = big_fact<bint>(200);
        b = big_fact<bint>(100);

        DLIB_TEST(a > b);
        DLIB_TEST(a != b);
        DLIB_TEST(b < a);            
        DLIB_TEST(b != a);
        DLIB_TEST(b <= a);
        DLIB_TEST(a >= b);



    }




    class bigint_tester : public tester
    {
    public:
        bigint_tester (
        ) :
            tester ("test_bigint",
                    "Runs tests on the bigint component.")
        {}

        void perform_test (
        )
        {
            dlog << LINFO << "testing kernel_1a";
            bigint_kernel_test<bigint::kernel_1a>();
            print_spinner();
            
            dlog << LINFO << "testing kernel_1a_c";
            bigint_kernel_test<bigint::kernel_1a_c>();
            print_spinner();

            dlog << LINFO << "testing kernel_2a";
            bigint_kernel_test<bigint::kernel_2a>();
            print_spinner();

            dlog << LINFO << "testing kernel_2a_c";
            bigint_kernel_test<bigint::kernel_2a_c>();
            print_spinner();

        }
    } a;

}

