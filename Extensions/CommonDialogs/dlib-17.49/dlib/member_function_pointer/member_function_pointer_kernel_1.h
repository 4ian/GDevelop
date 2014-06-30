// Copyright (C) 2005  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_MEMBER_FUNCTION_POINTER_KERNEl_1_
#define DLIB_MEMBER_FUNCTION_POINTER_KERNEl_1_

#include "../algs.h"
#include "member_function_pointer_kernel_abstract.h"
#include "../enable_if.h"
#include <new>

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename PARAM1 = void,
        typename PARAM2 = void,
        typename PARAM3 = void,
        typename PARAM4 = void
        >
    class mfpk1;

// ----------------------------------------------------------------------------------------

    template <unsigned long num_args>
    class mfp_kernel_1_base_class
    {
        /*
            All member function pointer classes inherit from this class.  This
            is where most of the things in a member function pointer are defined.

            The reason for the num_args template argument to this class is to prevent
            any sort of implicit casting between derived member function pointer classes
            that take different numbers of arguments.
        */
    protected:
        enum mfp_type { mfp_nonconst, mfp_const, mfp_null};

        class mp_base_base
        {
        public:
            mp_base_base(void* ptr, mfp_type type_) : o(ptr),type(type_) {}
            virtual ~mp_base_base(){}
            virtual void clone(void* ptr) const = 0;
            virtual bool is_same (const mp_base_base* item) const = 0;
            bool is_set () const { return o!=0; }

            void* const o;
            const mfp_type type;
        };

        template <typename T>
        class mp_null : public mp_base_base 
        {
        public:
            typedef void (T::*mfp_pointer_type)() ;

            mp_null (void* , mfp_pointer_type ) : mp_base_base(0,mfp_null), callback(0) {}
            mp_null () : mp_base_base(0,mfp_null), callback(0) {}

            const mfp_pointer_type callback;
        };

        template <typename mp_impl>
        class mp_impl_T : public mp_impl 
        {
            /*
                This class supplies the implementations clone() and is_same() for any
                classes that inherit from mp_base_base.  It does this in a very
                roundabout way...
            */
               
        public:
            typedef typename mp_impl::mfp_pointer_type mfp_pointer_type;

            mp_impl_T() : mp_impl(0,0) {}
            mp_impl_T(void* ptr, mfp_pointer_type cb) : mp_impl(ptr,cb) {}

            template <unsigned long mem_size>
            void safe_clone(stack_based_memory_block<mem_size>& buf)
            {
                // This is here just to validate the assumption that our block of memory we have made
                // in mp_memory is the right size to store the data for this object.  If you
                // get a compiler error on this line then email me :)
                COMPILE_TIME_ASSERT(sizeof(mp_impl_T) <= mem_size);
                clone(buf.get());
            }

            void clone   (void* ptr) const  { new(ptr) mp_impl_T(this->o,this->callback); }
            bool is_same (const mp_base_base* item) const 
            {
                if (item->o == 0 && this->o == 0)
                {
                    return true;
                }
                else if (item->o == this->o && this->type == item->type)
                {
                    const mp_impl* i = reinterpret_cast<const mp_impl*>(item);
                    return (i->callback == this->callback);
                }
                return false;
            }
        };

        struct dummy_base { virtual void nonnull() {}; virtual ~dummy_base(){}; int a; };
        struct dummy : virtual public dummy_base{ void nonnull() {}; };

        typedef mp_impl_T<mp_null<dummy> > mp_null_impl;
    public:

        mfp_kernel_1_base_class (
            const mfp_kernel_1_base_class& item
        ) { item.mp()->clone(mp_memory.get()); }

        mfp_kernel_1_base_class (  
        ) { mp_null_impl().safe_clone(mp_memory); }

        bool operator == (
            const mfp_kernel_1_base_class& item
        ) const { return mp()->is_same(item.mp()); }

        bool operator != (
            const mfp_kernel_1_base_class& item
        ) const { return !(*this == item); }

        mfp_kernel_1_base_class& operator= (
            const mfp_kernel_1_base_class& item
        ) { mfp_kernel_1_base_class(item).swap(*this); return *this;  }

        ~mfp_kernel_1_base_class (
        ) { destroy_mp_memory(); }

        void clear(
        ) { mfp_kernel_1_base_class().swap(*this); }

        bool is_set (
        ) const { return mp()->is_set(); } 

    private:
        typedef void (dummy::*safe_bool)();

    public:
        operator safe_bool () const { return is_set() ? &dummy::nonnull : 0; }
        bool operator!() const { return !is_set(); }

        void swap (
            mfp_kernel_1_base_class& item
        ) 
        {  
            // make a temp copy of item
            mfp_kernel_1_base_class temp(item);

            // destory the stuff in item
            item.destroy_mp_memory();
            // copy *this into item
            mp()->clone(item.mp_memory.get());

            // destory the stuff in this 
            destroy_mp_memory();
            // copy temp into *this
            temp.mp()->clone(mp_memory.get());
        }

    protected:

        // The reason for adding 1 here is because visual studio 2003 will sometimes
        // try to compile this code with sizeof(mp_null_impl) == 0 (which is a bug in visual studio).
        // Fortunately, no actual real instances of this template seem to end up with that screwed up
        // value so everything works fine if we just add 1 so that this degenerate case doesn't cause
        // trouble.  Note that we know it all works fine because safe_clone() checks the size of this
        // memory block whenever the member function pointer is used.  
        stack_based_memory_block<sizeof(mp_null_impl)+1> mp_memory;

        void destroy_mp_memory (
        )
        {
            // Honestly this probably doesn't even do anything but I'm putting
            // it here just for good measure.
            mp()->~mp_base_base();
        }

        mp_base_base*       mp ()       { return static_cast<mp_base_base*>(mp_memory.get()); }
        const mp_base_base* mp () const { return static_cast<const mp_base_base*>(mp_memory.get()); }
        
    };

