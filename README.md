# Logic Simulator

An IDE for experimentation with Francis Stokes ([Low Level Javascript](https://www.youtube.com/c/LowLevelJavaScript/featured)) [Digital Circuit Simulator]([https://github.com/LowLevelJavaScript/Digital-Logic-Simulator])

## Installation

```bash
npm install
quasar dev
```

## Features

1. Micro-subset verilog-like DSL for coding the array of logic gates (Parsed using [Arcsecond.js](https://github.com/francisrstokes/arcsecond) of course!)
2. CodeMirror-based code editor with automatic linting/error reporting, smart indentation, code folding, hints
3. Visualisation of the generated gate array by hierachical table or a (experimental toy really) dagre graph
4. Testbench simulation with graphical trace output

## DSL

1. Modules define a group of gates (eg a logic chip) and the inputs and outputs (eg the pins) between modules

   ```js
     module MyModule(input A,
                     input B,
                     output Q)
       // gate, wire and instance statements here
     endmodule
   ```

2. Gates define a basic logic function, a unique identifier for this gate, and the inputs to the gate

   ```js
     wire myAndGate;
     and(myAndGate, A, B); // equivalent to myAndGate = A & B
   ```

3. Instances of gates define a namespaced copy of a module and the connections between the parent module and the instance module

   ```js
     MyModule m1(.A(parentVar1), .B(parentVar2), .Q(parentVar3))
   ```

4. All programs must have a "main" module which is automatically instanced and serves as the entry point.

   a) The main module automatically includes a "clock" input.
   b) The inputs to the main module will be external "control" gates eg buttons/sensors

5. The main module should include a testbench section to define the value of the control gates at different time points

   ```js
       test begin
           #00 {a=0, b=0};
           #05 {a=0, b=1};
           #10 {a=1, b=0};
           #15 {a=1, b=1};
       end
   ```

## TODO

1. Support bitwise statements to generate the logic gates (eg Q = (A & B) | ~C
2. Support truth tables to generate optimised logic gates
3. Support bit vectors

## Acknowledgements

1. Francis Stokes (Arcsecond.js, Circuit Simulator)
2. Quasar.dev
3. G6 Graph
