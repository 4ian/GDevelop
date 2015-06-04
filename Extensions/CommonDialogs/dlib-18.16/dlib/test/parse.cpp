// Copyright (C) 2012  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#include <dlib/optimization.h>
#include <sstream>
#include <string>
#include <cstdlib>
#include <ctime>

#include "tester.h"

namespace  
{

    using namespace test;
    using namespace dlib;
    using namespace std;


    logger dlog("test.parse");

// ----------------------------------------------------------------------------------------

    const unsigned long DET = 0;
    const unsigned long N   = 1;
    const unsigned long V   = 2;
    const unsigned long NP  = 3;
    const unsigned long VP  = 4;
    const unsigned long S   = 5;
    const unsigned long B   = 6;
    const unsigned long G   = 7;
    const unsigned long A   = 8;

    typedef unsigned long tags;

    template <bool has_glue_term>
    void user_defined_ruleset (
        const std::vector<tags>& words,
        const constituent<tags>& c,
        std::vector<std::pair<tags,double> >& possible_ids
    )
    {
        DLIB_TEST(c.begin < c.k && c.k < c.end && c.end <= words.size());
        DLIB_TEST(possible_ids.size() == 0);

        if (c.left_tag == NP && c.right_tag == VP)      possible_ids.push_back(make_pair(S,log(0.80)));
        else if (c.left_tag == DET && c.right_tag == N) possible_ids.push_back(make_pair(NP,log(0.30)));
        else if (c.left_tag == VP && c.right_tag == A) possible_ids.push_back(make_pair(VP,log(0.30)));
        else if (c.left_tag == V && c.right_tag == NP)
        {
            possible_ids.push_back(make_pair(VP,log(0.20)));
            possible_ids.push_back(make_pair(B,0.10));
        }
        else if (has_glue_term)
        {
            possible_ids.push_back(make_pair(G, log(0.01)));
        }
    }

// ----------------------------------------------------------------------------------------

    void dotest1()
    {
        print_spinner();
        dlog << LINFO << "in dotest1()";

        std::vector<std::string> words;
        std::vector<tags> sequence;
        for (int i = 0; i < 8; ++i)
        {
            sequence.push_back(DET);
            sequence.push_back(N);
            sequence.push_back(V);
            sequence.push_back(DET);
            sequence.push_back(N);
            sequence.push_back(A);

            words.push_back("The");
            words.push_back("flight");
            words.push_back("includes");
            words.push_back("a");
            words.push_back("meal");
            words.push_back("AWORD");
        }

        std::vector<parse_tree_element<tags> > parse_tree;

        find_max_parse_cky(sequence, user_defined_ruleset<true>, parse_tree);
        DLIB_TEST(parse_tree.size() != 0);


        std::vector<unsigned long> roots;
        find_trees_not_rooted_with_tag(parse_tree, G, roots);
        DLIB_TEST(roots.size() == 8);

        for (unsigned long i = 0; i < roots.size(); ++i)
        {
            dlog << LINFO << parse_tree_to_string(parse_tree, words, roots[i]);
            DLIB_TEST(parse_tree_to_string(parse_tree, words, roots[i]) == "[[The flight] [[includes [a meal]] AWORD]]");
            dlog << LINFO << parse_tree_to_string_tagged(parse_tree, words, roots[i]);
            DLIB_TEST(parse_tree_to_string_tagged(parse_tree, words, roots[i]) == "[5 [3 The flight] [4 [4 includes [3 a meal]] AWORD]]");
        }


        words.clear();
        sequence.clear();

        for (int i = 0; i < 2; ++i)
        {
            sequence.push_back(DET);
            sequence.push_back(N);
            sequence.push_back(V);
            sequence.push_back(DET);
            sequence.push_back(N);

            words.push_back("The");
            words.push_back("flight");
            words.push_back("includes");
            words.push_back("a");
            words.push_back("meal");
        }

        find_max_parse_cky(sequence, user_defined_ruleset<true>, parse_tree);
        DLIB_TEST(parse_tree.size() != 0);

        const std::string str1 = "[[[The flight] [includes [a meal]]] [[The flight] [includes [a meal]]]]";
        const std::string str2 = "[7 [5 [3 The flight] [4 includes [3 a meal]]] [5 [3 The flight] [4 includes [3 a meal]]]]";
        dlog << LINFO << parse_tree_to_string(parse_tree, words);
        DLIB_TEST(parse_tree_to_string(parse_tree, words) == str1);
        dlog << LINFO << parse_tree_to_string_tagged(parse_tree, words);
        DLIB_TEST(parse_tree_to_string_tagged(parse_tree, words) == str2);

        const std::string str3 = "[[The flight] [includes [a meal]]] [[The flight] [includes [a meal]]]";
        const std::string str4 = "[5 [3 The flight] [4 includes [3 a meal]]] [5 [3 The flight] [4 includes [3 a meal]]]";
        dlog << LINFO << parse_trees_to_string(parse_tree, words, G);
        DLIB_TEST(parse_trees_to_string(parse_tree, words, G) == str3);
        dlog << LINFO << parse_trees_to_string_tagged(parse_tree, words, G);
        DLIB_TEST(parse_trees_to_string_tagged(parse_tree, words, G) == str4);

        sequence.clear();
        find_max_parse_cky(sequence, user_defined_ruleset<true>, parse_tree);
        DLIB_TEST(parse_tree.size() == 0);
    }

// ----------------------------------------------------------------------------------------

    void dotest2()
    {
        print_spinner();
        dlog << LINFO << "in dotest2()";

        std::vector<std::string> words;
        std::vector<tags> sequence;
        for (int i = 0; i < 8; ++i)
        {
            sequence.push_back(DET);
            sequence.push_back(N);
            sequence.push_back(V);
            sequence.push_back(DET);
            sequence.push_back(N);

            words.push_back("The");
            words.push_back("flight");
            words.push_back("includes");
            words.push_back("a");
            words.push_back("meal");
        }

        std::vector<parse_tree_element<tags> > parse_tree;

        find_max_parse_cky(sequence, user_defined_ruleset<false>, parse_tree);
        DLIB_TEST(parse_tree.size() == 0);


        std::vector<unsigned long> roots;
        find_trees_not_rooted_with_tag(parse_tree, G, roots);
        DLIB_TEST(roots.size() == 0);


        words.clear();
        sequence.clear();

        for (int i = 0; i < 2; ++i)
        {
            sequence.push_back(DET);
            sequence.push_back(N);
            sequence.push_back(V);
            sequence.push_back(DET);
            sequence.push_back(N);

            words.push_back("The");
            words.push_back("flight");
            words.push_back("includes");
            words.push_back("a");
            words.push_back("meal");
        }

        find_max_parse_cky(sequence, user_defined_ruleset<false>, parse_tree);
        DLIB_TEST(parse_tree.size() == 0);

        sequence.clear();
        find_max_parse_cky(sequence, user_defined_ruleset<false>, parse_tree);
        DLIB_TEST(parse_tree.size() == 0);
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    class parse_tester : public tester
    {
    public:
        parse_tester (
        ) :
            tester ("test_parse",
                    "Runs tests on the parsing tools.")
        {}


        void perform_test (
        )
        {
            dotest1();
            dotest2();
        }
    } a;


}




