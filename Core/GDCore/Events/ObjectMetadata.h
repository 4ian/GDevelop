/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */
#ifndef OBJECTMETADATA_H
#define OBJECTMETADATA_H
#include <string>
#include <wx/bitmap.h>

namespace gd
{

/**
 * \brief Contains user-friendly information about an object type
 *
 * Implementations may derive from this class so as to provide more complete metadata if needed.
 * ( For example, Game Develop C++ Platform is storing pointers to functions to create/destroy the objects... )
 *
 * \ingroup Events
 */
class ObjectMetadata
{
public:
    ObjectMetadata() {};
    virtual ~ObjectMetadata() {};

    ObjectMetadata & SetFullName(const std::string & fullname_) { fullname = fullname_; return *this; }
    ObjectMetadata & SetDescription(const std::string & description_) { description = description_; return *this; }
    ObjectMetadata & SetBitmapIcon(const wxBitmap & bitmap_) { icon = bitmap_; return *this; }

    const std::string & GetFullName() const { return fullname; }
    const std::string & GetDescription() const { return description; }
    const wxBitmap & GetBitmapIcon() const { return icon; }

private:
    std::string fullname;
    std::string description;
    wxBitmap icon;
};


}

#endif // OBJECTMETADATA_H
