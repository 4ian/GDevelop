/**
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef VARIABLE_H
#define VARIABLE_H
#include <string>
#include <iostream>
#include <functional>

/**
 * Class used to represent a simple variable
 */
class GD_API Variable
{
    public:

        Variable(std::string name_) : name(name_), value(0) {};
        virtual ~Variable() {};

        const std::string & GetName() const { return name; }
        void SetName(const std::string & newName) { name = newName; }

        inline double Getvalue() const { return value; }
        void Setvalue(double val);
        void operator=(double val)  {Setvalue(val);};
        void operator+=(double val) {Setvalue(val+Getvalue());}
        void operator-=(double val) {Setvalue(Getvalue()-val);}
        void operator*=(double val) {Setvalue(val*Getvalue());}
        void operator/=(double val) {Setvalue(Getvalue()/val);}

        inline const std::string & GetString() const { return str; }
        void SetString(const std::string & val);
        void operator=(const std::string & val)  {SetString(val);};
        void operator+=(const std::string & val) {SetString(GetString()+val);}
    private:
        std::string name;
        double value;
        std::string str;
};

/**
 * Functor testing variable name
 */
struct VariableHasName : public std::binary_function<const Variable &, std::string, bool> {
    bool operator()(const Variable & variable, const std::string & name) const { return variable.GetName() == name; }
};


#endif // VARIABLE_H
