// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_BIT_STREAM_KERNEl_ABSTRACT_
#ifdef DLIB_BIT_STREAM_KERNEl_ABSTRACT_

#include <iosfwd>

namespace dlib
{

    class bit_stream
    {

        /*!
            INITIAL VALUE
                is_in_write_mode()  == false
                is_in_read_mode()   == false

            WHAT THIS OBJECT REPRESENTS
                this object is a middle man between a user and the iostream classes.
                it allows single bits to be read/written easily to/from 
                the iostream classes  

            BUFFERING:
                This object will only read/write single bytes at a time from/to the 
                iostream objects. Any buffered bits still in the bit_stream object 
                when it is closed or destructed are lost if it is in read mode.  If 
                it is in write mode then any remaining bits are guaranteed to be 
                written to the output stream by the time it is closed or destructed.
        !*/


    public:

        bit_stream (
        );
        /*!
            ensures 
                - #*this is properly initialized
            throws
                - std::bad_alloc
        !*/

        virtual ~bit_stream (
        );
        /*!
            ensures
                - all memory associated with *this has been released
        !*/

        void clear (
        );
        /*!
            ensures
                - #*this has its initial value
            throws
                - std::bad_alloc
                    if this exception is thrown then *this is unusable 
                    until clear() is called and succeeds
        !*/


        void set_input_stream (
            std::istream& is
        );
        /*!
            requires
                - is_in_write_mode() == false                 
                - is_in_read_mode() == false                  
                - is is ready to give input
            ensures 
                - #is_in_write_mode() == false                 
                - #is_in_read_mode() == true                   
                - #*this will now be reading from is
            throws
                - std::bad_alloc
        !*/

        void set_output_stream (
            std::ostream& os
        );
        /*!
            requires
                - is_in_write_mode() == false         
                - is_in_read_mode() == false          
                - os is ready to take output
            ensures 
                - #is_in_write_mode() == true          
                - #is_in_read_mode() == false          
                - #*this will now write to os
            throws
                - std::bad_alloc
        !*/
        


        void close (
        );
        /*!
            requires
                - is_in_write_mode() == true || is_in_read_mode() == true
            ensures
                - #is_in_write_mode() == false 
                - #is_in_read_mode()  == false 
        !*/

        bool is_in_write_mode (
        ) const;
        /*!
            ensures
                - returns true if *this is associated with an output stream object
                - returns false otherwise
        !*/

        bool is_in_read_mode (
        ) const;
        /*!
            ensures
                - returns true if *this is associated with an input stream object
                - returns false otherwise
        !*/

        void write (
            int bit
        );
        /*!
            requires
                - is_in_write_mode() == true 
                - bit == 0 || bit == 1
            ensures
                - bit will be written to the ostream object associated with *this
            throws
                - std::ios_base::failure
                    if (there was a problem writing to the output stream) then
                    this exception will be thrown.  #*this will be unusable until
                    clear() is called and succeeds
                - any other exception
                    if this exception is thrown then #*this is unusable 
                    until clear() is called and succeeds
        !*/

        bool read (
            int& bit
        );
        /*!
            requires
                - is_in_read_mode() == true 
            ensures
                - the next bit has been read and placed into #bit 
                - returns true if the read was successful, else false 
                  (ex. false if EOF has been reached)
            throws
                - any exception
                    if this exception is thrown then #*this is unusable 
                    until clear() is called and succeeds
        !*/

        void swap (
            bit_stream& item
        );
        /*!
            ensures
                - swaps *this and item
        !*/ 

        private:

            // restricted functions
            bit_stream(bit_stream&);        // copy constructor
            bit_stream& operator=(bit_stream&);    // assignment operator

    };

    inline void swap (
        bit_stream& a, 
        bit_stream& b
    ) { a.swap(b); }
    /*!
        provides a global swap function
    !*/

}

#endif // DLIB_BIT_STREAM_KERNEl_ABSTRACT_

