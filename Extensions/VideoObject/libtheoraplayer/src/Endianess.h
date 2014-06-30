#ifndef NORMALIZE_ENDIAN

#ifdef __BIG_ENDIAN__
        // ppc & friends need convert from littleendian to their bigendian
        #define NORMALIZE_ENDIAN(variable) \
                /*printf("normalizing " #variable "(%d) - %d\n", sizeof(variable),
 variable);*/ \
                variable=(sizeof(variable)==1 ? \
                        (variable) : \
                        sizeof(variable)==2 ? \
                         ((variable & 0xFF) << 8) | \
                         ((variable & 0xFF00) >> 8) : \
                        sizeof(variable)==4 ? \
                         ((variable & 0xFF) << 24) | \
                         ((variable & 0xFF00) << 8) | \
                         ((variable & 0xFF0000) >> 8) | \
                         ((variable & 0xFF000000) >> 24) : \
                        \
                        throw("Unsupported sizeof(" #variable ")\n") \
                );
        #define NORMALIZE_FLOAT_ENDIAN(variable) \
        { \
                uint32_t _var = *(uint32_t*)&variable; \
                NORMALIZE_ENDIAN(_var); \
                variable = *(float*)&_var; \
        }

#else
        // i386 & friends do a noop
        #define NORMALIZE_ENDIAN(variable)
        #define NORMALIZE_FLOAT_ENDIAN(variable)
#endif

#endif

