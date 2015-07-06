// Copyright (C) 2012 Massachusetts Institute of Technology, Lincoln Laboratory
// License: Boost Software License   See LICENSE.txt for the full license.
// Authors: Davis E. King (davis@dlib.net)
/*
                               READ THIS FIRST
                                   ######
                                   ######
                                   ######
                                   ######
                                   ######
                                   ######
                                   ######
                                   ######
                                   ######
                                   ######
                                   ######
                                   ######
                                   ######
                               \############/
                                \##########/
                                 \########/
                                  \######/
                                   \####/
                                    \##/
                                     \/

    !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

    See example_mex_function.cpp for a discussion of how to use the mex wrapper.

    !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

                                     /\
                                    /##\
                                   /####\
                                  /######\
                                 /########\
                                /##########\
                               /############\
                                   ######
                                   ######
                                   ######
                                   ######
                                   ######
                                   ######
                                   ######
                                   ######
                                   ######
                                   ######
                                   ######
                                   ######
                                   ######
                               READ THIS FIRST
*/

// Copyright (C) 2012 Massachusetts Institute of Technology, Lincoln Laboratory
// License: Boost Software License   See LICENSE.txt for the full license.
// Authors: Davis E. King (davis@dlib.net)



































// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
//                            BEGIN IMPLEMENTATION DETAILS
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

#include "../matrix.h"
#include "../array2d.h"
#include "../array.h"
#include "../image_transforms.h"
#include "../is_kind.h"
#include "../any.h" // for sig_traits

#if defined(_MSC_VER)
#define DLL_EXPORT_SYM __declspec(dllexport)
#endif
#include "mex.h"
#include <sstream>
#include "call_matlab.h"

// ----------------------------------------------------------------------------------------

#ifdef ARG_1_DEFAULT 
#define ELSE_ASSIGN_ARG_1 else A1 = ARG_1_DEFAULT;
#else
#define ELSE_ASSIGN_ARG_1
#endif

#ifdef ARG_2_DEFAULT 
#define ELSE_ASSIGN_ARG_2 else A2 = ARG_2_DEFAULT;
#else
#define ELSE_ASSIGN_ARG_2
#endif

#ifdef ARG_3_DEFAULT 
#define ELSE_ASSIGN_ARG_3 else A3 = ARG_3_DEFAULT;
#else
#define ELSE_ASSIGN_ARG_3
#endif

#ifdef ARG_4_DEFAULT 
#define ELSE_ASSIGN_ARG_4 else A4 = ARG_4_DEFAULT;
#else
#define ELSE_ASSIGN_ARG_4
#endif

#ifdef ARG_5_DEFAULT 
#define ELSE_ASSIGN_ARG_5 else A5 = ARG_5_DEFAULT;
#else
#define ELSE_ASSIGN_ARG_5
#endif

#ifdef ARG_6_DEFAULT 
#define ELSE_ASSIGN_ARG_6 else A6 = ARG_6_DEFAULT;
#else
#define ELSE_ASSIGN_ARG_6
#endif

#ifdef ARG_7_DEFAULT 
#define ELSE_ASSIGN_ARG_7 else A7 = ARG_7_DEFAULT;
#else
#define ELSE_ASSIGN_ARG_7
#endif

#ifdef ARG_8_DEFAULT 
#define ELSE_ASSIGN_ARG_8 else A8 = ARG_8_DEFAULT;
#else
#define ELSE_ASSIGN_ARG_8
#endif

#ifdef ARG_9_DEFAULT 
#define ELSE_ASSIGN_ARG_9 else A9 = ARG_9_DEFAULT;
#else
#define ELSE_ASSIGN_ARG_9
#endif

#ifdef ARG_10_DEFAULT 
#define ELSE_ASSIGN_ARG_10 else A10 = ARG_10_DEFAULT;
#else
#define ELSE_ASSIGN_ARG_10
#endif

// ----------------------------------------------------------------------------------------

namespace mex_binding
{
    using namespace dlib;

    template <typename T>
    struct is_input_type 
    {
        const static unsigned long value = (!is_same_type<void,T>::value && (!is_reference_type<T>::value || is_const_type<T>::value )) ? 1 : 0;
    };
    template <typename T>
    struct is_output_type 
    {
        const static unsigned long value = (!is_same_type<void,T>::value && is_reference_type<T>::value && !is_const_type<T>::value) ? 1 : 0;
    };


    template <typename funct>
    struct funct_traits
    {
        const static unsigned long num_inputs = is_input_type<typename sig_traits<funct>::arg1_type>::value +
            is_input_type<typename sig_traits<funct>::arg2_type>::value +
            is_input_type<typename sig_traits<funct>::arg3_type>::value +
            is_input_type<typename sig_traits<funct>::arg4_type>::value +
            is_input_type<typename sig_traits<funct>::arg5_type>::value +
            is_input_type<typename sig_traits<funct>::arg6_type>::value +
            is_input_type<typename sig_traits<funct>::arg7_type>::value +
            is_input_type<typename sig_traits<funct>::arg8_type>::value +
            is_input_type<typename sig_traits<funct>::arg9_type>::value +
            is_input_type<typename sig_traits<funct>::arg10_type>::value; 

        const static unsigned long num_outputs= is_output_type<typename sig_traits<funct>::arg1_type>::value +
            is_output_type<typename sig_traits<funct>::arg2_type>::value +
            is_output_type<typename sig_traits<funct>::arg3_type>::value +
            is_output_type<typename sig_traits<funct>::arg4_type>::value +
            is_output_type<typename sig_traits<funct>::arg5_type>::value +
            is_output_type<typename sig_traits<funct>::arg6_type>::value +
            is_output_type<typename sig_traits<funct>::arg7_type>::value +
            is_output_type<typename sig_traits<funct>::arg8_type>::value +
            is_output_type<typename sig_traits<funct>::arg9_type>::value +
            is_output_type<typename sig_traits<funct>::arg10_type>::value; 
    };

// ----------------------------------------------------------------------------------------

    template <typename T>
    struct is_array_type
    {
        // true if T is std::vector or dlib::array
        const static bool value = is_std_vector<T>::value || dlib::is_array<T>::value;

    };

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename enabled = void 
        >
    struct inner_type
    {
        typedef T type;
    };

    template < typename T>
    struct inner_type<T, typename dlib::enable_if_c<is_matrix<T>::value || is_array2d<T>::value || dlib::is_array<T>::value >::type>
    {
        typedef typename T::type type;
    };

    template < typename T>
    struct inner_type<T, typename dlib::enable_if<is_std_vector<T> >::type>
    {
        typedef typename T::value_type type;
    };


// -------------------------------------------------------

    struct invalid_args_exception
    {
        invalid_args_exception(const std::string& msg_): msg(msg_) {}
        std::string msg;
    };

// -------------------------------------------------------

    template <
        typename matrix_type,
        typename EXP
        >
    typename dlib::enable_if_c<is_matrix<matrix_type>::value && is_same_type<typename inner_type<matrix_type>::type,typename EXP::type>::value >::type
    assign_mat (
        const long arg_idx,
        matrix_type& m,
        const matrix_exp<EXP>& src
    )  
    {
        if (matrix_type::NR != 0 && matrix_type::NR != src.nc())
        {
            std::ostringstream sout;
            sout << "Argument " << arg_idx+1 << " expects a matrix with " << matrix_type::NR << " rows but got one with " << src.nc();
            mexErrMsgIdAndTxt("mex_function:validate_and_populate_arg",
                              sout.str().c_str());
        }
        if (matrix_type::NC != 0 && matrix_type::NC != src.nr())
        {
            std::ostringstream sout;
            sout << "Argument " << arg_idx+1 << " expects a matrix with " << matrix_type::NC << " columns but got one with " << src.nr();
            mexErrMsgIdAndTxt("mex_function:validate_and_populate_arg",
                              sout.str().c_str());
        }


        m = trans(src);
    }

    template <
        typename matrix_type,
        typename EXP
        >
    typename dlib::enable_if_c<is_array2d<matrix_type>::value && is_same_type<typename inner_type<matrix_type>::type,typename EXP::type>::value >::type
    assign_mat (
        const long arg_idx,
        matrix_type& m,
        const matrix_exp<EXP>& src
    )  
    {
        assign_image(m , trans(src));
    }

    template <
        typename matrix_type,
        typename EXP
        >
    typename disable_if_c<(is_array2d<matrix_type>::value || is_matrix<matrix_type>::value) && 
    is_same_type<typename inner_type<matrix_type>::type,typename EXP::type>::value >::type
    assign_mat (
        const long arg_idx,
        matrix_type& ,
        const matrix_exp<EXP>& 
    ) 
    {
        std::ostringstream sout;
        sout << "mex_function has some bug in it related to processing input argument " << arg_idx+1;
        mexErrMsgIdAndTxt("mex_function:validate_and_populate_arg",
                          sout.str().c_str());
    }


// -------------------------------------------------------

    template <
        typename T,
        typename U
        >
    typename dlib::enable_if_c<is_built_in_scalar_type<T>::value || is_same_type<T,bool>::value >::type
    assign_scalar (
        const long arg_idx,
        T& dest,
        const U& src
    )  
    {
        if (is_signed_type<U>::value && src < 0 && is_unsigned_type<T>::value)
        {
            std::ostringstream sout;
            sout << "Error, input argument " << arg_idx+1 << " must be a non-negative number.";
            mexErrMsgIdAndTxt("mex_function:validate_and_populate_arg",
                              sout.str().c_str());
        }
        else
        {
            dest = src;
        }
    }

    template <
        typename T,
        typename U
        >
    typename dlib::disable_if_c<is_built_in_scalar_type<T>::value || is_same_type<T,bool>::value >::type
    assign_scalar (
        const long arg_idx,
        T& ,
        const U& 
    )  
    {
        std::ostringstream sout;
        sout << "mex_function has some bug in it related to processing input argument " << arg_idx+1;
        mexErrMsgIdAndTxt("mex_function:validate_and_populate_arg",
                          sout.str().c_str());
    }


// -------------------------------------------------------

