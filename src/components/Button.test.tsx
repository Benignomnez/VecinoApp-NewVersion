import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import React from "react";

// A simple Button component for testing
const Button = ({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) => {
  return (
    <button onClick={onClick} className="mui-button">
      {children}
    </button>
  );
};

describe("Button Component", () => {
  test("renders the button with correct text", () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText("Click Me")).toBeInTheDocument();
  });

  test("has the correct class", () => {
    render(<Button>Click Me</Button>);
    const button = screen.getByText("Click Me");
    expect(button).toHaveClass("mui-button");
  });
});
