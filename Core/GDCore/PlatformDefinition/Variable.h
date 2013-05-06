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
    Variable() : name(""), value(0), isNumber(true) {};
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
     * Return the content of the variable as a string.
     * \note Game Develop do not do any assumption about what is the real type of the variable: If the variable does not represent a string, then
     * the variable must convert its value to a string representation and return it.
     */
    virtual const std::string & GetString() const;

    /**
     * Change the content of the variable.
     * \note Game Develop do not do any assumption about what is the real type of the variable: If the variable does not represent a string, then
     * the string passed as argument must be converted to the desired value.
     */
    virtual void SetString(const std::string & value);

    /**
     * \brief Get value as a double
     */
    double GetValue() const;

    /**
     * \brief Change value
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

}

#endif // GDCORE_VARIABLE_H
