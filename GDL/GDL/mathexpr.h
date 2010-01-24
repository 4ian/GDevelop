/*

mathexpr.h version 2.0

Copyright Yann OLLIVIER 1997-2000

This software may be freely distributed as is, including this whole notice.

It may be modified, but any modification should include this whole
notice as is and a description of the changes made.

This software may not be sold.

This software or any modified version of it may be freely used in free
programs. The program should include a copy of this whole notice.
If you want to use it in a program you sell, contact me

This software comes with absolutely no warranty.

*/

#ifndef _MATHEXPR_H
#define _MATHEXPR_H

#include<string.h>
#include<stdio.h>
#include<stdlib.h>
#include<math.h>
#include<float.h>

// Compatibility with long double-typed functions
#define atanl atan
#define asinl asin
#define acosl acos
#define expl exp
#define logl log
#define powl pow
#define pow10l(x) pow(10,x)
#define fabsl fabs
#define cosl cos
#define sinl sin
#define tanl tan
#define fmodl fmod
#define sqrtl sqrt


// Warning : if ints are short, everything will fail with strings longer than 32767 chars


const double ErrVal=DBL_MAX;

//Class definitions for operations

class RVar{
 public:
  char*name;double*pval;
  RVar(){name=NULL;pval=NULL;};
  RVar(const RVar&);
  RVar(const char*,double*);
  ~RVar();
  friend int operator==(const RVar&,const RVar&);
};
typedef RVar* PRVar;

enum ROperator{ErrOp,Juxt,Num,Var,Add,Sub,Opp,Mult,Div,Pow,Sqrt,
	       NthRoot,Abs,Sin,Cos,Tg,Ln,Exp,Acos,Asin,Atan,E10,Ent,Fun};

typedef void ((*pfoncld)(double*&));

class ROperation;
typedef ROperation* PROperation;
class RFunction;
typedef RFunction* PRFunction;

class ROperation{
  pfoncld*pinstr;double**pvals;double*ppile;RFunction**pfuncpile;
  mutable signed char containfuncflag;
  void BuildCode();
	void Destroy();
 public:
  ROperator op;
  PROperation mmb1,mmb2;
  double ValC;const RVar* pvar;double*pvarval;
  RFunction* pfunc;
  ROperation();
  ROperation(const ROperation&);
  ROperation(double);
  ROperation(const RVar&);
  ROperation(const char*sp,int nvarp=0,PRVar*ppvarp=NULL,int nfuncp=0,PRFunction*ppfuncp=NULL);
  ~ROperation();
  double Val() const;
  signed char ContainVar(const RVar&) const;
  signed char ContainFunc(const RFunction&) const;
  signed char ContainFuncNoRec(const RFunction&) const; // No recursive test on subfunctions
  ROperation NthMember(int) const;int NMembers() const;
  signed char HasError(const ROperation* =NULL) const;
  ROperation& operator=(const ROperation&);
  friend int operator==(const ROperation& ,const double);
  friend int operator==(const ROperation& ,const ROperation&);
  friend int operator!=(const ROperation& ,const ROperation&);
  ROperation operator+() const;ROperation operator-() const;
  friend ROperation operator,(const ROperation&,const ROperation&);
  friend ROperation operator+(const ROperation&,const ROperation&);
  friend ROperation operator-(const ROperation&,const ROperation&);
  friend ROperation operator*(const ROperation&,const ROperation&);
  friend ROperation operator/(const ROperation&,const ROperation&);
  friend ROperation operator^(const ROperation&,const ROperation&);  // Caution: wrong associativity and precedence
  friend ROperation sqrt(const ROperation&);
  friend ROperation abs(const ROperation&);
  friend ROperation sin(const ROperation&);
  friend ROperation cos(const ROperation&);
  friend ROperation tan(const ROperation&);
  friend ROperation log(const ROperation&);
  friend ROperation exp(const ROperation&);
  friend ROperation acos(const ROperation&);
  friend ROperation asin(const ROperation&);
  friend ROperation atan(const ROperation&);
  friend ROperation ent(const ROperation&);
  friend ROperation ApplyOperator(int,ROperation**,ROperation (*)(const ROperation&,const ROperation&));
  ROperation Diff(const RVar&) const; //  Differentiate w.r.t a variable
  char* Expr() const;
  ROperation Substitute(const RVar&,const ROperation&) const;
};

class RFunction{
  double*buf;
public:
  signed char type;
  double ((*pfuncval)(double));
  ROperation op;int nvars;RVar** ppvar;
  char*name;
  RFunction();
  RFunction(double ((*)(double)));
  RFunction(const ROperation& opp,RVar* pvarp);
  RFunction(const ROperation& opp,int nvarsp,RVar**ppvarp);
  RFunction(const RFunction&);
  ~RFunction();
  RFunction& operator=(const RFunction&);
  void SetName(const char*s);
  double Val(double) const;
  double Val(double*) const;
  friend int operator==(const RFunction&,const RFunction&);
  ROperation operator()(const ROperation&);
};


char* MidStr(const char*s,int i1,int i2);
char* CopyStr(const char*s);
char* InsStr(const char*s,int n,char c);
signed char EqStr(const char*s,const char*s2);
signed char CompStr(const char*s,int n,const char*s2);
char* DelStr(const char*s,int n);

#endif
