
var fsevents = require('fsevents');
var exec = require('child_process').exec;
var rsync = require('rsync');
var fpath = require('path');
var colors = require('colors');

var exports = module.exports;

exports.createWatcher = function(config){

  exports.watcher = fsevents(config.localpath);

  exports.watcher.on('fsevent', function(path, flags, id) {});

  exports.watcher.on('change', function(path, info) {

    var relativePath = (info.path+"").replace(config.localpath, "");

    var excluded = config.excludes.some(function(v){
      return relativePath.substr(1).match(new RegExp("^"+v.replace(".", "\.")));
    });

    if(excluded){
        console.log("Skipping due to exclude :"+path);
        return;
    }

    if(info.event == "modified" || info.event == "moved-in" || info.event == "unknown"){

      var remoteBaseDir = config.remotepath+fpath.dirname(relativePath);

      var connection = new rsync()
        .set('progress')
        .flags('azv')
        .exclude('.git')
        .exclude('.DS_Store')
        .set('--rsync-path="mkdir -p '+remoteBaseDir+' && rsync"')
        .source(info.path)
        .destination(config.user+'@'+config.host+":"+config.remotepath+relativePath);

      if(config.port != 22){
        connection.shell('ssh -p '+config.port)
      }
      console.log("Uploading :"+path);

      // Execute the command
      connection.execute(function(error, code, cmd) {

        if(error){
          console.error(("Error Uploading: "+path).red);
          console.error(("Rsync Code Returned: "+code).red);
          console.error(("Used Command: "+cmd).red);
        } else {
          console.log(("Uploaded: "+path).green);
          if(config.verbose){
            console.log(cmd);
          }
        }
      });

    } else if(info.event == "deleted" || info.event == "moved-out"){
      if(relativePath){
        var remoteFile = config.remotepath+relativePath;
        var cmd ="ssh ";
        if(config.port != 22){
          cmd +="-p "+config.port+" ";
        }
        cmd += config.user+"@"+config.host+" 'rm -rf "+remoteFile+"'";
        console.log("Deleting: "+path);
        exec(cmd, function (error, stdout, stderr) {
          if(error){
            console.error(("Error Deleting: "+path).red);
            console.error(("SSH Error Message: "+stderr.trim()).red);
            console.error(("SSH Code Returned: "+error.code).red);
            console.error(("Used Command: "+error.cmd).red);
          } else {
            console.log(("Deleted: "+remoteFile).green);
          }

          if(config.verbose){
            console.log(cmd);
          }

        });
      }

    }

  });

}
