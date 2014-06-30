// Copyright (C) 2007  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_BAYES_UTILs_
#define DLIB_BAYES_UTILs_

#include "bayes_utils_abstract.h"

#include "../string.h"
#include "../map.h"
#include "../matrix.h"
#include "../rand.h"
#include "../array.h"
#include "../set.h"
#include "../algs.h"
#include "../noncopyable.h"
#include "../smart_pointers.h"
#include "../graph.h"
#include <vector>
#include <algorithm>
#include <ctime>

namespace dlib
{

// ----------------------------------------------------------------------------------------

    class assignment 
    {
    public:

        assignment()
        {
        }

        assignment(
            const assignment& a
        )
        {
            a.reset();
            while (a.move_next())
            {
                unsigned long idx = a.element().key();
                unsigned long value = a.element().value();
                vals.add(idx,value);
            }
        }

        assignment& operator = (
            const assignment& rhs
        )
        {
            if (this == &rhs)
                return *this;

            assignment(rhs).swap(*this);
            return *this;
        }

        void clear()
        {
            vals.clear();
        }

        bool operator < (
            const assignment& item
        ) const 
        {  
            if (size() < item.size())
                return true;
            else if (size() > item.size())
                return false;

            reset();
            item.reset();
            while (move_next())
            {
                item.move_next();
                if (element().key() < item.element().key())
                    return true;
                else if (element().key() > item.element().key())
                    return false;
                else if (element().value() < item.element().value())
                    return true;
                else if (element().value() > item.element().value())
                    return false;
            }

            return false;
        }

        bool has_index (
            unsigned long idx
        ) const
        {
            return vals.is_in_domain(idx);
        }

        void add (
            unsigned long idx,
            unsigned long value = 0
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT( has_index(idx) == false ,
                         "\tvoid assignment::add(idx)"
                         << "\n\tYou can't add the same index to an assignment object more than once"
                         << "\n\tidx:  " << idx 
                         << "\n\tthis: " << this
            );

            vals.add(idx, value);
        }

        unsigned long& operator[] (
            const long idx
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT( has_index(idx) == true ,
                         "\tunsigned long assignment::operator[](idx)"
                         << "\n\tYou can't access an index value if it isn't already in the object"
                         << "\n\tidx:  " << idx 
                         << "\n\tthis: " << this
            );

            return vals[idx];
        }

        const unsigned long& operator[] (
            const long idx
        ) const
        { 
            // make sure requires clause is not broken
            DLIB_ASSERT( has_index(idx) == true ,
                         "\tunsigned long assignment::operator[](idx)"
                         << "\n\tYou can't access an index value if it isn't already in the object"
                         << "\n\tidx:  " << idx 
                         << "\n\tthis: " << this
            );

            return vals[idx];
        }

        void swap (
            assignment& item
        )
        {
            vals.swap(item.vals);
        }

        void remove (
            unsigned long idx
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT( has_index(idx) == true ,
                         "\tunsigned long assignment::remove(idx)"
                         << "\n\tYou can't remove an index value if it isn't already in the object"
                         << "\n\tidx:  " << idx 
                         << "\n\tthis: " << this
            );

            vals.destroy(idx);
        }

        unsigned long size() const { return vals.size(); }

        void reset() const { vals.reset(); }

        bool move_next() const { return vals.move_next(); }

        map_pair<unsigned long, unsigned long>& element() 
        { 
            // make sure requires clause is not broken
            DLIB_ASSERT(current_element_valid() == true,
                        "\tmap_pair<unsigned long,unsigned long>& assignment::element()"
                        << "\n\tyou can't access the current element if it doesn't exist"
                        << "\n\tthis: " << this
            );
            return vals.element(); 
        }

        const map_pair<unsigned long, unsigned long>& element() const 
        { 
            // make sure requires clause is not broken
            DLIB_ASSERT(current_element_valid() == true,
                        "\tconst map_pair<unsigned long,unsigned long>& assignment::element() const"
                        << "\n\tyou can't access the current element if it doesn't exist"
                        << "\n\tthis: " << this
            );

            return vals.element(); 
        }

        bool at_start() const { return vals.at_start(); }

        bool current_element_valid() const { return vals.current_element_valid(); }

        friend inline void serialize (
            const assignment& item,
            std::ostream& out 
        )   
        {
            serialize(item.vals, out);
        }

        friend inline void deserialize (
            assignment& item,
            std::istream& in
        )
        {
            deserialize(item.vals, in);
        }

    private:
        mutable dlib::map<unsigned long, unsigned long>::kernel_1b_c vals;
    };

    inline std::ostream& operator << (
        std::ostream& out,
        const assignment& a
    )
    {
        a.reset();
        out << "(";
        if (a.move_next())
            out << a.element().key() << ":" << a.element().value();

        while (a.move_next())
        {
            out << ", " << a.element().key() << ":" << a.element().value();
        }

        out << ")";
        return out;
    }


    inline void swap (
        assignment& a,
        assignment& b
    )
    {
        a.swap(b);
    }


// ------------------------------------------------------------------------

    class joint_probability_table 
    {
        /*!
            INITIAL VALUE
                - table.size() == 0

            CONVENTION
                - size() == table.size()
                - probability(a) == table[a]
        !*/
    public:

        joint_probability_table (
            const joint_probability_table& t
        )
        {
            t.reset();
            while (t.move_next())
            {
                assignment a = t.element().key();
                double p = t.element().value();
                set_probability(a,p);
            }
        }

        joint_probability_table() {}

