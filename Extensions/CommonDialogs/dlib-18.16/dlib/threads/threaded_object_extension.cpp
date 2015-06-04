// Copyright (C) 2007  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_THREADED_OBJECT_EXTENSIOn_CPP
#define DLIB_THREADED_OBJECT_EXTENSIOn_CPP

#include "threaded_object_extension.h"
#include "create_new_thread_extension.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    threaded_object::
    threaded_object (
    ):
        s(m_),
        id1(0),
        is_running_(false),
        is_alive_(false),
        should_stop_(false),
        id_valid(false)
    {
    }

// ----------------------------------------------------------------------------------------

    threaded_object::
    ~threaded_object (
    )
    {
        DLIB_ASSERT(is_alive() == false,
               "\tthreaded_object::~threaded_object()"
               << "\n\tYou have let a threaded object destruct itself before terminating its thread"
               << "\n\tthis: " << this
        );
    }

// ----------------------------------------------------------------------------------------

    bool threaded_object::
    is_running (
    ) const 
    {
        auto_mutex M(m_);

        DLIB_ASSERT(id1 != get_thread_id() || id_valid == false,
               "\tbool threaded_object::is_running()"
               << "\n\tYou can NOT call this function from the thread that executes threaded_object::thread"
               << "\n\tthis: " << this
        );

        return is_running_;
    }

// ----------------------------------------------------------------------------------------

    bool threaded_object::
    is_alive (
    ) const
    {
        auto_mutex M(m_);

        DLIB_ASSERT(id1 != get_thread_id() || id_valid == false,
               "\tbool threaded_object::is_alive()"
               << "\n\tYou can NOT call this function from the thread that executes threaded_object::thread"
               << "\n\tthis: " << this
        );

        return is_alive_;
    }

// ----------------------------------------------------------------------------------------

    void threaded_object::
    wait (
    ) const
    {
        auto_mutex M(m_);

        DLIB_ASSERT(id1 != get_thread_id() || id_valid == false,
               "\tvoid threaded_object::wait()"
               << "\n\tYou can NOT call this function from the thread that executes threaded_object::thread"
               << "\n\tthis: " << this
        );

        while (is_alive_)
            s.wait();
    }

// ----------------------------------------------------------------------------------------

    void threaded_object::
    start (
    )
    {
        auto_mutex M(m_);

        DLIB_ASSERT(id1 != get_thread_id() || id_valid == false,
               "\tvoid threaded_object::start()"
               << "\n\tYou can NOT call this function from the thread that executes threaded_object::thread"
               << "\n\tthis: " << this
        );

        if (is_alive_ == false)
        {
            if (create_new_thread<threaded_object,&threaded_object::thread_helper>(*this) == false)
            {
                is_running_ = false;
                throw thread_error();
            }
        }
        is_alive_ = true;
        is_running_ = true;
        should_stop_ = false;
        s.broadcast();
    }

// ----------------------------------------------------------------------------------------

    void threaded_object::
    restart (
    )
    {
        auto_mutex M(m_);

        DLIB_ASSERT(id1 != get_thread_id() || id_valid == false,
               "\tvoid threaded_object::restart()"
               << "\n\tYou can NOT call this function from the thread that executes threaded_object::thread"
               << "\n\tthis: " << this
        );

        if (is_alive_ == false)
        {
            if (create_new_thread<threaded_object,&threaded_object::thread_helper>(*this) == false)
            {
                is_running_ = false;
                throw thread_error();
            }
            should_respawn_ = false;
        }
        else
        {
            should_respawn_ = true;
        }
        is_alive_ = true;
        is_running_ = true;
        should_stop_ = false;
        s.broadcast();
    }

// ----------------------------------------------------------------------------------------

    void threaded_object::
    set_respawn (
    )
    {
        auto_mutex M(m_);

        DLIB_ASSERT(id1 != get_thread_id() || id_valid == false,
               "\tvoid threaded_object::set_respawn()"
               << "\n\tYou can NOT call this function from the thread that executes threaded_object::thread"
               << "\n\tthis: " << this
        );

        should_respawn_ = true;
    }

// ----------------------------------------------------------------------------------------

    bool threaded_object::
    should_respawn (
    ) const
    {
        auto_mutex M(m_);

        DLIB_ASSERT(id1 != get_thread_id() || id_valid == false,
               "\tbool threaded_object::should_respawn()"
               << "\n\tYou can NOT call this function from the thread that executes threaded_object::thread"
               << "\n\tthis: " << this
        );

        return should_respawn_;
    }

// ----------------------------------------------------------------------------------------

    void threaded_object::
    pause (
    )
    {
        auto_mutex M(m_);

        DLIB_ASSERT(id1 != get_thread_id() || id_valid == false,
               "\tvoid threaded_object::pause()"
               << "\n\tYou can NOT call this function from the thread that executes threaded_object::thread"
               << "\n\tthis: " << this
        );

        is_running_ = false;
    }

// ----------------------------------------------------------------------------------------

    void threaded_object::
    stop (
    )
    {
        auto_mutex M(m_);

        DLIB_ASSERT(id1 != get_thread_id() || id_valid == false,
               "\tvoid threaded_object::stop()"
               << "\n\tYou can NOT call this function from the thread that executes threaded_object::thread"
               << "\n\tthis: " << this
        );

        should_stop_ = true;
        is_running_ = false;
        should_respawn_ = false;
        s.broadcast();
    }

// ----------------------------------------------------------------------------------------

    bool threaded_object::
    should_stop (
    ) const
    {
        auto_mutex M(m_);
        DLIB_ASSERT(is_alive_ && id1 == get_thread_id() && id_valid == true,
               "\tbool threaded_object::should_stop()"
               << "\n\tYou can only call this function from the thread that executes threaded_object::thread"
               << "\n\tthis: " << this
        );
        while (is_running_ == false && should_stop_ == false)
            s.wait();
        return should_stop_;
    }

// ----------------------------------------------------------------------------------------

    void threaded_object::
    thread_helper(
    )
    {
#ifdef ENABLE_ASSERTS
        id1 = get_thread_id();
        id_valid = true;
#endif
        while (true)
        {
            m_.lock();
            should_respawn_ = false;
            m_.unlock();

            thread();

            auto_mutex M(m_);

            if (should_respawn_)
                continue;

#ifdef ENABLE_ASSERTS
            id_valid = false;
#endif

            is_alive_ = false;
            is_running_ = false;
            should_stop_ = false;
            s.broadcast();

            return;
        }
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_THREADED_OBJECT_EXTENSIOn_CPP

