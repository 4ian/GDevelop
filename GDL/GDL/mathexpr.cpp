/*

mathexpr.cpp version 2.0

Copyright Yann OLLIVIER 1997-2000

This software may be freely distributed as is, including this whole notice.

It may be modified, but any modification should include this whole
notice as is and a description of the changes made.

This software may not be sold.

This software or any modified version of it may befreely used in free
programs. The program should include a copy of this whole notice.
If you want to use it in a program you sell, contact me

This software comes with absolutely no warranty.

*/

#include"mathexpr.h"

char* MidStr( const char*s, int i1, int i2 )
{
    if ( i1 < 0 || i2 >= ( int )strlen( s ) || i1 > i2 )
    {
        char* cp = new char[1];
        cp[0] = '\0';
        return cp;
    }
    char*s1 = new char[i2-i1+2];
    int i;
    for ( i = i1;i <= i2;i++ )s1[i-i1] = s[i];
    s1[i2-i1+1] = 0;
    return s1;
}

char* CopyStr( const char*s )
{
    char*s1 = new char[strlen( s )+1];
    char*s12 = s1;
    const char*s2 = s;
    while (( *s12++ = *s2++ ) );
    return s1;
}

void InsStr( char*&s, int n, char c )// Warning : deletes the old string
{
    if ( n < 0 || n > ( int )strlen( s ) )return;
    char*s1 = new char[strlen( s )+2];
    int i;
    for ( i = 0;i < n;i++ )s1[i] = s[i];
    s1[n] = c;
    for ( i = n + 1;s[i-1];i++ )s1[i] = s[i-1];
    s1[i] = 0;
    delete[]s;
    s = s1;
}

signed char EqStr( const char*s, const char*s2 )
{
    if ( strlen( s ) != strlen( s2 ) )return 0;
    int i;
    for ( i = 0;s[i];i++ )if ( s[i] != s2[i] )return 0;
    return 1;
}

signed char CompStr( const char*s, int n, const char*s2 )
{
    if ( n < 0 || n >= ( int )strlen( s ) || n + ( int )strlen( s2 ) > ( int )strlen( s ) )return 0;
    int i;
    for ( i = 0;s2[i];i++ )if ( s[i+n] != s2[i] )return 0;
    return 1;
}

void DelStr( char*&s, int n )//Deletes the old string
{
    char*s1 = new char[strlen( s )];
    int i;
    for ( i = 0;i < n;i++ )s1[i] = s[i];
    for ( i = n;s[i+1];i++ )s1[i] = s[i+1];
    s1[i] = 0;
    delete[]s;
    s = s1;
}

RVar::RVar( const RVar & rvarp )
{
    if ( this == &rvarp )return;
    pval = rvarp.pval;
    name = CopyStr( rvarp.name );
}

RVar::RVar( const char*namep, double*pvalp )
{pval = pvalp;name = CopyStr( namep );}

RVar::~RVar()
{if( name != NULL )delete[] name;}

RFunction::RFunction()
{
    type = -1;
    name = new char[1];
    name[0] = 0;
    nvars = 0;
    ppvar = NULL;
    pfuncval = NULL;
    op = ErrVal;
    buf = NULL;
}

RFunction::RFunction( double(( *pfuncvalp )( double ) ) )
{
    type = 0;
    pfuncval = pfuncvalp;
    name = new char[1];
    name[0] = 0;
    nvars = 1;
    ppvar = NULL;
    op = ErrVal;
    buf = NULL;
}

RFunction::RFunction( const RFunction& rfunc )
{
    if ( this == &rfunc )return;
    type = rfunc.type;
    op = rfunc.op;
    pfuncval = rfunc.pfuncval;
    name = CopyStr( rfunc.name );
    nvars = rfunc.nvars;
    if ( rfunc.ppvar != NULL && nvars )
    {
        ppvar = new PRVar[nvars];
        int i;
        for ( i = 0;i < nvars;i++ )ppvar[i] = rfunc.ppvar[i];
        buf = new double[nvars];
    }
    else {ppvar = NULL;buf = NULL;}
}

RFunction::RFunction( const ROperation& opp, RVar* pvarp ): op( opp )
{
    type = 1;
    name = new char[1];
    name[0] = 0;
    nvars = 1;
    ppvar = new PRVar[1];
    ppvar[0] = pvarp;
    buf = new double[1];
}

RFunction::RFunction( const ROperation& opp, int nvarsp, RVar**ppvarp ): op( opp )
{
    type = 1;
    name = new char[1];
    name[0] = 0;
    nvars = nvarsp;
    if ( nvars )
    {
        ppvar = new PRVar[nvars];
        int i;
        for ( i = 0;i < nvars;i++ )ppvar[i] = ppvarp[i];
        buf = new double[nvars];
    }
    else {ppvar = NULL;buf = NULL;}
}

RFunction::~RFunction()
{
    if ( name != NULL )delete[]name;
    if ( ppvar != NULL )delete[]ppvar;
    if ( buf != NULL )delete[]buf;
}

RFunction& RFunction::operator=( const RFunction & rfunc )
{
    if ( this == &rfunc )return *this;
    type = rfunc.type;
    op = rfunc.op;
    pfuncval = rfunc.pfuncval;
    delete[]name;
    name = CopyStr( rfunc.name );
    if ( ppvar != NULL )delete[]ppvar;
    ppvar = NULL;
    if ( buf != NULL )delete[]buf;
    buf = NULL;
    nvars = rfunc.nvars;
    if ( type == 1 && nvars )
    {
        ppvar = new PRVar[nvars];
        buf = new double[nvars];
        int i;
        for ( i = 0;i < nvars;i++ )ppvar[i] = rfunc.ppvar[i];
    }
    return *this;
}

void RFunction::SetName( const char*s )
{if( name != NULL )delete[]name;name = CopyStr( s );}

double RFunction::Val( double x ) const
{
    if ( type == -1 || nvars >= 2 )return ErrVal;
    if ( type == 0 )return ( *pfuncval )( x );
    double xb = *( *ppvar )->pval, y;
    *( *ppvar )->pval = x;  // Warning : could cause trouble if this value is used in a parallel process
    y = op.Val();
    *( *ppvar )->pval = xb;
    return y;
}

double RFunction::Val( double*pv ) const
{
    if ( type == -1 )return ErrVal;
    if ( type == 0 )return ( *pfuncval )( *pv );
    double y;
    int i;
    for ( i = 0;i < nvars;i++ )
    {
        buf[i] = *ppvar[i]->pval;
        // Warning : could cause trouble if this value is used in a parallel process
        *ppvar[i]->pval = pv[i];
    }
    y = op.Val();
    for ( i = 0;i < nvars;i++ )*ppvar[i]->pval = buf[i];
    return y;
}

ROperation::ROperation()
{op = ErrOp;mmb1 = NULL;mmb2 = NULL;ValC = ErrVal;pvar = NULL;pvarval = NULL;pfunc = NULL;containfuncflag = 0;pinstr = NULL;pvals = NULL;ppile = NULL;pfuncpile = NULL;BuildCode();}

ROperation::~ROperation()
{
    Destroy();
}

ROperation::ROperation( const ROperation&ROp )
{
    op = ROp.op;
    pvar = ROp.pvar;
    pvarval = ROp.pvarval;
    ValC = ROp.ValC;
    pfunc = ROp.pfunc;
    containfuncflag = 0;
    pinstr = NULL;
    pvals = NULL;
    ppile = NULL;
    pfuncpile = NULL;
    if ( ROp.mmb1 != NULL )mmb1 = new ROperation( *( ROp.mmb1 ) );
    else mmb1 = NULL;
    if ( ROp.mmb2 != NULL )mmb2 = new ROperation( *( ROp.mmb2 ) );
    else mmb2 = NULL;
    BuildCode();
}

ROperation::ROperation( double x )
{
    if ( x == ErrVal ){op = ErrOp;mmb1 = NULL;mmb2 = NULL;ValC = ErrVal;}
    else if ( x >= 0 ){op = Num;mmb1 = NULL;mmb2 = NULL;ValC = x;}
    else{op = Opp;mmb1 = NULL;mmb2 = new ROperation( -x );ValC = ErrVal;}
    pvar = NULL;
    pvarval = NULL;
    pfunc = NULL;
    containfuncflag = 0;
    pinstr = NULL;
    pvals = NULL;
    ppile = NULL;
    pfuncpile = NULL;
    BuildCode();
}

ROperation::ROperation( const RVar&varp )
{op = Var;mmb1 = NULL;mmb2 = NULL;ValC = ErrVal;pvar = &varp;pvarval = varp.pval;containfuncflag = 0;pfunc = NULL;pinstr = NULL;pvals = NULL;ppile = NULL;pfuncpile = NULL;BuildCode();}

ROperation& ROperation::operator=( const ROperation & ROp )
{
    if ( this == &ROp )return *this;
    Destroy();
    op = ROp.op;
    pvar = ROp.pvar;
    pvarval = ROp.pvarval;
    ValC = ROp.ValC;
    pfunc = ROp.pfunc;
    containfuncflag = 0;
    pinstr = NULL;
    pvals = NULL;
    ppile = NULL;
    pfuncpile = NULL;
    if ( ROp.mmb1 != NULL )mmb1 = new ROperation( *( ROp.mmb1 ) );
    else mmb1 = NULL;
    if ( ROp.mmb2 != NULL )mmb2 = new ROperation( *( ROp.mmb2 ) );
    else mmb2 = NULL;
    BuildCode();
    return *this;
}

int operator==( const ROperation& op, const double v )
{return( op.op == Num && op.ValC == v );}

