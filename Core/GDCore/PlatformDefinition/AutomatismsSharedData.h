/*
 * GDevelop Core
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */

#ifndef AUTOMATISMSSHAREDDATA_H
#define AUTOMATISMSSHAREDDATA_H

#include <boost/shared_ptr.hpp>
#include <string>
class AutomatismsRuntimeSharedData;
namespace gd { class SerializerElement; }

namespace gd
{

/**
 * \brief Base class for defining data shared by automatisms having the same type and name.
 *
 * Automatisms can use shared data, as if they were extending the gd::Layout class.
 *
 * \note GD C++ Platform extensions writers : Inherit from this class, and redefine Clone and CreateRuntimeSharedDatas.
 *
 * \ingroup GameEngine
 */
class GD_CORE_API AutomatismsSharedData
{
public:
    AutomatismsSharedData() {};
    virtual ~AutomatismsSharedData();
    virtual boost::shared_ptr<gd::AutomatismsSharedData> Clone() const { return boost::shared_ptr<gd::AutomatismsSharedData>(new AutomatismsSharedData(*this));}

    /**
     * \brief Change the name identifying the automatism.
     */
    void SetName(std::string name_) { name = name_; };

    /**
     * \brief Return the name identifying the automatism
     */
    std::string GetName() { return name; }

    /**
     * \brief Return the name identifying the type of the automatism
     */
    std::string GetTypeName() { return type; }

    /**
     * \brief Change name identifying the type of the automatism.
     */
    virtual void SetTypeName(const std::string & type_) { type = type_; };

    #if defined(GD_IDE_ONLY)
    /**
     * \brief Serialize automatisms shared data.
     */
    virtual void SerializeTo(SerializerElement & element) const {};
    #endif

    /**
     * \brief Unserialize the automatisms shared data.
     */
    virtual void UnserializeFrom(const SerializerElement & element) {};

    //TODO : GD C++ Platform specific code :
    /**
     * Create Runtime equivalent of the shared datas.
     * Derived class have to redefine this so as to create an appropriate
     * object containing runtime shared datas.
     */
    virtual boost::shared_ptr<AutomatismsRuntimeSharedData> CreateRuntimeSharedDatas()
    {
        return boost::shared_ptr<AutomatismsRuntimeSharedData>();
    }

private:
    std::string name; ///< A layout can have some automatisms with the same type, but with different names.
    std::string type; ///< The type indicate of which type is the automatism.
};

}

#endif // AUTOMATISMSSHAREDDATA_H
