/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#ifndef AUTOMATISMSSHAREDDATA_H
#define AUTOMATISMSSHAREDDATA_H

#include <memory>
#include <GDCore/Utf8String.h>
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
    virtual std::shared_ptr<gd::AutomatismsSharedData> Clone() const { return std::shared_ptr<gd::AutomatismsSharedData>(new AutomatismsSharedData(*this));}

    /**
     * \brief Change the name identifying the automatism.
     */
    void SetName(gd::String name_) { name = name_; };

    /**
     * \brief Return the name identifying the automatism
     */
    gd::String GetName() { return name; }

    /**
     * \brief Return the name identifying the type of the automatism
     */
    gd::String GetTypeName() { return type; }

    /**
     * \brief Change name identifying the type of the automatism.
     */
    virtual void SetTypeName(const gd::String & type_) { type = type_; };

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
    virtual std::shared_ptr<AutomatismsRuntimeSharedData> CreateRuntimeSharedDatas()
    {
        return std::shared_ptr<AutomatismsRuntimeSharedData>();
    }

private:
    gd::String name; ///< A layout can have some automatisms with the same type, but with different names.
    gd::String type; ///< The type indicate of which type is the automatism.
};

}

#endif // AUTOMATISMSSHAREDDATA_H
