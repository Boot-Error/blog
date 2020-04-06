+++
title = "cracker_barrel - AUCTF writeup"
published = "06-04-2020"
tags = ["ctf-writeup", "reversing", "radare"]
+++


In [AUCTF 2020](https://ctf.auburn.edu/) under `rev` section, the challenge [cracker barrel](https://github.com/auehc/AUCTF-2020/blob/master/Reversing/Cracker%20Barrel/prompt.md) had a binary given running on remote.

Let's rev it up.

### recon

```radare2
o cracker_barrel
aaa
i
```

    fd       6
    file     cracker_barrel
    size     0x43e8
    humansz  17.0K
    mode     r-x
    format   elf64
    iorw     false
    blksz    0x0
    block    0x100
    type     DYN (Shared object file)
    arch     x86
    baddr    0x0
    binsz    15399
    bintype  elf
    bits     64
    canary   true
    class    ELF64
    compiler GCC: (Ubuntu 9.2.1-9ubuntu2) 9.2.1 20191008
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
    relro    full
    rpath    NONE
    sanitiz  false
    static   false
    stripped false
    subsys   linux
    va       true


It's ELF64, I can run it locally too. Let's look into the functions.


```radare2
aflm
```

    entry0:
        reloc.__libc_start_main
    
    entry.fini0:
        sym..plt.got
        rip
    
    sym.remove_newline:
        sym.imp.strlen
    
    sym.check_2:
        sym.imp.strlen
        sym.imp.malloc
        sym.imp.strcmp
    
    sym.__libc_csu_init:
        sym._init
        rax
    
    sym.check_1:
        sym.imp.strcmp
    
    main:
        sym.imp.setvbuf
        sym.check
        sym.print_flag
        sym.imp.puts
    
    sym.check:
        sym.imp.puts
        sym.imp.fgets
        sym.remove_newline
        sym.check_1
        sym.check_2
        sym.check_3
        sym.imp.__stack_chk_fail
    
    sym.check_3:
        sym.imp.strlen
        sym.imp.malloc
        sym.imp.__stack_chk_fail
    
    sym.print_flag:
        sym.imp.fopen
        sym.imp.puts
        sym.imp.exit
        sym.imp.fgets
        sym.imp.printf
        sym.imp.__stack_chk_fail
    


so we have `check` function called by `main` and inside it there are 3 functions `check_1`, `check_2` and `check_3`


```radare2
s main
pdg
```
    
    bool main(undefined8 argc, char **argv)
    {
        int32_t iVar1;
        undefined8 in_R8;
        undefined8 in_R9;
        char **var_10h;
        int64_t var_4h;
        
        sym.imp.setvbuf(_reloc.stdout, 0, 2, 0, in_R8, in_R9, argv);
        iVar1 = sym.check();
        if (iVar1 == 0) {
            sym.imp.puts("That\'s not it!");
        } else {
            sym.print_flag();
        }
        return iVar1 == 0;
    }


Decompiling `main` using [r2ghidra-dec](https://github.com/radareorg/r2ghidra-dec)! 

So, `check` returns a boolean and if it's true we will get the flag.


```radare2
s sym.check
pdg
```
    
    undefined8 sym.check(void)
    {
        int64_t iVar1;
        int32_t iVar2;
        undefined8 uVar3;
        int64_t in_FS_OFFSET;
        int64_t var_2018h;
        int64_t var_2010h;
        int64_t var_8h;
        
        iVar1 = *(int64_t *)(in_FS_OFFSET + 0x28);
        sym.imp.puts("Give me a key!");
        sym.imp.fgets(&var_2010h, 0x2000, _reloc.stdin);
        sym.remove_newline((char *)&var_2010h);
        iVar2 = sym.check_1((char *)&var_2010h);
        if (iVar2 != 0) {
            sym.imp.puts("You have passed the first test! Now I need another key!");
            sym.imp.fgets(&var_2010h, 0x2000, _reloc.stdin);
            sym.remove_newline((char *)&var_2010h);
            iVar2 = sym.check_2((char *)&var_2010h);
            if (iVar2 != 0) {
                sym.imp.puts("Nice work! You\'ve passes the second test, we aren\'t done yet!");
                sym.imp.fgets(&var_2010h, 0x2000, _reloc.stdin);
                sym.remove_newline((char *)&var_2010h);
                iVar2 = sym.check_3((char *)&var_2010h);
                if (iVar2 != 0) {
                    sym.imp.puts("Congrats you finished! Here is your flag!");
                    uVar3 = 1;
                    goto code_r0x00001450;
                }
            }
        }
        uVar3 = 0;
    code_r0x00001450:
        if (iVar1 != *(int64_t *)(in_FS_OFFSET + 0x28)) {
        // WARNING: Subroutine does not return
            sym.imp.__stack_chk_fail();
        }
        return uVar3;
    }


There you have, your cascading `if` statements. Seems we need to dig deeper.

### solving `check_1`

```radare2
s sym.check_1
pdg
```

    
    undefined8 sym.check_1(char *arg1)
    {
        int32_t iVar1;
        undefined8 uVar2;
        char *s1;
        char *s2;
        char *var_8h;
        
        iVar1 = sym.imp.strcmp(arg1, "starwars", "starwars");
        if (iVar1 == 0) {
            iVar1 = sym.imp.strcmp(arg1, "startrek", "startrek");
            if (iVar1 == 0) {
                uVar2 = 0;
            } else {
                uVar2 = 1;
            }
        } else {
            uVar2 = 0;
        }
        return uVar2;
    }


Alright, `check_1` is simple, it compares input with `starwars`, if it isn't equal then
it checks compares input with `startrek`. Hence, first input is either `starwars` or `startrek`.

Moving to `check_2`

### solving `check_2`

```radare2
s sym.check_2
pdg
```
   
    bool sym.check_2(char *arg1)
    {
        int32_t iVar1;
        int64_t iVar2;
        char *s2;
        int32_t var_18h;
        char *var_10h;
        char *s1;
        
        iVar1 = sym.imp.strlen(arg1);
        iVar2 = sym.imp.malloc((int64_t)(iVar1 + 1) << 3);
        var_18h = 0;
        while (var_18h < iVar1) {
            *(char *)(iVar2 + var_18h) = "si siht egassem terces"[(iVar1 + -1) - var_18h];
            var_18h = var_18h + 1;
        }
        iVar1 = sym.imp.strcmp(iVar2, arg1, arg1);
        return iVar1 == 0;
    }


Okay, `check_2` has a string `si siht egassem terces` which when read in reverse is `secret message this is`. 
And the while loop is doing exactly that, reversing the string and comparing it with the second input.

Hence, our second input should be `secret message this is`.

Moving on to `check_3`

### solving `check_3`

```radare2
s sym.check_3
pdg
```

    bool sym.check_3(char *arg1)
    {
        int64_t iVar1;
        bool bVar2;
        int64_t iVar3;
        uint64_t uVar4;
        int64_t in_FS_OFFSET;
        int64_t var_68h;
        int64_t var_54h;
        int32_t var_4ch;
        int64_t var_48h;
        int64_t var_40h;
        int64_t var_18h;
        
        iVar1 = *(int64_t *)(in_FS_OFFSET + 0x28);
        var_40h._0_4_ = 0x7a;
        var_40h._4_4_ = 0x21;
        iVar3 = sym.imp.strlen(arg1);
        iVar3 = sym.imp.malloc(iVar3 << 2);
        var_54h._0_4_ = 0;
        while (uVar4 = sym.imp.strlen(arg1), (uint64_t)(int64_t)(int32_t)var_54h < uVar4) {
            *(uint32_t *)(iVar3 + (int64_t)(int32_t)var_54h * 4) = (int32_t)arg1[(int32_t)var_54h] + 2U ^ 0x14;
            var_54h._0_4_ = (int32_t)var_54h + 1;
        }
        bVar2 = false;
        var_4ch = 0;
        while (uVar4 = sym.imp.strlen(arg1), (uint64_t)(int64_t)var_4ch < uVar4) {
            if (*(int32_t *)(iVar3 + (int64_t)var_4ch * 4) != *(int32_t *)((int64_t)&var_40h + (int64_t)var_4ch * 4)) {
                bVar2 = true;
            }
            var_4ch = var_4ch + 1;
        }
        if (iVar1 != *(int64_t *)(in_FS_OFFSET + 0x28)) {
        // WARNING: Subroutine does not return
            sym.imp.__stack_chk_fail();
        }
        return !bVar2;
    }


This was rather interesting, I took me a while to understand while to understand what's going on in here. There is a bitwise XOR operation to a string 4 times the given input length (the malloc has the length of string left shift by 2). 

This was until I found another solution, this was unintentional I suppose, judging by path we followed on reversing other 2 functions. The creator wants us to reverse this. But let's stick to the unintented solution.

Note the variable `bVar2`, initially it's set to `false`. And at the return of the function, it is `!bVar2` which means in order for the function return `true`, `bVar2` should be `false` which it is initially. The intention of the second `while` is to compared the input with the crated string and it turns `bVar2` to true whenever the comparison is `false`. This is a trivial technique, find if 2 strings are equal? Match it character by character and declare it equal only if you didn't find any mismatch till the end.

This is where I guess out unintended solution summons. The `while` loop runs as long as `var_4ch < strlen(arg1)` where `arg1` is the input. If the loop never ran we wouldn't change out `bVar2`.

How to do that? *Supply an empty string* :sunglasses:

The condition turns `false` in the first iteration itself and the `while` loop is never executed.

### The result

So here is the solution, `nc` the challenge, then supply these inputs in order.

1. `starwars`
2. `secret message this is`
3. `` (just hit enter)

You will get the flag.
