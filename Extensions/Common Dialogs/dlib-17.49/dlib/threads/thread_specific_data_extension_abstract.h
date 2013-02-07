// Copyright (C) 2006  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_THREAD_SPECIFIC_DATA_EXTENSIOn_ABSTRACT_
#ifdef DLIB_THREAD_SPECIFIC_DATA_EXTENSIOn_ABSTRACT_

#include "threads_kernel_abstract.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    class thread_specific_data
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object represents a container of thread specific data.  When
                a thread calls the data() member function it gets a reference to a T object
                that is specific to its own thread.  Each subsequent call to data() from that
                thread returns the same instance.  Also note that when a thread ends
                the instance of its data() object gets destroyed and freed (if the thread
                was created by the dlib library).  So any pointers or references to the object 
                will be invalid after the thread has ended.
        !*/
    public:

        thread_specific_data (
        );
        /*!
            ensures
                - #*this is properly initialized
        !*/

        ~thread_specific_data (
        );
        /*!
            ensures
                - all resources allocated by *this have been freed.  This includes
                  all the thread specific data returned by the data() functions.
        !*/

        T& data (
        );
        /*!
            ensures
                - if (the calling thread has NOT called this->data() before) then
                    - constructs an instance of T that is specific to the calling
                      thread.
                - returns a reference to the T instance that was constructed for 
                  the calling thread.
            throws
                - std::bad_alloc or any exception thrown by T's constructor
                  If an exception is thrown then the call to data() will have
                  no effect on *this.
        !*/

        const T& data (
        ) const;
        /*!
            ensures
                - if (the calling thread has NOT called this->data() before) then
                    - constructs an instance of T that is specific to the calling
                      thread.
                - returns a const reference to the T instance that was constructed for 
                  the calling thread.
            throws
                - std::bad_alloc or any exception thrown by T's constructor
                  If an exception is thrown then the call to data() will have
                  no effect on *this.
        !*/

    private:
        // restricted functions
        thread_specific_data(thread_specific_data&);        // copy constructor
        thread_specific_data& operator=(thread_specific_data&);    // assignment operator
    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_THREAD_SPECIFIC_DATA_EXTENSIOn_ABSTRACT_


