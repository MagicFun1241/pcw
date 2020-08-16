#!/usr/bin/env node

const yargs = require("yargs");

yargs.command("connect [key]", 'Connect to project', yargs => {
    yargs.positional('key', {
        describe: 'Access key'
    });
}, require("./src/client")).command("start", "Start server", yargs => {}, require("./src/server")).scriptName("pcw").argv;