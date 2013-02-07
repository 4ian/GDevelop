// Copyright (C) 2006  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_BYTE_ORDEREr_ABSTRACT_ 
#ifdef DLIB_BYTE_ORDEREr_ABSTRACT_

#include "../algs.h"

namespace dlib
{

    class byte_orderer 
    {
        /*!
            INITIAL VALUE
                This object has no state.

            WHAT THIS OBJECT REPRESENTS
                This object simply provides a mechanism to convert data from a
                host machine's own byte ordering to big or little endian and to 
                also do the reverse.

                It also provides a pair of functions to convert to/from network byte
                order where network byte order is big endian byte order.  This pair of
                functions does the exact same thing as the host_to_big() and big_to_host()
                functions and is provided simply so that client code can use the most 
                self documenting name appropriate.

                Also note that this object is capable of correctly flipping the contents 
                of arrays when the arrays are declared on the stack.  e.g.  You can  
                say things like:
                int array[10]; 
                bo.host_to_network(array);
        !*/

    public:

        byte_orderer (        
        );
        /*!
            ensures                
                - #*this is properly initialized
            throws
                - std::bad_alloc
        !*/

        virtual ~byte_orderer (
        );
        /*!
            ensures
                - any resources associated with *this have been released
        !*/

        bool host_is_big_endian (
        ) const;
        /*!
            ensures
                - if (the host computer is a big endian machine) then
                    - returns true
                - else
                    - returns false
        !*/

        bool host_is_little_endian (
        ) const;
        /*!
            ensures
                - if (the host computer is a little endian machine) then
                    - returns true
                - else
                    - returns false
        !*/

        template <
            typename T
            >
        void host_to_network (
            T& item
        ) const;
        /*!
            ensures
                - #item == the value of item converted from host byte order 
                  to network byte order.
        !*/

        template <
            typename T
            >
        void network_to_host (
            T& item
        ) const;
        /*!
            ensures
                - #item == the value of item converted from network byte order
                  to host byte order.
        !*/

        template <
            typename T
            >
        void host_to_big (
            T& item
        ) const;
        /*!
            ensures
                - #item == the value of item converted from host byte order 
                  to big endian byte order.
        !*/

        template <
            typename T
            >
        void big_to_host (
            T& item
        ) const;
        /*!
            ensures
                - #item == the value of item converted from big endian byte order
                  to host byte order.
        !*/

        template <
            typename T
            >
        void host_to_little (
            T& item
        ) const;
        /*!
            ensures
                - #item == the value of item converted from host byte order 
                  to little endian byte order.
        !*/

        template <
            typename T
            >
        void little_to_host (
            T& item
        ) const;
        /*!
            ensures
                - #item == the value of item converted from little endian byte order
                  to host byte order.
        !*/

    };    
}

#endif // DLIB_BYTE_ORDEREr_ABSTRACT_ 

