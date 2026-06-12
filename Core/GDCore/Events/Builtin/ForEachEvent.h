/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#ifndef FOREACHEVENT_H
#define FOREACHEVENT_H
#include <vector>

#include "GDCore/Events/Event.h"
#include "GDCore/Events/EventsList.h"
#include "GDCore/Project/VariablesContainer.h"
namespace gd {
class Instruction;
class Project;
class Layout;
}

namespace gd {

/**
 * \brief Event repeated for each object of a list.
 *
 * Each time the event is repeated, only the specific object of the list is
 * picked.
 */
class GD_CORE_API ForEachEvent : public gd::BaseEvent {
 public:
  ForEachEvent();
  virtual ~ForEachEvent(){};
  virtual gd::ForEachEvent* Clone() const override { return new ForEachEvent(*this); }

  virtual bool IsExecutable() const override { return true; }

  virtual bool CanHaveSubEvents() const override { return true; }
  virtual const gd::EventsList& GetSubEvents() const override { return events; };
  virtual gd::EventsList& GetSubEvents() override { return events; };

  virtual bool CanHaveVariables() const override { return true; }
  virtual const gd::VariablesContainer& GetVariables() const override {
    return variables;
  };
  virtual gd::VariablesContainer& GetVariables() override { return variables; };

  const gd::InstructionsList& GetConditions() const { return conditions; };
  gd::InstructionsList& GetConditions() { return conditions; };

  const gd::InstructionsList& GetActions() const { return actions; };
  gd::InstructionsList& GetActions() { return actions; };

  virtual gd::InstructionsList* GetInstructionList(const gd::String& label) override;
  virtual const gd::InstructionsList* GetInstructionList(const gd::String& label) const override;

  const gd::String& GetObjectToPick() const {
    return objectsToPick.GetPlainString();
  };
  void SetObjectToPick(gd::String objectsToPick_) {
    objectsToPick = gd::Expression(objectsToPick_);
  };

  const gd::String& GetLoopIndexVariableName() const { return loopIndexVariableName; }
  void SetLoopIndexVariableName(const gd::String& name) { loopIndexVariableName = name; }

  const gd::String& GetOrderBy() const {
    return orderBy.GetPlainString();
  };
  void SetOrderBy(gd::String orderBy_) {
    orderBy = gd::Expression(orderBy_);
  };
  const gd::Expression& GetOrderByExpression() const { return orderBy; };

  const gd::String& GetOrder() const { return order; }
  void SetOrder(const gd::String& order_) { order = order_; }

  const gd::String& GetLimit() const {
    return limit.GetPlainString();
  };
  void SetLimit(gd::String limit_) {
    limit = gd::Expression(limit_);
  };
  const gd::Expression& GetLimitExpression() const { return limit; };

  virtual std::vector<const gd::InstructionsList*> GetAllConditionsVectors()
      const override;
  virtual std::vector<const gd::InstructionsList*> GetAllActionsVectors() const override;
  virtual std::vector<std::pair<const gd::Expression*, const gd::ParameterMetadata> >
      GetAllExpressionsWithMetadata() const override;

  virtual std::vector<gd::InstructionsList*> GetAllConditionsVectors() override;
  virtual std::vector<gd::InstructionsList*> GetAllActionsVectors() override;
  virtual std::vector<std::pair<gd::Expression*, gd::ParameterMetadata> >
      GetAllExpressionsWithMetadata() override;

  virtual void SerializeTo(SerializerElement& element) const override;
  virtual void UnserializeFrom(gd::Project& project,
                               const SerializerElement& element) override;

 private:
  gd::Expression objectsToPick;
  gd::InstructionsList conditions;
  gd::InstructionsList actions;
  gd::EventsList events;
  VariablesContainer variables;
  gd::String loopIndexVariableName;
  gd::Expression orderBy;
  gd::String order;
  gd::Expression limit;
};

}  // namespace gd

#endif  // FOREACHEVENT_H
