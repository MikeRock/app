const jwt = require('jsonwebtoken')
const Web3 = require('web3')
const gqlr = require('graphql-request')
const { GraphQLClient } = gqlr
const EthVal = require('ethval')
const {
  Deployer: { abi: DeployerABI },
  Conference: { abi: ConferenceABI }
} = require('@wearekickback/contracts')
const { DEPLOYER_CONTRACT_ADDRESS } = require('../src/config')
const { parseLog } = require('ethereum-event-logs')
const { events } = require('@wearekickback/contracts')

const PendingParty = `
  mutation createPendingParty($meta: PartyMetaInput!, $password: String) {
    id: createPendingParty(meta: $meta, password: $password)
  }
`
const UpdateUserProfile = `
  mutation updateUserProfile($profile: UserProfileInput!) {
    profile: updateUserProfile(profile: $profile)  {
      address
      realName
      lastLogin
      created
      social {
        type
        value
      }
      email {
        verified
        pending
      }
      legal {
        type
        accepted
      }
    }
  }
`

const LoginChallenge = `
  mutation createLoginChallenge($address: String!) {
    createLoginChallenge(address: $address) {
      str
    }
  }
`

const UserProfileQuery = `
  query getUserProfile($address: String!) {
    profile: userProfile(address: $address) {
      address
      username
    }
  }
`

const extractNewPartyAddressFromTx = tx => {
  // coerce events into logs if available
  if (tx.events) {
    tx.logs = Object.values(tx.events).map(a => {
      a.topics = a.raw.topics
      a.data = a.raw.data
      return a
    })
  }
  const [event] = parseLog(tx.logs || [], [events.NewParty])
  return event ? event.args.deployedAddress : null
}

class DummyParty {
  constructor(
    web3,
    owner,
    {
      name = 'Awesome Party',
      description = 'description',
      date = '25th December',
      location = 'Some location',
      image = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSUk7ni2PYcBZ_qXOLriROqyiiZRGiCMfKnkdx_I1gTOVf3FPGQ'
    },
    endpoint = 'http://localhost:3001/graphql'
  ) {
    this.endpoint = endpoint
    this.web3 = web3
    this.client = new GraphQLClient(endpoint, { headers: {} })
    this.owner = owner
    this.meta = {
      name,
      description,
      date,
      location,
      image
    }
  }

  async deploy() {
    await this.deployNewParty()
    return this
  }

  async updateUserProfile() {
    const username = `adm${new Date().getTime()}`
    const { profile } = await this.client.request(UpdateUserProfile, {
      profile: {
        email: 'admin@example.com',
        username: username,
        realName: 'Admin',
        social: [{ type: 'twitter', value: 'admin' }],
        legal: [
          { type: 'TERMS_AND_CONDITIONS', accepted: '1547813987275' },
          { type: 'PRIVACY_POLICY', accepted: '1547813987275' }
        ]
      }
    })
    return profile
  }

  async userProfileQuery(address) {
    const { profile } = await this.client.request(UserProfileQuery, { address })
    return profile
  }

  async createPendingParty() {
    const { id } = await this.client.request(PendingParty, {
      meta: this.meta,
      password: ''
    })

    return id
  }

  async getToken(account) {
    const requestChallenge = address => {
      return this.client.request(LoginChallenge, { address })
    }
    const { createLoginChallenge } = await requestChallenge(account)

    const signature = await this.web3.eth.sign(
      createLoginChallenge.str,
      account
    )

    const TOKEN_SECRET = 'kickback'
    const TOKEN_ALGORITHM = 'HS256'

    const token = jwt.sign({ address: account, sig: signature }, TOKEN_SECRET, {
      algorithm: TOKEN_ALGORITHM
    })

    return token
  }

  async deployNewParty() {
    const token = await this.getToken(this.owner)
    this.client = new GraphQLClient(this.endpoint, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    const id = await this.createPendingParty()
    const admin = await this.userProfileQuery(this.owner)

    if (!admin.username) {
      console.log('Creating admin profile')
      const profile = await this.updateUserProfile()
    } else {
      console.log(`Admin account ${admin.username} already exists`)
    }

    const deployer = new this.web3.eth.Contract(
      DeployerABI,
      DEPLOYER_CONTRACT_ADDRESS
    )

    const args = [
      id,
      new EthVal(0.02, 'eth').toWei().toString(16),
      new EthVal(100).toString(16),
      new EthVal(1).toString(16)
    ]

    const tx = await deployer.methods.deploy(...args).send({
      gas: 4000000,
      from: this.owner
    })

    const newPartyAddress = extractNewPartyAddressFromTx(tx)

    console.log(`Deployed new party at address: ${newPartyAddress}`)
    this.party = new this.web3.eth.Contract(ConferenceABI, newPartyAddress)
    this.deposit = await this.party.methods.deposit().call()

    return this.party
  }

  async _rsvp(account) {
    const deposit = this.deposit
    const tx = await this.party.methods.register().send({
      from: account,
      gas: 120000,
      value: deposit
    })
    console.log(
      `New rsvp ${account} at party '${this.meta.name}'at address: ${
        this.party._address
      }`
    )

    return Promise.resolve(tx)
  }

  async rsvp(...accounts) {
    return Promise.all(accounts.map(account => this._rsvp(account)))
  }
}

async function seed() {
  const ethereumEndpoint = 'http://localhost:8545'
  const provider = new Web3.providers.HttpProvider(ethereumEndpoint)
  const web3 = new Web3(provider)
  const accounts = await web3.eth.getAccounts()

  const party1 = await new DummyParty(web3, accounts[0], {
    name: 'Super duper'
  }).deploy()

  await party1.rsvp(accounts[1], accounts[2])

  const party2 = await new DummyParty(web3, accounts[0], {
    name: 'Super duper 2'
  }).deploy()

  await party2.rsvp(accounts[1], accounts[2])
  return
}

seed().then(() => {
  console.log('Seeding parties complete!')
  console.log('Ready to run cypress tests')
})
