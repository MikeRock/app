import React from 'react'
import styled from 'react-emotion'

const PricingContainer = styled('div')`
  ul {
    padding-left: 2em;
  }
`

function Pricing() {
  return (
    <PricingContainer>
      <h1>Pricing</h1>
      <h2>The event organiser pays $1 per 1 turn up</h2>
      <p>It’s very simple!</p>

      <p>
        For example, If you have a capacity of 80 people, 70 people RSVP and 50
        people turn up on time, the fee will be $50.
      </p>

      <p>
        Plus VAT depending on the business location your organisation
        operations. We are incorporated in UK and business entities in some
        country may have tax exemption.
      </p>

      <h2>Not convinced yet?</h2>
      <p>
        We will send an invoice after the end of each event so that you only pay
        when you are happy with our service. You can either do a bank transfer
        or send us in DAI. In future we will incorporate the payment mechanism
        into our smart contract.
      </p>

      <h2>Too expensive?</h2>
      <p>
        For recurring events, we will offer a quarterly payment of $150
        ($50/month) for normal events but $45 ($15/month) for events organised
        by non profits, individuals, and students. If you decide to choose the
        quarterly payment model, we ask you to pay upfront. In future we will
        incorporate the recurring payment mechanism into our smart contract.
      </p>

      <h2>Why not charge against the fraction of commitments from no shows?</h2>
      <p>
        I understand where you are coming from. Charging from no shows helps
        event organisers not paying fees. However, our goal is to increase your
        event participation rate and we should not be receiving fee in
        proportion to NOT achieving it.
      </p>
    </PricingContainer>
  )
}

export default Pricing