    void assign_function_handle (
        const long arg_idx,
        function_handle& dest,
        const mxArray* src
    )  
    {
        const_cast<void*&>(dest.h) = (void*)src;
    }

    template <
        typename T
        >
    void assign_function_handle (
        const long arg_idx,
        T& ,
        const mxArray* 
    )  
    {
        std::ostringstream sout;
        sout << "mex_function has some bug in it related to processing input argument " << arg_idx+1;
        mexErrMsgIdAndTxt("mex_function:validate_and_populate_arg",
                          sout.str().c_str());
    }


// -------------------------------------------------------

    template <
        typename T
        >
    typename dlib::enable_if<is_array_type<T> >::type
    assign_std_vector (
        const long arg_idx,
        T& dest,
        const mxArray* src
    )  
    {
        const long nr = mxGetM(src);
        const long nc = mxGetN(src);

        typedef typename inner_type<T>::type type;

        if (!mxIsCell(src))
        {
            std::ostringstream sout;
            sout << " argument " << arg_idx+1 << " must be a cell array";
            throw invalid_args_exception(sout.str());
        }
        if (nr != 1 && nc != 1)
        {
            std::ostringstream sout;
            sout << " argument " << arg_idx+1 << " must be a cell array with exactly 1 row or 1 column (i.e. a row or column vector)";
            throw invalid_args_exception(sout.str());
        }

        const long size = nr*nc;
        dest.resize(size);

        for (unsigned long i = 0; i < dest.size(); ++i)
        {
            try
            {
                validate_and_populate_arg(i, mxGetCell(src, i), dest[i]);
            }
            catch (invalid_args_exception& e)
            {
                std::ostringstream sout;
                sout << "Error in argument " << arg_idx+1 << ": element " << i+1 << " of cell array not the expected type.\n";
                sout << "\t" << e.msg;
                throw invalid_args_exception(sout.str());
            }
        }

    }

    template <
        typename T
        >
    typename disable_if<is_array_type<T> >::type
    assign_std_vector (
        const long arg_idx,
        T& ,
        const mxArray*
    )  
    {
        std::ostringstream sout;
        sout << "mex_function has some bug in it related to processing input argument " << arg_idx+1;
        mexErrMsgIdAndTxt("mex_function:validate_and_populate_arg",
                          sout.str().c_str());
    }

// -------------------------------------------------------

    template <typename T> 
    void assign_image (
        const long arg_idx,
        T&,
        const dlib::uint8* data,
        long nr,
        long nc
    )
    {
        std::ostringstream sout;
        sout << "mex_function has some bug in it related to processing input argument " << arg_idx+1;
        mexErrMsgIdAndTxt("mex_function:validate_and_populate_arg",
                          sout.str().c_str());
    }

    template <typename MM>
    void assign_image(
        const long ,
        array2d<dlib::rgb_pixel,MM>& img,
        const dlib::uint8* data,
        long nr,
        long nc
    )
    {
        img.set_size(nr, nc);
        for (long c = 0; c < img.nc(); ++c)
            for (long r = 0; r < img.nr(); ++r)
                img[r][c].red = *data++;
        for (long c = 0; c < img.nc(); ++c)
            for (long r = 0; r < img.nr(); ++r)
                img[r][c].green = *data++;
        for (long c = 0; c < img.nc(); ++c)
            for (long r = 0; r < img.nr(); ++r)
                img[r][c].blue = *data++;
    }

// -------------------------------------------------------

    template <typename T>
    void validate_and_populate_arg (
        long arg_idx,
        const mxArray *prhs,
        T& arg
    ) 
    {
        using namespace mex_binding;
        if (is_built_in_scalar_type<T>::value || is_same_type<T,bool>::value)
        {
            if( !(mxIsDouble(prhs) || mxIsSingle(prhs) || mxIsLogical(prhs) ) || 
                mxIsComplex(prhs) ||
                mxGetNumberOfElements(prhs)!=1 ) 
            {
                std::ostringstream sout;
                sout << " argument " << arg_idx+1 << " must be a scalar";
                throw invalid_args_exception(sout.str());
            }

            assign_scalar(arg_idx, arg , mxGetScalar(prhs));
        }
        else if (is_matrix<T>::value || is_array2d<T>::value)
        {
            typedef typename inner_type<T>::type type;

            const int num_dims = mxGetNumberOfDimensions(prhs);
            const long nr = mxGetM(prhs);
            const long nc = mxGetN(prhs);

            if (is_same_type<type,dlib::rgb_pixel>::value)
            {
                if (!(num_dims == 3 && mxGetDimensions(prhs)[2] == 3 && mxIsUint8(prhs)))
                {
                    std::ostringstream sout;
                    sout << " argument " << arg_idx+1 << " must be a 3-D NxMx3 image matrix of uint8";
                    throw invalid_args_exception(sout.str());
                }

                const long rows = mxGetDimensions(prhs)[0];
                const long cols = mxGetDimensions(prhs)[1];
                assign_image(arg_idx, arg , (const dlib::uint8*)mxGetData(prhs), rows, cols);
                return;
            }

            if (num_dims != 2)
            {
                std::ostringstream sout;
                sout << " argument " << arg_idx+1 << " must be a 2-D matrix (got a " << num_dims << "-D matrix)";
                throw invalid_args_exception(sout.str());
            }


            if (is_same_type<type,double>::value)
            {
                if (!mxIsDouble(prhs) || mxIsComplex(prhs))
                {
                    std::ostringstream sout;
                    sout << " argument " << arg_idx+1 << " must be a matrix of doubles";
                    throw invalid_args_exception(sout.str());
                }
                assign_mat(arg_idx, arg , pointer_to_matrix(mxGetPr(prhs), nc, nr));
            }
            else if (is_same_type<type, float>::value)
            {
                if (!mxIsSingle(prhs) || mxIsComplex(prhs))
                {
                    std::ostringstream sout;
                    sout << " argument " << arg_idx+1 << " must be a matrix of single/float";
                    throw invalid_args_exception(sout.str());
                }

                assign_mat(arg_idx, arg , pointer_to_matrix((const float*)mxGetData(prhs), nc, nr));
            }
            else if (is_same_type<type, bool>::value)
            {
                if (!mxIsLogical(prhs))
                {
                    std::ostringstream sout;
                    sout << " argument " << arg_idx+1 << " must be a matrix of logical elements.";
                    throw invalid_args_exception(sout.str());
                }

                assign_mat(arg_idx, arg , pointer_to_matrix((const bool*)mxGetData(prhs), nc, nr));
            }
            else if (is_same_type<type, dlib::uint8>::value)
            {
                if (!mxIsUint8(prhs) || mxIsComplex(prhs))
                {
                    std::ostringstream sout;
                    sout << " argument " << arg_idx+1 << " must be a matrix of uint8";
                    throw invalid_args_exception(sout.str());
                }

                assign_mat(arg_idx, arg , pointer_to_matrix((const dlib::uint8*)mxGetData(prhs), nc, nr));
            }
            else if (is_same_type<type, dlib::int8>::value)
            {
                if (!mxIsInt8(prhs) || mxIsComplex(prhs))
                {
                    std::ostringstream sout;
                    sout << " argument " << arg_idx+1 << " must be a matrix of int8";
                    throw invalid_args_exception(sout.str());
                }

                assign_mat(arg_idx, arg , pointer_to_matrix((const dlib::int8*)mxGetData(prhs), nc, nr));
            }
            else if (is_same_type<type, dlib::int16>::value ||
                    (is_same_type<type, short>::value && sizeof(short) == sizeof(dlib::int16)))
            {
                if (!mxIsInt16(prhs) || mxIsComplex(prhs))
                {
                    std::ostringstream sout;
                    sout << " argument " << arg_idx+1 << " must be a matrix of int16";
                    throw invalid_args_exception(sout.str());
                }

                assign_mat(arg_idx, arg , pointer_to_matrix((const type*)mxGetData(prhs), nc, nr));
            }
            else if (is_same_type<type, dlib::uint16>::value ||
                    (is_same_type<type, unsigned short>::value && sizeof(unsigned short) == sizeof(dlib::uint16)))
            {
                if (!mxIsUint16(prhs) || mxIsComplex(prhs))
                {
                    std::ostringstream sout;
                    sout << " argument " << arg_idx+1 << " must be a matrix of uint16";
                    throw invalid_args_exception(sout.str());
                }

                assign_mat(arg_idx, arg , pointer_to_matrix((const type*)mxGetData(prhs), nc, nr));
            }
            else if (is_same_type<type, dlib::int32>::value ||
                    (is_same_type<type, int>::value && sizeof(int) == sizeof(dlib::int32)) ||
                    (is_same_type<type, long>::value && sizeof(long) == sizeof(dlib::int32)))
            {
                if (!mxIsInt32(prhs) || mxIsComplex(prhs))
                {
                    std::ostringstream sout;
                    sout << " argument " << arg_idx+1 << " must be a matrix of int32";
                    throw invalid_args_exception(sout.str());
                }

                assign_mat(arg_idx, arg , pointer_to_matrix((const type*)mxGetData(prhs), nc, nr));
            }
            else if (is_same_type<type, dlib::uint32>::value ||
                    (is_same_type<type, unsigned int>::value && sizeof(unsigned int) == sizeof(dlib::uint32)) ||
                    (is_same_type<type, unsigned long>::value && sizeof(unsigned long) == sizeof(dlib::uint32)))
            {
                if (!mxIsUint32(prhs) || mxIsComplex(prhs))
                {
                    std::ostringstream sout;
                    sout << " argument " << arg_idx+1 << " must be a matrix of uint32";
                    throw invalid_args_exception(sout.str());
                }

                assign_mat(arg_idx, arg , pointer_to_matrix((const type*)mxGetData(prhs), nc, nr));
            }
            else if (is_same_type<type, dlib::uint64>::value ||
                    (is_same_type<type, unsigned int>::value && sizeof(unsigned int) == sizeof(dlib::uint64)) ||
                    (is_same_type<type, unsigned long>::value && sizeof(unsigned long) == sizeof(dlib::uint64)))
            {
                if (!mxIsUint64(prhs) || mxIsComplex(prhs))
                {
                    std::ostringstream sout;
                    sout << " argument " << arg_idx+1 << " must be a matrix of uint64";
                    throw invalid_args_exception(sout.str());
                }

                assign_mat(arg_idx, arg , pointer_to_matrix((const type*)mxGetData(prhs), nc, nr));
            }
            else if (is_same_type<type, dlib::int64>::value ||
                    (is_same_type<type, int>::value && sizeof(int) == sizeof(dlib::int64)) ||
                    (is_same_type<type, long>::value && sizeof(long) == sizeof(dlib::int64)))
            {
                if (!mxIsInt64(prhs) || mxIsComplex(prhs))
                {
                    std::ostringstream sout;
                    sout << " argument " << arg_idx+1 << " must be a matrix of int64";
                    throw invalid_args_exception(sout.str());
                }

                assign_mat(arg_idx, arg , pointer_to_matrix((const type*)mxGetData(prhs), nc, nr));
            }
            else
            {
                mexErrMsgIdAndTxt("mex_function:validate_and_populate_arg",
                                  "mex_function uses unsupported matrix type");
            }
        }
        else if (is_array_type<T>::value)
        {
            assign_std_vector(arg_idx, arg, prhs);

        }
        else if (is_same_type<T,function_handle>::value)
        {
            if (!mxIsClass(prhs, "function_handle"))
            {
                std::ostringstream sout;
                sout << " argument " << arg_idx+1 << " must be a function handle.";
                throw invalid_args_exception(sout.str());
            }
            assign_function_handle(arg_idx, arg, prhs);
        }
        else
        {
            mexErrMsgIdAndTxt("mex_function:validate_and_populate_arg",
                              "mex_function uses unsupported input argument type");
        }
    }