int operator==( const ROperation& op1, const ROperation& op2 )
{
    if ( op1.op != op2.op )return 0;
    if ( op1.op == Var )return( *( op1.pvar ) == *( op2.pvar ) );
    if ( op1.op == Fun )return( op1.pfunc == op2.pfunc ); // *op1.pfunc==*op2.pfunc could imply infinite loops in cases of self-dependence
    if ( op1.op == Num )return( op1.ValC == op2.ValC );
    if ( op1.mmb1 == NULL && op2.mmb1 != NULL )return 0;
    if ( op1.mmb2 == NULL && op2.mmb2 != NULL )return 0;
    if ( op2.mmb1 == NULL && op1.mmb1 != NULL )return 0;
    if ( op2.mmb2 == NULL && op1.mmb2 != NULL )return 0;
    return((( op1.mmb1 == NULL && op2.mmb1 == NULL ) || ( *( op1.mmb1 ) == *( op2.mmb1 ) ) ) &&
           (( op1.mmb2 == NULL && op2.mmb2 == NULL ) || ( *( op1.mmb2 ) == *( op2.mmb2 ) ) ) );
}

int operator!=( const ROperation& op1, const ROperation& op2 )
{
    if ( op1.op != op2.op )return 1;
    if ( op1.op == Var )return( op1.pvar != op2.pvar );
    if ( op1.op == Fun )return( !( op1.pfunc == op2.pfunc ) ); // *op1.pfunc==*op2.pfunc could imply infinite loops in cases of self-dependence
    if ( op1.op == Num )return( op1.ValC != op2.ValC );
    if ( op1.mmb1 == NULL && op2.mmb1 != NULL )return 1;
    if ( op1.mmb2 == NULL && op2.mmb2 != NULL )return 1;
    if ( op2.mmb1 == NULL && op1.mmb1 != NULL )return 1;
    if ( op2.mmb2 == NULL && op1.mmb2 != NULL )return 1;
    return((( op1.mmb1 != NULL || op2.mmb1 != NULL ) && ( *( op1.mmb1 ) != *( op2.mmb1 ) ) ) ||
           (( op1.mmb2 != NULL || op2.mmb2 != NULL ) && ( *( op1.mmb2 ) != *( op2.mmb2 ) ) ) );
}

ROperation ROperation::operator+() const
{return *this;}

ROperation ROperation::operator-() const
{
    if ( op == Num )return -ValC;
    ROperation resultat;
    if ( op == Opp )resultat = *mmb2;
    else{resultat.op = Opp;resultat.mmb2 = new ROperation( *this );};
    return resultat;
}

ROperation operator,( const ROperation& op1, const ROperation& op2 )
{
    ROperation resultat;
    resultat.op = Juxt;
    resultat.mmb1 = new ROperation( op1 );
    resultat.mmb2 = new ROperation( op2 );
    return resultat;
}

ROperation operator+( const ROperation& op1, const ROperation& op2 )
{
    if ( op1.op == Num && op2.op == Num )return op1.ValC + op2.ValC;
    if ( op1 == 0. )return op2;
    if ( op2 == 0. )return op1;
    if ( op1.op == Opp )return op2 -*( op1.mmb2 );
    if ( op2.op == Opp )return op1 -*( op2.mmb2 );
    ROperation resultat;
    resultat.op = Add;
    resultat.mmb1 = new ROperation( op1 );
    resultat.mmb2 = new ROperation( op2 );
    return resultat;
}

ROperation operator-( const ROperation& op1, const ROperation& op2 )
{
    if ( op1.op == Num && op2.op == Num )return op1.ValC -op2.ValC;
    if ( op1 == 0. )return -op2;
    if ( op2 == 0. )return op1;
    if ( op1.op == Opp )return -( op2 + *( op1.mmb2 ) );
    if ( op2.op == Opp )return op1 + *( op2.mmb2 );
    ROperation resultat;
    resultat.op = Sub;
    resultat.mmb1 = new ROperation( op1 );
    resultat.mmb2 = new ROperation( op2 );
    return resultat;
}

ROperation operator*( const ROperation& op1, const ROperation& op2 )
{
    if ( op1.op == Num && op2.op == Num )return op1.ValC*op2.ValC;
    if ( op1 == 0. || op2 == 0. )return 0.;
    if ( op1 == 1. )return op2;
    if ( op2 == 1. )return op1;
    if ( op1.op == Opp )return -( *( op1.mmb2 )*op2 );
    if ( op2.op == Opp )return -( op1**( op2.mmb2 ) );
    ROperation resultat;
    resultat.op = Mult;
    resultat.mmb1 = new ROperation( op1 );
    resultat.mmb2 = new ROperation( op2 );
    return resultat;
}

ROperation operator/( const ROperation& op1, const ROperation& op2 )
{
    if ( op1.op == Num && op2.op == Num )return ( op2.ValC ? op1.ValC / op2.ValC : ErrVal );
    if ( op1 == 0.0 )return 0.;
    if ( op2 == 1. )return op1;
    if ( op2 == 0. )return ErrVal;
    if ( op1.op == Opp )return -( *( op1.mmb2 ) / op2 );
    if ( op2.op == Opp )return -( op1 / ( *( op2.mmb2 ) ) );
    ROperation resultat;
    resultat.op = Div;
    resultat.mmb1 = new ROperation( op1 );
    resultat.mmb2 = new ROperation( op2 );
    return resultat;
}

ROperation operator^( const ROperation& op1, const ROperation& op2 )
{
    if ( op1 == 0. )return 0.;
    if ( op2 == 0. )return 1.;
    if ( op2 == 1. )return op1;
    ROperation resultat;
    resultat.op = Pow;
    resultat.mmb1 = new ROperation( op1 );
    resultat.mmb2 = new ROperation( op2 );
    return resultat;
}

ROperation sqrt( const ROperation& op )
{ROperation rop;rop.op = Sqrt;rop.mmb2 = new ROperation( op );return rop;}
ROperation abs( const ROperation& op )
{ROperation rop;rop.op = Abs;rop.mmb2 = new ROperation( op );return rop;}
ROperation sin( const ROperation& op )
{ROperation rop;rop.op = Sin;rop.mmb2 = new ROperation( op );return rop;}
ROperation cos( const ROperation& op )
{ROperation rop;rop.op = Cos;rop.mmb2 = new ROperation( op );return rop;}
ROperation tan( const ROperation& op )
{ROperation rop;rop.op = Tg;rop.mmb2 = new ROperation( op );return rop;}
ROperation log( const ROperation& op )
{ROperation rop;rop.op = Ln;rop.mmb2 = new ROperation( op );return rop;}
ROperation exp( const ROperation& op )
{ROperation rop;rop.op = Exp;rop.mmb2 = new ROperation( op );return rop;}
ROperation acos( const ROperation& op )
{ROperation rop;rop.op = Acos;rop.mmb2 = new ROperation( op );return rop;}
ROperation asin( const ROperation& op )
{ROperation rop;rop.op = Asin;rop.mmb2 = new ROperation( op );return rop;}
ROperation atan( const ROperation& op )
{ROperation rop;rop.op = Atan;rop.mmb2 = new ROperation( op );return rop;}
ROperation ent( const ROperation& op )
{ROperation rop;rop.op = Ent;rop.mmb2 = new ROperation( op );return rop;}

ROperation ApplyOperator( int n, ROperation**pops, ROperation( *func )( const ROperation&, const ROperation& ) )
{
    if ( n <= 0 )return ErrVal;
    if ( n == 1 )return *pops[0];
    if ( n == 2 )return ( *func )( *pops[0], *pops[1] );
    return ( *func )( *pops[0], ApplyOperator( n - 1, pops + 1, func ) );
}

ROperation RFunction::operator()( const ROperation& op )
{
    /* Code to use to replace explcitly instead of using a pointer to
       if(nvars!=op.NMembers()||type==-1||type==0)return ErrVal;
       ROperation op2=*pop;int i;
       RVar**ppvar2=new PRVar[nvars];char s[11]="";
       for(i=0;i<nvars;i++){
       sprintf(s,";var%i;",i);
       ppvar2[i]=new RVar(s,NULL);
       op2=op2.Substitute(*ppvar[i],(ROperation)*ppvar2[i]);
       }
       for(i=0;i<nvars;i++){
       op2=op2.Substitute(*ppvar2[i],op.NthMember(i+1));
       delete ppvar2[i];
       }
       delete[]ppvar2;
       return op2;
    */
    ROperation op2;
    op2.op = Fun;
    op2.pfunc = this;
    op2.mmb2 = new ROperation( op );
    return op2;
}

//Auxiliary string functions

void SupprSpaces( char*&s )//Deletes the old string
{
    int i;
    for ( i = 0;s[i];i++ )if ( s[i] == ' ' || s[i] == '\t' || s[i] == '\n' )DelStr( s, i-- );
}

signed char IsNumeric( char c )
{
    if ( c != '0' && c != '1' && c != '2' && c != '3' && c != '4'
            && c != '5' && c != '6' && c != '7' && c != '8' && c != '9' && c != '.' )return 0;
    return 1;
}

signed char IsTNumeric( char *s )
{
    int i;
    for ( i = 0;i < ( int )strlen( s );i++ )if ( !IsNumeric( s[i] ) )return 0;
    return 1;
}

int SearchCorOpenbracket( char*s, int n )  //Searchs the corresponding bracket of an opening bracket
{
    if ( n >= ( int )strlen( s ) - 1 )return -1;
    int i, c = 1;
    for ( i = n + 1;s[i];i++ )
    {
        if ( s[i] == '(' )c++;
        else if ( s[i] == ')' )c--;
        if ( !c )return i;
    };
    return -1;
}

int SearchCorClosebracket( char*s, int n )  //Searchs the corresponding bracket of a closing bracket
{
    if ( n < 1 )return -1;
    int i, c = 1;
    for ( i = n - 1;i >= 0;i-- )
    {
        if ( s[i] == ')' )c++;
        else if ( s[i] == '(' )c--;
        if ( !c )return i;
    };
    return -1;
}

