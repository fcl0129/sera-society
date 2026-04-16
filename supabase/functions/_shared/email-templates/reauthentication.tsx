/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your verification code for Sera Society</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={brand}>SERA SOCIETY</Text>
          <Hr style={divider} />
        </Section>
        <Heading style={h1}>Verification Code</Heading>
        <Text style={text}>
          Enter the code below to confirm your identity:
        </Text>
        <Section style={codeSection}>
          <Text style={codeStyle}>{token}</Text>
        </Section>
        <Hr style={dividerLight} />
        <Text style={footer}>
          This code expires shortly. If you didn't request it, no action is needed.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

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
const codeSection = {
  textAlign: 'center' as const,
  margin: '24px 0 32px',
  padding: '20px',
  backgroundColor: '#f7f4ef',
  border: '1px solid #e8e4dd',
}
const codeStyle = {
  fontFamily: "'Cormorant Garamond', Georgia, serif",
  fontSize: '32px',
  fontWeight: '600' as const,
  color: '#132a45',
  margin: '0',
  letterSpacing: '0.2em',
}
const dividerLight = {
  borderTop: '1px solid #e8e4dd',
  margin: '0 0 24px',
}
const footer = {
  fontSize: '12px',
  color: '#a09a90',
  margin: '0',
  textAlign: 'center' as const,
  lineHeight: '1.6',
}
