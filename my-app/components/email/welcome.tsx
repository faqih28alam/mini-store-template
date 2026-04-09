// src/components/email/welcome.tsx

import { Html, Body, Container, Text, Button } from '@react-email/components'

export default function Welcome({ name }: { name: string }) {
    return (
        <Html>
            <Body style={{ backgroundColor: '#f5f5dc', padding: '40px' }}>
                <Container style={{ maxWidth: '600px' }}>
                    <Text style={{ fontSize: '28px', fontWeight: 'bold' }}>
                        Welcome to OrganicStore! 🍁
                    </Text>

                    <Text style={{ fontSize: '16px', lineHeight: '24px' }}>
                        Hi {name},
                    </Text>

                    <Text>
                        Thank you for joining us! We're excited to help you discover premium beauty and wellness products.
                    </Text>

                    <Button
                        href="https://organicstore.dev64.web.id/products"
                        style={{
                            backgroundColor: '#8daa91',
                            color: '#fff',
                            padding: '12px 24px',
                            borderRadius: '6px',
                        }}
                    >
                        Start Shopping
                    </Button>
                </Container>
            </Body>
        </Html>
    )
}