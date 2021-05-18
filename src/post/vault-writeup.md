---
layout: blog.njk
type: post
title: "TAMUctf writeup - vault"
date: 2020-03-29
tags:
  - ctf-writeup
  - reversing
  - radare
---

For me its been a long while since I challenged in a ctf competition. So I decided to play one because we in "Quarantine" anyway.
This challenge is from [TAMUctf 2020](https://tamuctf.com/challenges#VAULT) under "Reversing" named as 'vault'.

I swear anything that says `vault` as a introductory challenge is a good way to brush up your basic debugging skills, because its the `printf("hello, world");` of reverse engineering and binary analysis.

I'll be using `radare2` using `jupyter-radare2` kernel.

### Recon

First let's analyze the binary.

```radare2
o vault
aaa
```

```radare2
i
```

    fd       4
    file     vault
    size     0x4230
    humansz  16.5K
    mode     r-x
    format   elf64
    iorw     false
    blksz    0x0
    block    0x100
    type     DYN (Shared object file)
    arch     x86
    baddr    0x0
    binsz    15020
    bintype  elf
    bits     64
    canary   false
    class    ELF64
    compiler GCC: (Debian 9.3.0-3) 9.3.0
    crypto   false
    endian   little
    havecode true
    intrp    /lib64/ld-linux-x86-64.so.2
    laddr    0x0
    lang     c
    linenum  true
    lsyms    true
    machine  AMD x86-64 architecture
    maxopsz  16
    minopsz  1
    nx       true
    os       linux
    pcalign  0
    pic      true
    relocs   true
    relro    partial
    rpath    NONE
    sanitiz  false
    static   false
    stripped false
    subsys   linux
    va       true

It's ELF 64 and not `stripped`. Awww yea!

### Function calls

Analyzing the function call stack, it's evident that it takes input from user using `fgets` and displays results.

```radare2
aflm
```

    entry0:
        reloc.__libc_start_main

    entry.fini0:
        sym..plt.got
        rip

    sym.deobfuscate:
        sym.imp.strlen

    sym.__libc_csu_init:
        sym._init
        rsi

    main:
        sym.imp.malloc
        sym.deobfuscate
        sym.imp.printf
        sym.imp.fgets
        sym.imp.strcmp
        sym.imp.puts

And `deobfuscate` is a defined function. Might be something related to password?

### Analyze `main`

```radare2
s main
pdf
```

    ┌ 207: int main (int argc, char **argv, char **envp);
    │           ; var char *s2 @ rbp-0x10
    │           ; var char *s1 @ rbp-0x8
    │           ; DATA XREF from entry0 @ 0x10bd
    │           0x000012c9      55             push rbp
    │           0x000012ca      4889e5         mov rbp, rsp
    │           0x000012cd      4883ec10       sub rsp, 0x10
    │           0x000012d1      bf1a000000     mov edi, 0x1a               ; size_t size
    │           0x000012d6      e8a5fdffff     call sym.imp.malloc         ;  void *malloc(size_t size)
    │           0x000012db      488945f8       mov qword [s1], rax
    │           0x000012df      488b45f8       mov rax, qword [s1]
    │           0x000012e3      48be34343238.  movabs rsi, 0x7e394c2f38323434 ; '4428/L9~'
    │           0x000012ed      48bf783a787b.  movabs rdi, 0x54834c1f7b783a78
    │           0x000012f7      488930         mov qword [rax], rsi
    │           0x000012fa      48897808       mov qword [rax + 8], rdi
    │           0x000012fe      48b928298484.  movabs rcx, 0x2f72857884842928
    │           0x00001308      48894810       mov qword [rax + 0x10], rcx
    │           0x0000130c      66c740186776   mov word [rax + 0x18], 0x7667 ; 'gv'
    │                                                                      ; [0x7667:2]=0xffff
    │           0x00001312      c6401a00       mov byte [rax + 0x1a], 0
    │           0x00001316      488b45f8       mov rax, qword [s1]
    │           0x0000131a      4889c7         mov rdi, rax
    │           0x0000131d      e863feffff     call sym.deobfuscate
    │           0x00001322      bf1b000000     mov edi, 0x1b               ; size_t size
    │           0x00001327      e854fdffff     call sym.imp.malloc         ;  void *malloc(size_t size)
    │           0x0000132c      488945f0       mov qword [s2], rax
    │           0x00001330      488d35d10c00.  lea rsi, str.Enter_password: ; 0x2008 ; "Enter password: "
    │           0x00001337      488d3ddb0c00.  lea rdi, [0x00002019]       ; "%s" ; const char *format
    │           0x0000133e      b800000000     mov eax, 0
    │           0x00001343      e808fdffff     call sym.imp.printf         ; int printf(const char *format)
    │           0x00001348      488b15112d00.  mov rdx, qword [obj.stdin]  ; obj.stdin__GLIBC_2.2.5
    │                                                                      ; [0x4060:8]=0 ; FILE *stream
    │           0x0000134f      488b45f0       mov rax, qword [s2]
    │           0x00001353      be1b000000     mov esi, 0x1b               ; int size
    │           0x00001358      4889c7         mov rdi, rax                ; char *s
    │           0x0000135b      e800fdffff     call sym.imp.fgets          ; char *fgets(char *s, int size, FILE *stream)
    │           0x00001360      488b55f0       mov rdx, qword [s2]
    │           0x00001364      488b45f8       mov rax, qword [s1]
    │           0x00001368      4889d6         mov rsi, rdx                ; const char *s2
    │           0x0000136b      4889c7         mov rdi, rax                ; const char *s1
    │           0x0000136e      e8fdfcffff     call sym.imp.strcmp         ; int strcmp(const char *s1, const char *s2)
    │           0x00001373      85c0           test eax, eax
    │       ┌─< 0x00001375      750e           jne 0x1385
    │       │   0x00001377      488d3da20c00.  lea rdi, str.Correct___That_s_the_password ; 0x2020 ; "Correct!  That's the password!" ; const char *s
    │       │   0x0000137e      e8adfcffff     call sym.imp.puts           ; int puts(const char *s)
    │      ┌──< 0x00001383      eb0c           jmp 0x1391
    │      ││   ; CODE XREF from main @ 0x1375
    │      │└─> 0x00001385      488d3db40c00.  lea rdi, str.Sorry__that_isn_t_the_right_password. ; 0x2040 ; "Sorry, that isn't the right password." ; const char *s
    │      │    0x0000138c      e89ffcffff     call sym.imp.puts           ; int puts(const char *s)
    │      │    ; CODE XREF from main @ 0x1383
    │      └──> 0x00001391      b800000000     mov eax, 0
    │           0x00001396      c9             leave
    └           0x00001397      c3             ret

Seems pretty trivial, the `deobfuscate` functions makes some sort of string and stores in `s1`, then the program asks user to "Enter Password", the input is taken and is of the size `0x1b` and stored in `s2`. Note that `fgets` is used. The creator doesn't want us to buffer overflow.

And then the two strings are compared, if they are equal it stays "That's the password and exits" ?!?

At this stage, I'm pretty sure the string in `s1` created from `deobfuscate` is the flag we need.

Let's check the disassembly of `deobfuscate`

```radare2
s sym.deobfuscate
pdf
```

    ┌ 324: sym.deobfuscate (char *arg1);
    │           ; var char *s @ rbp-0x28
    │           ; var int64_t var_15h @ rbp-0x15
    │           ; var size_t var_14h @ rbp-0x14
    │           ; var size_t var_10h @ rbp-0x10
    │           ; var int64_t var_ch @ rbp-0xc
    │           ; var int64_t var_8h @ rbp-0x8
    │           ; var int64_t var_4h @ rbp-0x4
    │           ; arg char *arg1 @ rdi
    │           ; CALL XREF from main @ 0x131d
    │           0x00001185      55             push rbp
    │           0x00001186      4889e5         mov rbp, rsp
    │           0x00001189      4883ec30       sub rsp, 0x30
    │           0x0000118d      48897dd8       mov qword [s], rdi          ; arg1
    │           0x00001191      488b45d8       mov rax, qword [s]
    │           0x00001195      4889c7         mov rdi, rax                ; const char *s
    │           0x00001198      e8a3feffff     call sym.imp.strlen         ; size_t strlen(const char *s)
    │           0x0000119d      8945ec         mov dword [var_14h], eax
    │           0x000011a0      c745fc000000.  mov dword [var_4h], 0
    │       ┌─< 0x000011a7      eb4f           jmp 0x11f8
    │       │   ; CODE XREF from sym.deobfuscate @ 0x11fe
    │      ┌──> 0x000011a9      8b45fc         mov eax, dword [var_4h]
    │      ╎│   0x000011ac      4863d0         movsxd rdx, eax
    │      ╎│   0x000011af      488b45d8       mov rax, qword [s]
    │      ╎│   0x00001296      4863d0         movsxd rdx, eax

    . . . . . . .  i t s  h u g e  a n d  w o r t h l e s s  t o  w o r r y  a b o u t    . . . . . . .

    │      ╎│   0x00001299      488b45d8       mov rax, qword [s]
    │      ╎│   0x0000129d      4801d0         add rax, rdx
    │      ╎│   0x000012a0      0fb608         movzx ecx, byte [rax]
    │      ╎│   0x000012a3      8b45f0         mov eax, dword [var_10h]
    │      ╎│   0x000012a6      4898           cdqe
    │      ╎│   0x000012a8      488d50ff       lea rdx, [rax - 1]
    │      ╎│   0x000012ac      488b45d8       mov rax, qword [s]
    │      ╎│   0x000012b0      4801d0         add rax, rdx
    │      ╎│   0x000012b3      31ce           xor esi, ecx
    │      ╎│   0x000012b5      89f2           mov edx, esi
    │      ╎│   0x000012b7      8810           mov byte [rax], dl
    │      ╎│   0x000012b9      836df001       sub dword [var_10h], 1
    │      ╎│   ; CODE XREF from sym.deobfuscate @ 0x1278
    │      ╎└─> 0x000012bd      837df000       cmp dword [var_10h], 0
    │      └──< 0x000012c1      7fb7           jg 0x127a
    │           0x000012c3      488b45d8       mov rax, qword [s]
    │           0x000012c7      c9             leave
    └           0x000012c8      c3             ret

It's huge, and I'm too lazy to do it. So here is the thing, the function only takes an memory address to strcpy the computed password and it doesn't require any parameter that changes i.e it's a [pure](https://en.wikipedia.org/wiki/Pure_function) functions? I'm looking at you, fp nerds.

Why don't we just debug it.

### Debugging to get the flag

```radare2
ood
```

    73743

```radare2
dcu main
pd
```

    ┌ 207: int main (int argc, char **argv, char **envp);
    │           ; var char *s2 @ rbp-0x10
    │           ; var char *s1 @ rbp-0x8
    │           ; DATA XREF from entry0 @ 0x559ab2a2d0bd
    │           0x559ab2a2d2c9      55             push rbp
    │           0x559ab2a2d2ca      4889e5         mov rbp, rsp
    │           0x559ab2a2d2cd      4883ec10       sub rsp, 0x10
    │           0x559ab2a2d2d1      bf1a000000     mov edi, 0x1a           ; 26 ; size_t size
    │           0x559ab2a2d2d6      e8a5fdffff     call sym.imp.malloc     ;  void *malloc(size_t size)
    │           0x559ab2a2d2db      488945f8       mov qword [s1], rax
    │           0x559ab2a2d2df      488b45f8       mov rax, qword [s1]
    │           0x559ab2a2d2e3      48be34343238.  movabs rsi, 0x7e394c2f38323434 ; '4428/L9~'
    │           0x559ab2a2d2ed      48bf783a787b.  movabs rdi, 0x54834c1f7b783a78
    │           0x559ab2a2d2f7      488930         mov qword [rax], rsi
    │           0x559ab2a2d2fa      48897808       mov qword [rax + 8], rdi
    │           0x559ab2a2d2fe      48b928298484.  movabs rcx, 0x2f72857884842928
    │           0x559ab2a2d308      48894810       mov qword [rax + 0x10], rcx
    │           0x559ab2a2d30c      66c740186776   mov word [rax + 0x18], 0x7667 ; 'gv'
    │                                                                      ; [0x7667:2]=0xffff
    │           0x559ab2a2d312      c6401a00       mov byte [rax + 0x1a], 0
    │           0x559ab2a2d316      488b45f8       mov rax, qword [s1]
    │           0x559ab2a2d31a      4889c7         mov rdi, rax
    │           0x559ab2a2d31d      e863feffff     call sym.deobfuscate
    │           0x559ab2a2d322      bf1b000000     mov edi, 0x1b           ; 27 ; size_t size
    │           0x559ab2a2d327      e854fdffff     call sym.imp.malloc     ;  void *malloc(size_t size)
    │           0x559ab2a2d32c      488945f0       mov qword [s2], rax
    │           0x559ab2a2d330      488d35d10c00.  lea rsi, str.Enter_password: ; 0x559ab2a2e008 ; "Enter password: "
    │           0x559ab2a2d337      488d3ddb0c00.  lea rdi, [0x559ab2a2e019] ; "%s" ; const char *format
    │           0x559ab2a2d33e      b800000000     mov eax, 0
    │           0x559ab2a2d343      e808fdffff     call sym.imp.printf     ; int printf(const char *format)
    │           0x559ab2a2d348      488b15112d00.  mov rdx, qword [obj.stdin] ; obj.stdin__GLIBC_2.2.5
    │                                                                      ; [0x559ab2a30060:8]=0x7f9f4702c7e0 ; FILE *stream
    │           0x559ab2a2d34f      488b45f0       mov rax, qword [s2]
    │           0x559ab2a2d353      be1b000000     mov esi, 0x1b           ; 27 ; int size
    │           0x559ab2a2d358      4889c7         mov rdi, rax            ; char *s
    │           0x559ab2a2d35b      e800fdffff     call sym.imp.fgets      ; char *fgets(char *s, int size, FILE *stream)
    │           0x559ab2a2d360      488b55f0       mov rdx, qword [s2]
    │           0x559ab2a2d364      488b45f8       mov rax, qword [s1]
    │           0x559ab2a2d368      4889d6         mov rsi, rdx            ; const char *s2
    │           0x559ab2a2d36b      4889c7         mov rdi, rax            ; const char *s1
    │           0x559ab2a2d36e      e8fdfcffff     call sym.imp.strcmp     ; int strcmp(const char *s1, const char *s2)
    │           0x559ab2a2d373      85c0           test eax, eax
    │           0x559ab2a2d375      750e           jne 0x559ab2a2d385
    │           0x559ab2a2d377      488d3da20c00.  lea rdi, str.Correct___That_s_the_password ; 0x559ab2a2e020 ; "Correct!  That's the password!" ; const char *s
    │           0x559ab2a2d37e      e8adfcffff     call sym.imp.puts       ; int puts(const char *s)
    │           0x559ab2a2d383      eb0c           jmp 0x559ab2a2d391
    │           ; CODE XREF from main @ 0x559ab2a2d375
    │           0x559ab2a2d385      488d3db40c00.  lea rdi, str.Sorry__that_isn_t_the_right_password. ; 0x559ab2a2e040 ; "Sorry, that isn't the right password." ; const char *s
    │           0x559ab2a2d38c      e89ffcffff     call sym.imp.puts       ; int puts(const char *s)
    │           ; CODE XREF from main @ 0x559ab2a2d383
    │           0x559ab2a2d391      b800000000     mov eax, 0
    │           0x559ab2a2d396      c9             leave
    └           0x559ab2a2d397      c3             ret

Now the program is memory as a process. We have it hit a brekpoint at beginning of `main` to see the locations in memory of the program. The `deobfuscation` is called at address `0x559ab2a2d31d`. We now set a breakpoint at the next instruction `0x559ab2a2d322`.

```radare2
dcu 0x559ab2a2d322
```

Since we have hit the breakpoint, let's capture what all happened.
The function is called and it has filled the location `s1` in memory with a string which is compared later on with the user input. Note that the `s1` address is stored in register `rdi`. Hence now the string created by the function is in the memory address which `rdi` holds, check 3 instructions from `0x559ab2a2d316`.

Examining strings at the memory location in `rdi`

```radare2
x/s @ rdi
```

    0x559ab37002a0 gigem{p455w0rd_1n_m3m0ry1}
    0x559ab37002ba A
    0x559ab37002cb

And there we have the flag! It says _password_in_memory_ :laughing:
