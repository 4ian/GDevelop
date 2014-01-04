/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef EVENTSEDITORITEMSAREAS_H
#define EVENTSEDITORITEMSAREAS_H
#include <wx/gdicmn.h>
#include <boost/weak_ptr.hpp>
#include <boost/unordered_map.hpp>
#include <vector>
#include <utility>
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
    EventItem(boost::shared_ptr<gd::BaseEvent> event_, std::vector<boost::shared_ptr<gd::BaseEvent> > * eventsList_, unsigned int positionInList_ );
    EventItem();
    ~EventItem() {};

    bool operator==(const gd::EventItem & other) const;

    boost::shared_ptr<gd::BaseEvent> event;
    std::vector<boost::shared_ptr<gd::BaseEvent> > * eventsList;
    unsigned int positionInList;
};
size_t hash_value(const gd::EventItem & a);

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
    InstructionItem(gd::Instruction * instruction_, bool isCondition, std::vector<gd::Instruction>* instructionList_, unsigned int positionInList_, gd::BaseEvent * event );
    InstructionItem();
    ~InstructionItem() {};

    bool operator==(const gd::InstructionItem & other) const;

    gd::Instruction * instruction;
    bool isCondition;
    std::vector<gd::Instruction>* instructionList;
    unsigned int positionInList;
    gd::BaseEvent * event;
};
size_t hash_value(const gd::InstructionItem & a);

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
    InstructionListItem(bool isConditionList, std::vector<gd::Instruction>* instructionList_, gd::BaseEvent * event );
    InstructionListItem();
    ~InstructionListItem() {};

    bool operator==(const InstructionListItem & other) const;

    bool isConditionList;
    std::vector<gd::Instruction>* instructionList;
    gd::BaseEvent * event;
};
size_t hash_value(const InstructionListItem & a);

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
size_t hash_value(const ParameterItem & a);

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
size_t hash_value(const FoldingItem & a);

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
#endif // EVENTSEDITORITEMSAREAS_H
