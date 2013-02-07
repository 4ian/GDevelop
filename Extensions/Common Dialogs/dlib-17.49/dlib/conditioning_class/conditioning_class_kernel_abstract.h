// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_CONDITIONING_CLASS_KERNEl_ABSTRACT_
#ifdef DLIB_CONDITIONING_CLASS_KERNEl_ABSTRACT_

#include "../algs.h"

namespace dlib
{

    template <
        unsigned long alphabet_size
        >
    class conditioning_class 
    {
        /*!
            REQUIREMENTS ON alphabet_size
                1 < alphabet_size < 65536

            INITIAL VALUE
                get_total() == 1
                get_count(X) == 0 : for all valid values of X except alphabet_size-1
                get_count(alphabet_size-1) == 1

            WHAT THIS OBJECT REPRESENTS
                This object represents a conditioning class used for arithmetic style
                compression.  It maintains the cumulative counts which are needed
                by the entropy_coder and entropy_decoder objects.

                At any moment a conditioning_class object represents a set of 
                alphabet_size symbols.  Each symbol is associated with an integer 
                called its count.  

                All symbols start out with a count of zero except for alphabet_size-1.
                This last symbol will always have a count of at least one.  It is
                intended to be used as an escape into a lower context when coding
                and so it must never have a zero probability or the decoder won't
                be able to identify the escape symbol.

            NOTATION:
                Let MAP(i) be a function which maps integers to symbols.  MAP(i) is
                one to one and onto.  Its domain is 1 to alphabet_size inclusive.
               
                Let RMAP(s) be the inverse of MAP(i).  
                 ( i.e.  RMAP(MAP(i)) == i  and  MAP(RMAP(s)) == s  )

                Let COUNT(i) give the count for the symbol MAP(i).  
                 ( i.e.  COUNT(i) == get_count(MAP(i)) )
              

                Let LOW_COUNT(s) == the sum of COUNT(x) for x == 1 to x == RMAP(s)-1
                  (note that the sum of COUNT(x) for x == 1 to x == 0 is 0)
                Let HIGH_COUNT(s) == LOW_COUNT(s) + get_count(s)    



                Basically what this is saying is just that you shoudln't assume you know
                what order the symbols are placed in when calculating the cumulative
                sums.  The specific mapping provided by the MAP() function is unspecified.  

            THREAD SAFETY
                This object can be used safely in a multithreaded program as long as the 
                global state is not shared between conditioning classes which run on 
                different threads.  

            GLOBAL_STATE_TYPE
                The global_state_type obejct allows instances of the conditioning_class
                object to share any kind of global state the implementer desires. 
                However, the global_state_type object exists primarily to facilitate the 
                sharing of a memory pool between many instances of a conditioning_class 
                object.  But note that it is not required that there be any kind of 
                memory pool at all, it is just a possibility.
        !*/

    public:

        class global_state_type 
        {
            global_state_type (
            );
            /*!
                ensures
                    - #*this is properly initialized
                throws
                    - std::bad_alloc
            !*/

            // my contents are implementation specific.               
        };

        conditioning_class (
            global_state_type& global_state
        );
        /*!
            ensures
                - #*this is properly initialized
                - &#get_global_state() == &global_state
            throws
                - std::bad_alloc
        !*/

        ~conditioning_class (
        );
        /*!
            ensures
                - all memory associated with *this has been released
        !*/

        void clear(
        );
        /*!
            ensures
                - #*this has its initial value
            throws
                - std::bad_alloc
        !*/

        bool increment_count (
            unsigned long symbol,
            unsigned short amount = 1
        );
        /*!
            requires
                - 0 <= symbol < alphabet_size
                - 0 < amount < 32768
            ensures
                - if (sufficient memory is available to complete this operation) then
                    - returns true
                    - if (get_total()+amount < 65536) then 
                        - #get_count(symbol) == get_count(symbol) + amount
                    - else
                        - #get_count(symbol) == get_count(symbol)/2 + amount
                        - if (get_count(alphabet_size-1) == 1) then
                            - #get_count(alphabet_size-1) == 1
                        - else
                            - #get_count(alphabet_size-1) == get_count(alphabet_size-1)/2
                        - for all X where (X != symbol)&&(X != alpahbet_size-1): 
                          #get_count(X) == get_count(X)/2  
                - else
                    - returns false
        !*/

        unsigned long get_count (
            unsigned long symbol
        ) const;
        /*!
            requires 
                - 0 <= symbol < alphabet_size
            ensures
                - returns the count for the specified symbol
        !*/

        unsigned long get_total (
        ) const;
        /*!
            ensures
                - returns the sum of get_count(X) for all valid values of X
                  (i.e. returns the sum of the counts for all the symbols)
        !*/

        unsigned long get_range (
            unsigned long symbol,
            unsigned long& low_count,
            unsigned long& high_count,
            unsigned long& total_count
        ) const;
        /*!
            requires
                - 0 <= symbol < alphabet_size
            ensures                
                - returns get_count(symbol)
                - if (get_count(symbol) != 0) then
                    - #total_count == get_total()
                    - #low_count   == LOW_COUNT(symbol)
                    - #high_count  == HIGH_COUNT(symbol)
                    - #low_count < #high_count <= #total_count                
        !*/

        void get_symbol (
            unsigned long target,
            unsigned long& symbol,            
            unsigned long& low_count,
            unsigned long& high_count
        ) const;
        /*!
            requires
                - 0 <= target < get_total()
            ensures
                - LOW_COUNT(#symbol) <= target < HIGH_COUNT(#symbol)
                - #low_count   == LOW_COUNT(#symbol)
                - #high_count  == HIGH_COUNT(#symbol)
                - #low_count < #high_count <= get_total()
        !*/

        global_state_type& get_global_state (
        );
        /*! 
            ensures
                - returns a reference to the global state used by *this
        !*/

        unsigned long get_memory_usage (
        ) const;
        /*!
            ensures 
                - returns the number of bytes of memory allocated by all conditioning_class
                  objects that share the global state given by get_global_state()
        !*/

        static unsigned long get_alphabet_size (
        );
        /*!
            ensures
                - returns alphabet_size
        !*/

    private:

        // restricted functions
        conditioning_class(conditioning_class<alphabet_size>&);        // copy constructor
        conditioning_class<alphabet_size>& operator=(conditioning_class<alphabet_size>&);    // assignment operator

    };   

}

#endif // DLIB_CONDITIONING_CLASS_KERNEl_ABSTRACT_

