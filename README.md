# Author
Paul Visco <paul.visco@gmail.com>

# Description
This utility uses OS X FSWatch, Rsync and SSH to keep a local file directory in
sync with a remote one during changes on a mac.

You could use this if your editor or IDE does not support SFTP upload/delete on 
save and delete.

Right now this is OS X specific because OS X did not play well with all the other
crossplatform based file watchers/uploaders I tried, which is why I built this.

# Installation
* Clone this repo to a local directory
* Then from that local directory
```bash
npm install -g
```

Then you can use the utility like this. 

If you are using a port other than 22 you can set the optional port argument or 
you can just set up port config, keys etc in your ~/.ssh/config since you have to
set up the authentication to work with keys anyways

```bash
rsyncer /path/to/local/folder user@remotehost:/path/to/remote -p 1027
```
Any local file changes will then be auto synced to the remote as they happen

Example ssh config to use key and other port with a specific host

```bash
Host $REMOTE_HOST
        Hostname $REMOTE_HOST
        Port $REMOTE_PORT
        User $REMOTE_USER
        IdentityFile ~/.ssh/id_rsa
```
