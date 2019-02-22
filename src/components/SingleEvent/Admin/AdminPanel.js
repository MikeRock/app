import React from 'react'
import styled from 'react-emotion'

import Label from '../../Forms/Label'
import Clear from './Clear'
import Finalize from './Finalize'
import SetLimit from './SetLimit'
import AddAdmin from './AddAdmin'
import FileUpload from './FileUpload'

const Section = styled('section')`
  margin-bottom: 40px;
`

const AdminIntro = styled('p')`
  background-color: #ccc;
  padding: 1em;
  border-radius: 5px;
  color: #000;
`

export default function AdminPanel({ party }) {
  return (
    <>
      <AdminIntro>
        These are the administrative functions for this event. Please be
        careful!
      </AdminIntro>
      <FileUpload />

      <Section>
        <Label>Finalize</Label>
        <p>
          Finalize ends the event and allows participants to withdraw. No one
          will be able to be mark attended after you finalize!
        </p>
        <Finalize party={party} />
      </Section>
      <Section>
        <Label>Clear</Label>
        <p>
          Clear will return all remaining funds to the host. Participants will
          no longer be able to withdraw.
        </p>
        <Clear />
      </Section>
      <Section>
        <Label>Set Limit</Label>
        <p>
          Set Limit will change the amount of participants that are allowed to
          register for your event.
        </p>
        <SetLimit />
      </Section>
      <Label>
        Add Admins (click + to add multiple admins in 1 transactions)
      </Label>
      <p>
        Adding an admin allows that user to mark people as attended. You cannot
        remove an admin once added{' '}
      </p>
      <AddAdmin address={party.address} />
    </>
  )
}