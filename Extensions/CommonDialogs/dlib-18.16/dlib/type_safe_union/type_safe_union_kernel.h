// Copyright (C) 2009  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_TYPE_SAFE_UNIOn_h_ 
#define DLIB_TYPE_SAFE_UNIOn_h_

#include "type_safe_union_kernel_abstract.h"
#include "../algs.h"
#include "../noncopyable.h"
#include "../serialize.h"
#include <new>
#include <iostream>

namespace dlib
{

// ----------------------------------------------------------------------------------------

    class bad_type_safe_union_cast : public std::bad_cast 
    {
    public:
          virtual const char * what() const throw()
          {
              return "bad_type_safe_union_cast";
          }
    };

// ----------------------------------------------------------------------------------------

    struct _void{};
    inline void serialize( const _void&, std::ostream&){}
    inline void deserialize(  _void&, std::istream&){}

// ----------------------------------------------------------------------------------------

    template <
        typename T1,
        typename T2 = _void,
        typename T3 = _void,
        typename T4 = _void,
        typename T5 = _void, 
        typename T6 = _void,
        typename T7 = _void,
        typename T8 = _void,
        typename T9 = _void,
        typename T10 = _void,

        typename T11 = _void,
        typename T12 = _void,
        typename T13 = _void,
        typename T14 = _void,
        typename T15 = _void,
        typename T16 = _void,
        typename T17 = _void,
        typename T18 = _void,
        typename T19 = _void,
        typename T20 = _void
        >
    class type_safe_union : noncopyable
    {
        /*!
            CONVENTION
                - is_empty() ==  (type_identity == 0)
                - contains<T>() == (type_identity == get_type_id<T>())
                - mem.get() == the block of memory on the stack which is
                  where objects in the union are stored
        !*/

    private:

        template <typename T, typename U>
        void invoke_on (
            T& obj,
            U& item
        ) const
        {
            obj(item);
        }

        template <typename T>
        void invoke_on (
            T& ,
            _void 
        ) const
        {
        }


        const static size_t max_size = tmax<tmax<tmax<tmax<tmax<tmax<tmax<tmax<tmax<tmax<
                                       tmax<tmax<tmax<tmax<tmax<tmax<tmax<tmax<tmax<sizeof(T1),
                                                        sizeof(T2)>::value,
                                                        sizeof(T3)>::value,
                                                        sizeof(T4)>::value,
                                                        sizeof(T5)>::value,
                                                        sizeof(T6)>::value,
                                                        sizeof(T7)>::value,
                                                        sizeof(T8)>::value,
                                                        sizeof(T9)>::value,
                                                        sizeof(T10)>::value,
                                                        sizeof(T11)>::value,
                                                        sizeof(T12)>::value,
                                                        sizeof(T13)>::value,
                                                        sizeof(T14)>::value,
                                                        sizeof(T15)>::value,
                                                        sizeof(T16)>::value,
                                                        sizeof(T17)>::value,
                                                        sizeof(T18)>::value,
                                                        sizeof(T19)>::value,
                                                        sizeof(T20)>::value;

        // --------------------------------------------

        // member data
        stack_based_memory_block<max_size> mem;
        int type_identity;

        // --------------------------------------------

        template <typename T>
        void validate_type() const
        {
            // ERROR: You are trying to get a type of object that isn't
            // representable by this type_safe_union.  I.e. The given
            // type T isn't one of the ones given to this object's template
            // arguments.
            COMPILE_TIME_ASSERT(( is_same_type<T,T1>::value ||
                                 is_same_type<T,T2>::value ||
                                 is_same_type<T,T3>::value ||
                                 is_same_type<T,T4>::value ||
                                 is_same_type<T,T5>::value ||
                                 is_same_type<T,T6>::value ||
                                 is_same_type<T,T7>::value ||
                                 is_same_type<T,T8>::value ||
                                 is_same_type<T,T9>::value ||
                                 is_same_type<T,T10>::value ||

                                 is_same_type<T,T11>::value ||
                                 is_same_type<T,T12>::value ||
                                 is_same_type<T,T13>::value ||
                                 is_same_type<T,T14>::value ||
                                 is_same_type<T,T15>::value ||
                                 is_same_type<T,T16>::value ||
                                 is_same_type<T,T17>::value ||
                                 is_same_type<T,T18>::value ||
                                 is_same_type<T,T19>::value ||
                                 is_same_type<T,T20>::value 
                                    ));

        }


        struct destruct_helper
        {
            template <typename T>
            void operator() (T& item) const
            {
                item.~T();
            }
        };

