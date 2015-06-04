// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_SQLiTE_ABSTRACT_H_
#ifdef DLIB_SQLiTE_ABSTRACT_H_


#include <iostream>
#include <vector>
#include "../algs.h"
#include <sqlite3.h>
#include "../smart_pointers.h"

// ----------------------------------------------------------------------------------------

namespace dlib
{

// ----------------------------------------------------------------------------------------

    struct sqlite_error : public error
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This is the exception object used by the SQLite tools to indicate
                that an error has occurred.  Any of the functions defined in this
                file might throw this exception.
        !*/
    };

// ----------------------------------------------------------------------------------------

    class database : noncopyable
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object is a C++ wrapper around a SQLite database connection 
                handle and therefore represents a SQLite database file. 

                Note that this wrapper is targeted at SQLite Version 3.

                Note also that whenever SQLite indicates an error has occurred 
                this object will throw the sqlite_error exception.
        !*/

    public:
        database(
        ); 
        /*!
            ensures
                - #is_open() == false
        !*/

        database (
            const std::string& file
        );
        /*!
            ensures
                - opens the indicated database file or creates a new
                  database with the given name if one doesn't already exist.
                - #get_database_filename() == file
                - #is_open() == true
        !*/

        ~database (
        );
        /*!
            ensures
                - safely disposes of any SQLite database connection.  If
                  any statement objects still exist which reference this database
                  then the SQLite database connection won't be fully closed
                  until those statement objects are also destroyed.  This allows
                  for any destruction order between database and statement objects.
        !*/

        void open (
            const std::string& file
        );
        /*!
            ensures
                - opens the indicated database file or creates a new
                  database with the given name if one doesn't already exist.
                - #get_database_filename() == file
                - #is_open() == true
                - safely disposes of any previous SQLite database connection.  If
                  any statement objects still exist which reference this database
                  then the SQLite database connection won't be fully closed
                  until those statement objects are also destroyed.  
        !*/

        bool is_open (
        ) const;
        /*!
            ensures
                - if (this object has an open connection to a SQLite database) then
                    - returns true
                - else
                    - returns false
        !*/

        const std::string& get_database_filename (
        ) const;
        /*!
            requires
                - is_open() == true
            ensures
                - returns the name of the SQLite database file this object
                  currently has open.
        !*/

        void exec (
            const std::string& sql_statement
        );
        /*!
            requires
                - is_open() == true
            ensures
                - executes the supplied SQL statement against this database
        !*/

        int64 last_insert_rowid (
        ) const;
        /*!
            requires
                - is_open() == true
            ensures
                - Each element in a database table has a rowid which uniquely identifies
                  it.  Therefore, this routine returns the rowid of the most recent
                  successful INSERT into the database via this database instance.  
                - If an INSERT has not been performed on the current database instance then
                  the return value is 0.  This is true even if the database is not empty.
                - See the sqlite documentation for the full details on how this function
                  behaves: http://www.sqlite.org/c3ref/last_insert_rowid.html
        !*/
    };

