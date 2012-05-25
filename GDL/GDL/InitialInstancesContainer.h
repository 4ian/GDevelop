/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */
#ifndef INITIALINSTANCESCONTAINER_H
#define INITIALINSTANCESCONTAINER_H
#if defined(GD_IDE_ONLY)
#include "GDCore/PlatformDefinition/InitialInstancesContainer.h"
#endif
#include "GDL/Position.h"
class TiXmlElement;

/**
 * \brief Stores the initial instances of objects to be put on a layout.
 */
class GD_API InitialInstancesContainer
#if defined(GD_IDE_ONLY)
: public gd::InitialInstancesContainer
#endif
{
public:
    InitialInstancesContainer() {};
    virtual ~InitialInstancesContainer() {};

    #if defined(GD_IDE_ONLY)
    virtual InitialInstancesContainer * Clone() const { return new InitialInstancesContainer(*this); };
    virtual void Create(const gd::InitialInstancesContainer & source);
    #endif

    virtual unsigned int GetInstancesCount() const;
    virtual const InitialPosition & GetInstance(unsigned int index) const;
    virtual InitialPosition & GetInstance(unsigned int index);
    virtual void InsertNewInitialInstance();
    virtual void RemoveInstance(unsigned int index);
    virtual void RemoveInstance(const gd::InitialInstance & instance);

    #if defined(GD_IDE_ONLY)
    virtual void InsertInitialInstance(const gd::InitialInstance & instance);
    virtual void RemoveAllInstancesOnLayer(const std::string & layerName);
    virtual void MoveInstancesToLayer(const std::string & fromLayer, const std::string & toLayer);
    virtual void RemoveInitialInstancesOfObject(const std::string & objectName);
    virtual void RenameInstancesOfObject(const std::string & oldName, const std::string & newName);
    #endif

    virtual void LoadFromXml(const TiXmlElement * element);
    #if defined(GD_IDE_ONLY)
    virtual void SaveToXml(TiXmlElement * element) const;
    #endif

private:
    std::vector<InitialPosition> initialInstances;

    static InitialPosition badPosition;
};

#endif // INITIALINSTANCESCONTAINER_H
