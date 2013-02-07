// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_SYNC_EXTENSION_KERNEl_1_
#define DLIB_SYNC_EXTENSION_KERNEl_1_

#include "../threads.h"
#include "../algs.h"
#include "sync_extension_kernel_abstract.h"

namespace dlib
{

    template <
        typename base
        >
    class sync_extension_kernel_1 : public base
    {

        rmutex m;
        rsignaler s;

        public:

        sync_extension_kernel_1 () : s(m) {}

        template < typename T >
        sync_extension_kernel_1 (const T& one) : base(one),s(m) {}
        template < typename T, typename U >
        sync_extension_kernel_1 (const T& one, const U& two) : base(one,two),s(m) {}


        const rmutex& get_mutex(
        ) const { return m; }

        void lock (
        ) const { m.lock(); }

        void unlock (
        ) const { m.unlock(); }

        void wait (
        ) const { s.wait(); }

        bool wait_or_timeout (
            unsigned long milliseconds
        ) const { return s.wait_or_timeout(milliseconds); }
         
        void broadcast (
        ) const { s.broadcast(); }

        void signal (
        ) const { s.signal(); }

    };

    template <
        typename base
        >
    inline void swap (
        sync_extension_kernel_1<base>& a, 
        sync_extension_kernel_1<base>& b 
    ) { a.swap(b); }

}

#endif // DLIB_SYNC_EXTENSION_KERNEl_1_

