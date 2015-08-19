/*
 * Copyright (c) 2006-2007 Erin Catto http://www.gphysics.com
 *
 * This software is provided 'as-is', without any express or implied
 * warranty.  In no event will the authors be held liable for any damages
 * arising from the use of this software.
 * Permission is granted to anyone to use this software for any purpose,
 * including commercial applications, and to alter it and redistribute it
 * freely, subject to the following restrictions:
 * 1. The origin of this software must not be misrepresented; you must not
 * claim that you wrote the original software. If you use this software
 * in a product, an acknowledgment in the product documentation would be
 * appreciated but is not required.
 * 2. Altered source versions must be plainly marked as such, and must not be
 * misrepresented as being the original software.
 * 3. This notice may not be removed or altered from any source distribution.
 */

#include "iPhoneTest.h"
//#include "GLES-Render.h"

#include "ApplyForce.h"
#include "BodyTypes.h"

#include "Breakable.h"
#include "Bridge.h"
#include "CCDTest.h"
#include "Chain.h"
#include "CollisionFiltering.h"
#include "CollisionProcessing.h"
#include "CompoundShapes.h"
#include "Confined.h"
#include "DistanceTest.h"
#include "Dominos.h"
#include "DynamicTreeTest.h"
#include "Gears.h"
#include "LineJoint.h"
#include "OneSidedPlatform.h"
#include "PolyCollision.h"
#include "PolyShapes.h"
#include "Prismatic.h"
#include "Pulleys.h"
#include "Pyramid.h"
#include "RayCast.h"
#include "Revolute.h"
#include "SensorTest.h"
#include "ShapeEditing.h"
#include "SliderCrank.h"
#include "SphereStack.h"
#include "TheoJansen.h"
#include "TimeOfImpact.h"
#include "VaryingFriction.h"
#include "VaryingRestitution.h"
#include "VerticalStack.h"
#include "Web.h"

TestEntry g_testEntries[] =
{
{"Body Types", BodyTypes::Create},
{"CCD Test", CCDTest::Create},
{"SphereStack", SphereStack::Create},
{"Vertical Stack", VerticalStack::Create},
{"Confined", Confined::Create},
{"Bridge", Bridge::Create},
{"Breakable", Breakable::Create},
{"Varying Restitution", VaryingRestitution::Create},
{"Ray-Cast", RayCast::Create},
{"Pyramid", Pyramid::Create},
{"PolyCollision", PolyCollision::Create},
{"One-Sided Platform", OneSidedPlatform::Create},
{"Apply Force", ApplyForce::Create},
{"Chain", Chain::Create},
{"Collision Filtering", CollisionFiltering::Create},
{"Collision Processing", CollisionProcessing::Create},
{"Compound Shapes", CompoundShapes::Create},
{"Distance Test", DistanceTest::Create},
{"Dominos", Dominos::Create},
{"Dynamic Tree", DynamicTreeTest::Create},
{"Gears", Gears::Create},
{"Line Joint", LineJoint::Create},
{"Polygon Shapes", PolyShapes::Create},
{"Prismatic", Prismatic::Create},
{"Pulleys", Pulleys::Create},
{"Revolute", Revolute::Create},
{"Sensor Test", SensorTest::Create},
{"Shape Editing", ShapeEditing::Create},
{"Slider Crank", SliderCrank::Create},
{"Theo Jansen's Walker", TheoJansen::Create},
{"Time of Impact", TimeOfImpact::Create},
{"Varying Friction", VaryingFriction::Create},
{"Web", Web::Create},
{NULL, NULL}

};
