// Copyright (C) 2008  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_THREAD_POOl_H__
#define DLIB_THREAD_POOl_H__ 

#include "thread_pool_extension_abstract.h"
#include "../member_function_pointer.h"
#include "../bound_function_pointer.h"
#include "threads_kernel.h"
#include "auto_mutex_extension.h"
#include "multithreaded_object_extension.h"
#include "../uintn.h"
#include "../array.h"
#include "../smart_pointers_thread_safe.h"
#include "../smart_pointers.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    class thread_pool_implementation;

    template <
        typename T
        >
    class future
    {
        /*!
            INITIAL VALUE
                - task_id == 0
                - tp.get() == 0

            CONVENTION
                - is_ready() == (tp.get() == 0)
                - get() == var

                - if (tp.get() != 0)
                    - tp == a pointer to the thread_pool_implementation that is using this future object
                    - task_id == the task id of the task in the thread pool tp that is using
                      this future object.
        !*/
    public:

        future (
        ) : task_id(0) {}

        future (
            const T& item
        ) : task_id(0), var(item) {}

        future (
            const future& item
        ) :task_id(0), var(item.get()) {}

        ~future (
        ) { wait(); }

        future& operator=(
            const T& item
        ) { get() = item; return *this; }

        future& operator=(
            const future& item
        ) { get() = item.get(); return *this; }

        operator T& (
        ) { return get(); }

        operator const T& (
        ) const { return get(); }

        T& get (
        ) { wait(); return var; }

        const T& get (
        ) const { wait(); return var; }

        bool is_ready (
        ) const { return tp.get() == 0; }

    private:

        friend class thread_pool;

        inline void wait () const;

        mutable uint64 task_id;
        mutable shared_ptr_thread_safe<thread_pool_implementation> tp;

        T var;
    };

// ----------------------------------------------------------------------------------------

    template <typename T>
    inline void swap (
        future<T>& a,
        future<T>& b
    ) { dlib::exchange(a.get(), b.get()); }
    // Note that dlib::exchange() just calls std::swap.  I'm only using it because
    // this works around some bugs in certain compilers.

// ----------------------------------------------------------------------------------------

    template <typename T> bool operator== (const future<T>& a, const future<T>& b) { return a.get() == b.get(); }
    template <typename T> bool operator!= (const future<T>& a, const future<T>& b) { return a.get() != b.get(); }
    template <typename T> bool operator<= (const future<T>& a, const future<T>& b) { return a.get() <= b.get(); }
    template <typename T> bool operator>= (const future<T>& a, const future<T>& b) { return a.get() >= b.get(); }
    template <typename T> bool operator<  (const future<T>& a, const future<T>& b) { return a.get() <  b.get(); }
    template <typename T> bool operator>  (const future<T>& a, const future<T>& b) { return a.get() >  b.get(); }

    template <typename T> bool operator== (const future<T>& a, const T& b)         { return a.get() == b; }
    template <typename T> bool operator== (const T& a,         const future<T>& b) { return a       == b.get(); }
    template <typename T> bool operator!= (const future<T>& a, const T& b)         { return a.get() != b; }
    template <typename T> bool operator!= (const T& a,         const future<T>& b) { return a       != b.get(); }
    template <typename T> bool operator<= (const future<T>& a, const T& b)         { return a.get() <= b; }
    template <typename T> bool operator<= (const T& a,         const future<T>& b) { return a       <= b.get(); }
    template <typename T> bool operator>= (const future<T>& a, const T& b)         { return a.get() >= b; }
    template <typename T> bool operator>= (const T& a,         const future<T>& b) { return a       >= b.get(); }
    template <typename T> bool operator<  (const future<T>& a, const T& b)         { return a.get() <  b; }
    template <typename T> bool operator<  (const T& a,         const future<T>& b) { return a       <  b.get(); }
    template <typename T> bool operator>  (const future<T>& a, const T& b)         { return a.get() >  b; }
    template <typename T> bool operator>  (const T& a,         const future<T>& b) { return a       >  b.get(); }

