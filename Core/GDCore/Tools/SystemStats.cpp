/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "SystemStats.h"
#include "stdio.h"
#include "stdlib.h"
#include "string.h"
#if defined(WINDOWS)
#include "windows.h"
#include "psapi.h"
#endif

namespace gd {

int parseLine(char* line) {
  int i = strlen(line);
  while (*line < '0' || *line > '9') line++;
  line[i - 3] = '\0';
  i = atoi(line);
  return i;
}

size_t SystemStats::GetUsedVirtualMemory() {
#if defined(LINUX)
  FILE* file = fopen("/proc/self/status", "r");
  int result = -1;
  char line[128];

  while (fgets(line, 128, file) != NULL) {
    if (strncmp(line, "VmSize:", 7) == 0) {
      result = parseLine(line);
      break;
    }
  }
  fclose(file);
  return result;
#elif defined(WINDOWS)
  PROCESS_MEMORY_COUNTERS_EX pmc;
  GetProcessMemoryInfo(
      GetCurrentProcess(), (PROCESS_MEMORY_COUNTERS*)&pmc, sizeof(pmc));
  SIZE_T virtualMemUsedByMe = pmc.PrivateUsage;
  return virtualMemUsedByMe / 1024;
#else
#warning Memory consumption tracking is not available for your system.
  return 0;
#endif
}

}  // namespace gd
