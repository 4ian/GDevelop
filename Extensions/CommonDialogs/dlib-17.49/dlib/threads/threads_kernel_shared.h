// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_THREADS_KERNEl_SHARED_
#define DLIB_THREADS_KERNEl_SHARED_

// this file should be included at the bottom of one of the thread kernel headers for a 
// specific platform.
//#include "../threads.h"
#include "auto_mutex_extension.h"
#include "../binary_search_tree.h"
#include "../member_function_pointer.h"
#include "../memory_manager.h"
#include "../queue.h"
#include "../set.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    namespace threads_kernel_shared
    {
        void thread_starter (
            void*
        );

        class threader
        {
            /*!
                INITIAL VALUE
                    - pool_count == 0 and
                    - data_ready is associated with the mutex data_mutex 
                    - data_empty is associated with the mutex data_mutex
                    - destructed is associated with the mutex data_mutex
                    - destruct == false
                    - total_count == 0
                    - function_pointer == 0

                CONVENTION
                    - data_ready is associated with the mutex data_mutex 
                    - data_empty is associated with the mutex data_mutex 
                    - data_ready == a signaler used signal when there is new data waiting 
                      to start a thread with.
                    - data_empty == a signaler used to signal when the data is now empty 
                    - pool_count == the number of suspended threads in the thread pool 
                    - total_count == the number of threads that are executing anywhere.  i.e.
                      pool_count + the ones that are currently running some user function.
                    - if (function_pointer != 0) then
                        - parameter == a void pointer pointing to the parameter which 
                          should be used to start the next thread 
                        - function_pointer == a pointer to the next function to make a 
                          new thread with

                    - if (the destructor is running) then
                        - destruct == true
                    - else
                        - destruct == false

                    - thread_ids is locked by the data_mutex
                    - thread_ids == a set that contains the thread id for each thread spawned by this
                      object.
            !*/


        public:
            threader (
            );
           
            ~threader (
            );

            void destruct_if_ready (
            );
            /*!
                ensures
                    - if (there are no threads currently running) then
                        - calls delete this
                    - else
                        - does nothing
            !*/

            bool create_new_thread (
                void (*funct)(void*),
                void* param
            );

            template <
                typename T
                >
            void unregister_thread_end_handler (
                T& obj,
                void (T::*handler)()
            )
            {
                member_function_pointer<>::kernel_1a mfp, junk_mfp;
                mfp.set(obj,handler);

                thread_id_type junk_id;

                // find any member function pointers in the registry that point to the same
                // thing as mfp and remove them
                auto_mutex M(reg.m);
                reg.reg.reset();
                while (reg.reg.move_next())
                {
                    while (reg.reg.current_element_valid() && reg.reg.element().value() == mfp)
                    {
                        reg.reg.remove_current_element(junk_id, junk_mfp);
                    }
                }
            }

            template <
                typename T
                >
            void register_thread_end_handler (
                T& obj,
                void (T::*handler)()
            )
            {
                thread_id_type id = get_thread_id();
                member_function_pointer<>::kernel_1a mfp;
                mfp.set(obj,handler);

                auto_mutex M(reg.m);
                reg.reg.add(id,mfp);
            }

            bool is_dlib_thread (
                thread_id_type id
            );

        private:

            friend void thread_starter (
                void*
            );

            void call_end_handlers (
            );
            /*!
                ensures
                    - calls the registered end handlers for the calling thread and
                      then removes them from reg.reg
            !*/


            // private data
            set<thread_id_type,memory_manager<char>::kernel_2b>::kernel_1b_c thread_ids;
            unsigned long total_count;
            void* parameter;
            void (*function_pointer)(void*);
            unsigned long pool_count;
            mutex data_mutex;           // mutex to protect the above data
            signaler data_ready;        // signaler to signal when there is new data
            signaler data_empty;        // signaler to signal when the data is empty
            bool destruct;
            signaler destructed;        // signaler to signal when a thread has ended 

            struct registry_type
            {
                mutex m;
                binary_search_tree<
                    thread_id_type,
                    member_function_pointer<>::kernel_1a,
                    memory_manager<char>::kernel_2a
                    >::kernel_2a_c reg;
            };

            // stuff for the register_thread_end_handler 
            registry_type reg;


            // restricted functions
            threader(threader&);        // copy constructor
            threader& operator=(threader&);    // assignement opertor

        };

    // ------------------------------------------------------------------------------------

        threader& thread_pool (
        ); 
        /*!
            ensures
                - returns a reference to the global threader object
        !*/

    // ------------------------------------------------------------------------------------

        extern bool thread_pool_has_been_destroyed;
    }

    bool is_dlib_thread (
        thread_id_type id 
    );

    bool is_dlib_thread (
    );

// ----------------------------------------------------------------------------------------

    inline bool create_new_thread (
        void (*funct)(void*),
        void* param
    )
    {
        try
        {
            // now make this thread
            return threads_kernel_shared::thread_pool().create_new_thread(funct,param);
        }
        catch (std::bad_alloc&)
        {
            return false;
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    inline void register_thread_end_handler (
        T& obj,
        void (T::*handler)()
    )
    {
        DLIB_ASSERT(is_dlib_thread(),            
               "\tvoid register_thread_end_handler"
            << "\n\tYou can't register a thread end handler for a thread dlib didn't spawn."
            );

        threads_kernel_shared::thread_pool().register_thread_end_handler(obj,handler);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    inline void unregister_thread_end_handler (
        T& obj,
        void (T::*handler)()
    )
    {
        // Check if the thread pool has been destroyed and if it has then don't do anything.
        // This bool here is always true except when the program has started to terminate and
        // the thread pool object has been destroyed.  This if is here to catch other global
        // objects that have destructors that try to call unregister_thread_end_handler().  
        // Without this check we get into trouble if the thread pool is destroyed before these
        // objects.
        if (threads_kernel_shared::thread_pool_has_been_destroyed == false)
            threads_kernel_shared::thread_pool().unregister_thread_end_handler(obj,handler);
    }

// ----------------------------------------------------------------------------------------

}

#ifdef NO_MAKEFILE
#include "threads_kernel_shared.cpp"
#endif

#endif // DLIB_THREADS_KERNEl_SHARED_

