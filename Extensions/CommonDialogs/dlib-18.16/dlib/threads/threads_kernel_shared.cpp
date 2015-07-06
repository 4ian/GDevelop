// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_THREADS_KERNEL_SHARED_CPp_
#define DLIB_THREADS_KERNEL_SHARED_CPp_

#include "threads_kernel_shared.h"
#include "../assert.h"
#include "../platform.h"
#include <iostream>

// The point of this block of code is to cause a link time error that will prevent a user
// from compiling part of their application with DLIB_ASSERT enabled and part with them
// disabled since doing that would be a violation of C++'s one definition rule. 
extern "C"
{
#ifdef ENABLE_ASSERTS
    int USER_ERROR__missing_dlib_all_source_cpp_file__OR__inconsistent_use_of_DEBUG_or_ENABLE_ASSERTS_preprocessor_directives;
#else
    int USER_ERROR__missing_dlib_all_source_cpp_file__OR__inconsistent_use_of_DEBUG_or_ENABLE_ASSERTS_preprocessor_directives_;
#endif
}

#ifndef DLIB_THREAD_POOL_TIMEOUT
// default to 30000 milliseconds
#define DLIB_THREAD_POOL_TIMEOUT 30000
#endif

namespace dlib
{

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// threader functions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    namespace threads_kernel_shared 
    {

        bool thread_pool_has_been_destroyed = false;

// ----------------------------------------------------------------------------------------

        threader& thread_pool (
        ) 
        {
            static threader* thread_pool = new threader;
            return *thread_pool;
        }

// ----------------------------------------------------------------------------------------

        struct threader_destruct_helper
        {
            // cause the thread pool to begin its destruction process when 
            // global objects start to be destroyed
            ~threader_destruct_helper()
            {
                thread_pool().destruct_if_ready();
            }
        };
        static threader_destruct_helper a;

// ----------------------------------------------------------------------------------------

        bool threader::
        is_dlib_thread (
            thread_id_type id
        )
        {
            auto_mutex M(data_mutex);
            return thread_ids.is_member(id);
        }

// ----------------------------------------------------------------------------------------

        threader::
        threader (
        ) :
            total_count(0),
            function_pointer(0),
            pool_count(0),
            data_ready(data_mutex),
            data_empty(data_mutex),
            destruct(false),
            destructed(data_mutex),
            do_not_ever_destruct(false)
        {
#ifdef WIN32
            // Trying to destroy the global thread pool when we are part of a DLL and the
            // DLL is being unloaded can sometimes lead to weird behavior.  For example, in
            // the python interpreter you will get the interpreter to hang.  Or if we are
            // part of a MATLAB mex file and the file is being unloaded there can also be
            // similar weird issues.  So when we are using dlib on windows we just disable
            // the destruction of the global thread pool since it doesn't matter anyway.
            // It's resources will just get freed by the OS.  This is even the recommended
            // thing to do by Microsoft (http://blogs.msdn.com/b/oldnewthing/archive/2012/01/05/10253268.aspx).
            // 
            // As an aside, it's worth pointing out that the reason we try and free
            // resources on program shutdown on other operating systems is so we can have
            // clean reports from tools like valgrind which check for memory leaks.  But
            // trying to do this on windows is a lost cause so we give up in this case and
            // follow the Microsoft recommendation.
            do_not_ever_destruct = true;
#endif // WIN32
        }

// ----------------------------------------------------------------------------------------

        threader::
        ~threader (
        )
        { 
            data_mutex.lock();
            destruct = true;
            data_ready.broadcast();

            // wait for all the threads to end
            while (total_count > 0)
                destructed.wait();

            thread_pool_has_been_destroyed = true;
            data_mutex.unlock();
        }

// ----------------------------------------------------------------------------------------

        void threader::
        destruct_if_ready (
        )
        {
            if (do_not_ever_destruct)
                return;

            data_mutex.lock();

            // if there aren't any active threads, just maybe some sitting around
            // in the pool then just destroy the threader
            if (total_count == pool_count)
            {
                destruct = true;
                data_ready.broadcast();
                data_mutex.unlock();
                delete this;
            }
            else
            {
                // There are still some user threads running so there isn't
                // much we can really do.  Just let the program end without
                // cleaning up threading resources.  
                data_mutex.unlock();
            }
        }

// ----------------------------------------------------------------------------------------

        void threader::
        call_end_handlers (
        )
        {
            reg.m.lock();
            const thread_id_type id = get_thread_id();
            thread_id_type id_copy;
            member_function_pointer<> mfp;

            // Remove all the member function pointers for this thread from the tree 
            // and call them.
            while (reg.reg[id] != 0)
            {
                reg.reg.remove(id,id_copy,mfp);
                reg.m.unlock();
                mfp();
                reg.m.lock();
            }
            reg.m.unlock();
        }

    // ------------------------------------------------------------------------------------

        bool threader::
        create_new_thread (
            void (*funct)(void*),
            void* param
        )
        {

            // get a lock on the data mutex
            auto_mutex M(data_mutex);

            // loop to ensure that the new function pointer is in the data
            while (true)
            {
                // if the data is empty then add new data and quit loop
                if (function_pointer == 0)
                {
                    parameter = param;
                    function_pointer = funct;
                    break;
                }
                else
                {
                    // wait for data to become empty
                    data_empty.wait();
                }
            }


            // get a thread for this new data
            // if a new thread must be created
            if (pool_count == 0)
            {
                // make thread and add it to the pool
                if ( threads_kernel_shared_helpers::spawn_thread(thread_starter, this) == false )
                {
                    function_pointer = 0;
                    parameter = 0;
                    data_empty.signal();
                    return false;
                }
                ++total_count;
            }
            // wake up a thread from the pool
            else
            {
                data_ready.signal();
            }

            return true;
        }

    // ------------------------------------------------------------------------------------

        void thread_starter (
            void* object
        )
        {
            // get a reference to the calling threader object
            threader& self = *static_cast<threader*>(object);


            {
            auto_mutex M(self.data_mutex);

            // add this thread id
            thread_id_type thread_id = get_thread_id();
            self.thread_ids.add(thread_id);

            // indicate that this thread is now in the thread pool
            ++self.pool_count;

            while (self.destruct == false)
            {
                // if data is ready then process it and launch the thread
                // if its not ready then go back into the pool
                while (self.function_pointer != 0)
                {                
                    // indicate that this thread is now out of the thread pool
                    --self.pool_count;

                    // get the data for the function call
                    void (*funct)(void*) = self.function_pointer;
                    void* param = self.parameter;
                    self.function_pointer = 0;

                    // signal that the data is now empty
                    self.data_empty.signal();

                    self.data_mutex.unlock();
                    // Call funct with its intended parameter.  If this function throws then
                    // we intentionally let the exception escape the thread and result in whatever
                    // happens when it gets caught by the OS (generally the program is terminated).
                    funct(param);
                    self.call_end_handlers();

                    self.data_mutex.lock();

                    // indicate that this thread is now back in the thread pool
                    ++self.pool_count;
                }

                if (self.destruct == true)
                    break;

                // if we timed out and there isn't any work to do then
                // this thread will quit this loop and end.
                if (self.data_ready.wait_or_timeout(DLIB_THREAD_POOL_TIMEOUT) == false && 
                    self.function_pointer == 0)
                    break;

            }

            // remove this thread id from thread_ids
            thread_id = get_thread_id();
            self.thread_ids.destroy(thread_id);

            // indicate that this thread is now out of the thread pool
            --self.pool_count;
            --self.total_count;

            self.destructed.signal();

            } // end of auto_mutex M(self.data_mutex) block
        }

    // ------------------------------------------------------------------------------------

    }

// ----------------------------------------------------------------------------------------

    bool is_dlib_thread (
        thread_id_type id
    )
    {
        return threads_kernel_shared::thread_pool().is_dlib_thread(id);
    }

    bool is_dlib_thread (
    )
    {
        return is_dlib_thread(get_thread_id());
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_THREADS_KERNEL_SHARED_CPp_

