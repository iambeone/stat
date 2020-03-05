<template>
  <div class="hello">
    <h1>Lunie statistics</h1>
    <select @change="changeNetwork">
      <option v-for="(network, index) in networks" :key="`step-${index}`">{{ network }}</option>
    </select>
    <div class="group">
      <div class="block">
        <h2>Address count</h2>
        {{totalCount}}
      </div>
    </div>
    <div class="group">
      <div class="block">
        <h2>Total stake</h2>
        {{totalStake}}
      </div>
      <div class="block">
        <h2>Liquid stake</h2>
        {{liquidStake}}
      </div>
      <div class="block">
        <h2>Total rewards</h2>
        {{totalRewards}}
      </div>
    </div>
    <div class="group">
      <div class="block">
        <h2>Send</h2>
        {{send}}
      </div>
      <div class="block">
        <h2>Delegate</h2>
        {{delegate}}
      </div>
      <div class="block">
        <h2>Undelegate</h2>
        {{undeligate}}
      </div>
    </div>
  </div>
</template>

<script>
import { graphQLQuery } from "../helpers"
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  data: () => ({
    selectedNetwork: false,
    networks: [],
    totalStake: 0,
    liquidStake: 0,
    totalRewards: 0,
    totalCount: 0,
    send: 0,
    delegate: 0,
    undeligate: 0
  }),
  mounted(){
    this.getNetworks().then(async () => {
      // load other elements
      await this.loadData()
    })
  },
  methods: {
    async changeNetwork(e){
      this.selectedNetwork = e.target.value
      await this.loadData()
    },
    async loadData() {
      let stake = await this.getTotalByAction('totalStake')
      this.totalStake = stake.sum.value
      this.totalCount = stake.count

      stake = await this.getTotalByAction('liquidStake')
      this.liquidStake = stake.sum.value

      stake = await this.getTotalByAction('totalRewards')
      this.totalRewards = stake.sum.value

      stake = await this.getTotalByAction('Send')
      this.send = stake.sum.value / 1000000

      stake = await this.getTotalByAction('Delegate')
      this.delegate = stake.sum.value / 1000000

      stake = await this.getTotalByAction('Undelegate')
      this.undeligate = stake.sum.value / 1000000
    },
    async getNetworks() {
      const { data } = await graphQLQuery(`{
        statistics(distinct_on: network) {
          network
        }
      }`)
      this.networks = data.statistics.map(st => st.network)
      if(this.networks.length){
        this.selectedNetwork = this.networks[0]
      }
    },
    async getTotalByAction(action) {
      const { data } = await graphQLQuery(`{
        statistics_aggregate(distinct_on: address, where: {_and: {value: {}, network: {_eq: "${this.selectedNetwork}"}, action: {_eq: "${action}"}}}) {
          aggregate {
            count(distinct: true, columns: address)
            sum {
              value
            }
            avg {
              value
            }
            max {
              value
            }
          }
        }
      }`)
      return data.statistics_aggregate.aggregate
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
.group{
  display: flex;
  max-width: 600px;
  margin: 0 auto 20px;
  justify-content: space-between;
}
.block{
  text-align: center;
  width: 160px;
}
</style>