int SearchOperator( char*s, ROperator op )
{
    char opc;
    switch ( op )
    {
    case ErrOp:
    case Num:
    case Var:
        return -1;
    case Juxt:
        opc = ',';
        break;
    case Add:
        opc = '+';
        break;
    case Sub:
        opc = '-';
        break;
    case Mult:
        opc = '*';
        break;
    case Div:
        opc = '/';
        break;
    case Pow:
        opc = '^';
        break;
    case NthRoot:
        opc = '#';
        break;
    case E10:
        opc = 'E';
        break;
    default:
        return -1;
    };
    int i;
    for ( i = ( int )strlen( s ) - 1;i >= 0;i-- )
    {
        if ( s[i] == opc && ( op != Sub || i && s[i-1] == ')' ) )return i;
        if ( s[i] == ')' ){i = SearchCorClosebracket( s, i );if ( i == -1 )return -1;};
    };
    return -1;
}

void SimplifyStr( char*&s ) //Warning : deletes the old string
{
    if ( !strlen( s ) )return;
    char*s1 = s, *s2 = s + strlen( s );
    signed char ind = 0;
    if ( s1[0] == '(' && SearchCorOpenbracket( s1, 0 ) == s2 - s1 - 1 )
    {
        s1++;
        s2--;
        ind = 1;
    }
    if ( s1 == s2 )
    {
        delete[]s;
        s = new char[1]; // ISO C++ forbids initialization in array new
        s[0] = 0;
        return;
    }
    if ( s1[0] == ' ' ){ind = 1;while ( s1[0] == ' ' && s1 < s2 )s1++;}
    if ( s1 == s2 )
    {
        delete[]s;
        s = new char[1]; // ISO C++ forbids initialization in array new
        s[0] = 0;
        return;
    }
    if ( *( s2 - 1 ) == ' ' ){ind = 1;while ( s2 > s1 && *( s2 - 1 ) == ' ' )s2--;}
    *s2 = 0;
    s1 = CopyStr( s1 );
    delete[]s;
    s = s1;
    if ( ind )SimplifyStr( s );
}

int max( int a, int b ){return ( a > b ? a : b );}

int IsVar( const char*s, int n, int nvar, PRVar*ppvar )
{
    if ( n < 0 || n > ( int )strlen( s ) )return 0;
    int i;
    int l = 0;
    for ( i = 0;i < nvar;i++ )if ( CompStr( s, n, ( *( ppvar + i ) )->name ) )l = max( l, strlen(( *( ppvar + i ) )->name ) );
    return l;
}

int IsFunction( const char*s, int n )
{
    if ( CompStr( s, n, "sin" ) || CompStr( s, n, "cos" ) || CompStr( s, n, "exp" )
            || CompStr( s, n, "tan" ) || CompStr( s, n, "log" ) || CompStr( s, n, "atg" )
            || CompStr( s, n, "abs" ) || CompStr( s, n, "int" ) )return 3;
    if ( CompStr( s, n, "tg" ) || CompStr( s, n, "ln" ) )return 2;
    if ( CompStr( s, n, "sqrt" ) || CompStr( s, n, "asin" ) || CompStr( s, n, "atan" ) ||
            CompStr( s, n, "acos" ) )return 4;
    if ( CompStr( s, n, "arcsin" ) || CompStr( s, n, "arccos" ) || CompStr( s, n, "arctan" ) )return 6;
    if ( CompStr( s, n, "arctg" ) )return 5;
    return 0;
}

int IsFunction( const char*s, int n, int nfunc, PRFunction*ppfunc )
//Not recognized if a user-defined function is eg "sine" ie begins like
//a standard function
//IF PATCHED TO DO OTHERWISE, SHOULD BE PATCHED TOGETHER WITH THE
//PARSER BELOW which treats standard functions before user-defined ones
{
    int l = IsFunction( s, n );
    if ( l )return l;
    int i;
    l = 0;
    for ( i = 0;i < nfunc;i++ )if ( CompStr( s, n, ppfunc[i]->name ) )l = max( l, strlen( ppfunc[i]->name ) );
    return l;
}

signed char IsFunction( ROperator op )
{
    return ( op == Exp || op == Abs || op == Sin || op == Cos || op == Tg || op == Ln ||
             op == Atan || op == Asin || op == Acos || op == Atan || op == Sqrt || op == Opp || op == Ent );
}

void IsolateVars( char*&s, int nvar, PRVar*ppvar, int nfunc, PRFunction*ppfunc )//Deletes the old string
{
    int i, j;
    i = 0;
    for ( i = 0;s[i];i++ )
    {
        if ( s[i] == '(' ){i = SearchCorOpenbracket( s, i );if ( i == -1 )return;continue;};
        if ((( j = IsVar( s, i, nvar, ppvar ) ) > IsFunction( s, i, nfunc, ppfunc ) ) || (( CompStr( s, i, "pi" ) || CompStr( s, i, "PI" ) || CompStr( s, i, "Pi" ) ) && ( j = 2 ) ) )
        {
            InsStr( s, i, '(' );
            InsStr( s, i + j + 1, ')' );
            i += j + 1;
            continue;
        };
        if ( IsFunction( s, i, nfunc, ppfunc ) ){i += IsFunction( s, i, nfunc, ppfunc ) - 1;if ( !s[i] )return;continue;};
    };
}

void IsolateNumbers( char*&s, int nvar, RVar**ppvar, int nfunc, RFunction**ppfunc )//Deletes the old string
{
    int i, i2, ind = 0, t1, t2;
    for ( i = 0;s[i];i++ )
    {
        if ( ind && !IsNumeric( s[i] ) ){ind = 0;InsStr( s, i2, '(' );i++;InsStr( s, i, ')' );continue;};
        t1 = IsVar( s, i, nvar, ppvar );
        t2 = IsFunction( s, i, nfunc, ppfunc );
        if ( t1 || t2 ){i += max( t1, t2 ) - 1;continue;};
        if ( s[i] == '(' ){i = SearchCorOpenbracket( s, i );if ( i == -1 )return;continue;};
        if ( !ind && IsNumeric( s[i] ) ){i2 = i;ind = 1;};
    };
    if ( ind )InsStr( s, i2, '(' );
    i++;
    InsStr( s, i, ')' );
}