// ----------------------------------------------------------------------------------------

    template <>
    class mfpk1<void,void,void,void> : public mfp_kernel_1_base_class<0>
    {
        class mp_base : public mp_base_base {
        public:
            mp_base(void* ptr, mfp_type type_) : mp_base_base(ptr,type_) {}
            virtual void call() const = 0;
        };

        template <typename T>
        class mp_impl : public mp_base {
        public:
            typedef void (T::*mfp_pointer_type)() ;
            void call () const { (static_cast<T*>(this->o)->*callback)(); }

            mp_impl      ( void* object, mfp_pointer_type cb) : mp_base(object, mfp_nonconst), callback(cb) {}
            const mfp_pointer_type callback;
        };

        template <typename T>
        class mp_impl_const : public mp_base {
        public:
            typedef void ((T::*mfp_pointer_type)()const);
            void call () const  { (static_cast<const T*>(this->o)->*callback)(); }

            mp_impl_const ( void* object, mfp_pointer_type cb) : mp_base(object,mfp_const), callback(cb) {}
            const mfp_pointer_type callback;
        };

    public:
        typedef void param1_type;
        typedef void param2_type;
        typedef void param3_type;
        typedef void param4_type;

        void operator() () const { static_cast<const mp_base*>(mp_memory.get())->call(); }

        // the reason for putting disable_if on this function is that it avoids an overload
        // resolution bug in visual studio.
        template <typename T> typename disable_if<is_const_type<T>,void>::type 
        set(T& object, typename mp_impl<T>::mfp_pointer_type cb) 
        { destroy_mp_memory(); mp_impl_T<mp_impl<T> >(&object,cb).safe_clone(mp_memory); }

        template <typename T> void set(const T& object, typename mp_impl_const<T>::mfp_pointer_type cb) 
        { destroy_mp_memory(); mp_impl_T<mp_impl_const<T> >((void*)&object,cb).safe_clone(mp_memory); }

    };    

