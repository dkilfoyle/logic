// template to show basic syntax

module MyModule (
  input a, b,
  output X );

  // gate format: logicFn(id, input1, input2)
  and( X, a, b );

endmodule

module main;
  
  wire user1, user2, o1;

  control(user1);
  control(user2);

  // declare foo as an instance (copy) of MyModule
  // map the input/output parameters of MyModule to the calling namespace
  // .moduleParameter(callingNamespaceVariable)
  MyModule foo(
		.a(user1),
		.b(user2),
		.X(o1)
  );

  // foo needs something to wire it's outputs to in main
  response(o1);

  // main module should have a testbench to set control states
  // format: #time {controlVar=val,...}
  test begin
    #0  {user1=0, user2=0};
    #2  {user1=0, user2=1};
    #4  {user1=1, user2=0};
    #6  {user1=1, user2=1};
    #8;
  end
endmodule