// -*- coding: utf-8 -*-
//test.js --- 
//
// Copyright (C) MIT License
// Tampere University of Technology
//
// Created: Thu Sep 16 13:16:06 2010 (+0300)
// Author: wuher
//

var intr = require('./rest-interpreter').interpreter('../caol/stack.caol');

var emptystack = intr.empty_stack();
var stack = intr.stack('my stack data', emptystack);
stack.GET();
stack.PUT('my PUT data');

//
//test.js ends here