ROperation::ROperation( const char*sp, int nvar, PRVar*ppvarp, int nfuncp, PRFunction*ppfuncp )
{
    ValC = ErrVal;
    mmb1 = NULL;
    mmb2 = NULL;
    pvar = NULL;
    op = ErrOp;
    pvarval = NULL;
    containfuncflag = 0;
    pfunc = NULL;
    pinstr = NULL;
    pvals = NULL;
    ppile = NULL;
    pfuncpile = NULL;
    int i, j, k, l;
    signed char flag = 1;
    char*s = CopyStr( sp ), *s1 = NULL, *s2 = NULL;
    SimplifyStr( s );
    if ( !s[0] || !strcmp( s, "Error" ) ){goto fin;}
    while ( s[0] == ':' || s[0] == ';' )
    {
        s1 = CopyStr( s + 1 );
        delete[]s;
        s = s1;
        s1 = NULL;
        SimplifyStr( s );
        if ( !s[0] || !strcmp( s, "Error" ) ){goto fin;}
    }
    if ( IsTNumeric( s ) ){op = Num;ValC = atof( s );mmb1 = NULL;mmb2 = NULL;goto fin;};
    if ( EqStr( s, "pi" ) || EqStr( s, "PI" ) || EqStr( s, "Pi" ) )
        {op = Num;ValC = 3.141592653589793238462643383279L;mmb1 = NULL;mmb2 = NULL;goto fin;};
    if ( IsFunction( s, 0, nfuncp, ppfuncp ) < IsVar( s, 0, nvar, ppvarp ) )
        for ( i = 0;i < nvar;i++ )if ( EqStr( s, ( *( ppvarp + i ) )->name ) )
                {pvar = ppvarp[i];pvarval = pvar->pval;op = Var;mmb1 = NULL;mmb2 = NULL;goto fin;};
    for ( k = 0;s[k];k++ )
    {
        if ( s[k] == '(' ){k = SearchCorOpenbracket( s, k );if ( k == -1 )break;continue;};
        if (( l = IsFunction( s, k, nfuncp, ppfuncp ) ) && l >= IsVar( s, k, nvar, ppvarp ) )
        {
            i = k + l;
            while ( s[i] == ' ' )i++;
            if ( s[i] == '(' )
            {
                j = SearchCorOpenbracket( s, i );
                if ( j != -1 ){InsStr( s, i, ';' );k = j + 1;}
                else break;
            }
            else if ( s[i] != ':' && s[i] != ';' ){InsStr( s, i, ':' );k = i;}
        }
    }
    IsolateNumbers( s, nvar, ppvarp, nfuncp, ppfuncp );
    if ( nvar )IsolateVars( s, nvar, ppvarp, nfuncp, ppfuncp );
    SupprSpaces( s );
    i = SearchOperator( s, Juxt );
    if ( i != -1 )
    {
        s1 = MidStr( s, 0, i - 1 );
        s2 = MidStr( s, i + 1, strlen( s ) - 1 );
        op = Juxt;
        mmb1 = new ROperation( s1, nvar, ppvarp, nfuncp, ppfuncp );
        mmb2 = new ROperation( s2, nvar, ppvarp, nfuncp, ppfuncp );
        goto fin;
    };
    i = SearchOperator( s, Add );
    if ( i != -1 )
    {
        s1 = MidStr( s, 0, i - 1 );
        s2 = MidStr( s, i + 1, strlen( s ) - 1 );
        op = Add;
        mmb1 = new ROperation( s1, nvar, ppvarp, nfuncp, ppfuncp );
        mmb2 = new ROperation( s2, nvar, ppvarp, nfuncp, ppfuncp );
        goto fin;
    };
    i = SearchOperator( s, Sub );
    if ( i != -1 )
    {
        s1 = MidStr( s, 0, i - 1 );
        s2 = MidStr( s, i + 1, strlen( s ) - 1 );
        op = Sub;
        mmb1 = new ROperation( s1, nvar, ppvarp, nfuncp, ppfuncp );
        mmb2 = new ROperation( s2, nvar, ppvarp, nfuncp, ppfuncp );
        goto fin;
    };
    if ( s[0] == '-' )
    {
        s2 = MidStr( s, 1, strlen( s ) - 1 );
        op = Opp;
        mmb1 = NULL;
        mmb2 = new ROperation( s2, nvar, ppvarp, nfuncp, ppfuncp );
        goto fin;
    };
    for ( i = 0;s[i];i++ )
    {
        if ( s[i] == '(' ){i = SearchCorOpenbracket( s, i );if ( i == -1 )break;continue;};
        if ( IsFunction( s, i, nfuncp, ppfuncp ) )
        {
            k = i + IsFunction( s, i, nfuncp, ppfuncp );
            while ( s[k] == ' ' )k++;
            if ( s[k] == ';' )
            {
                //	s=DelStr(s,k);
                j = k;
                while ( s[j] != '(' )j++;
                j = SearchCorOpenbracket( s, j );
                if ( j != -1 ){InsStr( s, j, ')' );InsStr( s, i, '(' );i = j + 2;}
            }
            else if ( s[k] == ':' )
            {
                //	s=DelStr(s,k);
                for ( j = k;s[j];j++ )
                    if ( s[j] == '(' ){j = SearchCorOpenbracket( s, j );break;}
                if ( j == -1 )break;
                for ( j++;s[j];j++ )
                {
                    if ( s[j] == '(' ){j = SearchCorOpenbracket( s, j );if ( j == -1 ){flag = 0;break;};continue;};
                    if ( IsFunction( s, j, nfuncp, ppfuncp ) )break;
                }
                if ( flag == 0 ){flag = 1;break;}
                while ( j > i && s[j-1] != ')' )j--;
                if ( j <= i + 1 )break;
                InsStr( s, i, '(' );
                InsStr( s, j + 1, ')' );
                i = j + 1;
            }
        }
    }
    for ( i = 0;s[i] && s[i+1];i++ )if ( s[i] == ')' && s[i+1] == '(' )
            InsStr( s, ++i, '*' );
    if ( s[0] == '(' && SearchCorOpenbracket( s, 0 ) == ( int )strlen( s ) - 1 )
    {
        if ( CompStr( s, 1, "exp" ) ){op = Exp;s2 = MidStr( s, 4, strlen( s ) - 2 );}
        else if ( CompStr( s, 1, "abs" ) ){op = Abs;s2 = MidStr( s, 4, strlen( s ) - 2 );}
        else if ( CompStr( s, 1, "sin" ) ){op = Sin;s2 = MidStr( s, 4, strlen( s ) - 2 );}
        else if ( CompStr( s, 1, "cos" ) ){op = Cos;s2 = MidStr( s, 4, strlen( s ) - 2 );}
        else if ( CompStr( s, 1, "tan" ) ){op = Tg;s2 = MidStr( s, 4, strlen( s ) - 2 );}
        else if ( CompStr( s, 1, "log" ) ){op = Ln;s2 = MidStr( s, 4, strlen( s ) - 2 );}
        else if ( CompStr( s, 1, "atg" ) ){op = Atan;s2 = MidStr( s, 4, strlen( s ) - 2 );}
        else if ( CompStr( s, 1, "tg" ) ){op = Tg;s2 = MidStr( s, 3, strlen( s ) - 2 );}
        else if ( CompStr( s, 1, "ln" ) ){op = Ln;s2 = MidStr( s, 3, strlen( s ) - 2 );}
        else if ( CompStr( s, 1, "asin" ) ){op = Asin;s2 = MidStr( s, 5, strlen( s ) - 2 );}
        else if ( CompStr( s, 1, "acos" ) ){op = Acos;s2 = MidStr( s, 5, strlen( s ) - 2 );}
        else if ( CompStr( s, 1, "atan" ) ){op = Atan;s2 = MidStr( s, 5, strlen( s ) - 2 );}
        else if ( CompStr( s, 1, "sqrt" ) ){op = Sqrt;s2 = MidStr( s, 5, strlen( s ) - 2 );}
        else if ( CompStr( s, 1, "arcsin" ) ){op = Asin;s2 = MidStr( s, 7, strlen( s ) - 2 );}
        else if ( CompStr( s, 1, "arccos" ) ){op = Acos;s2 = MidStr( s, 7, strlen( s ) - 2 );}
        else if ( CompStr( s, 1, "arctan" ) ){op = Atan;s2 = MidStr( s, 7, strlen( s ) - 2 );}
        else if ( CompStr( s, 1, "arctg" ) ){op = Atan;s2 = MidStr( s, 6, strlen( s ) - 2 );}
        else if ( CompStr( s, 1, "int" ) ){op = Ent;s2 = MidStr( s, 4, strlen( s ) - 2 );}
        else
        {
            for ( i = -1, k = 0, j = 0;j < nfuncp;j++ )if ( CompStr( s, 1, ppfuncp[j]->name ) && k < ( int )strlen( ppfuncp[j]->name ) ){k = strlen( ppfuncp[j]->name );i = j;}
            if ( i > -1 )
            {
                op = Fun;
                s2 = MidStr( s, strlen( ppfuncp[i]->name ) + 1, strlen( s ) - 2 );
                pfunc = ppfuncp[i];
            }
        }
        mmb1 = NULL;
        mmb2 = new ROperation( s2, nvar, ppvarp, nfuncp, ppfuncp );
        if ( op == Fun )if ( mmb2->NMembers() != pfunc->nvars ){op = ErrOp;mmb1 = NULL;mmb2 = NULL;goto fin;}
        goto fin;
    };
    i = SearchOperator( s, Mult );
    if ( i != -1 )
    {
        s1 = MidStr( s, 0, i - 1 );
        s2 = MidStr( s, i + 1, strlen( s ) - 1 );
        op = Mult;
        mmb1 = new ROperation( s1, nvar, ppvarp, nfuncp, ppfuncp );
        mmb2 = new ROperation( s2, nvar, ppvarp, nfuncp, ppfuncp );
        goto fin;
    };
    i = SearchOperator( s, Div );
    if ( i != -1 )
    {
        s1 = MidStr( s, 0, i - 1 );
        s2 = MidStr( s, i + 1, strlen( s ) - 1 );
        op = Div;
        mmb1 = new ROperation( s1, nvar, ppvarp, nfuncp, ppfuncp );
        mmb2 = new ROperation( s2, nvar, ppvarp, nfuncp, ppfuncp );
        goto fin;
    };
    i = SearchOperator( s, Pow );
    if ( i != -1 )
    {
        s1 = MidStr( s, 0, i - 1 );
        s2 = MidStr( s, i + 1, strlen( s ) - 1 );
        op = Pow;
        mmb1 = new ROperation( s1, nvar, ppvarp, nfuncp, ppfuncp );
        mmb2 = new ROperation( s2, nvar, ppvarp, nfuncp, ppfuncp );
        goto fin;
    };
    i = SearchOperator( s, NthRoot );
    if ( i != -1 )
    {
        s1 = MidStr( s, 0, i - 1 );
        s2 = MidStr( s, i + 1, strlen( s ) - 1 );
        if ( i == 0 || s[i-1] != ')' )
            {op = Sqrt;mmb1 = NULL;}
        else
            {op = NthRoot;mmb1 = new ROperation( s1, nvar, ppvarp, nfuncp, ppfuncp );};
        mmb2 = new ROperation( s2, nvar, ppvarp, nfuncp, ppfuncp );
        goto fin;
    };
    i = SearchOperator( s, E10 );
    if ( i != -1 )
    {
        s1 = MidStr( s, 0, i - 1 );
        s2 = MidStr( s, i + 1, strlen( s ) - 1 );
        op = E10;
        mmb1 = new ROperation( s1, nvar, ppvarp, nfuncp, ppfuncp );
        mmb2 = new ROperation( s2, nvar, ppvarp, nfuncp, ppfuncp );
        goto fin;
    };
    op = ErrOp;
    mmb1 = NULL;
    mmb2 = NULL;
fin:
    BuildCode();
    delete[]s;
    if ( s1 != NULL )delete[] s1;
    if ( s2 != NULL )delete[]s2;
}

void ROperation::Destroy()
{
    if ( mmb1 != NULL && mmb2 != NULL && mmb1 != mmb2 ){delete mmb1;delete mmb2;mmb1 = NULL;mmb2 = NULL;}
    else if ( mmb1 != NULL ){delete mmb1;mmb1 = NULL;}
    else if ( mmb2 != NULL ){delete mmb2;mmb2 = NULL;}
    if ( pinstr != NULL ){delete[]pinstr;pinstr = NULL;}
    if ( pvals != NULL )
    {
        if ( op == ErrOp || op == Num )delete pvals[0];
        delete[]pvals;
        pvals = NULL;
    }
    if ( ppile != NULL ){delete[]ppile;ppile = NULL;}
    if ( pfuncpile != NULL ){delete[]pfuncpile;pfuncpile = NULL;}
}

int operator==( const RVar& var1, const RVar& var2 )
{
    return( var1.pval == var2.pval && EqStr( var1.name, var2.name ) );
}

