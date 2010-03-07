// Copyright (C) 2007  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_THREAD_FUNCTIOn_
#define DLIB_THREAD_FUNCTIOn_ 

#include "thread_function_extension_abstract.h"
#include "threads_kernel.h"
#include "auto_mutex_extension.h"
#include "threaded_object_extension.h"

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

        template <typename T>
        class super_funct_arg : public base_funct
        {
        public:
            super_funct_arg (
                void (*funct)(T),
                T arg
            )
            {
                a = arg;
                f = funct;
            }

            void go() { f(a); }


            T a;
            void (*f)(T);
        };


        class super_funct_no_arg : public base_funct
        {
        public:
            super_funct_no_arg (
                void (*funct)()
            )
            {
                f = funct;
            }
            
            void go() { f(); }

            void (*f)();

        };

        template <typename T>
        class super_Tfunct_no_arg : public base_funct
        {
        public:
            super_Tfunct_no_arg (
                const T& funct
            )
            {
                f = funct;
            }
            
            void go() { f(); }

            T f;

        };

    public:

        template <typename T>
        thread_function (
            const T& funct
        )
        {
            f = new super_Tfunct_no_arg<T>(funct);
            start();
        }

        thread_function (
            void (*funct)()
        )
        {
            f = new super_funct_no_arg(funct);
            start();
        }

        template <typename T>
        thread_function (
            void (*funct)(T),
            T arg
        )
        {
            f = new super_funct_arg<T>(funct,arg);
            start();
        }

        ~thread_function (
        )
        {
            threaded_object::wait();
            delete f;
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

        base_funct* f;

        // restricted functions
        thread_function(thread_function&);        // copy constructor
        thread_function& operator=(thread_function&);    // assignment operator
    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_THREAD_FUNCTIOn_



