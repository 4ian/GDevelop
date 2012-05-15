#ifndef GDCORE_AUTOMATISM_H
#define GDCORE_AUTOMATISM_H
#include <string>


namespace gd
{

/**
 * \brief Base class used to represent an automatism that can be applied to an object
 *
 * \ingroup PlatformDefinition
 */
class Automatism
{
public:
    Automatism() {};
    virtual ~Automatism() {};

    /**
     * Must change the name identifying the automatism.
     */
    virtual void SetName(const std::string & name_) =0;

    /**
     * Must return the name identifying the automatism
     */
    virtual const std::string & GetName() const =0;

    /**
     * Must return the name identifying the type of the automatism
     */
    virtual const std::string & GetTypeName() const =0;

};

}

#endif // GDCORE_AUTOMATISM_H