        joint_probability_table& operator= (
            const joint_probability_table& rhs
        )
        {
            if (this == &rhs)
                return *this;
            joint_probability_table(rhs).swap(*this);
            return *this;
        }

        void set_probability (
            const assignment& a,
            double p
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(0.0 <= p && p <= 1.0,
                        "\tvoid& joint_probability_table::set_probability(a,p)"
                        << "\n\tyou have given an invalid probability value"
                        << "\n\tp:    " << p 
                        << "\n\ta:    " << a 
                        << "\n\tthis: " << this
            );

            if (table.is_in_domain(a))
            {
                table[a] = p;
            }
            else
            {
                assignment temp(a);
                table.add(temp,p);
            }
        }

        bool has_entry_for (
            const assignment& a
        ) const
        {
            return table.is_in_domain(a);
        }

        void add_probability (
            const assignment& a,
            double p
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(0.0 <= p && p <= 1.0,
                        "\tvoid& joint_probability_table::add_probability(a,p)"
                        << "\n\tyou have given an invalid probability value"
                        << "\n\tp:    " << p 
                        << "\n\ta:    " << a 
                        << "\n\tthis: " << this
            );

            if (table.is_in_domain(a))
            {
                table[a] += p;
                if (table[a] > 1.0)
                    table[a] = 1.0;
            }
            else
            {
                assignment temp(a);
                table.add(temp,p);
            }
        }

        double probability (
            const assignment& a
        ) const
        {
            return table[a];
        }

        void clear()
        {
            table.clear();
        }

        unsigned long size () const { return table.size(); }
        bool move_next() const { return table.move_next(); }
        void reset() const { table.reset(); }
        map_pair<assignment,double>& element() 
        { 
            // make sure requires clause is not broken
            DLIB_ASSERT(current_element_valid() == true,
                        "\tmap_pair<assignment,double>& joint_probability_table::element()"
                        << "\n\tyou can't access the current element if it doesn't exist"
                        << "\n\tthis: " << this
            );

            return table.element(); 
        }

        const map_pair<assignment,double>& element() const 
        { 
            // make sure requires clause is not broken
            DLIB_ASSERT(current_element_valid() == true,
                        "\tconst map_pair<assignment,double>& joint_probability_table::element() const"
                        << "\n\tyou can't access the current element if it doesn't exist"
                        << "\n\tthis: " << this
            );

            return table.element(); 
        }

        bool at_start() const { return table.at_start(); }

        bool current_element_valid() const { return table.current_element_valid(); }


        template <typename T>
        void marginalize (
            const T& vars,
            joint_probability_table& out
        ) const
        {
            out.clear();
            double p;
            reset();
            while (move_next())
            {
                assignment a;
                const assignment& asrc = element().key();
                p = element().value();

                asrc.reset();
                while (asrc.move_next())
                {
                    if (vars.is_member(asrc.element().key()))
                        a.add(asrc.element().key(), asrc.element().value());
                }

                out.add_probability(a,p);
            }
        }

        void marginalize (
            const unsigned long var,
            joint_probability_table& out
        ) const
        {
            out.clear();
            double p;
            reset();
            while (move_next())
            {
                assignment a;
                const assignment& asrc = element().key();
                p = element().value();

                asrc.reset();
                while (asrc.move_next())
                {
                    if (var == asrc.element().key())
                        a.add(asrc.element().key(), asrc.element().value());
                }

                out.add_probability(a,p);
            }
        }

        void normalize (
        )
        {
            double sum = 0;

            reset();
            while (move_next())
                sum += element().value();

            reset();
            while (move_next())
                element().value() /= sum;
        }

        void swap (
            joint_probability_table& item
        )
        {
            table.swap(item.table);
        }

        friend inline void serialize (
            const joint_probability_table& item,
            std::ostream& out 
        )   
        {
            serialize(item.table, out);
        }

        friend inline void deserialize (
            joint_probability_table& item,
            std::istream& in
        )
        {
            deserialize(item.table, in);
        }

    private:

        dlib::map<assignment, double >::kernel_1b_c table;
    };

    inline void swap (
        joint_probability_table& a,
        joint_probability_table& b
    ) { a.swap(b); }

// ----------------------------------------------------------------------------------------

    class conditional_probability_table : noncopyable
    {
        /*!
            INITIAL VALUE
                - table.size() == 0

            CONVENTION
                - if (table.is_in_domain(ps) && value < num_vals && table[ps](value) >= 0) then
                    - has_entry_for(value,ps) == true
                    - probability(value,ps) == table[ps](value)
                - else
                    - has_entry_for(value,ps) == false 

                - num_values() == num_vals
        !*/
    public:

        conditional_probability_table()
        {
            clear();
        }

        void set_num_values (
            unsigned long num
        )
        {
            num_vals = num;
            table.clear();
        }

        bool has_entry_for (
            unsigned long value,
            const assignment& ps
        ) const
        {
            if (table.is_in_domain(ps) && value < num_vals && table[ps](value) >= 0)
                return true;
            else
                return false;
        }

        unsigned long num_values (
        ) const { return num_vals; }

        void set_probability (
            unsigned long value,
            const assignment& ps,
            double p
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT( value < num_values() && 0.0 <= p && p <= 1.0 ,
                         "\tvoid conditional_probability_table::set_probability()"
                         << "\n\tinvalid arguments to set_probability"
                         << "\n\tvalue: " << value 
                         << "\n\tnum_values(): " << num_values()
                         << "\n\tp:     " << p 
                         << "\n\tps:    " << ps 
                         << "\n\tthis:  " << this
            );

            if (table.is_in_domain(ps))
            {
                table[ps](value) = p;
            }
            else
            {
                matrix<double,1> dist(num_vals);
                set_all_elements(dist,-1);
                dist(value) = p;
                assignment temp(ps);
                table.add(temp,dist);
            }
        }

