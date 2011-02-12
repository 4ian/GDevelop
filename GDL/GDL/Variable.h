/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef VARIABLE_H
#define VARIABLE_H
#include <string>
#include <iostream>
#include <functional>

/**
 * \brief Class used to represent a simple variable
 */
class GD_API Variable
{
    public:

        /**
         * Construct a Variable from its name
         */
        Variable(std::string name_) : name(name_), value(0) {};
        virtual ~Variable() {};

        /**
         * Get name of the variable
         */
        const std::string & GetName() const { return name; }

        /**
         * Change name of the variable
         */
        void SetName(const std::string & newName) { name = newName; }

        /**
         * Get value as a double
         */
        inline double Getvalue() const { return value; }

        /**
         * Change value
         */
        void Setvalue(double val);

        /**
         * Changing value using = operator
         */
        void operator=(double val)  {Setvalue(val);};
        /**
         * Changing value using += operator
         */
        void operator+=(double val) {Setvalue(val+Getvalue());}
        /**
         * Changing value using -= operator
         */
        void operator-=(double val) {Setvalue(Getvalue()-val);}
        /**
         * Changing value using *= operator
         */
        void operator*=(double val) {Setvalue(val*Getvalue());}
        /**
         * Changing value using /= operator
         */
        void operator/=(double val) {Setvalue(Getvalue()/val);}

        /**
         * Get value as a string
         */
        inline const std::string & GetString() const { return str; }

        /**
         * Change string of the variable
         */
        void SetString(const std::string & val);
        /**
         * Change string of the variable
         */
        void operator=(const std::string & val)  {SetString(val);};
        /**
         * Append a string to the string of the variable
         */
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
