+++
type = "post"
title = "Adopting LVM"
description = ""
published = "30-03-2020"
tags = ["archlinux", "lvm"]
+++

I use Arch Linux on every machine in my possession.

Within a year of its use, I realized what Arch Linux F**kups really mean and why people cry about it.

But I figured out a escape to a problem I always faced during a f**kup, It's the disk partitions and re-installation.

<!-- more -->

## The Trouble

Traditionally you would have a setup like this.

	n00b:

	- /dev/sda1 
		- / (OS installation)
			- /home/user (home folder)

Your everyhing is in the root partition. Now if by some reason your `root` is screwed, you have to spend time backing up 
your `home` partition. And if you are a data hoader, you be spending time in backing it up to wipe clean the partition for fresh install.

I have been with this setup before using Arch Linux but Ubuntu didn't screw itself up that often.

	intermediate:

	- /dev/sda1
		- / (OS installation)
	- /dev/sda2
		- /home/use (home folder)

Now here are utilizing disk partitioning for `home` and `root` partitions.

Why? because organization. But most importantly, there is separation b/w them. There is no need to worry about first case anymore. 
Just wipe `root` and install again, you'll be up with fresh install with all your files not even touched.

This was me for a whole again. It worked flawlessly, took be 1-2 days to get back on track with packages and necessary software.


## Getting better at the game

The f**kups got better since then, some of them were

- A update got interrupted due to network failure, didn't verify the packages and it failed to install a critical library `i18n`, which was a dependency to many software including `pacman`.
  I figured out since it was installtion problem, might well re-install it. But `pacman` depended on this. I somehow fixed it by manually installing this libary, had to do some symlinks.
- Some startup service didn't start and the system refused to give me a shell. which required me a re-install. 

The quest to tweak my Arch Linux to perfection was always on. This led me to `lvm`, it all sounded fancy because of it capabilities like `Logical Paritions` and its dynamic abilities.

## Adopting LVM

I found out about LVM while browsing list of applications in ArchWiki. It was the moment it struck that this is the setup I have been in grave need. A solution to a minor inconvinience.

One particular feature which I love about LVM is

{{< box info="Expand/Shrink partitions without worrying about alignment and free adjacent spaces" type="success" >}}

That's right, running out of space because you use too many docker images? Expand your `root` on the fly without worrying about making up space adjacent to it. 
This also means I can have multiple distros saved in rather small partitons because it can resized whenever required.

Learn more about it 

- [An Introduction to LVM](https://www.digitalocean.com/community/tutorials/an-introduction-to-lvm-concepts-terminology-and-operations)
- [LVM - ArchWiki](https://wiki.archlinux.org/index.php/LVM)

## My Setup

My setup to LVM is really simple. The only reason to choose this setup to have flexibility on managing partition without a headache, which means it takes some effort to set them up.

### Physical Volume Setup

I have single 256GB SSD in my thinkpad x1c which I have split into 2 physical partitions `/dev/sda2` and `/dev/sda3`, `/dev/sda1` is the boot partition.

These partitions are configured to be our physical partitions. One explicitly for `distros` and other for `datadir` which will be `home` partitions.

	$ sudo pvs
	  PV         VG      Fmt  Attr PSize    PFree
	  /dev/sda2  distros lvm2 a--  <118.71g <68.71g
	  /dev/sda3  datadir lvm2 a--   119.26g  49.26g
	  
If you own a system with hybrid disk setup, one being SSD usually 128GB and HDD of 1TB, the physical volumes can be set to use `root` to be loaded from SSD and `home` from HDD. Or want to be a master of optimization crafts, use parts of `root` and `home` in your SSD to speed up boot time and load the rest like `Music` from HDD. 

Such an ambition would be a mess to implement, but LVM makes it painless.
	  
### Volume Groups Setup

Volume groups are collection of physical volumes, you can collate multiple physical volumes into a single group.
I choose to mirror my physical volumes as volume groups

	$ sudo vgs
	  VG      #PV #LV #SN Attr   VSize    VFree
	  datadir   1   1   0 wz--n-  119.26g  49.26g
	  distros   1   1   0 wz--n- <118.71g <68.71g

Volume groups gives you an abstract over your physical volumes, the *logical volumes* created are categorized into these volumes.

### Logical Volumes

This is the abstraction I seek to implement. On my X1C, this is the setup

	$ sudo lvs
	  LV                   VG      Attr       LSize  
	  booterror-home-crypt datadir -wi-ao---- 70.00g
	  arch-main            distros -wi-ao---- 50.00g
	  
`arch-main` is my current Arch Linux installation and `booterror-home-crypt` is the root partition for user `booterror` which is a `LUKS` encrypted partition. And Yes keep your personal data encrypted, will save you from intrusion by physical access like a theft :laughing:

Note that the size of the partitions, I can use rest of free space in volume groups to make new partitions for different distros and respective users.

{{< box info="Make sure you read this [guide](https://wiki.archlinux.org/index.php/LVM#Resizing_the_logical_volume_and_file_system_separately) on ArchWiki before resizing an LVM partitions" type="warning" >}}


### Final structure

Here is my final disk structure with all the necessary complexities added just so I can *resize on the fly*

	$ lsblk
	NAME                               MAJ:MIN RM   SIZE RO TYPE  MOUNTPOINT
	sda                                  8:0    0 238.5G  0 disk
	├─sda1                               8:1    0   511M  0 part  /boot
	├─sda2                               8:2    0 118.7G  0 part
	│ └─distros-arch--main             254:0    0    50G  0 lvm   /
	└─sda3                               8:3    0 119.3G  0 part
	  └─datadir-booterror--home--crypt 254:1    0    70G  0 lvm
		└─booterror-home               254:2    0    70G  0 crypt

		
## There's more

I figured out LVM can do [snapshotting](https://wiki.archlinux.org/index.php/LVM#Snapshots), essentially a time machine for your partitions. One useful setup would be to have a snapshot of your bare minimum arch linux installation as a snapshot, whenever there is a f**kup and its beyond fix, just revert to this snapshot. You can keep a list of all packages you need to install in a txt file and run pacman right away after reverting to this bare minimum state.

A snapshot setup would be more rewarding than a abstract just so I can resize on the fly.

I need to experiment this setup, until then...