        double probability(
            unsigned long value,
            const assignment& ps 
        ) const
        {
            // make sure requires clause is not broken
            DLIB_ASSERT( value < num_values() && has_entry_for(value,ps) ,
                         "\tvoid conditional_probability_table::probability()"
                         << "\n\tinvalid arguments to probability"
                         << "\n\tvalue:        " << value 
                         << "\n\tnum_values(): " << num_values() 
                         << "\n\tps:           " << ps 
                         << "\n\tthis:         " << this
            );

            return table[ps](value);
        }

        void clear()
        {
            table.clear();
            num_vals = 0;
        }

        void empty_table ()
        {
            table.clear();
        }

        void swap (
            conditional_probability_table& item 
        ) 
        { 
            exchange(num_vals, item.num_vals);
            table.swap(item.table);
        }

        friend inline void serialize (
            const conditional_probability_table& item,
            std::ostream& out 
        )   
        {
            serialize(item.table, out);
            serialize(item.num_vals, out);
        }

        friend inline void deserialize (
            conditional_probability_table& item,
            std::istream& in
        )
        {
            deserialize(item.table, in);
            deserialize(item.num_vals, in);
        }

    private:
        dlib::map<assignment, matrix<double,1> >::kernel_1b_c table;
        unsigned long num_vals;
    };

    inline void swap (
        conditional_probability_table& a,
        conditional_probability_table& b
    ) { a.swap(b); }

// ------------------------------------------------------------------------

    class bayes_node : noncopyable
    {
    public:
        bayes_node ()
        {
            is_instantiated = false;
            value_ = 0;
        }

        unsigned long value (
        ) const { return value_;}

        void set_value (
            unsigned long new_value
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT( new_value < table().num_values(),
                         "\tvoid bayes_node::set_value(new_value)"
                         << "\n\tnew_value must be less than the number of possible values for this node"
                         << "\n\tnew_value:            " << new_value 
                         << "\n\ttable().num_values(): " << table().num_values() 
                         << "\n\tthis:                 " << this
            );

            value_ = new_value;
        }

        conditional_probability_table& table (
        ) { return table_; }

        const conditional_probability_table& table (
        ) const { return table_; }

        bool is_evidence (
        ) const { return is_instantiated; }

        void set_as_nonevidence (
        ) { is_instantiated = false; }

        void set_as_evidence (
        ) { is_instantiated = true; }

        void swap (
            bayes_node& item 
        ) 
        { 
            exchange(value_, item.value_);
            exchange(is_instantiated, item.is_instantiated);
            table_.swap(item.table_);
        }

        friend inline void serialize (
            const bayes_node& item,
            std::ostream& out 
        )   
        {
            serialize(item.value_, out);
            serialize(item.is_instantiated, out);
            serialize(item.table_, out);
        }

        friend inline void deserialize (
            bayes_node& item,
            std::istream& in
        )
        {
            deserialize(item.value_, in);
            deserialize(item.is_instantiated, in);
            deserialize(item.table_, in);
        }

    private:

        unsigned long value_; 
        bool is_instantiated;
        conditional_probability_table table_;
    };

    inline void swap (
        bayes_node& a,
        bayes_node& b
    ) { a.swap(b); }

// ------------------------------------------------------------------------

    namespace bayes_node_utils
    {

        template <typename T>
        unsigned long node_num_values (
            const T& bn,
            unsigned long n
        )  
        { 
            // make sure requires clause is not broken
            DLIB_ASSERT( n < bn.number_of_nodes(),
                         "\tvoid bayes_node_utils::node_num_values(bn, n)"
                         << "\n\tInvalid arguments to this function"
                         << "\n\tn:                     " << n 
                         << "\n\tbn.number_of_nodes():  " << bn.number_of_nodes() 
            );

            return bn.node(n).data.table().num_values(); 
        }

    // ----------------------------------------------------------------------------------------

        template <typename T>
        void set_node_value (
            T& bn,
            unsigned long n,
            unsigned long val
        ) 
        { 
            // make sure requires clause is not broken
            DLIB_ASSERT( n < bn.number_of_nodes() && val < node_num_values(bn,n),
                         "\tvoid bayes_node_utils::set_node_value(bn, n, val)"
                         << "\n\tInvalid arguments to this function"
                         << "\n\tn:                     " << n 
                         << "\n\tval:                   " << val 
                         << "\n\tbn.number_of_nodes():  " << bn.number_of_nodes() 
                         << "\n\tnode_num_values(bn,n): " << node_num_values(bn,n) 
            );

            bn.node(n).data.set_value(val); 
        }

    // ----------------------------------------------------------------------------------------
        template <typename T>
        unsigned long node_value (
            const T& bn,
            unsigned long n
        ) 
        { 
            // make sure requires clause is not broken
            DLIB_ASSERT( n < bn.number_of_nodes(),
                         "\tunsigned long bayes_node_utils::node_value(bn, n)"
                         << "\n\tInvalid arguments to this function"
                         << "\n\tn:                     " << n 
                         << "\n\tbn.number_of_nodes():  " << bn.number_of_nodes() 
            );

            return bn.node(n).data.value();
        }
    // ----------------------------------------------------------------------------------------

