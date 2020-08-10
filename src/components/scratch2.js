const netlist = {
  id: "main",
  hwMeta: { name: "main", maxId: 200 },
  properties: {
    "org.eclipse.elk.portConstraints": "FREE",
    "org.eclipse.elk.hierarchyHandling": "INCLUDE_CHILDREN"
  },
  hideChildren: false,
  ports: [],
  children: [
    {
      id: "main.a.gate",
      hwMeta: { name: "main.a" },
      properties: {},
      hideChildren: true,
      ports: [
        {
          id: "main.a",
          hwMeta: { name: null },
          direction: "OUTPUT",
          properties: { portSide: "EAST" }
        }
      ]
    },
    {
      id: "main.b.gate",
      hwMeta: { name: "main.b" },
      properties: {},
      hideChildren: true,
      ports: [
        {
          id: "main.b",
          hwMeta: { name: null },
          direction: "OUTPUT",
          properties: { portSide: "EAST" }
        }
      ]
    },
    {
      id: "main.cin.gate",
      hwMeta: { name: "main.cin" },
      properties: {},
      hideChildren: true,
      ports: [
        {
          id: "main.cin",
          hwMeta: { name: null },
          direction: "OUTPUT",
          properties: { portSide: "EAST" }
        }
      ]
    },
    {
      id: "main.sum.gate",
      hwMeta: { name: "main.sum" },
      properties: {},
      hideChildren: true,
      ports: [
        {
          id: "main.sum_input_0",
          hwMeta: { name: null },
          direction: "INPUT",
          properties: { portSide: "WEST" }
        },
        {
          id: "main.sum",
          hwMeta: { name: null },
          direction: "OUTPUT",
          properties: { portSide: "EAST" }
        }
      ]
    },
    {
      id: "main.cout.gate",
      hwMeta: { name: "main.cout" },
      properties: {},
      hideChildren: true,
      ports: [
        {
          id: "main.cout_input_0",
          hwMeta: { name: null },
          direction: "INPUT",
          properties: { portSide: "WEST" }
        },
        {
          id: "main.cout",
          hwMeta: { name: null },
          direction: "OUTPUT",
          properties: { portSide: "EAST" }
        }
      ]
    },
    {
      id: "main.uut",
      hwMeta: { name: "main.uut", maxID: 300 },
      properties: {
        "org.eclipse.elk.portConstraints": "FREE",
        "org.eclipse.elk.hierarchyHandling": "INCLUDE_CHILDREN"
      },
      hideChildren: false,
      ports: [
        {
          id: "main.uut.a",
          hwMeta: { name: "a" },
          direction: "INPUT",
          properties: { portSide: "WEST" }
        },
        {
          id: "main.uut.b",
          hwMeta: { name: "b" },
          direction: "INPUT",
          properties: { portSide: "WEST" }
        },
        {
          id: "main.uut.cin",
          hwMeta: { name: "cin" },
          direction: "INPUT",
          properties: { portSide: "WEST" }
        },
        {
          id: "main.uut.s",
          hwMeta: { name: "s" },
          direction: "OUTPUT",
          properties: { portSide: "EAST" }
        },
        {
          id: "main.uut.cout",
          hwMeta: { name: "cout" },
          direction: "OUTPUT",
          properties: { portSide: "EAST" }
        }
      ],
      children: [
        {
          id: "main.uut.w1.gate",
          hwMeta: { name: "AND" },
          properties: {},
          hideChildren: true,
          ports: [
            {
              id: "main.uut.w1_input_0",
              hwMeta: { name: null },
              direction: "INPUT",
              properties: { portSide: "WEST" }
            },
            {
              id: "main.uut.w1_input_1",
              hwMeta: { name: null },
              direction: "INPUT",
              properties: { portSide: "WEST" }
            },
            {
              id: "main.uut.w1",
              hwMeta: { name: null },
              direction: "OUTPUT",
              properties: { portSide: "EAST" }
            }
          ]
        },
        {
          id: "main.uut.w2.gate",
          hwMeta: { name: "AND" },
          properties: {},
          hideChildren: true,
          ports: [
            {
              id: "main.uut.w2_input_0",
              hwMeta: { name: null },
              direction: "INPUT",
              properties: { portSide: "WEST" }
            },
            {
              id: "main.uut.w2_input_1",
              hwMeta: { name: null },
              direction: "INPUT",
              properties: { portSide: "WEST" }
            },
            {
              id: "main.uut.w2",
              hwMeta: { name: null },
              direction: "OUTPUT",
              properties: { portSide: "EAST" }
            }
          ]
        },
        {
          id: "main.uut.w3.gate",
          hwMeta: { name: "AND" },
          properties: {},
          hideChildren: true,
          ports: [
            {
              id: "main.uut.w3_input_0",
              hwMeta: { name: null },
              direction: "INPUT",
              properties: { portSide: "WEST" }
            },
            {
              id: "main.uut.w3_input_1",
              hwMeta: { name: null },
              direction: "INPUT",
              properties: { portSide: "WEST" }
            },
            {
              id: "main.uut.w3",
              hwMeta: { name: null },
              direction: "OUTPUT",
              properties: { portSide: "EAST" }
            }
          ]
        },
        {
          id: "main.uut.cout!.gate",
          hwMeta: { name: "OR" },
          properties: {},
          hideChildren: true,
          ports: [
            {
              id: "main.uut.cout!_input_0",
              hwMeta: { name: null },
              direction: "INPUT",
              properties: { portSide: "WEST" }
            },
            {
              id: "main.uut.cout!_input_1",
              hwMeta: { name: null },
              direction: "INPUT",
              properties: { portSide: "WEST" }
            },
            {
              id: "main.uut.cout!_input_2",
              hwMeta: { name: null },
              direction: "INPUT",
              properties: { portSide: "WEST" }
            },
            {
              id: "main.uut.cout!",
              hwMeta: { name: null },
              direction: "OUTPUT",
              properties: { portSide: "EAST" }
            }
          ]
        },
        {
          id: "main.uut.s!.gate",
          hwMeta: { name: "XOR" },
          properties: {},
          hideChildren: true,
          ports: [
            {
              id: "main.uut.s!_input_0",
              hwMeta: { name: null },
              direction: "INPUT",
              properties: { portSide: "WEST" }
            },
            {
              id: "main.uut.s!_input_1",
              hwMeta: { name: null },
              direction: "INPUT",
              properties: { portSide: "WEST" }
            },
            {
              id: "main.uut.s!_input_2",
              hwMeta: { name: null },
              direction: "INPUT",
              properties: { portSide: "WEST" }
            },
            {
              id: "main.uut.s!",
              hwMeta: { name: null },
              direction: "OUTPUT",
              properties: { portSide: "EAST" }
            }
          ]
        }
      ],
      edges: [
        {
          id: "main.a_main.uut.a",
          hwMeta: { name: null },
          source: "main.a.gate",
          sourcePort: "main.a",
          target: "main.uut",
          targetPort: "main.uut.a"
        },
        {
          id: "main.b_main.uut.b",
          hwMeta: { name: null },
          source: "main.b.gate",
          sourcePort: "main.b",
          target: "main.uut",
          targetPort: "main.uut.b"
        },
        {
          id: "main.cin_main.uut.cin",
          hwMeta: { name: null },
          source: "main.cin.gate",
          sourcePort: "main.cin",
          target: "main.uut",
          targetPort: "main.uut.cin"
        },
        {
          id: "main.uut.s_main.uut.s!",
          source: "main.uut.s!.gate",
          sourcePort: "main.uut.s!",
          target: "main.uut",
          targetPort: "main.uut.s",
          hwMeta: { name: null }
        },
        {
          id: "main.uut.cout_main.uut.cout!",
          source: "main.uut.cout!.gate",
          sourcePort: "main.uut.cout!",
          target: "main.uut",
          targetPort: "main.uut.cout",
          hwMeta: { name: null }
        },
        {
          id: "main.uut.a : main.uut.w1_input_0",
          source: "main.uut.a.gate",
          sourcePort: "main.uut.a",
          target: "main.uut.w1.gate",
          targetPort: "main.uut.w1_input_0",
          hwMeta: { name: null }
        },
        {
          id: "main.uut.b : main.uut.w1_input_1",
          source: "main.uut.b.gate",
          sourcePort: "main.uut.b",
          target: "main.uut.w1.gate",
          targetPort: "main.uut.w1_input_1",
          hwMeta: { name: null }
        },
        {
          id: "main.uut.a : main.uut.w2_input_0",
          source: "main.uut.a.gate",
          sourcePort: "main.uut.a",
          target: "main.uut.w2.gate",
          targetPort: "main.uut.w2_input_0",
          hwMeta: { name: null }
        },
        {
          id: "main.uut.cin : main.uut.w2_input_1",
          source: "main.uut.cin.gate",
          sourcePort: "main.uut.cin",
          target: "main.uut.w2.gate",
          targetPort: "main.uut.w2_input_1",
          hwMeta: { name: null }
        },
        {
          id: "main.uut.b : main.uut.w3_input_0",
          source: "main.uut.b.gate",
          sourcePort: "main.uut.b",
          target: "main.uut.w3.gate",
          targetPort: "main.uut.w3_input_0",
          hwMeta: { name: null }
        },
        {
          id: "main.uut.cin : main.uut.w3_input_1",
          source: "main.uut.cin.gate",
          sourcePort: "main.uut.cin",
          target: "main.uut.w3.gate",
          targetPort: "main.uut.w3_input_1",
          hwMeta: { name: null }
        },
        {
          id: "main.uut.w1 : main.uut.cout!_input_0",
          source: "main.uut.w1.gate",
          sourcePort: "main.uut.w1",
          target: "main.uut.cout!.gate",
          targetPort: "main.uut.cout!_input_0",
          hwMeta: { name: null }
        },
        {
          id: "main.uut.w2 : main.uut.cout!_input_1",
          source: "main.uut.w2.gate",
          sourcePort: "main.uut.w2",
          target: "main.uut.cout!.gate",
          targetPort: "main.uut.cout!_input_1",
          hwMeta: { name: null }
        },
        {
          id: "main.uut.w3 : main.uut.cout!_input_2",
          source: "main.uut.w3.gate",
          sourcePort: "main.uut.w3",
          target: "main.uut.cout!.gate",
          targetPort: "main.uut.cout!_input_2",
          hwMeta: { name: null }
        },
        {
          id: "main.uut.a : main.uut.s!_input_0",
          source: "main.uut.a.gate",
          sourcePort: "main.uut.a",
          target: "main.uut.s!.gate",
          targetPort: "main.uut.s!_input_0",
          hwMeta: { name: null }
        },
        {
          id: "main.uut.b : main.uut.s!_input_1",
          source: "main.uut.b.gate",
          sourcePort: "main.uut.b",
          target: "main.uut.s!.gate",
          targetPort: "main.uut.s!_input_1",
          hwMeta: { name: null }
        },
        {
          id: "main.uut.cin : main.uut.s!_input_2",
          source: "main.uut.cin.gate",
          sourcePort: "main.uut.cin",
          target: "main.uut.s!.gate",
          targetPort: "main.uut.s!_input_2",
          hwMeta: { name: null }
        }
      ]
    }
  ],
  edges: [
    {
      id: "main.uut.s : main.sum_input_0",
      source: "main.uut.s.gate",
      sourcePort: "main.uut.s",
      target: "main.sum.gate",
      targetPort: "main.sum_input_0",
      hwMeta: { name: null }
    },
    {
      id: "main.uut.cout : main.cout_input_0",
      source: "main.uut.cout.gate",
      sourcePort: "main.uut.cout",
      target: "main.cout.gate",
      targetPort: "main.cout_input_0",
      hwMeta: { name: null }
    }
  ]
};
export default netlist;
