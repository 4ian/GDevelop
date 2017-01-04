# Launch Chrome with flags to output files that can be used by IRHydra
# to profile and inspect de/optimization made by V8 JIT compiler.
# See http://mrale.ph/irhydra/2/

# TODO: Only supporting OS X for now, add Linux/Windows support.

/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
--no-sandbox                           \
--js-flags="--trace-hydrogen           \
            --trace-phase=Z            \
            --trace-deopt              \
            --code-comments            \
            --hydrogen-track-positions \
            --redirect-code-traces"