        template <typename T>
        bool node_is_evidence (
            const T& bn,
            unsigned long n
        ) 
        { 
            // make sure requires clause is not broken
            DLIB_ASSERT( n < bn.number_of_nodes(),
                         "\tbool bayes_node_utils::node_is_evidence(bn, n)"
                         << "\n\tInvalid arguments to this function"
                         << "\n\tn:                     " << n 
                         << "\n\tbn.number_of_nodes():  " << bn.number_of_nodes() 
            );

            return bn.node(n).data.is_evidence();
        }

    // ----------------------------------------------------------------------------------------

        template <typename T>
        void set_node_as_evidence (
            T& bn,
            unsigned long n
        ) 
        { 
            // make sure requires clause is not broken
            DLIB_ASSERT( n < bn.number_of_nodes(),
                         "\tvoid bayes_node_utils::set_node_as_evidence(bn, n)"
                         << "\n\tInvalid arguments to this function"
                         << "\n\tn:                     " << n 
                         << "\n\tbn.number_of_nodes():  " << bn.number_of_nodes() 
            );

            bn.node(n).data.set_as_evidence(); 
        }

    // ----------------------------------------------------------------------------------------
        template <typename T>
        void set_node_as_nonevidence (
            T& bn,
            unsigned long n
        ) 
        { 
            // make sure requires clause is not broken
            DLIB_ASSERT( n < bn.number_of_nodes(),
                         "\tvoid bayes_node_utils::set_node_as_nonevidence(bn, n)"
                         << "\n\tInvalid arguments to this function"
                         << "\n\tn:                     " << n 
                         << "\n\tbn.number_of_nodes():  " << bn.number_of_nodes() 
            );

            bn.node(n).data.set_as_nonevidence(); 
        }

    // ----------------------------------------------------------------------------------------

        template <typename T>
        void set_node_num_values (
            T& bn,
            unsigned long n,
            unsigned long num
        ) 
        { 
            // make sure requires clause is not broken
            DLIB_ASSERT( n < bn.number_of_nodes(),
                         "\tvoid bayes_node_utils::set_node_num_values(bn, n, num)"
                         << "\n\tInvalid arguments to this function"
                         << "\n\tn:                     " << n 
                         << "\n\tbn.number_of_nodes():  " << bn.number_of_nodes() 
            );

            bn.node(n).data.table().set_num_values(num); 
        }

    // ----------------------------------------------------------------------------------------

        template <typename T>
        double node_probability (
            const T& bn,
            unsigned long n,
            unsigned long value,
            const assignment& parents 
        ) 
        {
            // make sure requires clause is not broken
            DLIB_ASSERT( n < bn.number_of_nodes() && value < node_num_values(bn,n),
                         "\tdouble bayes_node_utils::node_probability(bn, n, value, parents)"
                         << "\n\tInvalid arguments to this function"
                         << "\n\tn:                     " << n 
                         << "\n\tvalue:                 " << value 
                         << "\n\tbn.number_of_nodes():  " << bn.number_of_nodes() 
                         << "\n\tnode_num_values(bn,n): " << node_num_values(bn,n) 
            );

            DLIB_ASSERT( parents.size() == bn.node(n).number_of_parents(),
                         "\tdouble bayes_node_utils::node_probability(bn, n, value, parents)"
                         << "\n\tInvalid arguments to this function"
                         << "\n\tn:                             " << n 
                         << "\n\tparents.size():                " << parents.size()
                         << "\n\tb.node(n).number_of_parents(): " << bn.node(n).number_of_parents()
            );

#ifdef ENABLE_ASSERTS
            parents.reset();
            while (parents.move_next())
            {
                const unsigned long x = parents.element().key();
                DLIB_ASSERT( bn.has_edge(x, n),
                             "\tdouble bayes_node_utils::node_probability(bn, n, value, parents)"
                             << "\n\tInvalid arguments to this function"
                             << "\n\tn: " << n 
                             << "\n\tx: " << x 
                );
                DLIB_ASSERT( parents[x] < node_num_values(bn,x),
                             "\tdouble bayes_node_utils::node_probability(bn, n, value, parents)"
                             << "\n\tInvalid arguments to this function"
                             << "\n\tn:                     " << n 
                             << "\n\tx:                     " << x 
                             << "\n\tparents[x]:            " << parents[x] 
                             << "\n\tnode_num_values(bn,x): " << node_num_values(bn,x) 
                );
            }
#endif

            return bn.node(n).data.table().probability(value, parents);
        }

    // ----------------------------------------------------------------------------------------

