// The contents of this file are in the public domain. See LICENSE_FOR_EXAMPLE_PROGRAMS.txt

/*
    This example contains a detailed discussion of the template expression
    technique used to implement the matrix tools in the dlib C++ library.

    It also gives examples showing how a user can create their own custom
    matrix expressions.

    Note that you should be familiar with the dlib::matrix before reading
    this example.  So if you haven't done so already you should read the
    matrix_ex.cpp example program.
*/


#include <iostream>
#include <dlib/matrix.h>

using namespace dlib;
using namespace std;

// ----------------------------------------------------------------------------------------

void custom_matrix_expressions_example();

// ----------------------------------------------------------------------------------------

int main()
{

    // Declare some variables used below
    matrix<double,3,1> y;
    matrix<double,3,3> M;
    matrix<double> x;

    // set all elements to 1
    y = 1;
    M = 1;
    

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
        such as x = round(y + y + y + M*y) which would involve the creation and copying 
        of 5 temporary matrices.  
        
        All these inefficiencies are removed by using the template expressions 
        technique.  The basic idea is as follows, instead of having operators and 
        functions return temporary matrix objects you return a special object that 
        represents the expression you wish to perform.

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
                
       
        This technique works for expressions of arbitrary complexity.  So if you typed
        x = round(y + y + y + M*y) it would involve no temporary matrices being created
        at all.  Each operator takes and returns only matrix_exp objects.  Thus, no
        computations are performed until the assignment operator requests the values
        from the matrix_exp it receives as input.  This also means that statements such as:
            auto x = round(y + y + y + M*y)
        will not work properly because x would be a matrix expression that references
        parts of the expression round(y + y + y + M*y) but those expression parts will
        immediately go out of scope so x will contain references to non-existing sub
        matrix expressions.  This is very bad, so you should never use auto to store
        the result of a matrix expression.  Always store the output in a matrix object
        like so:
            matrix<double> x = round(y + y + y + M*y)




        In terms of implementation, there is a slight complication in all of this.  It
        is for statements that involve the multiplication of a complex matrix_exp such
        as the following:
    */
        x = M*(M+M+M+M+M+M+M);
    /*
        According to the discussion above, this statement would compute the value of 
        M*(M+M+M+M+M+M+M) totally without any temporary matrix objects.  This sounds 
        good but we should take a closer look.  Consider that the + operator is 
        invoked 6 times.  This means we have something like this:

        x = M * (matrix_exp representing M+M+M+M+M+M+M);

        M is being multiplied with a quite complex matrix_exp.  Now recall that when 
        you ask a matrix_exp what the value of any of its elements are it computes 
        their values *right then*.  
        
        If you think on what is involved in performing a matrix multiply you will 
        realize that each element of a matrix is accessed M.nr() times.  In the 
        case of our above expression the cost of accessing an element of the 
        matrix_exp on the right hand side is the cost of doing 6 addition operations. 

        Thus, it would be faster to assign M+M+M+M+M+M+M to a temporary matrix and then
        multiply that by M.  This is exactly what the dlib::matrix does under the covers.  
        This is because it is able to spot expressions where the introduction of a 
        temporary is needed to speed up the computation and it will automatically do this 
        for you.  



        
        Another complication that is dealt with automatically is aliasing.  All matrix 
        expressions are said to "alias" their contents.  For example, consider
        the following expressions:
           M + M
           M * M 

        We say that the expressions (M + M) and (M * M) alias M.  Additionally, we say that
        the expression (M * M) destructively aliases M.    

        To understand why we say (M * M) destructively aliases M consider what would happen
        if we attempted to evaluate it without first assigning (M * M) to a temporary matrix.
        That is, if we attempted to perform the following:
            for (long r = 0; r < M.nr(); ++r)
                for (long c = 0; c < M.nc(); ++c)
                    M(r,c) = rowm(M,r)*colm(M,c);  

        It is clear that the result would be corrupted and M wouldn't end up with the right
        values in it.  So in this case we must perform the following:
            temp = M*M;
            M = temp;

        This sort of interaction is what defines destructive aliasing.  Whenever we are
        assigning a matrix expression to a destination that is destructively aliased by
        the expression we need to introduce a temporary.  The dlib::matrix is capable of 
        recognizing the two forms of aliasing and introduces temporary matrices only when 
        necessary.
    */



    // Next we discuss how to create custom matrix expressions.   In what follows we 
    // will define three different matrix expressions and show their use.  
    custom_matrix_expressions_example();
}

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

