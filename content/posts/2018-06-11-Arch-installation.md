+++
title = "Arch installation"
description = "Some notes to my arch installation: uefi, btrfs, ecryptfs, i3, polybar, ..."
tags = [
    "arch",
    "linux",
    "btrfs",
    "i3",
    "polybar",
]
date = 2018-06-11
categories = [
    "Installation",
    "Linux",
]
+++

I was a long time a macbook fanboy. After some wired news about apples macOS, some bugs and so on, I had decide to switch to arch-linux. The os that I use already at work, and I'm very happy with that. So, after this decision i sold macbook and bought a dell xps 13 9370. Now I'm writing this post on my new xps with arch.

### USB drive
Create a bootable usb drive with a arch iso (for beginner: antergos live iso):
```
sudo dd bs=4M if=/path/to/archlinux.iso of=/dev/sdX status=progress && sync
```
Boot the usb drive in efi mode and verify that with `efivar -l`

### Partitioning disk
Show your disk with `lsblk` and start the partitioning with `gdisk /dev/sdX`
```
GPT fdisk
Command: o
This option delets all partitions and creates a new protective MBR.
Proceed? (Y/N): y
```

Efi partition
```
Command: n
Partition number (1-128, default 1):
First sector:
Last sector: +250M
Current type is 'Linux filesystem'
Hex code on GUID: ef00
```

Root filesystem
```
Command: n
Partition number (1-128, default 2):
First sector:
Last sector: +185G
Current type is 'Linux filesystem'
Hex code on GUID (Enter = 8300): 
```

Swap partition
```
Command: n
Partition number (1-128, default 3):
First sector:
Last sector: 
Current type is 'Linux filesystem'
Hex code on GUID (Enter = 8300): 8200
```

Show the configuration with `p` in gdisk menu.
```
Number  Start (sector)    End (sector)  Size       Code  Name
   1            2048          514047   250.0 MiB   EF00  EFI System
   2          514048       388487167   185.0 GiB   8300  Linux filesystem
   3       388487168       410007551   10.3 GiB    8200  Linux swap
```

To save this partitions, press `w` and confirm with `y`

Create the filesystems with the following commands:
```
# mkfs.vfat -F 32 -n EFI /dev/sdX1
# mkfs.btrfs -f -L ROOT /dev/sdX2 /dev/sdX
# mkswap -L SWAP /dev/sdX3
# swapon /dev/sdX3
```

Create btrfs subvolumes on the data partition:
```
# mount /dev/sdX2 /mnt
# cd /mnt
# btrfs sub create @
# btrfs sub create @home
# btrfs sub create @pkg
# btrfs sub create @snapshots
# ls
@ @home @pkg @snapshots
# cd
# umount /mnt
```

Mount btrfs subvolumes
```
# mount -o noatime,compress=lzo,space_cache,ssd,subvol=@ /dev/sdX2 /mnt
# mkdir -p /mnt/boot
# mkdir -p /mnt/home
# mkdir -p /mnt/var/cache/pacman/pkg
# mkdir -p /mnt/.snapshots
# mkdir -p /mnt/btrfs
# mount -o noatime,compress=lzo,space_cache,ssd,subvol=@home /dev/sdX2 /mnt/home
# mount -o noatime,compress=lzo,space_cache,ssd,subvol=@pkg /dev/sdX2 /mnt/var/cache/pacman/pkg
# mount -o noatime,compress=lzo,space_cache,ssd,subvol=@snapshots /dev/sdX2 /mnt/.snapshots
# mount /dev/sdX1 /mnt/boot
# mount -o noatime,compress=lzo,space_cache,ssd,subvolid=5 /dev/sdX2 /mnt/btrfs
```

Show all the configurations with `df -Th`
```
Filesystem          Type      Size  Used Avail Use% Mounted on
[...]
/dev/sdX2      btrfs     185G   25G  161G  14% /btrfs
/dev/sdX2      btrfs     185G   25G  161G  14% /.snapshots
/dev/sdX2      btrfs     185G   25G  161G  14% /var/cache/pacman/pkg
/dev/sdX2      btrfs     185G   25G  161G  14% /home
/dev/sdX1      vfat      247M   58M  190M  24% /boot
```

### Arch installation 
Install arch on the mounted partitions:
```
pacstrap /mnt base base-devel btrfs-progs dosfstools bash-completion wpa_supplicant dialog
```

Create `fstab` with `genfstag -Lp /mnt > /mnt/etc/fstab` and check it with `cat /mnt/etc/fstab`

Change root to your arch system with `arch-chroot /mnt` and do some configurations:
```
# echo myhost > /etc/hostname
# echo LANG=de_DE.UTF-8 > /etc/locale.conf
# vi /etc/locale.gen
# locale-gen
# echo KEYMAP=de-latin1 > /etc/vconsole.conf
# ln -sf /usr/share/zoneinfo/Europe/Berlin /etc/localtime
```

Change some kernel parameters for btrfs in your `/etc/mkinitcpio.conf`:
```
[...]
MODULES=(vfat btrfs)
[...]
HOOKS=(base udev autodetect modconf block btrfs filesystems keyboard)
[...]
```
and recreate your kernel with `mkinitcpio -p linux`

Set root password with `passwd`

Install the bootctl bootloader:
```
# bootctl --path=/boot install
```

Change the loader configuration in `/boot/loader/loader.conf` to:
```
default     arch
editor      0
```
Create the arch entrie in `boot/loader/netries/arch.conf`:
```
title   Arch Linux Btrfs
linux   /vmlinuz-linux
initrd  /intel-ucode.img
initrd  /initramfs-linux.img
options root=LABEL=ROOT rootflags=subvol=@ rw
```

Optional: Cleaning up efi entries with `efibootmgr -b 2 -B` (ex. delete entrie 2)

Install the last packages before reboot: `pacman -Syu && pacman -S xorg-server xorg-init`

#### Sources

[unicks.eu - Arch my way](https://www.youtube.com/watch?v=oT7gs2CmsnQ)  
[tadly/pacaur_install.sh](https://gist.github.com/tadly/0e65d30f279a34c33e9b)
[gloriouseggroll](https://www.gloriouseggroll.tv/arch-linux-efi-install-guide/)
