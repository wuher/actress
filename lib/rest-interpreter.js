// -*- coding: utf-8 -*-
//rest-interpreter.js --- 
//
// Copyright (C) MIT License
// Tampere University of Technology
//
// Created: Thu Sep 16 13:17:09 2010 (+0300)
// Author: wuher
//

// narwhal:
// var ometa = require("ometajs");
// var file = require("file");

// node:
var ometa = require('ometa-node');
var file = require('fs');
var print = console.log;

// amend Function wity currying
if (typeof Function.curry !== 'function') {
    Function.prototype.curry = function () {
        var slice, args, that;

        slice = Array.prototype.slice;
        args = slice.apply(arguments);
        that = this;

        return function () {
            return that.apply(null, args.concat(slice.apply(arguments)));
        };
    };
}



/**
 * wrapper that executes the given behaviour one step at a time.
 */
var behavior_wrapper = function (behavior) {
    var pc = 0, that = {};

    that.step = function () {

    };
};

/**
 * helper for binding parameter names to their values
 * @param target store bound parameters here (optional)
 * @return bound parameters (same as target if given)
 */
var bind_parameters = function(pnames, pvalues, target) {
    var i, params = target || {};
    // bind parameters
    for (i = 0; i < pnames.length; i += 1) {
        // no worries, if not enough pvalues elements they become
        // undefined as they should be
        params[pnames[i]] = pvalues[i];
    }
    return params;
};



/**
 * try and resolve the value for the given varible name
 */
var name_lookup = function (name, obj1, self) {
    var globalscope = (function () {return this;}).call(null);

    if (name === "self") {
        return self;
    } else if (name in obj1) {
        return obj1[name];
    } else if (name in self) {
        return self[name];
    } else if (name in exports) {
        return exports[name];
    } else if (name in globalscope) {
        return globalscope[name];
    } else {
        throw Error(["variable", name, "not found"].join(" "));
    }
};


/**
 * implementations for our rest-language primitives
 */
var funcimps = {
    send_: function (impl, params) {
        var code, content, to, hack;
        // print("--- " + impl);
        impl.shift();
        code = impl[0][1];
        // todo: parser produces different structures (maybe bacause
        // self is a keyword?)
        if (impl[0].length > 2) {
            hack = (typeof impl[0][2] === "string") ? impl[0][2] : impl[0][2][1];
            content = name_lookup(hack, params, this);
        }
        impl.shift();
        to = impl[0];
        print("sending " + code + " with '" + content + "' to " + to);
    },
    let_: function (impl, params) {
        // todo: implement let
    },
    become_: function (impl, params) {
        impl.shift();
        print('## become: ' + impl);
    }
};


/**
 * process behaviour definition
 *
 * adds object creators and functions according to given code to the
 * given scope.
 */
var process_bdef = function (bdef, scope) {
    // name of the behavior and its functions (GET, PUT, ...)
    var name = bdef[1], ctorparams = bdef[2], funcs = bdef[3];

    // creator function for the behaviour
    scope[name] = function (acquaintancenames, functions) {
        var i, behaviour = {}, funcname, paramnames, implementation, args;
        args = Array.prototype.slice.call(arguments, 2);
        bind_parameters(acquaintancenames, args, behaviour);
        // loop functions (HTTP methods)
        for(i = 0; i < functions.length; i += 1) {
            funcname = functions[i][1][0];
            paramnames = functions[i][1].slice(1);
            implementation = functions[i][2];
            behaviour[funcname] = function (fname, pnames, impl) {
                // function implementation goes here
                var i, params, args, that = behaviour;
                // get parameter values and bind them to names
                args = Array.prototype.slice.call(arguments, 3);
                params = bind_parameters(pnames, args);
                // go through code lines
                for (i = 0; i < impl.length; i += 1) {
                    funcimps[impl[i][0] + '_'].call(that, impl[i], params);
                }
            }.curry(funcname, paramnames, implementation);
        }
        return behaviour;
    }.curry(ctorparams, funcs);
};


/**
 * the interpreter "creator"
 */
exports.interpreter = function (filename) {
    var f, i, ast, code, that = {};

    // read the interpreted code
    code = file.readFileSync(filename);

    // parse code against syntax
    ast = ometa.Caol.matchAll(code, 'prog');

    for (i = 0; i < ast.length; i += 1) {
        // print(">> " + ast[i]);
        process_bdef(ast[i], that);
    }

    return that;
};


// module "main"
(function () {
     // read syntax definition
     var syntax = file.readFileSync('../caol/caol.ometa'); // todo: path

     // narwhal:
     ometa.evalCode(syntax); // todo: error handling
 }
)();

//
//rest-interpreter.js ends here