template <typename M>
struct example_op_trans 
{
    /*!
        This object defines a matrix expression that represents a transposed matrix.
        As discussed above, constructing this object doesn't compute anything.  It just
        holds a reference to a matrix and presents an interface which defines
        matrix transposition.   
    !*/

    // Here we simply hold a reference to the matrix we are supposed to be the transpose of.
    example_op_trans( const M& m_) : m(m_){}
    const M& m;

    // The cost field is used by matrix multiplication code to decide if a temporary needs to 
    // be introduced.  It represents the computational cost of evaluating an element of the
    // matrix expression.  In this case we say that the cost of obtaining an element of the
    // transposed matrix is the same as obtaining an element of the original matrix (since
    // transpose doesn't really compute anything).
    const static long cost = M::cost;

    // Here we define the matrix expression's compile-time known dimensions.  Since this
    // is a transpose we define them to be the reverse of M's dimensions.
    const static long NR = M::NC;
    const static long NC = M::NR;

    // Define the type of element in this matrix expression.  Also define the 
    // memory manager type used and the layout.  Usually we use the same types as the
    // input matrix.
    typedef typename M::type type;
    typedef typename M::mem_manager_type mem_manager_type;
    typedef typename M::layout_type layout_type;

    // This is where the action is.  This function is what defines the value of an element of
    // this matrix expression.  Here we are saying that m(c,r) == trans(m)(r,c) which is just
    // the definition of transposition.  Note also that we must define the return type from this
    // function as a typedef.  This typedef lets us either return our argument by value or by
    // reference.  In this case we use the same type as the underlying m matrix.  Later in this
    // example program you will see two other options.
    typedef typename M::const_ret_type const_ret_type;
    const_ret_type apply (long r, long c) const { return m(c,r); }

    // Define the run-time defined dimensions of this matrix.  
    long nr () const { return m.nc(); }
    long nc () const { return m.nr(); }

    // Recall the discussion of aliasing.  Each matrix expression needs to define what
    // kind of aliasing it introduces so that we know when to introduce temporaries.  The 
    // aliases() function indicates that the matrix transpose expression aliases item if
    // and only if the m matrix aliases item.  
    template <typename U> bool aliases               ( const matrix_exp<U>& item) const { return m.aliases(item); }
    // This next function indicates that the matrix transpose expression also destructively 
    // aliases anything m aliases.  I.e. transpose has destructive aliasing.
    template <typename U> bool destructively_aliases ( const matrix_exp<U>& item) const { return m.aliases(item); }

}; 


// Here we define a simple function that creates and returns transpose expressions.  Note that the
// matrix_op<> template is a matrix_exp object and exists solely to reduce the amount of boilerplate
// you have to write to create a matrix expression.
template < typename M >
const matrix_op<example_op_trans<M> > example_trans (
    const matrix_exp<M>& m
)
{
    typedef example_op_trans<M> op;
    // m.ref() returns a reference to the object of type M contained in the matrix expression m.
    return matrix_op<op>(op(m.ref()));
}

// ----------------------------------------------------------------------------------------

template <typename T>
struct example_op_vector_to_matrix  
{
    /*!
        This object defines a matrix expression that holds a reference to a std::vector<T>
        and makes it look like a column vector.  Thus it enables you to use a std::vector
        as if it was a dlib::matrix.

    !*/
    example_op_vector_to_matrix( const std::vector<T>& vect_) : vect(vect_){}

    const std::vector<T>& vect;

    // This expression wraps direct memory accesses so we use the lowest possible cost. 
    const static long cost = 1; 

    const static long NR = 0; // We don't know the length of the vector until runtime.  So we put 0 here.
    const static long NC = 1; // We do know that it only has one column (since it's a vector)
    typedef T type;
    // Since the std::vector doesn't use a dlib memory manager we list the default one here.
    typedef default_memory_manager mem_manager_type;
    // The layout type also doesn't really matter in this case.  So we list row_major_layout
    // since it is a good default.
    typedef row_major_layout layout_type;

