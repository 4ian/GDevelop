// Copyright (C) 2010  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_ONE_VS_ONE_DECISION_FUnCTION_Hh_
#define DLIB_ONE_VS_ONE_DECISION_FUnCTION_Hh_

#include "one_vs_one_decision_function_abstract.h"

#include "../serialize.h"
#include "../type_safe_union.h"
#include <iostream>
#include <sstream>
#include <set>
#include <map>
#include "../any.h"
#include "../unordered_pair.h"
#include "null_df.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename one_vs_one_trainer,
        typename DF1 = null_df, typename DF2 = null_df, typename DF3 = null_df,
        typename DF4 = null_df, typename DF5 = null_df, typename DF6 = null_df,
        typename DF7 = null_df, typename DF8 = null_df, typename DF9 = null_df,
        typename DF10 = null_df
        >
    class one_vs_one_decision_function
    {
    public:

        typedef typename one_vs_one_trainer::label_type result_type;
        typedef typename one_vs_one_trainer::sample_type sample_type;
        typedef typename one_vs_one_trainer::scalar_type scalar_type;
        typedef typename one_vs_one_trainer::mem_manager_type mem_manager_type;

        typedef std::map<unordered_pair<result_type>, any_decision_function<sample_type, scalar_type> > binary_function_table;

        one_vs_one_decision_function() :num_classes(0) {}

        explicit one_vs_one_decision_function(
            const binary_function_table& dfs_
        ) : dfs(dfs_)
        {
#ifdef ENABLE_ASSERTS
            {
                const std::vector<unordered_pair<result_type> > missing_pairs = find_missing_pairs(dfs_);
                if (missing_pairs.size() != 0)
                {
                    std::ostringstream sout;
                    for (unsigned long i = 0; i < missing_pairs.size(); ++i)
                    {
                        sout << "\t      (" << missing_pairs[i].first << ", " << missing_pairs[i].second << ")\n";
                    }
                    DLIB_ASSERT(missing_pairs.size() == 0, 
                        "\t void one_vs_one_decision_function::one_vs_one_decision_function()"
                        << "\n\t The supplied set of binary decision functions is incomplete."
                        << "\n\t this: " << this
                        << "\n\t Classifiers are missing for the following label pairs: \n" << sout.str()
                                );
                }
            }
#endif

            // figure out how many labels are covered by this set of binary decision functions
            std::set<result_type> labels;
            for (typename binary_function_table::const_iterator i = dfs.begin(); i != dfs.end(); ++i)
            {
                labels.insert(i->first.first);
                labels.insert(i->first.second);
            }
            num_classes = labels.size();
        }

        const binary_function_table& get_binary_decision_functions (
        ) const
        {
            return dfs;
        }

        const std::vector<result_type> get_labels (
        ) const
        {
            std::set<result_type> labels;
            for (typename binary_function_table::const_iterator i = dfs.begin(); i != dfs.end(); ++i)
            {
                labels.insert(i->first.first);
                labels.insert(i->first.second);
            }
            return std::vector<result_type>(labels.begin(), labels.end());
        }


        template <
            typename df1, typename df2, typename df3, typename df4, typename df5,
            typename df6, typename df7, typename df8, typename df9, typename df10
            >
        one_vs_one_decision_function (
            const one_vs_one_decision_function<one_vs_one_trainer, 
                                               df1, df2, df3, df4, df5,
                                               df6, df7, df8, df9, df10>& item
        ) : dfs(item.get_binary_decision_functions()), num_classes(item.number_of_classes()) {}

        unsigned long number_of_classes (
        ) const
        {
            return num_classes;
        }

        result_type operator() (
            const sample_type& sample
        ) const
        {
            DLIB_ASSERT(number_of_classes() != 0, 
                "\t void one_vs_one_decision_function::operator()"
                << "\n\t You can't make predictions with an empty decision function."
                << "\n\t this: " << this
                );

            std::map<result_type,int> votes;

            // run all the classifiers over the sample
            for(typename binary_function_table::const_iterator i = dfs.begin(); i != dfs.end(); ++i)
            {
                const scalar_type score = i->second(sample);

                if (score > 0)
                    votes[i->first.first] += 1;
                else
                    votes[i->first.second] += 1;
            }

            // now figure out who had the most votes
            result_type best_label = result_type();
            int best_votes = 0;
            for (typename std::map<result_type,int>::iterator i = votes.begin(); i != votes.end(); ++i)
            {
                if (i->second > best_votes)
                {
                    best_votes = i->second;
                    best_label = i->first;
                }
            }

            return best_label;
        }



    private:
        binary_function_table dfs;
        unsigned long num_classes;

    };

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename DF1, typename DF2, typename DF3,
        typename DF4, typename DF5, typename DF6,
        typename DF7, typename DF8, typename DF9,
        typename DF10 
        >
    void serialize(
        const one_vs_one_decision_function<T,DF1,DF2,DF3,DF4,DF5,DF6,DF7,DF8,DF9,DF10>& item, 
        std::ostream& out
    )
    {
        try
        {
            type_safe_union<DF1,DF2,DF3,DF4,DF5,DF6,DF7,DF8,DF9,DF10> temp;
            typedef typename T::label_type result_type;
            typedef typename T::sample_type sample_type;
            typedef typename T::scalar_type scalar_type;
            typedef std::map<unordered_pair<result_type>, any_decision_function<sample_type, scalar_type> > binary_function_table;

            const unsigned long version = 1;
            serialize(version, out);

            const unsigned long size = item.get_binary_decision_functions().size();
            serialize(size, out);

            for(typename binary_function_table::const_iterator i = item.get_binary_decision_functions().begin(); 
                i != item.get_binary_decision_functions().end(); ++i)
            {
                serialize(i->first, out);

                if      (i->second.template contains<DF1>()) temp.template get<DF1>() = any_cast<DF1>(i->second);
                else if (i->second.template contains<DF2>()) temp.template get<DF2>() = any_cast<DF2>(i->second);
                else if (i->second.template contains<DF3>()) temp.template get<DF3>() = any_cast<DF3>(i->second);
                else if (i->second.template contains<DF4>()) temp.template get<DF4>() = any_cast<DF4>(i->second);
                else if (i->second.template contains<DF5>()) temp.template get<DF5>() = any_cast<DF5>(i->second);
                else if (i->second.template contains<DF6>()) temp.template get<DF6>() = any_cast<DF6>(i->second);
                else if (i->second.template contains<DF7>()) temp.template get<DF7>() = any_cast<DF7>(i->second);
                else if (i->second.template contains<DF8>()) temp.template get<DF8>() = any_cast<DF8>(i->second);
                else if (i->second.template contains<DF9>()) temp.template get<DF9>() = any_cast<DF9>(i->second);
                else if (i->second.template contains<DF10>()) temp.template get<DF10>() = any_cast<DF10>(i->second);
                else throw serialization_error("Can't serialize one_vs_one_decision_function.  Not all decision functions defined.");

                serialize(temp,out);
            }
        }
        catch (serialization_error& e)
        {
            throw serialization_error(e.info + "\n   while serializing an object of type one_vs_one_decision_function");
        }

    }

