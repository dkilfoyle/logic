// template to show basic syntax

module MyModule (
  input a, b,
  output X, Y );

  // gate format: logicFn(id, input1, input2)
  and( X, a, b );
  or(  Y, a, b );

  // alternative bitwise format
  // assign X = a & b;
  // assign Y = A | b;
endmodule

module main; // main has no inputs or outputs, instead control and response wires

  // wires act as local variables/gates
  wire user1, user2; // control gates
  wire o1, o2; // response gates

  // control is an external button/sensor
  // control state is set in the testbench
  // only module main can have control wires
  control(user1);
  control(user2);

  // declare foo as an instance (copy) of MyModule
  // map the input/output parameters of MyModule to the calling namespace
  // .moduleParameter(callingNamespaceVariable)
  MyModule foo(
		.a(user1),
		.b(user2),
		.X(o1),
		.Y(o2)
  );

  // foo needs something to wire it's outputs to in main
  response(o1);
  response(o2);

  // main module should have a testbench to set control states
  // format: #time {controlVar=val,...}
  test begin
    #0  {user1=0, user2=0};
    #2  {user1=0, user2=1};
    #4  {user1=1, user2=0};
    #6  {user1=1, user2=1};
  end
endmodule