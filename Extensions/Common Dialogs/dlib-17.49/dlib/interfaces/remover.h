// Copyright (C) 2005  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_REMOVER_KERNEl_INTERFACE_
#define DLIB_REMOVER_KERNEl_INTERFACE_

#include <functional>


namespace dlib
{

    template <
        typename T
        >
    class remover 
    {

        /*!
            REQUIREMENTS ON T
                T is swappable by a global swap() and                
                T must have a default constructor

            POINTERS AND REFERENCES TO INTERNAL DATA
                The size() function does not invalidate pointers or 
                references to internal data.  All other functions have no such 
                guarantee.

            WHAT THIS OBJECT REPRESENTS
                This object represents some generalized interface for removing
                single items from container classes.                  
        !*/
        

        public:
            typedef T type;

            virtual ~remover(
            ); 
            /*!
                ensures
                    - all resources associated with *this have been released.
            !*/

            virtual void remove_any (
                T& item
            ) = 0;
            /*!
                requires 
                    - size() != 0
                ensures
                    - #size() == size() - 1
                    - removes an element from *this and swaps it into item.  
                    - if (*this implements the enumerable interface) then
                        - #at_start() == true
            !*/

            virtual unsigned long size (
            ) const = 0;
            /*!
                ensures
                    - returns the number of elements in *this
            !*/

        protected:

            // restricted functions
            remover& operator=(const remover&) {return *this;}    // assignment operator
    };

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename compare
        >
    class asc_remover : public remover<T>
    {
        /*!
            REQUIREMENTS ON T
                T is swappable by a global swap() and                
                T must have a default constructor and
                T must be comparable by compare where compare is a functor compatible with std::less 

            WHAT THIS OBJECT REPRESENTS
                This object represents the same thing as remover except
                that remove_any() will remove elements in ascending order
                according to the compare functor.  
        !*/
    public:
        typedef compare compare_type;

    protected:
        // restricted functions
        asc_remover& operator=(const asc_remover&) {return *this;}    // assignment operator
    };

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range
        >
    class pair_remover 
    {

        /*!
            REQUIREMENTS ON domain
                domain is swappable by a global swap() and                
                domain must have a default constructor

            REQUIREMENTS ON range
                range is swappable by a global swap() and
                range must have a default constructor

            POINTERS AND REFERENCES TO INTERNAL DATA
                The size() function does not invalidate pointers or 
                references to internal data.  All other functions have no such 
                guarantee.

            WHAT THIS OBJECT REPRESENTS
                This object represents some generalized interface for removing
                pairs from container classes which enforce some kind of pairing on
                the elements that they contain.  
        !*/
        
        public:
            typedef domain domain_type;
            typedef range range_type;

            virtual ~pair_remover(
            ); 
            /*!
                ensures
                    - all resources associated with *this have been released.
            !*/

            virtual void remove_any (
                domain& d,
                range& r
            ) = 0;
            /*!
                requires                     
                    - &d != &r (i.e. d and r cannot be the same variable) 
                    - size() != 0
                ensures
                    - #size() == size() - 1
                    - removes an element from the domain of *this and swaps it
                      into d.  
                    - removes the element in *this's range that is associated 
                      with #d and swaps it into r.
                    - if (*this implements the enumerable interface) then
                        - #at_start() == true
            !*/

            virtual unsigned long size (
            ) const = 0;
            /*!
                ensures
                    - returns the number of elements in *this 
            !*/


        protected:

            // restricted functions
            pair_remover& operator=(const pair_remover&) {return *this;}    // assignment operator


    };

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename compare
        >
    class asc_pair_remover : public pair_remover<domain,range>
    {
        /*!
            REQUIREMENTS ON domain
                domain is swappable by a global swap() and                
                domain must have a default constructor and
                domain must be comparable by compare where compare is a functor compatible with std::less 

            REQUIREMENTS ON range
                range is swappable by a global swap() and
                range must have a default constructor

            WHAT THIS OBJECT REPRESENTS
                This object represents the same thing as pair_remover except
                that remove_any() will remove domain elements in ascending 
                order according to the compare functor.  
        !*/
    public:
        typedef compare compare_type;

    protected:
        // restricted functions
        asc_pair_remover& operator=(const asc_pair_remover&) {return *this;}    // assignment operator
    };

// ----------------------------------------------------------------------------------------

    // destructor does nothing
    template <typename T>
    remover<T>::~remover() {}

    // destructor does nothing
    template <typename domain, typename range>
    pair_remover<domain,range>::~pair_remover() {}


// ----------------------------------------------------------------------------------------


}

#endif // DLIB_REMOVER_KERNEl_INTERFACE_

