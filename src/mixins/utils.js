export default {
  methods: {
    stripReactive: x => JSON.parse(JSON.stringify(x)),
    log: x => console.log(stripReactive(x)),
    getLocalId: x => x.substr(x.lastIndexOf("_") + 1),
    getNamespace: x => x.substr(0, x.lastIndexOf("_"))
  }
};
