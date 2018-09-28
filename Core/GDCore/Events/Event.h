/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY)
#ifndef GDCORE_EVENT_H
#define GDCORE_EVENT_H

#include <iostream>
#include <memory>
#include <vector>
#include "GDCore/Events/Instruction.h"
#include "GDCore/Events/InstructionsList.h"
#include "GDCore/String.h"
namespace gd {
class EventsList;
class MainFrameWrapper;
class Project;
class Layout;
class EventsCodeGenerator;
class EventsCodeGenerationContext;
class Platform;
class EventsEditorItemsAreas;
class EventsEditorSelection;
class SerializerElement;
class Instruction;
}
class wxWindow;
class wxDC;

namespace gd {

class BaseEvent;
typedef std::shared_ptr<BaseEvent> BaseEventSPtr;

/**
 * \brief Base class defining an event.
 *
 * Events are usually not instance of Base Event, but instance of a derived
 * class.
 *
 * \ingroup Events
 */
class GD_CORE_API BaseEvent {
 public:
  BaseEvent();
  virtual ~BaseEvent(){};

  /**
   * Must return a pointer to a copy of the event.
   * A such method is needed as the IDE may want to store copies of some events
   * and so need a way to do polymorphic copies.
   *
   * Typical implementation example:
   * \code
   * return new MyEventClass(*this);
   * \endcode
   */
  virtual gd::BaseEvent* Clone() const { return new BaseEvent(*this); }

  /** \name Event properties
   * Members functions to be overridden by derived classes to expose the event
   * properties
   */
  ///@{

  /**
   * Derived class have to redefine this function, so as to return true, if they
   * are executable.
   */
  virtual bool IsExecutable() const { return false; };

  /**
   * Derived class have to redefine this function, so as to return true, if they
   * have sub events.
   */
  virtual bool CanHaveSubEvents() const { return false; }

  /**
   * Return the sub events, if applicable.
   */
  virtual const gd::EventsList& GetSubEvents() const { return badSubEvents; };

  /**
   * Return the sub events, if applicable.
   */
  virtual gd::EventsList& GetSubEvents() { return badSubEvents; };

  /**
   * \brief Return true if the events has sub events.
   * \warning This is only applicable when CanHaveSubEvents() return true.
   */
  bool HasSubEvents() const;

  /**
   * Event must be able to return all conditions std::vector they have.
   * Used to preprocess the conditions.
   */
  virtual std::vector<gd::InstructionsList*> GetAllConditionsVectors() {
    std::vector<gd::InstructionsList*> noConditions;
    return noConditions;
  };
  virtual std::vector<const gd::InstructionsList*> GetAllConditionsVectors()
      const {
    std::vector<const gd::InstructionsList*> noConditions;
    return noConditions;
  };

  /**
   * Event must be able to return all actions std::vector they have.
   * Used to preprocess the actions.
   */
  virtual std::vector<gd::InstructionsList*> GetAllActionsVectors() {
    std::vector<gd::InstructionsList*> noActions;
    return noActions;
  };
  virtual std::vector<const gd::InstructionsList*> GetAllActionsVectors()
      const {
    std::vector<const gd::InstructionsList*> noActions;
    return noActions;
  };

  /**
   * Event must be able to return all expressions they have.
   * Used to preprocess the expressions.
   */
  virtual std::vector<gd::Expression*> GetAllExpressions() {
    std::vector<gd::Expression*> noExpr;
    return noExpr;
  };
  virtual std::vector<const gd::Expression*> GetAllExpressions() const {
    std::vector<const gd::Expression*> noExpr;
    return noExpr;
  };

  /**
   * \brief Returns the dependencies on source files of the project.
   * \note Default implementation returns an empty list of dependencies. This is
   * fine for most events that are not related to adding custom user source
   * code.
   */
  virtual const std::vector<gd::String>& GetSourceFileDependencies() const {
    return emptyDependencies;
  };

  /**
   * \brief Returns the name of the source file associated with the event
   * \note Default implementation returns an empty string. This is fine for most
   * events that are not related to adding custom user source code.
   */
  virtual const gd::String& GetAssociatedGDManagedSourceFile(
      gd::Project& project) const {
    return emptySourceFile;
  };
  ///@}

  /** \name Code generation
   * Members functions used to generate code from the event
   */
  ///@{

  /**
   * \brief Generate the code event: the platform provided by \a codeGenerator
   * is asked for the EventMetadata associated to the event, which is then used
   * to generate the code event.
   *
   * \warning Even if this method is virtual, you should never redefine it:
   * always provide the code generation using gd::EventMetadata. This method is
   * virtual as some platforms could have hidden events (such as profiling
   * events) needing code generation without declaring the event as a part of
   * an extension.
   *
   * \see gd::EventMetadata
   */
  virtual gd::String GenerateEventCode(
      gd::EventsCodeGenerator& codeGenerator,
      gd::EventsCodeGenerationContext& context);

  /**
   * Called before events are compiled: the platform provided by \a
   * codeGenerator is asked for the EventMetadata associated to the event, which
   * is then used to preprocess the event.
   *
   * This is only done if the event MustBePreprocessed() return true.
   *
   * \warning Be careful if you're iterating over a list of event, a call to
   * Preprocess can remove the event from the list!
   *
   * \see gd::EventMetadata
   * \see gd::BaseEvent::MustBePreprocessed
   */
  virtual void Preprocess(gd::EventsCodeGenerator& codeGenerator,
                          gd::EventsList& eventList,
                          std::size_t indexOfTheEventInThisList);

