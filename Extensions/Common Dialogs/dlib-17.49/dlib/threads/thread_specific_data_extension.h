// Copyright (C) 2006  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_THREAD_SPECIFIC_DATA_EXTENSIOn_
#define DLIB_THREAD_SPECIFIC_DATA_EXTENSIOn_

#include "thread_specific_data_extension_abstract.h"
#include "threads_kernel_abstract.h"
#include "../binary_search_tree.h"
#include "auto_mutex_extension.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    class thread_specific_data
    {
        /*!
            CONVENTION
                - for all valid ID:
                  (*items[ID]) == pointer to the data for thread with id ID
        !*/
    public:

        thread_specific_data (
        )
        {
            thread_end_handler_calls_left = 0;
        }

        ~thread_specific_data (
        )
        {
            // We should only call the unregister_thread_end_handler function if there are
            // some outstanding callbacks we expect to get.  Otherwise lets avoid calling it
            // since the dlib state that maintains the registered thread end handlers may have
            // been destructed already (since the program might be in the process of terminating).
            bool call_unregister = false;
            m.lock();
            if (thread_end_handler_calls_left > 0)
                call_unregister = true;
            m.unlock();

            if (call_unregister)
                unregister_thread_end_handler(const_cast<thread_specific_data&>(*this),&thread_specific_data::thread_end_handler);

            auto_mutex M(m);
            items.reset();
            while (items.move_next())
            {
                delete items.element().value();
            }
        }

        inline T& data (
        ) { return get_data(); }

        inline const T& data (
        ) const { return get_data(); }

    private:

        T& get_data (
        ) const
        {
            thread_id_type id = get_thread_id();
            auto_mutex M(m);

            T** item = items[id];
            if (item)
            {
                return **item;
            }
            else
            {
                // register an end handler for this thread so long as it is a dlib created thread.
                T* new_item = new T;

                bool in_tree = false;
                try
                {
                    T* temp_item = new_item;
                    thread_id_type temp_id = id;
                    items.add(temp_id,temp_item);
                    in_tree = true;

                    if (is_dlib_thread(id))
                    {
                        register_thread_end_handler(const_cast<thread_specific_data&>(*this),&thread_specific_data::thread_end_handler);
                        ++thread_end_handler_calls_left;
                    }
                }
                catch (...)
                {
                    if (in_tree)
                    {
                        items.destroy(id);
                    }
                    delete new_item;
                    throw;
                }

                return *new_item;
            }
        }

        void thread_end_handler (
        )
        {
            const thread_id_type id = get_thread_id();
            thread_id_type junk = 0;
            T* item = 0;
            auto_mutex M(m);
            --thread_end_handler_calls_left;
            if (items[id])
            {
                items.remove(id,junk,item);
                delete item;
            }
        }

        mutable typename binary_search_tree<thread_id_type,T*>::kernel_2a items;
        mutex m;
        mutable long thread_end_handler_calls_left;

        // restricted functions
        thread_specific_data(thread_specific_data&);        // copy constructor
        thread_specific_data& operator=(thread_specific_data&);    // assignment operator
    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_THREAD_SPECIFIC_DATA_EXTENSIOn_



