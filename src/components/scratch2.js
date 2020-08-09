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
        {
          id: "main.foo.a",
          hwMeta: { name: "a" },
          direction: "INPUT",
          properties: { portSide: "WEST" }
        },
        {
          id: "main.foo.b",
          hwMeta: { name: "b" },
          direction: "INPUT",
          properties: { portSide: "WEST" }
        },
        {
          id: "main.foo.X_output",
          hwMeta: { name: "X" },
          direction: "OUTPUT",
          properties: { portSide: "EAST" }
        }
      ],
      children: [
        {
          id: "main.foo.X.gate",
          hwMeta: { name: "AND" },
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
              id: "main.foo.X_input_1",
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
        }
      ],
      edges: [
        {
          id: "main.user1 : main.foo.X_input_0",
          source: "main.foo",
          sourcePort: "main.foo.a",
          target: "main.foo.X.gate",
          targetPort: "main.foo.X_input_0",
          hwMeta: { name: null }
        },
        {
          id: "main.user2 : main.foo.X_input_1",
          source: "main.foo",
          sourcePort: "main.foo.b",
          target: "main.foo.X.gate",
          targetPort: "main.foo.X_input_1",
          hwMeta: { name: null }
        },
        {
          id: "main.foo.X_connection",
          hwMeta: { name: null },
          source: "main.foo.X.gate",
          sourcePort: "main.foo.X",
          target: "main.foo",
          targetPort: "main.foo.X_output"
        }
      ]
    }
  ],
  edges: [
    // {
    //   id: "main.foo.X : main.o1_input_0",
    //   source: "main",
    //   target: "main.o1.gate",
    //   targetPort: "main.o1_input_0",
    //   hwMeta: { name: null }
    // }
  ]
};
export default netlist;
