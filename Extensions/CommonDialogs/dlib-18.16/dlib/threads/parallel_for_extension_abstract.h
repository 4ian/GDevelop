// Copyright (C) 2013  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_PARALLEL_FoR_ABSTRACT_Hh_
#ifdef DLIB_PARALLEL_FoR_ABSTRACT_Hh_ 

#include "thread_pool_extension_abstract.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <typename T>
    void parallel_for_blocked (
        thread_pool& tp,
        long begin,
        long end,
        T& obj,
        void (T::*funct)(long, long),
        long chunks_per_thread = 8
    );
    /*!
        requires
            - begin <= end
            - chunks_per_thread > 0
            - funct does not throw any exceptions
        ensures
            - This is a convenience function for submitting a block of jobs to a thread_pool.  
              In particular, given the half open range [begin, end), this function will
              split the range into approximately tp.num_threads_in_pool()*chunks_per_thread
              blocks, which it will then submit to the thread_pool.  The given thread_pool
              will then call (obj.*funct)() on each of the subranges.
            - To be precise, suppose we have broken the range [begin, end) into the
              following subranges:
                - [begin[0], end[0])
                - [begin[1], end[1])
                - [begin[2], end[2])
                  ...
                - [begin[n], end[n])
              Then parallel_for_blocked() submits each of these subranges to tp for
              processing such that (obj.*funct)(begin[i], end[i]) is invoked for all valid
              values of i.  Moreover, the subranges are non-overlapping and completely
              cover the total range of [begin, end).
            - This function will not perform any memory allocations or create any system
              resources such as mutex objects.
    !*/

// ----------------------------------------------------------------------------------------

    template <typename T>
    void parallel_for_blocked (
        unsigned long num_threads,
        long begin,
        long end,
        T& obj,
        void (T::*funct)(long, long),
        long chunks_per_thread = 8
    );
    /*!
        requires
            - begin <= end
            - chunks_per_thread > 0
            - funct does not throw any exceptions
        ensures
            - This function is equivalent to the following block of code:
                thread_pool tp(num_threads);
                parallel_for_blocked(tp, begin, end, obj, funct, chunks_per_thread);
    !*/

// ----------------------------------------------------------------------------------------

    template <typename T>
    void parallel_for_blocked (
        thread_pool& tp,
        long begin,
        long end,
        const T& funct,
        long chunks_per_thread = 8
    );
    /*!
        requires
            - chunks_per_thread > 0
            - begin <= end
            - funct does not throw any exceptions
        ensures
            - This is a convenience function for submitting a block of jobs to a
              thread_pool.  In particular, given the range [begin, end), this function will
              split the range into approximately tp.num_threads_in_pool()*chunks_per_thread
              blocks, which it will then submit to the thread_pool.  The given thread_pool
              will then call funct() on each of the subranges.
            - To be precise, suppose we have broken the range [begin, end) into the
              following subranges:
                - [begin[0], end[0])
                - [begin[1], end[1])
                - [begin[2], end[2])
                  ...
                - [begin[n], end[n])
              Then parallel_for_blocked() submits each of these subranges to tp for
              processing such that funct(begin[i], end[i]) is invoked for all valid values
              of i.
            - This function will not perform any memory allocations or create any system
              resources such as mutex objects.
    !*/

// ----------------------------------------------------------------------------------------

    template <typename T>
    void parallel_for_blocked (
        unsigned long num_threads,
        long begin,
        long end,
        const T& funct,
        long chunks_per_thread = 8
    );
    /*!
        requires
            - begin <= end
            - chunks_per_thread > 0
            - funct does not throw any exceptions
        ensures
            - This function is equivalent to the following block of code:
                thread_pool tp(num_threads);
                parallel_for_blocked(tp, begin, end, funct, chunks_per_thread);
    !*/

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <typename T>
    void parallel_for (
        thread_pool& tp,
        long begin,
        long end,
        T& obj,
        void (T::*funct)(long),
        long chunks_per_thread = 8
    );
    /*!
        requires
            - begin <= end
            - chunks_per_thread > 0
            - funct does not throw any exceptions
        ensures
            - This function is equivalent to the following function call:
              parallel_for_blocked(tp, begin, end, [&](long begin_sub, long end_sub) 
                {
                  for (long i = begin_sub; i < end_sub; ++i)
                      (obj.*funct)(i);  
                }, chunks_per_thread);
            - Therefore, this routine invokes (obj.*funct)(i) for all i in the range
              [begin, end).  However, it does so using tp.num_threads_in_pool() parallel
              threads.
            - This function will not perform any memory allocations or create any system
              resources such as mutex objects.
    !*/

// ----------------------------------------------------------------------------------------

    template <typename T>
    void parallel_for (
        unsigned long num_threads,
        long begin,
        long end,
        T& obj,
        void (T::*funct)(long),
        long chunks_per_thread = 8
    );
    /*!
        requires
            - begin <= end
            - chunks_per_thread > 0
            - funct does not throw any exceptions
        ensures
            - This function is equivalent to the following block of code:
                thread_pool tp(num_threads);
                parallel_for(tp, begin, end, obj, funct, chunks_per_thread);
    !*/

