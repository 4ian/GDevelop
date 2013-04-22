/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */
#ifndef OBJECTMETADATA_H
#define OBJECTMETADATA_H
#include <string>
#include <map>
#include <wx/bitmap.h>
#include "GDCore/Events/InstructionMetadata.h"
#include "GDCore/Events/ExpressionMetadata.h"
namespace gd { class Object; }

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
                   DestroyFunPtr destroyFunPtrP,
                   const std::string & cppClassName_);
    ObjectMetadata() : createFunPtr(NULL), destroyFunPtr(NULL) {}
    virtual ~ObjectMetadata() {};

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
     * Declare a new expression as being part of the extension.
     */
    gd::ExpressionMetadata & AddExpression(const std::string & name_,
                                           const std::string & fullname_,
                                           const std::string & description_,
                                           const std::string & group_,
                                           const std::string & smallicon_);
    /**
     * Declare a new string expression as being part of the extension.
     */
    gd::StrExpressionMetadata & AddStrExpression(const std::string & name_,
                                           const std::string & fullname_,
                                           const std::string & description_,
                                           const std::string & group_,
                                           const std::string & smallicon_);

    ObjectMetadata & SetFullName(const std::string & fullname_) { fullname = fullname_; return *this; }
    ObjectMetadata & SetDescription(const std::string & description_) { description = description_; return *this; }
    ObjectMetadata & SetBitmapIcon(const wxBitmap & bitmap_) { icon = bitmap_; return *this; }

    const std::string & GetName() const { return name; }
    const std::string & GetFullName() const { return fullname; }
    const std::string & GetDescription() const { return description; }
    const wxBitmap & GetBitmapIcon() const { return icon; }

#if defined(GD_IDE_ONLY)
    /**
     * Set that the object is located in a specific include file
     */
    ObjectMetadata & SetIncludeFile(const std::string & includeFile) { optionalIncludeFile = includeFile; return *this; }

    std::map<std::string, gd::InstructionMetadata > conditionsInfos;
    std::map<std::string, gd::InstructionMetadata > actionsInfos;
    std::map<std::string, gd::ExpressionMetadata > expressionsInfos;
    std::map<std::string, gd::StrExpressionMetadata > strExpressionsInfos;

    std::string optionalIncludeFile;
    std::string cppClassName;
#endif
    CreateFunPtr createFunPtr;
    DestroyFunPtr destroyFunPtr;
private:
    std::string extensionNamespace;
    std::string name;
    std::string fullname;
    std::string description;
    wxBitmap icon;
};


}

#endif // OBJECTMETADATA_H