// ----------------------------------------------------------------------------------------

    template <
        typename PARAM1
        >
    class mfpk1<PARAM1,void,void,void> : public mfp_kernel_1_base_class<1>
    {
        class mp_base : public mp_base_base {
        public:
            mp_base(void* ptr, mfp_type type_) : mp_base_base(ptr,type_) {}
            virtual void call(PARAM1) const = 0;
        };

        template <typename T>
        class mp_impl : public mp_base {
        public:
            typedef void (T::*mfp_pointer_type)(PARAM1) ;
            void call (PARAM1 p1) const { (static_cast<T*>(this->o)->*callback)(p1); }

            mp_impl      ( void* object, mfp_pointer_type cb) : mp_base(object, mfp_nonconst), callback(cb) {}
            const mfp_pointer_type callback;
        };

        template <typename T>
        class mp_impl_const : public mp_base {
        public:
            typedef void ((T::*mfp_pointer_type)(PARAM1)const);
            void call (PARAM1 p1) const  { (static_cast<const T*>(this->o)->*callback)(p1); }

            mp_impl_const ( void* object, mfp_pointer_type cb) : mp_base(object,mfp_const), callback(cb) {}
            const mfp_pointer_type callback;
        };

    public:
        typedef PARAM1 param1_type;
        typedef void param2_type;
        typedef void param3_type;
        typedef void param4_type;

        void operator() (PARAM1 p1) const { static_cast<const mp_base*>(mp_memory.get())->call(p1); }

        // the reason for putting disable_if on this function is that it avoids an overload
        // resolution bug in visual studio.
        template <typename T> typename disable_if<is_const_type<T>,void>::type 
        set(T& object, typename mp_impl<T>::mfp_pointer_type cb) 
        { destroy_mp_memory(); mp_impl_T<mp_impl<T> >(&object,cb).safe_clone(mp_memory); }

        template <typename T> void set(const T& object, typename mp_impl_const<T>::mfp_pointer_type cb) 
        { destroy_mp_memory(); mp_impl_T<mp_impl_const<T> >((void*)&object,cb).safe_clone(mp_memory); }

    };    

// ----------------------------------------------------------------------------------------

    template <
        typename PARAM1,
        typename PARAM2
        >
    class mfpk1<PARAM1,PARAM2,void,void> : public mfp_kernel_1_base_class<2>
    {
        class mp_base : public mp_base_base {
        public:
            mp_base(void* ptr, mfp_type type_) : mp_base_base(ptr,type_) {}
            virtual void call(PARAM1,PARAM2) const = 0;
        };

        template <typename T>
        class mp_impl : public mp_base {
        public:
            typedef void (T::*mfp_pointer_type)(PARAM1,PARAM2) ;
            void call (PARAM1 p1, PARAM2 p2) const { (static_cast<T*>(this->o)->*callback)(p1,p2); }

            mp_impl      ( void* object, mfp_pointer_type cb) : mp_base(object, mfp_nonconst), callback(cb) {}
            const mfp_pointer_type callback;
        };

        template <typename T>
        class mp_impl_const : public mp_base {
        public:
            typedef void ((T::*mfp_pointer_type)(PARAM1,PARAM2)const);
            void call (PARAM1 p1, PARAM2 p2) const  { (static_cast<const T*>(this->o)->*callback)(p1,p2); }

            mp_impl_const ( void* object, mfp_pointer_type cb) : mp_base(object,mfp_const), callback(cb) {}
            const mfp_pointer_type callback;
        };

    public:
        typedef PARAM1 param1_type;
        typedef PARAM2 param2_type;
        typedef void param3_type;
        typedef void param4_type;

        void operator() (PARAM1 p1, PARAM2 p2) const { static_cast<const mp_base*>(mp_memory.get())->call(p1,p2); }

        // the reason for putting disable_if on this function is that it avoids an overload
        // resolution bug in visual studio.
        template <typename T> typename disable_if<is_const_type<T>,void>::type 
        set(T& object, typename mp_impl<T>::mfp_pointer_type cb) 
        { destroy_mp_memory(); mp_impl_T<mp_impl<T> >(&object,cb).safe_clone(mp_memory); }

        template <typename T> void set(const T& object, typename mp_impl_const<T>::mfp_pointer_type cb) 
        { destroy_mp_memory(); mp_impl_T<mp_impl_const<T> >((void*)&object,cb).safe_clone(mp_memory); }

    };    

