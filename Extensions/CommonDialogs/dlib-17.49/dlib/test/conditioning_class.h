// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_TEST_CONDITIONING_CLASs_H_
#define DLIB_TEST_CONDITIONING_CLASs_H_


#include <sstream>
#include <string>
#include <ctime>
#include <cstdlib>

#include <dlib/conditioning_class.h>

#include "tester.h"

namespace  
{

    using namespace test;
    using namespace std;
    using namespace dlib;

    logger dlog("test.conditioning_class");

    template <
        typename cc,
        typename cc2
        >
    void conditioning_class_kernel_test (
    )
    /*!
        requires
            - cc is an implementation of conditioning_class/conditioning_class_kernel_abstract.h            
              the alphabet_size for cc is 256
            - cc2 is an implementation of conditioning_class/conditioning_class_kernel_abstract.h            
              the alphabet_size for cc2 is 2
        ensures
            - runs tests on cc for compliance with the specs 
    !*/
    {        

        srand(static_cast<unsigned int>(time(0)));



        typename cc::global_state_type gs;
        typename cc2::global_state_type gs2;




        for (int g = 0; g < 2; ++g)
        {
            print_spinner();
            unsigned long amount=g+1;
            cc2 test(gs2);
            cc2 test2(gs2);


            DLIB_TEST(test.get_memory_usage() != 0);

            const unsigned long alphabet_size = 2;                


            DLIB_TEST(test.get_total() == 1);

            DLIB_TEST(test.get_count(alphabet_size-1)==1);
            for (unsigned long i = 0; i < alphabet_size-1; ++i)
            {
                unsigned long low_count, high_count, total_count;
                DLIB_TEST_MSG(test.get_range(i,low_count,high_count,total_count) == 0,i);
                DLIB_TEST(test.get_count(i) == 0);
                DLIB_TEST(test.get_total() == 1);
            }



            for (unsigned long i = 0; i < alphabet_size; ++i)
            {
                test.increment_count(i,static_cast<unsigned short>(amount));
                unsigned long low_count = 0, high_count = 0, total_count = 0;

                if (i ==alphabet_size-1)
                {
                    DLIB_TEST(test.get_range(i,low_count,high_count,total_count) == 1+amount);

                    DLIB_TEST(high_count == low_count+1+amount);
                    DLIB_TEST(total_count == test.get_total());


                    DLIB_TEST(test.get_count(i) == 1+amount);
                }
                else
                {
                    DLIB_TEST(test.get_range(i,low_count,high_count,total_count) == amount);

                    DLIB_TEST(high_count == low_count+amount);
                    DLIB_TEST(total_count == test.get_total());


                    DLIB_TEST(test.get_count(i) == amount);
                }
                DLIB_TEST(test.get_total() == (i+1)*amount + 1);
            } 


            for (unsigned long i = 0; i < alphabet_size; ++i)
            {                
                unsigned long temp = static_cast<unsigned long>(::rand()%40);
                for (unsigned long j = 0; j < temp; ++j)
                {
                    test.increment_count(i,static_cast<unsigned short>(amount));
                    if (i == alphabet_size-1)
                    {
                        DLIB_TEST(test.get_count(i) == (j+1)*amount + 1 + amount);                    
                    }
                    else
                    {
                        DLIB_TEST(test.get_count(i) == (j+1)*amount + amount);                    
                    }
                }

                unsigned long target = test.get_total()/2;
                unsigned long symbol = i, low_count = 0, high_count = 0, total_count = 0;

                if (i == alphabet_size-1)
                {
                    DLIB_TEST(test.get_range(symbol,low_count,high_count,total_count)==temp*amount+1+amount);
                    DLIB_TEST(high_count-low_count == temp*amount+1+amount);
                }
                else
                {
                    DLIB_TEST(test.get_range(symbol,low_count,high_count,total_count)==temp*amount + amount);
                    DLIB_TEST(high_count-low_count == temp*amount + amount);
                }
                DLIB_TEST(total_count == test.get_total());

                test.get_symbol(target,symbol,low_count,high_count);
                DLIB_TEST(test.get_count(symbol) == high_count-low_count);
                DLIB_TEST(low_count <= target);
                DLIB_TEST(target < high_count);
                DLIB_TEST(high_count <= test.get_total());

            }

            test.clear();


            for (unsigned long i = 0; i < alphabet_size-1; ++i)
            {
                test.increment_count(i);
                unsigned long low_count = 0, high_count = 0, total_count = 0;
                DLIB_TEST(test.get_range(i,low_count,high_count,total_count) == 1);

                DLIB_TEST(high_count == low_count+1);
                DLIB_TEST(total_count == test.get_total());

                DLIB_TEST(test.get_count(i) == 1);
                DLIB_TEST(test.get_total() == i+2);
            } 




            unsigned long counts[alphabet_size];


            print_spinner();
            for (int k = 0; k < 10; ++k)
            {
                unsigned long range = ::rand()%50000 + 2;

                test.clear();

                for (unsigned long i = 0; i < alphabet_size-1; ++i)
                    counts[i] = 0;
                unsigned long total = 1;
                counts[alphabet_size-1] = 1;


                for (unsigned long i = 0; i < alphabet_size; ++i)
                {                
                    unsigned long temp = static_cast<unsigned long>(::rand()%range);
                    for (unsigned long j = 0; j < temp; ++j)
                    {
                        test.increment_count(i);  


                        if (total >= 65535)
                        {
                            total = 0;
                            for (unsigned long i = 0; i < alphabet_size; ++i)
                            {
                                counts[i] >>= 1;
                                total += counts[i];
                            }
                            if (counts[alphabet_size-1]==0)
                            {
                                counts[alphabet_size-1] = 1;
                                ++total;
                            }
                        }
                        counts[i] = counts[i] + 1;
                        ++total;


                    }


                    unsigned long temp_total = 0;
                    for (unsigned long a = 0; a < alphabet_size; ++a)
                    {
                        temp_total += test.get_count(a);
                    }
                    DLIB_TEST_MSG(temp_total == test.get_total(),
                                 "temp_total == " << temp_total << endl <<
                                 "test.get_total() == " << test.get_total()
                    );

                    DLIB_TEST(test.get_count(alphabet_size-1) == counts[alphabet_size-1]);
                    DLIB_TEST_MSG(test.get_total() == total,
                                 "test.get_total() == " << test.get_total() << endl <<
                                 "total == " << total
                    );

                    unsigned long target = test.get_total()/2;
                    unsigned long symbol = i, low_count = 0, high_count = 0, total_count = 0;


                    DLIB_TEST(test.get_range(symbol,low_count,high_count,total_count)==counts[symbol]);

                    if (counts[symbol] != 0)
                    {
                        DLIB_TEST(total_count == total);

                        DLIB_TEST(high_count <= total);
                        DLIB_TEST(low_count < high_count);
                        DLIB_TEST(high_count <= test.get_total());
                        DLIB_TEST(test.get_count(symbol) == high_count-low_count);
                    }


                    if (target < total)
                    {
                        test.get_symbol(target,symbol,low_count,high_count);


                        DLIB_TEST(high_count <= total);
                        DLIB_TEST(low_count < high_count);
                        DLIB_TEST(high_count <= test.get_total());
                        DLIB_TEST(test.get_count(symbol) == high_count-low_count);
                        DLIB_TEST(test.get_count(symbol) == counts[symbol]);
                    }




                }

            }

            print_spinner();

            for (unsigned long h = 0; h < 10; ++h)
            {
                test.clear();
                DLIB_TEST(test.get_total() == 1);

                // fill out test with some numbers
                unsigned long temp = ::rand()%30000 + 50000;
                for (unsigned long j = 0; j < temp; ++j)
                {
                    unsigned long symbol = (unsigned long)::rand()%alphabet_size;
                    test.increment_count(symbol);                    
                }

                // make sure all symbols have a count of at least one
                for (unsigned long j = 0; j < alphabet_size; ++j)
                {   
                    if (test.get_count(j) == 0)
                        test.increment_count(j);
                }

                unsigned long temp_total = 0;
                for (unsigned long j = 0; j < alphabet_size; ++j)
                {
                    temp_total += test.get_count(j);
                }
                DLIB_TEST(temp_total == test.get_total());


                unsigned long low_counts[alphabet_size];
                unsigned long high_counts[alphabet_size];
                // iterate over all the symbols
                for (unsigned long j = 0; j < alphabet_size; ++j)
                {
                    unsigned long total;
                    unsigned long count = test.get_range(j,low_counts[j],high_counts[j],total);
                    DLIB_TEST(count == test.get_count(j));
                    DLIB_TEST(count == high_counts[j] - low_counts[j]);

                }


                // make sure get_symbol() matches what get_range() told us
                for (unsigned long j = 0; j < alphabet_size; ++j)
                {                    
                    for (unsigned long k = low_counts[j]; k < high_counts[j]; ++k)
                    {
                        unsigned long symbol, low_count, high_count;
                        test.get_symbol(k,symbol,low_count,high_count);
                        DLIB_TEST(high_count - low_count == test.get_count(symbol));
                        DLIB_TEST_MSG(j == symbol,
                                     "j == " << j << endl <<
                                     "k == " << k << endl <<
                                     "symbol == " << symbol << endl <<
                                     "low_counts[j] == " << low_counts[j] << endl <<
                                     "high_counts[j] == " << high_counts[j] << endl <<
                                     "low_counts[symbol] == " << low_counts[symbol] << endl <<
                                     "high_counts[symbol] == " << high_counts[symbol] << endl << 
                                     "low_count == " << low_count << endl << 
                                     "high_count == " << high_count << endl << 
                                     "temp.count(j) == " << test.get_count(j)
                        );
                        DLIB_TEST_MSG(low_count == low_counts[j],
                                     "symbol:        " << j << "\n" <<
                                     "target:        " << k << "\n" <<
                                     "low_count:     " << low_count << "\n" <<
                                     "low_counts[j]: " << low_counts[j]);
                        DLIB_TEST(high_count == high_counts[j]);
                    }

                }

            }



            print_spinner();

            for (int h = 0; h < 10; ++h)
            {


                test.clear();

                for (unsigned long k = 0; k < alphabet_size-1; ++k)
                {
                    counts[k] = 0;
                }
                counts[alphabet_size-1] = 1;
                unsigned long total = 1;
                unsigned long i = ::rand()%alphabet_size;

                unsigned long temp = 65536;
                for (unsigned long j = 0; j < temp; ++j)
                {
                    test.increment_count(i);  


                    if (total >= 65535)
                    {
                        total = 0;
                        for (unsigned long i = 0; i < alphabet_size; ++i)
                        {
                            counts[i] >>= 1;
                            total += counts[i];
                        }
                        if (counts[alphabet_size-1] == 0)
                        {
                            ++total;
                            counts[alphabet_size-1] = 1;
                        }
                    }
                    counts[i] = counts[i] + 1;
                    ++total;

                }


                DLIB_TEST(test.get_total() == total);

                unsigned long target = test.get_total()/2;
                unsigned long symbol = i, low_count = 0, high_count = 0, total_count = 0;


                DLIB_TEST(test.get_range(symbol,low_count,high_count,total_count)==counts[symbol]);

                if (counts[symbol] != 0)
                {
                    DLIB_TEST(total_count == total);

                    DLIB_TEST(high_count <= total);
                    DLIB_TEST(low_count < high_count);
                    DLIB_TEST(high_count <= test.get_total());
                    DLIB_TEST(test.get_count(symbol) == high_count-low_count);
                }



                test.get_symbol(target,symbol,low_count,high_count);


                DLIB_TEST(high_count <= total);
                DLIB_TEST(low_count < high_count);
                DLIB_TEST(high_count <= test.get_total());
                DLIB_TEST(test.get_count(symbol) == high_count-low_count);
                DLIB_TEST(test.get_count(symbol) == counts[symbol]);







            }

        } // for (int g = 0; g < 2; ++g)













        for (int g = 0; g < 2; ++g)
        {
            print_spinner();
            unsigned long amount=g+1;
            cc test(gs);
            cc test2(gs);

            DLIB_TEST(test.get_memory_usage() != 0);

            const unsigned long alphabet_size = 256;                


            DLIB_TEST(test.get_total() == 1);

            DLIB_TEST(test.get_count(alphabet_size-1)==1);
            for (unsigned long i = 0; i < alphabet_size-1; ++i)
            {
                unsigned long low_count, high_count, total_count;
                DLIB_TEST(test.get_range(i,low_count,high_count,total_count) == 0);
                DLIB_TEST(test.get_count(i) == 0);
                DLIB_TEST(test.get_total() == 1);
            }


            bool oom = false;
            for (unsigned long i = 0; i < alphabet_size; ++i)
            {
                bool status = test.increment_count(i,static_cast<unsigned short>(amount));
                unsigned long low_count = 0, high_count = 0, total_count = 0;
                if (!status)
                    oom = true;

                if (status)
                {
                    if (i ==alphabet_size-1)
                    {
                        DLIB_TEST(test.get_range(i,low_count,high_count,total_count) == 1+amount);

                        DLIB_TEST(high_count == low_count+1+amount);
                        DLIB_TEST(total_count == test.get_total());


                        DLIB_TEST(test.get_count(i) == 1+amount);
                    }
                    else
                    {
                        DLIB_TEST(test.get_range(i,low_count,high_count,total_count) == amount);

                        DLIB_TEST(high_count == low_count+amount);
                        DLIB_TEST(total_count == test.get_total());


                        DLIB_TEST(test.get_count(i) == amount);
                    }
                    if (!oom)
                        DLIB_TEST(test.get_total() == (i+1)*amount + 1);
                }
            } 


            oom = false;
            for (unsigned long i = 0; i < alphabet_size; ++i)
            {        
                unsigned long temp = static_cast<unsigned long>(::rand()%40);
                for (unsigned long j = 0; j < temp; ++j)
                {
                    bool status = test.increment_count(i,static_cast<unsigned short>(amount));
                    if (!status)
                        oom = true;
                    if (status)
                    {
                        if (i == alphabet_size-1)
                        {
                            DLIB_TEST(test.get_count(i) == (j+1)*amount + 1 + amount);                    
                        }
                        else
                        {
                            DLIB_TEST(test.get_count(i) == (j+1)*amount + amount);                    
                        }
                    }
                }

                unsigned long target = test.get_total()/2;
                unsigned long symbol = i, low_count = 0, high_count = 0, total_count = 0;

                if (!oom)
                {
                    if (i == alphabet_size-1)
                    {
                        DLIB_TEST(test.get_range(symbol,low_count,high_count,total_count)==temp*amount+1+amount);
                        DLIB_TEST(high_count-low_count == temp*amount+1+amount);
                    }
                    else
                    {
                        DLIB_TEST(test.get_range(symbol,low_count,high_count,total_count)==temp*amount + amount);
                        DLIB_TEST(high_count-low_count == temp*amount + amount);
                    }
                    DLIB_TEST(total_count == test.get_total());


                    test.get_symbol(target,symbol,low_count,high_count);
                    DLIB_TEST(test.get_count(symbol) == high_count-low_count);
                    DLIB_TEST(low_count <= target);
                    DLIB_TEST(target < high_count);
                    DLIB_TEST(high_count <= test.get_total());
                }

            }

            test.clear();


            oom = false;
            for (unsigned long i = 0; i < alphabet_size-1; ++i)
            {
                if(!test.increment_count(i))
                    oom = true;
                unsigned long low_count = 0, high_count = 0, total_count = 0;

                if (!oom)
                {
                    DLIB_TEST(test.get_range(i,low_count,high_count,total_count) == 1);

                    DLIB_TEST(high_count == low_count+1);
                    DLIB_TEST(total_count == test.get_total());

                    DLIB_TEST(test.get_count(i) == 1);
                    DLIB_TEST(test.get_total() == i+2);
                }
            } 



            unsigned long counts[alphabet_size];


            for (int k = 0; k < 10; ++k)
            {
                unsigned long range = ::rand()%50000 + 2;

                test.clear();

                for (unsigned long i = 0; i < alphabet_size-1; ++i)
                    counts[i] = 0;
                unsigned long total = 1;
                counts[alphabet_size-1] = 1;


                oom = false;
                for (unsigned long i = 0; i < alphabet_size; ++i)
                {                
                    unsigned long temp = static_cast<unsigned long>(::rand()%range);
                    for (unsigned long j = 0; j < temp; ++j)
                    {
                        if (!test.increment_count(i))
                            oom = true;


                        if (total >= 65535)
                        {

                            total = 0;
                            for (unsigned long i = 0; i < alphabet_size; ++i)
                            {
                                counts[i] >>= 1;
                                total += counts[i];
                            }
                            if (counts[alphabet_size-1]==0)
                            {
                                counts[alphabet_size-1] = 1;
                                ++total;
                            }
                        }
                        counts[i] = counts[i] + 1;
                        ++total;


                    }


                    unsigned long temp_total = 0;
                    for (unsigned long a = 0; a < alphabet_size; ++a)
                    {
                        temp_total += test.get_count(a);
                    }

                    if (!oom)
                    {
                        DLIB_TEST_MSG(temp_total == test.get_total(),
                                     "temp_total == " << temp_total << endl <<
                                     "test.get_total() == " << test.get_total()
                        );

                        DLIB_TEST(test.get_count(alphabet_size-1) == counts[alphabet_size-1]);
                        DLIB_TEST_MSG(test.get_total() == total,
                                     "test.get_total() == " << test.get_total() << endl <<
                                     "total == " << total
                        );
                    }

                    unsigned long target = test.get_total()/2;
                    unsigned long symbol = i, low_count = 0, high_count = 0, total_count = 0;

                    if (!oom)
                    {

                        DLIB_TEST(test.get_range(symbol,low_count,high_count,total_count)==counts[symbol]);

                        if (counts[symbol] != 0)
                        {
                            DLIB_TEST(total_count == total);

                            DLIB_TEST(high_count <= total);
                            DLIB_TEST(low_count < high_count);
                            DLIB_TEST(high_count <= test.get_total());
                            DLIB_TEST(test.get_count(symbol) == high_count-low_count);
                        }


                        if (target < total)
                        {
                            test.get_symbol(target,symbol,low_count,high_count);


                            DLIB_TEST(high_count <= total);
                            DLIB_TEST(low_count < high_count);
                            DLIB_TEST(high_count <= test.get_total());
                            DLIB_TEST(test.get_count(symbol) == high_count-low_count);
                            DLIB_TEST(test.get_count(symbol) == counts[symbol]);
                        }
                    }



                }

            }

            oom = false;
            for (unsigned long h = 0; h < 10; ++h)
            {
                test.clear();
                DLIB_TEST(test.get_total() == 1);

                // fill out test with some numbers
                unsigned long temp = ::rand()%30000 + 50000;
                for (unsigned long j = 0; j < temp; ++j)
                {
                    unsigned long symbol = (unsigned long)::rand()%alphabet_size;
                    if (!test.increment_count(symbol))
                        oom = true;
                }

                // make sure all symbols have a count of at least one
                for (unsigned long j = 0; j < alphabet_size; ++j)
                {   
                    if (test.get_count(j) == 0)
                        test.increment_count(j);
                }

                unsigned long temp_total = 0;
                for (unsigned long j = 0; j < alphabet_size; ++j)
                {
                    temp_total += test.get_count(j);
                }
                if (!oom)
                    DLIB_TEST(temp_total == test.get_total());


                unsigned long low_counts[alphabet_size];
                unsigned long high_counts[alphabet_size];

                if (!oom)
                {

                    // iterate over all the symbols
                    for (unsigned long j = 0; j < alphabet_size; ++j)
                    {
                        unsigned long total;
                        unsigned long count = test.get_range(j,low_counts[j],high_counts[j],total);
                        DLIB_TEST(count == test.get_count(j));
                        DLIB_TEST(count == high_counts[j] - low_counts[j]);

                    }




                    // make sure get_symbol() matches what get_range() told us
                    for (unsigned long j = 0; j < alphabet_size; ++j)
                    {                    
                        for (unsigned long k = low_counts[j]; k < high_counts[j]; ++k)
                        {
                            unsigned long symbol, low_count, high_count;
                            test.get_symbol(k,symbol,low_count,high_count);
                            DLIB_TEST(high_count - low_count == test.get_count(symbol));
                            DLIB_TEST_MSG(j == symbol,
                                         "j == " << j << endl <<
                                         "k == " << k << endl <<
                                         "symbol == " << symbol << endl <<
                                         "low_counts[j] == " << low_counts[j] << endl <<
                                         "high_counts[j] == " << high_counts[j] << endl <<
                                         "low_counts[symbol] == " << low_counts[symbol] << endl <<
                                         "high_counts[symbol] == " << high_counts[symbol] << endl << 
                                         "low_count == " << low_count << endl << 
                                         "high_count == " << high_count << endl << 
                                         "temp.count(j) == " << test.get_count(j)
                            );
                            DLIB_TEST_MSG(low_count == low_counts[j],
                                         "symbol:        " << j << "\n" <<
                                         "target:        " << k << "\n" <<
                                         "low_count:     " << low_count << "\n" <<
                                         "low_counts[j]: " << low_counts[j]);
                            DLIB_TEST(high_count == high_counts[j]);
                        }

                    }
                }

            }




            for (int h = 0; h < 10; ++h)
            {


                test.clear();

                for (unsigned long k = 0; k < alphabet_size-1; ++k)
                {
                    counts[k] = 0;
                }
                counts[alphabet_size-1] = 1;
                unsigned long total = 1;
                unsigned long i = ::rand()%alphabet_size;

                unsigned long temp = 65536;
                for (unsigned long j = 0; j < temp; ++j)
                {
                    test.increment_count(i);  


                    if (total >= 65535)
                    {
                        total = 0;
                        for (unsigned long i = 0; i < alphabet_size; ++i)
                        {
                            counts[i] >>= 1;
                            total += counts[i];
                        }
                        if (counts[alphabet_size-1] == 0)
                        {
                            ++total;
                            counts[alphabet_size-1] = 1;
                        }
                    }
                    counts[i] = counts[i] + 1;
                    ++total;

                }


                DLIB_TEST(test.get_total() == total);

                unsigned long target = test.get_total()/2;
                unsigned long symbol = i, low_count = 0, high_count = 0, total_count = 0;


                DLIB_TEST(test.get_range(symbol,low_count,high_count,total_count)==counts[symbol]);

                if (counts[symbol] != 0)
                {
                    DLIB_TEST(total_count == total);

                    DLIB_TEST(high_count <= total);
                    DLIB_TEST(low_count < high_count);
                    DLIB_TEST(high_count <= test.get_total());
                    DLIB_TEST(test.get_count(symbol) == high_count-low_count);
                }



                test.get_symbol(target,symbol,low_count,high_count);


                DLIB_TEST(high_count <= total);
                DLIB_TEST(low_count < high_count);
                DLIB_TEST(high_count <= test.get_total());
                DLIB_TEST(test.get_count(symbol) == high_count-low_count);
                DLIB_TEST(test.get_count(symbol) == counts[symbol]);







            }

        } // for (int g = 0; g < 2; ++g)


    }

}

#endif // DLIB_TEST_CONDITIONING_CLASs_H_

