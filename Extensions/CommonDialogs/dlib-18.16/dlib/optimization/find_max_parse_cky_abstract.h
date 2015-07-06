// Copyright (C) 2012  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_FIND_MAX_PARsE_CKY_ABSTRACT_Hh_
#ifdef DLIB_FIND_MAX_PARsE_CKY_ABSTRACT_Hh_

#include <vector>
#include <string>
#include "../algs.h" 
#include "../serialize.h" 

namespace dlib
{

// -----------------------------------------------------------------------------------------

    template <
        typename T
        >
    struct constituent 
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object represents the linguistic idea of a constituent, that is, a
                group of words that functions as a single unit.  In particular, it
                represents a combination of two constituents into a new constituent.

                Additionally, a constituent object represents a range of words relative to
                some std::vector of words.  The range is from [begin, end) (i.e. including
                begin but not including end, so using the normal C++ iterator notation).
                Moreover, a constituent is always composed of two parts, each having a tag.
                Therefore, the left part is composed of the words in the range [begin,k)
                and has tag left_tag while the right part of the constituent contains the
                words in the range [k,end) and has the tag right_tag.

                The tags are user defined objects of type T.  In general, they are used to
                represent syntactic categories such as noun phrase, verb phrase, etc.
        !*/

        unsigned long begin, end, k;
        T left_tag; 
        T right_tag;
    };

    template <
        typename T
        >
    void serialize(
        const constituent<T>& item,
        std::ostream& out
    );
    /*!
        provides serialization support
    !*/

    template <
        typename T
        >
    void deserialize(
        constituent<T>& item,
        std::istream& in 
    );
    /*!
        provides deserialization support 
    !*/

// -----------------------------------------------------------------------------------------

    /*!A END_OF_TREE is used to indicate that parse_tree_element::left or
         parse_tree_element::right doesn't point to another subtree.
    !*/
    const unsigned long END_OF_TREE = 0xFFFFFFFF;

// -----------------------------------------------------------------------------------------

    template <
        typename T
        >
    struct parse_tree_element
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object is used to represent a node in a binary parse tree.  An entire
                parse tree is represented by a std::vector of parse_tree_element objects.
                We follow the convention that the first element of this vector is always
                the root of the entire tree.

                The fields of this object have the following interpretations:   
                    - c == the constituent spanned by this node in the parse tree.
                      Therefore, the node spans the words in the range [c.begin, c.end).
                    - tag == the syntactic category of this node in the parse tree.
                    - score == the score or log likelihood for this parse tree.  In
                      general, this is the sum of scores of all the production rules used
                      to build the tree rooted at the current node.
                    - let PT denote the vector of parse_tree_elements that defines an
                      entire parse tree.  Then we have:
                        - if (left != END_OF_TREE) then
                            - PT[left] == the left sub-tree of the current node.
                            - PT[left] spans the words [c.begin, c.k)
                            - PT[left].tag == c.left_tag
                        - else
                            - there is no left sub-tree

                        - if (right != END_OF_TREE) then
                            - PT[right] == the right sub-tree of the current node.
                            - PT[right] spans the words [c.k, c.end)
                            - PT[right].tag == c.right_tag
                        - else
                            - there is no right sub-tree
        !*/

        constituent<T> c;
        T tag; 
        double score; 

        unsigned long left;
        unsigned long right; 
    };

    template <
        typename T
        >
    void serialize (
        const parse_tree_element<T>& item,
        std::ostream& out
    );
    /*!
        provides serialization support
    !*/

    template <
        typename T
        >
    void deserialize (
        parse_tree_element<T>& item,
        std::istream& in 
    );
    /*!
        provides deserialization support 
    !*/

