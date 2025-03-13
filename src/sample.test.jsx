import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

function SampleComponent() {
    return <div>Hello, Vitest!</div>;
}

test('renders the correct content', () => {
    render(<SampleComponent />);
    expect(screen.getByText('Hello, Vitest!')).toBeInTheDocument();
}); 