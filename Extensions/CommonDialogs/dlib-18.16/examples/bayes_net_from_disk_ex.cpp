// The contents of this file are in the public domain. See LICENSE_FOR_EXAMPLE_PROGRAMS.txt
/*
    This is an example illustrating the use of the Bayesian Network 
    inference utilities found in the dlib C++ library.  In this example
    we load a saved Bayesian Network from disk.  
*/


#include <dlib/bayes_utils.h>
#include <dlib/graph_utils.h>
#include <dlib/graph.h>
#include <dlib/directed_graph.h>
#include <iostream>
#include <fstream>


using namespace dlib;
using namespace std;

// ----------------------------------------------------------------------------------------

int main(int argc, char** argv)
{
    try
    {
        // This statement declares a bayesian network called bn.  Note that a bayesian network
        // in the dlib world is just a directed_graph object that contains a special kind 
        // of node called a bayes_node.
        directed_graph<bayes_node>::kernel_1a_c bn;

        if (argc != 2)
        {
            cout << "You must supply a file name on the command line.  The file should "
                 << "contain a serialized Bayesian Network" << endl;
            return 1;
        }

        ifstream fin(argv[1],ios::binary);

        // Note that the saved networks produced by the bayes_net_gui_ex.cpp example can be deserialized
        // into a network.  So you can make your networks using that GUI if you like.
        cout << "Loading the network from disk..." << endl;
        deserialize(bn, fin);

        cout << "Number of nodes in the network: " << bn.number_of_nodes() << endl;

        // Let's compute some probability values using the loaded network using the join tree (aka. Junction 
        // Tree) algorithm.

        // First we need to create an undirected graph which contains set objects at each node and
        // edge.  This long declaration does the trick.
        typedef graph<dlib::set<unsigned long>::compare_1b_c, dlib::set<unsigned long>::compare_1b_c>::kernel_1a_c join_tree_type;
        join_tree_type join_tree;

        // Now we need to populate the join_tree with data from our bayesian network.  The next two 
        // function calls do this.  Explaining exactly what they do is outside the scope of this
        // example.  Just think of them as filling join_tree with information that is useful 
        // later on for dealing with our bayesian network.  
        create_moral_graph(bn, join_tree);
        create_join_tree(join_tree, join_tree);

        // Now we have a proper join_tree we can use it to obtain a solution to our
        // bayesian network.  Doing this is as simple as declaring an instance of
        // the bayesian_network_join_tree object as follows:
        bayesian_network_join_tree solution(bn, join_tree);


        // now print out the probabilities for each node
        cout << "Using the join tree algorithm:\n";
        for (unsigned long i = 0; i < bn.number_of_nodes(); ++i)
        {
            // print out the probability distribution for node i.  
            cout << "p(node " << i <<") = " << solution.probability(i);
        }
    }
    catch (exception& e)
    {
        cout << "exception thrown: " << e.what() << endl;
        return 1;
    }
}


