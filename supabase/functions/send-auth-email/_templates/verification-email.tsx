import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Img,
  Section,
  Hr,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface VerificationEmailProps {
  supabase_url: string
  email_action_type: string
  redirect_to: string
  token_hash: string
  token: string
  user_email: string
}

export const VerificationEmail = ({
  token,
  supabase_url,
  email_action_type,
  redirect_to,
  token_hash,
  user_email,
}: VerificationEmailProps) => (
  <Html>
    <Head />
    <Preview>Welcome to MTKCx - Confirm your email address</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* MTKCx Logo/Header */}
        <Section style={logoSection}>
          <Heading style={h1}>MTKCx</Heading>
          <Text style={tagline}>Professional Car Detailing & Koch-Chemie Products</Text>
        </Section>

        <Hr style={hr} />

        {/* Welcome Message */}
        <Section style={section}>
          <Heading style={h2}>Welcome to MTKCx!</Heading>
          <Text style={text}>
            Thank you for joining the MTKCx community. We're excited to have you as part of our professional car detailing family.
          </Text>
          
          <Text style={text}>
            To complete your registration and start exploring our premium Koch-Chemie products and professional training courses, please confirm your email address by clicking the button below:
          </Text>
        </Section>

        {/* Verification Button */}
        <Section style={buttonSection}>
          <Link
            href={`${supabase_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`}
            style={button}
          >
            Confirm Email Address
          </Link>
        </Section>

        {/* Alternative Link */}
        <Section style={section}>
          <Text style={smallText}>
            If the button doesn't work, you can copy and paste this link into your browser:
          </Text>
          <Link
            href={`${supabase_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`}
            style={link}
          >
            {`${supabase_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`}
          </Link>
        </Section>

        {/* What's Next */}
        <Section style={section}>
          <Heading style={h3}>What's Next?</Heading>
          <Text style={text}>
            Once you've confirmed your email, you'll be able to:
          </Text>
          <Text style={bulletPoint}>• Browse our complete Koch-Chemie product catalog</Text>
          <Text style={bulletPoint}>• Enroll in professional detailing courses</Text>
          <Text style={bulletPoint}>• Access exclusive member pricing</Text>
          <Text style={bulletPoint}>• Track your orders and course progress</Text>
        </Section>

        <Hr style={hr} />

        {/* Contact Information */}
        <Section style={section}>
          <Text style={contactHeader}>Need Help?</Text>
          <Text style={smallText}>
            📞 Phone: 052-5701073<br />
            📧 Email: info@mtkcx.com<br />
            📍 Location: Atarot, Jerusalem
          </Text>
        </Section>

        {/* Footer */}
        <Section style={footer}>
          <Text style={footerText}>
            This email was sent to {user_email}. If you didn't create an account with MTKCx, you can safely ignore this email.
          </Text>
          <Text style={footerText}>
            © 2024 MTKCx - Your Trusted Partner for Professional Car Detailing
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default VerificationEmail

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
}

const logoSection = {
  padding: '32px 40px',
  textAlign: 'center' as const,
  backgroundColor: '#1a365d',
  color: '#ffffff',
}

const h1 = {
  color: '#ffffff',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0 0 8px',
  padding: '0',
  lineHeight: '1.2',
}

const tagline = {
  color: '#e2e8f0',
  fontSize: '16px',
  margin: '0',
  padding: '0',
  fontWeight: '400',
}

const section = {
  padding: '24px 40px',
}

const buttonSection = {
  padding: '32px 40px',
  textAlign: 'center' as const,
}

const h2 = {
  color: '#1a365d',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 16px',
  padding: '0',
}

const h3 = {
  color: '#1a365d',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0 0 12px',
  padding: '0',
}

const text = {
  color: '#4a5568',
  fontSize: '16px',
  lineHeight: '1.5',
  margin: '0 0 16px',
}

const smallText = {
  color: '#718096',
  fontSize: '14px',
  lineHeight: '1.4',
  margin: '0 0 12px',
}

const bulletPoint = {
  color: '#4a5568',
  fontSize: '16px',
  lineHeight: '1.5',
  margin: '0 0 8px',
  paddingLeft: '16px',
}

const link = {
  color: '#3182ce',
  fontSize: '14px',
  textDecoration: 'underline',
  wordBreak: 'break-all' as const,
}

const button = {
  backgroundColor: '#3182ce',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '16px 32px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.2s ease',
}

const hr = {
  borderColor: '#e2e8f0',
  margin: '0',
}

const contactHeader = {
  color: '#1a365d',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 12px',
}

const footer = {
  padding: '24px 40px',
  backgroundColor: '#f7fafc',
}

const footerText = {
  color: '#a0aec0',
  fontSize: '12px',
  lineHeight: '1.4',
  margin: '0 0 8px',
  textAlign: 'center' as const,
}