int operator==( const RFunction& f1, const RFunction& f2 )
{
    if ( f1.type != f2.type )return 0;
    if ( f1.type == -1 )return 1; // Nonfunction==nonfunction
    if ( f1.type == 0 )return ( f1.pfuncval == f2.pfuncval && EqStr( f1.name, f2.name ) );
    if ( f1.op != f2.op )return 0;
    if ( !EqStr( f1.name, f2.name ) )return 0;
    if ( f1.nvars != f2.nvars )return 0;
    int i;
    for ( i = 0;i < f1.nvars;i++ )if ( !( *f1.ppvar[i] == *f2.ppvar[i] ) )return 0;
    return 1;
}

/*
double ROperation::Val() const // Won't work if multi-variable functions are included
{
  double v1=ErrVal,v2=ErrVal;
  if(mmb1!=NULL){v1=mmb1->Val();if(fabsl(v1)<sqrtminfloat)v1=0;else if(v1==ErrVal||fabsl(v1)>sqrtmaxfloat)return ErrVal;};
  if(mmb2!=NULL){v2=mmb2->Val();if(fabsl(v2)<sqrtminfloat)v2=0;else if(v2==ErrVal||fabsl(v2)>sqrtmaxfloat)return ErrVal;};
  switch(op){
  case Num:return ValC;
  case Var:return *pvarval;
  case Add:return v1+v2;
  case Sub:return v1-v2;
  case Opp:return -v2;
  case Mult:return v1*v2;
  case Div:if(v2)return v1/v2;else return ErrVal;
  case Pow:if(v1==0)return 0;else if((v1>0||!fmodl(v2,1))&&v2*logl(fabsl(v1))<DBL_MAX_EXP)return powl(v1,v2);else return ErrVal;
  case Sqrt:if(v2>=0)return sqrtl(v2);else return ErrVal;
  case NthRoot:if(!v1||v2*logl(fabsl(v1))<DBL_MIN_EXP)return ErrVal;
  else if(v2>=0)return powl(v2,1/v1);else
    if(fmodl(v1,2)==1||fmodl(v1,2)==-1)return -powl(-v2,1/v1);else return ErrVal;
  case E10:if(v2<DBL_MAX_10_EXP)return v1*pow10l(v2);else return ErrVal;
  case Ln:if(v2>0)return logl(v2);else return ErrVal;
  case Exp:if(v2<DBL_MAX_EXP)return expl(v2);else return ErrVal;
  case Sin:if(fabsl(v2)<inveps)return sinl(v2);else return ErrVal;
  case Cos:if(fabsl(v2)<inveps)return cosl(v2);else return ErrVal;
  case Tg:if(fabsl(v2)<inveps)return tanl(v2);else return ErrVal;
  case Atan:
    if(mmb2->op==Juxt){v1=mmb2->NthMember(1).Val();v2=mmb2->NthMember(2).Val();return (v1||v2?atan2(v1,v2):ErrVal);}else return atanl(v2);
  case Asin:if(v2<-1||v2>1)return ErrVal;else return asinl(v2);
  case Acos:if(v2<-1||v2>1)return ErrVal;else return acosl(v2);
  case Abs:return fabsl(v2);
  case Fun:return pfunc->Val(v2);
  default:return ErrVal;
  };
}
*/

signed char ROperation::ContainVar( const RVar& varp ) const
{
    if ( op == Var )
    {
        if ( EqStr( pvar->name, varp.name ) && pvar->pval == varp.pval )
            return 1;
        else return 0;
    };
    if ( mmb1 != NULL && mmb1->ContainVar( varp ) )return 1;
    if ( mmb2 != NULL && mmb2->ContainVar( varp ) )return 1;
    return 0;
}

signed char ROperation::ContainFuncNoRec( const RFunction& func ) const // No recursive test on subfunctions
{
    if ( op == Fun )
    {
        if ( *pfunc == func )
            return 1;
        else return 0;
    }
    if ( mmb1 != NULL && mmb1->ContainFuncNoRec( func ) )return 1;
    if ( mmb2 != NULL && mmb2->ContainFuncNoRec( func ) )return 1;
    return 0;
}

signed char ROperation::ContainFunc( const RFunction& func ) const // Recursive test on subfunctions
{
    if ( containfuncflag )return 0;
    if ( op == Fun && *pfunc == func )return 1;
    containfuncflag = 1;
    if ( op == Fun )if ( pfunc->op.ContainFunc( func ) ){containfuncflag = 0;return 1;}
    if ( mmb1 != NULL && mmb1->ContainFunc( func ) ){containfuncflag = 0;return 1;}
    if ( mmb2 != NULL && mmb2->ContainFunc( func ) ){containfuncflag = 0;return 1;}
    containfuncflag = 0;
    return 0;
}

signed char ROperation::HasError( const ROperation*pop ) const
{
    if ( op == ErrOp )return 1;
    if ( op == Fun && pfunc->type == 1 && pfunc->op == *( pop == NULL ? this : pop ) )return 1;
    if ( op == Fun && pfunc->type == 1 && pfunc->op.HasError(( pop == NULL ? this : pop ) ) )return 1;
    if ( mmb1 != NULL && mmb1->HasError(( pop == NULL ? this : pop ) ) )return 1;
    if ( mmb2 != NULL && mmb2->HasError(( pop == NULL ? this : pop ) ) )return 1;
    if ( op == Fun && pfunc->type == -1 )return 1;
    return 0;
}

int ROperation::NMembers() const //Number of members for an operation like a,b,c...
{
    if ( op == Fun )return( pfunc->type == 1 ? pfunc->op.NMembers() : pfunc->type == 0 ? 1 : 0 );
    if ( op != Juxt )return 1;
    else if ( mmb2 == NULL )return 0;
    else return 1 + mmb2->NMembers();
}

ROperation ROperation::NthMember( int n ) const
{
    PRFunction prf;
    if ( op == Fun && pfunc->type == 1 && pfunc->op.NMembers() > 1 )
    {
        prf = new RFunction( pfunc->op.NthMember( n ), pfunc->nvars, pfunc->ppvar );
        char*s = new char[strlen( pfunc->name )+10];
        sprintf( s, "(%s_%i)", pfunc->name, n );
        prf->SetName( s );
        delete[]s;
        return( *prf )( *mmb2 );
    }
    if ( n == 1 )
    {
        if ( op != Juxt )return *this;
        else if ( mmb1 != NULL )return *mmb1;
        else return ErrVal;
    };
    if ( op != Juxt )return ErrVal;
    if ( n > 1 && mmb2 != NULL )return mmb2->NthMember( n - 1 );
    return ErrVal;
}

ROperation ROperation::Substitute( const RVar& var, const ROperation& rop ) const // Replaces variable var with expression rop
{
    if ( !ContainVar( var ) )return *this;
    if ( op == Var )return rop;
    ROperation r;
    r.op = op;
    r.pvar = pvar;
    r.pvarval = pvarval;
    r.ValC = ValC;
    r.pfunc = pfunc;
    if ( mmb1 != NULL )r.mmb1 = new ROperation( mmb1->Substitute( var, rop ) );
    else r.mmb1 = NULL;
    if ( mmb2 != NULL )r.mmb2 = new ROperation( mmb2->Substitute( var, rop ) );
    else r.mmb2 = NULL;
    return r;
}

ROperation ROperation::Diff( const RVar& var ) const
{
    if ( !ContainVar( var ) )return 0.0;
    if ( op == Var )return 1.0;
    ROperation **ppop1, op2;
    int i, j;
    switch ( op )
    {
    case Juxt:
        return( mmb1->Diff( var ), mmb2->Diff( var ) );
    case Add:
        return( mmb1->Diff( var ) + mmb2->Diff( var ) );
    case Sub:
        return( mmb1->Diff( var ) - mmb2->Diff( var ) );
    case Opp:
        return( -mmb2->Diff( var ) );
    case Mult:
        return(( *mmb1 )*( mmb2->Diff( var ) ) + ( *mmb2 )*( mmb1->Diff( var ) ) );
    case Div:
        if ( mmb2->ContainVar( var ) )return((( *mmb2 )*( mmb1->Diff( var ) ) - ( *mmb1 )*( mmb2->Diff( var ) ) ) / (( *mmb2 ) ^ 2 ) );
        else return( mmb1->Diff( var ) / ( *mmb2 ) );
    case Pow:
        if ( mmb2->ContainVar( var ) )return(( *this )*( log( *mmb1 )*mmb2->Diff( var ) +
                                                 ( *mmb2 )*mmb1->Diff( var ) / ( *mmb1 ) ) );
        else
            return ( *mmb2 )*mmb1->Diff( var )*(( *mmb1 ) ^( *mmb2 - 1 ) );
    case Sqrt:
        return( mmb2->Diff( var ) / ( 2*sqrt( *mmb2 ) ) );
    case NthRoot:
    {ROperation interm = ( *mmb2 ) ^( 1 / ( *mmb1 ) );return interm.Diff( var );};
    case E10:
    {ROperation interm = ( *mmb1 ) * ( 10 ^( *mmb2 ) );return interm.Diff( var );}
    ;;
    case Ln:
        return ( mmb2->Diff( var ) / ( *mmb2 ) );
    case Exp:
        return ( mmb2->Diff( var )*( *this ) );
    case Sin:
        return ( mmb2->Diff( var )*cos( *mmb2 ) );
    case Cos:
        return ( -mmb2->Diff( var )*sin( *mmb2 ) );
    case Tg:
        return ( mmb2->Diff( var )*( 1 + (( *this ) ^ 2 ) ) );
    case Atan:
        if ( mmb2->op != Juxt )return( mmb2->Diff( var ) / ( 1 + (( *mmb2 ) ^ 2 ) ) );
        else return (( mmb2->NthMember( 1 ).Diff( var ) )*( mmb2->NthMember( 2 ) ) - ( mmb2->NthMember( 2 ).Diff( var ) )*( mmb2->NthMember( 1 ) ) ) / ((( mmb2->NthMember( 1 ) ) ^ 2 ) + (( mmb2->NthMember( 2 ) ) ^ 2 ) );
    case Asin:
        return( mmb2->Diff( var ) / sqrt( 1 - (( *mmb2 ) ^ 2 ) ) );
    case Acos:
        return( -mmb2->Diff( var ) / sqrt( 1 - (( *mmb2 ) ^ 2 ) ) );
    case Abs:
        return( mmb2->Diff( var )*( *mmb2 ) / ( *this ) );
    case Ent:
        return( mmb1->Diff( var ) );
    case Fun:
        if ( pfunc->type == -1 || pfunc->type == 0 )return ErrVal;
        if ( pfunc->nvars == 0 )return 0.;
        else if ( pfunc->op.NMembers() > 1 )
        {
            j = pfunc->op.NMembers();
            ppop1 = new ROperation*[j];
            for ( i = 0;i < j;i++ )ppop1[i] = new ROperation( NthMember( i + 1 ).Diff( var ) );
            op2 = ApplyOperator( pfunc->nvars, ppop1, &operator, );
            for ( i = 0;i < pfunc->nvars;i++ )delete ppop1[i];
            delete[]ppop1;
            return op2;
        }
        else
        {
            ppop1 = new ROperation*[pfunc->nvars];
            for ( i = 0;i < pfunc->nvars;i++ )
            {
                ppop1[i] = new ROperation( pfunc->op.Diff( *pfunc->ppvar[i] ) );
                for ( j = 0;j < pfunc->nvars;j++ )
                    *ppop1[i] = ppop1[i]->Substitute( *pfunc->ppvar[j], mmb2->NthMember( j + 1 ) );
                *ppop1[i] = ( mmb2->NthMember( i + 1 ).Diff( var ) ) * ( *ppop1[i] );
            }
            op2 = ApplyOperator( pfunc->nvars, ppop1, &::operator+ );
            for ( i = 0;i < pfunc->nvars;i++ )delete ppop1[i];
            delete[]ppop1;
            return op2;
            // In the obtained expression, f' will have been replaced with its expression but f will remain pointing to itself ; this could cause some trouble if changing f afterwards
        }
    default:
        return ErrVal;
    };
}

