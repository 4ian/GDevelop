# ----------------------------------------------------------------------------
# Purpose : Makefile for wxstedit sample - UNIX or cygwin using gmake (gcc)
# Author : John Labenski
# Copyright : John Labenski 2006
# License : wxWidgets license
# ----------------------------------------------------------------------------

# ----------------------------------------------------------------------------
# wxWidgets build settings

WXCONFIG   := wx-config

WXDIR      := $(shell $(WXCONFIG) --prefix)
WXEXECDIR  := $(shell $(WXCONFIG) --exec-prefix)
WXLIBDIR   := $(WXEXECDIR)/lib

WXBASENAME := $(shell $(WXCONFIG) --basename)
WXVERSION  := $(shell $(WXCONFIG) --version)
WXRELEASE  := $(shell $(WXCONFIG) --release)

WXCXX      := $(shell $(WXCONFIG) --cxx)
WXCXXFLAGS := $(shell $(WXCONFIG) --cxxflags)
WXLIBS     := $(shell $(WXCONFIG) --libs stc,html,core,base)

WXSTC_LIB  := $(WXBASENAME)_stc-$(WXRELEASE)

# ----------------------------------------------------------------------------
# Settings for the library

WXSTEDIT_LIBNAME = $(WXBASENAME)_stedit-$(WXRELEASE)
WXSTEDIT_LIBDIR  = $(WXLIBDIR)

LIBVERSION_CURRENT  = 1
LIBVERSION_REVISION = 0
LIBVERSION_AGE      = 0

TARGET_LIBNAME = lib$(WXSTEDIT_LIBNAME)
TARGET_LIBNAME_STATIC = $(TARGET_LIBNAME).a
TARGET_LIBNAME_SHARED = $(TARGET_LIBNAME).so.$(LIBVERSION_CURRENT).$(LIBVERSION_REVISION).$(LIBVERSION_AGE)
TARGET_LIB_STATIC = $(WXSTEDIT_LIBDIR)/$(TARGET_LIBNAME_STATIC)
TARGET_LIB_SHARED = $(WXSTEDIT_LIBDIR)/$(TARGET_LIBNAME_SHARED)
TARGET_LIB_LINK1  = $(TARGET_LIBNAME).so.$(LIBVERSION_CURRENT)
TARGET_LIB_LINK2  = $(TARGET_LIBNAME).so

# ----------------------------------------------------------------------------
# CXX flags and libs

CXXFLAGS = $(WXCXXFLAGS) -MMD -g  -Wall -Wunused -Wunused-parameter -fPIC -DPIC
LDLIBS   = $(WXLIBS)
CXX      = $(WXCXX)

# -pg in libs and defs for profiling
PROFILE = #-pg
APPEXTRADEFS = -I../../include -I$(WXDIR)/contrib/include $(PROFILE)
APPEXTRALIBS = -l$(WXSTC_LIB) $(PROFILE)

# ----------------------------------------------------------------------------
# Source files, objects to link

PROGRAM = wxstedit

OBJECTS = \
    ../../src/stedit.o \
    ../../src/stedlgs.o \
    ../../src/stedlgs_wdr.o \
    ../../src/steexprt.o \
    ../../src/stefindr.o \
    ../../src/steframe.o \
    ../../src/stelangs.o \
    ../../src/stemenum.o \
    ../../src/stenoteb.o \
    ../../src/steopts.o \
    ../../src/steprefs.o \
    ../../src/steprint.o \
    ../../src/stesplit.o \
    ../../src/steshell.o \
    ../../src/stestyls.o

DEPFILES := $(OBJECTS:.o=.d)

.cpp.o:
	$(CXX) -c $(CXXFLAGS) $(APPEXTRADEFS) -o $@ $<

all: $(WXSTEDIT_LIBNAME) $(PROGRAM)

$(WXSTEDIT_LIBNAME) :
	@(cd ../../src && make)


# wxstedit program using shared stedit library
$(PROGRAM): $(PROGRAM).o $(TARGET_LIB_SHARED)
	$(CXX) $(LDFLAGS_EXE) -o $@ $(PROGRAM).o $(LDLIBS) -l$(WXSTEDIT_LIBNAME) $(APPEXTRALIBS)

# wxstedit program using static stedit library
#$(PROGRAM): $(PROGRAM).o $(TARGET_LIB_STATIC)
#	$(CXX) $(LDFLAGS_EXE) -o $@ $(PROGRAM).o $(LDLIBS) $(TARGET_LIB_STATIC) $(APPEXTRALIBS)

# wxstedit program using just object files and not the stedit lib
#$(PROGRAM): $(PROGRAM).o $(OBJECTS)
#	$(CXX) $(LDFLAGS_EXE) -o $@ $(PROGRAM).o $(OBJECTS) $(LDLIBS) $(APPEXTRALIBS)

docs:
	# requires wxLua's bin2c.lua program where $(WXLUA) is environment var
	# of the path to the base dir of wxLua
	$(WXLUA)/bin/lua $(WXLUA)/util/bin2c/bin2c.lua -t -o wxstedit_htm.hpp ../../docs/wxstedit.htm
	$(WXLUA)/bin/lua $(WXLUA)/util/bin2c/bin2c.lua -t -o readme_htm.hpp ../../docs/readme.htm

clean:
	rm -f $(OBJECTS) $(DEPFILES) $(PROGRAM) $(PROGRAM).o $(PROGRAM).d core

cleanall: clean
	@(cd ../../src && make clean)


-include $(DEPFILES)
