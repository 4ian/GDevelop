// Copyright (C) 2008  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_THREAD_POOl_ABSTRACT_Hh_
#ifdef DLIB_THREAD_POOl_ABSTRACT_Hh_ 

#include "threads_kernel_abstract.h"
#include "../uintn.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    class future
    {
        /*!
            INITIAL VALUE 
                - is_ready() == true

            WHAT THIS OBJECT REPRESENTS
                This object represents a container that allows you to safely pass objects 
                into the tasks performed by the thread_pool object defined below.  An
                example will make it clear:

                    // Suppose you have a global function defined as follows
                    void add (int a, int b, int& result) { result = a + b; }

                    // Also suppose you have a thread_pool named tp defined somewhere.
                    // Then you could do the following.
                    future<int> a, b, result;
                    a = 3;
                    b = 4;
                    // this function call causes another thread to execute a call to the add() function
                    // and passes in the int objects contained in a, b, and result
                    tp.add_task(add,a,b,result);
                    // This line will wait for the task in the thread pool to finish and then print the
                    // value in the result integer.  So it will print a 7.
                    cout << result << endl;
        !*/

    public:
        future (
        );
        /*!
            ensures
                - The object of type T contained in this future has
                  an initial value for its type. 
                - #is_ready() == true
        !*/

        future (
            const T& item
        );
        /*!
            ensures
                - #get() == item
                - #is_ready() == true
        !*/

        future (
            const future& item
        ); 
        /*!
            ensures
                - if (item.is_ready() == false) then
                    - the call to this function blocks until the thread processing the task related
                      to the item future has finished.
                - #is_ready() == true
                - #item.is_ready() == true
                - #get() == item.get()
        !*/

        ~future (
        );
        /*!
            ensures
                - if (is_ready() == false) then
                    - the call to this function blocks until the thread processing the task related
                      to this future has finished.
        !*/

        bool is_ready (
        ) const;
        /*!
            ensures
                - if (the value of this future may not yet be ready to be accessed because it 
                  is in use by a task in a thread_pool) then
                    - returns false 
                - else
                    - returns true 
        !*/

        future& operator=(
            const T& item
        );
        /*!
            ensures
                - if (is_ready() == false) then
                    - the call to this function blocks until the thread processing the task related
                      to this future has finished.
                - #is_ready() == true
                - #get() == item
                - returns *this
        !*/

        future& operator=(
            const future& item
        );
        /*!
            ensures
                - if (is_ready() == false || item.is_ready() == false) then
                    - the call to this function blocks until the threads processing the tasks related
                      to this future and the item future have finished.
                - #is_ready() == true
                - #item.is_ready() == true
                - #get() == item.get()
                - returns *this
        !*/

        operator T& (
        );
        /*!
            ensures
                - if (is_ready() == false) then
                    - the call to this function blocks until the thread processing the task related
                      to this future has finished.
                - #is_ready() == true
                - returns get()
        !*/

        operator const T& (
        ) const;
        /*!
            ensures
                - if (is_ready() == false) then
                    - the call to this function blocks until the thread processing the task related
                      to this future has finished.
                - #is_ready() == true
                - returns get()
        !*/

        T& get (
        );
        /*!
            ensures
                - if (is_ready() == false) then
                    - the call to this function blocks until the thread processing the task related
                      to this future has finished.
                - #is_ready() == true
                - returns a non-const reference to the object of type T contained inside this future
        !*/

        const T& get (
        ) const;
        /*!
            ensures
                - if (is_ready() == false) then
                    - the call to this function blocks until the thread processing the task related
                      to this future has finished.
                - #is_ready() == true
                - returns a const reference to the object of type T contained inside this future
        !*/

    };

// ----------------------------------------------------------------------------------------

    template <typename T>
    inline void swap (
        future<T>& a,
        future<T>& b
    ) { std::swap(a.get(), b.get()); }
    /*!
        provides a global swap function
    !*/

// ----------------------------------------------------------------------------------------


