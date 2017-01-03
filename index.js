#!/usr/bin/env node

var program = require('commander');
var fsevents = require('fsevents');
var exec = require('child_process').exec;
var rsync = require('rsync');
var fpath = require('path');

var config = {
  localpath : "",
  remotepath : "",
  host : "",
  port : "",
  user : "",
  verbose : false
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
  for(var prop in config){
    console.log('config.'+prop+'='+config[prop]);
  }
}

//process.exit(1);

var watcher = fsevents(config.localpath);

watcher.on('fsevent', function(path, flags, id) {
  //  console.log('fsevent');
  //console.log(arguments);

}); // RAW Event as emitted by OS-X
watcher.on('change', function(path, info) {

  console.log('change');
  console.log(arguments);
  var relativePath = (info.path+"").replace(config.localpath, "");
  var remoteBaseDir = config.remotepath+fpath.dirname(relativePath);

  if(info.event == "modified"){
      var connection = new rsync()
      .shell('ssh -p '+config.port)
      .set('progress')
      .flags('azv')
      .exclude('.git')
      .exclude('.DS_Store')
      .set('--rsync-path="mkdir -p '+remoteBaseDir+' && rsync"')
      .source(info.path)
      .destination(config.user+'@'+config.host+":"+config.remotepath+relativePath);

      // Execute the command
      connection.execute(function(error, code, cmd) {
          console.log(cmd);
      });

  } else if(info.event == "deleted" || info.event == "moved-out"){
    if(relativePath){
      var rm ="ssh "+config.user+"@"+config.host+" 'rm -rf "+(config.remotepath+relativePath)+"'";
        console.log(rm);
        exec(rm, function (err, stdout, stderr) {

        });
    }

  } else if(info.event == "unknown"){
    console.log("rsync "+remoteBaseDir);
    var connection = new rsync()
    .shell('ssh -p '+config.port)
    .set('progress')
    .flags('azv')
    .exclude('.git')
    .exclude('.DS_Store')
    .set('--rsync-path="mkdir -p '+remoteBaseDir+' && rsync"')
    .source(info.path)
    .destination(config.user+'@'+config.host+":"+config.remotepath+relativePath);

    // Execute the command
    connection.execute(function(error, code, cmd) {
        console.log(cmd);
    });
  }



});

// Common Event for all changes
watcher.start() // To start observation
//watcher.stop()  // To end observation

//process.exit(1);
