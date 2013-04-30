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
#include "GDCore/IDE/Dialogs/LayoutEditorCanvas/LayoutEditorCanvasOptions.h"
#endif

namespace gd
{

/**
 * \brief An external layout allows to create layouts of objects that can be then inserted on a layout.
 */
class GD_CORE_API ExternalLayout
{
public:
    ExternalLayout() {};
    virtual ~ExternalLayout() {};

    /**
     * \brief Return a pointer to a new ExternalLayout constructed from this one.
     */
    ExternalLayout * Clone() const { return new ExternalLayout(*this); };

    /**
     * \brief Return the name of the external layout.
     */
    const std::string & GetName() const {return name;}

    /**
     * \brief Change the name of the external layout.
     */
    void SetName(const std::string & name_) {name = name_;}

    /**
     * \brief Return the container storing initial instances.
     */
    const gd::InitialInstancesContainer & GetInitialInstances() const { return instances; }

    /**
     * \brief Return the container storing initial instances.
     */
    gd::InitialInstancesContainer & GetInitialInstances() { return instances; }

    #if defined(GD_IDE_ONLY)
    /**
     * \brief Get the user settings for the IDE.
     */
    const gd::LayoutEditorCanvasOptions & GetAssociatedSettings() const {return editionSettings;}

    /**
     * \brief Get the user settings for the IDE.
     */
    gd::LayoutEditorCanvasOptions & GetAssociatedSettings() {return editionSettings;}
    #endif

    /** \name Serialization
     */
    ///@{

    /**
     * \brief Load the object from XML
     */
    void LoadFromXml(const TiXmlElement * element);

    #if defined(GD_IDE_ONLY)
    /**
     * \brief Save the object to XML
     */
    void SaveToXml(TiXmlElement * element) const;
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
