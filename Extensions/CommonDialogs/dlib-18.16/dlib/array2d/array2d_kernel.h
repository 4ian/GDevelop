// Copyright (C) 2006  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_ARRAY2D_KERNEl_1_
#define DLIB_ARRAY2D_KERNEl_1_

#include "array2d_kernel_abstract.h"
#include "../algs.h"
#include "../interfaces/enumerable.h"
#include "../serialize.h"
#include "../geometry/rectangle.h"

namespace dlib
{
    template <
        typename T,
        typename mem_manager = default_memory_manager
        >
    class array2d : public enumerable<T>
    {

        /*!
            INITIAL VALUE
                - nc_ == 0 
                - nr_ == 0 
                - data == 0 
                - at_start_ == true
                - cur == 0
                - last == 0

            CONVENTION
                - nc_ == nc() 
                - nr_ == nc() 
                - if (data != 0) then
                    - last == a pointer to the last element in the data array
                    - data == pointer to an array of nc_*nr_ T objects 
                - else
                    - nc_ == 0
                    - nr_ == 0
                    - data == 0
                    - last == 0


                - nr_ * nc_ == size()
                - if (cur == 0) then
                    - current_element_valid() == false
                - else 
                    - current_element_valid() == true
                    - *cur == element()

                - at_start_ == at_start()      
        !*/


        class row_helper;
    public:

        // These typedefs are here for backwards compatibility with older versions of dlib.
        typedef array2d kernel_1a;
        typedef array2d kernel_1a_c;
         
        typedef T type;
        typedef mem_manager mem_manager_type;

        // -----------------------------------

        class row 
        {
            /*!
                CONVENTION
                    - nc_ == nc()
                    - for all x < nc_:
                        - (*this)[x] == data[x]
            !*/

            friend class array2d;
            friend class row_helper;

        public:
            long nc (
            ) const { return nc_; }

            const T& operator[] (
                long column
            ) const 
            { 
                // make sure requires clause is not broken
                DLIB_ASSERT(column < nc() && column >= 0,
                    "\tconst T& array2d::operator[](long column) const"
                    << "\n\tThe column index given must be less than the number of columns."
                    << "\n\tthis:    " << this
                    << "\n\tcolumn:  " << column 
                    << "\n\tnc(): " << nc()
                );

                return data[column]; 
            }

            T& operator[] (
                long column
            ) 
            { 
                // make sure requires clause is not broken
                DLIB_ASSERT(column < nc() && column >= 0,
                    "\tT& array2d::operator[](long column)"
                    << "\n\tThe column index given must be less than the number of columns."
                    << "\n\tthis:    " << this
                    << "\n\tcolumn:  " << column 
                    << "\n\tnc(): " << nc()
                );

                return data[column]; 
            }

        private:

            row(T* data_, long cols) : data(data_), nc_(cols) {}

            T* data; 
            long nc_;


            // restricted functions
            row(){}
            row& operator=(row&);
        };

        // -----------------------------------

        array2d (
        ) : 
            data(0),
            nc_(0),
            nr_(0),
            cur(0),
            last(0),
            at_start_(true)
        {
        }

        array2d(
            long rows,
            long cols
        ) : 
            data(0),
            nc_(0),
            nr_(0),
            cur(0),
            last(0),
            at_start_(true)
        {
            // make sure requires clause is not broken
            DLIB_ASSERT((cols >= 0 && rows >= 0),
                        "\t array2d::array2d(long rows, long cols)"
                        << "\n\t The array2d can't have negative rows or columns."
                        << "\n\t this: " << this
                        << "\n\t cols: " << cols 
                        << "\n\t rows: " << rows 
            );

            set_size(rows,cols);
        }

        virtual ~array2d (
        ) { clear(); }

        long nc (
        ) const { return nc_; }

        long nr (
        ) const { return nr_; }

        row operator[] (
            long row_
        ) 
        { 
            // make sure requires clause is not broken
            DLIB_ASSERT(row_ < nr() && row_ >= 0,
                "\trow array2d::operator[](long row_)"
                << "\n\tThe row index given must be less than the number of rows."
                << "\n\tthis:     " << this
                << "\n\trow_:      " << row_ 
                << "\n\tnr(): " << nr()
                );

            return row(data+row_*nc_, nc_);
        }

        const row operator[] (
            long row_
        ) const 
        { 
            // make sure requires clause is not broken
            DLIB_ASSERT(row_ < nr() && row_ >= 0,
                "\tconst row array2d::operator[](long row_) const"
                << "\n\tThe row index given must be less than the number of rows."
                << "\n\tthis:     " << this
                << "\n\trow_:      " << row_ 
                << "\n\tnr(): " << nr()
            );

            return row(data+row_*nc_, nc_);
        }

        void swap (
            array2d& item
        )
        {
            exchange(data,item.data);
            exchange(nr_,item.nr_);
            exchange(nc_,item.nc_);
            exchange(at_start_,item.at_start_);
            exchange(cur,item.cur);
            exchange(last,item.last);
            pool.swap(item.pool);
        }

