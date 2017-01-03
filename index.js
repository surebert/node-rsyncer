#!/usr/bin/env node

var program = require('commander');
var rsyncer = require('./rsyncer.js');

var config = {
  localpath : "",
  remotepath : "",
  host : "",
  port : "",
  user : "",
  verbose : false,
  excludes : [".git", ".DS_Store"]
};

program
  .version('0.0.1')
  .arguments('<local> <remote>')
  .usage('[options] <local_path> <user@remote:remote_path>')
  .option('-p, --port [e.g. 1027]', 'Port if other than 22')
  .option('-v, --verbose', 'Show verbose output')
  .action(function (local, remote) {
    config.localpath = local;
    config.localpath = config.localpath.replace(/^~/, getUserHome());
    config.localpath = config.localpath == '.'  ? process.cwd() : config.localpath;
    var p = remote.split(":");
    var u = p[0].split("@");
    config.remotepath = p[1];
    config.user = u[0];
    config.host = u[1];
  });

program.parse(process.argv);

function getUserHome() {
  return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}

config.port = program.port || 22;
config.verbose = program.verbose || false;

if(config.verbose){
  console.log('');
  console.log('Using the following configuration.');
  for(var prop in config){
    console.log('config.'+prop+'='+config[prop]);
  }
  console.log('');
}
rsyncer.createWatcher(config);
rsyncer.watcher.start();
//process.exit(1);
