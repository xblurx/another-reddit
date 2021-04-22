import React, { ReactNode } from "react";
import { Box } from "@chakra-ui/react";

interface WrapperProps {
  variant?: "regular" | "small";
  children: ReactNode;
}

export const Wrapper = ({
  variant = "regular",
  children,
  ...rest
}: WrapperProps) => {
  return (
    <Box
      mx="auto"
      maxW={variant === "regular" ? "700px" : "400px"}
      w="100%"
      {...rest}
      style={{ marginTop: "30vh" }}
    >
      {children}
    </Box>
  );
};
