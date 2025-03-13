import React from "react";
import { Box, Typography } from "@mui/material";
import { keyframes } from "@mui/system";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import Link from "next/link";

// Define animations
const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

const rotate = keyframes`
  0% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(10deg);
  }
  75% {
    transform: rotate(-10deg);
  }
  100% {
    transform: rotate(0deg);
  }
`;

interface LogoProps {
  variant?: "default" | "small" | "large";
  color?: string;
  showIcon?: boolean;
  animated?: boolean;
}

const Logo: React.FC<LogoProps> = ({
  variant = "default",
  color = "white",
  showIcon = true,
  animated = true,
}) => {
  // Size mapping
  const sizes = {
    small: {
      fontSize: { xs: "1.2rem", md: "1.4rem" },
      iconSize: "1.4rem",
    },
    default: {
      fontSize: { xs: "1.5rem", md: "1.8rem" },
      iconSize: "1.8rem",
    },
    large: {
      fontSize: { xs: "2rem", md: "2.5rem" },
      iconSize: "2.5rem",
    },
  };

  const currentSize = sizes[variant];

  return (
    <Box
      component={Link}
      href="/"
      sx={{
        display: "flex",
        alignItems: "center",
        textDecoration: "none",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: animated ? "scale(1.05)" : "none",
        },
      }}
    >
      {showIcon && (
        <RestaurantIcon
          sx={{
            mr: 1,
            fontSize: currentSize.iconSize,
            color: color,
            filter: "drop-shadow(0px 2px 3px rgba(0,0,0,0.2))",
            animation: animated ? `${rotate} 5s ease-in-out infinite` : "none",
          }}
        />
      )}
      <Typography
        variant="h5"
        component="span"
        sx={{
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 700,
          fontSize: currentSize.fontSize,
          letterSpacing: "0.5px",
          color: color,
          textDecoration: "none",
          textShadow: "1px 1px 2px rgba(0,0,0,0.2)",
          position: "relative",
          "&::after": {
            content: '""',
            position: "absolute",
            width: "100%",
            height: "2px",
            bottom: "-2px",
            left: 0,
            background: `linear-gradient(90deg, transparent 0%, ${color} 50%, transparent 100%)`,
            opacity: 0.7,
          },
          animation: animated ? `${pulse} 3s infinite ease-in-out` : "none",
        }}
      >
        VecinoApp
      </Typography>
    </Box>
  );
};

export default Logo;
