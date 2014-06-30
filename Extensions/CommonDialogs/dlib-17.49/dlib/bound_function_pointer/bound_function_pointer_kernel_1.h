// Copyright (C) 2008  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_BOUND_FUNCTION_POINTER_KERNEl_1_
#define DLIB_BOUND_FUNCTION_POINTER_KERNEl_1_

#include "../algs.h"
#include "../member_function_pointer.h"
#include "bound_function_pointer_kernel_abstract.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    namespace bfp1_helpers
    {
        template <typename T> struct strip { typedef T type; };
        template <typename T> struct strip<T&> { typedef T type; };

    // ------------------------------------------------------------------------------------

        class bound_function_helper_base_base
        {
        public:
            virtual ~bound_function_helper_base_base(){}
            virtual void call() const = 0;
            virtual bool is_set() const = 0;
            virtual void clone(void* ptr) const = 0;
        };

    // ------------------------------------------------------------------------------------

        template <typename T1, typename T2, typename T3, typename T4>
        class bound_function_helper_base : public bound_function_helper_base_base
        {
        public:
            bound_function_helper_base():arg1(0), arg2(0), arg3(0), arg4(0) {}

            typename strip<T1>::type* arg1;
            typename strip<T2>::type* arg2;
            typename strip<T3>::type* arg3;
            typename strip<T4>::type* arg4;


            typename member_function_pointer<T1,T2,T3,T4>::kernel_1a_c mfp;
        };

    // ----------------

        template <typename F, typename T1 = void, typename T2 = void, typename T3 = void, typename T4 = void>
        class bound_function_helper : public bound_function_helper_base<T1,T2,T3,T4>
        {
        public:
            void call() const
            {
                (*fp)(*this->arg1, *this->arg2, *this->arg3, *this->arg4);
            }

            typename strip<F>::type* fp;
        };

        template <typename T1, typename T2, typename T3, typename T4>
        class bound_function_helper<void,T1,T2,T3,T4> : public bound_function_helper_base<T1,T2,T3,T4>
        {
        public:
            void call() const
            {
                if (this->mfp)    this->mfp(*this->arg1, *this->arg2, *this->arg3, *this->arg4);
                else if (fp) fp(*this->arg1, *this->arg2, *this->arg3, *this->arg4);
            }

            void (*fp)(T1, T2, T3, T4);
        };

    // ----------------

        template <typename F>
        class bound_function_helper<F,void,void,void,void> : public bound_function_helper_base<void,void,void,void>
        {
        public:
            void call() const
            {
                (*fp)();
            }

            typename strip<F>::type* fp;
        };

        template <>
        class bound_function_helper<void,void,void,void,void> : public bound_function_helper_base<void,void,void,void>
        {
        public:
            void call() const
            {
                if (this->mfp)    this->mfp();
                else if (fp) fp();
            }

            void (*fp)();
        };

    // ----------------

        template <typename F, typename T1>
        class bound_function_helper<F,T1,void,void,void> : public bound_function_helper_base<T1,void,void,void>
        {
        public:
            void call() const
            {
                (*fp)(*this->arg1);
            }

            typename strip<F>::type* fp;
        };

        template <typename T1>
        class bound_function_helper<void,T1,void,void,void> : public bound_function_helper_base<T1,void,void,void>
        {
        public:
            void call() const
            {
                if (this->mfp)    this->mfp(*this->arg1);
                else if (fp) fp(*this->arg1);
            }

            void (*fp)(T1);
        };

    // ----------------

        template <typename F, typename T1, typename T2>
        class bound_function_helper<F,T1,T2,void,void> : public bound_function_helper_base<T1,T2,void,void>
        {
        public:
            void call() const
            {
                (*fp)(*this->arg1, *this->arg2);
            }

            typename strip<F>::type* fp;
        };

        template <typename T1, typename T2>
        class bound_function_helper<void,T1,T2,void,void> : public bound_function_helper_base<T1,T2,void,void>
        {
        public:
            void call() const
            {
                if (this->mfp)    this->mfp(*this->arg1, *this->arg2);
                else if (fp) fp(*this->arg1, *this->arg2);
            }

            void (*fp)(T1, T2);
        };

    // ----------------

        template <typename F, typename T1, typename T2, typename T3>
        class bound_function_helper<F,T1,T2,T3,void> : public bound_function_helper_base<T1,T2,T3,void>
        {
        public:
            void call() const
            {
                (*fp)(*this->arg1, *this->arg2, *this->arg3);
            }

            typename strip<F>::type* fp;
        };

        template <typename T1, typename T2, typename T3>
        class bound_function_helper<void,T1,T2,T3,void> : public bound_function_helper_base<T1,T2,T3,void>
        {
        public:

            void call() const
            {
                if (this->mfp)    this->mfp(*this->arg1, *this->arg2, *this->arg3);
                else if (fp) fp(*this->arg1, *this->arg2, *this->arg3);
            }

            void (*fp)(T1, T2, T3);
        };

    // ------------------------------------------------------------------------------------
    // ------------------------------------------------------------------------------------

        template <typename T>
        class bound_function_helper_T : public T
        {
        public:
            bound_function_helper_T(){ this->fp = 0;}

            bool is_set() const
            {
                return this->fp != 0 || this->mfp.is_set();
            }

            template <unsigned long mem_size>
            void safe_clone(stack_based_memory_block<mem_size>& buf)
            {
                // This is here just to validate the assumption that our block of memory we have made
                // in bf_memory is the right size to store the data for this object.  If you
                // get a compiler error on this line then email me :)
                COMPILE_TIME_ASSERT(sizeof(bound_function_helper_T) <= mem_size);
                clone(buf.get());
            }

            void clone   (void* ptr) const  
            { 
                bound_function_helper_T* p = new(ptr) bound_function_helper_T(); 
                p->arg1 = this->arg1;
                p->arg2 = this->arg2;
                p->arg3 = this->arg3;
                p->arg4 = this->arg4;
                p->fp = this->fp;
                p->mfp = this->mfp;
            }
        };

    }