// ----------------------------------------------------------------------------------------

    template <
        typename PARAM1,
        typename PARAM2,
        typename PARAM3
        >
    class mfpk1<PARAM1,PARAM2,PARAM3,void> : public mfp_kernel_1_base_class<3>
    {
        class mp_base : public mp_base_base {
        public:
            mp_base(void* ptr, mfp_type type_) : mp_base_base(ptr,type_) {}
            virtual void call(PARAM1,PARAM2,PARAM3) const = 0;
        };

        template <typename T>
        class mp_impl : public mp_base {
        public:
            typedef void (T::*mfp_pointer_type)(PARAM1,PARAM2,PARAM3) ;
            void call (PARAM1 p1, PARAM2 p2, PARAM3 p3) const { (static_cast<T*>(this->o)->*callback)(p1,p2,p3); }

            mp_impl      ( void* object, mfp_pointer_type cb) : mp_base(object, mfp_nonconst), callback(cb) {}
            const mfp_pointer_type callback;
        };

        template <typename T>
        class mp_impl_const : public mp_base {
        public:
            typedef void ((T::*mfp_pointer_type)(PARAM1,PARAM2,PARAM3)const);
            void call (PARAM1 p1, PARAM2 p2, PARAM3 p3) const  { (static_cast<const T*>(this->o)->*callback)(p1,p2,p3); }

            mp_impl_const ( void* object, mfp_pointer_type cb) : mp_base(object,mfp_const), callback(cb) {}
            const mfp_pointer_type callback;
        };

    public:
        typedef PARAM1 param1_type;
        typedef PARAM2 param2_type;
        typedef PARAM3 param3_type;
        typedef void param4_type;

        void operator() (PARAM1 p1, PARAM2 p2, PARAM3 p3) const { static_cast<const mp_base*>(mp_memory.get())->call(p1,p2,p3); }

        // the reason for putting disable_if on this function is that it avoids an overload
        // resolution bug in visual studio.
        template <typename T> typename disable_if<is_const_type<T>,void>::type 
        set(T& object, typename mp_impl<T>::mfp_pointer_type cb) 
        { destroy_mp_memory(); mp_impl_T<mp_impl<T> >(&object,cb).safe_clone(mp_memory); }

        template <typename T> void set(const T& object, typename mp_impl_const<T>::mfp_pointer_type cb) 
        { destroy_mp_memory(); mp_impl_T<mp_impl_const<T> >((void*)&object,cb).safe_clone(mp_memory); }

    };    

// ----------------------------------------------------------------------------------------

    template <
        typename PARAM1,
        typename PARAM2,
        typename PARAM3,
        typename PARAM4
        >
    class mfpk1 : public mfp_kernel_1_base_class<4>
    {
        class mp_base : public mp_base_base {
        public:
            mp_base(void* ptr, mfp_type type_) : mp_base_base(ptr,type_) {}
            virtual void call(PARAM1,PARAM2,PARAM3,PARAM4) const = 0;
        };

        template <typename T>
        class mp_impl : public mp_base {
        public:
            typedef void (T::*mfp_pointer_type)(PARAM1,PARAM2,PARAM3, PARAM4) ;
            void call (PARAM1 p1, PARAM2 p2, PARAM3 p3, PARAM4 p4) const { (static_cast<T*>(this->o)->*callback)(p1,p2,p3,p4); }

            mp_impl      ( void* object, mfp_pointer_type cb) : mp_base(object, mfp_nonconst), callback(cb) {}
            const mfp_pointer_type callback;
        };

        template <typename T>
        class mp_impl_const : public mp_base {
        public:
            typedef void ((T::*mfp_pointer_type)(PARAM1,PARAM2,PARAM3,PARAM4)const);
            void call (PARAM1 p1, PARAM2 p2, PARAM3 p3, PARAM4 p4) const  { (static_cast<const T*>(this->o)->*callback)(p1,p2,p3,p4); }

            mp_impl_const ( void* object, mfp_pointer_type cb) : mp_base(object,mfp_const), callback(cb) {}
            const mfp_pointer_type callback;
        };

    public:
        typedef PARAM1 param1_type;
        typedef PARAM2 param2_type;
        typedef PARAM3 param3_type;
        typedef PARAM4 param4_type;

        void operator() (PARAM1 p1, PARAM2 p2, PARAM3 p3, PARAM4 p4) const 
        { static_cast<const mp_base*>(mp_memory.get())->call(p1,p2,p3,p4); }

        // the reason for putting disable_if on this function is that it avoids an overload
        // resolution bug in visual studio.
        template <typename T> typename disable_if<is_const_type<T>,void>::type 
        set(T& object, typename mp_impl<T>::mfp_pointer_type cb) 
        { destroy_mp_memory(); mp_impl_T<mp_impl<T> >(&object,cb).safe_clone(mp_memory); }

        template <typename T> void set(const T& object, typename mp_impl_const<T>::mfp_pointer_type cb) 
        { destroy_mp_memory(); mp_impl_T<mp_impl_const<T> >((void*)&object,cb).safe_clone(mp_memory); }

    };    

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_MEMBER_FUNCTION_POINTER_KERNEl_1_

