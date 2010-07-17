set(BOX2D_Collision_SRCS
	Collision/b2BroadPhase.cpp
	Collision/b2CollideCircle.cpp
	Collision/b2CollidePolygon.cpp
	Collision/b2Collision.cpp
	Collision/b2Distance.cpp
	Collision/b2DynamicTree.cpp
	Collision/b2TimeOfImpact.cpp
)
set(BOX2D_Collision_HDRS
	Collision/b2BroadPhase.h
	Collision/b2Collision.h
	Collision/b2Distance.h
	Collision/b2DynamicTree.h
	Collision/b2TimeOfImpact.h
)
set(BOX2D_Shapes_SRCS
	Collision/Shapes/b2CircleShape.cpp
	Collision/Shapes/b2PolygonShape.cpp
)
set(BOX2D_Shapes_HDRS
	Collision/Shapes/b2CircleShape.h
	Collision/Shapes/b2PolygonShape.h
	Collision/Shapes/b2Shape.h
)
set(BOX2D_Common_SRCS
	Common/b2BlockAllocator.cpp
	Common/b2Math.cpp
	Common/b2Settings.cpp
	Common/b2StackAllocator.cpp
)
set(BOX2D_Common_HDRS
	Common/b2BlockAllocator.h
	Common/b2Math.h
	Common/b2Settings.h
	Common/b2StackAllocator.h
)
set(BOX2D_Dynamics_SRCS
	Dynamics/b2Body.cpp
	Dynamics/b2ContactManager.cpp
	Dynamics/b2Fixture.cpp
	Dynamics/b2Island.cpp
	Dynamics/b2World.cpp
	Dynamics/b2WorldCallbacks.cpp
)
set(BOX2D_Dynamics_HDRS
	Dynamics/b2Body.h
	Dynamics/b2ContactManager.h
	Dynamics/b2Fixture.h
	Dynamics/b2Island.h
	Dynamics/b2TimeStep.h
	Dynamics/b2World.h
	Dynamics/b2WorldCallbacks.h
)
set(BOX2D_Contacts_SRCS
	Dynamics/Contacts/b2CircleContact.cpp
	Dynamics/Contacts/b2Contact.cpp
	Dynamics/Contacts/b2ContactSolver.cpp
	Dynamics/Contacts/b2PolygonAndCircleContact.cpp
	Dynamics/Contacts/b2PolygonContact.cpp
	Dynamics/Contacts/b2TOISolver.cpp
)
set(BOX2D_Contacts_HDRS
	Dynamics/Contacts/b2CircleContact.h
	Dynamics/Contacts/b2Contact.h
	Dynamics/Contacts/b2ContactSolver.h
	Dynamics/Contacts/b2PolygonAndCircleContact.h
	Dynamics/Contacts/b2PolygonContact.h
	Dynamics/Contacts/b2TOISolver.h
)
set(BOX2D_Joints_SRCS
	Dynamics/Joints/b2DistanceJoint.cpp
	Dynamics/Joints/b2FrictionJoint.cpp
	Dynamics/Joints/b2GearJoint.cpp
	Dynamics/Joints/b2Joint.cpp
	Dynamics/Joints/b2LineJoint.cpp
	Dynamics/Joints/b2MouseJoint.cpp
	Dynamics/Joints/b2PrismaticJoint.cpp
	Dynamics/Joints/b2PulleyJoint.cpp
	Dynamics/Joints/b2RevoluteJoint.cpp
	Dynamics/Joints/b2WeldJoint.cpp
)
set(BOX2D_Joints_HDRS
	Dynamics/Joints/b2DistanceJoint.h
	Dynamics/Joints/b2FrictionJoint.h
	Dynamics/Joints/b2GearJoint.h
	Dynamics/Joints/b2Joint.h
	Dynamics/Joints/b2LineJoint.h
	Dynamics/Joints/b2MouseJoint.h
	Dynamics/Joints/b2PrismaticJoint.h
	Dynamics/Joints/b2PulleyJoint.h
	Dynamics/Joints/b2RevoluteJoint.h
	Dynamics/Joints/b2WeldJoint.h
)
set(BOX2D_General_HDRS
	Box2D.h
)
include_directories( ../ )

