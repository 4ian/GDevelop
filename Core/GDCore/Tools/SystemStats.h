/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY)
#ifndef GDCORE_SYSTEMSTATS_H
#define GDCORE_SYSTEMSTATS_H
#include <cstddef>

namespace gd {

/**
 * \brief Tool class to provide information about the system.
 *
 * \ingroup Tools
 */
class GD_CORE_API SystemStats {
 public:
  /**
   * Return the virtual memory used by the process, in KB.
   * @return 0 if the information is not available
   */
  static size_t GetUsedVirtualMemory();

 private:
  SystemStats(){};
  virtual ~SystemStats(){};
};

}  // namespace gd
#endif  // GDCORE_SYSTEMSTATS_H
#endif
