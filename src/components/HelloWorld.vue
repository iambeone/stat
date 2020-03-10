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
        {{totalStake | pretifyNumber}}
      </div>
      <div class="block">
        <h2>Liquid stake</h2>
        {{liquidStake | pretifyNumber}}
      </div>
      <div class="block">
        <h2>Total rewards</h2>
        {{totalRewards | pretifyNumber}}
      </div>
    </div>
    <div class="group">
      <div class="block">
        <h2>Send</h2>
        {{send | pretifyNumber}}
        <span class="delta">{{sendDelta | pretifyNumber}}</span>
      </div>
      <div class="block">
        <h2>Delegate</h2>
        {{delegate | pretifyNumber}}
        <span class="delta">{{delegateDelta | pretifyNumber}}</span>
      </div>
      <div class="block">
        <h2>Undelegate</h2>
        {{undeligate | pretifyNumber}}
        <span class="delta">{{undeligateDelta | pretifyNumber}}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { graphQLQuery } from "../helpers"
import { pretifyNumber } from "../num"
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
    undeligate: 0,
    sendDelta: 0,
    delegateDelta: 0,
    undeligateDelta: 0
  }),
  filters: {
    pretifyNumber
  },
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
      // last week monday
      let date = new Date()
      let prevMonday = new Date(new Date().setDate(date.getDate() - 6 - date.getDay()))
      prevMonday = (prevMonday.getMonth() + 1) + '-' + prevMonday.getDate() + '-' + prevMonday.getFullYear()
      let prevSunday = new Date(new Date().setDate(date.getDate() - date.getDay()))
      prevSunday = (prevSunday.getMonth() + 1) + '-' + prevSunday.getDate() + '-' + prevSunday.getFullYear()
      let thisMonday = new Date(new Date().setDate(date.getDate() + 1 - date.getDay()))
      thisMonday = (thisMonday.getMonth() + 1) + '-' + thisMonday.getDate() + '-' + thisMonday.getFullYear()
      let stake = await this.getTotalByAction('totalStake')
      this.totalStake = stake.sum.value
      this.totalCount = stake.count

      stake = await this.getTotalByAction('liquidStake')
      this.liquidStake = stake.sum.value

      stake = await this.getTotalByAction('totalRewards')
      this.totalRewards = stake.sum.value

      // this week values
      stake = await this.getTotalByAction('send', thisMonday)
      this.send = stake.sum.value / 1000000

      stake = await this.getTotalByAction('Delegate', thisMonday)
      this.delegate = stake.sum.value / 1000000

      stake = await this.getTotalByAction('Undelegate', thisMonday)
      this.undeligate = stake.sum.value / 1000000
      // deltas

      stake = await this.getTotalByAction('send', prevMonday, prevSunday)
      this.sendDelta = this.send - (stake.sum.value / 1000000)

      stake = await this.getTotalByAction('Delegate', prevMonday, prevSunday)
      this.delegateDelta = this.delegate - (stake.sum.value / 1000000)

      stake = await this.getTotalByAction('Undelegate', prevMonday, prevSunday)
      this.undeligateDelta = this.undeligate - (stake.sum.value / 1000000)
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
    async getTotalByAction(action, from = null, to = null) {
      let dateRestriction = ''
      if(from){
        dateRestriction += `added: {_gte: "${from}"}` // data format mm-dd-yyyy
        if(to){
          dateRestriction + `, _and: {added: {_lte: "${to}"}}`
        }
      }else if (to){
        dateRestriction += `added: {_lte: "${to}"}` // data format mm-dd-yyyy
      }
      dateRestriction = dateRestriction ? `, _and: {${dateRestriction}}, ` : ', '
      const { data } = await graphQLQuery(`{
        statistics_aggregate(distinct_on: address, where: {_and: {network: {_eq: "${this.selectedNetwork}"} ${dateRestriction} action: {_eq: "${action}"}}}) {
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
.delta{
  display: block;
  font-size: 14px;
  margin-top: 10px;
}
</style>
