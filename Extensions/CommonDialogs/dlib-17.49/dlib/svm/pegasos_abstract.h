// Copyright (C) 2009  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_PEGASoS_ABSTRACT_
#ifdef DLIB_PEGASoS_ABSTRACT_

#include <cmath>
#include "../algs.h"
#include "function_abstract.h"
#include "kernel_abstract.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename kern_type
        >
    class svm_pegasos
    {
        /*!
            REQUIREMENTS ON kern_type
                is a kernel function object as defined in dlib/svm/kernel_abstract.h 

            WHAT THIS OBJECT REPRESENTS
                This object implements an online algorithm for training a support 
                vector machine for solving binary classification problems.  

                The implementation of the Pegasos algorithm used by this object is based
                on the following excellent paper:
                    Pegasos: Primal estimated sub-gradient solver for SVM (2007)
                    by Shai Shalev-Shwartz, Yoram Singer, Nathan Srebro 
                    In ICML 

                This SVM training algorithm has two interesting properties.  First, the 
                pegasos algorithm itself converges to the solution in an amount of time
                unrelated to the size of the training set (in addition to being quite fast
                to begin with).  This makes it an appropriate algorithm for learning from
                very large datasets.  Second, this object uses the dlib::kcentroid object 
                to maintain a sparse approximation of the learned decision function.  
                This means that the number of support vectors in the resulting decision 
                function is also unrelated to the size of the dataset (in normal SVM
                training algorithms, the number of support vectors grows approximately 
                linearly with the size of the training set).  
        !*/

    public:
        typedef kern_type kernel_type;
        typedef typename kernel_type::scalar_type scalar_type;
        typedef typename kernel_type::sample_type sample_type;
        typedef typename kernel_type::mem_manager_type mem_manager_type;
        typedef decision_function<kernel_type> trained_function_type;

        template <typename K_>
        struct rebind {
            typedef svm_pegasos<K_> other;
        };

        svm_pegasos (
        );
        /*!
            ensures
                - this object is properly initialized 
                - #get_lambda_class1() == 0.0001
                - #get_lambda_class2() == 0.0001
                - #get_tolerance() == 0.01
                - #get_train_count() == 0
                - #get_max_num_sv() == 40
        !*/

        svm_pegasos (
            const kernel_type& kernel_, 
            const scalar_type& lambda_,
            const scalar_type& tolerance_,
            unsigned long max_num_sv
        );
        /*!
            requires
                - lambda_ > 0
                - tolerance_ > 0
                - max_num_sv > 0
            ensures
                - this object is properly initialized 
                - #get_lambda_class1() == lambda_ 
                - #get_lambda_class2() == lambda_ 
                - #get_tolerance() == tolerance_
                - #get_kernel() == kernel_
                - #get_train_count() == 0
                - #get_max_num_sv() == max_num_sv
        !*/

        void clear (
        );
        /*!
            ensures
                - #get_train_count() == 0
                - clears out any memory of previous calls to train()
                - doesn't change any of the algorithm parameters.  I.e.
                    - #get_lambda_class1()  == get_lambda_class1()
                    - #get_lambda_class2()  == get_lambda_class2()
                    - #get_tolerance()      == get_tolerance()
                    - #get_kernel()         == get_kernel()
                    - #get_max_num_sv()     == get_max_num_sv()
        !*/

        const scalar_type get_lambda_class1 (
        ) const;
        /*!
            ensures
                - returns the SVM regularization term for the +1 class.  It is the 
                  parameter that determines the trade off between trying to fit the 
                  +1 training data exactly or allowing more errors but hopefully 
                  improving the generalization ability of the resulting classifier.  
                  Smaller values encourage exact fitting while larger values may 
                  encourage better generalization. It is also worth noting that the 
                  number of iterations it takes for this algorithm to converge is 
                  proportional to 1/lambda.  So smaller values of this term cause 
                  the running time of this algorithm to increase.  For more 
                  information you should consult the paper referenced above.
        !*/

        const scalar_type get_lambda_class2 (
        ) const;
        /*!
            ensures
                - returns the SVM regularization term for the -1 class.  It has
                  the same properties as the get_lambda_class1() parameter except that
                  it applies to the -1 class.
        !*/

        const scalar_type get_tolerance (
        ) const;
        /*!
            ensures
                - returns the tolerance used by the internal kcentroid object to 
                  represent the learned decision function.  Smaller values of this 
                  tolerance will result in a more accurate representation of the 
                  decision function but will use more support vectors (up to
                  a max of get_max_num_sv()).  
        !*/

        unsigned long get_max_num_sv (
        ) const;
        /*!
            ensures
                - returns the maximum number of support vectors this object is
                  allowed to use.
        !*/

        const kernel_type get_kernel (
        ) const;
        /*!
            ensures
                - returns the kernel used by this object
        !*/

        void set_kernel (
            kernel_type k
        );
        /*!
            ensures
                - #get_kernel() == k
                - #get_train_count() == 0
                  (i.e. clears any memory of previous training)
        !*/

        void set_tolerance (
            double tol
        );
        /*!
            requires
                - tol > 0
            ensures
                - #get_tolerance() == tol
                - #get_train_count() == 0
                  (i.e. clears any memory of previous training)
        !*/

        void set_max_num_sv (
            unsigned long max_num_sv
        );
        /*!
            requires
                - max_num_sv > 0
            ensures
                - #get_max_num_sv() == max_num_sv 
                - #get_train_count() == 0
                  (i.e. clears any memory of previous training)
        !*/

        void set_lambda (
            scalar_type lambda_
        );
        /*!
            requires
                - lambda_ > 0
            ensures
                - #get_lambda_class1() == lambda_
                - #get_lambda_class2() == lambda_
                - #get_train_count() == 0
                  (i.e. clears any memory of previous training)
        !*/

        void set_lambda_class1 (
            scalar_type lambda_
        );
        /*!
            requires
                - lambda_ > 0
            ensures
                - #get_lambda_class1() == lambda_ 
                  #get_train_count() == 0
                  (i.e. clears any memory of previous training)
        !*/

        void set_lambda_class2 (
            scalar_type lambda_
        );
        /*!
            requires
                - lambda_ > 0
            ensures
                - #get_lambda_class2() == lambda_ 
                  #get_train_count() == 0
                  (i.e. clears any memory of previous training)
        !*/

        unsigned long get_train_count (
        ) const;
        /*!
            ensures
                - returns how many times this->train() has been called
                  since this object was constructed or last cleared.  
        !*/

        scalar_type train (
            const sample_type& x,
            const scalar_type& y
        );
        /*!
            requires
                - y == 1 || y == -1
            ensures
                - trains this svm using the given sample x and label y
                - #get_train_count() == get_train_count() + 1
                - returns the current learning rate
                  (i.e. 1/(get_train_count()*min(get_lambda_class1(),get_lambda_class2())) )
        !*/

        scalar_type operator() (
            const sample_type& x
        ) const;
        /*!
            ensures
                - classifies the given x sample using the decision function
                  this object has learned so far.  
                - if (x is a sample predicted have +1 label) then
                    - returns a number >= 0 
                - else
                    - returns a number < 0
        !*/

        const decision_function<kernel_type> get_decision_function (
        ) const;
        /*!
            ensures
                - returns a decision function F that represents the function learned 
                  by this object so far.  I.e. it is the case that:
                    - for all x: F(x) == (*this)(x)
        !*/

        void swap (
            svm_pegasos& item
        );
        /*!
            ensures
                - swaps *this and item
        !*/

    }; 

