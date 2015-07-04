/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#ifndef AUTOMATISMMETADATA_H
#define AUTOMATISMMETADATA_H
#include <GDCore/Utf8String.h>
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
    AutomatismMetadata(const gd::String & extensionNamespace,
                       const gd::String & name_,
                       const gd::String & fullname_,
                       const gd::String & defaultName_,
                       const gd::String & description_,
                       const gd::String & group_,
                       const gd::String & icon24x24_,
                       const gd::String & className_,
                       std::shared_ptr<gd::Automatism> instance,
                       std::shared_ptr<gd::AutomatismsSharedData> sharedDatasInstance);
    AutomatismMetadata() {};
    virtual ~AutomatismMetadata() {};

    /**
     * Declare a new condition as being part of the extension.
     */
    gd::InstructionMetadata & AddCondition(const gd::String & name_,
                                           const gd::String & fullname_,
                                           const gd::String & description_,
                                           const gd::String & sentence_,
                                           const gd::String & group_,
                                           const gd::String & icon_,
                                           const gd::String & smallicon_);

    /**
     * Declare a new action as being part of the extension.
     */
    gd::InstructionMetadata & AddAction(const gd::String & name_,
                                           const gd::String & fullname_,
                                           const gd::String & description_,
                                           const gd::String & sentence_,
                                           const gd::String & group_,
                                           const gd::String & icon_,
                                           const gd::String & smallicon_);
    /**
     * Declare a new action as being part of the extension.
     */
    gd::ExpressionMetadata & AddExpression(const gd::String & name_,
                                           const gd::String & fullname_,
                                           const gd::String & description_,
                                           const gd::String & group_,
                                           const gd::String & smallicon_);

    /**
     * Declare a new string expression as being part of the extension.
     */
    gd::ExpressionMetadata & AddStrExpression(const gd::String & name_,
                                           const gd::String & fullname_,
                                           const gd::String & description_,
                                           const gd::String & group_,
                                           const gd::String & smallicon_);

    AutomatismMetadata & SetFullName(const gd::String & fullname_);
    AutomatismMetadata & SetDefaultName(const gd::String & defaultName_);
    AutomatismMetadata & SetDescription(const gd::String & description_);
    AutomatismMetadata & SetGroup(const gd::String & group_);
    AutomatismMetadata & SetBitmapIcon(const wxBitmap & bitmap_);

    /**
     * \brief Erase any existing include file and add the specified include.
     * \note The requirement may vary depending on the platform: Most of the time, the include
     * file contains the declaration of the automatism.
     */
    AutomatismMetadata & SetIncludeFile(const gd::String & includeFile);

    /**
     * \brief Add a file to the already existing include files.
     */
    AutomatismMetadata & AddIncludeFile(const gd::String & includeFile);

#if defined(GD_IDE_ONLY)
    const gd::String & GetFullName() const { return fullname; }
    const gd::String & GetDefaultName() const { return defaultName; }
    const gd::String & GetDescription() const  { return description; }
    const gd::String & GetGroup() const  { return group; }
    const gd::String & GetIconFilename() const { return iconFilename; }
#if !defined(GD_NO_WX_GUI)
    const wxBitmap & GetBitmapIcon() const { return icon; }
#endif
#endif
    std::shared_ptr<gd::Automatism> Get() const { return instance; }
    std::shared_ptr<gd::AutomatismsSharedData> GetSharedDataInstance() const { return sharedDatasInstance; }

#if defined(GD_IDE_ONLY)
    std::map<gd::String, gd::InstructionMetadata > conditionsInfos;
    std::map<gd::String, gd::InstructionMetadata > actionsInfos;
    std::map<gd::String, gd::ExpressionMetadata > expressionsInfos;
    std::map<gd::String, gd::ExpressionMetadata > strExpressionsInfos;

    std::vector<gd::String> includeFiles;
    gd::String className;
#endif
private:
    gd::String extensionNamespace;
#if defined(GD_IDE_ONLY)
    gd::String fullname;
    gd::String defaultName;
    gd::String description;
    gd::String group;
    gd::String iconFilename;
#if !defined(GD_NO_WX_GUI)
    wxBitmap icon;
#endif
#endif

    std::shared_ptr<gd::Automatism> instance;
    std::shared_ptr<gd::AutomatismsSharedData> sharedDatasInstance;
};

}

#endif // AUTOMATISMMETADATA_H
