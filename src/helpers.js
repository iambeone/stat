const fetch = require('node-fetch')

const graphQLQuery = ({ hasura_url, hasura_admin_key }) => async query => {
  const data = await fetch(hasura_url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-hasura-admin-secret': hasura_admin_key
    },
    body: JSON.stringify({
      query
    })
  }).then(res => res.json())

  if (data.errors || data.error) {
    console.error('Query failed:', query)
    console.error('GraphQL query failed:', data.error || data.errors)
    throw new Error('GraphQL query failed')
  }

  return data
}

module.exports = {
    //graphQLQuery: graphQLQuery( { hasura_url: process.env.HASURA_URL, hasura_admin_key: process.env.HASURA_ADMIN_KEY })
    graphQLQuery: graphQLQuery( { hasura_url: 'https://production-db.lunie.io/v1/graphql', hasura_admin_key: 'xfz4iBMCtRFdqeQqvJuu8pYJ' })
}