    void validate_and_populate_arg(
        long arg_idx,
        const mxArray *prhs,
        std::string& arg
    )
    {
        if (!mxIsChar(prhs))
        {
            std::ostringstream sout;
            sout << " argument " << arg_idx+1 << " must be a char string";
            throw invalid_args_exception(sout.str());
        }

        const long nr = mxGetM(prhs);
        const long nc = mxGetN(prhs);
        const long size = nr*nc;
        arg.resize(size+1);
        if (mxGetString(prhs, &arg[0], arg.size()))
        {
            std::ostringstream sout;
            sout << " argument " << arg_idx+1 << " encountered an error while calling mxGetString()";
            throw invalid_args_exception(sout.str());
        }
        arg.resize(size);
    }


// ----------------------------------------------------------------------------------------

    template <typename EXP>
    typename dlib::enable_if<is_same_type<dlib::rgb_pixel,typename EXP::type> >::type assign_image_to_matlab (
        dlib::uint8* mat,
        const matrix_exp<EXP>& item
    )
    {
        for (long c = 0; c < item.nc(); ++c)
            for (long r = 0; r < item.nr(); ++r)
                *mat++ = item(r,c).red;
        for (long c = 0; c < item.nc(); ++c)
            for (long r = 0; r < item.nr(); ++r)
                *mat++ = item(r,c).green;
        for (long c = 0; c < item.nc(); ++c)
            for (long r = 0; r < item.nr(); ++r)
                *mat++ = item(r,c).blue;
    }

    template <typename T, typename EXP>
    typename disable_if<is_same_type<dlib::rgb_pixel,typename EXP::type> >::type assign_image_to_matlab (
        T* mat,
        const matrix_exp<EXP>& 
    )
    {
        mexErrMsgIdAndTxt("mex_function:validate_and_populate_arg",
                          "mex_function uses unsupported output image argument type");
    }

    template <typename T>
    typename dlib::enable_if<is_matrix<T> >::type assign_to_matlab(
        mxArray*& plhs,
        const T& item
    ) 
    {
        typedef typename T::type type;

        type* mat = 0;

        if (is_same_type<double, type>::value)
        {
            plhs = mxCreateDoubleMatrix(item.nr(),
                                        item.nc(),
                                        mxREAL);

            mat = (type*)mxGetPr(plhs);
        }
        else if (is_same_type<float, type>::value )
        {
            plhs = mxCreateNumericMatrix(item.nr(),
                                         item.nc(),
                                         mxSINGLE_CLASS,
                                         mxREAL);

            mat = (type*)mxGetData(plhs);
        }
        else if (is_same_type<bool, type>::value )
        {
            plhs = mxCreateLogicalMatrix(item.nr(),
                                         item.nc());

            mat = (type*)mxGetData(plhs);
        }
        else if (is_same_type<dlib::uint8, type>::value )
        {
            plhs = mxCreateNumericMatrix(item.nr(),
                                         item.nc(),
                                         mxUINT8_CLASS,
                                         mxREAL);

            mat = (type*)mxGetData(plhs);
        }
        else if (is_same_type<dlib::int8, type>::value )
        {
            plhs = mxCreateNumericMatrix(item.nr(),
                                         item.nc(),
                                         mxINT8_CLASS,
                                         mxREAL);

            mat = (type*)mxGetData(plhs);
        }
        else if (is_same_type<dlib::int16, type>::value ||
                 (is_same_type<short,type>::value && sizeof(short) == sizeof(dlib::int16)))
        {
            plhs = mxCreateNumericMatrix(item.nr(),
                                         item.nc(),
                                         mxINT16_CLASS,
                                         mxREAL);

            mat = (type*)mxGetData(plhs);
        }
        else if (is_same_type<dlib::uint16, type>::value ||
                 (is_same_type<unsigned short,type>::value && sizeof(unsigned short) == sizeof(dlib::uint16)))
        {
            plhs = mxCreateNumericMatrix(item.nr(),
                                         item.nc(),
                                         mxUINT16_CLASS,
                                         mxREAL);

            mat = (type*)mxGetData(plhs);
        }
        else if (is_same_type<dlib::int32, type>::value ||
                 (is_same_type<long,type>::value && sizeof(long) == sizeof(dlib::int32)))
        {
            plhs = mxCreateNumericMatrix(item.nr(),
                                         item.nc(),
                                         mxINT32_CLASS,
                                         mxREAL);

            mat = (type*)mxGetData(plhs);
        }
        else if (is_same_type<dlib::uint32, type>::value ||
                 (is_same_type<unsigned long,type>::value && sizeof(unsigned long) == sizeof(dlib::uint32)))
        {
            plhs = mxCreateNumericMatrix(item.nr(),
                                         item.nc(),
                                         mxUINT32_CLASS,
                                         mxREAL);

            mat = (type*)mxGetData(plhs);
        }
        else if (is_same_type<dlib::uint64, type>::value ||
                 (is_same_type<unsigned long,type>::value && sizeof(unsigned long) == sizeof(dlib::uint64)))
        {
            plhs = mxCreateNumericMatrix(item.nr(),
                                         item.nc(),
                                         mxUINT64_CLASS,
                                         mxREAL);

            mat = (type*)mxGetData(plhs);
        }
        else if (is_same_type<dlib::int64, type>::value  || 
                 (is_same_type<long,type>::value && sizeof(long) == sizeof(dlib::int64)))
        {
            plhs = mxCreateNumericMatrix(item.nr(),
                                         item.nc(),
                                         mxINT64_CLASS,
                                         mxREAL);

            mat = (type*)mxGetData(plhs);
        }
        else if (is_same_type<dlib::rgb_pixel, type>::value)
        {
            mwSize dims[3] = {item.nr(), item.nc(), 3};
            plhs = mxCreateNumericArray(3, dims, mxUINT8_CLASS, mxREAL);

            assign_image_to_matlab((dlib::uint8*)mxGetData(plhs), item);
            return;
        }
        else
        {
            mexErrMsgIdAndTxt("mex_function:validate_and_populate_arg",
                              "mex_function uses unsupported output argument type");
        }



        for (long c = 0; c < item.nc(); ++c)
        {
            for ( long  r= 0; r < item.nr(); ++r)
            {
                *mat++ = item(r,c);
            }
        }
    }

    void assign_to_matlab(
        mxArray*& plhs,
        const std::string& item
    ) 
    {
        plhs = mxCreateString(item.c_str());
    }

    template <typename T, typename MM>
    void assign_to_matlab(
        mxArray*& plhs,
        const array2d<T,MM>& item
    ) 
    {
        assign_to_matlab(plhs,array_to_matrix(item));
    }

    template <typename T>
    typename dlib::enable_if<is_array_type<T> >::type assign_to_matlab(
        mxArray*& plhs,
        const T& item
    ) 
    {
        mwSize dims[1] = {item.size()};
        plhs = mxCreateCellArray(1,dims);
        for (unsigned long i = 0; i < item.size(); ++i)
        {
            mxArray* next = 0;
            assign_to_matlab(next, item[i]);
            mxSetCell(plhs, i, next);
        }
    }

    template <typename T>
    typename dlib::disable_if_c<is_matrix<T>::value || is_array_type<T>::value || 
                                is_same_type<T,function_handle>::value>::type assign_to_matlab(
        mxArray*& plhs,
        const T& item
    ) 
    {
        plhs = mxCreateDoubleScalar(item);
    }


    void assign_to_matlab (
        mxArray*& plhs,
        const char* str
    )
    {
        assign_to_matlab(plhs, std::string(str));
    }

    void assign_to_matlab(
        mxArray*& plhs,
        const function_handle& h
    )
    {
    }

// ----------------------------------------------------------------------------------------

    template <
        unsigned long num_args
        >
    struct call_mex_function_helper;

