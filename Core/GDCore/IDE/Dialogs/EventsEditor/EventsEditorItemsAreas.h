/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#ifndef EVENTSEDITORITEMSAREAS_H
#define EVENTSEDITORITEMSAREAS_H
#include <wx/gdicmn.h>
#include <memory>
#include <unordered_map>
#include <functional>
#include <vector>
#include <utility>
#include "GDCore/Events/InstructionsList.h"
namespace gd { class EventsList; }
namespace gd { class BaseEvent; }
namespace gd { class Instruction; }
namespace gd { class Expression; }

namespace gd
{

/**
 * \brief Tool class to store information about an event.
 *
 * Used by events editor to indicate to EventsEditorItemsAreas that an event is displayed somewhere.
 * \ingroup IDEDialogsEventsEditor
 */
class GD_CORE_API EventItem
{
public:
    EventItem(std::shared_ptr<gd::BaseEvent> event_, gd::EventsList * eventsList_, std::size_t positionInList_ );
    EventItem();
    ~EventItem() {};

    bool operator==(const gd::EventItem & other) const;

    std::shared_ptr<gd::BaseEvent> event;
    gd::EventsList * eventsList;
    std::size_t positionInList;
};

/**
 * \brief Used to indicate to EventsEditorItemsAreas that an instruction is displayed somewhere
 * \ingroup IDEDialogsEventsEditor
 */
class GD_CORE_API InstructionItem
{
public:
    /**
     * Use this constructor to declare the instruction, the list it belongs to and its position in this list.
     */
    InstructionItem(gd::Instruction * instruction_, bool isCondition, gd::InstructionsList* instructionList_, std::size_t positionInList_, gd::BaseEvent * event );
    InstructionItem();
    ~InstructionItem() {};

    bool operator==(const gd::InstructionItem & other) const;

    gd::Instruction * instruction;
    bool isCondition;
    gd::InstructionsList* instructionList;
    std::size_t positionInList;
    gd::BaseEvent * event;
};

/**
 * \brief Used to indicate to EventsEditorItemsAreas that an instruction list is displayed somewhere
 * \ingroup IDEDialogsEventsEditor
 */
class GD_CORE_API InstructionListItem
{
public:
    /**
     * Use this constructor to declare the instruction, the list it belongs to and its position in this list.
     */
    InstructionListItem(bool isConditionList, gd::InstructionsList* instructionList_, gd::BaseEvent * event );
    InstructionListItem();
    ~InstructionListItem() {};

    bool operator==(const InstructionListItem & other) const;

    bool isConditionList;
    gd::InstructionsList* instructionList;
    gd::BaseEvent * event;
};

/**
 * \brief Used to indicate to EventsEditorItemsAreas that a parameter is displayed somewhere
 * \ingroup IDEDialogsEventsEditor
 */
class GD_CORE_API ParameterItem
{
public:
    ParameterItem(gd::Expression * parameter_, gd::BaseEvent * event);
    ParameterItem();
    ~ParameterItem() {};

    bool operator==(const ParameterItem & other) const;

    gd::Expression * parameter;
    gd::BaseEvent * event;
};

/**
 * \brief Used to indicate to EventsEditorItemsAreas that a fold/unfold button is displayed somewhere
 * \ingroup IDEDialogsEventsEditor
 */
class GD_CORE_API FoldingItem
{
public:
    FoldingItem(gd::BaseEvent * event);
    FoldingItem();
    ~FoldingItem() {};

    bool operator==(const FoldingItem & other) const;

    gd::BaseEvent * event;
};

/**
 * \brief Allow events to indicate where is displayed an instruction or parameter.
 *
 * Events editor also uses this internally to indicate where events are displayed.
 * \ingroup IDEDialogsEventsEditor
 */
class GD_CORE_API EventsEditorItemsAreas
{
public:

    /**
     * \brief Notify the editor there is an instruction in this area
     */
    void AddInstructionArea(wxRect area, gd::InstructionItem & instruction);

    /**
     * \brief Notify the editor there is a parameter in this area
     */
    void AddParameterArea(wxRect area, ParameterItem & parameter);

    /**
     * \brief Notify the editor there is an event in this area
     */
    void AddEventArea(wxRect area, gd::EventItem & event);

    /**
     * \brief Notify the editor there is a folding button in this area
     */
    void AddFoldingItem(wxRect area, FoldingItem & event);

    /**
     * \brief Notify the editor there is a list in this area
     */
    void AddInstructionListArea(wxRect area, InstructionListItem & item);

    /**
     * \brief True if a point is on an event.
     */
    bool IsOnEvent(int x, int y);