// ----------------------------------------------------------------------------------------

    template <
        typename kern_type 
        >
    void swap(
        svm_pegasos<kern_type>& a, 
        svm_pegasos<kern_type>& b
    ) { a.swap(b); }
    /*!
        provides a global swap function
    !*/

    template <
        typename kern_type
        >
    void serialize (
        const svm_pegasos<kern_type>& item,
        std::ostream& out
    );
    /*!
        provides serialization support for svm_pegasos objects
    !*/

    template <
        typename kern_type 
        >
    void deserialize (
        svm_pegasos<kern_type>& item,
        std::istream& in 
    );
    /*!
        provides serialization support for svm_pegasos objects
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename U
        >
    void replicate_settings (
        const svm_pegasos<T>& source,
        svm_pegasos<U>& dest
    );
    /*!
        ensures
            - copies all the parameters from the source trainer to the dest trainer.
            - #dest.get_tolerance() == source.get_tolerance()
            - #dest.get_lambda_class1() == source.get_lambda_class1()
            - #dest.get_lambda_class2() == source.get_lambda_class2()
            - #dest.get_max_num_sv() == source.get_max_num_sv()
    !*/

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename trainer_type
        >
    class batch_trainer 
    {
        /*!
            REQUIREMENTS ON trainer_type
                - trainer_type == some kind of online trainer object (e.g. svm_pegasos)
                  replicate_settings() must also be defined for the type.

            WHAT THIS OBJECT REPRESENTS
                This is a trainer object that is meant to wrap online trainer objects 
                that create decision_functions. It turns an online learning algorithm 
                such as svm_pegasos into a batch learning object.  This allows you to 
                use objects like svm_pegasos with functions (e.g. cross_validate_trainer) 
                that expect batch mode training objects.
        !*/

    public:
        typedef typename trainer_type::kernel_type kernel_type;
        typedef typename trainer_type::scalar_type scalar_type;
        typedef typename trainer_type::sample_type sample_type;
        typedef typename trainer_type::mem_manager_type mem_manager_type;
        typedef typename trainer_type::trained_function_type trained_function_type;


        batch_trainer (
        );
        /*!
            ensures
                - This object is in an uninitialized state.  You must
                  construct a real one with the other constructor and assign it
                  to this instance before you use this object.
        !*/

        batch_trainer (
            const trainer_type& online_trainer, 
            const scalar_type min_learning_rate_,
            bool verbose_,
            bool use_cache_,
            long cache_size_ = 100
        );
        /*!
            requires
                - min_learning_rate_ > 0
                - cache_size_ > 0
            ensures
                - returns a batch trainer object that uses the given online_trainer object
                  to train a decision function.
                - #get_min_learning_rate() == min_learning_rate_
                - if (verbose_ == true) then
                    - this object will output status messages to standard out while
                      training is under way.
                - if (use_cache_ == true) then
                    - this object will cache up to cache_size_ columns of the kernel 
                      matrix during the training process.
        !*/

        const scalar_type get_min_learning_rate (
        ) const;
        /*!
            ensures
                - returns the min learning rate that the online trainer must reach
                  before this object considers training to be complete.
        !*/

        template <
            typename in_sample_vector_type,
            typename in_scalar_vector_type
            >
        const decision_function<kernel_type> train (
            const in_sample_vector_type& x,
            const in_scalar_vector_type& y
        ) const;
        /*!
            ensures
                - trains and returns a decision_function using the trainer that was 
                  supplied to this object's constructor.
                - training continues until the online training object indicates that
                  its learning rate has dropped below get_min_learning_rate().
            throws
                - std::bad_alloc
                - any exceptions thrown by the trainer_type object
        !*/

    }; 

