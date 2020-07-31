/* 1 to 2 DeMultiplexer
Sel selects which output to send the input to
sel a | Y Z
 0  0 | 0 0 
 0  1 | 1 0 
 1  0 | 0 0 
 1  1 | 0 1 
 */

module DeMux (
	input sel,
	input a,
	output Y, Z);

	assign Y = ~sel & a;
  assign Z = sel & a;
endmodule

module main(output Y, Z);
  wire clock, sel;

  control(sel);
  control(clock); // "clock" is controlled automatically during test

  DeMux demux(.a(clock), .sel(sel), .Y(Y), .Z(Z));
  buffer(Y);
  buffer(Z);

  test begin
    #01 {sel=0};  
    #010 {sel=1}; 
    #020;
  end
endmodule