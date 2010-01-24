#include "GDL/Point.h"
#include <string>

using namespace std;

Point::Point(const string & name_) :
name(name_),
x(0),
y(0)
{
    //ctor
}

Point::~Point()
{
    //dtor
}
