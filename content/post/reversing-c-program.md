+++
type = "post"
title = "Reversing C Programs"
categories = ["cybersec"]
tags = ["C", "gdb", "reversing"]
+++


This is a draft for blog to be added as a part of Segfault Reverse Engineering Workshop series.

# Reversing a C Program

It's said C is low level programming language, well that's not true. It became that way because of advancements in new programming languages such 
as Python, Java, Javascript, Ruby. These run on a VM, thereby incur a heavy abstraction cost.

Now C programs are compiled to assembly, since C have not much syntax sugar it become easy to read the Assembly and figure out the possible C code to it.

Given is a C program, compiled to a binary and then disassembled to reverse engineer.

~~~~ {#decompiled .asm .numberLines startFrom="1"}
(gdb) disass main
	Dump of assembler code for function main:
	   0x000005cd <+0>:     lea    ecx,[esp+0x4]
	   0x000005d1 <+4>:     and    esp,0xfffffff0
	   0x000005d4 <+7>:     push   DWORD PTR [ecx-0x4]
	   0x000005d7 <+10>:    push   ebp
	   0x000005d8 <+11>:    mov    ebp,esp
	   0x000005da <+13>:    push   ebx
	   0x000005db <+14>:    push   ecx
	   0x000005dc <+15>:    sub    esp,0x20
	   0x000005df <+18>:    call   0x4d0 <__x86.get_pc_thunk.bx>
	   0x000005e4 <+23>:    add    ebx,0x19ec
	   0x000005ea <+29>:    mov    eax,gs:0x14
	   0x000005f0 <+35>:    mov    DWORD PTR [ebp-0xc],eax
	   0x000005f3 <+38>:    xor    eax,eax
	   0x000005f5 <+40>:    mov    DWORD PTR [ebp-0x1c],0x0
	   0x000005fc <+47>:    mov    DWORD PTR [ebp-0x14],0x0
	   0x00000603 <+54>:    sub    esp,0xc
	   0x00000606 <+57>:    lea    eax,[ebx-0x1870]
	   0x0000060c <+63>:    push   eax
	   0x0000060d <+64>:    call   0x440 <printf@plt>
	   0x00000612 <+69>:    add    esp,0x10
	   0x00000615 <+72>:    sub    esp,0x8
	   0x00000618 <+75>:    lea    eax,[ebp-0x1c]
	   0x0000061b <+78>:    push   eax
	   0x0000061c <+79>:    lea    eax,[ebx-0x185e]
	   0x00000622 <+85>:    push   eax
	   0x00000623 <+86>:    call   0x470 <__isoc99_scanf@plt>
	   0x00000628 <+91>:    add    esp,0x10
	   0x0000062b <+94>:    mov    DWORD PTR [ebp-0x10],0x1
	   0x00000632 <+101>:   jmp    0x669 <main+156>
	   0x00000634 <+103>:   sub    esp,0x8
	   0x00000637 <+106>:   push   DWORD PTR [ebp-0x10]
	   0x0000063a <+109>:   lea    eax,[ebx-0x185b]
	   0x00000640 <+115>:   push   eax
	   0x00000641 <+116>:   call   0x440 <printf@plt>
	   0x00000646 <+121>:   add    esp,0x10
	   0x00000649 <+124>:   sub    esp,0x8
	   0x0000064c <+127>:   lea    eax,[ebp-0x18]
	   0x0000064f <+130>:   push   eax
	   0x00000650 <+131>:   lea    eax,[ebx-0x185e]
	   0x00000656 <+137>:   push   eax
	   0x00000657 <+138>:   call   0x470 <__isoc99_scanf@plt>
	   0x0000065c <+143>:   add    esp,0x10
	   0x0000065f <+146>:   mov    eax,DWORD PTR [ebp-0x18]
	   0x00000662 <+149>:   add    DWORD PTR [ebp-0x14],eax
	   0x00000665 <+152>:   add    DWORD PTR [ebp-0x10],0x1
	   0x00000669 <+156>:   mov    eax,DWORD PTR [ebp-0x1c]
	   0x0000066c <+159>:   cmp    DWORD PTR [ebp-0x10],eax
	   0x0000066f <+162>:   jle    0x634 <main+103>
	   0x00000671 <+164>:   mov    ecx,DWORD PTR [ebp-0x1c]
	   0x00000674 <+167>:   mov    eax,DWORD PTR [ebp-0x14]
	   0x00000677 <+170>:   cdq
	   0x00000678 <+171>:   idiv   ecx
	   0x0000067a <+173>:   mov    edx,eax
	   0x0000067c <+175>:   mov    eax,DWORD PTR [ebp-0x1c]
	   0x0000067f <+178>:   sub    esp,0x4
	   0x00000682 <+181>:   push   edx
	   0x00000683 <+182>:   push   eax
	   0x00000684 <+183>:   lea    eax,[ebx-0x1844]
	   0x0000068a <+189>:   push   eax
	   0x0000068b <+190>:   call   0x440 <printf@plt>
	   0x00000690 <+195>:   add    esp,0x10
	   0x00000693 <+198>:   mov    eax,0x0
	   0x00000698 <+203>:   mov    ecx,DWORD PTR [ebp-0xc]
	   0x0000069b <+206>:   xor    ecx,DWORD PTR gs:0x14
	   0x000006a2 <+213>:   je     0x6a9 <main+220>
	   0x000006a4 <+215>:   call   0x730 <__stack_chk_fail_local>
	   0x000006a9 <+220>:   lea    esp,[ebp-0x8]
	   0x000006ac <+223>:   pop    ecx
	   0x000006ad <+224>:   pop    ebx
	   0x000006ae <+225>:   pop    ebp
	   0x000006af <+226>:   lea    esp,[ecx-0x4]
	   0x000006b2 <+229>:   ret
	End of assembler dump.
~~~~

When it comes to reverse engineering, it boils down to a process of induction. We are evident of `functions` in C, we add them using header files and then call them to our need.
Then we use a lot of variables, for computation, passing it to functions. Then some conditionals and iterators(loops), well loops are basically conditional branching repeatedly executes a piece of code.

It is important to understand the assembly code, refer to this for a short introduction to x86 assembly guide.

And lastly, it about developing a approach to tackling a problem, in this case you might find it definitive to follow the instructions given but it might break when the program becomes complex. Then you must evaluate and develop new techniques, many security researchers write their experiences on finding bugs, read them and introspect on their techniques.

# Approach?

Here is the plan. Given the disassembly, we will be

1. Finding all the function calls
2. Find the variables used.
3. Find the conditionals and detect loops
4. Branch the code into chunks for easy understanding
5. Convert group of instructions to possible C code.
6. Lay it out and understand what it does.


## Step 1: Finding all the function calls

- Look out for `call` instructions, all the `push` instructions above it would be the arguments passed.

![function calls](file:///home/booterror/Development/Contributing/segfault/0x01/paper_disass_fncall.png)

## Step 2: Find the variables used.

- Variables are stored on the stack
- Find references to the stack in the form `[ebp - 0x10]`, these are usage of variables.
- It seems like they are 32bit variables, possibly being `int`

![variables on the stack](file:///home/booterror/Development/Contributing/segfault/0x01/paper_disass_find_stack.svg)

## Step 3: Find the conditionals and detect loops

- Look out for jump statements
	- `jmp` is an unconditional jump
	- `jle` is a conditional jump, it checks the result of `cmp` and decides to jump accordingly.
- From the drawn lines, it is evident it is a loop, what kind of a loop would it be? `while` or `for`?

![jumps](file:///home/booterror/Development/Contributing/segfault/0x01/paper_disass_jumps.svg)

## Step 4: Branch the code into chunks

- Here is the plan, divide the code based on jumps.
	- `prologue` is related to setting up stack for the `main`, not related.
	- `S1` code until our first `jmp`
	- `S2` after we jump from `S1`, it has a `jle` which branches to 2 other blocks
	- `S3` when condition on `S2` is true, note that it also has code which is repeated.
	- The next instruction after `S3` is in `S2`
	- When the condition in `S2` fails, it jumps to `epilogue` which is the last part.

![code blocks](file:///home/booterror/Development/Contributing/segfault/0x01/paper_disass_blocks.svg)

## Step 5: Convert group of instructions to possible C code.

This is interesting because I want you to think in C. Consider this as game, I tell you some facts, you tell me the corresponding C code.

Let's play!

1. Takes a constant and puts it in a variable?
   
	`a = 0`
	
2. Takes arguments and then calls a function.

	`printf("hello, world");`

3. Increments a variable by a certain amount
	
	` a += b` or `a += 1`

4. Divides a nummber with another and stores it at the same place. basically dividing itself.

	`a =/ b`

![decompiled](file:///home/booterror/Development/Contributing/segfault/0x01/paper_disass_decompile.svg)

## Step 6: Lay it out and understand what it does.

Now we have the C code, it should be easy to understand what it does.

~~~~ {#decompiled .c .numberLines startFrom="1"}
int local_1c = 0;
int local_14 = 0;
printf([ebx-0x1870]);
scanf("%d", &local_1c);
while (local_10 <= local_1c) {    
	printf([ebx-0x185b]);    
	scanf("%d", &local_18);    
	local_14 += local_18;    
	local_10 += 1;
}
local_14 /= local_1c;
printf([ebx-0x1844], local_14, local_1c);
~~~~

We can dry run this code to fathom its flow and derieve the algorithm used.

### Observations
- `local_1c` and `local_14` are initialized to 0
- `local_1c` is taken by user input, let's say 3 (`local_1c = 3`)
- `local_10` is compared with `local_1c` in the `while` loop.
	- `local_18` is taken by user input, let's' say 2 (`local_18 = 2`)
	- `local_14` is incremented by `local_18`, i.e (`local_14 = 0 + 2`)
	- `local_10` is incremented by 1, (`local_10 = 1`)
- The loop is broken when `local_10 = 4`
- `local_14` is divded by `local_1c` which was taken at the beginning, which infact is no of times the while loop ran.
- The values in `local_14` and `local_1c` is displayed

To conclude, its doing sum of numbers and dividing by no of times the loop ran, hence its computing **average of numbers**.