char* ValToStr( double x )
{
    char*s = new char[30];
    if ( x == ( double )3.141592653589793238462643383279L )sprintf( s, "pi" );
    else sprintf( s, "%.16G", x );
    return s;
}

char* ROperation::Expr() const
{
    char*s = NULL, *s1 = NULL, *s2 = NULL;
    int n = 10;
    signed char f = 0, g = 0;
    if ( op == Fun )if ( strlen( pfunc->name ) > 4 )n += strlen( pfunc->name ) - 4;
    if ( mmb1 != NULL ){s1 = mmb1->Expr();n += strlen( s1 );f = IsFunction( mmb1->op );}
    if ( mmb2 != NULL ){s2 = mmb2->Expr();n += strlen( s2 );g = IsFunction( mmb2->op );}
    s = new char[n];
    switch ( op )
    {
    case Num:
        return ValToStr( ValC );
    case Var:
        return CopyStr( pvar->name );
    case Juxt:
        sprintf( s, "%s , %s", s1, s2 );
        break;
    case Add:
        f = f || ( mmb1->op == Juxt );
        g = g || ( mmb2->op == Juxt );
        if ( f && g )sprintf( s, "(%s)+(%s)", s1, s2 );
        else
            if ( f )sprintf( s, "(%s)+%s", s1, s2 );
            else
                if ( g )sprintf( s, "%s+(%s)", s1, s2 );
                else
                    sprintf( s, "%s+%s", s1, s2 );
        break;
    case Sub:
        f = f || ( mmb1->op == Juxt );
        g = g || ( mmb2->op == Juxt || mmb2->op == Add || mmb2->op == Sub );
        if ( f && g )sprintf( s, "(%s)-(%s)", s1, s2 );
        else
            if ( f )sprintf( s, "(%s)-%s", s1, s2 );
            else
                if ( g )sprintf( s, "%s-(%s)", s1, s2 );
                else
                    sprintf( s, "%s-%s", s1, s2 );
        break;
    case Opp:
        if ( mmb2->op == Add || mmb2->op == Sub || mmb2->op == Juxt )sprintf( s, "-(%s)", s2 );
        else
            sprintf( s, "-%s", s2 );
        break;
    case Mult:
        f = f || ( mmb1->op == Juxt || mmb1->op == Add || mmb1->op == Sub || mmb1->op == Opp || mmb1->op == Div );
        g = g || ( mmb2->op == Juxt || mmb2->op == Add || mmb2->op == Sub || mmb2->op == Opp );
        if ( f && g )sprintf( s, "(%s)*(%s)", s1, s2 );
        else
            if ( f )sprintf( s, "(%s)*%s", s1, s2 );
            else
                if ( g )sprintf( s, "%s*(%s)", s1, s2 );
                else
                    sprintf( s, "%s*%s", s1, s2 );
        break;
    case Div:
        f = f || ( mmb1->op == Juxt || mmb1->op == Add || mmb1->op == Sub || mmb1->op == Opp || mmb1->op == Div );
        g = g || ( mmb2->op == Juxt || mmb2->op == Add || mmb2->op == Sub || mmb2->op == Opp || mmb2->op == Mult || mmb2->op == Div );
        if ( f && g )sprintf( s, "(%s)/(%s)", s1, s2 );
        else
            if ( f )sprintf( s, "(%s)/%s", s1, s2 );
            else
                if ( g )sprintf( s, "%s/(%s)", s1, s2 );
                else
                    sprintf( s, "%s/%s", s1, s2 );
        break;
    case Pow:
        f = ( mmb1->op != Num && mmb1->op != Var );
        g = ( mmb2->op != Num && mmb2->op != Var );
        if ( f && g )sprintf( s, "(%s)^(%s)", s1, s2 );
        else
            if ( f )sprintf( s, "(%s)^%s", s1, s2 );
            else
                if ( g )sprintf( s, "%s^(%s)", s1, s2 );
                else
                    sprintf( s, "%s^%s", s1, s2 );
        break;
    case Sqrt:
        g = ( mmb2->op != Num && mmb2->op != Var && !g );
        if ( g )sprintf( s, "sqrt(%s)", s2 );
        else sprintf( s, "sqrt %s", s2 );
        break;
    case NthRoot:
        f = ( mmb1->op != Num && mmb1->op != Var );
        g = ( mmb2->op != Num && mmb2->op != Var );
        if ( f && g )sprintf( s, "(%s)#(%s)", s1, s2 );
        else
            if ( f )sprintf( s, "(%s)#%s", s1, s2 );
            else
                if ( g )sprintf( s, "%s#(%s)", s1, s2 );
                else
                    sprintf( s, "%s#%s", s1, s2 );
        break;
    case E10:
        f = ( mmb1->op != Num && mmb1->op != Var );
        g = ( mmb2->op != Num && mmb2->op != Var );
        if ( f && g )sprintf( s, "(%s)E(%s)", s1, s2 );
        else
            if ( f )sprintf( s, "(%s)E%s", s1, s2 );
            else
                if ( g )sprintf( s, "%sE(%s)", s1, s2 );
                else
                    sprintf( s, "%sE%s", s1, s2 );
        break;
    case Ln:
        g = ( mmb2->op != Num && mmb2->op != Var && !g );
        if ( g )sprintf( s, "log(%s)", s2 );
        else sprintf( s, "log %s", s2 );
        break;
    case Exp:
        g = ( mmb2->op != Num && mmb2->op != Var && !g );
        if ( g )sprintf( s, "exp(%s)", s2 );
        else sprintf( s, "exp %s", s2 );
        break;
    case Sin:
        g = ( mmb2->op != Num && mmb2->op != Var && !g );
        if ( g )sprintf( s, "sin(%s)", s2 );
        else sprintf( s, "sin %s", s2 );
        break;
    case Cos:
        g = ( mmb2->op != Num && mmb2->op != Var && !g );
        if ( g )sprintf( s, "cos(%s)", s2 );
        else sprintf( s, "cos %s", s2 );
        break;
    case Tg:
        g = ( mmb2->op != Num && mmb2->op != Var && !g );
        if ( g )sprintf( s, "tan(%s)", s2 );
        else sprintf( s, "tan %s", s2 );
        break;
    case Atan:
        g = ( mmb2->op != Num && mmb2->op != Var && !g );
        if ( g )sprintf( s, "atan(%s)", s2 );
        else sprintf( s, "atan %s", s2 );
        break;
    case Asin:
        g = ( mmb2->op != Num && mmb2->op != Var && !g );
        if ( g )sprintf( s, "asin(%s)", s2 );
        else sprintf( s, "asin %s", s2 );
        break;
    case Acos:
        g = ( mmb2->op != Num && mmb2->op != Var && !g );
        if ( g )sprintf( s, "acos(%s)", s2 );
        else sprintf( s, "acos %s", s2 );
        break;
    case Abs:
        g = ( mmb2->op != Num && mmb2->op != Var && !g );
        if ( g )sprintf( s, "abs(%s)", s2 );
        else sprintf( s, "abs %s", s2 );
        break;
    case Ent:
        g = ( mmb2->op != Num && mmb2->op != Var && !g );
        if ( g )sprintf( s, "int(%s)", s2 );
        else sprintf( s, "int %s", s2 );
        break;
    case Fun:
        sprintf( s, "%s(%s)", pfunc->name, s2 );
        break;
    default:
        return CopyStr( "Error" );
    };
    if ( s1 != NULL )delete[] s1;
    if ( s2 != NULL )delete[] s2;
    return s;
}

const double sqrtmaxfloat = sqrt( DBL_MAX );
const double sqrtminfloat = sqrt( DBL_MIN );
const double inveps = .1 / DBL_EPSILON;

