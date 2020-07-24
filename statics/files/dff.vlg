// D Flip Flop

module DFF (
	input clk,
	input dIn,
	output q);

	wire not_d_in, d_nand_a, d_nand_c, q_;

	not( not_d_in, dIn );
	nand( d_nand_a, dIn, clk );
	nand( q, d_nand_a, q_ );
	nand( d_nand_c, not_d_in, clk );
  nand( q_, d_nand_c, q);
endmodule

module DFFE (
  input clk,
  input dIn,
  input dEnable,
  output q);

  wire gatedClk, dInB;
  and( gatedClk, clk, dEnable );
  buffer( dInB, dIn) ;

  DFF dff( .clk(gatedClk), .dIn(dInB), .q(q));

  buffer(q);
endmodule

module main(output q);

  wire A, E, clock;

  control(A);
  control(E);
  control(clock);

  DFFE dffe(.clk(clock), .dIn(A), .dEnable(E), .q(q));

  buffer(q);

  test begin
    #0  { E=1 };
    #1  { A=1, E=0 };
    #7  { E=1 };
    #9  { A=0, E=0 };
    #12;
  end
endmodule