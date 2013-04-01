/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef GDCORE_INITIALINSTANCESCONTAINER_H
#define GDCORE_INITIALINSTANCESCONTAINER_H
#include <string>
#include <list>
#include "GDCore/PlatformDefinition/InitialInstance.h"
namespace gd { class InitialInstanceFunctor; }
class TiXmlElement;
#if !defined(GD_IDE_ONLY)
class RuntimeScene; //TODO: C++ Platform specific code.
#endif

namespace gd
{

/**
 * \brief Defines a container of gd::InitialInstances.
 *
 * The container must notably be able to ensure that pointers
 * to the elements of the container are not invalidated when
 * a change occurs ( through InsertNewInitialInstance or RemoveInstance
 * for example ). <br>
 * Thus, most implementations should use a std::list
 * for holding the instances. In this way, the container is not required
 * to provide a direct access to element based on an index. Instead,
 * the method IterateOverInstances is used to perform operations.
 */
class GD_CORE_API InitialInstancesContainer
{
public:
    InitialInstancesContainer() {};
    virtual ~InitialInstancesContainer();

    /**
     * Must return a pointer to a copy of the container.
     * A such method is needed as the IDE may want to store copies of some containers and so need a way to do polymorphic copies.
     *
     * Typical implementation example:
     * \code
     * return new MyContainer(*this);
     * \endcode
     */
    virtual InitialInstancesContainer * Clone() const { return new InitialInstancesContainer(*this); };

    #if defined(GD_IDE_ONLY)
    /**
     * Must construct the class from the source
     * A such method is needed as the IDE may want to store copies of some containers and so need a way to do polymorphic copies.
     *
     * Typical implementation example:
     * \code
     * try
     * {
     *     const MyContainer & castedSource = dynamic_cast<const MyContainer&>(source);
     *     operator=(castedSource);
     * }
     * catch(...) { std::cout << "WARNING: Tried to create a MyContainer object from an object which is not a MyContainer"; }
     * \endcode
     */
    virtual void Create(const InitialInstancesContainer & source);
    #endif

    /** \name Instances management
     * Members functions related to managing the instances
     */
    ///@{

    /**
     * Must return the number of instances
     */
    virtual unsigned int GetInstancesCount() const;

    #if defined(GD_IDE_ONLY)
    /**
     * Must apply \a func to each instance of the container.
     */
    virtual void IterateOverInstances(InitialInstanceFunctor & func);

    /**
     * Must insert the specified \a instance into the list and return a
     * a reference to the newly added instance.
     */
    virtual InitialInstance & InsertInitialInstance(const InitialInstance & instance);

    /**
     * Must insert a new blank instance at the end of the list and return a
     * a reference to the newly added instance.
     */
    virtual InitialInstance & InsertNewInitialInstance();

    /**
     * Must remove the specified \a instance
     */
    virtual void RemoveInstance(const gd::InitialInstance & instance);

    /**
     * Must remove all instances from layer \a layerName.
     */
    virtual void RemoveAllInstancesOnLayer(const std::string & layerName);

    /**
     * Must move instances on layer \a fromLayer to layer \a toLayer.
     */
    virtual void MoveInstancesToLayer(const std::string & fromLayer, const std::string & toLayer);

    /**
     * Must remove instances of object named \a objectName
     */
    virtual void RemoveInitialInstancesOfObject(const std::string & objectName);

    /**
     * Must change instances with object's name \a oldName to \a newName
     */
    virtual void RenameInstancesOfObject(const std::string & oldName, const std::string & newName);

    /**
     * Must return true if there is at least one instance on the layer named \a layerName.
     */
    virtual bool SomeInstancesAreOnLayer(const std::string & layerName);
    #endif
    ///@}

    /** \name Saving and loading
     * Members functions related to saving and loading the object.
     */
    ///@{

    #if defined(GD_IDE_ONLY)
    /**
     * Called to save the layout to a TiXmlElement.
     */
    virtual void SaveToXml(TiXmlElement * element) const;
    #endif

    /**
     * Called to load the layout from a TiXmlElement.
     */
    virtual void LoadFromXml(const TiXmlElement * element);
    ///@}

private:
    std::list<gd::InitialInstance> initialInstances; //TODO : Send this in private.

    static gd::InitialInstance badPosition;
};

/**
 * \brief Tool class to be used with InitialInstancesContainer::IterateOverInstances
 */
class GD_CORE_API InitialInstanceFunctor
{
public:
    InitialInstanceFunctor() {};
    virtual ~InitialInstanceFunctor();

    virtual void operator()(InitialInstance & instance) = 0;
};

}

#endif // GDCORE_INITIALINSTANCESCONTAINER_H
