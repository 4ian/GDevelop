// Copyright (C) 2008  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_THREAD_POOl_ABSTRACT_H__
#ifdef DLIB_THREAD_POOl_ABSTRACT_H__ 

#include "threads_kernel_abstract.h"
#include "../uintn.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    class thread_pool 
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object represents a fixed size group of threads which you can
                submit tasks to and then wait for those tasks to be completed. 
        !*/

    public:
        explicit thread_pool (
            unsigned long num_threads
        );
        /*!
            requires
                - num_threads > 0
            ensures
                - num_threads_in_pool() == num_threads
            throws
                - std::bad_alloc
                - dlib::thread_error
                    the constructor may throw this exception if there is a problem 
                    gathering resources to create threading objects.
        !*/

        ~thread_pool(
        );
        /*!
            ensures
                - all resources allocated by *this have been freed.  
        !*/

        unsigned long num_threads_in_pool (
        ) const;
        /*!
            ensures
                - returns the number of threads contained in this thread pool.  That is, returns
                  the maximum number of tasks that this object will process concurrently.
        !*/

        template <typename T>
        uint64 add_task (
            T& obj,
            void (T::*funct)()
        );
        /*!
            requires
                - funct == a valid member function pointer for class T
            ensures
                - if (the thread calling this function is actually one of the threads in the
                  thread pool and there aren't any free threads available) then
                    - calls (obj.*funct)() within the calling thread and returns
                      when it finishes
                - else
                    - the call to this function blocks until there is a free thread in the pool
                      to process this new task.  Once a free thread is available the task
                      is handed off to that thread which then calls (obj.funct)()
                - returns a task id that can be used by this->wait_for_task() to wait
                  for the submitted task to finish.
        !*/

        template <typename T>
        uint64 add_task (
            T& obj,
            void (T::*funct)(long),
            long arg1
        );
        /*!
            requires
                - funct == a valid member function pointer for class T
            ensures
                - if (the thread calling this function is actually one of the threads in the
                  thread pool and there aren't any free threads available) then
                    - calls (obj.*funct)(arg1) within the calling thread and returns
                      when it finishes
                - else
                    - the call to this function blocks until there is a free thread in the pool
                      to process this new task.  Once a free thread is available the task
                      is handed off to that thread which then calls (obj.funct)(arg1)
                - returns a task id that can be used by this->wait_for_task() to wait
                  for the submitted task to finish.
        !*/

        template <typename T>
        uint64 add_task (
            T& obj,
            void (T::*funct)(long,long),
            long arg1,
            long arg2
        );
        /*!
            requires
                - funct == a valid member function pointer for class T
            ensures
                - if (the thread calling this function is actually one of the threads in the
                  thread pool and there aren't any free threads available) then
                    - calls (obj.*funct)(arg1,arg2) within the calling thread and returns
                      when it finishes
                - else
                    - the call to this function blocks until there is a free thread in the pool
                      to process this new task.  Once a free thread is available the task
                      is handed off to that thread which then calls (obj.funct)(arg1,arg2)
                - returns a task id that can be used by this->wait_for_task() to wait
                  for the submitted task to finish.
        !*/

        void wait_for_task (
            uint64 task_id
        ) const;
        /*!
            ensures
                - if (there is currently a task with the given id being executed in the thread pool) then
                    - the call to this function blocks until the task with the given id is complete
                - else
                    - the call to this function returns immediately
        !*/

        void wait_for_all_tasks (
        ) const;
        /*!
            ensures
                - the call to this function blocks until all tasks which were submitted
                  to the thread pool by the thread that is calling this function have 
                  finished.
        !*/

    private:

        // restricted functions
        thread_pool(thread_pool&);        // copy constructor
        thread_pool& operator=(thread_pool&);    // assignment operator
    };

}

// ----------------------------------------------------------------------------------------

#endif // DLIB_THREAD_POOl_ABSTRACT_H__










