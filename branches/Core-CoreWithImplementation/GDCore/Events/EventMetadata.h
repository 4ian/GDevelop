#if defined(GD_IDE_ONLY)
#ifndef EVENTMETADATA_H
#define EVENTMETADATA_H
#include <string>
#include <vector>
#include <boost/shared_ptr.hpp>
#include <wx/bitmap.h>
namespace gd { class BaseEvent; }
namespace gd { class EventsCodeGenerator; }
namespace gd { class EventsCodeGenerationContext; }

namespace gd
{

/**
 * \brief Describe an event provided by an extension of a platform.
 *
 * Extensions writers, you should most of the time be using PlatformExtension::AddEvent method
 * to add events.
 */
class GD_CORE_API EventMetadata
{
public:
    /**
     * \brief Base class used to define the code generated for a single event.
     * \warning Must not be confused with gd::EventsCodeGenerator which is a more general class
     * used to generate code for a whole layout or a list of conditions/actions.
     */
    class GD_CORE_API CodeGenerator
    {
    public :
        /**
         * \brief Called to generate the code for the event.
         *
         * You can use gd::EventsCodeGenerator methods in particular so as to generate code for conditions or actions.
         */
        virtual std::string Generate(gd::BaseEvent & event, gd::EventsCodeGenerator & codeGenerator, gd::EventsCodeGenerationContext & context);

        /**
         * \brief Called for events that must be preprocessed.
         *
         * Most of the events do not requires preprocessing, so you do not need to take care of this function,
         * unless for special cases like gd::LinkEvent.
         */
        virtual void Preprocess(gd::BaseEvent & event, gd::EventsCodeGenerator & codeGenerator,
                                std::vector < boost::shared_ptr<gd::BaseEvent> > & eventList, unsigned int indexOfTheEventInThisList);
    };

    EventMetadata(const std::string & name_,
                 const std::string & fullname_,
                 const std::string & description_,
                 const std::string & group_,
                 const std::string & smallicon_,
                 boost::shared_ptr<gd::BaseEvent> instance,
                 boost::shared_ptr<gd::EventMetadata::CodeGenerator> codeGenerator);
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
    boost::shared_ptr<gd::EventMetadata::CodeGenerator> codeGeneration;
};


}

#endif // EVENTMETADATA_H
#endif
