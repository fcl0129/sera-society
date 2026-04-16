/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({
  siteName,
  siteUrl,
  confirmationUrl,
}: InviteEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>You've been personally invited to {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={brand}>SERA SOCIETY</Text>
          <Hr style={divider} />
        </Section>
        <Heading style={h1}>You're Invited</Heading>
        <Text style={text}>
          Someone in the Sera community has extended a personal invitation for you to join — a curated space for those who elevate the art of gathering.
        </Text>
        <Section style={buttonSection}>
          <Button style={button} href={confirmationUrl}>
            Accept Invitation
          </Button>
        </Section>
        <Hr style={dividerLight} />
        <Text style={footer}>
          If you weren't expecting this, no action is needed.
        </Text>
        <Text style={footerBrand}>
          <Link href={siteUrl} style={footerLink}>serasociety.com</Link>
        </Text>
      </Container>
    </Body>
  </Html>
)

export default InviteEmail

const main = {
  backgroundColor: '#f7f4ef',
  fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
}
const container = {
  backgroundColor: '#ffffff',
  padding: '56px 40px 48px',
  maxWidth: '480px',
  margin: '40px auto',
  borderRadius: '2px',
  border: '1px solid #e8e4dd',
}
const header = { textAlign: 'center' as const, marginBottom: '8px' }
const brand = {
  fontSize: '11px',
  fontWeight: '600' as const,
  letterSpacing: '0.22em',
  color: '#132a45',
  margin: '0 0 16px',
  textAlign: 'center' as const,
}
const divider = {
  borderTop: '1px solid #132a45',
  margin: '0 auto 32px',
  width: '40px',
}
const h1 = {
  fontFamily: "'Cormorant Garamond', 'Georgia', serif",
  fontSize: '32px',
  fontWeight: '400' as const,
  fontStyle: 'italic' as const,
  color: '#132a45',
  margin: '0 0 24px',
  textAlign: 'center' as const,
}
const text = {
  fontSize: '14px',
  color: '#5a5549',
  lineHeight: '1.7',
  margin: '0 0 16px',
  textAlign: 'center' as const,
}
const buttonSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
}
const button = {
  backgroundColor: '#132a45',
  color: '#f7f4ef',
  fontSize: '12px',
  fontWeight: '500' as const,
  letterSpacing: '0.14em',
  textTransform: 'uppercase' as const,
  borderRadius: '0px',
  padding: '16px 40px',
  textDecoration: 'none',
}
const dividerLight = {
  borderTop: '1px solid #e8e4dd',
  margin: '32px 0 24px',
}
const footer = {
  fontSize: '12px',
  color: '#a09a90',
  margin: '0 0 8px',
  textAlign: 'center' as const,
  lineHeight: '1.6',
}
const footerLink = { color: '#a09a90', textDecoration: 'underline' }
const footerBrand = {
  fontSize: '11px',
  color: '#a09a90',
  letterSpacing: '0.08em',
  margin: '0',
  textAlign: 'center' as const,
}
