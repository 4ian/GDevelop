// Copyright (C) 2012  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_FIND_MAX_PaRSE_CKY_Hh_
#define DLIB_FIND_MAX_PaRSE_CKY_Hh_

#include "find_max_parse_cky_abstract.h"
#include <vector>
#include <string>
#include <sstream>
#include "../serialize.h" 
#include "../array2d.h"

namespace dlib
{

// -----------------------------------------------------------------------------------------

    template <typename T>
    struct constituent 
    {
        unsigned long begin, end, k;
        T left_tag; 
        T right_tag;
    };

    template <typename T>
    void serialize(
        const constituent<T>& item,
        std::ostream& out
    )
    {
        serialize(item.begin, out);
        serialize(item.end, out);
        serialize(item.k, out);
        serialize(item.left_tag, out);
        serialize(item.right_tag, out);
    }

    template <typename T>
    void deserialize(
        constituent<T>& item,
        std::istream& in 
    )
    {
        deserialize(item.begin, in);
        deserialize(item.end, in);
        deserialize(item.k, in);
        deserialize(item.left_tag, in);
        deserialize(item.right_tag, in);
    }

// -----------------------------------------------------------------------------------------

    const unsigned long END_OF_TREE = 0xFFFFFFFF;

// -----------------------------------------------------------------------------------------

    template <typename T>
    struct parse_tree_element
    {
        constituent<T> c;
        T tag; // id for the constituent corresponding to this level of the tree

        unsigned long left;
        unsigned long right; 
        double score; 
    };

    template <typename T>
    void serialize (
        const parse_tree_element<T>& item,
        std::ostream& out
    )
    {
        serialize(item.c, out);
        serialize(item.tag, out);
        serialize(item.left, out);
        serialize(item.right, out);
        serialize(item.score, out);
    }

    template <typename T>
    void deserialize (
        parse_tree_element<T>& item,
        std::istream& in 
    )
    {
        deserialize(item.c, in);
        deserialize(item.tag, in);
        deserialize(item.left, in);
        deserialize(item.right, in);
        deserialize(item.score, in);
    }

// -----------------------------------------------------------------------------------------

    namespace impl
    {
        template <typename T>
        unsigned long fill_parse_tree(
            std::vector<parse_tree_element<T> >& parse_tree, 
            const T& tag,
            const array2d<std::map<T, parse_tree_element<T> > >& back, 
            long r, long c
        )
        /*!
            requires
                - back[r][c].size() == 0 || back[r][c].count(tag) != 0
        !*/
        {
            // base case of the recursion 
            if (back[r][c].size() == 0)
            {
                return END_OF_TREE;
            }

            const unsigned long idx = parse_tree.size();
            const parse_tree_element<T>& item = back[r][c].find(tag)->second;
            parse_tree.push_back(item);

            const long k = item.c.k;
            const unsigned long idx_left  = fill_parse_tree(parse_tree, item.c.left_tag, back, r, k-1); 
            const unsigned long idx_right = fill_parse_tree(parse_tree, item.c.right_tag, back, k, c); 
            parse_tree[idx].left = idx_left;
            parse_tree[idx].right = idx_right;
            return idx;
        }
    }

    template <typename T, typename production_rule_function>
    void find_max_parse_cky (
        const std::vector<T>& sequence,
        const production_rule_function& production_rules,
        std::vector<parse_tree_element<T> >& parse_tree
    )
    {
        parse_tree.clear();
        if (sequence.size() == 0)
            return;

        array2d<std::map<T,double> > table(sequence.size(), sequence.size());
        array2d<std::map<T,parse_tree_element<T> > > back(sequence.size(), sequence.size());
        typedef typename std::map<T,double>::iterator itr;
        typedef typename std::map<T,parse_tree_element<T> >::iterator itr_b;

        for (long r = 0; r < table.nr(); ++r)
            table[r][r][sequence[r]] = 0;

        std::vector<std::pair<T,double> > possible_tags;

        for (long r = table.nr()-2; r >= 0; --r)
        {
            for (long c = r+1; c < table.nc(); ++c)
            {
                for (long k = r; k < c; ++k)
                {
                    for (itr i = table[k+1][c].begin(); i != table[k+1][c].end(); ++i)
                    {
                        for (itr j = table[r][k].begin(); j != table[r][k].end(); ++j)
                        {
                            constituent<T> con;
                            con.begin = r;
                            con.end = c+1;
                            con.k = k+1;
                            con.left_tag = j->first;
                            con.right_tag = i->first;
                            possible_tags.clear();
                            production_rules(sequence, con, possible_tags);
                            for (unsigned long m = 0; m < possible_tags.size(); ++m)
                            {
                                const double score = possible_tags[m].second + i->second + j->second;
                                itr match = table[r][c].find(possible_tags[m].first);
                                if (match == table[r][c].end() || score > match->second)
                                {
                                    table[r][c][possible_tags[m].first] = score;
                                    parse_tree_element<T> item;
                                    item.c = con;
                                    item.score = score;
                                    item.tag = possible_tags[m].first;
                                    item.left = END_OF_TREE;
                                    item.right = END_OF_TREE;
                                    back[r][c][possible_tags[m].first] = item;
                                }
                            }
                        }
                    }
                }
            }
        }


        // now use back pointers to build the parse trees
        const long r = 0;
        const long c = back.nc()-1;
        if (back[r][c].size() != 0)
        {

            // find the max scoring element in back[r][c]
            itr_b max_i = back[r][c].begin();
            itr_b i = max_i;
            ++i;
            for (; i != back[r][c].end(); ++i)
            {
                if (i->second.score > max_i->second.score)
                    max_i = i;
            }

            parse_tree.reserve(c);
            impl::fill_parse_tree(parse_tree, max_i->second.tag, back, r, c);
        }
    }

// -----------------------------------------------------------------------------------------

