/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
/**
 * @file Tests covering events of GDevelop Core.
 */
#include "catch.hpp"

#include <algorithm>
#include <initializer_list>
#include <map>

#include "GDCore/CommonTools.h"
#include "GDCore/Project/InitialInstancesContainer.h"
#include "GDCore/Tools/VersionWrapper.h"

void AddNewInitialInstance(gd::InitialInstancesContainer &container,
                           const gd::String &objectName,
                           const gd::String &layer,
                           int zorder) {
  auto &i = container.InsertNewInitialInstance();
  i.SetObjectName(objectName);
  i.SetLayer(layer);
  i.SetZOrder(zorder);
}

gd::InitialInstance MakeInstance(const gd::String &objectName,
                                 const gd::String &layer,
                                 int zorder) {
  gd::InitialInstance i;
  i.SetObjectName(objectName);
  i.SetLayer(layer);
  i.SetZOrder(zorder);

  return i;
}

class ZOrderCheckFunctor : public gd::InitialInstanceFunctor {
 public:
  ZOrderCheckFunctor(const gd::String &layer)
      : layer(layer), lastZOrder(-1000), isOk(true) {}

  void operator()(gd::InitialInstance &instance) {
    // Check if the instances are correctly filtered and sorted
    if (instance.GetLayer() != layer || lastZOrder > instance.GetZOrder())
      isOk = false;

    lastZOrder = instance.GetZOrder();
  }

  bool IsOk() const { return isOk; }

 private:
  gd::String layer;
  int lastZOrder;
  bool isOk;
};

class AllInstancesFunctor : public gd::InitialInstanceFunctor {
 public:
  void operator()(gd::InitialInstance &instance) {
    allInitialInstances.push_back(instance);
  }

  bool Compare(
      const std::initializer_list<gd::InitialInstance> &expectedInstances) {
    return allInitialInstances.size() == expectedInstances.size() &&
           std::is_permutation(allInitialInstances.cbegin(),
                               allInitialInstances.cend(),
                               expectedInstances.begin(),
                               [](const gd::InitialInstance &i1,
                                  const gd::InitialInstance &i2) -> bool {
                                 return i1.GetObjectName() ==
                                            i2.GetObjectName() &&
                                        i1.GetLayer() == i2.GetLayer() &&
                                        i1.GetZOrder() == i2.GetZOrder();
                               });
  }

 private:
  std::vector<gd::InitialInstance> allInitialInstances;
};