        void destruct (
        ) 
        /*!
            ensures
                - #is_empty() == true
        !*/
        {
            // destruct whatever is in this object
            apply_to_contents(destruct_helper());

            // mark this object as being empty
            type_identity = 0;
        }

        template <typename T>
        void construct (
        )  
        { 
            if (type_identity != get_type_id<T>())
            {
                destruct(); 
                new(mem.get()) T(); 
                type_identity = get_type_id<T>();
            }
        }

        template <typename T>
        void construct (
            const T& item
        )  
        { 
            if (type_identity != get_type_id<T>())
            {
                destruct(); 
                new(mem.get()) T(item); 
                type_identity = get_type_id<T>();
            }
        }

        template <typename T> 
        T& unchecked_get(
        ) 
        /*!
            requires
                - contains<T>() == true
            ensures
                - returns a non-const reference to the T object
        !*/
        { 
            return *static_cast<T*>(mem.get()); 
        }

        template <typename T> 
        const T& unchecked_get(
        ) const
        /*!
            requires
                - contains<T>() == true
            ensures
                - returns a const reference to the T object
        !*/
        { 
            return *static_cast<const T*>(mem.get()); 
        }

        template <typename T>
        void operator() (T& item) 
        /*
            This function is used by the swap function of this class.  See that
            function to see how this works.
        */
        {
            exchange(get<T>(), item);
        }

    public:

        typedef T1 type1;
        typedef T2 type2;
        typedef T3 type3;
        typedef T4 type4;
        typedef T5 type5;
        typedef T6 type6;
        typedef T7 type7;
        typedef T8 type8;
        typedef T9 type9;
        typedef T10 type10;
        typedef T11 type11;
        typedef T12 type12;
        typedef T13 type13;
        typedef T14 type14;
        typedef T15 type15;
        typedef T16 type16;
        typedef T17 type17;
        typedef T18 type18;
        typedef T19 type19;
        typedef T20 type20;


        type_safe_union() : type_identity(0) 
        { 
        }

        template <typename T>
        type_safe_union (
            const T& item
        ) : type_identity(0)
        {
            validate_type<T>();
            construct(item);
        }

        ~type_safe_union()
        {
            destruct();
        }

        template <typename T>
        static int get_type_id (
        ) 
        {
            if (is_same_type<T,T1>::value) return 1;
            if (is_same_type<T,T2>::value) return 2;
            if (is_same_type<T,T3>::value) return 3;
            if (is_same_type<T,T4>::value) return 4;
            if (is_same_type<T,T5>::value) return 5;

            if (is_same_type<T,T6>::value) return 6;
            if (is_same_type<T,T7>::value) return 7;
            if (is_same_type<T,T8>::value) return 8;
            if (is_same_type<T,T9>::value) return 9;
            if (is_same_type<T,T10>::value) return 10;

            if (is_same_type<T,T11>::value) return 11;
            if (is_same_type<T,T12>::value) return 12;
            if (is_same_type<T,T13>::value) return 13;
            if (is_same_type<T,T14>::value) return 14;
            if (is_same_type<T,T15>::value) return 15;

            if (is_same_type<T,T16>::value) return 16;
            if (is_same_type<T,T17>::value) return 17;
            if (is_same_type<T,T18>::value) return 18;
            if (is_same_type<T,T19>::value) return 19;
            if (is_same_type<T,T20>::value) return 20;

            // return a number that doesn't match any of the
            // valid states of type_identity
            return -1;
        }

        template <typename T>
        bool contains (
        ) const
        {
            return type_identity == get_type_id<T>();
        }

        bool is_empty (
        ) const
        {
            return type_identity == 0;
        }


    public:

        template <
            typename t1, typename t2, typename t3, typename t4, typename t5,
            typename t6, typename t7, typename t8, typename t9, typename t10,
            typename t11, typename t12, typename t13, typename t14, typename t15,
            typename t16, typename t17, typename t18, typename t19, typename t20
            >
        friend void serialize (
            const type_safe_union<t1,t2,t3,t4,t5,t6,t7,t8,t9,t10, t11,t12,t13,t14,t15,t16,t17,t18,t19,t20>& item,
            std::ostream& out
        );


        template <
            typename T
            >
        void apply_to_contents (
            T& obj
        ) 
        {
            switch (type_identity)
            {
                // do nothing because we are empty
                case 0: break;

                case 1: invoke_on(obj,unchecked_get<T1>());  break;
                case 2: invoke_on(obj,unchecked_get<T2>());  break;
                case 3: invoke_on(obj,unchecked_get<T3>());  break;
                case 4: invoke_on(obj,unchecked_get<T4>());  break;
                case 5: invoke_on(obj,unchecked_get<T5>());  break;

                case 6: invoke_on(obj,unchecked_get<T6>());  break;
                case 7: invoke_on(obj,unchecked_get<T7>());  break;
                case 8: invoke_on(obj,unchecked_get<T8>());  break;
                case 9: invoke_on(obj,unchecked_get<T9>());  break;
                case 10: invoke_on(obj,unchecked_get<T10>());  break;

                case 11: invoke_on(obj,unchecked_get<T11>());  break;
                case 12: invoke_on(obj,unchecked_get<T12>());  break;
                case 13: invoke_on(obj,unchecked_get<T13>());  break;
                case 14: invoke_on(obj,unchecked_get<T14>());  break;
                case 15: invoke_on(obj,unchecked_get<T15>());  break;

                case 16: invoke_on(obj,unchecked_get<T16>());  break;
                case 17: invoke_on(obj,unchecked_get<T17>());  break;
                case 18: invoke_on(obj,unchecked_get<T18>());  break;
                case 19: invoke_on(obj,unchecked_get<T19>());  break;
                case 20: invoke_on(obj,unchecked_get<T20>());  break;
            }
        }

        template <
            typename T
            >
        void apply_to_contents (
            const T& obj
        ) 
        {
            switch (type_identity)
            {
                // do nothing because we are empty
                case 0: break;

                case 1: invoke_on(obj,unchecked_get<T1>());  break;
                case 2: invoke_on(obj,unchecked_get<T2>());  break;
                case 3: invoke_on(obj,unchecked_get<T3>());  break;
                case 4: invoke_on(obj,unchecked_get<T4>());  break;
                case 5: invoke_on(obj,unchecked_get<T5>());  break;

                case 6: invoke_on(obj,unchecked_get<T6>());  break;
                case 7: invoke_on(obj,unchecked_get<T7>());  break;
                case 8: invoke_on(obj,unchecked_get<T8>());  break;
                case 9: invoke_on(obj,unchecked_get<T9>());  break;
                case 10: invoke_on(obj,unchecked_get<T10>());  break;

                case 11: invoke_on(obj,unchecked_get<T11>());  break;
                case 12: invoke_on(obj,unchecked_get<T12>());  break;
                case 13: invoke_on(obj,unchecked_get<T13>());  break;
                case 14: invoke_on(obj,unchecked_get<T14>());  break;
                case 15: invoke_on(obj,unchecked_get<T15>());  break;

                case 16: invoke_on(obj,unchecked_get<T16>());  break;
                case 17: invoke_on(obj,unchecked_get<T17>());  break;
                case 18: invoke_on(obj,unchecked_get<T18>());  break;
                case 19: invoke_on(obj,unchecked_get<T19>());  break;
                case 20: invoke_on(obj,unchecked_get<T20>());  break;
            }
        }

        template <
            typename T
            >
        void apply_to_contents (
            T& obj
        ) const
        {
            switch (type_identity)
            {
                // do nothing because we are empty
                case 0: break;

                case 1: invoke_on(obj,unchecked_get<T1>());  break;
                case 2: invoke_on(obj,unchecked_get<T2>());  break;
                case 3: invoke_on(obj,unchecked_get<T3>());  break;
                case 4: invoke_on(obj,unchecked_get<T4>());  break;
                case 5: invoke_on(obj,unchecked_get<T5>());  break;

                case 6: invoke_on(obj,unchecked_get<T6>());  break;
                case 7: invoke_on(obj,unchecked_get<T7>());  break;
                case 8: invoke_on(obj,unchecked_get<T8>());  break;
                case 9: invoke_on(obj,unchecked_get<T9>());  break;
                case 10: invoke_on(obj,unchecked_get<T10>());  break;

                case 11: invoke_on(obj,unchecked_get<T11>());  break;
                case 12: invoke_on(obj,unchecked_get<T12>());  break;
                case 13: invoke_on(obj,unchecked_get<T13>());  break;
                case 14: invoke_on(obj,unchecked_get<T14>());  break;
                case 15: invoke_on(obj,unchecked_get<T15>());  break;

                case 16: invoke_on(obj,unchecked_get<T16>());  break;
                case 17: invoke_on(obj,unchecked_get<T17>());  break;
                case 18: invoke_on(obj,unchecked_get<T18>());  break;
                case 19: invoke_on(obj,unchecked_get<T19>());  break;
                case 20: invoke_on(obj,unchecked_get<T20>());  break;
            }
        }

