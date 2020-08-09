const netlist = {
  id: "main",
  hwMeta: {
    name: "main",
    maxId: 20
  },
  properties: {},
  hideChildren: false,
  ports: [],
  children: [
    {
      id: "main_controls",
      hwMeta: { name: "main_controls" },
      properties: {},
      hideChildren: false,
      ports: [
        {
          id: "main.dIn",
          hwMeta: { name: "dIn" },
          direction: "OUTPUT",
          properties: { portSide: "EAST" }
        },
        {
          id: "main.clk",
          hwMeta: { name: "clk" },
          direction: "OUTPUT",
          properties: { portSide: "EAST" }
        }
      ]
    },
    {
      id: "main_outputs",
      hwMeta: { name: "main_outputs" },
      properties: {},
      hideChildren: false,
      ports: [
        {
          id: "main.q",
          hwMeta: { name: "q" },
          direction: "INPUT",
          properties: { portSide: "WEST" }
        }
      ]
    },
    {
      id: "dff1",
      hwMeta: {
        name: "dff1",
        maxId: 17
      },
      properties: {},
      hideChildren: false,
      ports: [
        {
          id: "dff1.q",
          hwMeta: { name: "q" },
          direction: "OUTPUT",
          properties: { portSide: "EAST" }
        },
        {
          id: "dff1.dIn",
          hwMeta: { name: "dIn" },
          direction: "INPUT",
          properties: { portSide: "WEST" }
        },
        {
          id: "dff1.clk",
          hwMeta: { name: "clk" },
          direction: "INPUT",
          properties: { portSide: "WEST" }
        }
      ],
      children: [
        {
          id: "dff1.and1",
          hwMeta: { name: "AND", maxId: 14 },
          properties: {},
          hideChildren: true,
          ports: [
            {
              id: "dff1.and1.output",
              hwMeta: { name: null },
              direction: "OUTPUT",
              properties: { portSide: "EAST" }
            },
            {
              id: "dff1.and1.input0",
              hwMeta: { name: null },
              direction: "INPUT",
              properties: { portSide: "WEST" }
            },
            {
              id: "dff1.and1.input1",
              hwMeta: { name: null },
              direction: "INPUT",
              properties: { portSide: "WEST" }
            }
          ]
        }
      ],
      edges: [
        {
          source: "dff1.and1",
          sourcePort: "dff1.and1.output",
          target: "dff1",
          targetPort: "dff1.q",
          id: "15",
          hwMeta: { name: null }
        },
        {
          source: "dff1",
          sourcePort: "dff1.dIn",
          target: "dff1.and1",
          targetPort: "dff1.and1.input0",
          id: "16",
          hwMeta: { name: null }
        },
        {
          source: "dff1",
          sourcePort: "dff1.clk",
          target: "dff1.and1",
          targetPort: "dff1.and1.input1",
          id: "17",
          hwMeta: { name: null }
        }
        // {
        //   source: "main",
        //   sourcePort: "main.dIn",
        //   target: "dff1",
        //   targetPort: "dff1.dIn",
        //   id: "132",
        //   hwMeta: { name: null }
        // }
      ]
    }
  ],
  edges: [
    {
      source: "main_controls",
      sourcePort: "main.dIn",
      target: "dff1",
      targetPort: "dff1.dIn",
      id: "132",
      hwMeta: { name: null }
    },
    {
      source: "main_controls",
      sourcePort: "main.clk",
      target: "dff1",
      targetPort: "dff1.clk",
      id: "133",
      hwMeta: { name: null }
    },
    {
      source: "dff1",
      sourcePort: "dff1.q",
      target: "main_outputs",
      targetPort: "main.q",
      id: "134",
      hwMeta: { name: null }
    }
  ]
};
export default netlist;