TEST_CASE("InitialInstancesContainer", "[common][instances]") {
  gd::InitialInstancesContainer container;

  AddNewInitialInstance(container, "object1", "layer1", 10);
  AddNewInitialInstance(container, "object1", "layer2", 10);
  AddNewInitialInstance(container, "object1", "layer1", 14);
  AddNewInitialInstance(container, "object2", "layer1", 12);
  AddNewInitialInstance(container, "object2", "layer1", 10);
  AddNewInitialInstance(container, "object3", "layer2", 11);
  AddNewInitialInstance(container, "object3", "layer2", 9);

  SECTION("IterateOverInstances") {
    AllInstancesFunctor func;
    container.IterateOverInstances(func);
    REQUIRE(func.Compare({MakeInstance("object1", "layer1", 10),
                          MakeInstance("object1", "layer2", 10),
                          MakeInstance("object1", "layer1", 14),
                          MakeInstance("object2", "layer1", 12),
                          MakeInstance("object2", "layer1", 10),
                          MakeInstance("object3", "layer2", 11),
                          MakeInstance("object3", "layer2", 9)}) == true);
  }

  SECTION("IterateOverInstancesWithZOrdering") {
    ZOrderCheckFunctor func("layer1");
    container.IterateOverInstancesWithZOrdering(func, "layer1");
    REQUIRE(func.IsOk() == true);
  }

  SECTION("RemoveInstance") {
    auto &i = container.InsertNewInitialInstance();
    i.SetObjectName("new");
    auto &i2 = container.InsertNewInitialInstance();
    i2.SetObjectName("newtwo");
    auto &i3 = container.InsertNewInitialInstance();
    i3.SetObjectName("newthree");

    {
      AllInstancesFunctor func;
      container.IterateOverInstances(func);
      REQUIRE(func.Compare({MakeInstance("object1", "layer1", 10),
                            MakeInstance("object1", "layer2", 10),
                            MakeInstance("object1", "layer1", 14),
                            MakeInstance("object2", "layer1", 12),
                            MakeInstance("object2", "layer1", 10),
                            MakeInstance("object3", "layer2", 11),
                            MakeInstance("object3", "layer2", 9),
                            MakeInstance("new", "", 0),
                            MakeInstance("newtwo", "", 0),
                            MakeInstance("newthree", "", 0)}) == true);
    }

    // Delete a few objects to make sure that pointers/references to
    // the other objects stay the same.
    container.RemoveInstance(i);
    container.RemoveInstance(i2);

    {
      AllInstancesFunctor func;
      container.IterateOverInstances(func);
      REQUIRE(func.Compare({MakeInstance("object1", "layer1", 10),
                            MakeInstance("object1", "layer2", 10),
                            MakeInstance("object1", "layer1", 14),
                            MakeInstance("object2", "layer1", 12),
                            MakeInstance("object2", "layer1", 10),
                            MakeInstance("object3", "layer2", 11),
                            MakeInstance("object3", "layer2", 9),
                            MakeInstance("newthree", "", 0)}) == true);
    }

    container.RemoveInstance(i3);

    {
      AllInstancesFunctor func;
      container.IterateOverInstances(func);
      REQUIRE(func.Compare({MakeInstance("object1", "layer1", 10),
                            MakeInstance("object1", "layer2", 10),
                            MakeInstance("object1", "layer1", 14),
                            MakeInstance("object2", "layer1", 12),
                            MakeInstance("object2", "layer1", 10),
                            MakeInstance("object3", "layer2", 11),
                            MakeInstance("object3", "layer2", 9)}) == true);
    }
  }

  SECTION("RemoveAllInstancesOnLayer") {
    container.RemoveAllInstancesOnLayer("layer1");

    AllInstancesFunctor func;
    container.IterateOverInstances(func);
    REQUIRE(func.Compare({MakeInstance("object1", "layer2", 10),
                          MakeInstance("object3", "layer2", 11),
                          MakeInstance("object3", "layer2", 9)}) == true);
  }

  SECTION("RemoveInitialInstancesOfObject") {
    container.RemoveInitialInstancesOfObject("object2");

    AllInstancesFunctor func;
    container.IterateOverInstances(func);
    REQUIRE(func.Compare({MakeInstance("object1", "layer1", 10),
                          MakeInstance("object1", "layer2", 10),
                          MakeInstance("object1", "layer1", 14),
                          MakeInstance("object3", "layer2", 11),
                          MakeInstance("object3", "layer2", 9)}) == true);
  }

  SECTION("MoveInstancesToLayer") {
    container.MoveInstancesToLayer("layer1", "layer3");

    AllInstancesFunctor func;
    container.IterateOverInstances(func);
    REQUIRE(func.Compare({MakeInstance("object1", "layer3", 10),
                          MakeInstance("object1", "layer2", 10),
                          MakeInstance("object1", "layer3", 14),
                          MakeInstance("object2", "layer3", 12),
                          MakeInstance("object2", "layer3", 10),
                          MakeInstance("object3", "layer2", 11),
                          MakeInstance("object3", "layer2", 9)}) == true);
  }

  SECTION("RenameInstancesOfObject") {
    container.RenameInstancesOfObject("object1", "object4");
    container.RenameInstancesOfObject("object2", "object5");

    AllInstancesFunctor func;
    container.IterateOverInstances(func);
    REQUIRE(func.Compare({MakeInstance("object4", "layer1", 10),
                          MakeInstance("object4", "layer2", 10),
                          MakeInstance("object4", "layer1", 14),
                          MakeInstance("object5", "layer1", 12),
                          MakeInstance("object5", "layer1", 10),
                          MakeInstance("object3", "layer2", 11),
                          MakeInstance("object3", "layer2", 9)}) == true);
  }

  SECTION("SomeInstancesAreOnLayer") {
    REQUIRE(container.SomeInstancesAreOnLayer("layer1") == true);
    REQUIRE(container.SomeInstancesAreOnLayer("layer2") == true);
    REQUIRE(container.SomeInstancesAreOnLayer("layer3") == false);
    REQUIRE(container.SomeInstancesAreOnLayer("layer5") == false);
  }
}
