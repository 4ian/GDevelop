// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_ENUMERABLe_INTERFACE_
#define DLIB_ENUMERABLe_INTERFACE_

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    class enumerable
    {
        /*!
            POINTERS AND REFERENCES TO INTERNAL DATA
                - if (at_start()) then
                    - all pointers and references to data returned via element() are 
                      invalid.
                - calling move_next() or reset() invalidates pointers and references to 
                  data returned via element() and only data returned via element().
                - calling at_start(), current_element_valid(), size(), or element() 
                  does NOT invalidate pointers or references to any internal data.

            INITIAL VALUE
                current_element_valid() == false 
                at_start() == true

            WHAT THIS OBJECT REPRESENTS
                This object represent an interface for iterating through the 
                elements in a container.  It starts out one before the first element
                in the container. 


                EXAMPLE:  The following loops though all elements in the container
                          and prints them to cout.

                    container.reset();
                    while(container.move_next()) {
                        cout << container.element();
                    }
        !*/

    public:
        typedef T type;

        inline virtual ~enumerable(
        ) = 0;

        virtual bool at_start (
        ) const = 0;
        /*!
            ensures
                - returns true if *this represents one position before the first element
                  in the container (this would also make the current element invalid) 
                  else returns false                
        !*/

        virtual void reset (
        ) const = 0;
        /*!
            ensures
                - #current_element_valid() == false 
                - #at_start() == true
        !*/

        virtual bool current_element_valid (
        ) const = 0;
        /*!
            ensures
                - returns true if we are currently at a valid element else
                  returns false 
        !*/

        virtual const T& element (
        ) const = 0;
        /*!
            requires
                - current_element_valid() == true
            ensures
                - returns a const reference to the current element
        !*/

        virtual T& element (
        ) = 0;
        /*!
            requires
                - current_element_valid() == true
            ensures
                - returns a non-const reference to the current element
        !*/

        virtual bool move_next (
        ) const = 0;
        /*!
            ensures
                - moves to the next element.  i.e. #element() will now 
                  return the next element in the container 
                - the return value will be equal to #current_element_valid() 
                - #at_start() == false 

                - returns true if there is another element 
                - returns false if there are no more elements in the container
        !*/

        virtual unsigned long size (
        ) const = 0;
        /*!
            ensures
                - returns the number of elements in *this
        !*/

    protected:

        // restricted functions
        enumerable& operator=(const enumerable&) {return *this;} // no assignment operator

    };

    // destructor does nothing
    template <typename T>
    enumerable<T>::~enumerable() {}

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_ENUMERABLe_INTERFACE_

