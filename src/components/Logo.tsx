import React from "react";
import { Box, Typography } from "@mui/material";
import { keyframes } from "@mui/system";
import Link from "next/link";
import Image from "next/image";

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
    transform: rotate(2deg);
  }
  75% {
    transform: rotate(-2deg);
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
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({
  variant = "default",
  color = "white",
  showIcon = true,
  animated = true,
  showText = true,
}) => {
  // Size mapping
  const sizes = {
    small: {
      fontSize: { xs: "1.2rem", md: "1.4rem" },
      iconSize: 36,
    },
    default: {
      fontSize: { xs: "1.5rem", md: "1.8rem" },
      iconSize: 48,
    },
    large: {
      fontSize: { xs: "2rem", md: "2.5rem" },
      iconSize: 64,
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
        <Box
          sx={{
            mr: 1.5,
            animation: animated ? `${rotate} 6s ease-in-out infinite` : "none",
            filter: "drop-shadow(0px 2px 2px rgba(0,0,0,0.15))",
            height: currentSize.iconSize,
            width: currentSize.iconSize,
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image
            src="/logo.png"
            alt="VecinoApp Logo"
            width={currentSize.iconSize}
            height={currentSize.iconSize}
            quality={90}
            style={{
              objectFit: "contain",
              maxWidth: "100%",
              maxHeight: "100%",
            }}
            priority
          />
        </Box>
      )}

      {showText && (
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
            marginLeft: "0.5rem",
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
      )}
    </Box>
  );
};

export default Logo;