// ----------------------------------------------------------------------------------------

    class statement : noncopyable
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object represents a SQL statement which can be executed
                against a database object.  In particular, this object is a
                C++ wrapper around a SQLite prepared statement.


                Note that whenever SQLite indicates an error has occurred this 
                object will throw the sqlite_error exception.

            BINDABLE SQL PARAMETERS
                Sometimes you want to execute a bunch of very similar SQL statements.
                For example, you might need to execute many insert statements where each
                statement changes only the value of a field.  Since it is somewhat
                costly to construct a statement object for each SQL operation, SQLite
                supports defining bindable parameters for a statement object.  This allows
                you to reuse the same statement object.  
                
                Therefore, in SQL statements used with SQLite, wherever it is valid to 
                include a string literal, one can use a parameter in one of the following 
                forms:

                    ?
                    ?NNN
                    :AAA
                    $AAA
                    @AAA

               In the examples above, NNN is an integer value and AAA is an identifier.  A 
               parameter initially has a value of NULL.  You can use the bind_*() routines
               to attach values to the parameters.  Each call to a bind_*() routine overrides 
               prior bindings on the same parameter.

               Each SQL parameter has a numeric ID which is used to reference it when invoking
               a bind_*() routine.  The leftmost SQL parameter in a statement has an index of 1,
               the next parameter has an index of 2, and so on, except when the following rules
               apply.  When the same named SQL parameter is used more than once, second and 
               subsequent occurrences have the same index as the first occurrence.  The index 
               for named parameters can be looked up using the get_parameter_id() method if desired.  
               The index for "?NNN" parameters is the value of NNN. The NNN value must be between 
               1 and get_max_parameter_id().
        !*/

    public:
        statement (
            database& db,
            const std::string sql_statement
        );
        /*!
            requires
                - db.is_open() == true
            ensures
                - The given SQL statement can be executed against the given 
                  database by calling exec().
                - #get_sql_string() == sql_statement
        !*/

        ~statement(
        );
        /*!
            ensures
                - any resources associated with this object have been freed.
        !*/

        const std::string& get_sql_string (
        ) const;
        /*!
            ensures
                - returns a copy of the SQL statement used to create this statement object.
        !*/

        void exec(
        );
        /*!
            ensures
                - #get_num_columns() == 0
                - executes the SQL statement get_sql_string() against the database
                  given to this object's constructor.
                - If this was a select statement then you can obtain the resulting
                  rows by calling move_next() and using the get_column_as_*() member
                  functions.
        !*/

    // ----------------------------

        bool move_next (
        );
        /*!
            ensures
                - if (there is a result row for this query) then
                    - #get_num_columns() == the number of columns in the result row.
                    - The get_column_as_*() routines can be used to access the elements 
                      of the row data.
                    - returns true
                - else
                    - returns false
                    - #get_num_columns() == 0
        !*/

        unsigned long get_num_columns(
        ) const;
        /*!
            ensures
                - returns the number of columns of data available via the get_column_as_*() 
                  routines.
        !*/

        template <
            typename T
            >
        void get_column (
            unsigned long idx,
            T& item
        ) const;
        /*!
            requires
                - idx < get_num_columns()
            ensures
                - This function automatically selects how to extract the column data based
                  on the type of item given. In particular:
                    - if (T is a 32bit or smaller built in integer type) then
                        - #item == get_column_as_int(idx)
                    - else if (T is a 64bit built in integer type) then
                        - #item == get_column_as_int64(idx)
                    - else if (T is float, double, or long double) then
                        - #item == get_column_as_double(idx)
                    - else if (T is std::string) then
                        - #item == get_column_as_text(idx)
                    - else
                        - invokes: get_column_as_object(idx, item)
        !*/

        const std::vector<char> get_column_as_blob (
            unsigned long idx
        ) const;
        /*!
            requires
                - idx < get_num_columns()
            ensures
                - returns the contents of the idx-th column as a binary BLOB.
        !*/

        template <
            typename T
            >
        void get_column_as_object (
            unsigned long idx,
            T& item
        ) const;
        /*!
            requires
                - idx < get_num_columns()
                - item is deserializable 
                  (i.e. Calling deserialize(item, some_input_stream) reads an item
                  of type T from the some_input_stream stream)
            ensures
                - gets the contents of the idx-th column as a binary BLOB and then
                  deserializes it into item.
        !*/

        const std::string get_column_as_text (
            unsigned long idx
        ) const;
        /*!
            requires
                - idx < get_num_columns()
            ensures
                - returns the contents of the idx-th column as a text string. 
        !*/

        double get_column_as_double (
            unsigned long idx
        ) const;
        /*!
            requires
                - idx < get_num_columns()
            ensures
                - returns the contents of the idx-th column as a double. 
        !*/

        int get_column_as_int (
            unsigned long idx
        ) const;
        /*!
            requires
                - idx < get_num_columns()
            ensures
                - returns the contents of the idx-th column as an int. 
        !*/

        int64 get_column_as_int64 (
            unsigned long idx
        ) const;
        /*!
            requires
                - idx < get_num_columns()
            ensures
                - returns the contents of the idx-th column as a 64bit int. 
        !*/

        const std::string get_column_name (
            unsigned long idx
        ) const;
        /*!
            requires
                - idx < get_num_columns()
            ensures
                - returns the name of the idx-th column.  In particular:
                  The name of a result column is the value of the "AS" clause for 
                  that column, if there is an AS clause. If there is no AS clause 
                  then the name of the column is unspecified and may change from 
                  one release of SQLite to the next.
        !*/

    // ----------------------------

        unsigned long get_max_parameter_id (
        ) const;
        /*!
            ensures
                - returns the max parameter ID value which can be used with the
                  bind_() member functions defined below.
                - In SQLite, the default value of this limit is usually 999.
        !*/

        unsigned long get_parameter_id (
            const std::string& name
        ) const;
        /*!
            ensures
                - if (This SQL statement contains a SQL parameter with the given name) then
                    - returns the parameter_id number which can be used in the bind_*() 
                      member functions defined below.
                - else
                    - returns 0
        !*/

        template <
            typename T
            >
        void bind (
            unsigned long parameter_id,
            const T& item
        ) const;
        /*!
            requires
                - 1 <= parameter_id <= get_max_parameter_id()
            ensures
                - This function automatically selects how to bind item to a statement based
                  on the type of item given.  In particular:
                    - if (T is a 32bit or smaller built in integer type) then
                        - invokes: bind_int(parameter_id, item)
                    - else if (T is a 64bit built in integer type) then
                        - invokes: bind_int64(parameter_id, item)
                    - else if (T is float, double, or long double) then
                        - invokes: bind_double(parameter_id, item)
                    - else if (T is std::string) then
                        - invokes: bind_text(parameter_id, item)
                    - else
                        - invokes: bind_object(parameter_id, item)
        !*/

        void bind_blob (
            unsigned long parameter_id,
            const std::vector<char>& item
        );
        /*!
            requires
                - 1 <= parameter_id <= get_max_parameter_id()
            ensures
                - #get_num_columns() == 0
                - binds the value of item into the SQL parameter indicated by 
                  parameter_id.
        !*/

        template <
            typename T
            >
        void bind_object (
            unsigned long parameter_id,
            const T& item
        );
        /*!
            requires
                - 1 <= parameter_id <= get_max_parameter_id()
                - item is serializable
                  (i.e. Calling serialize(item, some_output_stream) writes an item
                  of type T to the some_output_stream stream)
            ensures
                - #get_num_columns() == 0
                - binds the value of item into the SQL parameter indicated by
                  parameter_id.  This is performed by serializing item and then 
                  binding it as a binary BLOB.
        !*/

        void bind_double (
            unsigned long parameter_id,
            const double& item
        );
        /*!
            requires
                - 1 <= parameter_id <= get_max_parameter_id()
            ensures
                - #get_num_columns() == 0
                - binds the value of item into the SQL parameter indicated by 
                  parameter_id.
        !*/

        void bind_int (
            unsigned long parameter_id,
            const int& item
        );
        /*!
            requires
                - 1 <= parameter_id <= get_max_parameter_id()
            ensures
                - #get_num_columns() == 0
                - binds the value of item into the SQL parameter indicated by 
                  parameter_id.
        !*/

        void bind_int64 (
            unsigned long parameter_id,
            const int64& item
        );
        /*!
            requires
                - 1 <= parameter_id <= get_max_parameter_id()
            ensures
                - #get_num_columns() == 0
                - binds the value of item into the SQL parameter indicated by 
                  parameter_id.
        !*/

        void bind_null (
            unsigned long parameter_id
        );
        /*!
            requires
                - 1 <= parameter_id <= get_max_parameter_id()
            ensures
                - #get_num_columns() == 0
                - binds a NULL to the SQL parameter indicated by parameter_id.
        !*/

        void bind_text (
            unsigned long parameter_id,
            const std::string& item
        );
        /*!
            requires
                - 1 <= parameter_id <= get_max_parameter_id()
            ensures
                - #get_num_columns() == 0
                - binds the value of item into the SQL parameter indicated by 
                  parameter_id.
        !*/

    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_SQLiTE_ABSTRACT_H_


