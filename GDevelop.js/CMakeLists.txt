cmake_minimum_required(VERSION 2.6)
cmake_policy(SET CMP0015 NEW)

project(libGD.js)

#Sanity checks
IF ("${CMAKE_BUILD_TYPE}" STREQUAL "")
  	message( "CMAKE_BUILD_TYPE is empty, assuming build type is Release" )
	set(CMAKE_BUILD_TYPE Release)
ENDIF()
if(NOT EMSCRIPTEN)
	error("You're trying to compile libGD.js without emscripten.")
endif()

# Compilation flags (https://emscripten.org/docs/tools_reference/emcc.html):
SET( CMAKE_CXX_FLAGS  "${CMAKE_CXX_FLAGS} -O2") # Optimizations during compilation
SET( CMAKE_CXX_FLAGS  "${CMAKE_CXX_FLAGS} --profiling") # Profiling support

#Common directories:
###
set(GDJS_include_dir ${GD_base_dir}/GDJS)
set(GDJS_lib_dir ${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME}/JsPlatform)

#Dependencies on external libraries:
###
include_directories(${GDCORE_include_dir})
include_directories(${GDJS_include_dir})

#Defines
###
add_definitions( -DGD_IDE_ONLY )
IF(CMAKE_BUILD_TYPE MATCHES DEBUG)
	add_definitions( -DDEBUG )
	IF(WIN32)
		add_definitions( __WXDEBUG__ )
	ENDIF(WIN32)
ELSEIF ("${CMAKE_BUILD_TYPE}" STREQUAL "Release")
	add_definitions( -DRELEASE )
	add_definitions( -DBOOST_DISABLE_ASSERTS )
ELSE()
	add_definitions( -DDEV )
	add_definitions( -DBOOST_DISABLE_ASSERTS )
ENDIF(CMAKE_BUILD_TYPE MATCHES DEBUG)

add_definitions( -Dlinux )
add_definitions( -DLINUX )
add_definitions( -DGD_API= )
add_definitions( -DGD_CORE_API= )
add_definitions( -DGD_EXTENSION_API= )

#The target
###
include_directories(.)

add_executable(
	GD
	"Bindings/Wrapper.cpp"
	"Bindings/BehaviorJsImplementation.cpp"
	"Bindings/ObjectJsImplementation.cpp"
	"Bindings/BehaviorSharedDataJsImplementation.cpp"
)

IF(DISABLE_EMSCRIPTEN_LINK_OPTIMIZATIONS)
	# Disable optimizations at linking time for much faster builds.
	MESSAGE(STATUS "Disabling optimization at link time for (slightly) faster build")
	target_link_libraries(GD "-O0")
ELSE()
	target_link_libraries(GD "-O2")
ENDIF()
target_link_libraries(GD "--post-js ${GD_base_dir}/GDevelop.js/Bindings/glue.js")
target_link_libraries(GD "--post-js ${GD_base_dir}/GDevelop.js/Bindings/postjs.js")
target_link_libraries(GD "-s MODULARIZE=1")
target_link_libraries(GD "-s EXPORT_NAME=\"initializeGDevelopJs\"") # Global function name for browsers
target_link_libraries(GD "-s TOTAL_MEMORY=48MB") # Get some initial memory size that is a bit bigger than the default.
target_link_libraries(GD "-s ALLOW_MEMORY_GROWTH=1")
target_link_libraries(GD "-s ERROR_ON_UNDEFINED_SYMBOLS=0")
target_link_libraries(GD "-s \"EXTRA_EXPORTED_RUNTIME_METHODS=['addOnPreMain', 'calledRun', 'UTF8ToString']\"")

# Even if we're building an "executable", prefix it by lib as it's used as a library.
set_target_properties(GD PROPERTIES PREFIX "lib")

#Linker files
###

target_link_libraries(GD GDCore)
target_link_libraries(GD GDJS)
target_link_libraries(GD PlatformBehavior)
target_link_libraries(GD DestroyOutsideBehavior)
target_link_libraries(GD TiledSpriteObject)
target_link_libraries(GD DraggableBehavior)
target_link_libraries(GD TopDownMovementBehavior)
target_link_libraries(GD TextObject)
target_link_libraries(GD PanelSpriteObject)
target_link_libraries(GD AnchorBehavior)
target_link_libraries(GD PrimitiveDrawing)
target_link_libraries(GD TextEntryObject)
target_link_libraries(GD Inventory)
target_link_libraries(GD LinkedObjects)
target_link_libraries(GD SystemInfo)
target_link_libraries(GD Shopify)
target_link_libraries(GD PathfindingBehavior)
target_link_libraries(GD PhysicsBehavior)
target_link_libraries(GD ParticleSystem)
