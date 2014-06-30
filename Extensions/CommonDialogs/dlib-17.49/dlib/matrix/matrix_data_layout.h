// Copyright (C) 2006  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_MATRIx_DATA_LAYOUT_
#define DLIB_MATRIx_DATA_LAYOUT_

#include "../algs.h"
#include "matrix_fwd.h"
#include "matrix_data_layout_abstract.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    /*!
        A matrix layout object is any object that contains a templated class called "layout"
        with an interface identical to one below:
        (Note that all the template arguments are just the template arguments from the dlib::matrix 
        object and the member functions are defined identically to the ones with the same 
        signatures inside the matrix object.)

        struct matrix_layout
        {
            template <
                typename T,
                long num_rows,
                long num_cols,
                typename mem_manager
                >
            class layout 
            {
            public:

                T& operator() (
                    long r, 
                    long c
                );

                const T& operator() (
                    long r, 
                    long c
                );

                T& operator() (
                    long i 
                );

                const T& operator() (
                    long i
                ) const;

                void swap(
                    layout& item
                );

                long nr (
                ) const;

                long nc (
                ) const;

                void set_size (
                    long nr_,
                    long nc_
                );
            };
        };
    !*/

// ----------------------------------------------------------------------------------------

    struct row_major_layout
    {
        // if a matrix is bigger than this many bytes then don't put it on the stack
        const static size_t max_stack_based_size = 256;

        // this is a hack to avoid a compile time error in visual studio 8.  I would just 
        // use sizeof(T) and be done with it but that won't compile.  The idea here 
        // is to avoid using the stack allocation of the layout object if it 
        // is going to contain another matrix and also avoid asking for the sizeof()
        // the contained matrix.
        template <typename T>
        struct get_sizeof_helper
        {
            const static std::size_t val = sizeof(T);
        };

        template <typename T, long NR, long NC, typename mm, typename l>
        struct get_sizeof_helper<matrix<T,NR,NC,mm,l> >
        {
            const static std::size_t val = 1000000;
        };

        template <
            typename T,
            long num_rows,
            long num_cols,
            typename mem_manager,
            int val = static_switch <
                // when the sizes are all non zero and small
                (num_rows*num_cols*get_sizeof_helper<T>::val <= max_stack_based_size) && (num_rows != 0 && num_cols != 0),
            // when the sizes are all non zero and big 
            (num_rows*num_cols*get_sizeof_helper<T>::val >  max_stack_based_size) && (num_rows != 0 && num_cols != 0),
            num_rows == 0 && num_cols != 0,
            num_rows != 0 && num_cols == 0,
            num_rows == 0 && num_cols == 0
            >::value
            >
        class layout ;
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object represents the actual allocation of space for a matrix.
                Small matrices allocate all their data on the stack and bigger ones
                use a memory_manager to get their memory.
        !*/

    // ------------------------------------------------------------------------------------

        template <
            typename T,
            long num_rows,
            long num_cols,
            typename mem_manager
            >
        class layout<T,num_rows,num_cols,mem_manager,1> : noncopyable // when the sizes are all non zero and small
        {
        public:
            const static long NR = num_rows;
            const static long NC = num_cols;

            layout() {}

            T& operator() (
                long r, 
                long c
            ) { return data[r][c]; }

            const T& operator() (
                long r, 
                long c
            ) const { return data[r][c]; }

            T& operator() (
                long i 
            ) { return *(*data + i); }

            const T& operator() (
                long i
            ) const { return *(*data + i); }

            void swap(
                layout& item
            )
            {
                for (long r = 0; r < num_rows; ++r)
                {
                    for (long c = 0; c < num_cols; ++c)
                    {
                        exchange((*this)(r,c),item(r,c));
                    }
                }
            }

            long nr (
            ) const { return num_rows; }

            long nc (
            ) const { return num_cols; }

            void set_size (
                long ,
                long 
            )
            {
            }

        private:
            T data[num_rows][num_cols];
        };

    // ------------------------------------------------------------------------------------

        template <
            typename T,
            long num_rows,
            long num_cols,
            typename mem_manager
            >
        class layout<T,num_rows,num_cols,mem_manager,2> : noncopyable // when the sizes are all non zero and big 
        {
        public:
            const static long NR = num_rows;
            const static long NC = num_cols;

            layout (
            ) { data = pool.allocate_array(num_rows*num_cols); }

            ~layout ()
            { pool.deallocate_array(data); }

            T& operator() (
                long r, 
                long c
            ) { return data[r*num_cols + c]; }

            const T& operator() (
                long r, 
                long c
            ) const { return data[r*num_cols + c]; }

            T& operator() (
                long i 
            ) { return data[i]; }

            const T& operator() (
                long i 
            ) const { return data[i]; }

            void swap(
                layout& item
            )
            {
                std::swap(item.data,data);
                pool.swap(item.pool);
            }

            long nr (
            ) const { return num_rows; }

            long nc (
            ) const { return num_cols; }

            void set_size (
                long ,
                long 
            )
            {
            }

        private:

            T* data;
            typename mem_manager::template rebind<T>::other pool;
            };

    // ------------------------------------------------------------------------------------

        template <
            typename T,
            long num_rows,
            long num_cols,
            typename mem_manager
            >
        class layout<T,num_rows,num_cols,mem_manager,3> : noncopyable // when num_rows == 0 && num_cols != 0,
        {
        public:
            const static long NR = num_rows;
            const static long NC = num_cols;

            layout (
            ):data(0), nr_(0) { }

            ~layout ()
            { 
                if (data) 
                    pool.deallocate_array(data); 
            }

            T& operator() (
                long r, 
                long c
            ) { return data[r*num_cols + c]; }

            const T& operator() (
                long r, 
                long c
            ) const { return data[r*num_cols + c]; }

            T& operator() (
                long i 
            ) { return data[i]; }

            const T& operator() (
                long i 
            ) const { return data[i]; }

            void swap(
                layout& item
            )
            {
                std::swap(item.data,data);
                std::swap(item.nr_,nr_);
                pool.swap(item.pool);
            }

            long nr (
            ) const { return nr_; }

            long nc (
            ) const { return num_cols; }

            void set_size (
                long nr,
                long nc
            )
            {
                if (data) 
                {
                    pool.deallocate_array(data);
                }
                data = pool.allocate_array(nr*nc);
                nr_ = nr;
            }

        private:

            T* data;
            long nr_;
            typename mem_manager::template rebind<T>::other pool;
            };

    // ------------------------------------------------------------------------------------

        template <
            typename T,
            long num_rows,
            long num_cols,
            typename mem_manager
            >
        class layout<T,num_rows,num_cols,mem_manager,4> : noncopyable // when num_rows != 0 && num_cols == 0
        {
        public:
            const static long NR = num_rows;
            const static long NC = num_cols;

            layout (
            ):data(0), nc_(0) { }

            ~layout ()
            { 
                if (data) 
                {
                    pool.deallocate_array(data);
                }
            }

            T& operator() (
                long r, 
                long c
            ) { return data[r*nc_ + c]; }

            const T& operator() (
                long r, 
                long c
            ) const { return data[r*nc_ + c]; }

            T& operator() (
                long i 
            ) { return data[i]; }

            const T& operator() (
                long i 
            ) const { return data[i]; }

            void swap(
                layout& item
            )
            {
                std::swap(item.data,data);
                std::swap(item.nc_,nc_);
                pool.swap(item.pool);
            }

            long nr (
            ) const { return num_rows; }

            long nc (
            ) const { return nc_; }

            void set_size (
                long nr,
                long nc
            )
            {
                if (data) 
                {
                    pool.deallocate_array(data);
                }
                data = pool.allocate_array(nr*nc);
                nc_ = nc;
            }

        private:

            T* data;
            long nc_;
            typename mem_manager::template rebind<T>::other pool;
            };

    // ------------------------------------------------------------------------------------

        template <
            typename T,
            long num_rows,
            long num_cols,
            typename mem_manager
            >
        class layout<T,num_rows,num_cols,mem_manager,5> : noncopyable // when num_rows == 0 && num_cols == 0
        {
        public:
            const static long NR = num_rows;
            const static long NC = num_cols;

            layout (
            ):data(0), nr_(0), nc_(0) { }

            ~layout ()
            { 
                if (data) 
                {
                    pool.deallocate_array(data);
                }
            }

            T& operator() (
                long r, 
                long c
            ) { return data[r*nc_ + c]; }

            const T& operator() (
                long r, 
                long c
            ) const { return data[r*nc_ + c]; }

            T& operator() (
                long i 
            ) { return data[i]; }

            const T& operator() (
                long i 
            ) const { return data[i]; }

            void swap(
                layout& item
            )
            {
                std::swap(item.data,data);
                std::swap(item.nc_,nc_);
                std::swap(item.nr_,nr_);
                pool.swap(item.pool);
            }

            long nr (
            ) const { return nr_; }

            long nc (
            ) const { return nc_; }

            void set_size (
                long nr,
                long nc
            )
            {
                if (data) 
                {
                    pool.deallocate_array(data);
                }
                data = pool.allocate_array(nr*nc);
                nr_ = nr;
                nc_ = nc;
            }

        private:
            T* data;
            long nr_;
            long nc_;
            typename mem_manager::template rebind<T>::other pool;
            };

    };

