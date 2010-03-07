// Copyright (C) 2007  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_SVm_ABSTRACT_
#ifdef DLIB_SVm_ABSTRACT_

#include <cmath>
#include <limits>
#include <sstream>
#include "../matrix/matrix_abstract.h"
#include "../algs.h"
#include "../serialize.h"
#include "function_abstract.h"
#include "kernel_abstract.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    class invalid_svm_nu_error : public dlib::error 
    { 
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object is an exception class used to indicate that a
                value of nu used for svm training is incompatible with a
                particular data set.

                this->nu will be set to the invalid value of nu used.
        !*/

    public: 
        invalid_svm_nu_error(const std::string& msg, double nu_) : dlib::error(msg), nu(nu_) {};
        const double nu;
    };

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    typename T::type maximum_nu (
        const T& y
    );
    /*!
        requires
            - T == a matrix object or an object convertible to a matrix via 
              vector_to_matrix()
            - y.nc() == 1
            - y.nr() > 1
            - for all valid i:
                - y(i) == -1 or +1
        ensures
            - returns the maximum valid nu that can be used with the svm_nu_trainer and
              the training set labels from the given y vector.
              (i.e. 2.0*min(number of +1 examples in y, number of -1 examples in y)/y.nr())
    !*/

// ----------------------------------------------------------------------------------------

    bool template <
        typename T,
        typename U
        >
    bool is_binary_classification_problem (
        const T& x,
        const U& x_labels
    );
    /*!
        requires
            - T == a matrix or something convertible to a matrix via vector_to_matrix()
            - U == a matrix or something convertible to a matrix via vector_to_matrix()
        ensures
            - returns true if all of the following are true and false otherwise:
                - x.nc()        == 1 (i.e. x is a column vector)
                - x_labels.nc() == 1 (i.e. x_labels is a column vector)
                - x.nr() == x_labels.nr() 
                - x.nr() > 1
                - for all valid i:
                    - x_labels(i) == -1 or +1
    !*/

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename K 
        >
    class svm_nu_trainer
    {
        /*!
            REQUIREMENTS ON K 
                is a kernel function object as defined in dlib/svm/kernel_abstract.h 

            WHAT THIS OBJECT REPRESENTS
                This object implements a trainer for a nu support vector machine for 
                solving binary classification problems.

                The implementation of the nu-svm training algorithm used by this object is based
                on the following excellent papers:
                    - Chang and Lin, Training {nu}-Support Vector Classifiers: Theory and Algorithms
                    - Chih-Chung Chang and Chih-Jen Lin, LIBSVM : a library for support vector 
                      machines, 2001. Software available at http://www.csie.ntu.edu.tw/~cjlin/libsvm

        !*/

    public:
        typedef K kernel_type;
        typedef typename kernel_type::scalar_type scalar_type;
        typedef typename kernel_type::sample_type sample_type;
        typedef typename kernel_type::mem_manager_type mem_manager_type;
        typedef decision_function<kernel_type> trained_function_type;

        svm_nu_trainer (
        );
        /*!
            ensures
                - This object is properly initialized and ready to be used
                  to train a support vector machine.
                - #get_nu() == 0.1 
                - #get_cache_size() == 200
                - #get_epsilon() == 0.001
        !*/

        svm_nu_trainer (
            const kernel_type& kernel, 
            const scalar_type& nu
        );
        /*!
            requires
                - 0 < nu <= 1
            ensures
                - This object is properly initialized and ready to be used
                  to train a support vector machine.
                - #get_kernel() == kernel
                - #get_nu() == nu
                - #get_cache_size() == 200
                - #get_epsilon() == 0.001
        !*/

        void set_cache_size (
            long cache_size
        );
        /*!
            requires
                - cache_size > 0
            ensures
                - #get_cache_size() == cache_size 
        !*/

        const long get_cache_size (
        ) const;
        /*!
            ensures
                - returns the number of megabytes of cache this object will use
                  when it performs training via the this->train() function.
                  (bigger values of this may make training go faster but won't affect 
                  the result.  However, too big a value will cause you to run out of 
                  memory, obviously.)
        !*/

        void set_epsilon (
            scalar_type eps
        );
        /*!
            requires
                - eps > 0
            ensures
                - #get_epsilon() == eps 
        !*/

        const scalar_type get_epsilon (
        ) const;
        /*!
            ensures
                - returns the error epsilon that determines when training should stop.
                  Generally a good value for this is 0.001.  Smaller values may result
                  in a more accurate solution but take longer to execute.
        !*/

        void set_kernel (
            const kernel_type& k
        );
        /*!
            ensures
                - #get_kernel() == k 
        !*/

        const kernel_type& get_kernel (
        ) const;
        /*!
            ensures
                - returns a copy of the kernel function in use by this object
        !*/

        void set_nu (
            scalar_type nu
        );
        /*!
            requires
                - 0 < nu <= 1
            ensures
                - #get_nu() == nu
        !*/

        const scalar_type get_nu (
        ) const;
        /*!
            ensures
                - returns the nu svm parameter.  This is a value between 0 and
                  1.  It is the parameter that determines the trade off between
                  trying to fit the training data exactly or allowing more errors 
                  but hopefully improving the generalization ability of the 
                  resulting classifier.  For more information you should consult
                  the papers referenced above.
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
            requires
                - is_binary_classification_problem(x,y) == true
                - x == a matrix or something convertible to a matrix via vector_to_matrix().
                  Also, x should contain sample_type objects.
                - y == a matrix or something convertible to a matrix via vector_to_matrix().
                  Also, y should contain scalar_type objects.
            ensures
                - trains a nu support vector classifier given the training samples in x and 
                  labels in y.  Training is done when the error is less than get_epsilon().
                - returns a decision function F with the following properties:
                    - if (new_x is a sample predicted have +1 label) then
                        - F(new_x) >= 0
                    - else
                        - F(new_x) < 0
            throws
                - invalid_svm_nu_error
                  This exception is thrown if get_nu() > maximum_nu(y)
                - std::bad_alloc
        !*/

        void swap (
            svm_nu_trainer& item
        );
        /*!
            ensures
                - swaps *this and item
        !*/
    }; 

    template <typename K>
    void swap (
        svm_nu_trainer<K>& a,
        svm_nu_trainer<K>& b
    ) { a.swap(b); }
    /*!
        provides a global swap
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename trainer_type,
        typename in_sample_vector_type,
        typename in_scalar_vector_type
        >
    const probabilistic_decision_function<typename trainer_type::kernel_type> 
    train_probabilistic_decision_function (
        const trainer_type& trainer,
        const in_sample_vector_type& x,
        const in_scalar_vector_type& y,
        const long folds
    )
    /*!
        requires
            - 1 < folds <= x.nr()
            - is_binary_classification_problem(x,y) == true
            - trainer_type == some kind of trainer object (e.g. svm_nu_trainer)
        ensures
            - trains a nu support vector classifier given the training samples in x and 
              labels in y.  
            - returns a probabilistic_decision_function that represents the trained svm.
            - The parameters of the probability model are estimated by performing k-fold 
              cross validation. 
            - The number of folds used is given by the folds argument.
        throws
            - any exceptions thrown by trainer.train()
            - std::bad_alloc
    !*/

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
//                                  Miscellaneous functions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename trainer_type,
        typename in_sample_vector_type,
        typename in_scalar_vector_type
        >
    const matrix<typename trainer_type::scalar_type, 1, 2, typename trainer_type::mem_manager_type> 
    cross_validate_trainer (
        const trainer_type& trainer,
        const in_sample_vector_type& x,
        const in_scalar_vector_type& y,
        const long folds
    );
    /*!
        requires
            - is_binary_classification_problem(x,y) == true
            - 1 < folds <= x.nr()
            - trainer_type == some kind of trainer object (e.g. svm_nu_trainer)
        ensures
            - performs k-fold cross validation by using the given trainer to solve the
              given binary classification problem for the given number of folds.
              Each fold is tested using the output of the trainer and the average 
              classification accuracy from all folds is returned.  
            - The accuracy is returned in a column vector, let us call it R.  Both 
              quantities in R are numbers between 0 and 1 which represent the fraction 
              of examples correctly classified.  R(0) is the fraction of +1 examples 
              correctly classified and R(1) is the fraction of -1 examples correctly 
              classified.
            - The number of folds used is given by the folds argument.
        throws
            - any exceptions thrown by trainer.train()
            - std::bad_alloc
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename dec_funct_type,
        typename in_sample_vector_type,
        typename in_scalar_vector_type
        >
    const matrix<typename dec_funct_type::scalar_type, 1, 2, typename dec_funct_type::mem_manager_type> 
    test_binary_decision_function (
        const dec_funct_type& trainer,
        const in_sample_vector_type& x_test,
        const in_scalar_vector_type& y_test
    );
    /*!
        requires
            - is_binary_classification_problem(x_test,y_test) == true
            - dec_funct_type == some kind of decision function object (e.g. decision_function)
        ensures
            - tests the given decision function by calling on the x_test and y_test samples.
            - The test accuracy is returned in a column vector, let us call it R.  Both 
              quantities in R are numbers between 0 and 1 which represent the fraction 
              of examples correctly classified.  R(0) is the fraction of +1 examples 
              correctly classified and R(1) is the fraction of -1 examples correctly 
              classified.
        throws
            - std::bad_alloc
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename U
        >
    void randomize_samples (
        T& samples,
        U& labels 
    );
    /*!
        requires
            - T == a matrix object that contains a swappable type
            - U == a matrix object that contains a swappable type
            - samples.nc() == 1
            - labels.nc() == 1
            - samples.nr() == labels.nr()
        ensures
            - randomizes the order of the samples and labels but preserves
              the pairing between each sample and its label
            - for all valid i:
                - let r == the random index samples(i) was moved to.  then:
                    - #labels(r) == labels(i)
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    void randomize_samples (
        T& samples
    );
    /*!
        requires
            - T == a matrix object that contains a swappable type
            - samples.nc() == 1
        ensures
            - randomizes the order of the elements inside samples 
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename U
        >
    void randomize_samples (
        T& samples,
        U& labels 
    );
    /*!
        requires
            - T == an object compatible with std::vector that contains a swappable type 
            - U == an object compatible with std::vector that contains a swappable type 
            - samples.size() == labels.size()
        ensures
            - randomizes the order of the samples and labels but preserves
              the pairing between each sample and its label
            - for all valid i:
                - let r == the random index samples[i] was moved to.  then:
                    - #labels[r] == labels[i]
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    void randomize_samples (
        T& samples
    );
    /*!
        requires
            - T == an object compatible with std::vector that contains a swappable type 
        ensures
            - randomizes the order of the elements inside samples 
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_SVm_ABSTRACT_


