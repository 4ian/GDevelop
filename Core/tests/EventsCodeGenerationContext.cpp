/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
/**
 * @file Tests covering events code generation context,
 */
#include "GDCore/Events/CodeGeneration/EventsCodeGenerationContext.h"
#include <memory>
#include "GDCore/CommonTools.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Tools/VersionWrapper.h"
#include "catch.hpp"

TEST_CASE("EventsCodeGenerationContext", "[common][events]") {
  /**
   * Generate a tree of contexts with declared objects as below:
   *                   c1 -> c1.object1, c1.object2, c1.noPicking1 (no picking
   * request)
   *                  /  \
   *  c2.object1 <- c2   c3 -> c3.object1, c1.object2
   *               /  \
   *              c4  c5 -> c5.object1, c5.noPicking1 (no picking request),
   * c1.object2, c5.empty1
   */

  unsigned int maxDepth = 0;
  gd::EventsCodeGenerationContext c1(&maxDepth);
  c1.ObjectsListNeeded("c1.object1");
  c1.ObjectsListNeeded("c1.object2");
  c1.ObjectsListNeededOrEmptyIfJustDeclared("c1.noPicking1");

  gd::EventsCodeGenerationContext c2;
  c2.InheritsFrom(c1);
  c2.ObjectsListNeeded("c2.object1");

  gd::EventsCodeGenerationContext c3;
  c3.InheritsFrom(c1);
  c3.ObjectsListNeeded("c3.object1");
  c3.ObjectsListNeeded("c1.object2");

  gd::EventsCodeGenerationContext c4;
  c4.InheritsFrom(c2);

  gd::EventsCodeGenerationContext c5;
  c5.InheritsFrom(c2);
  c5.ObjectsListNeededOrEmptyIfJustDeclared("c5.noPicking1");
  c5.ObjectsListNeeded("c5.object1");
  c5.ObjectsListNeeded("c1.object2");
  c5.EmptyObjectsListNeeded("c5.empty1");

  SECTION("Parenting") {
    REQUIRE(c2.GetParentContext() == &c1);
    REQUIRE(c3.GetParentContext() == &c1);
    REQUIRE(c4.GetParentContext() == &c2);
    REQUIRE(c5.GetParentContext() == &c2);
  }

  SECTION("Depth") {
    REQUIRE(maxDepth == 2);

    REQUIRE(c1.GetContextDepth() == 0);
    REQUIRE(c2.GetContextDepth() == 1);
    REQUIRE(c3.GetContextDepth() == 1);
    REQUIRE(c4.GetContextDepth() == 2);
    REQUIRE(c5.GetContextDepth() == 2);
  }

  SECTION("Object list needed") {
    REQUIRE(c1.GetObjectsListsAlreadyDeclaredByParents() == std::set<gd::String>());
    REQUIRE(c1.GetObjectsListsToBeDeclared() ==
            std::set<gd::String>({"c1.object1", "c1.object2"}));
    REQUIRE(c1.GetObjectsListsToBeEmptyIfJustDeclared() ==
            std::set<gd::String>({"c1.noPicking1"}));
    REQUIRE(c1.GetAllObjectsToBeDeclared() ==
            std::set<gd::String>({"c1.object1", "c1.object2", "c1.noPicking1"}));

    REQUIRE(c2.GetObjectsListsAlreadyDeclaredByParents() ==
            std::set<gd::String>({"c1.object1", "c1.object2", "c1.noPicking1"}));
    REQUIRE(c2.GetObjectsListsToBeDeclared() ==
            std::set<gd::String>({"c2.object1"}));
    REQUIRE(c2.GetObjectsListsToBeEmptyIfJustDeclared() == std::set<gd::String>());
    REQUIRE(c2.GetAllObjectsToBeDeclared() ==
            std::set<gd::String>({"c2.object1"}));

    REQUIRE(c3.GetObjectsListsAlreadyDeclaredByParents() ==
            std::set<gd::String>({"c1.object1", "c1.object2", "c1.noPicking1"}));
    REQUIRE(c3.GetObjectsListsToBeDeclared() ==
            std::set<gd::String>({"c3.object1", "c1.object2"}));
    REQUIRE(c3.GetObjectsListsToBeEmptyIfJustDeclared() == std::set<gd::String>());
    REQUIRE(c3.GetAllObjectsToBeDeclared() ==
            std::set<gd::String>({"c3.object1", "c1.object2"}));

    REQUIRE(c5.GetObjectsListsAlreadyDeclaredByParents() ==
            std::set<gd::String>(
                {"c1.object1", "c1.object2", "c1.noPicking1", "c2.object1"}));
    REQUIRE(c5.GetObjectsListsToBeDeclared() ==
            std::set<gd::String>({"c5.object1", "c1.object2"}));
    REQUIRE(c5.GetObjectsListsToBeEmptyIfJustDeclared() ==
            std::set<gd::String>({"c5.noPicking1"}));
    REQUIRE(c5.GetObjectsListsToBeDeclaredEmpty() ==
            std::set<gd::String>({"c5.empty1"}));
    REQUIRE(c5.GetAllObjectsToBeDeclared() ==
            std::set<gd::String>({"c5.object1", "c5.noPicking1", "c1.object2", "c5.empty1"}));
  }

  SECTION("ObjectAlreadyDeclaredByParents") {
    REQUIRE(c1.ObjectAlreadyDeclaredByParents("c1.object1") == false);
    REQUIRE(c2.ObjectAlreadyDeclaredByParents("c1.object1") == true);
    REQUIRE(c3.ObjectAlreadyDeclaredByParents("c1.object1") == true);
    REQUIRE(c4.ObjectAlreadyDeclaredByParents("c1.object1") == true);
    REQUIRE(c5.ObjectAlreadyDeclaredByParents("c1.object1") == true);

    REQUIRE(c1.ObjectAlreadyDeclaredByParents("c2.object1") == false);
    REQUIRE(c2.ObjectAlreadyDeclaredByParents("c2.object1") == false);
    REQUIRE(c3.ObjectAlreadyDeclaredByParents("c2.object1") == false);
    REQUIRE(c4.ObjectAlreadyDeclaredByParents("c2.object1") == true);
    REQUIRE(c5.ObjectAlreadyDeclaredByParents("c2.object1") == true);
  }

  SECTION("Object list last depth") {
    REQUIRE(c1.GetLastDepthObjectListWasNeeded("c1.object1") == 0);
    REQUIRE(c2.GetLastDepthObjectListWasNeeded("c2.object1") == 1);
    REQUIRE(c3.GetLastDepthObjectListWasNeeded("c3.object1") == 1);
    REQUIRE(c4.GetLastDepthObjectListWasNeeded("c2.object1") == 1);
    REQUIRE(c5.GetLastDepthObjectListWasNeeded("c1.object2") == 2);
    REQUIRE(c5.GetLastDepthObjectListWasNeeded("c2.object1") == 1);
    REQUIRE(c5.GetLastDepthObjectListWasNeeded("c5.object1") == 2);
    REQUIRE(c5.GetLastDepthObjectListWasNeeded("c5.empty1") == 2);
  }

  SECTION("SetCurrentObject") {
    REQUIRE(c3.GetCurrentObject() == "");
    c3.SetCurrentObject("current object");
    REQUIRE(c3.GetCurrentObject() == "current object");
    c3.SetNoCurrentObject();
    REQUIRE(c3.GetCurrentObject() == "");
  }

  SECTION("Reuse") {
    /**
     * Generate a tree of contexts with declared objects as below:
     *                  ...
     *                   \
     *                   c5 -> c5.object1, c5.noPicking1 (no picking request),
     * c1.object2
     *                  /
     *                c6  (reuse c5) -> c5.object1, c6.object3
     *               /
     *              c7 -> c5.object1, c5.empty1 (empty list request)
     */
    gd::EventsCodeGenerationContext c6;
    c6.Reuse(c5);
    c6.ObjectsListNeeded("c5.object1");
    c6.ObjectsListNeeded("c6.object3");

    gd::EventsCodeGenerationContext c7;
    c7.InheritsFrom(c6);
    c7.ObjectsListNeeded("c5.object1");
    c7.ObjectsListNeeded("c6.object3");
    c7.EmptyObjectsListNeeded("c5.empty1");

    // c6 is reusing c5 context so it has the same depth:
    REQUIRE(c6.GetParentContext() == &c5);
    REQUIRE(c6.GetContextDepth() == c5.GetContextDepth());
    REQUIRE(c6.GetLastDepthObjectListWasNeeded("c6.object3") == 2);

    // c6 reuse the objects lists from c5:
    REQUIRE(c6.IsSameObjectsList("c5.object1", c5) == true);
    REQUIRE(c6.IsSameObjectsList("c5.noPicking1", c5) == true);
    REQUIRE(c6.GetLastDepthObjectListWasNeeded("c5.object1") ==
            c5.GetLastDepthObjectListWasNeeded("c5.object1"));
    REQUIRE(c6.GetLastDepthObjectListWasNeeded("c5.noPicking1") ==
            c5.GetLastDepthObjectListWasNeeded("c5.noPicking1"));

    REQUIRE(c7.GetParentContext() == &c6);
    REQUIRE(c7.GetContextDepth() == 3);
    REQUIRE(c7.IsSameObjectsList("c5.object1", c6) == false);
    REQUIRE(c7.IsSameObjectsList("c6.object3", c6) == false);
    REQUIRE(c7.IsSameObjectsList("c5.empty1", c5) == false);
  }

  SECTION("Async") {
    gd::EventsCodeGenerationContext c1;
    c1.ObjectsListNeeded("c1.object1");
    c1.ObjectsListNeeded("c1.object2");
    c1.ObjectsListNeededOrEmptyIfJustDeclared("c1.possiblyEmpty1");
    c1.EmptyObjectsListNeeded("c1.empty1");

    gd::EventsCodeGenerationContext c2;
    c2.InheritsAsAsyncCallbackFrom(c1);
    c2.ObjectsListNeeded("c2.object1");
    c2.ObjectsListNeededOrEmptyIfJustDeclared("c2.possiblyEmpty1");
    c2.EmptyObjectsListNeeded("c2.empty1");
    c2.ObjectsListNeeded("c1.object1");

    gd::EventsCodeGenerationContext c3;
    c3.InheritsAsAsyncCallbackFrom(c2);
    c3.ObjectsListNeeded("c3.object1");
    c3.ObjectsListNeededOrEmptyIfJustDeclared("c3.possiblyEmpty1");
    c3.EmptyObjectsListNeeded("c3.empty1");
    c3.ObjectsListNeeded("c1.object1");

    gd::EventsCodeGenerationContext c4;
    c4.InheritsFrom(c3);
    c4.ObjectsListNeeded("c4.object1");
    c4.ObjectsListNeededOrEmptyIfJustDeclared("c4.possiblyEmpty1");
    c4.EmptyObjectsListNeeded("c4.empty1");
    c4.ObjectsListNeeded("c1.object1");
    c4.ObjectsListNeeded("c1.object2");

    gd::EventsCodeGenerationContext c5;
    c5.InheritsFrom(c4);
    c5.ObjectsListNeeded("c5.object1");
    c5.ObjectsListNeededOrEmptyIfJustDeclared("c5.possiblyEmpty1");
    c5.EmptyObjectsListNeeded("c5.empty1");
    c5.ObjectsListNeeded("c1.object1");
    c5.ObjectsListNeeded("c1.object2");

    REQUIRE(c1.ShouldUseAsyncObjectsList("c1.object1") == false);
    REQUIRE(c1.ShouldUseAsyncObjectsList("c1.possiblyEmpty1") == false);
    REQUIRE(c1.ShouldUseAsyncObjectsList("c1.empty1") == false);

    // Objects declared in async callback are used traditionally:
    REQUIRE(c2.ShouldUseAsyncObjectsList("c2.object1") == false);
    REQUIRE(c2.ShouldUseAsyncObjectsList("c2.possiblyEmpty1") == false);
    REQUIRE(c2.ShouldUseAsyncObjectsList("c2.empty1") == false);

    // Objects declared in c1 are gotten from the async list in c2 and c3
    // because these contexts use them and are async.
    REQUIRE(c2.ShouldUseAsyncObjectsList("c1.object1") == true);
    REQUIRE(c3.ShouldUseAsyncObjectsList("c1.object1") == true);
    REQUIRE(c4.ShouldUseAsyncObjectsList("c1.object1") == false);
    REQUIRE(c5.ShouldUseAsyncObjectsList("c1.object1") == false);

    // Objects declared in c1 are gotten from the async list in c4
    // because c3 is async (but is not using them)
    REQUIRE(c4.ShouldUseAsyncObjectsList("c1.object2") == true);

    // Objects declared in c1 but gotten from the async list in c4
    // is used traditionnally:
    REQUIRE(c5.ShouldUseAsyncObjectsList("c1.object2") == false);

    // Objects declared in or after c3 are used traditionally:
    REQUIRE(c3.ShouldUseAsyncObjectsList("c3.object1") == false);
    REQUIRE(c4.ShouldUseAsyncObjectsList("c3.object1") == false);
    REQUIRE(c5.ShouldUseAsyncObjectsList("c3.object1") == false);
    REQUIRE(c3.ShouldUseAsyncObjectsList("c3.possiblyEmpty1") == false);
    REQUIRE(c4.ShouldUseAsyncObjectsList("c3.possiblyEmpty1") == false);
    REQUIRE(c5.ShouldUseAsyncObjectsList("c3.possiblyEmpty1") == false);
    REQUIRE(c3.ShouldUseAsyncObjectsList("c3.empty1") == false);
    REQUIRE(c4.ShouldUseAsyncObjectsList("c3.empty1") == false);
    REQUIRE(c5.ShouldUseAsyncObjectsList("c3.empty1") == false);
    REQUIRE(c4.ShouldUseAsyncObjectsList("c4.object1") == false);
    REQUIRE(c4.ShouldUseAsyncObjectsList("c4.possiblyEmpty1") == false);
    REQUIRE(c4.ShouldUseAsyncObjectsList("c4.empty1") == false);
    REQUIRE(c5.ShouldUseAsyncObjectsList("c4.object1") == false);
    REQUIRE(c5.ShouldUseAsyncObjectsList("c4.possiblyEmpty1") == false);
    REQUIRE(c5.ShouldUseAsyncObjectsList("c4.empty1") == false);
    REQUIRE(c5.ShouldUseAsyncObjectsList("c5.object1") == false);
    REQUIRE(c5.ShouldUseAsyncObjectsList("c5.possiblyEmpty1") == false);
    REQUIRE(c5.ShouldUseAsyncObjectsList("c5.empty1") == false);

  }
}
