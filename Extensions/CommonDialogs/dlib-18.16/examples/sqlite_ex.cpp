// The contents of this file are in the public domain. See LICENSE_FOR_EXAMPLE_PROGRAMS.txt

/*
    This example gives a quick overview of dlib's C++ API for the popular SQLite library.
*/


#include <iostream>
#include <dlib/sqlite.h>
#include <dlib/matrix.h>

using namespace dlib;
using namespace std;

// ----------------------------------------------------------------------------------------

bool table_exists (
    database& db,
    const std::string& tablename
)
{
    // Sometimes you want to just run a query that returns one thing.  In this case, we
    // want to see how many tables are in our database with the given tablename.  The only
    // possible outcomes are 1 or 0 and we can do this by looking in the special
    // sqlite_master table that records such database metadata.  For these kinds of "one
    // result" queries we can use the query_int() method which executes a SQL statement
    // against a database and returns the result as an int.
    return query_int(db, "select count(*) from sqlite_master where name = '"+tablename+"'")==1;
}

// ----------------------------------------------------------------------------------------

int main() try
{
    // Open the SQLite database in the stuff.db file (or create an empty database in
    // stuff.db if it doesn't exist).
    database db("stuff.db");

    // Create a people table that records a person's name, age, and their "data".
    if (!table_exists(db,"people"))
        db.exec("create table people (name, age, data)");


    // Now let's add some data to this table.  We can do this by making a statement object
    // as shown.  Here we use the special ? character to indicate bindable arguments and
    // below we will use st.bind() statements to populate those fields with values.  
    statement st(db, "insert into people VALUES(?,?,?)");

    // The data for Davis
    string name = "Davis";
    int age = 32;
    matrix<double> m = randm(3,3); // some random "data" for Davis

    // You can bind any of the built in scalar types (e.g. int, float) or std::string and
    // they will go into the table as the appropriate SQL types (e.g. INT, TEXT).  If you
    // try to bind any other object it will be saved as a binary blob if the type has an
    // appropriate void serialize(const T&, std::ostream&) function defined for it.  The
    // matrix has such a serialize function (as do most dlib types) so the bind below saves
    // the matrix as a binary blob.
    st.bind(1, name);
    st.bind(2, age);
    st.bind(3, m); 
    st.exec(); // execute the SQL statement.  This does the insert.


    // We can reuse the statement to add more data to the database.  In fact, if you have a
    // bunch of statements to execute it is fastest if you reuse them in this manner. 
    name = "John";
    age = 82;
    m = randm(2,3); 
    st.bind(1, name);
    st.bind(2, age);
    st.bind(3, m); 
    st.exec();
    


    // Now lets print out all the rows in the people table.
    statement st2(db, "select * from people");
    st2.exec();
    // Loop over all the rows obtained by executing the statement with .exec().
    while(st2.move_next())
    {
        string name;
        int age;
        matrix<double> m;
        // Analogously to bind, we can grab the columns straight into C++ types.  Here the
        // matrix is automatically deserialized by calling its deserialize() routine.
        st2.get_column(0, name);
        st2.get_column(1, age);
        st2.get_column(2, m);
        cout << name << " " << age << "\n" << m << endl << endl;
    }



    // Finally, if you want to make a bunch of atomic changes to a database then you should
    // do so inside a transaction.  Here, either all the database modifications that occur
    // between the creation of my_trans and the invocation of my_trans.commit() will appear
    // in the database or none of them will.  This way, if an exception or other error
    // happens halfway though your transaction you won't be left with your database in an
    // inconsistent state.  
    // 
    // Additionally, if you are going to do a large amount of inserts or updates then it is
    // much faster to group them into a transaction.  
    transaction my_trans(db);

    name = "Dude";
    age = 49;
    m = randm(4,2); 
    st.bind(1, name);
    st.bind(2, age);
    st.bind(3, m); 
    st.exec();

    name = "Bob";
    age = 29;
    m = randm(2,2); 
    st.bind(1, name);
    st.bind(2, age);
    st.bind(3, m); 
    st.exec();

    // If you comment out this line then you will see that these inserts do not take place.
    // Specifically, what happens is that when my_trans is destructed it rolls back the
    // entire transaction unless commit() has been called.
    my_trans.commit();

}
catch (std::exception& e)
{
    cout << e.what() << endl;
}

// ----------------------------------------------------------------------------------------


