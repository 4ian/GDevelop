// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_STRUCTURAL_SVM_DISTRIBUTeD_ABSTRACT_H__
#ifdef DLIB_STRUCTURAL_SVM_DISTRIBUTeD_ABSTRACT_H__


#include "structural_svm_problem_abstract.h"
#include "../optimization/optimization_oca_abstract.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    class svm_struct_processing_node : noncopyable
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object is a tool for distributing the work involved in solving
                a dlib::structural_svm_problem across many computers.  It is used in 
                conjunction with the svm_struct_controller_node defined below.
        !*/

    public:

        template <
            typename T,
            typename U 
            >
        svm_struct_processing_node (
            const structural_svm_problem<T,U>& problem,
            unsigned short port,
            unsigned short num_threads
        );
        /*!
            requires
                - port != 0
                - problem.get_num_samples() != 0
                - problem.get_num_dimensions() != 0
            ensures
                - This object will listen on the given port for a TCP connection from a 
                  svm_struct_controller_node.  Once connected, the controller node will 
                  be able to access the given problem.
                - Will use num_threads threads at a time to make concurrent calls to the 
                  problem.separation_oracle() routine.  You should set this parameter equal 
                  to the number of available processing cores.
                - Note that the following parameters within the given problem are ignored:
                    - problem.get_c()
                    - problem.get_epsilon()
                    - weather the problem is verbose or not
                  Instead, they are defined by the svm_struct_controller_node. Note, however,
                  that the problem.get_max_cache_size() parameter is meaningful and controls
                  the size of the separation oracle cache within a svm_struct_processing_node.
        !*/
    };

// ----------------------------------------------------------------------------------------

    class svm_struct_controller_node : noncopyable
    {
        /*!
            INITIAL VALUE
                - get_num_processing_nodes() == 0
                - get_epsilon() == 0.001
                - get_c() == 1
                - This object will not be verbose

            WHAT THIS OBJECT REPRESENTS
                This object is a tool for distributing the work involved in solving a 
                dlib::structural_svm_problem across many computers.  The best way to understand
                its use is via example:

                First, suppose you have defined a structural_svm_problem object by inheriting from 
                it and defining the appropriate virtual functions.  You could solve it by passing 
                an instance to the oca optimizer.  However, if your separation oracle takes a long 
                time to evaluate then the optimization will take a long time to solve.  To speed 
                this up we can distribute the calls to the separation oracle across many computers.  
                
                To make this concrete, lets imagine you want to distribute the work across three 
                computers. You can accomplish this by creating four programs.  One containing a 
                svm_struct_controller_node and three containing svm_struct_processing_nodes.

                The programs might look like this:

                Controller program:
                    int main() 
                    {
                        svm_struct_controller_node cont;
                        cont.set_c(100);
                        // Tell cont where the processing nodes are on your network.
                        cont.add_processing_node("192.168.1.10", 12345);
                        cont.add_processing_node("192.168.1.11", 12345);
                        cont.add_processing_node("192.168.1.12", 12345);
                        matrix<double> w;
                        oca solver;
                        cont(solver, w); // Run the optimization.
                        // After this finishes w will contain the solution vector.
                    }

                Processing programs (they are all the same, except that each loads a different subset
                of the training data):
                    int main()
                    {
                        // Put one third of your data into this problem object.  How you do this depends on your problem.
                        your_structural_svm_problem problem;
                        svm_struct_processing_node node(problem, 12345, number_of_cores_on_this_computer);
                        cout << "hit enter to terminate this program" << endl;
                        cin.get();
                    }

        !*/

    public:

        svm_struct_controller_node (
        );
        /*!
            ensures
                - this object is properly initialized
        !*/

        void set_epsilon (
            double eps
        );
        /*!
            requires
                - eps > 0
            ensures
                - #get_epsilon() == eps
        !*/

        double get_epsilon (
        ) const;
        /*!
            ensures
                - returns the error epsilon that determines when training should stop.
                  Smaller values may result in a more accurate solution but take longer 
                  to execute.  Specifically, the algorithm stops when the average sample
                  risk (i.e. R(w) as defined by the dlib::structural_svm_problem object) is 
                  within epsilon of its optimal value.

                  Also note that sample risk is an upper bound on a sample's loss.  So
                  you can think of this epsilon value as saying "solve the optimization
                  problem until the average loss per sample is within epsilon of it's 
                  optimal value".
        !*/

        void be_verbose (
        );
        /*!
            ensures
                - This object will print status messages to standard out so that a 
                  user can observe the progress of the algorithm.
        !*/

        void be_quiet(
        );
        /*!
            ensures
                - this object will not print anything to standard out
        !*/

        double get_c (
        ) const;
        /*!
            ensures
                - returns the SVM regularization parameter.  It is the parameter that 
                  determines the trade off between trying to fit the training data 
                  exactly or allowing more errors but hopefully improving the 
                  generalization of the resulting classifier.  Larger values encourage 
                  exact fitting while smaller values of C may encourage better 
                  generalization. 
        !*/

        void set_c (
            double C
        );
        /*!
            requires
                - C > 0
            ensures
                - #get_c() == C
        !*/

        void add_processing_node (
            const std::string& ip,
            unsigned short port
        );
        /*!
            ensures
                - if (this port and ip haven't already been added) then
                    - #get_num_processing_nodes() == get_num_processing_nodes() + 1
                    - When operator() is invoked to solve the structural svm problem
                      this object will connect to the svm_struct_processing_node located
                      at the given IP address and port number and will include it in the
                      distributed optimization.
        !*/

        unsigned long get_num_processing_nodes (
        ) const;
        /*!
            ensures
                - returns the number of remote processing nodes that have been
                  registered with this object.
        !*/

        void remove_processing_nodes (
        );
        /*!
            ensures
                - #get_num_processing_nodes() == 0
        !*/

        class invalid_problem : public error {};

        template <typename matrix_type>
        double operator() (
            const oca& solver,
            matrix_type& w
        ) const;
        /*!
            requires
                - get_num_processing_nodes() != 0
                - matrix_type == a dlib::matrix capable of storing column vectors
            ensures
                - connects to the processing nodes and begins optimizing the structural
                  svm problem using the given oca solver.
                - stores the solution in #w
                - returns the objective value at the solution #w
            throws
                - invalid_problem
                  This exception is thrown if the svm_struct_processing_nodes disagree
                  on the dimensionality of the problem.  That is, if they disagree on
                  the value of structural_svm_problem::get_num_dimensions().
        !*/

    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_STRUCTURAL_SVM_DISTRIBUTeD_ABSTRACT_H__