  /**
   * \brief If MustBePreprocessed is redefined to return true, the
   * gd::EventMetadata::preprocessing associated to the event will be called to
   * preprocess the event.
   *
   * \see gd::BaseEvent::Preprocess
   * \see gd::EventMetadata
   */
  virtual bool MustBePreprocessed() { return false; }
  ///@}

  /** \name Serialization
   */
  ///@{
  /**
   * \brief Serialize event.
   */
  virtual void SerializeTo(SerializerElement& element) const {};

  /**
   * \brief Unserialize the event.
   */
  virtual void UnserializeFrom(gd::Project& project,
                               const SerializerElement& element){};
  ///@}

  /** \name Common properties
   * Common method shared by all events. ( No need for them to be overridden by
   * derived classes ).
   */
  ///@{

  /**
   * \brief Return the event type
   */
  const gd::String& GetType() const { return type; };

  /**
   * \brief Change the event type
   */
  void SetType(gd::String type_) { type = type_; };

  /**
   * \brief Set if the event if disabled or not
   */
  void SetDisabled(bool disable = true) { disabled = disable; }

  /**
   * \brief True if event is disabled
   */
  bool IsDisabled() const { return disabled; }

  /**
   * \brief Set if the event must be folded (i.e: sub events must
   * be hidden in the events editor).
   */
  void SetFolded(bool fold = true) { folded = fold; }

  /**
   * \brief True if the event should be folded in the events editor.
   */
  bool IsFolded() const { return folded; }

  ///@}

  /** \name Event rendering
   * Method and members used to render the event
   */
  ///@{

  /**
   * Redefine this method to draw the event.
   *
   * \param dc The wxWidgets drawing context to be used.
   * \param x The x position where the events must be drawn.
   * \param y The y position where the events must be drawn.
   * \param width The width available for drawing.
   * \param areas Use this object to indicate the areas where items have been
   * drawn \param selection Give access to the current selection(s), to draw for
   * example hovering or selecting effects.
   *
   * \note The height of the drawing must be the same as the height returned by
   * BaseEvent::GetRenderedHeight
   *
   * \see gd::EventsRenderingHelper
   * \see EventsEditorSelection
   * \see EventsEditorItemsAreas
   */
  virtual void Render(wxDC& dc,
                      int x,
                      int y,
                      unsigned int width,
                      gd::EventsEditorItemsAreas& areas,
                      gd::EventsEditorSelection& selection,
                      const gd::Platform& platform) {
    return;
  }

  /**
   * Must return the height of the event when rendered.
   *
   * \note The height of the drawing must be the same as the height of the
   * drawing made by BaseEvent::Render
   */
  virtual unsigned int GetRenderedHeight(unsigned int width,
                                         const gd::Platform& platform) const {
    return 0;
  };

  /**
   * Used by EditEvent to describe what sort of changes have been made to the
   * event. \see BaseEvent::EditEvent
   */
  enum EditEventReturnType {
    ChangesMade,
    Cancelled,
    ChangesMadeButNoNeedForEventsRecompilation
  };

  /**
   * Called when the user want to edit the event.
   */
  virtual EditEventReturnType EditEvent(
      wxWindow* parent_,
      gd::Project& game_,
      gd::Layout& scene_,
      gd::MainFrameWrapper& mainFrameWrapper_) {
    return ChangesMade;
  };

  ///@}

  mutable bool eventHeightNeedUpdate;  ///< Automatically set to true/false by
                                       ///< the events editor

  std::weak_ptr<gd::BaseEvent>
      originalEvent;  ///< Pointer only used for profiling events, so as to
                      ///< remember the original event from which it has been
                      ///< copied.
  signed long long
      totalTimeDuringLastSession;  ///< Total time, in microseconds, used by the
                                   ///< event during the last run. Used for
                                   ///< profiling.
  float percentDuringLastSession;  ///< Total time used by the event during the
                                   ///< last run. Used for profiling.

 protected:
  mutable unsigned int renderedHeight;

 private:
  bool folded;  ///< True if the subevents should be hidden in the events editor
  bool disabled;    ///< True if the event is disabled and must not be executed
  gd::String type;  ///< Type of the event. Must be assigned at the creation.
                    ///< Used for saving the event for instance.

  static gd::EventsList badSubEvents;
  static std::vector<gd::String> emptyDependencies;
  static gd::String emptySourceFile;
};

/**
 * Clone an event and insert a reference to the original event into the newly
 * created event. Used for profiling events for example.
 *
 * \see BaseEvent
 * \ingroup Events
 */
BaseEventSPtr GD_CORE_API CloneRememberingOriginalEvent(BaseEventSPtr event);

/**
 * \brief Empty event doing nothing.
 * \see gd::BaseEvent
 */
class EmptyEvent : public BaseEvent {
 public:
  EmptyEvent() : BaseEvent(){};
  virtual ~EmptyEvent(){};
};

}  // namespace gd

#endif  // GDCORE_EVENT_H
#endif
