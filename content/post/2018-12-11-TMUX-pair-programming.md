+++
title = "Pair programming with tmux"
description = "Create a secure login to your tmux session"
tags = [
    "linux",
    "tmux",
    "pair-programming",
    "ssh",
    "development",
    "programming",
]
date = 2018-12-11
categories = [
    "Linux",
    "Development",
]
+++

The simpliest way to develop over the network with a colleague or friend in a
secure way, is to use ssh[1] and tmux[2]. An alternative is to use a very 
popular tool named tmate[3]. In my opinion, it is not necessary, because it is
so simple to create a new user on your machine and to share your tmux session
with them. Only if you haven't a ssh incoming routing, you may use another way.
Here is a step-by-step guide to create a user and share your tmux session:

### Requirements
Install the following packages on your machine:
```
tmux        # terminal multiplexer
openssh     # ssh daemon
```
and the ssh port forwarded to your machine.

### Create user and group
```
$ groupadd shared               # create group "shared"
$ useradd tmux                  # create user "tmux"
$ usermod -a -G shared tmux     # add user tmux to group shared
$ usermod -a -G shared $USER    # add your current user to group
$ passwd tmux                   # set pass for user tmux
$ mkdir /home/tmux              # create home dir for tmux
```

### Share a tmux session
I have created a little script for sharing a new tmux session

***tmuxshare***
```bash
#!/usr/bin/env bash

if ! pgrep -x "sshd" > /dev/null
then
    echo "Start ssh daemon..." && sudo systemctl start sshd.service
fi
tmux -S /tmp/shared -f ~/.tmux.conf new -s shared -d
chgrp shared /tmp/shared
tmux -S /tmp/shared attach
```

for joining a tmux session, the thmux user have to run the `tmuxjoin` script

***tmuxjoin***
```bash
#!/usr/bin/env bash
[[ -e /tmp/shared ]] && tmux -S /tmp/shared attach
```

To run this script automatically after user login, put this line to the 
`.bash_profile`
```bash
[[ -e /tmp/shared ]] && ~/tmuxjoin
```

***EDIT:***
For sharing your current session, I modified the scripts as follows:

***tmuxshare***
```bash
#!/usr/bin/env bash

CURRENT=$(echo $TMUX | cut -f1 -d',')
SESSION=$(echo $TMUX | cut -f3 -d',')

if ! pgrep -x "sshd" > /dev/null
then
    echo "Start ssh daemon..." && sudo systemctl start sshd.service
fi
chgrp shared "$CURRENT"
chgrp shared "$(dirname $CURRENT)"
chmod 0770 -R "$(dirname $CURRENT)"
echo "$CURRENT,$SESSION" > /tmp/shared.current
```

***tmuxjoin***
```bash
#!/usr/bin/env bash
if [ -e /tmp/shared.current ]; then
    SOCKET="$(cat /tmp/shared.current | cut -f1 -d',')"
    SESSION="$(cat /tmp/shared.current | cut -f2 -d',')"
    tmux -S "$SOCKET" attach -t "$SESSION"
fi
[[ -e /tmp/shared ]] && tmux -S /tmp/shared attach
```

#### Sources

[1] [OpenSSH](https://www.openssh.com)  
[2] [TMUX](https://github.com/tmux/tmux)  
[3] [tmate.io](https://tmate.io)  
