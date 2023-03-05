import React, { useState } from "react";
import {
  Collapse,
  Container,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import { useUser } from "@auth0/nextjs-auth0/client";
import AnchorLink from "./AnchorLink";

export default function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isLoading } = useUser();
  const toggle = () => setIsOpen(!isOpen);

  return (
    <div>
      <Navbar className='nav-color' light expand="md">
        <Container>
          <NavbarToggler onClick={toggle} />
          <Collapse isOpen={isOpen} navbar>
            <NavbarBrand href="/">
              <img
                alt="logo"
                src="/logo.ico"
                style={{
                  height: 40,
                  width: 40,
                }}
              />{" "}
              APMS
            </NavbarBrand>

            <Nav className="mr-auto" navbar>
              <NavItem>
                {user && (
                  <AnchorLink href="/main" className="nav-item">Home</AnchorLink>
                )}
              </NavItem>
            </Nav>

            <Nav className="mr-auto" navbar>
              <NavItem>
                {user && (
                  <AnchorLink href="/organise-conference" className="nav-link">
                    Organise Conferences
                  </AnchorLink>
                )}
              </NavItem>
            </Nav>
            
            <Nav className="mr-auto" navbar>
              <NavItem>
                {user && (
                  <AnchorLink href="/my-task" className="nav-link">
                    MyTasks
                  </AnchorLink>
                )}
              </NavItem>
            </Nav>
            
            <Nav className="mr-auto" navbar>
              <NavItem>
                {user && (
                  <AnchorLink href="/my-history" className="nav-link">
                    MyHistory
                  </AnchorLink>
                )}
              </NavItem>
            </Nav>

            <Nav className="d-none d-md-block" navbar>
              {!isLoading && !user && (
                <NavItem id="qsLoginBtn">
                  <AnchorLink
                    href="/api/auth/login"
                    className="btn btn-primary btn-margin"
                    tabIndex={0}
                  >
                    Log in
                  </AnchorLink>
                </NavItem>
              )}
              {user && (
                <UncontrolledDropdown nav inNavbar>
                  <DropdownToggle nav caret id="profileDropDown">
                    <img
                      src={user.picture}
                      alt="Profile"
                      className="nav-user-profile rounded-circle"
                      width="50"
                      height="50"
                      decode="async"
                    />
                  </DropdownToggle>
                  <DropdownMenu>
                    <DropdownItem header>{user.name}</DropdownItem>
                    {/* <DropdownItem className="dropdown-profile" tag="span">
                      <AnchorLink href="/profile" icon="user">
                        Profile
                      </AnchorLink>
                    </DropdownItem> */}
                    <DropdownItem id="qsLogoutBtn">
                      <AnchorLink href="/api/auth/logout" icon="power-off">
                        Log out
                      </AnchorLink>
                    </DropdownItem>
                  </DropdownMenu>
                </UncontrolledDropdown>
              )}
            </Nav>
            {!isLoading && !user && (
              <Nav className="d-md-none" navbar>
                <AnchorLink
                  href="/api/auth/login"
                  className="btn btn-primary btn-block"
                  tabIndex={0}
                >
                  Log in
                </AnchorLink>
              </Nav>
            )}
            {user && (
              <Nav
                id="nav-mobile"
                className="d-md-none justify-content-between"
                navbar
              >
                <NavItem>
                  <span className="user-info">
                    <img
                      src={user.picture}
                      alt="Profile"
                      className="nav-user-profile d-inline-block rounded-circle mr-3"
                      width="50"
                      height="50"
                      decode="async"
                    />
                    <h6 className="d-inline-block">{user.name}</h6>
                  </span>
                </NavItem>
                {/* <NavItem>
                  <AnchorLink href="/profile" icon="user">
                    Profile
                  </AnchorLink>
                </NavItem> */}
                <NavItem id="qsLogoutBtn">
                  <AnchorLink
                    href="/api/auth/logout"
                    className="btn btn-link p-0"
                    icon="power-off"
                  >
                    Log out
                  </AnchorLink>
                </NavItem>
              </Nav>
            )}
          </Collapse>
        </Container>
      </Navbar>
    </div>
  );
}