    // Note that we define const_ret_type to be a reference type.  This way we can
    // return the contents of the std::vector by reference.
    typedef const T& const_ret_type;
    const_ret_type apply (long r, long ) const { return vect[r]; }

    long nr () const { return vect.size(); }
    long nc () const { return 1; }

    // This expression never aliases anything since it doesn't contain any matrix expression (it 
    // contains only a std::vector which doesn't count since you can't assign a matrix expression
    // to a std::vector object).
    template <typename U> bool aliases               ( const matrix_exp<U>& ) const { return false; }
    template <typename U> bool destructively_aliases ( const matrix_exp<U>& ) const { return false; }
}; 

template < typename T >
const matrix_op<example_op_vector_to_matrix<T> > example_vector_to_matrix (
    const std::vector<T>& vector
)
{
    typedef example_op_vector_to_matrix<T> op;
    return matrix_op<op>(op(vector));
}

// ----------------------------------------------------------------------------------------

template <typename M, typename T>
struct example_op_add_scalar
{
    /*!
        This object defines a matrix expression that represents a matrix with a single
        scalar value added to all its elements.  
    !*/

    example_op_add_scalar( const M& m_, const T& val_) : m(m_), val(val_){}

    // A reference to the matrix 
    const M& m;
    // A copy of the scalar value that should be added to each element of m
    const T val;

    // This time we add 1 to the cost since evaluating an element of this 
    // expression means performing 1 addition operation.
    const static long cost = M::cost + 1;
    const static long NR = M::NR;
    const static long NC = M::NC;
    typedef typename M::type type;
    typedef typename M::mem_manager_type mem_manager_type;
    typedef typename M::layout_type layout_type;

    // Note that we declare const_ret_type to be a non-reference type.  This is important
    // since apply() computes a new temporary value and thus we can't return a reference
    // to it.
    typedef type const_ret_type; 
    const_ret_type apply (long r, long c) const { return m(r,c) + val; }

    long nr () const { return m.nr(); }
    long nc () const { return m.nc(); }

    // This expression aliases anything m aliases.
    template <typename U> bool aliases               ( const matrix_exp<U>& item) const { return m.aliases(item); }
    // Unlike the transpose expression.  This expression only destructively aliases something if m does. 
    // So this expression has the regular non-destructive kind of aliasing.
    template <typename U> bool destructively_aliases ( const matrix_exp<U>& item) const { return m.destructively_aliases(item); }

}; 

template < typename M, typename T >
const matrix_op<example_op_add_scalar<M,T> > add_scalar (
    const matrix_exp<M>& m,
    T val
)
{
    typedef example_op_add_scalar<M,T> op;
    return matrix_op<op>(op(m.ref(), val));
}

// ----------------------------------------------------------------------------------------

void custom_matrix_expressions_example(
)
{
    matrix<double> x(2,3);
    x = 1, 1, 1,
        2, 2, 2;

    cout << x << endl;

    // Finally, let's use the matrix expressions we defined above.

    // prints the transpose of x
    cout << example_trans(x) << endl;

    // prints this:
    //   11 11 11
    //   12 12 12
    cout << add_scalar(x, 10) << endl;


    // matrix expressions can be nested, even the user defined ones.
    // the following statement prints this:
    //   11 12 
    //   11 12 
    //   11 12 
    cout << example_trans(add_scalar(x, 10)) << endl;

    // Since we setup the alias detection correctly we can even do this:
    x = example_trans(add_scalar(x, 10));
    cout << "new x:\n" << x << endl;

    cout << "Do some testing with the example_vector_to_matrix() function: " << endl;
    std::vector<float> vect;
    vect.push_back(1);
    vect.push_back(3);
    vect.push_back(5);

    // Now let's treat our std::vector like a matrix and print some things.
    cout << example_vector_to_matrix(vect) << endl;
    cout << add_scalar(example_vector_to_matrix(vect), 10) << endl;



    /*
        As an aside, note that dlib contains functions equivalent to the ones we 
        defined above.  They are:
            - dlib::trans()
            - dlib::mat() (converts things into matrices)
            - operator+ (e.g. you can say my_mat + 1)


        Also, if you are going to be creating your own matrix expression you should also
        look through the matrix code in the dlib/matrix folder.  There you will find 
        many other examples of matrix expressions. 
    */
}

// ----------------------------------------------------------------------------------------

