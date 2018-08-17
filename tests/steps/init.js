'use strict';

let initialized = false;

let init = function() {
    if (initialized) {
      return;
    }
  

    initialized = true;
};
  
module.exports.init = init;