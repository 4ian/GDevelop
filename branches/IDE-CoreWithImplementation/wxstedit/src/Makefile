# ----------------------------------------------------------------------------
# Purpose : Makefile for wxstedit lib - UNIX or cygwin using gmake (gcc)
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
WXLIBS     := $(shell $(WXCONFIG) --libs stc,core,base)

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
APPEXTRADEFS = -I../include -I$(WXDIR)/contrib/include $(PROFILE)
APPEXTRALIBS = -l$(WXSTC_LIB) $(PROFILE)

# ----------------------------------------------------------------------------
# Programs to use

RM        = rm -f
AR        = ar
AROPTIONS = rcu
RANLIB    = ranlib
LN_S      = ln -s

# ----------------------------------------------------------------------------
# Source files, objects to link

OBJECTS = \
    stedit.o \
    stedlgs.o \
    stedlgs_wdr.o \
    steexprt.o \
    stefindr.o \
    steframe.o \
    stelangs.o \
    stemenum.o \
    stenoteb.o \
    steopts.o \
    steprefs.o \
    steprint.o \
    stesplit.o \
    steshell.o \
    stestyls.o

DEPFILES := $(OBJECTS:.o=.d)

.cpp.o:
	$(CXX) -c $(CXXFLAGS) $(APPEXTRADEFS) -o $@ $<

all: $(TARGET_LIB_STATIC) $(TARGET_LIB_SHARED)

$(TARGET_LIB_STATIC) : $(OBJECTS)
		@$(RM) $(TARGET_LIB_STATIC)
		$(AR) $(AROPTIONS) $(TARGET_LIB_STATIC) $(OBJECTS)
		$(RANLIB) $(TARGET_LIB_STATIC)

$(TARGET_LIB_SHARED) : $(OBJECTS)
		$(CXX) -shared -o $(TARGET_LIB_SHARED) $(OBJECTS) $(WXLIBS) -l$(WXSTC_LIB)
		cd $(WXLIBDIR) \
			&& $(RM) $(TARGET_LIB_LINK1) $(TARGET_LIB_LINK2) \
				&& $(LN_S) $(TARGET_LIB_SHARED) $(TARGET_LIB_LINK1) \
				&& $(LN_S) $(TARGET_LIB_SHARED) $(TARGET_LIB_LINK2)

clean:
	rm -f $(OBJECTS) $(DEPFILES) core \
		$(TARGET_LIB_STATIC) \
		$(TARGET_LIB_SHARED) \
		$(WXSTEDIT_LIBDIR)/$(TARGET_LIB_LINK1) \
		$(WXSTEDIT_LIBDIR)/$(TARGET_LIB_LINK2)


-include $(DEPFILES)
