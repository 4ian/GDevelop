/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#ifndef AUTOMATISMMETADATA_H
#define AUTOMATISMMETADATA_H
#include <string>
#include <map>
#include "GDCore/Events/InstructionMetadata.h"
#include "GDCore/Events/ExpressionMetadata.h"
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include <wx/bitmap.h>
#endif
namespace gd { class Automatism; }
namespace gd { class AutomatismsSharedData; }
namespace gd { class InstructionMetadata; }
namespace gd { class ExpressionMetadata; }
class wxBitmap;

namespace gd
{

/**
 * \brief Contains user-friendly information about an automatism type
 *
 * Implementations may derive from this class so as to provide more complete metadata if needed.
 * ( For example, GDevelop C++ Platform is shared pointers to objects that will be cloned so as to create the automatisms... )
 *
 * \ingroup Events
 */
class GD_CORE_API AutomatismMetadata
{
public:
    AutomatismMetadata(const std::string & extensionNamespace,
                       const std::string & name_,
                       const std::string & fullname_,
                       const std::string & defaultName_,
                       const std::string & description_,
                       const std::string & group_,
                       const std::string & icon24x24_,
                       const std::string & className_,
                       std::shared_ptr<gd::Automatism> instance,
                       std::shared_ptr<gd::AutomatismsSharedData> sharedDatasInstance);
    AutomatismMetadata() {};
    virtual ~AutomatismMetadata() {};

    /**
     * Declare a new condition as being part of the extension.
     */
    gd::InstructionMetadata & AddCondition(const std::string & name_,
                                           const std::string & fullname_,
                                           const std::string & description_,
                                           const std::string & sentence_,
                                           const std::string & group_,
                                           const std::string & icon_,
                                           const std::string & smallicon_);

    /**
     * Declare a new action as being part of the extension.
     */
    gd::InstructionMetadata & AddAction(const std::string & name_,
                                           const std::string & fullname_,
                                           const std::string & description_,
                                           const std::string & sentence_,
                                           const std::string & group_,
                                           const std::string & icon_,
                                           const std::string & smallicon_);
    /**
     * Declare a new action as being part of the extension.
     */
    gd::ExpressionMetadata & AddExpression(const std::string & name_,
                                           const std::string & fullname_,
                                           const std::string & description_,
                                           const std::string & group_,
                                           const std::string & smallicon_);

    /**
     * Declare a new string expression as being part of the extension.
     */
    gd::ExpressionMetadata & AddStrExpression(const std::string & name_,
                                           const std::string & fullname_,
                                           const std::string & description_,
                                           const std::string & group_,
                                           const std::string & smallicon_);

    AutomatismMetadata & SetFullName(const std::string & fullname_);
    AutomatismMetadata & SetDefaultName(const std::string & defaultName_);
    AutomatismMetadata & SetDescription(const std::string & description_);
    AutomatismMetadata & SetGroup(const std::string & group_);
    AutomatismMetadata & SetBitmapIcon(const wxBitmap & bitmap_);

    /**
     * \brief Erase any existing include file and add the specified include.
     * \note The requirement may vary depending on the platform: Most of the time, the include
     * file contains the declaration of the automatism.
     */
    AutomatismMetadata & SetIncludeFile(const std::string & includeFile);

    /**
     * \brief Add a file to the already existing include files.
     */
    AutomatismMetadata & AddIncludeFile(const std::string & includeFile);

#if defined(GD_IDE_ONLY)
    const std::string & GetFullName() const { return fullname; }
    const std::string & GetDefaultName() const { return defaultName; }
    const std::string & GetDescription() const  { return description; }
    const std::string & GetGroup() const  { return group; }
    const std::string & GetIconFilename() const { return iconFilename; }
#if !defined(GD_NO_WX_GUI)
    const wxBitmap & GetBitmapIcon() const { return icon; }
#endif
#endif
    std::shared_ptr<gd::Automatism> Get() const { return instance; }
    std::shared_ptr<gd::AutomatismsSharedData> GetSharedDataInstance() const { return sharedDatasInstance; }

#if defined(GD_IDE_ONLY)
    std::map<std::string, gd::InstructionMetadata > conditionsInfos;
    std::map<std::string, gd::InstructionMetadata > actionsInfos;
    std::map<std::string, gd::ExpressionMetadata > expressionsInfos;
    std::map<std::string, gd::ExpressionMetadata > strExpressionsInfos;

    std::vector<std::string> includeFiles;
    std::string className;
#endif
private:
    std::string extensionNamespace;
#if defined(GD_IDE_ONLY)
    std::string fullname;
    std::string defaultName;
    std::string description;
    std::string group;
    std::string iconFilename;
#if !defined(GD_NO_WX_GUI)
    wxBitmap icon;
#endif
#endif

    std::shared_ptr<gd::Automatism> instance;
    std::shared_ptr<gd::AutomatismsSharedData> sharedDatasInstance;
};

}

#endif // AUTOMATISMMETADATA_H
