+++
title = "plain_jane - AUCTF writeup"
tags = ["ctf-writeup", "reversing", "radare"]
+++


In [AUCTF 2020](https://ctf.auburn.edu/) under `rev` section, the challenge [plain jane](https://github.com/auehc/AUCTF-2020/blob/master/Reversing/Plain%20Jane/prompt.md) had a assembly code. It said, we need to figure out what the program returns.

Here's what I did.

First, compile it to binary using `gcc`

### Compile

```sh
gcc -o plain_jane plain_jane.s
```
    

Then open the binary in radare.

### Recon

```radare2
o plain_jane
aaa
i
```

    fd       7
    file     plain_jane
    size     0x4040
    humansz  16.1K
    mode     r-x
    format   elf64
    iorw     false
    blksz    0x0
    block    0x100
    type     DYN (Shared object file)
    arch     x86
    baddr    0x0
    binsz    14714
    bintype  elf
    bits     64
    canary   false
    class    ELF64
    compiler GCC: (Arch Linux 9.3.0-1) 9.3.0/GCC: (Debian 9.2.1-22) 9.2.1 20200104
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



```radare2
aflm
```

    entry0:
        reloc.__libc_start_main
    
    entry.fini0:
        reloc.__cxa_finalize
        rip
    
    sym.__libc_csu_init:
        sym._init
        rdx
    
    main:
        sym.func_1
        sym.func_2
        sym.func_3
    


So we have `main` calling 3 functions `func_1`, `func_2` and `func_3`


```radare2
s main
pdf
```

    ┌ 59: int main (int argc, char **argv, char **envp);
    │           ; var int64_t var_ch @ rbp-0xc
    │           ; var int64_t var_8h @ rbp-0x8
    │           ; var int64_t var_4h @ rbp-0x4
    │           ; DATA XREF from entry0 @ 0x1041
    │           0x00001119      55             push rbp
    │           0x0000111a      4889e5         mov rbp, rsp
    │           0x0000111d      4883ec10       sub rsp, 0x10
    │           0x00001121      b800000000     mov eax, 0
    │           0x00001126      e829000000     call sym.func_1
    │           0x0000112b      8945fc         mov dword [var_4h], eax
    │           0x0000112e      b800000000     mov eax, 0
    │           0x00001133      e85e000000     call sym.func_2
    │           0x00001138      8945f8         mov dword [var_8h], eax
    │           0x0000113b      8b55f8         mov edx, dword [var_8h]
    │           0x0000113e      8b45fc         mov eax, dword [var_4h]
    │           0x00001141      89d6           mov esi, edx
    │           0x00001143      89c7           mov edi, eax
    │           0x00001145      e85c000000     call sym.func_3
    │           0x0000114a      8945f4         mov dword [var_ch], eax
    │           0x0000114d      b800000000     mov eax, 0
    │           0x00001152      c9             leave
    └           0x00001153      c3             ret


Disassembly of `main` shows us these calls being made and the parameters passed.

Now since we need to know what the program returns, find the location where the final output of the program is stored. The final computation is returned by the `func_3` fn call, where the output is pushed to stack at `rbp-0xc`.

Running the program in debugger and setting a breakpoint at `0x0000114a` should give us the output we have been looking for.

### Debug to get the flag

```radare2
ood
s main
pdf
```

    7380
    ┌ 59: int main (int argc, char **argv, char **envp);
    │           ; var int64_t var_ch @ rbp-0xc
    │           ; var int64_t var_8h @ rbp-0x8
    │           ; var int64_t var_4h @ rbp-0x4
    │           ; DATA XREF from entry0 @ 0x55c1cd642041
    │           0x55c1cd642119      55             push rbp
    │           0x55c1cd64211a      4889e5         mov rbp, rsp
    │           0x55c1cd64211d      4883ec10       sub rsp, 0x10
    │           0x55c1cd642121      b800000000     mov eax, 0
    │           0x55c1cd642126      e829000000     call sym.func_1
    │           0x55c1cd64212b      8945fc         mov dword [var_4h], eax
    │           0x55c1cd64212e      b800000000     mov eax, 0
    │           0x55c1cd642133      e85e000000     call sym.func_2
    │           0x55c1cd642138      8945f8         mov dword [var_8h], eax
    │           0x55c1cd64213b      8b55f8         mov edx, dword [var_8h]
    │           0x55c1cd64213e      8b45fc         mov eax, dword [var_4h]
    │           0x55c1cd642141      89d6           mov esi, edx
    │           0x55c1cd642143      89c7           mov edi, eax
    │           0x55c1cd642145      e85c000000     call sym.func_3
    │           0x55c1cd64214a      8945f4         mov dword [var_ch], eax
    │           0x55c1cd64214d      b800000000     mov eax, 0
    │           0x55c1cd642152      c9             leave
    └           0x55c1cd642153      c3             ret



```radare2
dcu 0x55c1cd64214a
```

At this state, the value returned from `func_3` is stored in `eax` register. Let's inspect the registers.


```radare2
dr
```

    rax = 0x00006fcf
    rbx = 0x55c1cd642250
    rcx = 0x7fa9d9097578
    rdx = 0xffffffb6
    r8 = 0x00000000
    r9 = 0x7fa9d90d5260
    r10 = 0x00000003
    r11 = 0x00000002
    r12 = 0x55c1cd642020
    r13 = 0x7fff4914ae50
    r14 = 0x00000000
    r15 = 0x00000000
    rsi = 0x000000cf
    rdi = 0x00000042
    rsp = 0x7fff4914ad50
    rbp = 0x7fff4914ad60
    rip = 0x55c1cd64214a
    rflags = 0x00000246
    orax = 0xffffffffffffffff


In `x86_64`, the `rax` register's lower half i.e the 32bits from LSB is the value stored in `eax`. On converting `0x6fcf` into a decimal, we should get the flag.


```radare2
? 0x6fcf
```

    int32   28623
    uint32  28623
    hex     0x6fcf
    octal   067717
    unit    28.0K
    segment 0000:0fcf
    string  "\xcfo"
    fvalue: 28623.0
    float:  0.000000f
    double: 0.000000
    binary  0b0110111111001111
    trits   0t1110021010


The flag is *28623*
