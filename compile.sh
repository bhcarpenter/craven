#!/bin/sh

SOURCES="lib/util.js lib/Events.js lib/Model.js lib/Collection.js lib/Controller.js lib/Router.js lib/exports.js" 

# Uncompressed
cat $SOURCES > craven.js

# Lib
java -jar build/compiler.jar \
  --compilation_level ADVANCED_OPTIMIZATIONS \
  --js $SOURCES \
  --output_wrapper "(function(){%output%}());" \
  --js_output_file craven.min.js \
  --use_types_for_optimization \
  --warning_level=VERBOSE

