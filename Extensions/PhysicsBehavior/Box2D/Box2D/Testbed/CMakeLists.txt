# Some flags for Freeglut and GLUI.
add_definitions( -DFREEGLUT_EXPORTS -DFREEGLUT_STATIC -D_CRT_SECURE_NO_WARNINGS )

# Define the framework files.
set(Testbed_Framework_SRCS
	Framework/Main.cpp
	Framework/Render.cpp
	Framework/Render.h
	Framework/Test.cpp
	Framework/Test.h
)

#define the test files.
set(Testbed_Tests_SRCS
	Tests/TestEntries.cpp
	Tests/ApplyForce.h
	Tests/BodyTypes.h
	Tests/Breakable.h
	Tests/Bridge.h
	Tests/Cantilever.h
	Tests/Chain.h
	Tests/CharacterCollision.h
	Tests/CollisionFiltering.h
	Tests/CollisionProcessing.h
	Tests/CompoundShapes.h
	Tests/Confined.h
	Tests/ContinuousTest.h
	Tests/DistanceTest.h
	Tests/Dominos.h
	Tests/DynamicTreeTest.h
	Tests/EdgeShapes.h
	Tests/Gears.h
	Tests/LineJoint.h
	Tests/OneSidedPlatform.h
	Tests/PolyCollision.h
	Tests/PolyShapes.h
	Tests/Prismatic.h
	Tests/Pulleys.h
	Tests/Pyramid.h
	Tests/RayCast.h
	Tests/Revolute.h
	Tests/SensorTest.h
	Tests/ShapeEditing.h
	Tests/SliderCrank.h
	Tests/SphereStack.h
	Tests/TheoJansen.h
	Tests/TimeOfImpact.h
	Tests/VaryingFriction.h
	Tests/VaryingRestitution.h
	Tests/VerticalStack.h
	Tests/Web.h
)

# These are used to create visual studio folders.
source_group(Framework FILES ${Testbed_Framework_SRCS})
source_group(Tests FILES ${Testbed_Tests_SRCS})

include_directories (
	${OPENGL_INCLUDE_DIR}
	${Box2D_SOURCE_DIR}
)

if(APPLE)
	# We are not using the Apple's framework version, but X11's
	include_directories( /usr/X11/include )
	link_directories( /usr/X11/lib )
	set (OPENGL_LIBRARIES GL GLU GLUT X11)
endif(APPLE)

add_executable(Testbed
	${Testbed_Framework_SRCS}
	${Testbed_Tests_SRCS}
)

target_link_libraries (
	Testbed
	Box2D
	freeglut_static
	glui
	${OPENGL_LIBRARIES}
) 