        template <
            typename T
            >
        void apply_to_contents (
            const T& obj
        ) const
        {
            switch (type_identity)
            {
                // do nothing because we are empty
                case 0: break;

                case 1: invoke_on(obj,unchecked_get<T1>());  break;
                case 2: invoke_on(obj,unchecked_get<T2>());  break;
                case 3: invoke_on(obj,unchecked_get<T3>());  break;
                case 4: invoke_on(obj,unchecked_get<T4>());  break;
                case 5: invoke_on(obj,unchecked_get<T5>());  break;

                case 6: invoke_on(obj,unchecked_get<T6>());  break;
                case 7: invoke_on(obj,unchecked_get<T7>());  break;
                case 8: invoke_on(obj,unchecked_get<T8>());  break;
                case 9: invoke_on(obj,unchecked_get<T9>());  break;
                case 10: invoke_on(obj,unchecked_get<T10>());  break;

                case 11: invoke_on(obj,unchecked_get<T11>());  break;
                case 12: invoke_on(obj,unchecked_get<T12>());  break;
                case 13: invoke_on(obj,unchecked_get<T13>());  break;
                case 14: invoke_on(obj,unchecked_get<T14>());  break;
                case 15: invoke_on(obj,unchecked_get<T15>());  break;

                case 16: invoke_on(obj,unchecked_get<T16>());  break;
                case 17: invoke_on(obj,unchecked_get<T17>());  break;
                case 18: invoke_on(obj,unchecked_get<T18>());  break;
                case 19: invoke_on(obj,unchecked_get<T19>());  break;
                case 20: invoke_on(obj,unchecked_get<T20>());  break;
            }
        }

        void swap (
            type_safe_union& item
        )
        {
            // if both *this and item contain the same type of thing
            if (type_identity == item.type_identity)
            {
                // swap the things in this and item.  
                item.apply_to_contents(*this);
            }
            else if (type_identity == 0)
            {
                // *this doesn't contain anything.  So swap this and item and
                // then destruct item.
                item.apply_to_contents(*this);
                item.destruct();
            }
            else if (item.type_identity == 0)
            {
                // *this doesn't contain anything.  So swap this and item and
                // then destruct this.
                apply_to_contents(item);
                destruct();
            }
            else
            {
                type_safe_union temp;
                // swap *this into temp
                apply_to_contents(temp);
                // swap item into *this
                item.apply_to_contents(*this);
                // swap temp into item
                temp.apply_to_contents(item);
            }
        }

        template <typename T> 
        T& get(
        ) 
        { 
            validate_type<T>();
            construct<T>();  
            return *static_cast<T*>(mem.get()); 
        }

        template <typename T>
        const T& cast_to (
        ) const
        {
            validate_type<T>();
            if (contains<T>())
                return *static_cast<const T*>(mem.get());
            else
                throw bad_type_safe_union_cast();
        }

        template <typename T>
        T& cast_to (
        ) 
        {
            validate_type<T>();
            if (contains<T>())
                return *static_cast<T*>(mem.get());
            else
                throw bad_type_safe_union_cast();
        }

        template <typename T>
        type_safe_union& operator= ( const T& item) { get<T>() = item; return *this; }

    };

// ----------------------------------------------------------------------------------------

    template <
        typename T1, typename T2, typename T3, typename T4, typename T5,
        typename T6, typename T7, typename T8, typename T9, typename T10,
        typename T11, typename T12, typename T13, typename T14, typename T15,
        typename T16, typename T17, typename T18, typename T19, typename T20
        >
    inline void swap (
        type_safe_union<T1,T2,T3,T4,T5,T6,T7,T8,T9,T10, T11,T12,T13,T14,T15,T16,T17,T18,T19,T20>& a, 
        type_safe_union<T1,T2,T3,T4,T5,T6,T7,T8,T9,T10, T11,T12,T13,T14,T15,T16,T17,T18,T19,T20>& b 
    ) { a.swap(b); }   

// ----------------------------------------------------------------------------------------

