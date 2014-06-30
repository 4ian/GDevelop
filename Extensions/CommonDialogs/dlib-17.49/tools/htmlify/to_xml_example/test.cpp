#include <iostream>

// ----------------------------------------------------------------------------------------

using namespace std;

// ----------------------------------------------------------------------------------------

class test
{
    /*!
        WHAT THIS OBJECT REPRESENTS
            This is a simple test class that doesn't do anything
    !*/

public:

    typedef int type;

    test ();
    /*!
        ensures
            - constructs a test object
    !*/

    void print () const;
    /*!
        ensures
            - prints a message to the screen
    !*/

};

// ----------------------------------------------------------------------------------------

test::test() {}

void test::print() const
{
    cout << "A message!" << endl;
}

// ----------------------------------------------------------------------------------------

int add_numbers (
    int a, 
    int b
)
/*!
    ensures
        - returns a + b
!*/
{
    return a + b;
}

// ----------------------------------------------------------------------------------------

void a_function (
)
/*!P
    This is a function which won't show up in the output of htmlify --to-xml
    because of the presence of the P in the above /*!P above.   
!*/
{
}

// ----------------------------------------------------------------------------------------

int main()
{
    test a;
    a.print();
}

// ----------------------------------------------------------------------------------------


