
/*
    This is an example illustrating the use of the matrix object 
    from the dlib C++ Library.

*/


#include <iostream>
#include "dlib/matrix.h"

using namespace dlib;
using namespace std;

// ----------------------------------------------------------------------------------------

int main()
{
    // Lets begin this example by using the library to solve a simple 
    // linear system.
    // 
    // We will find the value of x such that y = M*x where
    //
    //      3.5
    // y =  1.2
    //      7.8
    //
    // and M is
    //
    //      54.2   7.4   12.1
    // M =  1      2     3
    //      5.9    0.05  1


    // First lets declare these 3 matrices.
    // This declares a matrix that contains doubles and has 3 rows and 1 column.
    matrix<double,3,1> y;
    // Make a 3 by 3 matrix of doubles for the M matrix.
    matrix<double,3,3> M;
    // Make a matrix of doubles that has unknown dimensions (the dimensions are
    // decided at runtime unlike the above two matrices which are bound at compile
    // time).  We could declare x the same way as y but I'm doing it differently
    // for the purposes of illustration.
    matrix<double> x;
    
    // You may be wondering why someone would want to specify the size of a matrix
    // at compile time when you don't have to.  The reason is two fold.  First,
    // there is often a substantial performance improvement, especially for small
    // matrices, because the compiler is able to perform loop unrolling if it knows
    // the sizes of matrices.  Second, the dlib::matrix object checks these compile
    // time sizes to ensure that the matrices are being used correctly.  For example,
    // if you attempt to compile the expression y = M; or x = y*y; you will get
    // a compiler error on those lines since those are not legal matrix operations.
    // So if you know the size of a matrix at compile time then it is always a good
    // idea to let the compiler know about it.




    // now we need to initialize the y and M matrices and we can do so like this:
    const double M_data[] = { 
      54.2,  7.4,  12.1,
      1,     2,    3,
      5.9,   0.05, 1};

    const double y_data[] = { 
      3.5,  
      1.2,    
      7.8};

    // load these matrices up with their data.   Note that you can only load a matrix
    // with a C style array if the matrix is statically dimensioned as the M and y 
    // matrices are.  You couldn't do it for x since x = M_data would be ambiguous. 
    // (e.g. should the data be interpreted as a 3x3 matrix or a 9x1 matrix?)
    M = M_data;
    y = y_data;

    // the solution can be obtained now by multiplying the inverse of M with y
    x = inv(M)*y;

    cout << "x: \n" << x << endl;

    // We can check that it really worked by plugging x back into the original equation 
    // and subtracting y to see if we get a column vector with values all very close
    // to zero (Which is what happens.  Also, the values may not be exactly zero because 
    // there may be some numerical error and round off).
    cout << "M*x - y: \n" << M*x - y << endl;


    // The elements of a matrix are accessed using the () operator like so
    cout << M(0,1) << endl;
    // The above expression prints out the value 7.4.  That is, the value of
    // the element at row 0 and column 1.


    // Let's compute the sum of elements in the M matrix.
    double M_sum = 0;
    // loop over all the rows
    for (long r = 0; r < M.nr(); ++r)
    {
        // loop over all the columns
        for (long c = 0; c < M.nc(); ++c)
        {
            M_sum += M(r,c);
        }
    }
    cout << "sum of all elements in M is " << M_sum << endl;

    // The above code is just to show you how to loop over the elements of a matrix.  An 
    // easier way to find this sum is to do the following:
    cout << "sum of all elements in M is " << sum(M) << endl;


    // If we have a matrix that is a row or column vector.  That is, it contains either 
    // a single row or a single column then we know that any access is always either 
    // to row 0 or column 0 so we can omit that 0 and use the following syntax.
    cout << y(1) << endl;
    // The above expression prints out the value 1.2



    // -------------------------  Template Expressions -----------------------------
    // Now I will discuss the "template expressions" technique and how it is 
    // used in the matrix object.  First consider the following expression:
    x = y + y;

    /*
        Normally this expression results in machine code that looks, at a high 
        level, like the following:
            temp = y + y;
            x = temp

        Temp is a temporary matrix returned by the overloaded + operator.  
        temp then contains the result of adding y to itself.  The assignment 
        operator copies the value of temp into x and temp is then destroyed while 
        the blissful C++ user never sees any of this.

        This is, however, totally inefficient.  In the process described above 
        you have to pay for the cost of constructing a temporary matrix object
        and allocating its memory.  Then you pay the additional cost of copying
        it over to x.  It also gets worse when you have more complex expressions
        such as x = y + y + y + M*y which would involve the creation and copying 
        of 4 temporary matrices.
        
        All these inefficiencies are removed by using the template expressions 
        technique.  The exact details of how the technique is performed are well
        outside the scope of this example but the basic idea is as follows.  Instead
        of having operators and functions return temporary matrix objects you 
        return a special object that represents the expression you wish to perform.

        So consider the expression x = y + y again.  With dlib::matrix what happens
        is the expression y+y returns a matrix_exp object instead of a temporary matrix.
        The construction of a matrix_exp does not allocate any memory or perform any 
        computations.  The matrix_exp however has an interface that looks just like a 
        dlib::matrix object and when you ask it for the value of one of its elements 
        it computes that value on the spot.  Only in the assignment operator does
        someone ask the matrix_exp for these values so this avoids the use of any
        temporary matrices.  Thus the statement x = y + y is equivalent to the following 
        code:
            // loop over all elements in y matrix
            for (long r = 0; r < y.nr(); ++r)
                for (long c = 0; c < y.nc(); ++c)
                    x(r,c) = y(r,c) + y(r,c);  
                
       
        This technique works for expressions of arbitrary complexity.  So if you 
        typed x = y + y + y + M*y it would involve no temporary matrices being 
        created at all.  Each operator takes and returns only matrix_exp objects.
        Thus, no computations are performed until the assignment operator requests
        the values from the matrix_exp it receives as input. 
            




        There is only one caveat in all of this.  It is for statements that involve 
        the multiplication of a complex matrix_exp such as the following:
    */
        x = M*(M+M+M+M+M+M+M);
    /*
        This statement computes the value of M*(M+M+M+M+M+M+M) totally without 
        any temporary matrix objects.  This sounds good but we should take 
        a closer look.  Consider that the + operator is invoked 6 times.  This
        means we have something like this:

        x = M * (matrix_exp representing M+M+M+M+M+M+M);

        M is being multiplied with a quite complex matrix_exp.  Now recall that when 
        you ask a matrix_exp what the value of any of its elements are it computes 
        their values *right then*.  
        
        If you think on what is involved in performing a matrix multiply you will 
        realize that each element of a matrix is accessed M.nr() times.  In the 
        case of our above expression the cost of accessing an element of the 
        matrix_exp on the right hand side is the cost of doing 6 addition operations. 

        Thus, it would be faster to assign M+M+M+M+M+M+M to a real matrix and then
        multiply that by M.  

        So do something like this:
    */
        matrix<double,3,3> Mtemp;
        Mtemp = M+M+M+M+M+M+M;
        x = M*Mtemp;

        // Or alternatively you can use the tmp() function like so.
        x = M*tmp(M+M+M+M+M+M+M);
    /*
        tmp() just evaluates a matrix_exp and returns a real matrix object.  So it
        does the same thing as the above code that uses Mtemp.

        Anyway, the point of the above discussion is that you shouldn't multiply
        complex matrix expressions.  You should instead assign the expression to
        a matrix object and then use that object in the multiply.  This will ensure
        that your multiplies are always fast.
    */

    
}

// ----------------------------------------------------------------------------------------