    /**
     * \brief Return event at point (x,y). Be sure there is an event here using IsOnEvent(x,y);
     */
    EventItem GetEventAt(int x, int y);

    /**
     * \brief Return the rectangle used by the event at point(x,y).
     */
    wxRect GetAreaOfEventAt(int x, int y);

    /**
     * \brief True if a point is on an instruction.
     */
    bool IsOnInstruction(int x, int y);

    /**
     * \brief Return event at point (x,y). Be sure there is an event here using IsOnInstruction(x,y);
     */
    gd::InstructionItem GetInstructionAt(int x, int y);

    /**
     * \brief True if a point is on an instruction list.
     */
    bool IsOnInstructionList(int x, int y);

    /**
     * \brief Return event at point (x,y). Be sure there is an event here using IsOnEvent(x,y);
     */
    InstructionListItem GetInstructionListAt(int x, int y);

    /**
     * \brief Return the rectangle used by the instruction at point(x,y).
     */
    wxRect GetAreaOfInstructionAt(int x, int y);

    /**
     * \brief Return the rectangle used by the list at point(x,y).
     */
    wxRect GetAreaOfInstructionListAt(int x, int y);

    /**
     * \brief True if a point is on an event.
     */
    bool IsOnParameter(int x, int y);

    /**
     * \brief Return event at point (x,y). Be sure there is an event here using IsOnEvent(x,y);
     */
    ParameterItem GetParameterAt(int x, int y);

    /**
     * \brief Return the rectangle used by the parameter at point(x,y).
     */
    wxRect GetAreaOfParameterAt(int x, int y);

    /**
     * \brief True if a point is on an event.
     */
    bool IsOnFoldingItem(int x, int y);

    /**
     * \brief Return event at point (x,y). Be sure there is an event here using IsOnEvent(x,y);
     */
    FoldingItem GetFoldingItemAt(int x, int y);

    /**
     * \brief Clear all areas ( typically before redraw )
     */
    void Clear();

    /**
     * \brief Default constructor doing nothing.
     */
    EventsEditorItemsAreas() {};

    /**
     * \brief Default destructor doing nothing.
     */
    virtual ~EventsEditorItemsAreas() {};

    std::vector< std::pair<wxRect, EventItem > > eventsAreas;
    std::vector< std::pair<wxRect, gd::InstructionItem > > instructionsAreas;
    std::vector< std::pair<wxRect, ParameterItem > > parametersAreas;
    std::vector< std::pair<wxRect, FoldingItem > > foldingAreas;
    std::vector< std::pair<wxRect, InstructionListItem > > instructionListsAreas;

private:
};

}

//Hash for EventItem, ParameterItem, InstructionItem, InstructionListItem and FoldingItem
namespace std
{
    template<>
    struct hash<gd::EventItem>
    {
        std::size_t operator()(gd::EventItem const& item) const
        {
            return (std::hash<gd::BaseEvent*>()(item.event.get())) ^
                   (std::hash<gd::EventsList*>()(item.eventsList) << 1) ^
                   (std::hash<std::size_t>()(item.positionInList) << 2);
        }
    };

    template<>
    struct hash<gd::InstructionItem>
    {
        std::size_t operator()(gd::InstructionItem const& item) const
        {
            return (std::hash<gd::Instruction*>()(item.instruction)) ^
                   (std::hash<gd::InstructionsList*>()(item.instructionList) << 1) ^
                   (std::hash<std::size_t>()(item.positionInList) << 2) ^
                   (std::hash<gd::BaseEvent*>()(item.event) << 3) ^
                   (std::hash<bool>()(item.isCondition) << 4);
        }
    };

    template<>
    struct hash<gd::InstructionListItem>
    {
        std::size_t operator()(gd::InstructionListItem const& item) const
        {
            return (std::hash<gd::InstructionsList*>()(item.instructionList)) ^
                   (std::hash<gd::BaseEvent*>()(item.event) << 1) ^
                   (std::hash<bool>()(item.isConditionList) << 2);
        }
    };

    template<>
    struct hash<gd::ParameterItem>
    {
        std::size_t operator()(gd::ParameterItem const& item) const
        {
            return (std::hash<gd::Expression*>()(item.parameter)) ^
                   (std::hash<gd::BaseEvent*>()(item.event) << 1);
        }
    };

    template<>
    struct hash<gd::FoldingItem>
    {
        std::size_t operator()(gd::FoldingItem const& item) const
        {
            return std::hash<gd::BaseEvent*>()(item.event);
        }
    };
}

#endif // EVENTSEDITORITEMSAREAS_H
#endif
