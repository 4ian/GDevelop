/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#if defined(GD_IDE_ONLY)
#ifndef EVENTMETADATA_H
#define EVENTMETADATA_H
#include <GDCore/Utf8String.h>
#include <vector>
#include <memory>
#if !defined(GD_NO_WX_GUI)
#include <wx/bitmap.h>
#endif
class wxBitmap;
namespace gd { class EventsList; }
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
        virtual gd::String Generate(gd::BaseEvent & event, gd::EventsCodeGenerator & codeGenerator, gd::EventsCodeGenerationContext & context);

        /**
         * \brief Called for events that must be preprocessed.
         *
         * Most of the events do not requires preprocessing, so you do not need to take care of this function,
         * unless for special cases like gd::LinkEvent.
         */
        virtual void Preprocess(gd::BaseEvent & event, gd::EventsCodeGenerator & codeGenerator,
                                gd::EventsList & eventList, unsigned int indexOfTheEventInThisList);
    };

    /**
     * Set the code generator used when generating code from events.
     */
    void SetCodeGenerator(std::shared_ptr<gd::EventMetadata::CodeGenerator> codeGenerator) { codeGeneration = codeGenerator; }

    EventMetadata(const gd::String & name_,
                 const gd::String & fullname_,
                 const gd::String & description_,
                 const gd::String & group_,
                 const gd::String & smallicon_,
                 std::shared_ptr<gd::BaseEvent> instance);

    EventMetadata() {};
    virtual ~EventMetadata() {};

    const gd::String & GetFullName() const { return fullname; }
    const gd::String & GetDescription() const { return description; }
    const gd::String & GetGroup() const { return group; }
#if !defined(GD_NO_WX_GUI)
    const wxBitmap & GetBitmapIcon() const { return smallicon; }
#endif

    gd::String fullname;
    gd::String description;
    gd::String group;
#if !defined(GD_NO_WX_GUI)
    wxBitmap smallicon;
#endif

    std::shared_ptr<gd::BaseEvent> instance;
    std::shared_ptr<gd::EventMetadata::CodeGenerator> codeGeneration;
};


}

#endif // EVENTMETADATA_H
#endif
