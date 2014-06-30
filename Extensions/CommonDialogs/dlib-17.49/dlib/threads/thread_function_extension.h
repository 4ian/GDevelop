// Copyright (C) 2007  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_THREAD_FUNCTIOn_
#define DLIB_THREAD_FUNCTIOn_ 

#include "thread_function_extension_abstract.h"
#include "threads_kernel.h"
#include "auto_mutex_extension.h"
#include "threaded_object_extension.h"
#include "../smart_pointers.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    class thread_function : private threaded_object
    {
        
        class base_funct
        {
        public:
            virtual void go() = 0;
            virtual ~base_funct() {}
        };

        template <typename F, typename T1, typename T2, typename T3, typename T4>
        class super_funct_4 : public base_funct
        {
        public:
            super_funct_4 ( F funct, T1 arg1, T2 arg2, T3 arg3, T4 arg4) :
                f(funct),
                a1(arg1),
                a2(arg2),
                a3(arg3),
                a4(arg4)
            {
            }

            void go() { f(a1, a2, a3, a4); }


            F f;
            T1 a1;
            T2 a2;
            T3 a3;
            T4 a4;
        };

        template <typename F, typename T1, typename T2, typename T3>
        class super_funct_3 : public base_funct
        {
        public:
            super_funct_3 ( F funct, T1 arg1, T2 arg2, T3 arg3):
                f(funct),
                a1(arg1),
                a2(arg2),
                a3(arg3)
            {
            }

            void go() { f(a1, a2, a3); }


            F f;
            T1 a1;
            T2 a2;
            T3 a3;
        };

        template <typename F, typename T1, typename T2>
        class super_funct_2 : public base_funct
        {
        public:
            super_funct_2 ( F funct, T1 arg1, T2 arg2) :
                f(funct),
                a1(arg1),
                a2(arg2)
            {
            }

            void go() { f(a1, a2); }


            F f;
            T1 a1;
            T2 a2;
        };

        template <typename F, typename T>
        class super_funct_1 : public base_funct
        {
        public:
            super_funct_1 ( F funct, T arg) : f(funct), a(arg)
            {
            }

            void go() { f(a); }


            F f;
            T a;
        };

        template <typename F>
        class super_funct_0 : public base_funct
        {
        public:
            super_funct_0 ( F funct) : f(funct)
            {
            }
            
            void go() { f(); }

            F f;
        };

    public:

        template <typename F>
        thread_function (
            F funct
        )
        {
            f.reset(new super_funct_0<F>(funct));
            start();
        }

        template <typename F, typename T>
        thread_function (
            F funct,
            T arg
        )
        {
            f.reset(new super_funct_1<F,T>(funct,arg));
            start();
        }

        template <typename F, typename T1, typename T2>
        thread_function (
            F funct,
            T1 arg1,
            T2 arg2
        )
        {
            f.reset(new super_funct_2<F,T1,T2>(funct, arg1, arg2));
            start();
        }

        template <typename F, typename T1, typename T2, typename T3>
        thread_function (
            F funct,
            T1 arg1,
            T2 arg2,
            T3 arg3
        )
        {
            f.reset(new super_funct_3<F,T1,T2,T3>(funct, arg1, arg2, arg3));
            start();
        }

        template <typename F, typename T1, typename T2, typename T3, typename T4>
        thread_function (
            F funct,
            T1 arg1,
            T2 arg2,
            T3 arg3,
            T4 arg4
        )
        {
            f.reset(new super_funct_4<F,T1,T2,T3,T4>(funct, arg1, arg2, arg3, arg4));
            start();
        }

        ~thread_function (
        )
        {
            threaded_object::wait();
        }

        bool is_alive (
        ) const
        {
            return threaded_object::is_alive();
        }

        void wait (
        ) const
        {
            threaded_object::wait();
        }

    private:

        void thread ()
        {
            f->go();
        }

        scoped_ptr<base_funct> f;

        // restricted functions
        thread_function(thread_function&);        // copy constructor
        thread_function& operator=(thread_function&);    // assignment operator
    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_THREAD_FUNCTIOn_