    template <>
    struct call_mex_function_helper<1>
    {
        template <typename funct>
        void callit(
            const funct& ,
            int nlhs, mxArray *plhs[],
            int nrhs, const mxArray *prhs[]
        ) const
        {
            typedef typename sig_traits<funct>::arg1_type arg1_type;

            typename basic_type<arg1_type>::type A1;

            int i = 0;
            if (i < nrhs && is_input_type<arg1_type>::value) {validate_and_populate_arg(i,prhs[i],A1); ++i;} ELSE_ASSIGN_ARG_1;

            mex_function(A1);

            i = 0;
            if (is_output_type<arg1_type>::value) {assign_to_matlab(plhs[i],A1); ++i;}
        }
    };

    template <>
    struct call_mex_function_helper<2>
    {
        template <typename funct>
        void callit(
            const funct& ,
            int nlhs, mxArray *plhs[],
            int nrhs, const mxArray *prhs[]
        ) const
        {
            typedef typename sig_traits<funct>::arg1_type arg1_type;
            typedef typename sig_traits<funct>::arg2_type arg2_type;

            typename basic_type<arg1_type>::type A1;
            typename basic_type<arg2_type>::type A2;

            int i = 0;
            if (i < nrhs && is_input_type<arg1_type>::value) {validate_and_populate_arg(i,prhs[i],A1); ++i;} ELSE_ASSIGN_ARG_1;
            if (i < nrhs && is_input_type<arg2_type>::value) {validate_and_populate_arg(i,prhs[i],A2); ++i;} ELSE_ASSIGN_ARG_2;

            mex_function(A1,A2);

            i = 0;
            if (is_output_type<arg1_type>::value) {assign_to_matlab(plhs[i],A1); ++i;}
            if (is_output_type<arg2_type>::value) {assign_to_matlab(plhs[i],A2); ++i;}
        }
    };

    template <>
    struct call_mex_function_helper<3>
    {
        template <typename funct>
        void callit(
            const funct& ,
            int nlhs, mxArray *plhs[],
            int nrhs, const mxArray *prhs[]
        ) const
        {
            typedef typename sig_traits<funct>::arg1_type arg1_type;
            typedef typename sig_traits<funct>::arg2_type arg2_type;
            typedef typename sig_traits<funct>::arg3_type arg3_type;

            typename basic_type<arg1_type>::type A1;
            typename basic_type<arg2_type>::type A2;
            typename basic_type<arg3_type>::type A3;

            int i = 0;
            if (i < nrhs && is_input_type<arg1_type>::value) {validate_and_populate_arg(i,prhs[i],A1); ++i;} ELSE_ASSIGN_ARG_1;
            if (i < nrhs && is_input_type<arg2_type>::value) {validate_and_populate_arg(i,prhs[i],A2); ++i;} ELSE_ASSIGN_ARG_2;
            if (i < nrhs && is_input_type<arg3_type>::value) {validate_and_populate_arg(i,prhs[i],A3); ++i;} ELSE_ASSIGN_ARG_3;

            mex_function(A1,A2,A3);

            i = 0;
            if (is_output_type<arg1_type>::value) {assign_to_matlab(plhs[i],A1); ++i;}
            if (is_output_type<arg2_type>::value) {assign_to_matlab(plhs[i],A2); ++i;}
            if (is_output_type<arg3_type>::value) {assign_to_matlab(plhs[i],A3); ++i;}
        }
    };

    template <>
    struct call_mex_function_helper<4>
    {
        template <typename funct>
        void callit(
            const funct& ,
            int nlhs, mxArray *plhs[],
            int nrhs, const mxArray *prhs[]
        ) const
        {
            typedef typename sig_traits<funct>::arg1_type arg1_type;
            typedef typename sig_traits<funct>::arg2_type arg2_type;
            typedef typename sig_traits<funct>::arg3_type arg3_type;
            typedef typename sig_traits<funct>::arg4_type arg4_type;

            typename basic_type<arg1_type>::type A1;
            typename basic_type<arg2_type>::type A2;
            typename basic_type<arg3_type>::type A3;
            typename basic_type<arg4_type>::type A4;

            int i = 0;
            if (i < nrhs && is_input_type<arg1_type>::value) {validate_and_populate_arg(i,prhs[i],A1); ++i;} ELSE_ASSIGN_ARG_1;
            if (i < nrhs && is_input_type<arg2_type>::value) {validate_and_populate_arg(i,prhs[i],A2); ++i;} ELSE_ASSIGN_ARG_2;
            if (i < nrhs && is_input_type<arg3_type>::value) {validate_and_populate_arg(i,prhs[i],A3); ++i;} ELSE_ASSIGN_ARG_3;
            if (i < nrhs && is_input_type<arg4_type>::value) {validate_and_populate_arg(i,prhs[i],A4); ++i;} ELSE_ASSIGN_ARG_4;

            mex_function(A1,A2,A3,A4);


            i = 0;
            if (is_output_type<arg1_type>::value) {assign_to_matlab(plhs[i],A1); ++i;}
            if (is_output_type<arg2_type>::value) {assign_to_matlab(plhs[i],A2); ++i;}
            if (is_output_type<arg3_type>::value) {assign_to_matlab(plhs[i],A3); ++i;}
            if (is_output_type<arg4_type>::value) {assign_to_matlab(plhs[i],A4); ++i;}
        }
    };

    template <>
    struct call_mex_function_helper<5>
    {
        template <typename funct>
        void callit(
            const funct& ,
            int nlhs, mxArray *plhs[],
            int nrhs, const mxArray *prhs[]
        ) const
        {
            typedef typename sig_traits<funct>::arg1_type arg1_type;
            typedef typename sig_traits<funct>::arg2_type arg2_type;
            typedef typename sig_traits<funct>::arg3_type arg3_type;
            typedef typename sig_traits<funct>::arg4_type arg4_type;
            typedef typename sig_traits<funct>::arg5_type arg5_type;

            typename basic_type<arg1_type>::type A1;
            typename basic_type<arg2_type>::type A2;
            typename basic_type<arg3_type>::type A3;
            typename basic_type<arg4_type>::type A4;
            typename basic_type<arg5_type>::type A5;

            int i = 0;
            if (i < nrhs && is_input_type<arg1_type>::value) {validate_and_populate_arg(i,prhs[i],A1); ++i;} ELSE_ASSIGN_ARG_1;
            if (i < nrhs && is_input_type<arg2_type>::value) {validate_and_populate_arg(i,prhs[i],A2); ++i;} ELSE_ASSIGN_ARG_2;
            if (i < nrhs && is_input_type<arg3_type>::value) {validate_and_populate_arg(i,prhs[i],A3); ++i;} ELSE_ASSIGN_ARG_3;
            if (i < nrhs && is_input_type<arg4_type>::value) {validate_and_populate_arg(i,prhs[i],A4); ++i;} ELSE_ASSIGN_ARG_4;
            if (i < nrhs && is_input_type<arg5_type>::value) {validate_and_populate_arg(i,prhs[i],A5); ++i;} ELSE_ASSIGN_ARG_5;

            mex_function(A1,A2,A3,A4,A5);


            i = 0;
            if (is_output_type<arg1_type>::value) {assign_to_matlab(plhs[i],A1); ++i;}
            if (is_output_type<arg2_type>::value) {assign_to_matlab(plhs[i],A2); ++i;}
            if (is_output_type<arg3_type>::value) {assign_to_matlab(plhs[i],A3); ++i;}
            if (is_output_type<arg4_type>::value) {assign_to_matlab(plhs[i],A4); ++i;}
            if (is_output_type<arg5_type>::value) {assign_to_matlab(plhs[i],A5); ++i;}
        }
    };


    template <>
    struct call_mex_function_helper<6>
    {
        template <typename funct>
        void callit(
            const funct& ,
            int nlhs, mxArray *plhs[],
            int nrhs, const mxArray *prhs[]
        ) const
        {
            typedef typename sig_traits<funct>::arg1_type arg1_type;
            typedef typename sig_traits<funct>::arg2_type arg2_type;
            typedef typename sig_traits<funct>::arg3_type arg3_type;
            typedef typename sig_traits<funct>::arg4_type arg4_type;
            typedef typename sig_traits<funct>::arg5_type arg5_type;
            typedef typename sig_traits<funct>::arg6_type arg6_type;

            typename basic_type<arg1_type>::type A1;
            typename basic_type<arg2_type>::type A2;
            typename basic_type<arg3_type>::type A3;
            typename basic_type<arg4_type>::type A4;
            typename basic_type<arg5_type>::type A5;
            typename basic_type<arg6_type>::type A6;

            int i = 0;
            if (i < nrhs && is_input_type<arg1_type>::value) {validate_and_populate_arg(i,prhs[i],A1); ++i;} ELSE_ASSIGN_ARG_1;
            if (i < nrhs && is_input_type<arg2_type>::value) {validate_and_populate_arg(i,prhs[i],A2); ++i;} ELSE_ASSIGN_ARG_2;
            if (i < nrhs && is_input_type<arg3_type>::value) {validate_and_populate_arg(i,prhs[i],A3); ++i;} ELSE_ASSIGN_ARG_3;
            if (i < nrhs && is_input_type<arg4_type>::value) {validate_and_populate_arg(i,prhs[i],A4); ++i;} ELSE_ASSIGN_ARG_4;
            if (i < nrhs && is_input_type<arg5_type>::value) {validate_and_populate_arg(i,prhs[i],A5); ++i;} ELSE_ASSIGN_ARG_5;
            if (i < nrhs && is_input_type<arg6_type>::value) {validate_and_populate_arg(i,prhs[i],A6); ++i;} ELSE_ASSIGN_ARG_6;

            mex_function(A1,A2,A3,A4,A5,A6);


            i = 0;
            if (is_output_type<arg1_type>::value) {assign_to_matlab(plhs[i],A1); ++i;}
            if (is_output_type<arg2_type>::value) {assign_to_matlab(plhs[i],A2); ++i;}
            if (is_output_type<arg3_type>::value) {assign_to_matlab(plhs[i],A3); ++i;}
            if (is_output_type<arg4_type>::value) {assign_to_matlab(plhs[i],A4); ++i;}
            if (is_output_type<arg5_type>::value) {assign_to_matlab(plhs[i],A5); ++i;}
            if (is_output_type<arg6_type>::value) {assign_to_matlab(plhs[i],A6); ++i;}
        }
    };


