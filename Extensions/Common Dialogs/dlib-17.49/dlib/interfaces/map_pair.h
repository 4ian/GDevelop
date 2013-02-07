// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_MAP_PAIr_INTERFACE_
#define DLIB_MAP_PAIr_INTERFACE_

namespace dlib
{

// ----------------------------------------------------------------------------------------
    
    template <
        typename T1,
        typename T2
        >
    class map_pair  
    {
        /*!
            POINTERS AND REFERENCES TO INTERNAL DATA
                None of the functions in map_pair will invalidate
                pointers or references to internal data when called.

            WHAT THIS OBJECT REPRESENTS
                this object is used to return the key/value pair used in the 
                map and hash_map containers when using the enumerable interface.

                note that the enumerable interface is defined in
                interfaces/enumerable.h
        !*/

    public:
        typedef T1 key_type;
        typedef T2 value_type;

        virtual ~map_pair(
        )=0;

        virtual const T1& key( 
        ) const =0;
        /*!
            ensures
                - returns a const reference to the key
        !*/

        virtual const T2& value(
        ) const =0;
        /*!
            ensures
                - returns a const reference to the value associated with key
        !*/

        virtual T2& value(
        )=0;
        /*!
            ensures
                - returns a non-const reference to the value associated with key
        !*/

    protected:

        // restricted functions
        map_pair<T1,T2>& operator=(const map_pair<T1,T2>&) {return *this;} // no assignment operator

    };

    // destructor does nothing
    template <typename T1,typename T2> 
    map_pair<T1,T2>::~map_pair () {}

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_MAP_PAIr_INTERFACE_