//  The future object comes with overloads for all the usual comparison operators.

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

    class thread_pool 
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object represents a fixed size group of threads which you can
                submit tasks to and then wait for those tasks to be completed. 

                Note that setting the number of threads to 0 is a valid way to
                use this object.  It causes it to not contain any threads
                at all.  When tasks are submitted to the object in this mode
                the tasks are processed within the calling thread.  So in this
                mode any thread that calls add_task() is considered to be
                a thread_pool thread capable of executing tasks.

                This object is also implemented such that no memory allocations occur 
                after the thread_pool has been constructed so long as the user doesn't 
                call any of the add_task_by_value() routines.  The future object also 
                doesn't perform any memory allocations or contain any system resources 
                such as mutex objects. 

            EXCEPTIONS
                Note that if an exception is thrown inside a task thread and 
                is not caught then the normal rule for uncaught exceptions in
                threads applies. That is, the application will be terminated.
        !*/

    public:
        explicit thread_pool (
            unsigned long num_threads
        );
        /*!
            ensures
                - #num_threads_in_pool() == num_threads
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
                - blocks until all tasks in the pool have finished.
        !*/

        bool is_task_thread (
        ) const;
        /*!
            ensures
                - if (the thread calling this function is one of the threads in this
                  thread pool or num_threads_in_pool() == 0) then
                    - returns true
                - else
                    - returns false
        !*/

        unsigned long num_threads_in_pool (
        ) const;
        /*!
            ensures
                - returns the number of threads contained in this thread pool.  That is, returns
                  the maximum number of tasks that this object will process concurrently.
        !*/

        template <typename F>
        uint64 add_task_by_value (
            const F& function_object
        );
        /*!
            requires
                - function_object() is a valid expression 
            ensures
                - makes a copy of function_object, call it FCOPY.
                - if (is_task_thread() == true and there aren't any free threads available) then
                    - calls FCOPY() within the calling thread and returns when it finishes
                - else
                    - the call to this function blocks until there is a free thread in the pool
                      to process this new task.  Once a free thread is available the task
                      is handed off to that thread which then calls FCOPY().
                - returns a task id that can be used by this->wait_for_task() to wait
                  for the submitted task to finish.
        !*/

        template <typename T>
        uint64 add_task (
            T& obj,
            void (T::*funct)()
        );
        /*!
            requires
                - funct == a valid member function pointer for class T
                - obj will not go out of scope until after the task has completed (i.e. 
                  this function passes obj to the task by reference.  If you want to avoid
                  this restriction then use add_task_by_value())
            ensures
                - if (is_task_thread() == true and there aren't any free threads available) then
                    - calls (obj.*funct)() within the calling thread and returns
                      when it finishes.
                - else
                    - the call to this function blocks until there is a free thread in the pool
                      to process this new task.  Once a free thread is available the task
                      is handed off to that thread which then calls (obj.*funct)()
                - returns a task id that can be used by this->wait_for_task() to wait
                  for the submitted task to finish.
        !*/

        template <typename T>
        uint64 add_task_by_value (
            const T& obj,
            void (T::*funct)() 
        ); 
        /*!
            requires
                - funct == a valid member function pointer for class T
            ensures
                - makes a copy of obj, call it OBJ_COPY.
                - if (is_task_thread() == true and there aren't any free threads available) then
                    - calls (OBJ_COPY.*funct)() within the calling thread and returns 
                      when it finishes.
                - else
                    - the call to this function blocks until there is a free thread in the pool
                      to process this new task.  Once a free thread is available the task
                      is handed off to that thread which then calls (OBJ_COPY.*funct)().
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
                - obj will not go out of scope until after the task has completed (i.e. 
                  this function passes obj to the task by reference.  If you want to avoid
                  this restriction then use add_task_by_value())
            ensures
                - if (is_task_thread() == true and there aren't any free threads available) then
                    - calls (obj.*funct)(arg1) within the calling thread and returns
                      when it finishes
                - else
                    - the call to this function blocks until there is a free thread in the pool
                      to process this new task.  Once a free thread is available the task
                      is handed off to that thread which then calls (obj.*funct)(arg1)
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
                - obj will not go out of scope until after the task has completed (i.e. 
                  this function passes obj to the task by reference.  If you want to avoid
                  this restriction then use add_task_by_value())
            ensures
                - if (is_task_thread() == true and there aren't any free threads available) then
                    - calls (obj.*funct)(arg1,arg2) within the calling thread and returns
                      when it finishes
                - else
                    - the call to this function blocks until there is a free thread in the pool
                      to process this new task.  Once a free thread is available the task
                      is handed off to that thread which then calls (obj.*funct)(arg1,arg2)
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

        // --------------------

        template <typename F, typename A1>
        uint64 add_task (
            F& function_object,
            future<A1>& arg1
        );
        /*!
            requires
                - function_object(arg1.get()) is a valid expression 
                  (i.e. The A1 type stored in the future must be a type that can be passed into the given function object)
                - function_object will not go out of scope until after the task has completed (i.e. 
                  this function passes function_object to the task by reference.  If you want to avoid
                  this restriction then use add_task_by_value())
            ensures
                - if (is_task_thread() == true and there aren't any free threads available) then
                    - calls function_object(arg1.get()) within the calling thread and returns
                      when it finishes
                - else
                    - the call to this function blocks until there is a free thread in the pool
                      to process this new task.  Once a free thread is available the task
                      is handed off to that thread which then calls function_object(arg1.get()).
                - #arg1.is_ready() == false 
                - returns a task id that can be used by this->wait_for_task() to wait
                  for the submitted task to finish.
        !*/

        template <typename F, typename A1>
        uint64 add_task_by_value (
            const F& function_object,
            future<A1>& arg1
        );
        /*!
            requires
                - function_object(arg1.get()) is a valid expression 
                  (i.e. The A1 type stored in the future must be a type that can be passed into the given function object)
            ensures
                - makes a copy of function_object, call it FCOPY.
                - if (is_task_thread() == true and there aren't any free threads available) then
                    - calls FCOPY(arg1.get()) within the calling thread and returns when it finishes
                - else
                    - the call to this function blocks until there is a free thread in the pool
                      to process this new task.  Once a free thread is available the task
                      is handed off to that thread which then calls FCOPY(arg1.get()).
                - #arg1.is_ready() == false 
                - returns a task id that can be used by this->wait_for_task() to wait
                  for the submitted task to finish.
        !*/

        template <typename T, typename T1, typename A1>
        uint64 add_task (
            T& obj,
            void (T::*funct)(T1),
            future<A1>& arg1
        ); 
        /*!
            requires
                - funct == a valid member function pointer for class T
                - (obj.*funct)(arg1.get()) must be a valid expression.
                  (i.e. The A1 type stored in the future must be a type that can be passed into the given function)
                - obj will not go out of scope until after the task has completed (i.e. 
                  this function passes obj to the task by reference.  If you want to avoid
                  this restriction then use add_task_by_value())
            ensures
                - if (is_task_thread() == true and there aren't any free threads available) then
                    - calls (obj.*funct)(arg1.get()) within the calling thread and returns
                      when it finishes
                - else
                    - the call to this function blocks until there is a free thread in the pool
                      to process this new task.  Once a free thread is available the task
                      is handed off to that thread which then calls (obj.*funct)(arg1.get()).
                - #arg1.is_ready() == false 
                - returns a task id that can be used by this->wait_for_task() to wait
                  for the submitted task to finish.
        !*/
        
        template <typename T, typename T1, typename A1>
        uint64 add_task_by_value (
            const T& obj,
            void (T::*funct)(T1),
            future<A1>& arg1
        ); 
        /*!
            requires
                - funct == a valid member function pointer for class T
                - (obj.*funct)(arg1.get()) must be a valid expression.
                  (i.e. The A1 type stored in the future must be a type that can be passed into the given function)
            ensures
                - makes a copy of obj, call it OBJ_COPY.
                - if (is_task_thread() == true and there aren't any free threads available) then
                    - calls (OBJ_COPY.*funct)(arg1.get()) within the calling thread and returns 
                      when it finishes.
                - else
                    - the call to this function blocks until there is a free thread in the pool
                      to process this new task.  Once a free thread is available the task
                      is handed off to that thread which then calls (OBJ_COPY.*funct)(arg1.get()).
                - returns a task id that can be used by this->wait_for_task() to wait
                  for the submitted task to finish.
        !*/

        template <typename T, typename T1, typename A1>
        uint64 add_task (
            const T& obj,
            void (T::*funct)(T1) const,
            future<A1>& arg1
        ); 
        /*!
            requires
                - funct == a valid member function pointer for class T
                - (obj.*funct)(arg1.get()) must be a valid expression.
                  (i.e. The A1 type stored in the future must be a type that can be passed into the given function)
                - obj will not go out of scope until after the task has completed (i.e. 
                  this function passes obj to the task by reference.  If you want to avoid
                  this restriction then use add_task_by_value())
            ensures
                - if (is_task_thread() == true and there aren't any free threads available) then
                    - calls (obj.*funct)(arg1.get()) within the calling thread and returns
                      when it finishes
                - else
                    - the call to this function blocks until there is a free thread in the pool
                      to process this new task.  Once a free thread is available the task
                      is handed off to that thread which then calls (obj.*funct)(arg1.get()).
                - #arg1.is_ready() == false 
                - returns a task id that can be used by this->wait_for_task() to wait
                  for the submitted task to finish.
        !*/
        
        template <typename T, typename T1, typename A1>
        uint64 add_task_by_value (
            const T& obj,
            void (T::*funct)(T1) const,
            future<A1>& arg1
        ); 
        /*!
            requires
                - funct == a valid member function pointer for class T
                - (obj.*funct)(arg1.get()) must be a valid expression.
                  (i.e. The A1 type stored in the future must be a type that can be passed into the given function)
            ensures
                - makes a copy of obj, call it OBJ_COPY.
                - if (is_task_thread() == true and there aren't any free threads available) then
                    - calls (OBJ_COPY.*funct)(arg1.get()) within the calling thread and returns 
                      when it finishes.
                - else
                    - the call to this function blocks until there is a free thread in the pool
                      to process this new task.  Once a free thread is available the task
                      is handed off to that thread which then calls (OBJ_COPY.*funct)(arg1.get()).
                - returns a task id that can be used by this->wait_for_task() to wait
                  for the submitted task to finish.
        !*/

        template <typename T1, typename A1>
        uint64 add_task (
            void (*funct)(T1),
            future<A1>& arg1
        ); 
        /*!
            requires
                - funct == a valid function pointer 
                - (funct)(arg1.get()) must be a valid expression.
                  (i.e. The A1 type stored in the future must be a type that can be passed into the given function)
            ensures
                - if (is_task_thread() == true and there aren't any free threads available) then
                    - calls funct(arg1.get()) within the calling thread and returns
                      when it finishes
                - else
                    - the call to this function blocks until there is a free thread in the pool
                      to process this new task.  Once a free thread is available the task
                      is handed off to that thread which then calls funct(arg1.get()).
                - #arg1.is_ready() == false 
                - returns a task id that can be used by this->wait_for_task() to wait
                  for the submitted task to finish.
        !*/

        // --------------------------------------------------------------------------------
        // The remainder of this class just contains overloads for add_task() and add_task_by_value() 
        // that take up to 4 futures (as well as 0 futures).  Their behavior is identical to the above 
        // add_task() and add_task_by_value() functions.
        // --------------------------------------------------------------------------------

        template <typename F, typename A1, typename A2>
        uint64 add_task (
            F& function_object,
            future<A1>& arg1,
            future<A2>& arg2
        );

        template <typename F, typename A1, typename A2>
        uint64 add_task_by_value (
            const F& function_object,
            future<A1>& arg1,
            future<A2>& arg2
        );

        template <typename T, typename T1, typename A1,
                              typename T2, typename A2>
        uint64 add_task (
            T& obj,
            void (T::*funct)(T1,T2),
            future<A1>& arg1,
            future<A2>& arg2
        ); 
        
        uint64 add_task_by_value (
            const T& obj,
            void (T::*funct)(T1,T2),
            future<A1>& arg1,
            future<A2>& arg2
        ); 

        template <typename T, typename T1, typename A1,
                              typename T2, typename A2>
        uint64 add_task (
            const T& obj,
            void (T::*funct)(T1,T2) const,
            future<A1>& arg1,
            future<A2>& arg2
        ); 
        
        template <typename T, typename T1, typename A1,
                              typename T2, typename A2>
        uint64 add_task_by_value (
            const T& obj,
            void (T::*funct)(T1,T2) const,
            future<A1>& arg1,
            future<A2>& arg2
        ); 

        template <typename T1, typename A1,
                  typename T2, typename A2>
        uint64 add_task (
            void (*funct)(T1,T2),
            future<A1>& arg1,
            future<A2>& arg2
        ); 

        // --------------------

        template <typename F, typename A1, typename A2, typename A3>
        uint64 add_task (
            F& function_object,
            future<A1>& arg1,
            future<A2>& arg2,
            future<A3>& arg3
        );

        template <typename F, typename A1, typename A2, typename A3>
        uint64 add_task_by_value (
            const F& function_object,
            future<A1>& arg1,
            future<A2>& arg2,
            future<A3>& arg3
        );

        template <typename T, typename T1, typename A1,
                              typename T2, typename A2,
                              typename T3, typename A3>
        uint64 add_task (
            T& obj,
            void (T::*funct)(T1,T2,T3),
            future<A1>& arg1,
            future<A2>& arg2,
            future<A3>& arg3
        ); 

        template <typename T, typename T1, typename A1,
                              typename T2, typename A2,
                              typename T3, typename A3>
        uint64 add_task_by_value (
            const T& obj,
            void (T::*funct)(T1,T2,T3),
            future<A1>& arg1,
            future<A2>& arg2,
            future<A3>& arg3
        ); 
        
        template <typename T, typename T1, typename A1,
                              typename T2, typename A2,
                              typename T3, typename A3>
        uint64 add_task (
            const T& obj,
            void (T::*funct)(T1,T2,T3) const,
            future<A1>& arg1,
            future<A2>& arg2,
            future<A3>& arg3
        ); 

        template <typename T, typename T1, typename A1,
                              typename T2, typename A2,
                              typename T3, typename A3>
        uint64 add_task_by_value (
            const T& obj,
            void (T::*funct)(T1,T2,T3) const,
            future<A1>& arg1,
            future<A2>& arg2,
            future<A3>& arg3
        ); 
        
        template <typename T1, typename A1,
                  typename T2, typename A2,
                  typename T3, typename A3>
        uint64 add_task (
            void (*funct)(T1,T2,T3),
            future<A1>& arg1,
            future<A2>& arg2,
            future<A3>& arg3
        ); 

        // --------------------

        template <typename F, typename A1, typename A2, typename A3, typename A4>
        uint64 add_task (
            F& function_object,
            future<A1>& arg1,
            future<A2>& arg2,
            future<A3>& arg3,
            future<A4>& arg4
        );

        template <typename F, typename A1, typename A2, typename A3, typename A4>
        uint64 add_task_by_value (
            const F& function_object,
            future<A1>& arg1,
            future<A2>& arg2,
            future<A3>& arg3,
            future<A4>& arg4
        );

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
        ); 

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
        ); 
        
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
        ); 

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
        ); 
        
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
        );

        // --------------------

        template <typename F>
        uint64 add_task (
            F& function_object
        );

        template <typename T>
        uint64 add_task (
            const T& obj,
            void (T::*funct)() const,
        ); 
        
        template <typename T>
        uint64 add_task_by_value (
            const T& obj,
            void (T::*funct)() const
        ); 

        uint64 add_task (
            void (*funct)()
        ); 

        // --------------------

    private:

        // restricted functions
        thread_pool(thread_pool&);        // copy constructor
        thread_pool& operator=(thread_pool&);    // assignment operator
    };

}

// ----------------------------------------------------------------------------------------

#endif // DLIB_THREAD_POOl_ABSTRACT_Hh_



