/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef AUTOMATISMSSHAREDDATA_H
#define AUTOMATISMSSHAREDDATA_H

#include <boost/shared_ptr.hpp>
#include <string>
class AutomatismsRuntimeSharedData;
class TiXmlElement;

namespace gd
{

/**
 * \brief Base class for defining automatisms shared datas.
 *
 * Automatisms can use shared datas, as if they were extending the Scene members.
 * Inherit from this class, and redefine Clone and CreateRuntimeSharedDatas.
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
     * Change the name identifying the automatism. Change also AutomatismId.
     */
    void SetName(std::string name_) { name = name_; };

    /**
     * Return the name identifying the automatism
     */
    std::string GetName() { return name; }

    /**
     * Return the name identifying the type of the automatism
     */
    std::string GetTypeName() { return type; }

    /**
     * Change name identifying the type of the automatism.
     */
    virtual void SetTypeName(const std::string & type_) { type = type_; };

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

    #if defined(GD_IDE_ONLY)
    /**
     * Save AutomatismsSharedData to XML
     */
    virtual void SaveToXml(TiXmlElement * eventElem) const {}
    #endif

    /**
     * Load AutomatismsSharedData from XML
     */
    virtual void LoadFromXml(const TiXmlElement * eventElem) {}

private:
    std::string name;
    std::string type; ///< The type indicate of which type is the automatism.
};

}

#endif // AUTOMATISMSSHAREDDATA_H
