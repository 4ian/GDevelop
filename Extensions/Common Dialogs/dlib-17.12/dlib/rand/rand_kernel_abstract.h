// Copyright (C) 2003  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_RAND_KERNEl_ABSTRACT_
#ifdef DLIB_RAND_KERNEl_ABSTRACT_

#include <string>
#include "../uintn.h"

namespace dlib
{


    class rand
    {

        /*!      
            INITIAL VALUE
                get_seed() == ""


            WHAT THIS OBJECT REPRESENTS
                this object represents a pseudorandom number generator.

                note that different implementations do not necessairly return the 
                same sequence of random numbers given the same seed.
        !*/
        
        public:


            rand(
            );
            /*!
                ensures 
                    - #*this is properly initialized
                throws
                    - std::bad_alloc
            !*/

            virtual ~rand(
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
                        if this exception is thrown then *this is unusable 
                        until clear() is called and succeeds
            !*/

            const std::string& get_seed (
            );
            /*!
                ensures
                    - returns the string currently being used as the random seed.
            !*/

            void set_seed (
                const std::string& value
            );
            /*!
                ensures
                    - #get_seed() == value
            !*/

            unsigned char get_random_8bit_number (
            );
            /*!
                ensures
                    - returns a pseudorandom number in the range 0 to 255
                throws
                    - std::bad_alloc
            !*/

            uint16 get_random_16bit_number (
            );
            /*!
                ensures
                    - returns a pseudorandom number in the range 0 to 2^16-1 
                throws
                    - std::bad_alloc
            !*/

            uint32 get_random_32bit_number (
            );
            /*!
                ensures
                    - returns a pseudorandom number in the range 0 to 2^32-1 
                throws
                    - std::bad_alloc
            !*/

            void swap (
                rand& item
            );
            /*!
                ensures
                    - swaps *this and item
            !*/ 

        private:

            // restricted functions
            rand(rand&);        // copy constructor
            rand& operator=(rand&);    // assignment operator

    };

    inline void swap (
        rand& a, 
        rand& b 
    ) { a.swap(b); }   
    /*!
        provides a global swap function
    !*/

}

#endif // DLIB_RAND_KERNEl_ABSTRACT_

