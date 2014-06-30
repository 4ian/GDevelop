// Copyright (C) 2007  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_TIMEOUT_KERNEl_1_
#define DLIB_TIMEOUT_KERNEl_1_

#include "../threads.h"
#include "../algs.h"
#include "../misc_api.h"
#include "timeout_kernel_abstract.h"
#include "../uintn.h"
#include "../timer.h"

#ifdef _MSC_VER
// this is to disable the "'this' : used in base member initializer list"
// warning you get from some of the GUI objects since all the objects
// require that their parent class be passed into their constructor. 
// In this case though it is totally safe so it is ok to disable this warning.
#pragma warning(disable : 4355)
#endif // _MSC_VER

namespace dlib
{

// ----------------------------------------------------------------------------------------

    class timeout_kernel_1 
    {
        /*!
            INITIAL VALUE
                - b == a pointer to some kind of bind object

            CONVENTION
                - b == a pointer to some kind of bind object
        !*/

        class bind
        {
        public:
            virtual void go() = 0;
            virtual ~bind() {}
        };

        template <typename T, typename R>
        class zero : public bind
        {
        public:
            T* object;
            R (T::*callback_function)();
            void go() { (object->*callback_function)(); }

        };

        template <typename T, typename R, typename U>
        class one : public bind
        {
        public:
            T* object;
            R (T::*callback_function)(U);
            U val;
            void go() { (object->*callback_function)(val); }
        };

    public:

        template <
            typename T
            >
        timeout_kernel_1 (  
            T& object,
            void (T::*callback_function)(),
            unsigned long ms_to_timeout
        ): 
            t(*this,&timeout_kernel_1::trigger_timeout)
        {
            zero<T,void>* B = new zero<T,void>;
            b = B;
            B->object = &object;
            B->callback_function = callback_function;
            t.set_delay_time(ms_to_timeout);
            t.start();
        }

        template <
            typename T,
            typename U
            >
        timeout_kernel_1 (  
            T& object,
            void (T::*callback_function)(U callback_function_argument),
            unsigned long ms_to_timeout,
            U callback_function_argument
        ): 
            t(*this,&timeout_kernel_1::trigger_timeout)
        {
            one<T,void,U>* B = new one<T,void,U>;
            b = B;
            B->object = &object; 
            B->callback_function = callback_function;
            B->val = callback_function_argument;
            t.set_delay_time(ms_to_timeout);
            t.start();
        }

        template <
            typename T
            >
        timeout_kernel_1 (  
            T& object,
            int (T::*callback_function)(),
            unsigned long ms_to_timeout
        ): 
            t(*this,&timeout_kernel_1::trigger_timeout)
        {
            zero<T,int>* B = new zero<T,int>;
            b = B;
            B->object = &object;
            B->callback_function = callback_function;
            t.set_delay_time(ms_to_timeout);
            t.start();
        }

        template <
            typename T,
            typename U
            >
        timeout_kernel_1 (  
            T& object,
            int (T::*callback_function)(U callback_function_argument),
            unsigned long ms_to_timeout,
            U callback_function_argument
        ): 
            t(*this,&timeout_kernel_1::trigger_timeout)
        {
            one<T,int,U>* B = new one<T,int,U>;
            b = B;
            B->object = &object; 
            B->callback_function = callback_function;
            B->val = callback_function_argument;
            t.set_delay_time(ms_to_timeout);
            t.start();
        }

        virtual ~timeout_kernel_1 (
        )
        {
            t.stop_and_wait();
            delete b;
        }

    private:

        void trigger_timeout ()
        {
            b->go();
            t.stop();
        }

        dlib::timer<timeout_kernel_1>::kernel_2a t;
        bind* b;

        // restricted functions
        timeout_kernel_1(const timeout_kernel_1&);        // copy constructor
        timeout_kernel_1& operator=(const timeout_kernel_1&);    // assignment operator

    };    

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_TIMEOUT_KERNEl_1_



