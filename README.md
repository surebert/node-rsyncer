# Author
Paul Visco <paul.visco@gmail.com>

# Description
This utility uses OS X FSWatch, Rsync and SSH to keep a local file directory in
sync with a remote one during changes.

# Installation
* Clone this repo to a local directory
* Then from that local directory
```bash
npm install -g
```

Then you can use the utility like this

```bash
rsyncer /path/to/local/folder user@remotehost:/path/to/remote
```

Any local file changes will then be auto synced to the remote as they happen