// -----------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------

    void example_production_rule_function (
        const std::vector<T>& words,
        const constituent<T>& c,
        std::vector<std::pair<T,double> >& possible_tags
    )
    /*!
        requires
            - 0 <= c.begin < c.k < c.end <= words.size()
            - possible_tags.size() == 0 
        ensures
            - Finds all the syntactic categories that can be used to label c and puts those
              categories, along with their scores, into possible_tags.  Or in other words,
              this function determines which production rules can be used to turn the left
              and right sub-constituents in c into a single constituent.  The contents of c
              have the following interpretations:
                - The left sub-constituent has syntactic category c.left_tag 
                - for all i such that c.begin <= i < c.k: 
                    - words[i] is part of the left sub-constituent.
                - The right sub-constituent has syntactic category c.right_tag 
                - for all i such that c.k <= i < c.end: 
                    - words[i] is part of the right sub-constituent.

            - Note that example_production_rule_function() is not a real function.  It is
              here just to show you how to define production rule producing functions for
              use with the find_max_parse_cky() routine defined below.
    !*/

    template <
        typename T, 
        typename production_rule_function
        >
    void find_max_parse_cky (
        const std::vector<T>& words,
        const production_rule_function& production_rules,
        std::vector<parse_tree_element<T> >& parse_tree
    );
    /*!
        requires
            - production_rule_function == a function or function object with the same
              interface as example_production_rule_function defined above.
            - It must be possible to store T objects in a std::map.
        ensures
            - Uses the CKY algorithm to find the most probable/highest scoring binary parse
              tree of the given vector of words.  
            - if (#parse_tree.size() == 0) then
                - There is no parse tree, using the given production_rules, that can cover
                  the given word sequence.
            - else
                - #parse_tree == the highest scoring parse tree that covers all the
                  elements of words.
                - #parse_tree[0] == the root node of the parse tree.
                - #parse_tree[0].score == the score of the parse tree.  This is the sum of
                  the scores of all production rules used to construct the tree.
                - #parse_tree[0].begin == 0
                - #parse_tree[0].end == words.size()
            - This function uses production_rules() to find out what the allowed production
              rules are.  That is, production_rules() defines all properties of the grammar
              used by find_max_parse_cky(). 
    !*/

// -----------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------

    class parse_tree_to_string_error : public error
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This is the exception thrown by parse_tree_to_string() and
                parse_tree_to_string_tagged() if the inputs are discovered to be invalid.
        !*/
    };

// -----------------------------------------------------------------------------------------

    template <
        typename T, 
        typename U
        >
    std::string parse_tree_to_string (
        const std::vector<parse_tree_element<T> >& tree,
        const std::vector<U>& words,
        const unsigned long root_idx = 0
    );
    /*!
        requires
            - It must be possible to print U objects to an ostream using operator<<
              (typically, U would be something like std::string)
        ensures
            - Interprets tree as a parse tree defined over the given sequence of words.  
            - returns a bracketed string that represents the parse tree over the words.  
              For example, suppose the following parse tree is input:

                        /\
                       /  \
                      /\   \
                     /  \   \
                   the dog  ran

              Then the output would be the string "[[the dog] ran]"
            - Only the sub-tree rooted at tree[root_idx] will be output.  If root_idx >= 
              tree.size() then the empty string is returned.
        throws
            - parse_tree_to_string_error
                This exception is thrown if an invalid tree is detected.  This might happen
                if the tree refers to elements of words that don't exist because words is
                shorted than it is supposed to be.
    !*/

// -----------------------------------------------------------------------------------------

    template <
        typename T, 
        typename U
        >
    std::string parse_tree_to_string_tagged (
        const std::vector<parse_tree_element<T> >& tree,
        const std::vector<U>& words,
        const unsigned long root_idx = 0
    );
    /*!
        requires
            - It must be possible to print T objects to an ostream using operator<<
            - It must be possible to print U objects to an ostream using operator<<
              (typically, U would be something like std::string)
        ensures
            - This function does the same thing as parse_tree_to_string() except that it
              also includes the parse_tree_element::tag object in the output.  Therefore,
              the tag of each bracket will be included as the first token inside the
              bracket.  For example, suppose the following parse tree is input (where tags
              are shown at the vertices):

                        S
                        /\
                      NP  \
                      /\   \
                     /  \   \
                   the dog  ran

              Then the output would be the string "[S [NP the dog] ran]"
            - Only the sub-tree rooted at tree[root_idx] will be output.  If root_idx >=
              tree.size() then the empty string is returned.
        throws
            - parse_tree_to_string_error
                This exception is thrown if an invalid tree is detected.  This might happen
                if the tree refers to elements of words that don't exist because words is
                shorted than it is supposed to be.
    !*/

