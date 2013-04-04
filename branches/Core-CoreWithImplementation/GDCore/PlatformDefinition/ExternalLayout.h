/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef GDCORE_EXTERNALLAYOUT_H
#define GDCORE_EXTERNALLAYOUT_H
#include <string>
#include "GDCore/PlatformDefinition/InitialInstancesContainer.h"
#include <boost/shared_ptr.hpp>
#if defined(GD_IDE_ONLY)
#include "GDCore/IDE/Dialogs/LayoutEditorCanvasOptions.h"
#endif

namespace gd
{

class GD_CORE_API ExternalLayout
{
public:
    ExternalLayout() {};
    virtual ~ExternalLayout() {};

    /**
     * Return a pointer to a new ExternalLayout constructed from this one.
     */
    virtual ExternalLayout * Clone() const { return new ExternalLayout(*this); };

    /**
     * Must return the name of the external layout.
     */
    virtual const std::string & GetName() const {return name;}

    /**
     * Must change the name of the external layout.
     */
    virtual void SetName(const std::string & name_) {name = name_;}

    /**
     * Return the container storing initial instances.
     */
    virtual const gd::InitialInstancesContainer & GetInitialInstances() const { return instances; }

    /**
     * Return the container storing initial instances.
     */
    virtual gd::InitialInstancesContainer & GetInitialInstances() { return instances; }

    #if defined(GD_IDE_ONLY)
    virtual const gd::LayoutEditorCanvasOptions & GetAssociatedSettings() const {return editionSettings;}
    virtual gd::LayoutEditorCanvasOptions & GetAssociatedSettings() {return editionSettings;}
    #endif

    /** \name Serialization
     */
    ///@{
    virtual void LoadFromXml(const TiXmlElement * element);
    #if defined(GD_IDE_ONLY)
    virtual void SaveToXml(TiXmlElement * element) const;
    #endif
    ///@}

private:

    std::string name;
    gd::InitialInstancesContainer instances;
    #if defined(GD_IDE_ONLY)
    gd::LayoutEditorCanvasOptions editionSettings;
    #endif
};

/**
 * \brief Functor testing ExternalLayout' name
 */
struct ExternalLayoutHasName : public std::binary_function<boost::shared_ptr<gd::ExternalLayout>, std::string, bool> {
    bool operator()(const boost::shared_ptr<gd::ExternalLayout> & externalLayout, std::string name) const { return externalLayout->GetName() == name; }
};

}

#endif // GDCORE_EXTERNALLAYOUT_H
