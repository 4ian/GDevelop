// The contents of this file are in the public domain. See LICENSE_FOR_EXAMPLE_PROGRAMS.txt
/*
    This is an example illustrating the use of the Bayesian Network 
    inference utilities found in the dlib C++ library.
    

    In this example all the nodes in the Bayesian network are
    boolean variables.  That is, they take on either the value
    0 or the value 1.

    The network contains 4 nodes and looks as follows:

        B     C
        \\   //
         \/ \/ 
           A
           ||
           \/
            D


    The probabilities of each node are summarized below.  (The probability
    of each node being 0 is not listed since it is just P(X=0) = 1-p(X=1) ) 

        p(B=1) = 0.01

        p(C=1) = 0.001

        p(A=1 | B=0, C=0) = 0.01  
        p(A=1 | B=0, C=1) = 0.5
        p(A=1 | B=1, C=0) = 0.9
        p(A=1 | B=1, C=1) = 0.99 

        p(D=1 | A=0) = 0.2 
        p(D=1 | A=1) = 0.5

*/


#include <dlib/bayes_utils.h>
#include <dlib/graph_utils.h>
#include <dlib/graph.h>
#include <dlib/directed_graph.h>
#include <iostream>


using namespace dlib;
using namespace std;

// ----------------------------------------------------------------------------------------

