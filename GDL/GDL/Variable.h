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
 * \brief Class used to represent a simple Game Develop variable.
 * Example :
 * \code
 * myObject->variables.ObtainVariable("Life") = 100;
 * myObject->variables.ObtainVariable("Armor") += 10;
 * \endcode
 */
class GD_API Variable
{
    public:

        /**
         * Construct a Variable from its name
         */
        Variable(std::string name_) : name(name_), value(0), isNumber(true) {};
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
        double GetValue() const;

        /**
         * Change value
         */
        void SetValue(double val);

        //Operators are overloaded to allow accessing to variable using a simple int-like semantic.

        void operator=(double val)  {SetValue(val);};
        void operator+=(double val) {SetValue(val+GetValue());}
        void operator-=(double val) {SetValue(GetValue()-val);}
        void operator*=(double val) {SetValue(val*GetValue());}
        void operator/=(double val) {SetValue(GetValue()/val);}

        bool operator<=(double val) const { return GetValue() <= val;};
        bool operator>=(double val) const { return GetValue() >= val;};
        bool operator<(double val) const { return GetValue() < val;};
        bool operator>(double val) const { return GetValue() > val;};
        bool operator==(double val) const { return GetValue() == val;};
        bool operator!=(double val) const { return GetValue() != val;};

        /**
         * Get value as a string
         */
        const std::string & GetString() const;

        /**
         * Change string of the variable
         */
        void SetString(const std::string & val);

        //Operators are overloaded to allow accessing to variable using a simple string-like semantic.

        void operator=(const std::string & val)  {SetString(val);};
        void operator+=(const std::string & val) {SetString(GetString()+val);}

        bool operator==(const std::string & val) const { return GetString() == val;};
        bool operator!=(const std::string & val) const { return GetString() != val;};

    private:
        std::string name;
        mutable double value;
        mutable std::string str;
        mutable bool isNumber;
};

/**
 * Functor testing variable name
 */
struct VariableHasName : public std::binary_function<const Variable &, std::string, bool> {
    bool operator()(const Variable & variable, const std::string & name) const { return variable.GetName() == name; }
};


#endif // VARIABLE_H
