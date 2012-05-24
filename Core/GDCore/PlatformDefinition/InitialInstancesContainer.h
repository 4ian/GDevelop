/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef GDCORE_INITIALINSTANCESCONTAINER_H
#define GDCORE_INITIALINSTANCESCONTAINER_H
#include <string>
namespace gd { class InitialInstance; }
class TiXmlElement;

namespace gd
{

class GD_CORE_API InitialInstancesContainer
{
public:
    InitialInstancesContainer() {};
    virtual ~InitialInstancesContainer() {};

    /**
     * Must return a pointer to a copy of the container.
     * A such method is needed as the IDE may want to store copies of some variables container and so need a way to do polymorphic copies.
     *
     * Typical implementation example:
     * \code
     * return new MyContainer(*this);
     * \endcode
     */
    virtual InitialInstancesContainer * Clone() const =0;

    /**
     * Must construct the class from the source
     * A such method is needed as the IDE may want to store copies of some variables container and so need a way to do polymorphic copies.
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
    virtual void Create(const gd::InitialInstancesContainer & source) =0;

    /** \name Instances management
     * Members functions related to managing the instances
     */
    ///@{

    virtual unsigned int GetInstancesCount() const =0;
    virtual const InitialInstance & GetInstance(unsigned int index) const =0;
    virtual InitialInstance & GetInstance(unsigned int index) =0;
    virtual void InsertInitialInstance(const InitialInstance & instance) =0;
    virtual void InsertNewInitialInstance() =0;
    virtual void RemoveInstance(unsigned int index) =0;

    /**
     * Must remove all instances from layer \a layerName.
     */
    virtual void RemoveAllInstancesOnLayer(const std::string & layerName) = 0;

    /**
     * Must move instances on layer \a fromLayer to layer \a toLayer.
     */
    virtual void MoveInstancesToLayer(const std::string & fromLayer, const std::string & toLayer) = 0;

    /**
     * Must remove instances of object named \a objectName
     */
    virtual void RemoveInitialInstancesOfObject(const std::string & objectName) = 0;

    /**
     * Must change instances with object's name \a oldName to \a newName
     */
    virtual void RenameInstancesOfObject(const std::string & oldName, const std::string & newName) =0;

    ///@}

    /** \name Saving and loading
     * Members functions related to saving and loading the object.
     */
    ///@{

    /**
     * Called to save the layout to a TiXmlElement.
     */
    virtual void SaveToXml(TiXmlElement * element) const {}

    /**
     * Called to load the layout from a TiXmlElement.
     */
    virtual void LoadFromXml(const TiXmlElement * element) {}
    ///@}
};

}

#endif // GDCORE_INITIALINSTANCESCONTAINER_H
