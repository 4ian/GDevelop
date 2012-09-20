/**

Game Develop - A Star Automatism Extension
Copyright (c) 2010-2012 Florian Rival (Florian.Rival@gmail.com)

This software is provided 'as-is', without any express or implied
warranty. In no event will the authors be held liable for any damages
arising from the use of this software.

Permission is granted to anyone to use this software for any purpose,
including commercial applications, and to alter it and redistribute it
freely, subject to the following restrictions:

    1. The origin of this software must not be misrepresented; you must not
    claim that you wrote the original software. If you use this software
    in a product, an acknowledgment in the product documentation would be
    appreciated but is not required.

    2. Altered source versions must be plainly marked as such, and must not be
    misrepresented as being the original software.

    3. This notice may not be removed or altered from any source
    distribution.

*/

#include "GDL/ExtensionBase.h"
#include "GDL/Version.h"
#include "AStarAutomatism.h"
#include "SceneAStarDatas.h"
#include <boost/version.hpp>

/**
 * \brief This class declares information about the extension.
 */
class Extension : public ExtensionBase
{
    public:

        /**
         * Constructor of an extension declares everything the extension contains : Objects, actions, conditions and expressions.
         */
        Extension()
        {
            DECLARE_THE_EXTENSION("AStarAutomatism",
                                  _("Pathfinding automatism"),
                                  _("Automatism which move objects and avoid obstacles"),
                                  "Compil Games",
                                  "zlib/libpng License ( Open Source )")

                DECLARE_AUTOMATISM("AStarAutomatism",
                          _("Pathfinding"),
                          _("AStar"),
                          _("Automatism which move objects and avoid obstacles"),
                          "",
                          "Extensions/AStaricon.png",
                          AStarAutomatism,
                          SceneAStarDatas)

                    #if defined(GD_IDE_ONLY)

                    automatismInfo.SetIncludeFile("AStarAutomatism/AStarAutomatism.h");

                    DECLARE_AUTOMATISM_ACTION("SetDestination",
                                   _("Move to a position"),
                                   _("Move the object to a position"),
                                   _("Move _PARAM0_ to _PARAM3_;_PARAM4_"),
                                   _("Displacement"),
                                   "Extensions/AStaricon24.png",
                                   "Extensions/AStaricon16.png");

                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "AStarAutomatism", false);
                        instrInfo.AddCodeOnlyParameter("currentScene", "");
                        instrInfo.AddParameter("expression", _("Destination X position"), "", false);
                        instrInfo.AddParameter("expression", _("Destination Y position"), "", false);

                        instrInfo.cppCallingInformation.SetFunctionName("MoveTo").SetIncludeFile("AStarAutomatism/AStarAutomatism.h");

                    DECLARE_END_AUTOMATISM_ACTION()

