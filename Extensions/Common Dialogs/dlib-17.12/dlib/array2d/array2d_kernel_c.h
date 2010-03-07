// Copyright (C) 2006  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_ARRAY2D_KERNEl_C_
#define DLIB_ARRAY2D_KERNEl_C_

#include "array2d_kernel_abstract.h"
#include "../algs.h"
#include "../assert.h"
#include "../interfaces/enumerable.h"

namespace dlib
{


    template <
        typename array2d_base // is an implementation of array2d_kernel_abstract.h
        >
    class array2d_kernel_c : public enumerable<typename array2d_base::type> 
    {

        /*!
            CONVENTION
                - if (obj.size() > 0) then
                    - rows == an array of size obj.nr() row objects and
                      each row object in the array has a valid pointer to its
                      associated row in obj.
                  - else
                    - rows == 0

        !*/

        typedef typename array2d_base::type T;
    public:
        typedef typename array2d_base::type type;
        typedef typename array2d_base::mem_manager_type mem_manager_type;


        // -----------------------------------

        class row 
        {

            friend class array2d_kernel_c;
        public:
            long nc (
            ) const { return data->nc(); }

            const T& operator[] (
                long column
            ) const;

            T& operator[] (
                long column
            );

        private:

            typename array2d_base::row* data; 

            // restricted functions
            row(){}
            row(row&);
            row& operator=(row&);
        };

        // -----------------------------------

        array2d_kernel_c (
        ) : 
            rows(0)
        {
        }

        virtual ~array2d_kernel_c (
        ) { clear(); }

        long nc (
        ) const { return obj.nc(); }

        long nr (
        ) const { return obj.nr(); }

        row& operator[] (
            long row
        );

        const row& operator[] (
            long row
        ) const; 

        void swap (
            array2d_kernel_c& item
        )
        {
            exchange(obj,item.obj);
            exchange(rows,item.rows);
        }

        void clear (
        )
        {
            obj.clear();
            if (rows != 0)
            {
                delete [] rows;
                rows = 0;
            }
        }

        void set_size (
            long nr__,
            long nc__
        );

        bool at_start (
        ) const { return obj.at_start();; }

        void reset (
        ) const { obj.reset(); }

        bool current_element_valid (
        ) const { return obj.current_element_valid(); }

        const T& element (
        ) const;

        T& element (
        ); 

        bool move_next (
        ) const { return obj.move_next(); }

        unsigned long size (
        ) const { return obj.size(); }

    private:

        array2d_base obj;
        row* rows;

    };

    template <
        typename array2d_base
        >
    inline void swap (
        array2d_kernel_c<array2d_base>& a, 
        array2d_kernel_c<array2d_base>& b 
    ) { a.swap(b); }


    template <
        typename array2d_base
        >
    void serialize (
        const array2d_kernel_c<array2d_base>& item, 
        std::ostream& out 
    )   
    {
        try
        {
            serialize(item.nc(),out);
            serialize(item.nr(),out);

            item.reset();
            while (item.move_next())
                serialize(item.element(),out);
            item.reset();
        }
        catch (serialization_error e)
        { 
            throw serialization_error(e.info + "\n   while serializing object of type array2d_kernel_c"); 
        }
    }

