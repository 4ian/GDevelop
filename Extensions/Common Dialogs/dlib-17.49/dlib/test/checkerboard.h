#ifndef DLIB_CHECKERBOARD_TeST_H_
#define DLIB_CHECKERBOARD_TeST_H_

#include <dlib/matrix.h>
#include <vector>
#include <dlib/rand.h>

namespace dlib
{

    template <typename scalar_type>
    void get_checkerboard_problem (
        std::vector<matrix<scalar_type,2,1> >& x,
        std::vector<scalar_type>& y,
        const long num_samples,
        const long board_dimension = 8
    )
    /*!
        requires
            - num_samples > 0
            - board_dimension > 0
        ensures
            - #x.size() == y.size() == num_samples
            - is_binary_classification_problem(#x,#y) == true
            - #x will contain points and #y labels that were
              sampled randomly from a checkers board that has 
              board_dimension squares on each side. 
    !*/
    {
        static dlib::rand rnd;

        x.clear();
        y.clear();

        matrix<scalar_type,2,1> sample;
        for (long i = 0; i < num_samples; ++i)
        {
            sample(0) = rnd.get_random_double();
            sample(1) = rnd.get_random_double();
            sample *= board_dimension;

            x.push_back(sample);
            if (((int)sum(floor(sample)) %2) == 0)
                y.push_back(+1);
            else
                y.push_back(-1);
            
        }
    }


}

#endif // DLIB_CHECKERBOARD_TeST_H_

