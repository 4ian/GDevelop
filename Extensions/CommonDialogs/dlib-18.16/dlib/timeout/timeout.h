// Copyright (C) 2007  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_TIMEOUT_KERNEl_1_
#define DLIB_TIMEOUT_KERNEl_1_

#include "../threads.h"
#include "../algs.h"
#include "../misc_api.h"
#include "timeout_abstract.h"
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

    class timeout 
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

        template <typename T>
        class functor : public bind
        {
        public:
            functor(const T& f) : function(f) {}
            T function;
            void go() { function(); }
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

        // This typedef is here for backwards compatibility with previous versions of dlib.
        typedef timeout kernel_1a;

        template <
            typename T
            >
        timeout (
            T callback_function,
            unsigned long ms_to_timeout
        ) :
            t(*this,&timeout::trigger_timeout)
        {
            b = new functor<T>(callback_function);
            t.set_delay_time(ms_to_timeout);
            t.start();
        }

        template <
            typename T
            >
        timeout (  
            T& object,
            void (T::*callback_function)(),
            unsigned long ms_to_timeout
        ): 
            t(*this,&timeout::trigger_timeout)
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
        timeout (  
            T& object,
            void (T::*callback_function)(U callback_function_argument),
            unsigned long ms_to_timeout,
            U callback_function_argument
        ): 
            t(*this,&timeout::trigger_timeout)
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
        timeout (  
            T& object,
            int (T::*callback_function)(),
            unsigned long ms_to_timeout
        ): 
            t(*this,&timeout::trigger_timeout)
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
        timeout (  
            T& object,
            int (T::*callback_function)(U callback_function_argument),
            unsigned long ms_to_timeout,
            U callback_function_argument
        ): 
            t(*this,&timeout::trigger_timeout)
        {
            one<T,int,U>* B = new one<T,int,U>;
            b = B;
            B->object = &object; 
            B->callback_function = callback_function;
            B->val = callback_function_argument;
            t.set_delay_time(ms_to_timeout);
            t.start();
        }

        virtual ~timeout (
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

        dlib::timer<timeout> t;
        bind* b;

        // restricted functions
        timeout(const timeout&);        // copy constructor
        timeout& operator=(const timeout&);    // assignment operator

    };    

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_TIMEOUT_KERNEl_1_



