#ifndef COMPILATIONCHECKER_H
#define COMPILATIONCHECKER_H

/**
 * \brief Internal class used to ensure that the IDE is compiled and run with the same version of GDL
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