// ----------------------------------------------------------------------------------------

    template <
        typename trainer_type
        >
    const batch_trainer<trainer_type> batch (
        const trainer_type& trainer,
        const typename trainer_type::scalar_type min_learning_rate = 0.1
    ) { return batch_trainer<trainer_type>(trainer, min_learning_rate, false, false); }
    /*!
        requires
            - min_learning_rate > 0
            - trainer_type == some kind of online trainer object that creates decision_function
              objects (e.g. svm_pegasos).  replicate_settings() must also be defined for the type.
        ensures
            - returns a batch_trainer object that has been instantiated with the 
              given arguments.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename trainer_type
        >
    const batch_trainer<trainer_type> verbose_batch (
        const trainer_type& trainer,
        const typename trainer_type::scalar_type min_learning_rate = 0.1
    ) { return batch_trainer<trainer_type>(trainer, min_learning_rate, true, false); }
    /*!
        requires
            - min_learning_rate > 0
            - trainer_type == some kind of online trainer object that creates decision_function
              objects (e.g. svm_pegasos).  replicate_settings() must also be defined for the type.
        ensures
            - returns a batch_trainer object that has been instantiated with the 
              given arguments (and is verbose).
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename trainer_type
        >
    const batch_trainer<trainer_type> batch_cached (
        const trainer_type& trainer,
        const typename trainer_type::scalar_type min_learning_rate = 0.1,
        long cache_size = 100
    ) { return batch_trainer<trainer_type>(trainer, min_learning_rate, false, true, cache_size); }
    /*!
        requires
            - min_learning_rate > 0
            - cache_size > 0
            - trainer_type == some kind of online trainer object that creates decision_function
              objects (e.g. svm_pegasos).  replicate_settings() must also be defined for the type.
        ensures
            - returns a batch_trainer object that has been instantiated with the 
              given arguments (uses a kernel cache).
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename trainer_type
        >
    const batch_trainer<trainer_type> verbose_batch_cached (
        const trainer_type& trainer,
        const typename trainer_type::scalar_type min_learning_rate = 0.1,
        long cache_size = 100
    ) { return batch_trainer<trainer_type>(trainer, min_learning_rate, true, true, cache_size); }
    /*!
        requires
            - min_learning_rate > 0
            - cache_size > 0
            - trainer_type == some kind of online trainer object that creates decision_function
              objects (e.g. svm_pegasos).  replicate_settings() must also be defined for the type.
        ensures
            - returns a batch_trainer object that has been instantiated with the 
              given arguments (is verbose and uses a kernel cache).
    !*/

// ----------------------------------------------------------------------------------------


}

#endif // DLIB_PEGASoS_ABSTRACT_


