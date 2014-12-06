/*
 * GDevelop Core
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#ifndef OBJECTMETADATA_H
#define OBJECTMETADATA_H
#include <string>
#include <map>
#include "GDCore/Events/InstructionMetadata.h"
#include "GDCore/Events/ExpressionMetadata.h"
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include <wx/bitmap.h>
#endif
namespace gd { class Object; }
namespace gd { class InstructionMetadata; }
namespace gd { class ExpressionMetadata; }
class wxBitmap;

typedef void (*DestroyFunPtr)(gd::Object*);
typedef gd::Object * (*CreateFunPtr)(std::string name);

namespace gd
{

/**
 * \brief Contains user-friendly information about an object type
 *
 * \ingroup Events
 */
class GD_CORE_API ObjectMetadata
{
public:
    ObjectMetadata(const std::string & extensionNamespace_,
                   const std::string & name_,
                   const std::string & fullname_,
                   const std::string & informations_,
                   const std::string & icon24x24_,
                   CreateFunPtr createFunPtrP,
                   DestroyFunPtr destroyFunPtrP);
    ObjectMetadata() : createFunPtr(NULL), destroyFunPtr(NULL) {}
    virtual ~ObjectMetadata() {};

    /**
     * \brief Declare a new condition as being part of the extension.
     * \note This method does nothing when used for GD C++ runtime.
     */
    gd::InstructionMetadata & AddCondition(const std::string & name_,
                                           const std::string & fullname_,
                                           const std::string & description_,
                                           const std::string & sentence_,
                                           const std::string & group_,
                                           const std::string & icon_,
                                           const std::string & smallicon_);

    /**
     * \brief Declare a new action as being part of the extension.
     * \note This method does nothing when used for GD C++ runtime.
     */
    gd::InstructionMetadata & AddAction(const std::string & name_,
                                           const std::string & fullname_,
                                           const std::string & description_,
                                           const std::string & sentence_,
                                           const std::string & group_,
                                           const std::string & icon_,
                                           const std::string & smallicon_);
    /**
     * \brief Declare a new expression as being part of the extension.
     * \note This method does nothing when used for GD C++ runtime.
     */
    gd::ExpressionMetadata & AddExpression(const std::string & name_,
                                           const std::string & fullname_,
                                           const std::string & description_,
                                           const std::string & group_,
                                           const std::string & smallicon_);
    /**
     * \brief Declare a new string expression as being part of the extension.
     * \note This method does nothing when used for GD C++ runtime.
     */
    gd::ExpressionMetadata & AddStrExpression(const std::string & name_,
                                           const std::string & fullname_,
                                           const std::string & description_,
                                           const std::string & group_,
                                           const std::string & smallicon_);

    /**
     * \brief Set the name shown to the user.
     * \note This method does nothing when used for GD C++ runtime.
     */
    ObjectMetadata & SetFullName(const std::string & fullname_);

    /**
     * \brief Set the description shown to the user.
     * \note This method does nothing when used for GD C++ runtime.
     */
    ObjectMetadata & SetDescription(const std::string & description_);

    /**
     * Set the bitmap icon shown to the user.
     * \note This method does nothing when used for GD C++ runtime.
     */
    ObjectMetadata & SetBitmapIcon(const wxBitmap & bitmap_);

    const std::string & GetName() const { return name; }
#if defined(GD_IDE_ONLY)
    const std::string & GetFullName() const { return fullname; }
    const std::string & GetDescription() const { return description; }
    const std::string & GetIconFilename() const { return iconFilename; }
#if !defined(GD_NO_WX_GUI)
    const wxBitmap & GetBitmapIcon() const { return icon; }
#endif
#endif

    /**
     * \brief Erase any existing include file and add the specified include.
     * \note The requirement may vary depending on the platform: Most of the time, the include
     * file contains the declaration of the object.
     */
    ObjectMetadata & SetIncludeFile(const std::string & includeFile);

    /**
     * \brief Add a file to the already existing include files.
     */
    ObjectMetadata & AddIncludeFile(const std::string & includeFile);

#if defined(GD_IDE_ONLY)
    std::map<std::string, gd::InstructionMetadata > conditionsInfos;
    std::map<std::string, gd::InstructionMetadata > actionsInfos;
    std::map<std::string, gd::ExpressionMetadata > expressionsInfos;
    std::map<std::string, gd::ExpressionMetadata > strExpressionsInfos;

    std::vector<std::string> includeFiles;
    std::string className;
#endif
    CreateFunPtr createFunPtr;
    DestroyFunPtr destroyFunPtr;
private:
    std::string extensionNamespace;
    std::string name;
#if defined(GD_IDE_ONLY)
    std::string fullname;
    std::string description;
    std::string iconFilename;
#if !defined(GD_NO_WX_GUI)
    wxBitmap icon;
#endif
#endif
};


}
#endif // OBJECTMETADATA_H