        template <typename T>
        void set_node_probability (
            T& bn,
            unsigned long n,
            unsigned long value,
            const assignment& parents,
            double p
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT( n < bn.number_of_nodes() && value < node_num_values(bn,n),
                         "\tvoid bayes_node_utils::set_node_probability(bn, n, value, parents, p)"
                         << "\n\tInvalid arguments to this function"
                         << "\n\tn:                     " << n 
                         << "\n\tp:                     " << p 
                         << "\n\tvalue:                 " << value 
                         << "\n\tbn.number_of_nodes():  " << bn.number_of_nodes() 
                         << "\n\tnode_num_values(bn,n): " << node_num_values(bn,n) 
            );

            DLIB_ASSERT( parents.size() == bn.node(n).number_of_parents(),
                         "\tvoid bayes_node_utils::set_node_probability(bn, n, value, parents, p)"
                         << "\n\tInvalid arguments to this function"
                         << "\n\tn:                             " << n 
                         << "\n\tp:                             " << p 
                         << "\n\tparents.size():                " << parents.size()
                         << "\n\tbn.node(n).number_of_parents(): " << bn.node(n).number_of_parents()
            );

            DLIB_ASSERT( 0.0 <= p && p <= 1.0,
                         "\tvoid bayes_node_utils::set_node_probability(bn, n, value, parents, p)"
                         << "\n\tInvalid arguments to this function"
                         << "\n\tn: " << n 
                         << "\n\tp: " << p 
            );

#ifdef ENABLE_ASSERTS
            parents.reset();
            while (parents.move_next())
            {
                const unsigned long x = parents.element().key();
                DLIB_ASSERT( bn.has_edge(x, n),
                             "\tvoid bayes_node_utils::set_node_probability(bn, n, value, parents, p)"
                             << "\n\tInvalid arguments to this function"
                             << "\n\tn: " << n 
                             << "\n\tx: " << x 
                );
                DLIB_ASSERT( parents[x] < node_num_values(bn,x),
                             "\tvoid bayes_node_utils::set_node_probability(bn, n, value, parents, p)"
                             << "\n\tInvalid arguments to this function"
                             << "\n\tn:                     " << n 
                             << "\n\tx:                     " << x 
                             << "\n\tparents[x]:            " << parents[x] 
                             << "\n\tnode_num_values(bn,x): " << node_num_values(bn,x) 
                );
            }
#endif

            bn.node(n).data.table().set_probability(value,parents,p);
        }

// ----------------------------------------------------------------------------------------

        template <typename T>
        const assignment node_first_parent_assignment (
            const T& bn,
            unsigned long n
        ) 
        { 
            // make sure requires clause is not broken
            DLIB_ASSERT( n < bn.number_of_nodes(),
                         "\tconst assignment bayes_node_utils::node_first_parent_assignment(bn, n)"
                         << "\n\tInvalid arguments to this function"
                         << "\n\tn:                     " << n 
            );

            assignment a;
            const unsigned long num_parents = bn.node(n).number_of_parents();
            for (unsigned long i = 0; i < num_parents; ++i)
            {
                a.add(bn.node(n).parent(i).index(), 0);
            }
            return a;
        }

// ----------------------------------------------------------------------------------------

        template <typename T>
        bool node_next_parent_assignment (
            const T& bn,
            unsigned long n,
            assignment& a
        ) 
        { 
            // make sure requires clause is not broken
            DLIB_ASSERT( n < bn.number_of_nodes(),
                         "\tbool bayes_node_utils::node_next_parent_assignment(bn, n, a)"
                         << "\n\tInvalid arguments to this function"
                         << "\n\tn:                     " << n 
            );

            DLIB_ASSERT( a.size() == bn.node(n).number_of_parents(),
                         "\tbool bayes_node_utils::node_next_parent_assignment(bn, n, a)"
                         << "\n\tInvalid arguments to this function"
                         << "\n\tn:                             " << n 
                         << "\n\ta.size():                      " << a.size()
                         << "\n\tbn.node(n).number_of_parents(): " << bn.node(n).number_of_parents()
            );

#ifdef ENABLE_ASSERTS
            a.reset();
            while (a.move_next())
            {
                const unsigned long x = a.element().key();
                DLIB_ASSERT( bn.has_edge(x, n),
                             "\tbool bayes_node_utils::node_next_parent_assignment(bn, n, a)"
                             << "\n\tInvalid arguments to this function"
                             << "\n\tn: " << n 
                             << "\n\tx: " << x 
                );
                DLIB_ASSERT( a[x] < node_num_values(bn,x),
                             "\tbool bayes_node_utils::node_next_parent_assignment(bn, n, a)"
                             << "\n\tInvalid arguments to this function"
                             << "\n\tn:                     " << n 
                             << "\n\tx:                     " << x 
                             << "\n\ta[x]:                  " << a[x] 
                             << "\n\tnode_num_values(bn,x): " << node_num_values(bn,x) 
                );
            }
#endif

            // basically this loop just adds 1 to the assignment but performs
            // carries if necessary
            for (unsigned long p = 0; p < a.size(); ++p)
            {
                const unsigned long pindex = bn.node(n).parent(p).index();
                a[pindex] += 1;

                // if we need to perform a carry
                if (a[pindex] >= node_num_values(bn,pindex))
                {
                    a[pindex] = 0;
                }
                else
                {
                    // no carry necessary so we are done
                    return true;
                }
            }

            // we got through the entire loop which means a carry propagated all the way out
            // so there must not be any more valid assignments left
            return false;
        }

// ----------------------------------------------------------------------------------------

        template <typename T>
        bool node_cpt_filled_out (
            const T& bn,
            unsigned long n
        ) 
        { 
            // make sure requires clause is not broken
            DLIB_ASSERT( n < bn.number_of_nodes(),
                         "\tbool bayes_node_utils::node_cpt_filled_out(bn, n)"
                         << "\n\tInvalid arguments to this function"
                         << "\n\tn:                     " << n 
                         << "\n\tbn.number_of_nodes():  " << bn.number_of_nodes() 
            );

            const unsigned long num_values = node_num_values(bn,n);


            const conditional_probability_table& table = bn.node(n).data.table();

            // now loop over all the possible parent assignments for this node
            assignment a(node_first_parent_assignment(bn,n));
            do
            {
                double sum = 0;
                // make sure that this assignment has an entry for all the values this node can take one
                for (unsigned long value = 0; value < num_values; ++value)
                {
                    if (table.has_entry_for(value,a) == false)
                        return false;
                    else
                        sum += table.probability(value,a);
                }

                // check if the sum of probabilities equals 1 as it should
                if (std::abs(sum-1.0) > 1e-5)
                    return false;
            } while (node_next_parent_assignment(bn,n,a));

            return true;
        }

    }

// ----------------------------------------------------------------------------------------