void  Addition( double*&p )
{
    if ( *p == ErrVal || fabsl( *p ) > sqrtmaxfloat ){*( --p ) = ErrVal;return;};
    if ( *( --p ) == ErrVal || fabsl( *p ) > sqrtmaxfloat ){*p = ErrVal;return;};
    *p += ( *( p + 1 ) );
}
void  Soustraction( double*&p )
{
    if ( *p == ErrVal || fabsl( *p ) > sqrtmaxfloat ){*( --p ) = ErrVal;return;};
    if ( *( --p ) == ErrVal || fabsl( *p ) > sqrtmaxfloat ){*p = ErrVal;return;};
    *p -= ( *( p + 1 ) );
}
void  Multiplication( double*&p )
{
    if ( fabsl( *p ) < sqrtminfloat ){*--p = 0;return;};
    if ( *p == ErrVal || fabsl( *p ) > sqrtmaxfloat ){*( --p ) = ErrVal;return;};
    if ( fabsl( *( --p ) ) < sqrtminfloat ){*p = 0;return;};
    if ( *p == ErrVal || fabsl( *p ) > sqrtmaxfloat ){*p = ErrVal;return;};
    *p *= ( *( p + 1 ) );
}
void  Division( double*&p )
{
    if ( fabsl( *p ) < sqrtminfloat || *p == ErrVal || fabsl( *p ) > sqrtmaxfloat )
        {*( --p ) = ErrVal;return;};
    if ( fabsl( *( --p ) ) < sqrtminfloat )*p = 0;
    else if ( *p == ErrVal || fabsl( *p ) > sqrtmaxfloat )
        {*p = ErrVal;return;};
    *p /= ( *( p + 1 ) );
}
void  Puissance( double*&p )
{
    double v2 = *p--, v1 = *p;
    if ( !v1 ){*p = 0;return;};
    if ( v2 == ErrVal || v1 == ErrVal || fabsl( v2*logl( fabsl( v1 ) ) ) > DBL_MAX_EXP ){*p = ErrVal;return;};
    *p = (( v1 > 0 || !fmodl( v2, 1 ) ) ? powl( v1, v2 ) : ErrVal );
}
void  RacineN( double*&p )
{
    double v2 = *p--, v1 = *p;
    if ( v1 == ErrVal || v2 == ErrVal || !v1 || v2*logl( fabsl( v1 ) ) < DBL_MIN_EXP ){*p = ErrVal;return;};
    if ( v2 >= 0 ){*p = powl( v2, 1 / v1 );return;};
    *p = (( fabsl( fmodl( v1, 2 ) ) == 1 ) ? -powl( -v2, 1 / v1 ) : ErrVal );
}
void  Puiss10( double*&p )
{
    if ( fabsl( *p ) < sqrtminfloat ){*( --p ) = 0;return;};
    if ( *p == ErrVal || fabsl( *p ) > DBL_MAX_10_EXP ){*( --p ) = ErrVal;return;};
    if ( fabsl( *( --p ) ) < sqrtminfloat )*p = 0;
    else if ( *p == ErrVal || fabsl( *p ) > sqrtmaxfloat )
        {*p = ErrVal;return;};
    *p *= pow10l( *( p + 1 ) );
}
void  ArcTangente2( double*&p )
{
    if ( *p == ErrVal || fabsl( *p ) > inveps ){*( --p ) = ErrVal;return;};
    if ( *( --p ) == ErrVal || fabsl( *p ) > inveps ){*p = ErrVal;return;};
    *p = ( *p || *( p + 1 ) ? atan2( *p, *( p + 1 ) ) : ErrVal );
}

void  NextVal( double*& ){}
void  RFunc( double*& ){}
void  JuxtF( double*& ){}
void  Absolu( double*&p ){*p = (( *p == ErrVal ) ? ErrVal : fabsl( *p ) );}
void  Oppose( double*&p ){*p = (( *p == ErrVal ) ? ErrVal : -*p );}
void  ArcSinus( double*&p )
{*p = (( *p == ErrVal || fabsl( *p ) > 1 ) ? ErrVal : asinl( *p ) );}
void  ArcCosinus( double*&p )
{*p = (( *p == ErrVal || fabsl( *p ) > 1 ) ? ErrVal : acosl( *p ) );}
void  ArcTangente( double*&p )
{*p = (( *p == ErrVal ) ? ErrVal : atanl( *p ) );}
void  Logarithme( double*&p )
{*p = (( *p == ErrVal || *p <= 0 ) ? ErrVal : logl( *p ) );}
void  Exponentielle( double*&p )
{*p = (( *p == ErrVal || *p > DBL_MAX_EXP ) ? ErrVal : expl( *p ) );}
void  Sinus( double*&p )
{*p = (( *p == ErrVal || fabsl( *p ) > inveps ) ? ErrVal : sinl( *p ) );}
void  Tangente( double*&p )
{*p = (( *p == ErrVal || fabsl( *p ) > inveps ) ? ErrVal : tanl( *p ) );}
void  Cosinus( double*&p )
{*p = (( *p == ErrVal || fabsl( *p ) > inveps ) ? ErrVal : cosl( *p ) );}
void  Racine( double*&p )
{*p = (( *p == ErrVal || *p > sqrtmaxfloat || *p < 0 ) ? ErrVal : sqrtl( *p ) );}
void  Entier( double*&p )
{*p = (( *p == ErrVal || fabsl( *p ) > inveps ) ? ErrVal : (int)( *p ) );}
void FonctionError( double*&p ){*p = ErrVal;}
inline void ApplyRFunc( PRFunction rf, double*&p )
{p -= rf->nvars - 1;*p = rf->Val( p );}

double ROperation::Val() const
{
    pfoncld*p1 = pinstr;
    double**p2 = pvals, *p3 = ppile - 1;
    PRFunction*p4 = pfuncpile;
    for ( ;*p1 != NULL;p1++ )
        if ( *p1 == &NextVal )*( ++p3 ) = **( p2++ );
        else
            if ( *p1 == &RFunc ) ApplyRFunc( *( p4++ ), p3 );
            else ( **p1 )( p3 );
    return *p3;
}

void BCDouble( pfoncld*&pf, pfoncld*pf1, pfoncld*pf2,
               double**&pv, double**pv1, double**pv2,
               double*&pp, double*pp1, double*pp2,
               RFunction**&prf, RFunction**prf1, RFunction**prf2,
               pfoncld f )
{
    pfoncld*pf3, *pf4 = pf1;
    long n1, n2;
    for ( n1 = 0;*pf4 != NULL;pf4++, n1++ );
    for ( n2 = 0, pf4 = pf2;*pf4 != NULL;pf4++, n2++ );
    pf = new pfoncld[n1+n2+2];
    for ( pf3 = pf, pf4 = pf1;*pf4 != NULL;pf3++, pf4++ )*pf3 = *pf4;
    for ( pf4 = pf2;*pf4 != NULL;pf3++, pf4++ )*pf3 = *pf4;
    *pf3++ = f;
    *pf3 = NULL;//delete[]pf1,pf2;
    double**pv3, **pv4 = pv1;
    for ( n1 = 0;*pv4 != NULL;pv4++, n1++ );
    for ( n2 = 0, pv4 = pv2;*pv4 != NULL;pv4++, n2++ );
    pv = new double*[n1+n2+1];
    for ( pv3 = pv, pv4 = pv1;*pv4 != NULL;pv3++, pv4++ )*pv3 = *pv4;
    for ( pv4 = pv2;*pv4 != NULL;pv3++, pv4++ )*pv3 = *pv4;
    *pv3 = NULL;//delete[]pv1,pv2;
    double*pp3, *pp4 = pp1;
    for ( n1 = 0;*pp4 != ErrVal;pp4++, n1++ );
    for ( n2 = 0, pp4 = pp2;*pp4 != ErrVal;pp4++, n2++ );
    pp = new double[n1+n2+1];  // Really need to add and not to take max(n1,n2) in case of Juxt operator
    for ( pp3 = pp, pp4 = pp1;*pp4 != ErrVal;pp3++, pp4++ )*pp3 = 0;
    for ( pp4 = pp2;*pp4 != ErrVal;pp3++, pp4++ )*pp3 = 0;
    *pp3 = ErrVal;//delete[]pp1,pp2;
    PRFunction*prf3, *prf4 = prf1;
    for ( n1 = 0;*prf4 != NULL;prf4++, n1++ );
    for ( n2 = 0, prf4 = prf2;*prf4 != NULL;prf4++, n2++ );
    prf = new PRFunction[n1+n2+1];
    for ( prf3 = prf, prf4 = prf1;*prf4 != NULL;prf3++, prf4++ )*prf3 = *prf4;
    for ( prf4 = prf2;*prf4 != NULL;prf3++, prf4++ )*prf3 = *prf4;
    *prf3 = NULL;//delete[]prf1,prf2;
}

void BCSimple( pfoncld*&pf, pfoncld*pf1, double**&pv, double**pv1,
               double*&pp, double*pp1, RFunction**&prf, RFunction**prf1, pfoncld f )
{
    pfoncld*pf3, *pf4 = pf1;
    long n;
    for ( n = 0;*pf4 != NULL;pf4++, n++ );
    pf = new pfoncld[n+2];
    for ( pf4 = pf1, pf3 = pf;*pf4 != NULL;pf3++, pf4++ )*pf3 = *pf4;
    *pf3++ = f;
    *pf3 = NULL;//delete[]pf1;
    double**pv3, **pv4 = pv1;
    for ( n = 0;*pv4 != NULL;pv4++, n++ );
    pv = new double*[n+1];
    for ( pv3 = pv, pv4 = pv1;*pv4 != NULL;pv3++, pv4++ )*pv3 = *pv4;
    *pv3 = NULL;//delete[]pv1;
    double*pp3, *pp4 = pp1;
    for ( n = 0;*pp4 != ErrVal;pp4++, n++ );
    pp = new double[n+1];
    for ( pp3 = pp, pp4 = pp1;*pp4 != ErrVal;pp3++, pp4++ )*pp3 = 0;
    *pp3 = ErrVal;//delete[]pp1;
    RFunction**prf3, **prf4 = prf1;
    for ( n = 0;*prf4 != NULL;prf4++, n++ );
    prf = new RFunction*[n+1];
    for ( prf3 = prf, prf4 = prf1;*prf4 != NULL;prf3++, prf4++ )*prf3 = *prf4;
    *prf3 = NULL;//delete[]prf1;
}

