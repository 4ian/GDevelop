/*
 * Game Develop Core
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */

#ifndef GDCORE_INITIALINSTANCESCONTAINER_H
#define GDCORE_INITIALINSTANCESCONTAINER_H
#include <string>
#include <list>
#include "GDCore/PlatformDefinition/InitialInstance.h"
namespace gd { class InitialInstanceFunctor; }
namespace gd { class Project; }
namespace gd { class SerializerElement; }

namespace gd
{

/**
 * \brief Defines a container of gd::InitialInstances.
 *
 * The container is notably able to ensure that pointers
 * to the elements of the container are not invalidated when
 * a change occurs ( through InsertNewInitialInstance or RemoveInstance
 * for example ). <br>
 * Thus, the implementations uses a std::list
 * for holding the instances. In this way, the container is not required
 * to provide a direct access to element based on an index. Instead,
 * the method IterateOverInstances is used to perform operations.
 *
 * \see gd::InitialInstanceFunctor
 */
class GD_CORE_API InitialInstancesContainer
{
public:
    InitialInstancesContainer() {};
    virtual ~InitialInstancesContainer();

    /**
     * \brief Return a pointer to a copy of the container.
     * A such method is needed as the IDE may want to store copies of some containers and so need a way to do polymorphic copies.
     *
     * Typical implementation example:
     * \code
     * return new MyContainer(*this);
     * \endcode
     */
    InitialInstancesContainer * Clone() const { return new InitialInstancesContainer(*this); };

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
    void Create(const InitialInstancesContainer & source);
    #endif

    /** \name Instances management
     * Members functions related to managing the instances
     */
    ///@{

    /**
     * \brief Return the number of instances
     */
    unsigned int GetInstancesCount() const;

    /**
     * \brief Apply \a func to each instance of the container.
     * \see InitialInstanceFunctor
     */
    void IterateOverInstances(InitialInstanceFunctor & func);

    /**
     * Get the instances on the specified layer,
     * sort them regarding their Z order and then apply \a func on them.
     * \param func The functor to be applied.
     * \param layer The layer
     *
     * \see InitialInstanceFunctor
     */
    void IterateOverInstancesWithZOrdering(InitialInstanceFunctor & func, const std::string & layer);

    #if defined(GD_IDE_ONLY)
    /**
     * \brief Insert the specified \a instance into the list and return a
     * a reference to the newly added instance.
     */
    InitialInstance & InsertInitialInstance(const InitialInstance & instance);

    /**
     * \brief Insert a new blank instance at the end of the list and return a
     * a reference to the newly added instance.
     */
    InitialInstance & InsertNewInitialInstance();

    /**
     * \brief Remove the specified \a instance
     */
    void RemoveInstance(const gd::InitialInstance & instance);

    /**
     * \brief Remove all instances from layer \a layerName.
     */
    void RemoveAllInstancesOnLayer(const std::string & layerName);

    /**
     * \brief Move the instances on layer \a fromLayer to layer \a toLayer.
     */
    void MoveInstancesToLayer(const std::string & fromLayer, const std::string & toLayer);

    /**
     * \brief Remove instances of object named \a objectName
     */
    void RemoveInitialInstancesOfObject(const std::string & objectName);

    /**
     * \brief Change instances with object's name \a oldName to \a newName
     */
    void RenameInstancesOfObject(const std::string & oldName, const std::string & newName);

    /**
     * \brief Return true if there is at least one instance on the layer named \a layerName.
     */
    bool SomeInstancesAreOnLayer(const std::string & layerName);
    #endif
    ///@}

    /** \name Saving and loading
     * Members functions related to saving and loading the object.
     */
    ///@{

    #if defined(GD_IDE_ONLY)
    /**
     * \brief Serialize instances container.
     */
    virtual void SerializeTo(SerializerElement & element) const;
    #endif

    /**
     * \brief Unserialize the instances container.
     */
    virtual void UnserializeFrom(const SerializerElement & element);
    ///@}

private:
    std::list<gd::InitialInstance> initialInstances;

    static gd::InitialInstance badPosition;
};

/**
 * \brief Tool class to be used with gd::InitialInstancesContainer::IterateOverInstances.
 *
 * \see gd::InitialInstancesContainer
 * \see gd::HighestZOrderFinder
 */
class GD_CORE_API InitialInstanceFunctor
{
public:
    InitialInstanceFunctor() {};
    virtual ~InitialInstanceFunctor();

    virtual void operator()(InitialInstance * instance) = 0;
};

/** \brief Tool class picking returning the highest Z order of instances on a layer.
 *
 * \see gd::InitialInstanceFunctor
 * \see gd::InitialInstancesContainer
 */
class GD_CORE_API HighestZOrderFinder : public gd::InitialInstanceFunctor
{
public:
    HighestZOrderFinder() : highestZOrder(0), lowestZOrder(0), firstCall(true), layerRestricted(false) {};
    virtual ~HighestZOrderFinder() {};

    virtual void operator()(gd::InitialInstance * instance);

    /**
     * \brief Restrict to instances on the specified layer.
     */
    void RestrictSearchToLayer(const std::string & layerName_) { layerName = layerName_; layerRestricted = true; };

    /**
     * \brief After calling the instances container iterate method with this functor,
     * this method will return the highest Z order of the instances.
     */
    int GetHighestZOrder() const { return highestZOrder; }

    /**
     * \brief After calling the instances container iterate method with this functor,
     * this method will return the lowest Z order of the instances.
     */
    int GetLowestZOrder() const { return lowestZOrder; }

private:
    int highestZOrder;
    int lowestZOrder;
    bool firstCall;

    bool layerRestricted; ///< If true, the search is restricted to the layer called \a layerName.
    std::string layerName;
};

}

#endif // GDCORE_INITIALINSTANCESCONTAINER_H