    class bayesian_network_gibbs_sampler : noncopyable
    {
    public:

        bayesian_network_gibbs_sampler ()
        {
            rnd.set_seed(cast_to_string(std::time(0)));
        }


        template <
            typename T
            >
        void sample_graph (
            T& bn
        )
        {
            using namespace bayes_node_utils;
            for (unsigned long n = 0; n < bn.number_of_nodes(); ++n)
            {
                if (node_is_evidence(bn, n))
                    continue;

                samples.set_size(node_num_values(bn,n)); 
                // obtain the probability distribution for this node
                for (long i = 0; i < samples.nc(); ++i)
                {
                    set_node_value(bn, n, i);
                    samples(i) = node_probability(bn, n);

                    for (unsigned long j = 0; j < bn.node(n).number_of_children(); ++j)
                        samples(i) *= node_probability(bn, bn.node(n).child(j).index());
                }

                //normalize samples
                samples /= sum(samples);


                // select a random point in the probability distribution
                double prob = rnd.get_random_double();

                // now find the point in the distribution this probability corresponds to
                long j;
                for (j = 0; j < samples.nc()-1; ++j)
                {
                    if (prob <= samples(j))
                        break;
                    else
                        prob -= samples(j);
                }

                set_node_value(bn, n, j);
            }
        }


    private:

        template <
            typename T
            >
        double node_probability (
            const T& bn,
            unsigned long n 
        ) 
        /*!
            requires
                - n < bn.number_of_nodes()
            ensures
                - computes the probability of node n having its current value given
                  the current values of its parents in the network bn
        !*/
        {
            v.clear();
            for (unsigned long i = 0; i < bn.node(n).number_of_parents(); ++i)
            {
                v.add(bn.node(n).parent(i).index(), bn.node(n).parent(i).data.value());
            }
            return bn.node(n).data.table().probability(bn.node(n).data.value(), v);
        }

        assignment v;

        dlib::rand rnd;
        matrix<double,1> samples; 
    };

// ----------------------------------------------------------------------------------------

    namespace bayesian_network_join_tree_helpers
    {
        class bnjt
        {
            /*!
                this object is the base class used in this pimpl idiom
            !*/
        public:
            virtual ~bnjt() {}

            virtual const matrix<double,1> probability(
                unsigned long idx
            )  const = 0;
        };

        template <typename T, typename U>
        class bnjt_impl : public bnjt
        {
            /*!
                This object is the implementation in the pimpl idiom
            !*/

        public:

            bnjt_impl (
                const T& bn,
                const U& join_tree
            )
            {
                create_bayesian_network_join_tree(bn, join_tree, join_tree_values);

                cliques.resize(bn.number_of_nodes());

                // figure out which cliques contain each node
                for (unsigned long i = 0; i < cliques.size(); ++i)
                {
                    // find the smallest clique that contains node with index i
                    unsigned long smallest_clique = 0;
                    unsigned long size = std::numeric_limits<unsigned long>::max();

                    for (unsigned long n = 0; n < join_tree.number_of_nodes(); ++n)
                    {
                        if (join_tree.node(n).data.is_member(i) && join_tree.node(n).data.size() < size)
                        {
                            size = join_tree.node(n).data.size();
                            smallest_clique = n;
                        }
                    }

                    cliques[i] = smallest_clique;
                }
            }

            virtual const matrix<double,1> probability(
                unsigned long idx
            ) const 
            {
                join_tree_values.node(cliques[idx]).data.marginalize(idx, table);
                table.normalize();
                var.clear();
                var.add(idx);
                dist.set_size(table.size());

                // read the probabilities out of the table and into the row matrix
                for (unsigned long i = 0; i < table.size(); ++i)
                {
                    var[idx] = i;
                    dist(i) = table.probability(var); 
                }

                return dist;
            }

        private:

            graph< joint_probability_table, joint_probability_table >::kernel_1a_c join_tree_values;
            array<unsigned long> cliques;
            mutable joint_probability_table table;
            mutable assignment var;
            mutable matrix<double,1> dist;
           

        // ----------------------------------------------------------------------------------------

            template <typename set_type, typename node_type>
            bool set_contains_all_parents_of_node (
                const set_type& set,
                const node_type& node
            )
            {
                for (unsigned long i = 0; i < node.number_of_parents(); ++i)
                {
                    if (set.is_member(node.parent(i).index()) == false)
                        return false;
                }
                return true;
            }

        // ----------------------------------------------------------------------------------------

            template <
                typename V
                >
            void pass_join_tree_message (
                const U& join_tree,
                V& bn_join_tree ,
                unsigned long from,
                unsigned long to
            )
            {
                using namespace bayes_node_utils;
                const typename U::edge_type& e = edge(join_tree, from, to);
                typename V::edge_type& old_s = edge(bn_join_tree, from, to);

                typedef typename V::edge_type joint_prob_table;

                joint_prob_table new_s;
                bn_join_tree.node(from).data.marginalize(e, new_s);

                joint_probability_table temp(new_s);
                // divide new_s by old_s and store the result in temp.
                // if old_s is empty then that is the same as if it was all 1s
                // so we don't have to do this if that is the case.
                if (old_s.size() > 0)
                {
                    temp.reset();
                    old_s.reset();
                    while (temp.move_next())
                    {
                        old_s.move_next();
                        if (old_s.element().value() != 0)
                            temp.element().value()  /= old_s.element().value();
                    }
                }

                // now multiply temp by d and store the results in d
                joint_probability_table& d = bn_join_tree.node(to).data;
                d.reset();
                while (d.move_next())
                {
                    assignment a; 
                    const assignment& asrc = d.element().key();
                    asrc.reset();
                    while (asrc.move_next())
                    {
                        if (e.is_member(asrc.element().key()))
                            a.add(asrc.element().key(), asrc.element().value());
                    }

                    d.element().value() *= temp.probability(a);

                }

                // store new_s in old_s
                new_s.swap(old_s);

            }