    template <>
    struct call_mex_function_helper<7>
    {
        template <typename funct>
        void callit(
            const funct& ,
            int nlhs, mxArray *plhs[],
            int nrhs, const mxArray *prhs[]
        ) const
        {
            typedef typename sig_traits<funct>::arg1_type arg1_type;
            typedef typename sig_traits<funct>::arg2_type arg2_type;
            typedef typename sig_traits<funct>::arg3_type arg3_type;
            typedef typename sig_traits<funct>::arg4_type arg4_type;
            typedef typename sig_traits<funct>::arg5_type arg5_type;
            typedef typename sig_traits<funct>::arg6_type arg6_type;
            typedef typename sig_traits<funct>::arg7_type arg7_type;

            typename basic_type<arg1_type>::type A1;
            typename basic_type<arg2_type>::type A2;
            typename basic_type<arg3_type>::type A3;
            typename basic_type<arg4_type>::type A4;
            typename basic_type<arg5_type>::type A5;
            typename basic_type<arg6_type>::type A6;
            typename basic_type<arg7_type>::type A7;

            int i = 0;
            if (i < nrhs && is_input_type<arg1_type>::value) {validate_and_populate_arg(i,prhs[i],A1); ++i;} ELSE_ASSIGN_ARG_1;
            if (i < nrhs && is_input_type<arg2_type>::value) {validate_and_populate_arg(i,prhs[i],A2); ++i;} ELSE_ASSIGN_ARG_2;
            if (i < nrhs && is_input_type<arg3_type>::value) {validate_and_populate_arg(i,prhs[i],A3); ++i;} ELSE_ASSIGN_ARG_3;
            if (i < nrhs && is_input_type<arg4_type>::value) {validate_and_populate_arg(i,prhs[i],A4); ++i;} ELSE_ASSIGN_ARG_4;
            if (i < nrhs && is_input_type<arg5_type>::value) {validate_and_populate_arg(i,prhs[i],A5); ++i;} ELSE_ASSIGN_ARG_5;
            if (i < nrhs && is_input_type<arg6_type>::value) {validate_and_populate_arg(i,prhs[i],A6); ++i;} ELSE_ASSIGN_ARG_6;
            if (i < nrhs && is_input_type<arg7_type>::value) {validate_and_populate_arg(i,prhs[i],A7); ++i;} ELSE_ASSIGN_ARG_7;

            mex_function(A1,A2,A3,A4,A5,A6,A7);


            i = 0;
            if (is_output_type<arg1_type>::value) {assign_to_matlab(plhs[i],A1); ++i;}
            if (is_output_type<arg2_type>::value) {assign_to_matlab(plhs[i],A2); ++i;}
            if (is_output_type<arg3_type>::value) {assign_to_matlab(plhs[i],A3); ++i;}
            if (is_output_type<arg4_type>::value) {assign_to_matlab(plhs[i],A4); ++i;}
            if (is_output_type<arg5_type>::value) {assign_to_matlab(plhs[i],A5); ++i;}
            if (is_output_type<arg6_type>::value) {assign_to_matlab(plhs[i],A6); ++i;}
            if (is_output_type<arg7_type>::value) {assign_to_matlab(plhs[i],A7); ++i;}
        }
    };


    template <>
    struct call_mex_function_helper<8>
    {
        template <typename funct>
        void callit(
            const funct& ,
            int nlhs, mxArray *plhs[],
            int nrhs, const mxArray *prhs[]
        ) const
        {
            typedef typename sig_traits<funct>::arg1_type arg1_type;
            typedef typename sig_traits<funct>::arg2_type arg2_type;
            typedef typename sig_traits<funct>::arg3_type arg3_type;
            typedef typename sig_traits<funct>::arg4_type arg4_type;
            typedef typename sig_traits<funct>::arg5_type arg5_type;
            typedef typename sig_traits<funct>::arg6_type arg6_type;
            typedef typename sig_traits<funct>::arg7_type arg7_type;
            typedef typename sig_traits<funct>::arg8_type arg8_type;

            typename basic_type<arg1_type>::type A1;
            typename basic_type<arg2_type>::type A2;
            typename basic_type<arg3_type>::type A3;
            typename basic_type<arg4_type>::type A4;
            typename basic_type<arg5_type>::type A5;
            typename basic_type<arg6_type>::type A6;
            typename basic_type<arg7_type>::type A7;
            typename basic_type<arg8_type>::type A8;

            int i = 0;
            if (i < nrhs && is_input_type<arg1_type>::value) {validate_and_populate_arg(i,prhs[i],A1); ++i;} ELSE_ASSIGN_ARG_1;
            if (i < nrhs && is_input_type<arg2_type>::value) {validate_and_populate_arg(i,prhs[i],A2); ++i;} ELSE_ASSIGN_ARG_2;
            if (i < nrhs && is_input_type<arg3_type>::value) {validate_and_populate_arg(i,prhs[i],A3); ++i;} ELSE_ASSIGN_ARG_3;
            if (i < nrhs && is_input_type<arg4_type>::value) {validate_and_populate_arg(i,prhs[i],A4); ++i;} ELSE_ASSIGN_ARG_4;
            if (i < nrhs && is_input_type<arg5_type>::value) {validate_and_populate_arg(i,prhs[i],A5); ++i;} ELSE_ASSIGN_ARG_5;
            if (i < nrhs && is_input_type<arg6_type>::value) {validate_and_populate_arg(i,prhs[i],A6); ++i;} ELSE_ASSIGN_ARG_6;
            if (i < nrhs && is_input_type<arg7_type>::value) {validate_and_populate_arg(i,prhs[i],A7); ++i;} ELSE_ASSIGN_ARG_7;
            if (i < nrhs && is_input_type<arg8_type>::value) {validate_and_populate_arg(i,prhs[i],A8); ++i;} ELSE_ASSIGN_ARG_8;

            mex_function(A1,A2,A3,A4,A5,A6,A7,A8);


            i = 0;
            if (is_output_type<arg1_type>::value) {assign_to_matlab(plhs[i],A1); ++i;}
            if (is_output_type<arg2_type>::value) {assign_to_matlab(plhs[i],A2); ++i;}
            if (is_output_type<arg3_type>::value) {assign_to_matlab(plhs[i],A3); ++i;}
            if (is_output_type<arg4_type>::value) {assign_to_matlab(plhs[i],A4); ++i;}
            if (is_output_type<arg5_type>::value) {assign_to_matlab(plhs[i],A5); ++i;}
            if (is_output_type<arg6_type>::value) {assign_to_matlab(plhs[i],A6); ++i;}
            if (is_output_type<arg7_type>::value) {assign_to_matlab(plhs[i],A7); ++i;}
            if (is_output_type<arg8_type>::value) {assign_to_matlab(plhs[i],A8); ++i;}
        }
    };


    template <>
    struct call_mex_function_helper<9>
    {
        template <typename funct>
        void callit(
            const funct& ,
            int nlhs, mxArray *plhs[],
            int nrhs, const mxArray *prhs[]
        ) const
        {
            typedef typename sig_traits<funct>::arg1_type arg1_type;
            typedef typename sig_traits<funct>::arg2_type arg2_type;
            typedef typename sig_traits<funct>::arg3_type arg3_type;
            typedef typename sig_traits<funct>::arg4_type arg4_type;
            typedef typename sig_traits<funct>::arg5_type arg5_type;
            typedef typename sig_traits<funct>::arg6_type arg6_type;
            typedef typename sig_traits<funct>::arg7_type arg7_type;
            typedef typename sig_traits<funct>::arg8_type arg8_type;
            typedef typename sig_traits<funct>::arg9_type arg9_type;

            typename basic_type<arg1_type>::type A1;
            typename basic_type<arg2_type>::type A2;
            typename basic_type<arg3_type>::type A3;
            typename basic_type<arg4_type>::type A4;
            typename basic_type<arg5_type>::type A5;
            typename basic_type<arg6_type>::type A6;
            typename basic_type<arg7_type>::type A7;
            typename basic_type<arg8_type>::type A8;
            typename basic_type<arg9_type>::type A9;

            int i = 0;
            if (i < nrhs && is_input_type<arg1_type>::value) {validate_and_populate_arg(i,prhs[i],A1); ++i;} ELSE_ASSIGN_ARG_1;
            if (i < nrhs && is_input_type<arg2_type>::value) {validate_and_populate_arg(i,prhs[i],A2); ++i;} ELSE_ASSIGN_ARG_2;
            if (i < nrhs && is_input_type<arg3_type>::value) {validate_and_populate_arg(i,prhs[i],A3); ++i;} ELSE_ASSIGN_ARG_3;
            if (i < nrhs && is_input_type<arg4_type>::value) {validate_and_populate_arg(i,prhs[i],A4); ++i;} ELSE_ASSIGN_ARG_4;
            if (i < nrhs && is_input_type<arg5_type>::value) {validate_and_populate_arg(i,prhs[i],A5); ++i;} ELSE_ASSIGN_ARG_5;
            if (i < nrhs && is_input_type<arg6_type>::value) {validate_and_populate_arg(i,prhs[i],A6); ++i;} ELSE_ASSIGN_ARG_6;
            if (i < nrhs && is_input_type<arg7_type>::value) {validate_and_populate_arg(i,prhs[i],A7); ++i;} ELSE_ASSIGN_ARG_7;
            if (i < nrhs && is_input_type<arg8_type>::value) {validate_and_populate_arg(i,prhs[i],A8); ++i;} ELSE_ASSIGN_ARG_8;
            if (i < nrhs && is_input_type<arg9_type>::value) {validate_and_populate_arg(i,prhs[i],A9); ++i;} ELSE_ASSIGN_ARG_9;

            mex_function(A1,A2,A3,A4,A5,A6,A7,A8,A9);


            i = 0;
            if (is_output_type<arg1_type>::value) {assign_to_matlab(plhs[i],A1); ++i;}
            if (is_output_type<arg2_type>::value) {assign_to_matlab(plhs[i],A2); ++i;}
            if (is_output_type<arg3_type>::value) {assign_to_matlab(plhs[i],A3); ++i;}
            if (is_output_type<arg4_type>::value) {assign_to_matlab(plhs[i],A4); ++i;}
            if (is_output_type<arg5_type>::value) {assign_to_matlab(plhs[i],A5); ++i;}
            if (is_output_type<arg6_type>::value) {assign_to_matlab(plhs[i],A6); ++i;}
            if (is_output_type<arg7_type>::value) {assign_to_matlab(plhs[i],A7); ++i;}
            if (is_output_type<arg8_type>::value) {assign_to_matlab(plhs[i],A8); ++i;}
            if (is_output_type<arg9_type>::value) {assign_to_matlab(plhs[i],A9); ++i;}
        }
    };



