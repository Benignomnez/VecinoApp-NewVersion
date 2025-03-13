import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import React from "react";
import Button from "@mui/material/Button";

// A custom button component that uses Material UI
const CustomMuiButton = ({
  children,
  onClick,
  variant = "contained",
  color = "primary",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "text" | "outlined" | "contained";
  color?: "primary" | "secondary" | "success" | "error" | "info" | "warning";
}) => {
  return (
    <Button
      onClick={onClick}
      variant={variant}
      color={color}
      data-testid="custom-mui-button"
    >
      {children}
    </Button>
  );
};

describe("CustomMuiButton Component", () => {
  test("renders the button with correct text", () => {
    render(<CustomMuiButton>Custom Button</CustomMuiButton>);
    expect(screen.getByText("Custom Button")).toBeInTheDocument();
  });

  test("calls onClick handler when clicked", () => {
    const handleClick = jest.fn();
    render(<CustomMuiButton onClick={handleClick}>Click Me</CustomMuiButton>);

    const button = screen.getByTestId("custom-mui-button");
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test("applies the correct variant and color", () => {
    render(
      <CustomMuiButton variant="outlined" color="secondary">
        Styled Button
      </CustomMuiButton>
    );

    const button = screen.getByTestId("custom-mui-button");
    expect(button).toHaveClass("MuiButton-outlined");
    expect(button).toHaveClass("MuiButton-outlinedSecondary");
  });
});
