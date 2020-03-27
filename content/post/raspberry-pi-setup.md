+++
type = "post"
title = "Initial Raspberry Pi Setup"
description = "setting up Raspberry Pi when you don't have a monitor and mouse"
tags = ["raspberry pi", "GNU/Linux", "wifi"]
+++

This write up allow you to to set up your Raspberry Pi for ssh
We acheive this by manually activating sshd in Pi's root partition.
Followed by writing a systemd service file which activates the WiFi.
In this case, I will be connecting my Pi to my smartphone's mobile hotspot and my pc to the hotspot as well.
And then ssh into the Pi.

## Mount the SD card

Mount the root partition of the SD card.

Some linux system automatically mounts them, like in my case I use Gnome.
You can check where it has mounted by 

```
df -h
```

Export that directory as ROOT variable.

```
export ROOT directory_where_root_partition_is_mounted
```   

If you system hasn't mounted automatically, follow the instructions below.
  
Connect the SD card to a linux PC, then do
`fdisk -l`, find the device of root partition. Example:
My PC showed these results.

```
Disk /dev/sda: 14.9 GiB, 15931539456 bytes, 31116288 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: dos
Disk identifier: 0xa8431c25

Device     Boot  Start      End  Sectors  Size Id Type
/dev/sda1         8192   137215   129024   63M  c W95 FAT32 (LBA)
/dev/sda2       137216 31116287 30979072 14.8G 83 Linux
```

We need to mount `/dev/sda2`. Note that I figure it out by the *size* and *type* parameters.

Then mount the root parttiton. Export to ROOT

```
mkdir root
sudo mount /dev/sda2 root
cd root
export ROOT $(pwd)
```

## Setting up sshd manually by systemd service files.

`sshd` to run on startup is disabled by default. We need to find the `sshd.service` file.
From my search, I found it on `var/lib/systemd/deb-systemd-helper-enabled/sshd.service`
Then link that `sshd.service` file to `$ROOT/etc/systemd/system/sshd.service`

```
ln -s $ROOT/var/lib/systemd/deb-systemd-helper-enabled/sshd.service $ROOT/etc/systemd/system/sshd.service
```

## Setting Up WiFi

Go to `$ROOT/home/pi/`, create 2 files.

```
touch start_wifi start_wifi.service
```   

Write the following in the `start_wifi.service`, use`nano start_wifi.service`

```
[Unit]
Description=Connect Rpi to my Hotspot

[Service]
Type=oneshot
ExecStart=/home/pi/start_wifi

[Install]
WantedBy=multi-user.target
```

Save it in `nano` by `ctrl-x`

And this in `start_wifi` file

```
wpa_supplicant -D -P/home/pi/wpa.pid -iwlan0 -c/etc/wpa_supplicant/wpa_supplicant.conf
```

Save it.

We need to active this start up script by adding it to the systemd.

```sh
ln -s $ROOT/home/pi/start_wifi.service $ROOT/etc/systemd/system/start_wifi.service
ln -s $ROOT/home/pi/start_wifi.service $ROOT/etc/systemd/system/multi-user.target.wants/start_wifi.service
```
Now, we need to edit the `$ROOT/etc/wpa_supplicant/wpa_supplicant.conf` adding our mobile hotspot's details.
Open the same using `nano` and add the following lines.

```
network={
    ssid="HOTSPOT NAME"
    psk="HOTSPOT PASSWD"
}
```

> This should work, fingers crossed

Save it!

We are now done with editing the necessary files, now un mount by

```
umount $ROOT
```

## Hook up the Pi

Insert the SD card on Pi, start your phone's hotspot.
Boot up the Pi.

If everything was done right, your phone must have indicated a new device connected.
Connect your PC to the same hotspot
If your phone doesn't show up the ip use `nmap` tool to find it out.

```
nmap 192.168.43.*
```

Note: I assumed the fist 3 octets of ip by checking my PC's ip address.

After discovering ip, ssh into it by

```
ssh pi@<IP_ADDRESS>
```

Where `<IP_ADDRESS>` is Pi's ip address.

You will be prompted for passwd, enter that, Voila! You are in Pi!

_Happy hacking :D_