    template <>
    struct call_mex_function_helper<10>
    {
        template <typename funct>
        void callit(
            const funct& ,
            int nlhs, mxArray *plhs[],
            int nrhs, const mxArray *prhs[]
        ) const
        {
            typedef typename sig_traits<funct>::arg1_type arg1_type;
            typedef typename sig_traits<funct>::arg2_type arg2_type;
            typedef typename sig_traits<funct>::arg3_type arg3_type;
            typedef typename sig_traits<funct>::arg4_type arg4_type;
            typedef typename sig_traits<funct>::arg5_type arg5_type;
            typedef typename sig_traits<funct>::arg6_type arg6_type;
            typedef typename sig_traits<funct>::arg7_type arg7_type;
            typedef typename sig_traits<funct>::arg8_type arg8_type;
            typedef typename sig_traits<funct>::arg9_type arg9_type;
            typedef typename sig_traits<funct>::arg10_type arg10_type;

            typename basic_type<arg1_type>::type A1;
            typename basic_type<arg2_type>::type A2;
            typename basic_type<arg3_type>::type A3;
            typename basic_type<arg4_type>::type A4;
            typename basic_type<arg5_type>::type A5;
            typename basic_type<arg6_type>::type A6;
            typename basic_type<arg7_type>::type A7;
            typename basic_type<arg8_type>::type A8;
            typename basic_type<arg9_type>::type A9;
            typename basic_type<arg10_type>::type A10;

            int i = 0;
            if (i < nrhs && is_input_type<arg1_type>::value) {validate_and_populate_arg(i,prhs[i],A1); ++i;} ELSE_ASSIGN_ARG_1;
            if (i < nrhs && is_input_type<arg2_type>::value) {validate_and_populate_arg(i,prhs[i],A2); ++i;} ELSE_ASSIGN_ARG_2;
            if (i < nrhs && is_input_type<arg3_type>::value) {validate_and_populate_arg(i,prhs[i],A3); ++i;} ELSE_ASSIGN_ARG_3;
            if (i < nrhs && is_input_type<arg4_type>::value) {validate_and_populate_arg(i,prhs[i],A4); ++i;} ELSE_ASSIGN_ARG_4;
            if (i < nrhs && is_input_type<arg5_type>::value) {validate_and_populate_arg(i,prhs[i],A5); ++i;} ELSE_ASSIGN_ARG_5;
            if (i < nrhs && is_input_type<arg6_type>::value) {validate_and_populate_arg(i,prhs[i],A6); ++i;} ELSE_ASSIGN_ARG_6;
            if (i < nrhs && is_input_type<arg7_type>::value) {validate_and_populate_arg(i,prhs[i],A7); ++i;} ELSE_ASSIGN_ARG_7;
            if (i < nrhs && is_input_type<arg8_type>::value) {validate_and_populate_arg(i,prhs[i],A8); ++i;} ELSE_ASSIGN_ARG_8;
            if (i < nrhs && is_input_type<arg9_type>::value) {validate_and_populate_arg(i,prhs[i],A9); ++i;} ELSE_ASSIGN_ARG_9;
            if (i < nrhs && is_input_type<arg10_type>::value) {validate_and_populate_arg(i,prhs[i],A10); ++i;} ELSE_ASSIGN_ARG_10;

            mex_function(A1,A2,A3,A4,A5,A6,A7,A8,A9,A10);


            i = 0;
            if (is_output_type<arg1_type>::value) {assign_to_matlab(plhs[i],A1); ++i;}
            if (is_output_type<arg2_type>::value) {assign_to_matlab(plhs[i],A2); ++i;}
            if (is_output_type<arg3_type>::value) {assign_to_matlab(plhs[i],A3); ++i;}
            if (is_output_type<arg4_type>::value) {assign_to_matlab(plhs[i],A4); ++i;}
            if (is_output_type<arg5_type>::value) {assign_to_matlab(plhs[i],A5); ++i;}
            if (is_output_type<arg6_type>::value) {assign_to_matlab(plhs[i],A6); ++i;}
            if (is_output_type<arg7_type>::value) {assign_to_matlab(plhs[i],A7); ++i;}
            if (is_output_type<arg8_type>::value) {assign_to_matlab(plhs[i],A8); ++i;}
            if (is_output_type<arg9_type>::value) {assign_to_matlab(plhs[i],A9); ++i;}
            if (is_output_type<arg10_type>::value) {assign_to_matlab(plhs[i],A10); ++i;}
        }
    };

// ----------------------------------------------------------------------------------------

    template <
        typename funct
        >
    void call_mex_function (
        const funct& f,
        int nlhs, mxArray *plhs[],
        int nrhs, const mxArray *prhs[]
    )
    {
        const long expected_nrhs = funct_traits<funct>::num_inputs;
        const long expected_nlhs = funct_traits<funct>::num_outputs;
        const long expected_args = expected_nrhs + expected_nlhs;

        long defaulted_args = 0;

        #ifdef ARG_1_DEFAULT
            ++defaulted_args;
            // You can only set an argument's default value if it is an input argument.
            COMPILE_TIME_ASSERT(is_input_type<typename sig_traits<funct>::arg1_type>::value);
            #ifndef ARG_2_DEFAULT
                // You can't define a default for argument 1 if you don't define one for argument 2 also.
                COMPILE_TIME_ASSERT(expected_args < 2);
            #endif
            COMPILE_TIME_ASSERT(1 <= expected_args); // You can't define a default for an argument that doesn't exist.
        #endif
        #ifdef ARG_2_DEFAULT
            ++defaulted_args;
            // You can only set an argument's default value if it is an input argument.
            COMPILE_TIME_ASSERT(is_input_type<typename sig_traits<funct>::arg2_type>::value);
            #ifndef ARG_3_DEFAULT
                // You can't define a default for argument 2 if you don't define one for argument 3 also.
                COMPILE_TIME_ASSERT(expected_args < 3);
            #endif
            COMPILE_TIME_ASSERT(2 <= expected_args); // You can't define a default for an argument that doesn't exist.
        #endif
        #ifdef ARG_3_DEFAULT
            ++defaulted_args;
            // You can only set an argument's default value if it is an input argument.
            COMPILE_TIME_ASSERT(is_input_type<typename sig_traits<funct>::arg3_type>::value);
            #ifndef ARG_4_DEFAULT
                // You can't define a default for argument 3 if you don't define one for argument 4 also.
                COMPILE_TIME_ASSERT(expected_args < 4);
            #endif
            COMPILE_TIME_ASSERT(3 <= expected_args); // You can't define a default for an argument that doesn't exist.
        #endif
        #ifdef ARG_4_DEFAULT
            ++defaulted_args;
            // You can only set an argument's default value if it is an input argument.
            COMPILE_TIME_ASSERT(is_input_type<typename sig_traits<funct>::arg4_type>::value);
            #ifndef ARG_5_DEFAULT
                // You can't define a default for argument 4 if you don't define one for argument 5 also.
                COMPILE_TIME_ASSERT(expected_args < 5);
            #endif
            COMPILE_TIME_ASSERT(4 <= expected_args); // You can't define a default for an argument that doesn't exist.
        #endif
        #ifdef ARG_5_DEFAULT
            ++defaulted_args;
            // You can only set an argument's default value if it is an input argument.
            COMPILE_TIME_ASSERT(is_input_type<typename sig_traits<funct>::arg5_type>::value);
            #ifndef ARG_6_DEFAULT
                // You can't define a default for argument 5 if you don't define one for argument 6 also.
                COMPILE_TIME_ASSERT(expected_args < 6);
            #endif
            COMPILE_TIME_ASSERT(5 <= expected_args); // You can't define a default for an argument that doesn't exist.
        #endif
        #ifdef ARG_6_DEFAULT
            ++defaulted_args;
            // You can only set an argument's default value if it is an input argument.
            COMPILE_TIME_ASSERT(is_input_type<typename sig_traits<funct>::arg6_type>::value);
            #ifndef ARG_7_DEFAULT
                // You can't define a default for argument 6 if you don't define one for argument 7 also.
                COMPILE_TIME_ASSERT(expected_args < 7);
            #endif
            COMPILE_TIME_ASSERT(6 <= expected_args); // You can't define a default for an argument that doesn't exist.
        #endif
        #ifdef ARG_7_DEFAULT
            ++defaulted_args;
            // You can only set an argument's default value if it is an input argument.
            COMPILE_TIME_ASSERT(is_input_type<typename sig_traits<funct>::arg7_type>::value);
            #ifndef ARG_8_DEFAULT
                // You can't define a default for argument 7 if you don't define one for argument 8 also.
                COMPILE_TIME_ASSERT(expected_args < 8);
            #endif
            COMPILE_TIME_ASSERT(7 <= expected_args); // You can't define a default for an argument that doesn't exist.
        #endif
        #ifdef ARG_8_DEFAULT
            ++defaulted_args;
            // You can only set an argument's default value if it is an input argument.
            COMPILE_TIME_ASSERT(is_input_type<typename sig_traits<funct>::arg8_type>::value);
            #ifndef ARG_9_DEFAULT
                // You can't define a default for argument 8 if you don't define one for argument 9 also.
                COMPILE_TIME_ASSERT(expected_args < 9);
            #endif
            COMPILE_TIME_ASSERT(8 <= expected_args); // You can't define a default for an argument that doesn't exist.
        #endif
        #ifdef ARG_9_DEFAULT
            ++defaulted_args;
            // You can only set an argument's default value if it is an input argument.
            COMPILE_TIME_ASSERT(is_input_type<typename sig_traits<funct>::arg9_type>::value);
            #ifndef ARG_10_DEFAULT
                // You can't define a default for argument 9 if you don't define one for argument 10 also.
                COMPILE_TIME_ASSERT(expected_args < 10);
            #endif
            COMPILE_TIME_ASSERT(9 <= expected_args); // You can't define a default for an argument that doesn't exist.
        #endif
        #ifdef ARG_10_DEFAULT
            ++defaulted_args;
            // You can only set an argument's default value if it is an input argument.
            COMPILE_TIME_ASSERT(is_input_type<typename sig_traits<funct>::arg10_type>::value);
            COMPILE_TIME_ASSERT(10 <= expected_args); // You can't define a default for an argument that doesn't exist.
        #endif



        /* check for proper number of arguments */
        if(nrhs > expected_nrhs || nrhs < expected_nrhs - defaulted_args) 
        {
            std::ostringstream sout;
            sout << "Expected between " << expected_nrhs-defaulted_args 
                << " and " << expected_nrhs << " input arguments, got " << nrhs << ".";

            mexErrMsgIdAndTxt("mex_function:nrhs",
                              sout.str().c_str());
        }

        if (nlhs > expected_nlhs)
        {
            std::ostringstream sout;
            sout << "Expected at most " << expected_nlhs << " output arguments, got " << nlhs << ".";

            mexErrMsgIdAndTxt("mex_function:nlhs",
                              sout.str().c_str());
        }

        try
        {
            call_mex_function_helper<sig_traits<funct>::num_args> helper;
            helper.callit(f, nlhs, plhs, nrhs, prhs);
        }
        catch (invalid_args_exception& e)
        {
            mexErrMsgIdAndTxt("mex_function:validate_and_populate_arg",
                              ("Input" + e.msg).c_str());
        }
        catch (dlib::error& e)
        {
            mexErrMsgIdAndTxt("mex_function:error",
                              e.what());
        }

    }

// ----------------------------------------------------------------------------------------

