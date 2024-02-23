cmake_minimum_required(VERSION 3.5)

project(libGD.js)

# Sanity checks
if("${CMAKE_BUILD_TYPE}" STREQUAL "")
	message(STATUS "CMAKE_BUILD_TYPE is empty, assuming build type is Release")
	set(CMAKE_BUILD_TYPE Release)
endif()
if(NOT EMSCRIPTEN)
	message(FATAL_ERROR "You're trying to compile libGD.js without emscripten.")
endif()

# Compilation flags (https://emscripten.org/docs/tools_reference/emcc.html):
add_compile_options(-O3 -flto) # Optimizations during compilation
# add_compile_options(-fwasm-exceptions) # Enable exceptions
if(NOT DISABLE_EMSCRIPTEN_LINK_OPTIMIZATIONS)
	add_compile_options(-flto) # The compiler needs to know if there will be link time optimisations
endif()

# Compiler debugging options
#
# add_compile_options(-fsanitize=address) # Uncomment to auto-detect occurences of memory bugs (memory leak, use after free, overflows, ...) - also enable linking below!
# add_compile_options(-fsanitize=undefined) # Uncomment to auto-detect occurences of undefined behavior - also enable linking below!
# add_compile_options(-g) # Uncomment for debugging support
# add_compile_options(--profiling) # Uncomment for profiling support

# Common directories:
#
set(GDJS_include_dir ${GD_base_dir}/GDJS)
set(GDJS_lib_dir ${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME}/JsPlatform)

# Dependencies on external libraries:
#
include_directories(${GDCORE_include_dir})
include_directories(${GDJS_include_dir})

# Defines
#
add_definitions(-DGD_IDE_ONLY)
if("${CMAKE_BUILD_TYPE}" MATCHES "Debug")
	add_definitions(-DDEBUG)
	if(WIN32)
		add_definitions(__WXDEBUG__)
	endif()
elseif("${CMAKE_BUILD_TYPE}" STREQUAL "Release")
	add_definitions(-DRELEASE)
	add_definitions(-DBOOST_DISABLE_ASSERTS)
else()
	add_definitions(-DDEV)
	add_definitions(-DBOOST_DISABLE_ASSERTS)
endif()

add_definitions(-Dlinux)
add_definitions(-DLINUX)
add_definitions(-DGD_API=)
add_definitions(-DGD_CORE_API=)
add_definitions(-DGD_EXTENSION_API=)

# The target
#
include_directories(.)

add_executable(
	GD
	"Bindings/BehaviorJsImplementation.cpp"
	"Bindings/BehaviorSharedDataJsImplementation.cpp"
	"Bindings/ObjectJsImplementation.cpp"
	"Bindings/Wrapper.cpp")

if(DISABLE_EMSCRIPTEN_LINK_OPTIMIZATIONS)
	# Disable optimizations at linking time for much faster builds.
	message(STATUS "Disabling optimization at link time for (slightly) faster build")
	target_link_libraries(GD "-O0")
else()
	target_link_libraries(GD "-O3 -flto")
endif()
target_link_libraries(GD "--post-js ${GD_base_dir}/GDevelop.js/Bindings/glue.js")
target_link_libraries(GD "--post-js ${GD_base_dir}/GDevelop.js/Bindings/postjs.js")
target_link_libraries(GD "-s MODULARIZE=1")
target_link_libraries(GD "-s EXPORT_NAME=\"initializeGDevelopJs\"") # Global function name for browsers
target_link_libraries(GD "-s TOTAL_MEMORY=48MB") # Get some initial memory size that is a bit bigger than the default.
target_link_libraries(GD "-s ALLOW_MEMORY_GROWTH=1")
target_link_libraries(GD "-s NODEJS_CATCH_EXIT=0") # Don't print the entire GDCore code on error when running in node
target_link_libraries(GD "-s ERROR_ON_UNDEFINED_SYMBOLS=0")
target_link_libraries(GD "-s \"EXPORTED_FUNCTIONS=['_free']\"")

# Linker debugging options
#
# target_link_libraries(GD "-s DEMANGLE_SUPPORT=1") # Demangle stack traces
# target_link_libraries(GD "-s ASSERTIONS=1") # Basic runtime memory allocation checks (necessary for wasm exceptions stack traces)
# target_link_libraries(GD "-s ASSERTIONS=2 -s SAFE_HEAP=1") # Uncomment to do runtime checks for memory allocations and access errors
# target_link_libraries(GD "-fsanitize=address") # Uncomment to auto-detect occurences of memory bugs (memory leak, use after free, overflows, ...) - also enable compiling above!
# target_link_libraries(GD "-fsanitize=undefined") # Uncomment to auto-detect occurences of undefined behavior - also enable compiling above!
# target_link_libraries(--cpuprofiler) # Uncomment for interactive performance profiling
# target_link_libraries(--memoryprofiler) # Uncomment for interactive memory profiling

# Even if we're building an "executable", prefix it by lib as it's used as a library.
set_target_properties(GD PROPERTIES PREFIX "lib")

# Linker files
#
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
target_link_libraries(GD Scene3D)
target_link_libraries(GD SpineObject)