        void clear (
        )
        {
            if (data != 0)
            {
                pool.deallocate_array(data);
                nc_ = 0;
                nr_ = 0;
                data = 0;
                at_start_ = true;
                cur = 0;
                last = 0;
            }
        }

        void set_size (
            long rows,
            long cols
        );

        bool at_start (
        ) const { return at_start_; }

        void reset (
        ) const { at_start_ = true; cur = 0; }

        bool current_element_valid (
        ) const { return (cur != 0); }

        const T& element (
        ) const 
        { 
            // make sure requires clause is not broken
            DLIB_ASSERT(current_element_valid() == true,
                "\tconst T& array2d::element()()"
                << "\n\tYou can only call element() when you are at a valid one."
                << "\n\tthis:    " << this
            );

            return *cur; 
        }

        T& element (
        ) 
        { 
            // make sure requires clause is not broken
            DLIB_ASSERT(current_element_valid() == true,
                         "\tT& array2d::element()()"
                         << "\n\tYou can only call element() when you are at a valid one."
                         << "\n\tthis:    " << this
            );

            return *cur; 
        }

        bool move_next (
        ) const
        {
            if (cur != 0)
            {
                if (cur != last)
                {
                    ++cur;
                    return true;
                }
                cur = 0;
                return false;
            }
            else if (at_start_)
            {
                cur = data;
                at_start_ = false;
                return (data != 0);
            }
            else
            {
                return false;
            }
        }

        unsigned long size (
        ) const { return static_cast<unsigned long>(nc_ * nr_); }

        long width_step (
        ) const
        {
            return nc_*sizeof(T);
        }

    private:


        T* data;
        long nc_;
        long nr_;

        typename mem_manager::template rebind<T>::other pool;
        mutable T* cur;
        T* last;
        mutable bool at_start_;

        // restricted functions
        array2d(array2d&);        // copy constructor
        array2d& operator=(array2d&);    // assignment operator

    };

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    inline void swap (
        array2d<T,mem_manager>& a, 
        array2d<T,mem_manager>& b 
    ) { a.swap(b); }   


    template <
        typename T,
        typename mem_manager
        >
    void serialize (
        const array2d<T,mem_manager>& item, 
        std::ostream& out 
    )   
    {
        try
        {
            // The reason the serialization is a little funny is because we are trying to
            // maintain backwards compatibility with an older serialization format used by
            // dlib while also encoding things in a way that lets the array2d and matrix
            // objects have compatible serialization formats.
            serialize(-item.nr(),out);
            serialize(-item.nc(),out);

            item.reset();
            while (item.move_next())
                serialize(item.element(),out);
            item.reset();
        }
        catch (serialization_error e)
        { 
            throw serialization_error(e.info + "\n   while serializing object of type array2d"); 
        }
    }

    template <
        typename T,
        typename mem_manager
        >
    void deserialize (
        array2d<T,mem_manager>& item, 
        std::istream& in
    )   
    {
        try
        {
            long nr, nc;
            deserialize(nr,in);
            deserialize(nc,in);

            // this is the newer serialization format
            if (nr < 0 || nc < 0)
            {
                nr *= -1;
                nc *= -1;
            }
            else
            {
                std::swap(nr,nc);
            }

            item.set_size(nr,nc);

            while (item.move_next())
                deserialize(item.element(),in); 
            item.reset();
        }
        catch (serialization_error e)
        { 
            item.clear();
            throw serialization_error(e.info + "\n   while deserializing object of type array2d"); 
        }
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    void array2d<T,mem_manager>::
    set_size (
        long rows,
        long cols
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT((cols >= 0 && rows >= 0) ,
               "\tvoid array2d::set_size(long rows, long cols)"
               << "\n\tThe array2d can't have negative rows or columns."
               << "\n\tthis: " << this
               << "\n\tcols: " << cols 
               << "\n\trows: " << rows 
        );

        // set the enumerator back at the start
        at_start_ = true;
        cur = 0;

        // don't do anything if we are already the right size.
        if (nc_ == cols && nr_ == rows)
        {
            return;
        }

        nc_ = cols;
        nr_ = rows;

        // free any existing memory
        if (data != 0)
        {
            pool.deallocate_array(data);
            data = 0;
        }

        // now setup this object to have the new size
        try
        {
            if (nr_ > 0)
            {
                data = pool.allocate_array(nr_*nc_);
                last = data + nr_*nc_ - 1;
            }
        }
        catch (...)
        {
            if (data)
                pool.deallocate_array(data);

            data = 0;
            nc_ = 0;
            nr_ = 0;
            last = 0;
            throw;
        }
    }

// ----------------------------------------------------------------------------------------

    template <typename T, typename MM>
    struct is_array2d <array2d<T,MM> >  
    {
        const static bool value = true;
    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_ARRAY2D_KERNEl_1_ 