    class parse_tree_to_string_error : public error
    {
    public:
        parse_tree_to_string_error(const std::string& str): error(str) {}
    };

    namespace impl
    {
        template <bool enabled, typename T>
        typename enable_if_c<enabled>::type conditional_print(
            const T& item,
            std::ostream& out
        ) { out << item << " "; }

        template <bool enabled, typename T>
        typename disable_if_c<enabled>::type conditional_print(
            const T& ,
            std::ostream& 
        ) {  }

        template <bool print_tag, bool skip_tag, typename T, typename U >
        void print_parse_tree_helper (
            const std::vector<parse_tree_element<T> >& tree,
            const std::vector<U>& words,
            unsigned long i,
            const T& tag_to_skip,
            std::ostream& out
        )
        {
            if (!skip_tag || tree[i].tag != tag_to_skip)
                out << "[";

            bool left_recurse = false;

            // Only print if we are supposed to.  Doing it this funny way avoids compiler
            // errors in parse_tree_to_string() for the case where tag isn't
            // printable.
            if (!skip_tag || tree[i].tag != tag_to_skip)
                conditional_print<print_tag>(tree[i].tag, out);

            if (tree[i].left < tree.size())
            {
                left_recurse = true;
                print_parse_tree_helper<print_tag,skip_tag>(tree, words, tree[i].left, tag_to_skip, out);
            }
            else
            {
                if ((tree[i].c.begin) < words.size())
                {
                    out << words[tree[i].c.begin] << " ";
                }
                else
                {
                    std::ostringstream sout;
                    sout << "Parse tree refers to element " << tree[i].c.begin 
                         << " of sequence which is only of size " << words.size() << ".";
                    throw parse_tree_to_string_error(sout.str());
                }
            }

            if (left_recurse == true)
                out << " ";

            if (tree[i].right < tree.size())
            {
                print_parse_tree_helper<print_tag,skip_tag>(tree, words, tree[i].right, tag_to_skip, out);
            }
            else
            {
                if (tree[i].c.k < words.size())
                {
                    out << words[tree[i].c.k];
                }
                else
                {
                    std::ostringstream sout;
                    sout << "Parse tree refers to element " << tree[i].c.k 
                         << " of sequence which is only of size " << words.size() << ".";
                    throw parse_tree_to_string_error(sout.str());
                }
            }


            if (!skip_tag || tree[i].tag != tag_to_skip)
                out << "]";
        }
    }

// -----------------------------------------------------------------------------------------

    template <typename T, typename U>
    std::string parse_tree_to_string (
        const std::vector<parse_tree_element<T> >& tree,
        const std::vector<U>& words,
        const unsigned long root_idx = 0
    )
    {
        if (root_idx >= tree.size())
            return "";

        std::ostringstream sout;
        impl::print_parse_tree_helper<false,false>(tree, words, root_idx, tree[root_idx].tag, sout);
        return sout.str();
    }

// -----------------------------------------------------------------------------------------

    template <typename T, typename U>
    std::string parse_tree_to_string_tagged (
        const std::vector<parse_tree_element<T> >& tree,
        const std::vector<U>& words,
        const unsigned long root_idx = 0
    )
    {
        if (root_idx >= tree.size())
            return "";

        std::ostringstream sout;
        impl::print_parse_tree_helper<true,false>(tree, words, root_idx, tree[root_idx].tag, sout);
        return sout.str();
    }

// -----------------------------------------------------------------------------------------

    template <typename T, typename U>
    std::string parse_trees_to_string (
        const std::vector<parse_tree_element<T> >& tree,
        const std::vector<U>& words,
        const T& tag_to_skip
    )
    {
        if (tree.size() == 0)
            return "";

        std::ostringstream sout;
        impl::print_parse_tree_helper<false,true>(tree, words, 0, tag_to_skip, sout);
        return sout.str();
    }

// -----------------------------------------------------------------------------------------

    template <typename T, typename U>
    std::string parse_trees_to_string_tagged (
        const std::vector<parse_tree_element<T> >& tree,
        const std::vector<U>& words,
        const T& tag_to_skip
    )
    {
        if (tree.size() == 0)
            return "";

        std::ostringstream sout;
        impl::print_parse_tree_helper<true,true>(tree, words, 0, tag_to_skip, sout);
        return sout.str();
    }

// -----------------------------------------------------------------------------------------

    namespace impl
    {
        template <typename T>
        void helper_find_trees_without_tag (
            const std::vector<parse_tree_element<T> >& tree,
            const T& tag,
            std::vector<unsigned long>& tree_roots,
            unsigned long idx
        )
        {
            if (idx < tree.size())
            {
                if (tree[idx].tag != tag)
                {
                    tree_roots.push_back(idx);
                }
                else
                {
                    helper_find_trees_without_tag(tree, tag, tree_roots, tree[idx].left);
                    helper_find_trees_without_tag(tree, tag, tree_roots, tree[idx].right);
                }
            }
        }
    }

    template <typename T>
    void find_trees_not_rooted_with_tag (
        const std::vector<parse_tree_element<T> >& tree,
        const T& tag,
        std::vector<unsigned long>& tree_roots 
    )
    {
        tree_roots.clear();
        impl::helper_find_trees_without_tag(tree, tag, tree_roots, 0);
    }

// -----------------------------------------------------------------------------------------

}

#endif // DLIB_FIND_MAX_PaRSE_CKY_Hh_

