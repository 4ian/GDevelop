/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#ifndef EVENTSEDITORITEMSAREAS_H
#define EVENTSEDITORITEMSAREAS_H
#include <wx/gdicmn.h>
#include <boost/weak_ptr.hpp>
#include <boost/unordered_map.hpp>
#include <vector>
#include <utility>
class EventsEditor;
class BaseEvent;
class Instruction;
class GDExpression;

/**
 * \brief Used ( internally by Events editor ) to indicate to EventsEditorItemsAreas that an event is displayed somewhere
 */
class GD_API EventItem
{
public:
    EventItem(boost::shared_ptr<BaseEvent> event_, std::vector<boost::shared_ptr<BaseEvent> > * eventsList_, unsigned int positionInList_ );
    EventItem();
    ~EventItem() {};

    bool operator==(const EventItem & other) const;

    boost::shared_ptr<BaseEvent> event;
    std::vector<boost::shared_ptr<BaseEvent> > * eventsList;
    unsigned int positionInList;
};
size_t hash_value(const EventItem & a);

/**
 * \brief Used to indicate to EventsEditorItemsAreas that an instruction is displayed somewhere
 */
class GD_API InstructionItem
{
public:
    /**
     * Use this constructor to declare the instruction, the list it belongs to and its position in this list.
     */
    InstructionItem(Instruction * instruction_, bool isCondition, std::vector<Instruction>* instructionList_, unsigned int positionInList_, BaseEvent * event );
    InstructionItem();
    ~InstructionItem() {};

    bool operator==(const InstructionItem & other) const;

    Instruction * instruction;
    bool isCondition;
    std::vector<Instruction>* instructionList;
    unsigned int positionInList;
    BaseEvent * event;
};
size_t hash_value(const InstructionItem & a);

/**
 * \brief Used to indicate to EventsEditorItemsAreas that an instruction list is displayed somewhere
 */
class GD_API InstructionListItem
{
public:
    /**
     * Use this constructor to declare the instruction, the list it belongs to and its position in this list.
     */
    InstructionListItem(bool isConditionList, std::vector<Instruction>* instructionList_, BaseEvent * event );
    InstructionListItem();
    ~InstructionListItem() {};

    bool operator==(const InstructionListItem & other) const;

    bool isConditionList;
    std::vector<Instruction>* instructionList;
    BaseEvent * event;
};
size_t hash_value(const InstructionListItem & a);

/**
 * \brief Used to indicate to EventsEditorItemsAreas that a parameter is displayed somewhere
 */
class GD_API ParameterItem
{
public:
    ParameterItem(GDExpression * parameter_, BaseEvent * event);
    ParameterItem();
    ~ParameterItem() {};

    bool operator==(const ParameterItem & other) const;

    GDExpression * parameter;
    BaseEvent * event;
};
size_t hash_value(const ParameterItem & a);

/**
 * \brief Used to indicate to EventsEditorItemsAreas that a fold/unfold button is displayed somewhere
 */
class GD_API FoldingItem
{
public:
    FoldingItem(BaseEvent * event);
    FoldingItem();
    ~FoldingItem() {};

    bool operator==(const FoldingItem & other) const;

    BaseEvent * event;
};
size_t hash_value(const FoldingItem & a);

/**
 * \brief Allow events to indicate where they displayed an instruction/parameter
 * Events editor also uses this internally to indicate where events are displayed.
 */
class GD_API EventsEditorItemsAreas
{
public:
    EventsEditorItemsAreas() {};
    virtual ~EventsEditorItemsAreas() {};

    /**
     * Notify the editor there is an instruction in this area
     */
    void AddInstructionArea(wxRect area, InstructionItem & instruction);

    /**
     * Notify the editor there is a parameter in this area
     */
    void AddParameterArea(wxRect area, ParameterItem & parameter);

    /**
     * Notify the editor there is an event in this area
     */
    void AddEventArea(wxRect area, EventItem & event);

    /**
     * Notify the editor there is a folding button in this area
     */
    void AddFoldingItem(wxRect area, FoldingItem & event);

    /**
     * Notify the editor there is a list in this area
     */
    void AddInstructionListArea(wxRect area, InstructionListItem & item);

    /**
     * True if a point is on an event.
     */
    bool IsOnEvent(int x, int y);

    /**
     * Return event at point (x,y). Be sure there is an event here using IsOnEvent(x,y);
     */
    EventItem GetEventAt(int x, int y);

    /**
     * True if a point is on an instruction.
     */
    bool IsOnInstruction(int x, int y);

    /**
     * Return event at point (x,y). Be sure there is an event here using IsOnInstruction(x,y);
     */
    InstructionItem GetInstructionAt(int x, int y);

    /**
     * True if a point is on an instruction list.
     */
    bool IsOnInstructionList(int x, int y);

    /**
     * Return event at point (x,y). Be sure there is an event here using IsOnEvent(x,y);
     */
    InstructionListItem GetInstructionListAt(int x, int y);

    /**
     * Return the rectangle used by the list at point(x,y).
     */
    wxRect GetAreaOfInstructionListAt(int x, int y);

    /**
     * True if a point is on an event.
     */
    bool IsOnParameter(int x, int y);

    /**
     * Return event at point (x,y). Be sure there is an event here using IsOnEvent(x,y);
     */
    ParameterItem GetParameterAt(int x, int y);

    /**
     * Return the rectangle used by the parameter at point(x,y).
     */
    wxRect GetAreaOfParameterAt(int x, int y);

    /**
     * True if a point is on an event.
     */
    bool IsOnFoldingItem(int x, int y);

    /**
     * Return event at point (x,y). Be sure there is an event here using IsOnEvent(x,y);
     */
    FoldingItem GetFoldingItemAt(int x, int y);

    /**
     * Clear all areas ( typically before redraw )
     */
    void Clear();

    std::vector< std::pair<wxRect, EventItem > > eventsAreas;
    std::vector< std::pair<wxRect, InstructionItem > > instructionsAreas;
    std::vector< std::pair<wxRect, ParameterItem > > parametersAreas;
    std::vector< std::pair<wxRect, FoldingItem > > foldingAreas;
    std::vector< std::pair<wxRect, InstructionListItem > > instructionListsAreas;

private:
};

#endif // EVENTSEDITORITEMSAREAS_H
#endif
