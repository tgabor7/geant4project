# (1)
cmake_minimum_required(VERSION 2.6 FATAL_ERROR)
project(server)

# (2)
option(WITH_GEANT4_UIVIS "Build example with Geant4 UI and Vis drivers" ON)
if(WITH_GEANT4_UIVIS)
  find_package(Geant4 REQUIRED ui_all vis_all)
else()
  find_package(Geant4 REQUIRED)
endif()

# (3)
include(${Geant4_USE_FILE})
include_directories(${PROJECT_SOURCE_DIR}/include)

# (4)
file(GLOB sources ${PROJECT_SOURCE_DIR}/src/*.cc)
file(GLOB headers ${PROJECT_SOURCE_DIR}/include/*.hh)

# (5)
add_executable(server server.cc ${sources} ${headers})
target_link_libraries(server ${Geant4_LIBRARIES})

# (6)
set(SERVER_SCRIPTS
  init_vis.mac
  vis.mac
  )

foreach(_script ${SERVER_SCRIPTS})
  configure_file(
    ${PROJECT_SOURCE_DIR}/${_script}
    ${PROJECT_BINARY_DIR}/${_script}
    COPYONLY
    )
endforeach()

# (7)
include_directories("C:/Users/awesome/Desktop/boost_1_72_0")
include_directories("H:/beast-develop/include")
link_directories("C:/Users/awesome/Desktop/boost_1_72_0/stage/lib")


install(TARGETS server DESTINATION bin)