import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import React from "react";
import Button from "@mui/material/Button";

describe("Material UI Button Component", () => {
  test("renders the button with correct text", () => {
    render(<Button variant="contained">Hello World</Button>);
    expect(screen.getByText("Hello World")).toBeInTheDocument();
  });

  test("has the correct MUI class", () => {
    render(<Button variant="contained">Hello World</Button>);
    const button = screen.getByText("Hello World");
    expect(button).toHaveClass("MuiButton-root");
  });
});