if(BOX2D_BUILD_SHARED)
	add_library(Box2D_shared SHARED
		${BOX2D_General_HDRS}
		${BOX2D_Joints_SRCS}
		${BOX2D_Joints_HDRS}
		${BOX2D_Contacts_SRCS}
		${BOX2D_Contacts_HDRS}
		${BOX2D_Dynamics_SRCS}
		${BOX2D_Dynamics_HDRS}
		${BOX2D_Common_SRCS}
		${BOX2D_Common_HDRS}
		${BOX2D_Shapes_SRCS}
		${BOX2D_Shapes_HDRS}
		${BOX2D_Collision_SRCS}
		${BOX2D_Collision_HDRS}
	)
	set_target_properties(Box2D_shared PROPERTIES
		OUTPUT_NAME "Box2D"
		CLEAN_DIRECT_OUTPUT 1
		VERSION ${BOX2D_VERSION}
	)
endif()

if(BOX2D_BUILD_STATIC)
	add_library(Box2D STATIC
		${BOX2D_General_HDRS}
		${BOX2D_Joints_SRCS}
		${BOX2D_Joints_HDRS}
		${BOX2D_Contacts_SRCS}
		${BOX2D_Contacts_HDRS}
		${BOX2D_Dynamics_SRCS}
		${BOX2D_Dynamics_HDRS}
		${BOX2D_Common_SRCS}
		${BOX2D_Common_HDRS}
		${BOX2D_Shapes_SRCS}
		${BOX2D_Shapes_HDRS}
		${BOX2D_Collision_SRCS}
		${BOX2D_Collision_HDRS}
	)
	set_target_properties(Box2D PROPERTIES
		CLEAN_DIRECT_OUTPUT 1
		VERSION ${BOX2D_VERSION}
	)
endif()

if(MSVC)
	# These are used to create visual studio folders.
	source_group(Collision FILES ${BOX2D_Collision_SRCS} ${BOX2D_Collision_HDRS})
	source_group(Collision\\Shapes FILES ${BOX2D_Shapes_SRCS} ${BOX2D_Shapes_HDRS})
	source_group(Common FILES ${BOX2D_Common_SRCS} ${BOX2D_Common_HDRS})
	source_group(Dynamics FILES ${BOX2D_Dynamics_SRCS} ${BOX2D_Dynamics_HDRS})
	source_group(Dynamics\\Contacts FILES ${BOX2D_Contacts_SRCS} ${BOX2D_Contacts_HDRS})
	source_group(Dynamics\\Joints FILES ${BOX2D_Joints_SRCS} ${BOX2D_Joints_HDRS})
	source_group(Include FILES ${BOX2D_General_HDRS})
endif()

if(BOX2D_INSTALL)
	# install headers
	install(FILES ${BOX2D_General_HDRS} DESTINATION include/Box2D)
	install(FILES ${BOX2D_Collision_HDRS} DESTINATION include/Box2D/Collision)
	install(FILES ${BOX2D_Shapes_HDRS} DESTINATION include/Box2D/Collision/Shapes)
	install(FILES ${BOX2D_Common_HDRS} DESTINATION include/Box2D/Common)
	install(FILES ${BOX2D_Dynamics_HDRS} DESTINATION include/Box2D/Dynamics)
	install(FILES ${BOX2D_Contacts_HDRS} DESTINATION include/Box2D/Dynamics/Contacts)
	install(FILES ${BOX2D_Joints_HDRS} DESTINATION include/Box2D/Dynamics/Joints)

	# install libraries
	if(BOX2D_BUILD_SHARED)
		install(TARGETS Box2D_shared EXPORT Box2D-targets DESTINATION lib)
	endif()
	if(BOX2D_BUILD_STATIC)
		install(TARGETS Box2D EXPORT Box2D-targets DESTINATION lib)
	endif()

	# install build system hooks for third-party apps
	install(EXPORT Box2D-targets DESTINATION lib/Box2D)
	install(FILES Box2DConfig.cmake DESTINATION lib/Box2D)
endif(BOX2D_INSTALL)