void BCFun( pfoncld*&pf, pfoncld*pf1, double**&pv, double**pv1,
            double*&pp, double*pp1, RFunction**&prf, RFunction**prf1, PRFunction rf )
{
    pfoncld*pf3, *pf4 = pf1;
    long n;
    for ( n = 0;*pf4 != NULL;pf4++, n++ );
    pf = new pfoncld[n+2];
    for ( pf4 = pf1, pf3 = pf;*pf4 != NULL;pf3++, pf4++ )*pf3 = *pf4;
    *pf3++ = &RFunc;
    *pf3 = NULL;//delete[]pf1;
    double**pv3, **pv4 = pv1;
    for ( n = 0;*pv4 != NULL;pv4++, n++ );
    pv = new double*[n+1];
    for ( pv3 = pv, pv4 = pv1;*pv4 != NULL;pv3++, pv4++ )*pv3 = *pv4;
    *pv3 = NULL;//delete[]pv1;
    double*pp3, *pp4 = pp1;
    for ( n = 0;*pp4 != ErrVal;pp4++, n++ );
    pp = new double[n+1];
    for ( pp3 = pp, pp4 = pp1;*pp4 != ErrVal;pp3++, pp4++ )*pp3 = 0;
    *pp3 = ErrVal;//delete[]pp1;
    PRFunction*prf3, *prf4 = prf1;
    for ( n = 0;*prf4 != NULL;prf4++, n++ );
    prf = new PRFunction[n+2];
    for ( prf4 = prf1, prf3 = prf;*prf4 != NULL;prf3++, prf4++ )*prf3 = *prf4;
    *prf3++ = rf;
    *prf3 = NULL;//delete[]pf1;
}

void ROperation::BuildCode()
{
    //  if(mmb1!=NULL)mmb1->BuildCode();if(mmb2!=NULL)mmb2->BuildCode();
    if ( pinstr != NULL ){delete[]pinstr;pinstr = NULL;}
    if ( pvals != NULL ){delete[]pvals;pvals = NULL;}//does not delete pvals[0] in case it was to be deleted... (no way to know)
    if ( ppile != NULL ){delete[]ppile;ppile = NULL;}
    if ( pfuncpile != NULL ){delete[]pfuncpile;pfuncpile = NULL;}
    switch ( op )
    {
    case ErrOp:
        pinstr = new pfoncld[2];
        pinstr[0] = &NextVal;
        pinstr[1] = NULL;
        pvals = new double*[2];
        pvals[0] = new double( ErrVal );
        pvals[1] = NULL;
        ppile = new double[2];
        ppile[0] = 0;
        ppile[1] = ErrVal;
        pfuncpile = new RFunction*[1];
        pfuncpile[0] = NULL;
        break;
    case Num:
        pinstr = new pfoncld[2];
        pinstr[0] = &NextVal;
        pinstr[1] = NULL;
        pvals = new double*[2];
        pvals[0] = new double( ValC );
        pvals[1] = NULL;
        ppile = new double[2];
        ppile[0] = 0;
        ppile[1] = ErrVal;
        pfuncpile = new RFunction*[1];
        pfuncpile[0] = NULL;
        break;
    case Var:
        pinstr = new pfoncld[2];
        pinstr[0] = &NextVal;
        pinstr[1] = NULL;
        pvals = new double*[2];
        pvals[0] = pvarval;
        pvals[1] = NULL;
        ppile = new double[2];
        ppile[0] = 0;
        ppile[1] = ErrVal;
        pfuncpile = new RFunction*[1];
        pfuncpile[0] = NULL;
        break;
    case Juxt:
        BCDouble( pinstr, mmb1->pinstr, mmb2->pinstr,
                  pvals, mmb1->pvals, mmb2->pvals, ppile, mmb1->ppile, mmb2->ppile, pfuncpile, mmb1->pfuncpile, mmb2->pfuncpile, &JuxtF );
        break;
    case Add:
        BCDouble( pinstr, mmb1->pinstr, mmb2->pinstr,
                  pvals, mmb1->pvals, mmb2->pvals, ppile, mmb1->ppile, mmb2->ppile, pfuncpile, mmb1->pfuncpile, mmb2->pfuncpile, &Addition );
        break;
    case Sub:
        BCDouble( pinstr, mmb1->pinstr, mmb2->pinstr,
                  pvals, mmb1->pvals, mmb2->pvals, ppile, mmb1->ppile, mmb2->ppile, pfuncpile, mmb1->pfuncpile, mmb2->pfuncpile, &Soustraction );
        break;
    case Mult:
        BCDouble( pinstr, mmb1->pinstr, mmb2->pinstr,
                  pvals, mmb1->pvals, mmb2->pvals, ppile, mmb1->ppile, mmb2->ppile, pfuncpile, mmb1->pfuncpile, mmb2->pfuncpile, &Multiplication );
        break;
    case Div:
        BCDouble( pinstr, mmb1->pinstr, mmb2->pinstr,
                  pvals, mmb1->pvals, mmb2->pvals, ppile, mmb1->ppile, mmb2->ppile, pfuncpile, mmb1->pfuncpile, mmb2->pfuncpile, &Division );
        break;
    case Pow:
        BCDouble( pinstr, mmb1->pinstr, mmb2->pinstr,
                  pvals, mmb1->pvals, mmb2->pvals, ppile, mmb1->ppile, mmb2->ppile, pfuncpile, mmb1->pfuncpile, mmb2->pfuncpile, &Puissance );
        break;
    case NthRoot:
        BCDouble( pinstr, mmb1->pinstr, mmb2->pinstr,
                  pvals, mmb1->pvals, mmb2->pvals, ppile, mmb1->ppile, mmb2->ppile, pfuncpile, mmb1->pfuncpile, mmb2->pfuncpile, &RacineN );
        break;
    case E10:
        BCDouble( pinstr, mmb1->pinstr, mmb2->pinstr,
                  pvals, mmb1->pvals, mmb2->pvals, ppile, mmb1->ppile, mmb2->ppile, pfuncpile, mmb1->pfuncpile, mmb2->pfuncpile, &Puiss10 );
        break;
    case Opp:
        BCSimple( pinstr, mmb2->pinstr, pvals, mmb2->pvals,
                  ppile, mmb2->ppile, pfuncpile, mmb2->pfuncpile, &Oppose );
        break;
    case Sin:
        BCSimple( pinstr, mmb2->pinstr, pvals, mmb2->pvals,
                  ppile, mmb2->ppile, pfuncpile, mmb2->pfuncpile, &Sinus );
        break;
    case Sqrt:
        BCSimple( pinstr, mmb2->pinstr, pvals, mmb2->pvals,
                  ppile, mmb2->ppile, pfuncpile, mmb2->pfuncpile, &Racine );
        break;
    case Ln:
        BCSimple( pinstr, mmb2->pinstr, pvals, mmb2->pvals,
                  ppile, mmb2->ppile, pfuncpile, mmb2->pfuncpile, &Logarithme );
        break;
    case Exp:
        BCSimple( pinstr, mmb2->pinstr, pvals, mmb2->pvals,
                  ppile, mmb2->ppile, pfuncpile, mmb2->pfuncpile, &Exponentielle );
        break;
    case Cos:
        BCSimple( pinstr, mmb2->pinstr, pvals, mmb2->pvals,
                  ppile, mmb2->ppile, pfuncpile, mmb2->pfuncpile, &Cosinus );
        break;
    case Tg:
        BCSimple( pinstr, mmb2->pinstr, pvals, mmb2->pvals,
                  ppile, mmb2->ppile, pfuncpile, mmb2->pfuncpile, &Tangente );
        break;
    case Atan:
        BCSimple( pinstr, mmb2->pinstr, pvals, mmb2->pvals,
                  ppile, mmb2->ppile, pfuncpile, mmb2->pfuncpile, ( mmb2->NMembers() > 1 ? &ArcTangente2 : &ArcTangente ) );
        break;
    case Asin:
        BCSimple( pinstr, mmb2->pinstr, pvals, mmb2->pvals,
                  ppile, mmb2->ppile, pfuncpile, mmb2->pfuncpile, &ArcSinus );
        break;
    case Acos:
        BCSimple( pinstr, mmb2->pinstr, pvals, mmb2->pvals,
                  ppile, mmb2->ppile, pfuncpile, mmb2->pfuncpile, &ArcCosinus );
        break;
    case Abs:
        BCSimple( pinstr, mmb2->pinstr, pvals, mmb2->pvals,
                  ppile, mmb2->ppile, pfuncpile, mmb2->pfuncpile, &Absolu );
        break;
    case Ent:
        BCSimple( pinstr, mmb2->pinstr, pvals, mmb2->pvals,
                  ppile, mmb2->ppile, pfuncpile, mmb2->pfuncpile, &Entier );
        break;
    case Fun:
        BCFun( pinstr, mmb2->pinstr, pvals, mmb2->pvals, ppile,
               mmb2->ppile, pfuncpile, mmb2->pfuncpile, pfunc );
        break;
    default:
        BCSimple( pinstr, mmb2->pinstr, pvals, mmb2->pvals,
                  ppile, mmb2->ppile, pfuncpile, mmb2->pfuncpile, &FonctionError );
    }
}
