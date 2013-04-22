/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */
#ifndef AUTOMATISMMETADATA_H
#define AUTOMATISMMETADATA_H
#include <string>
#include <map>
#include "GDCore/Events/InstructionMetadata.h"
#include "GDCore/Events/ExpressionMetadata.h"
#include <wx/bitmap.h>
namespace gd { class Automatism; }
namespace gd { class AutomatismsSharedData; }

namespace gd
{

/**
 * \brief Contains user-friendly information about an automatism type
 *
 * Implementations may derive from this class so as to provide more complete metadata if needed.
 * ( For example, Game Develop C++ Platform is shared pointers to objects that will be cloned so as to create the automatisms... )
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
                       boost::shared_ptr<gd::Automatism> instance,
                       boost::shared_ptr<gd::AutomatismsSharedData> sharedDatasInstance);
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
    gd::StrExpressionMetadata & AddStrExpression(const std::string & name_,
                                           const std::string & fullname_,
                                           const std::string & description_,
                                           const std::string & group_,
                                           const std::string & smallicon_);

    AutomatismMetadata & SetFullName(const std::string & fullname_) { fullname = fullname_; return *this; }
    AutomatismMetadata & SetDefaultName(const std::string & defaultName_) { defaultName = defaultName_; return *this; }
    AutomatismMetadata & SetDescription(const std::string & description_) { description = description_; return *this; }
    AutomatismMetadata & SetGroup(const std::string & group_) { group = group_; return *this; }
    AutomatismMetadata & SetBitmapIcon(const wxBitmap & bitmap_) { icon = bitmap_; return *this; }
#if defined(GD_IDE_ONLY)
    AutomatismMetadata & SetIncludeFile(const std::string & includeFile) { optionalIncludeFile = includeFile; return *this; }
#endif

    const std::string & GetFullName() const { return fullname; }
    const std::string & GetDefaultName() const { return defaultName; }
    const std::string & GetDescription() const  { return description; }
    const std::string & GetGroup() const  { return group; }
    const wxBitmap & GetBitmapIcon() const { return icon; }
    boost::shared_ptr<gd::Automatism> GetInstance() const { return instance; }
    boost::shared_ptr<gd::AutomatismsSharedData> GetSharedDataInstance() const { return sharedDatasInstance; }

#if defined(GD_IDE_ONLY)
    std::map<std::string, gd::InstructionMetadata > conditionsInfos;
    std::map<std::string, gd::InstructionMetadata > actionsInfos;
    std::map<std::string, gd::ExpressionMetadata > expressionsInfos;
    std::map<std::string, gd::StrExpressionMetadata > strExpressionsInfos;

    std::string optionalIncludeFile;
    std::string cppClassName;
#endif
private:
    std::string extensionNamespace;
    std::string fullname;
    std::string defaultName;
    std::string description;
    std::string group;
    wxBitmap icon;

    boost::shared_ptr<gd::Automatism> instance;
    boost::shared_ptr<gd::AutomatismsSharedData> sharedDatasInstance;
};

}

#endif // AUTOMATISMMETADATA_H