// ----------------------------------------------------------------------------------------

    template <typename T>
    void parallel_for (
        thread_pool& tp,
        long begin,
        long end,
        const T& funct,
        long chunks_per_thread = 8
    );
    /*!
        requires
            - begin <= end
            - chunks_per_thread > 0
            - funct does not throw any exceptions
        ensures
            - This function is equivalent to the following function call:
              parallel_for_blocked(tp, begin, end, [&](long begin_sub, long end_sub) 
                {
                  for (long i = begin_sub; i < end_sub; ++i)
                      funct(i);  
                }, chunks_per_thread);
            - Therefore, this routine invokes funct(i) for all i in the range [begin, end).
              However, it does so using tp.num_threads_in_pool() parallel threads.
            - This function will not perform any memory allocations or create any system
              resources such as mutex objects.
    !*/

// ----------------------------------------------------------------------------------------

    template <typename T>
    void parallel_for (
        unsigned long num_threads,
        long begin,
        long end,
        const T& funct,
        long chunks_per_thread = 8
    );
    /*!
        requires
            - begin <= end
            - chunks_per_thread > 0
            - funct does not throw any exceptions
        ensures
            - This function is equivalent to the following block of code:
                thread_pool tp(num_threads);
                parallel_for(tp, begin, end, funct, chunks_per_thread);
    !*/

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <typename T>
    void parallel_for_verbose (
        thread_pool& tp,
        long begin,
        long end,
        T& obj,
        void (T::*funct)(long),
        long chunks_per_thread = 8
    );
    /*!
        requires
            - begin <= end
            - chunks_per_thread > 0
            - funct does not throw any exceptions
        ensures
            - This function is identical to the parallel_for() routine defined above except
              that it will print messages to cout showing the progress in executing the
              parallel for loop.
    !*/

// ----------------------------------------------------------------------------------------

    template <typename T>
    void parallel_for_verbose (
        unsigned long num_threads,
        long begin,
        long end,
        T& obj,
        void (T::*funct)(long),
        long chunks_per_thread = 8
    );
    /*!
        requires
            - begin <= end
            - chunks_per_thread > 0
            - funct does not throw any exceptions
        ensures
            - This function is identical to the parallel_for() routine defined above except
              that it will print messages to cout showing the progress in executing the
              parallel for loop.
    !*/

// ----------------------------------------------------------------------------------------

    template <typename T>
    void parallel_for_verbose (
        thread_pool& tp,
        long begin,
        long end,
        const T& funct,
        long chunks_per_thread = 8
    );
    /*!
        requires
            - begin <= end
            - chunks_per_thread > 0
            - funct does not throw any exceptions
        ensures
            - This function is identical to the parallel_for() routine defined above except
              that it will print messages to cout showing the progress in executing the
              parallel for loop.
    !*/

// ----------------------------------------------------------------------------------------

    template <typename T>
    void parallel_for_verbose (
        unsigned long num_threads,
        long begin,
        long end,
        const T& funct,
        long chunks_per_thread = 8
    );
    /*!
        requires
            - begin <= end
            - chunks_per_thread > 0
            - funct does not throw any exceptions
        ensures
            - This function is identical to the parallel_for() routine defined above except
              that it will print messages to cout showing the progress in executing the
              parallel for loop.
    !*/

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <typename T>
    void parallel_for_blocked_verbose (
        thread_pool& tp,
        long begin,
        long end,
        T& obj,
        void (T::*funct)(long,long),
        long chunks_per_thread = 8
    );
    /*!
        requires
            - begin <= end
            - chunks_per_thread > 0
            - funct does not throw any exceptions
        ensures
            - This function is identical to the parallel_for_blocked() routine defined
              above except that it will print messages to cout showing the progress in
              executing the parallel for loop.
    !*/

// ----------------------------------------------------------------------------------------

    template <typename T>
    void parallel_for_blocked_verbose (
        unsigned long num_threads,
        long begin,
        long end,
        T& obj,
        void (T::*funct)(long,long),
        long chunks_per_thread = 8
    );
    /*!
        requires
            - begin <= end
            - chunks_per_thread > 0
            - funct does not throw any exceptions
        ensures
            - This function is identical to the parallel_for_blocked() routine defined
              above except that it will print messages to cout showing the progress in
              executing the parallel for loop.
    !*/

// ----------------------------------------------------------------------------------------

    template <typename T>
    void parallel_for_blocked_verbose (
        thread_pool& tp,
        long begin,
        long end,
        const T& funct,
        long chunks_per_thread = 8
    );
    /*!
        requires
            - begin <= end
            - chunks_per_thread > 0
            - funct does not throw any exceptions
        ensures
            - This function is identical to the parallel_for_blocked() routine defined
              above except that it will print messages to cout showing the progress in
              executing the parallel for loop.
    !*/

// ----------------------------------------------------------------------------------------

    template <typename T>
    void parallel_for_blocked_verbose (
        unsigned long num_threads,
        long begin,
        long end,
        const T& funct,
        long chunks_per_thread = 8
    );
    /*!
        requires
            - begin <= end
            - chunks_per_thread > 0
            - funct does not throw any exceptions
        ensures
            - This function is identical to the parallel_for_blocked() routine defined
              above except that it will print messages to cout showing the progress in
              executing the parallel for loop.
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_PARALLEL_FoR_ABSTRACT_Hh_


