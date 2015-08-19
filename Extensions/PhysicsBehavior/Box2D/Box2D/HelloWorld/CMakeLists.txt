# Hello World examples
include_directories (${Box2D_SOURCE_DIR})
add_executable(HelloWorld HelloWorld.cpp)
target_link_libraries (HelloWorld Box2D)
