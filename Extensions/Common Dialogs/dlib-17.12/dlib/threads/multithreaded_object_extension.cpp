// Copyright (C) 2007  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_MULTITHREADED_OBJECT_EXTENSIOn_CPP
#define DLIB_MULTITHREADED_OBJECT_EXTENSIOn_CPP

#include "multithreaded_object_extension.h"


namespace dlib
{

// ----------------------------------------------------------------------------------------

    multithreaded_object::
    multithreaded_object (
    ):
        s(m_),
        is_running_(false),
        should_stop_(false),
        threads_started(0)
    {
    }

// ----------------------------------------------------------------------------------------

    multithreaded_object::
    ~multithreaded_object (
    )
    {
        DLIB_ASSERT(number_of_threads_alive() == 0,
               "\tmultithreaded_object::~multithreaded_object()"
               << "\n\tYou have let a multithreaded object destruct itself before terminating its threads"
               << "\n\tthis: " << this
        );
    }

// ----------------------------------------------------------------------------------------

    void multithreaded_object::
    clear (
    )
    {
        auto_mutex M(m_);
        stop();
        wait();
        dead_threads.clear();
        is_running_ = false;
        should_stop_ = false;
    }

// ----------------------------------------------------------------------------------------

    bool multithreaded_object::
    is_running (
    ) const 
    {
        auto_mutex M(m_);
        return is_running_;
    }

// ----------------------------------------------------------------------------------------

    unsigned long multithreaded_object::
    number_of_threads_registered (
    ) const
    {
        auto_mutex M(m_);
        return thread_ids.size() + dead_threads.size();
    }

// ----------------------------------------------------------------------------------------

    unsigned long multithreaded_object::
    number_of_threads_alive (
    ) const
    {
        auto_mutex M(m_);
        return threads_started;
    }

// ----------------------------------------------------------------------------------------

    void multithreaded_object::
    wait (
    ) const
    {
        auto_mutex M(m_);

        DLIB_ASSERT(thread_ids.is_in_domain(get_thread_id()) == false,
               "\tvoid multithreaded_object::wait()"
               << "\n\tYou can NOT call this function from one of the threads registered in this object"
               << "\n\tthis: " << this
        );

        while (threads_started > 0)
            s.wait();
    }

// ----------------------------------------------------------------------------------------

    void multithreaded_object::
    start (
    )
    {
        auto_mutex M(m_);
        const unsigned long num_threads_registered = dead_threads.size() + thread_ids.size();
        // start any dead threads
        for (unsigned long i = threads_started; i < num_threads_registered; ++i)
        {
            if (create_new_thread<multithreaded_object,&multithreaded_object::thread_helper>(*this) == false)
            {
                should_stop_ = true;
                is_running_ = false;
                throw thread_error();
            }
            ++threads_started;
        }
        is_running_ = true;
        should_stop_ = false;
        s.broadcast();
    }

// ----------------------------------------------------------------------------------------

    void multithreaded_object::
    pause (
    )
    {
        auto_mutex M(m_);
        is_running_ = false;
    }

// ----------------------------------------------------------------------------------------

    void multithreaded_object::
    stop (
    )
    {
        auto_mutex M(m_);
        should_stop_ = true;
        is_running_ = false;
        s.broadcast();
    }

// ----------------------------------------------------------------------------------------

    bool multithreaded_object::
    should_stop (
    ) const
    {
        auto_mutex M(m_);
        DLIB_ASSERT(thread_ids.is_in_domain(get_thread_id()),
               "\tbool multithreaded_object::should_stop()"
               << "\n\tYou can only call this function from one of the registered threads in this object"
               << "\n\tthis: " << this
        );
        while (is_running_ == false && should_stop_ == false)
            s.wait();
        return should_stop_;
    }

// ----------------------------------------------------------------------------------------

    void multithreaded_object::
    thread_helper(
    )
    {
        mfp mf;
        const thread_id_type id = get_thread_id();

        try
        {
            // if there is a dead_thread sitting around then pull it
            // out and put it into mf
            {
                auto_mutex M(m_);
                if (dead_threads.size() > 0)
                {
                    dead_threads.dequeue(mf);
                    mfp temp;
                    thread_id_type id_temp = id;
                    temp = mf;
                    thread_ids.add(id_temp,temp);
                }
            }

            if (mf.is_set())
            {
                // call the registered thread function
                mf();

                auto_mutex M(m_);
                if (thread_ids.is_in_domain(id))
                {
                    mfp temp;
                    thread_id_type id_temp;
                    thread_ids.remove(id,id_temp,temp);

                }

                // put this thread's registered function back into the dead_threads queue
                dead_threads.enqueue(mf);
            }

            auto_mutex M(m_);
            --threads_started;
            // If this is the last thread to terminate then
            // signal that that is the case.
            if (threads_started == 0)
            {
                is_running_ = false;
                should_stop_ = false;
                s.broadcast();
            }
        }
        catch (...)
        {
            auto_mutex M(m_);
            if (thread_ids.is_in_domain(id))
            {
                mfp temp;
                thread_id_type id_temp;
                thread_ids.remove(id,id_temp,temp);
            }

            --threads_started;
            // If this is the last thread to terminate then
            // signal that that is the case.
            if (threads_started == 0)
            {
                is_running_ = false;
                should_stop_ = false;
                s.broadcast();
            }
            throw;
        }
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_MULTITHREADED_OBJECT_EXTENSIOn_CPP


