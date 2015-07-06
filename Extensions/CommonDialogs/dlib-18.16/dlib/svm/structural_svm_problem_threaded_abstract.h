// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_STRUCTURAL_SVM_PRObLEM_THREADED_ABSTRACT_Hh_
#ifdef DLIB_STRUCTURAL_SVM_PRObLEM_THREADED_ABSTRACT_Hh_

#include "structural_svm_problem_abstract.h"
#include "../matrix.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename matrix_type_,
        typename feature_vector_type_ = matrix_type_
        >
    class structural_svm_problem_threaded : public structural_svm_problem<matrix_type_,feature_vector_type_> 
    {
    public:
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object is identical to the structural_svm_problem object defined in 
                dlib/svm/structural_svm_problem_abstract.h except that its constructor
                takes a number which defines how many threads will be used to make concurrent
                calls to the separation_oracle() routine.  

                So this object lets you take advantage of a multi-core system.  You should
                set the num_threads parameter equal to the number of available cores.  Note
                that the separation_oracle() function which you provide must be thread safe
                if you are to use this version of the structural_svm_problem.  In
                particular, it must be safe to call separation_oracle() concurrently from
                different threads.  However, it is guaranteed that different threads will
                never make concurrent calls to separation_oracle() using the same idx value
                (i.e. the first argument).  
        !*/

        typedef matrix_type_ matrix_type;
        typedef typename matrix_type::type scalar_type;
        typedef feature_vector_type_ feature_vector_type;

        structural_svm_problem (
            unsigned long num_threads
        );
        /*!
            ensures
                - this object is properly initialized
                - #get_num_threads() == num_threads
        !*/

        unsigned long get_num_threads (
        ) const; 
        /*!
            ensures
                - Returns the number of threads which will be used to make concurrent
                  calls to the separation_oracle() function.
        !*/

    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_STRUCTURAL_SVM_PRObLEM_THREADED_ABSTRACT_Hh_