// ----------------------------------------------------------------------------------------

    namespace impl
    {
        template <typename sample_type, typename scalar_type>
        struct copy_to_df_helper
        {
            copy_to_df_helper(any_decision_function<sample_type, scalar_type>& target_) : target(target_) {}

            any_decision_function<sample_type, scalar_type>& target;

            template <typename T>
            void operator() (
                const T& item
            ) const
            {
                target = item;
            }
        };
    }

    template <
        typename T,
        typename DF1, typename DF2, typename DF3,
        typename DF4, typename DF5, typename DF6,
        typename DF7, typename DF8, typename DF9,
        typename DF10 
        >
    void deserialize(
        one_vs_one_decision_function<T,DF1,DF2,DF3,DF4,DF5,DF6,DF7,DF8,DF9,DF10>& item, 
        std::istream& in 
    )
    {
        try
        {
            type_safe_union<DF1,DF2,DF3,DF4,DF5,DF6,DF7,DF8,DF9,DF10> temp;
            typedef typename T::label_type result_type;
            typedef typename T::sample_type sample_type;
            typedef typename T::scalar_type scalar_type;
            typedef impl::copy_to_df_helper<sample_type, scalar_type> copy_to;

            unsigned long version;
            deserialize(version, in);

            if (version != 1)
                throw serialization_error("Can't deserialize one_vs_one_decision_function.  Wrong version.");

            unsigned long size;
            deserialize(size, in);

            typedef std::map<unordered_pair<result_type>, any_decision_function<sample_type, scalar_type> > binary_function_table;
            binary_function_table dfs;

            unordered_pair<result_type> p;
            for (unsigned long i = 0; i < size; ++i)
            {
                deserialize(p, in);
                deserialize(temp, in);
                if (temp.template contains<null_df>())
                    throw serialization_error("A sub decision function of unknown type was encountered.");

                temp.apply_to_contents(copy_to(dfs[p]));
            }

            item = one_vs_one_decision_function<T,DF1,DF2,DF3,DF4,DF5,DF6,DF7,DF8,DF9,DF10>(dfs);
        }
        catch (serialization_error& e)
        {
            throw serialization_error(e.info + "\n   while deserializing an object of type one_vs_one_decision_function");
        }
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_ONE_VS_ONE_DECISION_FUnCTION_Hh_


