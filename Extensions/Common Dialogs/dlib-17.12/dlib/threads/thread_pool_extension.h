// Copyright (C) 2008  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_THREAD_POOl_H__
#define DLIB_THREAD_POOl_H__ 

#include "thread_pool_extension_abstract.h"
#include "../member_function_pointer.h"
#include "threads_kernel.h"
#include "auto_mutex_extension.h"
#include "multithreaded_object_extension.h"
#include "../uintn.h"
#include "../array.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    class thread_pool : private multithreaded_object
    {
        /*!
            CONVENTION
                - num_threads_in_pool() == tasks.size()
                - if (the destructor has been called) then
                    - we_are_destructing == true
                - else
                    - we_are_destructing == false

                - m == the mutex used to protect everything in this object
                - worker_thread_ids == an array that contains the thread ids for
                  all the threads in the thread pool
        !*/

    public:
        explicit thread_pool (
            unsigned long num_threads
        );

        ~thread_pool(
        );

        void wait_for_task (
            uint64 task_id
        ) const;

        unsigned long num_threads_in_pool (
        ) const;

        void wait_for_all_tasks (
        ) const;

        template <typename T>
        uint64 add_task (
            T& obj,
            void (T::*funct)()
        )
        {
            auto_mutex M(m);
            const thread_id_type my_thread_id = get_thread_id();

            // find a thread that isn't doing anything
            long idx = find_empty_task_slot();
            if (idx == -1 && is_worker_thread(my_thread_id))
            {
                // this function is being called from within a worker thread and there
                // aren't any other worker threads free so just perform the task right
                // here

                m.unlock();
                (obj.*funct)();

                // return a task id that is both non-zero and also one
                // that is never normally returned.  This way calls
                // to wait_for_task() will never block given this id.
                return 1;
            }

            // wait until there is a thread that isn't doing anything
            while (idx == -1)
            {
                task_done_signaler.wait();
                idx = find_empty_task_slot();
            }

            tasks[idx].thread_id = my_thread_id;
            tasks[idx].task_id = make_next_task_id(idx);
            tasks[idx].mfp0.set(obj,funct);

            task_ready_signaler.signal();

            return tasks[idx].task_id;
        }

        template <typename T>
        uint64 add_task (
            T& obj,
            void (T::*funct)(long),
            long arg1
        )
        {
            auto_mutex M(m);
            const thread_id_type my_thread_id = get_thread_id();

            // find a thread that isn't doing anything
            long idx = find_empty_task_slot();
            if (idx == -1 && is_worker_thread(my_thread_id))
            {
                // this function is being called from within a worker thread and there
                // aren't any other worker threads free so just perform the task right
                // here

                m.unlock();
                (obj.*funct)(arg1);

                // return a task id that is both non-zero and also one
                // that is never normally returned.  This way calls
                // to wait_for_task() will never block given this id.
                return 1;
            }

            // wait until there is a thread that isn't doing anything
            while (idx == -1)
            {
                task_done_signaler.wait();
                idx = find_empty_task_slot();
            }

            tasks[idx].thread_id = my_thread_id;
            tasks[idx].task_id = make_next_task_id(idx);
            tasks[idx].mfp1.set(obj,funct);
            tasks[idx].arg1 = arg1;

            task_ready_signaler.signal();

            return tasks[idx].task_id;
        }

        template <typename T>
        uint64 add_task (
            T& obj,
            void (T::*funct)(long,long),
            long arg1,
            long arg2
        )
        {
            auto_mutex M(m);
            const thread_id_type my_thread_id = get_thread_id();

            // find a thread that isn't doing anything
            long idx = find_empty_task_slot();
            if (idx == -1 && is_worker_thread(my_thread_id))
            {
                // this function is being called from within a worker thread and there
                // aren't any other worker threads free so just perform the task right
                // here

                m.unlock();
                (obj.*funct)(arg1, arg2);

                // return a task id that is both non-zero and also one
                // that is never normally returned.  This way calls
                // to wait_for_task() will never block given this id.
                return 1;
            }

            // wait until there is a thread that isn't doing anything
            while (idx == -1)
            {
                task_done_signaler.wait();
                idx = find_empty_task_slot();
            }

            tasks[idx].thread_id = my_thread_id;
            tasks[idx].task_id = make_next_task_id(idx);
            tasks[idx].mfp2.set(obj,funct);
            tasks[idx].arg1 = arg1;
            tasks[idx].arg2 = arg2;

            task_ready_signaler.signal();

            return tasks[idx].task_id;
        }

    private:

        bool is_worker_thread (
            const thread_id_type id
        ) const;
        /*!
            requires
                - m is locked
            ensures
                - if (thread with given id is one of the thread pool's worker threads) then
                    - returns true
                - else
                    - returns false
        !*/

        void thread (
        );
        /*!
            this is the function that executes the threads in the thread pool
        !*/

        long find_empty_task_slot (
        ) const;
        /*!
            requires
                - m is locked
            ensures
                - if (there is currently a empty task slot) then
                    - returns the index of that task slot in tasks
                    - there is a task slot
                - else
                    - returns -1
        !*/

        long find_ready_task (
        ) const;
        /*!
            requires
                - m is locked
            ensures
                - if (there is currently a task to do) then
                    - returns the index of that task in tasks
                - else
                    - returns -1
        !*/

        uint64 make_next_task_id (
            long idx
        );
        /*!
            requires
                - m is locked
                - 0 <= idx < tasks.size()
            ensures
                - returns the next index to be used for tasks that are placed in
                  tasks[idx]
        !*/

        unsigned long task_id_to_index (
            uint64 id
        ) const;
        /*!
            requires
                - m is locked
            ensures
                - returns the index in tasks corresponding to the given id
        !*/

        struct task_state_type
        {
            task_state_type() : is_being_processed(false), task_id(0), next_task_id(2), arg1(0), arg2(0) {}

            bool is_ready () const 
            /*!
                ensures
                    - if (is_empty() == false && no thread is currently processing this task) then
                        - returns true
                    - else
                        - returns false
            !*/
            {
                return !is_being_processed && !is_empty();
            }

            bool is_empty () const
            /*!
                ensures
                    - if (this task state is empty.  i.e. it doesn't contain a task to be processed) then
                        - returns true
                    - else 
                        - returns false
            !*/
            {
                return task_id == 0;
            }

            bool is_being_processed;  // true when a thread is working on this task 
            uint64 task_id; // the id of this task.  0 means this task is empty
            thread_id_type thread_id; // the id of the thread that requested this task 

            uint64 next_task_id;

            long arg1;
            long arg2;

            member_function_pointer<>::kernel_1a_c mfp0;
            member_function_pointer<long>::kernel_1a_c mfp1;
            member_function_pointer<long,long>::kernel_1a_c mfp2;

        };

        array<task_state_type>::expand_1c_c tasks;
        array<thread_id_type>::expand_1c_c worker_thread_ids;

        mutex m;
        signaler task_done_signaler;
        signaler task_ready_signaler;
        bool we_are_destructing;

        // restricted functions
        thread_pool(thread_pool&);        // copy constructor
        thread_pool& operator=(thread_pool&);    // assignment operator

    };

}

// ----------------------------------------------------------------------------------------

#ifdef NO_MAKEFILE
#include "thread_pool_extension.cpp"
#endif

#endif // DLIB_THREAD_POOl_H__









