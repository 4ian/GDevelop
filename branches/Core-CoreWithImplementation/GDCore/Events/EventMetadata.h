#if defined(GD_IDE_ONLY)
#ifndef EVENTMETADATA_H
#define EVENTMETADATA_H
#include <string>
#include <boost/shared_ptr.hpp>
#include <wx/bitmap.h>
namespace gd { class BaseEvent; }

namespace gd
{

class EventMetadata
{
public:
    EventMetadata(const std::string & name_,
                 const std::string & fullname_,
                 const std::string & description_,
                 const std::string & group_,
                 const std::string & smallicon_,
                 boost::shared_ptr<gd::BaseEvent> instance);
    EventMetadata() {};
    virtual ~EventMetadata() {};

    const std::string & GetFullName() const { return fullname; }
    const std::string & GetDescription() const { return description; }
    const std::string & GetGroup() const { return group; }
    const wxBitmap & GetBitmapIcon() const { return smallicon; }

    std::string fullname;
    std::string description;
    std::string group;
    wxBitmap smallicon;

    boost::shared_ptr<gd::BaseEvent> instance;
};

}

#endif // EVENTMETADATA_H
#endif
