// Copyright (C) 2008  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_THREAD_POOl_CPP__
#define DLIB_THREAD_POOl_CPP__ 

#include "thread_pool_extension.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    thread_pool::
    thread_pool (
        unsigned long num_threads
    ) : 
        task_done_signaler(m),
        task_ready_signaler(m),
        we_are_destructing(false)
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(num_threads > 0,
            "\tthread_pool::thread_pool()"
            << "\n\tthe number of threads in a thread_pool can't be zero"
            << "\n\tthis: " << this
            );

        tasks.expand(num_threads);
        for (unsigned long i = 0; i < num_threads; ++i)
        {
            register_thread(*this, &thread_pool::thread);
        }

        start();
    }

// ----------------------------------------------------------------------------------------

    thread_pool::
    ~thread_pool()
    {
        {auto_mutex M(m);
            we_are_destructing = true;
            task_ready_signaler.broadcast();
        }

        wait();
    }

// ----------------------------------------------------------------------------------------

    unsigned long thread_pool::
    num_threads_in_pool (
    ) const
    {
        return tasks.size();
    }

// ----------------------------------------------------------------------------------------

    void thread_pool::
    wait_for_task (
        uint64 task_id
    ) const
    {
        auto_mutex M(m);
        const unsigned long idx = task_id_to_index(task_id);
        while (tasks[idx].task_id == task_id)
            task_done_signaler.wait();
    }

// ----------------------------------------------------------------------------------------

    void thread_pool::
    wait_for_all_tasks (
    ) const
    {
        const thread_id_type thread_id = get_thread_id();

        auto_mutex M(m);
        bool found_task = true;
        while (found_task)
        {
            found_task = false;
            for (unsigned long i = 0; i < tasks.size(); ++i)
            {
                // If task bucket i has a task that is currently supposed to be processed
                // and it originated from the calling thread
                if (tasks[i].is_empty() == false && tasks[i].thread_id == thread_id)
                {
                    found_task = true;
                    break;
                }
            }

            if (found_task)
                task_done_signaler.wait();
        }
    }

// ----------------------------------------------------------------------------------------

    bool thread_pool::
    is_worker_thread (
        const thread_id_type id
    ) const
    {
        for (unsigned long i = 0; i < worker_thread_ids.size(); ++i)
        {
            if (worker_thread_ids[i] == id)
                return true;
        }
        return false;
    }

// ----------------------------------------------------------------------------------------

    void thread_pool::
    thread (
    )
    {
        {
            // save the id of this worker thread into worker_thread_ids
            auto_mutex M(m);
            thread_id_type id = get_thread_id();
            worker_thread_ids.push_back(id);
        }

        task_state_type task;
        while (we_are_destructing == false)
        {
            long idx = 0;

            // wait for a task to do 
            { auto_mutex M(m);
                while ( (idx = find_ready_task()) == -1 && we_are_destructing == false)
                    task_ready_signaler.wait();

                if (we_are_destructing)
                    break;

                tasks[idx].is_being_processed = true;
                task = tasks[idx];
            }

            // now do the task
            if (task.mfp0)
                task.mfp0();
            else if (task.mfp1)
                task.mfp1(task.arg1);
            else if (task.mfp2)
                task.mfp2(task.arg1, task.arg2);

            // Now let others know that we finished the task.  We do this
            // by clearing out the state of this task
            { auto_mutex M(m);
                tasks[idx].is_being_processed = false;
                tasks[idx].task_id = 0;
                tasks[idx].mfp0.clear();
                tasks[idx].mfp1.clear();
                tasks[idx].mfp2.clear();
                tasks[idx].arg1 = 0;
                tasks[idx].arg2 = 0;
                task_done_signaler.broadcast();
            }

        }
    }

// ----------------------------------------------------------------------------------------

    long thread_pool::
    find_empty_task_slot (
    ) const
    {
        for (unsigned long i = 0; i < tasks.size(); ++i)
        {
            if (tasks[i].is_empty())
                return i;
        }

        return -1;
    }

// ----------------------------------------------------------------------------------------

    long thread_pool::
    find_ready_task (
    ) const
    {
        for (unsigned long i = 0; i < tasks.size(); ++i)
        {
            if (tasks[i].is_ready())
                return i;
        }

        return -1;
    }

// ----------------------------------------------------------------------------------------

    uint64 thread_pool::
    make_next_task_id (
        long idx
    )
    {
        uint64 id = tasks[idx].next_task_id * tasks.size() + idx;
        tasks[idx].next_task_id += 1;
        return id;
    }

// ----------------------------------------------------------------------------------------

    unsigned long thread_pool::
    task_id_to_index (
        uint64 id
    ) const
    {
        return static_cast<unsigned long>(id%tasks.size());
    }

// ----------------------------------------------------------------------------------------

}


#endif // DLIB_THREAD_POOl_CPP__








