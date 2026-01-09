import React from 'react';
import { Container } from '@mui/material';

interface DefaultLayoutProps {
  children: React.ReactNode;
}

const DefaultLayout: React.FC<DefaultLayoutProps> = ({ children }) => {
  return (
    <Container maxWidth="lg">
      <div style={{ marginTop: '32px', marginBottom: '32px' }}>
        {children}
      </div>
    </Container>
  );
};

export default DefaultLayout; 