    template <
        typename from, 
        typename T1, typename T2, typename T3, typename T4, typename T5,
        typename T6, typename T7, typename T8, typename T9, typename T10,
        typename T11, typename T12, typename T13, typename T14, typename T15,
        typename T16, typename T17, typename T18, typename T19, typename T20
        >
    struct is_convertible<from,
        type_safe_union<T1,T2,T3,T4,T5,T6,T7,T8,T9,T10, T11,T12,T13,T14,T15,T16,T17,T18,T19,T20> >
    {
        const static bool value = is_convertible<from,T1>::value ||
                                  is_convertible<from,T2>::value ||
                                  is_convertible<from,T3>::value ||
                                  is_convertible<from,T4>::value ||
                                  is_convertible<from,T5>::value ||
                                  is_convertible<from,T6>::value ||
                                  is_convertible<from,T7>::value ||
                                  is_convertible<from,T8>::value ||
                                  is_convertible<from,T9>::value ||
                                  is_convertible<from,T10>::value ||
                                  is_convertible<from,T11>::value ||
                                  is_convertible<from,T12>::value ||
                                  is_convertible<from,T13>::value ||
                                  is_convertible<from,T14>::value ||
                                  is_convertible<from,T15>::value ||
                                  is_convertible<from,T16>::value ||
                                  is_convertible<from,T17>::value ||
                                  is_convertible<from,T18>::value ||
                                  is_convertible<from,T19>::value ||
                                  is_convertible<from,T20>::value;
    };

// ----------------------------------------------------------------------------------------

    namespace impl_tsu
    {
        struct serialize_helper
        {
            /*
                This is a function object to help us serialize type_safe_unions
            */

            std::ostream& out;
            serialize_helper(std::ostream& out_): out(out_) {}
            template <typename T>
            void operator() (const T& item) const { serialize(item, out); } 
        };
    }

    template <
        typename T1, typename T2, typename T3, typename T4, typename T5,
        typename T6, typename T7, typename T8, typename T9, typename T10,
        typename T11, typename T12, typename T13, typename T14, typename T15,
        typename T16, typename T17, typename T18, typename T19, typename T20
        >
    void serialize (
        const type_safe_union<T1,T2,T3,T4,T5,T6,T7,T8,T9,T10, T11,T12,T13,T14,T15,T16,T17,T18,T19,T20>& item,
        std::ostream& out
    )
    {
        try
        {
            // save the type_identity
            serialize(item.type_identity, out);
            item.apply_to_contents(dlib::impl_tsu::serialize_helper(out));
        }
        catch (serialization_error& e)
        {
            throw serialization_error(e.info + "\n   while serializing an object of type type_safe_union");
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T1, typename T2, typename T3, typename T4, typename T5,
        typename T6, typename T7, typename T8, typename T9, typename T10,
        typename T11, typename T12, typename T13, typename T14, typename T15,
        typename T16, typename T17, typename T18, typename T19, typename T20
        >
    void deserialize (
        type_safe_union<T1,T2,T3,T4,T5,T6,T7,T8,T9,T10, T11,T12,T13,T14,T15,T16,T17,T18,T19,T20>&  item,
        std::istream& in
    )
    {
        try
        {
            typedef type_safe_union<T1,T2,T3,T4,T5,T6,T7,T8,T9,T10, T11,T12,T13,T14,T15,T16,T17,T18,T19,T20> tsu_type;

            int type_identity;
            deserialize(type_identity, in);
            switch (type_identity)
            {
                // swap an empty type_safe_union into item since it should be in the empty state
                case 0: tsu_type().swap(item); break;

                case 1: deserialize(item.template get<T1>(), in);  break;
                case 2: deserialize(item.template get<T2>(), in);  break;
                case 3: deserialize(item.template get<T3>(), in);  break;
                case 4: deserialize(item.template get<T4>(), in);  break;
                case 5: deserialize(item.template get<T5>(), in);  break;

                case 6: deserialize(item.template get<T6>(), in);  break;
                case 7: deserialize(item.template get<T7>(), in);  break;
                case 8: deserialize(item.template get<T8>(), in);  break;
                case 9: deserialize(item.template get<T9>(), in);  break;
                case 10: deserialize(item.template get<T10>(), in);  break;

                case 11: deserialize(item.template get<T11>(), in);  break;
                case 12: deserialize(item.template get<T12>(), in);  break;
                case 13: deserialize(item.template get<T13>(), in);  break;
                case 14: deserialize(item.template get<T14>(), in);  break;
                case 15: deserialize(item.template get<T15>(), in);  break;

                case 16: deserialize(item.template get<T16>(), in);  break;
                case 17: deserialize(item.template get<T17>(), in);  break;
                case 18: deserialize(item.template get<T18>(), in);  break;
                case 19: deserialize(item.template get<T19>(), in);  break;
                case 20: deserialize(item.template get<T20>(), in);  break;

                default: throw serialization_error("Corrupt data detected while deserializing type_safe_union");
            }
        }
        catch (serialization_error& e)
        {
            throw serialization_error(e.info + "\n   while deserializing an object of type type_safe_union");
        }
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_TYPE_SAFE_UNIOn_h_

