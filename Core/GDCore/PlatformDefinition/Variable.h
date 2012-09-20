/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef GDCORE_VARIABLE_H
#define GDCORE_VARIABLE_H
#include <string>

namespace gd
{

/**
 * \brief Defines a variable which can be used by an object, a layout or a project for example.
 *
 * \see gd::VariablesContainer
 *
 * \ingroup PlatformDefinition
 */
class GD_CORE_API Variable
{
public:
    Variable();
    virtual ~Variable();

    /**
     * Must return the name of the variable
     */
    virtual const std::string & GetName() const =0;

    /**
     * Must change the name of the variable
     */
    virtual void SetName(const std::string & name) =0;

    /**
     * Must return the content of the variable as a string.
     * \note Game Develop do not do any assumption about what is the real type of the variable: If the variable does not represent a string, then
     * the variable must convert its value to a string representation and return it.
     */
    virtual const std::string & GetString() const =0;

    /**
     * Must change the content of the variable.
     * \note Game Develop do not do any assumption about what is the real type of the variable: If the variable does not represent a string, then
     * the string passed as argument must be converted to the desired value.
     */
    virtual void SetString(const std::string & value) =0;
};

}

#endif // GDCORE_VARIABLE_H