// -----------------------------------------------------------------------------------------

    template <
        typename T, 
        typename U
        >
    std::string parse_trees_to_string (
        const std::vector<parse_tree_element<T> >& tree,
        const std::vector<U>& words,
        const T& tag_to_skip
    );
    /*!
        requires
            - It must be possible to print U objects to an ostream using operator<<
              (typically, U would be something like std::string)
        ensures
            - This function behaves just like parse_tree_to_string() except that it will
              not print the brackets (i.e. []) for the top most parts of the tree which
              have tags equal to tag_to_skip.  It will however print all the words.
              Therefore, this function only includes brackets on the subtrees which begin
              with a tag other than tag_to_skip.
        throws
            - parse_tree_to_string_error
                This exception is thrown if an invalid tree is detected.  This might happen
                if the tree refers to elements of words that don't exist because words is
                shorted than it is supposed to be.
    !*/

// -----------------------------------------------------------------------------------------

    template <
        typename T, 
        typename U
        >
    std::string parse_trees_to_string_tagged (
        const std::vector<parse_tree_element<T> >& tree,
        const std::vector<U>& words,
        const T& tag_to_skip
    );
    /*!
        requires
            - It must be possible to print T objects to an ostream using operator<<
            - It must be possible to print U objects to an ostream using operator<<
              (typically, U would be something like std::string)
        ensures
            - This function behaves just like parse_tree_to_string_tagged() except that it
              will not print the brackets (i.e. []) for the top most parts of the tree
              which have tags equal to tag_to_skip.  It will however print all the words.
              Therefore, this function only includes brackets on the subtrees which begin
              with a tag other than tag_to_skip.
        throws
            - parse_tree_to_string_error
                This exception is thrown if an invalid tree is detected.  This might happen
                if the tree refers to elements of words that don't exist because words is
                shorted than it is supposed to be.
    !*/

// -----------------------------------------------------------------------------------------

    template <
        typename T
        >
    void find_trees_not_rooted_with_tag (
        const std::vector<parse_tree_element<T> >& tree,
        const T& tag,
        std::vector<unsigned long>& tree_roots 
    );
    /*!
        requires
            - objects of type T must be comparable using operator==
        ensures
            - Finds all the largest non-overlapping trees in tree that are not rooted with
              the given tag.  
            - find_trees_not_rooted_with_tag() is useful when you want to cut a parse tree
              into a bunch of sub-trees and you know that the top level of the tree is all
              composed of the same kind of tag.  So if you want to just "slice off" the top
              of the tree where this tag lives then this function is useful for doing that.
            - #tree_roots.size() == the number of sub-trees found.
            - for all valid i:
                - tree[#tree_roots[i]].tag != tag
            - To make the operation of this function clearer, here are a few examples of
              what it will do:
                - if (tree[0].tag != tag) then 
                    - #tree_roots.size() == 0
                    - #tree_roots[0] == 0
                - else if (tree[0].tag == tag but its immediate children's tags are not equal to tag) then 
                    - #tree_roots.size() == 2
                    - #tree_roots[0] == tree[0].left
                    - #tree_roots[1] == tree[0].right
    !*/

// -----------------------------------------------------------------------------------------

}

#endif // DLIB_FIND_MAX_PARsE_CKY_ABSTRACT_Hh_

