#ifndef COMPILATIONCHECKER_H
#define COMPILATIONCHECKER_H

/**
 * Class used to ensure that the IDE is compiled and runned with the same version of GDL
 */
class CompilationChecker
{
    public:
        /**
         * Return false if the IDE wasn't compiled for the current version of GDL, and display
         * an error message in the console.
         */
        static bool EnsureCorrectGDLVersion();
};

#endif // COMPILATIONCHECKER_H