// ----------------------------------------------------------------------------------------

    struct column_major_layout
    {
        // if a matrix is bigger than this many bytes then don't put it on the stack
        const static size_t max_stack_based_size = 256;


        // this is a hack to avoid a compile time error in visual studio 8.  I would just 
        // use sizeof(T) and be done with it but that won't compile.  The idea here 
        // is to avoid using the stack allocation of the layout object if it 
        // is going to contain another matrix and also avoid asking for the sizeof()
        // the contained matrix.
        template <typename T>
        struct get_sizeof_helper
        {
            const static std::size_t val = sizeof(T);
        };

        template <typename T, long NR, long NC, typename mm, typename l>
        struct get_sizeof_helper<matrix<T,NR,NC,mm,l> >
        {
            const static std::size_t val = 1000000;
        };

        template <
            typename T,
            long num_rows,
            long num_cols,
            typename mem_manager,
            int val = static_switch <
                // when the sizes are all non zero and small
                (num_rows*num_cols*get_sizeof_helper<T>::val <= max_stack_based_size) && (num_rows != 0 && num_cols != 0),
            // when the sizes are all non zero and big 
            (num_rows*num_cols*get_sizeof_helper<T>::val > max_stack_based_size) && (num_rows != 0 && num_cols != 0),
            num_rows == 0 && num_cols != 0,
            num_rows != 0 && num_cols == 0,
            num_rows == 0 && num_cols == 0
            >::value
            >
        class layout ;
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object represents the actual allocation of space for a matrix.
                Small matrices allocate all their data on the stack and bigger ones
                use a memory_manager to get their memory.
        !*/

    // ------------------------------------------------------------------------------------

        template <
            typename T,
            long num_rows,
            long num_cols,
            typename mem_manager
            >
        class layout<T,num_rows,num_cols,mem_manager,1> : noncopyable // when the sizes are all non zero and small
        {
        public:
            const static long NR = num_rows;
            const static long NC = num_cols;

            layout() {}

            T& operator() (
                long r, 
                long c
            ) { return data[c][r]; }

            const T& operator() (
                long r, 
                long c
            ) const { return data[c][r]; }

            T& operator() (
                long i 
            ) { return *(*data + i); }

            const T& operator() (
                long i
            ) const { return *(*data + i); }

            void swap(
                layout& item
            )
            {
                for (long r = 0; r < num_rows; ++r)
                {
                    for (long c = 0; c < num_cols; ++c)
                    {
                        exchange((*this)(r,c),item(r,c));
                    }
                }
            }

            long nr (
            ) const { return num_rows; }

            long nc (
            ) const { return num_cols; }

            void set_size (
                long,
                long 
            )
            {
            }

        private:
            T data[num_cols][num_rows];
        };

    // ------------------------------------------------------------------------------------

        template <
            typename T,
            long num_rows,
            long num_cols,
            typename mem_manager
            >
        class layout<T,num_rows,num_cols,mem_manager,2> : noncopyable // when the sizes are all non zero and big 
        {
        public:
            const static long NR = num_rows;
            const static long NC = num_cols;

            layout (
            ) { data = pool.allocate_array(num_rows*num_cols); }

            ~layout ()
            { pool.deallocate_array(data); }

            T& operator() (
                long r, 
                long c
            ) { return data[c*num_rows + r]; }

            const T& operator() (
                long r, 
                long c
            ) const { return data[c*num_rows + r]; }

            T& operator() (
                long i 
            ) { return data[i]; }

            const T& operator() (
                long i 
            ) const { return data[i]; }

            void swap(
                layout& item
            )
            {
                std::swap(item.data,data);
                pool.swap(item.pool);
            }

            long nr (
            ) const { return num_rows; }

            long nc (
            ) const { return num_cols; }

            void set_size (
                long ,
                long 
            )
            {
            }

        private:

            T* data;
            typename mem_manager::template rebind<T>::other pool;
            };

    // ------------------------------------------------------------------------------------

        template <
            typename T,
            long num_rows,
            long num_cols,
            typename mem_manager
            >
        class layout<T,num_rows,num_cols,mem_manager,3> : noncopyable // when num_rows == 0 && num_cols != 0,
        {
        public:
            const static long NR = num_rows;
            const static long NC = num_cols;

            layout (
            ):data(0), nr_(0) { }

            ~layout ()
            { 
                if (data) 
                    pool.deallocate_array(data); 
            }

            T& operator() (
                long r, 
                long c
            ) { return data[c*nr_ + r]; }

            const T& operator() (
                long r, 
                long c
            ) const { return data[c*nr_ + r]; }

            T& operator() (
                long i 
            ) { return data[i]; }

            const T& operator() (
                long i 
            ) const { return data[i]; }

            void swap(
                layout& item
            )
            {
                std::swap(item.data,data);
                std::swap(item.nr_,nr_);
                pool.swap(item.pool);
            }

            long nr (
            ) const { return nr_; }

            long nc (
            ) const { return num_cols; }

            void set_size (
                long nr,
                long nc
            )
            {
                if (data) 
                {
                    pool.deallocate_array(data);
                }
                data = pool.allocate_array(nr*nc);
                nr_ = nr;
            }

        private:

            T* data;
            long nr_;
            typename mem_manager::template rebind<T>::other pool;
            };

    // ------------------------------------------------------------------------------------

        template <
            typename T,
            long num_rows,
            long num_cols,
            typename mem_manager
            >
        class layout<T,num_rows,num_cols,mem_manager,4> : noncopyable // when num_rows != 0 && num_cols == 0
        {
        public:
            const static long NR = num_rows;
            const static long NC = num_cols;

            layout (
            ):data(0), nc_(0) { }

            ~layout ()
            { 
                if (data) 
                {
                    pool.deallocate_array(data);
                }
            }

            T& operator() (
                long r, 
                long c
            ) { return data[c*num_rows + r]; }

            const T& operator() (
                long r, 
                long c
            ) const { return data[c*num_rows + r]; }

            T& operator() (
                long i 
            ) { return data[i]; }

            const T& operator() (
                long i 
            ) const { return data[i]; }

            void swap(
                layout& item
            )
            {
                std::swap(item.data,data);
                std::swap(item.nc_,nc_);
                pool.swap(item.pool);
            }

            long nr (
            ) const { return num_rows; }

            long nc (
            ) const { return nc_; }

            void set_size (
                long nr,
                long nc
            )
            {
                if (data) 
                {
                    pool.deallocate_array(data);
                }
                data = pool.allocate_array(nr*nc);
                nc_ = nc;
            }

        private:

            T* data;
            long nc_;
            typename mem_manager::template rebind<T>::other pool;
            };

    // ------------------------------------------------------------------------------------

        template <
            typename T,
            long num_rows,
            long num_cols,
            typename mem_manager
            >
        class layout<T,num_rows,num_cols,mem_manager,5> : noncopyable // when num_rows == 0 && num_cols == 0
        {
        public:
            const static long NR = num_rows;
            const static long NC = num_cols;

            layout (
            ):data(0), nr_(0), nc_(0) { }

            ~layout ()
            { 
                if (data) 
                {
                    pool.deallocate_array(data);
                }
            }

            T& operator() (
                long r, 
                long c
            ) { return data[c*nr_ + r]; }

            const T& operator() (
                long r, 
                long c
            ) const { return data[c*nr_ + r]; }

            T& operator() (
                long i 
            ) { return data[i]; }

            const T& operator() (
                long i 
            ) const { return data[i]; }

            void swap(
                layout& item
            )
            {
                std::swap(item.data,data);
                std::swap(item.nc_,nc_);
                std::swap(item.nr_,nr_);
                pool.swap(item.pool);
            }

            long nr (
            ) const { return nr_; }

            long nc (
            ) const { return nc_; }

            void set_size (
                long nr,
                long nc
            )
            {
                if (data) 
                {
                    pool.deallocate_array(data);
                }
                data = pool.allocate_array(nr*nc);
                nr_ = nr;
                nc_ = nc;
            }

        private:
            T* data;
            long nr_;
            long nc_;
            typename mem_manager::template rebind<T>::other pool;
            };

    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_MATRIx_DATA_LAYOUT_

