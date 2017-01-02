var fsevents = require('fsevents');
var exec = require('child_process').exec;
var Rsync = require('rsync');
var fpath = require('path');
console.log(fpath.dirname("/d/f/g/v"));

var rsync_conf = {
    // Default options for rsync
    progress: true,
    incremental: true,
    relative: true,
    emptyDirectories: true,
    recursive: true,
    clean: true,
    exclude: [],
    hostname: 'ani',
    username: 'visco',
    port : "1027",
    destination: '~/www/trash'
};

var source = __dirname;

var watcher = fsevents(source);
watcher.on('fsevent', function(path, flags, id) {
//  console.log('fsevent');
//console.log(arguments);

}); // RAW Event as emitted by OS-X
watcher.on('change', function(path, info) {
  console.log('change');
  console.log(arguments);
  var relativePath = (info.path+"").replace(source, "");
  var remoteBaseDir = rsync_conf.destination+fpath.dirname(relativePath);

  if(info.event == "modified"){
      console.log("rsync "+remoteBaseDir);
      var rsync = new Rsync()
      .shell('ssh -p '+rsync_conf.port)
      .set('progress')
      .flags('azv')
      .exclude('.git')
      .exclude('.DS_Store')
      .set('--rsync-path="mkdir -p '+remoteBaseDir+' && rsync"')
      .source(info.path)
      .destination(rsync_conf.username+'@'+rsync_conf.hostname+":"+rsync_conf.destination+relativePath);

      // Execute the command
      rsync.execute(function(error, code, cmd) {
          console.log(cmd);
      });

  } else if(info.event == "deleted"){
    var rm ="ssh "+rsync_conf.username+"@"+rsync_conf.hostname+" 'rm -rf "+(rsync_conf.destination+relativePath)+"'";
      console.log(rm);
      exec(rm, function (err, stdout, stderr) {

      })
  } else if(info.event == "unknown"){
    console.log("rsync "+remoteBaseDir);
    var rsync = new Rsync()
    .shell('ssh -p '+rsync_conf.port)
    .set('progress')
    .flags('azv')
    .exclude('.git')
    .exclude('.DS_Store')
    .set('--rsync-path="mkdir -p '+remoteBaseDir+' && rsync"')
    .source(info.path)
    .destination(rsync_conf.username+'@'+rsync_conf.hostname+":"+rsync_conf.destination+relativePath);

    // Execute the command
    rsync.execute(function(error, code, cmd) {
        console.log(cmd);
    });
  }



});

// Common Event for all changes
watcher.start() // To start observation
//watcher.stop()  // To end observation