                    DECLARE_AUTOMATISM_ACTION("SetSpeed",
                                   _("Speed"),
                                   _("Change the moving speed on the path"),
                                   _("Do _PARAM2__PARAM1_ to speed of of _PARAM0_ on the path"),
                                   _("Displacement"),
                                   "Extensions/AStaricon24.png",
                                   "Extensions/AStaricon16.png");

                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "AStarAutomatism", false);
                        instrInfo.AddParameter("expression", _("Speed"), "", false);
                        instrInfo.AddParameter("operator", _("Modification's sign"), "", false);

                        instrInfo.cppCallingInformation.SetFunctionName("SetSpeed").SetAssociatedGetter("GetSpeed").SetManipulatedType("number").SetIncludeFile("AStarAutomatism/AStarAutomatism.h");

                    DECLARE_END_AUTOMATISM_ACTION()

                    DECLARE_AUTOMATISM_CONDITION("Speed",
                                   _("Speed"),
                                   _("Test the moving speed on the path"),
                                   _("Moving speed of _PARAM0_ is _PARAM3__PARAM2_"),
                                   _("Displacement"),
                                   "Extensions/AStaricon24.png",
                                   "Extensions/AStaricon16.png");

                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "AStarAutomatism", false);
                        instrInfo.AddParameter("expression", _("Speed"), "", false);
                        instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);

                        instrInfo.cppCallingInformation.SetFunctionName("GetSpeed").SetManipulatedType("number").SetIncludeFile("AStarAutomatism/AStarAutomatism.h");


                    DECLARE_END_AUTOMATISM_CONDITION()

                    DECLARE_AUTOMATISM_ACTION("SetCost",
                                   _("Cost"),
                                   _("Change the cost of going through the object. 9 means the object is impassable."),
                                   _("Do _PARAM2__PARAM1_ to cost of _PARAM0_"),
                                   _("Obstacles"),
                                   "Extensions/AStaricon24.png",
                                   "Extensions/AStaricon16.png");

                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "AStarAutomatism", false);
                        instrInfo.AddParameter("expression", _("Difficulty ( from 0 to 9 )"), "", false);
                        instrInfo.AddParameter("operator", _("Modification's sign"), "", false);

                        instrInfo.cppCallingInformation.SetFunctionName("SetCost").SetAssociatedGetter("GetCost").SetManipulatedType("number").SetIncludeFile("AStarAutomatism/AStarAutomatism.h");

                    DECLARE_END_AUTOMATISM_ACTION()

                    DECLARE_AUTOMATISM_CONDITION("Cost",
                                   _("Cost"),
                                   _("Test the cost of going through the object"),
                                   _("Cost of _PARAM0_ is _PARAM3__PARAM2_"),
                                   _("Obstacles"),
                                   "Extensions/AStaricon24.png",
                                   "Extensions/AStaricon16.png");

                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "AStarAutomatism", false);
                        instrInfo.AddParameter("expression", _("Difficulty"), "", false);
                        instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);

                        instrInfo.cppCallingInformation.SetFunctionName("GetCost").SetManipulatedType("number").SetIncludeFile("AStarAutomatism/AStarAutomatism.h");


                    DECLARE_END_AUTOMATISM_CONDITION()

                    DECLARE_AUTOMATISM_CONDITION("PathFound",
                                   _("Path found"),
                                   _("Return true if a path has been found"),
                                   _("A path has been found for _PARAM0_"),
                                   _("Displacement"),
                                   "Extensions/AStaricon24.png",
                                   "Extensions/AStaricon16.png");

                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "AStarAutomatism", false);

                        instrInfo.cppCallingInformation.SetFunctionName("PathFound").SetIncludeFile("AStarAutomatism/AStarAutomatism.h");

                    DECLARE_END_AUTOMATISM_CONDITION()

                    DECLARE_AUTOMATISM_CONDITION("DestinationReached",
                                   _("Destination reached"),
                                   _("Return true if destination was reached"),
                                   _("_PARAM0_ reached its destination"),
                                   _("Displacement"),
                                   "Extensions/AStaricon24.png",
                                   "Extensions/AStaricon16.png");

                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "AStarAutomatism", false);

                        instrInfo.cppCallingInformation.SetFunctionName("DestinationReached").SetIncludeFile("AStarAutomatism/AStarAutomatism.h");

                    DECLARE_END_AUTOMATISM_CONDITION()
                    DECLARE_AUTOMATISM_ACTION("SetGridWidth",
                                   _("Width of the virtual grid"),
                                   _("Change the width of cells of virtual grid."),
                                   _("Do _PARAM4__PARAM3_ to the width of cells of the virtual grid"),
                                   _("Global Setup"),
                                   "Extensions/AStaricon24.png",
                                   "Extensions/AStaricon16.png");

                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "AStarAutomatism", false);
                        instrInfo.AddCodeOnlyParameter("currentScene", "");
                        instrInfo.AddParameter("expression", _("Width ( pixels )"), "", false);
                        instrInfo.AddParameter("operator", _("Modification's sign"), "", false);

                        instrInfo.cppCallingInformation.SetFunctionName("SetGridWidth").SetAssociatedGetter("GetGridWidth").SetManipulatedType("number").SetIncludeFile("AStarAutomatism/AStarAutomatism.h");


                    DECLARE_END_AUTOMATISM_ACTION()

                    DECLARE_AUTOMATISM_CONDITION("GridWidth",
                                   _("Width of the virtual grid"),
                                   _("Test the width of cells of the virtual grid."),
                                   _("Width of cells of the virtual grid is _PARAM4__PARAM3_"),
                                   _("Global Setup"),
                                   "Extensions/AStaricon24.png",
                                   "Extensions/AStaricon16.png");

                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "AStarAutomatism", false);
                        instrInfo.AddCodeOnlyParameter("currentScene", "");
                        instrInfo.AddParameter("expression", _("Width ( pixels )"), "", false);
                        instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);

                        instrInfo.cppCallingInformation.SetFunctionName("GetGridWidth").SetManipulatedType("number").SetIncludeFile("AStarAutomatism/AStarAutomatism.h");

                    DECLARE_END_AUTOMATISM_CONDITION()
                    DECLARE_AUTOMATISM_ACTION("SetGridHeight",
                                   _("Height of the virtual grid"),
                                   _("Change the height of cells of the virtual grid"),
                                   _("Do _PARAM4__PARAM3_ to the height of cells of the virtual grid"),
                                   _("Global Setup"),
                                   "Extensions/AStaricon24.png",
                                   "Extensions/AStaricon16.png");

                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "AStarAutomatism", false);
                        instrInfo.AddCodeOnlyParameter("currentScene", "");
                        instrInfo.AddParameter("expression", _("Height ( pixels )"), "", false);
                        instrInfo.AddParameter("operator", _("Modification's sign"), "", false);

                        instrInfo.cppCallingInformation.SetFunctionName("SetGridHeight").SetAssociatedGetter("GetGridHeight").SetManipulatedType("number").SetIncludeFile("AStarAutomatism/AStarAutomatism.h");

                    DECLARE_END_AUTOMATISM_ACTION()

                    DECLARE_AUTOMATISM_CONDITION("GridHeight",
                                   _("Height of the virtual grid"),
                                   _("Test the height of cells of the virtual grid"),
                                   _("Height of cells of the virtual grid is _PARAM4__PARAM3_"),
                                   _("Global Setup"),
                                   "Extensions/AStaricon24.png",
                                   "Extensions/AStaricon16.png");

                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "AStarAutomatism", false);
                        instrInfo.AddCodeOnlyParameter("currentScene", "");
                        instrInfo.AddParameter("expression", _("Height ( pixels )"), "", false);
                        instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);

                        instrInfo.cppCallingInformation.SetFunctionName("GetGridHeight").SetManipulatedType("number").SetIncludeFile("AStarAutomatism/AStarAutomatism.h");

                    DECLARE_END_AUTOMATISM_CONDITION()

                    DECLARE_AUTOMATISM_ACTION("EnterSegment",
                                   _("Change the position on the path"),
                                   _("Change state of the object on the path"),
                                   _("Do _PARAM__PARAM2_ to the state of the object on the path"),
                                   _("Advanced"),
                                   "Extensions/AStaricon24.png",
                                   "Extensions/AStaricon16.png");

                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "AStarAutomatism", false);
                        instrInfo.AddParameter("expression", _("Value"), "", false);
                        instrInfo.AddParameter("operator", _("Modification's sign"), "", false);

                        instrInfo.cppCallingInformation.SetFunctionName("EnterSegment").SetAssociatedGetter("GetCurrentSegment").SetManipulatedType("number").SetIncludeFile("AStarAutomatism/AStarAutomatism.h");

                    DECLARE_END_AUTOMATISM_ACTION()

                    DECLARE_AUTOMATISM_CONDITION("LeftBorder",
                                   _("Left border"),
                                   _("Teste the size, in virtual cells, of the left border of the object."),
                                   _("Test the size, in virtual cells, of the left border of the object."),
                                   _("Setup"),
                                   "Extensions/AStaricon24.png",
                                   "Extensions/AStaricon16.png");

                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "AStarAutomatism", false);
                        instrInfo.AddParameter("expression", _("Width ( virtual cells )"), "", false);
                        instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);

                    DECLARE_END_AUTOMATISM_CONDITION()

                    DECLARE_AUTOMATISM_CONDITION("RightBorder",
                                   _("Right border"),
                                   _("Test the size, in virtual cells, of the right border of the object."),
                                   _("Right border of _PARAM0_ is _PARAM2__PARAM1_"),
                                   _("Setup"),
                                   "Extensions/AStaricon24.png",
                                   "Extensions/AStaricon16.png");

                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "AStarAutomatism", false);
                        instrInfo.AddParameter("expression", _("Width ( virtual cells )"), "", false);
                        instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);

                    DECLARE_END_AUTOMATISM_CONDITION()

                    DECLARE_AUTOMATISM_CONDITION("TopBorder",
                                   _("Top border"),
                                   _("Test the size, in virtual cells, of the top border of the object."),
                                   _("Top border of _PARAM0_ is _PARAM2__PARAM1_"),
                                   _("Setup"),
                                   "Extensions/AStaricon24.png",
                                   "Extensions/AStaricon16.png");

                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "AStarAutomatism", false);
                        instrInfo.AddParameter("expression", _("Width ( virtual cells )"), "", false);
                        instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);

                    DECLARE_END_AUTOMATISM_CONDITION()

                    DECLARE_AUTOMATISM_CONDITION("BottomBorder",
                                   _("Bottom border"),
                                   _("Test the size, in virtual cells, of the bottom border of the object."),
                                   _("Bottom border of _PARAM0_ is _PARAM2_ _PARAM1_"),
                                   _("Setup"),
                                   "Extensions/AStaricon24.png",
                                   "Extensions/AStaricon16.png");

                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "AStarAutomatism", false);
                        instrInfo.AddParameter("expression", _("Width ( virtual cells )"), "", false);
                        instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);

                    DECLARE_END_AUTOMATISM_CONDITION()

                    DECLARE_AUTOMATISM_ACTION("SetLeftBorder",
                                   _("Left border"),
                                   _("Change the size, in virtual cells, of the left border of the object."),
                                   _("Do _PARAM2__PARAM1_ to the left border of _PARAM0_"),
                                   _("Setup"),
                                   "Extensions/AStaricon24.png",
                                   "Extensions/AStaricon16.png");

                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "AStarAutomatism", false);
                        instrInfo.AddParameter("expression", _("Width ( virtual cases )"), "", false);
                        instrInfo.AddParameter("operator", _("Modification's sign"), "", false);

                        instrInfo.cppCallingInformation.SetFunctionName("SetLeftBorder").SetAssociatedGetter("GetLeftBorder").SetManipulatedType("number").SetIncludeFile("AStarAutomatism/AStarAutomatism.h");

                    DECLARE_END_AUTOMATISM_ACTION()

                    DECLARE_AUTOMATISM_ACTION("SetRightBorder",
                                   _("Right border"),
                                   _("Change the size, in virtual cells, of the right border of the object."),
                                   _("Do _PARAM2__PARAM1_ to the right border of _PARAM0_"),
                                   _("Setup"),
                                   "Extensions/AStaricon24.png",
                                   "Extensions/AStaricon16.png");

                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "AStarAutomatism", false);
                        instrInfo.AddParameter("expression", _("Width ( virtual cases )"), "", false);
                        instrInfo.AddParameter("operator", _("Modification's sign"), "", false);

                        instrInfo.cppCallingInformation.SetFunctionName("SetRightBorder").SetAssociatedGetter("GetRightBorder").SetManipulatedType("number").SetIncludeFile("AStarAutomatism/AStarAutomatism.h");


                    DECLARE_END_AUTOMATISM_ACTION()

                    DECLARE_AUTOMATISM_ACTION("SetTopBorder",
                                   _("Top border"),
                                   _("Change the size, in virtual cells, of the top border of the object."),
                                   _("Do _PARAM2__PARAM1_ to  the top border of _PARAM0_"),
                                   _("Setup"),
                                   "Extensions/AStaricon24.png",
                                   "Extensions/AStaricon16.png");

                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "AStarAutomatism", false);
                        instrInfo.AddParameter("expression", _("Width ( virtual cases )"), "", false);
                        instrInfo.AddParameter("operator", _("Modification's sign"), "", false);

                        instrInfo.cppCallingInformation.SetFunctionName("SetTopBorder").SetAssociatedGetter("GetTopBorder").SetManipulatedType("number").SetIncludeFile("AStarAutomatism/AStarAutomatism.h");


                    DECLARE_END_AUTOMATISM_ACTION()

                    DECLARE_AUTOMATISM_ACTION("SetBottomBorder",
                                   _("Bottom border"),
                                   _("Change size, in virtual cells, of the bottom border of the object."),
                                   _("Do _PARAM2__PARAM1_ to the  bottom border of _PARAM0_"),
                                   _("Setup"),
                                   "Extensions/AStaricon24.png",
                                   "Extensions/AStaricon16.png");

                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "AStarAutomatism", false);
                        instrInfo.AddParameter("expression", _("Width ( virtual cases )"), "", false);
                        instrInfo.AddParameter("operator", _("Modification's sign"), "", false);

                        instrInfo.cppCallingInformation.SetFunctionName("SetBottomBorder").SetAssociatedGetter("GetBottomBorder").SetManipulatedType("number").SetIncludeFile("AStarAutomatism/AStarAutomatism.h");

                    DECLARE_END_AUTOMATISM_ACTION()

                    DECLARE_AUTOMATISM_EXPRESSION("Speed", _("Moving speed"), _("Moving speed on the path"), _("Displacement"), "Extensions/AStaricon16.png")
                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "AStarAutomatism", false);

                        instrInfo.cppCallingInformation.SetFunctionName("GetSpeed").SetIncludeFile("AStarAutomatism/AStarAutomatism.h");

                    DECLARE_END_AUTOMATISM_EXPRESSION()

                    DECLARE_AUTOMATISM_EXPRESSION("Cost", _("Cost"), _("Obstacle cost"), _("Obstacles"), "Extensions/AStaricon16.png")
                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "AStarAutomatism", false);

                        instrInfo.cppCallingInformation.SetFunctionName("GetCost").SetIncludeFile("AStarAutomatism/AStarAutomatism.h");
                    DECLARE_END_AUTOMATISM_EXPRESSION()

                    DECLARE_AUTOMATISM_EXPRESSION("LastNodeX", _("Last waypoint X position"), _("Last waypoint X position"), _("Displacement"), "Extensions/AStaricon16.png")
                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "AStarAutomatism", false);

                        instrInfo.cppCallingInformation.SetFunctionName("GetLastNodeX").SetIncludeFile("AStarAutomatism/AStarAutomatism.h");
                    DECLARE_END_AUTOMATISM_EXPRESSION()

                    DECLARE_AUTOMATISM_EXPRESSION("LastNodeY", _("Last waypoint Y position"), _("Last waypoint Y position"), _("Displacement"), "Extensions/AStaricon16.png")
                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "AStarAutomatism", false);

                        instrInfo.cppCallingInformation.SetFunctionName("GetLastNodeY").SetIncludeFile("AStarAutomatism/AStarAutomatism.h");
                    DECLARE_END_AUTOMATISM_EXPRESSION()

                    DECLARE_AUTOMATISM_EXPRESSION("NextNodeX", _("Next waypoint X position"), _("Next waypoint X position"), _("Displacement"), "Extensions/AStaricon16.png")
                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "AStarAutomatism", false);

                        instrInfo.cppCallingInformation.SetFunctionName("GetNextNodeX").SetIncludeFile("AStarAutomatism/AStarAutomatism.h");
                    DECLARE_END_AUTOMATISM_EXPRESSION()

                    DECLARE_AUTOMATISM_EXPRESSION("NextNodeY", _("Next waypoint Y position"), _("Next waypoint Y position"), _("Displacement"), "Extensions/AStaricon16.png")
                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "AStarAutomatism", false);

                        instrInfo.cppCallingInformation.SetFunctionName("GetNextNodeY").SetIncludeFile("AStarAutomatism/AStarAutomatism.h");
                    DECLARE_END_AUTOMATISM_EXPRESSION()

                    DECLARE_AUTOMATISM_EXPRESSION("DestinationX", _("Destination X position"), _("Destination X position"), _("Displacement"), "Extensions/AStaricon16.png")
                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "AStarAutomatism", false);

                        instrInfo.cppCallingInformation.SetFunctionName("GetDestinationX").SetIncludeFile("AStarAutomatism/AStarAutomatism.h");
                    DECLARE_END_AUTOMATISM_EXPRESSION()

                    DECLARE_AUTOMATISM_EXPRESSION("DestinationY", _("Destination Y position"), _("Destination Y position"), _("Displacement"), "Extensions/AStaricon16.png")
                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "AStarAutomatism", false);

                        instrInfo.cppCallingInformation.SetFunctionName("GetDestinationY").SetIncludeFile("AStarAutomatism/AStarAutomatism.h");
                    DECLARE_END_AUTOMATISM_EXPRESSION()

                    DECLARE_AUTOMATISM_EXPRESSION("GridWidth", _("Width of the virtual grid"), _("Width of the virtual grid"), _("Global Setup"), "Extensions/AStaricon16.png")
                        instrInfo.AddCodeOnlyParameter("currentScene", "");
                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "AStarAutomatism", false);

                        instrInfo.cppCallingInformation.SetFunctionName("GetGridWidth").SetIncludeFile("AStarAutomatism/AStarAutomatism.h");
                    DECLARE_END_AUTOMATISM_EXPRESSION()

                    DECLARE_AUTOMATISM_EXPRESSION("GridHeight", _("Height of the virtual grid"), _("Height of the virtual grid"), _("Global Setup"), "Extensions/AStaricon16.png")
                        instrInfo.AddCodeOnlyParameter("currentScene", "");
                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "AStarAutomatism", false);

                        instrInfo.cppCallingInformation.SetFunctionName("GetGridHeight").SetIncludeFile("AStarAutomatism/AStarAutomatism.h");
                    DECLARE_END_AUTOMATISM_EXPRESSION()

                    DECLARE_AUTOMATISM_EXPRESSION("LeftBorder", _("Left border"), _("Left border"), _("Setup"), "Extensions/AStaricon16.png")
                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "AStarAutomatism", false);

                        instrInfo.cppCallingInformation.SetFunctionName("GetLeftBorder").SetIncludeFile("AStarAutomatism/AStarAutomatism.h");
                    DECLARE_END_AUTOMATISM_EXPRESSION()
                    DECLARE_AUTOMATISM_EXPRESSION("RightBorder", _("Right border"), _("Right border"), _("Setup"), "Extensions/AStaricon16.png")
                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "AStarAutomatism", false);

                        instrInfo.cppCallingInformation.SetFunctionName("GetRightBorder").SetIncludeFile("AStarAutomatism/AStarAutomatism.h");
                    DECLARE_END_AUTOMATISM_EXPRESSION()
                    DECLARE_AUTOMATISM_EXPRESSION("TopBorder", _("Top border"), _("Top border"), _("Setup"), "Extensions/AStaricon16.png")
                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "AStarAutomatism", false);

                        instrInfo.cppCallingInformation.SetFunctionName("GetTopBorder").SetIncludeFile("AStarAutomatism/AStarAutomatism.h");
                    DECLARE_END_AUTOMATISM_EXPRESSION()
                    DECLARE_AUTOMATISM_EXPRESSION("BottomBorder", _("Bottom border"), _("Bottom border"), _("Setup"), "Extensions/AStaricon16.png")
                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "AStarAutomatism", false);

                        instrInfo.cppCallingInformation.SetFunctionName("GetBottomBorder").SetIncludeFile("AStarAutomatism/AStarAutomatism.h");
                    DECLARE_END_AUTOMATISM_EXPRESSION()

                    #endif

                DECLARE_END_AUTOMATISM();

            CompleteCompilationInformation();
        };
        virtual ~Extension() {};

    private:

        /**
         * This function is called by Game Develop so
         * as to complete information about how the extension was compiled ( which libs... )
         * -- Do not need to be modified. --
         */
        void CompleteCompilationInformation()
        {
            #if defined(GD_IDE_ONLY)
            compilationInfo.runtimeOnly = false;
            #else
            compilationInfo.runtimeOnly = true;
            #endif

            #if defined(__GNUC__)
            compilationInfo.gccMajorVersion = __GNUC__;
            compilationInfo.gccMinorVersion = __GNUC_MINOR__;
            compilationInfo.gccPatchLevel = __GNUC_PATCHLEVEL__;
            #endif

            compilationInfo.boostVersion = BOOST_VERSION;

            compilationInfo.sfmlMajorVersion = 2;
            compilationInfo.sfmlMinorVersion = 0;

            #if defined(GD_IDE_ONLY)
            compilationInfo.wxWidgetsMajorVersion = wxMAJOR_VERSION;
            compilationInfo.wxWidgetsMinorVersion = wxMINOR_VERSION;
            compilationInfo.wxWidgetsReleaseNumber = wxRELEASE_NUMBER;
            compilationInfo.wxWidgetsSubReleaseNumber = wxSUBRELEASE_NUMBER;
            #endif

            compilationInfo.gdlVersion = RC_FILEVERSION_STRING;
            compilationInfo.sizeOfpInt = sizeof(int*);

            compilationInfo.informationCompleted = true;
        }
};

/**
 * Used by Game Develop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" ExtensionBase * GD_EXTENSION_API CreateGDExtension() {
    return new Extension;
}

/**
 * Used by Game Develop to destroy the extension class
 * -- Do not need to be modified. --
 */
extern "C" void GD_EXTENSION_API DestroyGDExtension(ExtensionBase * p) {
    delete p;
}

