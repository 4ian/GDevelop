/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef GDCORE_VARIABLE_H
#define GDCORE_VARIABLE_H
#include <string>

namespace gd
{

class GD_CORE_API Variable
{
public:
    Variable();
    virtual ~Variable();

    virtual const std::string & GetName() const =0;
    virtual void SetName(const std::string & name) =0;

    virtual const std::string & GetString() const =0;
    virtual void SetString(const std::string & value) =0;

private:
};

}

#endif // GDCORE_VARIABLE_H