        // ----------------------------------------------------------------------------------------

            template <
                typename V
                >
            void create_bayesian_network_join_tree (
                const T& bn,
                const U& join_tree,
                V& bn_join_tree 
            )
            /*!
                requires
                    - bn is a proper bayesian network
                    - join_tree is the join tree for that bayesian network
                ensures
                    - bn_join_tree == the output of the join tree algorithm for bayesian network inference.  
                      So each node in this graph contains a joint_probability_table for the clique
                      in the corresponding node in the join_tree graph.
            !*/
            {
                using namespace bayes_node_utils;
                bn_join_tree.clear();
                copy_graph_structure(join_tree, bn_join_tree);

                // we need to keep track of which node is "in" each clique for the purposes of 
                // initializing the tables in each clique.  So this vector will be used to do that
                // and a value of join_tree.number_of_nodes() means that the node with 
                // that index is unassigned.
                std::vector<unsigned long> node_assigned_to(bn.number_of_nodes(),join_tree.number_of_nodes());

                // populate evidence with all the evidence node indices and their values
                dlib::map<unsigned long, unsigned long>::kernel_1b_c evidence;
                for (unsigned long i = 0; i < bn.number_of_nodes(); ++i)
                {
                    if (node_is_evidence(bn, i))
                    {
                        unsigned long idx = i;
                        unsigned long value = node_value(bn, i);
                        evidence.add(idx,value);
                    }
                }


                // initialize the bn join tree
                for (unsigned long i = 0; i < join_tree.number_of_nodes(); ++i)
                {
                    bool contains_evidence = false;
                    std::vector<unsigned long> indices;
                    assignment value;

                    // loop over all the nodes in this clique in the join tree.  In this loop 
                    // we are making an assignment with all the values of the nodes it represents set to 0
                    join_tree.node(i).data.reset();
                    while (join_tree.node(i).data.move_next())
                    {
                        const unsigned long idx = join_tree.node(i).data.element();
                        indices.push_back(idx);
                        value.add(idx);

                        if (evidence.is_in_domain(join_tree.node(i).data.element()))
                            contains_evidence = true;
                    }

                    // now loop over all possible combinations of values that the nodes this 
                    // clique in the join tree can take on.  We do this by counting by one through all
                    // legal values
                    bool more_assignments = true;
                    while (more_assignments)
                    {
                        bn_join_tree.node(i).data.set_probability(value,1);

                        // account for any evidence
                        if (contains_evidence)
                        {
                            // loop over all the nodes in this cluster
                            for (unsigned long j = 0; j < indices.size(); ++j)
                            {
                                // if the current node is an evidence node
                                if (evidence.is_in_domain(indices[j]))
                                {
                                    const unsigned long idx = indices[j];
                                    const unsigned long evidence_value = evidence[idx];
                                    if (value[idx] != evidence_value)
                                        bn_join_tree.node(i).data.set_probability(value , 0);
                                }
                            }
                        }


                        // now check if any of the nodes in this cluster also have their parents in this cluster
                        join_tree.node(i).data.reset();
                        while (join_tree.node(i).data.move_next())
                        {
                            const unsigned long idx = join_tree.node(i).data.element();
                            // if this clique contains all the parents of this node and also hasn't
                            // been assigned to another clique
                            if (set_contains_all_parents_of_node(join_tree.node(i).data,  bn.node(idx)) && 
                                (i == node_assigned_to[idx] || node_assigned_to[idx] == join_tree.number_of_nodes()) )
                            {
                                // note that this node is now assigned to this clique 
                                node_assigned_to[idx] = i;
                                // node idx has all its parents in the cluster
                                assignment parent_values;
                                for (unsigned long j = 0; j < bn.node(idx).number_of_parents(); ++j)
                                {
                                    const unsigned long pidx = bn.node(idx).parent(j).index();
                                    parent_values.add(pidx, value[pidx]);
                                }

                                double temp = bn_join_tree.node(i).data.probability(value);
                                bn_join_tree.node(i).data.set_probability(value, temp * node_probability(bn, idx, value[idx], parent_values));

                            }
                        }


                        // now advance the value variable to its next possible state if there is one
                        more_assignments = false;
                        value.reset();
                        while (value.move_next())
                        {
                            value.element().value() += 1;
                            // if overflow
                            if (value.element().value() == node_num_values(bn, value.element().key()))
                            {
                                value.element().value() = 0;
                            }
                            else
                            {
                                more_assignments = true;
                                break;
                            }
                        }

                    } // end while (more_assignments) 
                } 




                // the tree is now initialized.  Now all we need to do is perform the propagation and
                // we are done
                dlib::array<dlib::set<unsigned long>::compare_1b_c> remaining_msg_to_send;
                dlib::array<dlib::set<unsigned long>::compare_1b_c> remaining_msg_to_receive;
                remaining_msg_to_receive.resize(join_tree.number_of_nodes());
                remaining_msg_to_send.resize(join_tree.number_of_nodes());
                for (unsigned long i = 0; i < remaining_msg_to_receive.size(); ++i)
                {
                    for (unsigned long j = 0; j < join_tree.node(i).number_of_neighbors(); ++j)
                    {
                        const unsigned long idx = join_tree.node(i).neighbor(j).index();
                        unsigned long temp;
                        temp = idx; remaining_msg_to_receive[i].add(temp);
                        temp = idx; remaining_msg_to_send[i].add(temp);
                    }
                }

                // now remaining_msg_to_receive[i] contains all the nodes that node i hasn't yet received
                // a message from.
                // we will consider node 0 to be the root node.


                bool message_sent = true;
                std::vector<unsigned long>::iterator iter;
                while (message_sent)
                {
                    message_sent = false;
                    for (unsigned long i = 1; i < remaining_msg_to_send.size(); ++i)
                    {
                        // if node i hasn't sent any messages but has received all but one then send a message to the one
                        // node who hasn't sent i a message
                        if (remaining_msg_to_send[i].size() == join_tree.node(i).number_of_neighbors() && remaining_msg_to_receive[i].size() == 1)
                        {
                            unsigned long to;
                            // get the last remaining thing from this set
                            remaining_msg_to_receive[i].remove_any(to);

                            // send the message
                            pass_join_tree_message(join_tree, bn_join_tree, i, to);

                            // record that we sent this message
                            remaining_msg_to_send[i].destroy(to);
                            remaining_msg_to_receive[to].destroy(i);

                            // put to back in since we still need to receive it
                            remaining_msg_to_receive[i].add(to);
                            message_sent = true;
                        }
                        else if (remaining_msg_to_receive[i].size() == 0 && remaining_msg_to_send[i].size() > 0)
                        {
                            unsigned long to;
                            remaining_msg_to_send[i].remove_any(to);
                            remaining_msg_to_receive[to].destroy(i);
                            pass_join_tree_message(join_tree, bn_join_tree, i, to);
                            message_sent = true;
                        }
                    }

                    if (remaining_msg_to_receive[0].size() == 0)
                    {
                        // send a message to all of the root nodes neighbors unless we have already sent out he messages
                        while (remaining_msg_to_send[0].size() > 0)
                        {
                            unsigned long to;
                            remaining_msg_to_send[0].remove_any(to);
                            remaining_msg_to_receive[to].destroy(0);
                            pass_join_tree_message(join_tree, bn_join_tree, 0, to);
                            message_sent = true;
                        }
                    }


                }

            }

        };
    }

