get_filename_component(SELF_DIR "${CMAKE_CURRENT_LIST_FILE}" PATH)
include(${SELF_DIR}/Box2D-targets.cmake)
get_filename_component(Box2D_INCLUDE_DIRS "${SELF_DIR}/../../include" ABSOLUTE)
