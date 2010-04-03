#include "GDL/Variable.h"
#include <string>
#include <sstream>

using namespace std;

Variable::Variable(string name_) :
name(name_),
value(0),
texte("")
{
    //ctor
}

Variable::~Variable()
{
    //dtor
}

void Variable::Setvalue(double val)
{
    value = val;

    stringstream s; s << (val);
    texte = s.str();
}

void Variable::Settexte(string val)
{
    texte = val;

    stringstream ss;
    ss << val;
    ss >> value;
}

void Variable::operator=(double val)
{
    Setvalue(val);
}

void Variable::operator+=(double val)
{
    Setvalue(val+Getvalue());
}

void Variable::operator-=(double val)
{
    Setvalue(Getvalue()-val);
}

void Variable::operator*=(double val)
{
    Setvalue(val*Getvalue());
}

void Variable::operator/=(double val)
{
    Setvalue(Getvalue()/val);
}

void Variable::operator=(string val)
{
    Settexte(val);
}

void Variable::operator+=(string val)
{
    Settexte(Gettexte()+val);
}