// ----------------------------------------------------------------------------------------

    class thread_pool_implementation : private multithreaded_object
    {
        /*!
            CONVENTION
                - num_threads_in_pool() == tasks.size()
                - if (the destructor has been called) then
                    - we_are_destructing == true
                - else
                    - we_are_destructing == false

                - is_task_thread() == is_worker_thread(get_thread_id())

                - m == the mutex used to protect everything in this object
                - worker_thread_ids == an array that contains the thread ids for
                  all the threads in the thread pool
        !*/
        typedef bound_function_pointer::kernel_1a_c bfp_type;

        friend class thread_pool;
        explicit thread_pool_implementation (
            unsigned long num_threads
        );

    public:
        ~thread_pool_implementation(
        );

        void wait_for_task (
            uint64 task_id
        ) const;

        unsigned long num_threads_in_pool (
        ) const;

        void wait_for_all_tasks (
        ) const;

        bool is_task_thread (
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

        struct function_object_copy 
        {
            virtual ~function_object_copy(){}
        };

        template <typename T>
        struct function_object_copy_instance : function_object_copy
        {
            function_object_copy_instance(const T& item_) : item(item_) {}
            T item;
            virtual ~function_object_copy_instance(){}
        };

        uint64 add_task_internal (
            const bfp_type& bfp,
            shared_ptr<function_object_copy>& item
        );
        /*!
            ensures
                - adds a task to call the given bfp object.
                - swaps item into the internal task object which will have a lifetime
                  at least as long as the running task.
                - returns the task id for this new task
        !*/

        uint64 add_task_internal (
            const bfp_type& bfp
        ) { shared_ptr<function_object_copy> temp; return add_task_internal(bfp, temp); }
        /*!
            ensures
                - adds a task to call the given bfp object.
                - returns the task id for this new task
        !*/

        void shutdown_pool (
        );
        /*!
            ensures
                - causes all threads to terminate and blocks the
                  caller until this happens.
        !*/

    private:

        bool is_worker_thread (
            const thread_id_type id
        ) const;
        /*!
            requires
                - m is locked
            ensures
                - if (thread with given id is one of the thread pool's worker threads or num_threads_in_pool() == 0) then
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
                - num_threads_in_pool() != 0
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

            member_function_pointer<>::kernel_1a mfp0;
            member_function_pointer<long>::kernel_1a mfp1;
            member_function_pointer<long,long>::kernel_1a mfp2;
            bfp_type bfp;

            shared_ptr<function_object_copy> function_copy;

        };

        array<task_state_type> tasks;
        array<thread_id_type> worker_thread_ids;

        mutex m;
        signaler task_done_signaler;
        signaler task_ready_signaler;
        bool we_are_destructing;

        // restricted functions
        thread_pool_implementation(thread_pool_implementation&);        // copy constructor
        thread_pool_implementation& operator=(thread_pool_implementation&);    // assignment operator

    };


// ----------------------------------------------------------------------------------------

    class thread_pool 
    {
        /*!
            This object is just a shell that holds a shared_ptr_thread_safe 
            to the real thread_pool_implementation object.  The reason for doing
            it this way is so that we can allow any mixture of destruction orders
            between thread_pool objects and futures.  Whoever gets destroyed
            last cleans up the thread_pool_implementation resources.
        !*/
        typedef bound_function_pointer::kernel_1a_c bfp_type;

    public:
        explicit thread_pool (
            unsigned long num_threads
        ) 
        {
            impl.reset(new thread_pool_implementation(num_threads));
        }

        ~thread_pool (
        )
        {
            impl->shutdown_pool();
        }

        void wait_for_task (
            uint64 task_id
        ) const { impl->wait_for_task(task_id); }

        unsigned long num_threads_in_pool (
        ) const { return impl->num_threads_in_pool(); }

        void wait_for_all_tasks (
        ) const { impl->wait_for_all_tasks(); }

        bool is_task_thread (
        ) const { return impl->is_task_thread(); }

        template <typename T>
        uint64 add_task (
            T& obj,
            void (T::*funct)()
        )
        {
            return impl->add_task(obj, funct);
        }

        template <typename T>
        uint64 add_task (
            T& obj,
            void (T::*funct)(long),
            long arg1
        )
        {
            return impl->add_task(obj, funct, arg1);
        }

        template <typename T>
        uint64 add_task (
            T& obj,
            void (T::*funct)(long,long),
            long arg1,
            long arg2
        )
        {
            return impl->add_task(obj, funct, arg1, arg2);
        }

        // --------------------

        template <typename F>
        uint64 add_task (
            F& function_object
        ) 
        { 
            COMPILE_TIME_ASSERT(is_function<F>::value == false);
            COMPILE_TIME_ASSERT(is_pointer_type<F>::value == false);
            
            bfp_type temp;
            temp.set(function_object);
            uint64 id = impl->add_task_internal(temp);

            return id;
        }
        
        template <typename F>
        uint64 add_task_by_value (
            const F& function_object
        ) 
        { 
            thread_pool_implementation::function_object_copy_instance<F>* ptr = 0;
            ptr = new thread_pool_implementation::function_object_copy_instance<F>(function_object);
            shared_ptr<thread_pool_implementation::function_object_copy> function_copy(ptr);


            bfp_type temp;
            temp.set(ptr->item);
            uint64 id = impl->add_task_internal(temp, function_copy);

            return id;
        }
        
        template <typename T>
        uint64 add_task (
            const T& obj,
            void (T::*funct)() const
        ) 
        { 
            bfp_type temp;
            temp.set(obj,funct);
            uint64 id = impl->add_task_internal(temp);

            return id;
        }
        
        template <typename T>
        uint64 add_task_by_value (
            const T& obj,
            void (T::*funct)() const
        ) 
        { 
            thread_pool_implementation::function_object_copy_instance<const T>* ptr = 0;
            ptr = new thread_pool_implementation::function_object_copy_instance<const T>(obj);
            shared_ptr<thread_pool_implementation::function_object_copy> function_copy(ptr);

            bfp_type temp;
            temp.set(ptr->item,funct);
            uint64 id = impl->add_task_internal(temp, function_copy);

            return id;
        }
        
        template <typename T>
        uint64 add_task_by_value (
            const T& obj,
            void (T::*funct)() 
        ) 
        { 
            thread_pool_implementation::function_object_copy_instance<T>* ptr = 0;
            ptr = new thread_pool_implementation::function_object_copy_instance<T>(obj);
            shared_ptr<thread_pool_implementation::function_object_copy> function_copy(ptr);

            bfp_type temp;
            temp.set(ptr->item,funct);
            uint64 id = impl->add_task_internal(temp, function_copy);

            return id;
        }

        uint64 add_task (
            void (*funct)()
        ) 
        { 
            bfp_type temp;
            temp.set(funct);
            uint64 id = impl->add_task_internal(temp);

            return id;
        }

        // --------------------

        template <typename F, typename A1>
        uint64 add_task (
            F& function_object,
            future<A1>& arg1
        ) 
        { 
            COMPILE_TIME_ASSERT(is_function<F>::value == false);
            COMPILE_TIME_ASSERT(is_pointer_type<F>::value == false);
            
            bfp_type temp;
            temp.set(function_object,arg1.get());
            uint64 id = impl->add_task_internal(temp);

            // tie the future to this task
            arg1.task_id = id;
            arg1.tp = impl;
            return id;
        }
        
        template <typename F, typename A1>
        uint64 add_task_by_value (
            const F& function_object,
            future<A1>& arg1
        ) 
        { 
            thread_pool_implementation::function_object_copy_instance<F>* ptr = 0;
            ptr = new thread_pool_implementation::function_object_copy_instance<F>(function_object);
            shared_ptr<thread_pool_implementation::function_object_copy> function_copy(ptr);

            bfp_type temp;
            temp.set(ptr->item, arg1.get());
            uint64 id = impl->add_task_internal(temp, function_copy);

            // tie the future to this task
            arg1.task_id = id;
            arg1.tp = impl;
            return id;
        }
        
        template <typename T, typename T1, typename A1>
        uint64 add_task (
            T& obj,
            void (T::*funct)(T1),
            future<A1>& arg1
        ) 
        { 
            bfp_type temp;
            temp.set(obj,funct,arg1.get());
            uint64 id = impl->add_task_internal(temp);

            // tie the future to this task
            arg1.task_id = id;
            arg1.tp = impl;
            return id;
        }

        template <typename T, typename T1, typename A1>
        uint64 add_task_by_value (
            const T& obj,
            void (T::*funct)(T1),
            future<A1>& arg1
        ) 
        { 
            thread_pool_implementation::function_object_copy_instance<T>* ptr = 0;
            ptr = new thread_pool_implementation::function_object_copy_instance<T>(obj);
            shared_ptr<thread_pool_implementation::function_object_copy> function_copy(ptr);

            bfp_type temp;
            temp.set(ptr->item,funct,arg1.get());
            uint64 id = impl->add_task_internal(temp, function_copy);

            // tie the future to this task
            arg1.task_id = id;
            arg1.tp = impl;
            return id;
        }
        
        
        template <typename T, typename T1, typename A1>
        uint64 add_task (
            const T& obj,
            void (T::*funct)(T1) const,
            future<A1>& arg1
        ) 
        { 
            bfp_type temp;
            temp.set(obj,funct,arg1.get());
            uint64 id = impl->add_task_internal(temp);

            // tie the future to this task
            arg1.task_id = id;
            arg1.tp = impl;
            return id;
        }
        
        template <typename T, typename T1, typename A1>
        uint64 add_task_by_value (
            const T& obj,
            void (T::*funct)(T1) const,
            future<A1>& arg1
        ) 
        { 
            thread_pool_implementation::function_object_copy_instance<const T>* ptr = 0;
            ptr = new thread_pool_implementation::function_object_copy_instance<const T>(obj);
            shared_ptr<thread_pool_implementation::function_object_copy> function_copy(ptr);

            bfp_type temp;
            temp.set(ptr->item,funct,arg1.get());
            uint64 id = impl->add_task_internal(temp, function_copy);

            // tie the future to this task
            arg1.task_id = id;
            arg1.tp = impl;
            return id;
        }
        
        template <typename T1, typename A1>
        uint64 add_task (
            void (*funct)(T1),
            future<A1>& arg1
        ) 
        { 
            bfp_type temp;
            temp.set(funct,arg1.get());
            uint64 id = impl->add_task_internal(temp);

            // tie the future to this task
            arg1.task_id = id;
            arg1.tp = impl;
            return id;
        }

        // --------------------

        template <typename F, typename A1, typename A2>
        uint64 add_task (
            F& function_object,
            future<A1>& arg1,
            future<A2>& arg2
        ) 
        { 
            COMPILE_TIME_ASSERT(is_function<F>::value == false);
            COMPILE_TIME_ASSERT(is_pointer_type<F>::value == false);
            
            bfp_type temp;
            temp.set(function_object, arg1.get(), arg2.get());
            uint64 id = impl->add_task_internal(temp);

            // tie the future to this task
            arg1.task_id = id;
            arg1.tp = impl;
            arg2.task_id = id;
            arg2.tp = impl;
            return id;
        }
        
        template <typename F, typename A1, typename A2>
        uint64 add_task_by_value (
            const F& function_object,
            future<A1>& arg1,
            future<A2>& arg2
        ) 
        { 
            thread_pool_implementation::function_object_copy_instance<F>* ptr = 0;
            ptr = new thread_pool_implementation::function_object_copy_instance<F>(function_object);
            shared_ptr<thread_pool_implementation::function_object_copy> function_copy(ptr);

            bfp_type temp;
            temp.set(ptr->item, arg1.get(), arg2.get());
            uint64 id = impl->add_task_internal(temp, function_copy);

            // tie the future to this task
            arg1.task_id = id;
            arg1.tp = impl;
            arg2.task_id = id;
            arg2.tp = impl;
            return id;
        }
        
        template <typename T, typename T1, typename A1,
                              typename T2, typename A2>
        uint64 add_task (
            T& obj,
            void (T::*funct)(T1,T2),
            future<A1>& arg1,
            future<A2>& arg2
        ) 
        { 
            bfp_type temp;
            temp.set(obj, funct, arg1.get(), arg2.get());
            uint64 id = impl->add_task_internal(temp);

            // tie the futures to this task
            arg1.task_id = id;
            arg1.tp = impl;
            arg2.task_id = id;
            arg2.tp = impl;
            return id;
        }
        
        template <typename T, typename T1, typename A1,
                              typename T2, typename A2>
        uint64 add_task_by_value (
            const T& obj,
            void (T::*funct)(T1,T2),
            future<A1>& arg1,
            future<A2>& arg2
        ) 
        { 
            thread_pool_implementation::function_object_copy_instance<T>* ptr = 0;
            ptr = new thread_pool_implementation::function_object_copy_instance<T>(obj);
            shared_ptr<thread_pool_implementation::function_object_copy> function_copy(ptr);

            bfp_type temp;
            temp.set(ptr->item, funct, arg1.get(), arg2.get());
            uint64 id = impl->add_task_internal(temp, function_copy);

            // tie the futures to this task
            arg1.task_id = id;
            arg1.tp = impl;
            arg2.task_id = id;
            arg2.tp = impl;
            return id;
        }
        
        template <typename T, typename T1, typename A1,
                              typename T2, typename A2>
        uint64 add_task (
            const T& obj,
            void (T::*funct)(T1,T2) const,
            future<A1>& arg1,
            future<A2>& arg2
        ) 
        { 
            bfp_type temp;
            temp.set(obj, funct, arg1.get(), arg2.get());
            uint64 id = impl->add_task_internal(temp);

            // tie the futures to this task
            arg1.task_id = id;
            arg1.tp = impl;
            arg2.task_id = id;
            arg2.tp = impl;
            return id;
        }
        
        template <typename T, typename T1, typename A1,
                              typename T2, typename A2>
        uint64 add_task_by_value (
            const T& obj,
            void (T::*funct)(T1,T2) const,
            future<A1>& arg1,
            future<A2>& arg2
        ) 
        { 
            thread_pool_implementation::function_object_copy_instance<const T>* ptr = 0;
            ptr = new thread_pool_implementation::function_object_copy_instance<const T>(obj);
            shared_ptr<thread_pool_implementation::function_object_copy> function_copy(ptr);

            bfp_type temp;
            temp.set(ptr->item, funct, arg1.get(), arg2.get());
            uint64 id = impl->add_task_internal(temp, function_copy);

            // tie the futures to this task
            arg1.task_id = id;
            arg1.tp = impl;
            arg2.task_id = id;
            arg2.tp = impl;
            return id;
        }
        
        template <typename T1, typename A1,
                  typename T2, typename A2>
        uint64 add_task (
            void (*funct)(T1,T2),
            future<A1>& arg1,
            future<A2>& arg2
        ) 
        { 
            bfp_type temp;
            temp.set(funct, arg1.get(), arg2.get());
            uint64 id = impl->add_task_internal(temp);

            // tie the futures to this task
            arg1.task_id = id;
            arg1.tp = impl;
            arg2.task_id = id;
            arg2.tp = impl;
            return id;
        }

        // --------------------

        template <typename F, typename A1, typename A2, typename A3>
        uint64 add_task (
            F& function_object,
            future<A1>& arg1,
            future<A2>& arg2,
            future<A3>& arg3
        ) 
        { 
            COMPILE_TIME_ASSERT(is_function<F>::value == false);
            COMPILE_TIME_ASSERT(is_pointer_type<F>::value == false);
            
            bfp_type temp;
            temp.set(function_object, arg1.get(), arg2.get(), arg3.get());
            uint64 id = impl->add_task_internal(temp);

            // tie the future to this task
            arg1.task_id = id;
            arg1.tp = impl;
            arg2.task_id = id;
            arg2.tp = impl;
            arg3.task_id = id;
            arg3.tp = impl;
            return id;
        }
        
        template <typename F, typename A1, typename A2, typename A3>
        uint64 add_task_by_value (
            const F& function_object,
            future<A1>& arg1,
            future<A2>& arg2,
            future<A3>& arg3
        ) 
        { 
            thread_pool_implementation::function_object_copy_instance<F>* ptr = 0;
            ptr = new thread_pool_implementation::function_object_copy_instance<F>(function_object);
            shared_ptr<thread_pool_implementation::function_object_copy> function_copy(ptr);

            bfp_type temp;
            temp.set(ptr->item, arg1.get(), arg2.get(), arg3.get());
            uint64 id = impl->add_task_internal(temp, function_copy);

            // tie the future to this task
            arg1.task_id = id;
            arg1.tp = impl;
            arg2.task_id = id;
            arg2.tp = impl;
            arg3.task_id = id;
            arg3.tp = impl;
            return id;
        }
        
        template <typename T, typename T1, typename A1,
                              typename T2, typename A2,
                              typename T3, typename A3>
        uint64 add_task (
            T& obj,
            void (T::*funct)(T1,T2,T3),
            future<A1>& arg1,
            future<A2>& arg2,
            future<A3>& arg3
        ) 
        { 
            bfp_type temp;
            temp.set(obj, funct, arg1.get(), arg2.get(), arg3.get());
            uint64 id = impl->add_task_internal(temp);

            // tie the futures to this task
            arg1.task_id = id;
            arg1.tp = impl;
            arg2.task_id = id;
            arg2.tp = impl;
            arg3.task_id = id;
            arg3.tp = impl;
            return id;
        }
        
        template <typename T, typename T1, typename A1,
                              typename T2, typename A2,
                              typename T3, typename A3>
        uint64 add_task_by_value (
            const T& obj,
            void (T::*funct)(T1,T2,T3),
            future<A1>& arg1,
            future<A2>& arg2,
            future<A3>& arg3
        ) 
        { 
            thread_pool_implementation::function_object_copy_instance<T>* ptr = 0;
            ptr = new thread_pool_implementation::function_object_copy_instance<T>(obj);
            shared_ptr<thread_pool_implementation::function_object_copy> function_copy(ptr);

            bfp_type temp;
            temp.set(ptr->item, funct, arg1.get(), arg2.get(), arg3.get());
            uint64 id = impl->add_task_internal(temp, function_copy);

            // tie the futures to this task
            arg1.task_id = id;
            arg1.tp = impl;
            arg2.task_id = id;
            arg2.tp = impl;
            arg3.task_id = id;
            arg3.tp = impl;
            return id;
        }
        
        template <typename T, typename T1, typename A1,
                              typename T2, typename A2,
                              typename T3, typename A3>
        uint64 add_task (
            const T& obj,
            void (T::*funct)(T1,T2,T3) const,
            future<A1>& arg1,
            future<A2>& arg2,
            future<A3>& arg3
        ) 
        { 
            bfp_type temp;
            temp.set(obj, funct, arg1.get(), arg2.get(), arg3.get());
            uint64 id = impl->add_task_internal(temp);

            // tie the futures to this task
            arg1.task_id = id;
            arg1.tp = impl;
            arg2.task_id = id;
            arg2.tp = impl;
            arg3.task_id = id;
            arg3.tp = impl;
            return id;
        }
        
        template <typename T, typename T1, typename A1,
                              typename T2, typename A2,
                              typename T3, typename A3>
        uint64 add_task_by_value (
            const T& obj,
            void (T::*funct)(T1,T2,T3) const,
            future<A1>& arg1,
            future<A2>& arg2,
            future<A3>& arg3
        ) 
        { 
            thread_pool_implementation::function_object_copy_instance<const T>* ptr = 0;
            ptr = new thread_pool_implementation::function_object_copy_instance<const T>(obj);
            shared_ptr<thread_pool_implementation::function_object_copy> function_copy(ptr);

            bfp_type temp;
            temp.set(ptr->item, funct, arg1.get(), arg2.get(), arg3.get());
            uint64 id = impl->add_task_internal(temp, function_copy);

            // tie the futures to this task
            arg1.task_id = id;
            arg1.tp = impl;
            arg2.task_id = id;
            arg2.tp = impl;
            arg3.task_id = id;
            arg3.tp = impl;
            return id;
        }
        
        template <typename T1, typename A1,
                  typename T2, typename A2,
                  typename T3, typename A3>
        uint64 add_task (
            void (*funct)(T1,T2,T3),
            future<A1>& arg1,
            future<A2>& arg2,
            future<A3>& arg3
        ) 
        { 
            bfp_type temp;
            temp.set(funct, arg1.get(), arg2.get(), arg3.get());
            uint64 id = impl->add_task_internal(temp);

            // tie the futures to this task
            arg1.task_id = id;
            arg1.tp = impl;
            arg2.task_id = id;
            arg2.tp = impl;
            arg3.task_id = id;
            arg3.tp = impl;
            return id;
        }

        // --------------------

        template <typename F, typename A1, typename A2, typename A3, typename A4>
        uint64 add_task (
            F& function_object,
            future<A1>& arg1,
            future<A2>& arg2,
            future<A3>& arg3,
            future<A4>& arg4
        ) 
        { 
            COMPILE_TIME_ASSERT(is_function<F>::value == false);
            COMPILE_TIME_ASSERT(is_pointer_type<F>::value == false);
            
            bfp_type temp;
            temp.set(function_object, arg1.get(), arg2.get(), arg3.get(), arg4.get());
            uint64 id = impl->add_task_internal(temp);

            // tie the future to this task
            arg1.task_id = id;
            arg1.tp = impl;
            arg2.task_id = id;
            arg2.tp = impl;
            arg3.task_id = id;
            arg3.tp = impl;
            arg4.task_id = id;
            arg4.tp = impl;
            return id;
        }
        
        template <typename F, typename A1, typename A2, typename A3, typename A4>
        uint64 add_task_by_value (
            const F& function_object,
            future<A1>& arg1,
            future<A2>& arg2,
            future<A3>& arg3,
            future<A4>& arg4
        ) 
        { 
            thread_pool_implementation::function_object_copy_instance<F>* ptr = 0;
            ptr = new thread_pool_implementation::function_object_copy_instance<F>(function_object);
            shared_ptr<thread_pool_implementation::function_object_copy> function_copy(ptr);

            bfp_type temp;
            temp.set(ptr->item, arg1.get(), arg2.get(), arg3.get(), arg4.get());
            uint64 id = impl->add_task_internal(temp, function_copy);

            // tie the future to this task
            arg1.task_id = id;
            arg1.tp = impl;
            arg2.task_id = id;
            arg2.tp = impl;
            arg3.task_id = id;
            arg3.tp = impl;
            arg4.task_id = id;
            arg4.tp = impl;
            return id;
        }
        
        template <typename T, typename T1, typename A1,
                              typename T2, typename A2,
                              typename T3, typename A3,
                              typename T4, typename A4>
        uint64 add_task (
            T& obj,
            void (T::*funct)(T1,T2,T3,T4),
            future<A1>& arg1,
            future<A2>& arg2,
            future<A3>& arg3,
            future<A4>& arg4
        ) 
        { 
            bfp_type temp;
            temp.set(obj, funct, arg1.get(), arg2.get(), arg3.get(), arg4.get());
            uint64 id = impl->add_task_internal(temp);

            // tie the futures to this task
            arg1.task_id = id;
            arg1.tp = impl;
            arg2.task_id = id;
            arg2.tp = impl;
            arg3.task_id = id;
            arg3.tp = impl;
            arg4.task_id = id;
            arg4.tp = impl;
            return id;
        }
        
        template <typename T, typename T1, typename A1,
                              typename T2, typename A2,
                              typename T3, typename A3,
                              typename T4, typename A4>
        uint64 add_task_by_value (
            const T& obj,
            void (T::*funct)(T1,T2,T3,T4),
            future<A1>& arg1,
            future<A2>& arg2,
            future<A3>& arg3,
            future<A4>& arg4
        ) 
        { 
            thread_pool_implementation::function_object_copy_instance<T>* ptr = 0;
            ptr = new thread_pool_implementation::function_object_copy_instance<T>(obj);
            shared_ptr<thread_pool_implementation::function_object_copy> function_copy(ptr);

            bfp_type temp;
            temp.set(ptr->item, funct, arg1.get(), arg2.get(), arg3.get(), arg4.get());
            uint64 id = impl->add_task_internal(temp, function_copy);

            // tie the futures to this task
            arg1.task_id = id;
            arg1.tp = impl;
            arg2.task_id = id;
            arg2.tp = impl;
            arg3.task_id = id;
            arg3.tp = impl;
            arg4.task_id = id;
            arg4.tp = impl;
            return id;
        }
        
        template <typename T, typename T1, typename A1,
                              typename T2, typename A2,
                              typename T3, typename A3,
                              typename T4, typename A4>
        uint64 add_task (
            const T& obj,
            void (T::*funct)(T1,T2,T3,T4) const,
            future<A1>& arg1,
            future<A2>& arg2,
            future<A3>& arg3,
            future<A4>& arg4
        ) 
        { 
            bfp_type temp;
            temp.set(obj, funct, arg1.get(), arg2.get(), arg3.get(), arg4.get());
            uint64 id = impl->add_task_internal(temp);

            // tie the futures to this task
            arg1.task_id = id;
            arg1.tp = impl;
            arg2.task_id = id;
            arg2.tp = impl;
            arg3.task_id = id;
            arg3.tp = impl;
            arg4.task_id = id;
            arg4.tp = impl;
            return id;
        }
        
        template <typename T, typename T1, typename A1,
                              typename T2, typename A2,
                              typename T3, typename A3,
                              typename T4, typename A4>
        uint64 add_task_by_value (
            const T& obj,
            void (T::*funct)(T1,T2,T3,T4) const,
            future<A1>& arg1,
            future<A2>& arg2,
            future<A3>& arg3,
            future<A4>& arg4
        ) 
        { 
            thread_pool_implementation::function_object_copy_instance<const T>* ptr = 0;
            ptr = new thread_pool_implementation::function_object_copy_instance<const T>(obj);
            shared_ptr<thread_pool_implementation::function_object_copy> function_copy(ptr);

            bfp_type temp;
            temp.set(ptr->item, funct, arg1.get(), arg2.get(), arg3.get(), arg4.get());
            uint64 id = impl->add_task_internal(temp, function_copy);

            // tie the futures to this task
            arg1.task_id = id;
            arg1.tp = impl;
            arg2.task_id = id;
            arg2.tp = impl;
            arg3.task_id = id;
            arg3.tp = impl;
            arg4.task_id = id;
            arg4.tp = impl;
            return id;
        }
        
        template <typename T1, typename A1,
                  typename T2, typename A2,
                  typename T3, typename A3,
                  typename T4, typename A4>
        uint64 add_task (
            void (*funct)(T1,T2,T3,T4),
            future<A1>& arg1,
            future<A2>& arg2,
            future<A3>& arg3,
            future<A4>& arg4
        ) 
        { 
            bfp_type temp;
            temp.set(funct, arg1.get(), arg2.get(), arg3.get(), arg4.get());
            uint64 id = impl->add_task_internal(temp);

            // tie the futures to this task
            arg1.task_id = id;
            arg1.tp = impl;
            arg2.task_id = id;
            arg2.tp = impl;
            arg3.task_id = id;
            arg3.tp = impl;
            arg4.task_id = id;
            arg4.tp = impl;
            return id;
        }

    private:

        shared_ptr_thread_safe<thread_pool_implementation> impl;

        // restricted functions
        thread_pool(thread_pool&);        // copy constructor
        thread_pool& operator=(thread_pool&);    // assignment operator

    };


// ----------------------------------------------------------------------------------------

    template <typename T>
    void future<T>::
    wait (
    ) const
    {
        if (tp)
        {
            tp->wait_for_task(task_id);
            tp.reset();
            task_id = 0;
        }
    }

}

// ----------------------------------------------------------------------------------------

#ifdef NO_MAKEFILE
#include "thread_pool_extension.cpp"
#endif

#endif // DLIB_THREAD_POOl_H__


