import React from "react";
import AppNavbar from "./AppNavbar";

// Wrapper qui isole complètement la navbar
const NavbarWrapper = React.memo(() => {
    return <AppNavbar />;
});

NavbarWrapper.displayName = "NavbarWrapper";

export default NavbarWrapper;
