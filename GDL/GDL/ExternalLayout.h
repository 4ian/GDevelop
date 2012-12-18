/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */
#ifndef EXTERNALLAYOUT_H
#define EXTERNALLAYOUT_H
#include <string>
#include <boost/shared_ptr.hpp>
#if defined(GD_IDE_ONLY)
#include "GDCore/PlatformDefinition/ExternalLayout.h"
#include "GDCore/IDE/Dialogs/LayoutEditorCanvasOptions.h"
#endif
#include "GDL/InitialInstancesContainer.h"

/**
 * \brief Defines a external layout, containing only objects instances, which can be dynamically loaded by a layout.
 */
class GD_API ExternalLayout
#if defined(GD_IDE_ONLY)
 : public gd::ExternalLayout
#endif
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
    virtual const InitialInstancesContainer & GetInitialInstances() const { return instances; }

    /**
     * Return the container storing initial instances.
     */
    virtual InitialInstancesContainer & GetInitialInstances() { return instances; }

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
    InitialInstancesContainer instances;
    #if defined(GD_IDE_ONLY)
    gd::LayoutEditorCanvasOptions editionSettings;
    #endif
};

/**
 * \brief Functor testing ExternalLayout' name
 */
struct ExternalLayoutHasName : public std::binary_function<boost::shared_ptr<ExternalLayout>, std::string, bool> {
    bool operator()(const boost::shared_ptr<ExternalLayout> & externalLayout, std::string name) const { return externalLayout->GetName() == name; }
};

#endif // EXTERNALLAYOUT_H