    class mex_streambuf : public std::streambuf
    {

    public:
        mex_streambuf (
        ) 
        {
            buf.resize(1000);
            setp(&buf[0], &buf[0] + buf.size()-2);

            // make cout send data to mex_streambuf
            std::cout.rdbuf(this);
        }


    protected:


        int sync (
        )
        {
            int num = static_cast<int>(pptr()-pbase());
            if (num != 0)
            {
                buf[num] = 0; // null terminate the string
                mexPrintf("%s",&buf[0]);
                mexEvalString("drawnow"); // flush print to screen
                pbump(-num);
            }
            return 0;
        }

        int_type overflow (
            int_type c
        )
        {
            if (c != EOF)
            {
                *pptr() = c;
                pbump(1);
            }
            sync();
            return c;
        }

    private:
        std::vector<char> buf;

    };

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <typename T>
    void setup_input_args (
        mxArray*& array,
        const T& item,
        int& nrhs
    )
    {
        assign_to_matlab(array, item);
        ++nrhs;
    }

    void setup_input_args (
        mxArray*& array,
        const function_handle& item,
        int& nrhs
    )
    {
        array = static_cast<mxArray*>(item.h);
        ++nrhs;
    }

    template <typename T>
    void setup_input_args (
        mxArray*& array,
        const output_decorator<T>& item,
        int& nrhs
    )
    {
    }

    template <typename T>
    void setup_output_args (
        const std::string& function_name,
        mxArray* array,
        const T& item,
        int& nrhs
    )
    {
    }

    template <typename T>
    void setup_output_args (
        const std::string& function_name,
        mxArray* array,
        const output_decorator<T>& item,
        int& i
    )
    {
        try
        {
            validate_and_populate_arg(i,array,const_cast<T&>(item.item));
            ++i;
        }
        catch (invalid_args_exception& e)
        {
            throw dlib::error("Error occurred calling MATLAB function '" + function_name + "' from mex file. \n"
                              "The MATLAB function didn't return what we expected it to.  \nIn particular, return" + e.msg);
        }
    }