    template <
        typename array2d_base
        >
    void deserialize (
        array2d_kernel_c<array2d_base>& item, 
        std::istream& in
    )   
    {
        try
        {
            long nc, nr;
            deserialize(nc,in);
            deserialize(nr,in);

            item.set_size(nr,nc);

            while (item.move_next())
                deserialize(item.element(),in); 
            item.reset();
        }
        catch (serialization_error e)
        { 
            item.clear();
            throw serialization_error(e.info + "\n   while deserializing object of type array2d_kernel_c"); 
        }
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename array2d_base
        >
    const typename array2d_base::type& array2d_kernel_c<array2d_base>::
    element (
    ) const
    {
        // make sure requires clause is not broken
        DLIB_CASSERT(current_element_valid() == true,
               "\tT& array2d::element()()"
               << "\n\tYou can only call element() when you are at a valid one."
               << "\n\tthis:    " << this
        );

        return obj.element();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename array2d_base
        >
    typename array2d_base::type& array2d_kernel_c<array2d_base>::
    element (
    ) 
    {
        // make sure requires clause is not broken
        DLIB_CASSERT(current_element_valid() == true,
               "\tT& array2d::element()()"
               << "\n\tYou can only call element() when you are at a valid one."
               << "\n\tthis:    " << this
        );

        return obj.element();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename array2d_base
        >
    void array2d_kernel_c<array2d_base>::
    set_size (
        long nr_,
        long nc_
    )
    {
        // make sure requires clause is not broken
        DLIB_CASSERT((nc_ > 0 && nr_ > 0) ||
                (nc_ == 0 && nr_ == 0),
               "\tvoid array2d::set_size(long nr_, long nc_)"
               << "\n\tYou have to give a non zero nc and nr or just make both zero."
               << "\n\tthis:    " << this
               << "\n\tnc_:  " << nc_ 
               << "\n\tnr_: " << nr_ 
        );

        obj.set_size(nr_,nc_);

        // set up the rows array
        if (rows != 0)
            delete [] rows;

        try
        {
            rows = new row[obj.nr()];
        }
        catch (...)
        {
            rows = 0;
            obj.clear();
            throw;
        }

        for (long i = 0; i < obj.nr(); ++i)
        {
            rows[i].data = &obj[i];
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename array2d_base
        >
    typename array2d_kernel_c<array2d_base>::row& array2d_kernel_c<array2d_base>::
    operator[] (
        long row
    )
    {
        // make sure requires clause is not broken
        DLIB_CASSERT(row < nr() && row >= 0,
               "\trow& array2d::operator[](long row)"
               << "\n\tThe row index given must be less than the number of rows."
               << "\n\tthis:     " << this
               << "\n\trow:      " << row 
               << "\n\tnr(): " << nr()
        );

        return rows[row];
    }

// ----------------------------------------------------------------------------------------

    template <
        typename array2d_base
        >
    const typename array2d_kernel_c<array2d_base>::row& array2d_kernel_c<array2d_base>::
    operator[] (
        long row
    ) const
    {
        // make sure requires clause is not broken
        DLIB_CASSERT(row < nr() && row >= 0,
               "\tconst row& array2d::operator[](long row) const"
               << "\n\tThe row index given must be less than the number of rows."
               << "\n\tthis:     " << this
               << "\n\trow:      " << row 
               << "\n\tnr(): " << nr()
        );

        return rows[row];
    }

// ----------------------------------------------------------------------------------------

    template <
        typename array2d_base
        >
    const typename array2d_base::type& array2d_kernel_c<array2d_base>::row::
    operator[] (
        long column
    ) const
    {
        // make sure requires clause is not broken
        DLIB_CASSERT(column < nc() && column >= 0,
               "\tconst T& array2d::operator[](long column) const"
               << "\n\tThe column index given must be less than the number of columns."
               << "\n\tthis:    " << this
               << "\n\tcolumn:  " << column 
               << "\n\tnc(): " << nc()
        );

        return (*data)[column];
    }

// ----------------------------------------------------------------------------------------

    template <
        typename array2d_base
        >
    typename array2d_base::type& array2d_kernel_c<array2d_base>::row::
    operator[] (
        long column
    )
    {
        // make sure requires clause is not broken
        DLIB_CASSERT(column < nc() && column >= 0,
               "\tT& array2d::operator[](long column)"
               << "\n\tThe column index given must be less than the number of columns."
               << "\n\tthis:    " << this
               << "\n\tcolumn:  " << column 
               << "\n\tnc(): " << nc()
        );

        return (*data)[column];
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_ARRAY2D_KERNEl_C_

