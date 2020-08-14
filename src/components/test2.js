const x = {
  id: "main",
  hwMeta: { name: "main", maxId: 200 },
  properties: {
    "org.eclipse.elk.portConstraints": "FIXED_ORDER",
    "org.eclipse.elk.randomSeed": 0,
    "org.eclipse.elk.layered.mergeEdges": 1
  },
  hideChildren: false,
  ports: [],
  children: [
    {
      id: "main.A.gate",
      hwMeta: { maxId: 250, name: "A", isExternalPort: true },
      properties: {
        "org.eclipse.elk.portConstraints": "FIXED_ORDER",
        "org.eclipse.elk.randomSeed": 0,
        "org.eclipse.elk.layered.mergeEdges": 1
      },
      hideChildren: true,
      ports: [
        {
          id: "main.A",
          hwMeta: { name: "A" },
          direction: "OUTPUT",
          properties: { portSide: "EAST", portIndex: 0 }
        }
      ]
    },
    {
      id: "main.E.gate",
      hwMeta: { maxId: 251, name: "E", isExternalPort: true },
      properties: {
        "org.eclipse.elk.portConstraints": "FIXED_ORDER",
        "org.eclipse.elk.randomSeed": 0,
        "org.eclipse.elk.layered.mergeEdges": 1
      },
      hideChildren: true,
      ports: [
        {
          id: "main.E",
          hwMeta: { name: "E" },
          direction: "OUTPUT",
          properties: { portSide: "EAST", portIndex: 0 }
        }
      ]
    },
    {
      id: "main.clock.gate",
      hwMeta: { maxId: 252, name: "clock", isExternalPort: true },
      properties: {
        "org.eclipse.elk.portConstraints": "FIXED_ORDER",
        "org.eclipse.elk.randomSeed": 0,
        "org.eclipse.elk.layered.mergeEdges": 1
      },
      hideChildren: true,
      ports: [
        {
          id: "main.clock",
          hwMeta: { name: "clock" },
          direction: "OUTPUT",
          properties: { portSide: "EAST", portIndex: 0 }
        }
      ]
    },
    {
      id: "main.q1.gate",
      hwMeta: { maxId: 253, name: "q1", isExternalPort: true },
      properties: {
        "org.eclipse.elk.portConstraints": "FIXED_ORDER",
        "org.eclipse.elk.randomSeed": 0,
        "org.eclipse.elk.layered.mergeEdges": 1
      },
      hideChildren: true,
      ports: [
        {
          id: "main.q1_input_0",
          hwMeta: { name: "q1" },
          direction: "INPUT",
          properties: { portSide: "WEST", portIndex: 0 }
        }
      ]
    },
    {
      id: "main.dffe",
      hwMeta: { name: "main.dffe", maxID: 300 },
      properties: {
        "org.eclipse.elk.portConstraints": "FIXED_ORDER",
        "org.eclipse.elk.randomSeed": 0,
        "org.eclipse.elk.layered.mergeEdges": 1
      },
      hideChildren: false,
      ports: [
        {
          id: "main.dffe.q2",
          hwMeta: { name: "q2" },
          direction: "OUTPUT",
          properties: { portSide: "EAST", portIndex: 0 }
        },
        {
          id: "main.dffe.clk",
          hwMeta: { name: "clk", level: 0 },
          direction: "INPUT",
          properties: { portSide: "WEST", portIndex: 1 }
        },
        {
          id: "main.dffe.dIn",
          hwMeta: { name: "dIn", level: 0 },
          direction: "INPUT",
          properties: { portSide: "WEST", portIndex: 2 }
        },
        {
          id: "main.dffe.dEnable",
          hwMeta: { name: "dEnable", level: 0 },
          direction: "INPUT",
          properties: { portSide: "WEST", portIndex: 3 }
        }
      ],
      children: [
        {
          id: "main.dffe.gatedClk.gate",
          hwMeta: { maxId: null, name: "AND", isExternalPort: false },
          properties: {
            "org.eclipse.elk.portConstraints": "FIXED_ORDER",
            "org.eclipse.elk.randomSeed": 0,
            "org.eclipse.elk.layered.mergeEdges": 1
          },
          hideChildren: true,
          ports: [
            {
              id: "main.dffe.gatedClk",
              hwMeta: { name: "gatedClk" },
              direction: "OUTPUT",
              properties: { portSide: "EAST", portIndex: 0 }
            },
            {
              id: "main.dffe.gatedClk_input_0",
              hwMeta: { name: "gatedClk" },
              direction: "INPUT",
              properties: { portSide: "WEST", portIndex: 1 }
            },
            {
              id: "main.dffe.gatedClk_input_1",
              hwMeta: { name: "gatedClk" },
              direction: "INPUT",
              properties: { portSide: "WEST", portIndex: 2 }
            }
          ]
        },
        {
          id: "main.dffe.dff",
          hwMeta: { name: "main.dffe.dff", maxID: null },
          properties: {
            "org.eclipse.elk.portConstraints": "FIXED_ORDER",
            "org.eclipse.elk.randomSeed": 0,
            "org.eclipse.elk.layered.mergeEdges": 1
          },
          hideChildren: false,
          ports: [
            {
              id: "main.dffe.dff.q3",
              hwMeta: { name: "q3" },
              direction: "OUTPUT",
              properties: { portSide: "EAST", portIndex: 0 }
            },
            {
              id: "main.dffe.dff.clk",
              hwMeta: { name: "clk", level: 0 },
              direction: "INPUT",
              properties: { portSide: "WEST", portIndex: 1 }
            },
            {
              id: "main.dffe.dff.dIn",
              hwMeta: { name: "dIn", level: 0 },
              direction: "INPUT",
              properties: { portSide: "WEST", portIndex: 2 }
            }
          ],
          children: [
            {
              id: "main.dffe.dff.not_d_in.gate",
              hwMeta: { maxId: null, name: "NOT", isExternalPort: false },
              properties: {
                "org.eclipse.elk.portConstraints": "FIXED_ORDER",
                "org.eclipse.elk.randomSeed": 0,
                "org.eclipse.elk.layered.mergeEdges": 1
              },
              hideChildren: true,
              ports: [
                {
                  id: "main.dffe.dff.not_d_in",
                  hwMeta: { name: "not_d_in" },
                  direction: "OUTPUT",
                  properties: { portSide: "EAST", portIndex: 0 }
                },
                {
                  id: "main.dffe.dff.not_d_in_input_0",
                  hwMeta: { name: "not_d_in" },
                  direction: "INPUT",
                  properties: { portSide: "WEST", portIndex: 0 }
                }
              ]
            },
            {
              id: "main.dffe.dff.d_nand_a.gate",
              hwMeta: { maxId: null, name: "NAND", isExternalPort: false },
              properties: {
                "org.eclipse.elk.portConstraints": "FIXED_ORDER",
                "org.eclipse.elk.randomSeed": 0,
                "org.eclipse.elk.layered.mergeEdges": 1
              },
              hideChildren: true,
              ports: [
                {
                  id: "main.dffe.dff.d_nand_a",
                  hwMeta: { name: "d_nand_a" },
                  direction: "OUTPUT",
                  properties: { portSide: "EAST", portIndex: 0 }
                },
                {
                  id: "main.dffe.dff.d_nand_a_input_0",
                  hwMeta: { name: "d_nand_a" },
                  direction: "INPUT",
                  properties: { portSide: "WEST", portIndex: 1 }
                },
                {
                  id: "main.dffe.dff.d_nand_a_input_1",
                  hwMeta: { name: "d_nand_a" },
                  direction: "INPUT",
                  properties: { portSide: "WEST", portIndex: 2 }
                }
              ]
            },
            {
              id: "main.dffe.dff.q3!.gate",
              hwMeta: { maxId: null, name: "NAND", isExternalPort: false },
              properties: {
                "org.eclipse.elk.portConstraints": "FIXED_ORDER",
                "org.eclipse.elk.randomSeed": 0,
                "org.eclipse.elk.layered.mergeEdges": 1
              },
              hideChildren: true,
              ports: [
                {
                  id: "main.dffe.dff.q3!",
                  hwMeta: { name: "q3!" },
                  direction: "OUTPUT",
                  properties: { portSide: "EAST", portIndex: 0 }
                },
                {
                  id: "main.dffe.dff.q3!_input_0",
                  hwMeta: { name: "q3!" },
                  direction: "INPUT",
                  properties: { portSide: "WEST", portIndex: 1 }
                },
                {
                  id: "main.dffe.dff.q3!_input_1",
                  hwMeta: { name: "q3!" },
                  direction: "INPUT",
                  properties: { portSide: "WEST", portIndex: 2 }
                }
              ]
            },
            {
              id: "main.dffe.dff.d_nand_c.gate",
              hwMeta: { maxId: null, name: "NAND", isExternalPort: false },
              properties: {
                "org.eclipse.elk.portConstraints": "FIXED_ORDER",
                "org.eclipse.elk.randomSeed": 0,
                "org.eclipse.elk.layered.mergeEdges": 1
              },
              hideChildren: true,
              ports: [
                {
                  id: "main.dffe.dff.d_nand_c",
                  hwMeta: { name: "d_nand_c" },
                  direction: "OUTPUT",
                  properties: { portSide: "EAST", portIndex: 0 }
                },
                {
                  id: "main.dffe.dff.d_nand_c_input_0",
                  hwMeta: { name: "d_nand_c" },
                  direction: "INPUT",
                  properties: { portSide: "WEST", portIndex: 1 }
                },
                {
                  id: "main.dffe.dff.d_nand_c_input_1",
                  hwMeta: { name: "d_nand_c" },
                  direction: "INPUT",
                  properties: { portSide: "WEST", portIndex: 2 }
                }
              ]
            },
            {
              id: "main.dffe.dff.q_.gate",
              hwMeta: { maxId: null, name: "NAND", isExternalPort: false },
              properties: {
                "org.eclipse.elk.portConstraints": "FIXED_ORDER",
                "org.eclipse.elk.randomSeed": 0,
                "org.eclipse.elk.layered.mergeEdges": 1
              },
              hideChildren: true,
              ports: [
                {
                  id: "main.dffe.dff.q_",
                  hwMeta: { name: "q_" },
                  direction: "OUTPUT",
                  properties: { portSide: "EAST", portIndex: 0 }
                },
                {
                  id: "main.dffe.dff.q__input_0",
                  hwMeta: { name: "q_" },
                  direction: "INPUT",
                  properties: { portSide: "WEST", portIndex: 1 }
                },
                {
                  id: "main.dffe.dff.q__input_1",
                  hwMeta: { name: "q_" },
                  direction: "INPUT",
                  properties: { portSide: "WEST", portIndex: 2 }
                }
              ]
            }
          ],
          edges: [
            {
              id: "main.dffe.dff.q3_main.dffe.dff.q3!",
              source: "main.dffe.dff.q3!.gate",
              sourcePort: "main.dffe.dff.q3!",
              target: "main.dffe.dff",
              targetPort: "main.dffe.dff.q3",
              hwMeta: { name: null }
            },
            {
              id: "main.dffe.dff.dIn : main.dffe.dff.not_d_in_input_0",
              source: "main.dffe.dff",
              sourcePort: "main.dffe.dff.dIn",
              target: "main.dffe.dff.not_d_in.gate",
              targetPort: "main.dffe.dff.not_d_in_input_0",
              hwMeta: { name: null }
            },
            {
              id: "main.dffe.dff.dIn : main.dffe.dff.d_nand_a_input_0",
              source: "main.dffe.dff",
              sourcePort: "main.dffe.dff.dIn",
              target: "main.dffe.dff.d_nand_a.gate",
              targetPort: "main.dffe.dff.d_nand_a_input_0",
              hwMeta: { name: null }
            },
            {
              id: "main.dffe.dff.clk : main.dffe.dff.d_nand_a_input_1",
              source: "main.dffe.dff",
              sourcePort: "main.dffe.dff.clk",
              target: "main.dffe.dff.d_nand_a.gate",
              targetPort: "main.dffe.dff.d_nand_a_input_1",
              hwMeta: { name: null }
            },
            {
              id: "main.dffe.dff.d_nand_a : main.dffe.dff.q3!_input_0",
              source: "main.dffe.dff.d_nand_a.gate",
              sourcePort: "main.dffe.dff.d_nand_a",
              target: "main.dffe.dff.q3!.gate",
              targetPort: "main.dffe.dff.q3!_input_0",
              hwMeta: { name: null }
            },
            {
              id: "main.dffe.dff.q_ : main.dffe.dff.q3!_input_1",
              source: "main.dffe.dff.q_.gate",
              sourcePort: "main.dffe.dff.q_",
              target: "main.dffe.dff.q3!.gate",
              targetPort: "main.dffe.dff.q3!_input_1",
              hwMeta: { name: null }
            },
            {
              id: "main.dffe.dff.not_d_in : main.dffe.dff.d_nand_c_input_0",
              source: "main.dffe.dff.not_d_in.gate",
              sourcePort: "main.dffe.dff.not_d_in",
              target: "main.dffe.dff.d_nand_c.gate",
              targetPort: "main.dffe.dff.d_nand_c_input_0",
              hwMeta: { name: null }
            },
            {
              id: "main.dffe.dff.clk : main.dffe.dff.d_nand_c_input_1",
              source: "main.dffe.dff",
              sourcePort: "main.dffe.dff.clk",
              target: "main.dffe.dff.d_nand_c.gate",
              targetPort: "main.dffe.dff.d_nand_c_input_1",
              hwMeta: { name: null }
            },
            {
              id: "main.dffe.dff.d_nand_c : main.dffe.dff.q__input_0",
              source: "main.dffe.dff.d_nand_c.gate",
              sourcePort: "main.dffe.dff.d_nand_c",
              target: "main.dffe.dff.q_.gate",
              targetPort: "main.dffe.dff.q__input_0",
              hwMeta: { name: null }
            },
            {
              id: "main.dffe.dff.q3! : main.dffe.dff.q__input_1",
              source: "main.dffe.dff.q3!.gate",
              sourcePort: "main.dffe.dff.q3!",
              target: "main.dffe.dff.q_.gate",
              targetPort: "main.dffe.dff.q__input_1",
              hwMeta: { name: null }
            }
          ]
        }
      ],
      edges: [
        {
          id: "main.dffe.q2_main.dffe.dff.q3",
          source: "main.dffe.dff.q3.gate",
          sourcePort: "main.dffe.dff.q3",
          target: "main.dffe",
          targetPort: "main.dffe.q2",
          hwMeta: { name: null }
        },
        {
          id: "main.dffe.clk : main.dffe.gatedClk_input_0",
          source: "main.dffe",
          sourcePort: "main.dffe.clk",
          target: "main.dffe.gatedClk.gate",
          targetPort: "main.dffe.gatedClk_input_0",
          hwMeta: { name: null }
        },
        {
          id: "main.dffe.dEnable : main.dffe.gatedClk_input_1",
          source: "main.dffe",
          sourcePort: "main.dffe.dEnable",
          target: "main.dffe.gatedClk.gate",
          targetPort: "main.dffe.gatedClk_input_1",
          hwMeta: { name: null }
        },
        {
          id: "main.dffe.gatedClk_main.dffe.dff.clk",
          hwMeta: { name: null },
          source: "main.dffe.gatedClk.gate",
          sourcePort: "main.dffe.gatedClk",
          target: "main.dffe.dff",
          targetPort: "main.dffe.dff.clk"
        },
        {
          id: "main.dffe.dIn_main.dffe.dff.dIn",
          hwMeta: { name: null },
          source: "main.dffe",
          sourcePort: "main.dffe.dIn",
          target: "main.dffe.dff",
          targetPort: "main.dffe.dff.dIn"
        }
      ]
    }
  ],
  edges: [
    {
      id: "main.dffe.q2 : main.q1_input_0",
      source: "main.dffe",
      sourcePort: "main.dffe.q2",
      target: "main.q1.gate",
      targetPort: "main.q1_input_0",
      hwMeta: { name: null }
    },
    {
      id: "main.clock_main.dffe.clk",
      hwMeta: { name: null },
      source: "main.clock.gate",
      sourcePort: "main.clock",
      target: "main.dffe",
      targetPort: "main.dffe.clk"
    },
    {
      id: "main.A_main.dffe.dIn",
      hwMeta: { name: null },
      source: "main.A.gate",
      sourcePort: "main.A",
      target: "main.dffe",
      targetPort: "main.dffe.dIn"
    },
    {
      id: "main.E_main.dffe.dEnable",
      hwMeta: { name: null },
      source: "main.E.gate",
      sourcePort: "main.E",
      target: "main.dffe",
      targetPort: "main.dffe.dEnable"
    }
  ]
};