    void call_matlab_for_real (
        int nlhs,
        mxArray* plhs[],
        int nrhs,
        mxArray* prhs[],
        const std::string& function_name
    )
    {
        int status = mexCallMATLAB(nlhs, plhs, nrhs, prhs, function_name.c_str());
        if (status)
        {
            throw dlib::error("Error, an exception was thrown when we tried to call the MATLAB function '" + function_name + "'.");
        }
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

}

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

void call_matlab (
    const std::string& function_name
) 
{
    using namespace mex_binding;

    call_matlab_for_real(0,NULL,0,NULL, function_name);
}

template <typename T1>
void free_callback_resources (
    int nlhs,
    mxArray* plhs[],
    int nrhs,
    mxArray* prhs[]
)
{
    // free resources
    for (int i = 0; i < nlhs; ++i)
        mxDestroyArray(plhs[i]);

    for (int i = 0; i < nrhs; ++i)
    {
        // don't call mxDestroyArray() on function handles (which should only ever be in prhs[0])
        if (i == 0 && dlib::is_same_type<T1,function_handle>::value)
            continue;
        mxDestroyArray(prhs[i]);
    }
}

template <
    typename T1
    >
void call_matlab (
    const std::string& function_name,
    const T1& A1
) 
{
    using namespace mex_binding;
    const int num_args = 1;
    mxArray* plhs[num_args] = {0};
    mxArray* prhs[num_args] = {0};

    int nrhs = 0;
    setup_input_args(prhs[nrhs], A1, nrhs);

    const int nlhs = num_args - nrhs;
    call_matlab_for_real(nlhs,plhs,nrhs,prhs, function_name);

    int i = 0;
    setup_output_args(function_name, plhs[i], A1, i);

    free_callback_resources<T1>(nlhs,plhs,nrhs,prhs);
}

template <
    typename T1, 
    typename T2
    >
void call_matlab (
    const std::string& function_name,
    const T1& A1,
    const T2& A2
) 
{
    using namespace mex_binding;
    const int num_args = 2;
    mxArray* plhs[num_args] = {0};
    mxArray* prhs[num_args] = {0};

    int nrhs = 0;
    setup_input_args(prhs[nrhs], A1, nrhs);
    setup_input_args(prhs[nrhs], A2, nrhs);

    const int nlhs = num_args - nrhs;
    call_matlab_for_real(nlhs,plhs,nrhs,prhs, function_name);

    int i = 0;
    setup_output_args(function_name, plhs[i], A1, i);
    setup_output_args(function_name, plhs[i], A2, i);

    free_callback_resources<T1>(nlhs,plhs,nrhs,prhs);
}

template <
    typename T1, 
    typename T2,
    typename T3
    >
void call_matlab (
    const std::string& function_name,
    const T1& A1,
    const T2& A2,
    const T3& A3
) 
{
    using namespace mex_binding;
    const int num_args = 3;
    mxArray* plhs[num_args] = {0};
    mxArray* prhs[num_args] = {0};

    int nrhs = 0;
    setup_input_args(prhs[nrhs], A1, nrhs);
    setup_input_args(prhs[nrhs], A2, nrhs);
    setup_input_args(prhs[nrhs], A3, nrhs);

    const int nlhs = num_args - nrhs;
    call_matlab_for_real(nlhs,plhs,nrhs,prhs, function_name);

    int i = 0;
    setup_output_args(function_name, plhs[i], A1, i);
    setup_output_args(function_name, plhs[i], A2, i);
    setup_output_args(function_name, plhs[i], A3, i);

    free_callback_resources<T1>(nlhs,plhs,nrhs,prhs);
}


template <
    typename T1, 
    typename T2,
    typename T3,
    typename T4
    >
void call_matlab (
    const std::string& function_name,
    const T1& A1,
    const T2& A2,
    const T3& A3,
    const T4& A4
) 
{
    using namespace mex_binding;
    const int num_args = 4;
    mxArray* plhs[num_args] = {0};
    mxArray* prhs[num_args] = {0};

    int nrhs = 0;
    setup_input_args(prhs[nrhs], A1, nrhs);
    setup_input_args(prhs[nrhs], A2, nrhs);
    setup_input_args(prhs[nrhs], A3, nrhs);
    setup_input_args(prhs[nrhs], A4, nrhs);

    const int nlhs = num_args - nrhs;
    call_matlab_for_real(nlhs,plhs,nrhs,prhs, function_name);

    int i = 0;
    setup_output_args(function_name, plhs[i], A1, i);
    setup_output_args(function_name, plhs[i], A2, i);
    setup_output_args(function_name, plhs[i], A3, i);
    setup_output_args(function_name, plhs[i], A4, i);

    free_callback_resources<T1>(nlhs,plhs,nrhs,prhs);
}


template <
    typename T1, 
    typename T2,
    typename T3,
    typename T4,
    typename T5
    >
void call_matlab (
    const std::string& function_name,
    const T1& A1,
    const T2& A2,
    const T3& A3,
    const T4& A4,
    const T5& A5
) 
{
    using namespace mex_binding;
    const int num_args = 5;
    mxArray* plhs[num_args] = {0};
    mxArray* prhs[num_args] = {0};

    int nrhs = 0;
    setup_input_args(prhs[nrhs], A1, nrhs);
    setup_input_args(prhs[nrhs], A2, nrhs);
    setup_input_args(prhs[nrhs], A3, nrhs);
    setup_input_args(prhs[nrhs], A4, nrhs);
    setup_input_args(prhs[nrhs], A5, nrhs);

    const int nlhs = num_args - nrhs;
    call_matlab_for_real(nlhs,plhs,nrhs,prhs, function_name);

    int i = 0;
    setup_output_args(function_name, plhs[i], A1, i);
    setup_output_args(function_name, plhs[i], A2, i);
    setup_output_args(function_name, plhs[i], A3, i);
    setup_output_args(function_name, plhs[i], A4, i);
    setup_output_args(function_name, plhs[i], A5, i);

    free_callback_resources<T1>(nlhs,plhs,nrhs,prhs);
}


template <
    typename T1, 
    typename T2,
    typename T3,
    typename T4,
    typename T5,
    typename T6
    >
void call_matlab (
    const std::string& function_name,
    const T1& A1,
    const T2& A2,
    const T3& A3,
    const T4& A4,
    const T5& A5,
    const T6& A6
) 
{
    using namespace mex_binding;
    const int num_args = 6;
    mxArray* plhs[num_args] = {0};
    mxArray* prhs[num_args] = {0};

    int nrhs = 0;
    setup_input_args(prhs[nrhs], A1, nrhs);
    setup_input_args(prhs[nrhs], A2, nrhs);
    setup_input_args(prhs[nrhs], A3, nrhs);
    setup_input_args(prhs[nrhs], A4, nrhs);
    setup_input_args(prhs[nrhs], A5, nrhs);
    setup_input_args(prhs[nrhs], A6, nrhs);

    const int nlhs = num_args - nrhs;
    call_matlab_for_real(nlhs,plhs,nrhs,prhs, function_name);

    int i = 0;
    setup_output_args(function_name, plhs[i], A1, i);
    setup_output_args(function_name, plhs[i], A2, i);
    setup_output_args(function_name, plhs[i], A3, i);
    setup_output_args(function_name, plhs[i], A4, i);
    setup_output_args(function_name, plhs[i], A5, i);
    setup_output_args(function_name, plhs[i], A6, i);

    free_callback_resources<T1>(nlhs,plhs,nrhs,prhs);
}


template <
    typename T1, 
    typename T2,
    typename T3,
    typename T4,
    typename T5,
    typename T6,
    typename T7
    >
void call_matlab (
    const std::string& function_name,
    const T1& A1,
    const T2& A2,
    const T3& A3,
    const T4& A4,
    const T5& A5,
    const T6& A6,
    const T7& A7
) 
{
    using namespace mex_binding;
    const int num_args = 7;
    mxArray* plhs[num_args] = {0};
    mxArray* prhs[num_args] = {0};

    int nrhs = 0;
    setup_input_args(prhs[nrhs], A1, nrhs);
    setup_input_args(prhs[nrhs], A2, nrhs);
    setup_input_args(prhs[nrhs], A3, nrhs);
    setup_input_args(prhs[nrhs], A4, nrhs);
    setup_input_args(prhs[nrhs], A5, nrhs);
    setup_input_args(prhs[nrhs], A6, nrhs);
    setup_input_args(prhs[nrhs], A7, nrhs);

    const int nlhs = num_args - nrhs;
    call_matlab_for_real(nlhs,plhs,nrhs,prhs, function_name);

    int i = 0;
    setup_output_args(function_name, plhs[i], A1, i);
    setup_output_args(function_name, plhs[i], A2, i);
    setup_output_args(function_name, plhs[i], A3, i);
    setup_output_args(function_name, plhs[i], A4, i);
    setup_output_args(function_name, plhs[i], A5, i);
    setup_output_args(function_name, plhs[i], A6, i);
    setup_output_args(function_name, plhs[i], A7, i);

    free_callback_resources<T1>(nlhs,plhs,nrhs,prhs);
}


template <
    typename T1, 
    typename T2,
    typename T3,
    typename T4,
    typename T5,
    typename T6,
    typename T7,
    typename T8
    >
void call_matlab (
    const std::string& function_name,
    const T1& A1,
    const T2& A2,
    const T3& A3,
    const T4& A4,
    const T5& A5,
    const T6& A6,
    const T7& A7,
    const T8& A8
) 
{
    using namespace mex_binding;
    const int num_args = 8;
    mxArray* plhs[num_args] = {0};
    mxArray* prhs[num_args] = {0};

    int nrhs = 0;
    setup_input_args(prhs[nrhs], A1, nrhs);
    setup_input_args(prhs[nrhs], A2, nrhs);
    setup_input_args(prhs[nrhs], A3, nrhs);
    setup_input_args(prhs[nrhs], A4, nrhs);
    setup_input_args(prhs[nrhs], A5, nrhs);
    setup_input_args(prhs[nrhs], A6, nrhs);
    setup_input_args(prhs[nrhs], A7, nrhs);
    setup_input_args(prhs[nrhs], A8, nrhs);

    const int nlhs = num_args - nrhs;
    call_matlab_for_real(nlhs,plhs,nrhs,prhs, function_name);

    int i = 0;
    setup_output_args(function_name, plhs[i], A1, i);
    setup_output_args(function_name, plhs[i], A2, i);
    setup_output_args(function_name, plhs[i], A3, i);
    setup_output_args(function_name, plhs[i], A4, i);
    setup_output_args(function_name, plhs[i], A5, i);
    setup_output_args(function_name, plhs[i], A6, i);
    setup_output_args(function_name, plhs[i], A7, i);
    setup_output_args(function_name, plhs[i], A8, i);

    free_callback_resources<T1>(nlhs,plhs,nrhs,prhs);
}



template <
    typename T1, 
    typename T2,
    typename T3,
    typename T4,
    typename T5,
    typename T6,
    typename T7,
    typename T8,
    typename T9
    >
void call_matlab (
    const std::string& function_name,
    const T1& A1,
    const T2& A2,
    const T3& A3,
    const T4& A4,
    const T5& A5,
    const T6& A6,
    const T7& A7,
    const T8& A8,
    const T9& A9
) 
{
    using namespace mex_binding;
    const int num_args = 9;
    mxArray* plhs[num_args] = {0};
    mxArray* prhs[num_args] = {0};

    int nrhs = 0;
    setup_input_args(prhs[nrhs], A1, nrhs);
    setup_input_args(prhs[nrhs], A2, nrhs);
    setup_input_args(prhs[nrhs], A3, nrhs);
    setup_input_args(prhs[nrhs], A4, nrhs);
    setup_input_args(prhs[nrhs], A5, nrhs);
    setup_input_args(prhs[nrhs], A6, nrhs);
    setup_input_args(prhs[nrhs], A7, nrhs);
    setup_input_args(prhs[nrhs], A8, nrhs);
    setup_input_args(prhs[nrhs], A9, nrhs);

    const int nlhs = num_args - nrhs;
    call_matlab_for_real(nlhs,plhs,nrhs,prhs, function_name);

    int i = 0;
    setup_output_args(function_name, plhs[i], A1, i);
    setup_output_args(function_name, plhs[i], A2, i);
    setup_output_args(function_name, plhs[i], A3, i);
    setup_output_args(function_name, plhs[i], A4, i);
    setup_output_args(function_name, plhs[i], A5, i);
    setup_output_args(function_name, plhs[i], A6, i);
    setup_output_args(function_name, plhs[i], A7, i);
    setup_output_args(function_name, plhs[i], A8, i);
    setup_output_args(function_name, plhs[i], A9, i);

    free_callback_resources<T1>(nlhs,plhs,nrhs,prhs);
}


template <
    typename T1, 
    typename T2,
    typename T3,
    typename T4,
    typename T5,
    typename T6,
    typename T7,
    typename T8,
    typename T9,
    typename T10
    >
void call_matlab (
    const std::string& function_name,
    const T1& A1,
    const T2& A2,
    const T3& A3,
    const T4& A4,
    const T5& A5,
    const T6& A6,
    const T7& A7,
    const T8& A8,
    const T9& A9,
    const T10& A10
) 
{
    using namespace mex_binding;
    const int num_args = 10;
    mxArray* plhs[num_args] = {0};
    mxArray* prhs[num_args] = {0};

    int nrhs = 0;
    setup_input_args(prhs[nrhs], A1, nrhs);
    setup_input_args(prhs[nrhs], A2, nrhs);
    setup_input_args(prhs[nrhs], A3, nrhs);
    setup_input_args(prhs[nrhs], A4, nrhs);
    setup_input_args(prhs[nrhs], A5, nrhs);
    setup_input_args(prhs[nrhs], A6, nrhs);
    setup_input_args(prhs[nrhs], A7, nrhs);
    setup_input_args(prhs[nrhs], A8, nrhs);
    setup_input_args(prhs[nrhs], A10, nrhs);

    const int nlhs = num_args - nrhs;
    call_matlab_for_real(nlhs,plhs,nrhs,prhs, function_name);

    int i = 0;
    setup_output_args(function_name, plhs[i], A1, i);
    setup_output_args(function_name, plhs[i], A2, i);
    setup_output_args(function_name, plhs[i], A3, i);
    setup_output_args(function_name, plhs[i], A4, i);
    setup_output_args(function_name, plhs[i], A5, i);
    setup_output_args(function_name, plhs[i], A6, i);
    setup_output_args(function_name, plhs[i], A7, i);
    setup_output_args(function_name, plhs[i], A8, i);
    setup_output_args(function_name, plhs[i], A10, i);

    free_callback_resources<T1>(nlhs,plhs,nrhs,prhs);
}

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

void call_matlab (
    const function_handle& funct 
)
{
    call_matlab("feval", funct);
}

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

/* The gateway function called by MATLAB*/
void mexFunction( int nlhs, mxArray *plhs[],
                  int nrhs, const mxArray *prhs[])
{
    // Only remap cout if we aren't using octave since octave already does this.
#if !defined(OCTAVE_IMPORT) && !defined(OCTAVE_API)
    // make it so cout prints to mexPrintf()
    static mex_binding::mex_streambuf sb;
#endif

    mex_binding::call_mex_function(mex_function, nlhs, plhs, nrhs, prhs);
}

// ----------------------------------------------------------------------------------------