    class bayesian_network_join_tree : noncopyable
    {
        /*!
            use the pimpl idiom to push the template arguments from the class level to the
            constructor level
        !*/

    public:

        template <
            typename T,
            typename U
            >
        bayesian_network_join_tree (
            const T& bn,
            const U& join_tree
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT( bn.number_of_nodes() > 0 ,
                        "\tbayesian_network_join_tree::bayesian_network_join_tree(bn,join_tree)"
                        << "\n\tYou have given an invalid bayesian network"
                        << "\n\tthis:              " << this
                    );

            DLIB_ASSERT( is_join_tree(bn, join_tree) == true ,
                        "\tbayesian_network_join_tree::bayesian_network_join_tree(bn,join_tree)"
                        << "\n\tYou have given an invalid join tree for the supplied bayesian network"
                        << "\n\tthis:              " << this
                    );
            DLIB_ASSERT( graph_contains_length_one_cycle(bn) == false,
                        "\tbayesian_network_join_tree::bayesian_network_join_tree(bn,join_tree)"
                        << "\n\tYou have given an invalid bayesian network"
                        << "\n\tthis:              " << this
                    );
            DLIB_ASSERT( graph_is_connected(bn) == true,
                        "\tbayesian_network_join_tree::bayesian_network_join_tree(bn,join_tree)"
                        << "\n\tYou have given an invalid bayesian network"
                        << "\n\tthis:              " << this
                    );

#ifdef ENABLE_ASSERTS
            for (unsigned long i = 0; i < bn.number_of_nodes(); ++i)
            {
                DLIB_ASSERT(bayes_node_utils::node_cpt_filled_out(bn,i) == true,
                        "\tbayesian_network_join_tree::bayesian_network_join_tree(bn,join_tree)"
                        << "\n\tYou have given an invalid bayesian network. "
                        << "\n\tYou must finish filling out the conditional_probability_table of node " << i
                        << "\n\tthis:              " << this
                    );
            }
#endif

            impl.reset(new bayesian_network_join_tree_helpers::bnjt_impl<T,U>(bn, join_tree));
            num_nodes = bn.number_of_nodes();
        }

        const matrix<double,1> probability(
            unsigned long idx
        ) const
        {
            // make sure requires clause is not broken
            DLIB_ASSERT( idx < number_of_nodes() ,
                        "\tconst matrix<double,1> bayesian_network_join_tree::probability(idx)"
                        << "\n\tYou have specified an invalid node index"
                        << "\n\tidx:               " << idx 
                        << "\n\tnumber_of_nodes(): " << number_of_nodes() 
                        << "\n\tthis:              " << this
                    );

            return impl->probability(idx);
        }

        unsigned long number_of_nodes (
        ) const { return num_nodes; }

        void swap (
            bayesian_network_join_tree& item
        )
        {
            exchange(num_nodes, item.num_nodes);
            impl.swap(item.impl);
        }

    private:

        scoped_ptr<bayesian_network_join_tree_helpers::bnjt> impl;
        unsigned long num_nodes;

    };

    inline void swap (
        bayesian_network_join_tree& a,
        bayesian_network_join_tree& b
    ) { a.swap(b); }

}

// ----------------------------------------------------------------------------------------

#endif // DLIB_BAYES_UTILs_