int main()
{
    try
    {
        // There are many useful convenience functions in this namespace.  They all
        // perform simple access or modify operations on the nodes of a bayesian network. 
        // You don't have to use them but they are convenient and they also will check for
        // various errors in your bayesian network when your application is built with
        // the DEBUG or ENABLE_ASSERTS preprocessor definitions defined.  So their use
        // is recommended.  In fact, most of the global functions used in this example 
        // program are from this namespace.
        using namespace bayes_node_utils;

        // This statement declares a bayesian network called bn.  Note that a bayesian network
        // in the dlib world is just a directed_graph object that contains a special kind 
        // of node called a bayes_node.
        directed_graph<bayes_node>::kernel_1a_c bn;

        // Use an enum to make some more readable names for our nodes.
        enum nodes
        {
            A = 0,
            B = 1,
            C = 2,
            D = 3
        };

        // The next few blocks of code setup our bayesian network.

        // The first thing we do is tell the bn object how many nodes it has
        // and also add the three edges.  Again, we are using the network
        // shown in ASCII art at the top of this file.
        bn.set_number_of_nodes(4);
        bn.add_edge(A, D);
        bn.add_edge(B, A);
        bn.add_edge(C, A);


        // Now we inform all the nodes in the network that they are binary
        // nodes.  That is, they only have two possible values.  
        set_node_num_values(bn, A, 2);
        set_node_num_values(bn, B, 2);
        set_node_num_values(bn, C, 2);
        set_node_num_values(bn, D, 2);

        assignment parent_state;
        // Now we will enter all the conditional probability information for each node.
        // Each node's conditional probability is dependent on the state of its parents.  
        // To specify this state we need to use the assignment object.  This assignment 
        // object allows us to specify the state of each nodes parents. 


        // Here we specify that p(B=1) = 0.01
        // parent_state is empty in this case since B is a root node. 
        set_node_probability(bn, B, 1, parent_state, 0.01);
        // Here we specify that p(B=0) = 1-0.01
        set_node_probability(bn, B, 0, parent_state, 1-0.01);


        // Here we specify that p(C=1) = 0.001
        // parent_state is empty in this case since B is a root node. 
        set_node_probability(bn, C, 1, parent_state, 0.001);
        // Here we specify that p(C=0) = 1-0.001
        set_node_probability(bn, C, 0, parent_state, 1-0.001);


        // This is our first node that has parents. So we set the parent_state
        // object to reflect that A has both B and C as parents.
        parent_state.add(B, 1);
        parent_state.add(C, 1);
        // Here we specify that p(A=1 | B=1, C=1) = 0.99 
        set_node_probability(bn, A, 1, parent_state, 0.99);
        // Here we specify that p(A=0 | B=1, C=1) = 1-0.99 
        set_node_probability(bn, A, 0, parent_state, 1-0.99);

        // Here we use the [] notation because B and C have already
        // been added into parent state.  
        parent_state[B] = 1;
        parent_state[C] = 0;
        // Here we specify that p(A=1 | B=1, C=0) = 0.9 
        set_node_probability(bn, A, 1, parent_state, 0.9);
        set_node_probability(bn, A, 0, parent_state, 1-0.9);

        parent_state[B] = 0;
        parent_state[C] = 1;
        // Here we specify that p(A=1 | B=0, C=1) = 0.5 
        set_node_probability(bn, A, 1, parent_state, 0.5);
        set_node_probability(bn, A, 0, parent_state, 1-0.5);

        parent_state[B] = 0;
        parent_state[C] = 0;
        // Here we specify that p(A=1 | B=0, C=0) = 0.01 
        set_node_probability(bn, A, 1, parent_state, 0.01);
        set_node_probability(bn, A, 0, parent_state, 1-0.01);


        // Here we set probabilities for node D.
        // First we clear out parent state so that it doesn't have any of
        // the assignments for the B and C nodes used above.
        parent_state.clear();
        parent_state.add(A,1);
        // Here we specify that p(D=1 | A=1) = 0.5 
        set_node_probability(bn, D, 1, parent_state, 0.5);
        set_node_probability(bn, D, 0, parent_state, 1-0.5);

        parent_state[A] = 0;
        // Here we specify that p(D=1 | A=0) = 0.2 
        set_node_probability(bn, D, 1, parent_state, 0.2);
        set_node_probability(bn, D, 0, parent_state, 1-0.2);



        // We have now finished setting up our bayesian network.  So let's compute some 
        // probability values.  The first thing we will do is compute the prior probability
        // of each node in the network.  To do this we will use the join tree algorithm which
        // is an algorithm for performing exact inference in a bayesian network.   

        // First we need to create an undirected graph which contains set objects at each node and
        // edge.  This long declaration does the trick.
        typedef dlib::set<unsigned long>::compare_1b_c set_type;
        typedef graph<set_type, set_type>::kernel_1a_c join_tree_type;
        join_tree_type join_tree;

        // Now we need to populate the join_tree with data from our bayesian network.  The next  
        // function calls do this.  Explaining exactly what they do is outside the scope of this
        // example.  Just think of them as filling join_tree with information that is useful 
        // later on for dealing with our bayesian network.  
        create_moral_graph(bn, join_tree);
        create_join_tree(join_tree, join_tree);

        // Now that we have a proper join_tree we can use it to obtain a solution to our
        // bayesian network.  Doing this is as simple as declaring an instance of
        // the bayesian_network_join_tree object as follows:
        bayesian_network_join_tree solution(bn, join_tree);


        // now print out the probabilities for each node
        cout << "Using the join tree algorithm:\n";
        cout << "p(A=1) = " << solution.probability(A)(1) << endl;
        cout << "p(A=0) = " << solution.probability(A)(0) << endl;
        cout << "p(B=1) = " << solution.probability(B)(1) << endl;
        cout << "p(B=0) = " << solution.probability(B)(0) << endl;
        cout << "p(C=1) = " << solution.probability(C)(1) << endl;
        cout << "p(C=0) = " << solution.probability(C)(0) << endl;
        cout << "p(D=1) = " << solution.probability(D)(1) << endl;
        cout << "p(D=0) = " << solution.probability(D)(0) << endl;
        cout << "\n\n\n";


        // Now to make things more interesting let's say that we have discovered that the C 
        // node really has a value of 1.  That is to say, we now have evidence that 
        // C is 1.  We can represent this in the network using the following two function
        // calls.
        set_node_value(bn, C, 1);
        set_node_as_evidence(bn, C);

        // Now we want to compute the probabilities of all the nodes in the network again
        // given that we now know that C is 1.  We can do this as follows:
        bayesian_network_join_tree solution_with_evidence(bn, join_tree);

        // now print out the probabilities for each node
        cout << "Using the join tree algorithm:\n";
        cout << "p(A=1 | C=1) = " << solution_with_evidence.probability(A)(1) << endl;
        cout << "p(A=0 | C=1) = " << solution_with_evidence.probability(A)(0) << endl;
        cout << "p(B=1 | C=1) = " << solution_with_evidence.probability(B)(1) << endl;
        cout << "p(B=0 | C=1) = " << solution_with_evidence.probability(B)(0) << endl;
        cout << "p(C=1 | C=1) = " << solution_with_evidence.probability(C)(1) << endl;
        cout << "p(C=0 | C=1) = " << solution_with_evidence.probability(C)(0) << endl;
        cout << "p(D=1 | C=1) = " << solution_with_evidence.probability(D)(1) << endl;
        cout << "p(D=0 | C=1) = " << solution_with_evidence.probability(D)(0) << endl;
        cout << "\n\n\n";

        // Note that when we made our solution_with_evidence object we reused our join_tree object.
        // This saves us the time it takes to calculate the join_tree object from scratch.  But
        // it is important to note that we can only reuse the join_tree object if we haven't changed
        // the structure of our bayesian network.  That is, if we have added or removed nodes or 
        // edges from our bayesian network then we must recompute our join_tree.  But in this example
        // all we did was change the value of a bayes_node object (we made node C be evidence)
        // so we are ok.





        // Next this example will show you how to use the bayesian_network_gibbs_sampler object
        // to perform approximate inference in a bayesian network.  This is an algorithm 
        // that doesn't give you an exact solution but it may be necessary to use in some 
        // instances.  For example, the join tree algorithm used above, while fast in many
        // instances, has exponential runtime in some cases.  Moreover, inference in bayesian
        // networks is NP-Hard for general networks so sometimes the best you can do is
        // find an approximation.
        // However, it should be noted that the gibbs sampler does not compute the correct
        // probabilities if the network contains a deterministic node.  That is, if any
        // of the conditional probability tables in the bayesian network have a probability
        // of 1.0 for something the gibbs sampler should not be used.


        // This Gibbs sampler algorithm works by randomly sampling possibles values of the
        // network.  So to use it we should set the network to some initial state.  

        set_node_value(bn, A, 0);
        set_node_value(bn, B, 0);
        set_node_value(bn, D, 0);

        // We will leave the C node with a value of 1 and keep it as an evidence node.  


        // First create an instance of the gibbs sampler object
        bayesian_network_gibbs_sampler sampler;


        // To use this algorithm all we do is go into a loop for a certain number of times
        // and each time through we sample the bayesian network.  Then we count how 
        // many times a node has a certain state.  Then the probability of that node
        // having that state is just its count/total times through the loop. 

        // The following code illustrates the general procedure.
        unsigned long A_count = 0;
        unsigned long B_count = 0;
        unsigned long C_count = 0;
        unsigned long D_count = 0;

        // The more times you let the loop run the more accurate the result will be.  Here we loop
        // 2000 times.
        const long rounds = 2000;
        for (long i = 0; i < rounds; ++i)
        {
            sampler.sample_graph(bn);

            if (node_value(bn, A) == 1)
                ++A_count;
            if (node_value(bn, B) == 1)
                ++B_count;
            if (node_value(bn, C) == 1)
                ++C_count;
            if (node_value(bn, D) == 1)
                ++D_count;
        }

        cout << "Using the approximate Gibbs Sampler algorithm:\n";
        cout << "p(A=1 | C=1) = " << (double)A_count/(double)rounds << endl;
        cout << "p(B=1 | C=1) = " << (double)B_count/(double)rounds << endl;
        cout << "p(C=1 | C=1) = " << (double)C_count/(double)rounds << endl;
        cout << "p(D=1 | C=1) = " << (double)D_count/(double)rounds << endl;
    }
    catch (std::exception& e)
    {
        cout << "exception thrown: " << endl;
        cout << e.what() << endl;
        cout << "hit enter to terminate" << endl;
        cin.get();
    }
}



