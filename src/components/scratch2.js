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
      id: "main.user1.gate",
      hwMeta: { name: "main.user1" },
      properties: {},
      hideChildren: true,
      ports: [
        {
          id: "main.user1",
          hwMeta: { name: null },
          direction: "OUTPUT",
          properties: { portSide: "EAST" }
        }
      ]
    },
    {
      id: "main.user2.gate",
      hwMeta: { name: "main.user2" },
      properties: {},
      hideChildren: true,
      ports: [
        {
          id: "main.user2",
          hwMeta: { name: null },
          direction: "OUTPUT",
          properties: { portSide: "EAST" }
        }
      ]
    },
    {
      id: "main.o1.gate",
      hwMeta: { name: "RESPONSE" },
      properties: {},
      hideChildren: true,
      ports: [
        {
          id: "main.o1_input_0",
          hwMeta: { name: null },
          direction: "INPUT",
          properties: { portSide: "WEST" }
        },
        {
          id: "main.o1",
          hwMeta: { name: null },
          direction: "OUTPUT",
          properties: { portSide: "EAST" }
        }
      ]
    },
    {
      id: "main.foo",
      hwMeta: { name: "main.foo", maxID: 300 },
      properties: {
        "org.eclipse.elk.portConstraints": "FREE",
        "org.eclipse.elk.hierarchyHandling": "INCLUDE_CHILDREN"
      },
      hideChildren: false,
      ports: [
        { hwMeta: {}, direction: "INPUT", properties: { portSide: "WEST" } },
        { hwMeta: {}, direction: "INPUT", properties: { portSide: "WEST" } },
        {
          id: "undefined_output",
          hwMeta: {},
          direction: "OUTPUT",
          properties: { portSide: "EAST" }
        }
      ],
      children: [
        {
          id: "main.foo.a.gate",
          hwMeta: { name: "main.foo.a" },
          properties: {},
          hideChildren: true,
          ports: [
            {
              id: "main.foo.a_input_0",
              hwMeta: { name: null },
              direction: "INPUT",
              properties: { portSide: "WEST" }
            },
            {
              id: "main.foo.a",
              hwMeta: { name: null },
              direction: "OUTPUT",
              properties: { portSide: "EAST" }
            }
          ]
        },
        {
          id: "main.foo.b.gate",
          hwMeta: { name: "main.foo.b" },
          properties: {},
          hideChildren: true,
          ports: [
            {
              id: "main.foo.b_input_0",
              hwMeta: { name: null },
              direction: "INPUT",
              properties: { portSide: "WEST" }
            },
            {
              id: "main.foo.b",
              hwMeta: { name: null },
              direction: "OUTPUT",
              properties: { portSide: "EAST" }
            }
          ]
        },
        {
          id: "main.foo.X.gate",
          hwMeta: { name: "main.foo.X" },
          properties: {},
          hideChildren: true,
          ports: [
            {
              id: "main.foo.X_input_0",
              hwMeta: { name: null },
              direction: "INPUT",
              properties: { portSide: "WEST" }
            },
            {
              id: "main.foo.X",
              hwMeta: { name: null },
              direction: "OUTPUT",
              properties: { portSide: "EAST" }
            }
          ]
        },
        {
          id: "main.foo.X!.gate",
          hwMeta: { name: "AND" },
          properties: {},
          hideChildren: true,
          ports: [
            {
              id: "main.foo.X!_input_0",
              hwMeta: { name: null },
              direction: "INPUT",
              properties: { portSide: "WEST" }
            },
            {
              id: "main.foo.X!_input_1",
              hwMeta: { name: null },
              direction: "INPUT",
              properties: { portSide: "WEST" }
            },
            {
              id: "main.foo.X!",
              hwMeta: { name: null },
              direction: "OUTPUT",
              properties: { portSide: "EAST" }
            }
          ]
        }
      ],
      edges: [
        {
          id: "main.user1 : main.foo.a_input_0",
          source: "main.foo",
          sourcePort: "main.user1",
          target: "main.foo.a.gate",
          targetPort: "main.foo.a_input_0",
          hwMeta: { name: null }
        },
        {
          id: "main.user2 : main.foo.b_input_0",
          source: "main.foo",
          sourcePort: "main.user2",
          target: "main.foo.b.gate",
          targetPort: "main.foo.b_input_0",
          hwMeta: { name: null }
        },
        {
          id: "main.foo.X! : main.foo.X_input_0",
          source: "main.foo",
          sourcePort: "main.foo.X!",
          target: "main.foo.X.gate",
          targetPort: "main.foo.X_input_0",
          hwMeta: { name: null }
        },
        {
          id: "main.foo.a : main.foo.X!_input_0",
          source: "main.foo",
          sourcePort: "main.foo.a",
          target: "main.foo.X!.gate",
          targetPort: "main.foo.X!_input_0",
          hwMeta: { name: null }
        },
        {
          id: "main.foo.b : main.foo.X!_input_1",
          source: "main.foo",
          sourcePort: "main.foo.b",
          target: "main.foo.X!.gate",
          targetPort: "main.foo.X!_input_1",
          hwMeta: { name: null }
        }
      ]
    }
  ],
  edges: [
    {
      id: "main.foo.X : main.o1_input_0",
      source: "main",
      sourcePort: "main.foo.X",
      target: "main.o1.gate",
      targetPort: "main.o1_input_0",
      hwMeta: { name: null }
    }
  ]
};
export default netlist;
