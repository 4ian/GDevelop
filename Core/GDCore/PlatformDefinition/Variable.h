/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef GDCORE_VARIABLE_H
#define GDCORE_VARIABLE_H
#include <string>

namespace gd
{

/**
 * \brief Defines a variable which can be used by an object, a layout or a project.
 *
 * \see gd::VariablesContainer
 *
 * \ingroup PlatformDefinition
 */
class GD_CORE_API Variable
{
public:

    /**
     * \brief Default constructor creating a variable with 0 as value.
     */
    Variable() : value(0), isNumber(true) {};
    virtual ~Variable() {};

    /**
     * \brief Return the content of the variable, considered as a string.
     */
    const std::string & GetString() const;

    /**
     * \brief Change the content of the variable, considered as a string.
     */
    void SetString(const std::string & newStr)
    {
        str = newStr;
        isNumber = false;
    }

    /**
     * \brief Return the content of the variable, considered as a number.
     */
    double GetValue() const;

    /**
     * \brief Change the content of the variable, considered as a number.
     */
    void SetValue(double val)
    {
        value = val;
        isNumber = true;
    }

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

    //Operators are overloaded to allow accessing to variable using a simple string-like semantic.
    void operator=(const std::string & val)  {SetString(val);};
    void operator+=(const std::string & val) {SetString(GetString()+val);}

    bool operator==(const std::string & val) const { return GetString() == val;};
    bool operator!=(const std::string & val) const { return GetString() != val;};

private:
    mutable double value;
    mutable std::string str;
    mutable bool isNumber;
};

}

#endif // GDCORE_VARIABLE_H