// ----------------------------------------------------------------------------------------

    class bound_function_pointer_kernel_1
    {
        typedef bfp1_helpers::bound_function_helper_T<bfp1_helpers::bound_function_helper<void,int> > bf_null_type;

    public:
        bound_function_pointer_kernel_1 (
        ) { bf_null_type().safe_clone(bf_memory); }

        bound_function_pointer_kernel_1 ( 
            const bound_function_pointer_kernel_1& item
        ) { item.bf()->clone(bf_memory.get()); }

        ~bound_function_pointer_kernel_1()
        { destroy_bf_memory(); }

        bound_function_pointer_kernel_1& operator= (
            const bound_function_pointer_kernel_1& item
        ) { bound_function_pointer_kernel_1(item).swap(*this); return *this; }

        void clear (
        ) { bound_function_pointer_kernel_1().swap(*this); }

        bool is_set (
        ) const
        {
            return bf()->is_set();
        }

        void swap (
            bound_function_pointer_kernel_1& item
        )
        {
            // make a temp copy of item
            bound_function_pointer_kernel_1 temp(item);

            // destory the stuff in item
            item.destroy_bf_memory();
            // copy *this into item
            bf()->clone(item.bf_memory.get());

            // destory the stuff in this 
            destroy_bf_memory();
            // copy temp into *this
            temp.bf()->clone(bf_memory.get());
        }

        void operator() (
        ) const
        {
            bf()->call();
        }

    private:
        struct dummy{ void nonnull() {}};
        typedef void (dummy::*safe_bool)();

    public:
        operator safe_bool () const { return is_set() ? &dummy::nonnull : 0; }
        bool operator!() const { return !is_set(); }

    // -------------------------------------------
    //      set function object overloads
    // -------------------------------------------

        template <typename F>
        void set (
            F& function_object
        )
        {
            COMPILE_TIME_ASSERT(is_function<F>::value == false);
            COMPILE_TIME_ASSERT(is_pointer_type<F>::value == false);
            
            using namespace bfp1_helpers;
            destroy_bf_memory();
            typedef bound_function_helper_T<bound_function_helper<F> > bf_helper_type;

            bf_helper_type temp;
            temp.fp = &function_object;

            temp.safe_clone(bf_memory);
        }

        template <typename F, typename A1 >
        void set (
            F& function_object,
            A1& arg1
        )
        {
            COMPILE_TIME_ASSERT(is_function<F>::value == false);
            COMPILE_TIME_ASSERT(is_pointer_type<F>::value == false);
            
            using namespace bfp1_helpers;
            destroy_bf_memory();
            typedef bound_function_helper_T<bound_function_helper<F,A1> > bf_helper_type;

            bf_helper_type temp;
            temp.arg1 = &arg1;
            temp.fp = &function_object;

            temp.safe_clone(bf_memory);
        }

        template <typename F, typename A1, typename A2 >
        void set (
            F& function_object,
            A1& arg1,
            A2& arg2
        )
        {
            COMPILE_TIME_ASSERT(is_function<F>::value == false);
            COMPILE_TIME_ASSERT(is_pointer_type<F>::value == false);
            
            using namespace bfp1_helpers;
            destroy_bf_memory();
            typedef bound_function_helper_T<bound_function_helper<F,A1,A2> > bf_helper_type;

            bf_helper_type temp;
            temp.arg1 = &arg1;
            temp.arg2 = &arg2;
            temp.fp = &function_object;

            temp.safe_clone(bf_memory);
        }

        template <typename F, typename A1, typename A2, typename A3 >
        void set (
            F& function_object,
            A1& arg1,
            A2& arg2,
            A3& arg3
        )
        {
            COMPILE_TIME_ASSERT(is_function<F>::value == false);
            COMPILE_TIME_ASSERT(is_pointer_type<F>::value == false);
            
            using namespace bfp1_helpers;
            destroy_bf_memory();
            typedef bound_function_helper_T<bound_function_helper<F,A1,A2,A3> > bf_helper_type;

            bf_helper_type temp;
            temp.arg1 = &arg1;
            temp.arg2 = &arg2;
            temp.arg3 = &arg3;
            temp.fp = &function_object;

            temp.safe_clone(bf_memory);
        }

        template <typename F, typename A1, typename A2, typename A3, typename A4>
        void set (
            F& function_object,
            A1& arg1,
            A2& arg2,
            A3& arg3,
            A4& arg4
        )
        {
            COMPILE_TIME_ASSERT(is_function<F>::value == false);
            COMPILE_TIME_ASSERT(is_pointer_type<F>::value == false);
            
            using namespace bfp1_helpers;
            destroy_bf_memory();
            typedef bound_function_helper_T<bound_function_helper<F,A1,A2,A3,A4> > bf_helper_type;

            bf_helper_type temp;
            temp.arg1 = &arg1;
            temp.arg2 = &arg2;
            temp.arg3 = &arg3;
            temp.arg4 = &arg4;
            temp.fp = &function_object;

            temp.safe_clone(bf_memory);
        }

    // -------------------------------------------
    //      set mfp overloads
    // -------------------------------------------

        template <typename T>
        void set (
            T& object,
            void (T::*funct)()
        )
        {
            using namespace bfp1_helpers;
            destroy_bf_memory();
            typedef bound_function_helper_T<bound_function_helper<void> > bf_helper_type;

            bf_helper_type temp;
            temp.mfp.set(object,funct);

            temp.safe_clone(bf_memory);
        }

        template <typename T >
        void set (
            const T& object,
            void (T::*funct)()const
        )
        {
            using namespace bfp1_helpers;
            destroy_bf_memory();
            typedef bound_function_helper_T<bound_function_helper<void> > bf_helper_type;

            bf_helper_type temp;
            temp.mfp.set(object,funct);

            temp.safe_clone(bf_memory);
        }

    // -------------------------------------------

        template <typename T, typename T1, typename A1 >
        void set (
            T& object,
            void (T::*funct)(T1),
            A1& arg1
        )
        {
            using namespace bfp1_helpers;
            destroy_bf_memory();
            typedef bound_function_helper_T<bound_function_helper<void,T1> > bf_helper_type;

            bf_helper_type temp;
            temp.arg1 = &arg1;
            temp.mfp.set(object,funct);

            temp.safe_clone(bf_memory);
        }

        template <typename T, typename T1, typename A1 >
        void set (
            const T& object,
            void (T::*funct)(T1)const,
            A1& arg1
        )
        {
            using namespace bfp1_helpers;
            destroy_bf_memory();
            typedef bound_function_helper_T<bound_function_helper<void,T1> > bf_helper_type;

            bf_helper_type temp;
            temp.arg1 = &arg1;
            temp.mfp.set(object,funct);

            temp.safe_clone(bf_memory);
        }

    // ----------------

        template <typename T, typename T1, typename A1,
        typename T2, typename A2>
        void set (
            T& object,
            void (T::*funct)(T1, T2),
            A1& arg1,
            A2& arg2
        )
        {
            using namespace bfp1_helpers;
            destroy_bf_memory();
            typedef bound_function_helper_T<bound_function_helper<void,T1,T2> > bf_helper_type;

            bf_helper_type temp;
            temp.arg1 = &arg1;
            temp.arg2 = &arg2;
            temp.mfp.set(object,funct);

            temp.safe_clone(bf_memory);
        }

        template <typename T, typename T1, typename A1,
        typename T2, typename A2>
        void set (
            const T& object,
            void (T::*funct)(T1, T2)const,
            A1& arg1,
            A2& arg2
        )
        {
            using namespace bfp1_helpers;
            destroy_bf_memory();
            typedef bound_function_helper_T<bound_function_helper<void,T1,T2> > bf_helper_type;

            bf_helper_type temp;
            temp.arg1 = &arg1;
            temp.arg2 = &arg2;
            temp.mfp.set(object,funct);

            temp.safe_clone(bf_memory);
        }

    // ----------------

        template <typename T, typename T1, typename A1,
        typename T2, typename A2,
        typename T3, typename A3>
        void set (
            T& object,
            void (T::*funct)(T1, T2, T3),
            A1& arg1,
            A2& arg2,
            A3& arg3
        )
        {
            using namespace bfp1_helpers;
            destroy_bf_memory();
            typedef bound_function_helper_T<bound_function_helper<void,T1,T2,T3> > bf_helper_type;

            bf_helper_type temp;
            temp.arg1 = &arg1;
            temp.arg2 = &arg2;
            temp.arg3 = &arg3;
            temp.mfp.set(object,funct);

            temp.safe_clone(bf_memory);
        }

        template <typename T, typename T1, typename A1,
        typename T2, typename A2,
        typename T3, typename A3>
        void set (
            const T& object,
            void (T::*funct)(T1, T2, T3)const,
            A1& arg1,
            A2& arg2,
            A3& arg3
        )
        {
            using namespace bfp1_helpers;
            destroy_bf_memory();
            typedef bound_function_helper_T<bound_function_helper<void,T1,T2,T3> > bf_helper_type;

            bf_helper_type temp;
            temp.arg1 = &arg1;
            temp.arg2 = &arg2;
            temp.arg3 = &arg3;
            temp.mfp.set(object,funct);

            temp.safe_clone(bf_memory);
        }

    // ----------------

        template <typename T, typename T1, typename A1,
        typename T2, typename A2,
        typename T3, typename A3,
        typename T4, typename A4>
        void set (
            T& object,
            void (T::*funct)(T1, T2, T3, T4),
            A1& arg1,
            A2& arg2,
            A3& arg3,
            A4& arg4
        )
        {
            using namespace bfp1_helpers;
            destroy_bf_memory();
            typedef bound_function_helper_T<bound_function_helper<void,T1,T2,T3,T4> > bf_helper_type;

            bf_helper_type temp;
            temp.arg1 = &arg1;
            temp.arg2 = &arg2;
            temp.arg3 = &arg3;
            temp.arg4 = &arg4;
            temp.mfp.set(object,funct);

            temp.safe_clone(bf_memory);
        }

        template <typename T, typename T1, typename A1,
        typename T2, typename A2,
        typename T3, typename A3,
        typename T4, typename A4>
        void set (
            const T& object,
            void (T::*funct)(T1, T2, T3, T4)const,
            A1& arg1,
            A2& arg2,
            A3& arg3,
            A4& arg4
        )
        {
            using namespace bfp1_helpers;
            destroy_bf_memory();
            typedef bound_function_helper_T<bound_function_helper<void,T1,T2,T3,T4> > bf_helper_type;

            bf_helper_type temp;
            temp.arg1 = &arg1;
            temp.arg2 = &arg2;
            temp.arg3 = &arg3;
            temp.arg4 = &arg4;
            temp.mfp.set(object,funct);

            temp.safe_clone(bf_memory);
        }

    // -------------------------------------------
    //      set fp overloads
    // -------------------------------------------

        void set (
            void (*funct)()
        )
        {
            using namespace bfp1_helpers;
            destroy_bf_memory();
            typedef bound_function_helper_T<bound_function_helper<void> > bf_helper_type;

            bf_helper_type temp;
            temp.fp = funct;

            temp.safe_clone(bf_memory);
        }

        template <typename T1, typename A1>
        void set (
            void (*funct)(T1),
            A1& arg1
        )
        {
            using namespace bfp1_helpers;
            destroy_bf_memory();
            typedef bound_function_helper_T<bound_function_helper<void,T1> > bf_helper_type;

            bf_helper_type temp;
            temp.arg1 = &arg1;
            temp.fp = funct;

            temp.safe_clone(bf_memory);
        }

        template <typename T1, typename A1,
        typename T2, typename A2>
        void set (
            void (*funct)(T1, T2),
            A1& arg1,
            A2& arg2
        )
        {
            using namespace bfp1_helpers;
            destroy_bf_memory();
            typedef bound_function_helper_T<bound_function_helper<void,T1,T2> > bf_helper_type;

            bf_helper_type temp;
            temp.arg1 = &arg1;
            temp.arg2 = &arg2;
            temp.fp = funct;

            temp.safe_clone(bf_memory);
        }

        template <typename T1, typename A1,
        typename T2, typename A2,
        typename T3, typename A3>
        void set (
            void (*funct)(T1, T2, T3),
            A1& arg1,
            A2& arg2,
            A3& arg3
        )
        {
            using namespace bfp1_helpers;
            destroy_bf_memory();
            typedef bound_function_helper_T<bound_function_helper<void,T1,T2,T3> > bf_helper_type;

            bf_helper_type temp;
            temp.arg1 = &arg1;
            temp.arg2 = &arg2;
            temp.arg3 = &arg3;
            temp.fp = funct;

            temp.safe_clone(bf_memory);
        }

        template <typename T1, typename A1,
        typename T2, typename A2,
        typename T3, typename A3,
        typename T4, typename A4>
        void set (
            void (*funct)(T1, T2, T3, T4),
            A1& arg1,
            A2& arg2,
            A3& arg3,
            A4& arg4
        )
        {
            using namespace bfp1_helpers;
            destroy_bf_memory();
            typedef bound_function_helper_T<bound_function_helper<void,T1,T2,T3,T4> > bf_helper_type;

            bf_helper_type temp;
            temp.arg1 = &arg1;
            temp.arg2 = &arg2;
            temp.arg3 = &arg3;
            temp.arg4 = &arg4;
            temp.fp = funct;

            temp.safe_clone(bf_memory);
        }

    // -------------------------------------------

    private:

        stack_based_memory_block<sizeof(bf_null_type)> bf_memory;

        void destroy_bf_memory (
        )
        {
            // Honestly, this probably doesn't even do anything but I'm putting
            // it here just for good measure.
            bf()->~bound_function_helper_base_base();
        }

        bfp1_helpers::bound_function_helper_base_base*       bf ()       
        { return static_cast<bfp1_helpers::bound_function_helper_base_base*>(bf_memory.get()); }

        const bfp1_helpers::bound_function_helper_base_base* bf () const 
        { return static_cast<const bfp1_helpers::bound_function_helper_base_base*>(bf_memory.get()); }

    };

// ----------------------------------------------------------------------------------------

    inline void swap (
        bound_function_pointer_kernel_1& a,
        bound_function_pointer_kernel_1& b
    ) { a.swap(b); }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_BOUND_FUNCTION_POINTER_KERNEl_1_

